/**
 * 1. Replace the complexity chart in "osnovy-complexity" with a grid of individual charts
 *    (like "Grokking Algorithms" style — each complexity at its own scale).
 * 2. Add a time-complexity chart block to every algorithm article.
 *
 * Run: node scripts/patch-complexity-charts.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER: generate data for a single complexity function
// ═══════════════════════════════════════════════════════════════════════════════
function genData(fn, maxN, step) {
  const data = [];
  for (let n = 0; n <= maxN; n += (step || 1)) {
    data.push({ n, ops: Math.round(fn(n) * 100) / 100 });
  }
  return data;
}

const O1     = n => 1;
const Ologn  = n => n > 0 ? Math.log2(n) : 0;
const On     = n => n;
const Onlogn = n => n > 0 ? n * Math.log2(n) : 0;
const On2    = n => n * n;
const O2n    = n => Math.min(Math.pow(2, n), 1e6);

// ═══════════════════════════════════════════════════════════════════════════════
// 1. COMPLEXITY OVERVIEW — grid of individual charts
// ═══════════════════════════════════════════════════════════════════════════════
function makeComplexityGrid() {
  return {
    id: 'chart-complexity',
    type: 'chart',
    title: 'Скорости роста алгоритмов',
    columns: 3,
    charts: [
      {
        title: 'O(1) — константа',
        data: genData(O1, 50, 5),
        xKey: 'n', lines: [{ dataKey: 'ops', label: 'O(1)', color: '#60a5fa' }],
        height: 160,
      },
      {
        title: 'O(log n) — логарифм',
        data: genData(Ologn, 50, 2),
        xKey: 'n', lines: [{ dataKey: 'ops', label: 'O(log n)', color: '#a78bfa' }],
        height: 160,
      },
      {
        title: 'O(n) — линейная',
        data: genData(On, 50, 5),
        xKey: 'n', lines: [{ dataKey: 'ops', label: 'O(n)', color: '#4ade80' }],
        height: 160,
      },
      {
        title: 'O(n log n)',
        data: genData(Onlogn, 50, 2),
        xKey: 'n', lines: [{ dataKey: 'ops', label: 'O(n log n)', color: '#fbbf24' }],
        height: 160,
      },
      {
        title: 'O(n²) — квадратичная',
        data: genData(On2, 50, 5),
        xKey: 'n', lines: [{ dataKey: 'ops', label: 'O(n²)', color: '#f87171' }],
        height: 160,
      },
      {
        title: 'O(2ⁿ) — экспоненциальная',
        data: genData(O2n, 20, 1),
        xKey: 'n', lines: [{ dataKey: 'ops', label: 'O(2ⁿ)', color: '#fb923c' }],
        height: 160,
      },
    ],
  };
}

// Replace in osnovy-complexity
const complexityArt = db.articles.find(a => a.id === 'osnovy-complexity');
if (complexityArt) {
  complexityArt.blocks = complexityArt.blocks.filter(b => b.id !== 'chart-complexity');
  const targetIdx = complexityArt.blocks.findIndex(b => b.id === 'p7');
  const chartBlock = makeComplexityGrid();
  if (targetIdx !== -1) {
    complexityArt.blocks.splice(targetIdx + 1, 0, chartBlock);
  } else {
    complexityArt.blocks.push(chartBlock);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. ADD COMPLEXITY CHARTS TO ALL ALGORITHM ARTICLES
// ═══════════════════════════════════════════════════════════════════════════════

// Map: articleId → { title, lines[], data generator, afterBlockId }
const ALGO_COMPLEXITY_MAP = {
  // Sorting O(n²)
  'sortirovki-n2-simple': {
    title: 'Время выполнения: O(n²)',
    fn: On2, maxN: 30, step: 2,
    label: 'O(n²)', color: '#f87171',
    afterBlock: 'h2-compare',
  },
  // Quicksort O(n log n) avg
  'sortirovki-quicksort': {
    title: 'Время выполнения: O(n log n) — средний случай',
    fn: Onlogn, maxN: 50, step: 2,
    label: 'O(n log n)', color: '#fbbf24',
    afterBlock: 'p5',
    extra: [{ fn: On2, label: 'O(n²) худший', color: '#f87171' }],
  },
  // Merge sort O(n log n)
  'sortirovki-merge': {
    title: 'Время выполнения: O(n log n)',
    fn: Onlogn, maxN: 50, step: 2,
    label: 'O(n log n)', color: '#fbbf24',
    afterBlock: 'p7',
  },
  // Heap sort O(n log n)
  'sortirovki-heapsort': {
    title: 'Время выполнения: O(n log n)',
    fn: Onlogn, maxN: 50, step: 2,
    label: 'O(n log n)', color: '#fbbf24',
    afterBlock: 'p8',
  },
  // Counting sort O(n+k)
  'sortirovki-counting-radix': {
    title: 'Время выполнения: O(n + k)',
    fn: On, maxN: 50, step: 5,
    label: 'O(n + k)', color: '#4ade80',
    afterBlock: 'p5',
  },
  // Linear search O(n)
  'poisk-linear': {
    title: 'Время выполнения: O(n)',
    fn: On, maxN: 50, step: 5,
    label: 'O(n)', color: '#4ade80',
    afterBlock: 'p3',
  },
  // Binary search O(log n)
  'poisk-binary': {
    title: 'Время выполнения: O(log n)',
    fn: Ologn, maxN: 100, step: 5,
    label: 'O(log n)', color: '#a78bfa',
    afterBlock: 'p5',
    extra: [{ fn: On, label: 'O(n) линейный', color: 'rgba(148,163,184,0.4)' }],
  },
  // Binary search by answer O(log n)
  'poisk-binary-answer': {
    title: 'Время выполнения: O(log n × f)',
    fn: Ologn, maxN: 100, step: 5,
    label: 'O(log n)', color: '#a78bfa',
    afterBlock: null,
  },
  // BST O(log n) avg
  'der-basic': {
    title: 'Время выполнения: O(log n) — средний случай',
    fn: Ologn, maxN: 100, step: 5,
    label: 'O(log n)', color: '#a78bfa',
    afterBlock: 'p8',
  },
  // BFS O(V+E)
  'der-bfs': {
    title: 'Время выполнения: O(V + E)',
    fn: On, maxN: 50, step: 5,
    label: 'O(V + E)', color: '#4ade80',
    afterBlock: 'p7',
  },
  // DFS O(V+E)
  'der-dfs': {
    title: 'Время выполнения: O(V + E)',
    fn: On, maxN: 50, step: 5,
    label: 'O(V + E)', color: '#4ade80',
    afterBlock: 'p8',
  },
  // Graph BFS/DFS
  'graf-traversal': {
    title: 'Время выполнения: O(V + E)',
    fn: On, maxN: 50, step: 5,
    label: 'O(V + E)', color: '#4ade80',
    afterBlock: 'p7',
  },
  // Dijkstra O(E log V)
  'graf-shortest': {
    title: 'Время выполнения: Dijkstra O(E log V) vs Bellman-Ford O(VE)',
    fn: n => n > 0 ? n * Math.log2(n) : 0, maxN: 50, step: 2,
    label: 'O(E log V)', color: '#fbbf24',
    afterBlock: 'p8',
    extra: [{ fn: On2, label: 'O(VE)', color: '#f87171' }],
  },
  // Kruskal O(E log E)
  'graf-mst': {
    title: 'Время выполнения: O(E log E)',
    fn: n => n > 0 ? n * Math.log2(n) : 0, maxN: 50, step: 2,
    label: 'O(E log E)', color: '#fbbf24',
    afterBlock: 'p6',
  },
  // Topological sort O(V+E)
  'graf-topo': {
    title: 'Время выполнения: O(V + E)',
    fn: On, maxN: 50, step: 5,
    label: 'O(V + E)', color: '#4ade80',
    afterBlock: 'p6',
  },
  // Floyd-Warshall O(V³)
  'graf-floydw': {
    title: 'Время выполнения: O(V³)',
    fn: n => n * n * n, maxN: 20, step: 1,
    label: 'O(V³)', color: '#f87171',
    afterBlock: 'p7',
  },
  // DP Fibonacci / Grid O(n) / O(m×n)
  'dp-basics': {
    title: 'Время выполнения: O(n) с мемоизацией',
    fn: On, maxN: 50, step: 5,
    label: 'O(n)', color: '#4ade80',
    afterBlock: 'p7',
    extra: [{ fn: O2n, label: 'O(2ⁿ) без мемо', color: '#f87171' }],
  },
  // Knapsack O(n×W)
  'dp-knapsack': {
    title: 'Время выполнения: O(n × W)',
    fn: On2, maxN: 30, step: 2,
    label: 'O(n × W)', color: '#fbbf24',
    afterBlock: 'p8',
  },
  // Priority queue O(log n)
  'str-pq': {
    title: 'Время выполнения: push/pop O(log n)',
    fn: Ologn, maxN: 100, step: 5,
    label: 'O(log n)', color: '#a78bfa',
    afterBlock: null,
  },
  // Trie O(L)
  'str-trie': {
    title: 'Время выполнения: O(L) — длина слова',
    fn: On, maxN: 30, step: 2,
    label: 'O(L)', color: '#4ade80',
    afterBlock: 'p5',
  },
  // Union-Find near O(1) amortized
  'str-dsu': {
    title: 'Время выполнения: ~O(α(n)) ≈ O(1) амортизированно',
    fn: n => Math.log2(Math.log2(n + 2) + 1) + 1, maxN: 100, step: 5,
    label: 'O(α(n))', color: '#60a5fa',
    afterBlock: 'p7',
  },
  // KMP etc O(n+m)
  'prod-strings': {
    title: 'Время выполнения: O(n + m)',
    fn: On, maxN: 50, step: 5,
    label: 'O(n + m)', color: '#4ade80',
    afterBlock: null,
  },
};

let added = 0;
for (const [articleId, cfg] of Object.entries(ALGO_COMPLEXITY_MAP)) {
  const article = db.articles.find(a => a.id === articleId);
  if (!article) continue;

  const chartId = `chart-complexity-${articleId}`;
  // Remove existing to be idempotent
  article.blocks = article.blocks.filter(b => b.id !== chartId);

  const lines = [{ dataKey: 'ops', label: cfg.label, color: cfg.color }];
  const data = genData(cfg.fn, cfg.maxN, cfg.step);

  // If extra comparison lines, merge data
  if (cfg.extra) {
    for (const ex of cfg.extra) {
      const exData = genData(ex.fn, cfg.maxN, cfg.step);
      for (let i = 0; i < data.length; i++) {
        data[i][ex.label] = exData[i]?.ops ?? 0;
      }
      lines.push({ dataKey: ex.label, label: ex.label, color: ex.color });
    }
  }

  const chartBlock = {
    id: chartId,
    type: 'chart',
    title: cfg.title,
    data,
    xKey: 'n',
    xLabel: 'n',
    yLabel: 'операции',
    lines,
    height: 220,
  };

  if (cfg.afterBlock) {
    const idx = article.blocks.findIndex(b => b.id === cfg.afterBlock);
    if (idx !== -1) {
      article.blocks.splice(idx + 1, 0, chartBlock);
    } else {
      article.blocks.push(chartBlock);
    }
  } else {
    // Put before last block
    const lastIdx = article.blocks.length - 1;
    article.blocks.splice(lastIdx, 0, chartBlock);
  }
  added++;
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2) + '\n', 'utf8');
console.log(`Complexity grid chart updated for osnovy-complexity.`);
console.log(`Added ${added} complexity charts to algorithm articles.`);
