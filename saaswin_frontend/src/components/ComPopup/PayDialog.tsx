import { useEffect, useRef, useState } from 'react';
import Button from '../Button';
import SwModal from '../Modal';
import { fetcherGetInicisPay, fetcherPostData } from '@/utils/axios';
import Loader from '../Loader';

const PayDialog = ({ open, handleClose }: { open: boolean; handleClose: () => void }) => {
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);
    const auth = JSON.parse(localStorage.getItem('auth') ?? '{}');
    const languageView = auth?.state?.languageView ?? 'ko';
    const userNo = auth?.state?.userNo ?? '';
    const rprsOgnzNo = auth?.state?.rprsOgnzNo ?? '';
    const formRef = useRef<HTMLFormElement>(null);
    const handlePay = () => {
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
    }, [open]);
    console.log('✅ mkey:', (formRef.current?.elements.namedItem('mkey') as HTMLInputElement)?.value);

    if (!isScriptLoaded) return <Loader />;
    return (
        <SwModal open={open} onClose={handleClose} title='결제 모달'>
            <div className='msg'>결제를 진행하시겠습니까?</div>
            <form ref={formRef} id='SendPayForm_id' method='post' style={{ display: 'none' }} />
            <div className='actions'>
                <Button
                    id='btnDefault11'
                    type='primary'
                    size='lg'
                    onClick={() => {
                        handlePay();
                    }}
                >
                    결제요청
                </Button>
                <Button
                    id='btnPrmary12'
                    type='default'
                    size='lg'
                    onClick={() => {
                        handleClose();
                    }}
                >
                    나가기
                </Button>
            </div>
        </SwModal>
    );
};

export default PayDialog;
