import { fetcherPost } from 'utils/axios';
import { IcoGoogle } from '@/assets/Icon';
import styles from '../styles/pages/Login/page.module.scss';
const GoogleLogin = () => {
    // 환경 변수 및 상태 설정

    const handleLogin = async () => {
        const GoogleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        const GoogleRedirectURL = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URL;
        const item = {
            type: 'login',
        };
        // 서버에서 state 값을 생성하여 가져옴
        const response = await fetcherPost([process.env.NEXT_PUBLIC_STATE_RESULT, item]);
        // JSON 객체를 생성하여 상태 정보에 포함
        console.log(response);
        const responseState = response?.[0]?.data?.[0]?.state;

        const stateObject = {
            state: responseState,
            companyCd: 'WIN',
        };
        const state = encodeURIComponent(JSON.stringify(stateObject));

        const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/auth?client_id=${GoogleClientId}&redirect_uri=${GoogleRedirectURL}&response_type=code&scope=email profile openid&state=${state}`;
        window.location.href = GOOGLE_AUTH_URL;
    };
    return (
        <div onClick={handleLogin} className={styles.btnSimpleLogin}>
            <IcoGoogle />
            구글로 시작하기
        </div>
    );
};

export default GoogleLogin;
