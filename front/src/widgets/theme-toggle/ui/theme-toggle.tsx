import { LayoutGroup, motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/shared/lib/hooks/use-app-selector';
import { setTheme } from '@/shared/store/slices/theme-slice';
import styles from './theme-toggle.module.css';

const ICON_SIZE = 18;

const layoutTransition = {
  type: 'spring' as const,
  stiffness: 140,
  damping: 22,
  mass: 1.05,
};

export function ThemeToggle() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme.mode);

  return (
    <LayoutGroup>
      <div className={styles.wrap}>
        <div className={styles.underGlow} aria-hidden />
        <div className={styles.root} role="group" aria-label="Переключение темы">
          <div className={styles.track}>
            <div className={styles.slot}>
              {mode === 'light' && (
                <motion.div
                  className={styles.indicator}
                  layoutId="theme-toggle-segment"
                  transition={layoutTransition}
                />
              )}
              <button
                type="button"
                className={`${styles.btn} ${mode === 'light' ? styles.btnActive : ''}`}
                onClick={() => dispatch(setTheme('light'))}
                aria-pressed={mode === 'light'}
                aria-label="Светлая тема"
              >
                <Sun size={ICON_SIZE} strokeWidth={2} aria-hidden />
              </button>
            </div>
            <div className={styles.slot}>
              {mode === 'dark' && (
                <motion.div
                  className={styles.indicator}
                  layoutId="theme-toggle-segment"
                  transition={layoutTransition}
                />
              )}
              <button
                type="button"
                className={`${styles.btn} ${mode === 'dark' ? styles.btnActive : ''}`}
                onClick={() => dispatch(setTheme('dark'))}
                aria-pressed={mode === 'dark'}
                aria-label="Тёмная тема"
              >
                <Moon size={ICON_SIZE} strokeWidth={2} aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </div>
    </LayoutGroup>
  );
}
