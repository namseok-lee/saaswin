'use client';
import React from 'react';
import { Box, Typography, Divider, FormControlLabel, Checkbox } from '@mui/material';
import { detailOptionsProps, EmptyBoxProps } from '../../types/component/SearchCondition';
import { BoxStyles, TypographyStyles } from '../../styles/component/SearchCondition';

// 3개에 맞춰 빈 empty box 그리기
const EmptyBox: React.FC<EmptyBoxProps> = ({ len }) => {
    len = 3 - len;
    return (
        <>
            {Array.from({ length: len }, (_, index) => (
                <Box key={index} sx={BoxStyles()}>
                    {/* 원하는 내용 또는 스타일 추가 */}
                </Box>
            ))}
        </>
    );
};

// 하단 세부옵션
const DetailOptionsComponent: React.FC<detailOptionsProps> = ({ items, searchDataItems }) => {
    return (
        <>
            {items.length > 0 && (
                <>
                    <EmptyBox len={searchDataItems ? searchDataItems.length % 3 : 0} />
                    <Divider sx={{ my: 0, width: '100%' }} />
                    <Box sx={BoxStyles(`width:auto;`)}>
                        <Typography variant="body1" sx={TypographyStyles()}>
                            세부옵션
                        </Typography>
                        {items.map((item, index) => {
                            return (
                                <FormControlLabel
                                    key={index}
                                    control={<Checkbox id={item.checkbox_id} />}
                                    label={item.text}
                                />
                            );
                        })}
                    </Box>
                </>
            )}
        </>
    );
};

export default DetailOptionsComponent;
