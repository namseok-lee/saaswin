/** @type {import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: false,
    eslint: {
        ignoreDuringBuilds: true, // 빌드 중 ESLint 검사 무시
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    i18n: {
        locales: ['en', 'ko', 'zh', 'ja'], // 지원하는 언어들\
        defaultLocale: 'ko', // 'default'    // 기본 언어
        localeDetection: false, // 언어 자동 감지 비활성화
    },
    //reloadOnPrerender: true,
    webpack(config) {
        config.module.rules.push({
            test: /\.svg$/,
            use: ['@svgr/webpack'], // ✅ SVG를 React 컴포넌트로 변환
        });
        // Promise.withResolvers 폴리필 추가
        if (typeof Promise.withResolvers === 'undefined') {
            config.resolve.fallback = {
                ...config.resolve.fallback,
            };

            // 진입점에 폴리필 코드 삽입
            const originalEntry = config.entry;
            config.entry = async () => {
                const entries = await originalEntry();

                // 폴리필 코드를 포함하는 가상 모듈 생성
                const polyfillCode = `
                if (typeof Promise.withResolvers === 'undefined') {
                    Promise.withResolvers = function() {
                        let resolve, reject;
                        const promise = new Promise((res, rej) => {
                            resolve = res;
                            reject = rej;
                        });
                        return { promise, resolve, reject };
                    };
                }
            `;
                // entries['main.js']가 존재하는지 확인 후 unshift 호출
                if (entries['main.js'] && Array.isArray(entries['main.js'].import)) {
                    entries['main.js'].import.unshift('./polyfills.js'); // 또는 필요한 파일 경로
                } else if (entries['main.js']) {
                    // entries['main.js']가 있지만 import 속성이 배열이 아닌 경우
                    entries['main.js'] = {
                        import: [
                            './polyfills.js',
                            ...(Array.isArray(entries['main.js']) ? entries['main.js'] : [entries['main.js']]),
                        ],
                    };
                }

                return entries;
            };
        }

        return config;
    },
    // reloadOnPrerender: true,
    async rewrites() {
        console.log('NEXT_PUBLIC_API_URL : ', process.env.NEXT_PUBLIC_API_URL);
        return [
            {
                source: '/api/:path*',
                destination: `${process.env.NEXT_PUBLIC_SSW_API_URL}/api/:path*`,
            },
        ];
    },
    env: {
        NEXT_PUBLIC_ENV: process.env.NODE_ENV,
    },
    images: {
        domains: ['www.h5on.com'],
    },

    // modularizeImports: {
    //   '@mui/material': {
    //     transform: '@mui/material/{{member}}'
    //   },
    //   '@mui/lab': {
    //     transform: '@mui/lab/{{member}}'
    //   }
    // },
    // images: {
    //   remotePatterns: [
    //     {
    //       protocol: 'https',
    //       hostname: 'flagcdn.com',
    //       pathname: '**'
    //     }
    //   ]
    // },
    // env: {
    //   NEXT_APP_VERSION: process.env.REACT_APP_VERSION,
    //   NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET_KEY,
    //   NEXTAUTH_SECRET_KEY: process.env.NEXTAUTH_SECRET_KEY,
    //   NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    //   NEXT_APP_API_URL: process.env.REACT_APP_API_URL,
    //   NEXT_APP_JWT_SECRET: process.env.REACT_APP_JWT_SECRET,
    //   NEXT_APP_JWT_TIMEOUT: process.env.REACT_APP_JWT_TIMEOUT,
    //   NEXT_APP_GOOGLE_MAPS_API_KEY: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    //   NEXT_APP_MAPBOX_ACCESS_TOKEN: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN
    // }
};

export default nextConfig;
