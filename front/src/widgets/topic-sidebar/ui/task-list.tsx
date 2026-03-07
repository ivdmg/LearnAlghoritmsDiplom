import { List, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import type { Task } from '@/entities/task';
import styles from './task-list.module.css';
import { GlassButton } from '@/shared/ui/glass-button/glass-button';

interface TaskListProps {
  tasks: Task[];
  onClose: () => void;
}

export function TaskList({ tasks, onClose }: TaskListProps) {
  const navigate = useNavigate();

  const handleTaskClick = (task: Task) => {
    onClose();
    navigate(`/task/${task.id}`);
  };

  return (
    <div className={styles.container}>
      <List
        dataSource={tasks}
        renderItem={(task) => (
          <List.Item>
            <div className={styles.taskItem}>
              <span className={styles.taskTitle}>{task.title}</span>
              <GlassButton onClick={() => handleTaskClick(task)}>
                Решить
              </GlassButton>
            </div>
          </List.Item>
        )}
      />
    </div>
  );
}
