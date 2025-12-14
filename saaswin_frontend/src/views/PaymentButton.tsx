// src/components/PaymentButton.tsx
'use client'; // 클라이언트 컴포넌트로 지정 (이벤트 핸들러 등 사용)

import React, { useState } from 'react';

// window 객체에 INIStdPay 타입 선언 (TypeScript 사용 시)
declare global {
    interface Window {
        INIStdPay?: {
            pay: (formId: string) => void;
        };
    }
}

const PaymentButton = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePayment = async () => {
        setIsLoading(true);
        setError(null);

        // 1. 결제 정보 준비 (예시)
        const orderDetails = {
            goodname: '테스트 상품',
            price: '1000', // 문자열로 전달해야 할 수 있음 (이니시스 문서 확인)
            buyername: '홍길동',
            buyertel: '010-1234-5678',
            buyeremail: 'test@example.com',
            // 주문번호는 고유하게 생성 (예: 서버에서 생성 후 전달받기)
            oid: `order_${new Date().getTime()}`,
        };

        try {
            // 2. 서버(백엔드)에 결제 준비 요청 (API Route 호출)
            const response = await fetch('/api/payments/prepare', {
                // 예시 API 경로
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderDetails),
            });

            if (!response.ok) {
                throw new Error('결제 준비에 실패했습니다.');
            }

            const serverData = await response.json(); // 서버에서 생성한 signature, timestamp 등 받기

            // 3. INIStdPay.pay() 호출 위한 최종 데이터 조합
            const paymentData = {
                ...orderDetails,
                mid: serverData.mid, // 서버에서 전달받은 MID (테스트/운영 구분)
                timestamp: serverData.timestamp, // 서버에서 생성
                signature: serverData.signature, // 서버에서 생성
                mKey: serverData.mKey, // 서버에서 생성 (해시값)
                returnUrl: serverData.returnUrl, // 서버에서 지정한 결과 처리 URL
                gopaymethod: 'Card', // 결제 수단 (예: Card, Vbank)
                offerPeriod: '20240101-20241231', // 필요시
                acceptmethod: 'HPP(1):no_receipt:va_receipt:vbanknoreg(0):below1000', // 필요시
                // ... 기타 필요한 파라미터 (이니시스 문서 확인) ...
            };

            // --- 결제 정보를 담을 숨겨진 폼 동적 생성 ---
            const form = document.createElement('form');
            form.id = 'paymentForm_id'; // 고유한 ID 부여
            form.name = 'paymentForm';
            form.method = 'POST';
            // action 속성은 INIStdPay.js가 내부적으로 처리하므로 설정 불필요
            document.body.appendChild(form);

            for (const key in paymentData) {
                if (Object.prototype.hasOwnProperty.call(paymentData, key)) {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    // value가 null이나 undefined가 아닌 경우만 할당
                    input.value = paymentData[key as keyof typeof paymentData] ?? '';
                    form.appendChild(input);
                }
            }
            // --- 폼 생성 완료 ---

            // 4. 이니시스 결제창 호출
            if (window.INIStdPay) {
                window.INIStdPay.pay(form.id);
            } else {
                throw new Error('이니시스 결제 모듈을 로드할 수 없습니다.');
            }

            // 성공적으로 호출 후 폼 제거 (선택 사항)
            // document.body.removeChild(form); // 결제창이 뜨고 나면 제거해도 됨
        } catch (err: any) {
            console.error('결제 처리 중 오류:', err);
            setError(err.message || '결제 중 오류가 발생했습니다.');
            // 실패 시 생성된 폼 제거
            const existingForm = document.getElementById('paymentForm_id');
            if (existingForm) {
                document.body.removeChild(existingForm);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <button onClick={handlePayment} disabled={isLoading}>
                {isLoading ? '결제 처리 중...' : '1000원 결제하기'}
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {/* 결제창 로딩을 위해 이 컴포넌트 내에 form 태그가 있을 필요는 없습니다. */}
            {/* 동적으로 생성해서 사용합니다. */}
        </div>
    );
};

export default PaymentButton;
