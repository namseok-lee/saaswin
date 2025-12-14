'use client';
import dynamic from 'next/dynamic';
const Ssw01_tg = dynamic(() => import('views/ssw01/ssw01_tg'), {
    ssr: false,
});

export default function Ssw01page({ params }: { params: { tpcd: string } }) {
    const { tpcd } = params;
    return <Ssw01_tg tpcd={tpcd as string} />;
}
