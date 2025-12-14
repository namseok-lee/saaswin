'use client';
import { Box, Stack, Modal, TextField } from '@mui/material';
import NaverLogin from 'components/NaverLogin';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetcherPost, fetcherPostData, verifyAuthCode } from 'utils/axios';
import { useAuthStore } from 'utils/store/auth';
import { useRemeberStore } from 'utils/store/rememberUser';
import { IcoDemo } from '@/assets/Icon';
import styles from '../../styles/pages/Login/page.module.scss';
import '../../styles/styles.scss';
import RememberCheckbox from './RememberCheckbox';
import SnackbarAlert from './SnackbarAlert';
// import TextInput from 'components/TextInput';
// import InputTextBox from 'components/InputSearch';
import InputTextBox from '@/components/InputTextBox';
import GoogleLogin from 'components/GoogleLogin';
import KakaoLogin from 'components/KaKaoLogin';
import { loadLanguage } from 'i18n/i18n';
import { CryptoService } from '../../services/CryptoService';
import SwModal from '@/components/Modal';
import Typography from '@/components/Typography';
import Button from '@/components/Button';
import { getIp } from '@/utils/clientEnv/clientEnv';
// IndexedDB 관련 함수
const DB_NAME = 'userDB';
const STORE_NAME = 'userData';
const DB_VERSION = 1;

const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        // 브라우저 환경인지 확인
        if (typeof window === 'undefined' || !window.indexedDB) {
            reject('IndexedDB is not supported in this environment.');
            return;
        }
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'userNo' }); // userNo를 키로 사용
            }
        };

        request.onsuccess = (event) => {
            resolve((event.target as IDBOpenDBRequest).result);
        };

        request.onerror = (event) => {
            console.error('IndexedDB error:', (event.target as IDBOpenDBRequest).error);
            reject('IndexedDB error: ' + (event.target as IDBOpenDBRequest).error);
        };
    });
};

// 저장할 데이터 타입을 위한 인터페이스 정의
interface AuthData {
    username: string;
    userNo: string;
    ognzNo: string;
    rprsOgnzNo: string;
    duty_cd: string; // 직무코드
    duty_nm: string; // 직무명
    jbgd_cd: string; // 직급코드
    jbgd_nm: string; // 직급명
    jbps_cd: string; // 직위코드
    jbps_nm: string; // 직위명
    jbgp_cd: string; // 직군코드
    jbgp_nm: string; // 직군명
    jbttl_cd: string; // 직책코드
    jbttl_nm: string; // 직책명
    pblcn_key?: string; // publicKey 필드 추가
}

const saveDataToDB = async (data: AuthData) => {
    try {
        const db = await openDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(data); // put은 데이터가 있으면 덮어쓰고, 없으면 추가

        return new Promise<void>((resolve, reject) => {
            request.onsuccess = () => {
                console.log('IndexedDB 저장 성공:', data); // 저장 성공 시 데이터 로그 추가
                resolve();
            };

            request.onerror = (event) => {
                console.error('Error saving data to IndexedDB:', (event.target as IDBRequest).error);
                reject((event.target as IDBRequest).error);
            };

            transaction.oncomplete = () => {
                db.close();
            };

            transaction.onerror = (event) => {
                // 트랜잭션 에러 처리
                console.error('Transaction error saving data to IndexedDB:', (event.target as IDBTransaction).error);
                reject((event.target as IDBTransaction).error);
            };
        });
    } catch (error) {
        console.error('Failed to save data to IndexedDB:', error);
        throw error; // 에러를 다시 던져서 호출 측에서 처리하도록 함
    }
};

interface Props {
    // onResetPassword: () => void;
    setStep: (step: 'login' | 'resetPassword' | 'resetComplete' | 'secondCertification') => void;
    showSnackbar: (message: string, type?: 'single' | 'double') => void;
    setCertUserInfo: (certUserInfo: any) => void;
    setEmail: (email: string) => void;
}

export default function LoginForm({ setStep, showSnackbar, setCertUserInfo, setEmail }: Props) {
    const setAuth = useAuthStore((state) => state.setAuth); // 로그인 내용 -> 전역 변수 저장
    const setRemember = useRemeberStore((state) => state.setRemember); // 아이디 저장 기능 -> 전역 및 로컬 저장
    const removeRemember = useRemeberStore((state) => state.removeRemember); // 아이디 저장 삭제 -> 전역 및 로컬 삭제
    const router = useRouter(); // 페이지 변경

    const [userRemember, setUserRemember] = useState(false); // 아이디 체크 박스 toggle 확인 -> 초기값을 false로 설정
    const [userInfo, setUserInfo] = useState({ username: '', password: '' }); // 유저 정보 저장 -> username 초기값을 빈 문자열로 명시
    const [showPassword, setShowPassword] = useState(false); // 비밀번호 on/off
    const [openModal, setOpenModal] = useState(false); // 모달 표시 여부
    const [verifyPassword, setVerifyPassword] = useState(''); // 확인 비밀번호 저장

    const [validation, setValidation] = useState({
        open: false,
        message: '',
        type: 'single' as 'single' | 'double',
    }); // Snackbar 관련 상태 저장

    // 중복 아이디 있을 경우 저장되는 값
    const [multipleAccounts, setMultipleAccounts] = useState(null);
    const [multiAccountModalOpen, setMultiAccountModalOpen] = useState(false); // 중복 아이디시 모달

    // 초기 실행 (로컬스토리지에 저장된 id값 불러옴)
    useEffect(() => {
        // localStorage.removeItem('accessToken');
        // localStorage.removeItem('refreshToken');

        const savedUsername = localStorage.getItem('remember');
        if (savedUsername) {
            try {
                const parsedSavedUsername = JSON.parse(savedUsername);
                if (parsedSavedUsername && parsedSavedUsername.state && parsedSavedUsername.state.userNo) {
                    setUserRemember(true);
                    setUserInfo((prev) => ({
                        ...prev,
                        username: parsedSavedUsername.state.userNo,
                    }));
                } else {
                    // localStorage에 값이 있지만 예상된 형식이 아닌 경우, remember를 삭제할 수 있습니다.
                    localStorage.removeItem('remember');
                }
            } catch (error) {
                console.error("Failed to parse 'remember' from localStorage", error);
                // 파싱 실패 시 localStorage 항목을 제거하여 다음 실행 시 문제를 방지합니다.
                localStorage.removeItem('remember');
            }
        }
    }, []);

    // 변경된 userInfo 세팅
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'username' | 'password') => {
        setUserInfo((prev) => ({ ...prev, [type]: e.target.value }));
        if (type === 'username' && userRemember) {
            setRemember(e.target.value);
            console.log(e.target.value);
        }
    };

    // 기본 로그인
    const handleLogin = () => {
        const item0 = { login_type: 'generic', username: userInfo.username, password: userInfo.password };
        fetcherPost(['/api/keycloak/token', item0])
            .then((data) => {
                if (data.access_token != null) {
                    router.push('/');
                }

                if (data.enabled) {
                    setOpenModal(true); // 모달 표시
                } else {
                    checkMultipleAccount();
                }
            })
            .catch((error) => alert(error.message.split('[ERR]')[0]));
    };

    // 아이디 중복시 사용함수
    const checkUserId = (value) => {
        console.log('checkUserId', value);
        // 다중 계정 정보 저장
        setMultipleAccounts(value);
        // 모달 표시
        setMultiAccountModalOpen(true);
    };

    // 다중 계정 선택시 함수
    const saveBeforeAccountLogin = async (userNo: string, pblcn_key: string, onSuccess: () => void) => {
        try {
            if (userInfo.username) {
                const usernameAuthData = { userNo: userInfo.username, pblcn_key };
                await saveDataToDB(usernameAuthData);
            }
            onSuccess(); // 저장 성공 시 handleSelectAccount 실행
        } catch (dbError) {
            console.error('IndexedDB 저장 실패:', dbError);
            setValidation({
                open: true,
                message: '로그인 처리 중 오류가 발생했습니다. (공개키 저장 실패)',
                type: 'single',
            });
        }
    };

    // 선택한 계정으로 로그인 처리하는 함수 (수정)
    const handleSelectAccount = async (getRprsOgnzNo) => {
        setMultiAccountModalOpen(false);
        // 선택한 기업 정보로 다시 로그인 요청
        const selectItem = [
            {
                sqlId: 'hrs_login01',
                sql_key: 'hrs_login',
                params: [
                    {
                        login_type: 'generic',
                        user_id: userInfo.username,
                        chk_second: 'execute',
                        rprs_ognz_no: getRprsOgnzNo, // 선택한 기업의 식별자 추가
                        encrypt_Pswd: await CryptoService.encryptHybrid(userInfo.password, userInfo.username),
                    },
                ],
            },
        ];

        fetcherPostData(selectItem)
            .then(async (response) => {
                const value = response[0].data;

                // 로그인 성공 시 로직
                if (value.login_result === 'login_success') {
                    const cert_2step_vtlz = value.cert_2step_vtlz;
                    // 2단계인증
                    if (cert_2step_vtlz === 'true') {
                        setStep('secondCertification');
                        setCertUserInfo(value);
                        setEmail(userInfo.username);
                    } else {
                        // 2단계인증 false
                        // 전역 변수 저장 데이터 설정
                        const authData: AuthData = {
                            username: userInfo.username,
                            userNo: value.user_no,
                            ognzNo: value.ognz_no,
                            rprsOgnzNo: value.rprs_ognz_no,
                            duty_cd: value.duty_cd, // 직무코드
                            duty_nm: value.duty_nm, // 직무명
                            jbgd_cd: value.jbgd_cd, // 직급코드
                            jbgd_nm: value.jbgd_nm, // 직급명
                            jbgp_cd: value.jbgp_cd, // 직군코드
                            jbgp_nm: value.jbgp_nm, // 직군명
                            jbps_cd: value.jbps_cd, // 직위코드
                            jbps_nm: value.jbps_nm, // 직위명
                            jbttl_cd: value.jbttl_cd, // 직책코드
                            jbttl_nm: value.jbttl_nm, // 직책명
                            pblcn_key: value.public_key, // publicKey 저장
                        };
                        // 다국어 버전 체크
                        const redis_ver = value?.redis_ver || '0.00';
                        const old_redis_ver = localStorage.getItem('redis_ver') ?? '0.00';
                        const lang = localStorage.getItem('userLanguage') ?? 'ko';

                        if (redis_ver !== old_redis_ver) {
                            loadLanguage(lang, false);
                            localStorage.setItem('redis_ver', value.redis_ver);
                        }

                        try {
                            const ipData = await getIp(); // { ipv4: '...', ipv6: '...' }

                            // 2. authData에 병합
                            const extendedAuthData = {
                                ...authData,
                                ipv4: ipData.ipv4,
                                ipv6: ipData.ipv6,
                            };
                            // IndexedDB 저장 시 에러 처리
                            // 1. 기존 방식(userNo)으로 저장
                            await saveDataToDB(authData);

                            // 전역변수 상태 저장
                            setAuth(extendedAuthData);
                            setValidation({
                                open: true,
                                message: '로그인 성공!',
                                type: 'single',
                            });
                            router.push('/');
                        } catch (dbError) {
                            console.error('IndexedDB 저장 실패:', dbError);
                            setValidation({
                                open: true,
                                message: '로그인 처리 중 오류가 발생했습니다. (DB 저장 실패)',
                                type: 'single',
                            });
                        }
                    }
                }
                // 비밀번호 실패시 (추가된 부분)
                else if (value.login_result === 'login_fail') {
                    const maxNum = value.pswd_max_nocs;
                    const nocsNum = value.pswd_lck_nocs;

                    // 비밀번호 마지막 실패시
                    if (nocsNum === maxNum - 1) {
                        setValidation({
                            open: true,
                            message: `비밀번호가 일치하지 않습니다. 올바른 비밀번호를 입력해주세요. 한 번 더 틀리면 계정이 잠김 처리됩니다. ${
                                nocsNum + 1
                            }/${maxNum}`,
                            type: 'single',
                        });
                    } else {
                        // 비번 틀릴경우
                        setValidation({
                            open: true,
                            message: `비밀번호가 일치하지 않습니다. 올바른 비밀번호를 입력해주세요. 시도 횟수 ${
                                nocsNum + 1
                            }/${maxNum}`,
                            type: 'single',
                        });
                    }
                }
                // 비밀번호 잠김시 (추가된 부분)
                else if (value.login_result === 'pswd_locked') {
                    const maxNum = value.pswd_max_nocs;
                    setValidation({
                        open: true,
                        message: `로그인 시도 제한 횟수가 ${maxNum}회를 초과했습니다. 계정이 자동으로 잠김 처리됩니다. 관리자에게 문의해주세요`,
                        type: 'single',
                    });
                } else if (value.login_result === 'account_locked_by_admin') {
                    setValidation({
                        open: true,
                        message: '계정이 관리자에 의해 잠긴 상태입니다. 관리자에게 문의해주세요',
                        type: 'single',
                    });
                } else {
                    // 그 외 실패 시
                    setValidation({
                        open: true,
                        message: '선택한 기업으로 로그인 할 수 없습니다.',
                        type: 'single',
                    });
                }
            })
            .catch((error) => {
                console.log('error', error);
                setValidation({
                    open: true,
                    message: '로그인 실패!',
                    type: 'single',
                });
            });
    };

    // 중복 체크 함수
    const checkMultipleAccount = async () => {
        const item = [
            {
                sqlId: 'hrs_login01',
                sql_key: 'hrs_login',
                params: [
                    {
                        login_type: 'generic',
                        user_id: userInfo.username,
                        chk_second: '',
                    },
                ],
            },
        ];
        fetcherPostData(item)
            .then(async (response) => {
                const value = response[0].data;

                if (value.cnt && value.cnt > 1) {
                    // 계정이 2개 이상인 경우
                    checkUserId(value);
                    return;
                } else if (value.cnt === 1 && value.rprs_ognz_no) {
                    // 조직이 1개인 경우 → 자동 로그인 진행
                    console.log('value.cnt', value.cnt);
                    saveBeforeAccountLogin(userInfo.username, value.pblcn_key, () => {
                        handleSelectAccount(value.rprs_ognz_no);
                    });
                    return;
                } else {
                    // 그 외: 계정 없음 또는 이상한 응답
                    setValidation({
                        open: true,
                        message: '존재하지 않는 계정입니다. 메일주소를 다시 확인해 주세요',
                        type: 'single',
                    });
                    return;
                }
            })
            // 실패시
            .catch((error) => {
                console.log('error', error);
                setValidation({
                    open: true,
                    message: '로그인 실패!',
                    type: 'single',
                });
            });
    };

    // 아이디 저장 기능 on/off
    const handleRemember = (event: React.ChangeEvent<HTMLInputElement>) => {
        const checked = event.target.checked;
        console.log('Checkbox event:', event);
        console.log('Checkbox checked state:', checked);

        if (checked && !userInfo.username) {
            setValidation({
                open: true,
                message: '아이디를 입력해주세요.',
                type: 'single',
            });
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

    // 모달에서 비밀번호 확인
    const handleVerifyPassword = () => {
        if (verifyPassword.length !== 6) {
            setValidation({
                open: true,
                message: '비밀번호는 6자리로 입력해주세요.',
                type: 'single',
            });
            return;
        }

        // utils/axios.js의 verifyAuthCode 함수 호출
        verifyAuthCode(userInfo.username, userInfo.password, verifyPassword)
            .then((data) => {
                console.log('verifyAuthCode 결과:', data);
                if (data.verified) {
                    // 인증 성공, 로그인 처리
                    setOpenModal(false);
                    checkMultipleAccount();
                    //router.push('/');
                } else {
                    // 인증 실패
                    setValidation({
                        open: true,
                        message: '인증 코드가 유효하지 않습니다. 다시 시도해주세요.',
                        type: 'single',
                    });
                }
            })
            .catch((error) => {
                console.error('인증 코드 검증 오류:', error);
                setValidation({
                    open: true,
                    message: '인증 처리 중 오류가 발생했습니다.',
                    type: 'single',
                });
            });
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '440px',
                padding: '60px 84px 30px',
                backgroundColor: '#fff',
                boxShadow: '0 0 5px rgba(0,0,0,0.2)',
                border: '2px solid #13a9e9',
                borderRadius: '8px',
            }}
        >
            {/* Snackbar 컴포넌트 사용 */}
            <SnackbarAlert validation={validation} setValidation={setValidation} user_id={''} />

            {/* 비밀번호 확인 모달 */}
            <Modal
                open={openModal}
                onClose={() => {
                    setOpenModal(false);
                    setVerifyPassword('');
                }}
                aria-labelledby="password-verification-modal"
                aria-describedby="password-verification-modal-description"
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                    }}
                >
                    <Typography id="password-verification-modal" variant="h6" component="h2" sx={{ mb: 2 }}>
                        6자리 비밀번호 입력
                    </Typography>
                    <TextField
                        type="password"
                        value={verifyPassword}
                        onChange={(e) => setVerifyPassword(e.target.value)}
                        fullWidth
                        margin="normal"
                        inputProps={{ maxLength: 6 }}
                        placeholder="비밀번호를 입력하세요"
                    />
                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                        <Button
                            onClick={() => {
                                setOpenModal(false);
                                setVerifyPassword('');
                            }}
                            variant="outlined"
                            sx={{ flex: 1 }}
                        >
                            닫기
                        </Button>
                        <Button onClick={handleVerifyPassword} variant="contained" sx={{ flex: 1, bgcolor: '#13a9e9' }}>
                            확인
                        </Button>
                    </Stack>
                </Box>
            </Modal>

            <Box>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Image src="/images/logo-mark-3-d.png" alt="logo" width={56} height={40} />
                    <Typography
                        sx={{
                            mt: '10px',
                            fontSize: '18px',
                            color: '#13a9e9',
                            letterSpacing: '-0.1em',
                            textAlign: 'center',
                        }}
                    >
                        HR을 가장 똑똑하게
                        <br />
                        인사이트를 주는 업무공간, 인사잇
                    </Typography>
                </Box>

                {/* 아이디, 비밀번호 입력, 아이디 저장, 비밀번호 재설정 */}
                <div className={styles.loginBox}>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            checkMultipleAccount();
                        }}
                    >
                        <div className={styles.typingArea}>
                            <InputTextBox
                                type="text"
                                id="username"
                                value={userInfo.username}
                                onChange={(e) => handleChange(e, 'username')}
                                placeholder="아이디를 입력하세요."
                                hasToggle={false}
                                showPassword={false}
                                className="loginInput"
                                onDelete={() => setUserInfo((prev) => ({ ...prev, username: '' }))}
                            />
                            <InputTextBox
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={userInfo.password}
                                onChange={(e) => handleChange(e, 'password')}
                                placeholder="비밀번호를 입력하세요."
                                hasToggle={true}
                                showPassword={showPassword}
                                onTogglePassword={() => setShowPassword((prev) => !prev)}
                                className="loginInput"
                                onDelete={() => setUserInfo((prev) => ({ ...prev, password: '' }))}
                            />
                            {/* <FormControl fullWidth size='small' variant='outlined' sx={{ mb: 1 }} className='inputText'>
                            <InputLabel htmlFor='username'>아이디를 입력해주세요</InputLabel>
                            <OutlinedInput
                                id='username'
                                value={userInfo.username}
                                onChange={(e) => handleChange(e, 'username')}
                                placeholder='아이디를 입력해주세요'
                            />
                            </FormControl>
                            <FormControl fullWidth size='small' variant='outlined' sx={{ mb: 1 }} className='inputText'>
                                <InputLabel htmlFor='password'>비밀번호</InputLabel>
                                <OutlinedInput
                                    endAdornment={
                                        <InputAdornment position='end'>
                                            <IconButton onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                    placeholder='비밀번호'
                                />
                            </FormControl> */}
                        </div>

                        {/* 아이디 저장 체크박스 & 비밀번호 재설정 버튼 */}
                        <Stack
                            direction="row"
                            sx={{ justifyContent: 'space-between', width: '100%', mt: '16px', mb: '16px' }}
                        >
                            <RememberCheckbox userRemember={userRemember} handleRemember={handleRemember} />

                            {/* HTML button 태그로 변경하고 type="button" 명시 */}
                            <button
                                type="button"
                                onClick={() => {
                                    if (userInfo.username) {
                                        setEmail(userInfo.username);
                                    }
                                    setStep('resetPassword');
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#13a9e9',
                                    textDecoration: 'underline',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    padding: '4px 8px',
                                }}
                            >
                                비밀번호 재설정
                            </button>
                        </Stack>

                        {/* 로그인 버튼을 submit 타입으로 변경 */}
                        <button type="submit" className={`${styles.btnLogin}`}>
                            로그인
                        </button>
                    </form>
                </div>

                {/* 간편 로그인 버튼 */}
                <div className={styles.simpleLogin}>
                    <button>
                        <NaverLogin />
                    </button>
                    <button>
                        <KakaoLogin />
                    </button>
                    <button>
                        <GoogleLogin />
                    </button>
                </div>

                {/* 데모 신청하기 버튼 */}
                <button className={styles.btnSubmitDemo} onClick={handleLogin}>
                    <IcoDemo fill="#c4c4c4" />
                    데모 신청하기
                </button>
            </Box>
            {/* 다중 계정 선택 모달 */}
            <SwModal open={multiAccountModalOpen} onClose={() => setMultiAccountModalOpen(false)}>
                <Typography type="form">로그인할 기업을 선택하세요</Typography>

                {multipleAccounts && (
                    <>
                        <div className={styles.selectLoginCompany}>
                            {/* 객체 키를 제외한 부분을 순회하며 버튼 생성 */}
                            {Object.entries(multipleAccounts)
                                .filter(([key]) => key !== 'cnt') // cnt 키 제외
                                .map(([companyName, { rprs_ognz_no, pblcn_key }], index) => (
                                    <Button
                                        key={index}
                                        type="default"
                                        size="md"
                                        onClick={() =>
                                            saveBeforeAccountLogin(rprs_ognz_no, pblcn_key, () =>
                                                handleSelectAccount(rprs_ognz_no)
                                            )
                                        }
                                        className={styles.btn}
                                    >
                                        {companyName}
                                    </Button>
                                ))}
                        </div>
                        <Button
                            onClick={() => setMultiAccountModalOpen(false)}
                            type="primary"
                            size="md"
                            className={styles.btnCancel}
                        >
                            취소
                        </Button>
                    </>
                )}
            </SwModal>
        </Box>
    );
}
