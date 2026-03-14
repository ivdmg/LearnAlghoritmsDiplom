import { motion, LayoutGroup } from "framer-motion";
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

  return (
    <LayoutGroup>
      <div className={styles.root}>
        {mainItems.map((item) => {
          const isActive = item.key === activeKey;
          const isIcon = item.variant === "icon";
          const content = item.icon ?? item.label;

          return (
            <div key={item.key} className={styles.tabWrapper}>
              {isActive && (
                <motion.div
                  className={styles.indicator}
                  layoutId="glass-tabs-indicator"
                  transition={{
                    type: "spring",
                    stiffness: 320,
                    damping: 32,
                  }}
                />
              )}

              <GlassButton
                onClick={item.disabled ? undefined : () => onChange(item.key)}
                className={
                  isIcon ? styles.iconTabButton : styles.tabButton
                }
                disabled={item.disabled}
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
              {isActive && (
                <motion.div
                  className={styles.indicator}
                  layoutId="glass-tabs-indicator"
                  transition={{
                    type: "spring",
                    stiffness: 320,
                    damping: 32,
                  }}
                />
              )}

              <GlassButton
                onClick={item.disabled ? undefined : () => onChange(item.key)}
                className={styles.iconTabButton}
                disabled={item.disabled}
              >
                {content}
              </GlassButton>
            </div>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

