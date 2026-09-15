import { StudentFormData, ValidationErrors, Language } from '../types';
import { translations } from './translations';

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
export function formatDisplayDate(dateStr?: string, lang: Language = 'en'): string {
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
export function detectCarrier(
  phoneNumber?: string,
  lang: Language = 'en'
): { name: string; badgeColor: string; isIraqi: boolean } | null {
  if (!phoneNumber) return null;
  const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');
  const t = translations[lang];

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
      return {
        name: t.carrierZain,
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        isIraqi: true,
      };
    }
    if (iraqiPrefix.startsWith('77')) {
      return {
        name: t.carrierAsiacell,
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        isIraqi: true,
      };
    }
    if (iraqiPrefix.startsWith('75')) {
      return {
        name: t.carrierKorek,
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        isIraqi: true,
      };
    }
    if (iraqiPrefix.startsWith('7')) {
      return {
        name: t.carrierIraqMobile,
        badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
        isIraqi: true,
      };
    }
  }

  if (cleaned.startsWith('+') || cleaned.length >= 8) {
    return {
      name: t.carrierInternational,
      badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
      isIraqi: false,
    };
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
export function validateStudentForm(
  data: StudentFormData,
  lang: Language = 'en'
): {
  isValid: boolean;
  errors: ValidationErrors;
} {
  const t = translations[lang];
  const errors: ValidationErrors = {};

  // 1. Student Name validation
  if (!data.studentName || data.studentName.trim().length === 0) {
    errors.studentName = t.valNameRequired;
  } else if (data.studentName.trim().length < 2) {
    errors.studentName = t.valNameMin;
  } else if (data.studentName.trim().length > 100) {
    errors.studentName = t.valNameMax;
  }

  // 2. Birth Date validation
  if (!data.birthDate || data.birthDate.trim().length === 0) {
    errors.birthDate = t.valBirthRequired;
  } else {
    const today = getTodayDateString();
    if (data.birthDate > today) {
      errors.birthDate = t.valBirthFuture;
    } else if (data.birthDate < '1920-01-01') {
      errors.birthDate = t.valBirthValid;
    }
  }

  // 3. Primary Phone Number validation
  if (!data.phoneNumber || data.phoneNumber.trim().length === 0) {
    errors.phoneNumber = t.valPhoneRequired;
  } else if (!isValidPhoneNumber(data.phoneNumber)) {
    errors.phoneNumber = t.valPhoneInvalid;
  }

  // 4. Parents Phone Number validation (Optional / Secondary contact)
  const parentPhone = (data.parentPhoneNumber || data.additionalPhoneNumber || '').trim();
  if (parentPhone.length > 0) {
    if (!isValidPhoneNumber(parentPhone)) {
      errors.parentPhoneNumber = t.valParentPhoneInvalid;
      errors.additionalPhoneNumber = errors.parentPhoneNumber;
    } else if (parentPhone.replace(/\s/g, '') === data.phoneNumber.trim().replace(/\s/g, '')) {
      errors.parentPhoneNumber = t.valParentPhoneIdentical;
      errors.additionalPhoneNumber = errors.parentPhoneNumber;
    }
  }

  // 5. Gender validation
  if (data.gender && data.gender !== 'male' && data.gender !== 'female' && data.gender !== '') {
    errors.gender = t.valGenderInvalid;
  }

  // 6. Collection Date validation
  if (!data.collectionDate || data.collectionDate.trim().length === 0) {
    errors.collectionDate = t.valCollectionDateRequired;
  } else {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.collectionDate)) {
      errors.collectionDate = t.valCollectionDateFormat;
    }
  }

  const isValid = Object.keys(errors).length === 0;
  return { isValid, errors };
}
