import React, { ChangeEvent, ReactNode, useState } from 'react';

interface TextareaProps {
    value?: string;
    placeholder?: string;
    id?: string;
    disabled?: boolean;
    className?: string;
    maxLength?: number;
    onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
    onBlur?: () => void;
    onFocus?: () => void;
    countText?: boolean;
    children?: ReactNode;
}

export default function Textarea({
    value,
    placeholder,
    id,
    disabled,
    className,
    maxLength,
    onChange,
    onBlur,
    onFocus,
    children,
    countText,
}: TextareaProps) {
    const [inputFocus, setInputFocus] = useState<{ [key: string]: boolean }>({});
    const [internalValue, setInternalValue] = useState('');

    const handleFocus = (id: string, e: React.FocusEvent<HTMLInputElement>) => {
        setInputFocus((prev) => ({ ...prev, [id]: true }));
        if (onFocus) onFocus();
    };

    const handleBlur = (id: string, e: React.FocusEvent<HTMLInputElement>) => {
        setInputFocus((prev) => ({ ...prev, [id]: false }));

        if (onBlur) onBlur();
    };

    const valueLength = internalValue ? internalValue.length : 0;
    return (
        <div className='textareaWrap'>
            <textarea
                id={id}
                value={value}
                placeholder={placeholder}
                className={`textarea ${className}`}
                disabled={disabled}
                maxLength={maxLength}
                onChange={onChange}
                onFocus={(e) => handleFocus(id, e)}
                onBlur={(e) => handleBlur(id, e)}
            >
                {children}
            </textarea>
            {countText && <div className='countText'>{valueLength}/100</div>}
        </div>
    );
}
