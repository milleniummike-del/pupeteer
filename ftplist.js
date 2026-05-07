#!/usr/bin/env node

/**
 * List folders and files from an FTP directory.
 *
 * Example:
 *   node listfiles.js
 *   node listfiles.js 20260422
 *   node listfiles.js 20260422/safari
 *
 * Remote source:
 *   /aivideos/*
 *
 * Install:
 *   npm install basic-ftp
 */

const ftp = require("basic-ftp");

const remotePath = process.argv[2] || "";

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

async function listFiles() {
    try {
        await client.access({
            host: process.env.FTP_HOST || "147.93.88.149",
            user: process.env.FTP_USER || "u888049249",
            password: process.env.FTP_PASSWORD,
            port: Number(process.env.FTP_PORT || 21),
            secure: process.env.FTP_SECURE === "true"
        });

        const remoteDir = remotePath
            ? `aivideos/${remotePath}`
            : "aivideos";

        console.log(`📂 Listing: ${remoteDir}`);

        const entries = await client.list(remoteDir);

        if (entries.length === 0) {
            console.log("Directory is empty.");
            return;
        }

        console.log("\nContents:\n");

        for (const entry of entries) {
            if (entry.isDirectory) {
                console.log(`📁 [DIR ] ${entry.name}`);
            } else {
                const sizeKB = (entry.size / 1024).toFixed(2);
                console.log(`📄 [FILE] ${entry.name} (${sizeKB} KB)`);
            }
        }

        console.log("\nListing complete.");
    } catch (err) {
        console.error("FTP list failed:", err.message);
    } finally {
        client.close();
    }
}

listFiles();