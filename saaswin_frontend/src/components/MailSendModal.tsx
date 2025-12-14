// MailSendModal.jsx (수집 업자 선택 모달로 변경)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    IconButton,
    FormControl,
    Select,
    MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { fetcherPost, fetcherPostData } from 'utils/axios';

const MailSendModal = ({ open, onClose }) => {
    // 수집 양식 상태
    const [collector, setCollector] = useState('');

    // 수집 양식 옵션 (예시 데이터)
    const [collectorOptions, setCollectorOptions] = useState([]);

    // 드롭다운 변경 핸들러
    const handleCollectorChange = (event) => {
        setCollector(event.target.value);
    };

    // 모달 초기화
    useEffect(() => {
        if (open) {
            setCollector(collectorOptions[0]);
        }
    }, [open]);

    // 수집항목 조회
    // useEffect(() => {
    //     const item = [
    //         {
    //             sqlId: 'hpr_invtn01',
    //             sql_key: 'hpr_invtn_clct_select',
    //             params: [{}],
    //         },
    //     ];
    //     fetcherPost([process.env.NEXT_PUBLIC_SSW_REDIS_SEARCH_ORIGIN_API_URL, item])
    //         .then((response) => {
    //             if (response[0].data && response[0].data.length > 0) {
    //                 const value = response[0]?.data[0]?.data;
    //                 const options = [];
    //                 value.forEach((item) => {
    //                     options.push(item.clct_nm); // 각 항목의 clct_nm을 배열에 추가
    //                 });
    //                 console.log('response: 값', JSON.stringify(response, null, 2));
    //                 setCollectorOptions(options);
    //             } else {
    //                 console.log('값 확인 필요');
    //             }
    //         })
    //         .catch((error) => {
    //             console.log(error);
    //         });
    // }, []);

    // 모달 닫기
    const handleClose = () => {
        if (onClose) onClose();
    };

    // 메일발송 버튼 클릭 핸들러
    const handleMailSend = () => {
        console.log('선택된 수집 업자:', collector);
        // 여기에 메일 발송 로직 구현
        handleClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth='sm'
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '4px',
                    boxShadow: '0 3px 6px rgba(0, 0, 0, 0.16)',
                },
            }}
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '15px 20px',
                    borderBottom: '1px solid #e9e9e9',
                    '& .MuiTypography-root': {
                        fontSize: '16px',
                        fontWeight: 500,
                    },
                }}
            >
                <Typography
                    sx={{
                        fontWeight: '900 !important', // !important 추가
                        fontSize: '16px !important',
                    }}
                >
                    초대 수집 양식 선택
                </Typography>
                <IconButton onClick={handleClose} size='small'>
                    <CloseIcon fontSize='small' />
                </IconButton>
            </DialogTitle>

            <DialogContent
                sx={{
                    padding: '20px',
                    '& .MuiTypography-root': {
                        fontSize: '14px',
                        color: '#666',
                        marginBottom: '8px',
                    },
                }}
            >
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography sx={{ fontWeight: 400, color: '#333', fontSize: '15px', marginBottom: '16px' }}>
                        초대 시, 구성원에게 적용할 초대 수집 양식을 선택하세요.
                    </Typography>
                    <Typography sx={{ fontWeight: 400, color: '#333', fontSize: '15px' }}>
                        수집 양식에 따라 구성원이 정보를 제출하면 초대가 완료됩니다.
                    </Typography>
                </Box>

                <Box sx={{ marginBottom: '20px' }}>
                    <Typography sx={{ fontSize: '14px', marginBottom: '8px' }}>수집 양식</Typography>
                    <FormControl fullWidth variant='outlined' size='small'>
                        <Select
                            value={collector}
                            onChange={handleCollectorChange}
                            IconComponent={KeyboardArrowDownIcon}
                            sx={{
                                '.MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#d9d9d9',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#3498db',
                                },
                                height: '40px',
                            }}
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        maxHeight: 300,
                                    },
                                },
                            }}
                        >
                            {collectorOptions.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                <Box
                    sx={{
                        backgroundColor: '#fff8f0',
                        padding: '12px 15px',
                        borderRadius: '4px',
                        margin: '16px 0',
                        border: '1px solid #ffe0b2',
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: '13px !important',
                            color: '#ff6b01 !important',
                            fontWeight: 500,
                            textAlign: 'center',
                        }}
                    >
                        수집 양식을 적용하고 대상자에게 초대 메일을 발송하시겠습니까?
                    </Typography>
                </Box>
            </DialogContent>

            <DialogActions
                sx={{
                    padding: '15px 20px',
                    borderTop: '1px solid #e9e9e9',
                    justifyContent: 'center', // 버튼 중앙 정렬
                }}
            >
                <Button
                    onClick={handleMailSend}
                    variant='contained'
                    sx={{
                        color: '#ffffff !important',
                        backgroundColor: '#3498db',
                        '&:hover': {
                            backgroundColor: '#2980b9',
                        },
                        borderRadius: '4px',
                        minWidth: '80px',
                    }}
                >
                    메일발송
                </Button>
                <Button
                    onClick={handleClose}
                    variant='outlined'
                    sx={{
                        color: '#333',
                        borderColor: '#e9e9e9',
                        backgroundColor: '#f1f1f1',
                        '&:hover': {
                            backgroundColor: '#e9e9e9',
                            borderColor: '#d9d9d9',
                        },
                        borderRadius: '4px',
                        minWidth: '80px',
                    }}
                >
                    취소
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default MailSendModal;
