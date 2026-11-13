export type FieldErrors = Record<string, string>;

export const PLMUN_EMAIL_SUFFIX = '@plmun.edu.ph';

export function isValidPlmunEmail(email: string): boolean {
  return /^[^\s@]+@plmun\.edu\.ph$/i.test(email.trim());
}

export function validateEmail(email: string): string | undefined {
  if (!email.trim()) return 'Enter your PLMun email address.';
  if (!isValidPlmunEmail(email)) return 'Use your PLMun email (ending in @plmun.edu.ph).';
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (!password) return 'Enter your password.';
  if (password.length < 8) return 'Use at least 8 characters.';
  return undefined;
}

export function validateName(name: string): string | undefined {
  const trimmed = name.trim();
  if (!trimmed) return 'Enter your full name.';
  if (trimmed.length < 2) return 'That name looks too short.';
  if (trimmed.length > 80) return 'Keep your name under 80 characters.';
  return undefined;
}

export function validateStudentId(studentId: string): string | undefined {
  const trimmed = studentId.trim();
  if (!trimmed) return 'Enter your student ID.';
  if (!/^[A-Za-z0-9-]{4,20}$/.test(trimmed)) {
    return 'Use 4–20 letters, numbers, or dashes.';
  }
  return undefined;
}

export function validatePhone(phone: string): string | undefined {
  if (!phone.trim()) return undefined;
  if (!/^[0-9+()\s-]{7,20}$/.test(phone.trim())) return 'Enter a valid contact number.';
  return undefined;
}

export function validateDetails(details: string, required = false): string | undefined {
  if (required && !details.trim()) return 'Tell us what you need.';
  if (details.trim().length > 300) return 'Keep this under 300 characters.';
  return undefined;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
