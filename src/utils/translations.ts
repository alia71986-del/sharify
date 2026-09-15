import { Language } from '../types';

export interface TranslationDictionary {
  // App & Header
  appTitle: string;
  appSubtitle: string;
  staffPortalBadge: string;
  switchLanguage: string;
  currentLangLabel: string;
  systemDateLabel: string;
  complianceBadge: string;
  googleSheetsBtn: string;
  googleSheetsActive: string;

  // Banner Notice
  noticeTitle: string;
  noticeSubtitle: string;
  noticeSecureTag: string;

  // Stats
  totalEnrolled: string;
  activeProfiles: string;
  todayIntake: string;
  recordsToday: string;
  thisMonth: string;
  currentCycle: string;
  parentsContact: string;
  withParentsPhone: string;
  maleLabel: string;
  femaleLabel: string;

  // Google Sheets Bar
  sheetsBarTitle: string;
  sheetsBarConnected: string;
  sheetsBarDisconnected: string;
  sheetsQuickExport: string;
  sheetsManage: string;
  sheetsExporting: string;
  sheetsAutoSyncOn: string;
  sheetsAutoSyncOff: string;

  // Student Form
  formTitleAdd: string;
  formTitleEdit: string;
  formSubtitle: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  genderLabel: string;
  genderMale: string;
  genderFemale: string;
  birthDateLabel: string;
  studentPhoneLabel: string;
  studentPhonePlaceholder: string;
  parentsPhoneLabel: string;
  parentsPhonePlaceholder: string;
  provinceLabel: string;
  residenceDetailsLabel: string;
  residenceDetailsPlaceholder: string;
  collectionDateLabel: string;
  receiptNoLabel: string;
  receiptNoPlaceholder: string;
  insertTodayDateBtn: string;
  saveRecordBtn: string;
  updateRecordBtn: string;
  savingBtn: string;
  clearFormBtn: string;
  cancelEditBtn: string;
  iraqFormatHelp: string;
  ageYearsOld: string;
  optionalTag: string;
  requiredTag: string;
  todayDateInsertedNotice: string;

  // Student Directory Table
  directoryTitle: string;
  directorySubtitle: string;
  searchPlaceholder: string;
  clearSearch: string;
  filterProvinceAll: string;
  filterGenderAll: string;
  filterDateAll: string;
  filterDateToday: string;
  filterDateWeek: string;
  filterDateMonth: string;
  filterDateCustom: string;
  exportCsvBtn: string;
  refreshBtn: string;
  colStudentName: string;
  colPlaceOfLiving: string;
  colDOB: string;
  colStudentPhone: string;
  colParentsPhone: string;
  colReceiptNo: string;
  colCollected: string;
  colActions: string;
  noRecordsFound: string;
  noRecordsFoundDesc: string;
  clearSearchAndFilters: string;
  showingRecords: string;
  ofTotal: string;
  totalStudentsLabel: string;
  recordsAutoPersisted: string;
  todayBadge: string;
  noneLabel: string;

  // Student Details Modal
  profileDetailsTitle: string;
  studentProfileId: string;
  contactInformationTitle: string;
  primaryStudentPhone: string;
  placeOfLivingTitle: string;
  provinceTitle: string;
  residenceDetailsTitle: string;
  receiptAndAdminTitle: string;
  receiptNoModalLabel: string;
  noAddressNoted: string;
  noParentPhoneNoted: string;
  noReceiptNoted: string;
  createdLabel: string;
  updatedLabel: string;
  closeBtn: string;
  editStudentBtn: string;
  deleteRecordBtn: string;

  // Delete Confirm Modal
  deleteModalTitle: string;
  deleteModalConfirmText: string;
  deleteModalWarning: string;
  confirmDeleteBtn: string;
  deletingBtn: string;
  cancelDeleteBtn: string;

  // Validation Messages
  valNameRequired: string;
  valNameMin: string;
  valNameMax: string;
  valBirthRequired: string;
  valBirthFuture: string;
  valBirthValid: string;
  valPhoneRequired: string;
  valPhoneInvalid: string;
  valParentPhoneInvalid: string;
  valParentPhoneIdentical: string;
  valGenderInvalid: string;
  valCollectionDateRequired: string;
  valCollectionDateFormat: string;

  // Carrier Names
  carrierZain: string;
  carrierAsiacell: string;
  carrierKorek: string;
  carrierIraqMobile: string;
  carrierInternational: string;

  // Footer
  footerCopyright: string;
  footerPrivacy: string;
  footerCompliance: string;
  footerSheets: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    appTitle: 'Academic Registry // Students',
    appSubtitle: 'Official Student Information Collection & Administrative Record System',
    staffPortalBadge: 'v2.5 Staff Portal',
    switchLanguage: 'العربية',
    currentLangLabel: 'EN',
    systemDateLabel: 'Today',
    complianceBadge: 'FERPA Compliant',
    googleSheetsBtn: 'Google Sheets',
    googleSheetsActive: 'Google Sheets Active',

    noticeTitle: 'Official Student Intake & Record Management',
    noticeSubtitle: 'All records entered below are validated, formatted, and persistently stored in the institution database.',
    noticeSecureTag: 'Secure & Privacy Compliant Storage',

    totalEnrolled: 'Total Enrolled',
    activeProfiles: 'Active Student Profiles',
    todayIntake: "Today's Intake",
    recordsToday: 'Records Registered Today',
    thisMonth: 'This Month',
    currentCycle: 'Current Academic Intake',
    parentsContact: 'Parents Contact',
    withParentsPhone: 'With Parents Phone',
    maleLabel: 'Male',
    femaleLabel: 'Female',

    sheetsBarTitle: 'Google Sheets Live Sync',
    sheetsBarConnected: 'Connected to',
    sheetsBarDisconnected: 'Connect your Google Drive spreadsheet to sync student records in real time.',
    sheetsQuickExport: 'Quick Export',
    sheetsManage: 'Manage Sync & Import',
    sheetsExporting: 'Exporting...',
    sheetsAutoSyncOn: 'Auto-Sync Active',
    sheetsAutoSyncOff: 'Auto-Sync Paused',

    formTitleAdd: 'Student Information Collection // New Entry',
    formTitleEdit: 'Modify Student Record // Update Mode',
    formSubtitle: 'Collect and verify essential personal contact details, location in Iraq, and payment receipt number.',
    fullNameLabel: 'Student Full Name',
    fullNamePlaceholder: 'Enter full formal name (e.g. Ahmed Ali Al-Najafi / أحمد علي النجفي)',
    genderLabel: 'Gender',
    genderMale: '♂ Male (ذكر)',
    genderFemale: '♀ Female (أنثى)',
    birthDateLabel: 'Birth Date (DOB)',
    studentPhoneLabel: 'Student Phone Number',
    studentPhonePlaceholder: '0780 123 4567 or +964 780 123 4567',
    parentsPhoneLabel: 'Parents Phone Number',
    parentsPhonePlaceholder: "Father's or mother's phone (e.g. 0770 987 6543)",
    provinceLabel: 'Place of Living (Province)',
    residenceDetailsLabel: 'Residence Details (District / Neighborhood / Street)',
    residenceDetailsPlaceholder: 'e.g. Al-Ghadeer District, Street 14, Near Grand Mosque (حي الغدير)',
    collectionDateLabel: 'Collection Date (Record Intake Date)',
    receiptNoLabel: 'Receipt No.',
    receiptNoPlaceholder: 'e.g. REC-2026-0891 / رقم الوصل المالي',
    insertTodayDateBtn: 'Insert Collection Date',
    saveRecordBtn: 'Save Student Record',
    updateRecordBtn: 'Update Student Record',
    savingBtn: 'Saving...',
    clearFormBtn: 'Reset Form',
    cancelEditBtn: 'Cancel Edit',
    iraqFormatHelp: 'Iraqi Networks: Zain (078/079), Asiacell (077), Korek (075)',
    ageYearsOld: 'yrs old',
    optionalTag: 'Optional',
    requiredTag: 'Required',
    todayDateInsertedNotice: "Today's collection date automatically inserted!",

    directoryTitle: 'Student Directory // Database View',
    directorySubtitle: 'Search, filter by province or gender, view student profiles, and update administrative records.',
    searchPlaceholder: 'Search name, phone, receipt no, province...',
    clearSearch: 'Clear',
    filterProvinceAll: 'Province: All Iraq',
    filterGenderAll: 'Gender: All',
    filterDateAll: 'Filter: All Dates',
    filterDateToday: "Today's Intake",
    filterDateWeek: 'Last 7 Days',
    filterDateMonth: 'This Month',
    filterDateCustom: 'Custom Date...',
    exportCsvBtn: 'Export CSV',
    refreshBtn: 'Refresh Database',
    colStudentName: 'Student Name',
    colPlaceOfLiving: 'Place of Living',
    colDOB: 'DOB',
    colStudentPhone: 'Student Phone',
    colParentsPhone: 'Parents Phone',
    colReceiptNo: 'Receipt No.',
    colCollected: 'Collected',
    colActions: 'Actions',
    noRecordsFound: 'No Student Records Found',
    noRecordsFoundDesc: 'No records match your search or filter criteria. Try adjusting or clearing filters.',
    clearSearchAndFilters: 'Clear Search & Filters',
    showingRecords: 'Showing',
    ofTotal: 'of',
    totalStudentsLabel: 'total registered students',
    recordsAutoPersisted: 'Faculty Registrar Database • Auto-persisted',
    todayBadge: 'Today',
    noneLabel: 'None',

    profileDetailsTitle: 'Student Profile Information',
    studentProfileId: 'Student Profile • ID',
    contactInformationTitle: 'Contact Information',
    primaryStudentPhone: 'Primary Student Phone',
    placeOfLivingTitle: 'Place of Living (محل السكن)',
    provinceTitle: 'Province (المحافظة)',
    residenceDetailsTitle: 'Residence Details',
    receiptAndAdminTitle: 'Administrative & Receipt Details',
    receiptNoModalLabel: 'Receipt Number (رقم الوصل)',
    noAddressNoted: 'No specific address noted',
    noParentPhoneNoted: 'No parent phone number provided',
    noReceiptNoted: 'No receipt number recorded',
    createdLabel: 'Created',
    updatedLabel: 'Updated',
    closeBtn: 'Close',
    editStudentBtn: 'Edit Student',
    deleteRecordBtn: 'Delete Record',

    deleteModalTitle: 'Confirm Student Record Deletion',
    deleteModalConfirmText: 'Are you sure you want to permanently delete the student information record for',
    deleteModalWarning: 'This action cannot be undone and will permanently remove the record from all database views.',
    confirmDeleteBtn: 'Delete Student',
    deletingBtn: 'Deleting...',
    cancelDeleteBtn: 'Cancel',

    valNameRequired: 'Student Name is required.',
    valNameMin: 'Student Name must be at least 2 characters.',
    valNameMax: 'Student Name cannot exceed 100 characters.',
    valBirthRequired: 'Birth Date is required.',
    valBirthFuture: 'Birth Date cannot be a future date.',
    valBirthValid: 'Please enter a valid birth date (after 1920).',
    valPhoneRequired: 'Phone Number is required.',
    valPhoneInvalid: 'Please enter a valid phone number (e.g. 07801234567, 07701234567, or +964 780 123 4567).',
    valParentPhoneInvalid: 'Parents Phone Number format is invalid. Use e.g. 07501234567 or +964 750 123 4567.',
    valParentPhoneIdentical: "Parents Phone Number cannot be identical to the student's primary phone number.",
    valGenderInvalid: 'Please select a valid gender (Male or Female).',
    valCollectionDateRequired: 'Collection Date is required. Click "Insert Collection Date".',
    valCollectionDateFormat: 'Collection Date must be in YYYY-MM-DD format.',

    carrierZain: 'Zain Iraq',
    carrierAsiacell: 'AsiaCell',
    carrierKorek: 'Korek',
    carrierIraqMobile: 'Iraq Mobile',
    carrierInternational: 'International',

    footerCopyright: '© 2026 Academic Student Registry & Records Department. All rights reserved.',
    footerPrivacy: 'Privacy Policy',
    footerCompliance: 'Data Security',
    footerSheets: 'Google Sheets Integration',
  },
  ar: {
    appTitle: 'نظام تسجيل بيانات الطلاب // الأرشيف الأكاديمي',
    appSubtitle: 'المنظومة الرسمية الموحدة لجمع بيانات الطلاب وإدارة القيود الأكاديمية والمالية',
    staffPortalBadge: 'بوابة الموظفين v2.5',
    switchLanguage: 'English',
    currentLangLabel: 'عربي',
    systemDateLabel: 'تاريخ اليوم',
    complianceBadge: 'نظام آمن ومعتمد',
    googleSheetsBtn: 'جداول جوجل (Sheets)',
    googleSheetsActive: 'جداول جوجل متصلة',

    noticeTitle: 'تسجيل وتوثيق بيانات الطلاب المعتمدة',
    noticeSubtitle: 'يتم تدقيق جميع البيانات المدخلة وتنسيقها وحفظها بشكل فوري ودائم في قاعدة بيانات الكلية.',
    noticeSecureTag: 'تخزين آمن ومحمي',

    totalEnrolled: 'إجمالي المسجلين',
    activeProfiles: 'سجلات الطلاب الفعالة',
    todayIntake: 'تسجيلات اليوم',
    recordsToday: 'طالباً مسجلاً هذا اليوم',
    thisMonth: 'هذا الشهر',
    currentCycle: 'دفعة التسجيل الحالية',
    parentsContact: 'هواتف أولياء الأمور',
    withParentsPhone: 'يتضمن هاتف ولي الأمر',
    maleLabel: 'ذكور',
    femaleLabel: 'إناث',

    sheetsBarTitle: 'المزامنة المباشرة مع جداول Google Sheets',
    sheetsBarConnected: 'متصل بملف',
    sheetsBarDisconnected: 'اربط جدول بيانات من Google Drive لمزامنة بيانات الطلاب وتصديرها بصورة حية.',
    sheetsQuickExport: 'تصدير سريع',
    sheetsManage: 'إدارة المزامنة والاستيراد',
    sheetsExporting: 'جاري التصدير...',
    sheetsAutoSyncOn: 'المزامنة التلقائية مفعلة',
    sheetsAutoSyncOff: 'المزامنة التلقائية متوقفة',

    formTitleAdd: 'استمارة جمع بيانات الطالب // إدخال جديد',
    formTitleEdit: 'تعديل بيانات الطالب // نمط التحديث',
    formSubtitle: 'يرجى ملء وتدقيق البيانات الشخصية، وسيلة الاتصال، محل السكن في العراق، ورقم الوصل المالي.',
    fullNameLabel: 'الاسم الكامل للطالب',
    fullNamePlaceholder: 'أدخل الاسم الرباعي واللقب (مثال: علي حسين الموسوي)',
    genderLabel: 'الجنس',
    genderMale: '♂ ذكر',
    genderFemale: '♀ أنثى',
    birthDateLabel: 'تاريخ الميلاد',
    studentPhoneLabel: 'رقم هاتف الطالب',
    studentPhonePlaceholder: '0780 123 4567 أو +964 780 123 4567',
    parentsPhoneLabel: 'رقم هاتف ولي الأمر',
    parentsPhonePlaceholder: 'رقم هاتف الأب أو الأم (مثال: 0770 987 6543)',
    provinceLabel: 'مكان السكن (المحافظة)',
    residenceDetailsLabel: 'تفاصيل السكن (القضاء / الناحية / الحي / الشارع)',
    residenceDetailsPlaceholder: 'مثال: حي الغدير، محلة 402، قرب جامع الإمام علي (ع)',
    collectionDateLabel: 'تاريخ استلام / تسجيل البيانات',
    receiptNoLabel: 'رقم الوصل',
    receiptNoPlaceholder: 'مثال: REC-2026-0891 أو رقم الوصل المالي / الإداري',
    insertTodayDateBtn: 'إدراج تاريخ اليوم',
    saveRecordBtn: 'حفظ بيانات الطالب',
    updateRecordBtn: 'تحديث بيانات الطالب',
    savingBtn: 'جاري الحفظ...',
    clearFormBtn: 'إفراغ الحقول',
    cancelEditBtn: 'إلغاء التعديل',
    iraqFormatHelp: 'الشبكات العراقية: زين (078/079)، آسيا سيل (077)، كورك (075)',
    ageYearsOld: 'سنة',
    optionalTag: 'اختياري',
    requiredTag: 'إجباري',
    todayDateInsertedNotice: 'تم إدراج تاريخ اليوم تلقائياً!',

    directoryTitle: 'سجل الطلاب // عرض قاعدة البيانات',
    directorySubtitle: 'بحث، تصفية بحسب المحافظة أو الجنس، استعراض بيانات الطلاب وتعديل السجلات.',
    searchPlaceholder: 'بحث بالاسم، رقم الهاتف، رقم الوصل، المحافظة...',
    clearSearch: 'مسح',
    filterProvinceAll: 'المحافظة: كل محافظات العراق',
    filterGenderAll: 'الجنس: الكل',
    filterDateAll: 'التاريخ: جميع التواريخ',
    filterDateToday: 'تسجيلات اليوم',
    filterDateWeek: 'آخر 7 أيام',
    filterDateMonth: 'هذا الشهر',
    filterDateCustom: 'تاريخ مخصص...',
    exportCsvBtn: 'تصدير ملف CSV',
    refreshBtn: 'تحديث السجلات',
    colStudentName: 'اسم الطالب',
    colPlaceOfLiving: 'مكان السكن',
    colDOB: 'الميلاد',
    colStudentPhone: 'هاتف الطالب',
    colParentsPhone: 'هاتف ولي الأمر',
    colReceiptNo: 'رقم الوصل',
    colCollected: 'تاريخ التسجيل',
    colActions: 'الإجراءات',
    noRecordsFound: 'لم يتم العثور على سجلات',
    noRecordsFoundDesc: 'لا توجد بيانات تطابق معايير البحث أو التصفية الحالية. جرب تغيير أو إزالة الفلاتر.',
    clearSearchAndFilters: 'إلغاء البحث والتصفية',
    showingRecords: 'عرض',
    ofTotal: 'من أصل',
    totalStudentsLabel: 'إجمالي الطلاب المسجلين',
    recordsAutoPersisted: 'سجل التسجيل الأكاديمي • حفظ تلقائي في قاعدة البيانات',
    todayBadge: 'اليوم',
    noneLabel: 'غير محدد',

    profileDetailsTitle: 'تفاصيل الملف الأكاديمي للطالب',
    studentProfileId: 'ملف الطالب • المعرف',
    contactInformationTitle: 'معلومات الاتصال والهواتف',
    primaryStudentPhone: 'رقم الهاتف الأساسي للطالب',
    placeOfLivingTitle: 'مكان السكن والإقامة في العراق',
    provinceTitle: 'المحافظة',
    residenceDetailsTitle: 'تفاصيل العنوان والسكن',
    receiptAndAdminTitle: 'البيانات المالية والإدارية',
    receiptNoModalLabel: 'رقم الوصل المالي / الإداري',
    noAddressNoted: 'لم يتم تدوين عنوان تفصيلي',
    noParentPhoneNoted: 'لم يتم تزويد رقم هاتف ولي الأمر',
    noReceiptNoted: 'لا يوجد رقم وصل مسجل',
    createdLabel: 'تاريخ الإنشاء',
    updatedLabel: 'آخر تحديث',
    closeBtn: 'إغلاق',
    editStudentBtn: 'تعديل البيانات',
    deleteRecordBtn: 'حذف السجل',

    deleteModalTitle: 'تأكيد حذف قيد الطالب',
    deleteModalConfirmText: 'هل أنت متأكد من رغبتك في حذف سجل بيانات الطالب نهائياً:',
    deleteModalWarning: 'هذا الإجراء نهائي ولا يمكن التراجع عنه، وسيتم إزالة بيانات الطالب من قاعدة البيانات.',
    confirmDeleteBtn: 'نعم، احذف السجل',
    deletingBtn: 'جاري الحذف...',
    cancelDeleteBtn: 'إلغاء',

    valNameRequired: 'اسم الطالب مطلوب.',
    valNameMin: 'يجب أن يتكون اسم الطالب من حرفين على الأقل.',
    valNameMax: 'اسم الطالب لا يمكن أن يتجاوز 100 حرف.',
    valBirthRequired: 'تاريخ الميلاد مطلوب.',
    valBirthFuture: 'لا يمكن أن يكون تاريخ الميلاد في المستقبل.',
    valBirthValid: 'يرجى إدخال تاريخ ميلاد صالح (بعد عام 1920).',
    valPhoneRequired: 'رقم الهاتف الأساسي مطلوب.',
    valPhoneInvalid: 'يرجى إدخال رقم هاتف عراقي صالح (مثال: 07801234567 أو 07701234567 أو بالصيغة الدولية +964).',
    valParentPhoneInvalid: 'رقم هاتف ولي الأمر غير صالح. يرجى استخدام صيغة صحيحة (مثال: 07501234567).',
    valParentPhoneIdentical: 'لا يمكن أن يكون رقم ولي الأمر مطابقاً تماماً لرقم هاتف الطالب الأساسي.',
    valGenderInvalid: 'يرجى تحديد جنس الطالب (ذكر أو أنثى).',
    valCollectionDateRequired: 'تاريخ استلام البيانات مطلوب. اضغط "إدراج تاريخ اليوم".',
    valCollectionDateFormat: 'يجب أن يكون تاريخ الاستلام بصيغة YYYY-MM-DD.',

    carrierZain: 'زين العراق (Zain)',
    carrierAsiacell: 'آسيا سيل (Asiacell)',
    carrierKorek: 'كورك تيليكوم (Korek)',
    carrierIraqMobile: 'شبكة عراقية',
    carrierInternational: 'رقم دولي',

    footerCopyright: '© 2026 قسم شؤون الطلبة والتسجيل الموحد. جميع الحقوق محفوظة.',
    footerPrivacy: 'سياسة الخصوصية',
    footerCompliance: 'حماية البيانات',
    footerSheets: 'التكامل مع جداول Google Sheets',
  },
};

/**
 * Hook or helper to format localized dates
 */
export function formatLocalizedDate(dateStr?: string, lang: Language = 'en'): string {
  if (!dateStr) return '—';
  try {
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) return dateStr;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString(lang === 'ar' ? 'ar-IQ' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
