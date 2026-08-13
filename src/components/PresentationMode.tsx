import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  MousePointer,
  PenTool,
  RotateCcw,
  Clock,
  Maximize2,
  Minimize2,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { ParsedSlide, Theme, AspectRatio } from '../types';
import { SlideCanvas } from './SlideCanvas';

interface PresentationModeProps {
  slides: ParsedSlide[];
  currentSlideIndex: number;
  onSelectSlide: (idx: number) => void;
  onExit: () => void;
  theme: Theme;
  aspectRatio: AspectRatio;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({
  slides,
  currentSlideIndex,
  onSelectSlide,
  onExit,
  theme,
  aspectRatio,
}) => {
  const [tool, setTool] = useState<'normal' | 'laser' | 'pen'>('normal');
  const [penColor, setPenColor] = useState('#ef4444');
  const [laserPos, setLaserPos] = useState({ x: -100, y: -100 });
  const [showPresenterPanel, setShowPresenterPanel] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isBlackScreen, setIsBlackScreen] = useState(false);

  // Drawing Canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space' || e.key === 'PageDown') {
        if (currentSlideIndex < slides.length - 1) {
          onSelectSlide(currentSlideIndex + 1);
          clearCanvas();
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (currentSlideIndex > 0) {
          onSelectSlide(currentSlideIndex - 1);
          clearCanvas();
        }
      } else if (e.key === 'Escape') {
        onExit();
      } else if (e.key === 'b' || e.key === 'B') {
        setIsBlackScreen((b) => !b);
      } else if (e.key === 'l' || e.key === 'L') {
        setTool((t) => (t === 'laser' ? 'normal' : 'laser'));
      } else if (e.key === 'p' || e.key === 'P') {
        setTool((t) => (t === 'pen' ? 'normal' : 'pen'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, slides.length, onSelectSlide, onExit]);

  // Laser Pointer tracking
  const handleMouseMove = (e: React.MouseEvent) => {
    if (tool === 'laser') {
      setLaserPos({ x: e.clientX, y: e.clientY });
    }
  };

  // Drawing Pen Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== 'pen') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    isDrawing.current = true;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || tool !== 'pen') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const currentSlide = slides[currentSlideIndex];
  const nextSlide = slides[currentSlideIndex + 1];

  return (
    <div
      className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between overflow-hidden select-none"
      onMouseMove={handleMouseMove}
    >
      {/* Black Screen Toggle Overlay */}
      {isBlackScreen && (
        <div className="absolute inset-0 z-50 bg-black flex items-center justify-center text-slate-600 text-sm">
          Press 'B' or click anywhere to resume
        </div>
      )}

      {/* Laser Pointer Graphic */}
      {tool === 'laser' && (
        <div
          className="fixed w-6 h-6 rounded-full bg-rose-500/80 border-2 border-white shadow-[0_0_20px_rgba(244,63,94,1)] pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 animate-ping"
          style={{ left: laserPos.x, top: laserPos.y }}
        />
      )}

      {/* Main Slide Display Stage */}
      <div className="flex-1 relative flex items-center justify-center p-2 sm:p-6 overflow-hidden">
        <SlideCanvas
          slide={currentSlide}
          slideIndex={currentSlideIndex}
          totalSlides={slides.length}
          theme={theme}
          aspectRatio={aspectRatio}
          interactive={false}
        />

        {/* Overlay Drawing Canvas */}
        <canvas
          ref={canvasRef}
          width={window.innerWidth}
          height={window.innerHeight}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className={`absolute inset-0 z-30 ${tool === 'pen' ? 'cursor-crosshair' : 'pointer-events-none'}`}
        />
      </div>

      {/* Presenter Control Floating Bar */}
      <div className="h-16 bg-slate-950/90 border-t border-slate-800 px-6 flex items-center justify-between z-40 backdrop-blur-md">
        {/* Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (currentSlideIndex > 0) {
                onSelectSlide(currentSlideIndex - 1);
                clearCanvas();
              }
            }}
            disabled={currentSlideIndex === 0}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-xs font-mono font-bold px-2">
            {currentSlideIndex + 1} / {slides.length}
          </span>

          <button
            onClick={() => {
              if (currentSlideIndex < slides.length - 1) {
                onSelectSlide(currentSlideIndex + 1);
                clearCanvas();
              }
            }}
            disabled={currentSlideIndex === slides.length - 1}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Tools: Laser, Pen, Clear, Presenter Panel */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTool((t) => (t === 'laser' ? 'normal' : 'laser'))}
            className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors ${
              tool === 'laser' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="Toggle Laser Pointer (L)"
          >
            <MousePointer className="w-4 h-4" />
            <span className="hidden sm:inline">Laser</span>
          </button>

          <button
            onClick={() => setTool((t) => (t === 'pen' ? 'normal' : 'pen'))}
            className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors ${
              tool === 'pen' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="Toggle Pen Tool (P)"
          >
            <PenTool className="w-4 h-4" />
            <span className="hidden sm:inline">Pen</span>
          </button>

          {tool === 'pen' && (
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
              {['#ef4444', '#10b981', '#3b82f6', '#f59e0b', '#ffffff'].map((c) => (
                <button
                  key={c}
                  onClick={() => setPenColor(c)}
                  className={`w-4 h-4 rounded-full border ${penColor === c ? 'border-white scale-125' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <button
                onClick={clearCanvas}
                className="p-1 rounded text-slate-400 hover:text-white"
                title="Clear Drawings"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            onClick={() => setShowPresenterPanel(!showPresenterPanel)}
            className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors ${
              showPresenterPanel ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="Toggle Presenter View Notes & Next Slide"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Notes View</span>
          </button>
        </div>

        {/* Timer & Exit */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs font-mono bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>

          <button
            onClick={onExit}
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/80 text-slate-300 hover:text-rose-300 transition-colors"
            title="Exit Presentation Mode (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Pop-out Presenter Notes Panel */}
      {showPresenterPanel && (
        <div className="fixed bottom-20 right-6 w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 text-slate-100 flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Presenter View</span>
            <button onClick={() => setShowPresenterPanel(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Current Speaker Notes */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">Speaker Notes:</span>
            <div className="bg-slate-950 p-3 rounded-xl text-xs text-slate-200 min-h-20 max-h-36 overflow-y-auto font-sans leading-relaxed">
              {currentSlide.notes ? (
                currentSlide.notes
              ) : (
                <span className="text-slate-500 italic">No speaker notes recorded for this slide.</span>
              )}
            </div>
          </div>

          {/* Next Slide Preview */}
          {nextSlide && (
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">Next Slide Preview:</span>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                <span className="font-bold text-indigo-300 block">{nextSlide.title}</span>
                {nextSlide.subtitle && <span className="text-[11px] text-slate-400">{nextSlide.subtitle}</span>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
