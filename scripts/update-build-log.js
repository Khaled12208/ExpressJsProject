const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get package.json data
const packageJson = require('../package.json');

// Get current date
const buildDate = new Date().toISOString();

// Get Node and TypeScript versions
const nodeVersion = process.version;
const tsVersion = packageJson.devDependencies.typescript;

// Get environment
const env = process.env.NODE_ENV || 'development';

// Read the build log template
const buildLogPath = path.join(__dirname, '../logs/build.log');
let buildLog = fs.readFileSync(buildLogPath, 'utf8');

// Replace placeholders with actual values
buildLog = buildLog
  .replace('[BUILD_DATE]', buildDate)
  .replace('[VERSION]', packageJson.version)
  .replace('[NODE_VERSION]', nodeVersion)
  .replace('[TS_VERSION]', tsVersion)
  .replace('[ENV]', env);

// Update build log file
fs.writeFileSync(buildLogPath, buildLog);

console.log('Build log updated successfully!');
