#!/usr/bin/env node
/**
 * BookYourService - Multi-service launcher
 * Starts Next.js (sandbox), Vite (frontend), and Hono (API)
 * Keeps all services alive with auto-restart
 */
const { spawn, execSync } = require('child_process');
const path = require('path');

const ROOT = '/home/z/my-project';

// Kill any existing processes on our ports
try {
  console.log('🧹 Cleaning up existing processes...');
  execSync('pkill -f "next dev" || true', { stdio: 'ignore' });
  execSync('pkill -f "tsx index.ts" || true', { stdio: 'ignore' });
  // Don't kill vite yet - it might not be running
} catch (e) {}

const services = [
  {
    name: 'Hono API',
    cmd: 'node',
    args: [path.join(ROOT, 'mini-services/api-service/node_modules/.bin/tsx'), 'index.ts'],
    cwd: path.join(ROOT, 'mini-services/api-service'),
    port: 3001,
    color: '\x1b[36m',
  },
  {
    name: 'Vite Frontend',
    cmd: 'node',
    args: [path.join(ROOT, 'frontend/node_modules/.bin/vite'), '--host'],
    cwd: path.join(ROOT, 'frontend'),
    port: 5173,
    color: '\x1b[32m',
  },
  {
    name: 'Next.js Sandbox',
    cmd: 'node',
    args: [path.join(ROOT, 'node_modules/.bin/next'), 'dev', '--port', '3000'],
    cwd: ROOT,
    port: 3000,
    color: '\x1b[33m',
  },
];

const procs = [];

function startService(svc) {
  console.log(`🚀 Starting ${svc.name} on port ${svc.port}...`);
  
  const proc = spawn(svc.cmd, svc.args, {
    cwd: svc.cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, FORCE_COLOR: '1', DATABASE_URL: svc.name === 'Hono API' ? '' : process.env.DATABASE_URL },
  });

  proc.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    for (const line of lines) {
      if (line.trim()) console.log(`${svc.color}[${svc.name}]\x1b[0m ${line}`);
    }
  });

  proc.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    for (const line of lines) {
      if (line.trim() && !line.includes('DeprecationWarning')) {
        console.log(`${svc.color}[${svc.name}]\x1b[0m ${line}`);
      }
    }
  });

  proc.on('exit', (code, signal) => {
    if (code !== 0 && code !== null) {
      console.log(`⚠️ ${svc.name} exited (code ${code}). Restarting in 5s...`);
      setTimeout(() => startService(svc), 5000);
    }
  });

  procs.push({ proc, svc });
  return proc;
}

// Start services sequentially with delays
async function startAll() {
  // Start API first
  startService(services[0]);
  await new Promise(r => setTimeout(r, 3000));

  // Start Vite
  startService(services[1]);
  await new Promise(r => setTimeout(r, 3000));

  // Start Next.js
  startService(services[2]);

  console.log('\n✅ All services starting:');
  for (const svc of services) {
    console.log(`   ${svc.name} → http://localhost:${svc.port}`);
  }
  console.log('\n📡 Caddy gateway (port 81):');
  console.log('   /          → Vite (5173)');
  console.log('   /api/*     → Hono (3001)');
  console.log('');
}

startAll().catch(console.error);

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  for (const { proc } of procs) {
    try { proc.kill('SIGTERM'); } catch (e) {}
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down...');
  for (const { proc } of procs) {
    try { proc.kill('SIGTERM'); } catch (e) {}
  }
  process.exit(0);
});

// Keep process alive
function keepAlive() {
  setTimeout(keepAlive, 60000);
}
keepAlive();
