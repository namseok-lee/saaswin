'use client';
import dynamic from 'next/dynamic';
const Ssw01_o = dynamic(() => import('views/ssw01/ssw01_o'), {
    ssr: false,
});

export default function TabPage01({ params }: { params: { tpcd: string } }) {
    const { tpcd } = params;
    return <Ssw01_o tpcd={tpcd as string} />;
}
