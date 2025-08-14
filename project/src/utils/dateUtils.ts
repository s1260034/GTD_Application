/**
 * Format a date for display
 * @param date The date to format
 * @param includeDay Whether to include the day of the week
 * @returns Formatted date string
 */
export const formatDate = (date?: Date, includeDay: boolean = false): string => {
  if (!date) return 'No date';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  let formatted = `${year}/${month}/${day}`;
  
  if (includeDay) {
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    const dayOfWeek = dayNames[date.getDay()];
    formatted += `(${dayOfWeek})`;
  }
  
  return formatted;
};

/**
 * Check if a date is today
 */
export const isToday = (date?: Date): boolean => {
  if (!date) return false;
  
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Check if a date is in the past
 */
export const isPast = (date?: Date): boolean => {
  if (!date) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  
  return compareDate < today;
};

/**
 * Get a relative date string (e.g., "Today", "Tomorrow", "Yesterday")
 */
export const getRelativeDate = (date?: Date): string => {
  if (!date) return 'No date';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  
  if (compareDate.getTime() === today.getTime()) {
    return '今日';
  } else if (compareDate.getTime() === tomorrow.getTime()) {
    return '明日';
  } else if (compareDate.getTime() === yesterday.getTime()) {
    return '昨日';
  } else {
    return formatDate(date, true);
  }
};