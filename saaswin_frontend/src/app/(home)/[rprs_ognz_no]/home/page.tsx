'use client';

import { useParams } from 'next/navigation';
import Home from 'views/home/home';
import MainLayout from '../../../layout/mainLayout';

export default function HomePageWithRprsOgnzNo() {
    const params = useParams();
    const rprsOgnzNo = params?.rprsOgnzNo as string;

    // URL의 rprsOgnzNo 값 로깅 (디버깅용)
    console.log('[홈 페이지] URL rprsOgnzNo:', rprsOgnzNo);

    return (
        <MainLayout>
            <Home />
        </MainLayout>
    );
}
