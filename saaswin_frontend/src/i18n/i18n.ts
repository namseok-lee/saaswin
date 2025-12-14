// src/i18n/i18n.ts
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import { fetcherGetLanguage } from 'utils/axios';

const i18n = i18next
    // .use(HttpApi) // 이 라인 제거
    .use(initReactI18next)
    .init({
        fallbackLng: 'ko',
        debug: false,
        interpolation: {
            escapeValue: false,
        },
        react: {
            useSuspense: false,
        },
        // 리소스를 직접 제공하여 HTTP 요청 방지
        resources: {
            ko: {
                translation: {}, // 초기 빈 번역 객체
            },
            en: {
                translation: {}, // 영어 지원시 추가
            },
            cn: {
                translation: {}, // 중국어 지원시 추가
            },
            ctfl: {
                translation: {}, // 대만어 지원시 추가
            },
            jp: {
                translation: {}, // 일본어 지원시 추가
            },
        },
    });

// 캐시 관련 상수
const CACHE_PREFIX = 'saaswin_language_';

const loadLanguage = async (lng: string, updt_yn: boolean) => {
    console.log('i18n loadLanguage lng', lng);

    // 기존 설정과 다르다면 기존거 지우고 다시넣음
    if (localStorage.getItem('userLanguage') !== lng) {
        Object.keys(localStorage).forEach((key) => {
            if (key.startsWith('saaswin_language_')) {
                localStorage.removeItem(key);
            }
        });
    }

    // 설정된언어 localStorage에 넣음
    localStorage.setItem('userLanguage', lng);

    const cachedData = localStorage.getItem(`${CACHE_PREFIX}${lng}`);

    // updt_yn이 false이고, 캐시된 데이터가 있고, 유효 기간 내라면 캐시 사용
    if (!updt_yn && cachedData) {
        try {
            const parsedData = JSON.parse(cachedData);
            i18next.addResourceBundle(lng, 'translation', parsedData);
            i18next.changeLanguage(lng);
            return; // 캐시 사용하고 API 호출 방지
        } catch (error) {
            console.error('캐시된 다국어 데이터 파싱 오류:', error);
            // 오류 발생 시 아래 API 호출 진행
        }
    }

    // 캐시된 데이터가 없거나 updt_yn이 true인 경우 API 호출
    fetcherGetLanguage(lng)
        .then((response) => {
            // 데이터 캐싱 (데이터와 타임스탬프)
            localStorage.setItem(`${CACHE_PREFIX}${lng}`, JSON.stringify(response));

            i18next.addResourceBundle(lng, 'translation', response);
            i18next.changeLanguage(lng);
        })
        .catch((error) => {
            console.error('다국어 조회 중 오류 발생:', error);
        });
};

const lc = (code: string) => {
    const userLanguage = localStorage.getItem('userLanguage');
    if (!userLanguage) {
        return code;
    }

    const key = `${CACHE_PREFIX}${userLanguage}`;
    const cachedData = localStorage.getItem(key);

    if (cachedData) {
        try {
            const parsedData = JSON.parse(cachedData);
            return parsedData[code] || code;
        } catch (error) {
            console.error('다국어 데이터 파싱 오류:', error);
            return code;
        }
    }

    return code;
};

// 초기화 함수
const initializeI18n = () => {
    const userLanguage = localStorage.getItem('userLanguage') || 'ko';
    const cachedData = localStorage.getItem(`${CACHE_PREFIX}${userLanguage}`);

    if (cachedData) {
        try {
            const parsedData = JSON.parse(cachedData);
            i18next.addResourceBundle(userLanguage, 'translation', parsedData);
            i18next.changeLanguage(userLanguage);
        } catch (error) {
            console.error('초기 다국어 데이터 파싱 오류:', error);
            loadLanguage(userLanguage, false);
        }
    } else {
        loadLanguage(userLanguage, false);
    }
};

export default i18next;
export { loadLanguage, lc, initializeI18n };
