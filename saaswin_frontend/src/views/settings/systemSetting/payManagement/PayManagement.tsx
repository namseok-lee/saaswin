'use client';

import Button from '@/components/Button';
import Loader from '@/components/Loader';
import { fetcherGetInicisPay } from '@/utils/axios';
import { fetcherPostData } from '@/utils/axios';
import { Box } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

export default function PayManagement() {
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);
    const [billingKey, setBillingKey] = useState<string>('');
    const [isBillingKeyIssued, setIsBillingKeyIssued] = useState(false);
    const [paymentHistory, setPaymentHistory] = useState<any[]>([]);

    const auth = JSON.parse(localStorage.getItem('auth') ?? '{}');
    const languageView = auth?.state?.languageView ?? 'ko';
    const userNo = auth?.state?.userNo ?? '';
    const rprsOgnzNo = auth?.state?.rprsOgnzNo ?? '';
    const formRef = useRef<HTMLFormElement>(null);

    // 빌링키 발급 요청
    const handleBillingKeyRequest = () => {
        console.log('🔍 빌링키 발급 요청 시작');
        console.log('window.INIStdPay:', window?.INIStdPay);
        console.log('formRef.current:', formRef.current);
        
        if (!window?.INIStdPay) {
            alert('결제 모듈이 아직 로드되지 않았습니다.');
            return;
        }
        if (!formRef.current) {
            alert('결제 폼을 찾을 수 없습니다.');
            return;
        }
        
        try {
            console.log('📋 폼 내용 확인:', formRef.current.innerHTML);
            console.log('📋 폼 ID:', formRef.current.id);
            
            // 폼이 제대로 구성되었는지 확인
            const formInputs = formRef.current.querySelectorAll('input[type="hidden"]');
            if (formInputs.length === 0) {
                alert('결제 폼이 제대로 구성되지 않았습니다. 페이지를 새로고침해주세요.');
                return;
            }
            
            console.log('🚀 INIStdPay.pay() 호출 시작');
            window.INIStdPay.pay(formRef.current.id);
            console.log('✅ INIStdPay.pay() 호출 완료');
            
        } catch (error: any) {
            console.error('❌ 결제창 실행 오류:', error);
            alert('결제창 실행 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류'));
        }
    };

    // 실제 정기결제 수행
    const handleRecurringPayment = async () => {
        if (!billingKey) {
            alert('먼저 빌링키를 발급받아주세요.');
            return;
        }

        try {
            console.log('💳 정기결제 시작:', billingKey);
            
            // 정기결제 요청 파라미터
            const paymentParams = {
                billingKey: billingKey,
                amount: 1000,
                orderId: `ORDER_${Date.now()}`,
                orderName: '화이트정보통신 정기결제',
                customerName: '최연수',
                customerEmail: 'dustn0234@win.co.kr',
                customerTel: '010-1234-5678',
                languageView,
                // 정기결제 전용 파라미터
                version: "1.0",
                charset: "UTF-8",
                currency: "WON",
                acceptmethod: "BILLPAY(Card)", // 빌링키로 결제
            };

            console.log('📤 정기결제 요청 파라미터:', paymentParams);
            
            // TODO: 실제 정기결제 API 호출
            // const paymentResult = await fetcherPostRecurringPayment(paymentParams);
            
            // 임시로 성공 메시지 표시
            alert('정기결제가 성공적으로 처리되었습니다.');
            
            // 결제 내역에 추가
            const newPayment = {
                id: Date.now(),
                orderId: paymentParams.orderId,
                amount: paymentParams.amount,
                status: '성공',
                date: new Date().toLocaleString(),
                billingKey: billingKey.substring(0, 8) + '****'
            };
            
            setPaymentHistory(prev => [newPayment, ...prev]);
            
        } catch (error: any) {
            console.error('❌ 정기결제 오류:', error);
            alert('정기결제 처리 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류'));
        }
    };

    // 빌링키 발급 완료 처리
    const handleBillingKeyIssued = (key: string) => {
        setBillingKey(key);
        setIsBillingKeyIssued(true);
        alert('빌링키가 성공적으로 발급되었습니다. 이제 정기결제를 테스트할 수 있습니다.');
    };

    // 빌링키 삭제
    const handleDeleteBillingKey = () => {
        if (confirm('빌링키를 삭제하시겠습니까?')) {
            setBillingKey('');
            setIsBillingKeyIssued(false);
            alert('빌링키가 삭제되었습니다.');
        }
    };

    useEffect(() => {
        // 이니시스 스크립트 로드 (빌링 결제용)
        const script = document.createElement('script');
        script.src = 'https://stdpay.inicis.com/stdjs/INIStdPay.js';
        script.async = true;
        script.onload = () => {
            setIsScriptLoaded(true);
            console.log('✅ 이니시스 스크립트 로드 완료');
        };
        script.onerror = () => {
            console.error('❌ 이니시스 스크립트 로드 실패');
        };
        document.body.appendChild(script);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (!userNo || !rprsOgnzNo) return;
            try {
                // 결제 정보 조회 (빌링 결제용)
                const payParams = {
                    buyername: '최연수',
                    goodname: '화이트정보통신 데모신청',
                    buyertel: '010-1234-5678',
                    buyeremail: 'dustn0234@win.co.kr',
                    languageView,
                    price: 1000,
                    // 빌링 결제 전용 파라미터
                    version: "1.0",
                    gopaymethod: "", // 빈값으로 세팅
                    use_chkfake: "Y", // PC결제 보안강화 사용
                    offerPeriod: "Y2", // 연 자동결제
                    charset: "UTF-8",
                    currency: "WON",
                    acceptmethod: "BILLAUTH(Card):CLOSE:va_receipt:below1000", // 빌링키 발급 + 취소 시 창 닫기 + 추가 옵션
                    // URL 파라미터는 서버에서 처리하도록 제거
                };

                console.log('📤 빌링 결제 요청 파라미터:', payParams);
                const inicisData = await fetcherGetInicisPay(payParams);
                console.log('✅ 결제 정보:', inicisData);
                
                // 서버 응답 구조 확인 - resData가 없으면 직접 사용
                if (!inicisData) {
                    console.error('❌ 결제 정보가 없습니다:', inicisData);
                    alert('결제 정보를 가져오는데 실패했습니다. 관리자에게 문의해주세요.');
                    return;
                }

                const form = formRef.current;
                if (!form) return;
                form.innerHTML = '';
                
                // 이니시스 파라미터 추가 및 로깅
                const payInfo = inicisData.resData || inicisData; // resData가 없으면 직접 사용
                console.log('🔍 이니시스 빌링 파라미터:', payInfo);
                
                // 필수 파라미터 확인 (빌링 결제용)
                const requiredParams = ['mid', 'oid', 'price', 'timestamp', 'signature', 'verification', 'mKey'];
                const missingParams = requiredParams.filter(param => !payInfo[param]);
                
                if (missingParams.length > 0) {
                    console.error('❌ 필수 파라미터 누락:', missingParams);
                    alert(`결제에 필요한 정보가 누락되었습니다: ${missingParams.join(', ')}`);
                    return;
                }

                // 폼 설정 (빌링 결제용)
                form.method = 'post';
                form.acceptCharset = 'UTF-8';
                form.action = 'https://iniweb.inicis.com/bill/popup/billing.ini';
                form.target = '_blank'; // 새 창에서 열기
                form.style.display = 'none'; // 기본적으로 숨김

                Object.entries(payInfo).forEach(([key, value]) => {
                    console.log(`파라미터 추가: ${key} = ${value}`);
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = String(value);
                    form.appendChild(input);
                });

                // 폼 데이터 확인
                const formData = new FormData(form);
                console.log('📋 빌링 폼 데이터 확인:', Object.fromEntries(formData));
                console.log('📋 폼 HTML:', form.outerHTML);
                
                // 폼이 제대로 구성되었는지 확인
                const formInputs = form.querySelectorAll('input[type="hidden"]');
                console.log('📋 폼에 추가된 input 개수:', formInputs.length);
                formInputs.forEach((input, index) => {
                    const inputElement = input as HTMLInputElement;
                    console.log(`📋 Input ${index + 1}:`, inputElement.name, '=', inputElement.value);
                });
            } catch (err) {
                console.error('❌ 데이터 조회 중 오류 발생:', err);
            }
        };

        fetchData();
    }, []);

    if (!isScriptLoaded) return <Loader />;
    
    return (
        <div style={{ padding: '20px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#000000', marginBottom: '20px' }}>
                이니시스 빌링 결제 테스트
            </h2>
            
            {/* 빌링키 발급 섹션 */}
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '15px', color: '#333' }}>1단계: 빌링키 발급</h3>
                <p style={{ marginBottom: '20px', color: '#666' }}>
                    정기결제를 위한 빌링키를 발급받습니다. (실제 결제는 발생하지 않습니다)
                </p>
                
                <Box display='flex' justifyContent='center' gap={2}>
                    <Button
                        id='btnBillingKey'
                        type='primary'
                        size='lg'
                        className='btnWithIcon'
                        onClick={() => handleBillingKeyRequest()}
                        disabled={isBillingKeyIssued}
                    >
                        {isBillingKeyIssued ? '빌링키 발급 완료' : '빌링키 발급 요청'}
                    </Button>
                    
                    {isBillingKeyIssued && (
                        <Button
                            type='default'
                            size='lg'
                            onClick={() => handleDeleteBillingKey()}
                        >
                            빌링키 삭제
                        </Button>
                    )}
                </Box>
                
                {isBillingKeyIssued && (
                    <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#e8f5e8', borderRadius: '4px', border: '1px solid #4caf50' }}>
                        <p style={{ margin: '0', color: '#2e7d32', fontSize: '14px' }}>
                            ✅ 빌링키가 발급되었습니다. 이제 정기결제를 테스트할 수 있습니다.
                        </p>
                    </div>
                )}
            </div>

            {/* 정기결제 테스트 섹션 */}
            {isBillingKeyIssued && (
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
                    <h3 style={{ marginBottom: '15px', color: '#333' }}>2단계: 정기결제 테스트</h3>
                    <p style={{ marginBottom: '20px', color: '#666' }}>
                        발급받은 빌링키를 사용하여 실제 정기결제를 테스트합니다.
                    </p>
                    
                    <Box display='flex' justifyContent='center'>
                        <Button
                            id='btnRecurringPayment'
                            type='primary'
                            size='lg'
                            className='btnWithIcon'
                            onClick={() => handleRecurringPayment()}
                        >
                            정기결제 테스트 (1,000원)
                        </Button>
                    </Box>
                </div>
            )}

            {/* 결제 내역 섹션 */}
            {paymentHistory.length > 0 && (
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ marginBottom: '15px', color: '#333' }}>결제 내역</h3>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8f9fa' }}>
                                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>주문번호</th>
                                    <th style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>금액</th>
                                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>상태</th>
                                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>날짜</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paymentHistory.map((payment) => (
                                    <tr key={payment.id}>
                                        <td style={{ padding: '10px', borderBottom: '1px solid #dee2e6' }}>{payment.orderId}</td>
                                        <td style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>{payment.amount.toLocaleString()}원</td>
                                        <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>
                                            <span style={{ 
                                                padding: '4px 8px', 
                                                borderRadius: '4px', 
                                                backgroundColor: payment.status === '성공' ? '#d4edda' : '#f8d7da',
                                                color: payment.status === '성공' ? '#155724' : '#721c24',
                                                fontSize: '12px'
                                            }}>
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6', fontSize: '12px' }}>{payment.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <form
                ref={formRef}
                id='SendPayForm_id'
                style={{ display: 'none' }}
            />
        </div>
    );
}
