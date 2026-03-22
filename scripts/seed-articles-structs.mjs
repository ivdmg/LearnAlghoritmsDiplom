/** Статьи по теме «Дополнительные структуры данных» — развёрнутые */

const link = (id, text, href) => ({
  id,
  type: 'link',
  text,
  href,
  target: href.startsWith('http') ? '_blank' : '_self',
});

export const articles = [
  {
    id: 'str-pq',
    topicId: 'struktury',
    subtopicId: 'st-str-1',
    title: 'Очередь с приоритетом и бинарная куча (heap)',
    blocks: [
      { id: 's1-h1', type: 'heading', level: 1, text: 'Не «кто первый встал», а «кто важнее»' },
      {
        id: 's1-p1',
        type: 'paragraph',
        text: 'Обычная очередь честная: первым пришёл — первым ушёл. В очереди с приоритетом каждый элемент имеет «важность». Достаём не того, кто дольше ждал, а того, у кого приоритет выше (или число меньше — как договоритесь). Так работает диспетчер задач в ОС, открытый список в Дейкстре и многое другое.',
      },
      {
        id: 's1-p2',
        type: 'paragraph',
        text: 'Реализовать можно через сбалансированное дерево или через кучу (heap). Бинарная куча — почти полное бинарное дерево, уложенное в массив: у узла с индексом i дети 2i+1 и 2i+2, родитель ⌊(i−1)/2⌋.',
      },
      { id: 's1-h2', type: 'heading', level: 2, text: 'Свойство min-heap' },
      {
        id: 's1-p3',
        type: 'paragraph',
        text: 'Значение в узле не больше, чем у детей. Минимум всегда в корне (индекс 0). Вставка: кладём элемент в конец и «всплываем» (sift-up), пока не нарушим порядок. Извлечение минимума: корень забираем, последний элемент переносим в корень и «просеиваем вниз» (sift-down).',
      },
      {
        id: 's1-c1',
        type: 'code',
        language: 'js',
        editable: false,
        code: `class MinHeap {
  constructor() { this.a = []; }
  push(x) {
    this.a.push(x);
    let i = this.a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.a[p] <= this.a[i]) break;
      [this.a[p], this.a[i]] = [this.a[i], this.a[p]];
      i = p;
    }
  }
  pop() {
    const a = this.a;
    if (!a.length) return undefined;
    const top = a[0];
    const x = a.pop();
    if (a.length) {
      a[0] = x;
      let i = 0;
      for (;;) {
        let l = i * 2 + 1, r = l + 1, m = i;
        if (l < a.length && a[l] < a[m]) m = l;
        if (r < a.length && a[r] < a[m]) m = r;
        if (m === i) break;
        [a[i], a[m]] = [a[m], a[i]];
        i = m;
      }
    }
    return top;
  }
}`,
      },
      { id: 's1-h3', type: 'heading', level: 2, text: 'Зачем это в алгоритмах' },
      {
        id: 's1-p4',
        type: 'paragraph',
        text: 'Дейкстра: хранить вершины по текущей дистанции. Prim для MST: брать минимальное ребро из границы. Пирамидальная сортировка: построили кучу и по одному вытаскиваем минимум. Всё это O(log n) на операцию с кучей.',
      },
      {
        id: 's1-anim',
        type: 'animation',
        html:
          '<div class="viz-col"><div class="viz-caption">Массив = куча: индекс 0 — минимум, дети 2i+1 и 2i+2</div><div class="viz-hint" id="s1-hint"></div><div class="viz-chart" id="s1-ch"></div></div>',
        css: '',
        js: `(function(){
  var chart=document.getElementById('s1-ch');
  var hint=document.getElementById('s1-hint');
  var heap=[1,3,5,7,9,8,10];
  var maxV=VizBars.maxOf(heap);
  VizBars.render(chart,heap,{max:maxV});
  hint.textContent='Корень (слева в массиве) — всегда наименьший';
  VizBars.setState(chart,0,'success');
  var i=0;
  setInterval(function(){
    VizBars.clearStates(chart);
    VizBars.setState(chart,i,'compare');
    hint.textContent='Уровень в куче: индекс '+i+', значение '+heap[i];
    i=(i+1)%heap.length;
  },700);
})();`,
        width: '100%',
        height: 220,
        showPlayButton: true,
        vizLayout: 'default',
      },
      link(
        's1-l1',
        'Очередь с приоритетом — Википедия',
        'https://ru.wikipedia.org/wiki/Очередь_с_приоритетом',
      ),
    ],
  },
  {
    id: 'str-deque',
    topicId: 'struktury',
    subtopicId: 'st-str-2',
    title: 'Deque и двусвязный список',
    blocks: [
      { id: 's2-h1', type: 'heading', level: 1, text: 'Очередь с двумя концами' },
      {
        id: 's2-p1',
        type: 'paragraph',
        text: 'Deque (double-ended queue) позволяет добавлять и убирать элементы и с головы, и с хвоста за O(1) в хорошей реализации (кольцевой буфер в массиве фиксированного запаса или указатели в связном списке). Это удобно для скользящего окна, BFS в 0-1 BFS и многих двухуказательных трюков.',
      },
      {
        id: 's2-p2',
        type: 'paragraph',
        text: 'В JavaScript массив .push() и .pop() с конца быстрые, а .shift() с начала может быть O(n), потому что сдвигаются все элементы. Если из головы читаем часто и n большой — ищите deque в библиотеке или реализуйте кольцо на массиве.',
      },
      { id: 's2-h2', type: 'heading', level: 2, text: 'Двусвязный список' },
      {
        id: 's2-p3',
        type: 'paragraph',
        text: 'Каждый узел знает prev и next. Вставка или удаление, если уже есть указатель на узел — O(1). Зато добраться до k-го элемента нужно идти с края — нет индексации за O(1) как у массива.',
      },
      {
        id: 's2-c1',
        type: 'code',
        language: 'js',
        editable: false,
        code: `class Node {
  constructor(v) {
    this.v = v;
    this.prev = this.next = null;
  }
}
class DoublyLinkedList {
  constructor() {
    this.head = this.tail = null;
  }
  pushBack(v) {
    const n = new Node(v);
    if (!this.tail) this.head = this.tail = n;
    else {
      n.prev = this.tail;
      this.tail.next = n;
      this.tail = n;
    }
  }
  popFront() {
    if (!this.head) return undefined;
    const v = this.head.v;
    this.head = this.head.next;
    if (this.head) this.head.prev = null;
    else this.tail = null;
    return v;
  }
}`,
      },
      { id: 's2-h3', type: 'heading', level: 2, text: 'Пример идеи: монотонная deque' },
      {
        id: 's2-p4',
        type: 'paragraph',
        text: 'В задаче «максимум в окне длины k» держим индексы в deque так, чтобы значения в нём шли по убыванию; выкидываем с хвоста всё, что меньше нового элемента. С головы снимаем устаревшие индексы. Итог O(n) вместо O(nk).',
      },
      {
        id: 's2-c2',
        type: 'code',
        language: 'js',
        editable: false,
        code: `/** максимумы в каждом окне длины k */
function slidingMax(arr, k) {
  const dq = []; // индексы, значения arr[dq] убывают
  const out = [];
  for (let i = 0; i < arr.length; i++) {
    while (dq.length && arr[dq[dq.length - 1]] <= arr[i]) dq.pop();
    dq.push(i);
    while (dq[0] <= i - k) dq.shift();
    if (i >= k - 1) out.push(arr[dq[0]]);
  }
  return out;
}`,
      },
      {
        id: 's2-anim',
        type: 'animation',
        html:
          '<div class="viz-col"><div class="viz-caption">Двусторонняя очередь: можно снимать слева и справа</div><div class="viz-hint" id="s2-h"></div><div class="viz-row viz-row--queue" id="s2-q"></div></div>',
        css: '',
        js: `(function(){
  var q=document.getElementById('s2-q');
  var hint=document.getElementById('s2-h');
  var seq=['pushBack A','pushBack B','pushFront C','popFront','popBack'];
  var i=0;
  function tick(){
    q.innerHTML='';
    hint.textContent=seq[i];
    var show=['C','A','B'];
    if(i>=3) show=['A','B'];
    if(i>=4) show=['A'];
    show.forEach(function(x){
      var d=document.createElement('div');
      d.className='viz-cell viz-cell--shown';
      d.innerHTML='<span class="viz-cell__main">'+x+'</span>';
      q.appendChild(d);
    });
    i=(i+1)%seq.length;
  }
  tick();
  setInterval(tick,1100);
})();`,
        width: '100%',
        height: 180,
        showPlayButton: true,
        vizLayout: 'default',
      },
      link(
        's2-l1',
        'Двусвязный список — Википедия',
        'https://ru.wikipedia.org/wiki/Связный_список',
      ),
    ],
  },
  {
    id: 'str-trie',
    topicId: 'struktury',
    subtopicId: 'st-str-3',
    title: 'Trie (префиксное дерево)',
    blocks: [
      { id: 's3-h1', type: 'heading', level: 1, text: 'Строки с общим началом делят одни и те же рёбра' },
      {
        id: 's3-p1',
        type: 'paragraph',
        text: 'Представьте автодополнение в поиске: пользователь ввёл «ал». Все слова из словаря с этим префиксом лежат в одной ветке дерева. Корень — пустой префикс; по букве «а» переходим в дочерний узел, потом по «л» и т.д. Конец слова помечаем флагом.',
      },
      {
        id: 's3-p2',
        type: 'paragraph',
        text: 'Вставка и поиск слова длины L за O(L) при фиксированном алфавите (русский/английский буквы или биты 0/1). Память — сумма длин всех строк в худшем случае; для сильно пересекающихся префиксов trie экономит сравнения «строка со строкой».',
      },
      {
        id: 's3-c1',
        type: 'code',
        language: 'js',
        editable: false,
        code: `class TrieNode {
  constructor() {
    this.children = new Map();
    this.end = false;
  }
}
class Trie {
  constructor() { this.root = new TrieNode(); }
  insert(word) {
    let n = this.root;
    for (const ch of word) {
      if (!n.children.has(ch)) n.children.set(ch, new TrieNode());
      n = n.children.get(ch);
    }
    n.end = true;
  }
  has(word) {
    let n = this.root;
    for (const ch of word) {
      if (!n.children.has(ch)) return false;
      n = n.children.get(ch);
    }
    return n.end;
  }
  startsWith(prefix) {
    let n = this.root;
    for (const ch of prefix) {
      if (!n.children.has(ch)) return false;
      n = n.children.get(ch);
    }
    return true;
  }
}`,
      },
      {
        id: 's3-p3',
        type: 'paragraph',
        text: 'Расширения: счётчик слов с данным префиксом, XOR-максимум для массива через битовый trie, сжатие цепочек в radix tree.',
      },
      {
        id: 's3-anim',
        type: 'animation',
        html:
          '<div class="viz-col"><div class="viz-caption">Общий префикс «ca» у слов cat и car</div><div class="viz-hint" id="s3-hint"></div><div class="viz-row" id="s3-row"></div></div>',
        css: '',
        js: `(function(){
  var row=document.getElementById('s3-row');
  var hint=document.getElementById('s3-hint');
  var steps=['c','ca','cat','c','ca','car'];
  var i=0;
  function add(sym){
    var d=document.createElement('div');
    d.className='viz-cell viz-cell--enter-right viz-cell--shown';
    d.innerHTML='<span class="viz-cell__main">'+sym+'</span><span class="viz-cell__sub">префикс</span>';
    row.appendChild(d);
  }
  function tick(){
    row.innerHTML='';
    var w=steps[i];
    hint.textContent='Наращиваем путь: «'+w+'»';
    for(var k=0;k<w.length;k++) add(w.slice(0,k+1));
    i=(i+1)%steps.length;
  }
  tick();
  setInterval(tick,1100);
})();`,
        width: '100%',
        height: 200,
        showPlayButton: true,
        vizLayout: 'default',
      },
      link('s3-l1', 'Trie — Wikipedia', 'https://en.wikipedia.org/wiki/Trie'),
    ],
  },
  {
    id: 'str-dsu',
    topicId: 'struktury',
    subtopicId: 'st-str-4',
    title: 'Union–Find (Disjoint Set Union)',
    blocks: [
      { id: 's4-h1', type: 'heading', level: 1, text: 'Группы объектов: сливаем и спрашиваем «в одной ли паре?»' },
      {
        id: 's4-p1',
        type: 'paragraph',
        text: 'Изначально каждый элемент — своя группа. Операция union(a,b) объединяет группы. find(x) возвращает «представителя» группы x (любой фиксированный элемент компоненты). Запрос: find(a) === find(b)?',
      },
      {
        id: 's4-p2',
        type: 'paragraph',
        text: 'Наивно дерево может выродиться в цепочку. Два приёма: union по рангу/размеру (подвешиваем меньшее к большему) и сжатие путей при find (все узлы на пути сразу указывают на корень). Тогда амортизированно почти константа — α(n), обратная функция Аккермана, на практике считайте O(1).',
      },
      {
        id: 's4-c1',
        type: 'code',
        language: 'js',
        editable: false,
        code: `class DSU {
  constructor(n) {
    this.p = Array.from({ length: n }, (_, i) => i);
    this.r = new Array(n).fill(0);
  }
  find(x) {
    if (this.p[x] !== x) this.p[x] = this.find(this.p[x]);
    return this.p[x];
  }
  union(a, b) {
    a = this.find(a); b = this.find(b);
    if (a === b) return false;
    if (this.r[a] < this.r[b]) [a, b] = [b, a];
    this.p[b] = a;
    if (this.r[a] === this.r[b]) this.r[a]++;
    return true;
  }
}`,
      },
      { id: 's4-h2', type: 'heading', level: 2, text: 'Краскал и DSU — идеальная пара' },
      {
        id: 's4-p3',
        type: 'paragraph',
        text: 'Перебираем рёбра от лёгких к тяжёлым. Ребро соединяет разные компоненты? union и добавляем в MST. Уже в одной компоненте? Пропускаем — иначе цикл.',
      },
      {
        id: 's4-c2',
        type: 'code',
        language: 'js',
        editable: false,
        code: `function mstKruskal(edges, n) {
  edges.sort((a, b) => a.w - b.w);
  const dsu = new DSU(n);
  const mst = [];
  for (const e of edges) {
    if (dsu.union(e.u, e.v)) {
      mst.push(e);
      if (mst.length === n - 1) break;
    }
  }
  return mst;
}`,
      },
      {
        id: 's4-p4',
        type: 'paragraph',
        text: 'Ещё применения: динамическая связность графа, offline запросы, задачи на эквивалентности. Без сжатия путей и ранга на больших данных решение может не уложиться во время.',
      },
      {
        id: 's4-anim',
        type: 'animation',
        html:
          '<div class="viz-col"><div class="viz-caption">Union: два множества сливаются в одно</div><div class="viz-hint" id="s4-h"></div><div class="viz-row" id="s4-r"></div></div>',
        css: '',
        js: `(function(){
  var row=document.getElementById('s4-r');
  var hint=document.getElementById('s4-h');
  var phase=0;
  setInterval(function(){
    row.innerHTML='';
    var labels=phase===0?['{A}','{B}','{C}','{D}']:['{A,B,C,D}'];
    labels.forEach(function(t){
      var d=document.createElement('div');
      d.className='viz-cell viz-cell--shown';
      d.innerHTML='<span class="viz-cell__main">'+t+'</span>';
      row.appendChild(d);
    });
    hint.textContent=phase===0?'До union: 4 компоненты':'После union-ов: одна компонента';
    phase=1-phase;
  },1600);
})();`,
        width: '100%',
        height: 160,
        showPlayButton: true,
        vizLayout: 'default',
      },
      link(
        's4-l1',
        'Система непересекающихся множеств — Википедия',
        'https://ru.wikipedia.org/wiki/Система_непересекающихся_множеств',
      ),
    ],
  },
];
