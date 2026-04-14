import { useCallback, useEffect, useRef, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/shared/lib/hooks/use-app-selector';
import { setTheme } from '@/shared/store/slices/theme-slice';
import styles from './theme-toggle.module.css';

export type ThemeToggleProps = {
  /** Компактный вид для хедера: без отступа снизу и без подсветки под блоком */
  compact?: boolean;
};

export function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme.mode);
  const iconSize = compact ? 16 : 18;

  // Скользящий индикатор — CSS transition вместо framer-motion layoutId
  const trackRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties | null>(null);
  const [mounted, setMounted] = useState(false);

  const updateIndicator = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const activeBtn = track.querySelector(`.${styles.btnActive}`) as HTMLElement | null;
    if (!activeBtn) {
      setIndicatorStyle(null);
      return;
    }

    const trackRect = track.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();

    setIndicatorStyle({
      left: btnRect.left - trackRect.left,
      top: btnRect.top - trackRect.top,
      width: btnRect.width,
      height: btnRect.height,
    });
  }, []);

  // Первый рендер — без transition
  useEffect(() => {
    updateIndicator();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setMounted(true);
      });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // При смене темы — обновляем позицию
  useEffect(() => {
    if (mounted) {
      updateIndicator();
    }
  }, [mode, mounted, updateIndicator]);

  useEffect(() => {
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

  return (
    <div className={`${styles.wrap} ${compact ? styles.wrapCompact : ''}`}>
      {!compact && <div className={styles.underGlow} aria-hidden />}
      <div className={styles.root} role="group" aria-label="Переключение темы">
        <div ref={trackRef} className={styles.track}>
          {/* Скользящий индикатор — CSS transition вместо framer-motion layoutId */}
          {indicatorStyle && (
            <div
              className={styles.indicator}
              style={{
                ...indicatorStyle,
                transition: mounted
                  ? 'left 0.35s cubic-bezier(0.4, 0, 0.2, 1), top 0.35s cubic-bezier(0.4, 0, 0.2, 1), width 0.35s cubic-bezier(0.4, 0, 0.2, 1), height 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
                  : 'none',
              }}
              aria-hidden
            />
          )}
          <div className={styles.slot}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnSun} ${mode === 'light' ? styles.btnActive : ''}`}
              onClick={() => dispatch(setTheme('light'))}
              aria-pressed={mode === 'light'}
              aria-label="Светлая тема"
            >
              <Sun size={iconSize} strokeWidth={2} aria-hidden />
            </button>
          </div>
          <div className={styles.slot}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnMoon} ${mode === 'dark' ? styles.btnActive : ''}`}
              onClick={() => dispatch(setTheme('dark'))}
              aria-pressed={mode === 'dark'}
              aria-label="Тёмная тема"
            >
              <Moon size={iconSize} strokeWidth={2} aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
