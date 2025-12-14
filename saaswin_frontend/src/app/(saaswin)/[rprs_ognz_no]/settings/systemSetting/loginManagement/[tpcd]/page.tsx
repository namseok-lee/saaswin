'use client';
import dynamic from 'next/dynamic';
// import Ssw01 from 'views/ssw01/ssw01';
const LoginManagement = dynamic(() => import('views/settings/systemSetting/loginMangement/LoginManagement'), {
    ssr: false,
});

export default function LoginManagement_page({ params }: { params: { tpcd: string } }) {
    const { tpcd } = params;
    return <LoginManagement tpcd={tpcd as string} />;
}
