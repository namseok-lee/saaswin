'use client';
import dynamic from 'next/dynamic';
const Gateway = dynamic(() => import('views/gateway/gateway'), {
    ssr: false,
});

export default function gateWayPagepaga() {
    return <Gateway />;
}
