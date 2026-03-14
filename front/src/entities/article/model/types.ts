export type ContentBlockType =
  | 'heading'
  | 'paragraph'
  | 'subheading'
  | 'link'
  | 'code'
  | 'animation';

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
}

export type ContentBlock =
  | HeadingBlock
  | ParagraphBlock
  | LinkBlock
  | CodeBlock
  | AnimationBlock;

export interface Article {
  id: string;
  topicId?: string;
  subtopicId?: string;
  title: string;
  blocks: ContentBlock[];
}

