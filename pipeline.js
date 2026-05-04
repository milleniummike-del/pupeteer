// run_pipeline.js
const { execSync } = require('child_process');

const promptsFile = process.argv[2] || 'prompts_animals_jungle';
const count = process.argv[3] || '8';

const commands = [
  `node .\\${promptsFile} ${count}`,
  'node create_producer.js',
  'node .\\meta_createvideos.js',
  'node .\\meta_getvideos.js',
  'node .\\upscale.js',
  'node combine_videos.js'
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