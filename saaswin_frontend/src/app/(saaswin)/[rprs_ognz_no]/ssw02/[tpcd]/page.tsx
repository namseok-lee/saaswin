'use client';
import dynamic from 'next/dynamic';
const Ssw02 = dynamic(() => import('views/ssw02/ssw02'), {
    ssr: false,
});

export default function Ssw02page({ params }: { params: { tpcd: string } }) {
    const { tpcd } = params;
    return <Ssw02 tpcd={tpcd as string} />;
}
