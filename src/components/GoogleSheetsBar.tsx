import React from 'react';
import {
  FileSpreadsheet,
  CheckCircle,
  ExternalLink,
  UploadCloud,
  Settings2,
  RefreshCw,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface GoogleSheetsBarProps {
  user: User | null;
  activeSpreadsheetId: string | null;
  activeSpreadsheetUrl: string | null;
  activeSpreadsheetTitle: string | null;
  autoSyncEnabled: boolean;
  totalStudents: number;
  onOpenModal: () => void;
  onQuickExport: () => void;
  isExporting: boolean;
  language: Language;
}

export const GoogleSheetsBar: React.FC<GoogleSheetsBarProps> = ({
  user,
  activeSpreadsheetId,
  activeSpreadsheetUrl,
  activeSpreadsheetTitle,
  autoSyncEnabled,
  totalStudents,
  onOpenModal,
  onQuickExport,
  isExporting,
  language,
}) => {
  const t = translations[language];
  const isConnected = !!user && !!activeSpreadsheetId;

  return (
    <div
      className={`mb-6 rounded-2xl p-4 border transition-all shadow-md ${
        isConnected
          ? 'bg-[#0f172a] border-emerald-500/30'
          : 'bg-[#0f172a] border-[#1e293b]'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Status Info */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isConnected
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            <FileSpreadsheet className="w-5 h-5" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                {t.sheetsBarTitle}
              </h3>
              {isConnected ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  {autoSyncEnabled ? t.sheetsAutoSyncOn : t.sheetsAutoSyncOff}
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                  {language === 'ar' ? 'غير متصل' : 'Not Connected'}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 mt-0.5">
              {isConnected ? (
                <>
                  {t.sheetsBarConnected}:{' '}
                  <strong className="text-white font-medium">
                    {activeSpreadsheetTitle || activeSpreadsheetId}
                  </strong>
                </>
              ) : (
                t.sheetsBarDisconnected
              )}
            </p>
          </div>
        </div>

        {/* Right Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {isConnected && activeSpreadsheetUrl && (
            <a
              href={activeSpreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl bg-[#0a0c10] hover:bg-slate-800 border border-[#334155] text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'ar' ? 'فتح الجدول' : 'Open Sheet'}</span>
            </a>
          )}

          {isConnected && (
            <button
              type="button"
              id="sheets-bar-quick-export-btn"
              onClick={onQuickExport}
              disabled={isExporting || totalStudents === 0}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isExporting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <UploadCloud className="w-3.5 h-3.5" />
              )}
              <span>{isExporting ? t.sheetsExporting : t.sheetsQuickExport}</span>
            </button>
          )}

          <button
            type="button"
            id="sheets-bar-manage-btn"
            onClick={onOpenModal}
            className="px-3.5 py-2 rounded-xl bg-[#1e293b] hover:bg-slate-700 active:bg-slate-600 border border-[#334155] text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.sheetsManage}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
