import React from 'react';
import { Users, CalendarCheck2, PhoneCall, TrendingUp } from 'lucide-react';
import { Student, Language } from '../types';
import { getTodayDateString, formatDisplayDate } from '../utils/validation';
import { translations } from '../utils/translations';

interface StatsBannerProps {
  students: Student[];
  language: Language;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({ students, language }) => {
  const t = translations[language];
  const todayStr = getTodayDateString();
  const monthPrefix = todayStr.slice(0, 7);

  const total = students.length;
  const todayCount = students.filter((s) => s.collectionDate === todayStr).length;
  const thisMonthCount = students.filter((s) => s.collectionDate?.startsWith(monthPrefix)).length;
  const parentPhoneCount = students.filter(
    (s) => !!(s.parentPhoneNumber?.trim() || s.additionalPhoneNumber?.trim())
  ).length;
  const parentPhonePercentage = total > 0 ? Math.round((parentPhoneCount / total) * 100) : 0;

  const maleCount = students.filter((s) => s.gender === 'male').length;
  const femaleCount = students.filter((s) => s.gender === 'female').length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      {/* Total Students */}
      <div className="bg-[#0f172a] rounded-xl p-4 border border-[#1e293b] shadow-md flex items-center justify-between hover:border-slate-700 transition-colors">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.totalEnrolled}</p>
          <p className="text-2xl font-bold text-white mt-1 font-mono">{total}</p>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
            <span>♂ {maleCount} {t.maleLabel}</span>
            <span>&bull;</span>
            <span>♀ {femaleCount} {t.femaleLabel}</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
          <Users className="w-5 h-5" />
        </div>
      </div>

      {/* Collected Today */}
      <div className="bg-[#0f172a] rounded-xl p-4 border border-[#1e293b] shadow-md flex items-center justify-between hover:border-slate-700 transition-colors">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.todayIntake}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold text-emerald-400 font-mono">{todayCount}</p>
            {todayCount > 0 && (
              <span className="inline-flex items-center text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                {t.todayBadge}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-mono">{formatDisplayDate(todayStr, language)}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
          <CalendarCheck2 className="w-5 h-5" />
        </div>
      </div>

      {/* Collected This Month */}
      <div className="bg-[#0f172a] rounded-xl p-4 border border-[#1e293b] shadow-md flex items-center justify-between hover:border-slate-700 transition-colors">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.thisMonth}</p>
          <p className="text-2xl font-bold text-indigo-400 mt-1 font-mono">{thisMonthCount}</p>
          <p className="text-xs text-slate-500 mt-0.5">{t.currentCycle}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
          <TrendingUp className="w-5 h-5" />
        </div>
      </div>

      {/* Parents Phone Coverage */}
      <div className="bg-[#0f172a] rounded-xl p-4 border border-[#1e293b] shadow-md flex items-center justify-between hover:border-slate-700 transition-colors">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.parentsContact}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold text-amber-400 font-mono">{parentPhonePercentage}%</p>
            <span className="text-xs text-slate-400 font-mono">({parentPhoneCount}/{total})</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{t.withParentsPhone}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
          <PhoneCall className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
