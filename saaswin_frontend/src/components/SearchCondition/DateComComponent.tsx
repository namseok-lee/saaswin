'use client';
import { Box, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ComboAddPopup from 'components/ComboAddPopup';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetcherPost } from 'utils/axios';
import {
    BoxStyles,
    DatePickerStyles,
    formControlStyle,
    TypographyStyles,
} from '../../styles/component/SearchCondition';
import { componentProps } from '../../types/component/SearchCondition';

// 텍스트박스
const DateComComponent = ({
    item,
    uniqueKey,
    scr_no,
    sendDataItem,
    handleChange,
    visible,
    datePickProps,
    selectboxProps,
}: componentProps) => {
    // 다국어
    const { t } = useTranslation();
    const style = visible ? BoxStyles('width: 620px') : BoxStyles('display:none');
    const [modalOpen, setModalOpen] = useState(false);
    const [comboData, setComboData] = useState(null);
    const sqlId = item.sqlId;
    const itemId = item.id.split('||');
    const itemName = item.text.split('||');
    const firstValue = dayjs(new Date()).format('YYYYMMDD');
    const [param, setParam] = useState({
        [itemId[0]]: firstValue,
        scr_no: scr_no,
    });

    const handleCloseModal = () => {
        setModalOpen((prev) => !prev); // 상태를 안전하게 토글
    };

    useEffect(() => {
        const item = [
            {
                sqlId: sqlId,
                params: [param],
            },
        ];
        fetcherPost([process.env.NEXT_PUBLIC_SSW_SQL_SEARCH_API_URL, item])
            .then((response) => {
                setComboData(response[0].data);
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
            const sendValue = comboData.length > 0 ? comboData[0].value : '';
            handleChange(itemId[0], firstValue, item.type);
            handleChange(itemId[1], sendValue, item.type);
        }
    }, [comboData]);

    const [selectedValue, setSeletedValue] = useState('');

    return (
        visible && (
            <div key={uniqueKey} className='dateComPicker'>
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
                                value={
                                    sendDataItem.std_ymd ? dayjs(sendDataItem.std_ymd, 'YYYYMMDD') : dayjs(new Date())
                                }
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
                </div>
                <div
                    key={uniqueKey}
                    className={`selectBasicBox ${selectboxProps?.className} ${selectboxProps?.error ? 'error' : ''} ${
                        selectboxProps?.disabled ? 'disabled' : ''
                    }`}
                >
                    <div className='row'>
                        {item.text && (
                            <label htmlFor={item.id} className='label'>
                                {t(item.text)}
                            </label>
                        )}
                        <div className='textWrap'>
                            <FormControl fullWidth>
                                {selectboxProps?.placeholder && (
                                    <InputLabel id={`${item.id}-label`}>{selectboxProps?.placeholder}</InputLabel>
                                )}
                                <Select
                                    labelId={`${item.id}-label`}
                                    id={item.id}
                                    displayEmpty
                                    value={selectedValue || ''}
                                    onChange={(e) => {
                                        setSeletedValue(e.target.value);
                                        handleChange(
                                            item.id,
                                            e.target.value,
                                            'COMBO',
                                            comboData?.find((item) => item.com_cd === e.target.value)?.com_cd_nm
                                        );
                                    }}
                                    disabled={selectboxProps?.disabled}
                                    multiple={selectboxProps?.multiple}
                                >
                                    <MenuItem value=''>전체</MenuItem>
                                    {comboData && comboData.length > 0
                                        ? comboData?.map((comboItem, index) => (
                                              <MenuItem key={index} value={comboItem.com_cd}>
                                                  {comboItem.com_cd_nm}
                                              </MenuItem>
                                          ))
                                        : null}
                                </Select>
                            </FormControl>
                        </div>
                    </div>
                </div>
                {modalOpen && <ComboAddPopup open={modalOpen} onClose={handleCloseModal} scrItgNo={scr_no} />}
                {/* <Box key={uniqueKey} sx={style}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Typography variant='body1' sx={TypographyStyles()}>
                        {t(itemName[0])}
                    </Typography>
                    <DatePicker
                        value={dayjs(param[itemId[0]])}
                        sx={DatePickerStyles()}
                        onChange={(newValue) => {
                            setParam((prev) => {
                                return {
                                    [itemId[0]]: newValue,
                                    scr_no: scr_no,
                                };
                            });
                            handleChange(
                                itemId[0],
                                dayjs(newValue).format('YYYYMMDD'),
                                item.type,
                                dayjs(newValue).format('YYYYMMDD')
                            );
                        }}
                        format='YYYY.MM.DD'
                        minDate={dayjs(new Date('1900-01-01'))}
                        maxDate={dayjs(new Date('2999-12-31'))}
                    />
                </LocalizationProvider>
                <Typography variant='body1' sx={TypographyStyles()}>
                    {t(itemName[1])}
                </Typography>
                <FormControl sx={formControlStyle()}>
                    <Select
                        labelId='basic-select-label'
                        id='basic-select'
                        displayEmpty
                        value={comboData && comboData.length > 0 ? comboData[0].value : ''}
                        onChange={(e) =>
                            e.target.value === 'ADD'
                                ? setModalOpen(true)
                                : handleChange(itemId[1], e.target.value, item.type)
                        }
                        inputProps={{ 'aria-label': 'Without label' }}
                        sx={{
                            background: 'white',
                            width: 200,
                            '& .MuiSelect-select': {
                                display: 'flex',
                                alignItems: 'center', // ✅ 수직 중앙 정렬
                                justifyContent: 'flex-start', // ✅ 수평 중앙 정렬
                                textAlign: 'left',
                                height: '100%', // 높이를 부모에 맞춤
                            },
                        }}
                    >
                        {comboData && comboData.length > 0 ? (
                            comboData?.map((comboItem) => (
                                <MenuItem value={comboItem.value}>{comboItem.value}</MenuItem>
                            ))
                        ) : (
                            <MenuItem value=''>작업이 없습니다.</MenuItem>
                        )}
                    </Select>
                </FormControl>

                {modalOpen && <ComboAddPopup open={modalOpen} onClose={handleCloseModal} scrItgNo={scr_no} />}
            </Box> */}
            </div>
        )
    );
};

export default DateComComponent;
