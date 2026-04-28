import { useCallback, useEffect, useRef, useState } from 'react';
import type { RoadmapTopic } from '@/entities/roadmap';
import styles from './subtopic-list.module.css';

interface SubtopicListProps {
  topic: RoadmapTopic;
  activeSubtopicId?: string;
  onSelectSubtopic: (subtopicId: string) => void;
  onClose: () => void;
}

export function SubtopicList({
  topic,
  activeSubtopicId,
  onSelectSubtopic,
}: SubtopicListProps) {
  const [hoveredSubtopicId, setHoveredSubtopicId] = useState<string | null>(null);
  const targetSubtopicId = hoveredSubtopicId ?? activeSubtopicId;

  const cardRef = useRef<HTMLDivElement | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties | null>(null);
  const [mounted, setMounted] = useState(false);

  const updateIndicator = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;

    const targetId = targetSubtopicId;
    if (!targetId) {
      setIndicatorStyle(null);
      return;
    }

    const itemEl = card.querySelector(`[data-subtopic-id="${targetId}"]`) as HTMLElement | null;
    if (!itemEl) {
      setIndicatorStyle(null);
      return;
    }

    const cardRect = card.getBoundingClientRect();
    const itemRect = itemEl.getBoundingClientRect();

    setIndicatorStyle({
      left: itemRect.left - cardRect.left,
      top: itemRect.top - cardRect.top,
      width: itemRect.width,
      height: itemRect.height,
    });
  }, [targetSubtopicId]);

  // Первый рендер — без transition
  useEffect(() => {
    updateIndicator();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setMounted(true);
      });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // При смене активного сабтопика — обновляем позицию
  useEffect(() => {
    if (mounted) {
      updateIndicator();
    }
  }, [activeSubtopicId, mounted, updateIndicator]);

  useEffect(() => {
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

  return (
    <div
      ref={cardRef}
      className={styles.card}
      onMouseLeave={() => setHoveredSubtopicId(null)}
    >
      {/* Скользящий индикатор — CSS transition вместо framer-motion spring */}
      {indicatorStyle && (
        <div
          className={styles.indicatorOverlay}
          style={{
            ...indicatorStyle,
            transition: mounted
              ? 'left 0.35s cubic-bezier(0.4, 0, 0.2, 1), top 0.35s cubic-bezier(0.4, 0, 0.2, 1), width 0.35s cubic-bezier(0.4, 0, 0.2, 1), height 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
              : 'none',
          }}
          aria-hidden
        />
      )}

      {topic.subtopics.map((subtopic) => {
        const isActive = subtopic.id === activeSubtopicId;

        return (
          <button
            key={subtopic.id}
            type="button"
            data-subtopic-id={subtopic.id}
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