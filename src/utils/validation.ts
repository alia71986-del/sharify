import { StudentFormData, ValidationErrors } from '../types';

/**
 * Gets today's date formatted as YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats date string (YYYY-MM-DD) into readable localized format
 */
export function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) return dateStr;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Calculates student's age in years from birth date
 */
export function calculateAge(birthDateStr?: string): number | null {
  if (!birthDateStr) return null;
  try {
    const [year, month, day] = birthDateStr.split('-');
    if (!year || !month || !day) return null;
    const birthDate = new Date(Number(year), Number(month) - 1, Number(day));
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : null;
  } catch {
    return null;
  }
}

/**
 * Detects Iraqi telecom network or generic type
 */
export function detectCarrier(phoneNumber?: string): { name: string; badgeColor: string; isIraqi: boolean } | null {
  if (!phoneNumber) return null;
  const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');

  // Normalized Iraqi local number (e.g., 0780..., +964780..., 00964780...)
  let iraqiPrefix = '';
  if (cleaned.startsWith('+964')) {
    iraqiPrefix = cleaned.slice(4);
  } else if (cleaned.startsWith('00964')) {
    iraqiPrefix = cleaned.slice(5);
  } else if (cleaned.startsWith('07') || cleaned.startsWith('7')) {
    iraqiPrefix = cleaned.startsWith('0') ? cleaned.slice(1) : cleaned;
  }

  if (iraqiPrefix) {
    if (iraqiPrefix.startsWith('78') || iraqiPrefix.startsWith('79')) {
      return { name: 'Zain Iraq', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300', isIraqi: true };
    }
    if (iraqiPrefix.startsWith('77')) {
      return { name: 'AsiaCell', badgeColor: 'bg-purple-100 text-purple-800 border-purple-300', isIraqi: true };
    }
    if (iraqiPrefix.startsWith('75')) {
      return { name: 'Korek', badgeColor: 'bg-amber-100 text-amber-800 border-amber-300', isIraqi: true };
    }
    if (iraqiPrefix.startsWith('7')) {
      return { name: 'Iraq Mobile', badgeColor: 'bg-blue-100 text-blue-800 border-blue-300', isIraqi: true };
    }
  }

  if (cleaned.startsWith('+') || cleaned.length >= 8) {
    return { name: 'International', badgeColor: 'bg-slate-100 text-slate-700 border-slate-300', isIraqi: false };
  }

  return null;
}

/**
 * Validates a single phone number string.
 * Supports:
 * - Iraqi mobile: 07XXXXXXXXX (11 digits, starts with 075/077/078/079/etc.)
 * - Iraqi international: +9647XXXXXXXXX or 009647XXXXXXXXX
 * - International standard numbers: +[country code][number] or clean 8-15 digit string
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.trim().replace(/[\s\-\(\)\.]/g, '');

  // Empty check handled separately
  if (cleaned.length === 0) return false;

  // Iraqi format standard (07 followed by 9 digits = 11 digits total)
  const iraqiLocalRegex = /^07[3-9]\d{8}$/;
  if (iraqiLocalRegex.test(cleaned)) {
    return true;
  }

  // Iraqi international format (+9647XXXXXXXXX or 009647XXXXXXXXX)
  const iraqiIntlRegex = /^(\+964|00964)7[3-9]\d{8}$/;
  if (iraqiIntlRegex.test(cleaned)) {
    return true;
  }

  // General international format with + (7 to 15 digits according to E.164)
  const generalIntlRegex = /^\+[1-9]\d{6,14}$/;
  if (generalIntlRegex.test(cleaned)) {
    return true;
  }

  // Standard digits-only fallback (8 to 15 digits)
  const genericDigitsRegex = /^\d{8,15}$/;
  if (genericDigitsRegex.test(cleaned)) {
    return true;
  }

  return false;
}

/**
 * Validates the entire student form data
 */
export function validateStudentForm(data: StudentFormData): {
  isValid: boolean;
  errors: ValidationErrors;
} {
  const errors: ValidationErrors = {};

  // 1. Student Name validation
  if (!data.studentName || data.studentName.trim().length === 0) {
    errors.studentName = 'Student Name is required.';
  } else if (data.studentName.trim().length < 2) {
    errors.studentName = 'Student Name must be at least 2 characters.';
  } else if (data.studentName.trim().length > 100) {
    errors.studentName = 'Student Name cannot exceed 100 characters.';
  }

  // 2. Birth Date validation
  if (!data.birthDate || data.birthDate.trim().length === 0) {
    errors.birthDate = 'Birth Date is required.';
  } else {
    const today = getTodayDateString();
    if (data.birthDate > today) {
      errors.birthDate = 'Birth Date cannot be a future date.';
    } else if (data.birthDate < '1920-01-01') {
      errors.birthDate = 'Please enter a valid birth date (after 1920).';
    }
  }

  // 3. Primary Phone Number validation
  if (!data.phoneNumber || data.phoneNumber.trim().length === 0) {
    errors.phoneNumber = 'Phone Number is required.';
  } else if (!isValidPhoneNumber(data.phoneNumber)) {
    errors.phoneNumber =
      'Please enter a valid phone number (e.g. 07801234567, 07701234567, or +964 780 123 4567).';
  }

  // 4. Additional Phone Number validation (Optional)
  if (data.additionalPhoneNumber && data.additionalPhoneNumber.trim().length > 0) {
    if (!isValidPhoneNumber(data.additionalPhoneNumber)) {
      errors.additionalPhoneNumber =
        'Additional Phone Number format is invalid. Use e.g. 07501234567 or +964 750 123 4567.';
    } else if (data.additionalPhoneNumber.trim().replace(/\s/g, '') === data.phoneNumber.trim().replace(/\s/g, '')) {
      errors.additionalPhoneNumber =
        'Additional Phone Number cannot be identical to the primary phone number.';
    }
  }

  // 5. Collection Date validation
  if (!data.collectionDate || data.collectionDate.trim().length === 0) {
    errors.collectionDate = 'Collection Date is required. Click "Insert Collection Date".';
  } else {
    // Should be valid format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.collectionDate)) {
      errors.collectionDate = 'Collection Date must be in YYYY-MM-DD format.';
    }
  }

  const isValid = Object.keys(errors).length === 0;
  return { isValid, errors };
}
