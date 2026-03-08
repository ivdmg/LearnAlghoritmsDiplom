import { motion, LayoutGroup } from "framer-motion";
import { GlassButton } from "../glass-button/glass-button";
import styles from "./glass-tabs.module.css";

export interface GlassTabsItem {
  key: string;
  label: string;
}

interface GlassTabsProps {
  items: GlassTabsItem[];
  activeKey: string;
  onChange: (key: string) => void;
}

export function GlassTabs({ items, activeKey, onChange }: GlassTabsProps) {
  return (
    <LayoutGroup>
      <div className={styles.root}>
        {items.map((item) => {
          const isActive = item.key === activeKey;

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
                onClick={() => onChange(item.key)}
                className={styles.tabButton}
              >
                {item.label}
              </GlassButton>
            </div>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

