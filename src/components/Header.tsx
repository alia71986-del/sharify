import React from 'react';
import { GraduationCap, ShieldCheck, Calendar, FileSpreadsheet } from 'lucide-react';
import { formatDisplayDate, getTodayDateString } from '../utils/validation';

interface HeaderProps {
  totalStudents: number;
  onOpenGoogleSheets: () => void;
  isSheetsConnected: boolean;
  sheetsTitle?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  totalStudents: _totalStudents,
  onOpenGoogleSheets,
  isSheetsConnected,
  sheetsTitle,
}) => {
  const todayStr = getTodayDateString();

  return (
    <header className="bg-[#0f172a] border-b border-[#1e293b] text-[#e2e8f0] sticky top-0 z-30 shadow-lg shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Portal Identity */}
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-amber-900/30 ring-1 ring-amber-500/40 flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white uppercase">
                  Academic Registry <span className="text-amber-500">//</span> Students
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  v2.4 Staff Portal
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official Student Information Collection & Administrative Record System
              </p>
            </div>
          </div>

          {/* Right Status Badges & Google Sheets Button */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-300">
            {/* Google Sheets Trigger */}
            <button
              type="button"
              id="header-google-sheets-btn"
              onClick={onOpenGoogleSheets}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                isSheetsConnected
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                  : 'bg-[#1e293b] border-[#334155] text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              title="Google Sheets Cloud Sync"
            >
              <FileSpreadsheet className={`w-3.5 h-3.5 ${isSheetsConnected ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="font-medium">
                {isSheetsConnected ? (sheetsTitle ? `Sheet: ${sheetsTitle.slice(0, 16)}...` : 'Google Sheets Active') : 'Google Sheets'}
              </span>
            </button>

            {/* System Date */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e293b] border border-[#334155] text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Today: <strong className="text-white font-mono">{formatDisplayDate(todayStr)}</strong></span>
            </div>

            {/* Privacy Compliance Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>FERPA Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};


