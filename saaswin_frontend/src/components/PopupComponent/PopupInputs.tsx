import React, { useState } from 'react';
import InputTextBox from '../InputTextBox';
import BoxSelect from '../BoxSelect';
import { SelectChangeEvent } from '@mui/material';
import CommonAttachFileModal from '../ComPopup/CommonAttachFileModal';

interface PopupInputsProps {
  className?: string;
  title?: string;
  type?: 'password' | 'text' | 'email' | 'number' | 'select' | 'upload';
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  validationText?: string;
  value?: string;
  id?: string;
  options?: Array<{ value: number; label: string }>;
  onChange?: (value: string) => void;
  procType?: string;
  allowMultiple?: boolean;
}

const PopupInputs: React.FC<PopupInputsProps> = ({
  className,
  title,
  type = 'text',
  id = 'select1',
  placeholder,
  label,
  required = false,
  disabled = false,
  error = false,
  validationText,
  value = '',
  options = [],
  onChange,
  procType,
  allowMultiple
}) => {
  const [inputValues, setInputValues] = useState<Record<string, string>>({
    input1: value
  });
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({
    [id]: value
  });
  const [passwordVisibility, setPasswordVisibility] = useState<Record<string, boolean>>({});
  const [attachModalParams, setAttachModalParams] = useState({
    open: false,
    isEditable: !disabled,
    procType: procType || 'default',
    value: []
  });

  const handleChange = (id: string, newValue: string) => {
    setInputValues(prev => ({
      ...prev,
      [id]: newValue
    }));
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleSelectChange = (id: string) => (event: SelectChangeEvent) => {
    const newValue = event.target.value;
    setSelectedValues(prev => ({
      ...prev,
      [id]: newValue
    }));
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleDelete = (id: string) => {
    setInputValues(prev => ({
      ...prev,
      [id]: ''
    }));
    if (onChange) {
      onChange('');
    }
  };

  const togglePasswordvisibility = (id: string) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleUpload = () => {
    // 파일 업로드 처리
    console.log('Upload completed');
    if (onChange) {
      onChange('uploaded');
    }
  };

  const openAttachModal = () => {
    setAttachModalParams(prev => ({ ...prev, open: true }));
  };

  const renderInput = () => {
    const inputId = 'input1';
    const currentValue = inputValues[inputId] || value;

    switch (type) {
      case 'password':
        return (
          <InputTextBox
            type='password'
            id={inputId}
            placeholder={placeholder || '비밀번호를 입력해주세요'}
            label={label}
            asterisk={required}
            vertical={true}
            validationText={validationText}
            hasToggle={true}
            onTogglePassword={() => togglePasswordvisibility(inputId)}
            showPassword={passwordVisibility[inputId] || false}
            error={error}
            value={currentValue}
            onChange={(e) => handleChange(inputId, e.target.value)}
            onDelete={() => handleDelete(inputId)}
          />
        );
      
      case 'email':
        return (
          <InputTextBox
            type='text'
            id={inputId}
            placeholder={placeholder || '이메일을 입력해주세요'}
            label={label}
            asterisk={required}
            validationText={validationText}
            hasToggle={false}
            error={error}
            disabled={disabled}
            value={currentValue}
            onChange={(e) => handleChange(inputId, e.target.value)}
            onDelete={() => handleDelete(inputId)}
          />
        );
      
      case 'number':
        return (
          <InputTextBox
            type='text'
            id={inputId}
            placeholder={placeholder || '숫자를 입력해주세요'}
            label={label}
            asterisk={required}
            validationText={validationText}
            hasToggle={false}
            error={error}
            disabled={disabled}
            value={currentValue}
            onChange={(e) => handleChange(inputId, e.target.value)}
            onDelete={() => handleDelete(inputId)}
          />
        );
      
      case 'select':
        return (
          <BoxSelect
            id={id}
            placeholder={placeholder || '선택하지 않음'}
            label={label}
            asterisk={required}
            validationText={validationText}
            error={error}
            value={selectedValues[id] || ''}
            onChange={handleSelectChange(id)}
            options={options}
          />
        );
      
        case 'upload':
            return (
                <div className='upload-wrap'>
        <InputTextBox
            type='text'
            id={inputId}
            placeholder={placeholder || '텍스트를 입력해주세요'}
            label={label}
            asterisk={required}
            validationText={validationText}
            hasToggle={false}
            error={error}
            disabled={disabled}
            value={currentValue}
            onChange={(e) => handleChange(inputId, e.target.value)}
            onDelete={() => handleDelete(inputId)}
          />
            <div className='upload-btn'>
                <button onClick={openAttachModal}>업로드</button>
                <CommonAttachFileModal
                    params={attachModalParams}
                    setParams={setAttachModalParams}
                    handleUpload={handleUpload}
                    allowMultiple={allowMultiple || false}
                />
            </div>
                </div>

          
            );

      default: // text
        return (
          <InputTextBox
            type='text'
            id={inputId}
            placeholder={placeholder || '텍스트를 입력해주세요'}
            label={label}
            asterisk={required}
            validationText={validationText}
            hasToggle={false}
            error={error}
            disabled={disabled}
            value={currentValue}
            onChange={(e) => handleChange(inputId, e.target.value)}
            onDelete={() => handleDelete(inputId)}
          />
        );
    }
  };

  return (
    <div className={`password-input-box ${className || ''}`}>
      {title && (
        <div className='password-input-box-title'>
          <p>{title}<span>{required ? '*' : ''}</span></p>
        </div>
      )}
      <div style={{width:'100%'}}>
        {renderInput()}
      </div>
    </div>
  );
};

export default PopupInputs;
