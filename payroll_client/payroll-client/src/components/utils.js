// Constants
export const EMPLOYEE_TYPES = {
  HOURLY: 'hourly',
  SALARIED: 'salaried'
};

export const GENDERS = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
  { value: 'X', label: 'Other' }
];

export const COUNTRIES = [
  'Canada',
  'United States',
  'Mexico',
  'United Kingdom',
  'Australia'
];

export const TIMESHEET_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

export const BENEFIT_STATUSES = {
  ACTIVE: 'active',
  PENDING: 'pending',
  INACTIVE: 'inactive'
};

export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  PAID: 'paid'
};

// Helper Functions
export const formatCurrency = (amount) => {
  if (amount == null || amount === '') return '$0.00';
  return `$${parseFloat(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

export const formatHours = (hours) => {
  if (hours == null || hours === '') return '0h';
  return `${parseFloat(hours).toFixed(1)}h`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US');
};

export const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '';
  const date = new Date(dateTimeString);
  return date.toLocaleString('en-US');
};

export const calculateTotalHours = (clockIn, clockOut, breakMinutes = 0) => {
  if (!clockIn || !clockOut) return 0;
  
  const start = new Date(`2000-01-01 ${clockIn}`);
  const end = new Date(`2000-01-01 ${clockOut}`);
  
  if (end <= start) {
    // Handle next day scenario
    end.setDate(end.getDate() + 1);
  }
  
  const diffMs = end - start;
  const diffHours = diffMs / (1000 * 60 * 60);
  const breakHours = breakMinutes / 60;
  
  return Math.max(0, diffHours - breakHours);
};

export const calculateOvertimeHours = (totalHours, regularHoursThreshold = 40) => {
  return Math.max(0, totalHours - regularHoursThreshold);
};

export const calculateGrossPay = (employee, hoursWorked = 0, overtimeHours = 0) => {
  if (employee.type === EMPLOYEE_TYPES.SALARIED) {
    return employee.salary / 52; // Weekly salary
  } else {
    const regularPay = Math.min(hoursWorked, 40) * employee.hourlyRate;
    const overtimePay = overtimeHours * employee.hourlyRate * 1.5;
    return regularPay + overtimePay;
  }
};

export const calculateNetPay = (grossPay, deductions = 0) => {
  return Math.max(0, grossPay - deductions);
};

export const getEmployeeFullName = (employee) => {
  if (!employee) return '';
  return `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
};

export const getEmployeeStatus = (employee) => {
  const today = new Date();
  const hireDate = new Date(employee.hireDate);
  
  if (hireDate > today) {
    return 'pending';
  }
  
  // Could add more logic for terminated employees, etc.
  return 'active';
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phone) => {
  // Basic phone validation (can be enhanced)
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-()]/g, ''));
};

export const validatePostalCode = (postalCode, country = 'Canada') => {
  if (country === 'Canada') {
    const canadianPostalRegex = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ ]?\d[ABCEGHJ-NPRSTV-Z]\d$/i;
    return canadianPostalRegex.test(postalCode);
  } else if (country === 'United States') {
    const usZipRegex = /^\d{5}(-\d{4})?$/;
    return usZipRegex.test(postalCode);
  }
  return true; // Allow other formats for other countries
};

export const getAgeFromBirthDate = (birthDate) => {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

export const getTenureInYears = (hireDate) => {
  if (!hireDate) return 0;
  const today = new Date();
  const hire = new Date(hireDate);
  return Math.floor((today - hire) / (365.25 * 24 * 60 * 60 * 1000));
};

export const sortByName = (a, b) => {
  const nameA = getEmployeeFullName(a).toLowerCase();
  const nameB = getEmployeeFullName(b).toLowerCase();
  return nameA.localeCompare(nameB);
};

export const sortByDate = (a, b, dateField) => {
  const dateA = new Date(a[dateField] || 0);
  const dateB = new Date(b[dateField] || 0);
  return dateB - dateA; // Most recent first
};

export const filterByStatus = (items, status) => {
  return items.filter(item => item.status === status);
};

export const filterByDateRange = (items, startDate, endDate, dateField = 'date') => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return items.filter(item => {
    const itemDate = new Date(item[dateField]);
    return itemDate >= start && itemDate <= end;
  });
};

export const groupBy = (array, key) => {
  return array.reduce((result, currentValue) => {
    const groupKey = currentValue[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(currentValue);
    return result;
  }, {});
};

export const sumBy = (array, key) => {
  return array.reduce((sum, item) => sum + (parseFloat(item[key]) || 0), 0);
};

export const averageBy = (array, key) => {
  if (array.length === 0) return 0;
  return sumBy(array, key) / array.length;
};

// Form validation helpers
export const required = (value) => {
  return value && value.toString().trim() !== '' ? null : 'This field is required';
};

export const minLength = (min) => (value) => {
  return value && value.length >= min ? null : `Minimum length is ${min} characters`;
};

export const maxLength = (max) => (value) => {
  return !value || value.length <= max ? null : `Maximum length is ${max} characters`;
};

export const isPositiveNumber = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0 ? null : 'Must be a positive number';
};

export const isValidDate = (value) => {
  const date = new Date(value);
  return !isNaN(date.getTime()) ? null : 'Invalid date format';
};

export const isFutureDate = (value) => {
  const date = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today ? null : 'Date must be today or in the future';
};

export const isPastDate = (value) => {
  const date = new Date(value);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return date <= today ? null : 'Date must be today or in the past';
};

// Export utility functions for external use
export const utils = {
  formatCurrency,
  formatHours,
  formatDate,
  formatDateTime,
  calculateTotalHours,
  calculateOvertimeHours,
  calculateGrossPay,
  calculateNetPay,
  getEmployeeFullName,
  getEmployeeStatus,
  validateEmail,
  validatePhoneNumber,
  validatePostalCode,
  getAgeFromBirthDate,
  getTenureInYears,
  sortByName,
  sortByDate,
  filterByStatus,
  filterByDateRange,
  groupBy,
  sumBy,
  averageBy
};

// Export validation functions
export const validators = {
  required,
  minLength,
  maxLength,
  isPositiveNumber,
  isValidDate,
  isFutureDate,
  isPastDate
};