import { useNavigate } from 'react-router-dom';
import type { Task } from '@/entities/task';
import { TaskRowList } from '@/shared/ui';
import styles from './task-list.module.css';

interface TaskListProps {
  tasks: Task[];
  onClose: () => void;
}

export function TaskList({ tasks, onClose }: TaskListProps) {
  const navigate = useNavigate();

  const handleTaskSelect = (task: Task) => {
    onClose();
    navigate(`/task/${task.id}`);
  };

  return (
    <div className={styles.wrap}>
      <TaskRowList
        tasks={tasks}
        onTaskSelect={handleTaskSelect}
        emptyText="Пока нет задач для этой темы."
      />
    </div>
  );
}
