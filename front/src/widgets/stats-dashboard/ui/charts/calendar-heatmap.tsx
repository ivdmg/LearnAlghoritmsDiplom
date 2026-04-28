import { useMemo, useState } from 'react';
import styles from './calendar-heatmap.module.css';

type CalendarDay = { date: string; count: number };

type Props = {
  data: CalendarDay[];
};

export type HeatmapRange = 'week' | 'month' | 'year';

const MONTH_NAMES = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

function toDateKeyLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getLevel(count: number): number {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  return 3;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

function pluralTasks(n: number): string {
  if (n === 1) return 'задача';
  if (n < 5) return 'задачи';
  return 'задач';
}

/**
 * Собирает массив недель за заданный период
 */
function buildWeeks(
  dataMap: Map<string, number>,
  range: HeatmapRange,
  today: Date
): { date: string; count: number; level: number }[][] {
  let totalDays: number;
  switch (range) {
    case 'week':
      totalDays = 7;
      break;
    case 'month':
      totalDays = 28; // 4 weeks
      break;
    default:
      totalDays = 364;
  }

  const dow = today.getDay();
  const daysSinceMonday = dow === 0 ? 6 : dow - 1;
  const endDate = new Date(today);
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - daysSinceMonday - (totalDays === 7 ? 0 : totalDays - (dow === 0 ? 7 : 0)));

  const weeks: { date: string; count: number; level: number }[][] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    const week: { date: string; count: number; level: number }[] = [];
    for (let d = 0; d < 7; d++) {
      if (current > end) break;
      // Important: do NOT use toISOString() here — it converts to UTC and может "съесть" сегодняшний день
      // в некоторых таймзонах. Нам нужен ключ именно локальной календарной даты.
      const dateStr = toDateKeyLocal(current);
      const count = dataMap.get(dateStr) ?? 0;
      week.push({ date: dateStr, count, level: getLevel(count) });
      current.setDate(current.getDate() + 1);
    }
    if (week.length > 0) weeks.push(week);
  }

  return weeks;
}

export function CalendarHeatmap({ data }: Props) {
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const dataMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const d of data) m.set(d.date, d.count);
    return m;
  }, [data]);

  const [range, setRange] = useState<HeatmapRange>('year');

  const weeks = useMemo(() => buildWeeks(dataMap, range, today), [dataMap, range, today]);

  // Total solved for the visible range
  const totalVisible = useMemo(() => {
    let t = 0;
    for (const w of weeks) for (const d of w) t += d.count;
    return t;
  }, [weeks]);

  // Month labels
  const monthPositions = useMemo(() => {
    if (range === 'week') return [];
    const result: { label: string; colIndex: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, wi) => {
      const d = new Date(week[0].date + 'T12:00:00Z');
      if (d.getMonth() !== lastMonth) {
        result.push({ label: MONTH_NAMES[d.getMonth()], colIndex: wi });
        lastMonth = d.getMonth();
      }
    });
    return result;
  }, [weeks, range]);

  const [tooltip, setTooltip] = useState<{
    x: number; y: number; date: string; count: number;
  } | null>(null);

  return (
    <div className={styles.wrapper} onMouseLeave={() => setTooltip(null)}>
      {/* Range selector */}
      <div className={styles.rangeBar}>
        <div className={styles.rangeButtons}>
          {(['week', 'month', 'year'] satisfies HeatmapRange[]).map((r) => (
            <button
              key={r}
              type="button"
              className={`${styles.rangeBtn} ${range === r ? styles.rangeBtnActive : ''}`}
              onClick={() => setRange(r)}
            >
              {r === 'week' ? 'Неделя' : r === 'month' ? 'Месяц' : 'Год'}
            </button>
          ))}
        </div>
        <span className={styles.totalLabel}>{totalVisible} {pluralTasks(totalVisible)}</span>
      </div>

      <div className={styles.gridContainer}>
        {/* Day labels */}
        <div className={styles.dayLabels}>
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>

        {/* Main area */}
        <div className={styles.graphArea}>
          {/* Month row */}
          {range !== 'week' && (
            <div className={styles.monthRow}>
              {monthPositions.map((m, i) => {
                const leftPercent = weeks.length > 0 ? (m.colIndex / weeks.length) * 100 : 0;
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
          )}

          {/* Weeks grid */}
          <div className={styles.weeksGrid}>
            {weeks.map((week, wi) => (
              <div key={wi} className={styles.weekCol}>
                {week.map((day, di) => (
                  <div
                    key={`${wi}-${di}`}
                    className={`${styles.dayCell} ${styles[`level${day.level}`]}`}
                    onMouseEnter={(e) => {
                      const rect = (e.target as HTMLElement).getBoundingClientRect();
                      const containerRect = (e.currentTarget.closest(`.${styles.wrapper}`) as HTMLElement)?.getBoundingClientRect();
                      setTooltip({
                        x: rect.left - (containerRect?.left ?? 0) + rect.width / 2,
                        y: rect.top - (containerRect?.top ?? 0) - 6,
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
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.count} {pluralTasks(tooltip.count)} — {formatDate(tooltip.date)}
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
