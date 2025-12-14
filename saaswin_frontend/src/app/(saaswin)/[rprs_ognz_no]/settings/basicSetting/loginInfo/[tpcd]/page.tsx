'use client';
import dynamic from 'next/dynamic';
// import Ssw01 from 'views/ssw01/ssw01';views/settings/basicSetting/loginInfo/MyInfo
const MyInfo = dynamic(() => import('views/settings/basicSetting/loginInfo/MyInfo'), {
    ssr: false,
});

export default function LoginInfo_page({ params }: { params: { tpcd: string } }) {
    const { tpcd } = params;
    return <MyInfo tpcd={tpcd as string} />;
}
