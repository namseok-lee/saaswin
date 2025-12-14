import { LocalizationProvider } from '@mui/x-date-pickers';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/ko';

interface DateRangePickerProps2 {
    className?: string;
    id: string;
    label?: string;
    asterisk?: boolean;
    validationText?: string;
    onChange?: (newValue: any) => void; // 타입 수정
    disabled?: boolean;
    vertical?: boolean;
    error?: boolean;
    color?: 'white';
    value: object;
    defaultValue?: object;
}

export default function SwDateRangePicker2({
    className = '',
    label,
    id,
    asterisk = false,
    validationText = '',
    onChange, // onChange 이벤트 핸들러 추가
    disabled = false,
    vertical,
    error,
    color,
    value,
    defaultValue,
}: DateRangePickerProps2) {
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
                        // 중요: onChange 핸들러 추가
                        onChange={(newValue) => {
                            console.log('DateRangePicker 값 변경:', id, newValue);
                            // 상위 컴포넌트에 변경 이벤트 전달
                            if (onChange) {
                                onChange(newValue);
                            }
                        }}
                    />
                </LocalizationProvider>
            </div>
            {validationText != '' && <div className='validationText'>{validationText}</div>}
        </div>
    );
}
