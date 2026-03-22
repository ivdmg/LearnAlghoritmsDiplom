/**
 * Добавляет статьи по деревьям, графам и доп. структурам в db.json (без дубликатов по id).
 * Запуск: node scripts/merge-theory-articles.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { articles as trees } from './seed-articles-trees.mjs';
import { articles as graphs } from './seed-articles-graphs.mjs';
import { articles as structs } from './seed-articles-structs.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const existing = new Set(db.articles.map((x) => x.id));
const all = [...trees, ...graphs, ...structs];
let n = 0;
for (const art of all) {
  if (existing.has(art.id)) continue;
  db.articles.push(art);
  existing.add(art.id);
  n++;
}
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2) + '\n', 'utf8');
console.log('Merged theory articles: +' + n + ' (skipped existing ids)');
