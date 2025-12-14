import { fetcherPost } from 'utils/axios';
import { useAuthStore } from 'utils/store/auth';

export const NaverConnect = async () => {
    const userNo = useAuthStore.getState().userNo; // Zustand의 상태를 getState()로 직접 가져오기
    const naverClientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
    const naverRedirectURL = process.env.NEXT_PUBLIC_NAVER_REDIRECT_URL;

    try {
        const response = await fetcherPost(['/api/auth/state/generate-state', { type: 'connect' }]);
        const responseState = response?.[0]?.data?.[0]?.state;

        if (!responseState) {
            console.error('state 값 생성 실패:', response);
            return;
        }

        console.log('생성된 state:', responseState);

        const stateObject = {
            state: responseState,
            companyCd: 'WIN',
            user_no: userNo,
        };
        const state = encodeURIComponent(JSON.stringify(stateObject));

        const authUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${naverClientId}&state=${encodeURIComponent(
            state
        )}&redirect_uri=${encodeURIComponent(naverRedirectURL)}`;

        window.location.href = authUrl; // 네이버 로그인 페이지로 이동
    } catch (error) {
        console.error('state 생성 요청 실패:', error);
    }
};
