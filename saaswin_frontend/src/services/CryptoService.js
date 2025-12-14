import { Buffer } from 'buffer'; // Base64 변환 위해 Buffer 사용

// Helper: ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer) {
    return Buffer.from(buffer).toString('base64');
}

// Helper: Base64 to ArrayBuffer
function base64ToArrayBuffer(base64) {
    const binary = Buffer.from(base64, 'base64');
    return binary.buffer.slice(binary.byteOffset, binary.byteOffset + binary.byteLength);
}

// Helper: PEM public key to ArrayBuffer (SPKI)
function pemToArrayBuffer(pem) {
    const base64String = pem
        .replace('-----BEGIN PUBLIC KEY-----', '')
        .replace('-----END PUBLIC KEY-----', '')
        .replace(/\s+/g, '');
    try {
        const binaryString = atob(base64String);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    } catch (e) {
        console.error('PEM decoding failed:', e);
        throw new Error('Invalid Base64 data in PEM key.');
    }
}

export class CryptoService {
    // --- RSA 관련 (주로 AES 키 암호화에 사용) ---

    // 1. IndexedDB에서 RSA 공개 키(PEM) 가져오기
    static async fetchPublicKey(userNo) {
        // ... 기존 fetchPublicKey 코드와 동일 ...
        return new Promise((resolve, reject) => {
            if (typeof window === 'undefined' || !window.indexedDB) {
                return reject('IndexedDB is not supported.');
            }
            const DB_NAME = 'userDB';
            const STORE_NAME = 'userData';
            const DB_VERSION = 1;
            const request = window.indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = (event) => reject('IndexedDB error: ' + event.target.error);
            request.onsuccess = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.close();
                    return reject(`Object store '${STORE_NAME}' not found.`);
                }
                const transaction = db.transaction([STORE_NAME], 'readonly');
                const store = transaction.objectStore(STORE_NAME);
                const getRequest = store.get(userNo);
                getRequest.onsuccess = (e) => {
                    const userData = e.target.result;
                    resolve(userData && userData.pblcn_key ? userData.pblcn_key : null);
                };
                getRequest.onerror = (e) => reject('Error fetching key: ' + e.target.error);
                transaction.oncomplete = () => db.close();
            };
        });
    }

    // 2. PEM 형식 RSA 공개키를 CryptoKey 객체로 변환
    static async importRsaPublicKey(pemKey) {
        try {
            const keyBuffer = pemToArrayBuffer(pemKey);
            return await window.crypto.subtle.importKey(
                'spki', // SubjectPublicKeyInfo 형식
                keyBuffer,
                { name: 'RSA-OAEP', hash: 'SHA-256' },
                false, // non-extractable
                ['encrypt'] // key usage
            );
        } catch (error) {
            console.error('Error importing RSA public key:', error);
            throw new Error(`Failed to import RSA key: ${error.message}`);
        }
    }

    // PEM 형식 RSA 개인 키를 CryptoKey 객체로 변환
    static async importRsaPrivateKey(pemKey) {
        try {
            // PKCS#8 형식의 개인 키에서 PEM 헤더/푸터를 제거하고 base64 디코딩
            const base64String = pemKey
                .replace('-----BEGIN PRIVATE KEY-----', '')
                .replace('-----END PRIVATE KEY-----', '')
                .replace(/\s+/g, '');

            const binaryString = atob(base64String);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // PKCS#8 형식으로 개인 키 가져오기
            return await window.crypto.subtle.importKey(
                'pkcs8',
                bytes.buffer,
                { name: 'RSA-OAEP', hash: 'SHA-256' },
                false, // non-extractable
                ['decrypt'] // key usage
            );
        } catch (error) {
            console.error('Error importing RSA private key:', error);
            throw new Error(`Failed to import RSA private key: ${error.message}`);
        }
    }

    // --- AES 관련 (데이터 암호화에 사용) ---

    // 3. AES-GCM 키 생성
    static async generateAesKey() {
        try {
            return await window.crypto.subtle.generateKey(
                { name: 'AES-GCM', length: 256 }, // 256비트 키 사용
                true, // extractable (RSA로 암호화하기 위해)
                ['encrypt', 'decrypt']
            );
        } catch (error) {
            console.error('Error generating AES key:', error);
            throw new Error('Failed to generate AES key.');
        }
    }

    // Raw 형식의 AES 키 데이터로부터 AES-GCM CryptoKey 가져오기
    static async importAesKey(keyData) {
        try {
            return await window.crypto.subtle.importKey(
                'raw',
                keyData,
                { name: 'AES-GCM', length: 256 },
                false, // non-extractable
                ['encrypt', 'decrypt']
            );
        } catch (error) {
            console.error('Error importing AES key:', error);
            throw new Error('Failed to import AES key.');
        }
    }

    // 4. AES-GCM으로 데이터 암호화
    static async encryptWithAes(aesKey, data) {
        try {
            const iv = window.crypto.getRandomValues(new Uint8Array(16)); // 12바이트 IV 생성 (권장)
            const encoder = new TextEncoder();
            const encodedData = encoder.encode(data);

            const encryptedDataBuffer = await window.crypto.subtle.encrypt(
                { name: 'AES-GCM', iv: iv },
                aesKey,
                encodedData
            );

            return {
                encryptedData: arrayBufferToBase64(encryptedDataBuffer),
                iv: arrayBufferToBase64(iv),
            };
        } catch (error) {
            console.error('AES encryption failed:', error);
            throw new Error('Failed to encrypt data with AES.');
        }
    }

    // AES-GCM으로 데이터 복호화
    static async decryptWithAes(aesKey, encryptedData, iv) {
        try {
            const encryptedBuffer = base64ToArrayBuffer(encryptedData);
            const ivBuffer = base64ToArrayBuffer(iv);

            const decryptedBuffer = await window.crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: new Uint8Array(ivBuffer) },
                aesKey,
                encryptedBuffer
            );

            // 복호화된 데이터를 문자열로 변환
            const decoder = new TextDecoder();
            return decoder.decode(decryptedBuffer);
        } catch (error) {
            console.error('AES decryption failed:', error);
            throw new Error('Failed to decrypt data with AES.');
        }
    }

    // --- 하이브리드 암호화 ---
    // 5. 하이브리드 암호화 메인 함수
    static async encryptHybrid(plaintext, userNo) {
        let rsaPublicKeyPem;
        try {
            // 5-1. RSA 공개키 가져오기
            rsaPublicKeyPem = await CryptoService.fetchPublicKey(userNo);
            console.log('rsaPublicKeyPem', rsaPublicKeyPem);
            if (!rsaPublicKeyPem) {
                throw new Error(`RSA Public key not found in IndexedDB for userNo: ${userNo}`);
            }

            // 5-2. RSA 공개키 CryptoKey로 변환
            const rsaCryptoKey = await CryptoService.importRsaPublicKey(rsaPublicKeyPem);

            // 5-3. AES 키 생성
            const aesKey = await CryptoService.generateAesKey();

            // 5-4. 평문을 AES로 암호화 (암호문 + IV 반환)
            const { encryptedData, iv } = await CryptoService.encryptWithAes(aesKey, plaintext);

            // 5-5. AES 키 추출 (raw 형식)
            const aesKeyRaw = await window.crypto.subtle.exportKey('raw', aesKey);

            // 5-6. 추출된 AES 키를 RSA 공개키로 암호화
            const encryptedAesKeyBuffer = await window.crypto.subtle.encrypt(
                { name: 'RSA-OAEP' },
                rsaCryptoKey,
                aesKeyRaw
            );
            const encryptedAesKey = arrayBufferToBase64(encryptedAesKeyBuffer);

            // 5-7. 결과 반환
            return {
                encryptedData, // Base64 encoded ciphertext
                encryptedAesKey, // Base64 encoded, RSA encrypted AES key
                iv, // Base64 encoded IV
                userNo,
            };
        } catch (error) {
            const keySnippet = rsaPublicKeyPem ? `${rsaPublicKeyPem.substring(0, 20)}...` : '[Not Fetched]';
            console.error(`Hybrid encryption failed (User: ${userNo}, Key Snippet: ${keySnippet}):`, error);
            throw new Error(`Hybrid encryption failed for user ${userNo}: ${error.message}`);
        }
    }

    // 하이브리드 복호화 메인 함수
    static async decryptHybrid(decryptData, privateKeyPEM) {
        try {
            // 1. RSA 개인키 CryptoKey로 변환
            const rsaPrivateKey = await CryptoService.importRsaPrivateKey(privateKeyPEM);

            // 복호화 할 암호문 분리
            const encryptedData = decryptData.encryptedData;
            const encryptedAesKey = decryptData.encryptedAesKey;
            const iv = decryptData.iv;

            // 2. RSA로 암호화된 AES 키를 복호화
            const encryptedAesKeyBuffer = base64ToArrayBuffer(encryptedAesKey);
            const aesKeyRaw = await window.crypto.subtle.decrypt(
                { name: 'RSA-OAEP' },
                rsaPrivateKey,
                encryptedAesKeyBuffer
            );

            // 3. 복호화된 AES 키를 CryptoKey 객체로 가져오기
            const aesKey = await CryptoService.importAesKey(aesKeyRaw);
            // 4. AES로 암호화된 데이터를 복호화
            const plaintext = await CryptoService.decryptWithAes(aesKey, encryptedData, iv);
            return plaintext;
        } catch (error) {
            console.error(`Hybrid decryption failed:`, error);
            throw new Error(`Hybrid decryption failed: ${error.message}`);
        }
    }
}

// 데이터를 암호화하여 백엔드로 전송하는 함수
export async function sendEncryptedData(plaintext, userNo) {
    try {
        // 하이브리드 암호화 수행
        const hybridEncryptedPayload = await CryptoService.encryptHybrid(plaintext, userNo);

        // 백엔드 API로 전송 (백엔드는 이 구조를 처리할 수 있어야 함)
        const response = await fetch('http://localhost:8080/decrypt-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(hybridEncryptedPayload), // 전체 페이로드 전송
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Backend decryption failed: ${response.status} ${errorText}`);
        }

        const decryptedText = await response.text();
        console.log('🔓 백엔드에서 복호화된 데이터:', decryptedText);
        return decryptedText; // 필요시 복호화된 텍스트 반환
    } catch (error) {
        console.error('Error sending encrypted data:', error);
        throw error; // 오류를 다시 발생시켜 호출 측에서 처리하도록 함
    }
}
