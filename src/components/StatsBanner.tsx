import React from 'react';
import { Users, CalendarCheck2, PhoneCall, TrendingUp } from 'lucide-react';
import { Student } from '../types';
import { getTodayDateString } from '../utils/validation';

interface StatsBannerProps {
  students: Student[];
}

export const StatsBanner: React.FC<StatsBannerProps> = ({ students }) => {
  const todayStr = getTodayDateString();
  const monthPrefix = todayStr.slice(0, 7);

  const total = students.length;
  const todayCount = students.filter((s) => s.collectionDate === todayStr).length;
  const thisMonthCount = students.filter((s) => s.collectionDate?.startsWith(monthPrefix)).length;
  const dualPhoneCount = students.filter((s) => !!s.additionalPhoneNumber?.trim()).length;
  const dualPhonePercentage = total > 0 ? Math.round((dualPhoneCount / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      {/* Total Students */}
      <div className="bg-[#0f172a] rounded-xl p-4 border border-[#1e293b] shadow-md flex items-center justify-between hover:border-slate-700 transition-colors">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Enrolled</p>
          <p className="text-2xl font-bold text-white mt-1 font-mono">{total}</p>
          <p className="text-xs text-slate-500 mt-0.5">Active Student Profiles</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
          <Users className="w-5 h-5" />
        </div>
      </div>

      {/* Collected Today */}
      <div className="bg-[#0f172a] rounded-xl p-4 border border-[#1e293b] shadow-md flex items-center justify-between hover:border-slate-700 transition-colors">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Collected Today</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold text-emerald-400 font-mono">{todayCount}</p>
            {todayCount > 0 && (
              <span className="inline-flex items-center text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                Active
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-mono">Date: {todayStr}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
          <CalendarCheck2 className="w-5 h-5" />
        </div>
      </div>

      {/* Collected This Month */}
      <div className="bg-[#0f172a] rounded-xl p-4 border border-[#1e293b] shadow-md flex items-center justify-between hover:border-slate-700 transition-colors">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">This Month</p>
          <p className="text-2xl font-bold text-indigo-400 mt-1 font-mono">{thisMonthCount}</p>
          <p className="text-xs text-slate-500 mt-0.5">Intake cycle</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
          <TrendingUp className="w-5 h-5" />
        </div>
      </div>

      {/* Additional Phone Coverage */}
      <div className="bg-[#0f172a] rounded-xl p-4 border border-[#1e293b] shadow-md flex items-center justify-between hover:border-slate-700 transition-colors">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Emergency Contact</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold text-amber-400 font-mono">{dualPhonePercentage}%</p>
            <span className="text-xs text-slate-400 font-mono">({dualPhoneCount}/{total})</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">With Secondary Phone</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
          <PhoneCall className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

