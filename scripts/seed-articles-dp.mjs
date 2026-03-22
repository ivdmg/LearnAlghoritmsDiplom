/** Динамическое программирование — развёрнутые статьи по подтемам роадмапа */

const link = (id, text, href) => ({
  id,
  type: 'link',
  text,
  href,
  target: href.startsWith('http') ? '_blank' : '_self',
});

export const articles = [
  {
    id: 'dp-basics',
    topicId: 'dp',
    subtopicId: 'st-dp-1',
    title: 'Базовые задачи ДП: Фибоначчи, пути в сетке',
    blocks: [
      { id: 'dp1-h1', type: 'heading', level: 1, text: 'Динамическое программирование — когда грубая сила повторяет одно и то же' },
      {
        id: 'dp1-p1',
        type: 'paragraph',
        text: 'Представьте, что вы считаете числа Фибоначчи наивной рекурсией: fib(5) вызывает fib(4) и fib(3), fib(4) снова вызывает fib(3) и fib(2)… Один и тот же fib(3) пересчитывается снова и снова. Это и есть перекрывающиеся подзадачи. Динамическое программирование (ДП) — способ запоминать уже посчитанное и не делать лишнюю работу.',
      },
      {
        id: 'dp1-p2',
        type: 'paragraph',
        text: 'Второй кирпич — оптимальная подструктура: оптимальное решение задачи составлено из оптимальных решений подзадач меньшего размера. Если оба свойства есть, часто можно выписать рекуррентную формулу и заполнить таблицу.',
      },
      { id: 'dp1-h2', type: 'heading', level: 2, text: 'Два стиля: мемоизация и таблица' },
      {
        id: 'dp1-p3',
        type: 'paragraph',
        text: 'Мемоизация (сверху вниз): пишем рекурсию «как в лоб», но перед вычислением смотрим в кэш; после — кладём результат. Табуляция (снизу вверх): явно перебираем состояния от малых к большим в циклах. Оба подхода дают одинаковую асимптотику, если состояния одни и те же; мемоизация иногда проще для нестандартного порядка, табуляция — для экономии памяти (скользящие массивы).',
      },
      {
        id: 'dp1-c1',
        type: 'code',
        language: 'js',
        editable: false,
        code: `const memo = new Map();
function fibMemo(n) {
  if (n <= 1) return n;
  if (memo.has(n)) return memo.get(n);
  const v = fibMemo(n - 1) + fibMemo(n - 2);
  memo.set(n, v);
  return v;
}

function fibTab(n) {
  const dp = new Array(n + 1).fill(0);
  dp[1] = 1;
  for (let i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
  return dp[n];
}

function fibO1(n) {
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) [a, b] = [b, a + b];
  return n <= 1 ? n : b;
}`,
      },
      { id: 'dp1-h3', type: 'heading', level: 2, text: 'Пути в сетке: сколько способов дойти из левого верхнего угла в правый нижний' },
      {
        id: 'dp1-p4',
        type: 'paragraph',
        text: 'Разрешены только шаги вправо и вниз. Дойти в клетку (i,j) можно либо сверху (i-1,j), либо слева (i,j-1). Число способов: dp[i][j] = dp[i-1][j] + dp[i][j-1], база — первая строка и столбец единицами (если нет стен). Это классическая композиция подзадач: путь в цель = два непересекающихся класса предыдущих путей.',
      },
      {
        id: 'dp1-c2',
        type: 'code',
        language: 'js',
        editable: false,
        code: `/** grid[i][j] === 1 — проходима, 0 — стена */
function uniquePaths(grid) {
  const n = grid.length, m = grid[0].length;
  const dp = Array.from({ length: n }, () => Array(m).fill(0));
  dp[0][0] = grid[0][0] ? 1 : 0;
  for (let i = 0; i < n; i++)
    for (let j = 0; j < m; j++) {
      if (!grid[i][j]) { dp[i][j] = 0; continue; }
      if (i === 0 && j === 0) continue;
      const up = i > 0 ? dp[i - 1][j] : 0;
      const left = j > 0 ? dp[i][j - 1] : 0;
      dp[i][j] = up + left;
    }
  return dp[n - 1][m - 1];
}`,
      },
      { id: 'dp1-h4', type: 'heading', level: 2, text: 'Минимальная стоимость пути (не количество путей)' },
      {
        id: 'dp1-p5',
        type: 'paragraph',
        text: 'Если в каждой клетке штраф (или бонус), и нужно минимизировать сумму на пути вправо/вниз, переход тот же по направлению, но вместо суммы способов берём минимум: dp[i][j] = cost[i][j] + min(dp[i-1][j], dp[i][j-1]). Здесь уже не считаем варианты, а выбираем лучший среди двух предшественников — всё ещё ДП, но другая агрегатная операция.',
      },
      {
        id: 'dp1-c3',
        type: 'code',
        language: 'js',
        editable: false,
        code: `function minPathSum(cost) {
  const n = cost.length, m = cost[0].length;
  const dp = Array.from({ length: n }, () => Array(m).fill(Infinity));
  dp[0][0] = cost[0][0];
  for (let i = 0; i < n; i++)
    for (let j = 0; j < m; j++) {
      if (i === 0 && j === 0) continue;
      const up = i > 0 ? dp[i - 1][j] : Infinity;
      const le = j > 0 ? dp[i][j - 1] : Infinity;
      dp[i][j] = cost[i][j] + Math.min(up, le);
    }
  return dp[n - 1][m - 1];
}`,
      },
      { id: 'dp1-h5', type: 'heading', level: 2, text: 'Восстановление ответа' },
      {
        id: 'dp1-p6',
        type: 'paragraph',
        text: 'Часто нужен не только число, но и сам путь. После заполнения dp идём от (n-1,m-1) к (0,0): на каждом шаге смотрим, откуда пришло оптимальное значение (где был min или откуда шла сумма способов). Если равенство — можно брать любой вариант или все (в зависости от задачи).',
      },
      { id: 'dp1-h6', type: 'heading', level: 2, text: 'Типичные ошибки' },
      {
        id: 'dp1-p7',
        type: 'paragraph',
        text: 'Путаница порядка циклов при сжатии памяти: для некоторых задач нужно идти в определённом направлении, иначе перезапишем ещё не использованное состояние. Забытая база или неверный диапазон индексов. Попытка жадного выбора там, где локально оптимальный шаг ломает глобальный оптимум — тогда нужно именно ДП или другой метод.',
      },
      { id: 'dp1-h7', type: 'heading', level: 2, text: 'Лестница: сколько способов подняться на n ступенек за шаги 1 или 2' },
      {
        id: 'dp1-p8',
        type: 'paragraph',
        text: 'Состояние dp[i] — число способов попасть на ступень i. Переход: с i-1 или с i-2, значит dp[i] = dp[i-1] + dp[i-2]. База dp[0]=1, dp[1]=1. Это снова Фибоначчи в другой одежде: одна и та же рекуррентность встречается в десятках задач.',
      },
      {
        id: 'dp1-c4',
        type: 'code',
        language: 'js',
        editable: false,
        code: `function climbStairs(n) {
  let a = 1, b = 1;
  for (let i = 2; i <= n; i++) [a, b] = [b, a + b];
  return b;
}`,
      },
      { id: 'dp1-h8', type: 'heading', level: 2, text: 'Наибольшая общая подпоследовательность (LCS) — два измерения' },
      {
        id: 'dp1-p9',
        type: 'paragraph',
        text: 'Строки A и B. dp[i][j] — длина LCS префиксов A[0..i) и B[0..j). Если символы равны — dp[i][j]=1+dp[i-1][j-1]; иначе max(dp[i-1][j], dp[i][j-1]). Ответ dp[n][m], время O(nm). Восстановление строки: идём из угла, сравниваем с соседними ячейками.',
      },
      {
        id: 'dp1-c5',
        type: 'code',
        language: 'js',
        editable: false,
        code: `function lcsLen(a, b) {
  const n = a.length, m = b.length;
  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  for (let i = 1; i <= n; i++)
    for (let j = 1; j <= m; j++)
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
  return dp[n][m];
}`,
      },
      { id: 'dp1-h9', type: 'heading', level: 2, text: 'Сжатие памяти в сетке до двух строк' },
      {
        id: 'dp1-p10',
        type: 'paragraph',
        text: 'Если для перехода по строке i нужна только строка i-1, храним два массива prev и cur длины m или один массив и перезаписываем в правильном порядке. Память O(m) вместо O(nm). Для восстановления пути нужна вся таблица или битовые маски направлений.',
      },
      { id: 'dp1-h10', type: 'heading', level: 2, text: 'Как узнать, что перед вами ДП' },
      {
        id: 'dp1-p11',
        type: 'paragraph',
        text: 'Спрашивают «число способов», «да/нет достижимости суммы», минимум/максимум на разбиении, задача разбита на подзадачи меньшего размера с пересечением подзадач. Если полный перебор экспоненциален, а подзадач полиномиально много — кандидат на ДП. Если жадный алгоритм доказуемо оптимален — ДП может быть избыточно, но часто проще сначала найти контрпример к жадности.',
      },
      {
        id: 'dp1-anim',
        type: 'animation',
        html:
          '<div class="viz-col"><div class="viz-caption">Подсветка пути в сетке (значения — условные накопленные суммы)</div><div class="viz-hint" id="dp1-h"></div><div class="viz-grid" id="dp1-g"></div></div>',
        css: '',
        js: `(function(){
  var g=document.getElementById('dp1-g');
  var hint=document.getElementById('dp1-h');
  var vals=['1','4','7','2','5','8','3','6','9'];
  vals.forEach(function(v,i){
    var c=document.createElement('div');
    c.className='viz-cell';
    c.innerHTML='<span class="viz-cell__main">'+v+'</span>';
    g.appendChild(c);
  });
  var path=[0,1,4,7,8];
  var k=0;
  setInterval(function(){
    var ch=g.children;
    for(var i=0;i<ch.length;i++) ch[i].classList.remove('viz-cell--active','viz-cell--success');
    for(var j=0;j<=k;j++) ch[path[j]].classList.add(j===k?'viz-cell--active':'viz-cell--success');
    hint.textContent='Восстановление: откуда пришло минимум/максимум';
    k=(k+1)%path.length;
  },700);
})();`,
        width: '100%',
        height: 220,
        showPlayButton: true,
        vizLayout: 'default',
      },
      link('dp1-l', 'Динамическое программирование — Википедия', 'https://ru.wikipedia.org/wiki/Динамическое_программирование'),
    ],
  },
  {
    id: 'dp-knapsack',
    topicId: 'dp',
    subtopicId: 'st-dp-2',
    title: 'Задача о рюкзаке: 0/1, unbounded, варианты',
    blocks: [
      { id: 'dp2-h1', type: 'heading', level: 1, text: 'Рюкзак — эталонная модель «выбрать подмножество с ограничением»' },
      {
        id: 'dp2-p1',
        type: 'paragraph',
        text: 'Есть предметы с весом и ценностью, вместимость рюкзака W. В версии 0/1 каждый предмет берём не больше одного раза. В unbounded (полный, неограниченный) каждый тип можно брать сколько угодно раз. Задача: максимизировать суммарную ценность без превышения веса.',
      },
      { id: 'dp2-h2', type: 'heading', level: 2, text: '0/1 knapsack: двумерная таблица' },
      {
        id: 'dp2-p2',
        type: 'paragraph',
        text: 'Состояние dp[i][w] — максимальная ценность, используя первые i предметов и суммарный вес не больше w. Переход: не брать i-й → dp[i-1][w]; брать (если w>=weight[i]) → value[i] + dp[i-1][w-weight[i]]. Берём максимум. Ответ dp[n][W]. Время O(n·W), память O(n·W).',
      },
      {
        id: 'dp2-c1',
        type: 'code',
        language: 'js',
        editable: false,
        code: `function knapsack01(weights, values, W) {
  const n = weights.length;
  const dp = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0));
  for (let i = 1; i <= n; i++)
    for (let w = 0; w <= W; w++) {
      dp[i][w] = dp[i - 1][w];
      if (w >= weights[i - 1]) {
        const take = values[i - 1] + dp[i - 1][w - weights[i - 1]];
        dp[i][w] = Math.max(dp[i][w], take);
      }
    }
  return dp[n][W];
}`,
      },
      { id: 'dp2-h3', type: 'heading', level: 2, text: 'Сжатие до одного массива' },
      {
        id: 'dp2-p3',
        type: 'paragraph',
        text: 'Заметим, что строка i зависит только от строки i-1. Можно держать один массив длины W+1 и обновлять w справа налево (от W к 0), чтобы не использовать уже обновлённое значение как «предыдущую строку». Если идти слева направо, один предмет может учесться несколько раз — это уже другая задача.',
      },
      {
        id: 'dp2-c2',
        type: 'code',
        language: 'js',
        editable: false,
        code: `function knapsack01Space(weights, values, W) {
  const dp = new Array(W + 1).fill(0);
  for (let i = 0; i < weights.length; i++)
    for (let w = W; w >= weights[i]; w--)
      dp[w] = Math.max(dp[w], values[i] + dp[w - weights[i]]);
  return dp[W];
}`,
      },
      { id: 'dp2-h4', type: 'heading', level: 2, text: 'Unbounded knapsack: порядок циклов решает всё' },
      {
        id: 'dp2-p4',
        type: 'paragraph',
        text: 'Когда предметов каждого типа бесконечно, переход: dp[w] = max по предметам (value[i] + dp[w - weight[i]]). Если внешний цикл по w от 0 до W, а внутренний по предметам, мы разрешаем повторное использование — потому что dp[w-weight] уже мог включать тот же тип. Для 0/1 тот же двойной цикл, но w идём назад — «запрет на повтор в одной итерации предмета».',
      },
      {
        id: 'dp2-c3',
        type: 'code',
        language: 'js',
        editable: false,
        code: `function unboundedKnapsack(weights, values, W) {
  const dp = new Array(W + 1).fill(0);
  for (let w = 1; w <= W; w++)
    for (let i = 0; i < weights.length; i++)
      if (w >= weights[i])
        dp[w] = Math.max(dp[w], values[i] + dp[w - weights[i]]);
  return dp[W];
}`,
      },
      { id: 'dp2-h5', type: 'heading', level: 2, text: 'Subset sum и разбиение на две равные суммы' },
      {
        id: 'dp2-p5',
        type: 'paragraph',
        text: 'Subset sum: есть ли подмножество с суммой ровно T? dp[i][s] или битсет по s. Partition: сумма всех чисел должна быть чётной; проверяем достижимость sum/2. Это частные случаи рюкзака, где «цена» = «вес».',
      },
      { id: 'dp2-h6', type: 'heading', level: 2, text: 'Почему жадность не всегда работает' },
      {
        id: 'dp2-p6',
        type: 'paragraph',
        text: 'Жадный выбор по соотношению value/weight может провалиться для 0/1 (целые предметы). Для дробного рюкзака (можно делить предметы) жадность по удельной ценности оптимальна — но это уже не целочисленное ДП.',
      },
      { id: 'dp2-h7', type: 'heading', level: 2, text: 'Ограниченный knapsack (ограниченное число копий)' },
      {
        id: 'dp2-p7',
        type: 'paragraph',
        text: 'У каждого типа k_i копий. Наивно разворачивать копии в k_i отдельных предметов раздувает n. Трюк бинарного разбиения: число k представляем как сумму степеней двойки (1,2,4,… остаток) — O(log k) «виртуальных» предметов на тип, каждый 0/1. Дальше обычный 0/1 knapsack.',
      },
      { id: 'dp2-h8', type: 'heading', level: 2, text: 'Монеты: количество способов набрать сумму' },
      {
        id: 'dp2-p8',
        type: 'paragraph',
        text: 'Набор номиналов, порядок не важен. Unbounded: dp[s] += dp[s - coin] для s от coin до S. 0/1 по каждому номиналу один раз: внутренний цикл по s от S вниз до coin. Перепутанный порядок циклов даёт разные задачи (перестановки vs комбинации).',
      },
      {
        id: 'dp2-c4',
        type: 'code',
        language: 'js',
        editable: false,
        code: `/** число способов набрать сумму S монетами (порядок не важен), бесконечные монеты */
function coinChangeCombinations(coins, S) {
  const dp = new Array(S + 1).fill(0);
  dp[0] = 1;
  for (const c of coins)
    for (let s = c; s <= S; s++) dp[s] += dp[s - c];
  return dp[S];
}`,
      },
      { id: 'dp2-h9', type: 'heading', level: 2, text: 'Псевдополиномиальное время' },
      {
        id: 'dp2-p9',
        type: 'paragraph',
        text: 'Сложность O(n·W) зависит от числа W, а не только от размера записи числа в битах. Если W = 10^9, таблица не влезет и время огромно. Для «маленьких сумм» в задаче ДП по сумме идеально; для больших W ищут приближения, встречное встречное разбиение или другие методы.',
      },
      {
        id: 'dp2-anim',
        type: 'animation',
        html:
          '<div class="viz-col"><div class="viz-caption">Вместимость W: заполняем «лучшую ценность» по весу</div><div class="viz-hint" id="dp2-h"></div><div class="viz-chart" id="dp2-ch"></div></div>',
        css: '',
        js: `(function(){
  var chart=document.getElementById('dp2-ch');
  var hint=document.getElementById('dp2-h');
  var w=[0,2,5,8,10,12,14];
  var maxV=VizBars.maxOf(w);
  VizBars.render(chart,w,{max:maxV});
  hint.textContent='dp[w] растёт по мере учёта предметов (схема)';
  VizBars.setState(chart,w.length-1,'success');
})();`,
        width: '100%',
        height: 210,
        showPlayButton: true,
        vizLayout: 'default',
      },
      link('dp2-l', 'Задача о рюкзаке — Википедия', 'https://ru.wikipedia.org/wiki/Задача_о_рюкзаке'),
    ],
  },
  {
    id: 'dp-prefix',
    topicId: 'dp',
    subtopicId: 'st-dp-3',
    title: 'Оптимизация ДП: префиксы, суммы, скользящие идеи',
    blocks: [
      { id: 'dp3-h1', type: 'heading', level: 1, text: 'Префиксные суммы — фундамент быстрых отрезков' },
      {
        id: 'dp3-p1',
        type: 'paragraph',
        text: 'pref[i] = a[0]+…+a[i-1]. Сумма на [l,r) = pref[r]-pref[l] за O(1). В ДП часто нужно быстро получить сумму подмассива, заканчивающегося в j, с разными левыми границами — без префиксов получится O(n²) лишних суммирований.',
      },
      {
        id: 'dp3-c1',
        type: 'code',
        language: 'js',
        editable: false,
        code: `function prefixSums(a) {
  const p = new Array(a.length + 1).fill(0);
  for (let i = 0; i < a.length; i++) p[i + 1] = p[i] + a[i];
  return p;
}
function rangeSum(p, l, r) { return p[r + 1] - p[l]; }`,
      },
      { id: 'dp3-h2', type: 'heading', level: 2, text: 'Максимальная сумма подотрезка (Кадане)' },
      {
        id: 'dp3-p2',
        type: 'paragraph',
        text: 'dp заканчивается на i: либо расширяем предыдущий отрезок, либо начинаем заново в i. Формула: cur = max(a[i], cur + a[i]); ans = max(ans, cur). Линейное время, O(1) памяти. Это ДП, хотя часто называют просто «алгоритм Кадане».',
      },
      {
        id: 'dp3-c2',
        type: 'code',
        language: 'js',
        editable: false,
        code: `function maxSubarray(a) {
  let cur = a[0], best = a[0];
  for (let i = 1; i < a.length; i++) {
    cur = Math.max(a[i], cur + a[i]);
    best = Math.max(best, cur);
  }
  return best;
}`,
      },
      { id: 'dp3-h3', type: 'heading', level: 2, text: 'НВП (LIS) и бинарный поиск' },
      {
        id: 'dp3-p3',
        type: 'paragraph',
        text: 'Наивно dp[i] = 1 + max(dp[j]) для j<i с a[j]<a[i] — O(n²). Оптимизация: поддерживаем массив tails[k] — минимальный хвост возрастающей подпоследовательности длины k+1. Новый элемент ищем позицию lower_bound в tails — O(n log n).',
      },
      {
        id: 'dp3-c3',
        type: 'code',
        language: 'js',
        editable: false,
        code: `function lisLength(a) {
  const tails = [];
  for (const x of a) {
    let lo = 0, hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid] < x) lo = mid + 1;
      else hi = mid;
    }
    if (lo === tails.length) tails.push(x);
    else tails[lo] = x;
  }
  return tails.length;
}`,
      },
      { id: 'dp3-h4', type: 'heading', level: 2, text: 'Разность массивов (difference array)' },
      {
        id: 'dp3-p4',
        type: 'paragraph',
        text: 'Много запросов «прибавить v на [l,r]» на статичном массиве: diff[l]+=v, diff[r+1]-=v; потом префиксная сумма diff восстанавливает значения. Часто комбинируют с ДП по событиям на оси.',
      },
      { id: 'dp3-h5', type: 'heading', level: 2, text: 'Конвейерная оптимизация' },
      {
        id: 'dp3-p5',
        type: 'paragraph',
        text: 'Если переход dp[i] зависит только от окна dp[i-k]…dp[i-1], можно deque монотонный для min/max в окне (как в скользящем окне). Тогда вместо O(n·k) получаем O(n).',
      },
      { id: 'dp3-h6', type: 'heading', level: 2, text: 'Edit distance (расстояние Левенштейна)' },
      {
        id: 'dp3-p6',
        type: 'paragraph',
        text: 'dp[i][j] — минимальное число операций (вставка, удаление, замена), чтобы превратить префикс A[0..i) в B[0..j). Три-четыре случая перехода, ответ dp[n][m]. Классика двумерной ДП с префиксной идеей «стоимости хвоста».',
      },
      {
        id: 'dp3-c4',
        type: 'code',
        language: 'js',
        editable: false,
        code: `function editDistance(a, b) {
  const n = a.length, m = b.length;
  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  for (let i = 0; i <= n; i++) dp[i][0] = i;
  for (let j = 0; j <= m; j++) dp[0][j] = j;
  for (let i = 1; i <= n; i++)
    for (let j = 1; j <= m; j++) {
      const c = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + c,
      );
    }
  return dp[n][m];
}`,
      },
      { id: 'dp3-h7', type: 'heading', level: 2, text: 'Битовый set для subset sum на больших n, малой сумме' },
      {
        id: 'dp3-p7',
        type: 'paragraph',
        text: 'Достижимые суммы хранят как биты BigInt или битовую маску: сдвиг влево на w и OR с текущей маской. Иногда быстрее, чем массив boolean, на компактных данных.',
      },
      {
        id: 'dp3-anim',
        type: 'animation',
        html:
          '<div class="viz-col"><div class="viz-caption">Префикс: сумма отрезка [0..i] — один индекс в массиве p</div><div class="viz-hint" id="dp3-h"></div><div class="viz-chart" id="dp3-ch"></div></div>',
        css: '',
        js: `(function(){
  var chart=document.getElementById('dp3-ch');
  var hint=document.getElementById('dp3-h');
  var a=[2,5,1,3,4];
  var p=[0];
  for(var i=0;i<a.length;i++) p.push(p[p.length-1]+a[i]);
  var vis=p.slice(1);
  var maxV=VizBars.maxOf(vis);
  VizBars.render(chart,vis,{max:maxV});
  hint.textContent='p[k] = сумма первых k элементов исходного массива';
})();`,
        width: '100%',
        height: 200,
        showPlayButton: true,
        vizLayout: 'default',
      },
      link('dp3-l', 'Префиксная сумма — Википедия', 'https://ru.wikipedia.org/wiki/Префиксная_сумма'),
    ],
  },
  {
    id: 'dp-bitmask',
    topicId: 'dp',
    subtopicId: 'st-dp-4',
    title: 'ДП по маскам битов (bitmask DP)',
    blocks: [
      { id: 'dp4-h1', type: 'heading', level: 1, text: 'Когда множество маленькое, его кодируют битами' },
      {
        id: 'dp4-p1',
        type: 'paragraph',
        text: 'Если n ≤ 20–22, подмножество {0,…,n-1} можно представить числом mask от 0 до 2^n-1: i-й бит = «элемент i выбран». Операции: проверка (mask >> i) & 1, включить mask | (1<<i), выключить mask & ~(1<<i), переключить mask ^ (1<<i). Так состояние ДП становится целым числом — компактно и быстро.',
      },
      { id: 'dp4-h2', type: 'heading', level: 2, text: 'TSP (коммивояжёр) и dp[mask][last]' },
      {
        id: 'dp4-p2',
        type: 'paragraph',
        text: 'Классика: обойти все вершины по рёбрам с минимальной суммой и вернуться (или не возвращаться — вариант). Состояние dp[mask][j] — минимальная стоимость пути, посетив ровно множество mask вершин, закончив в j. Переход: из предыдущей вершины k убрать j из маски и добавить вес ребра k→j. Сложность O(n²·2^n), память столько же (можно оптимизировать слоями по чётности popcount).',
      },
      {
        id: 'dp4-c1',
        type: 'code',
        language: 'js',
        editable: false,
        code: `/** dist[i][j] — матрица расстояний, n <= 18 */
function tsp(dist) {
  const n = dist.length;
  const FULL = (1 << n) - 1;
  const dp = Array.from({ length: 1 << n }, () => Array(n).fill(Infinity));
  dp[1][0] = 0;
  for (let mask = 1; mask <= FULL; mask++)
    for (let last = 0; last < n; last++) {
      if (dp[mask][last] === Infinity) continue;
      if (((mask >> last) & 1) === 0) continue;
      for (let nxt = 0; nxt < n; nxt++) {
        if ((mask >> nxt) & 1) continue;
        const nm = mask | (1 << nxt);
        dp[nm][nxt] = Math.min(dp[nm][nxt], dp[mask][last] + dist[last][nxt]);
      }
    }
  let ans = Infinity;
  for (let last = 1; last < n; last++)
    ans = Math.min(ans, dp[FULL][last] + dist[last][0]);
  return ans;
}`,
      },
      { id: 'dp4-h3', type: 'heading', level: 2, text: 'Назначения, подмножества задач, SOS DP' },
      {
        id: 'dp4-p3',
        type: 'paragraph',
        text: 'Маски используют в задачах «каждому сотруднику назначить уникальную задачу», покрытия битами, разбиения множества. SOS (Sum Over Subsets) DP — за O(n·2^n) считает суммы по всем подмаскам; нужна в некоторых подсчётах и вероятностях.',
      },
      { id: 'dp4-h4', type: 'heading', level: 2, text: 'Ограничения и подводные камни' },
      {
        id: 'dp4-p4',
        type: 'paragraph',
        text: '2^25 уже тяжело для времени и памяти. Порядок перебора масок важен, если нужны только подмаски. В JavaScript битовые операции работают с 32-битными знаковыми целыми — для n>30 нужен BigInt или другой подход.',
      },
      { id: 'dp4-h5', type: 'heading', level: 2, text: 'Перебор подмасок для фиксированной маски' },
      {
        id: 'dp4-p5',
        type: 'paragraph',
        text: 'Для mask цикл for (let s = mask; s > 0; s = (s - 1) & mask) перебирает все непустые подмаски за O(2^{popcount(mask)}). Полезно в комбинаторных ДП, когда нужно разбить множество на части.',
      },
      { id: 'dp4-h6', type: 'heading', level: 2, text: 'SOS DP (sum over subsets)' },
      {
        id: 'dp4-p6',
        type: 'paragraph',
        text: 'Если для каждой маски M нужно суммировать f[S] по всем S ⊆ M, наивно O(3^n). SOS за O(n·2^n): для каждого бита i обновляем все маски, где бит установлен, добавляя вклад от маски без этого бита. Применяют в подсчётах по AND/OR, в некоторых задачах на вероятностях.',
      },
      { id: 'dp4-h7', type: 'heading', level: 2, text: 'Назначение работников на задачи' },
      {
        id: 'dp4-p7',
        type: 'paragraph',
        text: 'n работников, n задач, стоимость c[i][j]. Состояние mask — какие задачи уже распределены, последний работник не обязателен в ключе, если задачи уникальны: dp[mask] = min по выбору следующей пары (работник, задача) с учётом уже занятых битов. Варианты с навыками «у работника подмножество допустимых задач» естественно кодируют битами.',
      },
      {
        id: 'dp4-c2',
        type: 'code',
        language: 'js',
        editable: false,
        code: `/** перебор всех подмасок mask (кроме 0) */
function forEachSubmask(mask, fn) {
  for (let s = mask; s > 0; s = (s - 1) & mask) fn(s);
}`,
      },
      {
        id: 'dp4-anim',
        type: 'animation',
        html:
          '<div class="viz-col"><div class="viz-caption">Маска: биты = какие города уже посетили</div><div class="viz-hint" id="dp4-h"></div><div class="viz-badge" id="dp4-b">mask</div></div>',
        css: '',
        js: `(function(){
  var hint=document.getElementById('dp4-h');
  var b=document.getElementById('dp4-b');
  var masks=[1,3,7,15];
  var i=0;
  setInterval(function(){
    b.textContent='mask = '+masks[i]+' (двоично: '+masks[i].toString(2)+')';
    hint.textContent='Каждый бит — посещена ли вершина с данным номером';
    i=(i+1)%masks.length;
  },900);
})();`,
        width: '100%',
        height: 140,
        showPlayButton: true,
        vizLayout: 'default',
      },
      link('dp4-l', 'Hamiltonian path — Wikipedia', 'https://en.wikipedia.org/wiki/Hamiltonian_path'),
    ],
  },
  {
    id: 'dp-tree-graph',
    topicId: 'dp',
    subtopicId: 'st-dp-5',
    title: 'ДП на деревьях и графах',
    blocks: [
      { id: 'dp5-h1', type: 'heading', level: 1, text: 'Дерево: один путь между вершинами — проще, чем общий граф' },
      {
        id: 'dp5-p1',
        type: 'paragraph',
        text: 'Выбираем корень. Поддерево узла v изолировано от остального дерева рёбрами только через v. Поэтому многие задачи решаются dfs(v): сначала рекурсия к детям, потом комбинируем их dp в ответ для v.',
      },
      { id: 'dp5-h2', type: 'heading', level: 2, text: 'Максимальное независимое множество в дереве' },
      {
        id: 'dp5-p2',
        type: 'paragraph',
        text: 'dp0[v] — оптимум в поддереве v, если v не берём в множество; dp1[v] — если берём (тогда детей нельзя). dp1[v] = a[v] + sum(dp0[child]); dp0[v] = sum(max(dp0[child], dp1[child])).',
      },
      {
        id: 'dp5-c1',
        type: 'code',
        language: 'js',
        editable: false,
        code: `function treeIndependentSet(g, root, weight) {
  function dfs(v, parent) {
    let take = weight[v], skip = 0;
    for (const to of g[v]) {
      if (to === parent) continue;
      const [t, s] = dfs(to, v);
      take += s;
      skip += Math.max(t, s);
    }
    return [take, skip];
  }
  const [take, skip] = dfs(root, -1);
  return Math.max(take, skip);
}`,
      },
      { id: 'dp5-h3', type: 'heading', level: 2, text: 'Диаметр дерева' },
      {
        id: 'dp5-p3',
        type: 'paragraph',
        text: 'В листьях высота 0. Для v берём два максимальных «плеча» среди детей; диаметр кандидат = сумма двух лучших + 2 (если вес ребра 1). Обновляем глобальный максимум. Один dfs — O(n).',
      },
      { id: 'dp5-h4', type: 'heading', level: 2, text: 'Rerooting (переподвешивание)' },
      {
        id: 'dp5-p4',
        type: 'paragraph',
        text: 'Если ответ зависит от выбора корня, делают первый dfs для подсчёта значений вниз, второй dfs — перенос значения при смене корня на соседа за O(1) амортизированно с префиксами/суффиксами по детям.',
      },
      { id: 'dp5-h5', type: 'heading', level: 2, text: 'DAG: динамика по топологическому порядке' },
      {
        id: 'dp5-p5',
        type: 'paragraph',
        text: 'В направленном ациклическом графе топосорт даёт порядок: все рёбра идут вперёд. Тогда dp[v] можно обновлять от уже обработанных предков: например, самый длинный путь, число путей, минимальная стоимость достижения.',
      },
      {
        id: 'dp5-c2',
        type: 'code',
        language: 'js',
        editable: false,
        code: `/** order — топологический порядок вершин */
function longestPathDAG(g, order, n) {
  const dp = Array(n).fill(0);
  for (const v of order)
    for (const to of g[v]) dp[to] = Math.max(dp[to], dp[v] + 1);
  return Math.max(...dp);
}`,
      },
      {
        id: 'dp5-p6',
        type: 'paragraph',
        text: 'Если в графе есть циклы, «простая» динамика по слоям не работает без дополнительной структуры (например, сжатие в SCC и ДП на конденсации).',
      },
      { id: 'dp5-h6', type: 'heading', level: 2, text: 'Максимальный путь в дереве (два BFS / один DFS)' },
      {
        id: 'dp5-p7',
        type: 'paragraph',
        text: 'Дважды: найти самую дальшую вершину от произвольного старта, потом от неё — расстояние до другой дальней даёт диаметр. Или один DFS с комбинированием двух лучших глубин среди детей — та же асимптотика O(n).',
      },
      { id: 'dp5-h7', type: 'heading', level: 2, text: 'Вершинное покрытие в дереве' },
      {
        id: 'dp5-p8',
        type: 'paragraph',
        text: 'Связано с независимым множеством в двудольном случае не всегда, но в дереве похожая двухцветная ДП: dp0[v] — минимальный размер покрытия в поддереве, если v не в покрытии (тогда все рёбра к детям закрыты детьми); dp1[v] — если v в покрытии. Формулы выводятся из локальных случаев.',
      },
      { id: 'dp5-h8', type: 'heading', level: 2, text: 'Количество путей в DAG' },
      {
        id: 'dp5-p9',
        type: 'paragraph',
        text: 'Топосорт: dp[v] += dp[u] для рёбер u→v, база dp[s]=1. За один проход считаем число путей из s во все вершины. Для «все пути в графе с циклами» без доп. ограничений может быть бесконечно.',
      },
      {
        id: 'dp5-c3',
        type: 'code',
        language: 'js',
        editable: false,
        code: `function pathCountDAG(g, order, s) {
  const n = g.length;
  const dp = new Array(n).fill(0);
  dp[s] = 1;
  for (const u of order)
    for (const v of g[u]) dp[v] += dp[u];
  return dp;
}`,
      },
      {
        id: 'dp5-anim',
        type: 'animation',
        html:
          '<div class="viz-col"><div class="viz-caption">Дерево: ответ в корне собирается из ответов детей</div><div class="viz-hint" id="dp5-h"></div><div class="viz-stack-v" id="dp5-st"></div></div>',
        css: '',
        js: `(function(){
  var st=document.getElementById('dp5-st');
  var hint=document.getElementById('dp5-h');
  ['dfs(2)','dfs(5)','dfs(1)'].forEach(function(t){
    var d=document.createElement('div');
    d.className='viz-cell viz-cell--shown';
    d.innerHTML='<span class="viz-cell__main">'+t+'</span>';
    st.appendChild(d);
  });
  hint.textContent='Стек DFS обходит поддеревья перед возвратом к родителю';
})();`,
        width: '100%',
        height: 180,
        showPlayButton: true,
        vizLayout: 'default',
      },
      link('dp5-l', 'Tree (graph theory) — Wikipedia', 'https://en.wikipedia.org/wiki/Tree_(graph_theory)'),
    ],
  },
];
