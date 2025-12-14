import React, { useState, useCallback } from 'react';
import { CryptoService } from '../services/CryptoService';

// Helper function to convert PEM public key string to ArrayBuffer (for SPKI format)
function pemToArrayBuffer(pem) {
    const base64String = pem
        .replace('-----BEGIN PUBLIC KEY-----', '')
        .replace('-----END PUBLIC KEY-----', '')
        .replace(/\s+/g, ''); // 모든 공백 문자 제거
    try {
        // Base64 문자열을 바이너리 문자열로 디코딩
        const binaryString = window.atob(base64String);
        const len = binaryString.length;
        // 바이너리 문자열을 Uint8Array로 변환
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        // Uint8Array의 기본 ArrayBuffer를 반환
        return bytes.buffer;
    } catch (error) {
        console.error('Base64 decoding failed:', error);
        // 유효하지 않은 Base64 문자열 오류 처리
        throw new Error('Invalid Base64 string in PEM key.');
    }
}

// Helper function to convert ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    // 이진 데이터를 Base64 문자열로 인코딩
    return window.btoa(binary);
}

// Base64 디코딩 후 RSA 공개 키를 Web Crypto API에서 사용할 수 있는 형태로 변환
async function importRSAPublicKey(base64Key) {
    const keyBuffer = base64ToArrayBuffer(base64Key);

    return await window.crypto.subtle.importKey('spki', keyBuffer, { name: 'RSA-OAEP', hash: 'SHA-256' }, false, [
        'encrypt',
    ]);
}

//문자열을 Base64 디코딩 후 ArrayBuffer로 변환
function base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);

    //디코딩된 바이너리 문자열을 아스키 숫자로 변환한 후 배열로 저장
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

function RSAEncryptionComponent() {
    const [plainText, setPlainText] = useState('');
    const [publicKeyPem, setPublicKeyPem] = useState('');
    const [encryptedOutput, setEncryptedOutput] = useState(null);
    const [backendResponse, setBackendResponse] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // 암호화 로직 - 사용자가 입력한 PEM 키 사용 (RSA 직접 암호화)
    const handleEncrypt = useCallback(async () => {
        // 입력값 유효성 검사
        if (!plainText || !publicKeyPem) {
            setError('Please provide both plaintext and a public key.');
            return;
        }
        // 상태 초기화
        setIsLoading(true);
        setError('');
        setEncryptedOutput(null); // 초기화
        setBackendResponse(''); // 응답 초기화

        try {
            // 1. PEM 형식의 공개키를 ArrayBuffer로 변환
            const keyBuffer = pemToArrayBuffer(publicKeyPem);

            // 2. Web Crypto API를 사용하여 공개키 임포트
            const publicKey = await window.crypto.subtle.importKey(
                'spki',
                keyBuffer,
                { name: 'RSA-OAEP', hash: 'SHA-256' },
                false,
                ['encrypt']
            );

            // 3. 평문을 UTF-8 바이트 배열로 인코딩
            const encodedPlainText = new TextEncoder().encode(plainText.trim());

            // 4. 암호화 수행 (RSA-OAEP)
            // *** 중요: 이 방식은 여전히 평문 길이 제한이 있음! ***
            // 긴 텍스트를 PEM 키로 직접 암호화하려면 여기도 하이브리드 방식 적용 필요
            const encryptedBuffer = await window.crypto.subtle.encrypt(
                { name: 'RSA-OAEP' },
                publicKey,
                encodedPlainText
            );

            // 5. 결과를 Base64 문자열로 변환하여 상태 업데이트
            const encryptedBase64 = arrayBufferToBase64(encryptedBuffer);
            setEncryptedOutput(encryptedBase64); // PEM 직접 암호화 결과는 Base64 문자열
        } catch (err) {
            console.error('PEM Encryption error:', err);
            // OperationError 시 평문 길이 문제일 수 있음을 명시
            const message =
                err.name === 'OperationError'
                    ? `Encryption failed. The plaintext might be too long for direct RSA encryption with the provided PEM key. Error: ${err.message}`
                    : `Encryption failed: ${err.message}`;
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, [plainText, publicKeyPem]);

    // 하이브리드 암호화 및 백엔드 전송
    const handleHybridEncryptAndSend = useCallback(async () => {
        let userNo = null;
        try {
            const authDataString = localStorage.getItem('auth');
            if (!authDataString) {
                setError('Auth data not found in localStorage. Please login again.');
                return;
            }
            const authData = JSON.parse(authDataString);
            if (authData && authData.state && authData.state.userNo) {
                userNo = authData.state.userNo;
            } else {
                setError('User No not found within auth data in localStorage.');
                return;
            }
        } catch (parseError) {
            console.error('Error parsing auth data from localStorage:', parseError);
            setError('Failed to parse auth data from localStorage.');
            return;
        }

        if (!plainText) {
            setError('Please provide plaintext to encrypt.');
            return;
        }

        setIsLoading(true);
        setError('');
        setEncryptedOutput(null); // 이전 암호화 결과 초기화
        setBackendResponse(''); // 이전 백엔드 응답 초기화

        try {
            // 1. CryptoService의 하이브리드 암호화 함수 사용
            const hybridResult = await CryptoService.encryptHybrid(plainText, userNo);
            // 암호화 결과 표시 (디버깅용)
            setEncryptedOutput(JSON.stringify(hybridResult, null, 2));

            // 2. 백엔드 전송 페이로드 생성 (userNo 포함)
            const payloadToSend = {
                ...hybridResult,
                userNo: userNo,
            };

            // 3. 백엔드 API 호출
            const response = await fetch('http://localhost:9001/api/encryption/decrypt-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payloadToSend),
            });

            // 4. 백엔드 응답 처리
            const responseText = await response.text(); // 응답은 텍스트로 가정
            if (!response.ok) {
                // 서버 오류 응답 처리
                console.error('Backend error:', response.status, responseText);
                throw new Error(`Backend request failed: ${response.status} ${responseText}`);
            }

            // 백엔드 응답 성공 시
            setBackendResponse(`Backend decrypted: ${responseText}`);
        } catch (err) {
            console.error('Hybrid Encryption or Backend Send failed:', err);
            setError(`Operation failed: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [plainText]); // 의존성 배열에 userNo는 필요 없음 (함수 내에서 가져옴)

    // JSX 렌더링
    return (
        <div>
            <h2>RSA Encryption (Frontend - React)</h2>
            {/* PEM Key Input */}
            <div>
                <label htmlFor='publicKey'>Public Key (PEM format):</label>
                <br />
                <textarea
                    id='publicKey'
                    rows='8'
                    cols='60'
                    value={publicKeyPem}
                    onChange={(e) => setPublicKeyPem(e.target.value)}
                    placeholder='-----BEGIN PUBLIC KEY-----&#10;...&#10;-----END PUBLIC KEY-----'
                />
            </div>

            {/* Plain Text Input */}
            <div>
                <label htmlFor='plaintext'>Plain Text:</label>
                <br />
                <textarea
                    id='plaintext'
                    rows='4'
                    cols='60'
                    value={plainText}
                    onChange={(e) => setPlainText(e.target.value)}
                    placeholder='Enter text to encrypt'
                />
            </div>
            {/* 버튼 그룹 */}
            <div>
                {/* PEM 키 사용 버튼 (RSA 직접 암호화 - 평문 길이 제한 있음!) */}
                <button onClick={handleEncrypt} disabled={isLoading || !publicKeyPem} style={{ marginRight: '10px' }}>
                    {isLoading ? 'Encrypting...' : 'Encrypt with PEM Key (Direct RSA)'}
                </button>
                {/* IndexedDB 키 사용 및 백엔드 전송 버튼 (하이브리드) */}
                <button onClick={handleHybridEncryptAndSend} disabled={isLoading}>
                    {isLoading ? 'Encrypting & Send...' : 'Encrypt (Hybrid) & Send to Backend'}
                </button>
            </div>
            {/* 오류 메시지 표시 */}
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            {/* 암호화 결과 표시 (디버깅용) */}
            {encryptedOutput && (
                <div style={{ marginTop: '10px' }}>
                    <h3>Encrypted Payload (for Backend):</h3>
                    <textarea
                        readOnly
                        rows={10} // JSON 이므로 길게
                        cols='60'
                        value={encryptedOutput} // JSON 문자열
                    />
                </div>
            )}
            {/* 백엔드 응답 표시 */}
            {backendResponse && (
                <div style={{ marginTop: '10px' }}>
                    <h3>Backend Response:</h3>
                    <p>{backendResponse}</p>
                </div>
            )}
        </div>
    );
}

export default RSAEncryptionComponent;
