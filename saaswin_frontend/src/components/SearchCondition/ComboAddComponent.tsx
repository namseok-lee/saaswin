'use client';
import React, { useEffect, useState } from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { componentProps } from '../../types/component/SearchCondition';
import { BoxStyles, formControlStyle, TypographyStyles } from '../../styles/component/SearchCondition';
import ComboAddPopup from 'components/ComboAddPopup';
import { fetcherPost } from 'utils/axios';
import { useTranslation } from 'react-i18next';

// 텍스트박스
const ComboAddComponent = ({
    item,
    uniqueKey,
    sendDataItem,
    handleChange,
    visible,
    selectboxProps,
}: componentProps) => {
    // 다국어
    const { t } = useTranslation();
    const style = visible ? BoxStyles() : BoxStyles('display:none');
    const [modalOpen, setModalOpen] = useState(false);
    const [comboData, setComboData] = useState(null);
    const [selectedValue, setSeletedValue] = useState('');
    const sqlId = item.sqlId;

    const handleCloseModal = () => {
        setModalOpen((prev) => !prev); // 상태를 안전하게 토글
    };

    useEffect(() => {
        const item = [
            {
                sqlId: sqlId,
                params: [{}],
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
    }, []);

    return (
        visible && (
            <div key={uniqueKey}>
                <div
                    className={`selectBasicBox ${selectboxProps?.className} ${selectboxProps?.error ? 'error' : ''} ${
                        selectboxProps?.disabled ? 'disabled' : ''
                    }`}
                >
                    <div className="row">
                        {item.text && (
                            <label htmlFor={item.id} className="label">
                                {t(item.text)}
                            </label>
                        )}
                        <div className="textWrap">
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
                                    {item.default === 'all' ? <MenuItem value="">전체</MenuItem> : null}
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
                {/* <Typography variant='body1' sx={TypographyStyles()}>
                {t(item.text)}ddd
            </Typography>
            <FormControl sx={formControlStyle()}>
                <Select
                    labelId='basic-select-label'
                    id='basic-select'
                    displayEmpty
                    value={sendDataItem[item.id] || ''}
                    onChange={(e) =>
                        e.target.value === 'ADD'
                            ? setModalOpen(true)
                            : handleChange(item.id, e.target.value, item.type, e.target.value)
                    }
                    inputProps={{ 'aria-label': 'Without label' }}
                    sx={{
                        background: 'white',
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
                        comboData?.map((comboItem) => <MenuItem value={comboItem.job_nm}>{comboItem.job_nm}</MenuItem>)
                    ) : (
                        <MenuItem value=''>작업이 없습니다.</MenuItem>
                    )}
                </Select>
            </FormControl> */}

                {modalOpen && <ComboAddPopup open={modalOpen} onClose={handleCloseModal} />}
            </div>
        )
    );
};

export default ComboAddComponent;
