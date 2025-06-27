
export const getDay = (dateString: string): string => {
  const date = new Date(dateString);
  return String(date.getDate()).padStart(2, '0');
};

export const getMonth = (dateString: string): string => {
  const date = new Date(dateString);
  return String(date.getMonth() + 1).padStart(2, '0');
};

export const getYear = (dateString: string): string => {
  const date = new Date(dateString);
  return String(date.getFullYear());
};

export const formatDate = (dateString: string): string => {
  const day = getDay(dateString);
  const month = getMonth(dateString);
  const year = getYear(dateString);
  return `${day}/${month}/${year}`;
};

export const getDayOfWeek = (dateString: string): string => {
  const date = new Date(dateString);
  const daysOfWeek = [
    'Chủ nhật',
    'Thứ hai',
    'Thứ ba',
    'Thứ tư',
    'Thứ năm',
    'Thứ sáu',
    'Thứ bảy',
  ];
  return daysOfWeek[date.getDay()];
};

export const formatFullDate = (dateString: string): string => {
  const dayOfWeek = getDayOfWeek(dateString);
  const formattedDate = formatDate(dateString);
  return `${dayOfWeek}, ${formattedDate}`;
};

export const isToday = (dateString: string): boolean => {
  const today = new Date();
  const date = new Date(dateString);
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const customFormatDate = (
  dateString: string,
  options: {
    showDay?: boolean;
    showMonth?: boolean;
    showYear?: boolean;
    showDayOfWeek?: boolean;
    separator?: string;
  },
): string => {
  const { showDay = true, showMonth = true, showYear = true, showDayOfWeek = false, separator = '/' } = options;
  const parts: string[] = [];

  if (showDayOfWeek) {
    parts.push(getDayOfWeek(dateString));
  }
  if (showDay) {
    parts.push(getDay(dateString));
  }
  if (showMonth) {
    parts.push(getMonth(dateString));
  }
  if (showYear) {
    parts.push(getYear(dateString));
  }

  return parts.join(separator);
};