import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import styles from './difficulty-pie.module.css';

type Props = {
  easy: number;
  medium: number;
  hard: number;
};

const COLORS = ['#4ade80', '#fbbf24', '#f87171'];

function formatValue(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

export function DifficultyPie({ easy, medium, hard }: Props) {
  const total = easy + medium + hard;
  const data = [
    { name: 'Easy', value: easy },
    { name: 'Medium', value: medium },
    { name: 'Hard', value: hard },
  ].filter((d) => d.value > 0);

  if (total === 0) {
    return (
      <div className={styles.empty}>
        <p>Пока нет решённых задач</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.chartArea}>
            <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={72}
              paddingAngle={3}
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [
                `${value} (${formatValue(value, total)})`,
                '',
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className={styles.centerLabel}>
          <span className={styles.centerCount}>{total}</span>
          <span className={styles.centerSub}>всего</span>
        </div>
      </div>
      <div className={styles.legend}>
        {data.map((d, i) => (
          <div key={d.name} className={styles.legendItem}>
            <span
              className={styles.legendDot}
              style={{ backgroundColor: COLORS[i] }}
            />
            <span className={styles.legendName}>{d.name}</span>
            <span className={styles.legendValue}>
              {d.value} ({formatValue(d.value, total)})
            </span>
          </div>
        ))}
        {data.length === 0 && (
          <span className={styles.noData}>Нет данных</span>
        )}
      </div>
    </div>
  );
}
