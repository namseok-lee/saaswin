'use client';
import dynamic from 'next/dynamic';
const Ssw01_k = dynamic(() => import('views/ssw01/ssw01_k'), {
    ssr: false,
});

export default function TabPage01({ params }: { params: { tpcd: string } }) {
    const { tpcd } = params;
    return <Ssw01_k tpcd={tpcd as string} />;
}
