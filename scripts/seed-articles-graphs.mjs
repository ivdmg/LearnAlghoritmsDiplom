/** Статьи по теме «Графы» — развёрнутые */

const link = (id, text, href) => ({
  id,
  type: 'link',
  text,
  href,
  target: href.startsWith('http') ? '_blank' : '_self',
});

export const articles = [
  {
    id: 'graf-repr',
    topicId: 'grafy',
    subtopicId: 'st-graf-1',
    title: 'Представление графа: список смежности и матрица',
    blocks: [
      { id: 'g1-h1', type: 'heading', level: 1, text: 'Граф — это «связи между точками»' },
      {
        id: 'g1-p1',
        type: 'paragraph',
        text: 'Вершины (nodes) — объекты: города, страницы сайта, задачи. Рёбра (edges) — связи: дорога между городами, ссылка между страницами, «A должна выполниться до B». Граф может быть направленным (стрелка в одну сторону) или ненаправленным (дружба в соцсети — оба друга друг другу).',
      },
      {
        id: 'g1-p2',
        type: 'paragraph',
        text: 'Первый практический вопрос: как хранить это в памяти? Два главных ответа — список смежности и матрица смежности. Выбор зависит от того, насколько граф «густой» (много рёбер) и какие операции нужны чаще.',
      },
      { id: 'g1-h2', type: 'heading', level: 2, text: 'Список смежности' },
      {
        id: 'g1-p3',
        type: 'paragraph',
        text: 'Для каждой вершины держим массив соседей. Память O(V + E): каждое ребро записано один раз (или дважды, если ненаправленный граф и вы кладёте u→v и v→u). Обход соседей вершины v — O(степень v). Это стандарт для большинства задач на олимпиадах и в продакшене.',
      },
      {
        id: 'g1-c1',
        type: 'code',
        language: 'js',
        editable: false,
        code: `const V = 5;
const g = Array.from({ length: V }, () => []);

// ориентированное ребро u -> v
function addEdge(u, v, w = 1) {
  g[u].push({ to: v, w }); // можно хранить просто v, если вес не нужен
}

// ненаправленное: добавляем в обе стороны
function addUndirected(u, v, w = 1) {
  g[u].push({ to: v, w });
  g[v].push({ to: u, w });
}`,
      },
      { id: 'g1-h3', type: 'heading', level: 2, text: 'Матрица смежности' },
      {
        id: 'g1-p4',
        type: 'paragraph',
        text: 'Таблица V×V: в ячейке (i,j) — вес ребра или 0/∞, если ребра нет. Проверка «есть ли ребро» за O(1), но память O(V²), и чтобы перечислить всех соседей i, иногда приходится пробежать все V столбцов. Удобно при маленьком V или для Floyd–Warshall.',
      },
      {
        id: 'g1-c2',
        type: 'code',
        language: 'js',
        editable: false,
        code: `const n = 4;
const INF = Infinity;
// dist[i][j] — вес ребра i→j или INF
const dist = Array.from({ length: n }, () => Array(n).fill(INF));
for (let i = 0; i < n; i++) dist[i][i] = 0;`,
      },
      {
        id: 'g1-p5',
        type: 'paragraph',
        text: 'Практическое правило: разреженный граф (мало рёбер относительно V²) — почти всегда список смежности. Плотный или алгоритм «все пары вершин» на маленьком n — смотрите на матрицу.',
      },
      link('g1-l1', 'Граф (математика) — Википедия', 'https://ru.wikipedia.org/wiki/Граф_(математика)'),
    ],
  },
  {
    id: 'graf-traversal',
    topicId: 'grafy',
    subtopicId: 'st-graf-2',
    title: 'DFS и BFS на графе',
    blocks: [
      { id: 'g2-h1', type: 'heading', level: 1, text: 'В дереве не было циклов — в графе они есть' },
      {
        id: 'g2-p1',
        type: 'paragraph',
        text: 'Если обойти граф «как дерево» без осторожности, можно ходить кругами бесконечно. Поэтому нужен массив или множество visited: вершина уже была — не заходим снова (в обучающем DFS; в некоторых задачах с весами рёбер правила другие).',
      },
      { id: 'g2-h2', type: 'heading', level: 2, text: 'DFS — углубляемся' },
      {
        id: 'g2-p2',
        type: 'paragraph',
        text: 'Рекурсия или явный стек. Удобно для поиска пути, топосорта на DAG, классификации рёбер. Время O(V + E): каждую вершину и каждое ребро смотрим ограниченное число раз.',
      },
      {
        id: 'g2-c1',
        type: 'code',
        language: 'js',
        editable: false,
        code: `function dfs(g, start, visit) {
  const seen = new Set();
  function go(v) {
    if (seen.has(v)) return;
    seen.add(v);
    visit(v);
    for (const to of g[v]) go(to);
  }
  go(start);
}`,
      },
      { id: 'g2-h3', type: 'heading', level: 2, text: 'BFS — волна' },
      {
        id: 'g2-p3',
        type: 'paragraph',
        text: 'Очередь. Стартуем с s, помечаем расстояние 0, соседям — 1, их соседям ещё не помеченным — 2 и т.д. В невзвешенном графе это кратчайшие пути по числу рёбер.',
      },
      {
        id: 'g2-c2',
        type: 'code',
        language: 'js',
        editable: false,
        code: `function bfs(g, start, visit) {
  const seen = new Set([start]);
  const q = [start];
  while (q.length) {
    const v = q.shift();
    visit(v);
    for (const to of g[v]) {
      if (!seen.has(to)) {
        seen.add(to);
        q.push(to);
      }
    }
  }
}`,
      },
      {
        id: 'g2-c3',
        type: 'code',
        language: 'js',
        editable: false,
        code: `/** расстояния от start (нерешённые = -1) */
function bfsDist(g, start) {
  const n = g.length;
  const dist = new Array(n).fill(-1);
  const q = [start];
  dist[start] = 0;
  while (q.length) {
    const v = q.shift();
    for (const to of g[v]) {
      if (dist[to] === -1) {
        dist[to] = dist[v] + 1;
        q.push(to);
      }
    }
  }
  return dist;
}`,
      },
      {
        id: 'g2-p4',
        type: 'paragraph',
        text: 'Счётчик компонент связности: перебираем все вершины; если ещё не visited — запускаем DFS/BFS и увеличиваем ответ на 1.',
      },
      {
        id: 'g2-anim',
        type: 'animation',
        html:
          '<div class="viz-col"><div class="viz-caption">BFS: слои расстояний (чем выше столбец — тем «дальше» от старта)</div><div class="viz-hint" id="g2-h"></div><div class="viz-chart" id="g2-ch"></div></div>',
        css: '',
        js: `(function(){
  var chart=document.getElementById('g2-ch');
  var hint=document.getElementById('g2-h');
  var dist=[0,1,1,2,2,2,3];
  var maxV=VizBars.maxOf(dist);
  VizBars.render(chart,dist,{max:maxV||1});
  hint.textContent='Старт в 0; соседи на расстоянии 1, потом 2…';
  var i=0;
  setInterval(function(){
    VizBars.clearStates(chart);
    VizBars.setState(chart,i,'active');
    hint.textContent='Вершина '+i+', расстояние '+dist[i];
    i=(i+1)%dist.length;
  },750);
})();`,
        width: '100%',
        height: 230,
        showPlayButton: true,
        vizLayout: 'default',
      },
      link(
        'g2-l1',
        'Обход графа — Википедия',
        'https://ru.wikipedia.org/wiki/Обход_графа',
      ),
    ],
  },
  {
    id: 'graf-topo',
    topicId: 'grafy',
    subtopicId: 'st-graf-3',
    title: 'Топологическая сортировка',
    blocks: [
      { id: 'g3-h1', type: 'heading', level: 1, text: 'В каком порядке готовить блюда, если есть рецепт?' },
      {
        id: 'g3-p1',
        type: 'paragraph',
        text: 'Сначала нарежьте овощи, потом обжарьте, потом добавьте соус. Если нарисовать стрелки «A до B», получится направленный граф. Топологический порядок — линейный список всех шагов так, что каждая стрелка идёт слева направо. Такой порядок бывает только если нет циклов (иначе «яйцо и курица» навсегда).',
      },
      { id: 'g3-h2', type: 'heading', level: 2, text: 'Алгоритм Кана — как «снимать» задачи без входящих' },
      {
        id: 'g3-p2',
        type: 'paragraph',
        text: 'Считаем для каждой вершины сколько рёбер на неё указывает (in-degree). Все с нулём готовы к выполнению — кладём в очередь. Вынимаем одну, «убираем» её исходящие рёбра (уменьшаем in-degree соседей). Появились новые нули — в очередь. Если в конце обработали меньше V вершин — в графе цикл.',
      },
      {
        id: 'g3-c1',
        type: 'code',
        language: 'js',
        editable: false,
        code: `function topologicalSortKahn(g) {
  const n = g.length;
  const indeg = new Array(n).fill(0);
  for (let u = 0; u < n; u++) for (const v of g[u]) indeg[v]++;
  const q = [];
  for (let i = 0; i < n; i++) if (indeg[i] === 0) q.push(i);
  const order = [];
  while (q.length) {
    const u = q.shift();
    order.push(u);
    for (const v of g[u]) {
      if (--indeg[v] === 0) q.push(v);
    }
  }
  return order.length === n ? order : null;
}`,
      },
      { id: 'g3-h3', type: 'heading', level: 2, text: 'DFS-версия (постфикс + разворот)' },
      {
        id: 'g3-p3',
        type: 'paragraph',
        text: 'Красят вершины: белый — не видели, серый — в текущем стеке DFS, чёрный — обработали. Если из серого ушли в другого серого — нашли обратное ребро, значит цикл. Иначе после обхода поддерева кладём вершину в массив и в конце разворачиваем — получится топопорядок.',
      },
      {
        id: 'g3-p4',
        type: 'paragraph',
        text: 'Где в жизни: сборка проекта, порядок курсов в университете, планирование задач. Если null — нужно искать и ломать цикл или менять модель.',
      },
      {
        id: 'g3-anim',
        type: 'animation',
        html:
          '<div class="viz-col"><div class="viz-caption">In-degree падает до нуля — вершина «готова»</div><div class="viz-hint" id="g3-h"></div><div class="viz-row" id="g3-r"></div></div>',
        css: '',
        js: `(function(){
  var row=document.getElementById('g3-r');
  var hint=document.getElementById('g3-h');
  var steps=['A:0','B:0','C:1→0','D:1→0'];
  var i=0;
  function tick(){
    row.innerHTML='';
    var d=document.createElement('div');
    d.className='viz-cell viz-cell--shown';
    d.innerHTML='<span class="viz-cell__main">'+steps[i]+'</span><span class="viz-cell__sub">очередь Кана</span>';
    row.appendChild(d);
    hint.textContent='Сначала берём вершины без зависимостей, потом «освобождаем» соседей';
    i=(i+1)%steps.length;
  }
  tick();
  setInterval(tick,1000);
})();`,
        width: '100%',
        height: 180,
        showPlayButton: true,
        vizLayout: 'default',
      },
      link(
        'g3-l1',
        'Топологическая сортировка — Википедия',
        'https://ru.wikipedia.org/wiki/Топологическая_сортировка',
      ),
    ],
  },
  {
    id: 'graf-shortest',
    topicId: 'grafy',
    subtopicId: 'st-graf-4',
    title: 'Кратчайшие пути: Дейкстра и Беллман–Форд',
    blocks: [
      { id: 'g4-h1', type: 'heading', level: 1, text: 'Карта с дорогами разной длины' },
      {
        id: 'g4-p1',
        type: 'paragraph',
        text: 'Каждому ребру дали вес (время, деньги, километры). Нужно минимизировать сумму по пути. Если все веса неотрицательны — классика Дейкстры: жадно берём вершину с текущей лучшей оценкой и обновляем соседей («релаксация»: нашли короче — записали).',
      },
      {
        id: 'g4-p2',
        type: 'paragraph',
        text: 'Дейкстра с кучей (priority queue) даёт O((V+E) log V). Важно: один отрицательный вес может сломать жадность — тогда другие методы.',
      },
      {
        id: 'g4-c1',
        type: 'code',
        language: 'js',
        editable: false,
        code: `/** Простейшая Дейкстра O(V²) — без кучи, для плотных графов терпимо при малых V */
function dijkstraNaive(adj, src) {
  const n = adj.length;
  const dist = new Array(n).fill(Infinity);
  const used = new Array(n).fill(false);
  dist[src] = 0;
  for (let it = 0; it < n; it++) {
    let v = -1;
    for (let i = 0; i < n; i++)
      if (!used[i] && (v < 0 || dist[i] < dist[v])) v = i;
    if (dist[v] === Infinity) break;
    used[v] = true;
    for (const { to, w } of adj[v]) {
      if (dist[v] + w < dist[to]) dist[to] = dist[v] + w;
    }
  }
  return dist;
}`,
      },
      {
        id: 'g4-h2', type: 'heading', level: 2, text: 'Беллман–Форд: терпеливо улучшаем все рёбра' },
      {
        id: 'g4-p3',
        type: 'paragraph',
        text: 'Делаем до V−1 проходов: для каждого ребра (u,v,w) пробуем улучшить dist[v] через dist[u]+w. Интуиция: за один проход путь может удлиниться на одно ребро, за V−1 проходов учтём путь из не более чем V−1 ребра. Ещё один проход: если что-то улучшилось — есть цикл отрицательного веса.',
      },
      {
        id: 'g4-c2',
        type: 'code',
        language: 'js',
        editable: false,
        code: `function bellmanFord(edges, n, src) {
  const dist = new Array(n).fill(Infinity);
  dist[src] = 0;
  for (let k = 0; k < n - 1; k++) {
    for (const [u, v, w] of edges) {
      if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;
    }
  }
  for (const [u, v, w] of edges) {
    if (dist[u] + w < dist[v]) return { dist: null, negCycle: true };
  }
  return { dist, negCycle: false };
}`,
      },
      {
        id: 'g4-anim',
        type: 'animation',
        html:
          '<div class="viz-col"><div class="viz-caption">Релаксация: оценки расстояний улучшаются</div><div class="viz-hint" id="g4-hint"></div><div class="viz-chart" id="g4-ch"></div></div>',
        css: '',
        js: `(function(){
  var chart=document.getElementById('g4-ch');
  var hint=document.getElementById('g4-hint');
  var vis=[0,2,8,12,20];
  var maxV=VizBars.maxOf(vis);
  VizBars.render(chart,vis,{max:maxV});
  hint.textContent='Условные «лучшие известные» расстояния до вершин';
  setTimeout(function(){
    vis=[0,2,5,9,14];
    VizBars.refresh(chart,vis,{max:VizBars.maxOf(vis)});
    hint.textContent='После релаксаций нашли более короткие пути';
  },1400);
})();`,
        width: '100%',
        height: 230,
        showPlayButton: true,
        vizLayout: 'default',
      },
      {
        id: 'g4-p4',
        type: 'paragraph',
        text: 'Шпаргалка: неотрицательные веса — Дейкстра; допускаем отрицательные, но без отрицательных циклов на пути — Беллман–Форд; все пары вершин на маленьком n — Floyd–Warshall.',
      },
      link(
        'g4-l1',
        'Алгоритм Дейкстры — Википедия',
        'https://ru.wikipedia.org/wiki/Алгоритм_Дейкстры',
      ),
    ],
  },
  {
    id: 'graf-mst',
    topicId: 'grafy',
    subtopicId: 'st-graf-5',
    title: 'Минимальное остовное дерево: Краскал и Прим',
    blocks: [
      { id: 'g5-h1', type: 'heading', level: 1, text: 'Соединить все города дорогами как можно дешевле' },
      {
        id: 'g5-p1',
        type: 'paragraph',
        text: 'Граф связный, рёбра с ценой. Нужно выбрать подмножество рёбер без циклов, чтобы все вершины были достижимы, а сумма весов минимальна. Это минимальное остовное дерево (MST). Рёбер ровно V−1.',
      },
      {
        id: 'g5-p2',
        type: 'paragraph',
        text: 'Свойство отсечения (неформально): самое дешёвое ребро, пересекающее разрез «уже внутри / ещё снаружи», можно смело брать в MST. Отсюда две жадные схемы.',
      },
      { id: 'g5-h2', type: 'heading', level: 2, text: 'Краскал' },
      {
        id: 'g5-p3',
        type: 'paragraph',
        text: 'Сортируем рёбра по весу. Идём с начала: если ребро соединяет два разных компонента — добавляем (Union–Find), иначе пропускаем (создали бы цикл). Остановились, когда взяли V−1 ребро.',
      },
      {
        id: 'g5-c1',
        type: 'code',
        language: 'js',
        editable: false,
        code: `function kruskal(edges, n) {
  edges.sort((a, b) => a.w - b.w);
  const parent = Array.from({ length: n }, (_, i) => i);
  function find(x) {
    return parent[x] === x ? x : (parent[x] = find(parent[x]));
  }
  const mst = [];
  for (const { u, v, w } of edges) {
    const a = find(u), b = find(v);
    if (a !== b) {
      parent[a] = b;
      mst.push({ u, v, w });
      if (mst.length === n - 1) break;
    }
  }
  return mst;
}`,
      },
      { id: 'g5-h3', type: 'heading', level: 2, text: 'Прим' },
      {
        id: 'g5-p4',
        type: 'paragraph',
        text: 'Начинаем с любой вершины. На каждом шаге добавляем самое лёгкое ребро из уже выбранного «облака» наружу. Удобно хранить кандидатов в min-heap. На плотных графах часто хорош; Краскал проще писать, когда рёбра уже в списке.',
      },
      {
        id: 'g5-p5',
        type: 'paragraph',
        text: 'Оба алгоритма дают один и тот же оптимальный вес MST (при равных весах дерево может отличаться, но сумма та же).',
      },
      link(
        'g5-l1',
        'Минимальное остовное дерево — Википедия',
        'https://ru.wikipedia.org/wiki/Минимальное_остовное_дерево',
      ),
    ],
  },
  {
    id: 'graf-cycle',
    topicId: 'grafy',
    subtopicId: 'st-graf-6',
    title: 'Циклы, SCC: Флойд на списке, Тарьян, Косарайю',
    blocks: [
      { id: 'g6-h1', type: 'heading', level: 1, text: 'Три разные истории с похожими именами' },
      {
        id: 'g6-p1',
        type: 'paragraph',
        text: '«Флойд» в списке — это черепаха и заяц: медленный указатель на шаг, быстрый на два. Если список закольцован, быстрый догонит медленный. Если нет — быстрый упрётся в null. Память O(1), время O(n).',
      },
      {
        id: 'g6-c1',
        type: 'code',
        language: 'js',
        editable: false,
        code: `function hasCycleFloyd(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}`,
      },
      { id: 'g6-h2', type: 'heading', level: 2, text: 'Цикл в ориентированном графе' },
      {
        id: 'g6-p2',
        type: 'paragraph',
        text: 'Топосорт Кана: если не все вершины попали в порядок — цикл есть. DFS с цветами: серый предок, снова попали в серого — обратное ребро, цикл.',
      },
      { id: 'g6-h3', type: 'heading', level: 2, text: 'Сильно связные компоненты (SCC)' },
      {
        id: 'g6-p3',
        type: 'paragraph',
        text: 'В ориентированном графе группа вершин, из каждой можно добраться до каждой по направленным рёбрам. Граф можно сжать в DAG компонент — полезно для анализа зависимостей. Косарайю: DFS, запоминаем порядок выхода; разворачиваем рёбра; второй DFS по этому порядку. Тарьян — один DFS с lowlink и стеком, без явного транспонирования.',
      },
      {
        id: 'g6-anim',
        type: 'animation',
        html:
          '<div class="viz-col"><div class="viz-caption">Черепаха и заяц на «кольце» (анимация-аналог)</div><div class="viz-hint" id="g6-h"></div><div class="viz-row" id="g6-r"></div></div>',
        css: '',
        js: `(function(){
  var row=document.getElementById('g6-r');
  var hint=document.getElementById('g6-h');
  var cells=['1','2','3','4','5'];
  cells.forEach(function(v,i){
    var d=document.createElement('div');
    d.className='viz-cell';
    d.innerHTML='<span class="viz-cell__main">'+v+'</span>';
    row.appendChild(d);
  });
  var slow=0,fast=0;
  setInterval(function(){
    var ch=row.children;
    for(var j=0;j<ch.length;j++) ch[j].classList.remove('viz-cell--active','viz-cell--success');
    slow=(slow+1)%ch.length;
    fast=(fast+2)%(ch.length);
    ch[slow].classList.add('viz-cell--active');
    ch[fast].classList.add('viz-cell--success');
    hint.textContent=slow===fast?'Встретились — есть цикл':'slow и fast двигаются';
  },600);
})();`,
        width: '100%',
        height: 160,
        showPlayButton: true,
        vizLayout: 'default',
      },
      link(
        'g6-l1',
        'Strongly connected component — Wikipedia',
        'https://en.wikipedia.org/wiki/Strongly_connected_component',
      ),
    ],
  },
  {
    id: 'graf-floydw',
    topicId: 'grafy',
    subtopicId: 'st-graf-7',
    title: 'Floyd–Warshall: все пары вершин',
    blocks: [
      { id: 'g7-h1', type: 'heading', level: 1, text: 'Три вложенных цикла — и готово' },
      {
        id: 'g7-p1',
        type: 'paragraph',
        text: 'Нужны кратчайшие пути между всеми парами (i, j). Идея динамического программирования: разрешаем в качестве промежуточных только вершины с номером ≤ k. Для k+1 сравниваем старый путь i→j с путём i→k→j.',
      },
      {
        id: 'g7-p2',
        type: 'paragraph',
        text: 'Реализация обычно in-place по матрице dist[n][n]. После внешнего цикла по k матрица учитывает все вершины до k включительно как «транзит». Сложность O(V³), память O(V²). Подходит для n до порядка нескольких сотен–тысячи в зависимости от времени.',
      },
      {
        id: 'g7-p3',
        type: 'paragraph',
        text: 'Отрицательные рёбра допустимы; если после алгоритма dist[i][i] < 0 для какого-то i — через i проходит цикл отрицательного веса.',
      },
      {
        id: 'g7-c1',
        type: 'code',
        language: 'js',
        editable: false,
        code: `function floydWarshall(n, dist) {
  for (let k = 0; k < n; k++)
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        if (dist[i][k] + dist[k][j] < dist[i][j])
          dist[i][j] = dist[i][k] + dist[k][j];
  return dist;
}`,
      },
      {
        id: 'g7-anim',
        type: 'animation',
        html:
          '<div class="viz-col"><div class="viz-caption">k = 0,1,2… по очереди «разрешаем» новую вершину как транзит</div><div class="viz-hint" id="g7-h"></div><div class="viz-badge" id="g7-b">k = ?</div></div>',
        css: '',
        js: `(function(){
  var hint=document.getElementById('g7-h');
  var b=document.getElementById('g7-b');
  var k=0;
  setInterval(function(){
    b.textContent='k = '+k;
    hint.textContent='Обновляем все пары (i,j), пробуя путь через вершину '+k;
    k=(k+1)%5;
  },900);
})();`,
        width: '100%',
        height: 140,
        showPlayButton: true,
        vizLayout: 'default',
      },
      link(
        'g7-l1',
        'Алгоритм Флойда — Уоршелла — Википедия',
        'https://ru.wikipedia.org/wiki/Алгоритм_Флойда_—_Уоршелла',
      ),
    ],
  },
];
