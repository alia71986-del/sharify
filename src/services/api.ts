import { Student, StudentFormData } from '../types';

const LOCAL_STORAGE_KEY = 'university_students_cache_v1';

// Seed data if API is loading or fallback needed
const DEFAULT_STUDENTS: Student[] = [
  {
    id: 'std-2026-001',
    studentName: 'Ali Hussein Al-Moussawi',
    birthDate: '2004-03-15',
    phoneNumber: '07801234567',
    additionalPhoneNumber: '07709876543',
    collectionDate: '2026-08-26',
    createdAt: '2026-08-26T09:15:00.000Z',
    updatedAt: '2026-08-26T09:15:00.000Z',
    department: 'Computer Science & Engineering',
    academicYear: 'Year 2',
    notes: 'Transferred from University of Baghdad.',
  },
  {
    id: 'std-2026-002',
    studentName: 'Zainab Kareem Al-Saadi',
    birthDate: '2003-11-22',
    phoneNumber: '07705551234',
    additionalPhoneNumber: '',
    collectionDate: '2026-08-26',
    createdAt: '2026-08-26T10:30:00.000Z',
    updatedAt: '2026-08-26T10:30:00.000Z',
    department: 'Information Technology',
    academicYear: 'Year 3',
    notes: 'Dean honor list student.',
  },
  {
    id: 'std-2026-003',
    studentName: 'Mustafa Ahmed Al-Janabi',
    birthDate: '2005-06-08',
    phoneNumber: '07503338899',
    additionalPhoneNumber: '07804441122',
    collectionDate: '2026-08-25',
    createdAt: '2026-08-25T14:20:00.000Z',
    updatedAt: '2026-08-25T14:20:00.000Z',
    department: 'Civil Engineering',
    academicYear: 'Year 1',
    notes: 'Freshman student registration.',
  },
  {
    id: 'std-2026-004',
    studentName: 'Maryam Hassan Al-Basri',
    birthDate: '2004-09-18',
    phoneNumber: '07817774433',
    additionalPhoneNumber: '',
    collectionDate: '2026-08-24',
    createdAt: '2026-08-24T11:00:00.000Z',
    updatedAt: '2026-08-24T11:00:00.000Z',
    department: 'Biomedical Sciences',
    academicYear: 'Year 2',
    notes: 'Laboratory safety training completed.',
  },
  {
    id: 'std-2026-005',
    studentName: 'Omar Tariq Al-Nuaimi',
    birthDate: '2002-12-04',
    phoneNumber: '+9647809988776',
    additionalPhoneNumber: '07712233445',
    collectionDate: '2026-08-20',
    createdAt: '2026-08-20T08:45:00.000Z',
    updatedAt: '2026-08-20T08:45:00.000Z',
    department: 'Business Administration',
    academicYear: 'Year 4',
    notes: 'Graduation project team lead.',
  },
];

function getLocalCache(): Student[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('LocalStorage read error:', e);
  }
  return DEFAULT_STUDENTS;
}

function setLocalCache(students: Student[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(students));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
}

export const StudentService = {
  /**
   * Fetch all students from backend API with localStorage backup
   */
  async getAll(): Promise<Student[]> {
    try {
      const res = await fetch('/api/students');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setLocalCache(json.data);
          return json.data;
        }
      }
    } catch (err) {
      console.warn('API unavailable, using local cache:', err);
    }
    return getLocalCache();
  },

  /**
   * Save a new student record
   */
  async create(data: StudentFormData): Promise<{ success: boolean; data: Student; message: string }> {
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const current = getLocalCache();
          setLocalCache([json.data, ...current]);
          return {
            success: true,
            data: json.data,
            message: json.message || 'Student information saved successfully.',
          };
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to save student record.');
      }
    } catch (err: any) {
      console.warn('Backend write failed, saving locally:', err);
      // Fallback local creation
      const nowIso = new Date().toISOString();
      const localStudent: Student = {
        id: `std-loc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        studentName: data.studentName.trim(),
        birthDate: data.birthDate.trim(),
        phoneNumber: data.phoneNumber.trim(),
        additionalPhoneNumber: data.additionalPhoneNumber ? data.additionalPhoneNumber.trim() : '',
        collectionDate: data.collectionDate.trim(),
        notes: data.notes?.trim() || '',
        department: data.department?.trim() || '',
        academicYear: data.academicYear?.trim() || '',
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      const current = getLocalCache();
      const updated = [localStudent, ...current];
      setLocalCache(updated);
      return {
        success: true,
        data: localStudent,
        message: 'Student information saved successfully.',
      };
    }
    throw new Error('Unable to save student information.');
  },

  /**
   * Update an existing student record
   */
  async update(id: string, data: StudentFormData): Promise<{ success: boolean; data: Student; message: string }> {
    try {
      const res = await fetch(`/api/students/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const current = getLocalCache();
          const updated = current.map((s) => (s.id === id ? json.data : s));
          setLocalCache(updated);
          return {
            success: true,
            data: json.data,
            message: json.message || 'Student information updated successfully.',
          };
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to update student record.');
      }
    } catch (err: any) {
      console.warn('Backend update failed, updating locally:', err);
      const current = getLocalCache();
      const nowIso = new Date().toISOString();
      const target = current.find((s) => s.id === id);
      if (!target) throw new Error('Student record not found.');

      const updatedStudent: Student = {
        ...target,
        studentName: data.studentName.trim(),
        birthDate: data.birthDate.trim(),
        phoneNumber: data.phoneNumber.trim(),
        additionalPhoneNumber: data.additionalPhoneNumber ? data.additionalPhoneNumber.trim() : '',
        collectionDate: data.collectionDate.trim(),
        notes: data.notes !== undefined ? data.notes.trim() : target.notes,
        department: data.department !== undefined ? data.department.trim() : target.department,
        academicYear: data.academicYear !== undefined ? data.academicYear.trim() : target.academicYear,
        updatedAt: nowIso,
      };

      const updatedList = current.map((s) => (s.id === id ? updatedStudent : s));
      setLocalCache(updatedList);
      return {
        success: true,
        data: updatedStudent,
        message: 'Student information updated successfully.',
      };
    }
    throw new Error('Unable to update student information.');
  },

  /**
   * Delete a student record
   */
  async delete(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`/api/students/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const json = await res.json();
        const current = getLocalCache();
        setLocalCache(current.filter((s) => s.id !== id));
        return {
          success: true,
          message: json.message || 'Student record deleted successfully.',
        };
      }
    } catch (err) {
      console.warn('Backend delete failed, removing locally:', err);
    }
    const current = getLocalCache();
    setLocalCache(current.filter((s) => s.id !== id));
    return {
      success: true,
      message: 'Student record deleted successfully.',
    };
  },
};
