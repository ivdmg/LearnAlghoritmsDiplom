import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { GlassButton } from '@/shared/ui/glass-button/glass-button';
import { useAppSelector } from '@/shared/lib/hooks/use-app-selector';
import { useMyStats } from '@/shared/hooks/use-my-stats';
import { isApiConfigured } from '@/shared/config/api-url';
import { TASKS } from '@/entities/task';
import styles from './tasks-stats-snippet.module.css';

const COLORS = ['#4ade80', '#fbbf24', '#f87171'];

export function TasksStatsSnippet() {
  const navigate = useNavigate();
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const { stats, loading } = useMyStats();
  const apiOn = isApiConfigured();

  if (!apiOn) {
    return (
      <section className={styles.card}>
        <h3 className={styles.title}>Прогресс</h3>
        <p className={styles.muted}>
          Укажите <code className={styles.code}>VITE_API_URL</code> и запустите сервер — здесь появится статистика
          решённых задач.
        </p>
      </section>
    );
  }

  if (!accessToken) {
    return (
      <section className={styles.card}>
        <h3 className={styles.title}>📊 Прогресс</h3>
        <p className={styles.muted}>Войдите в личный кабинет, чтобы сохранять и видеть статистику решённых задач.</p>
        <GlassButton type="button" className={styles.btn} onClick={() => navigate('/account')}>
          Войти
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

  return (
    <section className={styles.card}>
      <h3 className={styles.title}>📊 Ваш прогресс</h3>
      {loading && !stats ? (
        <p className={styles.muted}>Загрузка…</p>
      ) : (
        <>
          <p className={styles.summary}>
            Решено <strong>{solved}</strong> из <strong>{totalCatalog}</strong>
          </p>
          {solved > 0 ? (
            <>
              <div className={styles.chartWrap}>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={55}
                      paddingAngle={2}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [String(value ?? 0), '']} />
                    <Legend
                      formatter={(value: string) => (
                        <span style={{ fontSize: 11, color: 'inherit' }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className={styles.kpiRow}>
                {stats.streakDays > 0 && (
                  <span className={styles.kpiBadge}>
                    🔥 {stats.streakDays} {stats.streakDays === 1 ? 'день' : stats.streakDays < 5 ? 'дня' : 'дней'}
                  </span>
                )}
                <span className={styles.kpiBadge}>
                  ⚡ {stats.firstAttemptRate > 0 ? `${Math.round(stats.firstAttemptRate)}%` : '0%'} с 1-й попытки
                </span>
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
