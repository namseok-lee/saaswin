'use client';
import { Box, Typography, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { fetcherPostSecondCert } from 'utils/axios';
import SnackbarAlert from './SnackbarAlert';
import Image from 'next/image';
import Button from 'components/Button';
import InputTextBox from 'components/BoxTextInput';
import { useAuthStore } from '@/utils/store/auth';
import { loadLanguage } from 'i18n/i18n';
import { useRouter } from 'next/navigation';
import styles from '../../styles/pages/Login/page.module.scss';
import { IcoMail } from '../../../public/asset/Icon';

interface Props {
    onBackToLogin: () => void;
    email: string;
    certUserInfo: {
        user_no: string;
        ognz_no: string;
        rprs_ognz_no: string;
        duty_cd: string;
        duty_nm: string;
        jbgd_cd: string;
        jbgd_nm: string;
        jbgp_cd: string;
        jbgp_nm: string;
        jbps_cd: string;
        jbps_nm: string;
        jbtt_cd: string;
        jbtt_nm: string;
        public_key: string;
        redis_ver: string;
    };
}

interface AuthData {
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
    jbtt_cd: string; // 직책코드
    jbtt_nm: string; // 직책명
    pblcn_key?: string; // publicKey 필드 추가
}

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

export default function SecondCertForm({ onBackToLogin, certUserInfo, email }: Props) {
    const setAuth = useAuthStore((state) => state.setAuth); // 로그인 내용 -> 전역 변수 저장
    const [sendYn, setSendYn] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0); // 3분 = 180초
    const [validation, setValidation] = useState({ open: false, message: '', type: '' });
    const [formData, setFormData] = useState({ tel_no: '', cert_no: '' });
    const router = useRouter(); // 페이지 변경

    // 타이머 처리
    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    // 시간 포맷: mm:ss
    const formatTime = (sec: number) => {
        const m = String(Math.floor(sec / 60)).padStart(1, '0');
        const s = String(sec % 60).padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleChange = (type: string, value: string) => {
        if (type === 'tel_no') {
            const formattedValue = value.replace(/-/g, '').substring(0, 11);
            const formattedTelNo =
                formattedValue.substring(0, 3) +
                '-' +
                formattedValue.substring(3, 7) +
                '-' +
                formattedValue.substring(7, 11);
            setFormData((prev) => ({
                ...prev,
                tel_no: formattedValue.length === 11 ? formattedTelNo : formattedValue,
            }));
        } else if (type === 'cert_no') {
            setFormData((prev) => ({ ...prev, cert_no: value }));
        }
    };

    const handleCertSend = () => {
        if (
            formData.tel_no === '' ||
            formData.tel_no === null ||
            formData.tel_no === undefined ||
            formData.tel_no.length < 11
        ) {
            setValidation({
                open: true,
                message: '휴대폰 번호를 입력해주세요.',
                type: 'single',
            });
        } else {
            const item = {
                userid: email,
                tel_no: formData.tel_no.replace(/-/g, ''),
            };

            fetcherPostSecondCert('/api/secondCertification/send', item)
                .then((response) => {
                    if (response.returnCd !== '40002') {
                        setValidation({
                            open: true,
                            message: response.returnMsg,
                            type: 'single',
                        });
                    } else {
                        if (sendYn) {
                            setValidation({
                                open: true,
                                message: '인증코드가 재전송되었습니다.',
                                type: 'single',
                            });
                        } else {
                            setValidation({
                                open: true,
                                message: '인증코드가 전송되었습니다.',
                                type: 'single',
                            });
                        }
                        setTimeLeft(180);
                        setSendYn(true);
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    };

    const handleCertLogin = () => {
        if (formData.cert_no === '' || formData.cert_no === null || formData.cert_no === undefined) {
            setValidation({
                open: true,
                message: '인증번호를 입력해주세요.',
                type: 'single',
            });
        } else if (timeLeft <= 0) {
            setValidation({
                open: true,
                message: '인증번호 시간이 만료되었습니다. 인증번호를 재전송해주세요.',
                type: 'single',
            });
        } else {
            const item = {
                userid: email,
                tel_no: formData.tel_no.replace(/-/g, ''),
                cert_no: formData.cert_no,
            };

            fetcherPostSecondCert('/api/secondCertification/check', item)
                .then(async (response) => {
                    if (response.returnCd !== '40002') {
                        setValidation({
                            open: true,
                            message: response.returnMsg,
                            type: 'single',
                        });
                    } else {
                        const authData: AuthData = {
                            userNo: certUserInfo.user_no,
                            ognzNo: certUserInfo.ognz_no,
                            rprsOgnzNo: certUserInfo.rprs_ognz_no,
                            duty_cd: certUserInfo.duty_cd, // 직무코드
                            duty_nm: certUserInfo.duty_nm, // 직무명
                            jbgd_cd: certUserInfo.jbgd_cd, // 직급코드
                            jbgd_nm: certUserInfo.jbgd_nm, // 직급명
                            jbgp_cd: certUserInfo.jbgp_cd, // 직군코드
                            jbgp_nm: certUserInfo.jbgp_nm, // 직군명
                            jbps_cd: certUserInfo.jbps_cd, // 직위코드
                            jbps_nm: certUserInfo.jbps_nm, // 직위명
                            jbtt_cd: certUserInfo.jbtt_cd, // 직책코드
                            jbtt_nm: certUserInfo.jbtt_nm, // 직책명
                            pblcn_key: certUserInfo.public_key, // publicKey 저장
                        };

                        // 다국어 버전 체크
                        const redis_ver = certUserInfo?.redis_ver || '0.00';
                        const old_redis_ver = localStorage.getItem('redis_ver') || '0.00';
                        const lang = localStorage.getItem('userLanguage') || 'ko';

                        if (redis_ver !== old_redis_ver) {
                            loadLanguage(lang, false);
                            localStorage.setItem('redis_ver', certUserInfo.redis_ver);
                        }

                        try {
                            // IndexedDB 저장 시 에러 처리
                            // 1. 기존 방식(userNo)으로 저장
                            await saveDataToDB(authData);

                            // 2. userInfo.username으로도 동일하게 저장
                            if (email && email !== certUserInfo.user_no) {
                                const usernameAuthData = { ...authData, userNo: email };
                                await saveDataToDB(usernameAuthData);
                            }

                            // 전역변수 상태 저장
                            setAuth(authData);
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
                width: '440px',
                padding: '60px 84px 70px',
                backgroundColor: '#fff',
                boxShadow: '0 0 5px rgba(0,0,0,0.2)',
                border: '2px solid #13a9e9',
                borderRadius: '8px',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Image src='/images/logo-mark-3-d.png' alt='logo' width={56} height={40} />
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
            {/* Snackbar 컴포넌트 사용 */}
            <SnackbarAlert validation={validation} setValidation={setValidation} user_id={email} />
            {/* 휴대폰 번호 */}
            <Typography variant='subtitle1' gutterBottom>
                {sendYn ? (
                    <span style={{ color: '#f44336' }}>카카오톡 알림톡으로 인증 코드가 전송되었습니다.</span>
                ) : (
                    ''
                )}
            </Typography>
            <div className={`${styles.secondCert} ${styles.mobileNo}`}>
                <label htmlFor='' className={styles.label}>
                    휴대폰 번호
                </label>
                <div className={styles.typingArea}>
                    <InputTextBox
                        type='text'
                        id='tel_no'
                        value={formData.tel_no}
                        onChange={(e) => handleChange('tel_no', e.target.value)}
                        placeholder='휴대폰번호를 입력하세요.'
                        hasToggle={false}
                        showPassword={false}
                        className={`${styles.inputText} loginInput`}
                        onDelete={() => setFormData((prev) => ({ ...prev, tel_no: '' }))}
                        validationText=''
                        isNumber
                    />
                    <Button
                        type='default'
                        id='confirm'
                        key='confirm'
                        size='sm'
                        onClick={() => handleCertSend()}
                        className={styles.btnSend}
                    >
                        {!sendYn ? '인증코드 발송' : '재전송'}
                    </Button>
                </div>
            </div>

            {/* 인증코드 메일로 받기 버튼 */}
            <Button type='default' id='mailsend' key='mailsend' size='sm' className='btnWithIcon'>
                인증코드 메일로 받기 <IcoMail fill='#666666' />
            </Button>

            {/* 인증번호 입력 */}
            <div className={`${styles.secondCert} ${styles.certNo}`}>
                <label htmlFor='' className={styles.label}>
                    인증번호
                    {sendYn ? <span style={{ color: '#f44336' }}>남은 시간 : {formatTime(timeLeft)}</span> : ''}
                </label>
                <InputTextBox
                    type='text'
                    id='cert_no'
                    value={formData.cert_no}
                    onChange={(e) => handleChange('cert_no', e.target.value)}
                    placeholder='인증번호를 입력하세요.'
                    hasToggle={false}
                    showPassword={false}
                    className='loginInput'
                    onDelete={() => setFormData((prev) => ({ ...prev, cert_no: '' }))}
                    validationText=''
                    isNumber
                    maxLength={11}
                />
                {/* 로그인 버튼 */}
                <button onClick={() => handleCertLogin()} className={`${styles.btnLogin}`}>
                    로그인
                </button>
            </div>
        </Box>
    );
}
