import type { Task, TaskDifficulty } from '@/entities/task';
import styles from './task-row-list.module.css';

function difficultyLabel(d: TaskDifficulty): string {
  if (d === 'easy') return 'Easy';
  if (d === 'medium') return 'Medium';
  return 'Hard';
}

export interface TaskRowListProps {
  tasks: Task[];
  onTaskSelect: (task: Task) => void;
  className?: string;
  emptyText?: string;
}

export function TaskRowList({
  tasks,
  onTaskSelect,
  className = '',
  emptyText = 'Пока нет задач в этом разделе.',
}: TaskRowListProps) {
  if (tasks.length === 0) {
    return <div className={styles.empty}>{emptyText}</div>;
  }

  return (
    <div className={`${styles.tasks} ${className}`.trim()}>
      {tasks.map((task) => {
        const diff = task.difficulty ?? 'easy';
        return (
          <button
            key={task.id}
            type="button"
            className={styles.taskItem}
            onClick={() => onTaskSelect(task)}
          >
            <div className={styles.taskLeft}>
              <div className={styles.taskTitle}>{task.title}</div>
            </div>
            <span className={`${styles.diffBadge} ${styles[`diff_${diff}`]}`}>
              {difficultyLabel(diff)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
