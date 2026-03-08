import type {
  ContentBlock,
  HeadingBlock,
  ParagraphBlock,
  LinkBlock,
  CodeBlock,
  AnimationBlock,
} from '@/entities/article';
import { Highlight, themes } from 'prism-react-renderer';
import styles from "./content-renderer.module.css";

interface ContentRendererProps {
  blocks: ContentBlock[];
  className?: string;
  style?: React.CSSProperties;
}

function Heading({ block }: { block: HeadingBlock }) {
  const commonProps = {
    id: block.id,
    className: `${styles.heading} ${
      block.level === 1
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
            className={`${styles.codeBlock} ${className} ${
              block.className ?? ""
            }`}
            style={{ ...style, ...block.style }}
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

function AnimationBlockView({ block }: { block: AnimationBlock }) {
  const srcDoc = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>
      body { margin: 0; background: transparent; }
      ${block.css ?? ""}
    </style>
  </head>
  <body>
    ${block.html}
    <script>
      ${block.js ?? ""}
    </script>
  </body>
</html>`;

  return (
    <iframe
      className={`${styles.animationFrame} ${block.className ?? ""}`}
      style={block.style}
      srcDoc={srcDoc}
      width={block.width ?? "100%"}
      height={block.height ?? 220}
      sandbox="allow-scripts"
      loading="lazy"
      title={block.id}
    />
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

