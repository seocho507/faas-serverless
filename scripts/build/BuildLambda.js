const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const serviceName = process.env.name;

if (!serviceName) {
  console.error(
      "Service name is not defined. Please set the 'name' environment variable.");
  process.exit(1);
}

const servicePath = path.join('packages', serviceName, 'src');
const functions = fs.readdirSync(servicePath);

const buildFunction = async (func) => {
  console.log(`Building ${func}...`);

  const funcPath = path.join(servicePath, func, 'handler.ts');
  const outDir = path.join(servicePath, func, 'dist');

  try {
    await esbuild.build({
      entryPoints: [funcPath],
      bundle: true,
      minify: false,
      platform: 'node',
      target: 'node20',
      outfile: path.join(outDir, 'handler.js'),
      external: ['aws-sdk'],
    });
    console.log(`Build succeeded for ${func}`);
  } catch (err) {
    console.error(`Build failed for ${func}:`, err);
    process.exit(1);
  }
};

const buildAllFunctions = async () => {
  const buildPromises = functions.map(func => buildFunction(func));
  await Promise.all(buildPromises);
  console.log('Build and deploy completed');
};

buildAllFunctions().catch(err => {
  console.error('An error occurred during the build process:', err);
  process.exit(1);
});
