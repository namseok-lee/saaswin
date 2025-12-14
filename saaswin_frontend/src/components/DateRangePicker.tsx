import { LocalizationProvider } from '@mui/x-date-pickers';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/ko';

interface DateRangePickerProps {
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
    value: object;
    defaultValue?: object;
}

export default function SwDateRangePicker({
    className = '',
    label,
    id,
    asterisk = false,
    validationText = '',
    disabled = false,
    vertical,
    error,
    color,
    value,
    defaultValue,
    onChange,
}: DateRangePickerProps) {
    return (
        <div
            className={`datePicker dateRangePicker ${className} ${vertical ? 'vertical' : ''}  ${
                error ? 'error' : ''
            } ${color === 'white' ? 'white' : ''}`}
        >
            <div className='row'>
                {label && (
                    <label htmlFor={id} className='label'>
                        {label}
                        {asterisk && <span className='asterisk'>*</span>}
                    </label>
                )}
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='ko'>
                    <DateRangePicker
                        disabled={disabled}
                        slotProps={{
                            actionBar: {
                                actions: ['accept', 'cancel'],
                            },
                        }}
                        localeText={{ start: 'YYYY.MM.DD', end: 'YYYY.MM.DD' }}
                        calendars={1}
                        showDaysOutsideCurrentMonth={true}
                        value={value}
                        onChange={onChange}
                    />
                </LocalizationProvider>
            </div>
            {validationText != '' && <div className='validationText'>{validationText}</div>}
        </div>
    );
}
