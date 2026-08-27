import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { StatsBanner } from './components/StatsBanner';
import { StudentForm } from './components/StudentForm';
import { StudentTable } from './components/StudentTable';
import { StudentDetailsModal } from './components/StudentDetailsModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { NotificationToast, ToastMessage } from './components/NotificationToast';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { GoogleSheetsBar } from './components/GoogleSheetsBar';
import { StudentService } from './services/api';
import { Student, StudentFormData } from './types';
import { Shield, BookOpen } from 'lucide-react';
import { User } from 'firebase/auth';
import { initAuth, getAccessToken } from './services/firebaseAuth';
import {
  appendStudentToSpreadsheet,
  syncAllStudentsToSpreadsheet,
  ParsedSheetStudent,
} from './services/googleSheets';

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Google Sheets state
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState<boolean>(false);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [activeSpreadsheetId, setActiveSpreadsheetId] = useState<string | null>(() => {
    return localStorage.getItem('google_sheets_active_id');
  });
  const [activeSpreadsheetUrl, setActiveSpreadsheetUrl] = useState<string | null>(() => {
    return localStorage.getItem('google_sheets_active_url');
  });
  const [activeSpreadsheetTitle, setActiveSpreadsheetTitle] = useState<string | null>(() => {
    return localStorage.getItem('google_sheets_active_title');
  });
  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(() => {
    return localStorage.getItem('google_sheets_auto_sync') === 'true';
  });
  const [isQuickExporting, setIsQuickExporting] = useState<boolean>(false);

  // Toast Helper
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newToast: ToastMessage = { id, type, message };
    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss after 4.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, _token) => {
        setAuthUser(user);
      },
      () => {
        setAuthUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Update active spreadsheet in localStorage
  const handleSpreadsheetChange = (id: string | null, url: string | null, title: string | null) => {
    setActiveSpreadsheetId(id);
    setActiveSpreadsheetUrl(url);
    setActiveSpreadsheetTitle(title);
    if (id) {
      localStorage.setItem('google_sheets_active_id', id);
      if (url) localStorage.setItem('google_sheets_active_url', url);
      if (title) localStorage.setItem('google_sheets_active_title', title);
    } else {
      localStorage.removeItem('google_sheets_active_id');
      localStorage.removeItem('google_sheets_active_url');
      localStorage.removeItem('google_sheets_active_title');
    }
  };

  const handleToggleAutoSync = (enabled: boolean) => {
    setAutoSyncEnabled(enabled);
    localStorage.setItem('google_sheets_auto_sync', enabled ? 'true' : 'false');
    showToast(
      enabled
        ? 'Real-Time Google Sheets Auto-Sync Enabled'
        : 'Google Sheets Auto-Sync Disabled',
      'info'
    );
  };

  // Load students from database
  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await StudentService.getAll();
      setStudents(data);
    } catch (err) {
      console.error('Failed to load students:', err);
      showToast('Unable to connect to registry server. Using offline local records.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Quick Export to active Google Sheet
  const handleQuickExport = async () => {
    if (!activeSpreadsheetId) {
      setIsSheetsModalOpen(true);
      return;
    }

    const token = await getAccessToken();
    if (!token) {
      setIsSheetsModalOpen(true);
      showToast('Please sign in with Google to sync to your spreadsheet.', 'info');
      return;
    }

    setIsQuickExporting(true);
    try {
      await syncAllStudentsToSpreadsheet(
        token,
        activeSpreadsheetId,
        students,
        'overwrite',
        'Student Registry'
      );
      showToast(`Synchronized ${students.length} student records with "${activeSpreadsheetTitle || 'Google Sheet'}"!`, 'success');
    } catch (err: any) {
      console.error('Quick export error:', err);
      showToast(err.message || 'Failed to sync with Google Sheet.', 'error');
    } finally {
      setIsQuickExporting(false);
    }
  };

  // Handle Form Save (Create or Update)
  const handleSaveStudent = async (formData: StudentFormData) => {
    setIsSubmitting(true);
    try {
      if (editingStudent) {
        // Update
        const res = await StudentService.update(editingStudent.id, formData);
        if (res.success) {
          setStudents((prev) =>
            prev.map((s) => (s.id === editingStudent.id ? res.data : s))
          );
          setEditingStudent(null);
          showToast(res.message || 'Student information updated successfully.', 'success');
        }
      } else {
        // Create new
        const res = await StudentService.create(formData);
        if (res.success) {
          const createdStudent = res.data;
          setStudents((prev) => [createdStudent, ...prev]);
          showToast(res.message || 'Student information saved successfully.', 'success');

          // Auto-sync to Google Sheets if enabled
          if (autoSyncEnabled && activeSpreadsheetId) {
            try {
              const token = await getAccessToken();
              if (token) {
                await appendStudentToSpreadsheet(token, activeSpreadsheetId, createdStudent, 'Student Registry');
                showToast(`Auto-synced "${createdStudent.studentName}" to Google Sheets`, 'success');
              }
            } catch (sheetErr) {
              console.warn('Auto-sync to Google Sheets failed:', sheetErr);
            }
          }
        }
      }
    } catch (err: any) {
      showToast(err.message || 'An error occurred while saving student.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Import batch of students from Google Sheets
  const handleImportStudents = async (importedList: ParsedSheetStudent[]): Promise<number> => {
    let successCount = 0;
    for (const item of importedList) {
      try {
        const res = await StudentService.create({
          studentName: item.studentName,
          birthDate: item.birthDate,
          phoneNumber: item.phoneNumber,
          additionalPhoneNumber: item.additionalPhoneNumber || '',
          collectionDate: item.collectionDate,
          department: item.department || '',
          notes: item.notes || '',
        });
        if (res.success) {
          successCount++;
        }
      } catch (e) {
        console.warn('Failed to import student item:', item.studentName, e);
      }
    }

    if (successCount > 0) {
      await loadStudents();
    }
    return successCount;
  };

  // Trigger Edit
  const handleStartEdit = (student: Student) => {
    setEditingStudent(student);
    // Smooth scroll to form
    const formEl = document.getElementById('student-collection-form');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
  };

  // Handle Deletion Confirmation
  const handleDeleteConfirm = async () => {
    if (!deletingStudent) return;
    setIsDeleting(true);
    try {
      const res = await StudentService.delete(deletingStudent.id);
      if (res.success) {
        setStudents((prev) => prev.filter((s) => s.id !== deletingStudent.id));
        showToast(res.message || 'Student record deleted successfully.', 'info');
      }
      setDeletingStudent(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete student.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-[#e2e8f0] flex flex-col font-sans antialiased selection:bg-amber-500 selection:text-black">
      {/* University Header */}
      <Header
        totalStudents={students.length}
        onOpenGoogleSheets={() => setIsSheetsModalOpen(true)}
        isSheetsConnected={!!authUser && !!activeSpreadsheetId}
        sheetsTitle={activeSpreadsheetTitle}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Academic Notice Banner */}
        <div className="mb-6 bg-[#0f172a] rounded-xl p-4 border border-[#1e293b] shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white uppercase tracking-wide">
                Official Student Intake & Record Management
              </p>
              <p className="text-xs text-slate-400">
                All records entered below are validated, formatted, and persistently stored in the institution database.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 self-start sm:self-auto">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>FERPA / Privacy Compliant Storage</span>
          </div>
        </div>

        {/* Google Sheets Engine Banner */}
        <GoogleSheetsBar
          user={authUser}
          activeSpreadsheetId={activeSpreadsheetId}
          activeSpreadsheetUrl={activeSpreadsheetUrl}
          activeSpreadsheetTitle={activeSpreadsheetTitle}
          autoSyncEnabled={autoSyncEnabled}
          totalStudents={students.length}
          onOpenModal={() => setIsSheetsModalOpen(true)}
          onQuickExport={handleQuickExport}
          isExporting={isQuickExporting}
        />

        {/* Statistical Overview */}
        <StatsBanner students={students} />

        {/* Form Component: Student Information Intake */}
        <StudentForm
          editingStudent={editingStudent}
          onSave={handleSaveStudent}
          onCancelEdit={handleCancelEdit}
          isSubmitting={isSubmitting}
        />

        {/* Student Records Table Component */}
        <StudentTable
          students={students}
          onEdit={handleStartEdit}
          onDeleteRequest={(student) => setDeletingStudent(student)}
          onViewDetails={(student) => setViewingStudent(student)}
          onRefresh={loadStudents}
          isLoading={isLoading}
        />
      </main>

      {/* Modals & Dialogs */}
      {/* 1. Student Details Modal */}
      <StudentDetailsModal
        student={viewingStudent}
        onClose={() => setViewingStudent(null)}
        onEdit={(student) => {
          handleStartEdit(student);
        }}
        onDeleteRequest={(student) => {
          setDeletingStudent(student);
        }}
      />

      {/* 2. Delete Confirmation Modal */}
      <DeleteConfirmModal
        student={deletingStudent}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingStudent(null)}
        isDeleting={isDeleting}
      />

      {/* 3. Google Sheets Integration Modal */}
      <GoogleSheetsModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        students={students}
        onImportStudents={handleImportStudents}
        user={authUser}
        onAuthChange={(user) => {
          setAuthUser(user);
        }}
        activeSpreadsheetId={activeSpreadsheetId}
        activeSpreadsheetUrl={activeSpreadsheetUrl}
        activeSpreadsheetTitle={activeSpreadsheetTitle}
        onSpreadsheetChange={handleSpreadsheetChange}
        autoSyncEnabled={autoSyncEnabled}
        onToggleAutoSync={handleToggleAutoSync}
        onShowToast={showToast}
      />

      {/* 4. Floating Notification Toasts */}
      <NotificationToast toasts={toasts} onDismiss={dismissToast} />

      {/* University Footer */}
      <footer className="bg-[#07090d] border-t border-[#1e293b] text-slate-500 text-xs py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            &copy; 2026 University Administrative Portal &bull; Department of Academic Affairs & Admissions.
          </p>
          <div className="flex items-center space-x-4">
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Privacy Policy</span>
            <span>&bull;</span>
            <span className="hover:text-slate-300 transition-colors cursor-pointer">FERPA Statement</span>
            <span>&bull;</span>
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Google Sheets Integration</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

