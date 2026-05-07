#!/usr/bin/env node

/**
 * Download all files from an FTP directory
 * and recreate the matching local folders.
 *
 * Example:
 *   node download.js 20260422/safari
 *
 * Remote source:
 *   /aivideos/20260422/safari/*
 *
 * Local result:
 *   ./downloads/20260422/safari/*
 *
 * Install:
 *   npm install basic-ftp
 */

const fs = require("fs");
const path = require("path");
const ftp = require("basic-ftp");

const remotePath = process.argv[2];

if (!remotePath) {
    console.error("Please provide a remote directory path.");
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

async function downloadDirectory() {
    try {
        await client.access({
            host: process.env.FTP_HOST || "147.93.88.149",
            user: process.env.FTP_USER || "u888049249",
            password: process.env.FTP_PASSWORD,
            port: Number(process.env.FTP_PORT || 21),
            secure: process.env.FTP_SECURE === "true"
        });

        const remoteDir = `aivideos/${remotePath}`;
        const localDir = path.join(__dirname, "downloads", remotePath);

        console.log(`📥 Remote directory: ${remoteDir}`);
        console.log(`📂 Local directory: ${localDir}`);

        // Create local directory if it doesn't exist
        fs.mkdirSync(localDir, { recursive: true });

        // Read remote directory contents
        const entries = await client.list(remoteDir);

        for (const entry of entries) {
            // Skip directories
            if (entry.isDirectory) {
                continue;
            }

            const localFile = path.join(localDir, entry.name);
            const remoteFile = `${remoteDir}/${entry.name}`;

            console.log(`Downloading ${entry.name}`);

            await client.downloadTo(localFile, remoteFile);

            console.log(`Downloaded: ${entry.name}`);
        }

        console.log("All downloads complete.");
    } catch (err) {
        console.error("FTP download failed:", err.message);
    } finally {
        client.close();
    }
}

downloadDirectory();