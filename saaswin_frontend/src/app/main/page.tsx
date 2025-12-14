'use client';
import dynamic from 'next/dynamic';
const Main = dynamic(() => import('views/main/main'), {
    ssr: false,
});

export default function mainpage() {
    return <Main />;
}
