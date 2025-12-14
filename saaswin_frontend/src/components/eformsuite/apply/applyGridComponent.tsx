'use client';

import React from 'react';
import InputTextBox from '@/components/InputTextBox';
import UserSelect from 'components/UserSelect';
import SwDateRangePicker from 'components/DateRangePicker';
import SwDatePicker from 'components/DatePicker';
import BoxSelect from 'components/BoxSelect';
import dayjs from 'dayjs';
import styles from '../../../styles/pages/templateApply/page.module.scss';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

interface ApplyGridComponentProps {
    fieldInfo: {
        key: string;
        nm: string;
        type_cd: string;
        esntl_artcl: string;
        [key: string]: any;
    };
    value: any;
    onChange: (id: string, value: any, type?: string | null) => void;
    onDelete?: (id: string) => void;
    placeHolderYn?: any;
    options?: Array<{ value: any; label: string }>;
    disabled?: boolean;
}

const ApplyGridComponent: React.FC<ApplyGridComponentProps> = ({
    fieldInfo,
    value,
    onChange,
    onDelete,
    placeHolderYn,
    options = [],
    disabled = false,
}) => {
    const { key, nm, type_cd } = fieldInfo;
    const placeholder = placeHolderYn === 'N' ? '' : `${nm}을(를) 입력하세요.`;

    // 입력 변경 이벤트 핸들러
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(key, e.target.value);
    };

    // 날짜 변경 핸들러
    const handleDateChange = (newValue: any) => {
        onChange(key, newValue);
    };

    // 사용자 선택 변경 핸들러
    const handleUserChange = (id: string, value: string, type: string | null) => {
        onChange(id, value, type);
    };

    // 드롭다운 변경 핸들러
    const handleSelectChange = (e: any) => {
        // e가 이벤트인지 값인지 체크
        const value = e && e.target ? e.target.value : e;
        onChange(key, value);
    };

    // 필드 삭제 핸들러
    const handleFieldDelete = () => {
        if (onDelete) {
            onDelete(key);
        }
    };

    // 타입에 따른 컴포넌트 렌더링
    switch (type_cd) {
        // 텍스트
        case 'hpo_group01027_cm0001':
            return (
                <InputTextBox
                    type='text'
                    id={key}
                    placeholder={placeholder}
                    value={value || ''}
                    color='white'
                    validationText=''
                    onChange={handleInputChange}
                    onDelete={handleFieldDelete}
                    className={styles.formItem}
                    disabled={disabled}
                />
            );

        // 텍스트(숫자)
        case 'hpo_group01027_cm0002':
            return (
                <div style={{ position: 'relative', width: '100%' }}>
                    <input
                        type='text'
                        id={key}
                        placeholder={placeholder}
                        value={value || ''}
                        onChange={(e) => {
                            // 숫자만 필터링하고 길이 제한
                            const newValue = e.target.value.replace(/[^0-9]/g, '');
                            const limitedValue = newValue.length > 15 ? newValue.substring(0, 15) : newValue;

                            // 값을 직접 전달 (문자열 그대로)
                            onChange(key, limitedValue);
                        }}
                        style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            boxSizing: 'border-box',
                        }}
                        disabled={disabled}
                    />
                    {value && (
                        <button
                            type='button'
                            onClick={handleFieldDelete}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            ×
                        </button>
                    )}
                </div>
            );

        // 구성원검색
        case 'hpo_group01027_cm0003':
            return (
                <UserSelect
                    item={key}
                    handleChange={handleUserChange}
                    selectValue={value || key}
                    className='userSelect transparent'
                    disabled={disabled}
                />
            );

        // 데이트피커(기간)
        case 'hpo_group01027_cm0005':
            // 기존 SwDateRangePicker 대신 MUI DatePicker 사용
            return (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        defaultValue={value ? (typeof value === 'string' ? dayjs(value) : value) : dayjs()}
                        format='YYYY.MM.DD'
                        sx={{
                            width: '150px',
                            '& .MuiInputBase-input.MuiOutlinedInput-input.Mui-disabled': {
                                WebkitTextFillColor: 'black',
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(0, 0, 0, 0.23)',
                            },
                        }}
                        onChange={(newValue) => {
                            if (disabled) return;
                            onChange(key, newValue ? dayjs(newValue) : null);
                        }}
                        onAccept={(newValue) => {
                            if (disabled) return;
                            onChange(key, newValue ? dayjs(newValue) : null);
                        }}
                        disabled={disabled}
                        readOnly={disabled}
                    />
                </LocalizationProvider>
            );

        // 데이트피커
        case 'hpo_group01027_cm0007':
            // 기존 SwDatePicker 대신 MUI DatePicker 사용
            return (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        value={value ? (typeof value === 'string' ? dayjs(value) : value) : dayjs()}
                        format='YYYY.MM.DD'
                        sx={{
                            width: '150px',
                            '& .MuiInputBase-input.MuiOutlinedInput-input.Mui-disabled': {
                                WebkitTextFillColor: 'black',
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(0, 0, 0, 0.23)',
                            },
                        }}
                        onChange={(newValue) => {
                            if (disabled) return;
                            // 여기서 문자열로 변환하여 전달
                            const formattedValue = newValue ? newValue.format('YYYYMMDD') : '';
                            onChange(key, formattedValue);
                        }}
                        disabled={disabled}
                        readOnly={disabled}
                    />
                </LocalizationProvider>
            );

        // 드롭다운목록
        case 'hpo_group01027_cm0011':
            return (
                <BoxSelect
                    id={key}
                    placeholder='선택하지 않음'
                    label=''
                    asterisk
                    validationText=''
                    error={false}
                    value={value}
                    onChange={handleSelectChange}
                    options={options}
                    disabled={disabled}
                />
            );

        // 10 번 표 , 13 번 첨부파일
        // 기본 반환 (지원하지 않는 타입)
        default:
            return <div>지원하지 않는 입력 타입: {type_cd}</div>;
    }
};

export default ApplyGridComponent;
