import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ParsedSlide, Theme, AspectRatio, AnimationStyle } from '../types';
import {
  Quote as QuoteIcon,
  MessageSquare,
  Sparkles,
  ChevronDown,
  ChevronUp,
  BarChart2,
  CheckCircle2,
  Code2
} from 'lucide-react';

interface SlideCanvasProps {
  slide: ParsedSlide;
  slideIndex: number;
  totalSlides: number;
  theme: Theme;
  aspectRatio: AspectRatio;
  animation?: AnimationStyle;
  interactive?: boolean;
}

export const SlideCanvas: React.FC<SlideCanvasProps> = ({
  slide,
  slideIndex,
  totalSlides,
  theme,
  aspectRatio,
  animation = 'fade',
  interactive = true,
}) => {
  const [showNotes, setShowNotes] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // ResizeObserver to scale slide contents responsively
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        // Target slide width is 960px
        const newScale = Math.min(Math.max(width / 960, 0.35), 1.6);
        setScale(newScale);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Aspect ratio class calculation
  const getAspectRatioClass = () => {
    if (aspectRatio === '4:3') return 'aspect-[4/3]';
    if (aspectRatio === '1:1') return 'aspect-square';
    return 'aspect-[16/9]';
  };

  // Motion animation variants
  const getVariants = () => {
    if (animation === 'slide') {
      return {
        initial: { opacity: 0, x: 50 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -50 },
      };
    }
    if (animation === 'zoom') {
      return {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 1.05 },
      };
    }
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    };
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden relative">
      {/* Slide Container Stage */}
      <div
        ref={containerRef}
        className={`w-full max-w-5xl ${getAspectRatioClass()} ${theme.bgClass} rounded-2xl shadow-2xl relative overflow-hidden border ${theme.borderClass} flex flex-col transition-all duration-300 select-none`}
      >
        {/* Ambient background glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Slide Header Indicator */}
        <div className="px-8 pt-6 flex items-center justify-between text-xs font-medium opacity-60 z-10">
          <span className="uppercase tracking-widest text-[11px] font-mono">{theme.name}</span>
          <span className="font-mono">{slideIndex + 1} / {totalSlides}</span>
        </div>

        {/* Slide Body */}
        <div className="flex-1 p-8 sm:p-12 flex flex-col justify-center z-10 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id + slideIndex}
              variants={getVariants()}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full h-full flex flex-col justify-center"
            >
              {/* LAYOUT 1: HERO TITLE / COVER SLIDE */}
              {slide.layout === 'title' && (
                <div className="text-center max-w-3xl mx-auto space-y-6 my-auto">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h1 className={`text-4xl sm:text-5xl md:text-6xl font-black ${theme.titleClass} leading-tight`}>
                      {slide.title}
                    </h1>
                  </motion.div>

                  {slide.subtitle && (
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className={`text-lg sm:text-xl md:text-2xl ${theme.textMutedClass} font-light max-w-2xl mx-auto`}
                    >
                      {slide.subtitle}
                    </motion.p>
                  )}

                  {slide.bullets.length > 0 && (
                    <div className="pt-4 flex flex-wrap justify-center gap-3">
                      {slide.bullets.map((b, i) => (
                        <span
                          key={i}
                          className={`px-4 py-1.5 rounded-full text-sm font-medium ${theme.cardBgClass} ${theme.textClass}`}
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* LAYOUT 2: STATS / METRICS FOCUS */}
              {slide.layout === 'stats' && (
                <div className="space-y-8 my-auto">
                  <div>
                    <h2 className={`text-2xl sm:text-3xl font-extrabold ${theme.titleClass}`}>
                      {slide.title}
                    </h2>
                    {slide.subtitle && (
                      <p className={`text-sm sm:text-base ${theme.textMutedClass} mt-1`}>
                        {slide.subtitle}
                      </p>
                    )}
                  </div>

                  {slide.stats.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {slide.stats.map((st, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className={`p-6 rounded-2xl ${theme.cardBgClass} ${theme.accentGlow} flex flex-col justify-center items-center text-center group hover:scale-[1.02] transition-transform`}
                        >
                          <span className={`text-4xl sm:text-5xl font-black ${theme.accentClass} tracking-tight`}>
                            {st.value}
                          </span>
                          <span className={`text-xs sm:text-sm font-medium ${theme.textClass} mt-2 line-clamp-2`}>
                            {st.label}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {slide.bullets.length > 0 && (
                    <div className="space-y-2 pt-2">
                      {slide.bullets.map((b, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-sm sm:text-base">
                          <CheckCircle2 className={`w-5 h-5 ${theme.accentClass} shrink-0 mt-0.5`} />
                          <span className={theme.textClass}>{b}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* LAYOUT 3: SPLIT 2-COLUMN */}
              {slide.layout === 'split' && (
                <div className="space-y-6 my-auto">
                  <div>
                    <h2 className={`text-2xl sm:text-3xl font-extrabold ${theme.titleClass}`}>
                      {slide.title}
                    </h2>
                    {slide.subtitle && (
                      <p className={`text-sm sm:text-base ${theme.textMutedClass} mt-1`}>
                        {slide.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {slide.columns.length >= 2 ? (
                      slide.columns.slice(0, 2).map((col, i) => (
                        <div key={i} className={`p-6 rounded-2xl ${theme.cardBgClass} space-y-3`}>
                          {col.title && (
                            <h3 className={`text-lg font-bold ${theme.accentClass}`}>
                              {col.title}
                            </h3>
                          )}
                          <ul className="space-y-2.5">
                            {col.items.map((it, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm sm:text-base">
                                <span className={`w-1.5 h-1.5 rounded-full ${theme.accentBgClass} shrink-0 mt-2`} />
                                <span className={theme.textClass}>{it}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className={`p-6 rounded-2xl ${theme.cardBgClass} space-y-3`}>
                          <ul className="space-y-2.5">
                            {slide.bullets.slice(0, Math.ceil(slide.bullets.length / 2)).map((b, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm sm:text-base">
                                <span className={`w-1.5 h-1.5 rounded-full ${theme.accentBgClass} shrink-0 mt-2`} />
                                <span className={theme.textClass}>{b}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className={`p-6 rounded-2xl ${theme.cardBgClass} space-y-3`}>
                          <ul className="space-y-2.5">
                            {slide.bullets.slice(Math.ceil(slide.bullets.length / 2)).map((b, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm sm:text-base">
                                <span className={`w-1.5 h-1.5 rounded-full ${theme.accentBgClass} shrink-0 mt-2`} />
                                <span className={theme.textClass}>{b}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* LAYOUT 4: GRID FEATURE CARDS */}
              {slide.layout === 'grid' && (
                <div className="space-y-6 my-auto">
                  <div>
                    <h2 className={`text-2xl sm:text-3xl font-extrabold ${theme.titleClass}`}>
                      {slide.title}
                    </h2>
                    {slide.subtitle && (
                      <p className={`text-sm sm:text-base ${theme.textMutedClass} mt-1`}>
                        {slide.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {slide.columns.length > 0
                      ? slide.columns.map((col, i) => (
                          <div key={i} className={`p-5 rounded-2xl ${theme.cardBgClass} space-y-2`}>
                            {col.title && <h3 className={`font-bold ${theme.accentClass}`}>{col.title}</h3>}
                            <ul className="space-y-1.5 text-xs sm:text-sm">
                              {col.items.map((it, idx) => (
                                <li key={idx} className={theme.textClass}>
                                  • {it}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))
                      : slide.bullets.map((b, i) => (
                          <div key={i} className={`p-5 rounded-2xl ${theme.cardBgClass} space-y-2`}>
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${theme.accentBgClass}`} />
                              <span className={`font-medium ${theme.textClass} text-sm sm:text-base`}>{b}</span>
                            </div>
                          </div>
                        ))}
                  </div>
                </div>
              )}

              {/* LAYOUT 5: QUOTE LAYOUT */}
              {slide.layout === 'quote' && (
                <div className="max-w-3xl mx-auto text-center space-y-6 my-auto">
                  <QuoteIcon className={`w-12 h-12 ${theme.accentClass} opacity-40 mx-auto`} />
                  {slide.quotes.length > 0 ? (
                    <blockquote className={`text-2xl sm:text-3xl md:text-4xl font-serif italic ${theme.titleClass} leading-relaxed`}>
                      "{slide.quotes[0]}"
                    </blockquote>
                  ) : (
                    <blockquote className={`text-2xl sm:text-3xl md:text-4xl font-serif italic ${theme.titleClass}`}>
                      "{slide.title}"
                    </blockquote>
                  )}
                  {slide.subtitle && (
                    <p className={`text-base sm:text-lg font-medium ${theme.accentClass}`}>
                      — {slide.subtitle}
                    </p>
                  )}
                </div>
              )}

              {/* LAYOUT 6: CODE BLOCK */}
              {slide.layout === 'code' && (
                <div className="space-y-4 my-auto">
                  <div>
                    <h2 className={`text-2xl sm:text-3xl font-extrabold ${theme.titleClass}`}>
                      {slide.title}
                    </h2>
                    {slide.subtitle && (
                      <p className={`text-sm ${theme.textMutedClass} mt-1`}>
                        {slide.subtitle}
                      </p>
                    )}
                  </div>

                  {slide.codeBlock && (
                    <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800 p-4 font-mono text-xs sm:text-sm text-emerald-400 shadow-2xl">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400 text-[11px]">
                        <span>{slide.codeBlock.language || 'code'}</span>
                        <Code2 className="w-4 h-4 text-slate-400" />
                      </div>
                      <pre className="overflow-x-auto whitespace-pre leading-relaxed">
                        <code>{slide.codeBlock.code}</code>
                      </pre>
                    </div>
                  )}

                  {slide.bullets.length > 0 && (
                    <ul className="space-y-1.5 text-xs sm:text-sm">
                      {slide.bullets.map((b, i) => (
                        <li key={i} className={`flex items-center gap-2 ${theme.textClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${theme.accentBgClass}`} />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* LAYOUT 7: STANDARD BULLETS / IMAGE */}
              {slide.layout === 'standard' && (
                <div className="space-y-6 my-auto">
                  <div>
                    <h2 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold ${theme.titleClass}`}>
                      {slide.title}
                    </h2>
                    {slide.subtitle && (
                      <p className={`text-base sm:text-lg ${theme.textMutedClass} mt-1 font-light`}>
                        {slide.subtitle}
                      </p>
                    )}
                  </div>

                  <div className={`grid ${slide.imageUrl ? 'grid-cols-1 md:grid-cols-2 gap-8' : 'grid-cols-1 gap-4'}`}>
                    {slide.bullets.length > 0 && (
                      <div className="space-y-3">
                        {slide.bullets.map((bullet, i) => (
                          <motion.div
                            key={i}
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.08 }}
                            className={`p-4 rounded-xl ${theme.cardBgClass} flex items-start gap-3`}
                          >
                            <span className={`w-2 h-2 rounded-full ${theme.accentBgClass} shrink-0 mt-2`} />
                            <span className={`text-sm sm:text-base font-medium ${theme.textClass}`}>
                              {bullet}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {slide.imageUrl && (
                      <div className="flex items-center justify-center">
                        <img
                          src={slide.imageUrl}
                          alt={slide.imageAlt || 'Slide illustration'}
                          className="rounded-2xl max-h-72 object-cover border border-white/10 shadow-2xl"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Speaker Notes Toggle Bar */}
        {interactive && slide.notes && (
          <div className="absolute bottom-0 left-0 right-0 z-20">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="w-full bg-slate-950/80 hover:bg-slate-950 border-t border-slate-800 text-slate-300 py-1.5 px-4 text-xs flex items-center justify-between backdrop-blur-md transition-colors"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-semibold">Speaker Notes</span>
              </div>
              {showNotes ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>

            {showNotes && (
              <div className="bg-slate-950/95 border-t border-slate-800 p-4 text-xs text-slate-200 backdrop-blur-md max-h-32 overflow-y-auto">
                <p className="leading-relaxed whitespace-pre-line">{slide.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
