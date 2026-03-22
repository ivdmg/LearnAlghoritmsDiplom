/**
 * Статьи: темы «Сортировки» и «Поиск» (теория + код + анимации).
 * Запуск из корня: node scripts/merge-sort-poisk-articles.mjs
 */
export const SORT_POISK_ARTICLES = [
  // ─── Сортировки: введение ─────────────────────────────────────────────
  {
    id: 'sortirovki-intro',
    topicId: 'sortirovki',
    title: 'Сортировки: зачем нужны и как о них думать',
    blocks: [
      { id: 'h1', type: 'heading', level: 1, text: 'Сортировки: зачем нужны и как о них думать' },
      { id: 'p1', type: 'paragraph', text: 'Сортировка — это упорядочивание элементов последовательности по некоторому критерию: по возрастанию числа, по алфавиту строк, по приоритету задач. Почти в каждой области разработки встречается задача «расположить данные так, чтобы их было удобно искать, отображать или обрабатывать дальше».' },
      { id: 'p2', type: 'paragraph', text: 'Формально нужна функция сравнения (компаратор): для двух элементов a и b она говорит, кто «меньше». Для чисел это обычный порядок; для объектов — например, сначала по полю дата, потом по id. Если компаратор задаёт полный порядок без противоречий, любой корректный алгоритм сортировки выдаст однозначный результат (с учётом стабильности — см. ниже).' },
      { id: 'h2-why', type: 'heading', level: 2, text: 'Где это используется' },
      { id: 'p3', type: 'paragraph', text: 'Отсортированный массив позволяет искать элемент за O(log n) бинарным поиском вместо O(n) перебором. В базах данных и индексах порядок ключей — основа быстрых запросов. В интерфейсах списки часто показывают по рейтингу, дате или имени. В графах и жадных алгоритмах шаг «взять минимум» часто реализуется через очередь с приоритетом, которая внутри опирается на те же идеи, что и пирамидальная сортировка.' },
      { id: 'p4', type: 'paragraph', text: 'Иногда сортировка нужна не ради человека, а ради следующего алгоритма: например, два указателя на отсортированном массиве для поиска пары с заданной суммой, или слияние отсортированных потоков данных.' },
      { id: 'h2-classes', type: 'heading', level: 2, text: 'Классы сложности по времени' },
      { id: 'p5', type: 'paragraph', text: 'Пусть n — число элементов. Простейшие квадратичные методы (пузырёк, выбор, вставки) в типичной форме делают порядка n² сравнений или перестановок в худшем случае. Для тысяч элементов это ещё терпимо; для миллионов — уже нет.' },
      { id: 'p6', type: 'paragraph', text: 'Алгоритмы порядка O(n log n) — быстрая сортировка (в среднем), сортировка слиянием, пирамидальная — масштабируются на большие объёмы. Нижняя оценка Ω(n log n) для сортировок, основанных только на сравнениях, доказывается через дерево решений: различных порядков n! много, а каждое сравнение даёт бинарный выбор.' },
      { id: 'p7', type: 'paragraph', text: 'Если о ключах известно больше — например, целые числа в диапазоне от 0 до k — возможны линейные методы: сортировка подсчётом за O(n + k), поразрядная (radix) при подходящих основаниях. Они не сводятся к «универсальному компаратору» и требуют ограничений на данные.' },
      { id: 'h2-stable', type: 'heading', level: 2, text: 'Стабильность и работа «на месте»' },
      { id: 'p8', type: 'paragraph', text: 'Сортировка стабильна, если равные по ключу элементы сохраняют относительный порядок, как были во входе. Это важно при сортировке по нескольким полям: сначала стабильно по дате, потом по имени — или наоборот, в зависимости от стратегии. Слияние обычно стабильно; быстрая и пирамидальная — как правило, нет.' },
      { id: 'p9', type: 'paragraph', text: 'Сортировка на месте (in-place) использует O(1) дополнительной памяти кроме небольшого стека или счётчиков — удобно при ограниченной памяти. Классическая сортировка слиянием требует O(n) доп. массива; подсчёт и radix используют вспомогательные массивы под диапазон или корзины.' },
      { id: 'h2-choice', type: 'heading', level: 2, text: 'Как выбирать алгоритм на практике' },
      { id: 'p10', type: 'paragraph', text: 'Маленькие n или почти отсортированные данные — вставки часто быстры и просты. Нужна предсказуемая O(n log n) в худшем случае — слияние или куча. Нужна скорость в среднем на массивах общего вида — оптимизированная быстрая сортировка (случайный pivot, introsort). Целые в узком диапазоне — подсчёт или radix. В языках высокого уровня встроенная сортировка (например, Timsort в Python/Java или гибриды в движках JS) уже подобрана под реальные данные — изобретать велосипед стоит в учебных или особо жёстких ограничениях.' },
      { id: 'p10b', type: 'paragraph', text: 'Параллельно полезно держать в голове модель памяти: кэш процессора лучше дружит с последовательным доступом, чем с разбросанными указателями; константы в O(n log n) у merge и quick могут отличаться в разы на реальном железе. Для распределённых систем сортировка часто комбинируется с разбиением данных по узлам (map-reduce: локальная сортировка + слияние результатов).' },
      { id: 'p10c', type: 'paragraph', text: 'При сравнении алгоритмов всегда уточняйте: что именно измеряем — число сравнений, присваиваний, обращений к памяти, время на конкретной машине. Асимптотика — первый фильтр; затем константы, стабильность, объём дополнительной памяти и удобство поддержки кода.' },
      { id: 'code1', type: 'code', language: 'js', editable: false, code: "// В JavaScript сортировка массива — метод sort (на месте).\n// По умолчанию элементы приводятся к строке; для чисел нужен компаратор:\nconst nums = [40, 1, 5, 200];\nnums.sort((a, b) => a - b);\n// Результат: [1, 5, 40, 200]\n\n// Объекты — по полю:\nconst items = [{ v: 2 }, { v: 1 }];\nitems.sort((a, b) => a.v - b.v);" },
      { id: 'h2-next', type: 'heading', level: 2, text: 'Что дальше в этом разделе' },
      { id: 'p11', type: 'paragraph', text: 'Далее мы разберём конкретные семейства: простые квадратичные методы, быструю сортировку, слиянием, пирамидальную, а также линейные по специальным предположениям — подсчёт и поразрядную. В каждой статье — интуиция, оценки сложности, код и короткая анимация идеи алгоритма.' },
      { id: 'link1', type: 'link', text: 'Сортировка (обзор)', href: 'https://ru.wikipedia.org/wiki/Алгоритм_сортировки', target: '_blank' },
    ],
  },

  // ─── st-sort-1: пузырёк, выбор, вставки ───────────────────────────────
  {
    id: 'sortirovki-n2-simple',
    topicId: 'sortirovki',
    subtopicId: 'st-sort-1',
    title: 'Пузырьковая сортировка, выбором и вставками',
    blocks: [
      { id: 'h1', type: 'heading', level: 1, text: 'Пузырьковая сортировка, выбором и вставками' },
      { id: 'p1', type: 'paragraph', text: 'Три классических «учебных» алгоритма имеют квадратичную сложность в типичной формулировке, но отличаются идеей и поведением на частично упорядоченных входах. Их важно понимать: они формируют интуицию про инварианты циклов, сравнения соседей и вставку в уже отсортированный префикс.' },
      { id: 'h2-bubble', type: 'heading', level: 2, text: 'Пузырьковая сортировка' },
      { id: 'p2', type: 'paragraph', text: 'Идея: многократно проходим массив слева направо и меняем местами соседей, если они стоят в неправильном порядке. Как пузырёк, «лёгкий» элемент всплывает к концу отрезка. После первого полного прохода максимум оказывается на последней позиции, после второго — следующий максимум на предпоследней и т.д.' },
      { id: 'p3', type: 'paragraph', text: 'В наивном виде два вложенных цикла дают O(n²) сравнений и обменов в худшем случае. Можно оптимизировать: если за проход не было обменов, массив уже отсортирован. Пузырёк стабилен при аккуратном обмене только при строгом неравенстве. На больших n на практике не используется, но наглядно показывает локальные исправления порядка.' },
      { id: 'anim-bubble', type: 'animation', html: '<div class="viz-col"><div class="viz-caption">Пузырёк: сравнение соседей</div><div class="viz-hint" id="vb-h"></div><div class="viz-row" id="vb-r"></div></div>', css: '', js: "(function(){var a=[5,2,8,1];var r=document.getElementById('vb-r');var h=document.getElementById('vb-h');var cells=[];function draw(){r.innerHTML='';cells=[];a.forEach(function(v){var d=document.createElement('div');d.className='viz-cell';d.innerHTML='<span class=\"viz-cell__main\">'+v+'</span>';r.appendChild(d);cells.push(d);});}draw();var i=0,j=0;var steps=[[0,1],[1,2],[2,3],[0,1],[1,2],[0,1]];var si=0;function step(){cells.forEach(function(c){c.classList.remove('viz-cell--active','viz-cell--compare','viz-cell--success');});if(si>=steps.length){h.textContent='Упрощённая демонстрация проходов';return;}var p=steps[si];cells[p[0]].classList.add('viz-cell--compare');cells[p[1]].classList.add('viz-cell--compare');h.textContent='Сравниваем индексы '+p[0]+' и '+p[1];si++;setTimeout(step,650);}h.textContent='Наблюдаем соседние пары';setTimeout(step,500);})();", width: '100%', height: 260, showPlayButton: true, vizLayout: 'default' },
      { id: 'code-bubble', type: 'code', language: 'js', editable: false, code: 'function bubbleSort(arr) {\n  const a = [...arr];\n  const n = a.length;\n  for (let i = 0; i < n - 1; i++) {\n    let swapped = false;\n    for (let j = 0; j < n - 1 - i; j++) {\n      if (a[j] > a[j + 1]) {\n        [a[j], a[j + 1]] = [a[j + 1], a[j]];\n        swapped = true;\n      }\n    }\n    if (!swapped) break;\n  }\n  return a;\n}' },
      { id: 'h2-select', type: 'heading', level: 2, text: 'Сортировка выбором' },
      { id: 'p4', type: 'paragraph', text: 'На i-м шаге ищем минимум в хвосте массива [i..n-1] и меняем местами с элементом на позиции i. После шага i префикс [0..i] — окончательно правильный отсортированный префикс. Число обменов небольшое (не больше n), но сравнений всё равно Θ(n²).' },
      { id: 'p5', type: 'paragraph', text: 'Алгоритм нестабилен: дальний минимум может перепрыгнуть через равные элементы. Зато реализация предельно простая и не требует дополнительной памяти.' },
      { id: 'code-select', type: 'code', language: 'js', editable: false, code: 'function selectionSort(arr) {\n  const a = [...arr];\n  const n = a.length;\n  for (let i = 0; i < n - 1; i++) {\n    let minIdx = i;\n    for (let j = i + 1; j < n; j++) {\n      if (a[j] < a[minIdx]) minIdx = j;\n    }\n    if (minIdx !== i) [a[i], a[minIdx]] = [a[minIdx], a[i]];\n  }\n  return a;\n}' },
      { id: 'h2-insert', type: 'heading', level: 2, text: 'Сортировка вставками' },
      { id: 'p6', type: 'paragraph', text: 'Поддерживаем инвариант: префикс [0..i-1] отсортирован. Берём элемент a[i] и вставляем его на правильную позицию в префиксе, сдвигая большие элементы вправо. Для почти отсортированного массива внутренний цикл короткий — на практике вставки эффективны при малых n и как подпрограмма в Timsort / Shell sort.' },
      { id: 'p7', type: 'paragraph', text: 'В худшем случае (обратный порядок) сдвигов O(n²), в лучшем (уже отсортирован) — O(n). Сортировка вставками стабильна, если вставляем «слева от равных» или аккуратно сравниваем.' },
      { id: 'anim-insert', type: 'animation', html: '<div class="viz-col"><div class="viz-caption">Вставки: отсортированный префикс</div><div class="viz-hint" id="vi-h"></div><div class="viz-row" id="vi-r"></div></div>', css: '', js: "(function(){var a=[3,1,4,2];var r=document.getElementById('vi-r');var h=document.getElementById('vi-h');var phases=[{t:'Префикс [0] упорядочен, берём 1',hi:1},{t:'Вставляем 1 перед 3',hi:1},{t:'Префикс [0..1] ок, берём 4',hi:2},{t:'4 на месте, берём 2',hi:3},{t:'Сдвигаем и вставляем 2',hi:3}];var pi=0;var cells=[];function paint(){r.innerHTML='';cells=[];a.forEach(function(v,idx){var d=document.createElement('div');d.className='viz-cell';d.innerHTML='<span class=\"viz-cell__main\">'+v+'</span><span class=\"viz-cell__sub\">'+idx+'</span>';r.appendChild(d);cells.push(d);});}paint();function tick(){cells.forEach(function(c){c.classList.remove('viz-cell--active','viz-cell--compare');});if(pi>=phases.length){h.textContent='Готово (упрощённо)';return;}var ph=phases[pi];h.textContent=ph.t;if(cells[ph.hi])cells[ph.hi].classList.add('viz-cell--active');pi++;setTimeout(tick,900);}h.textContent='Старт';setTimeout(tick,400);})();", width: '100%', height: 260, showPlayButton: true, vizLayout: 'default' },
      { id: 'code-insert', type: 'code', language: 'js', editable: false, code: 'function insertionSort(arr) {\n  const a = [...arr];\n  for (let i = 1; i < a.length; i++) {\n    const key = a[i];\n    let j = i - 1;\n    while (j >= 0 && a[j] > key) {\n      a[j + 1] = a[j];\n      j--;\n    }\n    a[j + 1] = key;\n  }\n  return a;\n}' },
      { id: 'h2-sum', type: 'heading', level: 2, text: 'Сравнение трёх подходов' },
      { id: 'p8', type: 'paragraph', text: 'Все три — квадратичные по сравнениям в худшем случае. Пузырёк и вставки адаптивны к почти готовому порядку сильнее, чем выбор. Вставки чаще выбирают как базовый кирпич в гибридах; выбор полезен, когда обмен дорогой, а минимум сравнений обменов важен; пузырёк оставляют для обучения и интервью.' },
      { id: 'p9', type: 'paragraph', text: 'На собеседованиях часто просят доказать инвариант цикла или оценить число обменов: у сортировки выбором обменов не больше n−1, у пузырька в худшем случае Θ(n²). Такие детали помогают понять, почему на малых n «простые» алгоритмы всё ещё используют внутри более сложных сортировщиков.' },
    ],
  },

  // ─── st-sort-2: quicksort ──────────────────────────────────────────────
  {
    id: 'sortirovki-quicksort',
    topicId: 'sortirovki',
    subtopicId: 'st-sort-2',
    title: 'Быстрая сортировка (quicksort)',
    blocks: [
      { id: 'h1', type: 'heading', level: 1, text: 'Быстрая сортировка (quicksort)' },
      { id: 'p1', type: 'paragraph', text: 'Quicksort — один из самых используемых алгоритмов сортировки массивов общего вида. Идея «разделяй и властвуй»: выбрать опорный элемент (pivot), разбить массив на части «меньше pivot», «равные» (опционально) и «больше pivot», рекурсивно отсортировать части и склеить. На месте обычно делают partition за один проход без дополнительных массивов под результат слияния.' },
      { id: 'p2', type: 'paragraph', text: 'Ключевая подпрограмма — partition: после её работы pivot стоит на финальной позиции, слева не больше, справа не меньше (точная семантика зависит от схемы Lomuto или Hoare). Рекурсия применяется к левому и правому подотрезкам, пока длина больше единицы.' },
      { id: 'h2-complex', type: 'heading', level: 2, text: 'Сложность и подводные камни' },
      { id: 'p3', type: 'paragraph', text: 'В среднем при «хороших» разбиениях глубина рекурсии O(log n), на уровне делается O(n) работы — итого O(n log n) по времени. В худшем случае pivot каждый раз минимальный или максимальный (например, уже отсортированный массив и pivot = первый элемент) — глубина n, время Θ(n²).' },
      { id: 'p4', type: 'paragraph', text: 'На практике применяют случайный pivot, медиану из трёх, или переключаются на heapsort/вставки на малых подмассивах (introsort в C++ std::sort). Quicksort обычно нестабилен и чувствителен к деталям реализации стека — для очень глубокой рекурсии иногда пишут явный стек.' },
      { id: 'h2-code', type: 'heading', level: 2, text: 'Реализация (схема Lomuto)' },
      { id: 'code1', type: 'code', language: 'js', editable: false, code: "function quickSort(arr, left = 0, right = arr.length - 1) {\n  if (left >= right) return arr;\n  const p = partition(arr, left, right);\n  quickSort(arr, left, p - 1);\n  quickSort(arr, p + 1, right);\n  return arr;\n}\n\nfunction partition(arr, left, right) {\n  const pivot = arr[right];\n  let i = left;\n  for (let j = left; j < right; j++) {\n    if (arr[j] <= pivot) {\n      [arr[i], arr[j]] = [arr[j], arr[i]];\n      i++;\n    }\n  }\n  [arr[i], arr[right]] = [arr[right], arr[i]];\n  return i;\n}\n\n// const a = [5, 3, 8, 4, 2];\n// quickSort(a); // изменит массив на месте" },
      { id: 'anim-q', type: 'animation', html: '<div class="viz-col"><div class="viz-caption">Разбиение вокруг опорного (упрощённо)</div><div class="viz-hint" id="vq-h"></div><div class="viz-row" id="vq-r"></div></div>', css: '', js: "(function(){var a=[7,2,5,1,8,3];var r=document.getElementById('vq-r');var h=document.getElementById('vq-h');var cells=[];function draw(){r.innerHTML='';cells=[];a.forEach(function(v){var d=document.createElement('div');d.className='viz-cell';d.innerHTML='<span class=\"viz-cell__main\">'+v+'</span>';r.appendChild(d);cells.push(d);});}draw();h.textContent='Опорный — последний элемент (подсветка)';cells[cells.length-1].classList.add('viz-cell--compare');setTimeout(function(){h.textContent='Элементы ≤ pivot сгруппированы слева (идея одного прохода)';cells[1].classList.add('viz-cell--success');cells[3].classList.add('viz-cell--success');},1200);})();", width: '100%', height: 260, showPlayButton: true, vizLayout: 'default' },
      { id: 'p5', type: 'paragraph', text: 'Анимация иллюстрирует только идею: реальный partition переставляет элементы за один проход относительно выбранного pivot. Для глубокого понимания прогоните код на бумаге для маленького массива или добавьте логирование индексов i, j.' },
      { id: 'p6', type: 'paragraph', text: 'Схема Hoare делит иначе, чем Lomuto: два указателя сходятся с концов; обычно меньше обменов, но pivot не обязан оказаться на финальной позиции после одного partition — рекурсия чуть сложнее. Оба варианта широко описаны в учебниках; для интервью чаще пишут Lomuto из-за простоты.' },
      { id: 'p7', type: 'paragraph', text: 'Трёхчастное разбиение (меньше / равно / больше pivot) полезно, когда много дубликатов pivot: тогда подзадачи по краям меньше, и худший случай на массивах из одинаковых элементов не деградирует до квадрата так сильно.' },
      { id: 'link1', type: 'link', text: 'Quicksort', href: 'https://ru.wikipedia.org/wiki/Быстрая_сортировка', target: '_blank' },
    ],
  },

  // ─── st-sort-3: merge sort ─────────────────────────────────────────────
  {
    id: 'sortirovki-merge',
    topicId: 'sortirovki',
    subtopicId: 'st-sort-3',
    title: 'Сортировка слиянием (merge sort)',
    blocks: [
      { id: 'h1', type: 'heading', level: 1, text: 'Сортировка слиянием (merge sort)' },
      { id: 'p1', type: 'paragraph', text: 'Merge sort — классический алгоритм «дели и властвуй»: массив делится пополам (по индексам), обе половины сортируются рекурсивно, затем две отсортированные последовательности сливаются в одну за линейное время по сумме длин. База рекурсии — отрезок длины 0 или 1 уже отсортирован.' },
      { id: 'p2', type: 'paragraph', text: 'Слияние двух отсортированных массивов: два указателя в начале каждого, на каждом шаге выбираем меньший из двух текущих элементов и продвигаем соответствующий указатель. Результат — новый массив или запись обратно с использованием временного буфера.' },
      { id: 'h2-prop', type: 'heading', level: 2, text: 'Свойства' },
      { id: 'p3', type: 'paragraph', text: 'Время всегда Θ(n log n) — независимо от входа. Память: классическая реализация на массивах требует O(n) дополнительной памяти под слияние (можно снизить константу, но не убрать для чистого merge на массиве). Алгоритм стабилен, если при равенстве сначала берём элемент из левой половины.' },
      { id: 'p4', type: 'paragraph', text: 'Merge sort предсказуем и подходит для связных списков (можно сливать без большого вспомогательного массива, переставляя указатели). В сортировке внешней памяти и параллельных вычислениях варианты merge — стандартный выбор.' },
      { id: 'h2-code', type: 'heading', level: 2, text: 'Код: слияние и рекурсия' },
      { id: 'code1', type: 'code', language: 'js', editable: false, code: 'function mergeSort(arr) {\n  if (arr.length <= 1) return arr;\n  const mid = Math.floor(arr.length / 2);\n  const left = mergeSort(arr.slice(0, mid));\n  const right = mergeSort(arr.slice(mid));\n  return merge(left, right);\n}\n\nfunction merge(a, b) {\n  const out = [];\n  let i = 0, j = 0;\n  while (i < a.length && j < b.length) {\n    if (a[i] <= b[j]) out.push(a[i++]);\n    else out.push(b[j++]);\n  }\n  return out.concat(a.slice(i), b.slice(j));\n}' },
      { id: 'anim-m', type: 'animation', html: '<div class="viz-col"><div class="viz-caption">Merge sort — этапы деления и слияния</div><p class="viz-hint" id="vm-h"></p><div id="vm-l"></div></div>', css: '#vm-l{display:flex;flex-direction:column;gap:10px;width:100%;max-width:100%;align-items:center;}', js: "(function(){var stages=[{hint:'Исходный массив',parts:[[5,3,8,1]]},{hint:'Делим пополам',parts:[[5,3],[8,1]]},{hint:'База: по одному',parts:[[5],[3],[8],[1]]},{hint:'Сливаем пары',parts:[[3,5],[1,8]]},{hint:'Финальное слияние',parts:[[1,3,5,8]]}];var hintEl=document.getElementById('vm-h');var levelsEl=document.getElementById('vm-l');function sleep(ms){return new Promise(function(r){setTimeout(r,ms);});}function render(parts){levelsEl.innerHTML='';parts.forEach(function(sub){var g=document.createElement('div');g.className='viz-group';sub.forEach(function(x){var c=document.createElement('div');c.className='viz-cell';c.innerHTML='<span class=\"viz-cell__main\">'+x+'</span>';g.appendChild(c);});levelsEl.appendChild(g);});}(function run(){var i=0;function next(){if(i>=stages.length)return;var s=stages[i];hintEl.textContent=s.hint;render(s.parts);i++;return sleep(720).then(next);}return next();})();})();", width: '100%', height: 400, showPlayButton: true, vizLayout: 'tall' },
      { id: 'p5', type: 'paragraph', text: 'На практике для больших массивов избегают slice на каждом уровне (лишние копии): передают исходный массив и границы left, right, а временный буфер выделяют один раз. Идея та же, что в показанном коде.' },
      { id: 'p6', type: 'paragraph', text: 'Рекуррентное соотношение T(n) = 2T(n/2) + Θ(n) даёт T(n) = Θ(n log n) по основной теореме о рекуррентностях. Глубина рекурсии O(log n), на каждом уровне суммарно обрабатывается все n элементов при слиянии.' },
      { id: 'p7', type: 'paragraph', text: 'Слияние двух отсортированных списков за O(n) — отдельный полезный паттерн: например, в задачах на k-way merge или слияние журналов событий по времени.' },
      { id: 'link1', type: 'link', text: 'Сортировка слиянием', href: 'https://ru.wikipedia.org/wiki/Сортировка_слиянием', target: '_blank' },
    ],
  },

  // ─── st-sort-4: heap sort ─────────────────────────────────────────────
  {
    id: 'sortirovki-heapsort',
    topicId: 'sortirovki',
    subtopicId: 'st-sort-4',
    title: 'Пирамидальная сортировка (heap sort)',
    blocks: [
      { id: 'h1', type: 'heading', level: 1, text: 'Пирамидальная сортировка (heap sort)' },
      { id: 'p1', type: 'paragraph', text: 'Двоичная куча (heap) — это почти полное двоичное дерево, уложенное в массив: для узла с индексом i дети (если есть) — 2i+1 и 2i+2. В max-heap значение каждого узла не меньше значений детей; корень — максимум всей кучи.' },
      { id: 'p2', type: 'paragraph', text: 'Heap sort: сначала превращаем массив в max-heap снизу вверх (heapify / sift down). Затем n−1 раз меняем корень с последним элементом «рабочей» кучи, уменьшаем размер кучи и восстанавливаем свойство кучи для корня. Так максимумы поочерёдно оказываются в конце массива — получается сортировка по возрастанию.' },
      { id: 'h2-complex', type: 'heading', level: 2, text: 'Сложность и место' },
      { id: 'p3', type: 'paragraph', text: 'Построение кучи за O(n) (не O(n log n) naïve!), каждое извлечение максимума — O(log n), всего n шагов — итого время O(n log n) в худшем случае. Дополнительная память O(1) кроме рекурсии или явного стека при heapify. Нестабилен.' },
      { id: 'p4', type: 'paragraph', text: 'Та же структура кучи лежит в основе очереди с приоритетом: insert и extract-max за O(log n). Понимание heap sort напрямую помогает с алгоритмами Дейкстры, построения кода Хаффмана и т.д.' },
      { id: 'h2-code', type: 'heading', level: 2, text: 'Реализация (упрощённый heapify)' },
      { id: 'code1', type: 'code', language: 'js', editable: false, code: 'function heapSort(arr) {\n  const a = [...arr];\n  const n = a.length;\n  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) siftDown(a, i, n);\n  for (let end = n - 1; end > 0; end--) {\n    [a[0], a[end]] = [a[end], a[0]];\n    siftDown(a, 0, end);\n  }\n  return a;\n}\n\nfunction siftDown(a, i, size) {\n  while (true) {\n    let l = 2 * i + 1, r = 2 * i + 2, m = i;\n    if (l < size && a[l] > a[m]) m = l;\n    if (r < size && a[r] > a[m]) m = r;\n    if (m === i) break;\n    [a[i], a[m]] = [a[m], a[i]];\n    i = m;\n  }\n}' },
      { id: 'anim-h', type: 'animation', html: '<div class="viz-col"><div class="viz-caption">Массив как куча: корень — максимум</div><div class="viz-hint" id="vh-h"></div><div class="viz-row" id="vh-r"></div></div>', css: '', js: "(function(){var a=[4,10,3,5,1];var r=document.getElementById('vh-r');var h=document.getElementById('vh-h');a.forEach(function(v,i){var d=document.createElement('div');d.className='viz-cell';d.innerHTML='<span class=\"viz-cell__main\">'+v+'</span><span class=\"viz-cell__sub\">i='+i+'</span>';r.appendChild(d);});h.textContent='Индекс 0 — корень max-heap (идея)';r.children[0].classList.add('viz-cell--success');setTimeout(function(){h.textContent='Дети узла i: 2i+1 и 2i+2';r.children[0].classList.remove('viz-cell--success');r.children[1].classList.add('viz-cell--compare');r.children[2].classList.add('viz-cell--compare');},1100);})();", width: '100%', height: 260, showPlayButton: true, vizLayout: 'default' },
      { id: 'p5', type: 'paragraph', text: 'Индексация «родитель — дети» в массиве: parent(i) = ⌊(i−1)/2⌋, что удобно для итеративного sift-down без указателей. При реализации на Python/Java всё равно чаще используют встроенную очередь с приоритетом, но ручной heap sort закрепляет понимание инварианта кучи.' },
      { id: 'link1', type: 'link', text: 'Пирамидальная сортировка', href: 'https://ru.wikipedia.org/wiki/Пирамидальная_сортировка', target: '_blank' },
    ],
  },

  // ─── st-sort-5: counting, radix ───────────────────────────────────────
  {
    id: 'sortirovki-counting-radix',
    topicId: 'sortirovki',
    subtopicId: 'st-sort-5',
    title: 'Сортировка подсчётом и поразрядная (radix)',
    blocks: [
      { id: 'h1', type: 'heading', level: 1, text: 'Сортировка подсчётом и поразрядная (radix)' },
      { id: 'p1', type: 'paragraph', text: 'Когда ключи принимают ограниченное число целых значений в диапазоне [0..k] (или после сдвига), можно сортировать за линейное время относительно n + k, не сравнивая элементы попарно в классическом смысле. Это выходит за рамки нижней оценки n log n для сравнивающих сортировок.' },
      { id: 'h2-count', type: 'heading', level: 2, text: 'Сортировка подсчётом' },
      { id: 'p2', type: 'paragraph', text: 'Считаем, сколько раз встречается каждое значение; по префиксным суммам счётчика вычисляем позиции концов групп одинаковых ключей; вторым проходом раскладываем элементы в выходной массив стабильно (важно для radix). Время O(n + k), память O(n + k). Если k огромен по сравнению с n, метод неэффективен.' },
      { id: 'code-count', type: 'code', language: 'js', editable: false, code: 'function countingSort(arr, k) {\n  const count = new Array(k + 1).fill(0);\n  for (const x of arr) count[x]++;\n  for (let i = 1; i <= k; i++) count[i] += count[i - 1];\n  const out = new Array(arr.length);\n  for (let i = arr.length - 1; i >= 0; i--) {\n    const x = arr[i];\n    count[x]--;\n    out[count[x]] = x;\n  }\n  return out;\n}\n// Пример: countingSort([2,0,2,1], 2) → [0,1,2,2]' },
      { id: 'anim-c', type: 'animation', html: '<div class="viz-col"><div class="viz-caption">Подсчёт частот ключей 0..k</div><div class="viz-hint" id="vc-h"></div><div class="viz-row" id="vc-r"></div></div>', css: '', js: "(function(){var keys=[0,1,2,3,4,5];var cnt=[0,2,1,0,1,0];var r=document.getElementById('vc-r');var h=document.getElementById('vc-h');keys.forEach(function(k,i){var d=document.createElement('div');d.className='viz-cell';d.innerHTML='<span class=\"viz-cell__main\">'+cnt[i]+'</span><span class=\"viz-cell__sub\">key '+k+'</span>';r.appendChild(d);});h.textContent='Высота ячейки — сколько раз встретился ключ';})();", width: '100%', height: 240, showPlayButton: true, vizLayout: 'default' },
      { id: 'h2-radix', type: 'heading', level: 2, text: 'Поразрядная сортировка' },
      { id: 'p3', type: 'paragraph', text: 'Целое можно представить в фиксированной системе счисления (основание r). Сортируем числа по младшему разряду, затем по следующему и т.д. Каждый проход — стабильная сортировка по одной цифре (часто подсчётом, если цифр мало). Итог: все числа упорядочены лексикографически по разрядам с конца, что для чисел совпадает с числовым порядком.' },
      { id: 'p4', type: 'paragraph', text: 'Время O(d · (n + r)), где d — число разрядов, r — основание (корзин). Подходит для целых с ограниченным числом бит; для строк — по символам с конца (фиксированная длина) или с вариациями для переменной длины.' },
      { id: 'code-radix', type: 'code', language: 'js', editable: false, code: 'function radixSort(nums) {\n  let a = [...nums];\n  const max = Math.max(...a, 0);\n  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {\n    a = countingSortByDigit(a, exp);\n  }\n  return a;\n}\n\nfunction countingSortByDigit(arr, exp) {\n  const out = new Array(arr.length);\n  const count = new Array(10).fill(0);\n  for (const x of arr) count[Math.floor(x / exp) % 10]++;\n  for (let i = 1; i < 10; i++) count[i] += count[i - 1];\n  for (let i = arr.length - 1; i >= 0; i--) {\n    const d = Math.floor(arr[i] / exp) % 10;\n    count[d]--;\n    out[count[d]] = arr[i];\n  }\n  return out;\n}' },
      { id: 'p5', type: 'paragraph', text: 'Не путать условия применимости: counting и radix требуют целочисленных или конечного алфавита ключей; для произвольных объектов с вещественными ключами без квантования эти приёмы не подходят напрямую.' },
      { id: 'link1', type: 'link', text: 'Поразрядная сортировка', href: 'https://ru.wikipedia.org/wiki/Поразрядная_сортировка', target: '_blank' },
    ],
  },

  // ─── Поиск: введение ───────────────────────────────────────────────────
  {
    id: 'poisk-intro',
    topicId: 'poisk',
    title: 'Поиск в данных: обзор',
    blocks: [
      { id: 'h1', type: 'heading', level: 1, text: 'Поиск в данных: обзор' },
      { id: 'p1', type: 'paragraph', text: 'Поиск — одна из базовых операций: есть ли элемент с заданным значением, где он стоит, какой первый не меньше x, сколько элементов в интервале. От структуры данных и того, отсортированы ли ключи, зависит, можно ли ответить за константу, за логарифм или нужно просматривать всё подряд.' },
      { id: 'p2', type: 'paragraph', text: 'Если массив не упорядочен и нет дополнительного индекса (хеш-таблицы, дерева), в худшем случае без дополнительной информации нужно проверить все элементы — линейный поиск. Если массив отсортирован по ключу, можно применять бинарный поиск: каждое сравнение отсекает половину отрезка.' },
      { id: 'h2-app', type: 'heading', level: 2, text: 'Типичные сценарии' },
      { id: 'p3', type: 'paragraph', text: 'Проверка принадлежности множеству, поиск границы в отсортированном массиве задач по времени, нахождение корня монотонной функции (бинпоиск по ответу), работа с STL-подобными lower_bound/upper_bound в других языках — всё это вариации идеи «сужать допустимую область».' },
      { id: 'p4', type: 'paragraph', text: 'В этом разделе мы последовательно разберём линейный поиск, классический бинарный поиск по индексу, бинпоиск по ответу на монотонной прогнозируемой функции и пару границ для отсортированных массивов с дубликатами.' },
      { id: 'p5', type: 'paragraph', text: 'Важно различать «найти объект» и «найти позицию для вставки»: второе как раз даёт lower_bound — первый индекс, куда можно вставить x, не нарушая порядок. От этого зависят реализации множеств и карт в стандартных библиотеках.' },
      { id: 'p6', type: 'paragraph', text: 'Если данные динамически добавляются и удаляются, отсортированный массив с бинпоиском сменяют сбалансированным деревом или хеш-таблицей: там другие компромиссы по времени и памяти, но идея «сужать область поиска» остаётся родственной.' },
      { id: 'link1', type: 'link', text: 'Поиск в информатике', href: 'https://ru.wikipedia.org/wiki/Поиск_в_информатике', target: '_blank' },
    ],
  },

  // ─── st-pois-1: линейный поиск ─────────────────────────────────────────
  {
    id: 'poisk-linear',
    topicId: 'poisk',
    subtopicId: 'st-pois-1',
    title: 'Линейный поиск',
    blocks: [
      { id: 'h1', type: 'heading', level: 1, text: 'Линейный поиск' },
      { id: 'p1', type: 'paragraph', text: 'Линейный (последовательный) поиск просматривает элементы коллекции один за другим, пока не найдёт нужный или не закончится коллекция. Не требует сортировки и дополнительных структур — универсален и тривиален в реализации.' },
      { id: 'p2', type: 'paragraph', text: 'Время в худшем и среднем для «случайного» расположения цели — O(n). Если известно, что цель чаще в начале, можно оптимизировать порядок проверки; если данных очень много и поиск частый, обычно строят хеш-таблицу или сортируют + бинарный поиск.' },
      { id: 'h2-code', type: 'heading', level: 2, text: 'Реализация' },
      { id: 'code1', type: 'code', language: 'js', editable: false, code: 'function linearSearch(arr, target) {\n  for (let i = 0; i < arr.length; i++) {\n    if (arr[i] === target) return i;\n  }\n  return -1;\n}\n\nfunction linearSearchAll(arr, target) {\n  const idx = [];\n  for (let i = 0; i < arr.length; i++) {\n    if (arr[i] === target) idx.push(i);\n  }\n  return idx;\n}' },
      { id: 'anim-lin', type: 'animation', html: '<div class="viz-col"><div class="viz-caption">Линейный поиск цели</div><div class="viz-hint" id="vl-h"></div><div class="viz-row" id="vl-r"></div></div>', css: '', js: "(function(){var arr=[3,7,1,9,5];var target=9;var r=document.getElementById('vl-r');var h=document.getElementById('vl-h');var nodes=[];arr.forEach(function(v){var el=document.createElement('div');el.className='viz-cell';el.innerHTML='<span class=\"viz-cell__main\">'+v+'</span>';r.appendChild(el);nodes.push(el);});var i=0;var timer=setInterval(function(){if(i>=arr.length){clearInterval(timer);h.textContent='Не найдено';nodes.forEach(function(n){n.classList.add('viz-cell--fail');});return;}nodes.forEach(function(n){n.classList.remove('viz-cell--active','viz-cell--compare','viz-cell--success','viz-cell--fail');});nodes[i].classList.add('viz-cell--compare');h.textContent='Сравниваем индекс '+i;if(arr[i]===target){nodes[i].classList.remove('viz-cell--compare');nodes[i].classList.add('viz-cell--success');h.textContent='Найдено: индекс '+i;clearInterval(timer);return;}i++;},750);})();", width: '100%', height: 280, showPlayButton: true, vizLayout: 'default' },
      { id: 'p3', type: 'paragraph', text: 'На анимации цель совпадает с примером из раздела «Основы»: сравниваем подряд, пока не встретим нужное значение. Для объектов сравнение заменяют на сравнение поля или пользовательский предикат.' },
      { id: 'h2-var', type: 'heading', level: 2, text: 'Варианты задач' },
      { id: 'p4', type: 'paragraph', text: 'Поиск минимума/максимума в неотсортированном массиве — тоже линейный проход. Поиск в связном списке — аналогично, без произвольного доступа по индексу за O(1).' },
    ],
  },

  // ─── st-pois-2: бинарный поиск ─────────────────────────────────────────
  {
    id: 'poisk-binary',
    topicId: 'poisk',
    subtopicId: 'st-pois-2',
    title: 'Бинарный поиск',
    blocks: [
      { id: 'h1', type: 'heading', level: 1, text: 'Бинарный поиск' },
      { id: 'p1', type: 'paragraph', text: 'Если массив отсортирован по неубыванию (или по невозрастанию с симметричной логикой), можно искать элемент за O(log n) сравнений. Идея: сравнить цель с серединой отрезка; если цель меньше — искать слева, если больше — справа; если равна — найдено.' },
      { id: 'p2', type: 'paragraph', text: 'Важно аккуратно определить инвариант цикла: что означают границы left и right (инclusive/exclusive), чтобы не зациклиться и не выйти за массив. Существуют две распространённые схемы: полуинтервал [left, right) и замкнутый [left, right].' },
      { id: 'h2-code', type: 'heading', level: 2, text: 'Код (нижняя граница, полуинтервал)' },
      { id: 'code1', type: 'code', language: 'js', editable: false, code: '// Первый индекс i, где arr[i] >= target; если все < target — arr.length\nfunction lowerBound(arr, target) {\n  let lo = 0, hi = arr.length;\n  while (lo < hi) {\n    const mid = (lo + hi) >> 1;\n    if (arr[mid] < target) lo = mid + 1;\n    else hi = mid;\n  }\n  return lo;\n}\n\n// Классический «есть ли target»:\nfunction binarySearchExists(arr, target) {\n  const i = lowerBound(arr, target);\n  return i < arr.length && arr[i] === target;\n}' },
      { id: 'anim-bin', type: 'animation', html: '<div class="viz-col"><div class="viz-caption">Бинарный поиск: сужение отрезка</div><div class="viz-hint" id="vb2-h"></div><div class="viz-row" id="vb2-r"></div></div>', css: '', js: "(function(){var arr=[1,3,4,7,9,12];var target=7;var r=document.getElementById('vb2-r');var h=document.getElementById('vb2-h');var nodes=[];arr.forEach(function(v){var el=document.createElement('div');el.className='viz-cell';el.innerHTML='<span class=\"viz-cell__main\">'+v+'</span>';r.appendChild(el);nodes.push(el);});var lo=0,hi=arr.length,step=0;function tick(){nodes.forEach(function(n){n.classList.remove('viz-cell--active','viz-cell--compare','viz-cell--success');});if(lo>=hi){h.textContent='Готово: индекс '+lo; if(lo<arr.length&&arr[lo]===target)nodes[lo].classList.add('viz-cell--success');return;}var mid=(lo+hi)>>1;nodes[mid].classList.add('viz-cell--compare');h.textContent='Шаг '+(++step)+': mid='+mid+' lo='+lo+' hi='+hi;if(arr[mid]<target)lo=mid+1;else hi=mid;setTimeout(tick,950);}h.textContent='Ищем '+target;setTimeout(tick,400);})();", width: '100%', height: 280, showPlayButton: true, vizLayout: 'default' },
      { id: 'p3', type: 'paragraph', text: 'Анимация показывает выбор mid и сужение [lo, hi). На практике для больших n логарифм числа шагов мал даже для миллионов элементов.' },
      { id: 'link1', type: 'link', text: 'Двоичный поиск', href: 'https://ru.wikipedia.org/wiki/Двоичный_поиск', target: '_blank' },
    ],
  },

  // ─── st-pois-3: бинпоиск по ответу ─────────────────────────────────────
  {
    id: 'poisk-binary-answer',
    topicId: 'poisk',
    subtopicId: 'st-pois-3',
    title: 'Двоичный поиск по ответу',
    blocks: [
      { id: 'h1', type: 'heading', level: 1, text: 'Двоичный поиск по ответу' },
      { id: 'p1', type: 'paragraph', text: 'Иногда неизвестен индекс в массиве, но известно, что ответ — целое число в диапазоне [L, R], и есть функция check(x): «можно ли достичь условия задачи с параметром x?». Если из check(true) для большого x следует true для ещё больших (монотонность по одну сторону), а нам нужен минимальный допустимый x, типичный шаблон — бинпоиск по ответу.' },
      { id: 'p2', type: 'paragraph', text: 'Примеры: минимальное время, за которое можно перевезти все грузы при ограничении на вес за рейс; максимальная длина отрезков при разрезе; минимальная суммарная штрафа при разбиении на k частей. В каждой задаче нужно вручную доказать монотонность: если x годится, то и x+1 часто тоже (или наоборот для максимума).' },
      { id: 'h2-template', type: 'heading', level: 2, text: 'Шаблон: минимальный x, при котором check(x) true' },
      { id: 'code1', type: 'code', language: 'js', editable: false, code: '// check(x) возвращает true для всех x >= ответа (монотонно неубывающая)\nfunction binarySearchMinAnswer(L, R, check) {\n  let lo = L, hi = R; // ищем минимальный допустимый в [L, R]\n  while (lo < hi) {\n    const mid = (lo + hi) >> 1;\n    if (check(mid)) hi = mid;\n    else lo = mid + 1;\n  }\n  return lo;\n}\n\n// Пример: целый sqrt(n) вниз — check(x): x*x >= n\nfunction intSqrt(n) {\n  return binarySearchMinAnswer(0, n, (x) => x * x >= n);\n}' },
      { id: 'p3', type: 'paragraph', text: 'Границы L и R должны гарантированно включать ответ: слишком узкий интервал даст неверный результат; слишком широкий только увеличит число итераций (log(R−L)). Иногда удобнее бинпоиск по вещественному ответу с фиксированным числом итераций или пока hi−lo > eps.' },
      { id: 'anim-ans', type: 'animation', html: '<div class="viz-col"><div class="viz-caption">Бинпоиск по ответу: сужение интервала</div><div class="viz-hint" id="va-h"></div><div class="viz-badge" id="va-b"></div></div>', css: '', js: "(function(){var h=document.getElementById('va-h');var b=document.getElementById('va-b');var steps=['Диапазон ответа: [0 … 100]','Проверка середины → отсекаем правую половину: [0 … 50]','Снова середина → [25 … 50]','Ещё шаг → [37 … 43] (пример)','Осталось несколько целых — берём минимальный подходящий'];var i=0;function next(){if(i>=steps.length){h.textContent='Итого: O(log ширины диапазона) вызовов check';b.textContent='готово';return;}h.textContent=steps[i];b.textContent='шаг '+(i+1)+' / '+steps.length;i++;setTimeout(next,850);}h.textContent='Старт';b.textContent='';setTimeout(next,400);})();", width: '100%', height: 220, showPlayButton: true, vizLayout: 'default' },
      { id: 'p4', type: 'paragraph', text: 'Анимация условная: показывает идею сужения области. Реальные check() запускают внутри симуляцию задачи — их сложность умножается на O(log диапазона).' },
    ],
  },

  // ─── st-pois-4: lower_bound / upper_bound ──────────────────────────────
  {
    id: 'poisk-bounds',
    topicId: 'poisk',
    subtopicId: 'st-pois-4',
    title: 'Поиск в отсортированных структурах: lower_bound и upper_bound',
    blocks: [
      { id: 'h1', type: 'heading', level: 1, text: 'lower_bound и upper_bound' },
      { id: 'p1', type: 'paragraph', text: 'В отсортированном массиве с возможными дубликатами часто нужны не «любой равный», а границы группы равных. В C++ std::lower_bound возвращает итератор на первый элемент >= x (при сортировке по возрастанию); std::upper_bound — на первый элемент > x. Полуинтервал [lower, upper) — ровно все вхождения x.' },
      { id: 'p2', type: 'paragraph', text: 'В JavaScript готовых функций нет, но те же O(log n) получаются двумя бинпоисками с разными сравнениями. Эти приёмы нужны для подсчёта частоты в отсортированном массиве, работы с временными рядами, координатным сжатием.' },
      { id: 'h2-code', type: 'heading', level: 2, text: 'Реализация' },
      { id: 'code1', type: 'code', language: 'js', editable: false, code: 'function lowerBound(arr, x) {\n  let lo = 0, hi = arr.length;\n  while (lo < hi) {\n    const mid = (lo + hi) >> 1;\n    if (arr[mid] < x) lo = mid + 1;\n    else hi = mid;\n  }\n  return lo;\n}\n\nfunction upperBound(arr, x) {\n  let lo = 0, hi = arr.length;\n  while (lo < hi) {\n    const mid = (lo + hi) >> 1;\n    if (arr[mid] <= x) lo = mid + 1;\n    else hi = mid;\n  }\n  return lo;\n}\n\n// const a = [1,2,2,2,5];\n// lowerBound(a,2) === 1, upperBound(a,2) === 4, count = 3' },
      { id: 'anim-bnd', type: 'animation', html: '<div class="viz-col"><div class="viz-caption">Массив с повторениями: x = 2</div><div class="viz-hint" id="vbd-h"></div><div class="viz-row" id="vbd-r"></div></div>', css: '', js: "(function(){var arr=[1,2,2,2,5];var r=document.getElementById('vbd-r');var h=document.getElementById('vbd-h');arr.forEach(function(v,i){var d=document.createElement('div');d.className='viz-cell';d.innerHTML='<span class=\"viz-cell__main\">'+v+'</span><span class=\"viz-cell__sub\">'+i+'</span>';if(v===2)d.classList.add('viz-cell--success');r.appendChild(d);});h.textContent='Индексы 1..3 — все равны 2; lower_bound → 1, upper_bound → 4';})();", width: '100%', height: 240, showPlayButton: true, vizLayout: 'default' },
      { id: 'p3', type: 'paragraph', text: 'Разница между lower и upper — строгость сравнения в ветке mid: < x против <= x. Один раз ошибиться — получите off-by-one; проверяйте на массивах из одного элемента и из всех равных.' },
      { id: 'link1', type: 'link', text: 'std::lower_bound', href: 'https://en.cppreference.com/w/cpp/algorithm/lower_bound', target: '_blank' },
    ],
  },
];
