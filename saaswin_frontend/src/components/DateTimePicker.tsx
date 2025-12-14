import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/ko';

interface DateTimePickerProps {
    className?: string;
    id: string;
    label?: string;
    asterisk?: boolean;
    validationText?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    vertical?: boolean;
    error?: boolean;
}

export default function SwDateTimePicker({
    className = '',
    label,
    id,
    asterisk = false,
    validationText = '',
    disabled = false,
    vertical,
    error,
}: DateTimePickerProps) {
    return (
        <div className={`datePicker dateTimePicker${className} ${vertical ? 'vertical' : ''}  ${error ? 'error' : ''}`}>
            <div className='row'>
                {label && (
                    <label htmlFor={id} className='label'>
                        {label}
                        {asterisk && <span className='asterisk'>*</span>}
                    </label>
                )}
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='ko'>
                    <DateTimePicker
                        disabled={disabled}
                        slotProps={{
                            actionBar: {
                                actions: ['accept', 'cancel'],
                            },
                        }}
                        showDaysOutsideCurrentMonth={true}
                    />
                </LocalizationProvider>
            </div>
            {validationText != '' && <div className='validationText'>{validationText}</div>}
        </div>
    );
}
