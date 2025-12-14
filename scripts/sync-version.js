#!/usr/bin/env node

/**
 * Syncs the version from package.json to app.json
 * Used in the postversion npm script to keep versions in sync
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const packageJsonPath = path.join(rootDir, 'package.json');
const appJsonPath = path.join(rootDir, 'app.json');

try {
  // Read package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const version = packageJson.version;

  if (!version) {
    console.error('❌ No version found in package.json');
    process.exit(1);
  }

  // Read app.json
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

  // Update version
  appJson.expo.version = version;

  // Write back to app.json with same formatting
  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');

  console.log(`✅ Synced app.json version to ${version}`);
} catch (error) {
  console.error('❌ Failed to sync version:', error.message);
  process.exit(1);
}
