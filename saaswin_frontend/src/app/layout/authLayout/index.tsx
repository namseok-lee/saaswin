// components/AuthLayout.tsx
import React from 'react';
import { Box } from '@mui/material';

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Box
        sx={{
            display: 'flex',
            justifyContent: 'center',
            background: '#e1f5fc',
            alignItems: 'center',
            height: '100vh',
            width: '100vw',
        }}
    >
        {children}
    </Box>
);

export default AuthLayout;
