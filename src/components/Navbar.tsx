import React, { useState } from 'react';
import {
  Presentation,
  Sparkles,
  Play,
  Share2,
  FileDown,
  Palette,
  LayoutGrid,
  Copy,
  Check,
  ChevronDown,
  FileCode,
  LogIn,
  LogOut,
  FolderOpen
} from 'lucide-react';
import { Theme, AspectRatio } from '../types';
import { THEMES } from '../lib/themes';
import { SAMPLE_TEMPLATES } from '../lib/templates';
import { User } from 'firebase/auth';

interface NavbarProps {
  title: string;
  setTitle: (t: string) => void;
  activeThemeId: string;
  setThemeId: (id: string) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (r: AspectRatio) => void;
  onOpenAiModal: () => void;
  onStartPresentation: () => void;
  onOpenGoogleExport: () => void;
  onLoadTemplate: (md: string, themeId: string) => void;
  onExportMarkdown: () => void;
  onExportPdf: () => void;
  user: User | null;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  title,
  setTitle,
  activeThemeId,
  setThemeId,
  aspectRatio,
  setAspectRatio,
  onOpenAiModal,
  onStartPresentation,
  onOpenGoogleExport,
  onLoadTemplate,
  onExportMarkdown,
  onExportPdf,
  user,
  onSignOut,
}) => {
  const [copied, setCopied] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 text-slate-100 px-4 flex items-center justify-between z-30 relative select-none">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Presentation className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent hover:bg-slate-800/80 focus:bg-slate-800 px-2 py-0.5 rounded text-sm font-semibold text-slate-100 outline-none border border-transparent focus:border-indigo-500/50 transition-all w-48 sm:w-64 truncate"
              placeholder="Presentation Title..."
            />
          </div>
          <span className="text-[10px] text-slate-400 px-2">Markdown Visual Slides</span>
        </div>
      </div>

      {/* Center Controls: Templates & Themes */}
      <div className="hidden md:flex items-center gap-2">
        {/* Templates Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowTemplateMenu(!showTemplateMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Templates</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showTemplateMenu && (
            <div
              className="absolute left-0 mt-1.5 w-64 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-1.5 z-50 text-xs"
              onMouseLeave={() => setShowTemplateMenu(false)}
            >
              <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                Starter Decks
              </div>
              {SAMPLE_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => {
                    onLoadTemplate(tmpl.markdown, tmpl.themeId);
                    setShowTemplateMenu(false);
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-800/90 flex flex-col gap-0.5 transition-colors group"
                >
                  <span className="font-semibold text-slate-200 group-hover:text-indigo-400">{tmpl.name}</span>
                  <span className="text-[10px] text-slate-400 line-clamp-1">{tmpl.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Themes Selector */}
        <div className="relative">
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 transition-colors"
          >
            <Palette className="w-3.5 h-3.5 text-purple-400" />
            <span>{THEMES[activeThemeId]?.name || 'Theme'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showThemeMenu && (
            <div
              className="absolute left-0 mt-1.5 w-60 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-1.5 z-50 text-xs"
              onMouseLeave={() => setShowThemeMenu(false)}
            >
              <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                Visual Themes
              </div>
              {Object.values(THEMES).map((th) => (
                <button
                  key={th.id}
                  onClick={() => {
                    setThemeId(th.id);
                    setShowThemeMenu(false);
                  }}
                  className={`w-full text-left p-2 rounded-lg flex items-center justify-between transition-colors ${
                    activeThemeId === th.id ? 'bg-indigo-600/20 text-indigo-300 font-semibold' : 'hover:bg-slate-800/90 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: th.slideBgHex }}
                    />
                    <span>{th.name}</span>
                  </div>
                  {activeThemeId === th.id && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Aspect Ratio Toggle */}
        <div className="flex bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60 text-xs">
          {(['16:9', '4:3', '1:1'] as AspectRatio[]).map((r) => (
            <button
              key={r}
              onClick={() => setAspectRatio(r)}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                aspectRatio === r ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Right Actions: AI, Google Slides & Present */}
      <div className="flex items-center gap-2">
        {/* AI Assistant Button */}
        <button
          onClick={onOpenAiModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span className="hidden sm:inline">AI Deck Generator</span>
        </button>

        {/* Google Slides Integration */}
        <button
          onClick={onOpenGoogleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 shadow-sm transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM17 12H13V17H11V12H7V10H11V5H13V10H17V12Z"
              fill="#F4B400"
            />
          </svg>
          <span className="hidden sm:inline">Google Slides</span>
        </button>

        {/* Present Mode Button */}
        <button
          onClick={onStartPresentation}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Present</span>
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="Export Options"
          >
            <FileDown className="w-4 h-4" />
          </button>

          {showExportMenu && (
            <div
              className="absolute right-0 mt-1.5 w-48 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-1.5 z-50 text-xs"
              onMouseLeave={() => setShowExportMenu(false)}
            >
              <button
                onClick={() => {
                  onExportPdf();
                  setShowExportMenu(false);
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-800 flex items-center gap-2 text-slate-200"
              >
                <FileCode className="w-3.5 h-3.5 text-rose-400" />
                <span>Export PDF / Print</span>
              </button>
              <button
                onClick={() => {
                  onExportMarkdown();
                  setShowExportMenu(false);
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-800 flex items-center gap-2 text-slate-200"
              >
                <FileDown className="w-3.5 h-3.5 text-blue-400" />
                <span>Download Markdown (.md)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
