import i18next from 'i18next';

export const formatters = {
  number: (value: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat(i18next.language, options).format(value);
  },

  currency: (value: number, currency = 'USD') => {
    return new Intl.NumberFormat(i18next.language, {
      style: 'currency',
      currency,
    }).format(value);
  },

  date: (value: Date | string | number, options?: Intl.DateTimeFormatOptions) => {
    const date = value instanceof Date ? value : new Date(value);
    return new Intl.DateTimeFormat(i18next.language, options).format(date);
  },

  relativeTime: (value: number, unit: Intl.RelativeTimeFormatUnit) => {
    return new Intl.RelativeTimeFormat(i18next.language, {
      numeric: 'auto',
    }).format(value, unit);
  },

  compact: (value: number) => {
    return new Intl.NumberFormat(i18next.language, {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(value);
  },
};

export const formatTokens = (count: number) => {
  return formatters.compact(count);
};

export const formatPrice = (amount: number, currency = 'USD') => {
  return formatters.currency(amount, currency);
};

export const formatDate = (date: Date | string | number) => {
  return formatters.date(date, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTime = (date: Date | string | number) => {
  return formatters.date(date, {
    hour: 'numeric',
    minute: 'numeric',
  });
};

export const formatDateTime = (date: Date | string | number) => {
  return `${formatDate(date)} ${formatTime(date)}`;
};

export const formatRelativeTime = (date: Date | string | number) => {
  const now = Date.now();
  const then = date instanceof Date ? date.getTime() : new Date(date).getTime();
  const diffInSeconds = Math.floor((then - now) / 1000);

  if (Math.abs(diffInSeconds) < 60) {
    return formatters.relativeTime(diffInSeconds, 'second');
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (Math.abs(diffInMinutes) < 60) {
    return formatters.relativeTime(diffInMinutes, 'minute');
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (Math.abs(diffInHours) < 24) {
    return formatters.relativeTime(diffInHours, 'hour');
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (Math.abs(diffInDays) < 30) {
    return formatters.relativeTime(diffInDays, 'day');
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (Math.abs(diffInMonths) < 12) {
    return formatters.relativeTime(diffInMonths, 'month');
  }
  
  const diffInYears = Math.floor(diffInDays / 365);
  return formatters.relativeTime(diffInYears, 'year');
}; 