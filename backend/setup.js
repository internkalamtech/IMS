#!/usr/bin/env node
const { spawnSync } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const isWindows = os.platform() === 'win32';
const venvPath = path.join(__dirname, 'venv');
const pythonPath = isWindows
    ? path.join(venvPath, 'Scripts', 'python.exe')
    : path.join(venvPath, 'bin', 'python');

console.log('Setting up backend environment...\n');

// Step 1: Create virtual environment
if (!fs.existsSync(venvPath)) {
    console.log('📦 Creating virtual environment...');
    const createVenv = spawnSync('python', ['-m', 'venv', 'venv'], {
        cwd: __dirname,
        stdio: 'inherit',
        shell: true,
    });
    if (createVenv.error) {
        console.error('\n✗ Failed to create venv:', createVenv.error);
        process.exit(1);
    }
    console.log('✓ Virtual environment created\n');
} else {
    console.log('✓ Virtual environment already exists\n');
}

// Step 2: Install dependencies
console.log('📚 Installing dependencies...');
const installDeps = spawnSync(pythonPath, ['-m', 'pip', 'install', '-r', 'requirements.txt'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true,
});

if (installDeps.error) {
    console.error('\n✗ Failed to install dependencies:', installDeps.error);
    process.exit(1);
}

console.log('\n✓ Backend setup complete! Run "npm run backend" to start the server.');
process.exit(0);
