'use client';
import React, { useEffect, useState } from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { componentProps } from '../../types/component/SearchCondition';
import {
    BoxStyles,
    DatePickerStyles,
    TypographyStyles,
    formControlStyle,
} from '../../styles/component/SearchCondition';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { fetcherPost, fetcherPostData } from 'utils/axios';
import { useTranslation } from 'react-i18next';

// 텍스트박스
const DateComSlryComponent = ({
    item,
    uniqueKey,
    sendDataItem,
    handleChange,
    visible,
    datePickProps,
    selectboxProps,
}: componentProps) => {
    // 다국어
    const { t } = useTranslation();
    const style = visible ? BoxStyles('width: 620px') : BoxStyles('display:none');
    const [comboData, setComboData] = useState(null);
    const [selectedValue, setSeletedValue] = useState('');
    const sqlId = item.sqlId;
    const sqlKey = item.sqlKey;
    const itemId = item.id.split('||');
    const itemName = item.text.split('||');
    const firstValue = dayjs(new Date()).format('YYYYMM');
    const [param, setParam] = useState({
        [itemId[0]]: firstValue,
    });

    useEffect(() => {
        const item = [
            {
                sqlId: sqlId,
                sql_key: sqlKey,
                params: [param],
            },
        ];
        fetcherPostData(item)
            .then((response) => {
                setComboData(response.data[0].data);
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                //setDataLoading(false);
            });
    }, [param]);

    // 초기값 설정 시 onChange 강제 호출
    useEffect(() => {
        if (comboData) {
            const sendCd = comboData.length > 0 ? comboData[0].cd : '';
            const sendValue = comboData.length > 0 ? comboData[0].value : '';
            const ddlnYn = comboData.length > 0 ? comboData[0].ddln_yn : '';
            const trprDdlnYn = comboData.length > 0 ? comboData[0].trpr_job_ddln_yn : '';
            handleChange(itemId[1], sendCd, item.type, sendValue);
            setSeletedValue(sendCd);
            handleChange(itemId[2], ddlnYn, item.type, '');
            handleChange(itemId[3], trprDdlnYn, item.type, '');
        } else {
            handleChange(itemId[1], '', item.type, '');
            setSeletedValue('');
            handleChange(itemId[2], '', item.type, '');
            handleChange(itemId[3], '', item.type, '');
        }
    }, [comboData]);

    return (
        visible && (
            <div key={uniqueKey} className='dateSalry'>
                <div className={`datePicker ${datePickProps?.className} ${datePickProps?.error ? 'error' : ''}`}>
                    <div className='row'>
                        {itemName[0] && (
                            <label htmlFor={itemId[0]} className='label'>
                                {t(itemName[0])}
                            </label>
                        )}
                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='ko'>
                            <DatePicker
                                disabled={datePickProps?.disabled}
                                slotProps={{
                                    actionBar: {
                                        actions: ['accept', 'cancel'],
                                    },
                                }}
                                views={['month', 'year']}
                                showDaysOutsideCurrentMonth={true}
                                readOnly={datePickProps?.readonly}
                                value={sendDataItem.std_ymd ? dayjs(sendDataItem.std_ymd, 'YYYYMM') : dayjs(new Date())}
                                onChange={(newValue) => {
                                    const regex = /^\d{6}$/;
                                    const formattedDate = dayjs(new Date(newValue)).format('YYYYMM');
                                    if (regex.test(formattedDate)) {
                                        setParam((prev) => {
                                            return {
                                                [itemId[0]]: formattedDate,
                                            };
                                        });
                                        handleChange(itemId[0], formattedDate, item.type, formattedDate);
                                    }
                                }}
                                format='YYYY.MM'
                                minDate={dayjs(new Date('1900-01-01'))}
                                maxDate={dayjs(new Date('2999-12-31'))}
                            />
                        </LocalizationProvider>
                    </div>
                </div>

                <div
                    key={uniqueKey}
                    className={`selectBasicBox ${selectboxProps?.className} ${selectboxProps?.error ? 'error' : ''} ${
                        selectboxProps?.disabled ? 'disabled' : ''
                    }`}
                >
                    <div className='row'>
                        {itemName[1] && (
                            <label htmlFor={itemId[1]} className='label'>
                                {t(itemName[1])}
                            </label>
                        )}
                        <div className='textWrap'>
                            <FormControl fullWidth>
                                {selectboxProps?.placeholder && (
                                    <InputLabel id={`${itemId[1]}-label`}>{selectboxProps?.placeholder}</InputLabel>
                                )}
                                <Select
                                    labelId={`${itemId[1]}-label`}
                                    id={itemId[1]}
                                    displayEmpty
                                    value={selectedValue || ''}
                                    onChange={(e) => {
                                        setSeletedValue(e.target.value);
                                        handleChange(
                                            itemId[1],
                                            e.target.value,
                                            'COMBO',
                                            comboData?.find((item) => item.cd === e.target.value)?.value
                                        );
                                    }}
                                    disabled={selectboxProps?.disabled}
                                    multiple={selectboxProps?.multiple}
                                >
                                    {comboData && comboData.length > 0 ? (
                                        comboData?.map((comboItem, index) => (
                                            <MenuItem key={index} value={comboItem.cd}>
                                                {comboItem.value}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem value=''>급여목록이 없습니다.</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                        </div>
                    </div>
                </div>
            </div>
        )
    );
};

export default DateComSlryComponent;
