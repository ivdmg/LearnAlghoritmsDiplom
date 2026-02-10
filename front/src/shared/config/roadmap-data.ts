export interface RoadmapTopic {
  id: string;
  title: string;
  theory?: string;
  taskIds: string[];
}

export interface Task {
  id: string;
  topicId: string;
  title: string;
  description: string;
  expectedOutput: string;
  hints: string[];
  solutionTemplate: string;
  testCases: { input: string; expected: string }[];
}

export const ROADMAP_TOPICS: RoadmapTopic[] = [
  { id: '1', title: 'Введение в алгоритмы', theory: 'theory-1', taskIds: ['task-1', 'task-2'] },
  { id: '2', title: 'Массивы', theory: 'theory-2', taskIds: ['task-3', 'task-4'] },
  { id: '3', title: 'Строки', theory: 'theory-3', taskIds: ['task-5'] },
  { id: '4', title: 'Связные списки', theory: 'theory-4', taskIds: ['task-6'] },
  { id: '5', title: 'Стек и очередь', theory: 'theory-5', taskIds: ['task-7'] },
  { id: '6', title: 'Деревья', theory: 'theory-6', taskIds: ['task-8'] },
  { id: '7', title: 'Поиск в глубину', theory: 'theory-7', taskIds: ['task-9'] },
  { id: '8', title: 'Поиск в ширину', theory: 'theory-8', taskIds: ['task-10'] },
  { id: '9', title: 'Динамическое программирование', theory: 'theory-9', taskIds: ['task-11'] },
  { id: '10', title: 'Жадные алгоритмы', theory: 'theory-10', taskIds: ['task-12'] },
];

export const THEORIES: Record<string, string> = {
  'theory-1': `
# Введение в алгоритмы

Алгоритм — это последовательность действий для решения определённой задачи.

## Основные понятия

- **Сложность по времени** — как быстро растёт время выполнения при увеличении размера входных данных
- **Сложность по памяти** — сколько дополнительной памяти требуется алгоритму
- **Big O notation** — способ описания верхней границы сложности

## Примеры сложности

- O(1) — константная (доступ по индексу)
- O(log n) — логарифмическая (бинарный поиск)
- O(n) — линейная (проход по массиву)
- O(n²) — квадратичная (вложенные циклы)
  `,
  'theory-2': `
# Массивы

Массив — структура данных с непрерывным хранением элементов одного типа.

## Операции

- Доступ по индексу: O(1)
- Вставка в конец: O(1)
- Вставка в начало/середину: O(n)
- Поиск: O(n)
  `,
  'theory-3': '# Строки\n\nСтрока — последовательность символов. Основные операции: сравнение, поиск подстроки, конкатенация.',
  'theory-4': '# Связные списки\n\nКаждый элемент (узел) содержит данные и ссылку на следующий элемент.',
  'theory-5': '# Стек и очередь\n\nСтек: LIFO. Очередь: FIFO.',
  'theory-6': '# Деревья\n\nИерархическая структура с корневым узлом и потомками.',
  'theory-7': '# DFS\n\nПоиск в глубину — обход графа/дерева с углублением.',
  'theory-8': '# BFS\n\nПоиск в ширину — обход уровня за уровнем.',
  'theory-9': '# Динамическое программирование\n\nРешение путём разбиения на подзадачи с запоминанием результатов.',
  'theory-10': '# Жадные алгоритмы\n\nЛокально оптимальный выбор на каждом шаге.',
};

export const TASKS: Task[] = [
  {
    id: 'task-1',
    topicId: '1',
    title: 'Сумма двух чисел',
    description: 'Напишите функцию, которая принимает два числа и возвращает их сумму.',
    expectedOutput: 'Число — сумма двух аргументов',
    hints: ['Просто сложите аргументы', 'Используйте оператор +', 'Третий hint (позже платный)'],
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
    topicId: '1',
    title: 'Максимум из двух',
    description: 'Напишите функцию, которая принимает два числа и возвращает большее из них.',
    expectedOutput: 'Большее из двух чисел',
    hints: ['Используйте условие if', 'Можно использовать max()'],
    solutionTemplate: `def solution(a: int, b: int) -> int:
    # Ваш код здесь
    pass`,
    testCases: [
      { input: '5, 3', expected: '5' },
      { input: '2, 8', expected: '8' },
    ],
  },
  {
    id: 'task-3',
    topicId: '2',
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
    id: 'task-4',
    topicId: '2',
    title: 'Поиск максимума',
    description: 'Дан массив чисел. Верните максимальный элемент.',
    expectedOutput: 'Максимальный элемент массива',
    hints: ['Используйте max() или цикл'],
    solutionTemplate: `def solution(nums: list[int]) -> int:
    # Ваш код здесь
    pass`,
    testCases: [
      { input: '[3, 1, 4, 1, 5]', expected: '5' },
    ],
  },
  {
    id: 'task-5',
    topicId: '3',
    title: 'Длина строки',
    description: 'Дана строка. Верните её длину.',
    expectedOutput: 'Длина строки',
    hints: ['Используйте len()'],
    solutionTemplate: `def solution(s: str) -> int:
    # Ваш код здесь
    pass`,
    testCases: [
      { input: '"hello"', expected: '5' },
    ],
  },
  {
    id: 'task-6',
    topicId: '4',
    title: 'Переворот связного списка',
    description: 'Дан список. Верните его в обратном порядке. Вход: список Python.',
    expectedOutput: 'Список в обратном порядке',
    hints: ['Используйте reverse() или срез [::-1]'],
    solutionTemplate: `def solution(arr: list) -> list:
    # Ваш код здесь
    pass`,
    testCases: [
      { input: '[1, 2, 3]', expected: '[3, 2, 1]' },
    ],
  },
  {
    id: 'task-7',
    topicId: '5',
    title: 'Проверка скобок',
    description: 'Дана строка из скобок ()[]{}. Проверьте, правильно ли расставлены скобки.',
    expectedOutput: 'True или False',
    hints: ['Используйте стек', 'При открывающей — push, при закрывающей — pop'],
    solutionTemplate: `def solution(s: str) -> bool:
    # Ваш код здесь
    pass`,
    testCases: [
      { input: '"()"', expected: 'True' },
      { input: '"(]"', expected: 'False' },
    ],
  },
  {
    id: 'task-8',
    topicId: '6',
    title: 'Максимальная глубина дерева',
    description: 'Дан корень бинарного дерева (в виде вложенных списков или dict). Верните максимальную глубину.',
    expectedOutput: 'Число — глубина',
    hints: ['Рекурсия: max(left, right) + 1'],
    solutionTemplate: `def solution(root) -> int:
    # Ваш код здесь
    pass`,
    testCases: [
      { input: 'None', expected: '0' },
    ],
  },
  {
    id: 'task-9',
    topicId: '7',
    title: 'DFS обход графа',
    description: 'Дан граф в виде списка смежности. Верните вершины в порядке DFS.',
    expectedOutput: 'Список вершин',
    hints: ['Рекурсия или стек'],
    solutionTemplate: `def solution(graph: dict, start: int) -> list:
    # Ваш код здесь
    pass`,
    testCases: [],
  },
  {
    id: 'task-10',
    topicId: '8',
    title: 'BFS обход графа',
    description: 'Дан граф. Верните вершины в порядке BFS.',
    expectedOutput: 'Список вершин',
    hints: ['Используйте очередь'],
    solutionTemplate: `def solution(graph: dict, start: int) -> list:
    # Ваш код здесь
    pass`,
    testCases: [],
  },
  {
    id: 'task-11',
    topicId: '9',
    title: 'Числа Фибоначчи',
    description: 'Верните n-е число Фибоначчи (0-indexed). F(0)=0, F(1)=1.',
    expectedOutput: 'Число Фибоначчи',
    hints: ['DP: F(n) = F(n-1) + F(n-2)', 'Храните только последние два значения'],
    solutionTemplate: `def solution(n: int) -> int:
    # Ваш код здесь
    pass`,
    testCases: [
      { input: '5', expected: '5' },
    ],
  },
  {
    id: 'task-12',
    topicId: '10',
    title: 'Максимальная сумма подмассива',
    description: 'Дан массив. Найдите подмассив с максимальной суммой (алгоритм Кадане).',
    expectedOutput: 'Максимальная сумма',
    hints: ['На каждом шаге: либо добавляем текущий элемент, либо начинаем заново'],
    solutionTemplate: `def solution(nums: list[int]) -> int:
    # Ваш код здесь
    pass`,
    testCases: [
      { input: '[-2, 1, -3, 4, -1, 2, 1, -5, 4]', expected: '6' },
    ],
  },
];
