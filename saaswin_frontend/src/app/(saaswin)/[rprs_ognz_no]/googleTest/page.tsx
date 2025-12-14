'use client';
import dynamic from 'next/dynamic';
const GoogleTest = dynamic(() => import('views/googleTest/googleTest'), {
    ssr: false,
});

export default function GoogleTestpage() {
    return <GoogleTest />;
}
