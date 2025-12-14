import { fetcherPost } from 'utils/axios';
import { useAuthStore } from 'utils/store/auth';

export const GoogleConnect = async () => {
    const userNo = useAuthStore.getState().userNo; // Zustand의 상태를 getState()로 직접 가져오기
    const GoogleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const GoogleRedirectURL = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URL;

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

        const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${GoogleClientId}&redirect_uri=${GoogleRedirectURL}&response_type=code&scope=email profile openid&state=${state}`;
        window.location.href = authUrl; // 네이버 로그인 페이지로 이동
    } catch (error) {
        console.error('state 생성 요청 실패:', error);
    }
};
