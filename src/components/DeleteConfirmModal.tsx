import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Student, Language } from '../types';
import { translations } from '../utils/translations';

interface DeleteConfirmModalProps {
  student: Student | null;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
  language: Language;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  student,
  onConfirm,
  onCancel,
  isDeleting,
  language,
}) => {
  const t = translations[language];

  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-[#0f172a] w-full max-w-md rounded-2xl shadow-2xl border border-[#1e293b] overflow-hidden transform transition-all text-[#e2e8f0]"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/20 ring-4 ring-rose-500/5">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-bold text-white mb-1 tracking-tight">
            {t.deleteModalTitle}
          </h3>

          <p className="text-sm text-slate-400 mb-4">
            {t.deleteModalConfirmText}{' '}
            <strong className="text-white font-semibold">{student.studentName}</strong>?
          </p>

          <div className="p-3 bg-[#0a0c10] border border-[#1e293b] rounded-xl text-left rtl:text-right text-xs text-slate-300 space-y-1 mb-6 font-mono">
            <p>
              <strong className="text-slate-400">ID:</strong> {student.id}
            </p>
            <p>
              <strong className="text-slate-400">{t.studentPhoneLabel}:</strong> {student.phoneNumber}
            </p>
            {student.receiptNo && (
              <p>
                <strong className="text-slate-400">{t.receiptNoLabel}:</strong> {student.receiptNo}
              </p>
            )}
            <p className="text-rose-400 italic mt-1 font-sans">
              {t.deleteModalWarning}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              id="cancel-delete-modal-btn"
              onClick={onCancel}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#334155] bg-transparent hover:bg-slate-800 text-slate-300 font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
            >
              {t.cancelDeleteBtn}
            </button>
            <button
              type="button"
              id="confirm-delete-modal-btn"
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-rose-950/40 transition-colors cursor-pointer disabled:opacity-60"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t.deletingBtn}</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>{t.confirmDeleteBtn}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
