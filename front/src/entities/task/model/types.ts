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
  hints: string[];
  solutionTemplate: string;
  testCases: { input: string; expected: string }[];
}
