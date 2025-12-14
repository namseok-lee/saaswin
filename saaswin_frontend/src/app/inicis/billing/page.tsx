'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

// const InicisReturn = dynamic(() => import('views/inicis/billing'), {
//     ssr: false,
// });

export default function InicisReturnPage() {
    // const searchParams = useSearchParams();

    // useEffect(() => {
    //     if (!searchParams) return;
    //     const resultCode = searchParams.get('resultCode');
    //     const resultMsg = searchParams.get('resultMsg');
    //     const tid = searchParams.get('tid');

    //     console.log('이니시스 결제 결과:', {
    //         resultCode,
    //         resultMsg,
    //         tid,
    //     });

    //     if (resultCode === '0000') {
    //         alert('결제가 성공적으로 완료되었습니다.');
    //         // TODO: 백엔드에 승인 요청 전송
    //     } else {
    //         alert(`결제 실패: ${resultMsg}`);
    //     }
    // }, []); // ✅ 불필요한 의존성 제거

    return <div>결제 결과를 확인 중입니다...</div>;
}
