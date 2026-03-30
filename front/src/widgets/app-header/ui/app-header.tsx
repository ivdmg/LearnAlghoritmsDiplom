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
  const isTasks = location.pathname.startsWith('/task');

  const activeTab = isTasks ? 'tasks' : 'roadmap';

  const currentTaskTitle =
    isTasks && taskId ? TASKS.find((t) => t.id === taskId)?.title ?? 'Задачи' : null;

  const isProfile = location.pathname === '/profile';

  let centerTitle: string;
  if (isRoadmap) {
    centerTitle = 'AlgoLearn — Roadmap';
  } else if (isTasks) {
    centerTitle = currentTaskTitle ?? 'Задачи';
  } else if (location.pathname.startsWith('/animation')) {
    centerTitle = 'Анимация фитиля';
  } else if (isProfile) {
    centerTitle = 'Личный кабинет';
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
              onClick={() => {
                const firstTaskId = TASKS[0]?.id;
                if (firstTaskId) navigate(`/task/${firstTaskId}`);
              }}
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
            <button
              className={styles.profileBtn}
              onClick={() => navigate('/profile')}
              aria-label="Личный кабинет"
              type="button"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M20 21a8 8 0 0 0-16 0" />
              </svg>
            </button>
          </div>
        }
      />
    </header>
  );
}
