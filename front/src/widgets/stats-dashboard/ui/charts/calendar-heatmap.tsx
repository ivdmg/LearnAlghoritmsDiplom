import React from 'react';
import styles from './calendar-heatmap.module.css';

type CalendarDay = { date: string; count: number };

type Props = {
  data: CalendarDay[];
};

const MONTH_NAMES = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
const DAY_LABELS = ['Пн', 'Ср', 'Пт'];

function getLevel(count: number): number {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  return 3;
}

export function CalendarHeatmap({ data }: Props) {
  // Build a map for quick lookup
  const map = new Map<string, number>();
  for (const d of data) {
    map.set(d.date, d.count);
  }

  // Build the last ~365 days, aligned to start on a Monday
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Calculate the Monday that is ~52 weeks ago
  const dow = today.getDay(); // 0=Sun, 1=Mon, ...
  const daysSinceMonday = dow === 0 ? 6 : dow - 1;
  const endDate = new Date(today);
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - daysSinceMonday - 364 + (dow === 0 ? 7 : 0));

  // Generate weeks: each week has 7 days (Mon-Sun)
  const weeks: { date: string; count: number; level: number }[][] = [];
  let current = new Date(startDate);

  while (current <= endDate) {
    const week: { date: string; count: number; level: number }[] = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = current.toISOString().slice(0, 10);
      const count = map.get(dateStr) ?? 0;
      week.push({ date: dateStr, count, level: getLevel(count) });
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }

  // Month labels: find the first cell in each month
  const monthPositions: { label: string; colIndex: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const d = new Date(week[0].date);
    if (d.getMonth() !== lastMonth && week[0].level !== undefined) {
      monthPositions.push({ label: MONTH_NAMES[d.getMonth()], colIndex: wi });
      lastMonth = d.getMonth();
    }
  });

  // Tooltip state
  const [tooltip, setTooltip] = React.useState<{ x: number; y: number; date: string; count: number } | null>(null);

  const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.grid}
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Day labels */}
        <div className={styles.dayLabels}>
          {DAY_LABELS.map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>

        {/* Month row */}
        <div className={styles.monthRow}>
          {monthPositions.map((m, i) => {
            // Calculate the left offset based on colIndex
            const leftPercent = m.colIndex / weeks.length * 100;
            return (
              <span
                key={i}
                className={styles.monthLabel}
                style={{ left: `${leftPercent}%` }}
              >
                {m.label}
              </span>
            );
          })}
        </div>

        {/* Weeks grid */}
        <div className={styles.weeksContainer}>
          <div className={styles.weeksGrid}>
            {weeks.map((week, wi) => (
              <div key={wi} className={styles.weekCol}>
                {week.map((day, di) => (
                  <div
                    key={`${wi}-${di}`}
                    className={`${styles.dayCell} ${styles[`level${day.level}`]}`}
                    onMouseEnter={(e) => {
                      const rect = (e.target as HTMLElement).getBoundingClientRect();
                      setTooltip({
                        x: rect.left + rect.width / 2,
                        y: rect.top - 8,
                        date: day.date,
                        count: day.count,
                      });
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className={styles.tooltip}
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {tooltip.count} {tooltip.count === 1 ? 'задача' : tooltip.count < 5 ? 'задачи' : 'задач'}{' '}
          — {formatDate(tooltip.date)}
        </div>
      )}

      {/* Legend */}
      <div className={styles.legend}>
        <span>Меньше</span>
        {[0, 1, 2, 3].map((lv) => (
          <div key={lv} className={`${styles.legendCell} ${styles[`level${lv}`]}`} />
        ))}
        <span>Больше</span>
      </div>
    </div>
  );
}
