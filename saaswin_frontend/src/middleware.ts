import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// // 로컬스토리지/쿠키 키 (유틸리티와 일치시키기)
// const RPRS_OGNZ_NO_KEY = 'rprsOgnzNo';

// // 다음 경로들은 리다이렉션하지 않음
// const EXCLUDED_PATHS = ['/', '/login', '/api', '/favicon.ico', '/_next', '/images', '/styles'];

// // 리다이렉션을 건너뛸 전체 경로
// const EXCLUDED_FULL_PATHS = ['/WIN', '/HR001', '/FIN']; // 대문자로 변경

// // 첫 번째Prefix와 rprsOgnzNo 매핑 관계 정의 (실제 사용시 주석 해제)
// const PREFIX_TO_RPRSOGNZNO: Record<string, string> = {
//     ssw: 'WIN', // ssw -> WIN으로 매핑
//     efs_apply_form_list: 'HR001', // efs_apply_form_list -> HR001로 매핑
//     hrd: 'HR001', // hrd -> HR001로 매핑
//     fin: 'FIN', // fin -> FIN으로 매핑
// };

// export function middleware(request: NextRequest) {
//     const url = request.nextUrl.clone();
//     const { pathname } = url;

//     // 쿠키에서 rprsOgnzNo 값 가져오기
//     const rprsOgnzNoCookie = request.cookies.get(RPRS_OGNZ_NO_KEY);

//     // 쿠키에 rprsOgnzNo 값이 없으면 리다이렉션하지 않음
//     if (!rprsOgnzNoCookie || !rprsOgnzNoCookie.value) {
//         console.log(`[Middleware] 쿠키에 ${RPRS_OGNZ_NO_KEY} 없음, 리다이렉션 생략`);
//         return NextResponse.next();
//     }

//     const rprsOgnzNo = rprsOgnzNoCookie.value;
//     console.log(`[Middleware] 쿠키 ${RPRS_OGNZ_NO_KEY}:`, rprsOgnzNo);

//     // 제외 전체 경로인 경우 리다이렉션하지 않음
//     if (EXCLUDED_FULL_PATHS.includes(pathname)) {
//         return NextResponse.next();
//     }

//     // 제외 경로로 시작하는 경우 리다이렉션하지 않음
//     if (EXCLUDED_PATHS.some((path) => pathname === path || pathname.startsWith(path + '/'))) {
//         return NextResponse.next();
//     }

//     // 첫 번째 세그먼트 추출
//     const pathSegments = pathname.split('/').filter(Boolean);

//     if (pathSegments.length > 0) {
//         const firstSegment = pathSegments[0];

//         // 이미 rprsOgnzNo가 URL에 있으면 리다이렉션하지 않음
//         if (firstSegment === rprsOgnzNo) {
//             return NextResponse.next();
//         }

//         // 매핑 테이블 활용: 첫 번째 세그먼트가 PREFIX_TO_RPRSOGNZNO의 키로 시작하는지 확인
//         for (const [prefix, targetRprsOgnzNo] of Object.entries(PREFIX_TO_RPRSOGNZNO)) {
//             if (firstSegment.startsWith(prefix)) {
//                 // 쿠키의 rprsOgnzNo와 매핑 테이블의 값이 다른 경우
//                 // 매핑 테이블에 있는 값 대신 쿠키의 값 사용
//                 const newUrl = url.clone();
//                 newUrl.pathname = `/${rprsOgnzNo}${pathname}`;
//                 console.log(`[Middleware] 리다이렉션: ${pathname} -> ${newUrl.pathname}`);
//                 return NextResponse.redirect(newUrl);
//             }
//         }
//     }

//     return NextResponse.next();
// }

// // 미들웨어를 적용할 경로 설정
// export const config = {
//     matcher: [
//         /*
//          * 다음 경로에는 미들웨어를 적용하지 않음
//          * - api (API 라우트)
//          * - _next/static (정적 파일)
//          * - _next/image (이미지 최적화 API)
//          * - favicon.ico (파비콘)
//          */
//         '/((?!api|_next/static|_next/image|favicon.ico).*)',
//     ],
// };

// 빈 미들웨어 함수 추가
export function middleware(request: NextRequest) {
    // 아무 작업도 하지 않고 바로 다음 단계로 넘김
    return NextResponse.next();
}

// 더 이상 특정 경로에 미들웨어를 적용하지 않도록 설정 (선택 사항)
export const config = {
    matcher: [], // 빈 배열을 사용하여 어떤 경로에도 적용되지 않게 함
};
