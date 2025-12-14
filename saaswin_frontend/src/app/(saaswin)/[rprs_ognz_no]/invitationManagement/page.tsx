'use client';
import dynamic from 'next/dynamic';
const InvitaionManagement = dynamic(() => import('views/invitationManagement/invitationManagement'), {
    ssr: false,
});

export default function invitationManagement() {
    return <InvitaionManagement />;
}
