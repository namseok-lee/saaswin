import axios from 'axios';
import dayjs from 'dayjs';
import { getBrowser, getIp, getOs } from './clientEnv/clientEnv';
import { buttonTextStore } from './store/buttonInfo';
// const SSWAxiosServices = axios.create({ baseURL: '' });
const SSWAxiosServices = axios.create({ baseURL: process.env.NEXT_PUBLIC_SSW_API_URL });

// 인증 체크를 건너뛸 URL 패턴 목록
const EXCLUDED_PATHS = [
    '/auth', // 로그인 페이지
    '/login', // 로그인 관련 페이지
    '/api/keycloak', // Keycloak 인증 관련 API
    '/api/aligo', // 알리고 관련 API
    '/favicon.ico', // 파비콘
    '/styles', // 스타일 리소스
    '/images', // 이미지 리소스
];

// alert 중복 방지 플래그 및 헬퍼 함수
let isAlerting = false;
const showAlertOnce = (message) => {
    if (!isAlerting) {
        isAlerting = true;
        alert(message);
        // 사용자가 alert를 닫는 시간을 고려하여 일정 시간 후 플래그 해제
        setTimeout(() => {
            isAlerting = false;
        }, 2000); // 2초 후 플래그 해제 (조정 가능)
    }
};

// 요청 인터셉터: 요청 전에 인증 상태 확인
SSWAxiosServices.interceptors.request.use(
    (config) => {
        // console.log('config.url', config);
        // 브라우저 환경에서만 실행
        if (typeof window !== 'undefined') {
            // URL이 제외 대상인지 확인
            // const isExcluded = EXCLUDED_PATHS.some((path) => config.url?.includes(path));
            // const currUrl = window.location.href;
            // const isExcluded = EXCLUDED_PATHS.some((path) => config.url?.includes(path));

            const currentUrl = window.location.pathname; // URL의 경로 부분만 가져옴
            const isExcluded = EXCLUDED_PATHS.some((path) => currentUrl.startsWith(path));

            // 제외 대상이 아닌 경우에만 인증 체크
            if (!isExcluded) {
                // localStorage에서 인증 정보 확인
                const accessToken = localStorage.getItem('accessToken');
                const refreshToken = localStorage.getItem('refreshToken');
                const auth = localStorage.getItem('auth');

                // console.log('[Axios] 요청 인증 상태 확인:', {
                //     url: config.url,
                //     accessToken: !!accessToken,
                //     refreshToken: !!refreshToken,
                //     auth: !!auth,
                // });

                // 인증 정보가 하나라도 없으면 로그인 페이지로 리다이렉션
                //if (!accessToken || !refreshToken || !auth) {
                if (!auth) {
                    console.log('[Axios] 인증 정보 부족, 로그인 페이지로 리다이렉션');
                    //alert('로그인이 필요합니다.');
                    //window.location.href = '/auth';
                    // 요청 취소 (중단)
                    return Promise.reject(new Error('인증 정보가 없습니다.'));
                }

                // 인증 정보가 있으면 헤더에 추가
                if (accessToken) {
                    config.headers['access_token'] = accessToken;
                }
                if (refreshToken) {
                    config.headers['refresh_token'] = refreshToken;
                }
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

SSWAxiosServices.interceptors.response.use(
    (response) => {
        // 🔹 응답 헤더에서 새로운 토큰이 있으면 자동으로 저장
        const newAccessHeaderToken = response.headers['access_token'];
        const newRefreshHeaderToken = response.headers['refresh_token'];
        if (newAccessHeaderToken) {
            localStorage.setItem('accessToken', newAccessHeaderToken);
        }
        if (newRefreshHeaderToken) {
            localStorage.setItem('refreshToken', newRefreshHeaderToken);
        }
        return response;
    },
    (error) => {
        if (error.response) {
            if (error.response.status === 401) {
                console.log('error.response.data', error.response.data);
                showAlertOnce(error.response.data?.message || '인증 오류가 발생했습니다. 로그인 페이지로 이동합니다.');
                // 로그인 페이지로 이동
                window.location.href = '/auth';
            }
            const customError = new Error(error.response.data?.message || '서버 에러가 발생했습니다.');
            customError.status = error.response.status;
            return Promise.reject(customError);
        } else if (error.request) {
            showAlertOnce('네트워크 오류가 발생했습니다. 연결 상태를 확인해주세요.');
            return Promise.reject(new Error('네트워크 오류가 발생했습니다.'));
        } else {
            showAlertOnce(error.message || '예기치 않은 에러가 발생했습니다.');
            return Promise.reject(new Error(error.message || '예기치 않은 에러가 발생했습니다.'));
        }
    }
);

// userClickLog
export const fetcherPostUserClickLog = async (params) => {
    try {
        const response = await SSWAxiosServices.post(process.env.NEXT_PUBLIC_SSW_USER_CLICK_LOG_API_URL, params);
        // 버튼 텍스트 초기화
        buttonTextStore.getState().setButtonText('');
        return response;
    } catch (error) {
        console.error('Error during userClickLog:', error);
        throw error;
    }
};

export const fetcherPostOri = async (args) => {
    const [url, config] = Array.isArray(args) ? args : [args];
    const payload = Array.isArray(config) ? config : { ...config };
    const auth = JSON.parse(localStorage.getItem('auth'));
    const userNo = auth?.state?.userNo ?? '';
    const rprsOgnzNo = auth?.state?.rprsOgnzNo ?? '';
    const params = Array.isArray(config) ? payload[0].params : [];
    // 공통 파라미터 추가
    if (params.length > 0) {
        params[0].work_user_no = userNo;
        params[0].rprs_ognz_no = rprsOgnzNo;
    }
    // 공통조회시 회사코드 , 사용자번호 추가
    if (params?.[0]?.where) {
        const rprsWhere = {};
        rprsWhere.condition = 'equals';
        rprsWhere.fdname = 'rprs_ognz_no';
        rprsWhere.value = rprsOgnzNo;
        params[0].where.push(rprsWhere);
    }

    // 공통저장시 회사코드 , 사용자번호 추가
    if (params?.[0]) {
        params[0].work_user_no = userNo;
        params[0].rprs_ognz_no = rprsOgnzNo;
    }

    // 🔹 로컬 스토리지에서 토큰 가져오기
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    const headers = {
        'Content-Type': 'application/json',
        // ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...(accessToken && { access_token: accessToken }),
        ...(refreshToken && { refresh_token: refreshToken }),
    };

    const res = await SSWAxiosServices.post(url, payload, { headers, withCredentials: true });

    const response = res.data;
    if (response.rtnCode !== '40002') {
        showAlertOnce(response.rtnMsg);
    }
    return response;
};

export const fetcherPost = async (args) => {
    const [url, config] = Array.isArray(args) ? args : [args];
    const payload = Array.isArray(config) ? config : { ...config };
    const auth = JSON.parse(localStorage.getItem('auth'));
    const userNo = auth?.state?.userNo ?? '';
    const rprsOgnzNo = auth?.state?.rprsOgnzNo ?? '';
    const params = Array.isArray(config) ? payload[0].params : [];
    // 공통 파라미터 추가
    if (params.length > 0) {
        // ✅ work_user_no가 이미 있으면 덮어쓰지 않음
        if (!params[0].hasOwnProperty('work_user_no')) {
            params[0].work_user_no = userNo;
        }

        // ✅ user_no가 이미 있으면 덮어쓰지 않음
        if (!params[0].hasOwnProperty('user_no')) {
            params[0].user_no = userNo;
        }

        // rprs_ognz_no 값이 이미 있는 경우 덮어쓰지 않음 (기존 로직 유지)
        if (!params[0].hasOwnProperty('rprs_ognz_no')) {
            params[0].rprs_ognz_no = rprsOgnzNo;
        }
    }
    // 공통조회시 회사코드 , 사용자번호 추가
    if (params?.[0]?.where) {
        const rprsWhere = {};
        rprsWhere.condition = 'equals';
        rprsWhere.fdname = 'rprs_ognz_no';

        if (params[0].hasOwnProperty('rprs_ognz_no')) {
            rprsWhere.value = params[0].rprs_ognz_no; // 이미 설정된 값 사용
        } else {
            rprsWhere.value = rprsOgnzNo; // auth에서 가져온 값 사용
        }

        params[0].where.push(rprsWhere);
    }

    // 공통저장시 회사코드, 사용자번호 추가
    if (params?.[0]) {
        params[0].work_user_no = userNo;

        if (!params[0].hasOwnProperty('rprs_ognz_no')) {
            params[0].rprs_ognz_no = rprsOgnzNo;
        }
    }

    // 🔹 로컬 스토리지에서 토큰 가져오기
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    const headers = {
        'Content-Type': 'application/json',
        // ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...(accessToken && { access_token: accessToken }),
        ...(refreshToken && { refresh_token: refreshToken }),
    };

    const res = await SSWAxiosServices.post(url, payload, { headers, withCredentials: true });

    const response = res.data;
    if (response.rtnCode !== '40002') {
        showAlertOnce(response.rtnMsg);
    }
    return response.resData;
};

// 0001 - 화면정보 조회
export const fetcherPostScr = async (params) => {
    const auth = JSON.parse(localStorage.getItem('auth'));
    const userNo = auth?.state?.userNo ?? '';
    const rprsOgnzNo = auth?.state?.rprsOgnzNo ?? '';

    if (params.rprs_ognz_no === undefined || params.rprs_ognz_no == '') {
        params.rprs_ognz_no = rprsOgnzNo;
    }
    if (params.user_no === undefined || params.user_no == '') {
        params.user_no = userNo;
    }
    if (params.work_user_no === undefined || params.work_user_no == '') {
        params.work_user_no = userNo;
    }

    // URL에서 scr_no 추출
    const currPath = window.location.pathname; // 경로만 가져오는 js 함수
    const tpcd = currPath.split('/').pop() || '';
    let scr_no = params.tpcd || tpcd;
    if (params.scr_no === undefined || params.scr_no === '') {
        params.scr_no = scr_no;
    }
    return fetcherPost([process.env.NEXT_PUBLIC_SSW_REDIS_SCREEN_API_URL, params])
        .then((response) => {
            return response;
        })
        .catch((error) => {
            console.error(error);
            throw error;
        });
};

// 0002 - 그리드에 바인딩할 데이터조회
export const fetcherPostGridData = async (params) => {
    return fetcherPost([process.env.NEXT_PUBLIC_SSW_REDIS_SEARCH_API_URL, params])
        .then((response) => {
            return response[0]?.data || [];
        })
        .catch((error) => {
            console.error(error);
            throw error;
        });
};
// 0022 - 데이터조회
export const fetcherPostData = async (params) => {
    return fetcherPost([process.env.NEXT_PUBLIC_SSW_REDIS_SEARCH_ORIGIN_API_URL, params])
        .then((response) => {
            return response[0]?.data || [];
        })
        .catch((error) => {
            console.error(error);
            throw error;
        });
};

// 0005 - 그리드에 바인딩할 데이터조회 - 공통
export const fetcherPostCommonGridData = async (payload) => {
    const auth = JSON.parse(localStorage.getItem('auth'));
    const buttonInfo = JSON.parse(localStorage.getItem('buttonText'));
    const buttonText = buttonInfo?.state?.buttonText;
    const os = getOs();
    const browser = getBrowser();
    const { ipv4, ipv6 } = getIp();
    // const userNo = auth?.state?.userNo ?? '';
    // const rprsOgnzNo = auth?.state?.rprsOgnzNo ?? '';
    const {
        userNo,
        rprsOgnzNo,
        duty_cd,
        duty_nm,
        jbgd_cd,
        jbgd_nm,
        jbgp_cd,
        jbgp_nm,
        jbps_cd,
        jbps_nm,
        jbttl_cd,
        jbttl_nm,
    } = auth?.state;
    const params = payload?.[0]?.params;
    let sqlId = payload?.[0]?.sqlId;
    let sqlKey = payload?.[0]?.sql_key;

    // params가 undefined인 경우 처리
    if (!params) {
        console.error('fetcherPostCommonGridData: Invalid payload structure, params are missing.');
        return []; // 또는 적절한 오류 처리
    }

    // URL에서 scr_no와 추출
    const currPath = window.location.pathname;
    const tpcd = currPath.split('/').pop() || '';
    let scr_no = tpcd;
    const userClickInfo = {
        os,
        browser,
        ipv4,
        ipv6,
        buttonText,
        menu: scr_no,
        userNo,
        rprsOgnzNo,
        duty_cd,
        duty_nm,
        jbgd_cd,
        jbgd_nm,
        jbgp_cd,
        jbgp_nm,
        jbps_cd,
        jbps_nm,
        jbttl_cd,
        jbttl_nm,
    };
    // 값 재설정
    const work_user_no = params[0]?.work_user_no || userNo;
    const rprs_ognz_no = params[0]?.rprs_ognz_no || rprsOgnzNo;
    const where = params[0]?.where || [];
    if (params.length > 0 && params[0]?.scr_no !== undefined && params[0]?.scr_no !== '') {
        scr_no = params[0]?.scr_no;
    }
    if (sqlId === undefined || sqlId === '' || sqlId === '0' || sqlId === 0) {
        sqlId = 'hrs_sqlgen01';
    }
    if (sqlKey === undefined || sqlKey === '' || sqlKey === '0' || sqlKey === 0) {
        sqlKey = 'hrs_sqlgen_select';
    }

    const requestData = [
        {
            sqlId: sqlId,
            sql_key: sqlKey,
            params: [
                {
                    work_user_no,
                    rprs_ognz_no,
                    scr_no,
                    where,
                },
            ],
        },
    ];

    return fetcherPost([process.env.NEXT_PUBLIC_SSW_COMMON_SEARCH_API_URL, requestData])
        .then((response) => {
            // fetcherPostUserClickLog(userClickInfo);
            return response?.[0]?.data || []; // 데이터가 없으면 빈 배열 반환
        })
        .catch((error) => {
            console.error(error);
            throw error;
        });
};

// 0055 - 데이터조회 - 공통
export const fetcherPostCommonData = async (payload) => {
    const auth = JSON.parse(localStorage.getItem('auth'));
    const userNo = auth?.state?.userNo ?? '';
    const rprsOgnzNo = auth?.state?.rprsOgnzNo ?? '';

    const params = payload[0].params;
    let sqlId = payload[0].sqlId;
    let sqlKey = payload[0].sql_key;

    // URL에서 scr_no 추출
    const currPath = window.location.pathname;
    const tpcd = currPath.split('/').pop() || '';
    let scr_no = tpcd;

    // 값 재설정
    const work_user_no = params[0]?.work_user_no || userNo;
    const rprs_ognz_no = params[0]?.rprs_ognz_no || rprsOgnzNo;
    const where = params[0]?.where || [];
    if (params.length > 0 && params[0]?.scr_no !== undefined && params[0]?.scr_no !== '') {
        scr_no = params[0]?.scr_no;
    }
    if (sqlId === undefined || sqlId === '' || sqlId === '0' || sqlId === 0) {
        sqlId = 'hrs_sqlgen01';
    }
    if (sqlKey === undefined || sqlKey === '' || sqlKey === '0' || sqlKey === 0) {
        sqlKey = 'hrs_sqlgen_select';
    }

    const requestData = [
        {
            sqlId: sqlId,
            sql_key: sqlKey,
            params: [
                {
                    work_user_no,
                    rprs_ognz_no,
                    scr_no,
                    where,
                },
            ],
        },
    ];

    return fetcherPost([process.env.NEXT_PUBLIC_SSW_COMMON_SEARCH_ORIGIN_API_URL, requestData])
        .then((response) => {
            return response?.[0]?.data || [];
        })
        .catch((error) => {
            console.error(error);
            throw error;
        });
};

// 0006 - 데이터저장 - 공통
export const fetcherPostCommonSave = async (payload) => {
    const auth = JSON.parse(localStorage.getItem('auth'));
    const userNo = auth?.state?.userNo ?? '';
    const rprsOgnzNo = auth?.state?.rprsOgnzNo ?? '';

    // payload[0].params가 배열인지 확인하고 적절히 처리
    const paramsInput = payload[0].params;

    // params가 배열이 아니면 배열로 변환
    const paramsArray = Array.isArray(paramsInput) ? paramsInput : [paramsInput];

    let sqlId = payload[0].sqlId;
    let sqlKey = payload[0].sql_key;

    // URL에서 scr_no 추출
    const currPath = window.location.pathname;
    const tpcd = currPath.split('/').pop() || '';
    let scr_no = tpcd;

    // 각 params 항목에 공통 값을 설정
    const processedParams = paramsArray.map((param) => {
        // 배열의 각 항목에 대해 work_user_no와 rprs_ognz_no 설정
        const work_user_no = param.work_user_no || userNo;
        const rprs_ognz_no = param.rprs_ognz_no || rprsOgnzNo;
        const paramScr_no = param.scr_no || scr_no;

        // 제외할 필드 목록
        const excludeFields = ['sqlId', 'sql_key', 'scr_no'];

        // sqlgen_info 배열 생성
        const sqlgen_info_array = [];

        // sqlgen_info 객체 생성 (제외할 필드를 제외한 모든 필드)
        const sqlgen_info_item = {
            // rprs_ognz_no와 work_user_no를 명시적으로 추가
            rprs_ognz_no: rprs_ognz_no,
            work_user_no: work_user_no,
        };

        // 나머지 파라미터 필드 추가
        Object.keys(param).forEach((key) => {
            if (!excludeFields.includes(key)) {
                sqlgen_info_item[key] = param[key];
            }
        });

        // 객체를 배열에 추가
        sqlgen_info_array.push(sqlgen_info_item);

        return {
            work_user_no,
            rprs_ognz_no,
            scr_no: paramScr_no,
            sqlgen_info: sqlgen_info_array, // 배열로 변경
        };
    });

    // sql 관련 값 설정
    if (sqlId === undefined || sqlId === '' || sqlId === '0' || sqlId === 0) {
        sqlId = 'hrs_sqlgen01';
    }
    if (sqlKey === undefined || sqlKey === '' || sqlKey === '0' || sqlKey === 0) {
        sqlKey = 'hrs_sqlgen_cud';
    }

    const requestData = [
        {
            sqlId: sqlId,
            sql_key: sqlKey,
            params: processedParams,
        },
    ];
    return fetcherPost([process.env.NEXT_PUBLIC_SSW_COMMON_SAVE_API_URL, requestData])
        .then((response) => {
            return response;
        })
        .catch((error) => {
            console.error(error);
            throw error;
        });
};

// 메뉴 트리조회
export const fetcherPostMenuTreeData = async (params) => {
    return fetcherPost([process.env.NEXT_PUBLIC_SSW_REDIS_SEARCH_ORIGIN_API_URL, params])
        .then((response) => {
            return response[0];
        })
        .catch((error) => {
            console.error(error);
            throw error;
        });
};

//공통코드 조회
export const fetcherPostCmcd = async (cmcdParams) => {
    // 로그인토큰 데이터 가져오기
    const auth = JSON.parse(localStorage.getItem('auth'));
    const userNo = auth?.state?.userNo ?? '';
    const rprsOgnzNo = auth?.state?.rprsOgnzNo ?? '';

    let rprs_ognz_no = cmcdParams.rprs_ognz_no;
    let crtr_ymd = cmcdParams.crtr_ymd;

    // 회사코드 값이 없으면 로그인한 회사코드넣음
    if (rprs_ognz_no === undefined || rprs_ognz_no === null || rprs_ognz_no === '') {
        rprs_ognz_no = rprsOgnzNo;
    }

    // 기준일 값이 없으면 현재날짜넣음
    if (crtr_ymd === undefined || crtr_ymd === null || crtr_ymd === '') {
        crtr_ymd = dayjs(new Date()).format('YYYYMMDD');
    }

    // 파라미터 생성
    const payload = [
        {
            sqlId: process.env.NEXT_PUBLIC_SSW_CMCD_SQL_ID,
            sql_key: process.env.NEXT_PUBLIC_SSW_CMCD_SQL_KEY,
            params: [
                {
                    key: cmcdParams.group_cd,
                    rprs_ognz_no: rprs_ognz_no,
                    crtr_ymd: crtr_ymd,
                },
            ],
        },
    ];

    // 🔹 로컬 스토리지에서 토큰 가져오기
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    const headers = {
        'Content-Type': 'application/json',
        // ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...(accessToken && { access_token: accessToken }),
        ...(refreshToken && { refresh_token: refreshToken }),
    };

    const res = await SSWAxiosServices.post(process.env.NEXT_PUBLIC_SSW_REDIS_SEARCH_ORIGIN_API_URL, payload, {
        headers,
        withCredentials: true,
    });
    const response = res.data;
    let result = [];

    if (response.rtnCode !== '40002') {
        showAlertOnce(response.rtnMsg);
    } else {
        const res_data = response.resData[0]?.data || [];
        if (res_data.length > 0) {
            const sortedResponse = [...res_data].sort((a, b) => {
                // 숫자로 변환하여 정렬 (문자열 비교가 아닌 숫자 비교)
                return Number(a.cd_prord) - Number(b.cd_prord);
            });
            return sortedResponse;
        }
        return res_data;
    }
};

// 공통 GET 요청 함수 (동적 baseURL)
export const fetcherGetImage = async (fileId) => {
    const axiosInstance = axios.create({
        baseURL: process.env.NEXT_PUBLIC_SSW_FILE_URL, // 기본 baseURL을 사용하거나, 인자로 전달된 baseURL을 사용
    });

    try {
        const res = await axiosInstance.get(process.env.NEXT_PUBLIC_SSW_FILE_IMAGE_DOWN_URL2 + '/' + fileId, {
            params: null,
            responseType: 'arraybuffer', // 파일을 스트리밍 방식으로 받기 arraybuffer or blob or stream
        });
        console.log('axios get res : ', res);
        console.log('axios get res.data : ', res.data);
        return res.data;
    } catch (error) {
        console.error('Error during file download:', error);
        throw error;
    }
};

// 파일id로 파일정보 조회
export const fetcherGetFileInfo = async (fileId) => {
    const axiosInstance = axios.create({
        baseURL: process.env.NEXT_PUBLIC_SSW_FILE_URL, // 기본 baseURL을 사용하거나, 인자로 전달된 baseURL을 사용
    });

    try {
        const res = await axiosInstance.get(process.env.NEXT_PUBLIC_SSW_FILE_SEARCH_URL + '/' + fileId, {
            params: null,
            responseType: 'json', // json 형식
        });
        console.log('axios get res : ', res);
        console.log('axios get res.data : ', res.data);
        return res.data;
    } catch (error) {
        console.error('Error during file download:', error);
        throw error;
    }
};

// 파일id로 파일 다운로드
export const fetcherGetFileDown = async (fileId) => {
    const axiosInstance = axios.create({
        baseURL: process.env.NEXT_PUBLIC_SSW_FILE_URL, // 기본 baseURL을 사용하거나, 인자로 전달된 baseURL을 사용
    });

    try {
        const res = await axiosInstance.get(process.env.NEXT_PUBLIC_SSW_FILE_IMAGE_DOWN_URL2 + '/' + fileId, {
            params: null,
            responseType: 'arraybuffer', // 파일을 스트리밍 방식으로 받기 arraybuffer or blob or stream
        });
        console.log('axios get res : ', res);
        console.log('axios get res.data : ', res.data);
        return res.data;
    } catch (error) {
        console.error('Error during file download:', error);
        throw error;
    }
};

// 파일등록
export const fetcherPostFile = async (file, params) => {
    // 로그인토큰 데이터 가져오기
    const auth = JSON.parse(localStorage.getItem('auth'));
    const userNo = auth?.state?.userNo ?? '';
    const rprsOgnzNo = auth?.state?.rprsOgnzNo ?? '';

    let user_no = params.user_no;
    let rprs_ognz_no = params.rprs_ognz_no;

    // 회사코드 값이 없으면 로그인한 회사코드넣음
    if (rprs_ognz_no === undefined || rprs_ognz_no === null || rprs_ognz_no === '') {
        rprs_ognz_no = rprsOgnzNo;
    }

    // 기준일 값이 없으면 현재날짜넣음
    if (user_no === undefined || user_no === null || user_no === '') {
        user_no = userNo;
    }

    params.user_no = user_no;
    params.rprs_ognz_no = rprs_ognz_no;

    // 파라미터 생성
    const payload = {
        file: file,
        params: JSON.stringify(params),
    };
    // 🔹 로컬 스토리지에서 토큰 가져오기
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    // FormData를 사용할 때는 Content-Type을 설정할 필요가 없습니다.
    const headers = {
        'Content-Type': 'multipart/form-data',
        ...(accessToken && { access_token: accessToken }),
        ...(refreshToken && { refresh_token: refreshToken }),
    };

    try {
        const res = await SSWAxiosServices.post(process.env.NEXT_PUBLIC_SSW_FILE_UPLOAD_URL, payload, {
            headers,
            withCredentials: true,
        });
        const response = res.data;

        console.log('fetcherPostFile response', response);

        if (response.rtnCode !== '40002') {
            showAlertOnce(response.rtnMsg);
        } else {
            // 수정된 경로로 return_cd 접근 (재확인 및 수정)
            //return response.resData[0].data[0].data.data.data[0].return_cd;
            return response.resData[0].data[0].data.data.data.file_id;
        }
    } catch (error) {
        console.error('Request failed:', error);
        // 인터셉터에서 이미 showAlertOnce를 호출하므로, 여기서는 추가 호출을 자제하거나 다른 메시지를 사용할 수 있습니다.
        // 예: showAlertOnce('파일 업로드 중 특정 오류 발생');
        throw error;
    }
};

// eform suite용 파일조회
export const fetcherGetEfsFileDown = async (args) => {
    // NEXT_PUBLIC_SSW_FILE_IMAGE_DOWN_URL

    const [url, config] = Array.isArray(args) ? args : [args];
    const payload = Array.isArray(config) ? config : { ...config };
    const res = await SSWAxiosServices.get(url, {
        params: payload,
        responseType: 'stream', // 스트리밍 방식으로 파일 받기
    });
    const response = res.data;
    return response.resData;
};

// eform suite용 최초 템플릿 업로드
export const fetcherPostEfsUploadFile = async (file, params) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('params', JSON.stringify(params)); // 추가 파라미터 설정

    try {
        //const response = await fetcherPost(process.env.NEXT_PUBLIC_EFS_UPLOAD_FILE, formData);
        const response = await SSWAxiosServices.post(process.env.NEXT_PUBLIC_EFS_UPLOAD_FILE, formData);
        return response.data;
    } catch (error) {
        console.error('Error during file upload:', error);
        throw error;
    }
};

// 다국어 조회
export const fetcherGetLanguage = async (lng) => {
    try {
        const response = await SSWAxiosServices.get(process.env.NEXT_PUBLIC_REDIS_LANGUAGE + '/' + lng + '.json');
        return response.data;
    } catch (error) {
        console.error('Error during language:', error);
        throw error;
    }
};

// ai 차트생성
export const fetcherPostAIChart = async (params) => {
    try {
        const response = await SSWAxiosServices.post(process.env.NEXT_PUBLIC_AI_AICHART, params);
        return response.data;
    } catch (error) {
        console.error('Error during AIChart:', error);
        throw error;
    }
};
// 이니시스 결제 정보 조회
export const fetcherGetInicisPay = async (params) => {
    try {
        const response = await SSWAxiosServices.post(process.env.NEXT_PUBLIC_INICIS_REQUEST_URL, params);
        return response.data;
    } catch (error) {
        console.error('Error during InicisPay:', error);
        throw error;
    }
};
// 인증 코드 검증 함수
export const verifyAuthCode = async (username, password, authCode) => {
    try {
        // SSWAxiosServices.post 메서드 사용 (GET에서 POST로 변경)
        const res = await SSWAxiosServices.post('/api/keycloak/verify-auth-code', {
            username, // DTO 필드명과 일치
            password, // DTO 필드명과 일치
            authCode, // DTO 필드명과 일치
        });

        console.log('인증 응답:', res);
        return res.data;
    } catch (error) {
        console.error('인증 코드 검증 오류:', error);
        throw error;
    }
};

// 알리고 카카오톡 발송
export const sendAligoKakaoTalk = async (itemTest) => {
    try {
        // SSWAxiosServices.post 메서드 사용 (GET에서 POST로 변경)
        const res = await SSWAxiosServices.post('/api/aligo/talk', itemTest);

        console.log('알리고 카카오톡 발송 응답:', res);
        return res.data;
    } catch (error) {
        console.error('알리고 카카오톡 발송 오류:', error);
        throw error;
    }
};

// 로그인-2단계인증
export const fetcherPostSecondCert = async (url, item) => {
    try {
        const response = await SSWAxiosServices.post(url, {
            userid: item?.userid,
            tel_no: item?.tel_no,
            cert_no: item?.cert_no,
        });

        console.log('로그인-2단계인증 응답:', response);
        return response.data;
    } catch (error) {
        console.error('로그인-2단계인증 오류:', error);
        throw error;
    }
};

// Keycloak 로그아웃 (POST)
export const fetcherPostLogout = async (username) => {
    try {
        const response = await fetch('/api/keycloak/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: username, // 사용자 ID를 일반 텍스트로 전송
        });

        return response;
    } catch (error) {
        console.error('Error during logout:', error);
        throw error;
    }
};

// 복호화
export const fetcherPostDecrypt = async (args) => {
    const [url, config] = Array.isArray(args) ? args : [args];
    const payload = Array.isArray(config) ? config : { ...config };
    const auth = JSON.parse(localStorage.getItem('auth'));
    const userNo = auth?.state?.userNo ?? '';
    const rprsOgnzNo = auth?.state?.rprsOgnzNo ?? '';

    // 공통 파라미터 추가
    if (payload.length > 0) {
        payload[0].work_user_no = userNo;
        // rprs_ognz_no 값이 이미 있는 경우 덮어쓰지 않음
        if (!payload[0].hasOwnProperty('rprs_ognz_no')) {
            payload[0].rprs_ognz_no = rprsOgnzNo;
        }
    }

    // 🔹 로컬 스토리지에서 토큰 가져오기
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    const headers = {
        'Content-Type': 'application/json',
        // ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...(accessToken && { access_token: accessToken }),
        ...(refreshToken && { refresh_token: refreshToken }),
    };

    const res = await SSWAxiosServices.post(url, payload, { headers, withCredentials: true });

    const response = res.data;
    return response;
};
