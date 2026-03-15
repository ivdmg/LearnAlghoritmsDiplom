import type { RoadmapTopic } from './types';

export const ROADMAP: RoadmapTopic[] = [
  {
    id: 'osnovy',
    title: 'Основы',
    subtopics: [
      { id: 'st-osn-1', title: 'Сложность алгоритмов', position: 'center', taskIds: [] },
      { id: 'st-osn-2', title: 'Массивы и строки', position: 'center', taskIds: [] },
      { id: 'st-osn-3', title: 'Базовые операции с массивами', position: 'center', taskIds: [] },
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
      { id: 'st-sort-4', title: 'Heap sort', position: 'center', taskIds: [] },
      { id: 'st-sort-5', title: 'Сортировка подсчётом, поразрядная (counting, radix)', position: 'center', taskIds: [] },
    ],
  },
  {
    id: 'poisk',
    title: 'Поиск',
    subtopics: [
      { id: 'st-pois-1', title: 'Линейный поиск', position: 'center', taskIds: [] },
      { id: 'st-pois-2', title: 'Бинарный поиск', position: 'center', taskIds: [] },
      { id: 'st-pois-3', title: 'Двоичный поиск по ответу', position: 'center', taskIds: [] },
      { id: 'st-pois-4', title: 'Поиск в отсортированных структурах (lower_bound, upper_bound)', position: 'center', taskIds: [] },
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
