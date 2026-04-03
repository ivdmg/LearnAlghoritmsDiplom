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
  /** Страница решения задачи: /task/:id (не путать с /tasks — она тоже начинается с «task» в URL) */
  const isTaskSolution = location.pathname.startsWith('/task/');

  const activeNavTab = isRoadmap ? 'roadmap' : isTasksList ? 'tasks' : null;

  const currentTaskTitle =
    isTaskSolution && taskId ? TASKS.find((t) => t.id === taskId)?.title ?? 'Задача' : null;

  let centerTitle: string;
  if (isRoadmap) {
    centerTitle = 'AlgoLearn — Roadmap';
  } else if (isTasksList) {
    centerTitle = 'Задачи';
  } else if (isTaskSolution) {
    centerTitle = currentTaskTitle ?? 'Задача';
  } else {
    centerTitle = 'AlgoLearn';
  }

  return (
    <header className={styles.headerShell}>
      <LayoutGroup>
        <GlassTopbar
          left={
            <nav className={styles.navPill} aria-label="Основная навигация">
              <div className={styles.navTrack}>
                <div className={styles.navSlot}>
                  {activeNavTab === 'roadmap' && (
                    <motion.div
                      className={styles.navIndicator}
                      layoutId="header-main-nav-pill"
                      transition={navSpring}
                    />
                  )}
                  <button
                    type="button"
                    className={`${styles.navBtn} ${activeNavTab === 'roadmap' ? styles.navBtnActive : ''}`}
                    onClick={() => navigate('/')}
                    aria-current={activeNavTab === 'roadmap' ? 'page' : undefined}
                  >
                    Roadmap
                  </button>
                </div>
                <div className={styles.navSlot}>
                  {activeNavTab === 'tasks' && (
                    <motion.div
                      className={styles.navIndicator}
                      layoutId="header-main-nav-pill"
                      transition={navSpring}
                    />
                  )}
                  <button
                    type="button"
                    className={`${styles.navBtn} ${activeNavTab === 'tasks' ? styles.navBtnActive : ''}`}
                    onClick={() => navigate('/tasks')}
                    aria-current={activeNavTab === 'tasks' ? 'page' : undefined}
                  >
                    Tasks
                  </button>
                </div>
              </div>
            </nav>
          }
          center={
            <div className={styles.titleSlot}>
              {isTaskSolution && (
                <motion.div
                  className={styles.titleNavIndicator}
                  layoutId="header-main-nav-pill"
                  transition={navSpring}
                />
              )}
              <span className={styles.title}>{centerTitle}</span>
            </div>
          }
          right={
            <div className={styles.headerRight}>
              <ThemeToggle compact />
            </div>
          }
        />
      </LayoutGroup>
    </header>
  );
}
