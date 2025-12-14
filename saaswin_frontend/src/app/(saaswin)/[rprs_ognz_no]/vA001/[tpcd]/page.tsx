'use client';
import dynamic from 'next/dynamic';
const VA001 = dynamic(() => import('views/vA001/vA001'), {
    ssr: false,
});

export default function Chartpage() {
    return <VA001 />;
}
