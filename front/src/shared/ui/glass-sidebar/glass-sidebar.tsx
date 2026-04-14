import { useEffect, useState } from "react";
import { GlassButton } from "../glass-button/glass-button";
import { GlassTabs } from "../glass-tabs/glass-tabs";
import styles from "./glass-sidebar.module.css";

export type GlassSidebarTabKey = string;

interface GlassSidebarTab {
  key: GlassSidebarTabKey;
  label?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  variant?: "default" | "icon";
}

interface GlassSidebarProps {
  open: boolean;
  title: string;
  tabs: GlassSidebarTab[];
  activeTab: GlassSidebarTabKey;
  onTabChange: (key: GlassSidebarTabKey) => void;
  onClose: () => void;
  children: React.ReactNode;
}

export function GlassSidebar({
  open,
  title,
  tabs,
  activeTab,
  onTabChange,
  onClose,
  children,
}: GlassSidebarProps) {
  // Состояние для CSS-анимации: монтируем сразу, удаляем после завершения exit-анимации
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      // Небольшая задержка чтобы CSS transition сработал (rAF)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVisible(true);
        });
      });
    } else {
      setVisible(false);
      // Ждём завершения CSS transition (300ms) перед размонтированием
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Блокируем скролл body, когда открыт сайдбар
  useEffect(() => {
    if (!visible) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [visible]);

  const tabItems = tabs.map((t) => ({
    key: t.key,
    label: t.label,
    icon: t.icon,
    disabled: t.disabled,
    variant: t.variant,
  }));

  if (!mounted) return null;

  return (
    <div
      className={`${styles.backdrop} ${visible ? styles.backdropVisible : ""}`}
      onClick={onClose}
    >
      <aside
        className={`${styles.sidebar} ${visible ? styles.sidebarVisible : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 className={styles.title}>{title}</h2>

          <GlassButton
            onClick={onClose}
            variant="close"
            aria-label="Закрыть"
          >
            ✕
          </GlassButton>
        </header>

        {tabItems.length > 0 && (
          <div className={styles.tabsRow}>
            <GlassTabs
              items={tabItems}
              activeKey={activeTab}
              onChange={onTabChange}
            />
          </div>
        )}

        <div className={styles.content}>{children}</div>
      </aside>
    </div>
  );
}