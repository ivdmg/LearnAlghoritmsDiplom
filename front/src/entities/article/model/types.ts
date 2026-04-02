export type ContentBlockType =
  | 'heading'
  | 'paragraph'
  | 'subheading'
  | 'link'
  | 'code'
  | 'animation'
  | 'chart';

export interface BaseContentBlock {
  id: string;
  type: ContentBlockType;
  /** Локальные override-стили для блока */
  style?: React.CSSProperties;
  /** Дополнительный класс для тонкой настройки */
  className?: string;
}

export interface HeadingBlock extends BaseContentBlock {
  type: 'heading';
  level: 1 | 2 | 3 | 4;
  text: string;
}

export interface ParagraphBlock extends BaseContentBlock {
  type: 'paragraph';
  text: string;
}

export interface LinkBlock extends BaseContentBlock {
  type: 'link';
  text: string;
  href: string;
  target?: '_self' | '_blank';
}

export interface CodeBlock extends BaseContentBlock {
  type: 'code';
  language: string;
  code: string;
  editable?: boolean;
}

export interface AnimationBlock extends BaseContentBlock {
  type: 'animation';
  html: string;
  css?: string;
  js?: string;
  width?: string | number;
  height?: string | number;
  /** Нужна ли кнопка запуска/перезапуска анимации */
  showPlayButton?: boolean;
  /**
   * Раскладка внутри iframe: `default` — центр, `tall` — колонка для «высоких» схем (стек, дерево)
   * без скролла (контент должен умещаться за счёт flex/clamp).
   */
  vizLayout?: 'default' | 'tall';
}

export interface ChartLine {
  dataKey: string;
  label: string;
  color: string;
}

export interface SingleChart {
  title?: string;
  data: Record<string, number | string>[];
  xKey: string;
  xLabel?: string;
  yLabel?: string;
  lines: ChartLine[];
  height?: number;
}

export interface ChartBlock extends BaseContentBlock {
  type: 'chart';
  /** Chart title shown above the grid (when using `charts`) or above a single chart */
  title?: string;
  /** Single chart data — used when `charts` is not provided */
  data?: Record<string, number | string>[];
  xKey?: string;
  xLabel?: string;
  yLabel?: string;
  lines?: ChartLine[];
  /** Chart height in px (single chart mode) */
  height?: number;
  /**
   * Grid of multiple charts (e.g. complexity comparison).
   * When provided, `data`/`xKey`/`lines` on the root are ignored.
   */
  charts?: SingleChart[];
  /** Grid columns (default: auto-fit) */
  columns?: number;
}

export type ContentBlock =
  | HeadingBlock
  | ParagraphBlock
  | LinkBlock
  | CodeBlock
  | AnimationBlock
  | ChartBlock;

export interface Article {
  id: string;
  topicId?: string;
  subtopicId?: string;
  title: string;
  blocks: ContentBlock[];
}

