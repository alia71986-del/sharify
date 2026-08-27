import React from 'react';
import {
  X,
  User,
  Calendar,
  Phone,
  PhoneCall,
  CalendarCheck,
  Building,
  FileText,
  Clock,
  Edit3,
  Trash2,
  Copy,
  Check,
  ShieldAlert,
} from 'lucide-react';
import { Student } from '../types';
import {
  formatDisplayDate,
  calculateAge,
  detectCarrier,
} from '../utils/validation';

interface StudentDetailsModalProps {
  student: Student | null;
  onClose: () => void;
  onEdit: (student: Student) => void;
  onDeleteRequest: (student: Student) => void;
}

export const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({
  student,
  onClose,
  onEdit,
  onDeleteRequest,
}) => {
  const [copied, setCopied] = React.useState<string | null>(null);

  if (!student) return null;

  const age = calculateAge(student.birthDate);
  const primaryCarrier = detectCarrier(student.phoneNumber);
  const secondaryCarrier = detectCarrier(student.additionalPhoneNumber);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-[#0f172a] w-full max-w-lg rounded-2xl shadow-2xl border border-[#1e293b] overflow-hidden transform transition-all text-[#e2e8f0]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-[#0a0c10] text-[#e2e8f0] px-6 py-4 flex items-center justify-between border-b border-[#1e293b]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center font-bold text-white shadow-md shadow-amber-900/20 ring-1 ring-amber-500/40">
              {student.studentName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-snug">
                {student.studentName}
              </h3>
              <p className="text-xs text-slate-400 font-mono">Student Profile &bull; ID: {student.id}</p>
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

        {/* Modal Content */}
        <div className="p-6 space-y-5 text-sm">
          {/* Key Identification Banner */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#0a0c10] rounded-xl border border-[#1e293b]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Birth Date</p>
              <p className="font-bold text-white mt-0.5 font-mono">{formatDisplayDate(student.birthDate)}</p>
              {age !== null && <p className="text-xs text-amber-400 font-medium mt-0.5">{age} years old</p>}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Collection Date</p>
              <p className="font-bold text-white mt-0.5 font-mono">{formatDisplayDate(student.collectionDate)}</p>
              <p className="text-xs text-emerald-400 font-medium mt-0.5">Recorded in Registry</p>
            </div>
          </div>

          {/* Contact Information Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              Contact Information
            </h4>

            {/* Primary Phone */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-[#1e293b] bg-[#0a0c10] hover:border-slate-700 transition-colors">
              <div>
                <p className="text-xs text-slate-400 font-medium">Primary Phone Number</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <a
                    href={`tel:${student.phoneNumber}`}
                    className="font-mono font-bold text-amber-400 hover:underline text-base"
                  >
                    {student.phoneNumber}
                  </a>
                  {primaryCarrier && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${primaryCarrier.badgeColor}`}>
                      {primaryCarrier.name}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(student.phoneNumber, 'primary')}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="Copy phone"
              >
                {copied === 'primary' ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Additional Phone */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-[#1e293b] bg-[#0a0c10] hover:border-slate-700 transition-colors">
              <div>
                <p className="text-xs text-slate-400 font-medium">Additional Phone (Emergency / Secondary)</p>
                {student.additionalPhoneNumber ? (
                  <div className="flex items-center gap-2 mt-0.5">
                    <a
                      href={`tel:${student.additionalPhoneNumber}`}
                      className="font-mono font-bold text-slate-200 hover:underline"
                    >
                      {student.additionalPhoneNumber}
                    </a>
                    {secondaryCarrier && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${secondaryCarrier.badgeColor}`}>
                        {secondaryCarrier.name}
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-600 italic mt-0.5">No additional phone provided</p>
                )}
              </div>
              {student.additionalPhoneNumber && (
                <button
                  type="button"
                  onClick={() => handleCopy(student.additionalPhoneNumber!, 'secondary')}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Copy secondary phone"
                >
                  {copied === 'secondary' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Academic Details */}
          {(student.department || student.academicYear || student.notes) && (
            <div className="space-y-2 pt-2 border-t border-[#1e293b]">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-amber-400" />
                Academic Details
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {student.department && (
                  <div className="p-2.5 rounded-lg bg-[#0a0c10] border border-[#1e293b]">
                    <span className="text-slate-500 block font-medium">Department</span>
                    <span className="font-semibold text-white">{student.department}</span>
                  </div>
                )}
                {student.academicYear && (
                  <div className="p-2.5 rounded-lg bg-[#0a0c10] border border-[#1e293b]">
                    <span className="text-slate-500 block font-medium">Cohort</span>
                    <span className="font-semibold text-white">{student.academicYear}</span>
                  </div>
                )}
              </div>
              {student.notes && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
                  <span className="font-bold text-amber-400 block mb-0.5">Administrative Notes:</span>
                  <p className="text-amber-200/90">{student.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Timestamps */}
          <div className="pt-3 border-t border-[#1e293b] flex flex-col sm:flex-row justify-between text-[11px] text-slate-500 gap-1 font-mono">
            <span>Created: {new Date(student.createdAt).toLocaleString()}</span>
            <span>Updated: {new Date(student.updatedAt).toLocaleString()}</span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-[#0a0c10] border-t border-[#1e293b] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onDeleteRequest(student);
            }}
            className="px-3.5 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 font-semibold text-xs border border-rose-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Delete Record
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#334155] text-slate-300 hover:bg-slate-800 font-semibold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(student);
              }}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-amber-900/20 cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              Edit Student
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
