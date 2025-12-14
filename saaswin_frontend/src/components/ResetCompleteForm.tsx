'use client';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
    Box,
    Button,
    FormControl,
    InputLabel,
    OutlinedInput,
    Typography,
    IconButton,
    InputAdornment,
    Stack,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useEffect, useState } from 'react';
import { fetcherPostData } from 'utils/axios';
import SnackbarAlert from 'views/auth/SnackbarAlert';
import { useAuthStore } from 'utils/store/auth';
import PasswordValidationForm from 'components/PasswordValidationForm';
import { useRouter } from 'next/navigation';
import { CryptoService } from '@/services/CryptoService';

interface Props {
    onBackToLogin: () => void;
    onBackToResetPassword: () => void;
    userId?: string;
}

export default function ResetCompleteForm({ type, onClose, onBack, propUserId }) {
    const [showPassword, setShowPassword] = useState(false); // 비밀번호 on/off 변수
    const handleClickShowPassword = () => setShowPassword((show) => !show); // 비밀번호 on/off 함수
    const [changeFormData, setChangeFormData] = useState({ user_id: '', pswd: '', rePswd: '' });
    const [validation, setValidation] = useState({ open: false, message: '', type: '' });
    const userNo = useAuthStore((state) => state.userNo);
    const [user_no, setUser_no] = useState('');
    const rprsOgnzNo = useAuthStore((state) => state.rprsOgnzNo);
    const [isPasswordValid, setIsPasswordValid] = useState(false); // 비밀번호 유효성 검사
    const [userId, setUserId] = useState('');
    const [passwordRule, setPasswordRule] = useState(''); // 비밀번호 형식 확인
    const [passwordReuseLimit, setPasswordReuseLimit] = useState(''); // 비밀번호 형식 확인
    const router = useRouter(); // 페이지 변경

    const handleChangeFormData = (e) => {
        const { id, value } = e.target;
        setChangeFormData((prev) => ({
            ...prev,
            [id]: value,
        }));
        console.log(changeFormData);
    };

    // userId 설정 로직 수정
    useEffect(() => {
        if (propUserId) {
            // props로 userId가 넘어온 경우 그 값을 사용
            console.log('propUserId', propUserId);
            setUserId(propUserId);
            const item = [
                {
                    sqlId: 'hrs_login01',
                    sql_key: 'hrs_login_infocheck',
                    params: [{ user_id: propUserId }],
                },
            ];
            fetcherPostData(item)
                .then((response) => {
                    console.log('response11111', response);
                    const value = response[0];
                    setUser_no(value.user_no);
                })
                .catch((error) => {
                    console.log(error);
                });
        } else {
            // props로 userId가 없는 경우 기존 로직 사용 (localStorage 또는 API 조회)
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
            fetcherPostData(item)
                .then((response) => {
                    console.log('response00000', response);
                    const value = response[0];
                    setUserId(value.user_id);
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    }, [propUserId, userNo]);

    // 기준값 가져오기
    useEffect(() => {
        const item = [
            {
                sqlId: 'hrs_login01',
                sql_key: 'hrs_login_crtr_stng_get',
                params: [{}],
            },
        ];
        fetcherPostData(item)
            .then((response) => {})
            .catch((error) => {
                console.log(error);
            });
    }, []);

    // 비밀번호 업데이트
    const handlePasswordSave = async () => {
        if (!changeFormData.pswd || !changeFormData.rePswd) {
            setValidation({
                open: true,
                message: '값을 모두 입력하세요',
                type: 'single',
            });
        } else if (changeFormData.pswd !== changeFormData.rePswd) {
            setValidation({
                open: true,
                message: '입력된 비밀번호가 일치하지 않습니다. 다시 시도해 주세요',
                type: 'single',
            });
        } else if (!isPasswordValid) {
            alert('올바른 비밀번호 양식이 아닙니다. 규칙에 맞는 비밀번호로 다시 설정해주세요');
            return;
        } else {
            if (type === 'pswdRe') {
                console.log('user_no', user_no);
                console.log('type', type);
                alert('비밀번호 재설정 성공 로그인 화면으로 이동');
                const item = [
                    {
                        sqlId: 'hrs_login01',
                        sql_key: 'hrs_login_chg_pswd',
                        params: [
                            {
                                user_no: user_no,
                                chg_pswd: changeFormData.rePswd,
                                encrypt_chgPswd: await CryptoService.encryptHybrid(changeFormData.rePswd, user_no),
                            },
                        ],
                    },
                ];

                // 비밀번호 업데이트
                fetcherPostData(item)
                    .then((response) => {
                        console.log('response_REPSWD', response);
                    })
                    .catch((error) => {
                        console.log(error);
                    });

                // 비밀번호 상태 업데이트
                const stateItem = [
                    {
                        sqlId: 'hrs_login01',
                        sql_key: 'hrs_login_pswd_stts',
                        params: [
                            {
                                user_no: user_no,
                                pswd_stts_cd: 'hrs_group00929_cm0003',
                            },
                        ],
                    },
                ];
                fetcherPostData(stateItem)
                    .then((response) => {
                        if (response.state === 'fail') {
                            console.log('비밀번호 상태 변경 실패 JSON', JSON.stringify(response, null, 2));
                        } else {
                            console.log('비밀번호 상태 변경 성공 JSON', JSON.stringify(response, null, 2));
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                    });
                // 모달 끔
                onClose();
                // alert('비밀번호 재설정 성공 로그인 화면으로 이동');
                // window.location.href = '/auth';
                onBack();
            } else if (type === 'home') {
                alert('비밀번호 재설정 성공 메인 화면');
                const item = [
                    {
                        sqlId: 'hrs_login01',
                        sql_key: 'hrs_login_chg_pswd',
                        params: [
                            {
                                chg_pswd: changeFormData.rePswd,
                                encrypt_chgPswd: await CryptoService.encryptHybrid(changeFormData.rePswd, userNo),
                                user_no: userNo,
                            },
                        ],
                    },
                ];
                fetcherPostData(item)
                    .then((response) => {
                        if (response[0].state === 'fail') {
                        } else {
                            console.log('비밀번호 재설정 성공 JSON', JSON.stringify(response, null, 2));
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                    });

                // 비밀번호 상태 업데이트
                const stateItem = [
                    {
                        sqlId: 'hrs_login01',
                        sql_key: 'hrs_login_pswd_stts',
                        params: [
                            {
                                pswd_stts_cd: 'hrs_group00929_cm0003',
                                user_no: userNo,
                            },
                        ],
                    },
                ];
                fetcherPostData(stateItem)
                    .then((response) => {
                        console.log('response11', response);
                    })
                    .catch((error) => {
                        console.log(error);
                    });

                // 필수 정보 입력 조회
                const esntItem = [
                    {
                        sqlId: 'hpr_invtn01',
                        sql_key: 'hpr_invtn_select',
                        params: [
                            {
                                user_no: userNo,
                            },
                        ],
                    },
                ];
                fetcherPostData(esntItem)
                    .then((response) => {
                        console.log('response22', response);
                    })
                    .catch((error) => {
                        console.log(error);
                    });

                // 모달 끔
                onClose();
            }
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                width: '850px', // 850px 너비 설정
                height: '850px',
                padding: '20px',
                backgroundColor: '#fff', // 배경색 설정
            }}
        >
            {/* Snackbar 컴포넌트 사용 */}
            <SnackbarAlert validation={validation} setValidation={setValidation} user_id={userId} />

            <Stack direction="row" alignItems="center" justifyContent="center" sx={{ width: '100%', mb: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'blue' }}>
                    비밀번호 재설정
                </Typography>
            </Stack>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                새로운 비밀번호를 설정하고 서비스에 로그인하세요.
            </Typography>

            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                -{passwordRule}
            </Typography>
            {passwordReuseLimit && (
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    - 최근 {passwordReuseLimit}개 이내 비밀번호 재사용 불가
                </Typography>
            )}

            <FormControl sx={{ mb: 2, width: '100%' }} variant="outlined">
                <InputLabel>아이디</InputLabel>
                <OutlinedInput
                    disabled
                    id={changeFormData.user_id}
                    value={userId}
                    onChange={handleChangeFormData}
                    placeholder="이메일 입력"
                    sx={{
                        '& .MuiInputBase-input.Mui-disabled': {
                            WebkitTextFillColor: '#000000',
                        },
                        height: '56px',
                    }}
                />
            </FormControl>

            <FormControl sx={{ mb: 1 }} fullWidth size="small" variant="outlined">
                <InputLabel htmlFor="pswd">새 비밀번호 입력</InputLabel>
                <OutlinedInput
                    id="pswd"
                    type={showPassword ? 'text' : 'password'}
                    value={changeFormData.pswd}
                    onChange={handleChangeFormData}
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton onClick={handleClickShowPassword} edge="end">
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    }
                    placeholder="새 비밀번호 입력"
                />
            </FormControl>

            {/* PasswordValidation 컴포넌트 사용 */}
            <PasswordValidationForm
                password={changeFormData.pswd}
                onValidationResult={setIsPasswordValid}
                onRuleChange={setPasswordRule}
                onReuseLimitChange={setPasswordReuseLimit}
            />

            <FormControl sx={{ mb: 1 }} fullWidth size="small" variant="outlined">
                <InputLabel htmlFor="rePswd">새 비밀번호 확인</InputLabel>
                <OutlinedInput
                    id="rePswd"
                    type={showPassword ? 'text' : 'password'}
                    value={changeFormData.rePswd}
                    onChange={handleChangeFormData} //  새로운 함수 적용
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton onClick={handleClickShowPassword} edge="end">
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    }
                    placeholder="새 비밀번호 확인"
                />
            </FormControl>
            <Button variant="contained" fullWidth onClick={handlePasswordSave}>
                비밀번호 저장
            </Button>
        </Box>
    );
}
