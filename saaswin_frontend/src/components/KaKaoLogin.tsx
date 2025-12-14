import { fetcherPost } from 'utils/axios';
import { IcoKakao } from '@/assets/Icon';
import styles from '../styles/pages/Login/page.module.scss';

const KakaoLogin = () => {
    // 환경 변수 및 상태 설정
    const kakaoClientId = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
    const kakaoRedirectURL = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URL;

    // 카카오 로그인 URL 생성 및 리다이렉트
    const redirectToKakaoLogin = () => {
        const item = {
            type: 'login',
            // type: 'connect'
        };
        fetcherPost([process.env.NEXT_PUBLIC_STATE_RESULT, item])
            .then((response) => {
                const responseState = response[0].data[0].state;
                const stateObject = {
                    state: responseState,
                    companyCd: 'WIN',
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

    return (
        <div onClick={redirectToKakaoLogin} className={styles.btnSimpleLogin}>
            <IcoKakao />
            카카오로 시작하기
        </div>
    );
};

export default KakaoLogin;
