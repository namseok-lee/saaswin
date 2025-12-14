// /**
//  * 대표 조직 번호 관련 유틸리티 함수
//  */

// // 로컬스토리지 키
// export const AUTH_KEY = 'auth';
// export const RPRS_OGNZ_NO_KEY = 'rprsOgnzNo';

// /**
//  * 쿠키 설정 함수
//  * @param name 쿠키 이름
//  * @param value 쿠키 값
//  * @param days 유효기간(일)
//  */
// export const setCookie = (name: string, value: string, days = 30): void => {
//     if (typeof document === 'undefined') return;

//     const expires = new Date();
//     expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
//     document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
// };

// /**
//  * 쿠키 가져오기 함수
//  * @param name 쿠키 이름
//  * @returns 쿠키 값 또는 빈 문자열
//  */
// export const getCookie = (name: string): string => {
//     if (typeof document === 'undefined') return '';

//     const nameEQ = name + '=';
//     const ca = document.cookie.split(';');
//     for (let i = 0; i < ca.length; i++) {
//         let c = ca[i];
//         while (c.charAt(0) === ' ') c = c.substring(1, c.length);
//         if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
//     }
//     return '';
// };

// /**
//  * auth 객체에서 rprsOgnzNo 값을 추출
//  * @returns rprsOgnzNo 값 또는 빈 문자열
//  */
// export const extractRprsOgnzNoFromAuth = (): string => {
//     if (typeof window === 'undefined') return '';

//     try {
//         const authJson = localStorage.getItem(AUTH_KEY);
//         if (!authJson) return '';

//         const auth = JSON.parse(authJson);
//         return auth?.state?.rprsOgnzNo || '';
//     } catch (error) {
//         console.error('auth 객체에서 rprsOgnzNo 추출 중 오류:', error);
//         return '';
//     }
// };

// /**
//  * auth 객체의 rprsOgnzNo 값 업데이트
//  * @param value 새 rprsOgnzNo 값
//  * @returns 성공 여부
//  */
// export const updateAuthRprsOgnzNo = (value: string): boolean => {
//     if (typeof window === 'undefined') return false;

//     try {
//         const authJson = localStorage.getItem(AUTH_KEY);
//         if (!authJson) return false;

//         const auth = JSON.parse(authJson);
//         if (!auth.state) {
//             auth.state = {};
//         }

//         // rprsOgnzNo 업데이트
//         auth.state.rprsOgnzNo = value;

//         // 변경된 auth 객체 저장
//         localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
//         return true;
//     } catch (error) {
//         console.error('auth 객체의 rprsOgnzNo 업데이트 중 오류:', error);
//         return false;
//     }
// };

// /**
//  * 대표 조직 번호 저장 (auth 객체 및 쿠키에 모두 저장)
//  * @param value 저장할 대표 조직 번호
//  */
// export const setRprsOgnzNo = (value: string): void => {
//     if (typeof window !== 'undefined') {
//         // auth 객체에 저장
//         updateAuthRprsOgnzNo(value);

//         // 별도 로컬스토리지에도 백업 저장 (선택사항)
//         localStorage.setItem(RPRS_OGNZ_NO_KEY, value);

//         // 쿠키에도 동기화
//         setCookie(RPRS_OGNZ_NO_KEY, value);
//     }
// };

// /**
//  * 저장된 대표 조직 번호 가져오기 (auth 객체 우선, 없으면 쿠키 확인)
//  * @param defaultValue 기본값 (기본: '')
//  * @returns 저장된 대표 조직 번호 또는 기본값
//  */
// export const getRprsOgnzNo = (defaultValue: string = ''): string => {
//     if (typeof window === 'undefined') {
//         return defaultValue;
//     }

//     // 먼저 auth 객체 확인
//     const authValue = extractRprsOgnzNoFromAuth();
//     if (authValue) {
//         // 있으면 쿠키에도 동기화
//         setCookie(RPRS_OGNZ_NO_KEY, authValue);
//         return authValue;
//     }

//     // 백업 로컬스토리지 확인
//     const lsValue = localStorage.getItem(RPRS_OGNZ_NO_KEY);
//     if (lsValue) {
//         // auth 객체와 쿠키에도 동기화
//         updateAuthRprsOgnzNo(lsValue);
//         setCookie(RPRS_OGNZ_NO_KEY, lsValue);
//         return lsValue;
//     }

//     // 로컬스토리지에 없으면 쿠키 확인
//     const cookieValue = getCookie(RPRS_OGNZ_NO_KEY);
//     if (cookieValue) {
//         // auth 객체와 로컬스토리지에도 동기화
//         updateAuthRprsOgnzNo(cookieValue);
//         localStorage.setItem(RPRS_OGNZ_NO_KEY, cookieValue);
//         return cookieValue;
//     }

//     return defaultValue;
// };

// /**
//  * 대표 조직 번호를 URL 경로에 추가
//  * @param path 기존 경로
//  * @param rprsOgnzNo 추가할 대표 조직 번호 (기본값: auth/로컬스토리지/쿠키에서 가져옴)
//  * @returns 대표 조직 번호가 포함된 경로
//  */
// export const addRprsOgnzNoToPath = (path: string, rprsOgnzNo?: string): string => {
//     // 경로가 이미 슬래시로 시작하면 제거
//     const normalizedPath = path.startsWith('/') ? path.substring(1) : path;

//     // rprsOgnzNo가 제공되지 않은 경우 auth/로컬스토리지/쿠키에서 가져옴
//     const ognzNo = rprsOgnzNo || getRprsOgnzNo();

//     // rprsOgnzNo가 없으면 원래 경로 반환
//     if (!ognzNo) {
//         return `/${normalizedPath}`;
//     }

//     // 경로가 비어있으면 rprsOgnzNo만 반환
//     if (!normalizedPath) {
//         return `/${ognzNo}`;
//     }

//     // 경로의 첫 번째 세그먼트가 이미 rprsOgnzNo인 경우 그대로 반환
//     const segments = normalizedPath.split('/');
//     if (segments[0] === ognzNo) {
//         return `/${normalizedPath}`;
//     }

//     // rprsOgnzNo를 경로 앞에 추가
//     return `/${ognzNo}/${normalizedPath}`;
// };
