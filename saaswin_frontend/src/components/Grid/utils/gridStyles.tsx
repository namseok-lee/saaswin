import React from 'react';
import { darken, lighten, styled, Theme } from '@mui/material/styles';
import { Box } from '@mui/material';
import { DataGridPremium } from '@mui/x-data-grid-premium';
import { IcoEmpty2Blue } from '@/assets/Icon';

// 배경색 계산 함수
export const getBackgroundColor = (color: string, theme: Theme, coefficient: number) => ({
    backgroundColor: darken(color, coefficient),
    ...theme.applyStyles('light', {
        backgroundColor: lighten(color, coefficient),
    }),
});

// 그리드 오버레이 스타일
export const StyledGridOverlay = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    '& .no-rows-primary': {
        fill: '#3D4751',
        ...theme.applyStyles('light', {
            fill: '#AEB8C2',
        }),
    },
    '& .no-rows-secondary': {
        fill: '#1D2126',
        ...theme.applyStyles('light', {
            fill: '#E8EAED',
        }),
    },
}));

// 체크박스 커스텀 스타일
export const customCheckbox = (theme: Theme) => {
    return {
        '& .MuiCheckbox-root svg': {
            width: 16,
            height: 16,
            backgroundColor: 'transparent',
            border: '1px solid #d9d9d9',
            borderRadius: 2,
            ...theme.applyStyles('dark', {
                borderColor: 'rgb(67, 67, 67)',
            }),
        },
        '& .MuiCheckbox-root svg path': {
            display: 'none',
        },
        '& .MuiCheckbox-root.Mui-checked:not(.MuiCheckbox-indeterminate) svg': {
            backgroundColor: '#1890ff',
            borderColor: '#1890ff',
        },
        '& .MuiCheckbox-root.Mui-checked .MuiIconButton-label:after': {
            position: 'absolute',
            display: 'table',
            border: '2px solid #fff',
            borderTop: 0,
            borderLeft: 0,
            transform: 'rotate(45deg) translate(-50%,-50%)',
            opacity: 1,
            transition: 'all .2s cubic-bezier(.12,.4,.29,1.46) .1s',
            content: '""',
            top: '50%',
            left: '39%',
            width: 5.71428571,
            height: 9.14285714,
        },
        '& .MuiCheckbox-root.MuiCheckbox-indeterminate .MuiIconButton-label:after': {
            width: 8,
            height: 8,
            backgroundColor: '#1890ff',
            transform: 'none',
            top: '39%',
            border: 0,
        },
    };
};

// 데이터 그리드 스타일
export const StyledDataGrid = styled(DataGridPremium)(({ theme }) => ({
    border: 0,
    color: theme.palette.mode === 'light' ? 'rgba(0,0,0,.85)' : 'rgba(255,255,255,0.85)',
    fontFamily: ['Noto Sans KR', '-pple-system'].join(','),
    WebkitFontSmoothing: 'auto',
    letterSpacing: 'normal',
    '& .MuiDataGrid-columnsContainer': {
        backgroundColor: theme.palette.mode === 'light' ? 'rgb(230, 230, 230)' : 'rgb(230, 230, 230)',
        color: 'rgb(33, 33, 33)',
    },
    '& .MuiDataGrid-iconSeparator': {
        display: 'none',
    },
    '& .MuiDataGrid-columnHeader, .MuiDataGrid-cell': {
        borderRight: `1px solid ${theme.palette.mode === 'light' ? 'rgb(215, 215, 215)' : 'rgb(215, 215, 215)'}`, // 세로선 두께
        fontSize: '13px',
        justifyContent: 'center',
    },
    '& .MuiDataGrid-columnsContainer, .MuiDataGrid-cell': {
        borderBottom: `1px solid ${theme.palette.mode === 'light' ? 'rgb(215, 215, 215)' : 'rgb(215, 215, 215)'}`, //가로선 두께
    },
    '& .MuiDataGrid-cell': {
        color: theme.palette.mode === 'light' ? 'rgba(0,0,0,.85)' : 'rgba(255,255,255,0.85)',
        fontFamily: ['Noto Sans KR', '-pple-system'].join(','),
        WebkitFontSmoothing: 'auto',
        letterSpacing: 'normal',
        justifyContent: 'center',
    },
    '& .MuiPagination-root': {
        display: 'none',
    },
    '& .MuiDataGrid-footerContainer': {
        minHeight: 0,
    },
    '& .MuiDataGrid-columnHeaderTitleContainer': {
        justifyContent: 'center',
    },
    '& .super-app-theme--clicked': {
        backgroundColor: '#F5FBFF',
        '&:hover': {
            ...getBackgroundColor(theme.palette.info.main, theme, 0.6),
        },
        '&.Mui-selected': {
            backgroundColor: '#F5FBFF',
            '&:hover': {
                ...getBackgroundColor(theme.palette.info.main, theme, 0.4),
            },
        },
    },
    '& .super-app-theme--new': {
        ...getBackgroundColor(theme.palette.success.main, theme, 0.9),
        '&:hover': {
            ...getBackgroundColor(theme.palette.success.main, theme, 0.7),
        },
        '&.Mui-selected': {
            backgroundColor: '#F5FBFF',
            '&:hover': {
                ...getBackgroundColor(theme.palette.success.main, theme, 0.4),
            },
        },
    },
    '& .super-app-theme--modify': {
        ...getBackgroundColor(theme.palette.warning.main, theme, 0.9),
        '&:hover': {
            ...getBackgroundColor(theme.palette.warning.main, theme, 0.7),
        },
        '&.Mui-selected': {
            backgroundColor: '#F5FBFF',
            '&:hover': {
                ...getBackgroundColor(theme.palette.warning.main, theme, 0.4),
            },
        },
    },
    '& .super-app-theme--error': {
        ...getBackgroundColor(theme.palette.error.main, theme, 0.9),
        '&:hover': {
            ...getBackgroundColor(theme.palette.error.main, theme, 0.7),
        },
        '&.Mui-selected': {
            backgroundColor: '#F5FBFF',
            '&:hover': {
                ...getBackgroundColor(theme.palette.error.main, theme, 0.4),
            },
        },
    },
}));

// 데이터 없음 오버레이 컴포넌트
export function CustomNoRowsOverlay() {
    return (
        <StyledGridOverlay>
            <IcoEmpty2Blue />
            <Box sx={{ mt: 2, color: '#7C7C7C' }}>데이터가 존재하지 않습니다</Box>
        </StyledGridOverlay>
    );
}
