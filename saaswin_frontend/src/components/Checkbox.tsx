import React from 'react';

interface CheckboxProps {
    id?: string;
    label?: string;
    className?: string;
    disabled?: boolean;
    checked?: boolean;
    value: string | number | boolean;
    onChange?: (checked: boolean) => void;
}

export default function Checkbox({ id, label, className, disabled, checked, value, onChange }: CheckboxProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(e.target.checked);
    };

    return (
        <div className={`inputCheckbox ${className || ''} ${disabled ? 'disabled' : ''} ${checked && 'checked'}`}>
            <input
                type='checkbox'
                id={id}
                value={value}
                disabled={disabled}
                // onChange={handleChange}
                onChange={onChange}
                className='checkbox'
                checked={checked}
            />
            {label && (
                <label htmlFor={id} className='label'>
                    {label}
                </label>
            )}
        </div>
    );
}
