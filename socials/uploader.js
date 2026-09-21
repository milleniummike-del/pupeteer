// unified-uploader.js
require("dotenv").config();
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const { google } = require("googleapis");

/**
 * Simple retry wrapper
 */
async function withRetry(fn, label, retries = 3, delayMs = 2000) {
    let lastErr;
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (err) {
            lastErr = err;
            console.warn(`[${label}] attempt ${i + 1} failed:`, err.response?.data || err.message);
            if (i < retries - 1) {
                await new Promise(r => setTimeout(r, delayMs));
            }
        }
    }
    throw new Error(`[${label}] failed after ${retries} attempts: ${lastErr?.message}`);
}

/**
 * Facebook Page video upload
 */
async function uploadFacebook(videoPath, title) {
    const PAGE_ID = process.env.FB_PAGE_ID;
    const TOKEN   = process.env.FB_TOKEN;

    if (!PAGE_ID || !TOKEN) throw new Error("Missing FB_PAGE_ID or FB_TOKEN");

    const form = new FormData();
    form.append("file", fs.createReadStream(videoPath));
    form.append("title", title);

    return withRetry(async () => {
        const res = await axios.post(
            `https://graph.facebook.com/${PAGE_ID}/videos`,
            form,
            { headers: form.getHeaders({ Authorization: `Bearer ${TOKEN}` }) }
        );
        return res.data;
    }, "facebook");
}

/**
 * TikTok Open API upload (init -> PUT -> complete)
 */
async function uploadTikTok(videoPath, title) {
    const TOKEN = process.env.TIKTOK_TOKEN;
    if (!TOKEN) throw new Error("Missing TIKTOK_TOKEN");

    const videoBuf = fs.readFileSync(videoPath);

    return withRetry(async () => {
        // Init
        const init = await axios.post(
            "https://open.tiktokapis.com/v2/post/publish/video/init/",
            { post_info: { title } },
            { headers: { Authorization: `Bearer ${TOKEN}` } }
        );

        const { upload_url, publish_id } = init.data.data;

        // Upload binary
        await axios.put(upload_url, videoBuf, {
            headers: { "Content-Type": "video/mp4" }
        });

        // Complete
        const complete = await axios.post(
            "https://open.tiktokapis.com/v2/post/publish/video/complete/",
            { publish_id },
            { headers: { Authorization: `Bearer ${TOKEN}` } }
        );

        return complete.data;
    }, "tiktok");
}

/**
 * YouTube Data API v3 upload
 */
async function uploadYouTube(videoPath, title, description) {
    const YT_TOKEN = process.env.YT_TOKEN;
    if (!YT_TOKEN) throw new Error("Missing YT_TOKEN");

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: YT_TOKEN });

    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    return withRetry(async () => {
        const res = await youtube.videos.insert({
            part: "snippet,status",
            requestBody: {
                snippet: { title, description },
                status: { privacyStatus: "public" }
            },
            media: { body: fs.createReadStream(videoPath) }
        });
        return res.data;
    }, "youtube");
}

/**
 * X (Twitter) video upload + tweet
 */
async function uploadX(videoPath, text) {
    const TOKEN = process.env.X_BEARER;
    if (!TOKEN) throw new Error("Missing X_BEARER");

    const videoBuf = fs.readFileSync(videoPath);

    return withRetry(async () => {
        // INIT
        const init = await axios.post(
            "https://upload.twitter.com/1.1/media/upload.json",
            `command=INIT&total_bytes=${videoBuf.length}&media_type=video/mp4`,
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        );

        const media_id = init.data.media_id_string;

        // APPEND
        await axios.post(
            "https://upload.twitter.com/1.1/media/upload.json",
            videoBuf,
            {
                params: { command: "APPEND", media_id, segment_index: 0 },
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    "Content-Type": "application/octet-stream"
                }
            }
        );

        // FINALIZE
        await axios.post(
            "https://upload.twitter.com/1.1/media/upload.json",
            `command=FINALIZE&media_id=${media_id}`,
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        );

        // Tweet
        const tweet = await axios.post(
            "https://api.twitter.com/2/tweets",
            { text, media: { media_ids: [media_id] } },
            { headers: { Authorization: `Bearer ${TOKEN}` } }
        );

        return tweet.data;
    }, "x");
}

/**
 * LinkedIn video upload + UGC post
 */
async function uploadLinkedIn(videoPath, title) {
    const TOKEN = process.env.LI_TOKEN;
    const URN   = process.env.LI_URN; // e.g. "urn:li:person:xxxx"
    if (!TOKEN || !URN) throw new Error("Missing LI_TOKEN or LI_URN");

    const videoBuf = fs.readFileSync(videoPath);

    return withRetry(async () => {
        // Register upload
        const register = await axios.post(
            "https://api.linkedin.com/v2/assets?action=registerUpload",
            {
                registerUploadRequest: {
                    owner: URN,
                    recipes: ["urn:li:digitalmediaRecipe:feedshare-video"],
                    serviceRelationships: [
                        {
                            relationshipType: "OWNER",
                            identifier: "urn:li:userGeneratedContent"
                        }
                    ]
                }
            },
            { headers: { Authorization: `Bearer ${TOKEN}` } }
        );

        const uploadMech = register.data.value.uploadMechanism[
            "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
        ];
        const uploadUrl = uploadMech.uploadUrl;
        const asset     = register.data.value.asset;

        // Upload binary
        await axios.put(uploadUrl, videoBuf, {
            headers: { "Content-Type": "video/mp4" }
        });

        // Create post
        const post = await axios.post(
            "https://api.linkedin.com/v2/ugcPosts",
            {
                author: URN,
                lifecycleState: "PUBLISHED",
                specificContent: {
                    "com.linkedin.ugc.ShareContent": {
                        shareCommentary: { text: title },
                        shareMediaCategory: "VIDEO",
                        media: [{ status: "READY", media: asset }]
                    }
                },
                visibility: {
                    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
                }
            },
            { headers: { Authorization: `Bearer ${TOKEN}` } }
        );

        return post.data;
    }, "linkedin");
}

/**
 * Unified uploader: run all platforms in parallel
 */
async function uploadToAllPlatforms(videoPath, title, description) {
    const tasks = {
       // facebook: () => uploadFacebook(videoPath, title),
        tiktok:   () => uploadTikTok(videoPath, title),
        //youtube:  () => uploadYouTube(videoPath, title, description),
        //x:        () => uploadX(videoPath, title),
       // linkedin: () => uploadLinkedIn(videoPath, title)
    };

    const entries = Object.entries(tasks);

    const results = await Promise.allSettled(
        entries.map(([name, fn]) => fn().then(r => ({ name, result: r })))
    );

    const summary = {};
    for (const r of results) {
        if (r.status === "fulfilled") {
            summary[r.value.name] = { ok: true, data: r.value.result };
        } else {
            // name is not directly available here, so we just store error
            summary[r.reason.label || "unknown"] = {
                ok: false,
                error: r.reason.message || String(r.reason)
            };
        }
    }
    return summary;
}

// CLI usage example
if (require.main === module) {
    (async () => {
        const video = process.argv[2] || "./video.mp4";
        const title = process.argv[3] || "Unified uploader test";
        const description = process.argv[4] || "Uploaded via unified uploader";

        try {
            const res = await uploadToAllPlatforms(video, title, description);
            console.log("Upload summary:", JSON.stringify(res, null, 2));
        } catch (err) {
            console.error("Fatal error:", err.message);
            process.exit(1);
        }
    })();
}

module.exports = {
    uploadFacebook,
    uploadTikTok,
    uploadYouTube,
    uploadX,
    uploadLinkedIn,
    uploadToAllPlatforms
};
