import { DateCalendar, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/ko';

interface MonthYearCalendarProps {
    className?: string;
    id?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
}

export default function SwMonthYearCalendar({ className = '', id, disabled = false }: MonthYearCalendarProps) {
    return (
        <div className={`dateCalendar dateCalendar ${className}`} id={id}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='ko'>
                <DateCalendar disabled={disabled} views={['month', 'year']} />
            </LocalizationProvider>
        </div>
    );
}
