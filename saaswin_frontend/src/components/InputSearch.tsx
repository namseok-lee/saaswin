import TextInput from 'components/TextInput';
import { IcoDelete, IcoSearch } from '@/assets/Icon';
import { useState } from 'react';

interface InputSearchProps {
    id: string;
    type?: string;
    value: string;
    placeholder: string;
    className?: string;
    vertical?: boolean;
    disabled?: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClick?: () => void;
    onBlur?: () => void;
    label?: string;
    asterisk?: boolean;
    color?: 'white';
    del?: boolean;
}

export default function InputSearch({
    id,
    type = 'text',
    value,
    placeholder,
    className = '',
    vertical = false,
    disabled = false,
    onChange,
    onBlur,
    label,
    asterisk = false,
    color,
    del = false,
}: InputSearchProps) {
    const [inputValue, setInputValue] = useState(value);
    const isFilled = inputValue.trim() !== '';

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        onChange(e);
    };

    const handleClearInput = () => {
        setInputValue('');
        onChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
    };

    const [inputFocus, setInputFocus] = useState<{ [key: string]: boolean }>({});

    const handleFocus = (id: string) => {
        setInputFocus((prev) => ({ ...prev, [id]: true }));
    };

    const handleBlur = (id: string) => {
        setInputFocus((prev) => ({ ...prev, [id]: false }));
    };

    return (
        <div className={`inputBasicBox ${className} ${vertical ? 'vertical' : ''} ${color === 'white' ? 'white' : ''}`}>
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
                        value={inputValue}
                        placeholder={placeholder}
                        disabled={disabled}
                        className={`${inputFocus[id] ? 'typingText' : ''} ${value && 'filled'}`}
                        onChange={handleInputChange}
                        onFocus={() => handleFocus(id)}
                        onBlur={() => handleBlur(id)}
                    />
                    <div className='options'>
                        {isFilled && del && (
                            <button className='btnDeleteText' onClick={handleClearInput}>
                                <IcoDelete fill='#C4C4C4' />
                            </button>
                        )}
                        <button className='btnSearch' disabled={disabled}>
                            <IcoSearch fill={disabled ? '#c4c4c4' : undefined} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
