// run_pipeline.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// -------------------------
// Named arguments parser
// -------------------------
const args = Object.fromEntries(
  process.argv.slice(2).map(arg => {
    const [key, value] = arg.split('=');
    return [key, value];
  })
);

// -------------------------
// Config
// -------------------------

const promptsFile = args.promptfile || 'prompts_animals_global.js';
const count = args.count || '5';

for (var countrt = 0; countrt < 1; countrt++) {
  const commands = [
    `node .\\closetabs.js`,
    `node .\\${promptsFile} ${count}`,
    'node .\\meta_createvideos.js',
    'node .\\meta_getvideos.js',
    'node .\\upscale.js',
    'node .\\combine_videos.js',
    //'node .\\upload_youtube.js'
  ];

  for (const cmd of commands) {
    console.log(`\nRunning: ${cmd}\n`);

    try {
      execSync(cmd, { stdio: 'inherit' });

      // After generating prompts, update the metadata files
      if (cmd.includes(promptsFile)) {
        console.log("📝 Updating metadata files with prompt...");
        try {
          const videosJsPath = path.join(__dirname, 'videos.js');
          if (fs.existsSync(videosJsPath)) {
            // Clear cache and require the newly generated videos
            delete require.cache[require.resolve(videosJsPath)];
            const videos = require(videosJsPath);
            
            if (videos && videos.length > 0) {
              const storyDetails = [];
              for (let i = 0; i < videos.length; i ++) {
                if (videos[i]) {
                  const prompt = videos[i];
                  const parts = prompt.replace('video of ', '').split(',');
                  const species = parts[0]?.trim() || "Wild Animal";
                  const habitat = parts[2]?.trim()?.replace(/^in\s+/i, '') || "Savannah";
                  storyDetails.push({ species, habitat });
                }
              }

              console.log(`  📝 Creating summary for ${storyDetails.length} stories...`);

              // Create a short summary title
              const uniqueSpecies = [...new Set(storyDetails.map(s => s.species.split('(')[0].trim()))];
              let shortTitle = `${uniqueSpecies.slice(0, 3).join(', ')}${uniqueSpecies.length > 3 ? ' & More' : ''} | Afro Chill Out Mix`;
              if (shortTitle.length > 100) {
                shortTitle = shortTitle.slice(0, 100);
              }

              // Create a summary description listing all videos
              let description = "Experience the breathtaking beauty of African wildlife in this cinematic collection.\n\nFeatured in this batch:\n";
              storyDetails.forEach(s => {
                description += `- ${s.species} in the ${s.habitat}\n`;
              });
              description += "\nRelaxing Afro Chill Out music provides the perfect rhythmic backdrop for these stunning scenes. #WildLife #Africa #AfroChill #Nature";
              fs.writeFileSync('youtube_title.txt', shortTitle);
              fs.writeFileSync('youtube_description.txt', description);
              
              console.log(`  ✅ title: ${shortTitle}`);
            }
          }
        } catch (metaErr) {
          console.warn("  ⚠️ Failed to update metadata files:", metaErr.message);
        }
      }

    } catch (err) {
      console.error(`Command failed: ${cmd}`);
      process.exit(1);
    }
  }

  console.log('\nPipeline completed successfully.');
}