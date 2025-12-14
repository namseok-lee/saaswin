// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { getRprsOgnzNo, setRprsOgnzNo, getCookie, extractRprsOgnzNoFromAuth } from '../utils/rprsOgnzNoUtils';

// interface RprsOgnzSelectorProps {
//     onClose?: () => void;
// }

// export default function RprsOgnzSelector({ onClose }: RprsOgnzSelectorProps) {
//     const router = useRouter();
//     const [rprsOgnzNo, setRprsOgnzNoState] = useState('');
//     const [authInfo, setAuthInfo] = useState<{ userNo: string; ognzNo: string } | null>(null);

//     // 초기값 로드 (auth 객체, 로컬스토리지, 쿠키 확인)
//     useEffect(() => {
//         if (typeof window === 'undefined') return;

//         try {
//             // auth 객체에서 정보 가져오기
//             const authJson = localStorage.getItem('auth');
//             if (authJson) {
//                 const auth = JSON.parse(authJson);
//                 if (auth?.state) {
//                     setAuthInfo({
//                         userNo: auth.state.userNo || '',
//                         ognzNo: auth.state.ognzNo || '',
//                     });
//                 }
//             }
//         } catch (error) {
//             console.error('auth 정보 로드 중 오류:', error);
//         }

//         // rprsOgnzNo 값 가져오기 (auth 객체 우선)
//         const savedRprsOgnzNo = getRprsOgnzNo();
//         setRprsOgnzNoState(savedRprsOgnzNo);
//     }, []);

//     // 대표 조직 번호 저장 및 페이지 리로드
//     const handleSave = () => {
//         if (rprsOgnzNo) {
//             // auth 객체, 로컬스토리지, 쿠키에 모두 저장
//             setRprsOgnzNo(rprsOgnzNo);

//             // 필요한 경우 콜백 실행
//             if (onClose) {
//                 onClose();
//             }

//             // 현재 URL 경로 확인
//             const currentPath = window.location.pathname;
//             const pathSegments = currentPath.split('/').filter(Boolean);

//             if (pathSegments.length > 0) {
//                 const firstSegment = pathSegments[0];

//                 // 쿠키 설정 후 자동 리다이렉션이 발생하지 않도록 검사
//                 const cookieValue = getCookie('rprsOgnzNo');

//                 // 경로의 첫 번째 세그먼트가 이미 저장된 rprsOgnzNo와 다르고,
//                 // 첫 번째 세그먼트가 'ssw'로 시작하는 경우 적절한 리다이렉션 URL 생성
//                 if (firstSegment !== rprsOgnzNo && firstSegment.startsWith('ssw')) {
//                     const newPathSegments = [...pathSegments];
//                     newPathSegments[0] = rprsOgnzNo;
//                     const newPath = '/' + newPathSegments.join('/');

//                     // 페이지 리로드 대신 리다이렉션
//                     window.location.href = newPath;
//                     return;
//                 }
//             }

//             // 변경 사항을 반영하기 위해 페이지 새로고침
//             window.location.reload();
//         }
//     };

//     return (
//         <div className='p-4 bg-white rounded shadow'>
//             <h3 className='text-lg font-semibold mb-4'>대표 조직 설정</h3>

//             {authInfo && (
//                 <div className='mb-4 p-3 bg-gray-50 rounded text-sm'>
//                     <p>
//                         <strong>사용자 번호:</strong> {authInfo.userNo}
//                     </p>
//                     <p>
//                         <strong>조직 번호:</strong> {authInfo.ognzNo}
//                     </p>
//                     <p>
//                         <strong>현재 대표 조직:</strong> {extractRprsOgnzNoFromAuth() || '(없음)'}
//                     </p>
//                 </div>
//             )}

//             <div className='mb-4'>
//                 <label htmlFor='rprsOgnzNoSelect' className='block mb-2 text-sm font-medium'>
//                     대표 조직 선택:
//                 </label>
//                 <select
//                     id='rprsOgnzNoSelect'
//                     value={rprsOgnzNo}
//                     onChange={(e) => setRprsOgnzNoState(e.target.value)}
//                     className='w-full p-2 border rounded'
//                 >
//                     <option value=''>선택하세요</option>
//                     <option value='WIN'>기본 (WIN)</option>
//                     <option value='HR001'>인사 (HR001)</option>
//                     <option value='FIN'>재무 (FIN)</option>
//                     {/* 필요에 따라 더 많은 옵션 추가 */}
//                 </select>
//             </div>

//             <div className='mb-4'>
//                 <label htmlFor='rprsOgnzNoInput' className='block mb-2 text-sm font-medium'>
//                     직접 입력:
//                 </label>
//                 <input
//                     type='text'
//                     id='rprsOgnzNoInput'
//                     value={rprsOgnzNo}
//                     onChange={(e) => setRprsOgnzNoState(e.target.value)}
//                     placeholder='대표 조직 번호 입력'
//                     className='w-full p-2 border rounded'
//                 />
//             </div>

//             <div className='flex justify-end space-x-2'>
//                 {onClose && (
//                     <button onClick={onClose} className='px-4 py-2 border rounded hover:bg-gray-100'>
//                         취소
//                     </button>
//                 )}
//                 <button
//                     onClick={handleSave}
//                     disabled={!rprsOgnzNo}
//                     className={`px-4 py-2 rounded ${
//                         rprsOgnzNo
//                             ? 'bg-blue-500 text-white hover:bg-blue-600'
//                             : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                     }`}
//                 >
//                     저장
//                 </button>
//             </div>
//         </div>
//     );
// }
