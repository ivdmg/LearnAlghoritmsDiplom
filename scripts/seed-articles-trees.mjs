/** Статьи по теме «Деревья» — развёрнутые, в духе наглядных учебников */

const link = (id, text, href) => ({
  id,
  type: 'link',
  text,
  href,
  target: href.startsWith('http') ? '_blank' : '_self',
});

export const articles = [
  {
    id: 'der-basic',
    topicId: 'derevya',
    subtopicId: 'st-der-1',
    title: 'Базовые деревья: узел, вставка, поиск',
    blocks: [
      { id: 'der1-h1', type: 'heading', level: 1, text: 'Дерево — это не магия, а удобная «схема связей»' },
      {
        id: 'der1-p1',
        type: 'paragraph',
        text: 'Представьте папки на компьютере: внутри «Документы» лежат «Работа» и «Личное», внутри каждой — свои файлы и папки. Никаких циклов: из папки нельзя зайти в подпапку и случайно вернуться в ту же самую выше по пути. Именно так устроено классическое дерево в программировании: есть один корень (верхушка), от него идут дети, у детей — свои дети.',
      },
      {
        id: 'der1-p2',
        type: 'paragraph',
        text: 'Зачем это нужно? Чтобы хранить иерархии: меню сайта, комментарии с ответами, выражения в компиляторе, разбор JSON. Дерево — частный случай графа, только без «петель» по пути вверх-вниз.',
      },
      { id: 'der1-h2', type: 'heading', level: 2, text: 'Слова, которые встретятся везде' },
      {
        id: 'der1-p3',
        type: 'paragraph',
        text: 'Узел (node) — одна «коробка» с данными. Ребро — связь родитель–ребёнок. Лист — узел без детей. Высота дерева — длина самого длинного пути от корня вниз до листа (как этажи). Если у каждого узла не больше двух детей, дерево бинарное — с ним проще всего начинать.',
      },
      { id: 'der1-h3', type: 'heading', level: 2, text: 'Как описать узел в коде' },
      {
        id: 'der1-p4',
        type: 'paragraph',
        text: 'Минимум: значение и список детей. Иногда добавляют ссылку на родителя — тогда проще подниматься вверх (например, «закрыть вкладку и вернуться к родителю» в UI).',
      },
      {
        id: 'der1-c1',
        type: 'code',
        language: 'js',
        editable: false,
        code: `// N-арное дерево: сколько угодно детей
class TreeNode {
  constructor(value) {
    this.value = value;
    this.children = [];
    this.parent = null; // по желанию
  }
  addChild(child) {
    child.parent = this;
    this.children.push(child);
    return child;
  }
}`,
      },
      {
        id: 'der1-c2',
        type: 'code',
        language: 'js',
        editable: false,
        code: `// Бинарное дерево — максимум два ребёнка
class BinNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}`,
      },
      { id: 'der1-h4', type: 'heading', level: 2, text: 'Поиск, если «порядка» нет' },
      {
        id: 'der1-p5',
        type: 'paragraph',
        text: 'Если значения в узлах не упорядочены (это ещё не BST), единственный общий способ — обойти дерево и сравнивать. В худшем случае придётся заглянуть в каждый узел: O(n). Зато логика простая: похоже на поиск ключа в JSON — пока не найдём, копаем глубже.',
      },
      {
        id: 'der1-c3',
        type: 'code',
        language: 'js',
        editable: false,
        code: `function findDFS(root, target) {
  if (!root) return null;
  if (root.value === target) return root;
  for (const ch of root.children) {
    const hit = findDFS(ch, target);
    if (hit) return hit;
  }
  return null;
}`,
      },
      {
        id: 'der1-p6',
        type: 'paragraph',
        text: 'Тот же поиск можно записать через очередь (BFS): сначала смотрим узлы ближе к корню. Если нужен «первый найденный на минимальной глубине», BFS удобнее; если просто «есть или нет» — разницы по скорости нет, оба обходят всё дерево.',
      },
      {
        id: 'der1-c4',
        type: 'code',
        language: 'js',
        editable: false,
        code: `function findBFS(root, target) {
  if (!root) return null;
  const q = [root];
  while (q.length) {
    const u = q.shift();
    if (u.value === target) return u;
    for (const ch of u.children) q.push(ch);
  }
  return null;
}`,
      },
      { id: 'der1-h5', type: 'heading', level: 2, text: 'Вставка нового узла' },
      {
        id: 'der1-p7',
        type: 'paragraph',
        text: 'Если вы уже держите ссылку на родителя p, вставка — одна операция: создали узел и добавили в children. Это O(1) по времени. Другое дело, если сначала нужно найти родителя по значению — тогда поиск может стоить O(n).',
      },
      {
        id: 'der1-c5',
        type: 'code',
        language: 'js',
        editable: false,
        code: `function insertUnder(parent, value) {
  const node = new TreeNode(value);
  parent.children.push(node);
  node.parent = parent;
  return node;
}`,
      },
      {
        id: 'der1-p8',
        type: 'paragraph',
        text: 'Итог: дерево — удобная модель «один родитель — много детей». Дальше вы изучите обходы BFS/DFS и особый случай — бинарное дерево поиска, где поиск становится похож на бинарный поиск по массиву.',
      },
      {
        id: 'der1-anim',
        type: 'animation',
        html:
          '<div class="viz-col"><div class="viz-caption">Обход «как по слоям»: сначала корень, потом дети (учебная аналогия)</div><div class="viz-hint" id="der1-hint"></div><div class="viz-chart" id="der1-ch"></div></div>',
        css: '',
        js: `(function(){
  var chart=document.getElementById('der1-ch');
  var hint=document.getElementById('der1-hint');
  var order=[10,20,21,30,31,32];
  var maxV=VizBars.maxOf(order);
  VizBars.render(chart,order,{max:maxV});
  var step=0;
  var t=setInterval(function(){
    VizBars.clearStates(chart);
    VizBars.setState(chart,step,'active');
    hint.textContent='Порядок обхода в ширину (значения в узлах — условные)';
    step=(step+1)%order.length;
  },700);
})();`,
        width: '100%',
        height: 220,
        showPlayButton: true,
        vizLayout: 'default',
      },
      link(
        'der1-l1',
        'Дерево (структура данных) — Википедия',
        'https://ru.wikipedia.org/wiki/Дерево_(структура_данных)',
      ),
    ],
  },
  {
    id: 'der-bfs',
    topicId: 'derevya',
    subtopicId: 'st-der-2',
    title: 'Обход дерева в ширину (BFS)',
    blocks: [
      { id: 'der2-h1', type: 'heading', level: 1, text: 'Сначала всё рядом, потом дальше' },
      {
        id: 'der2-p1',
        type: 'paragraph',
        text: 'BFS (breadth-first search) обходит дерево «по кругам», как волна от камня в воде: сначала корень, потом все его прямые дети, потом все внуки и так далее. Это не «интуиция ради интуиции»: такой порядок гарантирует, что вы встретите узлы на расстоянии 1 раньше, чем на расстоянии 2 — пригодится в графах для кратчайшего пути.',
      },
      {
        id: 'der2-p2',
        type: 'paragraph',
        text: 'Технически нужна очередь FIFO: «встали в хвост — обслуживаем с головы». Сняли узел, обработали, всех детей аккуратно добавили в конец очереди. В JavaScript для учебы можно q.shift() — помните, что у большого массива это дорого; в бою берут указатели головы/хвоста или deque.',
      },
      { id: 'der2-h2', type: 'heading', level: 2, text: 'Код обхода' },
      {
        id: 'der2-c1',
        type: 'code',
        language: 'js',
        editable: false,
        code: `function bfs(root, visit) {
  if (!root) return;
  const q = [root];
  while (q.length) {
    const u = q.shift();
    visit(u);
    for (const ch of u.children) q.push(ch);
  }
}`,
      },
      { id: 'der2-h3', type: 'heading', level: 2, text: 'Собрать узлы по уровням в массив' },
      {
        id: 'der2-p3',
        type: 'paragraph',
        text: 'Частая задача на собеседованиях: вернуть [[корень],[его дети],[следующий уровень],...]. Идея: на каждом шаге знаем, сколько узлов в текущем «слое» (размер очереди в начале итерации).',
      },
      {
        id: 'der2-c2',
        type: 'code',
        language: 'js',
        editable: false,
        code: `function levels(root) {
  if (!root) return [];
  const res = [];
  let q = [root];
  while (q.length) {
    const row = [];
    const next = [];
    for (const u of q) {
      row.push(u.value);
      for (const ch of u.children) next.push(ch);
    }
    res.push(row);
    q = next;
  }
  return res;
}`,
      },
      { id: 'der2-h4', type: 'heading', level: 2, text: 'Сложность' },
      {
        id: 'der2-p4',
        type: 'paragraph',
        text: 'Время O(n): каждый узел зайдёт в очередь ровно один раз, каждое ребро мы «пересечём» константное число раз. Память — ширина дерева: если у корня миллион детей, в очереди может стоять O(миллион).',
      },
      {
        id: 'der2-anim',
        type: 'animation',
        html:
          '<div class="viz-col"><div class="viz-caption">Очередь: кто пришёл первым — обслуживается первым</div><div class="viz-hint" id="der2-hint"></div><div class="viz-row viz-row--queue" id="der2-q"></div></div>',
        css: '',
        js: `(function(){
  var root=document.getElementById('der2-q');
  var hint=document.getElementById('der2-hint');
  var levels=[['A'],['B','C'],['D','E','F']];
  var flat=[]; levels.forEach(function(L){ L.forEach(function(x){ flat.push(x); }); });
  var i=0;
  function step(){
    if(i>=flat.length){ i=0; root.innerHTML=''; }
    var d=document.createElement('div');
    d.className='viz-cell viz-cell--enter-right viz-cell--shown';
    d.innerHTML='<span class="viz-cell__main">'+flat[i]+'</span><span class="viz-cell__sub">обработали</span>';
    root.appendChild(d);
    hint.textContent='Уровень за уровнем: '+flat[i];
    i++;
  }
  step();
  setInterval(step,900);
})();`,
        width: '100%',
        height: 200,
        showPlayButton: true,
        vizLayout: 'default',
      },
      {
        id: 'der2-p5',
        type: 'paragraph',
        text: 'Когда BFS «лучше DFS» в дереве? Когда важна минимальная глубина ответа (первое совпадение ближе всего к корню). Когда достаточно любого обхода — выбирайте тот, что проще написать.',
      },
      link('der2-l1', 'Поиск в ширину — Википедия', 'https://ru.wikipedia.org/wiki/Поиск_в_ширину'),
    ],
  },
  {
    id: 'der-dfs',
    topicId: 'derevya',
    subtopicId: 'st-der-3',
    title: 'Обход дерева в глубину (DFS)',
    blocks: [
      { id: 'der3-h1', type: 'heading', level: 1, text: 'Идём до упора, потом разворачиваемся' },
      {
        id: 'der3-p1',
        type: 'paragraph',
        text: 'DFS (depth-first search) похож на обход лабиринта с правилом «всегда углубляйся в первый доступный ход». Дошли до тупика — откатываемся и пробуем следующий ход. В дереве тупик — это лист.',
      },
      {
        id: 'der3-p2',
        type: 'paragraph',
        text: 'Рекурсивная версия красивая: стек вызовов сам хранит путь «куда мы зашли». Итеративная — явный массив-стек; полезно, когда глубина большая и стек вызовов боюсь переполнить.',
      },
      { id: 'der3-h2', type: 'heading', level: 2, text: 'Три классических порядка (бинарное дерево)' },
      {
        id: 'der3-p3',
        type: 'paragraph',
        text: 'Представьте маленькое дерево: корень 2, слева 1, справа 3. Preorder (префиксный): сначала говорим о родителе, потом левое поддерево, потом правое → [2,1,3]. Inorder (симметричный): левое, родитель, правое → [1,2,3] — в BST это всегда ключи по возрастанию. Postorder: левое, правое, родитель → [1,3,2] — удобно, когда сначала нужно «убрать детей», потом родителя (например, освобождение памяти).',
      },
      {
        id: 'der3-c1',
        type: 'code',
        language: 'js',
        editable: false,
        code: `function preorder(node, out = []) {
  if (!node) return out;
  out.push(node.value);
  preorder(node.left, out);
  preorder(node.right, out);
  return out;
}

function inorder(node, out = []) {
  if (!node) return out;
  inorder(node.left, out);
  out.push(node.value);
  inorder(node.right, out);
  return out;
}

function postorder(node, out = []) {
  if (!node) return out;
  postorder(node.left, out);
  postorder(node.right, out);
  out.push(node.value);
  return out;
}`,
      },
      { id: 'der3-h3', type: 'heading', level: 2, text: 'DFS со стеком без рекурсии (preorder)' },
      {
        id: 'der3-c2',
        type: 'code',
        language: 'js',
        editable: false,
        code: `function preorderIter(root, visit) {
  if (!root) return;
  const st = [root];
  while (st.length) {
    const u = st.pop();
    visit(u);
    // сначала правый, потом левый — чтобы левый обработался первым
    if (u.right) st.push(u.right);
    if (u.left) st.push(u.left);
  }
}`,
      },
      {
        id: 'der3-anim',
        type: 'animation',
        html:
          '<div class="viz-col"><div class="viz-caption">Preorder: порядок посещения (как «закрашиваем» узлы)</div><div class="viz-hint" id="der3-hint"></div><div class="viz-chart" id="der3-ch"></div></div>',
        css: '',
        js: `(function(){
  var chart=document.getElementById('der3-ch');
  var hint=document.getElementById('der3-hint');
  var preorder=[2,1,3];
  var maxV=VizBars.maxOf(preorder);
  VizBars.render(chart,preorder,{max:maxV});
  var k=0;
  setInterval(function(){
    VizBars.clearStates(chart);
    VizBars.setState(chart,k,'active');
    hint.textContent='Шаг preorder: узел '+preorder[k];
    k=(k+1)%preorder.length;
  },850);
})();`,
        width: '100%',
        height: 230,
        showPlayButton: true,
        vizLayout: 'default',
      },
      {
        id: 'der3-p4',
        type: 'paragraph',
        text: 'Память O(h), h — высота. В идеально сбалансированном дереве h ≈ log n. В «списке» из узлов h = n — стек вызовов может стать проблемой.',
      },
      link('der3-l1', 'Поиск в глубину — Википедия', 'https://ru.wikipedia.org/wiki/Поиск_в_глубину'),
    ],
  },
  {
    id: 'der-bst',
    topicId: 'derevya',
    subtopicId: 'st-der-4',
    title: 'Бинарное дерево поиска (BST)',
    blocks: [
      { id: 'der4-h1', type: 'heading', level: 1, text: 'Как телефонная книга, только в виде дерева' },
      {
        id: 'der4-p1',
        type: 'paragraph',
        text: 'Правило простое: у каждого узла все ключи в левом поддереве меньше, в правом — больше (дубликаты обычно договариваются: только влево или только вправо). Тогда на каждом шаге поиска мы выбираем одну из двух веток — как бинарный поиск в отсортированном массиве, только структура древовидная.',
      },
      {
        id: 'der4-c1',
        type: 'code',
        language: 'js',
        editable: false,
        code: `function search(node, key) {
  if (!node || node.key === key) return node;
  return key < node.key ? search(node.left, key) : search(node.right, key);
}`,
      },
      { id: 'der4-h2', type: 'heading', level: 2, text: 'Вставка' },
      {
        id: 'der4-p2',
        type: 'paragraph',
        text: 'Спускаемся как при поиске. Когда дошли до пустого места (null) — вот сюда и вешаем новый лист. Если вставлять ключи уже в отсортированном порядке 1,2,3,4,5… без балансировки, дерево превращается в «гирлянду» вправо — высота n, и мы потеряли все преимущества.',
      },
      {
        id: 'der4-c2',
        type: 'code',
        language: 'js',
        editable: false,
        code: `function insert(node, key) {
  if (!node) return { key, left: null, right: null };
  if (key < node.key) node.left = insert(node.left, key);
  else if (key > node.key) node.right = insert(node.right, key);
  return node;
}`,
      },
      { id: 'der4-h3', type: 'heading', level: 2, text: 'Удаление (идея)' },
      {
        id: 'der4-p3',
        type: 'paragraph',
        text: '0 детей — просто убрали узел. 1 ребёнок — «подтянули» ребёнка на место удаляемого. 2 ребёнка — находим минимальный ключ в правом поддереве (или максимальный в левом), копируем значение в удаляемый узел, потом удаляем «простой» узел с тем минимумом.',
      },
      { id: 'der4-h4', type: 'heading', level: 2, text: 'Скорость' },
      {
        id: 'der4-p4',
        type: 'paragraph',
        text: 'Средний случай при случайных вставках — O(log n) на операцию. Худший — O(n) при вырождении. Поэтому в продакшене используют сбалансированные деревья или другие структуры.',
      },
      {
        id: 'der4-anim',
        type: 'animation',
        html:
          '<div class="viz-col"><div class="viz-caption">Поиск ключа 9: на каждом шаге отрезаем «не ту» половину</div><div class="viz-hint" id="der4-hint"></div><div class="viz-chart" id="der4-chart"></div></div>',
        css: '',
        js: `(function(){
  var root=document.getElementById('der4-chart');
  var hint=document.getElementById('der4-hint');
  var keys=[4,2,6,1,3,5,8,7,9];
  var maxV=VizBars.maxOf(keys);
  VizBars.render(root,keys,{max:maxV});
  var path=[0,2,6,8];
  var pi=0;
  var timer=setInterval(function(){
    VizBars.clearStates(root);
    var idx=path[pi];
    var v=keys[idx];
    VizBars.setState(root,idx,'compare');
    hint.textContent='Сравниваем с '+v+': куда пойти дальше?';
    pi++;
    if(pi>=path.length){
      clearInterval(timer);
      VizBars.setState(root,8,'success');
      hint.textContent='Нашли 9';
    }
  },800);
})();`,
        width: '100%',
        height: 240,
        showPlayButton: true,
        vizLayout: 'default',
      },
      {
        id: 'der4-anim2',
        type: 'animation',
        html:
          '<div class="viz-col"><div class="viz-caption">Вставка 1,2,3,4,5 подряд — дерево вырождается в «лестницу»</div><div class="viz-hint" id="der4h2"></div><div class="viz-chart" id="der4ch2"></div></div>',
        css: '',
        js: `(function(){
  var chart=document.getElementById('der4ch2');
  var hint=document.getElementById('der4h2');
  var seq=[1,2,3,4,5,6,7];
  var maxV=VizBars.maxOf(seq);
  VizBars.render(chart,seq,{max:maxV});
  hint.textContent='Высота почти n — поиск как в связном списке';
  VizBars.setZone(chart,0,seq.length-1,'viz-bar-col--zone-b');
})();`,
        width: '100%',
        height: 220,
        showPlayButton: true,
        vizLayout: 'default',
      },
      link(
        'der4-l1',
        'Двоичное дерево поиска — Википедия',
        'https://ru.wikipedia.org/wiki/Двоичное_дерево_поиска',
      ),
    ],
  },
  {
    id: 'der-balanced',
    topicId: 'derevya',
    subtopicId: 'st-der-5',
    title: 'Сбалансированные деревья: AVL и красно-чёрные',
    blocks: [
      { id: 'der5-h1', type: 'heading', level: 1, text: 'Проблема: красивое BST может «сломаться» от данных' },
      {
        id: 'der5-p1',
        type: 'paragraph',
        text: 'Вы уже знаете: BST отлично работает, когда высота порядка log n. Но одна неудачная последовательность вставок превращает его в длинную цепочку. Сбалансированные деревья — это способ после каждой вставки или удаления чуть-чуть «подкрутить» структуру (поворотами или перекраской), чтобы высота оставалась логарифмической. Гарантия в худшем случае — главный выигрыш.',
      },
      { id: 'der5-h2', type: 'heading', level: 2, text: 'Поворот — не страшная формула, а перестановка трёх узлов' },
      {
        id: 'der5-p2',
        type: 'paragraph',
        text: 'Представьте, что «тяжёлая» ветка перевешивает. Поворот вокруг ребра локально переподвешивает поддерево так, что порядок ключей (инвариант BST) сохраняется, а глубина уменьшается. Иногда нужен один поворот, иногда два подряд (left-right case).',
      },
      { id: 'der5-h3', type: 'heading', level: 2, text: 'AVL-деревья' },
      {
        id: 'der5-p3',
        type: 'paragraph',
        text: 'Для каждого узла высоты левого и правого поддеревьев отличаются не больше чем на 1. Самое жёсткое из популярных правил — дерево очень ровное, поиск чуть быстрее, зато после вставки/удаления может понадобиться больше вращений.',
      },
      { id: 'der5-h4', type: 'heading', level: 2, text: 'Красно-чёрные деревья' },
      {
        id: 'der5-p4',
        type: 'paragraph',
        text: 'Узлы красятся; держим правила про чередование цветов и чёрную высоту. Допускается чуть менее идеальная форма, чем у AVL, но зато меньше работы при модификациях. Именно RB часто стоят за TreeMap, std::map, внутренними структурами языков.',
      },
      {
        id: 'der5-p5',
        type: 'paragraph',
        text: 'Что запомнить на старте: балансировка нужна, чтобы BST не деградировал; AVL «строже» по форме, RB — компромисс для частых обновлений. На олимпиадах и в JS часто проще взять готовую структуру или другой приём (например, кучу + массив), но понимание «зачем крутят дерево» обязательно.',
      },
      link('der5-l1', 'AVL-дерево — Википедия', 'https://ru.wikipedia.org/wiki/AVL-дерево'),
    ],
  },
  {
    id: 'der-segment',
    topicId: 'derevya',
    subtopicId: 'st-der-6',
    title: 'Сегментное дерево (Segment Tree)',
    blocks: [
      { id: 'der6-h1', type: 'heading', level: 1, text: 'Много запросов «сумма на отрезке» — без полного перебора' },
      {
        id: 'der6-p1',
        type: 'paragraph',
        text: 'Есть массив из n чисел. Снова и снова спрашивают: сколько сумма с индекса L по R? Если каждый раз суммировать в лоб — O(длина отрезка). Если запросов много, нужна структура. Сегментное дерево хранит суммы (или min/max) для кусков массива; любой отрезок [L,R] разбивается на O(log n) таких кусков.',
      },
      {
        id: 'der6-p2',
        type: 'paragraph',
        text: 'Вершина дерева отвечает за отрезок [tl, tr]. Лист — один элемент. Рекурсивно делим пополам: левый сын [tl, tm], правый [tm+1, tr]. Значение в узле = сумма детей.',
      },
      {
        id: 'der6-c1',
        type: 'code',
        language: 'js',
        editable: false,
        code: `function build(a, v, tl, tr, t) {
  if (tl === tr) t[v] = a[tl];
  else {
    const tm = (tl + tr) >> 1;
    build(a, v * 2, tl, tm, t);
    build(a, v * 2 + 1, tm + 1, tr, t);
    t[v] = t[v * 2] + t[v * 2 + 1];
  }
}`,
      },
      {
        id: 'der6-c2',
        type: 'code',
        language: 'js',
        editable: false,
        code: `function sum(v, tl, tr, l, r, t) {
  if (l > r) return 0;
  if (l === tl && r === tr) return t[v];
  const tm = (tl + tr) >> 1;
  return sum(v * 2, tl, tm, l, Math.min(r, tm), t)
       + sum(v * 2 + 1, tm + 1, tr, Math.max(l, tm + 1), r, t);
}`,
      },
      {
        id: 'der6-p3',
        type: 'paragraph',
        text: 'Обновление одного элемента: спускаемся в нужный лист и на обратном пути пересчитываем суммы — O(log n). Для «прибавить x на всём отрезке» придумали ленивое проталкивание (lazy propagation) — отдельная тема, но идея та же: не трогать каждый лист, а откладывать работу метками на узлах.',
      },
      {
        id: 'der6-anim',
        type: 'animation',
        html:
          '<div class="viz-col"><div class="viz-caption">Массив: запрос суммы на подотрезке (подсветка)</div><div class="viz-hint" id="der6-hint"></div><div class="viz-chart" id="der6-ch"></div></div>',
        css: '',
        js: `(function(){
  var chart=document.getElementById('der6-ch');
  var hint=document.getElementById('der6-hint');
  var a=[2,1,4,3,5,2,7];
  var maxV=VizBars.maxOf(a);
  VizBars.render(chart,a,{max:maxV});
  hint.textContent='Сегментное дерево внутри «склеивает» такие куски за O(log n)';
  setTimeout(function(){
    VizBars.clearZones(chart);
    VizBars.setZone(chart,2,4,'viz-bar-col--zone-a');
    hint.textContent='Запрос [2..4]: в дереве это несколько узлов-покрытий, не все листья';
  },1200);
})();`,
        width: '100%',
        height: 220,
        showPlayButton: true,
        vizLayout: 'default',
      },
      link('der6-l1', 'Segment tree — Wikipedia', 'https://en.wikipedia.org/wiki/Segment_tree'),
    ],
  },
  {
    id: 'der-fenwick',
    topicId: 'derevya',
    subtopicId: 'st-der-7',
    title: 'Дерево Фенвика (Fenwick Tree, BIT)',
    blocks: [
      { id: 'der7-h1', type: 'heading', level: 1, text: 'Компактная таблица для префиксных сумм' },
      {
        id: 'der7-p1',
        type: 'paragraph',
        text: 'Fenwick tree (Binary Indexed Tree) — массив длины n+1 со странными индексами. Зато add(i, delta) «прибавить к позиции» и sum(i) «сумма с 1 по i» работают за O(log n), код короче сегментного дерева для сумм.',
      },
      { id: 'der7-h2', type: 'heading', level: 2, text: 'Зачем выражение i & -i' },
      {
        id: 'der7-p2',
        type: 'paragraph',
        text: 'В двоичном виде i & -i выделяет младший единичный бит. Им сдвигаемся при обходе: в sum идём «вниз» по дереву индексов (i -= i & -i), в add — «вверх» покрывая старшие блоки (i += i & -i). Не обязано быть прозрачно с первого раза; попробуйте на бумаге для i = 13 (1101₂) проследить шаги.',
      },
      {
        id: 'der7-c1',
        type: 'code',
        language: 'js',
        editable: false,
        code: `class Fenwick {
  constructor(n) { this.n = n; this.t = new Array(n + 1).fill(0); }
  /** delta на позиции i (1..n) */
  add(i, delta) {
    for (; i <= this.n; i += i & -i) this.t[i] += delta;
  }
  /** сумма [1..i] */
  sum(i) {
    let s = 0;
    for (; i > 0; i -= i & -i) s += this.t[i];
    return s;
  }
  rangeSum(l, r) {
    return this.sum(r) - this.sum(l - 1);
  }
}`,
      },
      {
        id: 'der7-p3',
        type: 'paragraph',
        text: 'Сумма на отрезке: prefix(r) − prefix(l−1). Классические задачи: подсчёт инверсий, динамические частоты значений. Если нужен min на отрезке или нет обратной операции — часто возвращаются к сегментному дереву.',
      },
      {
        id: 'der7-anim',
        type: 'animation',
        html:
          '<div class="viz-col"><div class="viz-caption">Индексы BIT (учебно): шаги по младшим битам</div><div class="viz-hint" id="der7-h"></div><div class="viz-grid" id="der7-g"></div></div>',
        css: '',
        js: `(function(){
  var g=document.getElementById('der7-g');
  var hint=document.getElementById('der7-h');
  var idx=[1,2,3,4,5,6,7,8];
  idx.forEach(function(i){
    var c=document.createElement('div');
    c.className='viz-cell';
    c.innerHTML='<span class="viz-cell__sub">i</span><span class="viz-cell__main">'+i+'</span>';
    g.appendChild(c);
  });
  hint.textContent='sum(6): 6→4→0 вычитая младшие биты (6&-6=2, 4&-4=4)';
  var cells=g.querySelectorAll('.viz-cell');
  var path=[5,3,0];
  var step=0;
  setInterval(function(){
    cells.forEach(function(el){ el.classList.remove('viz-cell--active','viz-cell--success'); });
    if(path[step]!=null) cells[path[step]].classList.add('viz-cell--active');
    step=(step+1)%4;
  },700);
})();`,
        width: '100%',
        height: 200,
        showPlayButton: true,
        vizLayout: 'default',
      },
      link('der7-l1', 'Fenwick tree — Wikipedia', 'https://en.wikipedia.org/wiki/Fenwick_tree'),
    ],
  },
];
