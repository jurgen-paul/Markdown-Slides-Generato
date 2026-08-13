import React from 'react';
import { Plus, MoveLeft, MoveRight, Copy, Trash2, Layout } from 'lucide-react';
import { ParsedSlide, Theme } from '../types';

interface SlideThumbnailsProps {
  slides: ParsedSlide[];
  activeSlideIndex: number;
  onSelectSlide: (idx: number) => void;
  onAddSlide: () => void;
  onDuplicateSlide: (idx: number) => void;
  onDeleteSlide: (idx: number) => void;
  onMoveSlide: (idx: number, direction: 'left' | 'right') => void;
  theme: Theme;
}

export const SlideThumbnails: React.FC<SlideThumbnailsProps> = ({
  slides,
  activeSlideIndex,
  onSelectSlide,
  onAddSlide,
  onDuplicateSlide,
  onDeleteSlide,
  onMoveSlide,
  theme,
}) => {
  return (
    <div className="h-28 bg-slate-900 border-t border-slate-800 px-4 flex items-center gap-3 overflow-x-auto select-none z-20">
      <div className="flex items-center gap-3 py-2">
        {slides.map((slide, idx) => {
          const isActive = idx === activeSlideIndex;
          return (
            <div
              key={slide.id + idx}
              onClick={() => onSelectSlide(idx)}
              className={`group relative flex-shrink-0 w-36 h-20 rounded-xl cursor-pointer border-2 transition-all p-2 flex flex-col justify-between overflow-hidden ${
                isActive
                  ? 'border-indigo-500 shadow-lg shadow-indigo-500/20 bg-slate-800 ring-2 ring-indigo-500/30'
                  : 'border-slate-700/80 hover:border-slate-600 bg-slate-950/80 hover:bg-slate-800/80'
              }`}
            >
              {/* Slide Thumbnail Header */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span className="font-bold">#{idx + 1}</span>
                <span className="uppercase text-[9px] tracking-wider text-slate-400">{slide.layout}</span>
              </div>

              {/* Title preview */}
              <div className="text-[11px] font-semibold text-slate-200 line-clamp-1 truncate my-auto">
                {slide.title || `Slide ${idx + 1}`}
              </div>

              {/* Hover quick action buttons */}
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity p-1">
                {idx > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveSlide(idx, 'left');
                    }}
                    className="p-1 rounded hover:bg-slate-800 text-slate-300"
                    title="Move Left"
                  >
                    <MoveLeft className="w-3 h-3" />
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateSlide(idx);
                  }}
                  className="p-1 rounded hover:bg-slate-800 text-slate-300"
                  title="Duplicate Slide"
                >
                  <Copy className="w-3 h-3" />
                </button>

                {slides.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSlide(idx);
                    }}
                    className="p-1 rounded hover:bg-rose-950 text-rose-400"
                    title="Delete Slide"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}

                {idx < slides.length - 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveSlide(idx, 'right');
                    }}
                    className="p-1 rounded hover:bg-slate-800 text-slate-300"
                    title="Move Right"
                  >
                    <MoveRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Add New Slide Thumbnail Button */}
        <button
          onClick={onAddSlide}
          className="flex-shrink-0 w-36 h-20 rounded-xl border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950/40 hover:bg-slate-800/50 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-indigo-400 transition-all group cursor-pointer"
        >
          <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-medium">Add Slide</span>
        </button>
      </div>
    </div>
  );
};
