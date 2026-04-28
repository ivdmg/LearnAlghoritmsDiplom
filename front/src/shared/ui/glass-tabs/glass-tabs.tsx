import { useCallback, useEffect, useRef, useState } from "react";
import { GlassButton } from "../glass-button/glass-button";
import styles from "./glass-tabs.module.css";

export interface GlassTabsItem {
  key: string;
  label?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  /** Вариант отображения: обычная плашка или компактная круглая иконка */
  variant?: "default" | "icon";
}

interface GlassTabsProps {
  items: GlassTabsItem[];
  activeKey: string;
  onChange: (key: string) => void;
}

export function GlassTabs({ items, activeKey, onChange }: GlassTabsProps) {
  const mainItems = items.filter((item) => item.variant !== "icon");
  const iconItems = items.filter((item) => item.variant === "icon");

  const rootRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties | null>(null);
  const [mounted, setMounted] = useState(false);

  const updateIndicator = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;

    const activeBtn = root.querySelector(`.${styles.tabButtonActive}`) as HTMLElement | null;
    if (!activeBtn) {
      setIndicatorStyle(null);
      return;
    }

    const rootRect = root.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();

    setIndicatorStyle({
      left: btnRect.left - rootRect.left,
      top: btnRect.top - rootRect.top,
      width: btnRect.width,
      height: btnRect.height,
    });
  }, []);

  // Первый рендер — ставим индикатор без transition
  useEffect(() => {
    updateIndicator();
    // После первого обновления включаем transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setMounted(true);
      });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // При смене активного таба — обновляем позицию (transition уже включён)
  useEffect(() => {
    if (mounted) {
      updateIndicator();
    }
  }, [activeKey, mounted, updateIndicator]);

  useEffect(() => {
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

  return (
    <div ref={rootRef} className={styles.root}>
      {/* Скользящий индикатор — CSS transition вместо framer-motion spring */}
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

      {mainItems.map((item) => {
        const isActive = item.key === activeKey;
        const isIcon = item.variant === "icon";
        const content = item.icon ?? item.label;

        return (
          <div key={item.key} className={styles.tabWrapper}>
            <GlassButton
              onClick={item.disabled ? undefined : () => onChange(item.key)}
              className={
                isIcon
                  ? `${styles.iconTabButton} ${isActive ? styles.tabButtonActive : ''}`
                  : `${styles.tabButton} ${isActive ? styles.tabButtonActive : ''}`
              }
              disabled={item.disabled}
              active={isActive}
            >
              {content}
            </GlassButton>
          </div>
        );
      })}
      {iconItems.length > 0 && <div className={styles.spacer} />}
      {iconItems.map((item) => {
        const isActive = item.key === activeKey;
        const content = item.icon ?? item.label;

        return (
          <div key={item.key} className={styles.tabWrapper}>
            <GlassButton
              onClick={item.disabled ? undefined : () => onChange(item.key)}
              className={`${styles.iconTabButton} ${isActive ? styles.tabButtonActive : ''}`}
              disabled={item.disabled}
              active={isActive}
            >
              {content}
            </GlassButton>
          </div>
        );
      })}
    </div>
  );
}
