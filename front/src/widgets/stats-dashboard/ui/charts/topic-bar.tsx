import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ROADMAP } from '@/entities/roadmap/model/data';
import { TASKS } from '@/entities/task/model/data';
import styles from './topic-bar.module.css';

type Props = {
  byTopic: Record<string, number>;
};

function getBarColor(solved: number, total: number): string {
  if (total === 0) return '#6b7280';
  const pct = solved / total;
  if (pct < 0.25) return '#f87171';
  if (pct < 0.75) return '#fbbf24';
  return '#4ade80';
}

export function TopicBarChart({ byTopic }: Props) {
  const data = ROADMAP.map((topic) => {
    const topicTasks = TASKS.filter((t) => t.topicId === topic.id);
    const total = topicTasks.length;
    const solved = byTopic[topic.id] ?? 0;
    return {
      name: topic.title.length > 20 ? topic.title.slice(0, 18) + '..' : topic.title,
      solved,
      total,
      fill: getBarColor(solved, total),
    };
  });

  // Filter out topics with no tasks
  const visible = data.filter((d) => d.total > 0);

  if (visible.every((d) => d.solved === 0)) {
    return (
      <div className={styles.empty}>
        <p>Решайте задачи, чтобы увидеть прогресс по темам</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={340}>
      <BarChart
        data={visible}
        margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
        layout="vertical"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
        <XAxis type="number" tick={{ fill: 'rgba(229,231,235,0.5)', fontSize: 12 }} axisLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: 'rgba(229,231,235,0.7)', fontSize: 12 }}
          width={110}
          axisLine={false}
        />
        <Tooltip
          formatter={(value, name) => {
            const v = Number(value ?? 0);
            if (name === 'solved') return [`${value} решено`, 'Решено'];
            if (name === 'total') return [`${value} всего`, 'Всего'];
            return [v, String(name)];
          }}
          cursor={{ fill: 'rgba(255,255,255,0.03)' }}
        />
        <Bar dataKey="solved" radius={[0, 4, 4, 0]} barSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}
