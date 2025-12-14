'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Box, FormControl, FormLabel, FormControlLabel, Stack, Paper, Divider, Snackbar, Alert } from '@mui/material';
import { useAuthStore } from 'utils/store/auth';
import { fetcherPost, fetcherPostData } from 'utils/axios';
import PasswordDialog from './PasswordDialog';
import { IcoArrowOutward, IcoCheckFill, IcoLogin, IcoTakeBack } from '@/assets/Icon';
import Typography from 'components/Typography';
import InfoModal from 'components/InfoModal';
import Radio from 'components/Radio';
import RadioGroup from 'components/RadioGroup';
import Button from 'components/Button';
import CheckboxGroup from 'components/CheckboxGroup';
import Checkbox from 'components/Checkbox';
import Switch from 'components/Switch';
import Depth2CertExpDialog from './Depth2CertExpDialog';
import { useTranslation } from 'react-i18next';

const PasswordPolicySettings = () => {
    const [loginAttempts, setLoginAttempts] = useState(5); // 로그인 실패시 제한 설정
    const userNo = useAuthStore((state) => state.userNo); // 전역 변수값(user_no)
    const rprsOgnzNo = useAuthStore((state) => state.rprsOgnzNo); // 전역 변수값(rprs_ognz_no)
    const [twoFactorAuth, setTwoFactorAuth] = useState(false); // 2단계 인증 설정
    const [passwordExpiry, setPasswordExpiry] = useState(3); // 만료일
    const [passwordReminderCycle, setPasswordReminderCycle] = useState(7); // 만료 알림일 설정
    const [passwordComplexity, setPasswordComplexity] = useState('hrs_group00928_cm0002'); // 비밀번호 규칙 설정
    const [passwordReuseLimit, setPasswordReuseLimit] = useState(5); // 비밀번호 재사용 제한 설정
    const [passwordReminderType, setPasswordReminderType] = useState({
        pswd_expry_schdl_infrm_lgn: false, // 로그인 팝업
        pswd_expry_schdl_infrm_eml: false, // 메일
        pswd_expry_schdl_infrm_nt: false, // 알림톡
    });

    const reminderRef = useRef(null); // 포커싱 이동

    // 다국어
    const { t } = useTranslation();
    // 모달에 사용되는 변수
    const [open, setOpen] = useState(false);
    const [open2, setOpen2] = useState(false);

    const handleOpen = () => {
        setOpen(!open);
    };
    const handleOpen2 = () => {
        setOpen2(!open2);
    };

    // 스낵바 알람
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('warning');

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    // 화면에 모달 띄우기
    const handleModal = (e: any) => {
        setIsModalOpen((prev) => !prev);
    };

    //TODO: 1.최초 접속시 저장된 값 받아오기
    useEffect(() => {
        const item = [
            {
                sqlId: 'hrs_login01',
                sql_key: 'hrs_login_crtr_stng_get',
                params: [
                    {
                        rprs_ognz_no: rprsOgnzNo,
                    },
                ],
            },
        ];

        fetcherPostData(item)
            .then((response) => {
                if (response[0].data[0].return_cd === '40002') {
                    const value = response[0].data[0].hrs_info;
                    setLoginAttempts(value.pswd_lck_nocs);
                    setTwoFactorAuth(value.cert_2step_vtlz);
                    setPasswordExpiry(value.pswd_expry_schdl_mm);
                    setPasswordReminderCycle(value.infrm_prd_dd);
                    setPasswordComplexity(value.pswd_scrty_knd);
                    setPasswordReuseLimit(value.pswd_ruse_lmt_cnt);

                    setPasswordReminderType(() => ({
                        pswd_expry_schdl_infrm_lgn: value.pswd_expry_schdl_infrm_lgn ?? false,
                        pswd_expry_schdl_infrm_eml: value.pswd_expry_schdl_infrm_eml ?? false,
                        pswd_expry_schdl_infrm_nt: value.pswd_expry_schdl_infrm_nt ?? false,
                    }));
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    // 로그인 관리 저장
    const handleSave = () => {
        if (
            passwordExpiry !== 0 &&
            !passwordReminderType.pswd_expry_schdl_infrm_lgn &&
            !passwordReminderType.pswd_expry_schdl_infrm_eml &&
            !passwordReminderType.pswd_expry_schdl_infrm_nt
        ) {
            setSnackbarMessage('비밀번호 만료 알림 방식을 선택해주세요.');
            setSnackbarSeverity('warning'); // 'error', 'success', 'info' 등 변경 가능
            setOpenSnackbar(true);
            reminderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        const item = [
            {
                sqlId: 'hrs_login01',
                sql_key: 'hrs_login_crtr_stng',
                params: [
                    {
                        rprs_ognz_no: rprsOgnzNo,
                        user_no: userNo,
                        hrs_info: {
                            infrm_prd_dd: passwordReminderCycle,
                            pswd_lck_nocs: loginAttempts,
                            cert_2step_vtlz: twoFactorAuth,
                            pswd_ruse_lmt_cnt: passwordReuseLimit,
                            pswd_expry_schdl_mm: passwordExpiry,
                            pswd_expry_schdl_infrm_nt: passwordReminderType.pswd_expry_schdl_infrm_nt,
                            pswd_expry_schdl_infrm_eml: passwordReminderType.pswd_expry_schdl_infrm_eml,
                            pswd_expry_schdl_infrm_lgn: passwordReminderType.pswd_expry_schdl_infrm_lgn,
                            pswd_scrty_knd: passwordComplexity,
                        },
                    },
                ],
            },
        ];

        fetcherPostData(item)
            .then((response) => {
                console.log('리턴값 콘솔 ' + JSON.stringify(response, null, 2));
            })
            .catch((error) => {
                console.log(error);
            });

        console.log({
            loginAttempts,
            twoFactorAuth,
            passwordExpiry,
            passwordReminderType,
            passwordReminderCycle,
            passwordComplexity,
            passwordReuseLimit,
        });
    };

    return (
        <div className='contContainer'>
            <div className='configuration loginManage'>
                <div className='pageHeader'>
                    <div className='pageInfo'>
                        <Typography type='page' onClickDesc={handleModal} title='화면설정'>
                            {t('로그인관리')}
                        </Typography>
                        <InfoModal
                            title='화면설정'
                            // url="https://docs.google.com/document/d/e/2PACX-1vQvfxSoqEqQd6_CRF1aQufCUJYue2HpeMhWwTvGLgYIUrtudcrtf3nRLp8e_BlCLl-0HyfW0WuLCqIb/pub?embedded=true"
                            url='https://docs.google.com/document/d/18Qn9wrfJ7NQuLaW2UItsMkT1JN_Rjq31gDpsHWVqj_A/edit?usp=sharing#heading=h.w56nw9rlwsc'
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                        />
                    </div>
                </div>
                {/* 로그인 제한 설정 */}
                <section className='section'>
                    <div className='sectionTitle'>
                        <div className='ico'>
                            <IcoLogin />
                        </div>
                        {t('로그인 제한 설정')}
                    </div>
                    <div className='sectionCont limit'>
                        <div className='desc'>
                            <div className='tit'>{t('50041')}</div>
                            <div className='text'>
                                {/* 로그인을 시도할 수 있는 제한 횟수를 설정합니다.
                                <br />
                                제한 횟수 이상으로 비밀번호를 잘 못 입력한 경우, 계정이 자동으로 비활성화 처리됩니다. */}
                                {t('50042')}
                                <br />
                                {t('50043')}
                            </div>
                        </div>
                        <div className='formBox'>
                            <RadioGroup direction='vertical'>
                                <Radio
                                    id='no-limit'
                                    name='loginAttempts'
                                    // label={t('제한없음')}
                                    label={t('50044')}
                                    value={0}
                                    checked={loginAttempts === 0}
                                    onChange={() => setLoginAttempts(0)}
                                />
                                {/* {[3, 5, 10].map((attempt) => ( */}
                                {[3, 5, 10].map((attempt) => (
                                    <Radio
                                        key={attempt}
                                        id={`attempt-${attempt}`}
                                        name='loginAttempts'
                                        // label={t(`${attempt}회 실패 시 잠금`)}
                                        label={attempt === 3 ? t('50045') : attempt === 5 ? t('50046') : t('50047')}
                                        value={attempt}
                                        checked={loginAttempts === attempt}
                                        onChange={() => setLoginAttempts(attempt)}
                                    />
                                ))}
                            </RadioGroup>
                        </div>
                    </div>
                </section>
                {/* 로그인 보안 설정 */}
                <section className='section'>
                    <div className='sectionTitle'>
                        <div className='ico'>
                            <IcoLogin />
                        </div>
                        {t('로그인 보안 설정')}
                    </div>
                    <div className='sectionCont limit'>
                        <div className='desc'>
                            <div className='tit'>
                                {t('2단계 인증 설정')}
                                <Switch id='switch' className='switchBtn' />
                            </div>
                            <div className='text'>
                                {/* 구성원들이 로그인 시 항상 2단계 인증을 실행합니다. */}
                                {t('50048')}
                                <br />
                                {/* 제외 IP로 등록한 곳 에서는 2단계 인증 없이 로그인 할 수 있습니다. */}
                                {t('50049')}
                            </div>
                            <Button
                                type='default'
                                size='sm'
                                className='btnWithIcon btnSetCertify'
                                onClick={() => setOpen2(true)}
                            >
                                {/* 2단계 인증 제외 IP 관리하기 <IcoArrowOutward /> */}
                                {t('50050')} <IcoArrowOutward />
                            </Button>
                        </div>
                    </div>
                </section>
                {/* 비밀번호 만료 옵션 설정 */}
                <section className='section'>
                    <div className='sectionTitle'>
                        <div className='ico'>
                            <IcoLogin />
                        </div>
                        {t('비밀번호 만료 옵션 설정')}
                    </div>
                    <div className='sectionCont limit'>
                        <div className='desc'>
                            <div className='tit'>{t('구성원 비밀번호 만료일자 설정')}</div>
                        </div>
                        <div className='formBox multiType'>
                            <RadioGroup>
                                <Radio
                                    id='no_month'
                                    name='passwordExpiry'
                                    label={t('없음')}
                                    value={0}
                                    checked={passwordExpiry === 0}
                                    onChange={() => setPasswordExpiry(0)}
                                />
                                {[3, 6, 12].map((expiry) => (
                                    <Radio
                                        key={expiry}
                                        id={`expiry-${expiry}`}
                                        name='passwordExpiry'
                                        label={t(`${expiry}개월`)}
                                        value={expiry}
                                        checked={passwordExpiry === expiry}
                                        onChange={() => setPasswordExpiry(expiry)}
                                    />
                                ))}
                            </RadioGroup>
                        </div>
                        <div className='desc'>
                            <div className='tit'>
                                {t('만료일자 방법 설정')}
                                <Button type='default' size='sm' className='btnWithIcon btnPreivew'>
                                    {t('미리보기')} <IcoArrowOutward />
                                </Button>
                            </div>
                            <div className='text'>
                                {/* 구성원들이 로그인 시 항상 2단계 인증을 실행합니다. */}
                                {t('50048')}
                                <br />
                                {/* 제외 IP로 등록한 곳 에서는 2단계 인증 없이 로그인 할 수 있습니다. */}
                                {t('50049')}
                            </div>
                        </div>
                        <div className='formBox multiType'>
                            <CheckboxGroup>
                                {[
                                    { key: 'pswd_expry_schdl_infrm_lgn', label: t('로그인 팝업') },
                                    { key: 'pswd_expry_schdl_infrm_eml', label: t('이메일') },
                                    { key: 'pswd_expry_schdl_infrm_nt', label: t('알림톡') },
                                ].map((item) => (
                                    <Checkbox
                                        key={item.key}
                                        id={`item-${item.key}`}
                                        name={`item-${item.key}`}
                                        label={item.label}
                                        value={item.key}
                                        checked={passwordReminderType[item.key] ?? false}
                                        onChange={() =>
                                            setPasswordReminderType((prev) => ({
                                                ...prev,
                                                [item.key]: !prev[item.key], // 현재 값 반전 (true <-> false)
                                            }))
                                        }
                                    />
                                ))}
                            </CheckboxGroup>
                        </div>
                        <div className='desc'>
                            <div className='tit'>{t('만료 알림주기일자 설정')}</div>
                        </div>
                        <div className='formBox multiType'>
                            <RadioGroup>
                                {[14, 7, 3].map((cycle) => (
                                    <Radio
                                        key={cycle}
                                        id={`cycle-${cycle}`}
                                        name='passwordCycle'
                                        // label={t(`${cycle}일 전 부터`)}
                                        label={cycle === 14 ? t('50053') : cycle === 7 ? t('50054') : t('50055')}
                                        value={cycle}
                                        checked={passwordReminderCycle === cycle}
                                        onChange={() => setPasswordReminderCycle(cycle)}
                                    />
                                ))}
                            </RadioGroup>
                        </div>
                    </div>
                </section>
                {/* 비밀번호 보안 설정 */}
                <section className='section'>
                    <div className='sectionTitle'>
                        <div className='ico'>
                            <IcoLogin />
                        </div>
                        {t('비밀번호 보안 설정')}
                    </div>
                    <div className='sectionCont limit'>
                        <div className='desc'>
                            <div className='tit'>{t('비밀번호 규칙 설정')}</div>
                            {/* <div className='text'>{t('전체 구성원에게 비밀번호 규칙을 선택합니다.')}</div> */}
                            <div className='text'>{t('50056')}</div>
                        </div>
                        <div className='formBox multiType'>
                            <RadioGroup direction='vertical'>
                                <Radio
                                    id='hrs_group00928_cm0001'
                                    name='hrs_group00928'
                                    // label={t('영문 소문자, 숫자 8자 이상')}
                                    label={t('50057')}
                                    value='hrs_group00928_cm0001'
                                    checked={passwordComplexity === 'hrs_group00928_cm0001'}
                                    onChange={(e) => setPasswordComplexity('hrs_group00928_cm0001')}
                                />
                                <Radio
                                    id='hrs_group00928_cm0002'
                                    name='hrs_group00928'
                                    // label='영문 대문자, 소문자, 숫자, 특수문자 중 3가지 이상, 10자 이상'
                                    label={t('50058')}
                                    value='hrs_group00928_cm0002'
                                    checked={passwordComplexity === 'hrs_group00928_cm0002'}
                                    onChange={(e) => setPasswordComplexity('hrs_group00928_cm0002')}
                                />
                                <Radio
                                    id='hrs_group00928_cm0003'
                                    name='hrs_group00928'
                                    // label='영문 대문자, 소문자, 숫자, 특수문자 모두 포함, 10자 이상'
                                    label={t('50059')}
                                    value='hrs_group00928_cm0003'
                                    checked={passwordComplexity === 'hrs_group00928_cm0003'}
                                    onChange={(e) => setPasswordComplexity('hrs_group00928_cm0003')}
                                />
                            </RadioGroup>
                        </div>
                        <div className='desc'>
                            <div className='tit'>{t('비밀번호 재사용 제한 설정')}</div>
                            {/* <div className='text'>비밀번호 변경 시, 재사용 제한 횟수를 설정합니다.</div> */}
                            <div className='text'>{t('50060')}</div>
                        </div>
                        <div className='formBox multiType'>
                            <RadioGroup direction='vertical'>
                                {[1, 3, 5, 10].map((limit) => (
                                    <Radio
                                        key={limit}
                                        id={`reuse-limit-${limit}`}
                                        name='passwordReuseLimit'
                                        label={t(`최근 ${limit}개`)}
                                        value={limit}
                                        checked={passwordReuseLimit === limit}
                                        onChange={() => setPasswordReuseLimit(limit)}
                                    />
                                ))}
                            </RadioGroup>
                        </div>
                    </div>
                </section>
                {/* 비밀번호 재발급 */}
                <section className='section'>
                    <div className='sectionTitle'>
                        <div className='ico'>
                            <IcoLogin />
                        </div>
                        {t('비밀번호 재설정')}
                    </div>
                    <div className='sectionCont limit'>
                        <div className='desc'>
                            <div className='tit'>{t('비밀번호 재설정 링크 메일 발송')}</div>
                            <div className='text'>
                                {/* 구성원이 비밀번호를 재설정 할 수 있는 링크를 메일로 전송합니다. */}
                                {t('50051')}
                                <br />
                                {/* 비밀번호 재설정을 위해, 계정이 잠긴 유저는 자동으로 활성화 되고 기존 비밀번호는 초기화 처리됩니다. */}
                                {t('50052')}
                            </div>
                        </div>
                        <Button type='default' size='sm' onClick={handleOpen} className='btnWithIcon'>
                            {t('메일 발송')} <IcoArrowOutward />
                        </Button>
                    </div>
                </section>
                <div className='pageBtnArea'>
                    <Button type='default' size='lg' className='btnWithIcon'>
                        <IcoTakeBack fill='#7C7C7C' /> {t('초기화')}
                    </Button>
                    <Button type='primary' size='lg' onClick={handleSave} className='btnWithIcon'>
                        <IcoCheckFill fill='#FFFFFF' />
                        {t('저장')}
                    </Button>
                </div>
            </div>

            {/* 모달 */}
            <PasswordDialog open={open} onClose={handleOpen}></PasswordDialog>
            <Depth2CertExpDialog open={open2} onClose={handleOpen2}></Depth2CertExpDialog>
            {/* Snackbar 알림 */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default PasswordPolicySettings;
