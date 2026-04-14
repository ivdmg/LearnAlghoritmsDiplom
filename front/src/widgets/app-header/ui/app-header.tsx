import { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { User } from 'lucide-react';
import { ThemeToggle } from '@/widgets/theme-toggle';
import { GlassTopbar, AuthModal } from '@/shared/ui';
import { GlassButton } from '@/shared/ui/glass-button/glass-button';
import { TASKS } from '@/entities/task';
import { isApiConfigured } from '@/shared/config/api-url';
import { useAppSelector } from '@/shared/lib/hooks/use-app-selector';
import styles from './app-header.module.css';

export function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { taskId } = useParams<{ taskId?: string }>();
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const apiOn = isApiConfigured();
  const accountSignedIn = Boolean(apiOn && accessToken);

  const [authModalOpen, setAuthModalOpen] = useState(false);

  const isRoadmap = location.pathname === '/';
  const isTasksList = location.pathname === '/tasks';
  const isAccount = location.pathname === '/account';
  /** Страница решения задачи: /task/:id (не путать с /tasks — она тоже начинается с «task» в URL) */
  const isTaskSolution = location.pathname.startsWith('/task/');

  const activeNavTab = isRoadmap ? 'roadmap' : isTasksList ? 'tasks' : null;

  const currentTaskTitle =
    isTaskSolution && taskId ? TASKS.find((t) => t.id === taskId)?.title ?? 'Задача' : null;

  let centerTitle: string;
  if (isRoadmap) {
    centerTitle = 'AlgoLearn — Roadmap';
  } else if (isAccount) {
    centerTitle = 'Личный кабинет';
  } else if (isTasksList) {
    centerTitle = 'Задачи';
  } else if (isTaskSolution) {
    centerTitle = currentTaskTitle ?? 'Задача';
  } else {
    centerTitle = 'AlgoLearn';
  }

  const handleProfileClick = () => {
    if (accountSignedIn) {
      navigate('/account');
    } else {
      setAuthModalOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    // After successful login, navigate to account page
    navigate('/account');
  };

  // Скользящий индикатор навигации — CSS transition вместо framer-motion layoutId
  const navTrackRef = useRef<HTMLDivElement>(null);
  const [navIndicatorStyle, setNavIndicatorStyle] = useState<React.CSSProperties | null>(null);
  const [navMounted, setNavMounted] = useState(false);

  const updateNavIndicator = useCallback(() => {
    const track = navTrackRef.current;
    if (!track) return;

    const activeBtn = track.querySelector(`.${styles.navBtnActive}`) as HTMLElement | null;
    if (!activeBtn) {
      setNavIndicatorStyle(null);
      return;
    }

    const trackRect = track.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();

    setNavIndicatorStyle({
      left: btnRect.left - trackRect.left,
      top: btnRect.top - trackRect.top,
      width: btnRect.width,
      height: btnRect.height,
    });
  }, []);

  // Первый рендер — без transition
  useEffect(() => {
    updateNavIndicator();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setNavMounted(true);
      });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // При смене страницы — обновляем позицию
  useEffect(() => {
    if (navMounted) {
      updateNavIndicator();
    }
  }, [activeNavTab, navMounted, updateNavIndicator]);

  useEffect(() => {
    window.addEventListener('resize', updateNavIndicator);
    return () => window.removeEventListener('resize', updateNavIndicator);
  }, [updateNavIndicator]);

  return (
    <>
      <header className={styles.headerShell}>
        <GlassTopbar
          left={
            <nav className={styles.navPill} aria-label="Основная навигация">
              <div ref={navTrackRef} className={styles.navTrack}>
                {/* Скользящий индикатор — CSS transition вместо framer-motion layoutId */}
                {navIndicatorStyle && (
                  <div
                    className={styles.navIndicator}
                    style={{
                      ...navIndicatorStyle,
                      transition: navMounted
                        ? 'left 0.5s cubic-bezier(0.4, 0, 0.2, 1), top 0.5s cubic-bezier(0.4, 0, 0.2, 1), width 0.5s cubic-bezier(0.4, 0, 0.2, 1), height 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                        : 'none',
                    }}
                    aria-hidden
                  />
                )}
                <div className={styles.navSlot}>
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
              <span className={styles.title}>{centerTitle}</span>
            </div>
          }
          right={
            <div className={styles.headerRight}>
              <div
                className={`${styles.accountWrap} ${accountSignedIn ? styles.accountWrapActive : ''}`}
              >
                {accountSignedIn && <div className={styles.accountUnderGlow} aria-hidden />}
                <GlassButton
                  type="button"
                  className={`${styles.accountBtn} ${accountSignedIn ? styles.accountBtnSignedIn : ''}`}
                  onClick={handleProfileClick}
                  aria-label="Личный кабинет"
                >
                  <User size={18} strokeWidth={2} />
                </GlassButton>
              </div>
              <ThemeToggle compact />
            </div>
          }
        />
      </header>
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}
