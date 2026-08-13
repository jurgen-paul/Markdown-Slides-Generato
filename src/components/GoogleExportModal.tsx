import React, { useState } from 'react';
import { X, CheckCircle, ExternalLink, Loader2, AlertCircle, LogIn, LogOut } from 'lucide-react';
import { User } from 'firebase/auth';
import { googleSignIn, googleSignOut, getCachedAccessToken } from '../lib/firebase';
import { exportToGoogleSlides } from '../lib/googleSlides';
import { ParsedSlide, Theme, GoogleExportStatus } from '../types';

interface GoogleExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  slides: ParsedSlide[];
  theme: Theme;
  user: User | null;
  setUser: (u: User | null) => void;
}

export const GoogleExportModal: React.FC<GoogleExportModalProps> = ({
  isOpen,
  onClose,
  title,
  slides,
  theme,
  user,
  setUser,
}) => {
  const [exportState, setExportState] = useState<GoogleExportStatus>({
    status: 'idle',
    progress: 0,
    message: '',
  });

  if (!isOpen) return null;

  const handleSignIn = async () => {
    try {
      setExportState({ status: 'signing_in', progress: 10, message: 'Signing in with Google...' });
      const res = await googleSignIn();
      if (res?.user) {
        setUser(res.user);
        setExportState({ status: 'idle', progress: 0, message: '' });
      }
    } catch (err: any) {
      setExportState({
        status: 'error',
        progress: 0,
        message: 'Sign in failed',
        error: err.message || 'Failed to authenticate with Google',
      });
    }
  };

  const handleExport = async () => {
    let token = getCachedAccessToken();

    if (!token && !user) {
      try {
        setExportState({ status: 'signing_in', progress: 10, message: 'Signing in with Google...' });
        const res = await googleSignIn();
        if (res?.user) {
          setUser(res.user);
          token = res.accessToken;
        }
      } catch (err: any) {
        setExportState({
          status: 'error',
          progress: 0,
          message: 'Sign in required',
          error: 'Please sign in with Google to export slides.',
        });
        return;
      }
    }

    if (!token) {
      setExportState({
        status: 'error',
        progress: 0,
        message: 'Missing Google Token',
        error: 'Please re-authenticate with Google to complete export.',
      });
      return;
    }

    try {
      setExportState({ status: 'creating', progress: 15, message: 'Initiating Google Slides API...' });

      const result = await exportToGoogleSlides({
        accessToken: token,
        title: title || 'Markdown Presentation',
        slides,
        theme,
        onProgress: (p, msg) => {
          setExportState({ status: 'updating', progress: p, message: msg });
        },
      });

      setExportState({
        status: 'success',
        progress: 100,
        message: 'Presentation successfully created in Google Slides!',
        presentationId: result.presentationId,
        presentationUrl: result.presentationUrl,
      });
    } catch (err: any) {
      console.error('Export Error:', err);
      setExportState({
        status: 'error',
        progress: 0,
        message: 'Google Slides Export Failed',
        error: err.message || 'An error occurred during export.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-slate-100 relative select-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                <path
                  d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM17 12H13V17H11V12H7V10H11V5H13V10H17V12Z"
                  fill="#F4B400"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold">Export to Google Slides</h2>
              <p className="text-xs text-slate-400">Convert Markdown slides directly to Google Drive</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-6 space-y-5">
          {/* Account Status Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            {user ? (
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-9 h-9 rounded-full" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center font-bold">
                    {user.email?.[0].toUpperCase() || 'U'}
                  </div>
                )}
                <div className="text-xs">
                  <div className="font-semibold text-slate-200">{user.displayName || 'Google User'}</div>
                  <div className="text-slate-400 text-[11px]">{user.email}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs text-slate-400">Sign in to connect Google Slides & Drive</span>
                <button
                  onClick={handleSignIn}
                  className="gsi-material-button text-xs font-semibold px-3 py-1.5 rounded-lg bg-white text-slate-900 hover:bg-slate-100 flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4 text-indigo-600" />
                  <span>Sign in with Google</span>
                </button>
              </div>
            )}
          </div>

          {/* Export Details */}
          <div className="text-xs space-y-1.5 text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Presentation Title:</span>
              <span className="font-semibold text-slate-100">{title || 'Markdown Slides'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Total Slides:</span>
              <span className="font-semibold text-slate-100">{slides.length} slides</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Visual Theme:</span>
              <span className="font-semibold text-indigo-400">{theme.name}</span>
            </div>
          </div>

          {/* Progress or Status */}
          {exportState.status !== 'idle' && exportState.status !== 'error' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-2">
                  {exportState.status === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                  )}
                  {exportState.message}
                </span>
                <span className="font-mono font-bold text-amber-400">{exportState.progress}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-amber-500 to-indigo-500 h-2 transition-all duration-300"
                  style={{ width: `${exportState.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {exportState.status === 'error' && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">{exportState.message}</div>
                <div className="text-[11px] opacity-80">{exportState.error}</div>
              </div>
            </div>
          )}

          {/* Success Result */}
          {exportState.status === 'success' && exportState.presentationUrl && (
            <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-200 text-xs space-y-3">
              <div className="font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Export Complete!</span>
              </div>
              <a
                href={exportState.presentationUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/30"
              >
                <span>Open in Google Slides</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            Close
          </button>

          {exportState.status !== 'success' && (
            <button
              onClick={handleExport}
              disabled={exportState.status === 'creating' || exportState.status === 'updating'}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-amber-500/20"
            >
              {exportState.status === 'creating' || exportState.status === 'updating' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : (
                <span>Start Google Slides Export</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
