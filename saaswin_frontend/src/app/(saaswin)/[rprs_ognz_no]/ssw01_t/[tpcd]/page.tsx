'use client';
import dynamic from 'next/dynamic';
const GridTab = dynamic(() => import('views/sys01/gridTab'), {
    ssr: false,
});

export default function TabPage01({ params }: { params: { tpcd: string } }) {
    const { tpcd } = params;
    return <GridTab tpcd={tpcd as string} />;
}
