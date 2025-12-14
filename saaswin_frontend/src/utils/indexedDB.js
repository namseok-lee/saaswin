const DB_NAME = 'userDB';
const STORE_NAME = 'userData';
const DB_VERSION = 1;

// 저장된 데이터 타입을 위한 인터페이스 정의 (TypeScript 사용 시)
// interface AuthData {
//     userNo: string;
//     ognzNo: string;
//     rprsOgnzNo: string;
//     publicKey?: string;
// }

const openDB = () => {
    return new Promise((resolve, reject) => {
        // 브라우저 환경인지 확인
        if (typeof window === 'undefined' || !window.indexedDB) {
            reject('IndexedDB is not supported in this environment.');
            return;
        }
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'userNo' });
            }
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            console.error('IndexedDB error:', event.target.error);
            reject('IndexedDB error: ' + event.target.error);
        };
    });
};

/**
 * IndexedDB에서 userNo를 키로 사용하여 사용자 데이터를 조회합니다.
 * @param {string} userNo 조회할 사용자의 userNo
 * @returns {Promise<object | undefined>} 조회된 사용자 데이터 객체 또는 undefined
 */
export const getDataFromDB = (userNo) => {
    return new Promise(async (resolve, reject) => {
        if (!userNo) {
            return reject(new Error('userNo is required to get data from DB.'));
        }
        try {
            const db = await openDB();
            // 타입스크립트 미사용 시 IDBPDatabase 타입 대신 any 사용
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                console.warn(`Object store "${STORE_NAME}" not found.`);
                // 연결 닫고 undefined 반환 또는 에러 처리
                db.close();
                return resolve(undefined);
            }

            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(userNo); // userNo 키로 데이터 조회

            request.onsuccess = (event) => {
                const result = event.target.result;
                // console.log('IndexedDB 조회 성공:', result); // 필요시 로그 활성화
                resolve(result); // 조회된 데이터 반환 (없으면 undefined)
            };

            request.onerror = (event) => {
                console.error('Error reading data from IndexedDB:', event.target.error);
                reject(event.target.error);
            };

            transaction.oncomplete = () => {
                db.close();
            };

            transaction.onerror = (event) => {
                console.error('Transaction error reading data from IndexedDB:', event.target.error);
                reject(event.target.error);
            };
        } catch (error) {
            console.error('Failed to open DB or start transaction for reading:', error);
            reject(error);
        }
    });
};
