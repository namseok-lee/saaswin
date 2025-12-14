'use client';
import dynamic from 'next/dynamic';
const ConnectGateway = dynamic(() => import('views/connectGateway/ConnectGateway'), {
    ssr: false,
});

export default function connectGatewayPage() {
    return <ConnectGateway />;
}
