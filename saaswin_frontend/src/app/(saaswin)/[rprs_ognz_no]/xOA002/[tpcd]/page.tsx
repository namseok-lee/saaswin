import dynamic from 'next/dynamic';

const XOA002 = dynamic(() => import('views/xOA002/xOA002'), {
    ssr: false,
});

export default function XOA002page({ params }: { params: { tpcd: string } }) {
    const { tpcd } = params;
    return <XOA002 tpcdParam={tpcd as string} />;
}
