'use client';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    Snackbar,
    Stack,
    Typography,
    Grid,
} from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuthStore } from 'utils/store/auth';
import { useRemeberStore } from 'utils/store/rememberUser';
import NaverLogin from 'components/NaverLogin';
import { fetcherPost } from 'utils/axios';
import RememberCheckbox from './RememberCheckbox';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function LoginPage() {
    const setAuth = useAuthStore((state) => state.setAuth);
    const setRemember = useRemeberStore((state) => state.setRemember);
    const removeRemember = useRemeberStore((state) => state.removeRemember);
    const router = useRouter();

    const [userRemember, setUserRemember] = useState(false);
    const [userInfo, setUserInfo] = useState({ username: '', password: '' });

    const [validation, setValidation] = useState({ open: false, message: '', type: '' });

    const [formData, setFormData] = useState({ user_id: '', brdt: '', telno: '' }); // 초기화 코드 받아옴
    const [changeFormData, setChangeFormData] = useState({ user_id: '', code: '', pswd: '', rePswd: '' }); // 비밀번호 재설정
    const [authCode, setAuthCode] = useState('');
    const [timer, setTimer] = useState(0); // 타이머 상태
    const [timerActive, setTimerActive] = useState(false); // 타이머 활성화 여부

    // step 상태: 'login' | 'resetPassword' | 'resetComplete'
    const [step, setStep] = useState('login');

    // 초기 실행
    useEffect(() => {
        const savedUsername = localStorage.getItem('remember');
        if (savedUsername) {
            setUserRemember(true);
            setUserInfo((prev) => ({
                ...prev,
                username: JSON.parse(savedUsername).state.userNo,
            }));
        }
    }, []);

    // 타이머 on/off
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval); //  이전 인터벌 제거
        } else {
            setTimerActive(false); //  타이머 0이면 비활성화
        }
    }, [timer]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        type: 'username' | 'password' | 'pswd' | 'rePswd'
    ) => {
        const value = e.target.value;

        if (type === 'username' || type === 'password') {
            // 로그인 정보 업데이트
            setUserInfo((prev) => ({
                ...prev,
                [type]: value,
            }));

            // 체크박스가 체크된 상태에서 아이디 값 변경 시 전역 상태와 로컬스토리지 업데이트
            if (type === 'username' && userRemember) {
                setRemember(value);
                console.log('전역 상태 업데이트 완료');
            }
        } else {
            // 비밀번호 재설정 정보 업데이트
            setChangeFormData((prev) => ({
                ...prev,
                [type]: value,
            }));
        }
    };

    // 스낵바 취소 클릭시 끄기
    const handleSnackbarClose = () => setValidation({ open: false, message: '', type: '' });
    const [showPassword, setShowPassword] = useState(false); // 비밀번호 on/off 변수
    const handleClickShowPassword = () => setShowPassword((show) => !show); // 비밀번호 on/off 함수

    // 기본 로그인
    const handleLogin = () => {
        const item = {
            user_id: userInfo.username,
            pswd: userInfo.password,
        };
        fetcherPost(['/api/login', item])
            .then((response) => {
                if (response[0].data[0].data.user_no == null || response[0].data[0].data.user_no === 'null') {
                    console.log('로그인 실패');
                    alert('Login failed');
                } else {
                    console.log('data 전체 값:', JSON.stringify(response, null, 2));
                    console.log('user_no:  ' + response[0].data[0].data.accessToken);
                    console.log('ognz_no : ' + response[0].data[0].data.user_no);
                    console.log('rprs_ognz_no : ' + response[0].data[0].data.ognz_no);
                    console.log('accessToken : ' + response[0].data[0].data.rprs_ognz_no);

                    // 전역 변수 저장 데이터 설정
                    const authData = {
                        accessTokenL: response[0].data[0].data.accessToken,
                        userNo: response[0].data[0].data.user_no,
                        ognzNo: response[0].data[0].data.ognz_no,
                        rprsOgnzNo: response[0].data[0].data.rprs_ognz_no,
                    };

                    console.log('authData 값: ' + JSON.stringify(authData, null, 2));

                    // 전역변수 상태 저장
                    setAuth(authData);
                    alert('Login successful');
                    router.push('/');
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const handleRemember = (event) => {
        const checked = event.target.checked;
        console.log('Checkbox event:', event);
        console.log('Checkbox checked state:', checked);

        if (checked && !userInfo.username) {
            alert('아이디를 입력해주세요');
            return;
        }

        // 체크박스 변경
        setUserRemember(checked);

        // 체크박스 값 확인 후 전역/로컬스토리지 저장
        if (checked) {
            setRemember(userInfo.username);
            console.log('로컬스토리지 저장 완료');
        } else {
            removeRemember();
            localStorage.removeItem('remember');
            console.log('로컬스토리지 삭제 완료');
        }
    };

    // 확인 버튼만 있는 Snackbar 표시
    const showSingleSnackbar = (message) => {
        setValidation({
            open: true,
            message,
            type: 'single',
        });
    };

    // 확인 + 취소버튼이 있는 Snackbar 표시
    const showDoubleSnackbar = (message) => {
        setValidation({
            open: true,
            message,
            type: 'double',
        });
    };

    const handleSnackbarConfirm = () => {
        if (validation.type === 'double') {
            // "double" 타입의 경우 페이지 이동
            //TODO: 비밀번호를 초기화하고 화면 이동

            const item = {
                user_id: formData.user_id,
            };
            console.log('user_id 출력', item.user_id);
            fetcherPost(['/api/initial', item])
                .then(() => {
                    // TODO: 현재 넘겨주는 값이 없어서 alert 뜸...
                    console.log('초기화 실행');
                })
                .catch((error) => {
                    console.log(error);
                });
            handleSnackbarClose();
            setStep('resetComplete');
        } else {
            handleSnackbarClose();
        }
    };

    const handleVerificationChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value,
        }));
        console.log(formData);
    };

    const handleAuthCode = (e) => {
        const value = e.target.value;
        setAuthCode(value);
        console.log(authCode);
    };

    const handleChangeFormData = (e) => {
        const { id, value } = e.target;
        setChangeFormData((prev) => ({
            ...prev,
            [id]: value,
        }));
        console.log(changeFormData);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleLogin(); // Enter 키가 눌리면 로그인 함수 호출
        }
    };

    // 인증 번호 발송 버튼 클릭
    const handleRequestVerificationCode = () => {
        const item = {
            user_id: formData.user_id,
            brdt: formData.brdt,
            telno: formData.telno,
        };
        if (!formData.user_id || !formData.brdt || !formData.telno) {
            //TODO: 여기서 없는 값 붉게 표시
            showSingleSnackbar('값을 모두 입력하세요');
            return;
        } else {
            //TODO: 인증번호 저장
            fetcherPost(['/api/infoCheck', item])
                .then((response) => {
                    if (response[0].data[0].data.passFail === '실패') {
                        console.log('실패 JSON', JSON.stringify(response[0].data[0].data, null, 2));
                        // 여기서
                    } else {
                        console.log('성공 JSON', JSON.stringify(response, null, 2));
                        console.log('성공 JSON', JSON.stringify(response[0].data[0].data, null, 2));
                        //TODO: 여기서 알리고로 난수 발생시켜 값 요청 - 현재는 박스로 보여주는 중 (알리고이후 삭제)
                        const value = response[0].data[0].data;
                        showSingleSnackbar(value);
                        // 타이머 시작
                        setTimer(300);
                        setTimerActive(true);
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    };

    const handleResetPasswordPage = () => {
        // setValidation({ open: true, message: '비밀번호가 재설정되었습니다.', type: 'success' });
        setStep('resetPassword'); // 비밀번호 재설정 완료 화면으로 이동
    };

    const handleGoToLoginPage = () => {
        setStep('login'); // 로그인 화면으로 이동
    };

    useEffect(() => {
        setChangeFormData((prev) => ({
            ...prev,
            reEmail: formData.user_id, // formData.email 값을 reEmail에 자동 설정
        }));
    }, [formData.user_id]); // formData.email이 변경될 때 실행

    // 메일 발송 클릭시
    const handleSendEmail = () => {
        const item = {
            authCode: authCode,
        };
        fetcherPost(['/api/authCode', item])
            .then((response) => {
                if (response[0].data[0].state === 'fail') {
                    showSingleSnackbar('개인정보 또는 인증번호가 일치하지 않습니다. 다시 시도 해주세요.');
                    console.log('성공 JSON', JSON.stringify(response, null, 2));
                } else {
                    showDoubleSnackbar(
                        '비밀번호를 초기화 하고 재설정 하시겠습니까? 재설정 코드는 메일(아이디)로 발송되며, 발송 후 취소할 수 없습니다.'
                    );
                    setTimerActive(false); // 타이머 삭제

                    console.log('성공 JSON', JSON.stringify(response, null, 2));
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };

    // 비밀번호 저장 후 로그인 클릭시
    const handlePasswordSave = () => {
        if (!changeFormData.code || !changeFormData.pswd || !changeFormData.rePswd) {
            showSingleSnackbar('값을 모두 입력해주세요');
        } else if (changeFormData.pswd !== changeFormData.rePswd) {
            showSingleSnackbar('입력된 비밀번호가 일치하지 않습니다. 다시 시도해 주세요');
        } else {
            const item = {
                user_id: formData.user_id,
                code: changeFormData.code,
                pswd: changeFormData.pswd,
                rePswd: changeFormData.rePswd,
            };
            fetcherPost(['/api/resetPassword', item])
                .then((response) => {
                    if (response[0].data[0].state === 'fail') {
                        console.log('성공 JSON', JSON.stringify(response, null, 2));
                        showSingleSnackbar('초기화 코드가 일치하지 않습니다. 다시 시도해주세요.');
                    } else {
                        console.log('성공 JSON', JSON.stringify(response, null, 2));
                        handleGoToLoginPage(); // 성공시 로그인 페이지로 이동
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    };

    return (
        <>
            {/* SnackBar는 항상 표시되도록 최상단에 위치 */}
            <Snackbar
                open={validation.open}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                onClose={handleSnackbarClose}
            >
                <Alert
                    icon={false}
                    sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                    }}
                >
                    {validation.message}

                    <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                            mt: 2,
                            justifyContent: 'center', // 버튼 개수에 따라 정렬 방식 변경
                            width: '100%', // 부모 컨테이너 너비 지정
                        }}
                    >
                        {/* type이 'double'일 때만 '취소' 버튼을 렌더링 */}
                        {validation.type === 'double' && (
                            <Button variant="outlined" color="secondary" size="small" onClick={handleSnackbarClose}>
                                취소
                            </Button>
                        )}
                        <Button variant="contained" color="primary" size="small" onClick={handleSnackbarConfirm}>
                            확인
                        </Button>
                    </Stack>
                </Alert>
            </Snackbar>

            {(() => {
                switch (step) {
                    case 'login':
                        return (
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    width: '850px', // 850px 너비 설정
                                    height: 'auto',
                                    padding: '20px',
                                    backgroundColor: '#fff', // 배경색 설정
                                }}
                            >
                                <Box
                                    sx={{
                                        width: '700px', // 내부 너비를 700px로 설정
                                        height: 'auto',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            width: '100%',
                                            flexDirection: 'column',
                                            height: '200px',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Image
                                            src="/images/logo-mark-3-d.png"
                                            alt="logo"
                                            width={300} // 원하는 너비
                                            height={50} // 원하는 높이
                                            style={{
                                                width: '300px',
                                                height: '50px',
                                                objectFit: 'contain',
                                            }} // 비율 유지
                                        />
                                        <Typography sx={{ mt: 2, fontWeight: 'bold' }}>HR을 가장 똑똑하게,</Typography>
                                        <Typography sx={{ fontWeight: 'bold' }}>
                                            인사이트를 주는 업무공간, 인사잇
                                        </Typography>
                                    </Box>
                                    <FormControl sx={{ mb: 1 }} fullWidth size="small" variant="outlined">
                                        <InputLabel htmlFor="outlined-username">아이디</InputLabel>
                                        <OutlinedInput
                                            id="outlined-username"
                                            value={userInfo.username}
                                            onKeyDown={handleKeyDown}
                                            onChange={(e) => handleChange(e, 'username')}
                                            placeholder="아이디"
                                        />
                                    </FormControl>
                                    <FormControl sx={{ mb: 1 }} fullWidth size="small" variant="outlined">
                                        <InputLabel htmlFor="outlined-adornment-password">비밀번호</InputLabel>
                                        <OutlinedInput
                                            id="outlined-adornment-password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={userInfo.password}
                                            onKeyDown={handleKeyDown}
                                            onChange={(e) => handleChange(e, 'password')}
                                            endAdornment={
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label={
                                                            showPassword ? 'hide the password' : 'display the password'
                                                        }
                                                        onClick={handleClickShowPassword}
                                                        edge="end"
                                                    >
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            }
                                            placeholder="Password"
                                        />
                                    </FormControl>
                                    <Button variant="contained" fullWidth onClick={handleLogin}>
                                        로그인
                                    </Button>
                                    <Stack
                                        direction="row"
                                        sx={{ justifyContent: 'space-between', width: '100%', m: 1 }}
                                    >
                                        {/* <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={userRemember} // 상태 값
                                        onChange={handleRemember} // 체크박스 변경 이벤트
                                        color="primary" // 색상 설정
                                    />
                                }
                                label="아이디 저장" // 라벨 텍스트
                                sx={{ color: '#9e9e9e' }} // 라벨 스타일
                            /> */}
                                        <RememberCheckbox
                                            userRemember={userRemember} // 상태 전달
                                            handleRemember={handleRemember} // 이벤트 핸들러 전달
                                        />
                                        <Stack direction="row">
                                            {/* <Button sx={{ color: '#9e9e9e' }}>아이디 찾기</Button> */}
                                            <Button sx={{ color: '#9e9e9e' }} onClick={handleResetPasswordPage}>
                                                비밀번호 재설정
                                            </Button>
                                        </Stack>
                                    </Stack>
                                    <Box sx={{ mt: 3, width: '100%', textAlign: 'left' }}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={5.5}>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                    간편인증 로그인
                                                </Typography>
                                                <Stack direction="row" alignItems="flex-start">
                                                    <Button>
                                                        <NaverLogin></NaverLogin>
                                                        {/* <Image
                                                src="/img/btnG_완성형.png"
                                                alt="naver Login"
                                                width={400} // 원하는 너비
                                                height={20} // 원하는 높이
                                                style={{ objectFit: 'contain' }} // 비율 유지
                                            /> */}
                                                    </Button>
                                                    <Button>
                                                        <Image
                                                            src="/img/kakao_login_medium_wide.png"
                                                            alt="Kakao Login"
                                                            width={500} // 원하는 너비
                                                            height={20} // 원하는 높이
                                                            style={{ objectFit: 'contain' }} // 비율 유지
                                                        />
                                                    </Button>
                                                </Stack>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Box>
                            </Box>
                        );

                    case 'resetPassword':
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
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="center" // 내부 요소 중앙 정렬
                                    sx={{ width: '100%', mb: 2 }}
                                >
                                    <IconButton onClick={handleGoToLoginPage} sx={{ mr: 1 }}>
                                        <ArrowBackIcon />
                                    </IconButton>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'blue' }}>
                                        비밀번호 재설정
                                    </Typography>
                                </Stack>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                                    아이디로 사용하는 회사 이메일로 재설정 코드를 발급합니다.
                                    <br />
                                    신원확인을 위해 개인정보 입력 후 인증해주세요.
                                </Typography>

                                <FormControl sx={{ mb: 2, width: '80%' }} variant="outlined">
                                    <InputLabel htmlFor="user_id">아이디</InputLabel>
                                    <OutlinedInput
                                        id="user_id"
                                        value={formData.user_id}
                                        onChange={handleVerificationChange}
                                        placeholder="이메일 입력"
                                        sx={{ height: '56px' }}
                                    />
                                </FormControl>

                                <FormControl sx={{ mb: 2, width: '80%' }} variant="outlined">
                                    <InputLabel htmlFor="brdt">생년월일</InputLabel>
                                    <OutlinedInput
                                        id="brdt"
                                        value={formData.brdt}
                                        onChange={handleVerificationChange}
                                        placeholder="생년월일 입력 (YYYYMMDD)"
                                        sx={{ height: '56px' }}
                                    />
                                </FormControl>

                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 1,
                                        width: '80%', // 너비 확장
                                    }}
                                >
                                    <FormControl sx={{ flex: 2 }} variant="outlined">
                                        <InputLabel htmlFor="telno">휴대폰 번호</InputLabel>
                                        <OutlinedInput
                                            id="telno"
                                            value={formData.telno}
                                            onChange={handleVerificationChange}
                                            placeholder="휴대폰 번호 입력"
                                            sx={{ height: '56px' }}
                                        />
                                    </FormControl>
                                    <Button
                                        variant="contained"
                                        sx={{
                                            flex: 1,
                                            height: '56px',
                                            whiteSpace: 'nowrap',
                                        }}
                                        onClick={handleRequestVerificationCode} // 인증코드 요청 함수 호출
                                    >
                                        인증코드 발송
                                    </Button>
                                </Box>
                                <Button
                                    variant="text"
                                    sx={{
                                        fontSize: '14px',
                                        textDecoration: 'underline',
                                        color: 'gray',
                                        textAlign: 'left',
                                        display: 'block',
                                        width: '80%',
                                        padding: 0,
                                        margin: 0,
                                        mb: 2,
                                    }}
                                    onClick={() => alert('인증코드가 이메일로 전송되었습니다.')}
                                >
                                    인증코드를 메일로 받기
                                </Button>

                                <FormControl sx={{ width: '80%', position: 'relative' }} variant="outlined">
                                    {/* 라벨과 타이머를 감싸는 Box */}
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
                                            <Typography
                                                sx={{
                                                    color: 'red',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.9rem',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {timer > 0 ? `${formatTime(timer)}` : ''}
                                            </Typography>
                                        )}
                                    </Box>

                                    {/* 입력 필드 */}
                                    <OutlinedInput
                                        id="reset-code"
                                        value={authCode}
                                        onChange={handleAuthCode}
                                        placeholder="인증번호 입력"
                                        sx={{ height: '56px' }}
                                    />
                                </FormControl>
                                <Button
                                    variant="contained"
                                    onClick={handleSendEmail}
                                    sx={{
                                        height: '56px',
                                        whiteSpace: 'nowrap',
                                        width: '80%',
                                    }}
                                >
                                    메일 발송
                                </Button>
                            </Box>
                        );

                    case 'resetComplete':
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
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="center"
                                    sx={{ width: '100%', mb: 2 }}
                                >
                                    <IconButton onClick={handleResetPasswordPage} sx={{ mr: 1 }}>
                                        <ArrowBackIcon />
                                    </IconButton>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'blue' }}>
                                        비밀번호 재설정
                                    </Typography>
                                </Stack>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                                    비밀번호 초기화 코드를 {formData.email}로 발송했습니다.
                                    <br />
                                    초기화 코드 입력 후 비밀번호를 재설정 해주세요.
                                </Typography>

                                <FormControl sx={{ mb: 2, width: '100%' }} variant="outlined">
                                    <InputLabel>아이디</InputLabel>
                                    <OutlinedInput
                                        disabled
                                        value={changeFormData.reEmail}
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

                    default:
                        return null;
                }
            })()}
        </>
    );
}
