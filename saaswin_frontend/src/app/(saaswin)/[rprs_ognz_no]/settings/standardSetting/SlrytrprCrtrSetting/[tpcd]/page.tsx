'use client';
import dynamic from 'next/dynamic';
// import Ssw01 from 'views/ssw01/ssw01';
const SlrytrprCrtrSetting = dynamic(
    () => import('views/settings/systemSetting/slryTrprCrtrSetting/SlryTrprCrtrSetting'),
    {
        ssr: false,
    }
);

export default function SlrytrprCrtrSetting_page({ params }: { params: { tpcd: string } }) {
    const { tpcd } = params;
    return <SlrytrprCrtrSetting tpcd={tpcd as string} />;
}
