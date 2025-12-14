'use client';
import React from 'react';
import { Box } from '@mui/material';
import { componentProps } from '../../types/component/SearchCondition';
import { BoxStyles } from '../../styles/component/SearchCondition';
import { useTranslation } from 'react-i18next';
import Checkbox from 'components/Checkbox';

const CheckComponent = ({ item, uniqueKey, sendDataItem, handleChange, visible }: componentProps) => {
    // 다국어
    const { t } = useTranslation();
    const style = visible ? BoxStyles() : BoxStyles('display:none');
    return (
        <Box key={uniqueKey} sx={style}>
            <Checkbox
                id={item.id}
                label={t(item.text)}
                value={item.default === 'N' ? false : true}
                checked={sendDataItem[item.id] === 'N' ? false : true}
                disabled={false}
                onChange={(e) => handleChange(item.id, e.target.checked, item.type, e.target.checked)}
            />
        </Box>
    );
};

export default CheckComponent;
