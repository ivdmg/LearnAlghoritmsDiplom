import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useSubtopicReached } from '../model/subtopic-reached';
import styles from '../react-flow-roadmap.module.css';

interface SubtopicNodeProps {
  id: string;
  data: Record<string, unknown>;
}

/** Плашка подтемы: «Основы» всегда активны, остальные — когда до них доходит линия */
function SubtopicNodeComponent({ id, data }: SubtopicNodeProps) {
  const color = data.color as string;
  const side = data.side as 'left' | 'right';
  const topicId = data.topicId as string | undefined;
  const reachedByFuse = useSubtopicReached(id);
  const reached = topicId === 'osnovy' || reachedByFuse;

  return (
    <div
      className={styles.subtopicNode}
      data-reached={reached}
      style={{
        ...(reached
          ? { borderColor: color, backgroundColor: color, color: '#fff' }
          : { borderColor: 'var(--page-text)', backgroundColor: 'transparent', color: 'var(--page-text)' }),
        pointerEvents: reached ? 'auto' : 'none',
        cursor: reached ? 'pointer' : 'default',
      }}
    >
      <div
        className={styles.subtopicNodeBlur}
        style={{ opacity: reached ? 0 : 1 }}
        aria-hidden
      />
      <div
        className={styles.subtopicNodeContent}
        style={{ filter: reached ? 'none' : 'blur(1.5px)' }}
      >
        <Handle
          type="target"
          position={side === 'right' ? Position.Left : Position.Right}
          className={styles.handle}
        />
        <span>{data.label as string}</span>
      </div>
    </div>
  );
}

export const SubtopicNode = memo(SubtopicNodeComponent);
