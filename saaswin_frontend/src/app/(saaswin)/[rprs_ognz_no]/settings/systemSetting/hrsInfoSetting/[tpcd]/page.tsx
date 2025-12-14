'use client';
import dynamic from 'next/dynamic';
// import Ssw01 from 'views/ssw01/ssw01';
const HrsInfoSetting = dynamic(() => import('views/settings/systemSetting/hrsInfoSetting/HrsInfoSetting'), {
    ssr: false,
});

export default function HrsInfoSetting_page({ params }: { params: { tpcd: string } }) {
    const { tpcd } = params;
    return <HrsInfoSetting tpcd={tpcd as string} />;
}
