/**
 * Slows down all animation blocks in db.json by multiplying timing constants.
 * The approach: first revert to the original timings by re-running patch-viz-all.mjs,
 * then apply multiplier. Since we can't re-run easily, we use a smart regex
 * that handles multi-line setTimeout patterns.
 *
 * Run: node scripts/fix-viz-timing.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const MULTIPLIER = 2.5;

/**
 * Multiplies ALL numeric ms values in timer calls.
 * Handles:
 *   sleep(NNN)
 *   setTimeout(step, NNN)
 *   setTimeout(function(){ ... }, NNN)   (multiline)
 *   setInterval(fn, NNN)
 */
function slowDown(jsCode) {
  if (!jsCode) return jsCode;

  // sleep(NNN)
  let result = jsCode.replace(/\bsleep\(\s*(\d+)\s*\)/g, (_, ms) => {
    return `sleep(${Math.round(Number(ms) * MULTIPLIER)})`;
  });

  // For setTimeout and setInterval, we need to find the LAST numeric argument
  // before the closing paren. Use a strategy: find }, NNN) patterns (multiline cases)
  // and also simple fn, NNN) patterns.

  // Pattern 1: }, NNN) — the function body ended, then comma, then delay
  result = result.replace(/\},\s*(\d+)\s*\)/g, (match, ms) => {
    return `}, ${Math.round(Number(ms) * MULTIPLIER)})`;
  });

  // Pattern 2: word, NNN) where word is an identifier like step, tick, scan, etc.
  // This handles setTimeout(step, NNN), setInterval(tick, NNN)
  result = result.replace(/(\b(?:setTimeout|setInterval)\s*\(\s*\w+\s*),\s*(\d+)\s*\)/g, (match, prefix, ms) => {
    return `${prefix}, ${Math.round(Number(ms) * MULTIPLIER)})`;
  });

  return result;
}

let patched = 0;
for (const article of db.articles) {
  for (const block of article.blocks) {
    if (block.type !== 'animation' || !block.js) continue;
    const before = block.js;
    block.js = slowDown(block.js);
    if (block.js !== before) patched++;
  }
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2) + '\n', 'utf8');
console.log(`Slowed down ${patched} animation blocks by ${MULTIPLIER}x.`);
