import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';

interface BoxSelectProps {
    id?: string;
    value: string | number | HTMLElement;
    placeholder?: string;
    className?: string;
    vertical?: boolean;
    error?: boolean;
    disabled?: boolean;
    onChange?: (e: SelectChangeEvent) => void;
    label?: string;
    asterisk?: boolean;
    validationText?: string;
    options: { value: number; label: string }[];
    multiple?: boolean;
    displayEmpty?: boolean;
    color?: 'white';
    renderValue?: (value: string | number | HTMLElement) => string;
    defaultValue?: string | null;
}

export default function BoxSelect({
    id,
    value,
    placeholder,
    className,
    vertical = false,
    error = false,
    disabled,
    onChange,
    label,
    asterisk = false,
    validationText,
    options,
    multiple = false,
    displayEmpty = false,
    color,
    renderValue,
    defaultValue,
}: BoxSelectProps) {
    return (
        <div
            className={`selectBasicBox ${className} ${vertical ? 'vertical' : ''} ${error ? 'error' : ''} ${
                disabled ? 'disabled' : ''
            } ${color === 'white' ? 'white' : ''}`}
        >
            <div className='row'>
                {label && (
                    <label htmlFor={id} className='label'>
                        {label}
                        {asterisk && <span className='asterisk'>*</span>}
                    </label>
                )}
                <div className='textWrap'>
                    <FormControl fullWidth>
                        {placeholder && <InputLabel id={`${id}-label`}>{placeholder}</InputLabel>}
                        <Select
                            labelId={`${id}-label`}
                            id={id}
                            value={value}
                            disabled={disabled}
                            onChange={onChange}
                            multiple={multiple}
                            displayEmpty={displayEmpty}
                            renderValue={renderValue ?? undefined}
                        >
                            {defaultValue === 'all' ? (
                                <MenuItem value=''>
                                    {multiple && (
                                        <input
                                            type='checkbox'
                                            checked={Array.isArray(value) && value.includes('')}
                                            readOnly
                                            className='checkbox'
                                        />
                                    )}
                                    전체
                                </MenuItem>
                            ) : null}
                            {options.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {multiple && (
                                        <input
                                            type='checkbox'
                                            checked={Array.isArray(value) && value.includes(option.value)}
                                            readOnly
                                            className='checkbox'
                                        />
                                    )}

                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>
            </div>
            {validationText && <div className='validationText'>{validationText}</div>}
        </div>
    );
}
