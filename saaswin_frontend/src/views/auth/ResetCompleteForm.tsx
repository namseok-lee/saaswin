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
import { useState } from 'react';
import { fetcherPost } from 'utils/axios';
import SnackbarAlert from './SnackbarAlert';

interface Props {
    onBackToLogin: () => void;
    onBackToResetPassword: () => void;
}

export default function ResetCompleteForm({ onBackToLogin, onBackToResetPassword, email }: Props) {
    const [showPassword, setShowPassword] = useState(false); // 비밀번호 on/off 변수
    const handleClickShowPassword = () => setShowPassword((show) => !show); // 비밀번호 on/off 함수
    const [changeFormData, setChangeFormData] = useState({ user_id: '', code: '', pswd: '', rePswd: '' });
    const [validation, setValidation] = useState({ open: false, message: '', type: '' });
    const handleChangeFormData = (e) => {
        const { id, value } = e.target;
        setChangeFormData((prev) => ({
            ...prev,
            [id]: value,
        }));
        console.log(changeFormData);
    };

    const handlePasswordSave = () => {
        if (!changeFormData.code || !changeFormData.pswd || !changeFormData.rePswd) {
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
        } else {
            const item = {
                user_id: email,
                code: changeFormData.code,
                pswd: changeFormData.pswd,
                rePswd: changeFormData.rePswd,
            };
            fetcherPost(['/api/resetPassword', item])
                .then((response) => {
                    if (response[0].data[0].state === 'fail') {
                        setValidation({
                            open: true,
                            message: '초기화 코드가 일치하지 않습니다. 다시 시도해주세요.',
                            type: 'single',
                        });
                    } else {
                        console.log('성공 JSON', JSON.stringify(response, null, 2));
                        onBackToLogin(); // 성공시 로그인 페이지로 이동
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
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
            <SnackbarAlert validation={validation} setValidation={setValidation} user_id={email} />

            <Stack direction="row" alignItems="center" justifyContent="center" sx={{ width: '100%', mb: 2 }}>
                <IconButton onClick={onBackToResetPassword} sx={{ mr: 1 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'blue' }}>
                    비밀번호 재설정
                </Typography>
            </Stack>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                비밀번호 초기화 코드를 {email}로 발송했습니다.
                <br />
                초기화 코드 입력 후 비밀번호를 재설정 해주세요.
            </Typography>

            <FormControl sx={{ mb: 2, width: '100%' }} variant="outlined">
                <InputLabel>아이디</InputLabel>
                <OutlinedInput
                    disabled
                    id={changeFormData.user_id}
                    value={email}
                    onChange={handleChangeFormData} //  새로운 함수 적용
                    placeholder="이메일 입력"
                    sx={{
                        '& .MuiInputBase-input.Mui-disabled': {
                            WebkitTextFillColor: '#000000',
                        },
                        height: '56px',
                    }}
                />
            </FormControl>

            <FormControl sx={{ mb: 2, width: '100%' }} variant="outlined">
                <InputLabel htmlFor="code">초기화 코드</InputLabel>
                <OutlinedInput
                    id="code"
                    value={changeFormData.code}
                    onChange={handleChangeFormData} //  새로운 함수 적용
                    sx={{ height: '56px' }}
                />
            </FormControl>

            <FormControl sx={{ mb: 1 }} fullWidth size="small" variant="outlined">
                <InputLabel htmlFor="pswd">새 비밀번호 입력</InputLabel>
                <OutlinedInput
                    id="pswd"
                    type={showPassword ? 'text' : 'password'}
                    value={changeFormData.pswd}
                    onChange={handleChangeFormData} //  새로운 함수 적용
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
                비밀번호 저장 후 로그인
            </Button>
        </Box>
    );
}
