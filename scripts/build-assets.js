#!/usr/bin/env node

/**
 * Build icon.png and splash.png from icon-source.svg and splash-source.svg.
 * Uses macOS qlmanage to convert SVG → PNG. Run from project root: npm run build:assets
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const root = process.cwd();
const assetsDir = path.join(root, 'assets');

function run(cmd, description) {
  try {
    execSync(cmd, { cwd: assetsDir, stdio: 'inherit' });
  } catch (err) {
    console.error(`build-assets: ${description} failed.`);
    console.error('On macOS we use qlmanage. Ensure icon-source.svg and splash-source.svg exist in assets/.');
    process.exit(1);
  }
}

// Ensure source files exist
const iconSrc = path.join(assetsDir, 'icon-source.svg');
const splashSrc = path.join(assetsDir, 'splash-source.svg');
if (!fs.existsSync(iconSrc)) {
  console.error('assets/icon-source.svg not found.');
  process.exit(1);
}
if (!fs.existsSync(splashSrc)) {
  console.error('assets/splash-source.svg not found.');
  process.exit(1);
}

console.log('Building icon.png (1024×1024)...');
run(
  'qlmanage -t -s 1024 -o . icon-source.svg && cp icon-source.svg.png icon.png && rm -f icon-source.svg.png',
  'icon'
);

console.log('Building splash.png (1284×1284)...');
run(
  'qlmanage -t -s 1284 -o . splash-source.svg && cp splash-source.svg.png splash.png && rm -f splash-source.svg.png',
  'splash'
);

console.log('Done. icon.png and splash.png updated.');
