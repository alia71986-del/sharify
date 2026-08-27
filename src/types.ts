export interface Student {
  id: string;
  studentName: string;
  birthDate: string; // YYYY-MM-DD
  phoneNumber: string; // Primary phone (e.g., 07801234567 or +964...)
  additionalPhoneNumber?: string; // Optional phone
  collectionDate: string; // YYYY-MM-DD
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
  notes?: string;
  department?: string;
  academicYear?: string;
  status?: 'active' | 'graduated' | 'suspended' | 'pending';
}

export interface StudentFormData {
  studentName: string;
  birthDate: string;
  phoneNumber: string;
  additionalPhoneNumber: string;
  collectionDate: string;
  notes?: string;
  department?: string;
  academicYear?: string;
}

export interface ValidationErrors {
  studentName?: string;
  birthDate?: string;
  phoneNumber?: string;
  additionalPhoneNumber?: string;
  collectionDate?: string;
  general?: string;
}

export type SortField = 'studentName' | 'birthDate' | 'collectionDate' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

export interface FilterOptions {
  searchQuery: string;
  collectionDateFilter: string; // '' | 'today' | 'this_week' | 'this_month' | specific date 'YYYY-MM-DD'
  sortField: SortField;
  sortOrder: SortOrder;
  department?: string;
}

export interface UniversityStats {
  totalStudents: number;
  todayCount: number;
  thisMonthCount: number;
  withAdditionalPhoneCount: number;
}
