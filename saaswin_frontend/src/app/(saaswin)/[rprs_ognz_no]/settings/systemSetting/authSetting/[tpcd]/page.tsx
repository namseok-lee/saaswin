'use client';
import dynamic from 'next/dynamic';
const AuthSetting = dynamic(() => import('views/settings/systemSetting/authSetting/AuthSetting'), {
    ssr: false,
});

export default function InviteManagement_page({ params }: { params: { tpcd: string } }) {
    return <AuthSetting />;
}
