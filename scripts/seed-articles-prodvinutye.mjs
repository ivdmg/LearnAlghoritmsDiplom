/** Продвинутые темы — развёрнутые статьи */

const link = (id, text, href) => ({
  id,
  type: 'link',
  text,
  href,
  target: href.startsWith('http') ? '_blank' : '_self',
});

export const articles = [
  {
    id: 'prod-strings',
    topicId: 'prodvinutye',
    subtopicId: 'st-prod-1',
    title: 'Алгоритмы на строках: KMP, Z-функция, Rabin–Karp',
    blocks: [
      { id: 'pr1-h1', type: 'heading', level: 1, text: 'Поиск подстроки быстрее, чем наивный O(n·m)' },
      {
        id: 'pr1-p1',
        type: 'paragraph',
        text: 'Наивный метод сравнивает образец со всеми сдвигами текста. При несовпадении на позиции j откатывается на один символ текста — и начинает образец с нуля. KMP (Кнут–Моррис–Пратт) использует информацию: какой самый длинный префикс образца уже совпал с суффиксом прочитанной части, чтобы не «забывать» уже известное.',
      },
      { id: 'pr1-h2', type: 'heading', level: 2, text: 'Префикс-функция π' },
      {
        id: 'pr1-p2',
        type: 'paragraph',
        text: 'π[i] — длина самого длинного собственного префикса подстроки s[0…i], который одновременно является суффиксом этой подстроки. Собственный значит не вся строка. Строится за O(m) одним проходом с «откатом» указателя j.',
      },
      {
        id: 'pr1-c1',
        type: 'code',
        language: 'js',
        editable: false,
        code: `function prefixFunction(s) {
  const pi = new Array(s.length).fill(0);
  for (let i = 1; i < s.length; i++) {
    let j = pi[i - 1];
    while (j > 0 && s[i] !== s[j]) j = pi[j - 1];
    if (s[i] === s[j]) j++;
    pi[i] = j;
  }
  return pi;
}`,
      },
      {
        id: 'pr1-c2',
        type: 'code',
        language: 'js',
        editable: false,
        code: `function kmpSearch(text, pat) {
  const pi = prefixFunction(pat);
  const res = [];
  let j = 0;
  for (let i = 0; i < text.length; i++) {
    while (j > 0 && text[i] !== pat[j]) j = pi[j - 1];
    if (text[i] === pat[j]) j++;
    if (j === pat.length) {
      res.push(i - pat.length + 1);
      j = pi[j - 1];
    }
  }
  return res;
}`,
      },
      { id: 'pr1-h3', type: 'heading', level: 2, text: 'Z-функция' },
      {
        id: 'pr1-p3',
        type: 'paragraph',
        text: 'z[i] — длина максимального префикса строки s, совпадающего с подстрокой, начинающейся в i. Строится за O(n) с окном [l,r], внутри которого уже известно совпадение с префиксом. Удобна для подсчёта вхождений: склеить pattern#text и смотреть z на границах.',
      },
      {
        id: 'pr1-c3',
        type: 'code',
        language: 'js',
        editable: false,
        code: `function zFunction(s) {
  const n = s.length;
  const z = new Array(n).fill(0);
  let l = 0, r = 0;
  for (let i = 1; i < n; i++) {
    if (i <= r) z[i] = Math.min(r - i + 1, z[i - l]);
    while (i + z[i] < n && s[z[i]] === s[i + z[i]]) z[i]++;
    if (i + z[i] - 1 > r) { l = i; r = i + z[i] - 1; }
  }
  return z;
}`,
      },
      { id: 'pr1-h4', type: 'heading', level: 2, text: 'Rabin–Karp: хеш как «отпечаток» подстроки' },
      {
        id: 'pr1-p4',
        type: 'paragraph',
        text: 'Выбираем модуль p и основание b. Хеш длины m обновляется за O(1) при сдвиге окна (убрали старший символ, добавили новый). Совпадение хешей — кандидат; ложные срабатывания снимаются второй проверкой или вторым модулем (double hashing). Среднее время близко к линейному, худшее при специально подобранных анти-хешах — O(n·m); в соревнованиях используют два 64-битных модуля или random base.',
      },
      {
        id: 'pr1-c4',
        type: 'code',
        language: 'js',
        editable: false,
        code: `function rabinKarp(text, pat, p = 1e9 + 7, b = 911382323) {
  const n = text.length, m = pat.length;
  if (m > n) return [];
  let h = 0, hp = 0, pw = 1;
  for (let i = 0; i < m; i++) {
    h = (h * b + text.charCodeAt(i)) % p;
    hp = (hp * b + pat.charCodeAt(i)) % p;
    if (i) pw = (pw * b) % p;
  }
  const out = [];
  for (let i = 0; i <= n - m; i++) {
    if (h === hp && text.slice(i, i + m) === pat) out.push(i);
    if (i < n - m) {
      h = (h - text.charCodeAt(i) * pw % p + p) % p;
      h = (h * b + text.charCodeAt(i + m)) % p;
    }
  }
  return out;
}`,
      },
      { id: 'pr1-h5', type: 'heading', level: 2, text: 'Что выбрать' },
      {
        id: 'pr1-p5',
        type: 'paragraph',
        text: 'KMP/Z — детерминированно O(n+m), предсказуемо. Rabin–Karp — простой для нескольких образцов одной длины, для 2D-подстрок; нужна осторожность с коллизиями. Для больших алфавитов и онлайн-потоков иногда используют суффиксные структуры (дерево/автомат) — отдельная большая тема.',
      },
      { id: 'pr1-h6', type: 'heading', level: 2, text: 'Автомат Ахо–Корасик (много образцов сразу)' },
      {
        id: 'pr1-p6',
        type: 'paragraph',
        text: 'Обобщение префикс-функции на trie из всех шаблонов. У каждой вершины trie есть суффиксная ссылка на самый длинный суффикс, который тоже префикс какого-то шаблона. Один проход по тексту длины n — O(n + совпадения + сумма длин образцов). Незаменим при фильтрации спама по словарю ключевых слов.',
      },
      { id: 'pr1-h7', type: 'heading', level: 2, text: 'Манакер для палиндромов' },
      {
        id: 'pr1-p7',
        type: 'paragraph',
        text: 'За O(n) находит радиусы палиндромов в каждом центре (чётная/нечётная длина — два прохода или трюк с разделителями). Полезно в задачах на симметрию строки.',
      },
      { id: 'pr1-h8', type: 'heading', level: 2, text: 'Нюансы хеширования строк' },
      {
        id: 'pr1-p8',
        type: 'paragraph',
        text: 'Один модуль и фиксированное основание уязвимы к анти-тестам в хакерских соревнованиях. Два независимых модуля или случайное основание при старте снижают вероятность коллизии. Для криптографии нужны настоящие криптостойкие хеши — это другая лига.',
      },
      {
        id: 'pr1-anim',
        type: 'animation',
        html:
          '<div class="viz-col"><div class="viz-caption">KMP: при несовпадении сдвигаем образец по π, не текст с «нуля»</div><div class="viz-hint" id="pr1-h"></div><div class="viz-row" id="pr1-r"></div></div>',
        css: '',
        js: `(function(){
  var row=document.getElementById('pr1-r');
  var hint=document.getElementById('pr1-h');
  ['A','B','A','B','A'].forEach(function(c){
    var d=document.createElement('div');
    d.className='viz-cell viz-cell--shown';
    d.innerHTML='<span class="viz-cell__main">'+c+'</span>';
    row.appendChild(d);
  });
  hint.textContent='Префикс-функция подсказывает, куда «откатить» шаблон';
})();`,
        width: '100%',
        height: 140,
        showPlayButton: true,
        vizLayout: 'default',
      },
      link('pr1-l', 'KMP — Википедия', 'https://ru.wikipedia.org/wiki/Алгоритм_Кнута_—_Морриса_—_Пратта'),
    ],
  },
  {
    id: 'prod-sqrt',
    topicId: 'prodvinutye',
    subtopicId: 'st-prod-2',
    title: 'Sqrt-decomposition: корневое разбиение массива',
    blocks: [
      { id: 'pr2-h1', type: 'heading', level: 1, text: 'Идея: разбить n на блоки размера ≈ √n' },
      {
        id: 'pr2-p1',
        type: 'paragraph',
        text: 'Много запросов на массив: обновление одного элемента и сумма на отрезке. Дерево отрезков — O(log n). Sqrt-decomposition — проще в реализации: предпосчитываем агрегат (сумму, min) на каждом блоке. Запрос [l,r] = неполные края в O(√n) + полные блоки между ними за число блоков O(√n). Итого O(√n) на запрос, предобработка O(n).',
      },
      { id: 'pr2-h2', type: 'heading', level: 2, text: 'Структура' },
      {
        id: 'pr2-p2',
        type: 'paragraph',
        text: 'blockId(i) = Math.floor(i / B), B = ceil(sqrt(n)). Массив blockSum[k] хранит сумму k-го блока. При a[i] += v добавляем v к blockSum[blockId(i)] и к a[i]. На запросе перебираем элементы от l до min(r, конец блока l), затем целые блоки циклом, затем хвост.',
      },
      {
        id: 'pr2-c1',
        type: 'code',
        language: 'js',
        editable: false,
        code: `class SqrtSum {
  constructor(a) {
    this.a = [...a];
    this.n = a.length;
    this.B = Math.ceil(Math.sqrt(this.n)) || 1;
    const nb = Math.ceil(this.n / this.B);
    this.bSum = new Array(nb).fill(0);
    for (let i = 0; i < this.n; i++) this.bSum[this.bi(i)] += this.a[i];
  }
  bi(i) { return Math.floor(i / this.B); }
  add(i, v) {
    this.a[i] += v;
    this.bSum[this.bi(i)] += v;
  }
  sum(l, r) {
    let s = 0;
    if (this.bi(l) === this.bi(r)) {
      for (let i = l; i <= r; i++) s += this.a[i];
      return s;
    }
    const endL = (this.bi(l) + 1) * this.B - 1;
    for (let i = l; i <= endL; i++) s += this.a[i];
    const startR = this.bi(r) * this.B;
    for (let b = this.bi(l) + 1; b < this.bi(r); b++) s += this.bSum[b];
    for (let i = startR; i <= r; i++) s += this.a[i];
    return s;
  }
}`,
      },
      { id: 'pr2-h3', type: 'heading', level: 2, text: 'Алгоритм Мо на запросах отрезков' },
      {
        id: 'pr2-p3',
        type: 'paragraph',
        text: 'Если запросы офлайн, можно отсортировать их в особом порядке (по блоку левой границы, внутри — по правой) и двигать указатели L,R, поддерживая текущий ответ за O(1) на шаг. Сложность O((n+q)·√n) для аддитивных функций — классика на соревнованиях.',
      },
      { id: 'pr2-h4', type: 'heading', level: 2, text: 'Когда sqrt, а когда дерево' },
      {
        id: 'pr2-p4',
        type: 'paragraph',
        text: 'Sqrt проще кодить под нестандартные операции и офлайн-задачи. Дерево отрезков / Fenwick — быстрее онлайн при больших ограничениях. Гибриды: «lazy sqrt» на блоках с внутренними деревьями.',
      },
      { id: 'pr2-h5', type: 'heading', level: 2, text: 'Lazy на блоке' },
      {
        id: 'pr2-p5',
        type: 'paragraph',
        text: 'Если на отрезке нужно прибавить константу ко всем элементам, можно хранить addTag на блоке и «проталкивать» при точечном доступе. Запрос суммы на отрезке: полные блоки — сумма blockSum + длина·tag; куски поэлементно с учётом тега.',
      },
      { id: 'pr2-h6', type: 'heading', level: 2, text: 'Идея Мо: сортировка запросов' },
      {
        id: 'pr2-p6',
        type: 'paragraph',
        text: 'Запросы (L,R). Блокируем L по √n: внутри блока сортируем по R (на чётных блоках по возрастанию R, на нечётных — по убыванию — «змейка»). Двигаем границы текущего отрезка и обновляем ответ за O(1) на шаг. Сложность O((n+q)√n) при аддитивной функции.',
      },
      {
        id: 'pr2-anim',
        type: 'animation',
        html:
          '<div class="viz-col"><div class="viz-caption">Блоки длины B ≈ √n</div><div class="viz-hint" id="pr2-h"></div><div class="viz-chart" id="pr2-ch"></div></div>',
        css: '',
        js: `(function(){
  var chart=document.getElementById('pr2-ch');
  var hint=document.getElementById('pr2-h');
  var a=[3,1,4,1,5,9,2,6,5,3,5,8];
  var maxV=VizBars.maxOf(a);
  VizBars.render(chart,a,{max:maxV});
  VizBars.setZone(chart,0,3,'viz-bar-col--zone-a');
  VizBars.setZone(chart,8,11,'viz-bar-col--zone-b');
  hint.textContent='Середина — целые блоки, края — поэлементно';
})();`,
        width: '100%',
        height: 210,
        showPlayButton: true,
        vizLayout: 'default',
      },
      link('pr2-l', 'Sqrt decomposition — Wikipedia', 'https://en.wikipedia.org/wiki/Square_root_decomposition'),
    ],
  },
  {
    id: 'prod-flow',
    topicId: 'prodvinutye',
    subtopicId: 'st-prod-3',
    title: 'Потоки в сети: max flow, Edmonds–Karp',
    blocks: [
      { id: 'pr3-h1', type: 'heading', level: 1, text: 'Поток: сколько «воды» пройдёт от истока к стоку' },
      {
        id: 'pr3-p1',
        type: 'paragraph',
        text: 'Ориентированный граф, у каждого ребра пропускная способность. Поток не превышает пропускную способность на ребре, и для каждой вершины кроме s и t входящий поток равен исходящему (закон сохранения). Ищем максимальный поток.',
      },
      { id: 'pr3-h2', type: 'heading', level: 2, text: 'Ford–Fulkerson: идея дополняющих путей' },
      {
        id: 'pr3-p2',
        type: 'paragraph',
        text: 'Строим остаточную сеть: для ребра (u,v) с потоком f и ёмкостью c остаётся прямая дуга с остатком c−f и обратная с f (чтобы можно было «откатить» поток). Пока в остаточной сети есть путь s→t (BFS/DFS), накидываем поток на минимальный остаток вдоль пути. Суммарно для целых ёмкостей конечно.',
      },
      { id: 'pr3-h3', type: 'heading', level: 2, text: 'Edmonds–Karp: BFS по кратчайшему пути в рёбрах' },
      {
        id: 'pr3-p3',
        type: 'paragraph',
        text: 'Если каждый раз искать дополняющий путь кратчайшей длины в количестве рёбер (BFS), число итераций O(V·E), каждая BFS O(E), итого O(V·E²). Это гарантированный полином, в отличие от произвольного DFS, который на патологических графах может быть экспоненциальным по выбору путей.',
      },
      {
        id: 'pr3-c1',
        type: 'code',
        language: 'js',
        editable: false,
        code: `/** capacities[u][v], нет ребра = 0 */
function edmondsKarp(cap, s, t) {
  const n = cap.length;
  const flow = Array.from({ length: n }, () => Array(n).fill(0));
  let total = 0;
  for (;;) {
    const parent = new Array(n).fill(-1);
    const q = [s];
    parent[s] = s;
    for (let qi = 0; qi < q.length; qi++) {
      const u = q[qi];
      for (let v = 0; v < n; v++) {
        if (parent[v] !== -1) continue;
        const rem = cap[u][v] - flow[u][v];
        if (rem <= 0) continue;
        parent[v] = u;
        q.push(v);
      }
    }
    if (parent[t] === -1) break;
    let add = Infinity;
    for (let v = t; v !== s; v = parent[v]) {
      const u = parent[v];
      add = Math.min(add, cap[u][v] - flow[u][v]);
    }
    for (let v = t; v !== s; v = parent[v]) {
      const u = parent[v];
      flow[u][v] += add;
      flow[v][u] -= add;
    }
    total += add;
  }
  return total;
}`,
      },
      { id: 'pr3-h4', type: 'heading', level: 2, text: 'Теорема о максимальном потоке и минимальном разрезе' },
      {
        id: 'pr3-p4',
        type: 'paragraph',
        text: 'Величина максимального потока равна минимальной пропускной способности разреза (множество рёбер, отделяющее s от t). Практически: после алгоритма достижимые из s в остаточной сети — одна сторона разреза.',
      },
      { id: 'pr3-h5', type: 'heading', level: 2, text: 'Двудольное паросочетание' },
      {
        id: 'pr3-p5',
        type: 'paragraph',
        text: 'Сеть: s → все левые (ёмкость 1), рёбра графа → ёмкость 1, правые → t. Максимальный поток = размер максимального паросочетания (теорема Кёнига в двудольном случае связана с вершинным покрытием).',
      },
      { id: 'pr3-h6', type: 'heading', level: 2, text: 'Dinic и push-relabel' },
      {
        id: 'pr3-p6',
        type: 'paragraph',
        text: 'На плотных графах Edmonds–Karp может быть медленнее. Алгоритм Диница строит блочирующий поток в слоях BFS-дерева кратчайших путей; часто O(V²E) или лучше на практике. Push-relabel (preflow) — другой класс быстрых реализаций для соревнований.',
      },
      { id: 'pr3-h7', type: 'heading', level: 2, text: 'Минимальный разрез и приложения' },
      {
        id: 'pr3-p7',
        type: 'paragraph',
        text: 'Задача «минимально отрезать рёбра, чтобы отделить s от t» решается max-flow. В проектировании сетей, сегментации изображений (графы пикселей), планировании — одна и та же математическая сердцевина.',
      },
      { id: 'pr3-h8', type: 'heading', level: 2, text: 'Целочисленные потоки' },
      {
        id: 'pr3-p8',
        type: 'paragraph',
        text: 'Если все ёмкости целые, величина максимального потока целая, и Ford–Fulkerson с целыми дополнениями за конечное число шагов. Сумма ёмкостей исходящих из s — верхняя граница.',
      },
      {
        id: 'pr3-anim',
        type: 'animation',
        html:
          '<div class="viz-col"><div class="viz-caption">Остаточная сеть: по прямым рёбрам ещё можно «дожать» поток</div><div class="viz-hint" id="pr3-h"></div><div class="viz-row" id="pr3-r"></div></div>',
        css: '',
        js: `(function(){
  var row=document.getElementById('pr3-r');
  var hint=document.getElementById('pr3-h');
  ['s','→','u','→','v','→','t'].forEach(function(x){
    var d=document.createElement('div');
    d.className='viz-cell viz-cell--shown';
    d.innerHTML='<span class="viz-cell__main">'+x+'</span>';
    row.appendChild(d);
  });
  hint.textContent='BFS ищет путь с положительным остатком ёмкости';
})();`,
        width: '100%',
        height: 130,
        showPlayButton: true,
        vizLayout: 'default',
      },
      link('pr3-l', 'Max flow — Wikipedia', 'https://en.wikipedia.org/wiki/Maximum_flow_problem'),
    ],
  },
  {
    id: 'prod-linalg',
    topicId: 'prodvinutye',
    subtopicId: 'st-prod-4',
    title: 'Матрицы и быстрое возведение в степень',
    blocks: [
      { id: 'pr4-h1', type: 'heading', level: 1, text: 'Линейные рекуррентности через умножение матриц' },
      {
        id: 'pr4-p1',
        type: 'paragraph',
        text: 'Если состояние задачи — вектор фиксированной длины k, а шаг — линейное преобразование (умножение на матрицу k×k), то после n шагов состояние = M^n · v0. Вычислять M^n наивно O(k³·n), но бинарное возведение в степень даёт O(k³ log n).',
      },
      { id: 'pr4-h2', type: 'heading', level: 2, text: 'Фибоначчи матрицей 2×2' },
      {
        id: 'pr4-p2',
        type: 'paragraph',
        text: 'Вектор (F_n, F_{n+1})^T получается умножением [[0,1],[1,1]] на (F_{n-1}, F_n)^T. Значит (F_n, F_{n+1}) = M^n · (0,1)^T. Один log n шагов умножения 2×2.',
      },
      {
        id: 'pr4-c1',
        type: 'code',
        language: 'js',
        editable: false,
        code: `function matMul(A, B, mod) {
  const n = A.length, m = B[0].length, k = B.length;
  const C = Array.from({ length: n }, () => Array(m).fill(0));
  for (let i = 0; i < n; i++)
    for (let j = 0; j < m; j++)
      for (let t = 0; t < k; t++)
        C[i][j] = (C[i][j] + A[i][t] * B[t][j]) % mod;
  return C;
}
function matPow(M, p, mod) {
  let n = M.length;
  let R = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
  let A = M.map((row) => [...row]);
  while (p > 0) {
    if (p & 1) R = matMul(R, A, mod);
    A = matMul(A, A, mod);
    p >>= 1;
  }
  return R;
}`,
      },
      { id: 'pr4-h3', type: 'heading', level: 2, text: 'Число путей длины k в графе' },
      {
        id: 'pr4-p3',
        type: 'paragraph',
        text: 'Пусть A — матрица смежности (A[i][j]=1 если есть ребро i→j). Тогда (A^k)[i][j] — число путей из i в j ровно из k рёбер. Степень считаем бинарно, умножение матриц O(n³).',
      },
      { id: 'pr4-h4', type: 'heading', level: 2, text: 'Модуль и переполнение' },
      {
        id: 'pr4-p4',
        type: 'paragraph',
        text: 'В задачах «ответ по модулю p» каждое умножение и сложение берут по mod. В JS для больших чисел следите за BigInt или используйте int64-библиотеки; обычный Number теряет точность выше 2^53.',
      },
      { id: 'pr4-h5', type: 'heading', level: 2, text: 'Китайская теорема об остатках и большие степени' },
      {
        id: 'pr4-p5',
        type: 'paragraph',
        text: 'Если mod раскладывается на взаимно простые множители, можно считать ответ по каждому простому модулю и восстанавливать через CRT. Для простого модуля иногда применим малый тест Ферма a^(p-1)≡1 для обратного элемента.',
      },
      { id: 'pr4-h6', type: 'heading', level: 2, text: 'Линейные рекуррентности высокого порядка' },
      {
        id: 'pr4-p6',
        type: 'paragraph',
        text: 'Если a_n = c1 a_{n-1} + … + ck a_{n-k}, строится матрица k×k сдвига состояния (a_{n-1}…a_{n-k}) и умножается на характеристический вид. Алгоритм Берлекэмпа–Масси по последовательности восстанавливает минимальную рекуррентность — продвинутый инструмент.',
      },
      {
        id: 'pr4-c2',
        type: 'code',
        language: 'js',
        editable: false,
        code: `/** F_n mod MOD через матрицу 2x2 */
function fibMod(n, MOD) {
  const mul = (A, B) => {
    const a = (A[0][0]*B[0][0] + A[0][1]*B[1][0]) % MOD;
    const b = (A[0][0]*B[0][1] + A[0][1]*B[1][1]) % MOD;
    const c = (A[1][0]*B[0][0] + A[1][1]*B[1][0]) % MOD;
    const d = (A[1][0]*B[0][1] + A[1][1]*B[1][1]) % MOD;
    return [[a,b],[c,d]];
  };
  const id = [[1,0],[0,1]];
  if (n === 0) return 0;
  let M = [[0,1],[1,1]], res = id, e = n;
  while (e > 0) {
    if (e & 1) res = mul(res, M);
    M = mul(M, M);
    e >>= 1;
  }
  /* M^n = [[F_{n-1}, F_n],[F_n, F_{n+1}]] */
  return res[0][1];
}`,
      },
      {
        id: 'pr4-anim',
        type: 'animation',
        html:
          '<div class="viz-col"><div class="viz-caption">M^8 = ((((M^2)^2)^2)) — логарифм числа умножений</div><div class="viz-hint" id="pr4-h"></div><div class="viz-badge" id="pr4-b">exp</div></div>',
        css: '',
        js: `(function(){
  var hint=document.getElementById('pr4-h');
  var b=document.getElementById('pr4-b');
  var e=1;
  setInterval(function(){
    b.textContent='степень '+e;
    hint.textContent='Бинарное разложение: умножаем только где бит exp = 1';
    e=(e%64)+1;
  },500);
})();`,
        width: '100%',
        height: 120,
        showPlayButton: true,
        vizLayout: 'default',
      },
      link('pr4-l', 'Exponentiation by squaring — Wikipedia', 'https://en.wikipedia.org/wiki/Exponentiation_by_squaring'),
    ],
  },
];
