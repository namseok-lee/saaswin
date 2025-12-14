'use client';
import { Badge, Box, Stack, Typography } from '@mui/material';

import InfoIcon from '@mui/icons-material/Info';
import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';
import { useState } from 'react';
import Image from 'next/image';
export default function ThemeSetting() {
    const fontSizes = [
        {
            id: 'fontSize1',
            seq: '1',
            fontSize: '10px',
        },
        {
            id: 'fontSize2',
            seq: '2',
            fontSize: '13px',
        },
        {
            id: 'fontSize3',
            seq: '3',
            fontSize: '16px',
        },
    ];
    const colorThemes = [
        {
            id: 'colorTheme1',
            seq: '1',
            colorTheme: '#13A9E9',
            title: '테마1',
        },
        {
            id: 'colorTheme2',
            seq: '2',
            colorTheme: '#1CAC6F',
            title: '테마2',
        },
        {
            id: 'colorTheme3',
            seq: '3',
            colorTheme: '#0066FF',
            title: '테마3',
        },
    ];
    const [selectedTheme, setSelectedTheme] = useState({
        fontSize: '10px',
        colorTheme: '#13A9E9',
    });
    const handleThemeChange = (value: string, type: string) => {
        setSelectedTheme((prev) => ({
            ...prev,
            [type]: value,
        }));
    };
    return (
        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
            <Box sx={{ p: 2 }}>
                <Typography variant="h5" sx={{ pb: 2 }}>
                    테마 설정
                </Typography>
                <Box
                    sx={{
                        p: 2,
                        width: '100%',
                        height: '50px',
                        borderRadius: 2,
                        backgroundColor: 'primary.50',
                    }}
                >
                    <Stack direction="row" spacing={1} alignItems="center">
                        <InfoIcon sx={{ fontSize: '20px', color: 'primary.500' }} />
                        <Typography>
                            인터페이스 요소의 색상은 변경하지만 이미지 또는 색상 유틸리티의 색상은 변경하지 않습니다.
                        </Typography>
                    </Stack>
                </Box>
                <Stack direction="column" spacing={1} alignItems="flex-start" sx={{ pt: 2 }}>
                    <Typography sx={{ textAlign: 'left', width: '100%' }}>글자크기</Typography>
                    <Stack direction="row" spacing={2}>
                        {fontSizes.map((item) => (
                            <Badge
                                key={item.id}
                                badgeContent={
                                    selectedTheme.fontSize === item.fontSize ? (
                                        <Image src={'/images/check.svg'} alt="check Icon" width={25} height={25} />
                                    ) : null
                                }
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'left',
                                }}
                                sx={{
                                    '& .MuiBadge-badge': {
                                        backgroundColor: '#13A9E9', // 뱃지 배경색
                                        color: 'white', // 아이콘 색상
                                        width: '23px', // 뱃지 크기
                                        height: '23px', // 뱃지 크기
                                        borderRadius: '50%', // 동그란 모양
                                        display: 'flex', // 아이콘 정렬
                                        justifyContent: 'center', // 중앙 정렬
                                        alignItems: 'center', // 중앙 정렬
                                    },

                                    color: 'white',
                                }}
                            >
                                <Box
                                    onClick={() => {
                                        handleThemeChange(item.fontSize, 'fontSize');
                                    }}
                                    sx={{
                                        border:
                                            selectedTheme.fontSize === item.fontSize
                                                ? '2px solid #13A9E9'
                                                : '1px solid black',
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: 2,
                                        display: 'flex', // 텍스트 정렬을 위해 flex 사용
                                        justifyContent: 'center', // 텍스트 중앙 정렬
                                        alignItems: 'center', // 텍스트 중앙 정렬
                                        cursor: 'pointer', // 기본 포인터 적용
                                    }}
                                >
                                    <Typography sx={{ color: 'black', fontSize: item.fontSize }}>가 Aa</Typography>
                                </Box>
                            </Badge>
                        ))}
                    </Stack>
                </Stack>
                <Stack direction="column" spacing={1} alignItems="flex-start" sx={{ pt: 2 }}>
                    <Typography sx={{ textAlign: 'left', width: '100%', fontWeight: 'bold' }}>컬러테마</Typography>
                    <Typography sx={{ textAlign: 'left', width: '100%' }}>
                        화면 디스플레이 메인 색상을 변경합니다.
                    </Typography>
                    <Stack direction="row" spacing={2}>
                        {colorThemes.map((item) => (
                            <Stack direction="column" spacing={1} sx={{ pt: 2.5 }} key={item.id}>
                                <Badge
                                    badgeContent={
                                        selectedTheme.colorTheme === item.colorTheme ? (
                                            <Image src={'/images/check.svg'} alt="check Icon" width={25} height={25} />
                                        ) : null
                                    }
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'left',
                                    }}
                                    sx={{
                                        '& .MuiBadge-badge': {
                                            backgroundColor: '#13A9E9', // 뱃지 배경색
                                            color: 'white', // 아이콘 색상
                                            width: '23px', // 뱃지 크기
                                            height: '23px', // 뱃지 크기
                                            borderRadius: '50%', // 동그란 모양
                                            display: 'flex', // 아이콘 정렬
                                            justifyContent: 'center', // 중앙 정렬
                                            alignItems: 'center', // 중앙 정렬
                                        },

                                        color: 'white',
                                    }}
                                >
                                    <Box
                                        onClick={() => {
                                            handleThemeChange(item.colorTheme, 'colorTheme');
                                        }}
                                        sx={{
                                            width: '80px',
                                            height: '80px',
                                            border:
                                                selectedTheme.colorTheme === item.colorTheme ? '2px solid #13A9E9' : '',
                                            backgroundColor: item.colorTheme,
                                            borderRadius: 2,
                                            display: 'flex', // 텍스트 정렬을 위해 flex 사용
                                            justifyContent: 'center', // 텍스트 중앙 정렬
                                            alignItems: 'center', // 텍스트 중앙 정렬
                                            cursor: 'pointer', // 기본 포인터 적용
                                        }}
                                    >
                                        <IconButton
                                            sx={{ width: '100%', p: 0, color: 'white' }}
                                            disableRipple // 클릭 효과 제거
                                            disableTouchRipple // 터치 효과 제거
                                        >
                                            <MenuIcon />
                                        </IconButton>
                                    </Box>
                                </Badge>
                                <Typography align="center">{item.title}</Typography>
                            </Stack>
                        ))}
                    </Stack>
                </Stack>
            </Box>
        </Box>
    );
}
