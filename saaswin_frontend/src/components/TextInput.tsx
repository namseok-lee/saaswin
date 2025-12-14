import React, { useState } from 'react';
interface TextInputProps {
    type: 'text' | 'password' | 'date';
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    placeholder?: string;
    id?: string;
    disabled?: boolean;
    className?: string;
    maxLength?: number;
    style?: React.CSSProperties;
}

export default function TextInput({
    type,
    value,
    onChange,
    onBlur,
    onFocus,
    onKeyDown,
    placeholder,
    id,
    disabled,
    className,
    maxLength,
    style = undefined,
}: TextInputProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <input
            id={id}
            type={type === 'password' && !showPassword ? 'password' : type === 'text' ? 'text' : 'number'}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`inputBasic ${className}`}
            disabled={disabled}
            onFocus={onFocus}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            maxLength={maxLength}
            style={style}
        />
    );
}
