import { ThunderboltOutlined } from '@ant-design/icons';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ThemeToggle } from '@/widgets/theme-toggle/ui/theme-toggle';
import { GlassTopbar } from '@/shared/ui';
import { GlassButton } from '@/shared/ui/glass-button/glass-button';
import { TASKS } from '@/entities/task';
import styles from './app-header.module.css';

export function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { taskId } = useParams<{ taskId?: string }>();

  const isRoadmap = location.pathname === '/';
  const isTasksList = location.pathname === '/tasks';
  const isTaskDetails = location.pathname.startsWith('/task');

  const activeTab = isTasksList || isTaskDetails ? 'tasks' : 'roadmap';

  const currentTaskTitle =
    isTaskDetails && taskId ? TASKS.find((t) => t.id === taskId)?.title ?? 'Задачи' : null;

  let centerTitle: string;
  if (isRoadmap) {
    centerTitle = 'AlgoLearn — Roadmap';
  } else if (isTasksList) {
    centerTitle = 'Задачи';
  } else if (isTaskDetails) {
    centerTitle = currentTaskTitle ?? 'Задачи';
  } else if (location.pathname.startsWith('/animation')) {
    centerTitle = 'Анимация фитиля';
  } else {
    centerTitle = 'AlgoLearn';
  }

  return (
    <header className={styles.headerShell}>
      <GlassTopbar
        left={
          <div className={styles.navTabs}>
            <GlassButton
              active={activeTab === 'roadmap'}
              layoutId="header-tab-highlight"
              onClick={() => navigate('/')}
            >
              Roadmap
            </GlassButton>
            <GlassButton
              active={activeTab === 'tasks'}
              layoutId="header-tab-highlight"
              onClick={() => navigate('/tasks')}
            >
              Tasks
            </GlassButton>
          </div>
        }
        center={<span className={styles.title}>{centerTitle}</span>}
        right={
          <div className={styles.headerRight}>
            <GlassButton onClick={() => navigate('/animation')}>
              <ThunderboltOutlined />
              <span>Animation</span>
            </GlassButton>
            <ThemeToggle />
          </div>
        }
      />
    </header>
  );
}
