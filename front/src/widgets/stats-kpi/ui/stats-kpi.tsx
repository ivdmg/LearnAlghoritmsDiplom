import type { MyStats } from '@/shared/hooks/use-my-stats';
import {
  FireOutlined,
  CheckCircleOutlined,
  PercentageOutlined,
  CalendarOutlined,
  TrophyOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import styles from './stats-kpi.module.css';

type Props = {
  stats: MyStats | null;
  statsLoading: boolean;
};

export function StatsKPI({ stats, statsLoading }: Props) {
  if (statsLoading && !stats) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={styles.card}>
            <div className={styles.label}>—</div>
            <div className={styles.value}>
              <span style={{ opacity: 0.3 }}>загрузка…</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const streakDays = stats?.streakDays ?? 0;
  const solvedTotal = stats?.solvedTotal ?? 0;
  const firstAttemptRate = stats?.firstAttemptRate ?? 0;
  const longestStreak = stats?.longestStreak ?? 0;
  const solvedLast7 = stats?.solvedLast7 ?? 0;

  const daysWithActivity = stats?.firstSolvedAt
    ? Math.floor((Date.now() - new Date(stats.firstSolvedAt).getTime()) / 86400000) + 1
    : 0;

  return (
    <div className={styles.grid}>
      <div className={styles.card}>
        <span className={styles.label}><FireOutlined /> Серия дней</span>
        <span className={`${styles.value} ${styles.valueStreak}`}>{streakDays}</span>
      </div>

      <div className={styles.card}>
        <span className={styles.label}><CheckCircleOutlined /> Всего решено</span>
        <span className={`${styles.value} ${styles.valueTotal}`}>{solvedTotal}</span>
      </div>

      <div className={styles.card}>
        <span className={styles.label}><PercentageOutlined /> С первой попытки</span>
        <span className={`${styles.value} ${styles.valueRate}`}>
          {firstAttemptRate > 0 ? `${Math.round(firstAttemptRate)}%` : '—'}
        </span>
      </div>

      <div className={styles.card}>
        <span className={styles.label}><CalendarOutlined /> Дней активности</span>
        <span className={`${styles.value} ${styles.valueDays}`}>{daysWithActivity || '—'}</span>
      </div>

      <div className={styles.card}>
        <span className={styles.label}><TrophyOutlined /> Рекорд серии</span>
        <span className={`${styles.value} ${styles.valueLongest}`}>
          {longestStreak || '—'}
        </span>
      </div>

      <div className={styles.card}>
        <span className={styles.label}><LineChartOutlined /> За 7 дней</span>
        <span className={`${styles.value} ${styles.valueRecent}`}>{solvedLast7 || 0}</span>
      </div>
    </div>
  );
}
