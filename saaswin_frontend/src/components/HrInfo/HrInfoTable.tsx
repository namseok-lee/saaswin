'use client';
import {
    Avatar,
    Box,
    Button,
    Divider,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import { Fragment, useState } from 'react';

import dayjs from 'dayjs';
import { InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { getBirthInfo, calculateYmd, formatPhoneNumber, maskRrno } from 'utils/formatData/index';

interface tableInfo {
    id: string;
    id2: string | undefined;
    seq: string;
    text: string;
    text2: string | undefined;
    divider: 'horizontal' | 'vertical' | undefined;
}

// CustomCard 컴포넌트 정의
interface HrTableProps {
    tableInfo: tableInfo[];
    data: Record<string, any>;
}
export default function HrInfoTable({ tableInfo, data }: HrTableProps) {
    const [view, setVeiw] = useState('myInfo');
    const handleViewChange = (event: React.MouseEvent<HTMLElement>, newValue: string) => {
        setVeiw(newValue);
    };
    const userInfo = data?.user_info || {};
    return (
        <Box
            sx={{
                p: 2,
                minWidth: 300,
                height: '100%',
                // borderLeft: '3px solid #ccc',
                borderRight: '2px solid #ccc',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                overflowY: 'auto',
            }}
        >
            <Stack direction={'row'} sx={{ p: 1, pt: 0, pb: 2, width: '100%' }}>
                <TextField
                    fullWidth
                    id='standard-basic'
                    variant='standard'
                    sx={{
                        '& .MuiInput-underline:before': {
                            borderBottomColor: 'primary.200', // 언더라인 색상
                            borderBottomWidth: '2px',
                        },
                        '& .MuiInput-underline:hover:before': {
                            borderBottomColor: 'primary.200', // 호버 시 언더라인 색상
                            borderBottomWidth: '2px',
                        },
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position='start'>
                                <Box display='flex' alignItems='center'>
                                    <Typography variant='body1' fontWeight='bold' sx={{ mr: 0.5 }}>
                                        {userInfo.flnm}
                                    </Typography>
                                    <Typography variant='body1'>{data.user_no}</Typography>
                                </Box>
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position='end'>
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
            </Stack>
            <Stack direction={'row'} sx={{ p: 1.5, borderRadius: 2, backgroundColor: '#f5f5f5' }}>
                <ToggleButtonGroup value={view} exclusive onChange={handleViewChange} sx={{ gap: '8px' }}>
                    <ToggleButton
                        size='small'
                        value='myInfo'
                        sx={{
                            height: '40px',
                            border: 'none',
                            '&.Mui-selected': {
                                backgroundColor: 'white',
                                '& .MuiButton-root': { backgroundColor: 'white', color: '#565656', boxShadow: 'none' },
                            },
                            '&:not(.Mui-selected)': {
                                backgroundColor: 'transparent',
                                '& .MuiButton-root': { backgroundColor: 'transparent', color: '#565656' },
                            },
                        }}
                    >
                        <Button
                            size='small'
                            variant='contained'
                            sx={{
                                backgroundColor: 'transparent',
                                color: '#565656',
                                boxShadow: 'none',
                                '&:hover': { backgroundColor: 'transparent' },
                            }}
                        >
                            내정보
                            <PersonOutlineIcon
                                sx={{ color: view === 'myInfo' ? '#13A9E9' : '#bdbdbd', marginLeft: '5px' }}
                            />
                        </Button>
                    </ToggleButton>
                    <ToggleButton
                        size='small'
                        value='other'
                        sx={{
                            height: '40px',
                            border: 'none',
                            '&.Mui-selected': {
                                backgroundColor: 'white',
                                '& .MuiButton-root': { backgroundColor: 'white', color: '#565656', boxShadow: 'none' },
                            },
                            '&:not(.Mui-selected)': {
                                backgroundColor: 'transparent',
                                '& .MuiButton-root': { backgroundColor: 'transparent', color: '#565656' },
                            },
                        }}
                    >
                        <Button
                            size='small'
                            variant='contained'
                            sx={{
                                backgroundColor: 'transparent',
                                color: '#565656',
                                boxShadow: 'none',
                                '&:hover': { backgroundColor: 'transparent' },
                            }}
                        >
                            조직원
                            <GroupsOutlinedIcon
                                sx={{ color: view === 'other' ? '#13A9E9' : '#bdbdbd', marginLeft: '5px' }}
                            />
                        </Button>
                    </ToggleButton>
                </ToggleButtonGroup>
            </Stack>
            <Stack direction={'row'} sx={{ p: 1 }}>
                <Avatar
                    src={process.env.NEXT_PUBLIC_SSW_FILE_IMAGE_VIEW_URL + userInfo.photo_file_nm}
                    alt='Logo'
                    sx={{
                        width: 130,
                        height: 130,
                        mb: 2, // 하단 여백 추가
                    }}
                />
            </Stack>
            <Button
                variant='contained'
                size='small'
                fullWidth
                sx={{
                    backgroundColor: '#eeeeee', // 배경색
                    color: '#424242',
                    '&:hover': {
                        backgroundColor: '#e0e0e0', // 호버 시 배경색
                    },
                }}
            >
                내 소개 만들기
                <EditOutlinedIcon
                    sx={{
                        fontSize: 16,
                        ml: 1,
                    }}
                />
            </Button>
            {tableInfo?.map((item: tableInfo, index: number) => (
                <Fragment key={index}>
                    <Stack direction={'row'} spacing={2} sx={{ alignSelf: 'flex-start', pt: 1 }}>
                        <Typography sx={{ fontWeight: 'bold' }}>
                            {item.text}
                            {item.id2 && ` • ${item.text2}`}
                        </Typography>

                        <Stack direction={'column'}>
                            {item.id === 'frst_jncmp_ymd' || item.id === 'jncmp_ymd' ? (
                                <Typography>{dayjs(userInfo.jncmd_ymd).format('YYYY.MM.DD') || '-'}</Typography>
                            ) : item.id === 'brdt' ? (
                                <Typography>{getBirthInfo(userInfo.rrno) || '-'}</Typography>
                            ) : item.id === 'csyrs' ? (
                                <Typography>{calculateYmd(userInfo.frst_jncmp_ymd) || '-'}</Typography> // 이후 jncmp_ymd로 변경해야 함 (현재 jncmp_ymd가 비어있음)
                            ) : item.id === 'rrno' ? (
                                <Typography>{maskRrno(userInfo.rrno) || '-'}</Typography>
                            ) : item.id === 'eml_addr' ? (
                                <Typography>{data.user_id || '-'}</Typography>
                            ) : item.id === 'emp_se' ? (
                                <Typography>{data[item.id] || '-'}</Typography>
                            ) : item.id === 'telno' ? (
                                <Typography>{formatPhoneNumber(userInfo.telno) || '-'}</Typography>
                            ) : item.id2 && item.id === 'jbps_nm' ? ( // 추후 데이터에 맞게 변경해야 함
                                <Typography>
                                    사원 • 팀원
                                    {/* {userInfo[item.id] || '-'} • {userInfo[item.id2] || '-'} */}
                                </Typography>
                            ) : item.id2 && item.id === 'jbgd_nm' ? (
                                <Typography>1급 • 1호</Typography>
                            ) : (
                                <Typography>{userInfo[item.id] || '-'}</Typography>
                            )}
                        </Stack>
                    </Stack>
                    {item.divider && <Divider sx={{ width: '100%', my: 2 }} orientation={item.divider} />}
                </Fragment>
            ))}
        </Box>
    );
}
