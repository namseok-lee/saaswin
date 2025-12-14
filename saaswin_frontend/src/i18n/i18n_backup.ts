// src/i18n/i18n.ts
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';

const loadLanguage = async (lng: string) => {
  
  // 기존 설정과 다르다면 모두 지움. 다시넣도록 하기 위함
  if(localStorage.getItem('userLanguage') !== lng) {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('saaswin_language_')) {
        localStorage.removeItem(key);
      }
    });
  }

  // 설정된언어 localStorage에 넣음
  localStorage.setItem('userLanguage', lng);

  const cachedData = localStorage.getItem(`saaswin_language_${lng}`);
  if (cachedData) {
    // 캐시된 데이터가 있으면 이를 사용
    const parsedData = JSON.parse(cachedData);
    i18next.addResourceBundle(lng, 'translation', parsedData);
    i18next.changeLanguage(lng);

  } else {
    // 캐시된 데이터가 없으면 서버에서 가져오기
    const response = await fetch(`/api/language/${lng}.json`);
    const data = await response.json();
    // 데이터를 캐시하고 사용
    localStorage.setItem(`saaswin_language_${lng}`, JSON.stringify(data));
    i18next.addResourceBundle(lng, 'translation', data);
    i18next.changeLanguage(lng);
  }
};

const lc = (code: string) => {
  
  const key = 'saaswin_language_' + localStorage.getItem('userLanguage');
  const cachedData = localStorage.getItem(key);
  if (cachedData) {
    const parsedData = JSON.parse(cachedData);
    console.log('lc parsedData 2', parsedData[code]);
    return parsedData[code];
  }
  
  return code;

};

i18next
  .use(HttpApi)
  .use(initReactI18next)
  .init({
    fallbackLng: 'ko', // 기본 언어 설정
    debug: true,
    interpolation: {
      escapeValue: false, // React는 XSS 공격을 방지하므로 escape가 필요 없습니다.
    },
    // backend: {
    //   loadPath: '/api/language/{{lng}}.json', // 서버에서 다국어 데이터를 불러오기 위한 API 경로
    // },
    backend: undefined,
    react: {
      useSuspense: false, // Suspense 비활성화
    },
    cache: {
      enabled: true,  // 캐시 활성화
    },
  });

export default i18next;
export { loadLanguage, lc };
