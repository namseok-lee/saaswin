'use client';
import dynamic from 'next/dynamic';
// import Ssw01 from 'views/ssw01/ssw01';
const Ssw01_x = dynamic(() => import('views/ssw01/ssw01_x'), {
    ssr: false,
});

export default function Ssw01page({ params }: { params: { tpcd: string } }) {
    const { tpcd } = params;
    return <Ssw01_x tpcd={tpcd as string} />;
}
