/**
 * Rename all image files in inputimages/ to 1.*, 2.*, 3.*, etc.
 * Supports: .webp, .png, .jpg, .jpeg
 * Also generates index.json automatically.
 */

const fs = require("fs");
const path = require("path");

const INPUT_DIR = path.join(__dirname, "inputimages");
const OUTPUT_INDEX = path.join(INPUT_DIR, "index.json");

const VALID_EXTS = new Set([".webp", ".png", ".jpg", ".jpeg"]);

function run() {
    if (!fs.existsSync(INPUT_DIR)) {
        console.error("❌ inputimages/ folder not found:", INPUT_DIR);
        process.exit(1);
    }

    // Read all files
    let files = fs.readdirSync(INPUT_DIR)
        .filter(f => VALID_EXTS.has(path.extname(f).toLowerCase()));

    if (files.length === 0) {
        console.error("❌ No image files found in inputimages/");
        process.exit(1);
    }

    // Sort alphabetically for predictable renaming
    files.sort((a, b) => a.localeCompare(b));

    console.log("📦 Found image files:");
    files.forEach(f => console.log(" -", f));

    // Rename to 1.*, 2.*, 3.*, etc.
    const renamed = [];

    files.forEach((file, idx) => {
        const ext = path.extname(file);
        const newName = `${idx + 1}${ext}`;
        const oldPath = path.join(INPUT_DIR, file);
        const newPath = path.join(INPUT_DIR, newName);

        fs.renameSync(oldPath, newPath);
        renamed.push(newName);

        console.log(`🔄 Renamed: ${file} → ${newName}`);
    });

    // Write index.json
    fs.writeFileSync(OUTPUT_INDEX, JSON.stringify(renamed, null, 2));
    console.log("\n✅ index.json generated:");
    console.log(JSON.stringify(renamed, null, 2));

    console.log("\n🎉 Done!");
}

run();
