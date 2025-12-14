'use client';
import dynamic from 'next/dynamic';
// import Ssw01 from 'views/ssw01/ssw01';
const InviteManagement = dynamic(() => import('views/settings/systemSetting/inviteManagement/InviteManagement'), {
    ssr: false,
});

export default function InviteManagement_page({ params }: { params: { tpcd: string } }) {
    const { tpcd } = params;
    return <InviteManagement tpcd={tpcd as string} />;
}
