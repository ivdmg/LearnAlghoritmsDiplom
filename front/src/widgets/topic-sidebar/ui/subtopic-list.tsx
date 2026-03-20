import { motion } from 'framer-motion';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { RoadmapTopic } from '@/entities/roadmap';
import styles from './subtopic-list.module.css';

interface SubtopicListProps {
  topic: RoadmapTopic;
  activeSubtopicId?: string;
  onSelectSubtopic: (subtopicId: string) => void;
  onClose: () => void;
}

const INDICATOR_PADDING = 6; // <-- расстояние от краёв

export function SubtopicList({
  topic,
  activeSubtopicId,
  onSelectSubtopic,
}: SubtopicListProps) {
  const [hoveredSubtopicId, setHoveredSubtopicId] = useState<string | null>(null);
  const targetSubtopicId = hoveredSubtopicId ?? activeSubtopicId;

  const cardRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const [indicatorRect, setIndicatorRect] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  const updateIndicatorRect = () => {
    const cardEl = cardRef.current;
    if (!cardEl) return;

    if (!targetSubtopicId) {
      setIndicatorRect(null);
      return;
    }

    const itemEl = itemRefs.current[targetSubtopicId];
    if (!itemEl) return;

    const cardBox = cardEl.getBoundingClientRect();
    const itemBox = itemEl.getBoundingClientRect();

    setIndicatorRect({
      left: itemBox.left - cardBox.left + INDICATOR_PADDING,
      top: itemBox.top - cardBox.top + INDICATOR_PADDING / 2,
      width: itemBox.width - INDICATOR_PADDING * 2,
      height: itemBox.height - INDICATOR_PADDING,
    });
  };

  useLayoutEffect(() => {
    updateIndicatorRect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetSubtopicId, topic.subtopics.length]);

  useEffect(() => {
    const onResize = () => updateIndicatorRect();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetSubtopicId]);

  return (
    <div
      ref={cardRef}
      className={styles.card}
      onMouseLeave={() => setHoveredSubtopicId(null)}
    >
      <motion.div
        className={styles.indicatorOverlay}
        initial={false}
        animate={
          indicatorRect
            ? {
                opacity: 1,
                left: indicatorRect.left,
                top: indicatorRect.top,
                width: indicatorRect.width,
                height: indicatorRect.height,
              }
            : { opacity: 0 }
        }
        transition={{
          type: 'spring',
          stiffness: 420,
          damping: 40,
          mass: 0.9,
        }}
        style={{ pointerEvents: 'none' }}
      />

      {topic.subtopics.map((subtopic) => {
        const isActive = subtopic.id === activeSubtopicId;

        return (
          <button
            key={subtopic.id}
            ref={(el) => {
              itemRefs.current[subtopic.id] = el;
            }}
            type="button"
            className={`${styles.subtopicItem} ${
              isActive ? styles.subtopicItemActive : ''
            }`}
            onMouseEnter={() => setHoveredSubtopicId(subtopic.id)}
            onClick={() => onSelectSubtopic(subtopic.id)}
          >
            <span className={styles.subtopicTitle}>
              {subtopic.title}
            </span>
          </button>
        );
      })}
    </div>
  );
}