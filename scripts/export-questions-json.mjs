#!/usr/bin/env node
/**
 * Export QUESTIONS from the client-side data file to a JSON file
 * that the Cloud Function can require().
 *
 * Usage: node scripts/export-questions-json.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcPath = resolve(__dirname, '..', 'src', 'codequiz', 'data', 'questions-data.js');
const outPath = resolve(__dirname, '..', 'functions', 'questions-data.json');

// Read the source file and evaluate it as a module
let source = readFileSync(srcPath, 'utf8');

// Replace ESM export with CommonJS-style assignment so we can eval
source = source.replace(/^export\s*\{[^}]*\}\s*;?\s*$/m, '');

// Create a sandbox to execute the file
const sandbox = {};
const fn = new Function('module', 'exports', source + '\nmodule.exports = { QUESTIONS };');
const mod = { exports: {} };
fn(mod, mod.exports);

const QUESTIONS = mod.exports.QUESTIONS;
if (!QUESTIONS || typeof QUESTIONS !== 'object') {
  console.error('Failed to extract QUESTIONS from source file');
  process.exit(1);
}

writeFileSync(outPath, JSON.stringify(QUESTIONS, null, 2), 'utf8');
console.log(`Exported QUESTIONS to ${outPath}`);
console.log(`Languages: ${Object.keys(QUESTIONS).join(', ')}`);
let totalQuestions = 0;
for (const lang of Object.values(QUESTIONS)) {
  for (const topic of Object.values(lang)) {
    for (const diff of Object.values(topic)) {
      if (Array.isArray(diff)) totalQuestions += diff.length;
    }
  }
}
console.log(`Total questions: ${totalQuestions}`);
