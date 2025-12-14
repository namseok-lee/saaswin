'use client';
import dynamic from 'next/dynamic';
// import Ssw01 from 'views/ssw01/ssw01';
const PayManagement = dynamic(() => import('views/settings/systemSetting/payManagement/PayManagement'), {
    ssr: false,
});

export default function PayManagement_page({ params }: { params: { tpcd: string } }) {
    const { tpcd } = params;
    return <PayManagement tpcd={tpcd as string} />;
}
