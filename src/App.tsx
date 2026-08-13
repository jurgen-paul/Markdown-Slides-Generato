import React, { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import { Navbar } from './components/Navbar';
import { MarkdownEditor } from './components/MarkdownEditor';
import { SlideCanvas } from './components/SlideCanvas';
import { SlideThumbnails } from './components/SlideThumbnails';
import { AIGeneratorModal } from './components/AIGeneratorModal';
import { GoogleExportModal } from './components/GoogleExportModal';
import { PresentationMode } from './components/PresentationMode';
import { parseMarkdownToSlides, generateMarkdownFromSlides } from './lib/markdownParser';
import { getTheme } from './lib/themes';
import { SAMPLE_TEMPLATES } from './lib/templates';
import { initAuth, googleSignOut } from './lib/firebase';
import { AspectRatio } from './types';

export default function App() {
  // Initial state with default pitch deck template
  const defaultTemplate = SAMPLE_TEMPLATES[0];

  const [title, setTitle] = useState<string>('Nexus AI Pitch Deck');
  const [rawMarkdown, setRawMarkdown] = useState<string>(() => {
    const saved = localStorage.getItem('markdown_slides_content');
    return saved || defaultTemplate.markdown;
  });
  const [themeId, setThemeId] = useState<string>(() => {
    const saved = localStorage.getItem('markdown_slides_theme');
    return saved || defaultTemplate.themeId;
  });
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  // Modals & Mode
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isGoogleExportOpen, setIsGoogleExportOpen] = useState(false);
  const [isPresenting, setIsPresenting] = useState(false);

  // Auth User
  const [user, setUser] = useState<User | null>(null);

  // Sync auth state on load
  useEffect(() => {
    const unsubscribe = initAuth((u) => setUser(u), () => setUser(null));
    return () => unsubscribe();
  }, []);

  // Save changes locally
  useEffect(() => {
    localStorage.setItem('markdown_slides_content', rawMarkdown);
    localStorage.setItem('markdown_slides_theme', themeId);
  }, [rawMarkdown, themeId]);

  // Parse slides dynamically from raw markdown
  const slides = useMemo(() => {
    return parseMarkdownToSlides(rawMarkdown);
  }, [rawMarkdown]);

  // Ensure activeSlideIndex stays in range
  useEffect(() => {
    if (activeSlideIndex >= slides.length) {
      setActiveSlideIndex(Math.max(0, slides.length - 1));
    }
  }, [slides.length, activeSlideIndex]);

  const activeTheme = getTheme(themeId);
  const activeSlide = slides[activeSlideIndex] || slides[0];

  // Slide Manipulation Handlers
  const handleUpdateSlideMarkdown = (index: number, newSlideMd: string) => {
    const updatedSlides = [...slides];
    if (updatedSlides[index]) {
      updatedSlides[index] = {
        ...updatedSlides[index],
        rawMarkdown: newSlideMd,
      };
      const newFullMd = generateMarkdownFromSlides(updatedSlides);
      setRawMarkdown(newFullMd);
    }
  };

  const handleAddSlide = () => {
    const newSlideMd = `<!-- layout: standard -->\n# New Slide Title\n\n- Write your bullet point here\n- Add another key takeaway`;
    const newFullMd = rawMarkdown.trim() + '\n\n---\n\n' + newSlideMd;
    setRawMarkdown(newFullMd);
    setActiveSlideIndex(slides.length);
  };

  const handleDuplicateSlide = (index: number) => {
    const slideToDup = slides[index];
    if (!slideToDup) return;
    const updatedSlides = [...slides];
    updatedSlides.splice(index + 1, 0, {
      ...slideToDup,
      id: `slide_dup_${Date.now()}`,
    });
    setRawMarkdown(generateMarkdownFromSlides(updatedSlides));
    setActiveSlideIndex(index + 1);
  };

  const handleDeleteSlide = (index: number) => {
    if (slides.length <= 1) return;
    const updatedSlides = slides.filter((_, i) => i !== index);
    setRawMarkdown(generateMarkdownFromSlides(updatedSlides));
    setActiveSlideIndex(Math.max(0, index - 1));
  };

  const handleMoveSlide = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const updatedSlides = [...slides];
    const [moved] = updatedSlides.splice(index, 1);
    updatedSlides.splice(targetIndex, 0, moved);

    setRawMarkdown(generateMarkdownFromSlides(updatedSlides));
    setActiveSlideIndex(targetIndex);
  };

  const handleLoadTemplate = (markdown: string, newThemeId: string) => {
    setRawMarkdown(markdown);
    setThemeId(newThemeId);
    setActiveSlideIndex(0);
  };

  const handleExportMarkdown = () => {
    const blob = new Blob([rawMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '_')}_presentation.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    window.print();
  };

  const handleSignOut = async () => {
    await googleSignOut();
    setUser(null);
  };

  return (
    <div className="min-h-screen h-screen flex flex-col bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Top Navigation Bar */}
      <Navbar
        title={title}
        setTitle={setTitle}
        activeThemeId={themeId}
        setThemeId={setThemeId}
        aspectRatio={aspectRatio}
        setAspectRatio={setAspectRatio}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onStartPresentation={() => setIsPresenting(true)}
        onOpenGoogleExport={() => setIsGoogleExportOpen(true)}
        onLoadTemplate={handleLoadTemplate}
        onExportMarkdown={handleExportMarkdown}
        onExportPdf={handleExportPdf}
        user={user}
        onSignOut={handleSignOut}
      />

      {/* Main Workspace Area: Split Editor & Live Preview */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side: Markdown Editor */}
        <div className="w-full md:w-[420px] lg:w-[480px] xl:w-[540px] shrink-0 h-full">
          <MarkdownEditor
            value={rawMarkdown}
            onChange={setRawMarkdown}
            activeSlideIndex={activeSlideIndex}
            activeSlideMarkdown={activeSlide?.rawMarkdown || ''}
            onUpdateSlideMarkdown={handleUpdateSlideMarkdown}
            onAddSlide={handleAddSlide}
          />
        </div>

        {/* Right Side: Live Visual Stage */}
        <div className="hidden md:flex flex-1 flex-col h-full bg-slate-900/60 relative overflow-hidden">
          <div className="flex-1 overflow-hidden p-4 flex items-center justify-center">
            <SlideCanvas
              slide={activeSlide}
              slideIndex={activeSlideIndex}
              totalSlides={slides.length}
              theme={activeTheme}
              aspectRatio={aspectRatio}
              interactive={true}
            />
          </div>

          {/* Bottom Thumbnails Strip */}
          <SlideThumbnails
            slides={slides}
            activeSlideIndex={activeSlideIndex}
            onSelectSlide={setActiveSlideIndex}
            onAddSlide={handleAddSlide}
            onDuplicateSlide={handleDuplicateSlide}
            onDeleteSlide={handleDeleteSlide}
            onMoveSlide={handleMoveSlide}
            theme={activeTheme}
          />
        </div>
      </div>

      {/* AI Presentation Generator Modal */}
      <AIGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onGenerated={(md) => {
          setRawMarkdown(md);
          setActiveSlideIndex(0);
        }}
      />

      {/* Google Slides Export Modal */}
      <GoogleExportModal
        isOpen={isGoogleExportOpen}
        onClose={() => setIsGoogleExportOpen(false)}
        title={title}
        slides={slides}
        theme={activeTheme}
        user={user}
        setUser={setUser}
      />

      {/* Fullscreen Presentation Mode */}
      {isPresenting && (
        <PresentationMode
          slides={slides}
          currentSlideIndex={activeSlideIndex}
          onSelectSlide={setActiveSlideIndex}
          onExit={() => setIsPresenting(false)}
          theme={activeTheme}
          aspectRatio={aspectRatio}
        />
      )}
    </div>
  );
}
