'use client';
import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { componentProps } from '../../types/component/SearchCondition';
import { BoxStyles, DatePickerStyles, TypographyStyles } from '../../styles/component/SearchCondition';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { useTranslation } from 'react-i18next';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';

// 텍스트박스
const DateFromToComponent = ({
    item,
    uniqueKey,
    sendDataItem,
    handleChange,
    visible,
    dateReangeProps,
    defaultValue,
}: componentProps) => {
    // 다국어
    const { t } = useTranslation();
    // const style = visible ? BoxStyles() : BoxStyles('display:none');
    const fromName = item.id;
    const toName = item.id + '_end';

    const [dateRange, setDateRange] = useState([null, null]);
    const handleDateChange = (newValue) => {
        //setDateRange(newValue); // Update the state with the new date range
        const startDate = newValue[0];
        const endDate = newValue[1];

        handleChange(fromName, dayjs(startDate).format('YYYYMMDD'), item.type, dayjs(startDate).format('YYYYMMDD'));

        handleChange(toName, dayjs(endDate).format('YYYYMMDD'), item.type, dayjs(endDate).format('YYYYMMDD'));
    };
    return (
        visible && (
            <div
                className={`datePicker dateRangePicker ${dateReangeProps?.className} ${
                    dateReangeProps?.error ? 'error' : ''
                }`}
            >
                <div className='row'>
                    {item.text && (
                        <label htmlFor={item.id} className='label'>
                            {t(item.text)}
                        </label>
                    )}
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='ko'>
                        <DateRangePicker
                            disabled={dateReangeProps?.disabled}
                            slotProps={{
                                actionBar: {
                                    actions: ['accept', 'cancel'],
                                },
                            }}
                            localeText={{ start: 'YYYY.MM.DD', end: 'YYYY.MM.DD' }}
                            calendars={1}
                            showDaysOutsideCurrentMonth={true}
                            onChange={handleDateChange}
                            defaultValue={defaultValue}
                        />
                    </LocalizationProvider>
                </div>
                {/* <Box key={uniqueKey} sx={style}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Typography variant='body1' sx={TypographyStyles()}>
                            {t(item.text)}
                        </Typography>
                        <DatePicker
                            value={sendDataItem[fromName] ? dayjs(sendDataItem[fromName], 'YYYYMMDD') : null} // from_regi_ymd 값 적용
                            sx={DatePickerStyles()}
                            onChange={(newValue) =>
                                handleChange(
                                    fromName,
                                    dayjs(newValue).format('YYYYMMDD'),
                                    item.type,
                                    dayjs(newValue).format('YYYYMMDD')
                                )
                            }
                            format='YYYY.MM.DD'
                            minDate={dayjs(new Date('1900-01-01'))}
                            maxDate={dayjs(new Date('2999-12-31'))}
                        />
                        <Typography sx={TypographyStyles(`width: 10px; margin-left: 10px;`)}>~</Typography>
                        <DatePicker
                            value={sendDataItem[toName] ? dayjs(sendDataItem[toName], 'YYYYMMDD') : null} // to_regi_ymd 값 적용
                            sx={DatePickerStyles()}
                            onChange={(newValue) =>
                                handleChange(
                                    toName,
                                    dayjs(newValue).format('YYYYMMDD'),
                                    item.type,
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

export default DateFromToComponent;
