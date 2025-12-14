'use client';
import React, { ReactNode, useState } from 'react';
import { Box, Typography, TextField } from '@mui/material';
import { componentProps } from '../../types/component/SearchCondition';
import { BoxStyles, TypographyStyles } from '../../styles/component/SearchCondition';
import { useTranslation } from 'react-i18next';
import TextInput from 'components/TextInput';
import { IcoCheck, IcoDelete, IcoError } from '@/assets/Icon';

// 텍스트박스
const TextComponent = ({ item, uniqueKey, sendDataItem, handleChange, visible, inputProps }: componentProps) => {
    // 다국어
    const { t } = useTranslation();

    const [inputFocus, setInputFocus] = useState<{ [key: string]: boolean }>({});

    const handleFocus = (id: string) => {
        setInputFocus((prev) => ({ ...prev, [id]: true }));
    };

    const handleBlur = (id: string) => {
        setInputFocus((prev) => ({ ...prev, [id]: false }));
    };

    const style = visible ? BoxStyles() : BoxStyles('display:none');
    return (
        visible && (
            <div
                className={`inputBasicBox ${inputProps?.className} ${inputProps?.error ? 'error' : ''} ${
                    inputProps?.warning ? 'warning' : ''
                } ${inputProps?.success ? 'success' : ''}`}
            >
                <div className='row'>
                    {t(item.text) != '' && (
                        <label htmlFor={inputProps?.id} className='label'>
                            {t(item.text)}
                        </label>
                    )}
                    <div className='textWrap'>
                        <TextInput
                            id={inputProps?.id}
                            type={inputProps?.type}
                            value={
                                sendDataItem[item.id] === 'CURRENT_YEAR'
                                    ? new Date().getFullYear()
                                    : sendDataItem[item.id] || ''
                            }
                            placeholder={inputProps?.placeholder}
                            disabled={inputProps?.disabled}
                            className={`${inputFocus[item.id] ? 'typingText' : ''} ${inputProps?.value && 'filled'}`} // 상태 기반으로 class 적용
                            onChange={async (e) => handleChange(item.id, e.target.value, null, e.target.value)}
                            onFocus={async () => handleFocus(item.id)}
                            onBlur={async () => handleBlur(item.id)}
                        />
                        <div className='options'>
                            {sendDataItem[item.id] !== '' && sendDataItem[item.id] !== undefined && (
                                <button className='btnDeleteText' onClick={() => handleChange(item.id, '', null, '')}>
                                    <IcoDelete />
                                </button>
                            )}
                            {(inputProps?.error || inputProps?.warning) && <IcoError className='icoError' />}
                            {inputProps?.success && <IcoCheck className='icoCheck' />}
                        </div>
                    </div>
                </div>

                {/* <Box key={uniqueKey} sx={style}>
                <Typography variant='body1' sx={TypographyStyles()}>
                    {t(item.text)}
                </Typography>
                <TextField
                    variant='outlined'
                    size='small'
                    value={
                        sendDataItem[item.id] === 'CURRENT_YEAR'
                            ? new Date().getFullYear()
                            : sendDataItem[item.id] || ''
                    }
                    onChange={(e) => handleChange(item.id, e.target.value, null, e.target.value)}
                    sx={{
                        width: '300px',
                        '& .MuiInputBase-root': {
                            background: 'white',
                            height: '30px',
                        },
                    }}
                />
            </Box> */}
            </div>
        )
    );
};

export default TextComponent;
