import { useState, useRef, useLayoutEffect } from 'react';
import { getBezierPath, type EdgeProps } from '@xyflow/react';
import { useSmoothProgress } from '../model/smooth-progress';
import { clamp } from '../model/constants';

const T = '0.18s ease-out';

/** Рёбро основного фитиля: прогресс от скролла, сглаженный RAF */
export function FuseEdge({
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

  const pStart = (data?.progressStart as number) ?? 0;
  const pEnd = (data?.progressEnd as number) ?? 1;
  const gp = useSmoothProgress();
  const edgeProgress = clamp((gp - pStart) / (pEnd - pStart), 0, 1);

  const bgRef = useRef<SVGPathElement>(null);
  const [len, setLen] = useState(0);
  useLayoutEffect(() => {
    if (bgRef.current) setLen(bgRef.current.getTotalLength());
  }, [edgePath]);

  const offset = len > 0 ? len * (1 - edgeProgress) : 0;

  let tipX = sourceX;
  let tipY = sourceY;
  if (len > 0 && edgeProgress > 0 && bgRef.current) {
    const pt = bgRef.current.getPointAtLength(len * Math.min(edgeProgress, 0.999));
    tipX = pt.x;
    tipY = pt.y;
  }
  const showTip = len > 0 && edgeProgress > 0 && edgeProgress < 1;

  return (
    <g>
      <path
        ref={bgRef}
        d={edgePath}
        stroke="#475569"
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
      />
      {len > 0 && edgeProgress > 0 && (
        <>
          <path
            d={edgePath}
            fill="none"
            style={{
              stroke: 'rgba(249,115,22,0.25)',
              strokeWidth: 14,
              strokeLinecap: 'round',
              strokeDasharray: len,
              strokeDashoffset: offset,
              transition: `stroke-dashoffset ${T}`,
            }}
          />
          <path
            d={edgePath}
            fill="none"
            style={{
              stroke: '#f97316',
              strokeWidth: 3.5,
              strokeLinecap: 'round',
              strokeDasharray: len,
              strokeDashoffset: offset,
              transition: `stroke-dashoffset ${T}`,
            }}
          />
        </>
      )}
      <g
        style={{
          transform: `translate(${tipX}px, ${tipY}px)`,
          opacity: showTip ? 1 : 0,
          transition: `transform ${T}, opacity 0.1s ease-out`,
        }}
      >
        <circle r={8} fill="rgba(249,115,22,0.25)" />
        <circle r={4} fill="#fff" />
      </g>
    </g>
  );
}
