#!/usr/bin/env node

/**
 * Syncs the version from package.json to app.json and moves the git tag
 * Used in the postversion npm script to keep versions in sync
 */

const { execSync } = require('child_process');
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

  // Amend the commit to include app.json
  execSync('git add app.json', { cwd: rootDir, stdio: 'inherit' });
  execSync('git commit --amend --no-edit --no-verify', { cwd: rootDir, stdio: 'inherit' });

  // Move the tag to the amended commit
  execSync(`git tag -f v${version}`, { cwd: rootDir, stdio: 'inherit' });

  console.log(`✅ Moved tag v${version} to amended commit`);
} catch (error) {
  console.error('❌ Failed to sync version:', error.message);
  process.exit(1);
}
