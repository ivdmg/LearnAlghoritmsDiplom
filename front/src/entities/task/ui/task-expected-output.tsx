import React from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import codeStyles from '@/shared/ui/content/content-renderer.module.css';
import styles from './task-expected-output.module.css';

interface TaskExpectedOutputProps {
  description?: string;
  code?: string;
  language?: string;
}

export const TaskExpectedOutput: React.FC<TaskExpectedOutputProps> = ({
  description,
  code,
  language = 'text',
}) => {
  if (!description && !code) {
    return null;
  }

  return (
    <div className={styles.root}>
      {description && <p className={styles.text}>{description}</p>}

      {code && (
        <div className={codeStyles.codeWrapper}>
          <Highlight theme={themes.nightOwl} code={code.trimEnd()} language={language as any}>
            {({ className, style, tokens, getLineProps, getTokenProps }) => (
              <pre
                className={`${codeStyles.codeBlock} ${className} ${styles.codeBlock}`}
                style={style}
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
      )}
    </div>
  );
};

