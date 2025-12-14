// 'use client';

// import { useEffect } from 'react';
// import { usePathname, useRouter } from 'next/navigation';
// import { getRprsOgnzNo, addRprsOgnzNoToPath, extractRprsOgnzNoFromAuth } from '../utils/rprsOgnzNoUtils';

// // 리다이렉션을 건너뛸 경로 정의
// const EXCLUDED_PATHS = ['/', '/login', '/api', '/favicon.ico', '/_next', '/images', '/styles'];

// export default function RprsOgnzRedirector() {
//     const pathname = usePathname();
//     const router = useRouter();

//     // 컴포넌트가 마운트될 때 auth 객체에서 값을 쿠키와 동기화
//     useEffect(() => {
//         // 서버 사이드 렌더링 중이면 실행하지 않음
//         if (typeof window === 'undefined') return;

//         // auth 객체에서 rprsOgnzNo 값을 확인하고 쿠키와 동기화
//         // getRprsOgnzNo 함수는 내부적으로 auth, 로컬스토리지, 쿠키 간 동기화를 처리함
//         const value = getRprsOgnzNo();

//         console.log('RprsOgnzRedirector 초기화:', {
//             authValue: extractRprsOgnzNoFromAuth(),
//             syncedValue: value,
//         });
//     }, []);

//     useEffect(() => {
//         // 서버 사이드 렌더링 중이거나 pathname이 null인 경우 실행하지 않음
//         if (typeof window === 'undefined' || pathname === null) return;

//         // 제외 경로인 경우 리다이렉션하지 않음
//         if (EXCLUDED_PATHS.some((path) => pathname === path || pathname.startsWith(path + '/'))) {
//             return;
//         }

//         // 첫 번째 경로 세그먼트 추출
//         const pathSegments = pathname.split('/').filter(Boolean);

//         if (pathSegments.length > 0) {
//             const firstSegment = pathSegments[0];

//             // auth 객체, 로컬스토리지, 쿠키에서 rprsOgnzNo 값 가져오기
//             const savedRprsOgnzNo = getRprsOgnzNo();

//             // 저장된 rprsOgnzNo가 없으면 리다이렉션하지 않음
//             if (!savedRprsOgnzNo) {
//                 console.log('저장된 rprsOgnzNo 없음, 리다이렉션 생략');
//                 return;
//             }

//             // 이미 저장된 rprsOgnzNo가 URL에 있으면 리다이렉션하지 않음
//             if (firstSegment === savedRprsOgnzNo) {
//                 return;
//             }

//             // ssw로 시작하는 경로이면 저장된 rprsOgnzNo를 앞에 추가하여 리다이렉션
//             if (firstSegment.startsWith('ssw')) {
//                 const newPath = addRprsOgnzNoToPath(pathname);
//                 console.log(`클라이언트 리다이렉션: ${pathname} -> ${newPath}`);
//                 router.replace(newPath);
//             }
//         }
//     }, [pathname, router]);

//     // 이 컴포넌트는 UI를 렌더링하지 않습니다
//     return null;
// }
