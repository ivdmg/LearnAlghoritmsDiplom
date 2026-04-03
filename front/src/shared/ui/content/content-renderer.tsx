import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  ContentBlock,
  HeadingBlock,
  ParagraphBlock,
  LinkBlock,
  CodeBlock,
  AnimationBlock,
  ChartBlock,
  SingleChart,
} from '@/entities/article';
import { LayoutGroup, motion } from 'framer-motion';
import { Highlight, themes } from 'prism-react-renderer';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import glassTabStyles from '@/shared/ui/glass-tabs/glass-tabs.module.css';
import { GlassButton } from '../glass-button/glass-button';
import { VIZ_ANIMATION_BASE_CSS } from './viz-animation-base';
import { VIZ_IFRAME_RUNTIME_JS } from './viz-iframe-runtime';
import { VIZ_IFRAME_HELPERS_JS } from './viz-iframe-helpers';
import styles from "./content-renderer.module.css";

interface ContentRendererProps {
  blocks: ContentBlock[];
  className?: string;
  style?: React.CSSProperties;
}

function Heading({ block }: { block: HeadingBlock }) {
  const commonProps = {
    id: block.id,
    className: `${styles.heading} ${block.level === 1
        ? styles.h1
        : block.level === 2
          ? styles.h2
          : styles.h3
      } ${block.className ?? ""}`,
    style: block.style,
  };

  if (block.level === 1) return <h1 {...commonProps}>{block.text}</h1>;
  if (block.level === 2) return <h2 {...commonProps}>{block.text}</h2>;
  if (block.level === 3) return <h3 {...commonProps}>{block.text}</h3>;
  return <h4 {...commonProps}>{block.text}</h4>;
}

function Paragraph({ block }: { block: ParagraphBlock }) {
  return (
    <p
      className={`${styles.paragraph} ${block.className ?? ""}`}
      style={block.style}
    >
      {block.text}
    </p>
  );
}

function LinkBlock({ block }: { block: LinkBlock }) {
  return (
    <a
      href={block.href}
      target={block.target ?? "_self"}
      rel={block.target === "_blank" ? "noreferrer" : undefined}
      className={`${styles.link} ${block.className ?? ""}`}
      style={block.style}
    >
      {block.text}
    </a>
  );
}

function CodeBlockView({ block }: { block: CodeBlock }) {
  const isLightTheme = document.documentElement.getAttribute('data-theme') === 'light';

  if (block.editable) {
    return (
      <div className={styles.codeWrapper}>
        <textarea
          defaultValue={block.code}
          className={styles.codeEditor}
          spellCheck={false}
          style={block.style}
        />
      </div>
    );
  }

  return (
    <div className={styles.codeWrapper}>
      <Highlight
        theme={isLightTheme ? themes.vsLight : themes.nightOwl}
        code={block.code.trimEnd()}
        language={block.language as any}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={`${styles.codeBlock} ${className} ${block.className ?? ""}`}
            style={{
              ...style,
              ...block.style,
                // Keep code readable in both themes (glass, but with enough contrast)
                background:
                  isLightTheme
                    ? 'rgba(15, 23, 42, 0.06)'
                    : 'rgba(255, 255, 255, 0.05)',
                border:
                  isLightTheme
                    ? '1px solid rgba(15, 23, 42, 0.12)'
                    : '1px solid rgba(148, 163, 184, 0.18)',
            }}
          >
            {tokens.map((line, i) => {
              const lineProps = getLineProps({ line });
              return (
                <div key={i} {...lineProps}>
                  {line.map((token, j) => {
                    const tokenProps = getTokenProps({ token });
                    return <span key={j} {...tokenProps} />;
                  })}
                </div>
              );
            })}
          </pre>
        )}
      </Highlight>
    </div>
  );
}

const VIZ_SPEEDS = [0.25, 0.5, 1, 1.5, 2] as const;

function AnimationBlockView({ block }: { block: AnimationBlock }) {
  const [playId, setPlayId] = useState(0);
  const [speed, setSpeed] = useState<number>(1);
  const [paused, setPaused] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const showToolbar = block.showPlayButton ?? true;
  const vizLayout = block.vizLayout === 'tall' ? 'tall' : 'default';

  const postToIframe = useCallback((cmd: 'speed' | 'pause' | 'resume', value?: number) => {
    iframeRef.current?.contentWindow?.postMessage(
      { __learnAlgoViz: 1, cmd, value },
      '*',
    );
  }, []);

  const restart = useCallback(() => {
    setPaused(false);
    setPlayId((id) => id + 1);
  }, []);

  const setSpeedAndSync = useCallback(
    (v: number) => {
      setSpeed(v);
      postToIframe('speed', v);
    },
    [postToIframe],
  );

  const pause = useCallback(() => {
    setPaused(true);
    postToIframe('pause');
  }, [postToIframe]);

  const resume = useCallback(() => {
    setPaused(false);
    postToIframe('resume');
  }, [postToIframe]);

  const onIframeLoad = useCallback(() => {
    postToIframe('speed', speed);
    postToIframe(paused ? 'pause' : 'resume');
  }, [postToIframe, speed, paused]);

  // Всегда полный документ (HTML+CSS+JS), чтобы при открытии статьи контент
  // сразу отображался: в блоках он создаётся скриптом, без JS блок пустой.
  const fullSrcDoc = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>
      ${VIZ_ANIMATION_BASE_CSS}
      ${block.css ?? ""}
    </style>
  </head>
  <body>
    <div class="viz-viewport" data-viz-layout="${vizLayout}">
      <div class="viz-stage">
        ${block.html}
      </div>
    </div>
    <script>
      ${VIZ_IFRAME_RUNTIME_JS}
    </script>
    <script>
      ${VIZ_IFRAME_HELPERS_JS}
    </script>
    <script>
      ${block.js ?? ""}
    </script>
  </body>
</html>`;

  return (
    <div className={styles.animationWrapper}>
      {showToolbar && (
        <div className={styles.animationToolbar} role="toolbar" aria-label="Управление визуализацией">
          <LayoutGroup>
            <div
              className={`${glassTabStyles.root} ${styles.animationToolbarPill}`}
            >
              <div className={glassTabStyles.tabWrapper}>
                <GlassButton
                  type="button"
                  className={glassTabStyles.iconTabButton}
                  onClick={restart}
                  aria-label="Перезапустить с начала"
                >
                  ⟲
                </GlassButton>
              </div>
              <div className={glassTabStyles.tabWrapper}>
                <GlassButton
                  type="button"
                  className={glassTabStyles.iconTabButton}
                  onClick={pause}
                  disabled={paused}
                  aria-label="Пауза"
                >
                  ⏸
                </GlassButton>
              </div>
              <div className={glassTabStyles.tabWrapper}>
                <GlassButton
                  type="button"
                  className={glassTabStyles.iconTabButton}
                  onClick={resume}
                  disabled={!paused}
                  aria-label="Продолжить"
                >
                  ▶
                </GlassButton>
              </div>
              <div className={glassTabStyles.spacer} aria-hidden />
              {VIZ_SPEEDS.map((v) => (
                <div key={v} className={glassTabStyles.tabWrapper}>
                  {speed === v && (
                    <motion.div
                      className={glassTabStyles.indicator}
                      layoutId={`viz-anim-speed-${block.id}`}
                      transition={{
                        type: 'spring',
                        stiffness: 320,
                        damping: 32,
                      }}
                    />
                  )}
                  <GlassButton
                    type="button"
                    className={`${glassTabStyles.tabButton} ${styles.animationSpeedTab}`}
                    onClick={() => setSpeedAndSync(v)}
                    aria-label={`Скорость ${v}×`}
                  >
                    {v}×
                  </GlassButton>
                </div>
              ))}
            </div>
          </LayoutGroup>
        </div>
      )}
      <iframe
        ref={iframeRef}
        key={playId}
        className={`${styles.animationFrame} ${block.className ?? ""}`}
        style={block.style}
        srcDoc={fullSrcDoc}
        width={block.width ?? "100%"}
        height={block.height ?? 220}
        sandbox="allow-scripts"
        loading="lazy"
        title={block.id}
        onLoad={onIframeLoad}
      />
    </div>
  );
}

function SingleChartView({ chart, compact }: { chart: SingleChart; compact?: boolean }) {
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

function ChartBlockView({ block }: { block: ChartBlock }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setReady(true), 350);
    return () => clearTimeout(id);
  }, []);

  const isGrid = !!block.charts?.length;
  const singleChart: SingleChart | null = !isGrid && block.data && block.xKey && block.lines
    ? { title: undefined, data: block.data, xKey: block.xKey, xLabel: block.xLabel, yLabel: block.yLabel, lines: block.lines, height: block.height }
    : null;

  return (
    <div
      className={`${styles.animationWrapper} ${block.className ?? ''}`}
      style={block.style}
    >
      {block.title && <div className={styles.chartTitle}>{block.title}</div>}
      <div className={styles.chartContainer}>
        {!ready ? (
          <div className={styles.chartPlaceholder} style={{ height: isGrid ? 200 : (block.height ?? 300) }} />
        ) : isGrid ? (
          <div
            className={styles.chartGrid}
            style={block.columns ? { gridTemplateColumns: `repeat(${block.columns}, 1fr)` } : undefined}
          >
            {block.charts!.map((c, i) => (
              <SingleChartView key={i} chart={c} compact />
            ))}
          </div>
        ) : singleChart ? (
          <SingleChartView chart={singleChart} />
        ) : null}
      </div>
    </div>
  );
}

export function ContentRenderer({ blocks, className = "", style }: ContentRendererProps) {
  return (
    <div className={`${styles.root} ${className}`} style={style}>
      {blocks.map((block) => {
        switch (block.type) {
          case "heading":
            return <Heading key={block.id} block={block} />;
          case "paragraph":
            return <Paragraph key={block.id} block={block} />;
          case "link":
            return <LinkBlock key={block.id} block={block} />;
          case "code":
            return <CodeBlockView key={block.id} block={block} />;
          case "animation":
            return <AnimationBlockView key={block.id} block={block} />;
          case "chart":
            return <ChartBlockView key={block.id} block={block as ChartBlock} />;
          default:
            return null;
        }
      })}
    </div>
  );
}

