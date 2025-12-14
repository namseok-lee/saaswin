import React from 'react';
import { Checkbox, FormControlLabel } from '@mui/material';

export default function RememberCheckbox({ userRemember, handleRemember }) {
    return (
        <FormControlLabel
            control={<Checkbox checked={userRemember} onChange={handleRemember} color='primary' />}
            label='아이디 저장'
            sx={{
                height: '20px',
                marginLeft: '0',
                color: '#9e9e9e',
                span: {
                    fontSize: '12px',
                    lineHeight: '20px',
                    color: '#565656',
                },
                '.MuiCheckbox-root': {
                    width: '16px',
                    height: '16px',
                    marginRight: '6px',
                    padding: '0',
                    boxSizing: 'border-box',
                },
            }}
        />
    );
}
