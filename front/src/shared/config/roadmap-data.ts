export interface RoadmapSubtopic {
  id: string;
  title: string;
  position?: 'center' | 'left' | 'right';
  theory?: string;
  taskIds: string[];
}

export interface RoadmapTopic {
  id: string;
  title: string;
  subtopics: RoadmapSubtopic[];
}

export interface Task {
  id: string;
  topicId: string;
  subtopicId?: string;
  title: string;
  description: string;
  expectedOutput: string;
  hints: string[];
  solutionTemplate: string;
  testCases: { input: string; expected: string }[];
}

export const ROADMAP: RoadmapTopic[] = [
  {
    id: 'osnovy',
    title: 'Основы',
    subtopics: [
      { id: 'st-osn-1', title: 'Сложность алгоритмов (O-нотация, время и память)', position: 'center', taskIds: [] },
      { id: 'st-osn-2', title: 'Массивы и строки', position: 'center', taskIds: [] },
      { id: 'st-osn-3', title: 'Базовые операции с массивами (поиск, вставка, удаление, срезы)', position: 'center', taskIds: [] },
      { id: 'st-osn-4', title: 'Хэш-таблицы / словари', position: 'center', taskIds: [] },
      { id: 'st-osn-5', title: 'Стек и очередь', position: 'center', taskIds: [] },
    ],
  },
  {
    id: 'rekursiya',
    title: 'Рекурсия',
    subtopics: [
      { id: 'st-rek-1', title: 'Базовые примеры', position: 'center', taskIds: [] },
      { id: 'st-rek-2', title: 'Рекурсивные последовательности', position: 'center', taskIds: [] },
      { id: 'st-rek-3', title: 'Хвостовая рекурсия', position: 'center', taskIds: [] },
      { id: 'st-rek-4', title: 'Дели и властвуй (divide and conquer)', position: 'center', taskIds: [] },
    ],
  },
  {
    id: 'sortirovki',
    title: 'Сортировки',
    subtopics: [
      { id: 'st-sort-1', title: 'Пузырьковая, выбором, вставками', position: 'center', taskIds: [] },
      { id: 'st-sort-2', title: 'Быстрая сортировка (quicksort)', position: 'center', taskIds: [] },
      { id: 'st-sort-3', title: 'Сортировка слиянием (merge sort)', position: 'center', taskIds: [] },
      { id: 'st-sort-4', title: 'Сортировка подсчётом, поразрядная (counting, radix)', position: 'center', taskIds: [] },
      { id: 'st-sort-5', title: 'Heap sort', position: 'center', taskIds: [] },
    ],
  },
  {
    id: 'poisk',
    title: 'Поиск',
    subtopics: [
      { id: 'st-pois-1', title: 'Линейный поиск', position: 'center', taskIds: [] },
      { id: 'st-pois-2', title: 'Бинарный поиск', position: 'center', taskIds: [] },
      { id: 'st-pois-3', title: 'Поиск в отсортированных структурах (lower_bound, upper_bound)', position: 'center', taskIds: [] },
      { id: 'st-pois-4', title: 'Двоичный поиск по ответу', position: 'center', taskIds: [] },
    ],
  },
  {
    id: 'derevya',
    title: 'Деревья',
    subtopics: [
      { id: 'st-der-1', title: 'Базовые деревья (структура узла, вставка, поиск)', position: 'center', taskIds: [] },
      { id: 'st-der-2', title: 'BFS', position: 'left', taskIds: [] },
      { id: 'st-der-3', title: 'DFS', position: 'right', taskIds: [] },
      { id: 'st-der-4', title: 'Бинарные деревья поиска (BST)', position: 'center', taskIds: [] },
      { id: 'st-der-5', title: 'Сбалансированные деревья (AVL, Red-Black)', position: 'center', taskIds: [] },
      { id: 'st-der-6', title: 'Сегментные деревья', position: 'center', taskIds: [] },
      { id: 'st-der-7', title: 'Дерево Фенвика (Fenwick Tree / BIT)', position: 'center', taskIds: [] },
    ],
  },
  {
    id: 'grafy',
    title: 'Графы',
    subtopics: [
      { id: 'st-graf-1', title: 'Представление графа (список смежности, матрица)', position: 'center', taskIds: [] },
      { id: 'st-graf-2', title: 'DFS, BFS', position: 'center', taskIds: [] },
      { id: 'st-graf-3', title: 'Топологическая сортировка', position: 'center', taskIds: [] },
      { id: 'st-graf-4', title: 'Алгоритмы кратчайшего пути (Dijkstra, Bellman-Ford)', position: 'center', taskIds: [] },
      { id: 'st-graf-5', title: 'Алгоритмы минимального остовного дерева (Kruskal, Prim)', position: 'center', taskIds: [] },
      { id: 'st-graf-6', title: 'Поиск в циклах (Floyd, Tarjan, Kosaraju)', position: 'center', taskIds: [] },
      { id: 'st-graf-7', title: 'Алгоритмы на взвешенных графах (Floyd-Warshall)', position: 'center', taskIds: [] },
    ],
  },
  {
    id: 'dp',
    title: 'Динамическое программирование',
    subtopics: [
      { id: 'st-dp-1', title: 'Базовые задачи (фибоначчи, пути в сетке)', position: 'center', taskIds: [] },
      { id: 'st-dp-2', title: 'Knapsack (0/1, unbounded)', position: 'center', taskIds: [] },
      { id: 'st-dp-3', title: 'Оптимизация с префиксами/суммами', position: 'center', taskIds: [] },
      { id: 'st-dp-4', title: 'DP по состояниям (bitmask dp)', position: 'center', taskIds: [] },
      { id: 'st-dp-5', title: 'DP на деревьях и графах', position: 'center', taskIds: [] },
    ],
  },
  {
    id: 'struktury',
    title: 'Дополнительные структуры данных',
    subtopics: [
      { id: 'st-str-1', title: 'Очередь с приоритетом (heap / priority queue)', position: 'center', taskIds: [] },
      { id: 'st-str-2', title: 'Deque, двусвязный список', position: 'center', taskIds: [] },
      { id: 'st-str-3', title: 'Trie', position: 'center', taskIds: [] },
      { id: 'st-str-4', title: 'Union-Find / Disjoint Set', position: 'center', taskIds: [] },
    ],
  },
  {
    id: 'prodvinutye',
    title: 'Продвинутые темы (по желанию)',
    subtopics: [
      { id: 'st-prod-1', title: 'Алгоритмы на строках (KMP, Z, Rabin-Karp)', position: 'center', taskIds: [] },
      { id: 'st-prod-2', title: 'Sqrt-decomposition', position: 'center', taskIds: [] },
      { id: 'st-prod-3', title: 'Алгоритмы на потоках (max flow, Edmonds-Karp)', position: 'center', taskIds: [] },
      { id: 'st-prod-4', title: 'Линейная алгебра для алгоритмов (матрицы, быстрые степени)', position: 'center', taskIds: [] },
    ],
  },
];

/** Ordered list of task IDs for prev/next navigation */
export function getOrderedTaskIds(): string[] {
  const ids: string[] = [];
  for (const topic of ROADMAP) {
    for (const subtopic of topic.subtopics) {
      const stTasks = TASKS.filter((t) => t.topicId === topic.id && t.subtopicId === subtopic.id);
      ids.push(...stTasks.map((t) => t.id));
    }
    const topicTasks = TASKS.filter((t) => t.topicId === topic.id && !t.subtopicId);
    ids.push(...topicTasks.map((t) => t.id));
  }
  return ids;
}

export const TASKS: Task[] = [
  {
    id: 'task-1',
    topicId: 'osnovy',
    subtopicId: 'st-osn-1',
    title: 'Сумма двух чисел',
    description: 'Напишите функцию, которая принимает два числа и возвращает их сумму.',
    expectedOutput: 'Число — сумма двух аргументов',
    hints: ['Просто сложите аргументы', 'Используйте оператор +'],
    solutionTemplate: `def solution(a: int, b: int) -> int:
    # Ваш код здесь
    pass`,
    testCases: [
      { input: '2, 3', expected: '5' },
      { input: '-1, 1', expected: '0' },
    ],
  },
  {
    id: 'task-2',
    topicId: 'osnovy',
    subtopicId: 'st-osn-2',
    title: 'Сумма элементов массива',
    description: 'Дан массив чисел. Верните сумму всех элементов.',
    expectedOutput: 'Сумма всех элементов',
    hints: ['Используйте цикл for', 'Или функцию sum()'],
    solutionTemplate: `def solution(nums: list[int]) -> int:
    # Ваш код здесь
    pass`,
    testCases: [
      { input: '[1, 2, 3]', expected: '6' },
      { input: '[]', expected: '0' },
    ],
  },
  {
    id: 'task-3',
    topicId: 'derevya',
    subtopicId: 'st-der-2',
    title: 'BFS обход дерева',
    description: 'Дан корень дерева. Верните вершины в порядке BFS.',
    expectedOutput: 'Список вершин',
    hints: ['Используйте очередь'],
    solutionTemplate: `def solution(root) -> list:
    # Ваш код здесь
    pass`,
    testCases: [],
  },
  {
    id: 'task-4',
    topicId: 'derevya',
    subtopicId: 'st-der-3',
    title: 'DFS обход дерева',
    description: 'Дан корень дерева. Верните вершины в порядке DFS.',
    expectedOutput: 'Список вершин',
    hints: ['Рекурсия или стек'],
    solutionTemplate: `def solution(root) -> list:
    # Ваш код здесь
    pass`,
    testCases: [],
  },
  {
    id: 'task-5',
    topicId: 'dp',
    subtopicId: 'st-dp-1',
    title: 'Числа Фибоначчи',
    description: 'Верните n-е число Фибоначчи. F(0)=0, F(1)=1.',
    expectedOutput: 'Число Фибоначчи',
    hints: ['DP: F(n) = F(n-1) + F(n-2)'],
    solutionTemplate: `def solution(n: int) -> int:
    # Ваш код здесь
    pass`,
    testCases: [{ input: '5', expected: '5' }],
  },
];

/** @deprecated Use ROADMAP */
export const ROADMAP_TOPICS = ROADMAP.flatMap((t) => [
  { id: t.id, title: t.title, theory: `theory-${t.id}`, taskIds: TASKS.filter((x) => x.topicId === t.id).map((x) => x.id) },
  ...t.subtopics.map((s) => ({ id: s.id, title: s.title, theory: undefined as string | undefined, taskIds: TASKS.filter((x) => x.topicId === t.id && x.subtopicId === s.id).map((x) => x.id) })),
]);

export const THEORIES: Record<string, string> = {
  'theory-osnovy': '# Основы\n\nБазовые концепции алгоритмов и структур данных.',
  'theory-rekursiya': '# Рекурсия\n\nРекурсивные алгоритмы и техники.',
  'theory-sortirovki': '# Сортировки\n\nРазличные алгоритмы сортировки.',
  'theory-poisk': '# Поиск\n\nЛинейный, бинарный и специализированный поиск.',
  'theory-derevya': '# Деревья\n\nДревовидные структуры данных.',
  'theory-grafy': '# Графы\n\nАлгоритмы на графах.',
  'theory-dp': '# Динамическое программирование\n\nОптимизация через подзадачи.',
  'theory-struktury': '# Структуры данных\n\nДополнительные структуры.',
  'theory-prodvinutye': '# Продвинутые темы\n\nПродвинутые алгоритмы.',
};


