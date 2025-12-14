'use client';
import dynamic from 'next/dynamic';
// import Ssw01 from 'views/ssw01/ssw01';
const SettingScreen = dynamic(() => import('views/settings/basicSetting/settingScreen/settingScreen'), {
    ssr: false,
});
export default function SettingScreen_page({ params }: { params: { tpcd: string } }) {
    const { tpcd } = params;
    return <SettingScreen tpcd={tpcd as string} />;
}
