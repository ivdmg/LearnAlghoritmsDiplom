import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  // Блокируем скролл body, когда открыт сайдбар
  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  const tabItems = tabs.map((t) => ({
    key: t.key,
    label: t.label,
    icon: t.icon,
    disabled: t.disabled,
    variant: t.variant,
  }));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.backdrop}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.aside
            className={styles.sidebar}
            onClick={(e) => e.stopPropagation()}
            initial={{ x: 480, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 480, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 30,
              mass: 0.8,
            }}
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
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}