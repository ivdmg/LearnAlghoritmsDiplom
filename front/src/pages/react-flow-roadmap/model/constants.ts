import { ROADMAP } from '@/entities/roadmap';

/** Цвета плашек по id темы */
export const TOPIC_COLORS: Record<string, string> = {
  osnovy: '#10b981',
  rekursiya: '#3b82f6',
  sortirovki: '#6366f1',
  poisk: '#8b5cf6',
  derevya: '#a855f7',
  grafy: '#ec4899',
  dp: '#f43f5e',
  struktury: '#f97316',
  prodvinutye: '#ef4444',
};

export interface TopicLayout {
  id: string;
  x: number;
  y: number;
  subtopicSide: 'left' | 'right';
}

export const ROW_GAP = 500;
export const SUBTOPIC_OFFSET_RIGHT = 400;
export const SUBTOPIC_OFFSET_LEFT = -420;
export const SUBTOPIC_SPACING_Y = 58;
export const VIEWPORT_PAD_TOP = 60;

export const LAYOUT: TopicLayout[] = [
  { id: 'osnovy',      x: 0,    y: ROW_GAP * 0, subtopicSide: 'right' },
  { id: 'rekursiya',   x: 0,    y: ROW_GAP * 1, subtopicSide: 'left'  },
  { id: 'sortirovki',  x: -300, y: ROW_GAP * 2, subtopicSide: 'left'  },
  { id: 'poisk',       x: 300,  y: ROW_GAP * 2, subtopicSide: 'right' },
  { id: 'derevya',     x: 0,    y: ROW_GAP * 3, subtopicSide: 'right' },
  { id: 'grafy',       x: -300, y: ROW_GAP * 4, subtopicSide: 'left'  },
  { id: 'struktury',   x: 300,  y: ROW_GAP * 4, subtopicSide: 'right' },
  { id: 'dp',          x: 0,    y: ROW_GAP * 5, subtopicSide: 'left'  },
  { id: 'prodvinutye', x: 0,    y: ROW_GAP * 6, subtopicSide: 'right' },
];

export const MAIN_CONNECTIONS: [string, string][] = [
  ['osnovy', 'rekursiya'],
  ['rekursiya', 'sortirovki'],
  ['rekursiya', 'poisk'],
  ['sortirovki', 'derevya'],
  ['poisk', 'derevya'],
  ['derevya', 'grafy'],
  ['derevya', 'struktury'],
  ['grafy', 'dp'],
  ['struktury', 'dp'],
  ['dp', 'prodvinutye'],
];

const FUSE_LEVELS: string[][] = [
  ['osnovy-rekursiya'],
  ['rekursiya-sortirovki', 'rekursiya-poisk'],
  ['sortirovki-derevya', 'poisk-derevya'],
  ['derevya-grafy', 'derevya-struktury'],
  ['grafy-dp', 'struktury-dp'],
  ['dp-prodvinutye'],
];

export function fuseRange(edgeKey: string): [number, number] {
  const total = FUSE_LEVELS.length;
  const idx = FUSE_LEVELS.findIndex((lvl) => lvl.includes(edgeKey));
  if (idx === -1) return [0, 1];
  return [idx / total, (idx + 1) / total];
}

/** Прогресс (0..1), при котором тема считается «достигнутой» фитилём */
export const TOPIC_REACHED_AT: Record<string, number> = { osnovy: 0 };
for (const [src, tgt] of MAIN_CONNECTIONS) {
  const [, pEnd] = fuseRange(`${src}-${tgt}`);
  if (!(tgt in TOPIC_REACHED_AT) || pEnd > TOPIC_REACHED_AT[tgt]) {
    TOPIC_REACHED_AT[tgt] = pEnd;
  }
}

let _gMinY = Infinity;
let _gMaxY = -Infinity;
for (const layout of LAYOUT) {
  const topic = ROADMAP.find((t) => t.id === layout.id);
  if (!topic) continue;
  _gMinY = Math.min(_gMinY, layout.y);
  _gMaxY = Math.max(_gMaxY, layout.y + 50);
  const count = topic.subtopics.length;
  if (count > 0) {
    const totalH = (count - 1) * SUBTOPIC_SPACING_Y;
    const startY = layout.y - totalH / 2;
    _gMinY = Math.min(_gMinY, startY);
    _gMaxY = Math.max(_gMaxY, startY + totalH + 40);
  }
}
export const GRAPH_MIN_Y = _gMinY;
export const GRAPH_MAX_Y = _gMaxY;

export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/** Скорость скролла: множитель для deltaY */
export const SCROLL_SPEED = 0.4;
/** Плавность анимации viewport: коэффициент интерполяции currentY → targetY */
export const SMOOTH_FACTOR = 0.12;

export const SUBTOPIC_FUSE_DUR = 0.55;
export const SUBTOPIC_STAGGER = 0.08;

/** Скорость приближения сглаженного прогресса к цели за кадр */
export const SMOOTH_LERP = 0.12;
