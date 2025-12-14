'use client';
import dynamic from 'next/dynamic';
const InviteManagement = dynamic(() => import('views/settings/systemSetting/inviteManagement/InviteManagement'), {
    ssr: false,
});

export default function inviteManagement() {
    return <InviteManagement />;
}
