import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { SingleChart } from '@/entities/article';
import styles from './content-renderer.module.css';

interface SingleChartViewProps {
  chart: SingleChart;
  compact?: boolean;
}

export function SingleChartView({ chart, compact }: SingleChartViewProps) {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  const gridColor = isLight ? 'rgba(15,23,42,0.08)' : 'rgba(148,163,184,0.15)';
  const axisColor = isLight ? '#64748b' : '#94a3b8';
  const tooltipBg = isLight ? 'rgba(255,255,255,0.92)' : 'rgba(15,23,42,0.92)';
  const tooltipBorder = isLight ? 'rgba(15,23,42,0.12)' : 'rgba(148,163,184,0.25)';
  const h = chart.height ?? (compact ? 180 : 300);
  const m = compact
    ? { top: 8, right: 16, left: 0, bottom: 4 }
    : { top: 20, right: 30, left: 10, bottom: 10 };

  return (
    <div className={styles.chartSingle}>
      {chart.title && <div className={styles.chartMiniTitle}>{chart.title}</div>}
      <ResponsiveContainer width="100%" height={h}>
        <LineChart data={chart.data} margin={m}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey={chart.xKey}
            tick={{ fontSize: compact ? 9 : 11, fill: axisColor }}
            label={chart.xLabel ? { value: chart.xLabel, position: 'insideBottomRight', offset: -5, fontSize: compact ? 10 : 12, fill: axisColor } : undefined}
          />
          <YAxis
            tick={{ fontSize: compact ? 9 : 11, fill: axisColor }}
            width={compact ? 32 : 60}
            label={chart.yLabel ? { value: chart.yLabel, angle: -90, position: 'insideLeft', fontSize: compact ? 10 : 12, fill: axisColor } : undefined}
          />
          <Tooltip
            contentStyle={{
              background: tooltipBg,
              border: `1px solid ${tooltipBorder}`,
              borderRadius: 8,
              fontSize: 11,
              backdropFilter: 'blur(10px)',
            }}
          />
          {!compact && <Legend wrapperStyle={{ fontSize: 12 }} />}
          {chart.lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.label}
              stroke={line.color}
              strokeWidth={compact ? 2 : 2.5}
              dot={false}
              animationDuration={1200}
              animationEasing="ease-in-out"
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
