// src/components/I18nInitializer.tsx
'use client';

import { initializeI18n } from 'i18n/i18n';
import { useEffect } from 'react';

export default function I18nInitializer() {
    useEffect(() => {
        // 클라이언트에서만 실행
        initializeI18n();
    }, []);

    return null; // 아무것도 렌더링하지 않음
}
