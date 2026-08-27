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
  Building,
  RefreshCw,
} from 'lucide-react';
import { Student, SortField, SortOrder } from '../types';
import {
  formatDisplayDate,
  calculateAge,
  detectCarrier,
  getTodayDateString,
} from '../utils/validation';

interface StudentTableProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDeleteRequest: (student: Student) => void;
  onViewDetails: (student: Student) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  onEdit,
  onDeleteRequest,
  onViewDetails,
  onRefresh,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'this_week' | 'this_month' | 'custom'>('all');
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

    // 1. Search Query (Student Name or Phone Number)
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((student) => {
        const nameMatch = student.studentName.toLowerCase().includes(q);
        const phoneMatch = student.phoneNumber.replace(/[\s\-\(\)]/g, '').includes(q);
        const additionalPhoneMatch =
          student.additionalPhoneNumber &&
          student.additionalPhoneNumber.replace(/[\s\-\(\)]/g, '').includes(q);
        const deptMatch = student.department && student.department.toLowerCase().includes(q);
        return nameMatch || phoneMatch || additionalPhoneMatch || deptMatch;
      });
    }

    // 2. Collection Date Filter
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

    // 3. Sorting
    result.sort((a, b) => {
      let valA: string = a[sortField] || '';
      let valB: string = b[sortField] || '';

      valA = valA.toLowerCase();
      valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [students, searchQuery, dateFilter, customDate, sortField, sortOrder, todayStr]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredStudents.length === 0) return;

    const headers = [
      'ID',
      'Student Name',
      'Birth Date',
      'Age',
      'Primary Phone Number',
      'Additional Phone Number',
      'Collection Date',
      'Department',
      'Notes',
      'Created At',
    ];

    const rows = filteredStudents.map((s) => [
      s.id,
      `"${s.studentName.replace(/"/g, '""')}"`,
      s.birthDate,
      calculateAge(s.birthDate) || '',
      `"${s.phoneNumber}"`,
      `"${s.additionalPhoneNumber || ''}"`,
      s.collectionDate,
      `"${s.department || ''}"`,
      `"${(s.notes || '').replace(/"/g, '""')}"`,
      s.createdAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Student_Registry_${getTodayDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] shadow-xl overflow-hidden">
      {/* Table Header Section & Filter Toolbar */}
      <div className="p-6 border-b border-[#1e293b] bg-[#0f172a]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight uppercase">
                Student Directory <span className="text-amber-500">//</span> Database View
              </h3>
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                {filteredStudents.length} {filteredStudents.length === 1 ? 'Record' : 'Records'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Search, filter by collection date, view student profiles, and update administrative records.
            </p>
          </div>

          {/* Quick Actions (Export & Refresh) */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              id="refresh-records-btn"
              onClick={onRefresh}
              className="p-2.5 rounded-xl border border-[#334155] bg-[#1e293b] hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Refresh records from database"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
            <button
              type="button"
              id="export-csv-btn"
              onClick={handleExportCSV}
              disabled={filteredStudents.length === 0}
              className="px-3.5 py-2.5 rounded-xl border border-[#334155] bg-[#1e293b] hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 mt-4 pt-4 border-t border-[#1e293b]">
          {/* Search Box */}
          <div className="lg:col-span-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="search-students-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, phone, or department..."
              className="block w-full pl-10 pr-4 py-2.5 text-sm text-[#e2e8f0] bg-[#0a0c10] rounded-xl border border-[#334155] focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 placeholder:text-slate-600 transition-colors outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-white font-medium cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Collection Date Filter Selector */}
          <div className="lg:col-span-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Filter className="w-3.5 h-3.5" />
              </div>
              <select
                id="collection-date-filter"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="block w-full pl-9 pr-8 py-2.5 text-sm text-[#e2e8f0] bg-[#0a0c10] rounded-xl border border-[#334155] focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-colors font-medium outline-none"
              >
                <option value="all" className="bg-[#0f172a]">Filter: All Dates</option>
                <option value="today" className="bg-[#0f172a]">Collected Today ({todayStr})</option>
                <option value="this_week" className="bg-[#0f172a]">Collected Past 7 Days</option>
                <option value="this_month" className="bg-[#0f172a]">Collected This Month</option>
                <option value="custom" className="bg-[#0f172a]">Specific Date...</option>
              </select>
            </div>
          </div>

          {/* Custom Date Input if 'custom' selected */}
          {dateFilter === 'custom' ? (
            <div className="lg:col-span-3">
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="block w-full px-3 py-2.5 text-sm text-[#e2e8f0] bg-[#0a0c10] rounded-xl border border-amber-500/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 outline-none font-mono"
              />
            </div>
          ) : (
            /* Sort Dropdown */
            <div className="lg:col-span-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
                <select
                  id="sort-students-select"
                  value={`${sortField}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortField(field as SortField);
                    setSortOrder(order as SortOrder);
                  }}
                  className="block w-full pl-9 pr-8 py-2.5 text-sm text-[#e2e8f0] bg-[#0a0c10] rounded-xl border border-[#334155] focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-colors font-medium outline-none"
                >
                  <option value="createdAt-desc" className="bg-[#0f172a]">Sort: Newest Added</option>
                  <option value="studentName-asc" className="bg-[#0f172a]">Sort: Name (A-Z)</option>
                  <option value="studentName-desc" className="bg-[#0f172a]">Sort: Name (Z-A)</option>
                  <option value="birthDate-asc" className="bg-[#0f172a]">Sort: DOB (Oldest)</option>
                  <option value="birthDate-desc" className="bg-[#0f172a]">Sort: DOB (Youngest)</option>
                  <option value="collectionDate-desc" className="bg-[#0f172a]">Sort: Date (Newest)</option>
                  <option value="collectionDate-asc" className="bg-[#0f172a]">Sort: Date (Oldest)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1e293b] bg-[#090e1a] text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {/* Student Name */}
              <th
                scope="col"
                onClick={() => handleSort('studentName')}
                className="py-3.5 px-4 sm:px-6 cursor-pointer hover:text-white transition-colors select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Student Name</span>
                  {sortField === 'studentName' ? (
                    sortOrder === 'asc' ? (
                      <ArrowUp className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <ArrowDown className="w-3.5 h-3.5 text-amber-400" />
                    )
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-slate-600" />
                  )}
                </div>
              </th>

              {/* Birth Date */}
              <th
                scope="col"
                onClick={() => handleSort('birthDate')}
                className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>DOB</span>
                  {sortField === 'birthDate' ? (
                    sortOrder === 'asc' ? (
                      <ArrowUp className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <ArrowDown className="w-3.5 h-3.5 text-amber-400" />
                    )
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-slate-600" />
                  )}
                </div>
              </th>

              {/* Primary Phone */}
              <th scope="col" className="py-3.5 px-4">
                Primary Phone
              </th>

              {/* Additional Phone */}
              <th scope="col" className="py-3.5 px-4">
                Additional Phone
              </th>

              {/* Collection Date */}
              <th
                scope="col"
                onClick={() => handleSort('collectionDate')}
                className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Collected</span>
                  {sortField === 'collectionDate' ? (
                    sortOrder === 'asc' ? (
                      <ArrowUp className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <ArrowDown className="w-3.5 h-3.5 text-amber-400" />
                    )
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-slate-600" />
                  )}
                </div>
              </th>

              {/* Actions */}
              <th scope="col" className="py-3.5 px-4 sm:px-6 text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#1e293b] text-sm">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => {
                const primaryCarrier = detectCarrier(student.phoneNumber);
                const secondaryCarrier = detectCarrier(student.additionalPhoneNumber);
                const age = calculateAge(student.birthDate);
                const isCollectedToday = student.collectionDate === todayStr;

                return (
                  <tr
                    key={student.id}
                    id={`student-row-${student.id}`}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isCollectedToday ? 'bg-amber-500/5' : ''
                    }`}
                  >
                    {/* Student Name */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-600/20 text-amber-400 font-bold text-sm flex items-center justify-center ring-1 ring-amber-500/30 flex-shrink-0">
                          {student.studentName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-white leading-tight">
                            {student.studentName}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {student.department && (
                              <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Building className="w-3 h-3 text-slate-500" />
                                {student.department}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Birth Date */}
                    <td className="py-4 px-4 whitespace-nowrap font-mono">
                      <p className="text-slate-300 font-medium">
                        {formatDisplayDate(student.birthDate)}
                      </p>
                      {age !== null && (
                        <span className="text-xs text-slate-500">
                          {age} yrs
                        </span>
                      )}
                    </td>

                    {/* Primary Phone */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-medium text-slate-200">
                          {student.phoneNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyPhone(student.phoneNumber, student.id)}
                          className="p-1 text-slate-500 hover:text-amber-400 rounded transition-colors cursor-pointer"
                          title="Copy phone number"
                        >
                          {copiedId === student.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      {primaryCarrier && (
                        <span
                          className={`inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded border mt-0.5 ${primaryCarrier.badgeColor}`}
                        >
                          {primaryCarrier.name}
                        </span>
                      )}
                    </td>

                    {/* Additional Phone */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {student.additionalPhoneNumber ? (
                        <>
                          <p className="font-mono text-slate-300">
                            {student.additionalPhoneNumber}
                          </p>
                          {secondaryCarrier && (
                            <span
                              className={`inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded border mt-0.5 ${secondaryCarrier.badgeColor}`}
                            >
                              {secondaryCarrier.name}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-slate-600 italic">None</span>
                      )}
                    </td>

                    {/* Collection Date */}
                    <td className="py-4 px-4 whitespace-nowrap font-mono">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-slate-300">
                          {formatDisplayDate(student.collectionDate)}
                        </span>
                      </div>
                      {isCollectedToday && (
                        <span className="inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Today
                        </span>
                      )}
                    </td>

                    {/* Actions: View Details, Edit, Delete */}
                    <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Details */}
                        <button
                          type="button"
                          id={`view-details-${student.id}`}
                          onClick={() => onViewDetails(student)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                          title="View complete student details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          id={`edit-student-${student.id}`}
                          onClick={() => onEdit(student)}
                          className="p-1.5 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors cursor-pointer text-xs font-semibold"
                          title="Edit student record"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          id={`delete-student-${student.id}`}
                          onClick={() => onDeleteRequest(student)}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer text-xs font-semibold"
                          title="Delete student record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-12 px-4 text-center">
                  <div className="max-w-md mx-auto flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-[#1e293b] text-slate-500 flex items-center justify-center mb-3">
                      <Users className="w-6 h-6" />
                    </div>
                    <p className="text-base font-bold text-white">No Student Records Found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {searchQuery || dateFilter !== 'all'
                        ? 'No records match your search or date filter criteria. Try clearing filters.'
                        : 'No student information has been collected yet. Use the form above to add a student.'}
                    </p>
                    {(searchQuery || dateFilter !== 'all') && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setDateFilter('all');
                          setCustomDate('');
                        }}
                        className="mt-4 px-4 py-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold text-xs hover:bg-amber-500/20 transition-colors cursor-pointer"
                      >
                        Clear Search & Filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer / Summary Count */}
      <div className="px-6 py-3.5 bg-[#090e1a] border-t border-[#1e293b] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
        <p>
          Showing <strong className="text-white font-mono">{filteredStudents.length}</strong> of{' '}
          <strong className="text-white font-mono">{students.length}</strong> total registered students
        </p>
        <p className="text-slate-500">
          Faculty Registrar Database &bull; Records auto-persisted
        </p>
      </div>
    </div>
  );
};
