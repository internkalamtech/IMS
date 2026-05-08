#!/usr/bin/env node
const { spawn, spawnSync } = require("child_process");
const path = require("path");
const os = require("os");
const fs = require("fs");

const isWindows = os.platform() === "win32";
const venvPath = path.join(__dirname, "venv");
const pythonPath = isWindows
  ? path.join(venvPath, "Scripts", "python.exe")
  : path.join(venvPath, "bin", "python");

function ensureBackendEnvironment() {
  const uvicornCheck = spawnSync(pythonPath, ["-c", "import uvicorn"], {
    cwd: __dirname,
    stdio: "ignore",
  });

  if (uvicornCheck.status === 0) {
    return;
  }

  console.log("Preparing backend environment...");
  const setup = spawnSync("node", ["setup.js"], {
    cwd: __dirname,
    stdio: "inherit",
    shell: true,
  });

  if (setup.error || setup.status !== 0) {
    console.error("Failed to prepare backend environment.");
    process.exit(setup.status ?? 1);
  }
}

ensureBackendEnvironment();

// Run the backend
console.log("Starting backend...\n");
const python = spawn(pythonPath, ["run.py"], {
  stdio: "inherit",
});

python.on("exit", (code) => {
  process.exit(code);
});

python.on("error", (err) => {
  console.error("Failed to start backend:", err);
  process.exit(1);
});
