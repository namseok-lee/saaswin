import { TimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/ko';

interface TimePickerProps {
    className?: string;
    id: string;
    label?: string;
    asterisk?: boolean;
    validationText?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    vertical?: boolean;
    error?: boolean;
    color?: 'white';
}

export default function SwTimePicker({
    className = '',
    label,
    id,
    asterisk = false,
    validationText = '',
    disabled = false,
    vertical,
    error,
    color,
}: TimePickerProps) {
    return (
        <div
            className={`datePicker timePicker ${className} ${vertical ? 'vertical' : ''} ${error ? 'error' : ''} ${
                color === 'white' ? 'white' : ''
            }`}
        >
            <div className='row'>
                {label && (
                    <label htmlFor={id} className='label'>
                        {label}
                        {asterisk && <span className='asterisk'>*</span>}
                    </label>
                )}
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='ko'>
                    <TimePicker
                        disabled={disabled}
                        slotProps={{
                            actionBar: {
                                actions: ['cancel', 'accept'],
                            },
                        }}
                    />
                </LocalizationProvider>
            </div>
            {validationText != '' && <div className='validationText'>{validationText}</div>}
        </div>
    );
}
