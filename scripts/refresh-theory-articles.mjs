/**
 * Удаляет статьи по деревьям/графам/структурам и вставляет актуальные из seed-файлов.
 * node scripts/refresh-theory-articles.mjs
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

const REPLACE_IDS = new Set(
  [...trees, ...graphs, ...structs].map((a) => a.id),
);

db.articles = db.articles.filter((a) => !REPLACE_IDS.has(a.id));
db.articles.push(...trees, ...graphs, ...structs);

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2) + '\n', 'utf8');
console.log('Refreshed theory articles:', REPLACE_IDS.size, 'replaced');
