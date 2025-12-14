import { fetcherPost } from 'utils/axios';
import { IcoNaver } from '@/assets/Icon';
import styles from '../styles/pages/Login/page.module.scss';

const NaverLogin = () => {
    // 환경 변수 및 상태 설정
    const naverClientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
    const naverRedirectURL = process.env.NEXT_PUBLIC_NAVER_REDIRECT_URL;

    // 네이버 로그인 URL 생성 및 리다이렉트
    const redirectToNaverLogin = async () => {
        try {
            const item = {
                type: 'login',
            };
            // 서버에서 state 값을 생성하여 가져옴
            const response = await fetcherPost([process.env.NEXT_PUBLIC_STATE_RESULT, item]);
            // JSON 객체를 생성하여 상태 정보에 포함

            const responseState = response?.[0]?.data?.[0]?.state;

            if (!responseState) {
                console.error('state 값 생성 실패:', response);
                return;
            }

            console.log('생성된 state:', responseState);

            const stateObject = {
                state: responseState,
                companyCd: 'WIN',
            };
            const state = encodeURIComponent(JSON.stringify(stateObject));

            // 네이버 로그인 URL 생성
            const authUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${naverClientId}&state=${encodeURIComponent(
                state
            )}&redirect_uri=${encodeURIComponent(naverRedirectURL)}`;

            // 네이버 로그인 페이지로 리다이렉트
            window.location.href = authUrl;
        } catch (error) {
            console.error('state 생성 요청 실패:', error);
        }
    };

    return (
        <div onClick={redirectToNaverLogin} className={styles.btnSimpleLogin}>
            <IcoNaver />
            네이버로 시작하기
        </div>
    );
};

export default NaverLogin;
