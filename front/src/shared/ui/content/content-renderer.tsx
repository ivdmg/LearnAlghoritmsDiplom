import { useCallback, useRef, useState } from 'react';
import type {
  ContentBlock,
  HeadingBlock,
  ParagraphBlock,
  LinkBlock,
  CodeBlock,
  AnimationBlock,
} from '@/entities/article';
import { LayoutGroup, motion } from 'framer-motion';
import { Highlight, themes } from 'prism-react-renderer';
import glassTabStyles from '@/shared/ui/glass-tabs/glass-tabs.module.css';
import { GlassButton } from '../glass-button/glass-button';
import { VIZ_ANIMATION_BASE_CSS } from './viz-animation-base';
import { VIZ_IFRAME_RUNTIME_JS } from './viz-iframe-runtime';
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
        theme={themes.nightOwl}
        code={block.code.trimEnd()}
        language={block.language as any}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={`${styles.codeBlock} ${className} ${block.className ?? ""}`}
            style={{
              ...style,
              ...block.style,
              //цвет фона блока менять тут
              background: "rgba(255, 255, 255, 0.05)"
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
          default:
            return null;
        }
      })}
    </div>
  );
}

