'use client';
import dynamic from 'next/dynamic';
const Login = dynamic(() => import('views/login/login'), {
    ssr: false,
});

export default function loginpage() {
    return <Login />;
}
