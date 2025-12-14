'use client';
import React, { useState, useEffect } from 'react';
import { Box, Divider, Stack, IconButton, Dialog, DialogContent, DialogActions } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useAuthStore } from 'utils/store/auth';
import { fetcherPost, fetcherPostData } from 'utils/axios';
import PasswordChange from './PasswordChange';
import { NaverConnect } from './NaverConnect';
import { GoogleConnect } from './GoogleConnect';
import { KakaoConnect } from './KakaoConnect';
import Typography from 'components/Typography';
import InfoModal from 'components/InfoModal';
import {
    IcoArrow,
    IcoCopy,
    IcoGoogle,
    IcoKakao,
    IcoLinkOff,
    IcoLogin,
    IcoMobile,
    IcoNaver,
    IcoProfile,
    IcoUnlock,
} from '@/assets/Icon';
import Button from 'components/Button';
import { useTranslation } from 'react-i18next';
import SwModal from 'components/Modal';

// UserInfo 타입 정의
interface UserInfo {
    flnm?: string;
    user_id?: string;
    pswd_chg_ymd?: string;
    pswd_expry_ymd?: string;
    google_info?: { sns_user?: string };
    naver_info?: { sns_user?: string };
    kakao_info?: { sns_user?: string };
}

export default function MyInfo({ tpcd }: { tpcd: string }) {
    const [userInfo, setUserInfo] = useState<UserInfo>({});

    // const [telNo, setTelNo] = useState('');
    // const [lastChangePassword, setLastChangePassword] = useState('');
    // const [expireDate, setExpireDate] = useState('');
    // const [userName, setUserName] = useState('');
    const [linkedAccounts, setLinkedAccounts] = useState<Record<string, string>>({
        google: '',
        naver: '',
        kakao: '',
    });

    const [currentSns, setCurrentSns] = useState('');
    const userNo = useAuthStore((state) => state.userNo);
    const [unlinkSns, setUnlinkSns] = useState(''); // 해제할 SNS 상태 추가

    const [isModalOpen, setIsModalOpen] = useState(false);
    // 화면에 모달 띄우기
    const handleModal = (e?: any): void => {
        setIsModalOpen((prev) => !prev);
    };
    // 다국어
    const { t } = useTranslation();
    // SNS 한글 <-> 영어 매핑
    const snsMap: Record<string, string> = {
        네이버: 'naver',
        구글: 'google',
        카카오: 'kakao',
    };

    useEffect(() => {
        console.log('현재 SNS 상태 변경:', currentSns);
    }, [currentSns]);

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
        fetcherPostData(item)
            .then((response) => {
                // const value = response[0].data[0];
                // console.log(value);
                setUserInfo(response[0]);
                // setUserId(value.user_id);
                // setTelNo(formatPhoneNumber(value.user_mbl_telno));
                // setLastChangePassword(value.lastChangePassword);
                // setExpireDate(value.expireDate);
                // setUserName(value.korn_lastnm + value.korn_frstnm);
                setLinkedAccounts({
                    google: response[0].google_info?.sns_user || '',
                    naver: response[0].naver_info?.sns_user || '',
                    kakao: response[0].kakao_info?.sns_user || '',
                });
            })
            .catch(console.error);
    }, []);

    // 전화번호 포맷팅
    const formatPhoneNumber = (phone: string = ''): string => phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');

    const copyToClipboard = (text: string): void => {
        if (!text) return;
        navigator.clipboard.writeText(text).catch(console.error);
    };

    const handleConnect = (sns: string, connectFunc: () => void): void => {
        const snsKey = snsMap[sns]; // 한글 -> 영어 변환

        console.log(`handleConnect 호출됨 - SNS: ${snsKey}`);

        if (linkedAccounts[snsMap[sns]] && 1) {
            console.log(`연동된 계정 존재 - 팝업 표시: ${sns}`);
            setCurrentSns(sns);
        } else {
            console.log(`연동 안됨 - 즉시 실행: ${sns}`);
            connectFunc();
        }
    };

    const handleUnlinkSns = (sns: string): void => {
        console.log(`연동 해제 버튼 클릭됨 - SNS: ${sns}`);

        setUnlinkSns(sns); // 상태 업데이트 (useEffect에서 감지할 수 있도록)
    };

    useEffect(() => {
        if (unlinkSns) {
            console.log(`연동 해제 감지 - SNS: ${unlinkSns}`);
            const snsName = unlinkSns + '_delete';
            console.log(snsName);
            const item = [
                {
                    sqlId: 'hrs_login01',
                    sql_key: 'hrs_login',
                    params: [{ user_no: userNo, login_type: snsName }],
                },
            ];

            // API 호출 (연동 해제 처리)
            fetcherPostData(item)
                .then((response) => {
                    setLinkedAccounts((prev) => ({
                        ...prev,
                        [unlinkSns]: '',
                    }));
                    setUnlinkSns(''); // 상태 초기화
                })
                .catch((error) => {
                    console.error(`연동 해제 실패 - SNS: ${unlinkSns}`, error);
                });
        }
    }, [unlinkSns]); // `unlinkSns` 값이 변경될 때 실행
    const handleCloseDialog = () => {
        setCurrentSns('');
    };

    // 날짜 포맷팅 함수 (YYYYMMDD -> YYYY-MM-DD)
    const formatDateString = (dateStr: string | null | undefined): string => {
        if (!dateStr || dateStr.length !== 8) {
            return '-'; // 유효하지 않으면 '-' 반환
        }
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        return `${year}-${month}-${day}`;
    };

    return (
        <div className='contContainer'>
            <div className='configuration myLoginInfo'>
                {/* 내 로그인 정보 */}
                <div className='pageHeader'>
                    <div className='pageInfo'>
                        <Typography type='page' onClickDesc={handleModal} title={t('내 로그인 정보')}>
                            {t('내 로그인 정보')}
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

                <section className='section'>
                    <div className='sectionTitle'>
                        <div className='ico'>
                            <IcoLogin />
                        </div>
                        {t('내 접속정보')}
                    </div>
                    <div className='sectionCont connectInfo'>
                        <div className='info'>
                            <IcoProfile />
                            <div className='text'>
                                {userInfo?.flnm} {userInfo?.user_id}
                            </div>
                            <Button
                                onClick={() => copyToClipboard(userInfo?.flnm + userInfo?.user_id)}
                                className='btnCopy btnWithIcon'
                            >
                                {t('복사')} <IcoCopy />
                            </Button>
                        </div>
                        <div className='info'>
                            <IcoMobile />
                            <div className='text'>{formatPhoneNumber(userInfo?.user_mbl_telno)}</div>
                            <Button
                                onClick={() => copyToClipboard(userInfo?.user_mbl_telno)}
                                className='btnCopy btnWithIcon'
                            >
                                {t('복사')} <IcoCopy />
                            </Button>
                        </div>
                    </div>
                    <div>{userInfo?.telNo}</div>
                </section>

                {/* 비밀번호 변경 */}
                <section className='section'>
                    <div className='sectionTitle'>
                        <div className='ico'>
                            <IcoLogin />
                        </div>
                        {t('비밀번호 변경')}
                    </div>
                    <div className='sectionCont connectInfo'>
                        <div className='info'>
                            <IcoUnlock />
                            <div className='text'>
                                {t('최종변경일자')}:{formatDateString(userInfo?.pswd_chg_ymd)}
                            </div>
                        </div>
                        <div className='info'>
                            <IcoUnlock />
                            <div className='text'>
                                {t('만료일자')}:{formatDateString(userInfo?.pswd_expry_ymd)}
                            </div>
                        </div>
                        <PasswordChange userNo={userNo} userId={userInfo?.user_id || ''} />
                    </div>
                </section>

                {/* SNS 계정 연동 */}
                <section className='section'>
                    <div className='sectionTitle'>
                        <div className='ico'>
                            <IcoLogin />
                        </div>
                        {t('SNS 연동')}
                    </div>
                    <div className='sectionCont snsConnect'>
                        {/* <div className='desc'>{t('SNS를 연동하면 간편로그인 기능을 사용할 수 있습니다.')}</div> */}
                        <div className='desc'>{t('50038')}</div>
                        <div className='snsList'>
                            {Object.keys(snsMap).map((sns) => (
                                <div key={sns} className='item'>
                                    <Button
                                        onClick={() =>
                                            handleConnect(
                                                sns,
                                                snsMap[sns] === 'naver'
                                                    ? NaverConnect
                                                    : snsMap[sns] === 'google'
                                                    ? GoogleConnect
                                                    : KakaoConnect
                                            )
                                        }
                                        type='default'
                                        size='md'
                                        className='btnWithIcon btnSnsConnect'
                                    >
                                        {snsMap[sns] === 'naver' ? (
                                            <IcoNaver />
                                        ) : snsMap[sns] === 'google' ? (
                                            <IcoGoogle />
                                        ) : (
                                            <IcoKakao />
                                        )}
                                        {sns} {t('계정 연동')} <IcoArrow className='icoArrow' />
                                    </Button>
                                    {linkedAccounts[snsMap[sns]] && (
                                        <>
                                            <div className='acccountId'>{linkedAccounts[snsMap[sns]]}</div>
                                            <Button
                                                onClick={() => handleUnlinkSns(snsMap[sns])}
                                                className='btnWithIcon btnLinkOff'
                                            >
                                                {t('연동 해제')} <IcoLinkOff />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* SNS 연동된 경우 팝업 */}
                <SwModal open={Boolean(currentSns)} onClose={handleCloseDialog} title='알림'>
                    <div className='msg'>
                        {/* {t('이미 연동된 계정입니다. 다른 계정으로 연동을 원할 시 연동 해제 후 다시 연동하세요.')} */}
                        {t('50039')}
                    </div>
                    <div className='actions'>
                        <Button onClick={handleCloseDialog} type='primary' size='lg' className='btnWithIcon'>
                            {t('확인')}
                        </Button>
                    </div>
                </SwModal>
            </div>
        </div>
    );
}
