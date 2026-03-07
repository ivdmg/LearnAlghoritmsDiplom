import { useState, useRef, useLayoutEffect } from 'react';
import { getBezierPath, type EdgeProps } from '@xyflow/react';
import { useSmoothProgress } from '../model/smooth-progress';

/** Рёбро фитиля тема→подтема: анимация при достижении темы */
export function SubtopicFuseEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const reachedAt = (data?.reachedAt as number) ?? 0;
  const stagger = (data?.stagger as number) ?? 0;
  const color = (data?.color as string) ?? '#94a3b8';

  const gp = useSmoothProgress();
  const reached = gp >= reachedAt - 0.002;

  const bgRef = useRef<SVGPathElement>(null);
  const [len, setLen] = useState(0);
  useLayoutEffect(() => {
    if (bgRef.current) setLen(bgRef.current.getTotalLength());
  }, [edgePath]);

  const offset = reached ? 0 : len;
  const dur = reached ? 0.55 : 0.3;
  const delay = reached ? stagger : 0;

  return (
    <g>
      <path
        ref={bgRef}
        d={edgePath}
        fill="none"
        style={{ stroke: color, strokeWidth: 1.5, opacity: 0.18, strokeLinecap: 'round' }}
      />
      {len > 0 && (
        <>
          <path
            d={edgePath}
            fill="none"
            style={{
              stroke: color,
              strokeWidth: 6,
              opacity: reached ? 0.12 : 0,
              strokeLinecap: 'round',
              transition: `opacity ${dur}s ease-in-out ${delay}s`,
            }}
          />
          <path
            d={edgePath}
            fill="none"
            style={{
              stroke: color,
              strokeWidth: 2,
              strokeLinecap: 'round',
              strokeDasharray: len,
              strokeDashoffset: offset,
              transition: `stroke-dashoffset ${dur}s ease-in-out ${delay}s`,
            }}
          />
        </>
      )}
    </g>
  );
}
