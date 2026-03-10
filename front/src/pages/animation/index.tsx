import { useRef, useEffect, useState } from 'react';
import { ROADMAP_TOPICS } from '@/entities/task';
import { AppHeader } from '@/widgets/app-header';
import styles from './animation-page.module.css';

const PATH_D =
  'M501.5 1.36635C501.5 1.36635 1001.5 225.224 1001.5 501.366C1001.5 777.509 501.5 1001.37 501.5 1001.37C501.5 1001.37 1.5 1225.22 1.5 1501.37C1.5 1777.51 501.5 2001.37 501.5 2001.37C501.5 2001.37 1001.5 2225.22 1001.5 2501.37C1001.5 2777.51 501.5 3001.37 501.5 3001.37C501.5 3001.37 1.5 3225.22 1.5 3501.37C1.5 3777.51 501.5 4001.37 501.5 4001.37';

const STEPS = 10000;
const SCREEN_OFFSET = 200;
const LERP_FACTOR = 0.12;
const PAGE_HEIGHT = 6000;

export interface MarkerPosition {
  length: number;
  x: number;
  y: number;
  title: string;
}

export function AnimationPage() {
  const pathRef = useRef<SVGPathElement>(null);
  const burnRef = useRef<SVGPathElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const currentScrollRef = useRef(0);
  const [burnLength, setBurnLength] = useState(0);
  const [markerPositions, setMarkerPositions] = useState<MarkerPosition[]>([]);

  useEffect(() => {
    const path = pathRef.current;
    const burn = burnRef.current;
    const svg = svgRef.current;
    if (!path || !burn || !svg) return;

    const pathLength = path.getTotalLength();
    burn.style.strokeDasharray = String(pathLength);

    const lookup: { y: number; length: number }[] = [];
    for (let i = 0; i <= STEPS; i++) {
      const len = pathLength * (i / STEPS);
      const p = path.getPointAtLength(len);
      lookup.push({ y: p.y, length: len });
    }

    const markers: MarkerPosition[] = ROADMAP_TOPICS.map((topic, i) => {
      const t = (i + 1) / (ROADMAP_TOPICS.length + 1);
      const len = pathLength * t;
      const p = path.getPointAtLength(len);
      return { length: len, x: p.x, y: p.y, title: topic.title };
    });
    setMarkerPositions(markers);

    function findLengthAtY(targetY: number): number {
      if (targetY <= lookup[0].y) return 0;
      if (targetY >= lookup[lookup.length - 1].y) return pathLength;

      let start = 0;
      let end = lookup.length - 1;
      while (start < end) {
        const mid = Math.floor((start + end) / 2);
        if (lookup[mid].y < targetY) start = mid + 1;
        else end = mid;
      }
      return lookup[start].length;
    }

    currentScrollRef.current = window.scrollY;
    const initialTargetY = currentScrollRef.current + SCREEN_OFFSET;
    const initialLengthAtY = findLengthAtY(initialTargetY);
    burn.style.strokeDashoffset = String(pathLength - initialLengthAtY);
    svg.style.transform = `translateY(${-currentScrollRef.current}px)`;
    setBurnLength(initialLengthAtY);

    let frameId: number;

    function animate() {
      if (!svg || !burn) return;
      const targetScroll = window.scrollY;
      currentScrollRef.current +=
        (targetScroll - currentScrollRef.current) * LERP_FACTOR;

      svg.style.transform = `translateY(${-currentScrollRef.current}px)`;

      const targetY = currentScrollRef.current + SCREEN_OFFSET;
      const lengthAtY = findLengthAtY(targetY);
      burn.style.strokeDashoffset = String(pathLength - lengthAtY);
      setBurnLength(lengthAtY);

      frameId = requestAnimationFrame(animate);
    }

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div className={styles.wrapper}>
      <AppHeader />
      <div className={styles.title}>Плавный скролл с фитилем</div>
      <div className={styles.scrollSpace} style={{ height: PAGE_HEIGHT }} />
      <div className={styles.wrap}>
        <div className={styles.container}>
          <svg
            ref={svgRef}
            id="serpentine"
            viewBox="0 0 1003 4003"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              ref={pathRef}
              id="path"
              className={styles.base}
              d={PATH_D}
            />
            <path
              ref={burnRef}
              id="burn"
              className={styles.burn}
              d={PATH_D}
            />
            {markerPositions.map((m) => {
              const w = Math.max(140, m.title.length * 7);
              return (
              <g
                key={m.title}
                transform={`translate(${m.x}, ${m.y})`}
                className={burnLength >= m.length ? styles.markerLit : styles.markerUnlit}
              >
                <rect
                  x={-w / 2}
                  y="-14"
                  width={w}
                  height="28"
                  rx="14"
                  ry="14"
                  className={styles.markerRect}
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={styles.markerText}
                >
                  {m.title}
                </text>
              </g>
            );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
