export type LayoutType = 'title' | 'split' | 'stats' | 'grid' | 'quote' | 'code' | 'standard';

export type AspectRatio = '16:9' | '4:3' | '1:1';

export type AnimationStyle = 'fade' | 'slide' | 'zoom' | 'none';

export interface StatItem {
  value: string;
  label: string;
}

export interface ColumnItem {
  title?: string;
  items: string[];
}

export interface ParsedSlide {
  id: string;
  rawMarkdown: string;
  title: string;
  subtitle?: string;
  layout: LayoutType;
  notes?: string;
  bgType?: 'default' | 'dark' | 'accent' | 'warm' | 'gradient';
  bullets: string[];
  stats: StatItem[];
  quotes: string[];
  codeBlock?: {
    language: string;
    code: string;
  };
  columns: ColumnItem[];
  imageUrl?: string;
  imageAlt?: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  bgClass: string;
  canvasBg: string;
  cardBgClass: string;
  textClass: string;
  titleClass: string;
  textMutedClass: string;
  accentClass: string;
  accentBgClass: string;
  accentGlow: string;
  borderClass: string;
  fontHeader: string;
  fontBody: string;
  dark: boolean;
  slideBgHex: string;
  textColorHex: string;
  accentHex: string;
}

export interface Presentation {
  id: string;
  title: string;
  rawMarkdown: string;
  slides: ParsedSlide[];
  themeId: string;
  aspectRatio: AspectRatio;
  animation: AnimationStyle;
  updatedAt: string;
}

export interface GoogleExportStatus {
  status: 'idle' | 'signing_in' | 'creating' | 'updating' | 'success' | 'error';
  progress: number;
  message: string;
  presentationId?: string;
  presentationUrl?: string;
  error?: string;
}
