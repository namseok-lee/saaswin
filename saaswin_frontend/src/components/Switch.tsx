import React from 'react';

interface SwitchProps {
    id?: string;
    className?: string;
    disabled?: boolean;
    checked?: boolean;
    size?: 'normal' | 'small';
    onChange?: (checked: boolean) => void;
}

export default function Switch({ id, size = 'normal', className = '', disabled, checked, onChange }: SwitchProps) {
    return (
        <label className={`switch ${className} ${size === 'small' ? 'small' : ''}`}>
            <input
                type='checkbox'
                id={id}
                disabled={disabled}
                checked={checked}
                onChange={(e) => onChange && onChange(e.target.checked)}
            />
            <span className='slider'></span>
        </label>
    );
}
