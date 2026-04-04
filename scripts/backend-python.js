#!/usr/bin/env node

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const command = process.argv[2];
const repoRoot = path.resolve(__dirname, '..');
const backendDir = path.join(repoRoot, 'backend');

const venvPython = process.platform === 'win32'
  ? path.join(backendDir, 'venv', 'Scripts', 'python.exe')
  : path.join(backendDir, 'venv', 'bin', 'python');

function run(cmd, args, cwd = repoRoot) {
  const result = spawnSync(cmd, args, {
    cwd,
    stdio: 'inherit',
    shell: false,
  });

  if (result.error) {
    return { status: 1, error: result.error };
  }

  return { status: result.status ?? 1 };
}

function canRun(cmd, args, cwd = repoRoot) {
  const result = spawnSync(cmd, args, {
    cwd,
    stdio: 'ignore',
    shell: false,
  });

  return !result.error && (result.status ?? 1) === 0;
}

function findBootstrapPython() {
  const candidates = process.platform === 'win32'
    ? [
        ['py', ['-3']],
        ['python', []],
      ]
    : [
        ['python3', []],
        ['python', []],
      ];

  for (const [cmd, args] of candidates) {
    if (canRun(cmd, [...args, '--version'])) {
      return { cmd, args };
    }
  }

  return null;
}

function ensureBackendDir() {
  if (!fs.existsSync(backendDir)) {
    console.error('backend directory not found at:', backendDir);
    process.exit(1);
  }
}

function setup() {
  ensureBackendDir();

  const py = findBootstrapPython();
  if (!py) {
    console.error('Could not find a Python interpreter (python3/python or py -3).');
    process.exit(1);
  }

  const venvExists = fs.existsSync(venvPython);

  let result = { status: 0 };
  if (!venvExists) {
    result = run(py.cmd, [...py.args, '-m', 'venv', 'venv'], backendDir);
    if (result.status !== 0) {
      process.exit(result.status);
    }
  } else {
    console.log('Existing virtual environment detected, skipping recreation.');
  }

  if (!fs.existsSync(venvPython)) {
    console.error('Virtual environment setup failed: python executable not found in venv.');
    process.exit(1);
  }

  result = run(venvPython, ['-m', 'pip', 'install', '-r', 'requirements.txt'], backendDir);
  if (result.status !== 0) {
    process.exit(result.status);
  }
}

function startBackend() {
  ensureBackendDir();

  if (!fs.existsSync(venvPython)) {
    console.error('Virtual environment not found. Run `npm run backend:setup` first.');
    process.exit(1);
  }

  const result = run(venvPython, ['run.py'], backendDir);
  if (result.status !== 0) {
    process.exit(result.status);
  }
}

if (command === 'setup') {
  setup();
} else if (command === 'run') {
  startBackend();
} else {
  console.error('Usage: node scripts/backend-python.js <setup|run>');
  process.exit(1);
}
