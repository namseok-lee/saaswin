import { fetcherPost } from 'utils/axios';
import { useAuthStore } from 'utils/store/auth';

export const KakaoConnect = async () => {
    const userNo = useAuthStore.getState().userNo; // Zustand의 상태를 getState()로 직접 가져오기
    const kakaoClientId = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
    const kakaoRedirectURL = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URL;

    fetcherPost(['/api/auth/state/generate-state', { type: 'connect' }])
        .then((response) => {
            const responseState = response[0].data[0].state;
            const stateObject = {
                state: responseState,
                companyCd: 'WIN',
                user_no: userNo,
            };
            const state = encodeURIComponent(JSON.stringify(stateObject));
            const authUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${kakaoClientId}&state=${state}&redirect_uri=${encodeURIComponent(
                kakaoRedirectURL
            )}`;

            window.location.href = authUrl;
        })
        .catch((error) => {
            console.log(error);
        });
};
