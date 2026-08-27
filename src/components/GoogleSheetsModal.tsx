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
import { Student } from '../types';

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
}) => {
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
        onShowToast(`Connected to Google account (${res.user.email})`, 'success');
        // Load files
        const files = await listUserSpreadsheets(res.accessToken);
        setDriveFiles(files);
      }
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      onShowToast(err.message || 'Failed to sign in with Google.', 'error');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      onAuthChange(null, null);
      setDriveFiles([]);
      onShowToast('Disconnected from Google account.', 'info');
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
      onShowToast(`Created Google Sheet: "${newSheetTitle.trim()}" with ${students.length} student records!`, 'success');
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
    onShowToast(`Selected spreadsheet "${file.name}"`, 'info');
  };

  const handleExecuteExport = async () => {
    if (!activeSpreadsheetId) {
      onShowToast('Please create or select a Google Spreadsheet first.', 'error');
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
        exportMode,
        'Student Registry'
      );
      onShowToast(
        `Successfully exported ${result.rowCount} student records to "${activeSpreadsheetTitle || 'Google Sheet'}" (${exportMode === 'overwrite' ? 'Overwritten' : 'Appended'})!`,
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
      onShowToast('Please create or select a Google Spreadsheet first.', 'error');
      return;
    }

    const token = await getAccessToken();
    if (!token) {
      handleSignIn();
      return;
    }

    setIsImporting(true);
    try {
      const parsed = await readStudentsFromSpreadsheet(token, activeSpreadsheetId, 'Student Registry');
      if (parsed.length === 0) {
        // Try fallback to Sheet1
        const fallback = await readStudentsFromSpreadsheet(token, activeSpreadsheetId, 'Sheet1');
        setPreviewStudents(fallback);
      } else {
        setPreviewStudents(parsed);
      }
    } catch (err: any) {
      console.error('Import preview error:', err);
      onShowToast(err.message || 'Failed to read data from Google Sheet.', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!previewStudents || previewStudents.length === 0) return;
    setIsImporting(true);
    try {
      const importedCount = await onImportStudents(previewStudents);
      onShowToast(`Successfully imported ${importedCount} student records from Google Sheets!`, 'success');
      setPreviewStudents(null);
      onClose();
    } catch (err: any) {
      console.error('Import error:', err);
      onShowToast(err.message || 'Failed to import student records.', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-[#0f172a] w-full max-w-2xl rounded-2xl shadow-2xl border border-[#1e293b] overflow-hidden transform transition-all text-[#e2e8f0]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#0a0c10] px-6 py-4 flex items-center justify-between border-b border-[#1e293b]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold shadow-md shadow-emerald-950/40">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Google Sheets Integration
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                  Cloud Sync
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Sync, export, and import student records directly with Google Sheets.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#1e293b] bg-[#0a0c10]/70 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('manage')}
            className={`pb-3 px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'manage'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            Spreadsheet Setup
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`pb-3 px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'export'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            Export to Sheet ({students.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`pb-3 px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'import'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4" />
            Import from Sheet
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Google Auth Status Section */}
          <div className="p-4 rounded-xl border border-[#1e293b] bg-[#0a0c10]">
            {!user ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-white">Connect Your Google Account</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Sign in to access your Google Drive spreadsheets and sync student records.
                  </p>
                </div>
                {/* Official Sign in with Google Button Style */}
                <button
                  type="button"
                  id="google-signin-btn"
                  onClick={handleSignIn}
                  disabled={isAuthenticating}
                  className="px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-medium text-xs flex items-center gap-2.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>{isAuthenticating ? 'Signing in...' : 'Sign in with Google'}</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full border border-emerald-500/40"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center">
                      {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white">{user.displayName || 'Google User'}</p>
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md font-semibold">
                        Authenticated
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">{user.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-3 py-1.5 rounded-lg border border-[#334155] text-slate-400 hover:text-rose-400 hover:border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Disconnect
                </button>
              </div>
            )}
          </div>

          {/* TAB 1: SPREADSHEET SETUP */}
          {activeTab === 'manage' && (
            <div className="space-y-6">
              {/* Active Linked Spreadsheet Banner */}
              {activeSpreadsheetId ? (
                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active Google Sheet
                    </span>
                    <a
                      href={activeSpreadsheetUrl || `https://docs.google.com/spreadsheets/d/${activeSpreadsheetId}/edit`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 hover:underline"
                    >
                      Open in Google Sheets
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{activeSpreadsheetTitle || 'Student Registry Spreadsheet'}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">ID: {activeSpreadsheetId}</p>
                  </div>

                  {/* Auto Sync Toggle */}
                  <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-200">Real-Time Intake Auto-Sync</p>
                      <p className="text-[11px] text-slate-400">
                        Automatically append newly submitted student forms to this Google Sheet.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleAutoSync(!autoSyncEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        autoSyncEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          autoSyncEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs text-amber-300 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p>
                    No active Google Spreadsheet is linked yet. Create a new one below or select an existing sheet from your Google Drive.
                  </p>
                </div>
              )}

              {/* Option 1: Create New Sheet */}
              <div className="p-4 rounded-xl border border-[#1e293b] bg-[#0a0c10] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  Create New Student Registry Spreadsheet
                </h4>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newSheetTitle}
                    onChange={(e) => setNewSheetTitle(e.target.value)}
                    placeholder="Spreadsheet Title..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-[#0f172a] border border-[#334155] text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCreateNewSpreadsheet}
                    disabled={isCreatingSheet || !user}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isCreatingSheet ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Create & Initialize Sheet
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Creates a formatted Google Sheet in your Google Drive with header styling and populates it with all {students.length} current student records.
                </p>
              </div>

              {/* Option 2: Pick Existing from Drive */}
              <div className="p-4 rounded-xl border border-[#1e293b] bg-[#0a0c10] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <FolderOpen className="w-3.5 h-3.5 text-emerald-400" />
                    Select from Your Google Drive
                  </h4>
                  <button
                    type="button"
                    onClick={loadDriveFiles}
                    disabled={isLoadingFiles || !user}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>

                {!user ? (
                  <p className="text-xs text-slate-500 italic">Sign in above to browse your Google Drive spreadsheets.</p>
                ) : isLoadingFiles ? (
                  <div className="py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                    Loading spreadsheets from Drive...
                  </div>
                ) : driveFiles.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No spreadsheets found in your Google Drive.</p>
                ) : (
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {driveFiles.map((file) => (
                      <div
                        key={file.id}
                        onClick={() => handleSelectSpreadsheet(file)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                          activeSpreadsheetId === file.id
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                            : 'bg-[#0f172a] border-[#1e293b] hover:border-slate-600 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileSpreadsheet className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <div className="truncate">
                            <p className="text-xs font-semibold truncate">{file.name}</p>
                            {file.modifiedTime && (
                              <p className="text-[10px] text-slate-500">
                                Modified: {new Date(file.modifiedTime).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        {activeSpreadsheetId === file.id && (
                          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: EXPORT TO GOOGLE SHEETS */}
          {activeTab === 'export' && (
            <div className="space-y-5">
              {!activeSpreadsheetId ? (
                <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs text-amber-300">
                  Please link or create a Google Spreadsheet in the <strong>Spreadsheet Setup</strong> tab first before exporting.
                </div>
              ) : (
                <>
                  <div className="p-3.5 rounded-xl border border-[#1e293b] bg-[#0a0c10] text-xs space-y-1">
                    <p className="text-slate-400">Target Spreadsheet:</p>
                    <p className="text-sm font-bold text-white">{activeSpreadsheetTitle}</p>
                    <p className="text-slate-500 font-mono text-[11px] truncate">ID: {activeSpreadsheetId}</p>
                  </div>

                  {/* Mode Selection */}
                  <div className="space-y-2">
                    <label className="block text-xs uppercase font-bold tracking-wider text-slate-400">
                      Export Mode
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div
                        onClick={() => setExportMode('overwrite')}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          exportMode === 'overwrite'
                            ? 'bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/30'
                            : 'bg-[#0a0c10] border-[#1e293b] hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold text-xs text-white">
                          <Radio className={`w-3.5 h-3.5 ${exportMode === 'overwrite' ? 'text-amber-400' : 'text-slate-500'}`} />
                          Overwrite & Refresh Sheet
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Replaces all rows in the sheet with the current {students.length} registry records.
                        </p>
                      </div>

                      <div
                        onClick={() => setExportMode('append')}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          exportMode === 'append'
                            ? 'bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/30'
                            : 'bg-[#0a0c10] border-[#1e293b] hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold text-xs text-white">
                          <Radio className={`w-3.5 h-3.5 ${exportMode === 'append' ? 'text-emerald-400' : 'text-slate-500'}`} />
                          Append Rows
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Adds {students.length} records to the end of the existing spreadsheet without clearing.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Confirmation Modal Section for Destructive Overwrite */}
                  {showExportConfirm ? (
                    <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-500/10 space-y-3">
                      <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                        <AlertCircle className="w-4 h-4" />
                        Confirm Overwrite Google Sheet Data
                      </div>
                      <p className="text-xs text-slate-300">
                        Are you sure you want to overwrite all data in <strong>"{activeSpreadsheetTitle}"</strong> with {students.length} student records? Existing sheet contents will be replaced.
                      </p>
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setShowExportConfirm(false)}
                          className="px-3 py-1.5 rounded-lg border border-[#334155] text-slate-300 text-xs font-semibold hover:bg-slate-800 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleExecuteExport}
                          disabled={isExporting}
                          className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                        >
                          {isExporting ? 'Exporting...' : 'Yes, Overwrite & Sync'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (exportMode === 'overwrite') {
                          setShowExportConfirm(true);
                        } else {
                          handleExecuteExport();
                        }
                      }}
                      disabled={isExporting || students.length === 0}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isExporting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Syncing with Google Sheets...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Export {students.length} Records to Google Sheets
                        </>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB 3: IMPORT FROM GOOGLE SHEETS */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              {!activeSpreadsheetId ? (
                <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs text-amber-300">
                  Please link or select a Google Spreadsheet in the <strong>Spreadsheet Setup</strong> tab first before importing.
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-[#1e293b] bg-[#0a0c10]">
                    <div>
                      <p className="text-xs text-slate-400">Source Sheet: <strong className="text-white">{activeSpreadsheetTitle}</strong></p>
                      <p className="text-[11px] text-slate-500">Reads rows and converts them into student registry records.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleFetchImportPreview}
                      disabled={isImporting}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isImporting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Reading Sheet...
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          Fetch Rows
                        </>
                      )}
                    </button>
                  </div>

                  {/* Preview of Imported Records */}
                  {previewStudents && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
                          Parsed Records ({previewStudents.length} Found)
                        </p>
                        <button
                          type="button"
                          onClick={handleConfirmImport}
                          disabled={isImporting || previewStudents.length === 0}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          Import All ({previewStudents.length}) Into Registry
                        </button>
                      </div>

                      {previewStudents.length === 0 ? (
                        <div className="p-4 rounded-xl border border-[#1e293b] bg-[#0a0c10] text-center text-xs text-slate-500">
                          No valid student rows found in the selected sheet.
                        </div>
                      ) : (
                        <div className="max-h-60 overflow-y-auto border border-[#1e293b] rounded-xl overflow-hidden">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-[#0a0c10] text-slate-400 uppercase text-[10px] border-b border-[#1e293b]">
                              <tr>
                                <th className="p-2.5">Student Name</th>
                                <th className="p-2.5">Birth Date</th>
                                <th className="p-2.5">Phone Number</th>
                                <th className="p-2.5">Collection Date</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#1e293b] bg-[#0f172a]">
                              {previewStudents.slice(0, 15).map((s, idx) => (
                                <tr key={idx} className="hover:bg-slate-800/40">
                                  <td className="p-2.5 font-semibold text-white">{s.studentName}</td>
                                  <td className="p-2.5 font-mono text-slate-300">{s.birthDate}</td>
                                  <td className="p-2.5 font-mono text-amber-400">{s.phoneNumber}</td>
                                  <td className="p-2.5 font-mono text-slate-400">{s.collectionDate}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {previewStudents.length > 15 && (
                            <div className="p-2 text-center text-[10px] text-slate-500 bg-[#0a0c10]">
                              Showing first 15 of {previewStudents.length} records.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#0a0c10] border-t border-[#1e293b] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Google Sheets v4 & Drive API v3</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#334155] text-slate-300 hover:bg-slate-800 font-semibold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
