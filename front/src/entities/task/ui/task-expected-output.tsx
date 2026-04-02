import React from 'react';
import { Highlight, themes } from 'prism-react-renderer';
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

  const isLightTheme = document.documentElement.getAttribute('data-theme') === 'light';

  return (
    <div className={styles.root}>
      {description && <p className={styles.text}>{description}</p>}

      {code && (
        <div className={styles.codeWrapper}>
          <Highlight theme={isLightTheme ? themes.vsLight : themes.nightOwl} code={code.trimEnd()} language={language as any}>
            {({ className, style, tokens, getLineProps, getTokenProps }) => (
              <pre
                className={`${styles.codeBlock} ${className}`}
                style={{ ...style, background: 'none', backgroundColor: 'transparent', backdropFilter: 'blur(14px)' }}
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

