'use client';
import dynamic from 'next/dynamic';
// const WelcomeForm = dynamic(() => import('views/welcomeForm/welcomeForm'), {
//     ssr: false,
// });

export default function welcomeForm() {
    return <div>welcomeForm</div>;
    // return <WelcomeForm />;
}
