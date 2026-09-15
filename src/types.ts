export type Language = 'en' | 'ar';

export interface Student {
  id: string;
  studentName: string;
  gender?: 'male' | 'female' | ''; // Male / Female (ذكر / أنثى)
  birthDate: string; // YYYY-MM-DD
  phoneNumber: string; // Primary phone (e.g. 07801234567 or +964...)
  parentPhoneNumber?: string; // Parents Phone Number (رقم هاتف ولي الأمر)
  additionalPhoneNumber?: string; // Kept for backward compatibility
  province?: string; // Iraqi Province (Default: Al-Najaf / النجف الأشرف)
  residenceDetails?: string; // Detailed living location (district, neighborhood, street)
  collectionDate: string; // YYYY-MM-DD
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
  receiptNo?: string; // Receipt No. (رقم الوصل)
  notes?: string; // Legacy alias for receipt/notes
  department?: string; // Optional legacy field
  academicYear?: string;
  status?: 'active' | 'graduated' | 'suspended' | 'pending';
}

export interface StudentFormData {
  studentName: string;
  gender: 'male' | 'female' | '';
  birthDate: string;
  phoneNumber: string;
  parentPhoneNumber: string;
  additionalPhoneNumber?: string;
  province: string;
  residenceDetails: string;
  collectionDate: string;
  receiptNo: string;
  notes?: string;
  department?: string;
  academicYear?: string;
}

export interface ValidationErrors {
  studentName?: string;
  gender?: string;
  birthDate?: string;
  phoneNumber?: string;
  parentPhoneNumber?: string;
  additionalPhoneNumber?: string;
  province?: string;
  residenceDetails?: string;
  collectionDate?: string;
  receiptNo?: string;
  general?: string;
}

export type SortField = 'studentName' | 'birthDate' | 'collectionDate' | 'createdAt' | 'province' | 'receiptNo';
export type SortOrder = 'asc' | 'desc';

export interface FilterOptions {
  searchQuery: string;
  collectionDateFilter: string;
  sortField: SortField;
  sortOrder: SortOrder;
  province?: string;
  gender?: string;
}

export interface UniversityStats {
  totalStudents: number;
  todayCount: number;
  thisMonthCount: number;
  withParentsPhoneCount: number;
}

export interface IraqProvince {
  id: string;
  nameEn: string;
  nameAr: string;
  region: string;
}

export const IRAQ_PROVINCES: IraqProvince[] = [
  { id: 'najaf', nameEn: 'Al-Najaf', nameAr: 'النجف الأشرف', region: 'Middle Euphrates' },
  { id: 'baghdad', nameEn: 'Baghdad', nameAr: 'بغداد', region: 'Central' },
  { id: 'basra', nameEn: 'Basra', nameAr: 'البصرة', region: 'Southern' },
  { id: 'karbala', nameEn: 'Karbala', nameAr: 'كربلاء المقدسة', region: 'Middle Euphrates' },
  { id: 'babil', nameEn: 'Babil (Babylon)', nameAr: 'بابل (الحلة)', region: 'Central' },
  { id: 'nineveh', nameEn: 'Nineveh (Mosul)', nameAr: 'نينوى (الموصل)', region: 'Northern' },
  { id: 'erbil', nameEn: 'Erbil', nameAr: 'أربيل', region: 'Kurdistan' },
  { id: 'sulaymaniyah', nameEn: 'Sulaymaniyah', nameAr: 'السليمانية', region: 'Kurdistan' },
  { id: 'duhok', nameEn: 'Duhok', nameAr: 'دهوك', region: 'Kurdistan' },
  { id: 'kirkuk', nameEn: 'Kirkuk', nameAr: 'كركوك', region: 'Northern' },
  { id: 'anbar', nameEn: 'Al-Anbar', nameAr: 'الأنبار', region: 'Western' },
  { id: 'wasit', nameEn: 'Wasit (Kut)', nameAr: 'واسط (الكوت)', region: 'Central' },
  { id: 'maysan', nameEn: 'Maysan (Amarah)', nameAr: 'ميسان (العمارة)', region: 'Southern' },
  { id: 'dhi_qar', nameEn: 'Dhi Qar (Nasiriyah)', nameAr: 'ذي قار (الناصرية)', region: 'Southern' },
  { id: 'muthanna', nameEn: 'Al-Muthanna (Samawah)', nameAr: 'المثنى (السماوة)', region: 'Southern' },
  { id: 'qadisiyyah', nameEn: 'Al-Qadisiyyah (Diwaniyah)', nameAr: 'القادسية (الديوانية)', region: 'Middle Euphrates' },
  { id: 'diyala', nameEn: 'Diyala (Baqubah)', nameAr: 'ديالى (بعقوبة)', region: 'Eastern' },
  { id: 'saladin', nameEn: 'Saladin (Tikrit)', nameAr: 'صلاح الدين (تكريت)', region: 'Central' },
  { id: 'halabja', nameEn: 'Halabja', nameAr: 'حلبجة', region: 'Kurdistan' },
];
