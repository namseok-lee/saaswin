'use client';
import dynamic from 'next/dynamic';
const LoginManagement = dynamic(() => import('views/settings/systemSetting/loginMangement/LoginManagement'), {
    ssr: false,
});

export default function management() {
    return <LoginManagement />;
}
