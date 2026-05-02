#!/usr/bin/env node

/**
 * Upload all files in a directory to FTP
 * and automatically create matching remote folders.
 *
 * Example:
 *   node upload.js .\videos\20260422\safari
 *
 * Remote result:
 *   /20260422/safari/*
 *
 * Install:
 *   npm install basic-ftp
 * 
 $env:FTP_REMOTE_DIR="/public_html/aivideos"
 * 
 */

const fs = require("fs");
const path = require("path");
const ftp = require("basic-ftp");

const directory = require('./directory.js');

const localDir = directory.getPath();
console.log(`📂 Input directory: ${localDir}`);

if (!localDir) {
    console.error("Please provide a directory path.");
    process.exit(1);
}

if (!process.env.FTP_HOST) {
    console.error("FTP_HOST is not set");
    process.exit(1);
}

if (!process.env.FTP_USER) {
    console.error("FTP_USER is not set");
    process.exit(1);
}

if (!process.env.FTP_PASSWORD) {
    console.error("FTP_PASSWORD is not set");
    process.exit(1);
}

const client = new ftp.Client();
client.ftp.verbose = true;

async function uploadDirectory() {
    try {
        await client.access({
            host: process.env.FTP_HOST || "147.93.88.149",
            user: process.env.FTP_USER || "u888049249",
            password: process.env.FTP_PASSWORD,
            port: Number(process.env.FTP_PORT || 21),
            secure: process.env.FTP_SECURE === "true"
        });

        // Normalize path
        const normalized = path.normalize(localDir);

        // Extract last 2 folder names
        // e.g. videos/20260422/safari -> 20260422/safari
        const parts = normalized.split(path.sep);

        if (parts.length < 2) {
            throw new Error("Directory path must contain at least 2 folders.");
        }

        const remoteDir = "aivideos/" + parts.slice(-2).join("/");

        console.log(`Creating remote directory: ${remoteDir}`);

        await client.ensureDir(remoteDir);

        const entries = fs.readdirSync(localDir, { withFileTypes: true });

        for (const entry of entries) {
            if (!entry.isFile()) {
                continue;
            }

            const localFile = path.join(localDir, entry.name);

            console.log(`Uploading ${entry.name}`);

            await client.uploadFrom(localFile, entry.name);

            console.log(`Uploaded: ${entry.name}`);
        }

        console.log("All uploads complete.");
    } catch (err) {
        console.error("FTP upload failed:", err.message);
    } finally {
        client.close();
    }
}

uploadDirectory();