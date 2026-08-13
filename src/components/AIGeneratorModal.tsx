import React, { useState } from 'react';
import { Sparkles, X, Loader2, Wand2, Lightbulb } from 'lucide-react';

interface AIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated: (markdown: string) => void;
}

export const AIGeneratorModal: React.FC<AIGeneratorModalProps> = ({
  isOpen,
  onClose,
  onGenerated,
}) => {
  const [prompt, setPrompt] = useState('');
  const [slideCount, setSlideCount] = useState(6);
  const [themeStyle, setThemeStyle] = useState('Executive & Modern');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const samplePrompts = [
    'Pitch deck for an AI healthcare startup raising Seed funding',
    'Quarterly Business Review summary for sales and product growth',
    'Introduction to Quantum Computing and Quantum Algorithms',
    'Product Launch Strategy for an eco-friendly smart water bottle',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/gemini/generate-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          slideCount,
          themeStyle,
        }),
      });

      const data = await res.json();
      if (data.markdown) {
        onGenerated(data.markdown);
        onClose();
      } else {
        throw new Error(data.error || 'Failed to generate slides');
      }
    } catch (err: any) {
      setError(err.message || 'Error generating presentation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl p-6 text-slate-100 relative overflow-hidden select-none">
        {/* Top Glow */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Generate Presentation with AI</h2>
              <p className="text-xs text-slate-400">Powered by Gemini 3.7 Flash</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Presentation Topic or Draft Content
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Create an 8-slide presentation explaining our new cloud infrastructure strategy with benchmarks and timeline..."
              className="w-full h-28 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 outline-none resize-none"
              required
            />
          </div>

          {/* Quick Prompts */}
          <div>
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mb-1.5">
              <Lightbulb className="w-3 h-3 text-amber-400" />
              Try a sample prompt:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {samplePrompts.map((sp, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPrompt(sp)}
                  className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-lg border border-slate-700/60 transition-colors text-left"
                >
                  {sp}
                </button>
              ))}
            </div>
          </div>

          {/* Controls: Slide Count & Tone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Number of Slides: <span className="text-indigo-400 font-bold">{slideCount}</span>
              </label>
              <input
                type="range"
                min={3}
                max={12}
                value={slideCount}
                onChange={(e) => setSlideCount(parseInt(e.target.value))}
                className="w-full accent-indigo-500 bg-slate-950 rounded-lg h-2"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tone & Style
              </label>
              <select
                value={themeStyle}
                onChange={(e) => setThemeStyle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-100 focus:border-indigo-500 outline-none"
              >
                <option value="Executive & Modern">Executive & Modern</option>
                <option value="Investor Pitch">Investor Pitch</option>
                <option value="Technical & Code">Technical & Code</option>
                <option value="Creative & Bold">Creative & Bold</option>
                <option value="Minimalist Editorial">Minimalist Editorial</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/80 border border-rose-800/80 rounded-xl text-xs text-rose-300">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Deck...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Slides</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
