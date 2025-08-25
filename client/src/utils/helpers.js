import { format, parseISO, isValid } from 'date-fns';
import { id } from 'date-fns/locale';

/**
 * Format date to Indonesian locale
 * @param {string|Date} date - Date to format
 * @param {string} formatStr - Format string (default: 'dd MMM yyyy')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatStr = 'dd MMM yyyy') => {
  if (!date) return '-';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '-';
    
    return format(dateObj, formatStr, { locale: id });
  } catch (error) {
    console.error('Date formatting error:', error);
    return '-';
  }
};

/**
 * Format date to YYYY-MM-DD for input fields
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDateForInput = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    
    return format(dateObj, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string} Today's date
 */
export const getTodayDate = () => {
  return format(new Date(), 'yyyy-MM-dd');
};

/**
 * Format number with thousand separators
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('id-ID').format(num);
};

/**
 * Debounce function to limit API calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Get status badge class name
 * @param {string} status - Status value
 * @returns {string} CSS class name
 */
export const getStatusClass = (status) => {
  const statusClasses = {
    pending: 'status-pending',
    approved: 'status-approved',
    rejected: 'status-rejected',
    dipinjam: 'status-dipinjam',
    dikembalikan: 'status-dikembalikan',
  };
  
  return statusClasses[status] || 'status-pending';
};

/**
 * Get status text in Indonesian
 * @param {string} status - Status value
 * @returns {string} Indonesian status text
 */
export const getStatusText = (status) => {
  const statusTexts = {
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    dipinjam: 'Dipinjam',
    dikembalikan: 'Dikembalikan',
  };
  
  return statusTexts[status] || status;
};