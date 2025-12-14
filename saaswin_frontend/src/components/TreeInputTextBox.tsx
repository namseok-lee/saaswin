import TextInput from 'components/TextInput';
import { IcoDelete, IcoError, IcoCheck, IcoVisibleOn, IcoVisibleOff } from '../../public/asset/Icon';
import React, { useState, useEffect } from 'react';
import { validateJsonFields } from '@/utils/validation/valid';
// 각 유형별 키 목록 가져오기
import { rrnKeys } from '@/utils/validation/keys/rrnKeys';
import { bizRegNumKeys } from '@/utils/validation/keys/bizRegNumKeys';
import { mobileKeys } from '@/utils/validation/keys/mobileKeys';
import { telKeys } from '@/utils/validation/keys/telKeys';
import { emailKeys } from '@/utils/validation/keys/emailKeys';

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
    // 유효성 검사
    validate?: boolean; // 유효성 검사 수행 여부
    onValidationResult?: (isValid: boolean) => void; // 유효성 검사 결과를 상위 컴포넌트에 전달
    // 자동 포맷팅 관련
    autoFormat?: boolean; // 자동 포맷팅 적용 여부 (기본값: true)
    depth?: number; // 트리 계층 깊이
}

// 입력 유형 정의
type InputFormatType = 'rrn' | 'bizRegNum' | 'mobile' | 'tel' | 'email' | 'none';

export default function TreeInputTextBox({
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
    validationText = '',
    color,
    // 유효성 검사
    validate = true,
    onValidationResult,
    // 자동 포맷팅
    autoFormat = true,
    depth = 0,
}: InputTextBoxProps) {
    const [inputFocus, setInputFocus] = useState<{ [key: string]: boolean }>({});
    const [internalValue, setInternalValue] = useState('');
    const [internalError, setInternalError] = useState(error);
    const [formatType, setFormatType] = useState<InputFormatType>('none');
    const [isInitialized, setIsInitialized] = useState(false);

    // 입력 타입 감지 (id에 따라 자동으로 포맷 타입 결정)
    useEffect(() => {
        if (rrnKeys.includes(id)) {
            setFormatType('rrn');
        } else if (bizRegNumKeys.includes(id)) {
            setFormatType('bizRegNum');
        } else if (mobileKeys.includes(id)) {
            setFormatType('mobile');
        } else if (telKeys.includes(id)) {
            setFormatType('tel');
        } else if (emailKeys.includes(id)) {
            setFormatType('email');
        } else {
            setFormatType('none');
        }
    }, [id]);

    // 숫자 입력에 대한 기본 최대 길이 설정
    const effectiveMaxLength = isNumber ? maxLength || 15 : maxLength;

    // 자동 포맷팅 함수
    const formatValue = (value: string, type: InputFormatType): string => {
        if (!autoFormat || !value || disabled || type === 'none' || type === 'email') {
            return value;
        }

        // 숫자만 추출
        const numbers = value.replace(/[^\d]/g, '');

        switch (type) {
            case 'rrn': // 주민등록번호: 6자리-7자리 (예: 123456-1234567)
                if (numbers.length <= 6) {
                    return numbers;
                } else {
                    return `${numbers.substring(0, 6)}-${numbers.substring(6, 13)}`;
                }

            case 'bizRegNum': // 사업자등록번호: 3자리-2자리-5자리 (예: 123-45-67890)
                if (numbers.length <= 3) {
                    return numbers;
                } else if (numbers.length <= 5) {
                    return `${numbers.substring(0, 3)}-${numbers.substring(3)}`;
                } else {
                    return `${numbers.substring(0, 3)}-${numbers.substring(3, 5)}-${numbers.substring(5, 10)}`;
                }

            case 'mobile': // 휴대폰번호: 010-XXXX-XXXX 또는 01X-XXX-XXXX 형식
                if (numbers.length <= 3) {
                    return numbers;
                } else if (numbers.length <= 7) {
                    return `${numbers.substring(0, 3)}-${numbers.substring(3)}`;
                } else {
                    return `${numbers.substring(0, 3)}-${numbers.substring(3, 7)}-${numbers.substring(7, 11)}`;
                }

            case 'tel': // 전화번호: 지역번호-국번-번호 (예: 02-123-4567 또는 031-1234-5678)
                // 지역번호가 2자리(02)인 경우
                if (numbers.startsWith('02')) {
                    if (numbers.length <= 2) {
                        return numbers;
                    } else if (numbers.length <= 6) {
                        return `${numbers.substring(0, 2)}-${numbers.substring(2)}`;
                    } else {
                        return `${numbers.substring(0, 2)}-${numbers.substring(2, 6)}-${numbers.substring(6, 10)}`;
                    }
                }
                // 지역번호가 3자리(031, 032 등)인 경우
                else {
                    if (numbers.length <= 3) {
                        return numbers;
                    } else if (numbers.length <= 7) {
                        return `${numbers.substring(0, 3)}-${numbers.substring(3)}`;
                    } else {
                        return `${numbers.substring(0, 3)}-${numbers.substring(3, 7)}-${numbers.substring(7, 11)}`;
                    }
                }

            default:
                return value;
        }
    };

    // 유효성 검사
    const validateInput = (val: string) => {
        if (!validate || !val || disabled) {
            return true;
        }

        // id를 key로 사용하여 임시 객체 생성
        const tempObj = { [id]: val };
        const failedFields = validateJsonFields(tempObj);
        const isValid = failedFields.length === 0;

        // 유효성 검사 결과에 따라 error 상태 업데이트
        setInternalError(!isValid);

        // 유효성 검사 결과를 상위 컴포넌트에 전달
        if (onValidationResult) {
            onValidationResult(isValid);
        }

        return isValid;
    };

    // formatType이 결정된 후에 value prop이 변경될 때 포맷팅 적용
    useEffect(() => {
        // formatType이 설정된 후에만 실행
        if (formatType !== 'none' || !autoFormat) {
            // 숫자만 입력 허용 처리 (포맷 타입이 'none'이 아닌 경우)
            let processedValue = value || '';

            if (formatType !== 'none' && formatType !== 'email') {
                // 이메일은 숫자만 입력이 아님
                processedValue = processedValue.replace(/[^\d]/g, '');
            }

            // 자동 포맷팅 적용
            const formattedValue = formatValue(processedValue, formatType);
            setInternalValue(formattedValue);

            // 초기 유효성 검사 수행
            if (validate && formattedValue && !isInitialized) {
                validateInput(formattedValue);
            }
        } else {
            // formatType이 'none'인 경우 그대로 설정
            setInternalValue(value || '');
        }

        if (!isInitialized) {
            setIsInitialized(true);
        }
    }, [value, formatType, autoFormat]);

    // error prop이 변경될 때 내부 상태 업데이트
    useEffect(() => {
        setInternalError(error);
    }, [error]);

    const handleFocus = (id: string, e: React.FocusEvent<HTMLInputElement>) => {
        setInputFocus((prev) => ({ ...prev, [id]: true }));
        if (onFocus) onFocus();
    };

    const handleBlur = (id: string, e: React.FocusEvent<HTMLInputElement>) => {
        setInputFocus((prev) => ({ ...prev, [id]: false }));

        // 포커스를 잃었을 때 유효성 검사 수행
        if (validate) {
            validateInput(internalValue);
        }

        if (onBlur) onBlur();
    };

    // 내부 상태의 value 길이를 확인
    const valueLength = internalValue ? internalValue.length : 0;
    const isValuePresent = valueLength > 0;

    // 디버깅용 로그 (개발 시 확인 후 제거)
    // console.log(`InputTextBox ${id}:`, {
    //     value,
    //     internalValue,
    //     formatType,
    //     isInitialized
    // });

    return (
        <div
            className={`inputBasicBox ${className || ''} ${vertical ? 'vertical' : ''} ${
                internalError ? 'error' : ''
            } ${warning ? 'warning' : ''} ${success ? 'success' : ''} ${color === 'white' ? 'white' : ''}`}
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
                        style={{ paddingLeft: depth ? `${depth * 30}px` : undefined }}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            let newValue = e.target.value;

                            // 숫자만 입력 허용 처리 (isNumber가 true이거나 포맷 타입이 'none'이 아닌 경우)
                            if (isNumber || (formatType !== 'none' && formatType !== 'email')) {
                                // 이메일은 숫자만 입력이 아님
                                newValue = newValue.replace(/[^\d]/g, '');

                                // 최대 길이 체크 (HTML maxLength 속성과 별개로 한번 더 확인)
                                if (effectiveMaxLength && newValue.length > effectiveMaxLength) {
                                    newValue = newValue.substring(0, effectiveMaxLength);
                                }
                            }

                            // 자동 포맷팅 적용
                            const formattedValue = formatValue(newValue, formatType);

                            setInternalValue(formattedValue);

                            // 입력 중 유효성 검사 수행 (옵션에 따라)
                            if (validate) {
                                validateInput(formattedValue);
                            }

                            // onChange 콜백에 정제된 값 전달
                            onChange({ ...e, target: { ...e.target, value: formattedValue } });
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
                                    setInternalError(false);
                                    onDelete();
                                    // 삭제 시 유효성 검사 결과 초기화
                                    if (validate && onValidationResult) {
                                        onValidationResult(true);
                                    }
                                }}
                            >
                                <IcoDelete />
                            </button>
                        )}
                        {(internalError || warning) && <IcoError className='icoError' />}
                        {type !== 'number' && success && <IcoCheck className='icoCheck' />}
                    </div>
                </div>
            </div>
            {validationText && internalError && <div className='validationText'>{validationText}</div>}
        </div>
    );
}
