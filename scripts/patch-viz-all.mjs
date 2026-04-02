/**
 * Патч: добавляет animation-блоки визуализаций алгоритмов во все подходящие статьи db.json
 * Запуск: node scripts/patch-viz-all.mjs
 *
 * Группы визуализаций:
 *  1. Bar-chart (сортировки + поиск) — столбцы с подсветкой, swap, сравнением
 *  2. Graph (SVG) — вершины + рёбра, BFS/DFS/Dijkstra/MST
 *  3. Tree (SVG) — узлы дерева, обходы, вставка
 *  4. Cell/Grid — DP-таблицы, хеш-таблицы
 *  5. Stack/Queue — push/pop/enqueue/dequeue
 *  6. Complexity — кривые O(n) (SVG)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'db.json');

// ── Utility: minify JS (strip leading spaces from each line, collapse blank lines) ──
function js(strings, ...vals) {
  let raw = strings.reduce((acc, s, i) => acc + s + (vals[i] ?? ''), '');
  return raw
    .split('\n')
    .map(l => l.trimStart())
    .filter(l => l !== '')
    .join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP 1 — BAR CHART: sorting & searching
// ═══════════════════════════════════════════════════════════════════════════════

const SORTING_VIZ_COMMON_HTML = `<div class="viz-col viz-col--viz-only"><div class="viz-hint" id="hint"></div><div class="viz-chart" id="chart"></div></div>`;

function sortVizBlock(id, height, jsCode) {
  return {
    id,
    type: 'animation',
    html: SORTING_VIZ_COMMON_HTML,
    css: '',
    js: jsCode,
    width: '100%',
    height: height || 320,
    showPlayButton: true,
    vizLayout: 'default',
  };
}

// ── Bubble Sort ──
const bubbleSortViz = sortVizBlock('anim-bubble-sort', 320, js`
(function(){
  var arr = [38, 27, 43, 3, 9, 82, 10, 45, 17, 62];
  var chart = document.getElementById('chart');
  var hint = document.getElementById('hint');
  var B = window.VizBars;
  B.render(chart, arr);
  var n = arr.length, i = 0, j = 0, maxV = B.maxOf(arr);
  function step() {
    if (i >= n - 1) { hint.textContent = 'Массив отсортирован!'; B.clearStates(chart); for(var k=0;k<n;k++) B.setState(chart,k,'success'); return; }
    if (j >= n - 1 - i) { j = 0; i++; step(); return; }
    B.clearStates(chart);
    B.setState(chart, j, 'compare');
    B.setState(chart, j+1, 'compare');
    hint.textContent = 'Сравниваем arr['+j+'] = '+arr[j]+' и arr['+(j+1)+'] = '+arr[j+1];
    if (arr[j] > arr[j+1]) {
      setTimeout(function(){
        hint.textContent = 'Меняем '+arr[j]+' ↔ '+arr[j+1];
        B.swapSlide(chart, arr, j, j+1, maxV, function(){ j++; setTimeout(step, 200); });
      }, 300);
    } else {
      j++;
      setTimeout(step, 300);
    }
  }
  setTimeout(step, 500);
})();
`);

// ── Selection Sort ──
const selectionSortViz = sortVizBlock('anim-selection-sort', 320, js`
(function(){
  var arr = [29, 10, 14, 37, 13, 45, 8, 22, 50, 33];
  var chart = document.getElementById('chart');
  var hint = document.getElementById('hint');
  var B = window.VizBars;
  B.render(chart, arr);
  var n = arr.length, maxV = B.maxOf(arr);
  var i = 0;
  function step() {
    if (i >= n - 1) { B.clearStates(chart); for(var k=0;k<n;k++) B.setState(chart,k,'success'); hint.textContent='Отсортировано!'; return; }
    var minIdx = i, j = i + 1;
    B.clearStates(chart);
    for(var k=0;k<i;k++) B.setState(chart,k,'success');
    B.setState(chart, i, 'active');
    hint.textContent = 'Ищем минимум с позиции '+i;
    function scan() {
      if (j >= n) {
        if (minIdx !== i) {
          hint.textContent = 'Минимум '+arr[minIdx]+' → позиция '+i;
          B.swapValues(chart, arr, i, minIdx, maxV, function(){ i++; setTimeout(step, 250); });
        } else { i++; setTimeout(step, 250); }
        return;
      }
      B.clearStates(chart);
      for(var k=0;k<i;k++) B.setState(chart,k,'success');
      B.setState(chart, minIdx, 'active');
      B.setState(chart, j, 'compare');
      hint.textContent = 'Сравниваем: минимум='+arr[minIdx]+', текущий='+arr[j];
      if (arr[j] < arr[minIdx]) minIdx = j;
      j++;
      setTimeout(scan, 280);
    }
    setTimeout(scan, 300);
  }
  setTimeout(step, 500);
})();
`);

// ── Insertion Sort ──
const insertionSortViz = sortVizBlock('anim-insertion-sort', 320, js`
(function(){
  var arr = [12, 31, 25, 8, 32, 17, 40, 5, 28, 19];
  var chart = document.getElementById('chart');
  var hint = document.getElementById('hint');
  var B = window.VizBars;
  B.render(chart, arr);
  var n = arr.length, maxV = B.maxOf(arr), i = 1;
  function step() {
    if (i >= n) { B.clearStates(chart); for(var k=0;k<n;k++) B.setState(chart,k,'success'); hint.textContent='Отсортировано!'; return; }
    var key = arr[i], j = i;
    B.clearStates(chart);
    B.setState(chart, i, 'active');
    hint.textContent = 'Вставляем элемент '+key+' (позиция '+i+')';
    function shift() {
      if (j > 0 && arr[j-1] > key) {
        B.setState(chart, j-1, 'compare');
        hint.textContent = arr[j-1]+' > '+key+' → сдвиг вправо';
        arr[j] = arr[j-1];
        j--;
        B.refresh(chart, arr);
        setTimeout(shift, 300);
      } else {
        arr[j] = key;
        B.refresh(chart, arr);
        B.setState(chart, j, 'success');
        hint.textContent = 'Вставили '+key+' на позицию '+j;
        i++;
        setTimeout(step, 350);
      }
    }
    setTimeout(shift, 350);
  }
  setTimeout(step, 500);
})();
`);

// ── Quick Sort ──
const quickSortViz = sortVizBlock('anim-quicksort', 340, js`
(function(){
  var arr = [35, 10, 65, 25, 50, 15, 40, 55, 20, 45];
  var chart = document.getElementById('chart');
  var hint = document.getElementById('hint');
  var B = window.VizBars;
  B.render(chart, arr);
  var maxV = B.maxOf(arr);
  function sleep(ms){ return new Promise(function(r){setTimeout(r,ms);}); }
  function paint(lo, hi, pivotIdx, iIdx, jIdx) {
    B.clearStates(chart);
    for(var k=lo;k<=hi;k++){
      if(k===pivotIdx) B.setState(chart,k,'active');
      else if(k===iIdx||k===jIdx) B.setState(chart,k,'compare');
    }
  }
  function qs(lo, hi) {
    if(lo>=hi) {
      if(lo===hi) B.setState(chart,lo,'success');
      return Promise.resolve();
    }
    var pivot=arr[hi], i=lo;
    hint.textContent='Pivot='+pivot+' (позиция '+hi+'), раздел ['+lo+'..'+hi+']';
    paint(lo,hi,hi,-1,-1);
    var j=lo;
    function partition(){
      if(j>=hi){
        return sleep(200).then(function(){
          B.swapValues(chart,arr,i,hi,maxV);
          paint(lo,hi,i,-1,-1);
          hint.textContent='Pivot '+pivot+' на позиции '+i;
          return sleep(300).then(function(){
            B.setState(chart,i,'success');
            return qs(lo,i-1).then(function(){ return qs(i+1,hi); });
          });
        });
      }
      paint(lo,hi,hi,i,j);
      hint.textContent='Сравниваем arr['+j+']='+arr[j]+' с pivot='+pivot;
      if(arr[j]<pivot){
        return sleep(250).then(function(){
          if(i!==j) B.swapValues(chart,arr,i,j,maxV);
          i++; j++;
          return partition();
        });
      } else {
        j++;
        return sleep(200).then(partition);
      }
    }
    return sleep(350).then(partition);
  }
  setTimeout(function(){ qs(0,arr.length-1).then(function(){ hint.textContent='Отсортировано!'; for(var k=0;k<arr.length;k++) B.setState(chart,k,'success'); }); },500);
})();
`);

// ── Merge Sort ──
const mergeSortViz = sortVizBlock('anim-mergesort', 360, js`
(function(){
  var arr = [38, 27, 43, 3, 9, 82, 10, 17];
  var chart = document.getElementById('chart');
  var hint = document.getElementById('hint');
  var B = window.VizBars;
  B.render(chart, arr);
  var maxV = B.maxOf(arr);
  function sleep(ms){ return new Promise(function(r){setTimeout(r,ms);}); }
  function merge(lo, mid, hi) {
    var left = arr.slice(lo, mid+1), right = arr.slice(mid+1, hi+1);
    var i=0, j=0, k=lo;
    hint.textContent = 'Слияние ['+lo+'..'+mid+'] и ['+(mid+1)+'..'+hi+']';
    B.clearZones(chart);
    B.setZone(chart, lo, mid, 'viz-bar-col--zone-a');
    B.setZone(chart, mid+1, hi, 'viz-bar-col--zone-b');
    function step(){
      if(i>=left.length && j>=right.length) {
        B.clearZones(chart);
        for(var x=lo;x<=hi;x++) B.setState(chart,x,'success');
        return sleep(250);
      }
      var pick;
      if(i>=left.length){ pick=right[j]; j++; }
      else if(j>=right.length){ pick=left[i]; i++; }
      else if(left[i]<=right[j]){ pick=left[i]; i++; }
      else { pick=right[j]; j++; }
      arr[k]=pick;
      B.refresh(chart, arr);
      B.setState(chart, k, 'active');
      hint.textContent='Ставим '+pick+' на позицию '+k;
      k++;
      return sleep(320).then(step);
    }
    return sleep(300).then(step);
  }
  function mergeSort(lo,hi){
    if(lo>=hi) return Promise.resolve();
    var mid = Math.floor((lo+hi)/2);
    hint.textContent='Делим ['+lo+'..'+hi+'] → ['+lo+'..'+mid+'] + ['+(mid+1)+'..'+hi+']';
    return sleep(350).then(function(){
      return mergeSort(lo,mid).then(function(){ return mergeSort(mid+1,hi); }).then(function(){ return merge(lo,mid,hi); });
    });
  }
  setTimeout(function(){ mergeSort(0,arr.length-1).then(function(){ B.clearStates(chart); for(var k=0;k<arr.length;k++) B.setState(chart,k,'success'); hint.textContent='Отсортировано!'; }); },500);
})();
`);

// ── Heap Sort ──
const heapSortViz = sortVizBlock('anim-heapsort', 340, js`
(function(){
  var arr = [4, 10, 3, 5, 1, 8, 7, 2, 9, 6];
  var chart = document.getElementById('chart');
  var hint = document.getElementById('hint');
  var B = window.VizBars;
  B.render(chart, arr);
  var maxV = B.maxOf(arr);
  function sleep(ms){ return new Promise(function(r){setTimeout(r,ms);}); }
  function heapify(n, i) {
    var largest = i, l = 2*i+1, r = 2*i+2;
    if (l<n && arr[l]>arr[largest]) largest = l;
    if (r<n && arr[r]>arr[largest]) largest = r;
    if (largest !== i) {
      B.clearStates(chart);
      B.setState(chart, i, 'compare');
      B.setState(chart, largest, 'compare');
      hint.textContent = 'Heapify: меняем '+arr[i]+' ↔ '+arr[largest];
      return sleep(280).then(function(){
        B.swapValues(chart, arr, i, largest, maxV);
        return sleep(200).then(function(){ return heapify(n, largest); });
      });
    }
    return Promise.resolve();
  }
  function run() {
    var n = arr.length;
    var i = Math.floor(n/2) - 1;
    hint.textContent = 'Строим max-heap...';
    function buildHeap() {
      if (i < 0) return Promise.resolve();
      return heapify(n, i).then(function(){ i--; return buildHeap(); });
    }
    return buildHeap().then(function() {
      var size = n - 1;
      function extract() {
        if (size <= 0) return Promise.resolve();
        hint.textContent = 'Извлекаем max: '+arr[0]+' → конец';
        B.swapValues(chart, arr, 0, size, maxV);
        B.setState(chart, size, 'success');
        return sleep(300).then(function(){
          return heapify(size, 0).then(function(){ size--; return extract(); });
        });
      }
      return extract();
    });
  }
  setTimeout(function(){ run().then(function(){ B.clearStates(chart); for(var k=0;k<arr.length;k++) B.setState(chart,k,'success'); hint.textContent='Отсортировано!'; }); },500);
})();
`);

// ── Linear Search ──
const linearSearchViz = sortVizBlock('anim-linear-search', 300, js`
(function(){
  var arr = [15, 42, 8, 23, 4, 16, 33, 51, 27, 9];
  var target = 33;
  var chart = document.getElementById('chart');
  var hint = document.getElementById('hint');
  var B = window.VizBars;
  B.render(chart, arr);
  hint.textContent = 'Ищем значение '+target;
  var i = 0;
  function step() {
    if (i >= arr.length) { hint.textContent = 'Не найдено!'; return; }
    B.clearStates(chart);
    B.setState(chart, i, 'compare');
    hint.textContent = 'Проверяем arr['+i+'] = '+arr[i]+' == '+target+'?';
    if (arr[i] === target) {
      setTimeout(function(){
        B.setState(chart, i, 'success');
        hint.textContent = 'Найдено! arr['+i+'] = '+target;
      }, 300);
      return;
    }
    setTimeout(function(){ B.setState(chart, i, 'fail'); i++; setTimeout(step, 250); }, 350);
  }
  setTimeout(step, 600);
})();
`);

// ── Binary Search ──
const binarySearchViz = sortVizBlock('anim-binary-search', 300, js`
(function(){
  var arr = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
  var target = 23;
  var chart = document.getElementById('chart');
  var hint = document.getElementById('hint');
  var B = window.VizBars;
  B.render(chart, arr);
  var lo = 0, hi = arr.length - 1;
  function step() {
    if (lo > hi) { hint.textContent = 'Не найдено!'; return; }
    var mid = Math.floor((lo + hi) / 2);
    B.clearStates(chart);
    for(var k=lo;k<=hi;k++) B.setState(chart,k,'active');
    B.setState(chart, mid, 'compare');
    hint.textContent = 'lo='+lo+' hi='+hi+' mid='+mid+' → arr['+mid+']='+arr[mid];
    setTimeout(function(){
      if (arr[mid] === target) {
        B.clearStates(chart);
        B.setState(chart, mid, 'success');
        hint.textContent = 'Найдено! arr['+mid+'] = '+target;
        return;
      }
      if (arr[mid] < target) {
        hint.textContent = arr[mid]+' < '+target+' → ищем правее';
        for(var k=lo;k<=mid;k++) B.setState(chart,k,'fail');
        lo = mid + 1;
      } else {
        hint.textContent = arr[mid]+' > '+target+' → ищем левее';
        for(var k=mid;k<=hi;k++) B.setState(chart,k,'fail');
        hi = mid - 1;
      }
      setTimeout(step, 500);
    }, 450);
  }
  setTimeout(step, 600);
})();
`);

// ── Counting / Radix sort (counting sort demo) ──
const countingSortViz = sortVizBlock('anim-counting-sort', 360, js`
(function(){
  var arr = [4, 2, 2, 8, 3, 3, 1, 7, 5, 4];
  var chart = document.getElementById('chart');
  var hint = document.getElementById('hint');
  var B = window.VizBars;
  B.render(chart, arr);
  var maxVal = B.maxOf(arr);
  var count = new Array(maxVal+1).fill(0);
  function sleep(ms){ return new Promise(function(r){setTimeout(r,ms);}); }
  function run(){
    var i = 0;
    function countPhase(){
      if(i>=arr.length){
        hint.textContent='Подсчёт завершён. Восстанавливаем массив...';
        return sleep(400).then(reconstruct);
      }
      B.clearStates(chart);
      B.setState(chart, i, 'active');
      count[arr[i]]++;
      hint.textContent='count['+arr[i]+']++ → '+count[arr[i]];
      i++;
      return sleep(350).then(countPhase);
    }
    var idx=0, val=0;
    function reconstruct(){
      if(val>maxVal){ B.clearStates(chart); for(var k=0;k<arr.length;k++) B.setState(chart,k,'success'); hint.textContent='Отсортировано!'; return; }
      if(count[val]<=0){ val++; return reconstruct(); }
      arr[idx]=val;
      count[val]--;
      B.refresh(chart,arr);
      B.setState(chart,idx,'active');
      hint.textContent='Ставим '+val+' на позицию '+idx;
      idx++;
      return sleep(280).then(reconstruct);
    }
    return countPhase();
  }
  setTimeout(function(){ run(); }, 500);
})();
`);


// ═══════════════════════════════════════════════════════════════════════════════
// GROUP 2 — GRAPH (SVG-based node + edge visualization)
// ═══════════════════════════════════════════════════════════════════════════════

const GRAPH_CSS = `
svg text{font-family:var(--viz-mono);font-size:12px;fill:var(--viz-text);text-anchor:middle;dominant-baseline:central;pointer-events:none;}
.g-edge{stroke:rgba(148,163,184,0.5);stroke-width:2;}
.g-edge--active{stroke:var(--viz-amber-top);stroke-width:3;}
.g-edge--done{stroke:var(--viz-green-top);stroke-width:3;}
.g-node{fill:var(--viz-blue-top);stroke:var(--viz-blue-border);stroke-width:2;}
.g-node--active{fill:var(--viz-amber-top);stroke:var(--viz-amber-border);}
.g-node--done{fill:var(--viz-green-top);stroke:var(--viz-green-border);}
.g-node--fail{fill:var(--viz-red-top);stroke:var(--viz-red-border);}
.g-weight{font-size:10px;fill:var(--viz-muted);}
`;

function graphVizBlock(id, height, jsCode) {
  return {
    id,
    type: 'animation',
    html: `<div class="viz-col"><div class="viz-hint" id="hint"></div><svg id="graph" width="100%" height="${(height||280)-40}" viewBox="0 0 460 ${(height||280)-60}"></svg></div>`,
    css: GRAPH_CSS,
    js: jsCode,
    width: '100%',
    height: height || 280,
    showPlayButton: true,
    vizLayout: 'default',
  };
}

// helper code that will be prepended to all graph JS
const GRAPH_HELPERS = js`
var svg = document.getElementById('graph');
var hint = document.getElementById('hint');
function svgEl(tag, attrs) {
  var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (var k in attrs) el.setAttribute(k, attrs[k]);
  return el;
}
function drawEdge(id, x1, y1, x2, y2, w) {
  var line = svgEl('line', {id:'e-'+id, x1:x1, y1:y1, x2:x2, y2:y2, class:'g-edge'});
  svg.insertBefore(line, svg.firstChild);
  if (w !== undefined) {
    var mx=(x1+x2)/2, my=(y1+y2)/2;
    var t = svgEl('text', {x:mx, y:my-8, class:'g-weight'});
    t.textContent = w;
    svg.appendChild(t);
  }
  return line;
}
function drawNode(id, x, y, label) {
  var c = svgEl('circle', {id:'n-'+id, cx:x, cy:y, r:18, class:'g-node'});
  svg.appendChild(c);
  var t = svgEl('text', {x:x, y:y});
  t.textContent = label;
  svg.appendChild(t);
  return c;
}
function setNodeClass(id, cls) {
  var el = document.getElementById('n-'+id);
  if(el) el.setAttribute('class', 'g-node' + (cls ? ' g-node--'+cls : ''));
}
function setEdgeClass(id, cls) {
  var el = document.getElementById('e-'+id);
  if(el) el.setAttribute('class', 'g-edge' + (cls ? ' g-edge--'+cls : ''));
}
function sleep(ms){ return new Promise(function(r){setTimeout(r,ms);}); }
`;

// ── BFS on Graph ──
const bfsGraphViz = graphVizBlock('anim-graph-bfs', 320, js`
(function(){
${GRAPH_HELPERS}
var nodes = [{id:0,x:60,y:50,l:'A'},{id:1,x:160,y:50,l:'B'},{id:2,x:260,y:50,l:'C'},{id:3,x:60,y:150,l:'D'},{id:4,x:160,y:150,l:'E'},{id:5,x:260,y:150,l:'F'},{id:6,x:360,y:100,l:'G'}];
var edges = [[0,1,'01'],[0,3,'03'],[1,2,'12'],[1,4,'14'],[2,6,'26'],[3,4,'34'],[4,5,'45'],[5,6,'56']];
var adj = {};
nodes.forEach(function(n){ adj[n.id] = []; });
edges.forEach(function(e){
  adj[e[0]].push(e[1]);
  adj[e[1]].push(e[0]);
  drawEdge(e[2], nodes[e[0]].x, nodes[e[0]].y, nodes[e[1]].x, nodes[e[1]].y);
});
nodes.forEach(function(n){ drawNode(n.id, n.x, n.y, n.l); });
var visited = {};
var queue = [0];
visited[0] = true;
setNodeClass(0, 'active');
hint.textContent = 'BFS: начинаем с вершины A';
function step() {
  if (queue.length === 0) { hint.textContent = 'BFS завершён — все вершины посещены'; return; }
  var cur = queue.shift();
  setNodeClass(cur, 'done');
  hint.textContent = 'Посещаем ' + nodes[cur].l + ', смотрим соседей';
  var neighbors = adj[cur].slice();
  var ni = 0;
  function visitNeighbor() {
    if (ni >= neighbors.length) { return sleep(300).then(step); }
    var nb = neighbors[ni];
    var eId = edges.find(function(e){ return (e[0]===cur&&e[1]===nb)||(e[0]===nb&&e[1]===cur); });
    if (eId) setEdgeClass(eId[2], 'active');
    if (!visited[nb]) {
      visited[nb] = true;
      queue.push(nb);
      setNodeClass(nb, 'active');
      hint.textContent = 'Добавляем ' + nodes[nb].l + ' в очередь';
    }
    ni++;
    return sleep(400).then(visitNeighbor);
  }
  return sleep(350).then(visitNeighbor);
}
setTimeout(function(){ step(); }, 600);
})();
`);

// ── DFS on Graph ──
const dfsGraphViz = graphVizBlock('anim-graph-dfs', 320, js`
(function(){
${GRAPH_HELPERS}
var nodes = [{id:0,x:60,y:50,l:'A'},{id:1,x:160,y:50,l:'B'},{id:2,x:260,y:50,l:'C'},{id:3,x:60,y:150,l:'D'},{id:4,x:160,y:150,l:'E'},{id:5,x:260,y:150,l:'F'},{id:6,x:360,y:100,l:'G'}];
var edges = [[0,1,'01'],[0,3,'03'],[1,2,'12'],[1,4,'14'],[2,6,'26'],[3,4,'34'],[4,5,'45'],[5,6,'56']];
var adj = {};
nodes.forEach(function(n){ adj[n.id] = []; });
edges.forEach(function(e){
  adj[e[0]].push(e[1]);
  adj[e[1]].push(e[0]);
  drawEdge(e[2], nodes[e[0]].x, nodes[e[0]].y, nodes[e[1]].x, nodes[e[1]].y);
});
nodes.forEach(function(n){ drawNode(n.id, n.x, n.y, n.l); });
var visited = {};
hint.textContent = 'DFS: начинаем с вершины A';
function dfs(cur) {
  visited[cur] = true;
  setNodeClass(cur, 'active');
  hint.textContent = 'Заходим в ' + nodes[cur].l;
  var neighbors = adj[cur].slice();
  var ni = 0;
  function visit() {
    if (ni >= neighbors.length) {
      setNodeClass(cur, 'done');
      hint.textContent = 'Вершина '+nodes[cur].l+' полностью обработана';
      return sleep(250);
    }
    var nb = neighbors[ni];
    ni++;
    var eId = edges.find(function(e){ return (e[0]===cur&&e[1]===nb)||(e[0]===nb&&e[1]===cur); });
    if (eId) setEdgeClass(eId[2], 'active');
    if (!visited[nb]) {
      return sleep(350).then(function(){ return dfs(nb).then(visit); });
    }
    return sleep(150).then(visit);
  }
  return sleep(350).then(visit);
}
setTimeout(function(){ dfs(0).then(function(){ hint.textContent='DFS завершён'; }); }, 600);
})();
`);

// ── Dijkstra ──
const dijkstraViz = graphVizBlock('anim-dijkstra', 340, js`
(function(){
${GRAPH_HELPERS}
var nodes=[{id:0,x:50,y:110,l:'S'},{id:1,x:150,y:40,l:'A'},{id:2,x:150,y:180,l:'B'},{id:3,x:280,y:40,l:'C'},{id:4,x:280,y:180,l:'D'},{id:5,x:400,y:110,l:'T'}];
var edges=[[0,1,'01',4],[0,2,'02',2],[1,2,'12',1],[1,3,'13',5],[2,4,'24',8],[3,5,'35',3],[4,5,'45',1],[3,4,'34',2]];
var adj={};
nodes.forEach(function(n){adj[n.id]=[];});
edges.forEach(function(e){
  adj[e[0]].push({to:e[1],w:e[3],eid:e[2]});
  adj[e[1]].push({to:e[0],w:e[3],eid:e[2]});
  drawEdge(e[2],nodes[e[0]].x,nodes[e[0]].y,nodes[e[1]].x,nodes[e[1]].y,e[3]);
});
nodes.forEach(function(n){drawNode(n.id,n.x,n.y,n.l);});
var INF=999, dist={}, done={};
nodes.forEach(function(n){dist[n.id]=INF;});
dist[0]=0;
hint.textContent='Dijkstra: старт из S, dist[S]=0';
function findMin(){
  var best=-1,bd=INF;
  for(var k in dist){ var id=Number(k); if(!done[id]&&dist[id]<bd){bd=dist[id];best=id;} }
  return best;
}
function step(){
  var u=findMin();
  if(u<0){hint.textContent='Все достижимые вершины обработаны';return;}
  done[u]=true;
  setNodeClass(u,'done');
  hint.textContent='Обрабатываем '+nodes[u].l+', dist='+dist[u];
  var nbrs=adj[u].slice(), ni=0;
  function relax(){
    if(ni>=nbrs.length) return sleep(300).then(step);
    var nb=nbrs[ni]; ni++;
    setEdgeClass(nb.eid,'active');
    var nd=dist[u]+nb.w;
    if(nd<dist[nb.to]){
      dist[nb.to]=nd;
      setNodeClass(nb.to,'active');
      hint.textContent='Релаксация: dist['+nodes[nb.to].l+']='+nd;
    }
    return sleep(380).then(function(){
      if(!done[nb.to]) setEdgeClass(nb.eid,'done');
      return relax();
    });
  }
  return sleep(350).then(relax);
}
setTimeout(function(){step();},600);
})();
`);

// ── Kruskal's MST ──
const kruskalViz = graphVizBlock('anim-kruskal', 340, js`
(function(){
${GRAPH_HELPERS}
var nodes=[{id:0,x:50,y:60,l:'A'},{id:1,x:170,y:30,l:'B'},{id:2,x:290,y:60,l:'C'},{id:3,x:50,y:180,l:'D'},{id:4,x:170,y:210,l:'E'},{id:5,x:290,y:180,l:'F'}];
var edges=[[0,1,'01',4],[0,3,'03',2],[1,2,'12',6],[1,4,'14',5],[2,5,'25',3],[3,4,'34',1],[4,5,'45',7]];
edges.forEach(function(e){
  drawEdge(e[2],nodes[e[0]].x,nodes[e[0]].y,nodes[e[1]].x,nodes[e[1]].y,e[3]);
});
nodes.forEach(function(n){drawNode(n.id,n.x,n.y,n.l);});
var parent={};
nodes.forEach(function(n){parent[n.id]=n.id;});
function find(x){return parent[x]===x?x:find(parent[x]);}
function union(a,b){parent[find(a)]=find(b);}
var sorted=edges.slice().sort(function(a,b){return a[3]-b[3];});
var ei=0, mstCount=0;
hint.textContent='Kruskal: рёбра отсортированы по весу';
function step(){
  if(ei>=sorted.length||mstCount>=nodes.length-1){hint.textContent='MST построено! ('+mstCount+' рёбер)';return;}
  var e=sorted[ei]; ei++;
  setEdgeClass(e[2],'active');
  hint.textContent='Ребро '+nodes[e[0]].l+'-'+nodes[e[1]].l+' (вес '+e[3]+')';
  return sleep(400).then(function(){
    if(find(e[0])===find(e[1])){
      hint.textContent='Цикл! Пропускаем '+nodes[e[0]].l+'-'+nodes[e[1]].l;
      setEdgeClass(e[2],'');
      return sleep(350).then(step);
    }
    union(e[0],e[1]);
    setEdgeClass(e[2],'done');
    setNodeClass(e[0],'done');
    setNodeClass(e[1],'done');
    mstCount++;
    hint.textContent='Добавляем '+nodes[e[0]].l+'-'+nodes[e[1]].l+' в MST';
    return sleep(400).then(step);
  });
}
setTimeout(function(){step();},600);
})();
`);

// ── Topological Sort ──
const topoSortViz = graphVizBlock('anim-toposort', 320, js`
(function(){
${GRAPH_HELPERS}
var nodes=[{id:0,x:50,y:100,l:'A'},{id:1,x:150,y:40,l:'B'},{id:2,x:150,y:160,l:'C'},{id:3,x:270,y:40,l:'D'},{id:4,x:270,y:160,l:'E'},{id:5,x:390,y:100,l:'F'}];
var edges=[[0,1,'01'],[0,2,'02'],[1,3,'13'],[2,4,'24'],[3,5,'35'],[4,5,'45'],[1,4,'14']];
edges.forEach(function(e){
  var n1=nodes[e[0]],n2=nodes[e[1]];
  var line=drawEdge(e[2],n1.x,n1.y,n2.x,n2.y);
  line.setAttribute('marker-end','url(#ah)');
});
var defs=svgEl('defs',{});
defs.innerHTML='<marker id="ah" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="rgba(148,163,184,0.7)"/></marker>';
svg.insertBefore(defs,svg.firstChild);
nodes.forEach(function(n){drawNode(n.id,n.x,n.y,n.l);});
var indegree={}, adj={};
nodes.forEach(function(n){indegree[n.id]=0;adj[n.id]=[];});
edges.forEach(function(e){adj[e[0]].push(e[1]);indegree[e[1]]++;});
var queue=[], result=[];
for(var k in indegree) if(indegree[k]===0) queue.push(Number(k));
queue.forEach(function(id){setNodeClass(id,'active');});
hint.textContent='Топо-сорт (Kahn): вершины без входящих рёбер';
function step(){
  if(queue.length===0){hint.textContent='Порядок: '+result.map(function(id){return nodes[id].l;}).join(' → ');return;}
  var u=queue.shift();
  setNodeClass(u,'done');
  result.push(u);
  hint.textContent='Извлекаем '+nodes[u].l+', порядок: '+result.map(function(id){return nodes[id].l;}).join(' → ');
  var nbrs=adj[u].slice(),ni=0;
  function relax(){
    if(ni>=nbrs.length) return sleep(350).then(step);
    var v=nbrs[ni]; ni++;
    indegree[v]--;
    var eId=edges.find(function(e){return e[0]===u&&e[1]===v;});
    if(eId) setEdgeClass(eId[2],'done');
    if(indegree[v]===0){queue.push(v);setNodeClass(v,'active');hint.textContent=nodes[v].l+' — все зависимости удовлетворены';}
    return sleep(320).then(relax);
  }
  return sleep(350).then(relax);
}
setTimeout(function(){step();},600);
})();
`);

// ── Floyd-Warshall ──
const floydViz = {
  id: 'anim-floyd-warshall',
  type: 'animation',
  html: `<div class="viz-col"><div class="viz-hint" id="hint"></div><div class="viz-grid" id="grid" style="grid-template-columns:repeat(5,1fr);max-width:360px;"></div></div>`,
  css: '.viz-grid .viz-cell{min-height:48px;font-size:13px;}',
  js: js`
(function(){
  var N=4;
  var INF=99;
  var labels=['A','B','C','D'];
  var dist=[[0,3,INF,7],[8,0,2,INF],[5,INF,0,1],[2,INF,INF,0]];
  var grid=document.getElementById('grid');
  var hint=document.getElementById('hint');
  grid.style.gridTemplateColumns='repeat('+(N+1)+',1fr)';
  function sleep(ms){return new Promise(function(r){setTimeout(r,ms);});}
  function render(ki,ii,ji){
    grid.innerHTML='';
    var hdr=document.createElement('div');hdr.className='viz-cell';hdr.innerHTML='<span class="viz-cell__main"></span>';grid.appendChild(hdr);
    for(var c=0;c<N;c++){var h=document.createElement('div');h.className='viz-cell';h.innerHTML='<span class="viz-cell__main">'+labels[c]+'</span>';grid.appendChild(h);}
    for(var i=0;i<N;i++){
      var rh=document.createElement('div');rh.className='viz-cell';rh.innerHTML='<span class="viz-cell__main">'+labels[i]+'</span>';grid.appendChild(rh);
      for(var j=0;j<N;j++){
        var d=document.createElement('div');
        var cls='viz-cell';
        if(i===ii&&j===ji) cls+=' viz-cell--compare';
        else if(i===ii||j===ji) cls+=' viz-cell--active';
        d.className=cls;
        d.innerHTML='<span class="viz-cell__main">'+(dist[i][j]>=INF?'∞':dist[i][j])+'</span>';
        grid.appendChild(d);
      }
    }
  }
  render(-1,-1,-1);
  hint.textContent='Floyd-Warshall: матрица кратчайших расстояний';
  function run(){
    var k=0;
    function loopK(){
      if(k>=N){hint.textContent='Готово! Все кратчайшие пути найдены';render(-1,-1,-1);return;}
      hint.textContent='Промежуточная вершина: '+labels[k];
      var i=0;
      function loopI(){
        if(i>=N){k++;return sleep(200).then(loopK);}
        var j=0;
        function loopJ(){
          if(j>=N){i++;return loopI();}
          if(i!==j&&i!==k&&j!==k){
            var nd=dist[i][k]+dist[k][j];
            render(k,i,j);
            if(nd<dist[i][j]){
              dist[i][j]=nd;
              hint.textContent=labels[i]+'→'+labels[j]+' через '+labels[k]+': '+nd+' < '+(dist[i][j]>=INF?'∞':dist[i][j]+nd-nd);
              render(k,i,j);
            }
          }
          j++;
          return sleep(180).then(loopJ);
        }
        return loopJ();
      }
      return loopI();
    }
    return sleep(500).then(loopK);
  }
  run();
})();
`,
  width: '100%',
  height: 360,
  showPlayButton: true,
  vizLayout: 'default',
};


// ═══════════════════════════════════════════════════════════════════════════════
// GROUP 3 — TREE (SVG-based)
// ═══════════════════════════════════════════════════════════════════════════════

const TREE_CSS = GRAPH_CSS;

function treeVizBlock(id, height, jsCode) {
  return {
    id,
    type: 'animation',
    html: `<div class="viz-col"><div class="viz-hint" id="hint"></div><svg id="tree" width="100%" height="${(height||300)-40}" viewBox="0 0 440 ${(height||300)-60}"></svg></div>`,
    css: TREE_CSS,
    js: jsCode,
    width: '100%',
    height: height || 300,
    showPlayButton: true,
    vizLayout: 'default',
  };
}

const TREE_HELPERS = js`
var svg = document.getElementById('tree');
var hint = document.getElementById('hint');
function svgEl(tag, attrs) {
  var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (var k in attrs) el.setAttribute(k, attrs[k]);
  return el;
}
function sleep(ms){ return new Promise(function(r){setTimeout(r,ms);}); }
function drawTreeEdge(px,py,cx,cy){
  var l=svgEl('line',{x1:px,y1:py,x2:cx,y2:cy,class:'g-edge'});
  svg.insertBefore(l,svg.firstChild);
  return l;
}
function drawTreeNode(id,x,y,val){
  var c=svgEl('circle',{id:'tn-'+id,cx:x,cy:y,r:18,class:'g-node'});
  svg.appendChild(c);
  var t=svgEl('text',{x:x,y:y});
  t.textContent=val;
  svg.appendChild(t);
}
function setTNodeClass(id,cls){
  var el=document.getElementById('tn-'+id);
  if(el) el.setAttribute('class','g-node'+(cls?' g-node--'+cls:''));
}
`;

// ── BST Insert + Search ──
const bstViz = treeVizBlock('anim-bst', 320, js`
(function(){
${TREE_HELPERS}
var vals=[8,3,10,1,6,14,4,7,13];
var tree=null;
var positions={};
function insert(node,v,x,y,dx){
  if(!node){
    var n={v:v,left:null,right:null,id:'n'+v};
    positions[n.id]={x:x,y:y};
    return n;
  }
  if(v<node.v){
    if(!node.left) drawTreeEdge(positions[node.id].x,positions[node.id].y,x-dx,y+50);
    node.left=insert(node.left,v,x-dx,y+50,dx*0.55);
  } else {
    if(!node.right) drawTreeEdge(positions[node.id].x,positions[node.id].y,x+dx,y+50);
    node.right=insert(node.right,v,x+dx,y+50,dx*0.55);
  }
  return node;
}
var vi=0;
function buildStep(){
  if(vi>=vals.length){
    hint.textContent='BST построено! Ищем значение 6...';
    return sleep(600).then(function(){return searchStep(tree,6);});
  }
  var v=vals[vi]; vi++;
  tree=insert(tree,v,220,30,100);
  var nid='n'+v;
  drawTreeNode(nid,positions[nid].x,positions[nid].y,v);
  setTNodeClass(nid,'active');
  hint.textContent='Вставляем '+v;
  return sleep(400).then(function(){setTNodeClass(nid,'');return buildStep();});
}
function searchStep(node,target){
  if(!node){hint.textContent='Не найдено!';return Promise.resolve();}
  var nid=node.id;
  setTNodeClass(nid,'active');
  hint.textContent='Сравниваем с '+node.v;
  return sleep(450).then(function(){
    if(target===node.v){setTNodeClass(nid,'done');hint.textContent='Найдено: '+target+'!';return Promise.resolve();}
    setTNodeClass(nid,'fail');
    if(target<node.v){hint.textContent=target+' < '+node.v+' → идём влево';return sleep(300).then(function(){return searchStep(node.left,target);});}
    hint.textContent=target+' > '+node.v+' → идём вправо';return sleep(300).then(function(){return searchStep(node.right,target);});
  });
}
setTimeout(function(){buildStep();},500);
})();
`);

// ── BFS Tree Traversal ──
const bfsTreeViz = treeVizBlock('anim-tree-bfs', 320, js`
(function(){
${TREE_HELPERS}
var layout=[
  {id:0,v:1,x:220,y:30},
  {id:1,v:2,x:120,y:90},{id:2,v:3,x:320,y:90},
  {id:3,v:4,x:70,y:150},{id:4,v:5,x:170,y:150},{id:5,v:6,x:270,y:150},{id:6,v:7,x:370,y:150}
];
var edges=[[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]];
edges.forEach(function(e){drawTreeEdge(layout[e[0]].x,layout[e[0]].y,layout[e[1]].x,layout[e[1]].y);});
layout.forEach(function(n){drawTreeNode(n.id,n.x,n.y,n.v);});
var children={0:[1,2],1:[3,4],2:[5,6],3:[],4:[],5:[],6:[]};
var queue=[0], result=[];
hint.textContent='BFS (обход в ширину): уровень за уровнем';
function step(){
  if(queue.length===0){hint.textContent='BFS порядок: '+result.map(function(id){return layout[id].v;}).join(' → ');return;}
  var cur=queue.shift();
  setTNodeClass(cur,'active');
  hint.textContent='Посещаем узел '+layout[cur].v;
  return sleep(400).then(function(){
    setTNodeClass(cur,'done');
    result.push(cur);
    children[cur].forEach(function(c){queue.push(c);setTNodeClass(c,'active');});
    return sleep(300).then(step);
  });
}
setTimeout(function(){step();},600);
})();
`);

// ── DFS Tree Traversal (inorder) ──
const dfsTreeViz = treeVizBlock('anim-tree-dfs', 320, js`
(function(){
${TREE_HELPERS}
var layout=[
  {id:0,v:4,x:220,y:30},
  {id:1,v:2,x:120,y:90},{id:2,v:6,x:320,y:90},
  {id:3,v:1,x:70,y:150},{id:4,v:3,x:170,y:150},{id:5,v:5,x:270,y:150},{id:6,v:7,x:370,y:150}
];
var edges=[[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]];
edges.forEach(function(e){drawTreeEdge(layout[e[0]].x,layout[e[0]].y,layout[e[1]].x,layout[e[1]].y);});
layout.forEach(function(n){drawTreeNode(n.id,n.x,n.y,n.v);});
var tree={id:0,left:{id:1,left:{id:3,left:null,right:null},right:{id:4,left:null,right:null}},right:{id:2,left:{id:5,left:null,right:null},right:{id:6,left:null,right:null}}};
var result=[];
hint.textContent='DFS inorder: лево → корень → право';
function inorder(node){
  if(!node) return Promise.resolve();
  setTNodeClass(node.id,'active');
  hint.textContent='Заходим в узел '+layout[node.id].v;
  return sleep(300).then(function(){
    return inorder(node.left).then(function(){
      setTNodeClass(node.id,'done');
      result.push(layout[node.id].v);
      hint.textContent='Посещаем '+layout[node.id].v+' → ['+result.join(', ')+']';
      return sleep(350);
    }).then(function(){
      return inorder(node.right);
    });
  });
}
setTimeout(function(){inorder(tree).then(function(){hint.textContent='Inorder: '+result.join(' → ');});},600);
})();
`);


// ═══════════════════════════════════════════════════════════════════════════════
// GROUP 4 — CELL / GRID (DP, Hash Table)
// ═══════════════════════════════════════════════════════════════════════════════

// ── DP: Grid Paths ──
const dpGridPathsViz = {
  id: 'anim-dp-grid-paths',
  type: 'animation',
  html: `<div class="viz-col"><div class="viz-hint" id="hint"></div><div class="viz-grid" id="grid" style="grid-template-columns:repeat(5,1fr);max-width:340px;"></div></div>`,
  css: '.viz-grid .viz-cell{min-height:52px;}',
  js: js`
(function(){
  var R=4,C=5;
  var dp=[];
  for(var i=0;i<R;i++){dp[i]=[];for(var j=0;j<C;j++) dp[i][j]=0;}
  var grid=document.getElementById('grid');
  var hint=document.getElementById('hint');
  grid.style.gridTemplateColumns='repeat('+C+',1fr)';
  function sleep(ms){return new Promise(function(r){setTimeout(r,ms);});}
  function render(ci,cj){
    grid.innerHTML='';
    for(var i=0;i<R;i++) for(var j=0;j<C;j++){
      var d=document.createElement('div');
      var cls='viz-cell';
      if(i===ci&&j===cj) cls+=' viz-cell--active';
      else if(dp[i][j]>0) cls+=' viz-cell--success';
      d.className=cls;
      d.innerHTML='<span class="viz-cell__main">'+(dp[i][j]||'')+'</span><span class="viz-cell__sub">['+i+','+j+']</span>';
      grid.appendChild(d);
    }
  }
  render(-1,-1);
  hint.textContent='DP: кол-во путей из [0,0] в [3,4], ходы вниз/вправо';
  var qi=0,qj=0;
  function step(){
    if(qi>=R){hint.textContent='Ответ: '+dp[R-1][C-1]+' путей';render(-1,-1);return;}
    if(qj>=C){qi++;qj=0;return step();}
    dp[qi][qj]=(qi===0||qj===0)?1:(dp[qi-1][qj]+dp[qi][qj-1]);
    render(qi,qj);
    hint.textContent='dp['+qi+']['+qj+'] = '+(qi===0||qj===0?'1 (край)':dp[qi-1][qj]+' + '+dp[qi][qj-1]+' = '+dp[qi][qj]);
    qj++;
    return sleep(280).then(step);
  }
  setTimeout(function(){step();},500);
})();
`,
  width: '100%',
  height: 340,
  showPlayButton: true,
  vizLayout: 'default',
};

// ── DP: Knapsack ──
const dpKnapsackViz = {
  id: 'anim-dp-knapsack',
  type: 'animation',
  html: `<div class="viz-col"><div class="viz-hint" id="hint"></div><div class="viz-badge" id="items"></div><div class="viz-grid" id="grid"></div></div>`,
  css: '.viz-grid .viz-cell{min-height:42px;font-size:12px;}',
  js: js`
(function(){
  var items=[{w:1,v:1},{w:3,v:4},{w:4,v:5},{w:5,v:7}];
  var W=7,n=items.length;
  var dp=[];
  for(var i=0;i<=n;i++){dp[i]=[];for(var j=0;j<=W;j++) dp[i][j]=0;}
  var grid=document.getElementById('grid');
  var hint=document.getElementById('hint');
  var itemsEl=document.getElementById('items');
  itemsEl.textContent='Предметы: '+items.map(function(it,i){return '('+(i+1)+': w='+it.w+' v='+it.v+')';}).join(' ');
  grid.style.gridTemplateColumns='repeat('+(W+2)+',1fr)';
  function sleep(ms){return new Promise(function(r){setTimeout(r,ms);});}
  function render(ci,cj){
    grid.innerHTML='';
    var hdr=document.createElement('div');hdr.className='viz-cell';hdr.innerHTML='<span class="viz-cell__main">i\\w</span>';grid.appendChild(hdr);
    for(var j=0;j<=W;j++){var h=document.createElement('div');h.className='viz-cell';h.innerHTML='<span class="viz-cell__main">'+j+'</span>';grid.appendChild(h);}
    for(var i=0;i<=n;i++){
      var rh=document.createElement('div');rh.className='viz-cell';rh.innerHTML='<span class="viz-cell__main">'+i+'</span>';grid.appendChild(rh);
      for(var j=0;j<=W;j++){
        var d=document.createElement('div');
        var cls='viz-cell';
        if(i===ci&&j===cj) cls+=' viz-cell--active';
        else if(dp[i][j]>0) cls+=' viz-cell--success';
        d.className=cls;
        d.innerHTML='<span class="viz-cell__main">'+dp[i][j]+'</span>';
        grid.appendChild(d);
      }
    }
  }
  render(-1,-1);
  hint.textContent='0/1 Knapsack: вместимость='+W;
  var qi=1,qj=0;
  function step(){
    if(qi>n){hint.textContent='Ответ: '+dp[n][W];render(-1,-1);return;}
    if(qj>W){qi++;qj=0;return step();}
    var it=items[qi-1];
    if(it.w>qj){dp[qi][qj]=dp[qi-1][qj];}
    else{dp[qi][qj]=Math.max(dp[qi-1][qj],dp[qi-1][qj-it.w]+it.v);}
    render(qi,qj);
    hint.textContent='dp['+qi+']['+qj+'] = '+dp[qi][qj];
    qj++;
    return sleep(180).then(step);
  }
  setTimeout(function(){step();},500);
})();
`,
  width: '100%',
  height: 360,
  showPlayButton: true,
  vizLayout: 'default',
};

// ── Hash Table (open chaining visualization) ──
const hashTableViz = {
  id: 'anim-hash-table',
  type: 'animation',
  html: `<div class="viz-col"><div class="viz-hint" id="hint"></div><div class="viz-row" id="buckets"></div></div>`,
  css: '',
  js: js`
(function(){
  var SIZE = 7;
  var keys = ['cat','dog','bird','fish','ant','bee','fox','owl'];
  var buckets = document.getElementById('buckets');
  var hint = document.getElementById('hint');
  var bucketData = [];
  for(var b=0;b<SIZE;b++){
    var el = document.createElement('div');
    el.className = 'viz-cell';
    el.innerHTML = '<span class="viz-cell__main">'+b+'</span><span class="viz-cell__sub">—</span>';
    buckets.appendChild(el);
    bucketData.push({el:el, items:[]});
  }
  function hash(s){var h=0;for(var i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))%SIZE;return h;}
  hint.textContent = 'Хеш-таблица: size='+SIZE+', hash = (key × 31) mod '+SIZE;
  var ki=0;
  function step(){
    if(ki>=keys.length){hint.textContent='Все ключи вставлены';return;}
    var k=keys[ki]; ki++;
    var idx=hash(k);
    bucketData.forEach(function(b){b.el.classList.remove('viz-cell--active','viz-cell--compare');});
    bucketData[idx].el.classList.add('viz-cell--active');
    bucketData[idx].items.push(k);
    bucketData[idx].el.querySelector('.viz-cell__sub').textContent=bucketData[idx].items.join(', ');
    hint.textContent='hash("'+k+'") = '+idx+(bucketData[idx].items.length>1?' (коллизия!)':'');
    setTimeout(function(){
      bucketData[idx].el.classList.remove('viz-cell--active');
      bucketData[idx].el.classList.add('viz-cell--success');
      setTimeout(step, 300);
    }, 500);
  }
  setTimeout(step, 600);
})();
`,
  width: '100%',
  height: 240,
  showPlayButton: true,
  vizLayout: 'default',
};


// ═══════════════════════════════════════════════════════════════════════════════
// GROUP 5 — STACK / QUEUE with push/pop animations
// ═══════════════════════════════════════════════════════════════════════════════

// ── Stack push/pop ──
const stackViz = {
  id: 'anim-stack-ops',
  type: 'animation',
  html: `<div class="viz-split"><div class="viz-panel"><div class="viz-caption">Стек</div><div class="viz-stack-v" id="stack"></div></div><div class="viz-panel"><div class="viz-caption">Операция</div><div class="viz-hint" id="hint"></div><div class="viz-badge" id="badge">top: —</div></div></div>`,
  css: '',
  js: js`
(function(){
  var stackEl=document.getElementById('stack');
  var hint=document.getElementById('hint');
  var badge=document.getElementById('badge');
  var ops=[{op:'push',v:10},{op:'push',v:20},{op:'push',v:30},{op:'push',v:40},{op:'pop'},{op:'pop'},{op:'push',v:50},{op:'pop'},{op:'pop'},{op:'pop'}];
  var stack=[];
  function render(){
    stackEl.innerHTML='';
    for(var i=stack.length-1;i>=0;i--){
      var el=document.createElement('div');
      el.className='viz-cell'+(i===stack.length-1?' viz-cell--active':'');
      el.innerHTML='<span class="viz-cell__main">'+stack[i]+'</span>';
      stackEl.appendChild(el);
    }
    badge.textContent='top: '+(stack.length?stack[stack.length-1]:'—');
  }
  var oi=0;
  function step(){
    if(oi>=ops.length){hint.textContent='Стек пуст, операции завершены';return;}
    var o=ops[oi]; oi++;
    if(o.op==='push'){
      stack.push(o.v);
      hint.textContent='push('+o.v+')';
    } else {
      var v=stack.pop();
      hint.textContent='pop() → '+v;
    }
    render();
    setTimeout(step, 600);
  }
  render();
  setTimeout(step, 500);
})();
`,
  width: '100%',
  height: 300,
  showPlayButton: true,
  vizLayout: 'tall',
};

// ── Queue enqueue/dequeue ──
const queueViz = {
  id: 'anim-queue-ops',
  type: 'animation',
  html: `<div class="viz-col"><div class="viz-caption">Очередь (FIFO)</div><div class="viz-hint" id="hint"></div><div class="viz-row viz-row--queue" id="queue"></div><div class="viz-badge" id="badge">front: — | back: —</div></div>`,
  css: '',
  js: js`
(function(){
  var queueEl=document.getElementById('queue');
  var hint=document.getElementById('hint');
  var badge=document.getElementById('badge');
  var ops=[{op:'enqueue',v:'A'},{op:'enqueue',v:'B'},{op:'enqueue',v:'C'},{op:'dequeue'},{op:'enqueue',v:'D'},{op:'enqueue',v:'E'},{op:'dequeue'},{op:'dequeue'},{op:'enqueue',v:'F'},{op:'dequeue'}];
  var q=[];
  function render(){
    queueEl.innerHTML='';
    q.forEach(function(v,i){
      var el=document.createElement('div');
      el.className='viz-cell'+(i===0?' viz-cell--success':'');
      el.innerHTML='<span class="viz-cell__main">'+v+'</span>';
      queueEl.appendChild(el);
    });
    badge.textContent='front: '+(q.length?q[0]:'—')+' | back: '+(q.length?q[q.length-1]:'—');
  }
  var oi=0;
  function step(){
    if(oi>=ops.length){hint.textContent='Операции завершены';return;}
    var o=ops[oi]; oi++;
    if(o.op==='enqueue'){
      q.push(o.v);
      hint.textContent='enqueue("'+o.v+'")';
    } else {
      var v=q.shift();
      hint.textContent='dequeue() → "'+v+'"';
    }
    render();
    setTimeout(step, 600);
  }
  render();
  setTimeout(step, 500);
})();
`,
  width: '100%',
  height: 240,
  showPlayButton: true,
  vizLayout: 'default',
};

// ── Recursion call stack (factorial) ── Already exists, enhanced version
const recursionStackViz = {
  id: 'anim-recursion-stack',
  type: 'animation',
  html: `<div class="viz-split"><div class="viz-panel"><div class="viz-caption">Стек вызовов</div><div class="viz-stack-v" id="stack"></div></div><div class="viz-panel"><div class="viz-caption">Рекурсия</div><div class="viz-hint" id="hint"></div><div class="viz-badge" id="badge">factorial(5)</div></div></div>`,
  css: '',
  js: js`
(function(){
  var stackEl=document.getElementById('stack');
  var hint=document.getElementById('hint');
  var badge=document.getElementById('badge');
  function sleep(ms){return new Promise(function(r){setTimeout(r,ms);});}
  var frames=[];
  function render(){
    stackEl.innerHTML='';
    for(var i=frames.length-1;i>=0;i--){
      var f=frames[i];
      var el=document.createElement('div');
      el.className='viz-cell'+(f.done?' viz-cell--success':i===frames.length-1?' viz-cell--active':'');
      el.innerHTML='<span class="viz-cell__main">f('+f.n+')</span><span class="viz-cell__sub">'+(f.done?'= '+f.result:'ожидание')+'</span>';
      stackEl.appendChild(el);
    }
  }
  function fact(n){
    frames.push({n:n,done:false,result:null});
    render();
    hint.textContent='Вызов factorial('+n+')';
    return sleep(450).then(function(){
      if(n<=1){
        frames[frames.length-1].done=true;
        frames[frames.length-1].result=1;
        hint.textContent='База: factorial('+n+') = 1';
        render();
        return sleep(350).then(function(){frames.pop();render();return 1;});
      }
      return fact(n-1).then(function(sub){
        var r=n*sub;
        frames[frames.length-1].done=true;
        frames[frames.length-1].result=r;
        hint.textContent=n+' × '+sub+' = '+r;
        render();
        return sleep(350).then(function(){frames.pop();render();return r;});
      });
    });
  }
  fact(5).then(function(ans){badge.textContent='Результат: '+ans;hint.textContent='Готово!';});
})();
`,
  width: '100%',
  height: 320,
  showPlayButton: true,
  vizLayout: 'tall',
};


// ═══════════════════════════════════════════════════════════════════════════════
// GROUP 6 — COMPLEXITY CHART (SVG curves for O(n))
// ═══════════════════════════════════════════════════════════════════════════════

const complexityChartViz = {
  id: 'anim-complexity-chart',
  type: 'animation',
  html: `<div class="viz-col"><div class="viz-hint" id="hint">Рост функций: O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ)</div><svg id="chart" width="100%" height="280" viewBox="0 0 440 280"></svg></div>`,
  css: `svg text{font-family:var(--viz-mono);font-size:10px;fill:var(--viz-muted);text-anchor:start;dominant-baseline:auto;}`,
  js: js`
(function(){
  var svg=document.getElementById('chart');
  var hint=document.getElementById('hint');
  function svgEl(tag,attrs){var el=document.createElementNS('http://www.w3.org/2000/svg',tag);for(var k in attrs)el.setAttribute(k,attrs[k]);return el;}
  var W=420,H=260,pad=40;
  var gw=W-pad*2, gh=H-pad*2;
  // axes
  var xAxis=svgEl('line',{x1:pad,y1:H-pad,x2:W-pad+5,y2:H-pad,stroke:'rgba(148,163,184,0.5)','stroke-width':'1.5'});
  svg.appendChild(xAxis);
  var yAxis=svgEl('line',{x1:pad,y1:pad-5,x2:pad,y2:H-pad,stroke:'rgba(148,163,184,0.5)','stroke-width':'1.5'});
  svg.appendChild(yAxis);
  var nLabel=svgEl('text',{x:W-pad+8,y:H-pad+4});nLabel.textContent='n';svg.appendChild(nLabel);
  var tLabel=svgEl('text',{x:pad-5,y:pad-10,'text-anchor':'end'});tLabel.textContent='T(n)';svg.appendChild(tLabel);
  var maxN=25, maxT=50;
  function px(n){return pad+(n/maxN)*gw;}
  function py(t){return (H-pad)-Math.min(t/maxT,1)*gh;}
  var funcs=[
    {name:'O(1)',color:'#60a5fa',fn:function(){return 1;}},
    {name:'O(log n)',color:'#a78bfa',fn:function(n){return n>0?Math.log2(n):0;}},
    {name:'O(n)',color:'#4ade80',fn:function(n){return n;}},
    {name:'O(n log n)',color:'#fbbf24',fn:function(n){return n>0?n*Math.log2(n):0;}},
    {name:'O(n²)',color:'#f87171',fn:function(n){return n*n;}},
    {name:'O(2ⁿ)',color:'#fb923c',fn:function(n){return Math.pow(2,n);}}
  ];
  maxT=funcs[4].fn(maxN);
  var lines=[];
  funcs.forEach(function(f,idx){
    var pts=[];
    for(var n=0;n<=maxN;n+=0.5){
      var t=f.fn(n);
      pts.push(px(n)+','+py(t));
    }
    var polyline=svgEl('polyline',{points:pts.join(' '),fill:'none',stroke:f.color,'stroke-width':'2.5','stroke-linecap':'round',opacity:'0'});
    svg.appendChild(polyline);
    var label=svgEl('text',{x:W-pad+5,y:py(f.fn(maxN))+4,fill:f.color,'font-size':'11px'});
    label.textContent=f.name;
    label.style.opacity='0';
    svg.appendChild(label);
    lines.push({polyline:polyline,label:label,f:f});
  });
  var li=0;
  function showNext(){
    if(li>=lines.length){hint.textContent='Чем выше кривая — тем медленнее алгоритм';return;}
    var l=lines[li]; li++;
    l.polyline.setAttribute('opacity','1');
    l.label.style.opacity='1';
    hint.textContent=l.f.name;
    setTimeout(showNext,550);
  }
  setTimeout(showNext,500);
})();
`,
  width: '100%',
  height: 320,
  showPlayButton: true,
  vizLayout: 'default',
};


// ═══════════════════════════════════════════════════════════════════════════════
// ADDITIONAL VISUALIZATIONS — Trie, Union-Find, Segment Tree, etc.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Trie ──
const trieViz = treeVizBlock('anim-trie', 340, js`
(function(){
${TREE_HELPERS}
var words=['cat','car','card','care','can'];
var nodeId=0;
var root={id:nodeId++,ch:{},x:220,y:25,c:''};
var allNodes=[root];
function addWord(word){
  var cur=root;
  for(var i=0;i<word.length;i++){
    var c=word[i];
    if(!cur.ch[c]){
      var dx=(Object.keys(cur.ch).length-0.5)*60;
      var newNode={id:nodeId++,ch:{},x:cur.x+dx,y:cur.y+55,c:c,parent:cur};
      cur.ch[c]=newNode;
      allNodes.push(newNode);
    }
    cur=cur.ch[c];
  }
  cur.end=true;
}
function layout(){
  var q=[root]; var level=0;
  while(q.length){
    var next=[];
    var w=400;
    var step=w/(q.length+1);
    q.forEach(function(n,i){
      n.x=20+step*(i+1);
      n.y=25+level*55;
      for(var k in n.ch) next.push(n.ch[k]);
    });
    level++;
    q=next;
  }
}
function drawAll(){
  svg.innerHTML='';
  allNodes.forEach(function(n){
    if(n.parent) drawTreeEdge(n.parent.x,n.parent.y,n.x,n.y);
  });
  allNodes.forEach(function(n){
    drawTreeNode(n.id,n.x,n.y,n.c||'·');
  });
}
hint.textContent='Trie: вставляем слова с общим префиксом';
var wi=0;
function step(){
  if(wi>=words.length){hint.textContent='Trie построено: '+words.join(', ');allNodes.forEach(function(n){setTNodeClass(n.id,'done');});return;}
  var w=words[wi]; wi++;
  addWord(w);
  layout();
  drawAll();
  hint.textContent='Вставляем "'+w+'"';
  var cur=root;
  for(var i=0;i<w.length;i++){setTNodeClass(cur.ch[w[i]].id,'active');cur=cur.ch[w[i]];}
  return sleep(550).then(function(){
    allNodes.forEach(function(n){setTNodeClass(n.id,'');});
    return sleep(200).then(step);
  });
}
setTimeout(function(){step();},500);
})();
`);

// ── Union-Find / DSU ──
const dsuViz = graphVizBlock('anim-dsu', 320, js`
(function(){
${GRAPH_HELPERS}
var N=8;
var positions=[];
for(var i=0;i<N;i++) positions.push({x:30+i*55,y:80});
var parent=[];
for(var i=0;i<N;i++) parent.push(i);
positions.forEach(function(p,i){drawNode(i,p.x,p.y,String(i));});
function find(x){return parent[x]===x?x:find(parent[x]);}
function union(a,b){
  var ra=find(a),rb=find(b);
  if(ra===rb) return false;
  parent[ra]=rb;
  return true;
}
var ops=[[0,1],[2,3],[4,5],[6,7],[1,3],[5,7],[3,7]];
hint.textContent='Union-Find: объединяем множества';
var oi=0;
function step(){
  if(oi>=ops.length){hint.textContent='Все элементы в одном множестве!';for(var i=0;i<N;i++) setNodeClass(i,'done');return;}
  var o=ops[oi]; oi++;
  setNodeClass(o[0],'active');
  setNodeClass(o[1],'active');
  hint.textContent='union('+o[0]+', '+o[1]+')';
  var merged=union(o[0],o[1]);
  if(!merged) hint.textContent+==' — уже в одном множестве';
  else drawEdge('e'+oi,positions[o[0]].x,positions[o[0]].y,positions[o[1]].x,positions[o[1]].y);
  return sleep(500).then(function(){
    setNodeClass(o[0],'');setNodeClass(o[1],'');
    return sleep(200).then(step);
  });
}
setTimeout(function(){step();},600);
})();
`);


// ═══════════════════════════════════════════════════════════════════════════════
// MAP: article_id → animation blocks to inject
// ═══════════════════════════════════════════════════════════════════════════════

// ── Массив: значения и индексы ──
const arrayViz = {
  id: 'anim-array-basics',
  type: 'animation',
  html: `<div class="viz-col"><div class="viz-caption">Массив: значение и индекс</div><div class="viz-hint" id="hint"></div><div class="viz-row" id="arr"></div></div>`,
  css: '',
  js: js`
(function(){
  var arr=[4,8,1,7,3,9];
  var root=document.getElementById('arr');
  var hint=document.getElementById('hint');
  var nodes=[];
  arr.forEach(function(v,i){
    var el=document.createElement('div');
    el.className='viz-cell';
    el.innerHTML='<span class="viz-cell__main">'+v+'</span><span class="viz-cell__sub">i = '+i+'</span>';
    root.appendChild(el);
    nodes.push(el);
  });
  hint.textContent='Линейный проход по элементам';
  var i=0;
  function tick(){
    nodes.forEach(function(n){n.classList.remove('viz-cell--active');});
    nodes[i].classList.add('viz-cell--active');
    hint.textContent='Шаг '+(i+1)+'/'+arr.length+' — элемент '+arr[i]+' (индекс '+i+')';
    i=(i+1)%arr.length;
  }
  tick();
  setInterval(tick, 800);
})();
`,
  width: '100%',
  height: 220,
  showPlayButton: true,
  vizLayout: 'default',
};

// ── Fibonacci memoization (для rekursiya-sequences) ──
const fibMemoViz = {
  id: 'anim-fib-memo',
  type: 'animation',
  html: `<div class="viz-col"><div class="viz-caption">Мемоизация Фибоначчи</div><div class="viz-hint" id="hint"></div><div class="viz-grid" id="grid" style="grid-template-columns:repeat(8,1fr);max-width:400px;"></div></div>`,
  css: '.viz-grid .viz-cell{min-height:48px;}',
  js: js`
(function(){
  var n=7;
  var memo=new Array(n+1).fill(undefined);
  var grid=document.getElementById('grid');
  var hint=document.getElementById('hint');
  var cur=-1;
  function paint(){
    grid.innerHTML='';
    for(var i=0;i<=n;i++){
      var c=document.createElement('div');
      c.className='viz-cell'+(memo[i]!==undefined?' viz-cell--success':'')+(i===cur?' viz-cell--active':'');
      c.innerHTML='<span class="viz-cell__sub">i='+i+'</span><span class="viz-cell__main">'+(memo[i]===undefined?'?':memo[i])+'</span>';
      grid.appendChild(c);
    }
  }
  function sleep(ms){return new Promise(function(r){setTimeout(r,ms);});}
  function fib(k){
    return sleep(280).then(function(){
      cur=k; paint();
      hint.textContent='Запрос F('+k+')';
      return sleep(280).then(function(){
        if(k<=1){memo[k]=k;paint();hint.textContent='База: F('+k+') = '+k;return sleep(240).then(function(){return memo[k];});}
        if(memo[k]!==undefined){hint.textContent='В таблице: F('+k+') = '+memo[k];return sleep(220).then(function(){return memo[k];});}
        hint.textContent='F('+k+') = F('+(k-1)+') + F('+(k-2)+')';
        return fib(k-1).then(function(a){return fib(k-2).then(function(b){
          memo[k]=a+b;paint();hint.textContent='F('+k+') = '+memo[k];
          return sleep(260).then(function(){return memo[k];});
        });});
      });
    });
  }
  paint();
  fib(n).then(function(){cur=-1;paint();hint.textContent='Готово: F('+n+') = '+memo[n];});
})();
`,
  width: '100%',
  height: 280,
  showPlayButton: true,
  vizLayout: 'default',
};

// ── Merge Sort stages (divide & conquer) ──
const divideConquerViz = {
  id: 'anim-divide-conquer',
  type: 'animation',
  html: `<div class="viz-col"><div class="viz-caption">Merge Sort — деление и слияние</div><div class="viz-hint" id="hint"></div><div id="levels" style="display:flex;flex-direction:column;gap:10px;width:100%;align-items:center;"></div></div>`,
  css: '',
  js: js`
(function(){
  var stages=[
    {hint:'Исходный массив',parts:[[5,3,8,1,4,7,2,6]]},
    {hint:'Делим пополам',parts:[[5,3,8,1],[4,7,2,6]]},
    {hint:'Делим ещё',parts:[[5,3],[8,1],[4,7],[2,6]]},
    {hint:'Одиночные элементы',parts:[[5],[3],[8],[1],[4],[7],[2],[6]]},
    {hint:'Сливаем пары',parts:[[3,5],[1,8],[4,7],[2,6]]},
    {hint:'Сливаем четвёрки',parts:[[1,3,5,8],[2,4,6,7]]},
    {hint:'Финальное слияние',parts:[[1,2,3,4,5,6,7,8]]}
  ];
  var hint=document.getElementById('hint');
  var levelsEl=document.getElementById('levels');
  function sleep(ms){return new Promise(function(r){setTimeout(r,ms);});}
  function render(parts){
    levelsEl.innerHTML='';
    var row=document.createElement('div');
    row.style.cssText='display:flex;gap:8px;justify-content:center;flex-wrap:wrap;';
    parts.forEach(function(sub){
      var g=document.createElement('div');g.className='viz-group';
      sub.forEach(function(x){
        var c=document.createElement('div');c.className='viz-cell';
        c.innerHTML='<span class="viz-cell__main">'+x+'</span>';
        g.appendChild(c);
      });
      row.appendChild(g);
    });
    levelsEl.appendChild(row);
  }
  var i=0;
  function next(){
    if(i>=stages.length) return;
    hint.textContent=stages[i].hint;
    render(stages[i].parts);
    i++;
    return sleep(700).then(next);
  }
  next();
})();
`,
  width: '100%',
  height: 300,
  showPlayButton: true,
  vizLayout: 'tall',
};

const ARTICLE_VIZ_MAP = {
  // ── ОСНОВЫ ──
  'osnovy-arrays-strings': [arrayViz],
  'osnovy-complexity': [complexityChartViz],

  // ── ХЕШИ ──
  'osnovy-hashtable': [hashTableViz],

  // ── СТЕК И ОЧЕРЕДЬ ──
  'osnovy-stack-queue': [stackViz, queueViz],

  // ── РЕКУРСИЯ ──
  'rekursiya-basic-examples': [recursionStackViz],
  'rekursiya-sequences': [fibMemoViz],
  'rekursiya-divide-conquer': [divideConquerViz],

  // ── СОРТИРОВКИ ──
  'sortirovki-n2-simple': [bubbleSortViz, selectionSortViz, insertionSortViz],
  'sortirovki-quicksort': [quickSortViz],
  'sortirovki-merge': [mergeSortViz],
  'sortirovki-heapsort': [heapSortViz],
  'sortirovki-counting-radix': [countingSortViz],

  // ── ПОИСК ──
  'poisk-linear': [linearSearchViz],
  'poisk-binary': [binarySearchViz],

  // ── ДЕРЕВЬЯ ──
  'der-basic': [bstViz],
  'der-bfs': [bfsTreeViz],
  'der-dfs': [dfsTreeViz],

  // ── ГРАФЫ ──
  'graf-traversal': [bfsGraphViz, dfsGraphViz],
  'graf-shortest': [dijkstraViz],
  'graf-mst': [kruskalViz],
  'graf-topo': [topoSortViz],
  'graf-floydw': [floydViz],

  // ── DP ──
  'dp-basics': [dpGridPathsViz],
  'dp-knapsack': [dpKnapsackViz],

  // ── Доп. структуры ──
  'str-trie': [trieViz],
  'str-dsu': [dsuViz],
};


// ═══════════════════════════════════════════════════════════════════════════════
// PATCH db.json
// ═══════════════════════════════════════════════════════════════════════════════

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
let added = 0;

for (const article of db.articles) {
  const vizBlocks = ARTICLE_VIZ_MAP[article.id];
  if (!vizBlocks) continue;

  // Remove existing animation blocks with same ids to avoid duplicates
  const existingAnimIds = new Set(vizBlocks.map(b => b.id));
  article.blocks = article.blocks.filter(b => !(b.type === 'animation' && existingAnimIds.has(b.id)));

  // Insert animation blocks before the last paragraph/heading, or at end
  for (const viz of vizBlocks) {
    article.blocks.push(viz);
    added++;
  }
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2) + '\n', 'utf8');
console.log(`Added ${added} animation blocks to ${Object.keys(ARTICLE_VIZ_MAP).length} articles.`);
