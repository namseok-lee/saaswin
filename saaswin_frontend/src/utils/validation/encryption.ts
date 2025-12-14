import { CryptoService } from '@/services/CryptoService';
import { encryptKeys } from './keys/encryptKeys';

/**
 * 저장 전 암호화가 필요한 데이터 암호화 수행
 * @param data 수행할 데이터 (객체)
 */
export async function validateRecursive(data: any): Promise<boolean> {
    // null, undefined, 원시값인 경우 검증 건너뜀
    if (data === null || data === undefined || typeof data !== 'object') {
        return true; // 검증 필요 없으므로 true 반환
    }

    let hasUserNo = false;
    let needsEncryption = false;

    // 객체인 경우 각 키-값 쌍을 검증
    for (const [key, value] of Object.entries(data)) {
        // user_no 존재 확인
        if (key === 'user_no' && value !== undefined) {
            hasUserNo = true;
        }

        // 문자열 값이면서 검증 대상 키인 경우
        if (typeof value === 'string' && encryptKeys.some((encryptKey) => key.includes(encryptKey.toLowerCase()))) {
            needsEncryption = true;

            if (data.user_no !== undefined) {
                const encryptedValue = await CryptoService.encryptHybrid(value.replace(/-/g, ''), data.user_no);
                data[key] = encryptedValue;
            } else {
                // user_no가 없으면 암호화 실패 반환
                return false;
            }
        }

        // 값이 객체나 배열인 경우 재귀적으로 검증
        if (value !== null && typeof value === 'object') {
            const result = await validateRecursive(value);
            if (!result) return false; // 하위 객체에서 실패하면 즉시 false 반환
        }
    }

    // 암호화가 필요한데 user_no가 없는 경우
    if (needsEncryption && !hasUserNo) {
        return false;
    }

    return true; // 성공적으로 처리됨
}
