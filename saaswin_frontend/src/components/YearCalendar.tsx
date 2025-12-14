import { LocalizationProvider, YearCalendar } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/ko';

interface YearCalendarProps {
    className?: string;
    id?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
}

export default function SwYearCalendar({ className = '', id, disabled = false }: YearCalendarProps) {
    return (
        <div className={`dateCalendar yearCalendar ${className}`} id={id}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='ko'>
                <YearCalendar disabled={disabled} />
            </LocalizationProvider>
        </div>
    );
}
