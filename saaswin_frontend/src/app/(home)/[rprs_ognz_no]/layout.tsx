'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

// [rprsOgnzNo] 경로를 위한 레이아웃
export default function RprsOgnzNoLayout({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const router = useRouter();
    const rprsOgnzNo = params?.rprsOgnzNo as string;

    // auth 객체에서 rprsOgnzNo 값을 추출하는 함수
    const extractRprsOgnzNoFromAuth = (): string => {
        try {
            const authJson = localStorage.getItem('auth');
            if (!authJson) return '';

            const auth = JSON.parse(authJson);
            return auth?.state?.rprsOgnzNo || '';
        } catch (error) {
            console.error('[rprsOgnzNo 레이아웃] auth 객체에서 rprsOgnzNo 추출 중 오류:', error);
            return '';
        }
    };

    // 인증 확인 및 rprsOgnzNo 검증
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // localStorage에서 인증 정보 확인
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const auth = localStorage.getItem('auth');

        console.log('[rprsOgnzNo 레이아웃] 인증 상태 확인:', {
            현재경로: rprsOgnzNo,
            accessToken: !!accessToken,
            refreshToken: !!refreshToken,
            auth: !!auth,
        });

        // 인증 정보가 하나라도 없으면 /auth로 리다이렉션
        //if (!accessToken || !refreshToken || !auth) {
        if (!auth) {
            console.log('[rprsOgnzNo 레이아웃] 인증 정보 부족, 로그인 페이지로 리다이렉션');
            router.replace('/auth');
            return;
        }

        // auth 객체에서 rprsOgnzNo 확인 및 URL과 일치 여부 체크
        try {
            const authRprsOgnzNo = extractRprsOgnzNoFromAuth();

            console.log('[rprsOgnzNo 레이아웃] rprsOgnzNo 비교:', {
                URL: rprsOgnzNo,
                Auth: authRprsOgnzNo,
            });

            // auth에 rprsOgnzNo가 없거나 URL의 rprsOgnzNo와 다른 경우
            // 여기서는 추가 검증 로직 구현 가능 (예: 권한 체크 등)
        } catch (error) {
            console.error('[rprsOgnzNo 레이아웃] auth 파싱 오류:', error);
            router.replace('/auth');
        }
    }, [rprsOgnzNo, router]);

    // 레이아웃은 자식 컴포넌트를 렌더링
    return children;
}
