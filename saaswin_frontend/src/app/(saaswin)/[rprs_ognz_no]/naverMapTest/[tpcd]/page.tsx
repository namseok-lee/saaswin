'use client';
import dynamic from 'next/dynamic';
const NaverMapTest = dynamic(() => import('views/naverMapTest/naverMapTest'), {
    ssr: false,
});

export default function NaverMapTestpage({ params }: { params: { tpcd: string } }) {
    const { tpcd } = params;
    return <NaverMapTest />;
}
