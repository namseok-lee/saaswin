'use client';

import React, { useEffect, useState } from 'react';
import InputTextBox from '@/components/InputTextBox';
import UserSelect from 'components/UserSelect';
import SwDateRangePicker from 'components/DateRangePicker';
import SwDatePicker from 'components/DatePicker';
import BoxSelect from 'components/BoxSelect';
import dayjs from 'dayjs';
import styles from '../../../styles/pages/templateApply/page.module.scss';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import SwDateRangePicker2 from 'components/DateRangePicker2';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

interface ApplyComponentProps {
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

const ApplyComponent: React.FC<ApplyComponentProps> = ({
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
                <InputTextBox
                    type='number'
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

        // 구성원검색
        case 'hpo_group01027_cm0003':
            return (
                <UserSelect
                    item={fieldInfo} // 전체 fieldInfo 객체 전달
                    handleChange={(id, newValue, type, selectedNames) => {
                        onChange(key, newValue, type);
                    }}
                    selectValue={value || ''} // undefined 방지
                    className={`userSelect transparent ${styles.userSelect}`}
                    disabled={disabled}
                />
            );

        // 데이트피커(기간)
        case 'hpo_group01027_cm0005': {
            let parsedStartDate: dayjs.Dayjs | null = null;
            let parsedEndDate: dayjs.Dayjs | null = null;

            // 1. value prop 파싱 시도
            if (typeof value === 'string' && value.includes(',')) {
                // "YYYYMMDD,YYYYMMDD" 형식의 문자열 처리
                const [startDateStr, endDateStr] = value.split(',');
                const start = dayjs(startDateStr?.trim(), 'YYYYMMDD');
                const end = dayjs(endDateStr?.trim(), 'YYYYMMDD');
                if (start.isValid()) {
                    parsedStartDate = start;
                }
                if (end.isValid()) {
                    parsedEndDate = end;
                }
            } else if (typeof value === 'string' && value.trim()) {
                // "YYYYMMDD" 형식의 단일 문자열 처리 (시작일로 간주)
                const start = dayjs(value.trim(), 'YYYYMMDD');
                if (start.isValid()) {
                    parsedStartDate = start;
                    // 종료일은 null 또는 시작일과 동일하게 설정 가능 - 여기서는 null로 둠
                    parsedEndDate = null;
                }
            } else if (Array.isArray(value) && value.length > 0) {
                // 배열 처리 (dayjs 객체 또는 변환 가능한 값으로 가정)
                const start = dayjs(value[0]); // dayjs()는 null, undefined, 빈 문자열 등에 대해 isValid()=false 반환
                const end = dayjs(value[1]); // 배열 길이가 1이면 value[1]은 undefined -> dayjs(undefined) -> invalid
                if (start.isValid()) {
                    parsedStartDate = start;
                }
                if (end.isValid()) {
                    parsedEndDate = end;
                }
            }

            // 2. 파싱 실패 또는 value가 없는 경우 기본값 설정 (선택 사항)
            // 기본값을 설정하지 않으려면 이 블록을 제거하고 DatePicker가 자체적으로 처리하도록 할 수 있음
            // if (!parsedStartDate && !parsedEndDate) {
            //     console.warn(`ApplyComponent (key: ${key}): No valid date value found, using default [null, null].`);
            //     // parsedStartDate = dayjs(); // 필요시 기본값 설정
            //     // parsedEndDate = dayjs().add(3, 'day');
            // }

            // 3. DatePicker에 전달할 최종 값 (항상 [dayjs | null, dayjs | null] 형태)
            const finalDateRangeValue: [dayjs.Dayjs | null, dayjs.Dayjs | null] = [parsedStartDate, parsedEndDate];

            return (
                <SwDateRangePicker2
                    label=''
                    id={key}
                    asterisk={fieldInfo.esntl_artcl === 'Y'}
                    validationText=''
                    value={finalDateRangeValue}
                    onChange={(newValue: [dayjs.Dayjs | null, dayjs.Dayjs | null]) => {
                        onChange(key, newValue);
                    }}
                    color='white'
                    className={styles.formItem}
                    disabled={disabled}
                />
            );
        }

        // 데이트피커
        case 'hpo_group01027_cm0007':
            return (
                <SwDatePicker
                    label=''
                    id={key}
                    asterisk
                    validationText=''
                    value={value || dayjs()}
                    onChange={handleDateChange}
                    color='white'
                    disabled={disabled}
                />
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

export default ApplyComponent;
