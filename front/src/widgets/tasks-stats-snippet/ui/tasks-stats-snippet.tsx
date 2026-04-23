import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  CheckCircle,
  Clock,
  Flame,
  Trophy,
  LogIn,
  BarChart3,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { GlassButton } from '@/shared/ui/glass-button/glass-button';
import { useAppSelector } from '@/shared/lib/hooks/use-app-selector';
import { useMyStats } from '@/shared/hooks/use-my-stats';
import { isApiConfigured } from '@/shared/config/api-url';
import { TASKS } from '@/entities/task';
import styles from './tasks-stats-snippet.module.css';

const COLORS = ['#4ade80', '#fbbf24', '#f87171'];
const iconProps = { size: 14, strokeWidth: 2 };

export function TasksStatsSnippet() {
  const navigate = useNavigate();
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const { stats, loading } = useMyStats();
  const apiOn = isApiConfigured();

  if (!apiOn) {
    return (
      <section className={styles.card}>
        <h3 className={styles.title}><BarChart3 {...iconProps} /> Прогресс</h3>
        <p className={styles.muted}>
          Укажите <code className={styles.code}>VITE_API_URL</code> и запустите сервер — здесь появится статистика решённых задач.
        </p>
      </section>
    );
  }

  if (!accessToken) {
    return (
      <section className={styles.card}>
        <h3 className={styles.title}><BarChart3 {...iconProps} /> Прогресс</h3>
        <p className={styles.muted}>Войдите в личный кабинет, чтобы сохранять и видеть статистику решённых задач.</p>
        <GlassButton type="button" className={styles.btn} onClick={() => navigate('/account')}>
          <LogIn {...iconProps} /> Войти
        </GlassButton>
      </section>
    );
  }

  const totalCatalog = TASKS.length;
  const solved = stats?.solvedTotal ?? 0;
  const easy = stats?.byDifficulty.easy ?? 0;
  const medium = stats?.byDifficulty.medium ?? 0;
  const hard = stats?.byDifficulty.hard ?? 0;
  const pieData = [
    { name: 'Easy', value: easy },
    { name: 'Medium', value: medium },
    { name: 'Hard', value: hard },
  ];
  const totalPieDiff = easy + medium + hard;

  const pctStr = (val: number) => {
    if (totalPieDiff === 0) return '0%';
    return `${Math.round((val / totalPieDiff) * 100)}%`;
  };

  return (
    <section className={styles.card}>
      <h3 className={styles.title}><BarChart3 {...iconProps} /> Ваш прогресс</h3>

      {loading && !stats ? (
        <p className={styles.muted}>Загрузка…</p>
      ) : !stats ? (
        <p className={styles.muted}>Нет данных статистики.</p>
      ) : (
        <>
          {/* Summary row */}
          <div className={styles.summaryRow}>
            <span className={styles.summaryBig}>
              <CheckCircle {...iconProps} className={styles.checkIcon} />
              Решено: <strong>{solved}</strong> / {totalCatalog}
            </span>
            {stats && stats.solvedTotal > 0 && (
              <span className={styles.summaryPct}>
                {Math.round((solved / totalCatalog) * 100)}% каталога
              </span>
            )}
          </div>

          {solved > 0 ? (
            <>
              {/* Donut chart */}
              <div className={styles.chartWrap}>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={66}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [String(value ?? 0), '']} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend under chart */}
                <div className={styles.pieLegend}>
                  {pieData.map((d, i) => d.value > 0 && (
                    <div key={d.name} className={styles.pieLegendItem}>
                      <span className={styles.pieDot} style={{ backgroundColor: COLORS[i] }} />
                      <span className={styles.pieName}>{d.name}</span>
                      <span className={styles.pieVal}>{d.value} ({pctStr(d.value)})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* KPI badges */}
              <div className={styles.kpiGrid}>
                <div className={styles.kpiItem}>
                  <Flame size={14} strokeWidth={2} style={{ color: '#f97316' }} />
                  <span>{stats.streakDays} {stats.streakDays === 1 ? 'день' : stats.streakDays < 5 ? 'дня' : 'дней'}</span>
                </div>
                <div className={styles.kpiItem}>
                  <Clock size={14} strokeWidth={2} style={{ color: '#60a5fa' }} />
                  <span>{stats.firstAttemptRate > 0 ? `${Math.round(stats.firstAttemptRate)}%` : '0%'} с 1-й попытки</span>
                </div>
                <div className={styles.kpiItem}>
                  <Trophy size={14} strokeWidth={2} style={{ color: '#f59e0b' }} />
                  <span>Рекорд серии: {stats.longestStreak || '—'}</span>
                </div>
                <div className={styles.kpiItem}>
                  <TrendingUp size={14} strokeWidth={2} style={{ color: '#a78bfa' }} />
                  <span>7 дней: {stats.solvedLast7 ?? 0}</span>
                </div>
              </div>
            </>
          ) : (
            <p className={styles.hint}>Решите хотя бы одну задачу — здесь появится диаграмма</p>
          )}
        </>
      )}
      <GlassButton type="button" className={styles.btn} onClick={() => navigate('/account')}>
        Подробная статистика
      </GlassButton>
    </section>
  );
}
