// utils/clientEnv.ts

export const getOs = (): string => {
    if (typeof window === 'undefined') return 'Unknown';

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

export const getBrowser = (): string => {
    if (typeof window === 'undefined') return 'Unknown';

    const ua = navigator.userAgent;
    const vendor = navigator.vendor;

    if (/Edg\//.test(ua)) return 'Edge';
    if (/OPR\//.test(ua)) return 'Opera';
    if (/Chrome/.test(ua) && /Google Inc/.test(vendor)) return 'Chrome';
    if (/Safari/.test(ua) && /Apple Computer/.test(vendor)) return 'Safari';
    if (/Firefox/.test(ua)) return 'Firefox';

    return 'Unknown';
};
export const getIp = async () => {
    const ipv4 = await fetch('https://api.ipify.org?format=json')
        .then((res) => res.json())
        .then((data) => data.ip)
        .catch(() => null);
    const ipv6 = await fetch('https://api64.ipify.org?format=json')
        .then((res) => res.json())
        .then((data) => data.ip)
        .catch(() => null);
    return {
        ipv4: ipv4 ?? '',
        ipv6: ipv6 ?? '',
    };
};
