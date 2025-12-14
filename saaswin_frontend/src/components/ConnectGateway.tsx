'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ConnectGateway() {
    const router = useRouter();

    useEffect(() => {
        try {
            // localStorage에서 auth 데이터 가져오기
            const authData = localStorage.getItem('auth');
            console.log('authData:', authData); // 1. 데이터 확인

            if (authData) {
                const parsedAuth = JSON.parse(authData);
                const rprsOgnzNo = parsedAuth.state?.rprsOgnzNo;

                if (rprsOgnzNo) {
                    router.replace(`${rprsOgnzNo}/settings/basicSetting/loginInfo/SB001`);
                }
            }
            console.log('auth 데이터 없음');
        } catch (error) {
            console.error('localStorage 파싱 에러:', error);
            router.replace('/settings/basicSetting/loginInfo/SB001');
        }
    }, [router]);

    return <div>페이지 이동 중...</div>;
}
