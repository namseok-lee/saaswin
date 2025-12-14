import TextInput from 'components/TextInput';
import { IcoDelete, IcoError, IcoCheck, IcoVisibleOn, IcoVisibleOff } from '../../public/asset/Icon';
import React, { useState, useEffect } from 'react';

interface InputTextBoxProps {
    id: string;
    type?: 'text' | 'password';
    value: string;
    placeholder: string;
    className?: string;
    hasToggle?: boolean;
    showPassword?: boolean;
    vertical?: boolean;
    error?: boolean;
    warning?: boolean;
    success?: boolean;
    disabled?: boolean;
    isNumber?: boolean;
    maxLength?: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onTogglePassword?: () => void;
    onClick?: () => void;
    onBlur?: () => void;
    onFocus?: () => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onDelete: () => void;
    label?: string;
    asterisk?: boolean;
    countText?: boolean;
    validationText?: string;
    color?: 'white';
}

export default function InputTextBox({
    id,
    type = 'text',
    value = '',
    placeholder,
    hasToggle = false,
    showPassword = false,
    onTogglePassword,
    className,
    vertical = false,
    error = false,
    warning = false,
    success = false,
    disabled,
    isNumber,
    maxLength,
    onChange,
    onBlur,
    onFocus,
    onKeyDown,
    onDelete,
    label,
    asterisk = false,
    countText = false,
    validationText = 'validationText',
    color,
}: InputTextBoxProps) {
    const [inputFocus, setInputFocus] = useState<{ [key: string]: boolean }>({});
    const [internalValue, setInternalValue] = useState(value || '');

    // 숫자 입력에 대한 기본 최대 길이 설정
    const effectiveMaxLength = isNumber ? maxLength || 15 : maxLength;

    // value prop이 변경될 때마다 내부 상태 업데이트
    useEffect(() => {
        setInternalValue(value || '');
    }, [value]);

    const handleFocus = (id: string, e: React.FocusEvent<HTMLInputElement>) => {
        setInputFocus((prev) => ({ ...prev, [id]: true }));
        if (onFocus) onFocus();
    };

    const handleBlur = (id: string, e: React.FocusEvent<HTMLInputElement>) => {
        setInputFocus((prev) => ({ ...prev, [id]: false }));
        if (onBlur) onBlur();
    };

    // 내부 상태의 value 길이를 확인
    const valueLength = internalValue ? internalValue.length : 0;
    const isValuePresent = valueLength > 0;

    return (
        <div
            className={`inputBasicBox ${className || ''} ${vertical ? 'vertical' : ''} ${error ? 'error' : ''} ${
                warning ? 'warning' : ''
            } ${success ? 'success' : ''} ${color === 'white' ? 'white' : ''}`}
        >
            {countText && <div className='countText'>{valueLength}/100</div>}
            <div className='row'>
                {label && (
                    <label htmlFor={id} className='label'>
                        {label}
                        {asterisk && <span className='asterisk'>*</span>}
                    </label>
                )}
                <div className='textWrap'>
                    <TextInput
                        id={id}
                        type={type}
                        value={internalValue}
                        placeholder={placeholder}
                        disabled={disabled}
                        maxLength={effectiveMaxLength}
                        className={`${inputFocus[id] ? 'typingText' : ''} ${isValuePresent ? 'filled' : ''}`}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            let newValue = e.target.value;
                            if (isNumber) {
                                // 숫자가 아닌 문자는 제거
                                newValue = newValue.replace(/[^0-9]/g, '');

                                // 최대 길이 체크 (HTML maxLength 속성과 별개로 한번 더 확인)
                                if (effectiveMaxLength && newValue.length > effectiveMaxLength) {
                                    newValue = newValue.substring(0, effectiveMaxLength);
                                }
                            }
                            setInternalValue(newValue);
                            // onChange 콜백에 정제된 값 전달
                            onChange({ ...e, target: { ...e.target, value: newValue } });
                        }}
                        onFocus={(e) => handleFocus(id, e)}
                        onBlur={(e) => handleBlur(id, e)}
                        onKeyDown={onKeyDown}
                    />
                    <div className='options'>
                        {isValuePresent && type !== 'number' && (
                            <button
                                type='button'
                                className='btnDeleteText'
                                onClick={() => {
                                    setInternalValue('');
                                    onDelete();
                                }}
                            >
                                <IcoDelete />
                            </button>
                        )}
                        {type === 'password' &&
                            (hasToggle && onTogglePassword && !disabled ? (
                                <button type='button' className='btnToggleVisible' onClick={onTogglePassword}>
                                    {showPassword ? <IcoVisibleOn fill='#7c7c7c' /> : <IcoVisibleOff fill='#7c7c7c' />}
                                </button>
                            ) : disabled && showPassword ? (
                                <IcoVisibleOn fill='#7c7c7c' />
                            ) : (
                                <IcoVisibleOff fill='#7c7c7c' />
                            ))}
                        {(error || warning) && <IcoError className='icoError' />}
                        {type !== 'number' && success && <IcoCheck className='icoCheck' />}
                    </div>
                </div>
            </div>
            {validationText && <div className='validationText'>{validationText}</div>}
        </div>
    );
}
