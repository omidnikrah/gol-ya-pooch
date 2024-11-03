export const convertToPersianNumbers = (number: number | string): string => {
  const persianNumbers: string[] = [
    '۰',
    '۱',
    '۲',
    '۳',
    '۴',
    '۵',
    '۶',
    '۷',
    '۸',
    '۹',
  ];

  return String(number)
    .split('')
    .map((num) => persianNumbers[parseInt(num)] || num)
    .join('');
};
