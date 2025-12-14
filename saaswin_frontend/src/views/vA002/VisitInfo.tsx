import React, { useRef } from 'react';

export function VisitInfo<T extends keyof JSX.IntrinsicElements>(Element: T, tpcd: string) {
    return function VisitTrackedElement(props: JSX.IntrinsicElements[T]) {
        const ref = useRef<HTMLElement>(null);

        const getOs = () => {
            const { userAgent, platform } = window.navigator;
            const macos = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
            const windows = ['Win32', 'Win64', 'Windows', 'WinCE'];
            const ios = ['iPhone', 'iPad', 'iPod'];

            if (macos.includes(platform)) return 'macOS';
            if (ios.includes(platform) || /iPhone|iPad|iPod/.test(userAgent)) return 'iOS';
            if (windows.includes(platform)) {
                if (userAgent.includes('Windows NT 10.0')) return 'Windows 10/11';
                if (userAgent.includes('Windows NT 6.1')) return 'Windows 7';
                return 'Windows (Unknown)';
            }
            if (/Android/.test(userAgent)) return 'Android';
            if (/Linux/.test(platform) || /Linux/.test(userAgent)) return 'Linux';
            return 'Unknown';
        };

        const getBrowser = () => {
            const ua = navigator.userAgent;
            const vendor = navigator.vendor;

            if (/Edg\//.test(ua)) return 'Edge';
            if (/OPR\//.test(ua)) return 'Opera';
            if (/Chrome/.test(ua) && /Google Inc/.test(vendor)) return 'Chrome';
            if (/Safari/.test(ua) && /Apple Computer/.test(vendor)) return 'Safari';
            if (/Firefox/.test(ua)) return 'Firefox';
            return 'Unknown';
        };

        const getMenuNo = tpcd;

        const handleClick = (e: any) => {
            const visitData = {
                BTN: ref.current?.textContent,
                OS: getOs(),
                BROWSER: getBrowser(),
                MENU: getMenuNo,
            };
            // console.log(visitData);

            if (typeof props.onClick === 'function') {
                props.onClick(e);
            }
        };

        return React.createElement(Element, {
            ...props,
            onClick: handleClick,
            ref,
        });
    };
}
