import { LocalizationProvider, MultiSectionDigitalClock } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/ko';

interface DigitalClockProps {
    className?: string;
    id?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
}

export default function SwDigitalClock({ className = '', id, disabled = false }: DigitalClockProps) {
    return (
        <div className={`timePicker ${className}`} id={id}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='ko'>
                <MultiSectionDigitalClock disabled={disabled} />
            </LocalizationProvider>
        </div>
    );
}
