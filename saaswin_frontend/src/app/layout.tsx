// src/app/layout.tsx
'use client';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { useEffect, useState } from 'react';
import '../../src/styles/styles.scss';
import './globals.css';
import dynamic from 'next/dynamic';

// 클라이언트 전용으로 컴포넌트 로드
const I18nInitializer = dynamic(() => import('../components/I18nInitializer'), {
    ssr: false, // 서버에서 렌더링하지 않음
});

// const RprsOgnzRedirector = dynamic(() => import('../components/RprsOgnzRedirector'), {
//     ssr: false, // 서버에서 렌더링하지 않음
// });

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState('blue');
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'blue';
        setTheme(savedTheme);

        // 동적으로 SCSS 파일 추가
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `/styles/_theme_${savedTheme}.css`; // 정적 CSS 파일을 참조
        document.head.appendChild(link);

        return () => {
            if (link.parentNode === document.head) {
                document.head.removeChild(link);
            }
        };
    }, []);

    useEffect(() => {
        const savedFontSize = localStorage.getItem('fontSize') || '14px';
        document.documentElement.style.fontSize = savedFontSize;
    }, []);

    return (
        <html lang='en'>
            <head>
                {/* next/script 컴포넌트 사용 (권장) */}
                <Script
                    src='https://stgstdpay.inicis.com/stdjs/INIStdPay.js'
                    strategy='beforeInteractive' // 로드 전략 선택 (필요에 따라 변경)
                    charSet='UTF-8'
                />
                {/* 운영 서버에서는 stgstdpay -> stdpay 로 변경 */}
            </head>
            <body data-theme={theme} className={`${theme} body ${inter.className}`}>
                {/* 리다이렉터 및 I18n 초기화 컴포넌트 추가 */}
                {/* <RprsOgnzRedirector /> */}
                <I18nInitializer />
                {children}
            </body>
        </html>
    );
}
