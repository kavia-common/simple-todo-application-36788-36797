#!/usr/bin/env node
// Ensures GENERATE_SOURCEMAP=false without relying on cross-env,
// then invokes the build using craco when present, otherwise falls back
// to react-scripts directly. This makes CI resilient when dev deps aren't preinstalled.

process.env.GENERATE_SOURCEMAP = 'false';

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

function spawnCmd(cmd, args) {
  const child = spawn(cmd, args, {
    stdio: 'inherit',
    env: process.env,
  });
  child.on('exit', (code) => process.exit(code || 0));
  child.on('error', (err) => {
    console.error(`Failed to start ${cmd}:`, err && err.message);
    process.exit(1);
  });
}

function tryCraco() {
  try {
    // If craco is resolvable from project root, use it
    require.resolve('@craco/craco', { paths: [path.resolve(__dirname, '..')] });
    // Use local .bin if exists, else require the build script entry
    const cracoBin = path.resolve(
      __dirname,
      '..',
      'node_modules',
      '.bin',
      process.platform === 'win32' ? 'craco.cmd' : 'craco'
    );
    if (fs.existsSync(cracoBin)) {
      spawnCmd(cracoBin, ['build']);
    } else {
      // Require craco's build entry (API triggers the build)
      require('@craco/craco/dist/scripts/build');
    }
  } catch {
    return false;
  }
  return true;
}

function tryReactScripts() {
  try {
    // Use react-scripts build directly if available
    require.resolve('react-scripts', { paths: [path.resolve(__dirname, '..')] });
    const rsBin = path.resolve(
      __dirname,
      '..',
      'node_modules',
      '.bin',
      process.platform === 'win32' ? 'react-scripts.cmd' : 'react-scripts'
    );
    if (fs.existsSync(rsBin)) {
      spawnCmd(rsBin, ['build']);
    } else {
      require('react-scripts/scripts/build');
    }
  } catch (e) {
    console.error('Could not resolve a build tool (craco or react-scripts). Ensure dependencies are installed.', e && e.message);
    process.exit(1);
  }
}

if (!tryCraco()) {
  // Fallback path: build via react-scripts if craco isn't available
  tryReactScripts();
}
