/**
 * Entity: Task
 * Domain types for tasks and theories.
 */

export type TaskDifficulty = 'easy' | 'medium' | 'hard';

export interface Task {
  id: string;
  topicId: string;
  subtopicId?: string;
  title: string;
  description: string;
  difficulty: TaskDifficulty;
  /** Очки за решение: easy=10, medium=20, hard=30 */
  points: number;
  expectedOutput: string;
  /** Опциональный код ожидаемого вывода (для красивого рендера) */
  expectedOutputCode?: string;
  /** Язык подсветки для ожидаемого вывода (по умолчанию text) */
  expectedOutputLanguage?: string;
  hints: string[];
  solutionTemplate: string;
  /** Эталонное решение (Python) */
  solution?: string;
  /** Текст о формате кода (отображается в инфобоксе) */
  formatInfo?: string;
  testCases: { input: string; expected: string }[];
}
