import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SORT_POISK_ARTICLES } from './sort-poisk-articles.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const dbPath = path.join(root, 'db.json');

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const existing = new Set(db.articles.map((a) => a.id));
const toAdd = SORT_POISK_ARTICLES.filter((a) => !existing.has(a.id));

if (toAdd.length === 0) {
  console.log('All sort/poisk articles already present; nothing to add.');
  process.exit(0);
}

db.articles.push(...toAdd);
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log('Added articles:', toAdd.map((a) => a.id).join(', '));
console.log('Total articles:', db.articles.length);
