import { LayoutGroup, motion } from 'framer-motion';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ThemeToggle } from '@/widgets/theme-toggle';
import { GlassTopbar } from '@/shared/ui';
import { TASKS } from '@/entities/task';
import styles from './app-header.module.css';

const navSpring = {
  type: 'spring' as const,
  stiffness: 320,
  damping: 32,
};

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
  } else {
    centerTitle = 'AlgoLearn';
  }

  return (
    <header className={styles.headerShell}>
      <GlassTopbar
        left={
          <LayoutGroup>
            <nav className={styles.navPill} aria-label="Основная навигация">
              <div className={styles.navTrack}>
                <div className={styles.navSlot}>
                  {activeTab === 'roadmap' && (
                    <motion.div
                      className={styles.navIndicator}
                      layoutId="header-main-nav-pill"
                      transition={navSpring}
                    />
                  )}
                  <button
                    type="button"
                    className={`${styles.navBtn} ${activeTab === 'roadmap' ? styles.navBtnActive : ''}`}
                    onClick={() => navigate('/')}
                    aria-current={activeTab === 'roadmap' ? 'page' : undefined}
                  >
                    Roadmap
                  </button>
                </div>
                <div className={styles.navSlot}>
                  {activeTab === 'tasks' && (
                    <motion.div
                      className={styles.navIndicator}
                      layoutId="header-main-nav-pill"
                      transition={navSpring}
                    />
                  )}
                  <button
                    type="button"
                    className={`${styles.navBtn} ${activeTab === 'tasks' ? styles.navBtnActive : ''}`}
                    onClick={() => navigate('/tasks')}
                    aria-current={activeTab === 'tasks' ? 'page' : undefined}
                  >
                    Tasks
                  </button>
                </div>
              </div>
            </nav>
          </LayoutGroup>
        }
        center={<span className={styles.title}>{centerTitle}</span>}
        right={
          <div className={styles.headerRight}>
            <ThemeToggle compact />
          </div>
        }
      />
    </header>
  );
}
