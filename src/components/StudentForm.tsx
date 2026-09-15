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
  Receipt,
  MapPin,
  Home,
  Users2,
  Sparkles,
} from 'lucide-react';
import { Student, StudentFormData, ValidationErrors, IRAQ_PROVINCES, Language } from '../types';
import {
  getTodayDateString,
  calculateAge,
  detectCarrier,
  validateStudentForm,
  formatDisplayDate,
} from '../utils/validation';
import { translations } from '../utils/translations';

interface StudentFormProps {
  editingStudent: Student | null;
  onSave: (data: StudentFormData) => Promise<void>;
  onCancelEdit: () => void;
  isSubmitting: boolean;
  language: Language;
}

const INITIAL_FORM_DATA: StudentFormData = {
  studentName: '',
  gender: '',
  birthDate: '',
  phoneNumber: '',
  parentPhoneNumber: '',
  additionalPhoneNumber: '',
  province: 'Al-Najaf', // Najaf is now default province
  residenceDetails: '',
  collectionDate: '',
  receiptNo: '',
  notes: '',
};

export const StudentForm: React.FC<StudentFormProps> = ({
  editingStudent,
  onSave,
  onCancelEdit,
  isSubmitting,
  language,
}) => {
  const t = translations[language];
  const [formData, setFormData] = useState<StudentFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [dateInsertedNotice, setDateInsertedNotice] = useState(false);

  // Sync editing student into form or reset
  useEffect(() => {
    if (editingStudent) {
      setFormData({
        studentName: editingStudent.studentName,
        gender: (editingStudent.gender as 'male' | 'female' | '') || '',
        birthDate: editingStudent.birthDate,
        phoneNumber: editingStudent.phoneNumber,
        parentPhoneNumber: editingStudent.parentPhoneNumber || editingStudent.additionalPhoneNumber || '',
        additionalPhoneNumber: editingStudent.parentPhoneNumber || editingStudent.additionalPhoneNumber || '',
        province: editingStudent.province || 'Al-Najaf',
        residenceDetails: editingStudent.residenceDetails || '',
        collectionDate: editingStudent.collectionDate || getTodayDateString(),
        receiptNo: editingStudent.receiptNo || editingStudent.notes || '',
        notes: editingStudent.receiptNo || editingStudent.notes || '',
      });
      setErrors({});
      setTouched({});
    } else {
      setFormData({
        ...INITIAL_FORM_DATA,
        province: 'Al-Najaf',
        collectionDate: getTodayDateString(),
      });
    }
  }, [editingStudent]);

  // Handle Input Changes
  const handleChange = (field: keyof StudentFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (touched[field]) {
      const updated = { ...formData, [field]: value };
      const { errors: newErrors } = validateStudentForm(updated, language);
      setErrors((prev) => ({ ...prev, [field]: newErrors[field] }));
    }
  };

  const handleBlur = (field: keyof StudentFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const { errors: newErrors } = validateStudentForm(formData, language);
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
      province: 'Al-Najaf',
      collectionDate: getTodayDateString(),
    });
    setErrors({});
    setTouched({});
  };

  // Quick carrier prefix presets for convenient entry
  const handleSetSampleIraqiFormat = (prefix: string) => {
    setFormData((prev) => ({ ...prev, phoneNumber: prefix }));
    setTouched((prev) => ({ ...prev, phoneNumber: true }));
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all standard fields as touched
    setTouched({
      studentName: true,
      birthDate: true,
      phoneNumber: true,
      parentPhoneNumber: true,
      province: true,
      collectionDate: true,
      receiptNo: true,
    });

    const { isValid, errors: validationErrors } = validateStudentForm(formData, language);
    setErrors(validationErrors);

    if (!isValid) {
      // Scroll smoothly to first error if needed
      return;
    }

    await onSave({
      ...formData,
      parentPhoneNumber: formData.parentPhoneNumber.trim(),
      additionalPhoneNumber: formData.parentPhoneNumber.trim(),
      receiptNo: formData.receiptNo.trim(),
      notes: formData.receiptNo.trim(),
    });

    // If adding a new student, reset form with fresh collection date and Al-Najaf province
    if (!editingStudent) {
      setFormData({
        ...INITIAL_FORM_DATA,
        province: 'Al-Najaf',
        collectionDate: getTodayDateString(),
      });
      setTouched({});
      setErrors({});
    }
  };

  const calculatedAge = calculateAge(formData.birthDate);
  const detectedPrimaryCarrier = detectCarrier(formData.phoneNumber, language);
  const detectedParentCarrier = detectCarrier(formData.parentPhoneNumber, language);

  return (
    <section className="bg-[#0f172a] rounded-2xl border border-[#1e293b] shadow-xl overflow-hidden mb-8">
      {/* Form Top Accent Header */}
      <div className="bg-[#0a0c10] px-6 py-4 border-b border-[#1e293b] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div
            className={`w-3 h-3 rounded-full ${
              editingStudent ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
            }`}
          />
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              {editingStudent ? t.formTitleEdit : t.formTitleAdd}
            </h2>
            <p className="text-xs text-slate-400">{t.formSubtitle}</p>
          </div>
        </div>

        {editingStudent && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg">
              ID: {editingStudent.id}
            </span>
            <button
              type="button"
              onClick={onCancelEdit}
              className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
            >
              {t.cancelEditBtn}
            </button>
          </div>
        )}
      </div>

      {/* Main Intake Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1. Student Name */}
          <div className="space-y-1.5 lg:col-span-2">
            <label
              htmlFor="student-name-input"
              className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                {t.fullNameLabel}
              </span>
              <span className="text-[10px] text-amber-400 font-semibold">{t.requiredTag}</span>
            </label>
            <input
              type="text"
              id="student-name-input"
              value={formData.studentName}
              onChange={(e) => handleChange('studentName', e.target.value)}
              onBlur={() => handleBlur('studentName')}
              placeholder={t.fullNamePlaceholder}
              className={`w-full px-3.5 py-2.5 rounded-xl bg-[#0a0c10] border ${
                touched.studentName && errors.studentName
                  ? 'border-rose-500 ring-1 ring-rose-500/50'
                  : 'border-[#1e293b] focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50'
              } text-white placeholder-slate-500 text-sm transition-colors outline-none font-medium`}
            />
            {touched.studentName && errors.studentName && (
              <p className="text-xs text-rose-400 flex items-center gap-1 mt-1 font-medium">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {errors.studentName}
              </p>
            )}
          </div>

          {/* 2. Gender Selection Toggle (Male / Female) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                {t.genderLabel}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">{t.optionalTag}</span>
            </label>
            <div className="grid grid-cols-2 gap-2 h-[42px]">
              <button
                type="button"
                id="gender-male-btn"
                onClick={() => handleChange('gender', formData.gender === 'male' ? '' : 'male')}
                className={`flex items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  formData.gender === 'male'
                    ? 'bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-950/40 ring-1 ring-sky-300/40'
                    : 'bg-[#0a0c10] text-slate-400 border-[#1e293b] hover:border-slate-600 hover:text-slate-200'
                }`}
              >
                {t.genderMale}
              </button>

              <button
                type="button"
                id="gender-female-btn"
                onClick={() => handleChange('gender', formData.gender === 'female' ? '' : 'female')}
                className={`flex items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  formData.gender === 'female'
                    ? 'bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-950/40 ring-1 ring-rose-300/40'
                    : 'bg-[#0a0c10] text-slate-400 border-[#1e293b] hover:border-slate-600 hover:text-slate-200'
                }`}
              >
                {t.genderFemale}
              </button>
            </div>
          </div>

          {/* 3. Birth Date (DOB) */}
          <div className="space-y-1.5">
            <label
              htmlFor="birth-date-input"
              className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                {t.birthDateLabel}
              </span>
              {calculatedAge !== null && (
                <span className="text-xs font-bold text-amber-400 font-mono">
                  {calculatedAge} {t.ageYearsOld}
                </span>
              )}
            </label>
            <input
              type="date"
              id="birth-date-input"
              value={formData.birthDate}
              onChange={(e) => handleChange('birthDate', e.target.value)}
              onBlur={() => handleBlur('birthDate')}
              max={getTodayDateString()}
              min="1920-01-01"
              className={`w-full px-3.5 py-2.5 rounded-xl bg-[#0a0c10] border ${
                touched.birthDate && errors.birthDate
                  ? 'border-rose-500 ring-1 ring-rose-500/50'
                  : 'border-[#1e293b] focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50'
              } text-white text-sm transition-colors outline-none font-mono`}
            />
            {touched.birthDate && errors.birthDate && (
              <p className="text-xs text-rose-400 flex items-center gap-1 mt-1 font-medium">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {errors.birthDate}
              </p>
            )}
          </div>

          {/* 4. Student Phone Number */}
          <div className="space-y-1.5">
            <label
              htmlFor="phone-number-input"
              className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                {t.studentPhoneLabel}
              </span>
              {detectedPrimaryCarrier && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${detectedPrimaryCarrier.badgeColor}`}
                >
                  {detectedPrimaryCarrier.name}
                </span>
              )}
            </label>
            <input
              type="tel"
              id="phone-number-input"
              value={formData.phoneNumber}
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
              onBlur={() => handleBlur('phoneNumber')}
              placeholder={t.studentPhonePlaceholder}
              dir="ltr"
              className={`w-full px-3.5 py-2.5 rounded-xl bg-[#0a0c10] border ${
                touched.phoneNumber && errors.phoneNumber
                  ? 'border-rose-500 ring-1 ring-rose-500/50'
                  : 'border-[#1e293b] focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50'
              } text-white placeholder-slate-500 text-sm transition-colors outline-none font-mono`}
            />
            {touched.phoneNumber && errors.phoneNumber ? (
              <p className="text-xs text-rose-400 flex items-center gap-1 mt-1 font-medium">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {errors.phoneNumber}
              </p>
            ) : (
              <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-500">
                <span>{language === 'ar' ? 'اختصارات سريعة:' : 'Quick Prefix:'}</span>
                <button
                  type="button"
                  onClick={() => handleSetSampleIraqiFormat('0780')}
                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[10px] cursor-pointer"
                >
                  0780 (Zain)
                </button>
                <button
                  type="button"
                  onClick={() => handleSetSampleIraqiFormat('0770')}
                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[10px] cursor-pointer"
                >
                  0770 (Asia)
                </button>
                <button
                  type="button"
                  onClick={() => handleSetSampleIraqiFormat('0750')}
                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[10px] cursor-pointer"
                >
                  0750 (Korek)
                </button>
              </div>
            )}
          </div>

          {/* 5. Parents Phone Number */}
          <div className="space-y-1.5">
            <label
              htmlFor="parent-phone-input"
              className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <Users2 className="w-3.5 h-3.5 text-amber-400" />
                {t.parentsPhoneLabel}
              </span>
              {detectedParentCarrier ? (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${detectedParentCarrier.badgeColor}`}
                >
                  {detectedParentCarrier.name}
                </span>
              ) : (
                <span className="text-[10px] text-slate-500 font-medium">{t.optionalTag}</span>
              )}
            </label>
            <input
              type="tel"
              id="parent-phone-input"
              value={formData.parentPhoneNumber}
              onChange={(e) => handleChange('parentPhoneNumber', e.target.value)}
              onBlur={() => handleBlur('parentPhoneNumber')}
              placeholder={t.parentsPhonePlaceholder}
              dir="ltr"
              className={`w-full px-3.5 py-2.5 rounded-xl bg-[#0a0c10] border ${
                touched.parentPhoneNumber && errors.parentPhoneNumber
                  ? 'border-rose-500 ring-1 ring-rose-500/50'
                  : 'border-[#1e293b] focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50'
              } text-white placeholder-slate-500 text-sm transition-colors outline-none font-mono`}
            />
            {touched.parentPhoneNumber && errors.parentPhoneNumber ? (
              <p className="text-xs text-rose-400 flex items-center gap-1 mt-1 font-medium">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {errors.parentPhoneNumber}
              </p>
            ) : (
              <p className="text-[11px] text-slate-500">
                {language === 'ar'
                  ? 'هاتف الأب أو الأم للتواصل في حالات الطوارئ والإشعارات'
                  : "Emergency guardian or family contact line"}
              </p>
            )}
          </div>
        </div>

        {/* Location Section: Iraqi Provinces (Default: Al-Najaf) & Residence Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2 border-t border-[#1e293b]">
          {/* Province Selector (Default: Najaf) */}
          <div className="space-y-1.5">
            <label
              htmlFor="province-select"
              className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                {t.provinceLabel}
              </span>
              <span className="text-[10px] text-amber-400 font-semibold">
                {language === 'ar' ? 'الافتراضي: النجف الأشرف' : 'Default: Al-Najaf'}
              </span>
            </label>
            <select
              id="province-select"
              value={formData.province}
              onChange={(e) => handleChange('province', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0c10] border border-[#1e293b] focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 text-white text-sm transition-colors outline-none cursor-pointer font-medium"
            >
              {IRAQ_PROVINCES.map((prov) => (
                <option key={prov.id} value={prov.nameEn}>
                  {language === 'ar'
                    ? `${prov.nameAr} - ${prov.nameEn}`
                    : `${prov.nameEn} (${prov.nameAr})`}
                </option>
              ))}
            </select>
          </div>

          {/* Residence Details (District / Neighborhood / Street) */}
          <div className="space-y-1.5 md:col-span-2">
            <label
              htmlFor="residence-details-input"
              className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-amber-400" />
                {t.residenceDetailsLabel}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">{t.optionalTag}</span>
            </label>
            <input
              type="text"
              id="residence-details-input"
              value={formData.residenceDetails}
              onChange={(e) => handleChange('residenceDetails', e.target.value)}
              placeholder={t.residenceDetailsPlaceholder}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0c10] border border-[#1e293b] focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 text-white placeholder-slate-500 text-sm transition-colors outline-none font-medium"
            />
          </div>
        </div>

        {/* Date of Collection & Receipt Number Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-[#1e293b]">
          {/* Collection Date with "Insert Collection Date" button */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="collection-date-input"
                className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5"
              >
                <CalendarCheck className="w-3.5 h-3.5 text-amber-400" />
                {t.collectionDateLabel}
              </label>
              <span className="text-[10px] text-amber-400 font-semibold">{t.requiredTag}</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                id="collection-date-input"
                value={formData.collectionDate}
                onChange={(e) => handleChange('collectionDate', e.target.value)}
                onBlur={() => handleBlur('collectionDate')}
                className={`flex-1 px-3.5 py-2.5 rounded-xl bg-[#0a0c10] border ${
                  touched.collectionDate && errors.collectionDate
                    ? 'border-rose-500 ring-1 ring-rose-500/50'
                    : 'border-[#1e293b] focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50'
                } text-white text-sm transition-colors outline-none font-mono`}
              />

              <button
                type="button"
                id="insert-collection-date-btn"
                onClick={handleInsertCollectionDate}
                className="px-3.5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 active:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-sm"
                title={language === 'ar' ? 'إدراج تاريخ اليوم الفوري في الحقل' : 'Insert today date'}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.insertTodayDateBtn}</span>
              </button>
            </div>

            {dateInsertedNotice && (
              <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t.todayDateInsertedNotice}
              </p>
            )}

            {touched.collectionDate && errors.collectionDate && (
              <p className="text-xs text-rose-400 flex items-center gap-1 mt-1 font-medium">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {errors.collectionDate}
              </p>
            )}
          </div>

          {/* Receipt No. (Replaced Administrative Notes) */}
          <div className="space-y-1.5">
            <label
              htmlFor="receipt-no-input"
              className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-amber-400" />
                {t.receiptNoLabel}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">{t.optionalTag}</span>
            </label>
            <input
              type="text"
              id="receipt-no-input"
              value={formData.receiptNo}
              onChange={(e) => handleChange('receiptNo', e.target.value)}
              placeholder={t.receiptNoPlaceholder}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0c10] border border-[#1e293b] focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 text-white placeholder-slate-500 text-sm transition-colors outline-none font-mono"
            />
            <p className="text-[11px] text-slate-500">
              {language === 'ar'
                ? 'رقم إيصال الدفع أو الوصل المالي الممنوح للطالب'
                : 'Official payment receipt or tuition voucher reference'}
            </p>
          </div>
        </div>

        {/* Action Buttons: Save Student & Reset Form */}
        <div className="pt-4 border-t border-[#1e293b] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            id="clear-form-btn"
            onClick={handleClearForm}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#334155] bg-transparent hover:bg-slate-800 active:bg-slate-700 text-slate-300 font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span>{editingStudent ? t.cancelEditBtn : t.clearFormBtn}</span>
          </button>

          <button
            type="submit"
            id="submit-student-btn"
            disabled={isSubmitting}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
              editingStudent
                ? 'bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white shadow-amber-950/40'
                : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-emerald-950/40'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{t.savingBtn}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{editingStudent ? t.updateRecordBtn : t.saveRecordBtn}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};
