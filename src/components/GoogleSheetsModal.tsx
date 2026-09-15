import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  X,
  Plus,
  RefreshCw,
  ExternalLink,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  LogOut,
  FolderOpen,
  Check,
  Radio,
  FileText,
  MapPin,
  Receipt,
  Users2,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  googleSignIn,
  logout,
  getAccessToken,
} from '../services/firebaseAuth';
import {
  listUserSpreadsheets,
  createStudentSpreadsheet,
  syncAllStudentsToSpreadsheet,
  readStudentsFromSpreadsheet,
  DriveSpreadsheetFile,
  ParsedSheetStudent,
} from '../services/googleSheets';
import { Student, Language } from '../types';
import { translations } from '../utils/translations';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onImportStudents: (imported: ParsedSheetStudent[]) => Promise<number>;
  user: User | null;
  onAuthChange: (user: User | null, token: string | null) => void;
  activeSpreadsheetId: string | null;
  activeSpreadsheetUrl: string | null;
  activeSpreadsheetTitle: string | null;
  onSpreadsheetChange: (id: string | null, url: string | null, title: string | null) => void;
  autoSyncEnabled: boolean;
  onToggleAutoSync: (enabled: boolean) => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
  language: Language;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  students,
  onImportStudents,
  user,
  onAuthChange,
  activeSpreadsheetId,
  activeSpreadsheetUrl,
  activeSpreadsheetTitle,
  onSpreadsheetChange,
  autoSyncEnabled,
  onToggleAutoSync,
  onShowToast,
  language,
}) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'manage' | 'export' | 'import'>('manage');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [driveFiles, setDriveFiles] = useState<DriveSpreadsheetFile[]>([]);
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [newSheetTitle, setNewSheetTitle] = useState('University Students Registry 2026');

  // Export states
  const [exportMode, setExportMode] = useState<'overwrite' | 'append'>('overwrite');
  const [isExporting, setIsExporting] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);

  // Import states
  const [isImporting, setIsImporting] = useState(false);
  const [previewStudents, setPreviewStudents] = useState<ParsedSheetStudent[] | null>(null);

  // Load drive spreadsheets when authenticated
  useEffect(() => {
    if (isOpen && user) {
      loadDriveFiles();
    }
  }, [isOpen, user]);

  const loadDriveFiles = async () => {
    const token = await getAccessToken();
    if (!token) return;
    setIsLoadingFiles(true);
    try {
      const files = await listUserSpreadsheets(token);
      setDriveFiles(files);
    } catch (err: any) {
      console.warn('Failed to list spreadsheets:', err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    try {
      const res = await googleSignIn();
      if (res) {
        onAuthChange(res.user, res.accessToken);
        onShowToast(language === 'ar' ? `تم الاتصال بحساب Google (${res.user.email})` : `Connected to Google account (${res.user.email})`, 'success');
        const files = await listUserSpreadsheets(res.accessToken);
        setDriveFiles(files);
      }
    } catch (err: any) {
      console.warn('Google Sign-In caught:', err);
      onShowToast(err.message || 'Unable to complete Google Sign-In.', 'error');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      onAuthChange(null, null);
      setDriveFiles([]);
      onShowToast(language === 'ar' ? 'تم تسجيل الخروج من Google' : 'Disconnected from Google account.', 'info');
    } catch (err: any) {
      onShowToast(err.message || 'Failed to sign out.', 'error');
    }
  };

  const handleCreateNewSpreadsheet = async () => {
    const token = await getAccessToken();
    if (!token) {
      handleSignIn();
      return;
    }

    setIsCreatingSheet(true);
    try {
      const result = await createStudentSpreadsheet(
        token,
        newSheetTitle.trim() || 'University Students Registry 2026',
        students
      );
      onSpreadsheetChange(result.spreadsheetId, result.spreadsheetUrl, newSheetTitle.trim() || 'University Students Registry 2026');
      onShowToast(
        language === 'ar'
          ? `تم إنشاء جدول Google: "${newSheetTitle.trim()}" مع ${students.length} سجلات!`
          : `Created Google Sheet: "${newSheetTitle.trim()}" with ${students.length} student records!`,
        'success'
      );
      loadDriveFiles();
      setActiveTab('manage');
    } catch (err: any) {
      console.error('Create sheet error:', err);
      onShowToast(err.message || 'Failed to create Google Spreadsheet.', 'error');
    } finally {
      setIsCreatingSheet(false);
    }
  };

  const handleSelectSpreadsheet = (file: DriveSpreadsheetFile) => {
    onSpreadsheetChange(file.id, file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}/edit`, file.name);
    onShowToast(language === 'ar' ? `تم اختيار الجدول "${file.name}"` : `Selected spreadsheet "${file.name}"`, 'info');
  };

  const handleExecuteExport = async () => {
    if (!activeSpreadsheetId) {
      onShowToast(language === 'ar' ? 'يرجى اختيار أو إنشاء جدول Google أولاً' : 'Please create or select a Google Spreadsheet first.', 'error');
      return;
    }

    const token = await getAccessToken();
    if (!token) {
      handleSignIn();
      return;
    }

    setIsExporting(true);
    setShowExportConfirm(false);
    try {
      const result = await syncAllStudentsToSpreadsheet(
        token,
        activeSpreadsheetId,
        students,
        exportMode
      );
      onShowToast(
        language === 'ar'
          ? `تم تصدير ${result.updatedRows} سجلاً بنجاح إلى "${activeSpreadsheetTitle || 'جدول Google'}"!`
          : `Successfully exported ${result.updatedRows} student records to "${activeSpreadsheetTitle || 'Google Sheet'}"!`,
        'success'
      );
    } catch (err: any) {
      console.error('Export error:', err);
      onShowToast(err.message || 'Failed to export to Google Sheets.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFetchImportPreview = async () => {
    if (!activeSpreadsheetId) {
      onShowToast(language === 'ar' ? 'يرجى اختيار جدول Google أولاً' : 'Please create or select a Google Spreadsheet first.', 'error');
      return;
    }

    const token = await getAccessToken();
    if (!token) {
      handleSignIn();
      return;
    }

    setIsImporting(true);
    try {
      const parsed = await readStudentsFromSpreadsheet(token, activeSpreadsheetId);
      setPreviewStudents(parsed);
      if (parsed.length === 0) {
        onShowToast(language === 'ar' ? 'لم يتم العثور على سجلات في هذا الجدول' : 'No student records found in sheet.', 'info');
      }
    } catch (err: any) {
      console.error('Import preview error:', err);
      onShowToast(err.message || 'Failed to read sheet data.', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!previewStudents || previewStudents.length === 0) return;
    setIsImporting(true);
    try {
      const count = await onImportStudents(previewStudents);
      onShowToast(
        language === 'ar'
          ? `تم استيراد ${count} طالباً بنجاح من جدول Google!`
          : `Successfully imported ${count} students from Google Sheet!`,
        'success'
      );
      setPreviewStudents(null);
      onClose();
    } catch (err: any) {
      console.error('Confirm import error:', err);
      onShowToast(err.message || 'Failed to import students.', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-[#0f172a] w-full max-w-3xl rounded-2xl shadow-2xl border border-[#1e293b] overflow-hidden transform transition-all text-[#e2e8f0]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#0a0c10] px-6 py-4 border-b border-[#1e293b] flex items-center justify-between">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {language === 'ar' ? 'مزامنة Google Sheets السحابية' : 'Google Sheets Cloud Integration'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'ar'
                  ? 'الربط المباشر مع Google Drive وتصدير واستيراد بيانات الطلاب'
                  : 'Sync student data, auto-export, and import records with Google Drive'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Status Banner */}
        <div className="px-6 py-3 bg-[#0a0c10]/60 border-b border-[#1e293b] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">{language === 'ar' ? 'حالة الحساب:' : 'Account Status:'}</span>
            {user ? (
              <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {user.email || 'Authenticated'}
              </span>
            ) : (
              <span className="text-slate-500 italic">
                {language === 'ar' ? 'غير متصل بحساب Google' : 'Not Connected'}
              </span>
            )}
          </div>

          <div>
            {user ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="text-slate-400 hover:text-rose-400 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'تسجيل الخروج' : 'Disconnect'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSignIn}
                disabled={isAuthenticating}
                className="px-3 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-900 font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {isAuthenticating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span>{language === 'ar' ? 'تسجيل الدخول باستخدام Google' : 'Connect Google Account'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-[#1e293b] bg-[#0a0c10] text-xs font-bold uppercase tracking-wider">
          <button
            type="button"
            onClick={() => setActiveTab('manage')}
            className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'manage'
                ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>{language === 'ar' ? 'إدارة الجداول' : 'Spreadsheets'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'export'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>{language === 'ar' ? 'تصدير السجلات' : 'Export Records'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'import'
                ? 'border-sky-400 text-sky-400 bg-sky-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>{language === 'ar' ? 'استيراد السجلات' : 'Import Records'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6 text-sm">
          {!user ? (
            <div className="p-8 text-center bg-[#0a0c10] border border-[#1e293b] rounded-2xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="text-base font-bold text-white">
                  {language === 'ar' ? 'يرجى تسجيل الدخول بحساب Google' : 'Google Account Connection Required'}
                </h4>
                <p className="text-xs text-slate-400">
                  {language === 'ar'
                    ? 'قم بتسجيل الدخول للوصول المباشر إلى جداول Google Drive وإنشاء جداول جديدة وحفظ بيانات الطلاب سحابياً.'
                    : 'Connect your Google account to create spreadsheets, auto-sync records, and export to Google Drive securely.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleSignIn}
                disabled={isAuthenticating}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer disabled:opacity-50"
              >
                {isAuthenticating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4" />
                )}
                <span>{language === 'ar' ? 'تسجيل الدخول بحساب Google' : 'Sign in with Google'}</span>
              </button>
            </div>
          ) : (
            <>
              {/* TAB 1: MANAGE SPREADSHEETS */}
              {activeTab === 'manage' && (
                <div className="space-y-6">
                  {/* Create New Sheet */}
                  <div className="p-4 rounded-xl bg-[#0a0c10] border border-[#1e293b] space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-amber-400" />
                      {language === 'ar' ? 'إنشاء جدول Google جديد' : 'Create New Google Spreadsheet'}
                    </h4>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={newSheetTitle}
                        onChange={(e) => setNewSheetTitle(e.target.value)}
                        placeholder="Spreadsheet Title"
                        className="flex-1 px-3.5 py-2 rounded-xl bg-[#0f172a] border border-[#1e293b] focus:border-amber-500 text-white text-xs outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleCreateNewSpreadsheet}
                        disabled={isCreatingSheet || !newSheetTitle.trim()}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isCreatingSheet ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Plus className="w-3.5 h-3.5" />
                        )}
                        <span>{language === 'ar' ? 'إنشاء وربط' : 'Create & Link'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Existing Drive Spreadsheets */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        {language === 'ar' ? 'جداول Google Drive المتوفرة' : 'Drive Spreadsheets'}
                      </h4>
                      <button
                        type="button"
                        onClick={loadDriveFiles}
                        disabled={isLoadingFiles}
                        className="text-xs text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className={`w-3 h-3 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                        <span>{language === 'ar' ? 'تحديث القائمة' : 'Refresh'}</span>
                      </button>
                    </div>

                    {isLoadingFiles ? (
                      <div className="py-8 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                        <span>{language === 'ar' ? 'جاري جلب الملفات من Google Drive...' : 'Loading Google Drive spreadsheets...'}</span>
                      </div>
                    ) : driveFiles.length === 0 ? (
                      <p className="text-xs text-slate-500 p-4 bg-[#0a0c10] border border-[#1e293b] rounded-xl text-center">
                        {language === 'ar' ? 'لم يتم العثور على جداول. يمكنك إنشاء جدول جديد أعلاه.' : 'No spreadsheets found in Drive. Create a new one above.'}
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {driveFiles.map((f) => {
                          const isSelected = activeSpreadsheetId === f.id;
                          return (
                            <div
                              key={f.id}
                              className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                                isSelected
                                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                                  : 'bg-[#0a0c10] border-[#1e293b] text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 truncate">
                                <FileSpreadsheet className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                                <span className="font-semibold text-xs truncate">{f.name}</span>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {f.webViewLink && (
                                  <a
                                    href={f.webViewLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 text-slate-400 hover:text-white"
                                    title="Open in Sheets"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleSelectSpreadsheet(f)}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                                    isSelected
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                      : 'bg-[#1e293b] hover:bg-slate-700 text-white'
                                  }`}
                                >
                                  {isSelected ? (language === 'ar' ? 'الجدول النشط' : 'Active') : (language === 'ar' ? 'اختيار' : 'Select')}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Auto-Sync Toggle */}
                  <div className="p-4 rounded-xl bg-[#0a0c10] border border-[#1e293b] flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        {language === 'ar' ? 'المزامنة التلقائية مع Google Sheets' : 'Auto-Export on New Record'}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {language === 'ar'
                          ? 'تصدير بيانات كل طالب جديد فور حفظه في النظام'
                          : 'Automatically append each student record to the active Google Sheet when saved.'}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoSyncEnabled}
                      onChange={(e) => onToggleAutoSync(e.target.checked)}
                      className="w-5 h-5 accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: EXPORT RECORDS */}
              {activeTab === 'export' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-xl bg-[#0a0c10] border border-[#1e293b] space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      {language === 'ar' ? 'خيارات تصدير السجلات' : 'Export Mode'}
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <label
                        className={`p-3 rounded-xl border cursor-pointer flex flex-col gap-1 transition-colors ${
                          exportMode === 'overwrite'
                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                            : 'bg-[#0f172a] border-[#1e293b] text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold text-white">
                          <input
                            type="radio"
                            name="export-mode"
                            checked={exportMode === 'overwrite'}
                            onChange={() => setExportMode('overwrite')}
                            className="accent-amber-500"
                          />
                          <span>{language === 'ar' ? 'استبدال كامل (Overwrite)' : 'Overwrite Sheet'}</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {language === 'ar'
                            ? 'مسح محتوى الجدول وكتابة جميع الطلاب المسجلين حالياً'
                            : 'Replaces all rows with the full updated database of students.'}
                        </p>
                      </label>

                      <label
                        className={`p-3 rounded-xl border cursor-pointer flex flex-col gap-1 transition-colors ${
                          exportMode === 'append'
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                            : 'bg-[#0f172a] border-[#1e293b] text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold text-white">
                          <input
                            type="radio"
                            name="export-mode"
                            checked={exportMode === 'append'}
                            onChange={() => setExportMode('append')}
                            className="accent-emerald-500"
                          />
                          <span>{language === 'ar' ? 'إضافة إلى النهاية (Append)' : 'Append Rows'}</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {language === 'ar'
                            ? 'إضافة السجلات في نهاية الجدول بدون مسح البيانات السابقة'
                            : 'Adds records to the bottom without erasing existing data.'}
                        </p>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleExecuteExport}
                      disabled={isExporting || !activeSpreadsheetId || students.length === 0}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer disabled:opacity-50"
                    >
                      {isExporting ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      <span>
                        {language === 'ar'
                          ? `تصدير ${students.length} سجلات إلى Google Sheets`
                          : `Export ${students.length} Records to Google Sheets`}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: IMPORT RECORDS */}
              {activeTab === 'import' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400">
                      {language === 'ar'
                        ? 'استيراد الطلاب والبيانات من جدول Google الحالي إلى قاعدة البيانات'
                        : 'Read student records from the active Google Spreadsheet and import.'}
                    </p>
                    <button
                      type="button"
                      onClick={handleFetchImportPreview}
                      disabled={isImporting || !activeSpreadsheetId}
                      className="px-3.5 py-1.5 rounded-xl bg-[#0a0c10] hover:bg-slate-800 border border-[#334155] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isImporting ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      <span>{language === 'ar' ? 'معاينة البيانات' : 'Preview Records'}</span>
                    </button>
                  </div>

                  {previewStudents && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-emerald-400 font-semibold">
                          {language === 'ar'
                            ? `تم العثور على ${previewStudents.length} سجلاً جاهزاً للاستيراد`
                            : `Found ${previewStudents.length} student records ready to import`}
                        </span>
                        <button
                          type="button"
                          onClick={handleConfirmImport}
                          disabled={isImporting || previewStudents.length === 0}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-md"
                        >
                          {language === 'ar' ? 'تأكيد الاستيراد الآن' : 'Confirm Import'}
                        </button>
                      </div>

                      <div className="max-h-48 overflow-y-auto rounded-xl border border-[#1e293b] bg-[#0a0c10] divide-y divide-[#1e293b] text-xs">
                        {previewStudents.slice(0, 10).map((ps, idx) => (
                          <div key={idx} className="p-2.5 flex items-center justify-between text-slate-300">
                            <div>
                              <span className="font-bold text-white">{ps.studentName}</span>
                              <span className="text-slate-500 font-mono text-[11px] block">
                                {ps.phoneNumber} &bull; {ps.province || 'Al-Najaf'}
                              </span>
                            </div>
                            {ps.receiptNo && (
                              <span className="font-mono text-amber-400 text-[11px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                {ps.receiptNo}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#0a0c10] border-t border-[#1e293b] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#334155] text-slate-300 hover:bg-slate-800 font-semibold text-xs transition-colors cursor-pointer"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
