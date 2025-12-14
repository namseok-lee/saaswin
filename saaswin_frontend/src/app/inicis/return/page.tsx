'use client';
import { useEffect, useState } from 'react';

// 서버 사이드 렌더링을 완전히 방지하는 컴포넌트
function NoSSR({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div style={{ 
                padding: '20px', 
                textAlign: 'center',
                fontFamily: 'Arial, sans-serif'
            }}>
                <h2>로딩 중...</h2>
            </div>
        );
    }

    return <>{children}</>;
}

function InicisReturnContent() {
    const [isLoading, setIsLoading] = useState(true);
    const [result, setResult] = useState<any>(null);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const processResult = () => {
            try {
                // URL 파라미터 안전하게 처리
                const urlParams = new URLSearchParams(window.location.search);
                const resultCode = urlParams.get('resultCode');
                const resultMsg = urlParams.get('resultMsg');
                const tid = urlParams.get('tid');
                const oid = urlParams.get('oid');
                const price = urlParams.get('price');

                console.log('이니시스 결제 결과:', {
                    resultCode,
                    resultMsg,
                    tid,
                    oid,
                    price,
                });

                // 파라미터가 없는 경우 처리
                if (!resultCode && !resultMsg && !tid && !oid && !price) {
                    setHasError(true);
                    setResult({
                        resultCode: 'NO_DATA',
                        resultMsg: '결제 정보를 찾을 수 없습니다.',
                        tid: '정보 없음',
                        oid: '정보 없음',
                        price: '정보 없음',
                    });
                    setIsLoading(false);
                    return;
                }

                setResult({
                    resultCode,
                    resultMsg,
                    tid,
                    oid,
                    price,
                });

                if (resultCode === '0000') {
                    alert('결제가 성공적으로 완료되었습니다.');
                    // TODO: 백엔드에 승인 요청 전송
                } else if (resultCode) {
                    alert(`결제 실패: ${resultMsg || '알 수 없는 오류'}`);
                }

                setIsLoading(false);
            } catch (error) {
                console.error('결제 결과 처리 중 오류:', error);
                setHasError(true);
                setResult({
                    resultCode: 'ERROR',
                    resultMsg: '결제 결과를 처리하는 중 오류가 발생했습니다.',
                    tid: '오류',
                    oid: '오류',
                    price: '오류',
                });
                setIsLoading(false);
            }
        };

        // 약간의 지연 후 처리
        setTimeout(processResult, 100);
    }, []);

    if (isLoading) {
        return (
            <div style={{ 
                padding: '20px', 
                textAlign: 'center',
                fontFamily: 'Arial, sans-serif'
            }}>
                <h2>결제 결과를 확인 중입니다...</h2>
                <p>잠시만 기다려주세요.</p>
            </div>
        );
    }

    const getStatusMessage = () => {
        if (hasError) {
            return {
                title: '⚠️ 결제 처리 중 문제가 발생했습니다',
                message: '결제 정보를 확인할 수 없습니다. 결제가 정상적으로 완료되었는지 확인해주세요.',
                backgroundColor: '#fff3cd',
                borderColor: '#ffeaa7'
            };
        }
        
        if (result?.resultCode === '0000') {
            return {
                title: '✅ 결제가 성공적으로 완료되었습니다',
                message: '결제가 정상적으로 처리되었습니다. 서비스 이용이 가능합니다.',
                backgroundColor: '#d4edda',
                borderColor: '#c3e6cb'
            };
        }
        
        if (result?.resultCode) {
            return {
                title: '❌ 결제에 실패했습니다',
                message: `오류 코드: ${result.resultCode} - ${result.resultMsg || '알 수 없는 오류'}`,
                backgroundColor: '#f8d7da',
                borderColor: '#f5c6cb'
            };
        }
        
        return {
            title: 'ℹ️ 결제 정보를 확인할 수 없습니다',
            message: '결제 정보를 찾을 수 없습니다. 다시 시도하시거나 관리자에게 문의해주세요.',
            backgroundColor: '#d1ecf1',
            borderColor: '#bee5eb'
        };
    };

    const status = getStatusMessage();

    return (
        <div style={{ 
            padding: '20px', 
            maxWidth: '600px', 
            margin: '0 auto',
            fontFamily: 'Arial, sans-serif'
        }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>결제 결과</h2>
            
            <div style={{ 
                backgroundColor: status.backgroundColor, 
                padding: '20px', 
                borderRadius: '8px',
                marginBottom: '20px',
                border: `1px solid ${status.borderColor}`
            }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#155724' }}>{status.title}</h3>
                <p style={{ margin: '0', lineHeight: '1.6' }}>{status.message}</p>
            </div>

            {result && (
                <div style={{ 
                    backgroundColor: '#f8f9fa', 
                    padding: '20px', 
                    borderRadius: '8px',
                    marginBottom: '20px',
                    border: '1px solid #dee2e6'
                }}>
                    <h4 style={{ margin: '0 0 15px 0', color: '#495057' }}>상세 정보</h4>
                    <div style={{ display: 'grid', gap: '10px' }}>
                        <div><strong>결과 코드:</strong> {result.resultCode || '정보 없음'}</div>
                        <div><strong>결과 메시지:</strong> {result.resultMsg || '정보 없음'}</div>
                        <div><strong>거래 ID:</strong> {result.tid || '정보 없음'}</div>
                        <div><strong>주문 번호:</strong> {result.oid || '정보 없음'}</div>
                        <div><strong>결제 금액:</strong> {result.price ? `${result.price}원` : '정보 없음'}</div>
                    </div>
                </div>
            )}
            
            <div style={{ textAlign: 'center' }}>
                <button 
                    onClick={() => {
                        // 부모 창이 있는지 확인
                        if (window.opener && !window.opener.closed) {
                            // 부모 창 새로고침
                            window.opener.location.reload();
                            // 부모 창으로 포커스 이동
                            window.opener.focus();
                            // 현재 창 닫기
                            window.close();
                        } else {
                            // 부모 창이 없거나 닫혀있으면 결제 관리 페이지로 이동 후 새로고침
                            window.location.href = '/settings/systemSetting/payManagement';
                        }
                    }}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: '500'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
                >
                    창 닫기
                </button>
            </div>
        </div>
    );
}

export default function InicisReturnPage() {
    return (
        <NoSSR>
            <InicisReturnContent />
        </NoSSR>
    );
}
