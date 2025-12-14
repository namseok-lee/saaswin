'use client';
import dynamic from 'next/dynamic';
// import Ssw01 from 'views/ssw01/ssw01';
const Ssw01_tb = dynamic(() => import('views/table/ssw01_tb'), {
    ssr: false,
});

export default function Ssw01page({ params }: { params: { tpcd: string } }) {
    const { tpcd } = params;
    return <Ssw01_tb tpcdParam={tpcd as string} />;
}
