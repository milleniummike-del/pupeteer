// run_pipeline.js
const { execSync } = require('child_process');

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

const promptsFile = args.promptfile || 'prompts_animals_global';
const count = args.count || '8';

const commands = [
  `node .\\${promptsFile} ${count}`,
 // 'node create_producer.js',
  'node .\\meta_createvideos.js',
  'node .\\meta_getvideos.js',
  //'node .\\upscale.js',
  //'node combine_videos.js'
];

for (const cmd of commands) {
  console.log(`\nRunning: ${cmd}\n`);

  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (err) {
    console.error(`Command failed: ${cmd}`);
    process.exit(1);
  }
}

console.log('\nPipeline completed successfully.');