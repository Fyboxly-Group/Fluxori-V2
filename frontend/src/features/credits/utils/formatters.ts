/**
 * Credit Utility Functions
 * Helper functions for formatting credit values and dates
 */

/**
 * Format a credit amount with appropriate sign and formatting
 */
export const formatCreditAmount = (amount: number): string => {
  const sign = amount > 0 ? '+' : '';
  return `${sign}${amount.toLocaleString()}`;
};

/**
 * Format a monetary value with currency
 */
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format a date for display in the UI
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get styling for transaction type
 */
export const getTransactionTypeStyles = (type: string): { color: string; bg: string; icon: string } => {
  switch (type) {
    case 'ALLOCATION':
      return { color: 'green.500', bg: 'green.50', icon: '🎁' };
    case 'PURCHASE':
      return { color: 'blue.500', bg: 'blue.50', icon: '💰' };
    case 'USAGE':
      return { color: 'orange.500', bg: 'orange.50', icon: '⚡' };
    default:
      return { color: 'gray.500', bg: 'gray.50', icon: '💳' };
  }
};