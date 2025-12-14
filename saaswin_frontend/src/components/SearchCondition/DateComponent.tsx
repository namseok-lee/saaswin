'use client';
import React from 'react';
import { Box, Typography } from '@mui/material';
import { componentProps } from '../../types/component/SearchCondition';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { useTranslation } from 'react-i18next';

// 텍스트박스
const DateComponent = ({ item, uniqueKey, sendDataItem, handleChange, visible, datePickProps }: componentProps) => {
    // 다국어
    const { t } = useTranslation();

    // const style = visible ? BoxStyles() : BoxStyles('display:none');/
    return (
        visible && (
            <div className={`datePicker ${datePickProps?.className} ${datePickProps?.error ? 'error' : ''}`}>
                <div className='row'>
                    {item.text && (
                        <label htmlFor={item.id} className='label'>
                            {t(item.text)}
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
                            showDaysOutsideCurrentMonth={true}
                            readOnly={datePickProps?.readonly}
                            value={sendDataItem.std_ymd ? dayjs(sendDataItem.std_ymd, 'YYYYMMDD') : dayjs(new Date())}
                            onChange={(newValue) =>
                                handleChange(
                                    'std_ymd',
                                    dayjs(newValue).format('YYYYMMDD'),
                                    'std_ymd',
                                    dayjs(newValue).format('YYYYMMDD')
                                )
                            }
                            format='YYYY.MM.DD'
                            minDate={dayjs(new Date('1900-01-01'))}
                            maxDate={dayjs(new Date('2999-12-31'))}
                        />
                    </LocalizationProvider>
                </div>
                {/* <Box key={uniqueKey} sx={style}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Typography variant='body1' sx={TypographyStyles()}>
                        {t(item.text)}
                    </Typography>
                    <DatePicker
                        value={sendDataItem.std_ymd ? dayjs(sendDataItem.std_ymd, 'YYYYMMDD') : dayjs(new Date())}
                        sx={DatePickerStyles()}
                        onChange={(newValue) =>
                            handleChange(
                                'std_ymd',
                                dayjs(newValue).format('YYYYMMDD'),
                                'std_ymd',
                                dayjs(newValue).format('YYYYMMDD')
                            )
                        }
                        format='YYYY.MM.DD'
                        minDate={dayjs(new Date('1900-01-01'))}
                        maxDate={dayjs(new Date('2999-12-31'))}
                    />
                </LocalizationProvider>
            </Box> */}
            </div>
        )
    );
};

export default DateComponent;
