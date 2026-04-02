/**
 * Fixes visualization placement in db.json articles:
 * 1. Moves animation blocks to logically correct positions (after relevant sections)
 * 2. Replaces complexity SVG with a Recharts `chart` block
 *
 * Run: node scripts/fix-viz-placement.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// ── Helper: move an animation block to after a specific block id ──
function moveAnimAfter(article, animId, afterBlockId) {
  const blocks = article.blocks;
  const animIdx = blocks.findIndex(b => b.id === animId);
  if (animIdx === -1) return;
  const [anim] = blocks.splice(animIdx, 1);
  const targetIdx = blocks.findIndex(b => b.id === afterBlockId);
  if (targetIdx === -1) {
    blocks.push(anim);
    return;
  }
  blocks.splice(targetIdx + 1, 0, anim);
}

// ── Placement map: articleId → [ [animId, afterBlockId], ... ] ──
const placements = {
  // SORTING: put each viz after its code example
  'sortirovki-n2-simple': [
    ['anim-bubble-sort', 'code1'],       // after Bubble Sort code
    ['anim-selection-sort', 'code2'],     // after Selection Sort code
    ['anim-insertion-sort', 'code3'],     // after Insertion Sort code
  ],
  'sortirovki-quicksort': [
    ['anim-quicksort', 'code1'],          // after partition explanation code
  ],
  'sortirovki-merge': [
    ['anim-mergesort', 'code1'],          // after merge operation code
  ],
  'sortirovki-heapsort': [
    ['anim-heapsort', 'code2'],           // after heap sort algorithm code
  ],
  'sortirovki-counting-radix': [
    ['anim-counting-sort', 'code1'],      // after counting sort code
  ],

  // SEARCH: put after the algorithm code
  'poisk-linear': [
    ['anim-linear-search', 'code1'],      // after linear search code
  ],
  'poisk-binary': [
    ['anim-binary-search', 'code1'],      // after iterative binary search code
  ],

  // TREES: after relevant code
  'der-basic': [
    ['anim-bst', 'code3'],               // after "building the tree step by step" code
  ],
  'der-bfs': [
    ['anim-tree-bfs', 'code1'],           // after step-by-step BFS example
  ],
  'der-dfs': [
    ['anim-tree-dfs', 'code-in'],         // after inorder code (viz is inorder)
  ],

  // GRAPHS: put BFS viz after BFS code, DFS viz after DFS code
  'graf-traversal': [
    ['anim-graph-bfs', 'code2'],          // after BFS code (code1 is adj list, code2 is BFS)
    ['anim-graph-dfs', 'code3'],          // after DFS code
  ],
  'graf-shortest': [
    ['anim-dijkstra', 'code1'],           // after Dijkstra code
  ],
  'graf-mst': [
    ['anim-kruskal', 'code1'],            // after Kruskal code
  ],
  'graf-topo': [
    ['anim-toposort', 'code1'],           // after Kahn's algorithm code
  ],
  'graf-floydw': [
    ['anim-floyd-warshall', 'code1'],     // after Floyd-Warshall code
  ],

  // DP: after relevant code
  'dp-basics': [
    ['anim-dp-grid-paths', 'code4'],      // after grid paths code
  ],
  'dp-knapsack': [
    ['anim-dp-knapsack', 'p5'],           // after "Визуализация таблицы" paragraph
  ],

  // DATA STRUCTURES
  'osnovy-hashtable': [
    ['anim-hash-table', 'code1'],         // after hash function code
  ],
  'osnovy-stack-queue': [
    ['anim-stack-ops', 'code1'],          // after stack code
    ['anim-queue-ops', 'code3'],          // after queue code
  ],

  // ARRAYS
  'osnovy-arrays-strings': [
    ['anim-array-basics', 'code1'],       // after first array example code
  ],

  // RECURSION
  'rekursiya-basic-examples': [
    ['anim-recursion-stack', 'code1'],    // after factorial code
  ],
  'rekursiya-sequences': [
    ['anim-fib-memo', 'code3'],           // after memoization code
  ],
  'rekursiya-divide-conquer': [
    ['anim-divide-conquer', 'code2'],     // after merge sort code
  ],

  // ADDITIONAL STRUCTURES
  'str-trie': [
    ['anim-trie', 'code2'],              // after trie structure code
  ],
  'str-dsu': [
    ['anim-dsu', 'code1'],               // after basic DSU implementation code
  ],
};

// ── Apply placements ──
let moved = 0;
for (const article of db.articles) {
  const pl = placements[article.id];
  if (!pl) continue;
  for (const [animId, afterBlockId] of pl) {
    const before = article.blocks.findIndex(b => b.id === animId);
    if (before === -1) continue;
    moveAnimAfter(article, animId, afterBlockId);
    moved++;
  }
}

// ── Replace complexity chart with Recharts chart block ──
function generateComplexityData() {
  const data = [];
  for (let n = 0; n <= 50; n += 2) {
    const entry = { n };
    entry['O(1)'] = 1;
    entry['O(log n)'] = n > 0 ? Math.round(Math.log2(n) * 10) / 10 : 0;
    entry['O(n)'] = n;
    entry['O(n log n)'] = n > 0 ? Math.round(n * Math.log2(n) * 10) / 10 : 0;
    entry['O(n²)'] = n * n;
    data.push(entry);
  }
  return data;
}

const complexityChart = {
  id: 'chart-complexity',
  type: 'chart',
  title: 'Сравнение скоростей роста: O(1), O(log n), O(n), O(n log n), O(n²)',
  data: generateComplexityData(),
  xKey: 'n',
  xLabel: 'n (размер входа)',
  yLabel: 'Операции',
  lines: [
    { dataKey: 'O(1)', label: 'O(1)', color: '#60a5fa' },
    { dataKey: 'O(log n)', label: 'O(log n)', color: '#a78bfa' },
    { dataKey: 'O(n)', label: 'O(n)', color: '#4ade80' },
    { dataKey: 'O(n log n)', label: 'O(n log n)', color: '#fbbf24' },
    { dataKey: 'O(n²)', label: 'O(n²)', color: '#f87171' },
  ],
  height: 320,
};

const complexityArticle = db.articles.find(a => a.id === 'osnovy-complexity');
if (complexityArticle) {
  // Remove old animation block and any existing chart block with same id
  complexityArticle.blocks = complexityArticle.blocks.filter(
    b => b.id !== 'anim-complexity-chart' && b.id !== 'chart-complexity'
  );
  // Insert chart block after "Сравнение скоростей роста" heading's paragraph (p7)
  const targetIdx = complexityArticle.blocks.findIndex(b => b.id === 'p7');
  if (targetIdx !== -1) {
    complexityArticle.blocks.splice(targetIdx + 1, 0, complexityChart);
  } else {
    complexityArticle.blocks.push(complexityChart);
  }
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2) + '\n', 'utf8');
console.log(`Moved ${moved} animation blocks to correct positions.`);
console.log('Replaced complexity chart with Recharts chart block.');
