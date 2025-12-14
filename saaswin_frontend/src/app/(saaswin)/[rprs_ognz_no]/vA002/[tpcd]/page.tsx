'use client';
import dynamic from 'next/dynamic';
const VA002 = dynamic(() => import('views/vA002/vA002'), {
    ssr: false,
});

export default function Chartpage({ params }: { params: { tpcd: string } }) {
    const { tpcd } = params;
    return <VA002 tpcd={tpcd as string} />;
}
