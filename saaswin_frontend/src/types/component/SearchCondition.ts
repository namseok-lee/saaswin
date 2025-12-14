import { SelectChangeEvent } from '@mui/material';
import { Dayjs } from 'dayjs';
import { ReactNode } from 'react';

export interface comboDataItem {
    cd: string;
    cd_nm: string;
}

export interface searchDataItem {
    seq: string;
    id: string;
    text: string;
    type: string;
    default?: string;
    placeholder?: string;
    sqlId?: string;
    required?: string;
    item?: comboDataItem[];
}

export interface searchDataProps {
    masterUIinfo: searchDataItem[];
    tpcdParam: string | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataParam: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    searchParam: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setDataParam: React.Dispatch<React.SetStateAction<any>>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setDisplay: React.Dispatch<React.SetStateAction<any>>;
    handleSubmit: () => void;
}

export interface sendDataItem {
    [key: string]: string | undefined; // 동적 키를 허용하여 다양한 키를 가질 수 있게 함
    from_regi_ymd?: string; // 필요에 따라 옵셔널로 설정
    to_regi_ymd?: string;
}

export interface handleChangeItem {
    sendDataItem: sendDataItem;
    from_regi_ymd?: string; // 필요에 따라 옵셔널로 설정
    to_regi_ymd?: string;
    obj?: any;
}

export interface componentProps {
    item: searchDataItem;
    uniqueKey: string;
    sendDataItem: sendDataItem;
    handleChange: (id: string, value: string, type: string | null, summaryValue: string | null) => void;
    visible: boolean;
    scr_no: string;
    inputProps?: Partial<InputTextBoxProps>;
    selectboxProps?: Partial<BoxSelectProps>;
    datePickProps?: Partial<DatePickerProps>;
    dateReangeProps?: Partial<DateRangePickerProps>;
    onReady?: () => void;
    multiple?: boolean;
    defaultValue?:[Dayjs, Dayjs];
}

export interface detailOptionsProps {
    items: searchOption[];
    searchDataItems?: searchDataItem[];
}

export interface searchOption {
    id: string;
    checkbox_id: string;
    type: string;
    text: string;
    visible: boolean;
}

export interface EmptyBoxProps {
    len: number;
}
export interface RetrieveSqlItem {
    sql: string;
    sqlId: string;
    text: string;
    type: string;
}
export interface Param {
    master: any;
    detail: any;
}

export interface InputTextBoxProps {
    id: string;
    type?: string;
    value: ReactNode;
    placeholder: string;
    className?: string;
    error?: boolean;
    warning?: boolean;
    success?: boolean;
    disabled?: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClick?: () => void;
    onBlur?: () => void;
    onFocus?: () => void;
    onDelete: () => void;
    label?: ReactNode;
}

interface BoxSelectProps {
    id: string;
    value: string | number | HTMLElement;
    placeholder?: string;
    className?: string;
    error?: boolean;
    disabled?: boolean;
    onChange?: (e: SelectChangeEvent) => void;
    label?: string;
    options: { value: number; label: string }[];
    multiple?: boolean;
}

interface DatePickerProps {
    className?: string;
    id: string;
    name?: string;
    label?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    readonly?: boolean;
    error?: boolean;
    value?: Dayjs | null;
    placeHolder?: string;
}

interface DateRangePickerProps {
    className?: string;
    id: string;
    label?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    error?: boolean;
}
