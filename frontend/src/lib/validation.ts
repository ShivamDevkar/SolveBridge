/**
 * Pure TypeScript validation utilities for SolveBid authentication and forms.
 * No external libraries used. Functions perform strict checks without mutating data.
 */

export type FieldErrors<T = Record<string, unknown>> = Partial<Record<keyof T | string, string>>;

export interface ValidationResult<T = Record<string, unknown>> {
  isValid: boolean;
  errors: FieldErrors<T>;
}

/**
 * Validates whether an email string follows standard email formatting.
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates a 10-digit telephone number (Indian standard format without country code or with optional prefix).
 */
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 || (digits.length === 12 && digits.startsWith('91'));
}

/**
 * Enforces strong password rules:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special symbol
 */
export function validatePassword(password: string): string | null {
  if (!password) {
    return 'Password is required.';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter (A-Z).';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter (a-z).';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number (0-9).';
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return 'Password must contain at least one special symbol (!@#$%^&*).';
  }
  return null;
}

/**
 * Checks that password and confirmation match exactly.
 */
export function validatePasswordConfirmation(password: string, confirm: string): string | null {
  if (!confirm) {
    return 'Please confirm your password.';
  }
  if (password !== confirm) {
    return 'Passwords do not match.';
  }
  return null;
}

/**
 * Validates required text field.
 */
export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || typeof value !== 'string' || value.trim() === '') {
    return `${fieldName} is required.`;
  }
  return null;
}

/**
 * Validates terms and conditions acceptance.
 */
export function validateTerms(accepted: boolean): string | null {
  if (!accepted) {
    return 'You must accept the terms of service and marketplace standards to proceed.';
  }
  return null;
}

/**
 * Validates unified login form fields.
 */
export function validateLoginFields(fields: {
  email: string;
  password: string;
}): ValidationResult<{ email: string; password: string }> {
  const errors: FieldErrors<{ email: string; password: string }> = {};

  if (!fields.email || !fields.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!validateEmail(fields.email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!fields.password) {
    errors.password = 'Password is required.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates customer registration payload fields.
 */
export function validateCustomerFields(fields: {
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword?: string;
  city?: string;
  termsAccepted?: boolean;
}): ValidationResult {
  const errors: FieldErrors = {};

  if (fields.firstName !== undefined && fields.lastName !== undefined) {
    const fnErr = validateRequired(fields.firstName, 'First name');
    if (fnErr) errors.firstName = fnErr;

    const lnErr = validateRequired(fields.lastName, 'Last name');
    if (lnErr) errors.lastName = lnErr;
  } else if (fields.name !== undefined) {
    const nameErr = validateRequired(fields.name, 'Full name');
    if (nameErr) errors.name = nameErr;
  }

  if (!fields.email || !fields.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!validateEmail(fields.email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!fields.phone || !fields.phone.trim()) {
    errors.phone = 'Phone number is required.';
  } else if (!validatePhone(fields.phone)) {
    errors.phone = 'Please enter a valid 10-digit mobile number.';
  }

  const passwordErr = validatePassword(fields.password);
  if (passwordErr) errors.password = passwordErr;

  if (fields.confirmPassword !== undefined) {
    const confirmErr = validatePasswordConfirmation(fields.password, fields.confirmPassword);
    if (confirmErr) errors.confirmPassword = confirmErr;
  }

  if (fields.city !== undefined) {
    const cityErr = validateRequired(fields.city, 'Service city');
    if (cityErr) errors.city = cityErr;
  }

  if (fields.termsAccepted !== undefined) {
    const termsErr = validateTerms(fields.termsAccepted);
    if (termsErr) errors.termsAccepted = termsErr;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates professional registration payload fields.
 */
export function validateProfessionalFields(fields: {
  businessName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword?: string;
  category: string;
  skills: string[];
  coverageRadius: string;
}): ValidationResult {
  const errors: FieldErrors = {};

  const businessErr = validateRequired(fields.businessName, 'Business or professional name');
  if (businessErr) errors.businessName = businessErr;

  if (!fields.email || !fields.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!validateEmail(fields.email)) {
    errors.email = 'Please enter a valid business email address.';
  }

  if (!fields.phone || !fields.phone.trim()) {
    errors.phone = 'Contact phone number is required.';
  } else if (!validatePhone(fields.phone)) {
    errors.phone = 'Please enter a valid 10-digit contact number.';
  }

  const passwordErr = validatePassword(fields.password);
  if (passwordErr) errors.password = passwordErr;

  if (fields.confirmPassword !== undefined) {
    const confirmErr = validatePasswordConfirmation(fields.password, fields.confirmPassword);
    if (confirmErr) errors.confirmPassword = confirmErr;
  }

  const categoryErr = validateRequired(fields.category, 'Primary service category');
  if (categoryErr) errors.category = categoryErr;

  if (!fields.skills || fields.skills.length === 0) {
    errors.skills = 'Please select or add at least one initial skill.';
  }

  if (!fields.coverageRadius || !fields.coverageRadius.trim()) {
    errors.coverageRadius = 'Service coverage radius is required.';
  } else {
    const radiusNum = Number(fields.coverageRadius);
    if (isNaN(radiusNum) || radiusNum < 5 || radiusNum > 25) {
      errors.coverageRadius = 'Coverage radius must be between 5 and 25 km.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates fields for self-service forgot password submission.
 */
export function validateForgotPasswordFields(fields: {
  email: string;
}): ValidationResult<{ email: string }> {
  const errors: FieldErrors<{ email: string }> = {};

  if (!fields.email || !fields.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!validateEmail(fields.email)) {
    errors.email = 'Please enter a valid email address.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates fields for password reset submission.
 */
export function validateResetPasswordFields(fields: {
  password: string;
  confirmPassword: string;
}): ValidationResult<{ password: string; confirmPassword: string }> {
  const errors: FieldErrors<{ password: string; confirmPassword: string }> = {};

  const passwordErr = validatePassword(fields.password);
  if (passwordErr) errors.password = passwordErr;

  const confirmErr = validatePasswordConfirmation(fields.password, fields.confirmPassword);
  if (confirmErr) errors.confirmPassword = confirmErr;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates customer profile update payload.
 */
export function validateCustomerProfile(fields: {
  name: string;
  phone: string;
  city: string;
}): ValidationResult<{ name: string; phone: string; city: string }> {
  const errors: FieldErrors<{ name: string; phone: string; city: string }> = {};

  const nameErr = validateRequired(fields.name, 'Full name');
  if (nameErr) errors.name = nameErr;

  if (!fields.phone || !fields.phone.trim()) {
    errors.phone = 'Phone number is required.';
  } else if (!validatePhone(fields.phone)) {
    errors.phone = 'Please enter a valid 10-digit phone number.';
  }

  const cityErr = validateRequired(fields.city, 'Preferred service city');
  if (cityErr) errors.city = cityErr;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates professional profile update payload.
 */
export function validateProfessionalProfile(fields: {
  businessName: string;
  phone: string;
  category: string;
  skills: string[];
  coverageRadius: string;
}): ValidationResult<{
  businessName: string;
  phone: string;
  category: string;
  skills: string;
  coverageRadius: string;
}> {
  const errors: FieldErrors<{
    businessName: string;
    phone: string;
    category: string;
    skills: string;
    coverageRadius: string;
  }> = {};

  const nameErr = validateRequired(fields.businessName, 'Business or trading name');
  if (nameErr) errors.businessName = nameErr;

  if (!fields.phone || !fields.phone.trim()) {
    errors.phone = 'Contact phone number is required.';
  } else if (!validatePhone(fields.phone)) {
    errors.phone = 'Please enter a valid 10-digit contact number.';
  }

  const categoryErr = validateRequired(fields.category, 'Primary service category');
  if (categoryErr) errors.category = categoryErr;

  if (!fields.skills || fields.skills.length === 0) {
    errors.skills = 'Please specify at least one trade skill.';
  }

  if (!fields.coverageRadius || !fields.coverageRadius.trim()) {
    errors.coverageRadius = 'Service coverage radius is required.';
  } else {
    const num = Number(fields.coverageRadius);
    if (isNaN(num) || num < 5 || num > 25) {
      errors.coverageRadius = 'Coverage radius must be between 5 and 25 km.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates change password payload for authenticated users.
 */
export function validateChangePassword(fields: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): ValidationResult<{ currentPassword: string; newPassword: string; confirmPassword: string }> {
  const errors: FieldErrors<{ currentPassword: string; newPassword: string; confirmPassword: string }> = {};

  if (!fields.currentPassword) {
    errors.currentPassword = 'Current password is required.';
  }

  const passwordErr = validatePassword(fields.newPassword);
  if (passwordErr) errors.newPassword = passwordErr;

  const confirmErr = validatePasswordConfirmation(fields.newPassword, fields.confirmPassword);
  if (confirmErr) errors.confirmPassword = confirmErr;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates Step 1 of Problem Posting Wizard (Problem Description).
 */
export function validateProblemStep1(fields: {
  title: string;
  description: string;
}): ValidationResult<{ title: string; description: string }> {
  const errors: FieldErrors<{ title: string; description: string }> = {};

  const cleanTitle = (fields.title || '').trim();
  if (!cleanTitle) {
    errors.title = 'Problem title is required.';
  } else if (cleanTitle.length < 5) {
    errors.title = 'Title must be at least 5 characters long.';
  } else if (cleanTitle.length > 100) {
    errors.title = 'Title cannot exceed 100 characters.';
  }

  const cleanDesc = (fields.description || '').trim();
  if (!cleanDesc) {
    errors.description = 'Please describe the symptoms you are experiencing.';
  } else if (cleanDesc.length < 20) {
    errors.description = 'Please provide at least 20 characters describing the issue in detail.';
  } else if (cleanDesc.length > 1000) {
    errors.description = 'Description cannot exceed 1000 characters.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates Step 3 of Problem Posting Wizard (Approximate Location).
 */
export function validateProblemStep3(fields: {
  city: string;
  neighborhood: string;
}): ValidationResult<{ city: string; neighborhood: string }> {
  const errors: FieldErrors<{ city: string; neighborhood: string }> = {};

  if (!fields.city || !fields.city.trim()) {
    errors.city = 'Please select your service city.';
  }

  const cleanArea = (fields.neighborhood || '').trim();
  if (!cleanArea) {
    errors.neighborhood = 'Locality or neighborhood is required.';
  } else if (cleanArea.length < 2) {
    errors.neighborhood = 'Locality name must be at least 2 characters.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates Step 4 of Problem Posting Wizard (Urgency & Availability).
 */
export function validateProblemStep4(fields: {
  urgency: string;
  preferredDate: string;
  preferredTimeWindow: string;
}): ValidationResult<{ urgency: string; preferredDate: string; preferredTimeWindow: string }> {
  const errors: FieldErrors<{ urgency: string; preferredDate: string; preferredTimeWindow: string }> = {};

  const validUrgencies = ['NORMAL', 'SOON', 'URGENT'];
  if (!fields.urgency || !validUrgencies.includes(fields.urgency)) {
    errors.urgency = 'Please select an urgency level.';
  }

  if (!fields.preferredDate || !fields.preferredDate.trim()) {
    errors.preferredDate = 'Please select a preferred service date.';
  }

  if (!fields.preferredTimeWindow || !fields.preferredTimeWindow.trim()) {
    errors.preferredTimeWindow = 'Please select a preferred arrival window.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
