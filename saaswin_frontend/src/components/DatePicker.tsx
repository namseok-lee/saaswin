import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ko';

interface DatePickerProps {
    className?: string;
    id?: string;
    name?: string;
    label?: string;
    asterisk?: boolean;
    validationText?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDelete?: () => void;
    disabled?: boolean;
    readonly?: boolean;
    vertical?: boolean;
    error?: boolean;
    value?: Dayjs | null;
    placeHolder?: string;
    color?: 'white';
    maxDate?: Dayjs | null;
}

export default function SwDatePicker({
    className = '',
    label,
    id,
    name,
    asterisk = false,
    validationText = '',
    disabled = false,
    vertical,
    error,
    value,
    readonly,
    onChange,
    onDelete,
    color,
    maxDate,
}: DatePickerProps) {
    return (
        <div
            className={`datePicker ${className} ${vertical ? 'vertical' : ''} ${error ? 'error' : ''} ${
                color === 'white' ? 'white' : ''
            }`}
        >
            <div className="row">
                {label && (
                    <label htmlFor={id} className="label">
                        {label}
                        {asterisk && <span className="asterisk">*</span>}
                    </label>
                )}
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
                    <div className="datepicker-wrapper" style={{ position: 'relative' }}>
                        <DatePicker
                            disabled={disabled}
                            slotProps={{
                                actionBar: {
                                    actions: ['accept', 'cancel'],
                                },
                            }}
                            showDaysOutsideCurrentMonth={true}
                            value={value}
                            readOnly={readonly}
                            name={name}
                            onChange={onChange}
                            maxDate={dayjs('2999-12-31')}
                        />
                        {value && onDelete && !disabled && !readonly && (
                            <button
                                type="button"
                                className="delete-button"
                                onClick={onDelete}
                                aria-label="날짜 삭제"
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    border: 'none',
                                    background: 'transparent',
                                    fontSize: '18px',
                                    cursor: 'pointer',
                                    zIndex: 1,
                                }}
                            >
                                &times;
                            </button>
                        )}
                    </div>
                </LocalizationProvider>
            </div>
            {validationText != '' && <div className="validationText">{validationText}</div>}
        </div>
    );
}
