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
import { useAuthStore } from 'utils/store/auth';

type CollectorOptionType = {
    invtn_clct_id: string;
    clct_nm: string;
};

const MailSendModal = ({ params, setParams, setMasterRetrieve }) => {
    // params > modal_info 안에 선택된 행 데이터가 들어감

    const userNo = useAuthStore((state) => state.userNo);
    const [collector, setCollector] = useState(''); // 수집 양식 상태
    const { open, modal_info } = params;
    // 수집 양식 옵션 (예시 데이터)
    const [collectorOptions, setCollectorOptions] = useState<CollectorOptionType[]>([]);

    const [recipientCount, setRecipientCount] = useState(0);
    const [userId, setUserId] = useState('');

    // --- modal_info가 변경될 때마다 대상자 수 업데이트 ---
    useEffect(() => {
        // modal_info가 배열이면 길이를, 아니면 0으로 설정
        const count = Array.isArray(modal_info) ? modal_info.length : 0;
        setRecipientCount(count);
        console.log('Updated recipient count:', count); // 디버깅용
    }, [modal_info]); // modal_info가 변경될 때마다 이 useEffect

    useEffect(() => {
        const item = [
            {
                sqlId: 'hrs_login01',
                sql_key: 'hrs_login_myinfo',
                params: [
                    {
                        user_no: userNo,
                    },
                ],
            },
        ];
        fetcherPost([process.env.NEXT_PUBLIC_SSW_REDIS_SEARCH_ORIGIN_API_URL, item])
            .then((response) => {
                setUserId(response[0].data[0].user_id);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    // 드롭다운 변경 핸들러
    const handleCollectorChange = (event) => {
        setCollector(event.target.value);
        console.log('event.target.value', event);
    };

    // 모달 초기화
    // useEffect(() => {
    //     if (open) {
    //         setCollector(collectorOptions[0]);
    //     }
    // }, [open]);

    // 수집항목 조회
    useEffect(() => {
        const item = [
            {
                sqlId: 'hpr_invtn01',
                sql_key: 'hpr_invtn_clct_select',
                params: [{}],
            },
        ];
        fetcherPost([process.env.NEXT_PUBLIC_SSW_REDIS_SEARCH_ORIGIN_API_URL, item])
            .then((response) => {
                const value = response[0]?.data;

                const options: CollectorOptionType[] = [];

                if (Array.isArray(value)) {
                    value.forEach((item: CollectorOptionType) => {
                        options.push(item);
                    });
                    setCollectorOptions(options);
                } else {
                    console.warn('API 응답 데이터가 배열 형식이 아닙니다.', value);
                    setCollectorOptions([]);
                }
            })
            .catch((error) => {
                console.log(error);
                setCollectorOptions([]);
            });
    }, []);

    // 모달 닫기
    const handleClose = () => {
        setParams((prev) => {
            return {
                ...prev,
                open: !open,
            };
        });
    };

    // 메일발송 버튼 클릭 핸들러
    const handleMailSend = () => {
        console.log('선택된 양식:', collector);
        console.log('선택된 행 데이터:', modal_info);

        // 선택된 행 데이터 추출
        const selectedRow = modal_info[0];
        console.log('선택된 행 데이터:', selectedRow);

        // 3. modal_info 배열에서 직접 이메일 문자열 생성
        const receiverInfoString = `{${modal_info
            .map((row) => row.eml) // 각 객체에서 'eml' 속성 추출
            .filter((email) => email && typeof email === 'string') // 유효한 이메일 필터링
            .join(',')}}`; // 쉼표로 연결하고 중괄호로 감싸기

        // 4. 유효한 이메일 주소가 하나도 없는 경우 처리 (문자열이 "{}" 인지 확인)
        if (receiverInfoString === '{}') {
            alert('메일을 발송할 유효한 이메일 주소가 대상자 목록에 없습니다.');
            return;
        }

        console.log('생성된 수신자 정보 문자열:', receiverInfoString);

        const item = [
            {
                sqlId: 'hpr_invtn01',
                sql_key: 'hpr_invtn_trpr_mail_send',
                params: [
                    {
                        sndpty_user_id: userId,
                        tmplt_id: '0ce870b7-04de-4620-91e7-b3567164d071',
                        rcvr_info: receiverInfoString, // 생성된 이메일 문자열 전달
                        refer_info: '',
                        rsvt_yn: 'N',
                        rsvt_dt: '',
                        invtn_clct_id: collector,
                    },
                ],
            },
        ];

        fetcherPostData(item)
            .then((response) => {
                if (response[0]?.hpr_invtn_trpr_mail_send.return_cd === '40003') {
                    alert('초대대기중, 초대전 일 경우에만 메일을 발송할 수 있습니다.');
                    return;
                }
                const tmpRawText = response[0]?.hpr_invtn_trpr_mail_send.tmp_raw_text;

                if (response[0]?.hpr_invtn_trpr_mail_send.return_cd === '40002') {
                    alert('임시비밀번호:' + tmpRawText);
                }

                setMasterRetrieve(true);
            })
            .catch((error) => {
                console.error('메일 발송 실패:', error);
                // alert('메일 발송 중 오류가 발생했습니다.');
            })
            .finally(() => {
                handleClose();
            });
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
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
                <IconButton onClick={handleClose} size="small">
                    <CloseIcon fontSize="small" />
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
                    <FormControl fullWidth variant="outlined" size="small">
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
                                <MenuItem key={option.invtn_clct_id} value={option.invtn_clct_id}>
                                    {option.clct_nm}
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
                        수집 양식을 적용하고 {recipientCount}명에게 초대 메일을 발송하시겠습니까?
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
                    variant="contained"
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
                    variant="outlined"
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
