import { LocalizationProvider, MonthCalendar } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/ko';

interface MonthCalendarProps {
    className?: string;
    id?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
}

export default function SwMonthCalendar({ className = '', id, disabled = false }: MonthCalendarProps) {
    return (
        <div className={`dateCalendar monthCalendar ${className}`} id={id}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='ko'>
                <MonthCalendar disabled={disabled} />
            </LocalizationProvider>
        </div>
    );
}
