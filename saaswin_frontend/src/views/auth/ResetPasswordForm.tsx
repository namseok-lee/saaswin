'use client';
import { useState } from 'react';
import { Box, Button, FormControl, InputLabel, OutlinedInput, Typography, IconButton, Stack } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Timer from './Timer';
import { fetcherPost } from 'utils/axios';
import SnackbarAlert from './SnackbarAlert';
import ModalDialog from 'components/PasswordModalDialog';

interface Props {
    onResetComplete: () => void;
    onBack: () => void;
    setStep: (step: number) => void;
    setEmail: (email: string) => void;
}

export default function ResetPasswordForm({ onResetComplete, onBack, setStep, setEmail }: Props) {
    const [formData, setFormData] = useState({ user_id: '', brdt: '', telno: '' });
    const [authCode, setAuthCode] = useState('');
    const [timerActive, setTimerActive] = useState(false);
    const [timer, setTimer] = useState(300); // 5분으로 변경
    const [open, setOpen] = useState(false);
    const [authCodeSent, setAuthCodeSent] = useState(false); // 인증코드 발송 상태
    const [authCodeVerified, setAuthCodeVerified] = useState(false); // 인증코드 확인 상태

    const type = 'pswdRe';
    const [validation, setValidation] = useState({
        open: false,
        message: '',
        type: 'single' as 'single' | 'double',
    });

    const handleVerificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));

        if (id === 'user_id') {
            setEmail(value);
        }
    };

    const handleAuthCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAuthCode(e.target.value);
    };

    // 인증번호 발송 버튼 클릭
    const handleRequestVerificationCode = () => {
        if (!formData.user_id || !formData.brdt || !formData.telno) {
            setValidation({
                open: true,
                message: '값을 모두 입력하세요',
                type: 'single',
            });
            return;
        }

        fetcherPost([process.env.NEXT_PUBLIC_COMMON_API_URL + '/infoCheck', formData])
            .then((response) => {
                const value = response[0].data[0];

                if (value.result === 'success') {
                    setValidation({
                        open: true,
                        message: '인증번호가 카카오톡으로 전송되었습니다.',
                        type: 'single',
                    });
                    setAuthCodeSent(true);
                    setAuthCodeVerified(false); // 새로 발송 시 인증 상태 초기화
                    setAuthCode(''); // 입력된 인증번호 초기화
                    setTimer(300); // 5분 타이머
                    setTimerActive(true);
                } else {
                    setValidation({
                        open: true,
                        message: value.authentication || '개인정보가 일치하지 않습니다. 다시 시도해주세요.',
                        type: 'single',
                    });
                    setAuthCodeSent(false);
                    setTimer(0);
                    setTimerActive(false);
                }
            })
            .catch((error) => {
                console.error('인증번호 발송 오류:', error);
                setValidation({
                    open: true,
                    message: '인증번호 발송 중 오류가 발생했습니다.',
                    type: 'single',
                });
            });
    };

    const handleSendEmail = () => {
        if (!authCode) {
            setValidation({
                open: true,
                message: '인증번호를 입력해주세요.',
                type: 'single',
            });
            return;
        }

        if (!timerActive) {
            setValidation({
                open: true,
                message: '인증번호가 만료되었습니다. 다시 발송해주세요.',
                type: 'single',
            });
            return;
        }

        const item = {
            authCode: authCode,
            rprs_ognz_no: 'WIN',
            user_id: formData.user_id,
        };

        fetcherPost([process.env.NEXT_PUBLIC_COMMON_API_URL + '/authCode', item])
            .then((response) => {
                if (response[0].data[0].state === 'fail') {
                    setValidation({
                        open: true,
                        message: response[0].data[0].message || '인증번호가 일치하지 않습니다. 다시 시도해주세요.',
                        type: 'single',
                    });
                } else if (response[0].data[0].state === 'success') {
                    // 인증 성공 시 바로 비밀번호 재설정 모달 열기
                    setAuthCodeVerified(true);
                    setValidation({
                        open: true,
                        message: '인증번호가 확인되었습니다. 비밀번호를 재설정해주세요.',
                        type: 'single',
                    });

                    // 바로 비밀번호 재설정 모달 오픈
                    setOpen(true);
                    setTimerActive(false);
                    console.log('인증 성공 - 비밀번호 재설정 모달 오픈');
                } else {
                    setValidation({
                        open: true,
                        message: '인증번호 확인 중 오류가 발생했습니다.',
                        type: 'single',
                    });
                }
            })
            .catch((error) => {
                console.error('인증번호 확인 오류:', error);
                setValidation({
                    open: true,
                    message: '인증번호 확인 중 오류가 발생했습니다.',
                    type: 'single',
                });
            });
    };

    return (
        <Box sx={{}}>
            <SnackbarAlert
                validation={validation}
                setValidation={setValidation}
                user_id={formData.user_id}
                setStep={setStep}
            />

            <Stack direction="row" alignItems="center" justifyContent="center" sx={{ width: '100%', mb: 2 }}>
                <IconButton onClick={onBack} sx={{ mr: 1 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'blue' }}>
                    비밀번호 재설정
                </Typography>
            </Stack>

            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                신원확인을 위해 개인정보 입력 후 인증해주세요.
                <br />
                인증번호는 카카오톡 알림톡으로 발송됩니다.
            </Typography>

            {/* 인증번호 발송 상태 표시 */}
            {authCodeSent && (
                <Typography variant="subtitle1" gutterBottom sx={{ color: '#f44336', mb: 2 }}>
                    카카오톡 알림톡으로 인증번호가 전송되었습니다.
                </Typography>
            )}

            <FormControl sx={{ mb: 2, width: '80%' }} variant="outlined">
                <InputLabel htmlFor="user_id">아이디</InputLabel>
                <OutlinedInput
                    id="user_id"
                    value={formData.user_id}
                    onChange={handleVerificationChange}
                    placeholder="이메일 입력"
                    label="아이디"
                />
            </FormControl>

            <FormControl sx={{ mb: 2, width: '80%' }} variant="outlined">
                <InputLabel htmlFor="brdt">생년월일</InputLabel>
                <OutlinedInput
                    id="brdt"
                    value={formData.brdt}
                    onChange={handleVerificationChange}
                    placeholder="YYYYMMDD"
                    label="생년월일"
                />
            </FormControl>

            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1, width: '80%', mb: 2 }}>
                <FormControl sx={{ flex: 2 }} variant="outlined">
                    <InputLabel htmlFor="telno">휴대폰 번호</InputLabel>
                    <OutlinedInput
                        id="telno"
                        value={formData.telno}
                        onChange={handleVerificationChange}
                        placeholder="휴대폰 번호 입력"
                        label="휴대폰 번호"
                    />
                </FormControl>
                <Button
                    variant="contained"
                    sx={{
                        flex: 1,
                        height: '56px',
                        whiteSpace: 'nowrap',
                    }}
                    onClick={handleRequestVerificationCode}
                >
                    {authCodeSent ? '재전송' : '인증번호 발송'}
                </Button>
            </Box>

            <FormControl sx={{ width: '80%', position: 'relative', mb: 2 }} variant="outlined">
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                    }}
                >
                    <InputLabel htmlFor="authCode">인증번호</InputLabel>
                    {timerActive && (
                        <Timer
                            initialTime={timer}
                            onTimeEnd={() => {
                                setTimerActive(false);
                                setValidation({
                                    open: true,
                                    message: '인증번호가 만료되었습니다. 다시 발송해주세요.',
                                    type: 'single',
                                });
                            }}
                            isActive
                        />
                    )}
                </Box>
                <OutlinedInput
                    id="authCode"
                    value={authCode}
                    onChange={handleAuthCodeChange}
                    placeholder="인증번호 입력"
                    label="인증번호"
                />
            </FormControl>

            <Button
                variant="contained"
                sx={{ height: '56px', whiteSpace: 'nowrap', width: '80%' }}
                onClick={handleSendEmail}
                disabled={!authCodeSent || !authCode || authCodeVerified}
            >
                {authCodeVerified ? '인증 완료' : '비밀번호 재설정'}
            </Button>

            <ModalDialog
                open={open}
                onClose={() => setOpen(false)}
                type={type}
                onBack={onBack}
                userId={formData.user_id}
            />
        </Box>
    );
}
