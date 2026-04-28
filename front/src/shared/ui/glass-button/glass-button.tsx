import styles from "./glass-button.module.css";

interface GlassButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  layoutId?: string; // для скольжения (deprecated, оставлен для совместимости)
  variant?: "default" | "close" | "toolbar";
  className?: string; // можно передавать кастомный класс
  disabled?: boolean;
  type?: "button" | "submit";
  "aria-label"?: string;
}

export function GlassButton({
  children,
  onClick,
  active,
  layoutId,
  variant = "default",
  className = "",
  disabled = false,
  type = "button",
  "aria-label": ariaLabel,
}: GlassButtonProps) {
  return (
    <button
      type={type}
      aria-label={ariaLabel}
      className={`${styles.button} ${variant === "close" ? styles.close : ""} ${variant === "toolbar" ? styles.toolbar : ""} ${active ? styles.active : ""} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {/* активный зелёный блок */}
      {active && layoutId && (
        <div className={styles.activeHighlight} />
      )}
      <span className={styles.label}>{children}</span>
    </button>
  );
}