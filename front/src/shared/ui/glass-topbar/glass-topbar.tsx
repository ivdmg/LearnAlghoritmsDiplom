import styles from './glass-topbar.module.css';

interface GlassTopbarProps {
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}

export function GlassTopbar({ left, center, right, className = '' }: GlassTopbarProps) {
  return (
    <div className={`${styles.root} ${className}`}>
      <div className={styles.section}>{left}</div>
      <div className={styles.center}>{center}</div>
      <div className={styles.section}>{right}</div>
    </div>
  );
}

