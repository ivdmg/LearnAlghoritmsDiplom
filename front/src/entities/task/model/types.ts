/**
 * Entity: Task
 * Domain types for tasks and theories.
 */

export interface Task {
  id: string;
  topicId: string;
  subtopicId?: string;
  title: string;
  description: string;
  expectedOutput: string;
  /** Опциональный код ожидаемого вывода (для красивого рендера) */
  expectedOutputCode?: string;
  /** Язык подсветки для ожидаемого вывода (по умолчанию text) */
  expectedOutputLanguage?: string;
  hints: string[];
  solutionTemplate: string;
  /** Текст о формате кода (отображается в инфобоксе) */
  formatInfo?: string;
  testCases: { input: string; expected: string }[];
}
