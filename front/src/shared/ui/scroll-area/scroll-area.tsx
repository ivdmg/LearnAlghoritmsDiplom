import type { ReactNode } from 'react';
import styles from './scroll-area.module.css';

type ScrollAreaProps = {
  children: ReactNode;
  className?: string;
  viewportClassName?: string;
};

export function ScrollArea({
  children,
  className = '',
  viewportClassName = '',
}: ScrollAreaProps) {
  return (
    <div className={`${styles.root} ${className}`}>
      <div className={`${styles.viewport} ${viewportClassName}`}>{children}</div>
    </div>
  );
}

