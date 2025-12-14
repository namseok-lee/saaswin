'use client';

import Button from '@/components/Button';
import Loader from '@/components/Loader';
import { fetcherGetInicisPay, fetcherPostData } from '@/utils/axios';
import { Box } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

export default function PayManagement() {
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const auth = JSON.parse(localStorage.getItem('auth') ?? '{}');
    const languageView = auth?.state?.languageView ?? 'ko';
    const userNo = auth?.state?.userNo ?? '';
    const rprsOgnzNo = auth?.state?.rprsOgnzNo ?? '';
    const formRef = useRef<HTMLFormElement>(null);

    // 백엔드 API를 통한 결제 처리
    const handlePayViaBackend = async () => {
        setIsLoading(true);
        try {
            // 유저 정보 조회
            const userInfoItem = [
                {
                    sqlId: 'hpo_apnt01',
                    sql_key: 'hpo_apnt_ognzno_userno',
                    params: [{ user_no: userNo, ognz_no: '' }],
                },
            ];
            const userInfo = await fetcherPostData(userInfoItem);
            const userData = userInfo[0];

            // 결제 정보 조회
            const payParams = {
                buyername: userData.flnm,
                goodname: `${userData.corp_nm} 데모신청`,
                buyertel: userData.user_mbl_telno,
                buyeremail: userData.user_id,
                languageView,
                price: 1000,
            };

            // 백엔드에서 결제 처리 요청
            const response = await fetch('/api/inicis/billing', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payParams),
            });

            if (!response.ok) {
                throw new Error('결제 요청 실패');
            }

            const result = await response.json();

            // 결제 성공 처리
            if (result.success) {
                alert('결제가 성공적으로 처리되었습니다.');
                // 추가 로직 (예: 결제 내역 페이지로 이동)
            } else {
                // 실패 시 처리
                alert(`결제 실패: ${result.message || '알 수 없는 오류가 발생했습니다.'}`);
            }
        } catch (error) {
            console.error('결제 처리 중 오류 발생:', error);
            alert('결제 처리 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    // 기존 프론트엔드 결제 처리 방식
    const handlePayViaFrontend = () => {
        if (window?.INIStdPay && formRef.current) {
            console.log(formRef.current);
            window.INIStdPay.pay(formRef.current.id);
        } else {
            alert('결제 모듈이 아직 로드되지 않았습니다.');
        }
    };

    useEffect(() => {
        // 이니시스 스크립트 로드
        const script = document.createElement('script');
        script.src = 'https://stgstdpay.inicis.com/stdjs/INIStdPay.js';
        script.async = true;
        script.onload = () => {
            setIsScriptLoaded(true);
        };
        document.body.appendChild(script);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (!userNo || !rprsOgnzNo) return;
            try {
                // 유저 정보 조회
                const userInfoItem = [
                    {
                        sqlId: 'hpo_apnt01',
                        sql_key: 'hpo_apnt_ognzno_userno',
                        params: [{ user_no: userNo, ognz_no: '' }],
                    },
                ];
                const userInfo = await fetcherPostData(userInfoItem);
                const userData = userInfo[0];

                // 결제 정보 조회
                const payParams = {
                    buyername: userData.flnm,
                    goodname: `${userData.corp_nm} 데모신청`,
                    buyertel: userData.user_mbl_telno,
                    buyeremail: userData.user_id,
                    languageView,
                    price: 1000,
                };
                const inicisData = await fetcherGetInicisPay(payParams);
                console.log('✅ 결제 정보:', inicisData);
                const form = formRef.current;
                if (!form) return;
                form.innerHTML = '';
                // 이니시스 파라미터 추가
                Object.entries(inicisData).forEach(([key, value]) => {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = String(value);
                    form.appendChild(input);
                });
            } catch (err) {
                console.error('❌ 데이터 조회 중 오류 발생:', err);
            }
        };

        fetchData();
    }, [userNo, rprsOgnzNo, languageView]);

    if (!isScriptLoaded) return <Loader />;
    if (isLoading) return <Loader />;

    return (
        <div>
            <div>결제관리</div>
            <form
                ref={formRef}
                id='SendPayForm_id'
                method='post'
                style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}
            />
            <div>
                <Box display='flex' gap={2}>
                    <Button
                        id='btnFrontend'
                        type='secondary'
                        size='lg'
                        className='btnWithIcon'
                        onClick={handlePayViaFrontend}
                    >
                        프론트엔드 결제
                    </Button>
                    <Button
                        id='btnBackend'
                        type='primary'
                        size='lg'
                        className='btnWithIcon'
                        onClick={handlePayViaBackend}
                    >
                        백엔드 결제
                    </Button>
                </Box>
            </div>
        </div>
    );
}
