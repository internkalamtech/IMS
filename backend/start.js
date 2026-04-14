#!/usr/bin/env node
const { spawn, spawnSync } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const isWindows = os.platform() === 'win32';
const venvPath = path.join(__dirname, 'venv');
const pythonPath = isWindows
    ? path.join(venvPath, 'Scripts', 'python.exe')
    : path.join(venvPath, 'bin', 'python');

// If venv doesn't exist, create it
if (!fs.existsSync(venvPath)) {
    console.log('Creating virtual environment...');
    const createVenv = spawnSync('python', ['-m', 'venv', 'venv'], {
        cwd: __dirname,
        stdio: 'inherit',
        shell: true,
    });
    if (createVenv.error) {
        console.error('Failed to create venv:', createVenv.error);
        process.exit(1);
    }
}

// Run the backend
console.log('Starting backend...\n');
const python = spawn(pythonPath, ['run.py'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true,
});

python.on('exit', (code) => {
    process.exit(code);
});

python.on('error', (err) => {
    console.error('Failed to start backend:', err);
    process.exit(1);
});
