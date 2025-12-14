import React from 'react';

interface RadioProps {
    id: string;
    name: string;
    label?: string;
    className?: string;
    disabled?: boolean;
    checked?: boolean;
    value: string | number;
    onChange?: (checked: boolean) => void;
}

export default function Radio({ id, name, label, className, disabled, checked, value, onChange }: RadioProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(e.target.checked);
    };

    return (
        <div className={`inputRadio ${className || ''} ${disabled ? 'disabled' : ''} ${checked && 'checked'}`}>
            <input
                type='radio'
                id={id}
                name={name}
                value={value}
                disabled={disabled}
                onChange={handleChange}
                className='Radio'
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
