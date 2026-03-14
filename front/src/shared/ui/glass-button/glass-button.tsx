import { motion } from "framer-motion";
import styles from "./glass-button.module.css";

interface GlassButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  layoutId?: string; // для скольжения
  variant?: "default" | "close";
  className?: string; // можно передавать кастомный класс
  disabled?: boolean;
}

export function GlassButton({
  children,
  onClick,
  active,
  layoutId,
  variant = "default",
  className = "",
  disabled = false,
}: GlassButtonProps) {
  return (
    <motion.button
      className={`${styles.button} ${variant === "close" ? styles.close : ""} ${className}`}
      onClick={onClick}
      disabled={disabled}
      layout
    >
      {/* активный зелёный блок */}
      {active && layoutId && (
        <motion.div
          className={styles.activeHighlight}
          layoutId={layoutId}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
      <span className={styles.label}>{children}</span>
    </motion.button>
  );
}