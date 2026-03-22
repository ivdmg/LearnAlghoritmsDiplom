import type { Task } from './types';
import { ROADMAP } from '@/entities/roadmap';

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

export const THEORIES: Record<string, string> = {
  'theory-osnovy': '# Основы\n\nБазовые концепции алгоритмов и структур данных.',
  'theory-rekursiya': '# Рекурсия\n\nРекурсивные алгоритмы и техники.',
  'theory-sortirovki':
    '# Сортировки\n\nПолная теория загружается из статьи в сайдбаре (db.json). Если статья недоступна: смотрите раздел «Сортировки» — от простых O(n²) до merge/quick/heap и линейных counting/radix.',
  'theory-poisk':
    '# Поиск\n\nПолная теория — в статьях сайдбара. Кратко: линейный поиск, бинарный поиск, бинпоиск по ответу, lower_bound / upper_bound.',
  'theory-derevya': '# Деревья\n\nДревовидные структуры данных.',
  'theory-grafy': '# Графы\n\nАлгоритмы на графах.',
  'theory-dp': '# Динамическое программирование\n\nОптимизация через подзадачи.',
  'theory-struktury': '# Структуры данных\n\nДополнительные структуры.',
  'theory-prodvinutye': '# Продвинутые темы\n\nПродвинутые алгоритмы.',
};

/** Ordered list of task IDs for prev/next navigation (follows roadmap structure) */
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

/** Flat list of topics + subtopics with taskIds (e.g. for animation page) */
export const ROADMAP_TOPICS = ROADMAP.flatMap((t) => [
  { id: t.id, title: t.title, theory: `theory-${t.id}` as const, taskIds: TASKS.filter((x) => x.topicId === t.id).map((x) => x.id) },
  ...t.subtopics.map((s) => ({
    id: s.id,
    title: s.title,
    theory: undefined as string | undefined,
    taskIds: TASKS.filter((x) => x.topicId === t.id && x.subtopicId === s.id).map((x) => x.id),
  })),
]);
