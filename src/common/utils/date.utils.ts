import { startOfMonth, endOfMonth } from 'date-fns';

export function getMonthRange(yyyyMm: string) {
  const date = new Date(`${yyyyMm}-01`);

  const start = startOfMonth(date);
  const end = endOfMonth(date);

  return { start, end };
}
