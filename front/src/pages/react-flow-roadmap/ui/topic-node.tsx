import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { TOPIC_REACHED_AT } from '../model/constants';
import { useSmoothProgress } from '../model/smooth-progress';
import styles from '../react-flow-roadmap.module.css';

interface TopicNodeProps {
  id: string;
  data: Record<string, unknown>;
}

/** Плашка темы: «Основы» всегда активна, остальные — после достижения фитилём */
function TopicNodeComponent({ id, data }: TopicNodeProps) {
  const color = data.color as string;
  const gp = useSmoothProgress();
  const reachedAt = TOPIC_REACHED_AT[id] ?? 0;
  const reached = id === 'osnovy' || gp >= reachedAt - 0.002;

  return (
    <div
      className={styles.topicNode}
      data-reached={reached}
      style={{
        ...(reached
          ? { backgroundColor: color, color: '#fff' }
          : { backgroundColor: 'transparent', color: 'var(--page-text)' }),
        pointerEvents: reached ? 'auto' : 'none',
        cursor: reached ? 'pointer' : 'default',
      }}
    >
      <div
        className={styles.topicNodeBlur}
        style={{ opacity: reached ? 0 : 1 }}
        aria-hidden
      />
      <div
        className={styles.topicNodeContent}
        style={{ filter: reached ? 'none' : 'blur(1.5px)' }}
      >
        <Handle type="target" position={Position.Top} id="top" className={styles.handle} />
        <span>{data.label as string}</span>
        <Handle type="source" position={Position.Bottom} id="bottom" className={styles.handle} />
        <Handle type="source" position={Position.Right} id="right" className={styles.handle} />
        <Handle type="source" position={Position.Left} id="left" className={styles.handle} />
      </div>
    </div>
  );
}

export const TopicNode = memo(TopicNodeComponent);
