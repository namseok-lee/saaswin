import { TimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/ko';
import SwTimePicker from './TimePicker';

interface TimeRangePickerProps {
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

export default function SwTimeRangePicker({
    className = '',
    label,
    id,
    asterisk = false,
    validationText = '',
    disabled = false,
    vertical,
    error,
    color,
}: TimeRangePickerProps) {
    return (
        <div
            className={`timeRangePicker ${className} ${vertical ? 'vertical' : ''} ${error ? 'error' : ''} ${
                color === 'white' ? 'white' : ''
            }`}
        >
            {label && (
                <label htmlFor={id} className='label'>
                    {label}
                    {asterisk && <span className='asterisk'>*</span>}
                </label>
            )}
            <div className='row'>
                <SwTimePicker id='test100' disabled={disabled} validationText={validationText} />
                <span className='mark'>-</span>
                <SwTimePicker id='test100' disabled={disabled} validationText={validationText} />
            </div>
        </div>
    );
}
