import dayjs from 'dayjs';

export const calculateWorkDuration = (joinDateStr: string, endDateStr?: string): string => {
    if (!joinDateStr || joinDateStr.length !== 8) return '-';

    const start = dayjs(joinDateStr, 'YYYYMMDD');
    const end = endDateStr && endDateStr.length === 8 ? dayjs(endDateStr, 'YYYYMMDD') : dayjs();

    if (!start.isValid() || !end.isValid()) return '-';

    const years = end.diff(start, 'year');
    const months = end.diff(start.add(years, 'year'), 'month');
    const days = end.diff(start.add(years, 'year').add(months, 'month'), 'day');

    return `${years}년 ${months}개월 ${days}일`;
};
