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
import { Student, StudentFormData, Language } from './types';
import { Shield, BookOpen } from 'lucide-react';
import { User } from 'firebase/auth';
import { initAuth, getAccessToken } from './services/firebaseAuth';
import {
  syncAllStudentsToSpreadsheet,
  ParsedSheetStudent,
} from './services/googleSheets';
import { translations } from './utils/translations';

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  // Language state (English / Arabic) with localStorage persistence
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('student_app_lang');
    return saved === 'ar' || saved === 'en' ? saved : 'en';
  });

  const t = translations[language];

  // Sync document direction and html lang tag
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('student_app_lang', language);
  }, [language]);

  const handleToggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

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
        ? (language === 'ar' ? 'تم تفعيل التصدير التلقائي إلى Google Sheets' : 'Real-Time Google Sheets Auto-Sync Enabled')
        : (language === 'ar' ? 'تم تعطيل التصدير التلقائي' : 'Google Sheets Auto-Sync Disabled'),
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
      showToast(
        language === 'ar'
          ? 'تعذر الاتصال بخادم السجلات. جاري استخدام السجلات المحلية.'
          : 'Unable to connect to registry server. Using offline local records.',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  }, [language, showToast]);

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
      showToast(
        language === 'ar'
          ? 'يرجى تسجيل الدخول بحساب Google لمزامنة الجدول.'
          : 'Please sign in with Google to sync to your spreadsheet.',
        'info'
      );
      return;
    }

    setIsQuickExporting(true);
    try {
      await syncAllStudentsToSpreadsheet(
        token,
        activeSpreadsheetId,
        students,
        'overwrite'
      );
      showToast(
        language === 'ar'
          ? `تمت مزامنة ${students.length} سجلاً مع "${activeSpreadsheetTitle || 'Google Sheets'}"!`
          : `Synchronized ${students.length} student records with "${activeSpreadsheetTitle || 'Google Sheet'}"!`,
        'success'
      );
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
          showToast(
            language === 'ar'
              ? 'تم تحديث بيانات الطالب بنجاح.'
              : res.message || 'Student information updated successfully.',
            'success'
          );
        }
      } else {
        // Create new
        const res = await StudentService.create(formData);
        if (res.success) {
          const createdStudent = res.data;
          setStudents((prev) => [createdStudent, ...prev]);
          showToast(
            language === 'ar'
              ? 'تم حفظ بيانات الطالب بنجاح في السجل.'
              : res.message || 'Student information saved successfully.',
            'success'
          );

          // Auto-sync to Google Sheets if enabled
          if (autoSyncEnabled && activeSpreadsheetId) {
            try {
              const token = await getAccessToken();
              if (token) {
                await syncAllStudentsToSpreadsheet(
                  token,
                  activeSpreadsheetId,
                  [createdStudent, ...students],
                  'overwrite'
                );
                showToast(
                  language === 'ar'
                    ? `تم التصدير التلقائي للطالب "${createdStudent.studentName}" إلى Google Sheets`
                    : `Auto-synced "${createdStudent.studentName}" to Google Sheets`,
                  'success'
                );
              }
            } catch (sheetErr) {
              console.warn('Auto-sync to Google Sheets failed:', sheetErr);
            }
          }
        }
      }
    } catch (err: any) {
      showToast(
        language === 'ar'
          ? 'حدث خطأ أثناء حفظ بيانات الطالب.'
          : err.message || 'An error occurred while saving student.',
        'error'
      );
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
          gender: item.gender || 'male',
          birthDate: item.birthDate,
          phoneNumber: item.phoneNumber,
          parentPhoneNumber: item.parentPhoneNumber || item.additionalPhoneNumber || '',
          additionalPhoneNumber: item.parentPhoneNumber || item.additionalPhoneNumber || '',
          province: item.province || 'Al-Najaf',
          residenceDetails: item.residenceDetails || '',
          collectionDate: item.collectionDate,
          receiptNo: item.receiptNo || item.notes || '',
          notes: item.receiptNo || item.notes || '',
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
    const formEl = document.getElementById('student-name-input');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      formEl.focus();
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
        showToast(
          language === 'ar'
            ? `تم حذف سجل الطالب ${deletingStudent.studentName} بنجاح.`
            : res.message || 'Student record deleted successfully.',
          'info'
        );
      }
      setDeletingStudent(null);
    } catch (err: any) {
      showToast(
        language === 'ar' ? 'فشل حذف سجل الطالب.' : err.message || 'Failed to delete student.',
        'error'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#0a0c10] text-[#e2e8f0] flex flex-col font-sans antialiased selection:bg-amber-500 selection:text-black"
    >
      {/* University Header */}
      <Header
        totalStudents={students.length}
        onOpenGoogleSheets={() => setIsSheetsModalOpen(true)}
        isSheetsConnected={!!authUser && !!activeSpreadsheetId}
        sheetsTitle={activeSpreadsheetTitle}
        language={language}
        onToggleLanguage={handleToggleLanguage}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notice Banner */}
        <div className="mb-6 bg-[#0f172a] rounded-xl p-4 border border-[#1e293b] shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white uppercase tracking-wide">
                {t.officialNoticeTitle}
              </p>
              <p className="text-xs text-slate-400">
                {t.officialNoticeDesc}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 self-start sm:self-auto">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.complianceBadge}</span>
          </div>
        </div>

        {/* Google Sheets Integration Bar */}
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
          language={language}
        />

        {/* Statistical Overview */}
        <StatsBanner students={students} language={language} />

        {/* Student Intake Form */}
        <StudentForm
          editingStudent={editingStudent}
          onSave={handleSaveStudent}
          onCancelEdit={handleCancelEdit}
          isSubmitting={isSubmitting}
          language={language}
        />

        {/* Student Records Table */}
        <StudentTable
          students={students}
          onEdit={handleStartEdit}
          onDeleteRequest={(student) => setDeletingStudent(student)}
          onViewDetails={(student) => setViewingStudent(student)}
          onRefresh={loadStudents}
          isLoading={isLoading}
          language={language}
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
        language={language}
      />

      {/* 2. Delete Confirmation Modal */}
      <DeleteConfirmModal
        student={deletingStudent}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingStudent(null)}
        isDeleting={isDeleting}
        language={language}
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
        language={language}
      />

      {/* 4. Floating Notification Toasts */}
      <NotificationToast toasts={toasts} onDismiss={dismissToast} />

      {/* Footer */}
      <footer className="bg-[#07090d] border-t border-[#1e293b] text-slate-500 text-xs py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            &copy; 2026 {language === 'ar' ? 'بوابة إدارة بيانات وسجلات شؤون الطلاب - جمهورية العراق' : 'University Administrative Portal • Student Affairs & Admissions.'}
          </p>
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <span className="hover:text-slate-300 transition-colors">{language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}</span>
            <span>&bull;</span>
            <span className="hover:text-slate-300 transition-colors">{language === 'ar' ? 'النجف الأشرف' : 'Al-Najaf Al-Ashraf'}</span>
            <span>&bull;</span>
            <span className="hover:text-slate-300 transition-colors">{language === 'ar' ? 'تكامل Google Sheets' : 'Google Sheets'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
