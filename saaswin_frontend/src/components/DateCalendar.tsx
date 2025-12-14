import { DateCalendar, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/ko';

interface DateCalendarProps {
    className?: string;
    id?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
}

export default function SwDateCalendar({ className = '', id, disabled = false }: DateCalendarProps) {
    return (
        <div className={`dateCalendar ${className}`} id={id}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='ko'>
                <DateCalendar disabled={disabled} />
            </LocalizationProvider>
        </div>
    );
}
