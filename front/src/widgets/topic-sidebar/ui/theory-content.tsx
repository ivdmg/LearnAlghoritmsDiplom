import styles from './theory-content.module.css';

interface TheoryContentProps {
  content: string;
}

export function TheoryContent({ content }: TheoryContentProps) {
  const lines = content.trim().split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  const flushCodeBlock = () => {
    if (codeBuffer.length > 0) {
      elements.push(
        <pre key={elements.length} className={styles.codeBlock}>
          <code>{codeBuffer.join('\n')}</code>
        </pre>
      );
      codeBuffer = [];
    }
  };

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock();
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }
    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }
    if (line.startsWith('# ')) {
      flushCodeBlock();
      elements.push(
        <h1 key={elements.length} className={styles.h1}>
          {line.slice(2)}
        </h1>
      );
    } else if (line.startsWith('## ')) {
      flushCodeBlock();
      elements.push(
        <h2 key={elements.length} className={styles.h2}>
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith('- ')) {
      flushCodeBlock();
      elements.push(
        <li key={elements.length} className={styles.li}>
          {line.slice(2)}
        </li>
      );
    } else if (line.trim()) {
      flushCodeBlock();
      elements.push(
        <p key={elements.length} className={styles.p}>
          {line}
        </p>
      );
    }
  }
  flushCodeBlock();

  return <div className={styles.container}>{elements}</div>;
}
