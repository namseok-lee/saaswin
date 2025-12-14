// components/LayoutWrapper.tsx
'use client';

import { useEffect, useState, ReactNode } from 'react';
import Sidebar from 'components/Sidebar';
import { loadLanguage } from 'i18n/i18n';
import { useAuthStore } from 'utils/store/auth';
import { LayoutStyleContext } from './context/LayoutStyleContext';

export default function LayoutWrapper({ children }: { children: ReactNode }) {
    const { userNo } = useAuthStore();
    const [drawerOpen, setDrawerOpen] = useState(true);

    const [bgColor, setBgColor] = useState('#ffffff');
    const [padding, setPadding] = useState('0 30px 30px 198px'); // 기본 패딩

    useEffect(() => {
        const userLanguage = localStorage.getItem('userLanguage') || 'ko';
        loadLanguage(userLanguage, false);
    }, []);

    return (
        <LayoutStyleContext.Provider value={{ setBgColor, setPadding }}>
            <div
                style={{
                    display: 'flex',
                    height: '100vh',
                    width: '100vw',
                    padding: '0 0 0 50px',
                    backgroundColor: bgColor,
                    transition: 'background-color 0.3s ease',
                }}
            >
                <Sidebar drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />
                <div
                    style={{
                        width: '100%',
                        overflowY: 'auto',
                        padding: drawerOpen ? padding : '0px', // drawerOpen 상태에 따라 padding 적용
                        transition: 'padding 0.3s ease-in-out',
                    }}
                >
                    {children}
                </div>
            </div>
        </LayoutStyleContext.Provider>
    );
}
