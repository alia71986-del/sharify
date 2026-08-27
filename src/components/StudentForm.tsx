import React, { useState, useEffect } from 'react';
import {
  User,
  Calendar,
  Phone,
  PhoneCall,
  CalendarCheck,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertCircle,
  Building,
  FileText,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import { Student, StudentFormData, ValidationErrors } from '../types';
import {
  getTodayDateString,
  calculateAge,
  detectCarrier,
  validateStudentForm,
  formatDisplayDate,
} from '../utils/validation';

interface StudentFormProps {
  editingStudent: Student | null;
  onSave: (data: StudentFormData) => Promise<void>;
  onCancelEdit: () => void;
  isSubmitting: boolean;
}

const INITIAL_FORM_DATA: StudentFormData = {
  studentName: '',
  birthDate: '',
  phoneNumber: '',
  additionalPhoneNumber: '',
  collectionDate: '',
  notes: '',
  department: 'Computer Science & Engineering',
  academicYear: 'Year 1',
};

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Software Systems',
  'Civil Engineering',
  'Electrical Engineering',
  'Biomedical Sciences',
  'Business Administration',
  'College of Medicine',
  'College of Pharmacy',
  'College of Law',
  'College of Arts & Humanities',
];

const ACADEMIC_YEARS = ['Year 1 (Freshman)', 'Year 2 (Sophomore)', 'Year 3 (Junior)', 'Year 4 (Senior)', 'Postgraduate'];

export const StudentForm: React.FC<StudentFormProps> = ({
  editingStudent,
  onSave,
  onCancelEdit,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState<StudentFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [dateInsertedNotice, setDateInsertedNotice] = useState(false);

  // Sync editing student into form
  useEffect(() => {
    if (editingStudent) {
      setFormData({
        studentName: editingStudent.studentName,
        birthDate: editingStudent.birthDate,
        phoneNumber: editingStudent.phoneNumber,
        additionalPhoneNumber: editingStudent.additionalPhoneNumber || '',
        collectionDate: editingStudent.collectionDate || getTodayDateString(),
        notes: editingStudent.notes || '',
        department: editingStudent.department || DEPARTMENTS[0],
        academicYear: editingStudent.academicYear || ACADEMIC_YEARS[0],
      });
      setErrors({});
      setTouched({});
    } else {
      // New form default: automatically set collection date to today for user convenience
      setFormData((prev) => ({
        ...prev,
        collectionDate: getTodayDateString(),
      }));
    }
  }, [editingStudent]);

  // Handle Input Changes
  const handleChange = (field: keyof StudentFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Real-time error clearance for touched field
    if (touched[field]) {
      const updated = { ...formData, [field]: value };
      const { errors: newErrors } = validateStudentForm(updated);
      setErrors((prev) => ({ ...prev, [field]: newErrors[field] }));
    }
  };

  const handleBlur = (field: keyof StudentFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const { errors: newErrors } = validateStudentForm(formData);
    setErrors((prev) => ({ ...prev, [field]: newErrors[field] }));
  };

  // Button Action: "Insert Collection Date"
  const handleInsertCollectionDate = () => {
    const today = getTodayDateString();
    setFormData((prev) => ({ ...prev, collectionDate: today }));
    setTouched((prev) => ({ ...prev, collectionDate: true }));
    setErrors((prev) => ({ ...prev, collectionDate: undefined }));
    setDateInsertedNotice(true);
    setTimeout(() => setDateInsertedNotice(false), 3000);
  };

  // Button Action: "Clear Form"
  const handleClearForm = () => {
    if (editingStudent) {
      onCancelEdit();
    }
    setFormData({
      ...INITIAL_FORM_DATA,
      collectionDate: getTodayDateString(), // Keep fresh today date
    });
    setErrors({});
    setTouched({});
  };

  // Phone presets for quick testing/formatting helper
  const handleSetSampleIraqiFormat = (prefix: string) => {
    setFormData((prev) => ({ ...prev, phoneNumber: prefix }));
    setTouched((prev) => ({ ...prev, phoneNumber: true }));
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all as touched
    setTouched({
      studentName: true,
      birthDate: true,
      phoneNumber: true,
      additionalPhoneNumber: true,
      collectionDate: true,
    });

    const { isValid, errors: validationErrors } = validateStudentForm(formData);

    if (!isValid) {
      setErrors(validationErrors);
      // Scroll smoothly to form error if needed
      const formEl = document.getElementById('student-collection-form');
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    setErrors({});
    await onSave(formData);

    // If not editing, clear inputs but keep collection date
    if (!editingStudent) {
      setFormData({
        ...INITIAL_FORM_DATA,
        collectionDate: getTodayDateString(),
      });
      setTouched({});
    }
  };

  const primaryCarrier = detectCarrier(formData.phoneNumber);
  const secondaryCarrier = detectCarrier(formData.additionalPhoneNumber);
  const calculatedAge = calculateAge(formData.birthDate);
  const todayStr = getTodayDateString();

  return (
    <div
      id="student-collection-form"
      className="bg-[#0f172a] rounded-2xl border border-[#1e293b] shadow-xl overflow-hidden mb-8 transition-all duration-200"
    >
      {/* Form Header */}
      <div className="bg-[#0a0c10] text-[#e2e8f0] px-6 py-4.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#1e293b]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white ring-1 ring-amber-500/40 shadow-md shadow-amber-900/20">
            {editingStudent ? <RotateCcw className="w-5 h-5" /> : <User className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight uppercase">
                {editingStudent ? `Edit Student: ${editingStudent.studentName}` : 'Student Information Intake Form'}
              </h2>
              {editingStudent && (
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Editing Mode
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {editingStudent
                ? 'Update existing student details and click Save Student to persist changes.'
                : 'Enter official student credentials. All required fields are marked with *.'}
            </p>
          </div>
        </div>

        {editingStudent && (
          <button
            type="button"
            onClick={onCancelEdit}
            id="cancel-edit-btn"
            className="self-start sm:self-auto text-xs px-3 py-1.5 rounded-lg bg-[#1e293b] hover:bg-slate-700 text-slate-300 border border-[#334155] transition-colors font-medium cursor-pointer"
          >
            Cancel Edit & New Student
          </button>
        )}
      </div>

      {/* Main Form Body */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        {/* Top Validation Alert if there are errors */}
        {Object.keys(errors).length > 0 && Object.values(errors).some(Boolean) && (
          <div
            id="form-validation-summary"
            className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-3 text-sm animate-in fade-in duration-200"
          >
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-200">Please correct the following before saving:</p>
              <ul className="list-disc list-inside mt-1 text-xs text-rose-300/90 space-y-0.5">
                {errors.studentName && <li>Student Name: {errors.studentName}</li>}
                {errors.birthDate && <li>Birth Date: {errors.birthDate}</li>}
                {errors.phoneNumber && <li>Phone Number: {errors.phoneNumber}</li>}
                {errors.additionalPhoneNumber && <li>Additional Phone: {errors.additionalPhoneNumber}</li>}
                {errors.collectionDate && <li>Collection Date: {errors.collectionDate}</li>}
              </ul>
            </div>
          </div>
        )}

        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Student Name */}
          <div className="md:col-span-2">
            <label
              htmlFor="studentName"
              className="block text-xs uppercase font-semibold text-slate-400 mb-1.5 tracking-wider"
            >
              Student Name <span className="text-amber-500 font-bold">*</span>
            </label>
            <div className="relative rounded-xl">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                id="studentName"
                name="studentName"
                required
                value={formData.studentName}
                onChange={(e) => handleChange('studentName', e.target.value)}
                onBlur={() => handleBlur('studentName')}
                placeholder="Full Student Name (e.g. Ali Hussein Al-Moussawi / علي حسين الموسوي)"
                className={`block w-full pl-11 pr-4 py-3 text-sm text-[#e2e8f0] rounded-xl bg-[#0a0c10] border ${
                  errors.studentName && touched.studentName
                    ? 'border-rose-500 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/30'
                    : 'border-[#334155] focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30'
                } placeholder:text-slate-600 transition-colors outline-none`}
              />
            </div>
            {errors.studentName && touched.studentName ? (
              <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.studentName}
              </p>
            ) : (
              <p className="text-xs text-slate-500 mt-1.5">Enter official first, middle, and family name.</p>
            )}
          </div>

          {/* 2. Birth Date */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="birthDate"
                className="block text-xs uppercase font-semibold text-slate-400 tracking-wider"
              >
                Birth Date <span className="text-amber-500 font-bold">*</span>
              </label>
              {calculatedAge !== null && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                  Age: {calculatedAge} yrs
                </span>
              )}
            </div>
            <div className="relative rounded-xl">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Calendar className="w-5 h-5" />
              </div>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                required
                max={todayStr}
                min="1920-01-01"
                value={formData.birthDate}
                onChange={(e) => handleChange('birthDate', e.target.value)}
                onBlur={() => handleBlur('birthDate')}
                className={`block w-full pl-11 pr-4 py-3 text-sm text-[#e2e8f0] rounded-xl bg-[#0a0c10] border ${
                  errors.birthDate && touched.birthDate
                    ? 'border-rose-500 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/30'
                    : 'border-[#334155] focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30'
                } transition-colors outline-none font-mono`}
              />
            </div>
            {errors.birthDate && touched.birthDate ? (
              <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.birthDate}
              </p>
            ) : (
              <p className="text-xs text-slate-500 mt-1.5">
                Select from calendar. Must not be a future date.
              </p>
            )}
          </div>

          {/* 3. Primary Phone Number */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="phoneNumber"
                className="block text-xs uppercase font-semibold text-slate-400 tracking-wider"
              >
                Phone Number <span className="text-amber-500 font-bold">*</span>
              </label>
              {primaryCarrier && (
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${primaryCarrier.badgeColor}`}
                >
                  {primaryCarrier.name}
                </span>
              )}
            </div>
            <div className="relative rounded-xl">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Phone className="w-5 h-5" />
              </div>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                required
                value={formData.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                onBlur={() => handleBlur('phoneNumber')}
                placeholder="+964 7XX XXX XXXX or 07801234567"
                className={`block w-full pl-11 pr-4 py-3 text-sm text-[#e2e8f0] rounded-xl bg-[#0a0c10] border ${
                  errors.phoneNumber && touched.phoneNumber
                    ? 'border-rose-500 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/30'
                    : 'border-[#334155] focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30'
                } placeholder:text-slate-600 transition-colors outline-none font-mono`}
              />
            </div>
            {errors.phoneNumber && touched.phoneNumber ? (
              <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.phoneNumber}
              </p>
            ) : (
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-xs text-slate-500">
                <span>Presets:</span>
                <button
                  type="button"
                  onClick={() => handleSetSampleIraqiFormat('0780')}
                  className="text-amber-400 hover:underline cursor-pointer font-medium font-mono"
                >
                  Zain 0780
                </button>
                <span className="text-slate-600">|</span>
                <button
                  type="button"
                  onClick={() => handleSetSampleIraqiFormat('0770')}
                  className="text-purple-400 hover:underline cursor-pointer font-medium font-mono"
                >
                  AsiaCell 0770
                </button>
                <span className="text-slate-600">|</span>
                <button
                  type="button"
                  onClick={() => handleSetSampleIraqiFormat('0750')}
                  className="text-emerald-400 hover:underline cursor-pointer font-medium font-mono"
                >
                  Korek 0750
                </button>
              </div>
            )}
          </div>

          {/* 4. Additional Phone Number (Optional) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="additionalPhoneNumber"
                className="block text-xs uppercase font-semibold text-slate-400 tracking-wider"
              >
                Additional Phone <span className="text-slate-500 font-normal lowercase">(optional)</span>
              </label>
              {secondaryCarrier && (
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${secondaryCarrier.badgeColor}`}
                >
                  {secondaryCarrier.name}
                </span>
              )}
            </div>
            <div className="relative rounded-xl">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <PhoneCall className="w-5 h-5" />
              </div>
              <input
                type="tel"
                id="additionalPhoneNumber"
                name="additionalPhoneNumber"
                value={formData.additionalPhoneNumber}
                onChange={(e) => handleChange('additionalPhoneNumber', e.target.value)}
                onBlur={() => handleBlur('additionalPhoneNumber')}
                placeholder="+964 750... (Parent / Guardian)"
                className={`block w-full pl-11 pr-4 py-3 text-sm text-[#e2e8f0] rounded-xl bg-[#0a0c10] border ${
                  errors.additionalPhoneNumber && touched.additionalPhoneNumber
                    ? 'border-rose-500 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/30'
                    : 'border-[#334155] focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30'
                } placeholder:text-slate-600 transition-colors outline-none font-mono`}
              />
            </div>
            {errors.additionalPhoneNumber && touched.additionalPhoneNumber ? (
              <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.additionalPhoneNumber}
              </p>
            ) : (
              <p className="text-xs text-slate-500 mt-1.5">
                Secondary number for parent, guardian, or emergency contact.
              </p>
            )}
          </div>

          {/* 5. Date Information Was Collected */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="collectionDate"
                className="block text-xs uppercase font-semibold text-slate-400 tracking-wider"
              >
                Collection Date <span className="text-amber-500 font-bold">*</span>
              </label>
              {formData.collectionDate === todayStr && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-400" /> Today's Date
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <input
                  type="date"
                  id="collectionDate"
                  name="collectionDate"
                  required
                  value={formData.collectionDate}
                  onChange={(e) => handleChange('collectionDate', e.target.value)}
                  onBlur={() => handleBlur('collectionDate')}
                  className={`block w-full pl-11 pr-4 py-3 text-sm text-[#e2e8f0] rounded-xl bg-[#0a0c10] border ${
                    errors.collectionDate && touched.collectionDate
                      ? 'border-rose-500 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/30'
                      : 'border-[#334155] focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30'
                  } transition-colors outline-none font-mono`}
                />
              </div>

              {/* Explicit "Insert Collection Date" Button right next to field */}
              <button
                type="button"
                id="quick-insert-collection-date-btn"
                onClick={handleInsertCollectionDate}
                className="px-3.5 py-2.5 rounded-xl bg-[#1e293b] hover:bg-slate-700 text-amber-400 border border-[#334155] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                title="Automatically insert current date without manual typing"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Set Today</span>
                <span className="sm:hidden">Today</span>
              </button>
            </div>

            {dateInsertedNotice && (
              <p className="text-xs text-emerald-400 mt-1.5 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Inserted current date: {formatDisplayDate(todayStr)}
              </p>
            )}

            {errors.collectionDate && touched.collectionDate && (
              <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.collectionDate}
              </p>
            )}
          </div>

          {/* Additional Notes / Remarks */}
          <div className="md:col-span-2">
            <label
              htmlFor="notes"
              className="block text-xs uppercase font-semibold text-slate-400 mb-1.5 tracking-wider"
            >
              Administrative Notes <span className="text-slate-500 font-normal lowercase">(optional)</span>
            </label>
            <div className="relative rounded-xl">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <FileText className="w-5 h-5" />
              </div>
              <input
                type="text"
                id="notes"
                name="notes"
                value={formData.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="e.g., Transfer student, honors cohort, dean list, scholarship recipient..."
                className="block w-full pl-11 pr-4 py-3 text-sm text-[#e2e8f0] rounded-xl bg-[#0a0c10] border border-[#334155] focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 placeholder:text-slate-600 transition-colors outline-none"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1.5">Internal record notes for faculty advisors.</p>
          </div>
        </div>

        {/* Buttons at Bottom of Form:
            - Save Student (Amber gradient / glow)
            - Clear Form (Subtle dark outline)
            - Insert Collection Date
        */}
        <div className="pt-5 border-t border-[#1e293b] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5">
          {/* Left Action: Clear Form */}
          <button
            type="button"
            id="clear-form-btn"
            onClick={handleClearForm}
            className="px-5 py-3 rounded-xl border border-[#334155] bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            Clear Form
          </button>

          {/* Right Action Group: Insert Collection Date & Save Student */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Insert Collection Date Button */}
            <button
              type="button"
              id="insert-collection-date-btn"
              onClick={handleInsertCollectionDate}
              className="px-4 py-3 rounded-xl border border-[#334155] bg-[#1e293b] hover:bg-slate-800 text-amber-400 font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4 text-amber-500" />
              Insert Collection Date
            </button>

            {/* Save Student Button */}
            <button
              type="submit"
              id="save-student-btn"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30 transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving Record...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-white" />
                  <span>{editingStudent ? 'Update Student' : 'Save Student'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
