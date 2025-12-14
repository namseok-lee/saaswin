import dynamic from 'next/dynamic';

const XOA001 = dynamic(() => import('views/xOA001/xOA001'), {
    ssr: false,
});

export default function XOA001page({ params }: { params: { tpcd: string } }) {
    const { tpcd } = params;
    return <XOA001 tpcdParam={tpcd as string} />;
}
