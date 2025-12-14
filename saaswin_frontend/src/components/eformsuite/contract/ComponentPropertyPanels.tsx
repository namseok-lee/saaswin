'use client';
import React, { useEffect, useState } from 'react';
import {
    IcoSignature,
    IcoTextbox,
    IcoCalendar,
    IcoRadio,
    IcoCheckbox,
    IcoDropdown,
    IcoNumber,
    IcoLink,
    IcoAttachFile,
    IcoAddress,
    IcoStamp,
} from '@/assets/Icon';
import {
    IcoAlignBottom,
    IcoAlignCenter,
    IcoAlignLeft,
    IcoAlignMiddle,
    IcoAlignRight,
    IcoAlignTop,
    IcoBirth,
    IcoIdentification,
    IcoMemberName,
    IcoQuestionMark,
} from '../../../../public/asset/Icon';
import InputTextBox from 'components/BoxTextInput';
import BoxSelect from 'components/BoxSelect';
import SwTooltip from 'components/Tooltip';
import Switch from '@/components/Switch';
import Checkbox from '@/components/Checkbox';
import Textarea from '@/components/Textarea';
import Button from 'components/Button';
import styles from '../../../styles/pages/Template/page.module.scss';
import { ComponentState } from 'components/FullDialog/eformsuite/TemplateCreateFullDialog';
import SwDatePicker from '@/components/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import SwTimePicker from '@/components/TimePicker';
import AttachFile from '@/components/File/attachFile';
import { fetcherGetFileInfo } from '@/utils/axios';

// 컴포넌트 상태 타입을 확장하여 새로운 속성 추가
interface ExtendedComponentState extends ComponentState {
    // 공통 속성
    readonly?: boolean;
    required?: boolean;

    // 텍스트 설정 속성
    fontFamily?: string;
    fontSize?: number;
    textColor?: string;
    textFormat?: 'normal' | 'bold' | 'italic' | 'underline';
    textAlign?: 'left' | 'center' | 'right';
    verticalAlign?: 'top' | 'middle' | 'bottom';

    // 컴포넌트별 속성
    displayText?: string;
    placeholder?: string;
    allowNegative?: boolean; // 숫자 컴포넌트용
    dataType?: 'date' | 'dateNoYear' | 'dateTime' | 'time'; // 날짜 컴포넌트용
    dateFormat?: string;
    timeFormat?: string;
    defaultDate?: string;
    defaultTime?: string;
    groupName?: string;
    defaultSelected?: boolean;
    options?: string[];
    defaultValue?: string;
    url?: string;
    attachFile?: boolean;
}

interface BasePropertyPanelProps {
    component: ExtendedComponentState;
    onComponentUpdate: (id: string, updates: Partial<ExtendedComponentState>) => void;
    onPositionChange?: (x: number, y: number) => void;
    onSizeChange?: (width: number, height: number) => void;
}
// 텍스트 설정 컴포넌트 - 단독 컴포넌트로 사용
// 텍스트 설정 컴포넌트 - 단독 컴포넌트로 사용
const TextSettings: React.FC<{
    component: ExtendedComponentState;
    onComponentUpdate: (id: string, updates: Partial<ExtendedComponentState>) => void;
}> = ({ component, onComponentUpdate }) => {
    const fontOptions = [
        { label: '굴림', value: '굴림' },
        { label: '궁서', value: '궁서' },
        { label: '돋움', value: '돋움' },
        { label: '맑은 고딕', value: '맑은 고딕' },
        { label: '바탕', value: '바탕' },
        { label: 'Pretendard', value: 'Pretendard' },
        { label: 'Arial', value: 'Arial' },
    ];

    // 폰트 변경 핸들러
    const handleFontChange = (e: any) => {
        onComponentUpdate(component.id, { fontFamily: e.target.value });
    };

    // 폰트 크기 변경 핸들러
    const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fontSize = parseInt(e.target.value);
        if (!isNaN(fontSize)) {
            onComponentUpdate(component.id, { fontSize });
        }
    };

    // 폰트 색상 변경 핸들러
    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onComponentUpdate(component.id, { textColor: e.target.value });
    };

    // 텍스트 포맷 변경 핸들러
    const handleFormatToggle = (format: 'normal' | 'bold' | 'italic' | 'underline') => {
        const newFormat = component.textFormat === format ? 'normal' : format;
        onComponentUpdate(component.id, { textFormat: newFormat });
    };

    // 좌우 정렬 변경 핸들러
    const handleTextAlignChange = (align: 'left' | 'center' | 'right') => {
        onComponentUpdate(component.id, { textAlign: align });
    };

    // 세로 정렬 변경 핸들러
    const handleVerticalAlignChange = (align: 'top' | 'middle' | 'bottom') => {
        onComponentUpdate(component.id, { verticalAlign: align });
    };

    return (
        <div className={styles.setText}>
            <hr className={styles.divisionLine} />
            <label htmlFor='' className={styles.label}>
                텍스트 설정
            </label>

            {/* 글자 폰트 */}
            <div className={styles.col}>
                <BoxSelect
                    id='fontFamily'
                    placeholder='폰트 선택'
                    value={component.fontFamily || '굴림'}
                    onChange={handleFontChange}
                    options={fontOptions}
                    validationText=''
                    vertical
                    color='white'
                    className={styles.selectBox}
                />

                {/* 글자 크기 */}
                <InputTextBox
                    type='number'
                    id='fontSize'
                    placeholder='12pt'
                    validationText=''
                    value={component.fontSize?.toString() || '12'}
                    onChange={handleFontSizeChange}
                    color='white'
                    className={styles.numberBox}
                    onDelete={() => onComponentUpdate(component.id, { fontSize: 12 })}
                />
            </div>

            {/* 글자 색상 */}
            <div className={`${styles.col} ${styles.colorPicker}`}>
                <label htmlFor='textColor' className={styles.label2}>
                    글자색
                </label>
                <input
                    type='color'
                    id='textColor'
                    value={component.textColor || '#000000'}
                    onChange={handleColorChange}
                    className={styles.colorInput}
                />
            </div>

            {/* 글자 포맷 */}
            <div className={`${styles.col} ${styles.decorationList}`}>
                <label htmlFor='' className={styles.label2}>
                    표기 방식
                </label>
                <ul className={styles.styleList}>
                    <li
                        className={`${styles.item} ${styles.bold} ${
                            component.textFormat === 'bold' ? styles.active : ''
                        }`}
                        onClick={() => handleFormatToggle('bold')}
                    >
                        가
                    </li>
                    <li
                        className={`${styles.item} ${styles.italic} ${
                            component.textFormat === 'italic' ? styles.active : ''
                        }`}
                        onClick={() => handleFormatToggle('italic')}
                    >
                        가
                    </li>
                    <li
                        className={`${styles.item} ${styles.underline} ${
                            component.textFormat === 'underline' ? styles.active : ''
                        }`}
                        onClick={() => handleFormatToggle('underline')}
                    >
                        가
                    </li>
                    <li
                        className={`${styles.item} ${styles.color} ${
                            component.textFormat === 'underline' ? styles.active : ''
                        }`}
                        onClick={() => handleFormatToggle('underline')}
                    >
                        가
                    </li>
                </ul>
            </div>

            {/* 좌우 정렬 */}
            <div className={`${styles.col} ${styles.textAlign}`}>
                <label htmlFor='' className={styles.label2}>
                    문단 좌우 정렬
                </label>
                <ul className={styles.styleList}>
                    <li
                        className={`${styles.item} ${component.textAlign === 'left' ? styles.active : ''}`}
                        onClick={() => handleTextAlignChange('left')}
                    >
                        <IcoAlignLeft />
                    </li>
                    <li
                        className={`${styles.item} ${component.textAlign === 'center' ? styles.active : ''}`}
                        onClick={() => handleTextAlignChange('center')}
                    >
                        <IcoAlignCenter />
                    </li>
                    <li
                        className={`${styles.item} ${component.textAlign === 'right' ? styles.active : ''}`}
                        onClick={() => handleTextAlignChange('right')}
                    >
                        <IcoAlignRight />
                    </li>
                </ul>
            </div>

            {/* 세로 정렬 */}
            <div className={`${styles.col} ${styles.textAlign}`}>
                <label htmlFor='' className={styles.label2}>
                    문단 상하 정렬
                </label>
                <ul className={styles.styleList}>
                    <li
                        className={`${styles.item} ${component.verticalAlign === 'top' ? styles.active : ''}`}
                        onClick={() => handleVerticalAlignChange('top')}
                    >
                        <IcoAlignTop />
                    </li>
                    <li
                        className={`${styles.item} ${component.verticalAlign === 'middle' ? styles.active : ''}`}
                        onClick={() => handleVerticalAlignChange('middle')}
                    >
                        <IcoAlignMiddle />
                    </li>
                    <li
                        className={`${styles.item} ${component.verticalAlign === 'bottom' ? styles.active : ''}`}
                        onClick={() => handleVerticalAlignChange('bottom')}
                    >
                        <IcoAlignBottom />
                    </li>
                </ul>
            </div>
        </div>
    );
};
// 기본 레이아웃 컴포넌트 - 모든 타입의 컴포넌트에 공통적으로 사용되는 UI 섹션
const BasePropertyPanel: React.FC<
    BasePropertyPanelProps & {
        title: string;
        icon: React.ReactNode;
        children?: React.ReactNode;
        onPositionChange?: (x: number, y: number) => void;
        onSizeChange?: (width: number, height: number) => void;
        showItemType?: boolean;
    }
> = ({ title, icon, component, onPositionChange, onSizeChange, onComponentUpdate, children, showItemType = true }) => {
    // x 좌표 변경 핸들러
    const handleXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            if (onPositionChange) {
                onPositionChange(numValue, component?.y || 0);
            }
            // onComponentUpdate를 직접 호출하여 components 상태 업데이트
            onComponentUpdate(component.id, { x: numValue });
        }
    };

    // y 좌표 변경 핸들러
    const handleYChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            if (onPositionChange) {
                onPositionChange(component?.x || 0, numValue);
            }
            // onComponentUpdate를 직접 호출하여 components 상태 업데이트
            onComponentUpdate(component.id, { y: numValue });
        }
    };

    // 너비 변경 핸들러
    const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            if (onSizeChange) {
                onSizeChange(numValue, component?.height || 0);
            }
            // onComponentUpdate를 직접 호출하여 components 상태 업데이트
            onComponentUpdate(component.id, { width: numValue });
        }
    };

    // 높이 변경 핸들러
    const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            if (onSizeChange) {
                onSizeChange(component?.width || 0, numValue);
            }
            // onComponentUpdate를 직접 호출하여 components 상태 업데이트
            onComponentUpdate(component.id, { height: numValue });
        }
    };

    // 이름 변경 핸들러
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onComponentUpdate(component.id, { name: e.target.value });
    };

    // 읽기 전용 토글 핸들러
    const handleReadOnlyToggle = () => {
        onComponentUpdate(component.id, { readonly: !component.readonly });
    };

    // 필수 입력 토글 핸들러
    const handleRequiredToggle = (checked: boolean) => {
        onComponentUpdate(component.id, { required: checked });
    };

    return (
        <div className={styles.componentOptions}>
            {/* 헤더 */}
            <div className={styles.title}>
                <div className={styles.icon}>{icon}</div>
                <div className={styles.text}>{title}</div>
                <div className={`tooltipWrap ${styles.tooltip}`}>
                    <SwTooltip title='도움말' arrow placement='right'>
                        <Button id='' className='btnShortInfo'>
                            <IcoQuestionMark fill='var(--primary)' />
                        </Button>
                    </SwTooltip>
                </div>
            </div>

            {/* 이름 필드 */}
            <div className={styles.name}>
                <InputTextBox
                    type='text'
                    id='componentName'
                    placeholder='컴포넌트 이름'
                    hasToggle={false}
                    showPassword={false}
                    label='이름'
                    vertical
                    validationText=''
                    value={component.name || ''}
                    onChange={handleNameChange}
                    color='white'
                    onDelete={() => onComponentUpdate(component.id, { name: '' })}
                />
            </div>

            {/* 위치 필드 */}
            <div className={styles.position}>
                <label htmlFor='' className={styles.label}>
                    위치
                </label>
                <div className={styles.col}>
                    <InputTextBox
                        type='number'
                        id='positionX'
                        placeholder='0'
                        label='가로'
                        validationText=''
                        value={component.x.toString()}
                        onChange={handleXChange}
                        color='white'
                        onDelete={() => onComponentUpdate(component.id, { x: 0 })}
                    />
                    <InputTextBox
                        type='number'
                        id='positionY'
                        placeholder='0'
                        label='세로'
                        validationText=''
                        value={component.y.toString()}
                        onChange={handleYChange}
                        color='white'
                        onDelete={() => onComponentUpdate(component.id, { y: 0 })}
                    />
                </div>
            </div>

            {/* 크기 필드 */}
            <div className={styles.size}>
                <label htmlFor='' className={styles.label}>
                    크기
                </label>
                <div className={styles.col}>
                    <InputTextBox
                        type='number'
                        id='width'
                        placeholder='0'
                        label='너비'
                        validationText=''
                        value={component.width.toString()}
                        onChange={handleWidthChange}
                        color='white'
                        onDelete={() => onComponentUpdate(component.id, { width: 100 })}
                    />
                    <InputTextBox
                        type='number'
                        id='height'
                        placeholder='0'
                        label='높이'
                        validationText=''
                        value={component.height.toString()}
                        onChange={handleHeightChange}
                        color='white'
                        onDelete={() => onComponentUpdate(component.id, { height: 30 })}
                    />
                </div>
            </div>

            <hr className={styles.divisionLine} />

            {/* 공통 속성 */}
            {showItemType && (
                <div className={styles.type}>
                    <label htmlFor='' className={`${styles.label} ${styles.titType}`}>
                        항목 타입
                    </label>
                    <Switch
                        id='switch'
                        size='small'
                        checked={component.readonly || false}
                        onChange={handleReadOnlyToggle}
                    />
                    <label htmlFor='' className={styles.switchLable}>
                        읽기 전용
                    </label>
                    <Checkbox
                        id='test1'
                        label='필수 입력 항목'
                        value={1}
                        checked={component.required || false}
                        onChange={(checked) => handleRequiredToggle(checked)}
                        className={styles.required}
                    />
                </div>
            )}

            {/* 타입별 특화 컨텐츠 */}
            {children}
        </div>
    );
};
// 서명 컴포넌트 속성 패널
export const SignaturePropertyPanel: React.FC<BasePropertyPanelProps> = (props) => {
    return <BasePropertyPanel {...props} title='서명' icon={<IcoSignature />} />;
};

// 텍스트박스 컴포넌트 속성 패널
export const TextboxPropertyPanel: React.FC<BasePropertyPanelProps> = (props) => {
    const { component, onComponentUpdate } = props;

    // 표시 문구 변경
    const handleDisplayTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onComponentUpdate(component.id, { displayText: e.target.value });
    };

    // 가이드 문구 변경
    const handlePlaceholderChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onComponentUpdate(component.id, { placeholder: e.target.value });
    };

    return (
        <BasePropertyPanel {...props} title='텍스트' icon={<IcoTextbox />}>
            <hr className={styles.divisionLine} />
            <div className={styles.textAreaBox}>
                <label htmlFor='' className={styles.label}>
                    표시문구
                </label>
                <Textarea
                    id='displayText'
                    placeholder='작성한 내용이 텍스트 항목에 표시 됩니다.'
                    value={component.displayText || ''}
                    onChange={handleDisplayTextChange}
                />
            </div>
            <div className={styles.textAreaBox}>
                <label htmlFor='' className={styles.label}>
                    가이드 문구
                </label>
                <Textarea
                    id='placeholder'
                    placeholder='입력 창이 빈칸일 때 여기 써 둔 문구가 표시됩니다.'
                    value={component.placeholder || ''}
                    onChange={handlePlaceholderChange}
                />
            </div>

            {/* 텍스트 설정 컴포넌트 */}
            <TextSettings component={component} onComponentUpdate={onComponentUpdate} />
        </BasePropertyPanel>
    );
};

// 숫자 컴포넌트 속성 패널
export const NumberPropertyPanel: React.FC<BasePropertyPanelProps> = (props) => {
    const { component, onComponentUpdate } = props;

    // 표시 문구 변경
    const handleDisplayTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onComponentUpdate(component.id, { displayText: e.target.value });
    };

    // 가이드 문구 변경
    const handlePlaceholderChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onComponentUpdate(component.id, { placeholder: e.target.value });
    };

    // 음수 입력 허용 변경
    const handleAllowNegativeChange = (checked: boolean) => {
        onComponentUpdate(component.id, { allowNegative: checked });
    };

    return (
        <BasePropertyPanel {...props} title='숫자' icon={<IcoNumber />}>
            <hr className={styles.divisionLine} />
            <div className={styles.type}>
                <label htmlFor='' className={`${styles.label} ${styles.titType}`}>
                    항목 전용 옵션
                </label>
                <Checkbox
                    id={`allowNegative-${component.id}`}
                    label='음수 입력 허용'
                    value={component.allowNegative ? 1 : 0}
                    checked={component.allowNegative || false}
                    onChange={(checked) => handleAllowNegativeChange(checked)}
                    className={styles.required}
                />
            </div>
            <hr className={styles.divisionLine} />
            <div className={styles.textAreaBox}>
                <label htmlFor='' className={styles.label}>
                    표시문구
                </label>
                <Textarea
                    id='displayText'
                    placeholder='작성한 내용이 숫자 항목에 표시 됩니다.'
                    value={component.displayText || ''}
                    onChange={handleDisplayTextChange}
                />
            </div>
            <div className={styles.textAreaBox}>
                <label htmlFor='' className={styles.label}>
                    가이드 문구
                </label>
                <Textarea
                    id='placeholder'
                    placeholder='입력 창이 빈칸일 때 여기 써 둔 문구가 표시됩니다.'
                    value={component.placeholder || ''}
                    onChange={handlePlaceholderChange}
                />
            </div>

            {/* 텍스트 설정 컴포넌트 */}
            <TextSettings component={component} onComponentUpdate={onComponentUpdate} />
        </BasePropertyPanel>
    );
};
// 날짜 컴포넌트 속성 패널
export const DatePropertyPanel: React.FC<BasePropertyPanelProps> = (props) => {
    const { component, onComponentUpdate } = props;

    // 적용 데이터 타입 변경
    const handleDataTypeChange = (e: any) => {
        onComponentUpdate(component.id, { dataType: e.target.value });
    };

    // 날짜 형식 변경
    const handleDateFormatChange = (e: any) => {
        onComponentUpdate(component.id, { dateFormat: e.target.value });
    };

    // 시간 형식 변경
    const handleTimeFormatChange = (e: any) => {
        onComponentUpdate(component.id, { timeFormat: e.target.value });
    };

    // 기본 날짜 변경
    const handleDefaultDateChange = (date: Dayjs | null) => {
        if (date) {
            onComponentUpdate(component.id, { defaultDate: date.format('YYYY-MM-DD') });
        }
    };

    // 기본 시간 변경
    const handleDefaultTimeChange = (time: Dayjs | null) => {
        if (time) {
            onComponentUpdate(component.id, { defaultTime: time.format('HH:mm') });
        }
    };

    return (
        <BasePropertyPanel {...props} title='날짜/시간' icon={<IcoCalendar />}>
            <hr className={styles.divisionLine} />
            <div className={styles.selectBox}>
                <label htmlFor='dataType' className={styles.label}>
                    적용 데이터
                </label>
                <BoxSelect
                    id='dataType'
                    value={component.dataType || 'date'}
                    onChange={handleDataTypeChange}
                    options={[
                        { label: '날짜', value: 'date' },
                        { label: '날짜(연도 없음)', value: 'dateNoYear' },
                        { label: '날짜 시간', value: 'dateTime' },
                        { label: '시간', value: 'time' },
                    ]}
                    validationText=''
                    color='white'
                />
            </div>

            {component.dataType !== 'time' && (
                <div className={`${styles.selectBox} ${styles.dateForm}`}>
                    <label htmlFor='dateFormat' className={styles.label}>
                        날짜양식
                    </label>
                    <BoxSelect
                        id='dateFormat'
                        value={component.dateFormat || 'YYYY-MM-DD'}
                        onChange={handleDateFormatChange}
                        options={[
                            { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
                            { label: 'MM-DD-YYYY', value: 'MM-DD-YYYY' },
                            { label: 'DD-MM-YYYY', value: 'DD-MM-YYYY' },
                            { label: '연-월-일', value: '연-월-일' },
                        ]}
                        validationText=''
                        color='white'
                    />
                </div>
            )}

            <div className={`${styles.selectBox} ${styles.timeForm}`}>
                <label htmlFor='timeFormat' className={styles.label}>
                    시간양식
                </label>
                <BoxSelect
                    id='timeFormat'
                    value={component.timeFormat || 'HH:MM'}
                    onChange={handleTimeFormatChange}
                    options={[
                        { label: 'HH:MM', value: 'HH:MM' },
                        { label: '시 분', value: '시 분' },
                    ]}
                    validationText=''
                    color='white'
                />
            </div>

            <div className={styles.dateTimeGroup}>
                {component.dataType !== 'time' && (
                    <div className={`${styles.datePicker} ${styles.datePickerForm}`}>
                        <label htmlFor='defaultDate' className={styles.label}>
                            날짜
                        </label>
                        <SwDatePicker
                            id='defaultDate'
                            label=''
                            validationText=''
                            value={component.defaultDate ? dayjs(component.defaultDate) : null}
                            onChange={handleDefaultDateChange}
                            color='white'
                        />
                    </div>
                )}

                <div className={styles.timePicker}>
                    <label htmlFor='defaultTime' className={styles.label}>
                        시간
                    </label>
                    <SwTimePicker
                        id='defaultTime'
                        label=''
                        validationText=''
                        value={component.defaultTime ? dayjs(`2023-01-01 ${component.defaultTime}`) : null}
                        onChange={handleDefaultTimeChange}
                        color='white'
                    />
                </div>
            </div>

            {/* 텍스트 설정 컴포넌트 */}
            <TextSettings component={component} onComponentUpdate={onComponentUpdate} />
        </BasePropertyPanel>
    );
};

// 라디오 버튼 컴포넌트 속성 패널
export const RadioPropertyPanel: React.FC<BasePropertyPanelProps> = (props) => {
    const { component, onComponentUpdate } = props;

    // 그룹 이름 변경
    const handleGroupNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onComponentUpdate(component.id, { groupName: e.target.value });
    };

    // 기본 선택 여부 변경
    const handleDefaultSelectedChange = (checked: boolean) => {
        onComponentUpdate(component.id, { defaultSelected: checked });
    };

    return (
        <BasePropertyPanel {...props} title='라디오 버튼' icon={<IcoRadio fill='#fff' />}>
            <hr className={styles.divisionLine} />
            <div className={styles.type}>
                <label htmlFor='' className={`${styles.label} ${styles.titType}`}>
                    항목 전용 옵션
                </label>
                <InputTextBox
                    type='text'
                    id='groupName'
                    placeholder='그룹 이름 입력'
                    label='그룹'
                    validationText=''
                    value={component.groupName || ''}
                    onChange={handleGroupNameChange}
                    color='white'
                    onDelete={() => onComponentUpdate(component.id, { groupName: '' })}
                    vertical
                />
                <Checkbox
                    id={`defaultSelected-${component.id}`}
                    label='선택된 상태로 표시'
                    value={component.defaultSelected ? 1 : 0}
                    checked={component.defaultSelected || false}
                    onChange={(checked) => handleDefaultSelectedChange(checked)}
                    className={styles.checkedOption}
                />
            </div>
        </BasePropertyPanel>
    );
};

// 체크박스 컴포넌트 속성 패널
export const CheckboxPropertyPanel: React.FC<BasePropertyPanelProps> = (props) => {
    const { component, onComponentUpdate } = props;

    // 그룹 이름 변경
    const handleGroupNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onComponentUpdate(component.id, { groupName: e.target.value });
    };

    // 기본 선택 여부 변경
    const handleDefaultSelectedChange = (checked: boolean) => {
        onComponentUpdate(component.id, { defaultSelected: checked });
    };

    return (
        <BasePropertyPanel {...props} title='체크박스' icon={<IcoCheckbox />}>
            <hr className={styles.divisionLine} />
            <div className={styles.type}>
                <label htmlFor='' className={`${styles.label} ${styles.titType}`}>
                    항목 전용 옵션
                </label>
                <InputTextBox
                    type='text'
                    id='groupName'
                    placeholder='그룹 이름 입력'
                    label='그룹'
                    validationText=''
                    value={component.groupName || ''}
                    onChange={handleGroupNameChange}
                    color='white'
                    onDelete={() => onComponentUpdate(component.id, { groupName: '' })}
                    vertical
                />
                <Checkbox
                    id={`defaultSelected-${component.id}`}
                    label='선택된 상태로 표시'
                    value={component.defaultSelected ? 1 : 0}
                    checked={component.defaultSelected || false}
                    onChange={(checked) => handleDefaultSelectedChange(checked)}
                    className={styles.checkedOption}
                />
            </div>
        </BasePropertyPanel>
    );
};
// 드롭다운 컴포넌트 속성 패널
export const DropdownPropertyPanel: React.FC<BasePropertyPanelProps> = (props) => {
    const { component, onComponentUpdate } = props;

    // 옵션 텍스트를 저장할 로컬 상태 추가
    const [optionsText, setOptionsText] = useState<string>(
        Array.isArray(component.options) ? component.options.join(',') : ''
    );

    // 옵션 텍스트 입력 변경 처리
    const handleOptionsTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newText = e.target.value;
        setOptionsText(newText);

        // 쉼표(,)로 구분하여 옵션 배열 생성 후 공백 제거
        const options = newText
            .split(',')
            .map((option) => option.trim())
            .filter((option) => option !== ''); // 빈 문자열 제거

        onComponentUpdate(component.id, { options });
    };

    // 옵션 배열이 변경되면 로컬 텍스트 상태 업데이트
    useEffect(() => {
        if (component.options && Array.isArray(component.options)) {
            setOptionsText(component.options.join(','));
        }
    }, [component.id]); // component.id가 변경될 때만 실행 (다른 컴포넌트로 전환 시)

    // 기본값 선택 변경
    const handleDefaultValueChange = (e: any) => {
        onComponentUpdate(component.id, { defaultValue: e.target.value });
    };

    // 가이드 문구 변경
    const handlePlaceholderChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onComponentUpdate(component.id, { placeholder: e.target.value });
    };

    // 기본값 옵션 생성
    const defaultValueOptions = [
        { label: '선택 안함', value: '' }, // 선택 안함 옵션 추가
        ...(component.options || []).map((option) => ({ label: option, value: option })),
    ];

    return (
        <BasePropertyPanel {...props} title='드롭다운' icon={<IcoDropdown />}>
            <hr className={styles.divisionLine} />
            <div className={styles.textAreaBox}>
                <label htmlFor='' className={styles.label}>
                    드롭다운 항목 (쉼표로 구분)
                </label>
                <Textarea
                    id='options'
                    placeholder='option1,option2,option3'
                    value={optionsText} // 로컬 상태 사용
                    onChange={handleOptionsTextChange}
                />
            </div>

            <div className={`${styles.selectBox} ${styles.selectBasic}`}>
                <label htmlFor='defaultValue' className={styles.label}>
                    기본값 선택
                </label>
                <BoxSelect
                    id='defaultValue'
                    value={component.defaultValue || ''}
                    onChange={handleDefaultValueChange}
                    options={defaultValueOptions}
                    validationText=''
                    color='white'
                />
            </div>

            <div className={`${styles.textAreaBox} ${styles.guideText}`}>
                <label htmlFor='' className={styles.label}>
                    가이드 문구
                </label>
                <Textarea
                    id='placeholder'
                    placeholder='입력 창이 빈칸일 때 여기 써 둔 문구가 표시됩니다.'
                    value={component.placeholder || ''}
                    onChange={handlePlaceholderChange}
                />
            </div>

            {/* 텍스트 설정 컴포넌트 */}
            <TextSettings component={component} onComponentUpdate={onComponentUpdate} />
        </BasePropertyPanel>
    );
};

// 링크 컴포넌트 속성 패널
export const LinkPropertyPanel: React.FC<BasePropertyPanelProps> = (props) => {
    const { component, onComponentUpdate } = props;

    // URL 변경
    const handleUrlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onComponentUpdate(component.id, { url: e.target.value });
    };

    // 표시 문구 변경
    const handleDisplayTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onComponentUpdate(component.id, { displayText: e.target.value });
    };

    // 가이드 문구 변경
    const handlePlaceholderChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onComponentUpdate(component.id, { placeholder: e.target.value });
    };

    return (
        <BasePropertyPanel {...props} title='링크' icon={<IcoLink />}>
            <hr className={styles.divisionLine} />
            <div className={styles.textAreaBox}>
                <label htmlFor='' className={styles.label}>
                    URL
                </label>
                <Textarea id='url' placeholder='https://' value={component.url || ''} onChange={handleUrlChange} />
            </div>

            <div className={styles.textAreaBox}>
                <label htmlFor='' className={styles.label}>
                    표시 문구
                </label>
                <Textarea
                    id='displayText'
                    placeholder='링크로 표시될 텍스트를 입력하세요'
                    value={component.displayText || ''}
                    onChange={handleDisplayTextChange}
                />
            </div>

            <div className={styles.textAreaBox}>
                <label htmlFor='' className={styles.label}>
                    가이드 문구
                </label>
                <Textarea
                    id='placeholder'
                    placeholder='입력 창이 빈칸일 때 여기 써 둔 문구가 표시됩니다.'
                    value={component.placeholder || ''}
                    onChange={handlePlaceholderChange}
                />
            </div>

            {/* 텍스트 설정 컴포넌트 */}
            <TextSettings component={component} onComponentUpdate={onComponentUpdate} />
        </BasePropertyPanel>
    );
};

// 파일 컴포넌트 속성 패널
export const FilePropertyPanel: React.FC<BasePropertyPanelProps> = (props) => {
    const { component, onComponentUpdate } = props;

    // 기존 상태 유지
    const [fileIds, setFileIds] = useState<string[]>(Array.isArray(component.fileIds) ? component.fileIds : []);
    const [fileData, setFileData] = useState<any[]>([]);

    // 가이드 문구 변경
    const handlePlaceholderChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onComponentUpdate(component.id, { placeholder: e.target.value });
    };

    // AttachFile에서 파일 변경을 처리하는 함수 - 가장 단순한 형태로 유지
    const handleFilesChange = (updatedFiles: any) => {
        console.log('updatedFiles 타입:', typeof updatedFiles);

        // updatedFiles가 함수인 경우 처리
        if (typeof updatedFiles === 'function') {
            // 기존 fileData를 인자로 전달하여 함수 실행
            const newFiles = updatedFiles(fileData);
            console.log('함수 실행 결과:', newFiles);

            // 결과가 배열인지 확인
            if (Array.isArray(newFiles)) {
                setFileData(newFiles);

                // 파일 ID 배열 추출
                const ids = newFiles.filter((file) => file && file.file_id).map((file) => file.file_id);

                // 로컬 상태 및 컴포넌트 업데이트
                setFileIds(ids);
                onComponentUpdate(component.id, {
                    fileIds: ids,
                });
            }
        }
        // updatedFiles가 배열인 경우 직접 처리
        else if (Array.isArray(updatedFiles)) {
            setFileData(updatedFiles);

            const ids = updatedFiles.filter((file) => file && file.file_id).map((file) => file.file_id);

            setFileIds(ids);
            onComponentUpdate(component.id, {
                fileIds: ids,
            });
        }
        // 기타 타입 처리 (안전성을 위해)
        else {
            console.warn('예상치 못한 updatedFiles 타입:', updatedFiles);
        }
    };

    // 파일 데이터 로드 (첫 렌더링 또는 컴포넌트 ID 변경 시)
    useEffect(() => {
        console.log('component.fileIds:', component.fileIds);
        // component.fileIds가 있을 때만 처리
        if (component.fileIds && Array.isArray(component.fileIds) && component.fileIds.length > 0) {
            // 각 파일 ID에 대해 파일 정보 가져오기
            const loadFileData = async () => {
                try {
                    // 파일 정보를 가져오는 Promise 배열 생성
                    const filePromises = component.fileIds.map((fileId) =>
                        fetcherGetFileInfo(fileId).catch((error) => {
                            console.error(`파일 정보 가져오기 실패 (ID: ${fileId}):`, error);
                            return null;
                        })
                    );

                    // 모든 Promise 실행 및 결과 기다림
                    const fileInfoResults = await Promise.all(filePromises);

                    // null이 아닌 유효한 파일 정보만 필터링하여 상태 업데이트
                    const validFileInfo = fileInfoResults.filter(Boolean);
                    setFileData(validFileInfo);
                } catch (error) {
                    console.error('파일 정보 로드 중 오류:', error);
                }
            };

            loadFileData();
        } else {
            // fileIds가 없으면 빈 배열로 초기화
            setFileData([]);
        }
    }, [component.id, component.fileIds]);

    return (
        <BasePropertyPanel {...props} title='첨부파일' icon={<IcoAttachFile />}>
            <hr className={styles.divisionLine} />
            <div className={styles.fileAttach}>
                <label className={styles.label}>첨부파일</label>
                <AttachFile params={fileData} setParams={handleFilesChange} procType='HPO' formMode='edit' />
            </div>

            <div className={styles.textAreaBox}>
                <label htmlFor='' className={styles.label}>
                    가이드 문구
                </label>
                <Textarea
                    id='placeholder'
                    placeholder='입력 창이 빈칸일 때 여기 써 둔 문구가 표시됩니다.'
                    value={component.placeholder || ''}
                    onChange={handlePlaceholderChange}
                />
            </div>

            {/* 텍스트 설정 컴포넌트 */}
            <TextSettings component={component} onComponentUpdate={onComponentUpdate} />
        </BasePropertyPanel>
    );
};

// 회사 직인 컴포넌트 속성 패널
export const UserSealPropertyPanel: React.FC<BasePropertyPanelProps> = (props) => {
    return (
        <BasePropertyPanel {...props} title='회사 직인' icon={<IcoStamp fill='#666666' />} showItemType={false}>
            {/* 회사 직인은 이름, 위치, 크기만 표시 (TextSettings 컴포넌트 사용하지 않음) */}
        </BasePropertyPanel>
    );
};

// 구성원 이름 컴포넌트 속성 패널
export const UserNmPropertyPanel: React.FC<BasePropertyPanelProps> = (props) => {
    const { component, onComponentUpdate } = props;

    return (
        <BasePropertyPanel {...props} title='구성원 이름' icon={<IcoMemberName />} showItemType={false}>
            {/* 텍스트 설정 컴포넌트 */}
            <TextSettings component={component} onComponentUpdate={onComponentUpdate} />
        </BasePropertyPanel>
    );
};

// 구성원 주민등록번호 컴포넌트 속성 패널
export const UserRrnoPropertyPanel: React.FC<BasePropertyPanelProps> = (props) => {
    const { component, onComponentUpdate } = props;
    return (
        <BasePropertyPanel {...props} title='구성원 주민등록번호' icon={<IcoIdentification />} showItemType={false}>
            {/* 텍스트 설정 컴포넌트 */}
            <TextSettings component={component} onComponentUpdate={onComponentUpdate} />
        </BasePropertyPanel>
    );
};

// 구성원 생년월일 컴포넌트 속성 패널
export const UserBirthPropertyPanel: React.FC<BasePropertyPanelProps> = (props) => {
    const { component, onComponentUpdate } = props;

    // 표시 문구 변경
    const handleDisplayTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onComponentUpdate(component.id, { displayText: e.target.value });
    };

    // 가이드 문구 변경
    const handlePlaceholderChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onComponentUpdate(component.id, { placeholder: e.target.value });
    };

    // 날짜 형식 변경
    const handleDateFormatChange = (e: any) => {
        onComponentUpdate(component.id, { dateFormat: e.target.value });
    };

    return (
        <BasePropertyPanel {...props} title='구성원 생년월일' icon={<IcoBirth />} showItemType={false}>
            <div className={`${styles.selectBox} ${styles.dateForm}`}>
                <label htmlFor='dateFormat' className={styles.label}>
                    날짜양식
                </label>
                <BoxSelect
                    id='dateFormat'
                    value={component.dateFormat || 'YYYY-MM-DD'}
                    onChange={handleDateFormatChange}
                    options={[
                        { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
                        { label: 'MM-DD-YYYY', value: 'MM-DD-YYYY' },
                        { label: 'DD-MM-YYYY', value: 'DD-MM-YYYY' },
                        { label: '연-월-일', value: '연-월-일' },
                    ]}
                    validationText=''
                    color='white'
                />
            </div>

            {/* 텍스트 설정 컴포넌트 */}
            <TextSettings component={component} onComponentUpdate={onComponentUpdate} />
        </BasePropertyPanel>
    );
};

// 구성원 주소 컴포넌트 속성 패널
export const UserAddrPropertyPanel: React.FC<BasePropertyPanelProps> = (props) => {
    const { component, onComponentUpdate } = props;

    return (
        <BasePropertyPanel {...props} title='구성원 주소' icon={<IcoAddress />} showItemType={false}>
            {/* 텍스트 설정 컴포넌트 */}
            <TextSettings component={component} onComponentUpdate={onComponentUpdate} />
        </BasePropertyPanel>
    );
};

// 이 함수는 타입에 맞는 속성 패널 컴포넌트를 반환합니다
export const getPropertyPanelByType = (
    type: string,
    props: BasePropertyPanelProps,
    onPositionChange?: (x: number, y: number) => void,
    onSizeChange?: (width: number, height: number) => void,
    isChecked1?: boolean,
    setIsChecked1?: (isChecked: boolean) => void
) => {
    // props에 콜백 추가
    const panelProps = {
        ...props,
        onPositionChange,
        onSizeChange,
    };

    switch (type) {
        // 공용 컴포넌트
        case 'sign':
            return <SignaturePropertyPanel {...panelProps} />;
        case 'textbox':
            return <TextboxPropertyPanel {...panelProps} />;
        case 'datepicker':
            return <DatePropertyPanel {...panelProps} />;
        case 'checkbox':
            return <CheckboxPropertyPanel {...panelProps} />;
        case 'radio':
            return <RadioPropertyPanel {...panelProps} />;
        case 'combobox':
            return <DropdownPropertyPanel {...panelProps} />;
        case 'number':
            return <NumberPropertyPanel {...panelProps} />;
        case 'link':
            return <LinkPropertyPanel {...panelProps} />;
        case 'file':
            return <FilePropertyPanel {...panelProps} />;
        // 인사잇 컴포넌트
        case 'insait_seal':
            return <UserSealPropertyPanel {...panelProps} />;
        case 'insait_user_nm':
            return <UserNmPropertyPanel {...panelProps} />;
        case 'insait_user_rrno':
            return <UserRrnoPropertyPanel {...panelProps} />;
        case 'insait_user_birth':
            return <UserBirthPropertyPanel {...panelProps} />;
        case 'insait_user_addr':
            return <UserAddrPropertyPanel {...panelProps} />;
        default:
            // 기본 패널 반환
            return (
                <BasePropertyPanel
                    {...panelProps}
                    title={type.charAt(0).toUpperCase() + type.slice(1)}
                    icon={<IcoSignature />}
                >
                    <div className={styles.textAreaBox}>
                        <label htmlFor='' className={styles.label}>
                            {type} 컴포넌트에 대한 속성 패널입니다.
                        </label>
                    </div>
                </BasePropertyPanel>
            );
    }
};
