'use client';
import dynamic from 'next/dynamic';
const MyInfoComponent = dynamic(() => import('views/settings/basicSetting/loginInfo/MyInfo'), {
    ssr: false,
});

export default function MyInfo() {
    return <MyInfoComponent />;
}
