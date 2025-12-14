import { rrnKeys } from './keys/rrnKeys';
import { bizRegNumKeys } from './keys/bizRegNumKeys';
import { mobileKeys } from './keys/mobileKeys';
import { telKeys } from './keys/telKeys';
import { emailKeys } from './keys/emailKeys';

// 키 매핑 타입 정의
export interface ValidationConfig {
    rrnKeys: string[];
    bizRegNumKeys: string[];
    mobileKeys: string[];
    telKeys: string[];
    emailKeys: string[];
}

// 유효성 검사 정규식 패턴
const validationPatterns = {
    // 주민등록번호: 6자리-7자리 (예: 123456-1234567)
    rrn: /^\d{6}-\d{7}$/,

    // 사업자등록번호: 3자리-2자리-5자리 (예: 123-45-67890)
    bizRegNum: /^\d{3}-\d{2}-\d{5}$/,

    // 휴대폰번호: 010-XXXX-XXXX 또는 01X-XXX-XXXX 형식 + 지역번호-국번-번호 (예: 02-123-4567 또는 031-1234-5678)
    mobile: /^(01[0-9]|02|0(3[1-3]|4[1-4]|5[1-5]|6[1-4]))-?([0-9]{3,4})-?([0-9]{4})$/,

    // 전화번호: 지역번호-국번-번호 (예: 02-123-4567 또는 031-1234-5678)
    tel: /^(0[2-6][1-5]?)-?([0-9]{3,4})-?([0-9]{4})$/,

    // 이메일: 이메일 형식 (예: example@domain.com)
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
};

type PatternType = keyof typeof validationPatterns;

// 키 타입을 맵으로 미리 초기화 (성능 최적화)
const keyTypeMap = new Map<string, PatternType>();

// 초기화 함수 - 단 한 번만 실행
function initKeyTypeMap(config?: Partial<ValidationConfig>) {
    // 기본 설정값
    const defaultConfig: ValidationConfig = {
        rrnKeys,
        bizRegNumKeys,
        mobileKeys,
        telKeys,
        emailKeys,
    };

    // 기본 설정에 사용자 정의 설정 병합
    const mergedConfig: ValidationConfig = {
        ...defaultConfig,
        ...config,
    };

    // 맵 초기화
    keyTypeMap.clear();

    // 각 키 유형별로 맵에 추가
    mergedConfig.rrnKeys.forEach((key) => keyTypeMap.set(key, 'rrn'));
    mergedConfig.bizRegNumKeys.forEach((key) => keyTypeMap.set(key, 'bizRegNum'));
    mergedConfig.mobileKeys.forEach((key) => keyTypeMap.set(key, 'mobile'));
    mergedConfig.telKeys.forEach((key) => keyTypeMap.set(key, 'tel'));
    mergedConfig.emailKeys.forEach((key) => keyTypeMap.set(key, 'email'));
}

// 맵 초기화 (앱 시작시 한 번만 호출)
initKeyTypeMap();

/**
 * 중첩된 객체나 배열을 재귀적으로 탐색하여 키를 검증하는 함수
 * @param data 검증할 데이터 (객체, 배열 또는 원시값)
 * @param failedFields 검증 실패한 필드를 수집하는 배열
 * @param path 현재 탐색 중인 경로 (중첩된 객체에서의 위치)
 */
function validateRecursive(data: any, failedFields: string[], path: string = ''): void {
    // null, undefined, 원시값인 경우 검증 건너뜀
    if (data === null || data === undefined || typeof data !== 'object') {
        return;
    }

    // 배열인 경우 각 요소를 재귀적으로 검증
    if (Array.isArray(data)) {
        data.forEach((item, index) => {
            // 배열 요소에 대한 경로를 구성 (예: users[0], items[2] 등)
            const itemPath = path ? `${path}[${index}]` : `[${index}]`;
            validateRecursive(item, failedFields, itemPath);
        });
        return;
    }

    // 객체인 경우 각 키-값 쌍을 검증
    for (const [key, value] of Object.entries(data)) {
        // 현재 키에 대한 전체 경로 구성 (예: user.address.street)
        const currentPath = path ? `${path}.${key}` : key;

        // 문자열 값이면서 검증 대상 키인 경우
        if (typeof value === 'string' && keyTypeMap.has(key)) {
            const patternType = keyTypeMap.get(key);
            if (patternType && !validationPatterns[patternType].test(value)) {
                // 실패한 경로를 저장 (어디서 실패했는지 추적하기 위해)
                failedFields.push(currentPath);
            }
        }

        // 값이 객체나 배열인 경우 재귀적으로 검증
        if (value !== null && typeof value === 'object') {
            validateRecursive(value, failedFields, currentPath);
        }
    }
}

/**
 * 데이터를 재귀적으로 탐색하며 유효성 검사를 수행하는 함수
 * @param data 검증할 데이터 (객체, 배열 또는 원시값)
 * @param validationConfig 검증 키 설정 (선택적)
 * @returns 검증 실패한 키 경로를 반환하고, 모든 검증을 통과하면 빈 문자열 반환
 */
export function validateJsonFields(data: any, validationConfig?: Partial<ValidationConfig>): string {
    // console.log('validateJsonFields data', data);
    // 사용자 정의 설정이 제공되면 맵 재초기화
    if (validationConfig) {
        initKeyTypeMap(validationConfig);
    }

    // 유효성 검사에 실패한 필드들을 저장하는 배열
    const failedFields: string[] = [];

    // 재귀적으로 데이터 검증
    validateRecursive(data, failedFields);

    // 유효성 검사 실패 시 실패한 필드 목록 반환, 아니면 빈 문자열 반환
    return failedFields.join(',');
}

// 외부에서 키 설정을 업데이트할 수 있는 함수 (필요 시)
export function updateValidationConfig(config: Partial<ValidationConfig>) {
    initKeyTypeMap(config);
}
