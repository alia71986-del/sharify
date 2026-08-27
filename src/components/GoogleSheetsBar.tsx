import React from 'react';
import {
  FileSpreadsheet,
  ExternalLink,
  Upload,
  Download,
  CheckCircle2,
  RefreshCw,
  Settings,
} from 'lucide-react';
import { User } from 'firebase/auth';

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
}) => {
  return (
    <div className="mb-6 bg-[#0f172a] rounded-2xl p-4 sm:p-5 border border-[#1e293b] shadow-xl">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left Status */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-950/40">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                Google Sheets Sync Engine
              </h3>
              {user ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  Connected ({user.email?.split('@')[0]})
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Not Connected
                </span>
              )}
              {autoSyncEnabled && activeSpreadsheetId && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Auto-Sync Active
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 mt-0.5">
              {activeSpreadsheetId ? (
                <span>
                  Linked Sheet: <strong className="text-slate-200">{activeSpreadsheetTitle || 'Student Registry'}</strong>
                </span>
              ) : (
                <span>Export and synchronize student registry records with your Google Drive spreadsheets.</span>
              )}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {activeSpreadsheetUrl && (
            <a
              href={activeSpreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl bg-[#1e293b] hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#334155]"
            >
              <span>View Sheet</span>
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
            </a>
          )}

          {activeSpreadsheetId && (
            <button
              type="button"
              id="quick-export-sheets-btn"
              onClick={onQuickExport}
              disabled={isExporting || totalStudents === 0}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/30 cursor-pointer disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Sync to Sheet ({totalStudents})</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            id="open-google-sheets-modal-btn"
            onClick={onOpenModal}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-amber-950/30 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{activeSpreadsheetId ? 'Manage Sheets' : 'Connect Google Sheets'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
