import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassButton } from "../glass-button/glass-button";
import styles from "./glass-sidebar.module.css";

export type GlassSidebarTabKey = string;

interface GlassSidebarTab {
  key: GlassSidebarTabKey;
  label: string;
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
            {/* HEADER */}
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

            {/* TABS */}
            {tabs.length > 0 && (
              <div className={styles.tabs}>
                {tabs.map((tab) => (
                  <motion.div key={tab.key} className={styles.tabWrapper}>
                    {tab.key === activeTab && (
                      <motion.div
                        layoutId="sidebar-tab-highlight"
                        className={styles.tabHighlight}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}

                    <GlassButton
                      onClick={() => onTabChange(tab.key)}
                      className={styles.tab}
                    >
                      {tab.label}
                    </GlassButton>
                  </motion.div>
                ))}
              </div>
            )}

            {/* CONTENT */}
            <div className={styles.content}>{children}</div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}