'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
    const router = useRouter();

    // auth 객체에서 rprsOgnzNo 값을 추출하는 함수
    const extractRprsOgnzNoFromAuth = (): string => {
        try {
            const authJson = localStorage.getItem('auth');
            if (!authJson) return '';

            const auth = JSON.parse(authJson);
            return auth?.state?.rprsOgnzNo || '';
        } catch (error) {
            console.error('[루트 페이지] auth 객체에서 rprsOgnzNo 추출 중 오류:', error);
            return '';
        }
    };

    // 클라이언트 사이드에서만 실행되는 리다이렉션 로직
    useEffect(() => {
        // 브라우저 환경인지 확인
        if (typeof window === 'undefined') return;

        // localStorage에서 필요한 값들 확인
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const auth = localStorage.getItem('auth');

        console.log('[루트 페이지] 인증 상태 확인:', {
            accessToken: !!accessToken,
            refreshToken: !!refreshToken,
            auth: !!auth,
        });

        // 모든 값이 존재하는 경우
        //if (accessToken && refreshToken && auth) {
        if (auth) {
            try {
                // auth 객체에서 rprsOgnzNo 추출
                const rprsOgnzNo = extractRprsOgnzNoFromAuth() || 'WIN';

                console.log('[루트 페이지] 인증됨, 리다이렉션:', rprsOgnzNo);
                router.replace(`/${rprsOgnzNo}/home`);
            } catch (error) {
                console.error('[루트 페이지] auth 파싱 오류:', error);
                router.replace('/auth');
            }
        } else {
            // 하나라도 없는 경우
            console.log('[루트 페이지] 인증 정보 부족, 로그인 페이지로 이동');
            router.replace('/auth');
        }
    }, [router]);

    // 리다이렉션 전에 빈 화면 또는 로딩 표시 (선택 사항)
    return (
        <div className='flex items-center justify-center h-screen bg-gray-100'>
            <div className='text-center'>
                <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto'></div>
                <p className='mt-4 text-gray-600'>로딩 중...</p>
            </div>
        </div>
    );
}
