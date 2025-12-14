'use client';
import dynamic from 'next/dynamic';
const Ssw01_gt = dynamic(() => import('views/tab/ssw01_gt'), {
    ssr: false,
});

export default function TabPage01({ params }: { params: { tpcd: string } }) {
    const { tpcd } = params;
    return <Ssw01_gt tpcd={tpcd as string} />;
}
