/**
 * Подменяет статьи по DP и продвинутым темам в db.json.
 * node scripts/refresh-dp-prod-articles.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { articles as dp } from './seed-articles-dp.mjs';
import { articles as prod } from './seed-articles-prodvinutye.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const REPLACE_IDS = new Set([...dp, ...prod].map((a) => a.id));
db.articles = db.articles.filter((a) => !REPLACE_IDS.has(a.id));
db.articles.push(...dp, ...prod);

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2) + '\n', 'utf8');
console.log('Refreshed DP + prodvinutye articles:', REPLACE_IDS.size, 'replaced/added');
