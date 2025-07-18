/**
 * Generate a unique ID
 */
export const generateId = (): string => {
  return crypto.randomUUID();
};

/**
 * Delay execution for a specified time
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Truncate text to a specified length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};