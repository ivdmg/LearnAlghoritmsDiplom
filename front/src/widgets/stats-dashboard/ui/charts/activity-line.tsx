import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useMemo } from 'react';
import styles from './activity-line.module.css';

type CalendarEntry = { date: string; count: number };

type Props = {
  calendarData: CalendarEntry[];
};

export function ActivityLineChart({ calendarData }: Props) {
  const data = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of calendarData) {
      map.set(d.date, d.count);
    }

    const today = new Date();
    const result = [];
    for (let i = Math.min(29, calendarData.length - 1); i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      result.push({
        date: dateStr,
        display: d.getDate().toString(),
        month: [
          'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
          'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек',
        ][d.getMonth()],
        count: map.get(dateStr) ?? 0,
      });
    }

    return result;
  }, [calendarData]);

  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        onMouseMove={(state) => {
          if (state?.isTooltipActive) {
            setActiveIdx(state?.activeTooltipIndex);
          } else {
            setActiveIdx(null);
          }
        }}
      >
        <defs>
          <linearGradient id="activityGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal />
        <XAxis
          dataKey="display"
          tick={{ fill: 'rgba(229,231,235,0.4)', fontSize: 11 }}
          axisLine={false}
          interval={4}
        />
        <YAxis
          tick={{ fill: 'rgba(229,231,235,0.4)', fontSize: 11 }}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          formatter={(value: number) => [`${value} задач`, '']}
          labelFormatter={(_idx, items: any[]) => {
            if (items?.[0]?.payload) {
              const p = items[0].payload;
              return `${p.display} ${p.month}`;
            }
            return '';
          }}
          cursor={{ stroke: 'rgba(139,92,246,0.3)' }}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#8b5cf6"
          strokeWidth={2}
          fill="url(#activityGrad)"
          dot={activeIdx !== null ? { r: 4, stroke: '#8b5cf6', strokeWidth: 2, fill: '#050607' } : false}
          activeDot={{ r: 5, stroke: '#a78bfa', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
