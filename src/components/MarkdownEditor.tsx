import React, { useState } from 'react';
import {
  FileText,
  Plus,
  BarChart2,
  Columns,
  Quote,
  Code,
  Sparkles,
  MessageSquarePlus,
  Image as ImageIcon,
  Loader2,
  Wand2
} from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  activeSlideIndex: number;
  activeSlideMarkdown: string;
  onUpdateSlideMarkdown: (index: number, newMd: string) => void;
  onAddSlide: () => void;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  activeSlideIndex,
  activeSlideMarkdown,
  onUpdateSlideMarkdown,
  onAddSlide,
}) => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const insertSnippet = (snippet: string) => {
    onChange(value + (value.trim() ? '\n\n' : '') + snippet);
  };

  // AI Enhance active slide
  const handleAiEnhance = async (action: string) => {
    try {
      setLoadingAction(action);
      const res = await fetch('/api/gemini/enhance-slide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slideMarkdown: activeSlideMarkdown,
          action,
        }),
      });

      const data = await res.json();
      if (data.markdown) {
        onUpdateSlideMarkdown(activeSlideIndex, data.markdown);
      }
    } catch (err) {
      console.error('Failed to enhance slide:', err);
    } finally {
      setLoadingAction(null);
    }
  };

  // AI Generate Speaker Notes
  const handleAiNotes = async () => {
    try {
      setLoadingAction('notes');
      const res = await fetch('/api/gemini/generate-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slideMarkdown: activeSlideMarkdown }),
      });

      const data = await res.json();
      if (data.notes) {
        const appendedNotes = `${activeSlideMarkdown.trim()}\n\n<!-- notes: ${data.notes} -->`;
        onUpdateSlideMarkdown(activeSlideIndex, appendedNotes);
      }
    } catch (err) {
      console.error('Failed to generate notes:', err);
    } finally {
      setLoadingAction(null);
    }
  };

  // AI Generate Visual Image
  const handleAiImage = async () => {
    const prompt = window.prompt('Describe the image you want AI to generate for this slide:', '3D vector abstract data illustration');
    if (!prompt) return;

    try {
      setLoadingAction('image');
      const res = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (data.imageUrl) {
        const appendedImg = `${activeSlideMarkdown.trim()}\n\n![${prompt}](${data.imageUrl})`;
        onUpdateSlideMarkdown(activeSlideIndex, appendedImg);
      }
    } catch (err) {
      console.error('Failed to generate image:', err);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 border-r border-slate-800 text-slate-200 select-none">
      {/* Editor Toolbar */}
      <div className="p-2 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Basic Helpers */}
        <div className="flex items-center gap-1">
          <button
            onClick={onAddSlide}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
            title="Add new slide"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Slide</span>
          </button>

          <button
            onClick={() => insertSnippet('<!-- layout: stats -->\n## Key Performance\n> **98%** Customer Satisfaction Rate\n> **4.8x** Faster Speed')}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Insert Stat Callout"
          >
            <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden lg:inline">Stat</span>
          </button>

          <button
            onClick={() => insertSnippet('<!-- layout: split -->\n## Comparison\n\n::: Column 1\n- Advantage A\n- Feature B\n\n::: Column 2\n- Advantage C\n- Feature D')}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Insert 2 Columns"
          >
            <Columns className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden lg:inline">Split</span>
          </button>

          <button
            onClick={() => insertSnippet('> "Simplicity is the ultimate sophistication."\n— Leonardo da Vinci')}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Insert Quote"
          >
            <Quote className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">Quote</span>
          </button>

          <button
            onClick={() => insertSnippet('```js\n// Sample Code Snippet\nconst greeting = "Hello Markdown Slides!";\nconsole.log(greeting);\n```')}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Insert Code Block"
          >
            <Code className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden lg:inline">Code</span>
          </button>
        </div>

        {/* AI Slide Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleAiEnhance('stats')}
            disabled={!!loadingAction}
            className="flex items-center gap-1 px-2 py-1 rounded bg-purple-950/80 hover:bg-purple-900 border border-purple-700/50 text-purple-300 transition-colors disabled:opacity-50"
            title="AI Convert to Visual Stats"
          >
            {loadingAction === 'stats' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Wand2 className="w-3.5 h-3.5 text-purple-400" />
            )}
            <span className="hidden xl:inline">AI Stats</span>
          </button>

          <button
            onClick={handleAiNotes}
            disabled={!!loadingAction}
            className="flex items-center gap-1 px-2 py-1 rounded bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/50 text-indigo-300 transition-colors disabled:opacity-50"
            title="AI Speaker Notes"
          >
            {loadingAction === 'notes' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <MessageSquarePlus className="w-3.5 h-3.5 text-indigo-400" />
            )}
            <span className="hidden xl:inline">AI Notes</span>
          </button>

          <button
            onClick={handleAiImage}
            disabled={!!loadingAction}
            className="flex items-center gap-1 px-2 py-1 rounded bg-teal-950/80 hover:bg-teal-900 border border-teal-700/50 text-teal-300 transition-colors disabled:opacity-50"
            title="AI Image Illustration"
          >
            {loadingAction === 'image' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ImageIcon className="w-3.5 h-3.5 text-teal-400" />
            )}
            <span className="hidden xl:inline">AI Image</span>
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 relative font-mono text-xs leading-relaxed p-2">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`# Enter Slide Title\n\n- Write your bullet points here\n- Separate slides with ---\n\n<!-- layout: stats -->\n> **98%** Satisfaction Rate`}
          className="w-full h-full bg-transparent text-slate-100 p-3 resize-none outline-none font-mono text-xs leading-relaxed placeholder-slate-600 focus:ring-0 border-0"
          spellCheck={false}
        />
      </div>

      {/* Footer Info */}
      <div className="p-2 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Active Slide: #{activeSlideIndex + 1}</span>
        <span className="text-slate-400">Separate slides using <code className="text-indigo-400">---</code></span>
      </div>
    </div>
  );
};
