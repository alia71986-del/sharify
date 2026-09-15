import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit3,
  Trash2,
  Eye,
  Download,
  Calendar,
  Users,
  Copy,
  Check,
  Receipt,
  RefreshCw,
  MapPin,
  Users2,
} from 'lucide-react';
import { Student, SortField, SortOrder, IRAQ_PROVINCES, Language } from '../types';
import {
  formatDisplayDate,
  calculateAge,
  detectCarrier,
  getTodayDateString,
} from '../utils/validation';
import { translations } from '../utils/translations';

interface StudentTableProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDeleteRequest: (student: Student) => void;
  onViewDetails: (student: Student) => void;
  onRefresh: () => void;
  isLoading: boolean;
  language: Language;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  onEdit,
  onDeleteRequest,
  onViewDetails,
  onRefresh,
  isLoading,
  language,
}) => {
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'this_week' | 'this_month' | 'custom'>('all');
  const [provinceFilter, setProvinceFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [customDate, setCustomDate] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const todayStr = getTodayDateString();

  // Copy phone number helper
  const handleCopyPhone = (phone: string, id: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Toggle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    let result = [...students];

    // 1. Search Query (Student Name, Phone, Parents Phone, Province, Receipt No)
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((student) => {
        const nameMatch = student.studentName.toLowerCase().includes(q);
        const phoneMatch = student.phoneNumber.replace(/[\s\-\(\)]/g, '').includes(q);
        const parentPhone = student.parentPhoneNumber || student.additionalPhoneNumber;
        const parentPhoneMatch =
          parentPhone && parentPhone.replace(/[\s\-\(\)]/g, '').includes(q);
        const provMatch = student.province && student.province.toLowerCase().includes(q);
        const residenceMatch =
          student.residenceDetails && student.residenceDetails.toLowerCase().includes(q);
        const receiptMatch =
          (student.receiptNo && student.receiptNo.toLowerCase().includes(q)) ||
          (student.notes && student.notes.toLowerCase().includes(q));
        return nameMatch || phoneMatch || parentPhoneMatch || provMatch || residenceMatch || receiptMatch;
      });
    }

    // 2. Province Filter
    if (provinceFilter !== 'all') {
      result = result.filter(
        (s) => s.province && s.province.toLowerCase() === provinceFilter.toLowerCase()
      );
    }

    // 3. Gender Filter
    if (genderFilter !== 'all') {
      result = result.filter((s) => s.gender === genderFilter);
    }

    // 4. Collection Date Filter
    if (dateFilter === 'today') {
      result = result.filter((s) => s.collectionDate === todayStr);
    } else if (dateFilter === 'this_week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split('T')[0];
      result = result.filter((s) => s.collectionDate >= weekAgoStr);
    } else if (dateFilter === 'this_month') {
      const monthPrefix = todayStr.slice(0, 7);
      result = result.filter((s) => s.collectionDate?.startsWith(monthPrefix));
    } else if (dateFilter === 'custom' && customDate) {
      result = result.filter((s) => s.collectionDate === customDate);
    }

    // 5. Sorting
    result.sort((a, b) => {
      let valA: string = (a[sortField] as string) || '';
      let valB: string = (b[sortField] as string) || '';

      valA = valA.toLowerCase();
      valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [
    students,
    searchQuery,
    provinceFilter,
    genderFilter,
    dateFilter,
    customDate,
    sortField,
    sortOrder,
    todayStr,
  ]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredStudents.length === 0) return;

    const headers = [
      'ID',
      'Student Full Name',
      'Gender',
      'Birth Date',
      'Primary Phone Number',
      'Parents Phone Number',
      'Province (Iraq)',
      'Residence Details',
      'Collection Date',
      'Receipt No.',
      'Record Created At',
    ];

    const rows = filteredStudents.map((s) => [
      `"${s.id}"`,
      `"${s.studentName.replace(/"/g, '""')}"`,
      `"${s.gender || 'male'}"`,
      `"${s.birthDate}"`,
      `"${s.phoneNumber}"`,
      `"${(s.parentPhoneNumber || s.additionalPhoneNumber || '').replace(/"/g, '""')}"`,
      `"${(s.province || 'Al-Najaf').replace(/"/g, '""')}"`,
      `"${(s.residenceDetails || '').replace(/"/g, '""')}"`,
      `"${s.collectionDate}"`,
      `"${(s.receiptNo || s.notes || '').replace(/"/g, '""')}"`,
      `"${s.createdAt}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `student_registry_${getTodayDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-500 opacity-60" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-amber-400" />
    ) : (
      <ArrowDown className="w-3 h-3 text-amber-400" />
    );
  };

  return (
    <section className="bg-[#0f172a] rounded-2xl border border-[#1e293b] shadow-xl overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-[#1e293b] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              {t.directoryTitle}
            </h3>
            <p className="text-xs text-slate-400">{t.directorySubtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="refresh-database-btn"
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 rounded-xl border border-[#334155] bg-transparent hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
              title={t.refreshBtn}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>

            <button
              type="button"
              id="export-csv-btn"
              onClick={handleExportCSV}
              disabled={filteredStudents.length === 0}
              className="px-3.5 py-2 rounded-xl bg-[#0a0c10] hover:bg-slate-800 border border-[#334155] text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.exportCsvBtn}</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Filter Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="table-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-2 rounded-xl bg-[#0a0c10] border border-[#1e293b] focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 text-white placeholder-slate-500 text-xs transition-colors outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                {t.clearSearch}
              </button>
            )}
          </div>

          {/* Iraqi Province Filter */}
          <div className="relative">
            <select
              id="province-filter-select"
              value={provinceFilter}
              onChange={(e) => setProvinceFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0a0c10] border border-[#1e293b] focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 text-white text-xs transition-colors outline-none cursor-pointer"
            >
              <option value="all">{t.filterProvinceAll}</option>
              {IRAQ_PROVINCES.map((prov) => (
                <option key={prov.id} value={prov.nameEn}>
                  {language === 'ar' ? `${prov.nameAr}` : `${prov.nameEn} (${prov.nameAr})`}
                </option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <div className="relative">
            <select
              id="gender-filter-select"
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0a0c10] border border-[#1e293b] focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 text-white text-xs transition-colors outline-none cursor-pointer"
            >
              <option value="all">{t.filterGenderAll}</option>
              <option value="male">{t.genderMale}</option>
              <option value="female">{t.genderFemale}</option>
            </select>
          </div>

          {/* Collection Date Filter */}
          <div className="relative">
            <select
              id="date-filter-select"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-[#0a0c10] border border-[#1e293b] focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 text-white text-xs transition-colors outline-none cursor-pointer"
            >
              <option value="all">{t.filterDateAll}</option>
              <option value="today">{t.filterDateToday}</option>
              <option value="this_week">{t.filterDateWeek}</option>
              <option value="this_month">{t.filterDateMonth}</option>
              <option value="custom">{t.filterDateCustom}</option>
            </select>
          </div>
        </div>

        {/* Custom date picker if custom is selected */}
        {dateFilter === 'custom' && (
          <div className="flex items-center gap-2 pt-2 animate-in fade-in">
            <span className="text-xs text-slate-400 font-medium">{language === 'ar' ? 'حدد التاريخ:' : 'Select exact date:'}</span>
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[#0a0c10] border border-[#1e293b] text-white text-xs outline-none font-mono"
            />
          </div>
        )}
      </div>

      {/* Directory Table Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left rtl:text-right border-collapse">
          <thead>
            <tr className="bg-[#0a0c10] text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#1e293b]">
              <th
                onClick={() => handleSort('studentName')}
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>{t.colStudentName}</span>
                  {renderSortIcon('studentName')}
                </div>
              </th>
              <th
                onClick={() => handleSort('province')}
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>{t.colPlaceOfLiving}</span>
                  {renderSortIcon('province')}
                </div>
              </th>
              <th
                onClick={() => handleSort('birthDate')}
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>{t.colDOB}</span>
                  {renderSortIcon('birthDate')}
                </div>
              </th>
              <th className="py-3 px-4">{t.colStudentPhone}</th>
              <th className="py-3 px-4">{t.colParentsPhone}</th>
              <th
                onClick={() => handleSort('receiptNo')}
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>{t.colReceiptNo}</span>
                  {renderSortIcon('receiptNo')}
                </div>
              </th>
              <th
                onClick={() => handleSort('collectionDate')}
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>{t.colCollected}</span>
                  {renderSortIcon('collectionDate')}
                </div>
              </th>
              <th className="py-3 px-4 text-center">{t.colActions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e293b] text-xs">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  <div className="max-w-sm mx-auto space-y-2">
                    <p className="text-sm font-semibold text-slate-400">
                      {t.noRecordsFound}
                    </p>
                    <p className="text-xs text-slate-500">
                      {t.noRecordsFoundDesc}
                    </p>
                    {(searchQuery || provinceFilter !== 'all' || genderFilter !== 'all' || dateFilter !== 'all') && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setProvinceFilter('all');
                          setGenderFilter('all');
                          setDateFilter('all');
                          setCustomDate('');
                        }}
                        className="mt-2 inline-flex items-center px-3 py-1.5 rounded-lg bg-[#1e293b] hover:bg-slate-700 text-amber-400 text-xs font-semibold cursor-pointer transition-colors"
                      >
                        {t.clearSearchAndFilters}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => {
                const age = calculateAge(student.birthDate);
                const isToday = student.collectionDate === todayStr;
                const primaryCarrier = detectCarrier(student.phoneNumber, language);
                const parentPhone = student.parentPhoneNumber || student.additionalPhoneNumber;
                const parentCarrier = detectCarrier(parentPhone, language);
                const receiptText = student.receiptNo || student.notes;

                return (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* 1. Student Full Name + Gender Badge */}
                    <td className="py-3.5 px-4 font-medium text-white">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 hover:text-amber-400 transition-colors cursor-pointer" onClick={() => onViewDetails(student)}>
                          {student.studentName}
                        </span>
                        {student.gender && (
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${
                              student.gender === 'male'
                                ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            }`}
                          >
                            {student.gender === 'male' ? '♂' : '♀'}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                        ID: {student.id}
                      </span>
                    </td>

                    {/* 2. Place of Living (Province + Details) */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-300">
                          <MapPin className="w-3 h-3 text-amber-400 flex-shrink-0" />
                          {student.province || 'Al-Najaf'}
                        </span>
                        {student.residenceDetails && (
                          <p className="text-[11px] text-slate-400 truncate max-w-[170px]" title={student.residenceDetails}>
                            {student.residenceDetails}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* 3. Birth Date + Age */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="font-mono text-slate-200">{formatDisplayDate(student.birthDate, language)}</p>
                      {age !== null && (
                        <span className="text-[11px] text-slate-400">
                          {age} {t.ageYearsOld}
                        </span>
                      )}
                    </td>

                    {/* 4. Primary Phone Number */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`tel:${student.phoneNumber}`}
                          dir="ltr"
                          className="font-mono text-amber-400 font-bold hover:underline"
                        >
                          {student.phoneNumber}
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopyPhone(student.phoneNumber, `${student.id}-primary`)}
                          className="text-slate-500 hover:text-slate-200 transition-colors cursor-pointer p-0.5"
                          title="Copy phone"
                        >
                          {copiedId === `${student.id}-primary` ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      {primaryCarrier && (
                        <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border inline-block mt-0.5 ${primaryCarrier.badgeColor}`}>
                          {primaryCarrier.name}
                        </span>
                      )}
                    </td>

                    {/* 5. Parents Phone Number */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {parentPhone ? (
                        <div>
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`tel:${parentPhone}`}
                              dir="ltr"
                              className="font-mono text-slate-200 font-semibold hover:underline"
                            >
                              {parentPhone}
                            </a>
                            <button
                              type="button"
                              onClick={() => handleCopyPhone(parentPhone, `${student.id}-parent`)}
                              className="text-slate-500 hover:text-slate-200 transition-colors cursor-pointer p-0.5"
                              title="Copy parents phone"
                            >
                              {copiedId === `${student.id}-parent` ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          {parentCarrier && (
                            <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border inline-block mt-0.5 ${parentCarrier.badgeColor}`}>
                              {parentCarrier.name}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-600 italic">—</span>
                      )}
                    </td>

                    {/* 6. Receipt No. (Replaced Notes) */}
                    <td className="py-3.5 px-4">
                      {receiptText ? (
                        <div className="flex items-center gap-1">
                          <Receipt className="w-3 h-3 text-amber-400 flex-shrink-0" />
                          <span className="font-mono text-amber-300 font-bold text-[11px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {receiptText}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-600 italic">—</span>
                      )}
                    </td>

                    {/* 7. Collection Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-slate-300 font-medium">
                          {formatDisplayDate(student.collectionDate, language)}
                        </span>
                        {isToday && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {t.todayBadge}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 8. Action Buttons */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onViewDetails(student)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                          title="View Profile Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(student)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-700 transition-colors cursor-pointer"
                          title="Edit Student Record"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteRequest(student)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-colors cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Stats Summary */}
      <div className="p-4 bg-[#0a0c10] border-t border-[#1e293b] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
        <p>
          {t.showingRecords}{' '}
          <strong className="text-white font-mono">{filteredStudents.length}</strong> {t.ofTotal}{' '}
          <strong className="text-white font-mono">{students.length}</strong> {t.totalStudentsLabel}
        </p>
        <div className="flex items-center gap-4 text-[11px] text-slate-500">
          <span>{t.recordsAutoPersisted}</span>
        </div>
      </div>
    </section>
  );
};
