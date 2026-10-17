/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

// Carrega .env.local e .env.supabase.local (sem sobrescrever variaveis ja definidas).
function loadLocalEnv(rootDir = path.join(__dirname, '..', '..')) {
  ['.env.local', '.env.supabase.local'].forEach((fileName) => {
    const filePath = path.join(rootDir, fileName);
    if (!fs.existsSync(filePath)) return;
    fs.readFileSync(filePath, 'utf8').split(/\r?\n/).forEach((line) => {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!match) return;
      const [, key, rawValue] = match;
      if (process.env[key] !== undefined) return;
      process.env[key] = rawValue.replace(/^(['"])(.*)\1$/, '$2');
    });
  });
}

module.exports = {
  loadLocalEnv
};
