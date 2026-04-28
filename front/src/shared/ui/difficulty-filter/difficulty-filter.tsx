import { useState, useRef, useEffect } from 'react';
import styles from './difficulty-filter.module.css';

export type DifficultyFilterValue = 'easy' | 'medium' | 'hard' | null;

interface DifficultyFilterProps {
  value: DifficultyFilterValue;
  onChange: (value: DifficultyFilterValue) => void;
}

const OPTIONS: { value: DifficultyFilterValue; label: string }[] = [
  { value: null, label: 'Все' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

export function DifficultyFilter({ value, onChange }: DifficultyFilterProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (v: DifficultyFilterValue) => {
    onChange(v);
    setOpen(false);
  };

  const activeLabel = OPTIONS.find((o) => o.value === value)?.label ?? 'Все';

  return (
    <div ref={ref} className={styles.root}>
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className={styles.triggerLabel}>
          Сложность: {activeLabel}
        </span>
        <svg
          className={styles.chevron}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className={styles.dropdown} role="listbox">
          {OPTIONS.map((opt) => (
            <button
              key={opt.label}
              type="button"
              className={`${styles.option} ${value === opt.value ? styles.optionActive : ''} ${opt.value ? styles[`option_${opt.value}`] : ''}`}
              onClick={() => handleSelect(opt.value)}
              role="option"
              aria-selected={value === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
