import { ParsedSlide, LayoutType, StatItem, ColumnItem } from '../types';

export function parseMarkdownToSlides(markdown: string): ParsedSlide[] {
  if (!markdown || !markdown.trim()) {
    return [createEmptySlide('slide-1')];
  }

  // Split by line containing `---` with optional whitespace
  const rawSlideBlocks = markdown
    .split(/\n\s*---\s*\n/g)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (rawSlideBlocks.length === 0) {
    return [createEmptySlide('slide-1')];
  }

  return rawSlideBlocks.map((block, index) => parseSingleSlide(block, `slide-${index + 1}`, index));
}

function createEmptySlide(id: string): ParsedSlide {
  return {
    id,
    rawMarkdown: '# Welcome to Markdown Slides\n\n- Add your bullet points here\n- Edit markdown on the left to see live updates',
    title: 'Welcome to Markdown Slides',
    subtitle: 'Type simple markdown to build beautiful visual slides',
    layout: 'standard',
    bullets: ['Add your bullet points here', 'Edit markdown on the left to see live updates'],
    stats: [],
    quotes: [],
    columns: [],
  };
}

function parseSingleSlide(block: string, id: string, index: number): ParsedSlide {
  const lines = block.split('\n');

  let layout: LayoutType = index === 0 ? 'title' : 'standard';
  let notes = '';
  let bgType: 'default' | 'dark' | 'accent' | 'warm' | 'gradient' = 'default';
  let title = '';
  let subtitle = '';
  const bullets: string[] = [];
  const stats: StatItem[] = [];
  const quotes: string[] = [];
  const columns: ColumnItem[] = [];
  let imageUrl: string | undefined;
  let imageAlt: string | undefined;
  let codeBlock: { language: string; code: string } | undefined;

  // Extract Directives & Speaker Notes
  let cleanedLines: string[] = [];
  let inCodeBlock = false;
  let codeLang = '';
  let codeLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Directives: <!-- layout: stats -->
    const layoutMatch = trimmed.match(/<!--\s*layout:\s*([a-z]+)\s*-->/i);
    if (layoutMatch) {
      layout = layoutMatch[1].toLowerCase() as LayoutType;
      continue;
    }

    const bgMatch = trimmed.match(/<!--\s*bg:\s*([a-z]+)\s*-->/i);
    if (bgMatch) {
      bgType = bgMatch[1].toLowerCase() as any;
      continue;
    }

    const noteMatch = trimmed.match(/<!--\s*notes?:\s*(.*?)\s*-->/i);
    if (noteMatch) {
      notes += (notes ? '\n' : '') + noteMatch[1];
      continue;
    }

    if (trimmed.toLowerCase().startsWith('notes:')) {
      notes += (notes ? '\n' : '') + trimmed.substring(6).trim();
      continue;
    }

    // Code blocks
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        inCodeBlock = false;
        codeBlock = { language: codeLang || 'text', code: codeLines.join('\n') };
        if (layout === 'standard') layout = 'code';
        codeLines = [];
      } else {
        inCodeBlock = true;
        codeLang = trimmed.substring(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    cleanedLines.push(line);
  }

  // Process cleaned lines
  let currentColumn: ColumnItem | null = null;

  for (let i = 0; i < cleanedLines.length; i++) {
    const line = cleanedLines[i];
    const trimmed = line.trim();

    if (!trimmed) continue;

    // Headers
    if (trimmed.startsWith('# ')) {
      title = trimmed.substring(2).trim();
      continue;
    }
    if (trimmed.startsWith('## ')) {
      if (!title) {
        title = trimmed.substring(3).trim();
      } else if (!subtitle) {
        subtitle = trimmed.substring(3).trim();
      } else {
        // Start a new column or section
        if (currentColumn) columns.push(currentColumn);
        currentColumn = { title: trimmed.substring(3).trim(), items: [] };
      }
      continue;
    }
    if (trimmed.startsWith('### ')) {
      const h3Text = trimmed.substring(4).trim();
      // Check if it's a Stat (e.g. ### 98% or ### $5.2M)
      if (h3Text.match(/^[+$%€£₹]?\d+[\d.,]*[%xkMmbB]?$/i)) {
        const nextLine = cleanedLines[i + 1]?.trim() || '';
        stats.push({ value: h3Text, label: nextLine.startsWith('-') ? nextLine.substring(1).trim() : nextLine });
        if (nextLine && !nextLine.startsWith('-')) i++; // skip label line
        if (layout === 'standard') layout = 'stats';
      } else {
        if (!subtitle && !title) {
          title = h3Text;
        } else {
          if (currentColumn) columns.push(currentColumn);
          currentColumn = { title: h3Text, items: [] };
        }
      }
      continue;
    }

    // Images
    const imgMatch = trimmed.match(/!\[(.*?)\]\((.*?)\)/);
    if (imgMatch) {
      imageAlt = imgMatch[1];
      imageUrl = imgMatch[2];
      continue;
    }

    // Quotes or Stat block: > **98%** Customer Retention
    if (trimmed.startsWith('>')) {
      const quoteText = trimmed.substring(1).trim();
      const statMatch = quoteText.match(/\*\*([^+%$\w]*[\d.,]+[%xkMmbB]?)\*\*\s*(.*)/i);
      if (statMatch) {
        stats.push({ value: statMatch[1], label: statMatch[2] });
        if (layout === 'standard') layout = 'stats';
      } else {
        quotes.push(quoteText.replace(/^["']|["']$/g, ''));
        if (layout === 'standard') layout = 'quote';
      }
      continue;
    }

    // Bullets
    if (trimmed.match(/^[-*+]\s+/) || trimmed.match(/^\d+\.\s+/)) {
      const bulletText = trimmed.replace(/^[-*+]\s+/, '').replace(/^\d+\.\s+/, '');
      if (currentColumn) {
        currentColumn.items.push(bulletText);
      } else {
        bullets.push(bulletText);
      }
      continue;
    }

    // Paragraph fallback
    if (!title) {
      title = trimmed;
    } else if (!subtitle && bullets.length === 0) {
      subtitle = trimmed;
    } else {
      if (currentColumn) {
        currentColumn.items.push(trimmed);
      } else {
        bullets.push(trimmed);
      }
    }
  }

  if (currentColumn && currentColumn.items.length > 0) {
    columns.push(currentColumn);
  }

  // Infer layout if still standard
  if (layout === 'standard') {
    if (stats.length > 0) {
      layout = 'stats';
    } else if (quotes.length > 0) {
      layout = 'quote';
    } else if (columns.length >= 2) {
      layout = 'split';
    } else if (columns.length >= 3 || bullets.length >= 6) {
      layout = 'grid';
    } else if (index === 0 && bullets.length <= 2) {
      layout = 'title';
    }
  }

  return {
    id,
    rawMarkdown: block,
    title: title || `Slide ${index + 1}`,
    subtitle,
    layout,
    notes: notes.trim() || undefined,
    bgType,
    bullets,
    stats,
    quotes,
    codeBlock,
    columns,
    imageUrl,
    imageAlt,
  };
}

export function generateMarkdownFromSlides(slides: ParsedSlide[]): string {
  return slides.map((s) => s.rawMarkdown.trim()).join('\n\n---\n\n');
}
