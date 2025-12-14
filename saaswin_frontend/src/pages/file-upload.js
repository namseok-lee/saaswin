import React, { useState } from 'react';
import { fetcherPostFile } from '../utils/axios';

const FileUploadPage = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadParams, setUploadParams] = useState({ user_no: '', rprs_ognz_no: '', proc_nm: '' });
    const [uploadResult, setUploadResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [fileName, setFileName] = useState('파일을 선택하세요');

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setFileName(file.name);
            setUploadResult('');
        } else {
            setSelectedFile(null);
            setFileName('파일을 선택하세요');
        }
    };

    const handleParamChange = (event) => {
        const { name, value } = event.target;
        setUploadParams((prevParams) => ({
            ...prevParams,
            [name]: value,
        }));
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            alert('파일을 선택해주세요.');
            return;
        }

        setIsLoading(true);
        setUploadResult('업로드 중...');

        try {
            const params = { ...uploadParams };
            const result = await fetcherPostFile(selectedFile, params);
            setUploadResult(`✅ 업로드 성공: ${result}`);
            console.log('Upload successful:', result);
        } catch (error) {
            setUploadResult(`❌ 업로드 실패: ${error.message}`);
            console.error('Upload failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const styles = {
        container: {
            maxWidth: '600px',
            margin: '40px auto',
            padding: '30px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            fontFamily:
                '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',
            backgroundColor: '#fff',
        },
        title: {
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '25px',
            textAlign: 'center',
            color: '#333',
        },
        inputGroup: {
            marginBottom: '20px',
        },
        label: {
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#555',
        },
        input: {
            width: '100%',
            padding: '12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px',
            boxSizing: 'border-box',
        },
        fileInputContainer: {
            position: 'relative',
            display: 'inline-block',
            width: '100%',
        },
        fileInputButton: {
            display: 'inline-block',
            padding: '12px 20px',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#333',
            textAlign: 'center',
            width: '100%',
            boxSizing: 'border-box',
        },
        fileNameDisplay: {
            marginTop: '10px',
            fontSize: '13px',
            color: '#666',
            fontStyle: 'italic',
            textAlign: 'center',
        },
        uploadButton: {
            width: '100%',
            padding: '15px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            opacity: isLoading || !selectedFile ? 0.6 : 1,
        },
        resultMessage: {
            marginTop: '25px',
            padding: '15px',
            borderRadius: '4px',
            fontSize: '14px',
            textAlign: 'center',
        },
        successMessage: {
            backgroundColor: '#e6ffed',
            color: '#228b22',
            border: '1px solid #b7e4c7',
        },
        errorMessage: {
            backgroundColor: '#fff0f0',
            color: '#d9534f',
            border: '1px solid #f5c6cb',
        },
        loadingSpinner: {
            display: 'inline-block',
            width: '16px',
            height: '16px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            borderTopColor: '#fff',
            animation: 'spin 1s linear infinite',
            marginRight: '8px',
            verticalAlign: 'middle',
        },
    };

    const keyframes = `
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;

    return (
        <div style={styles.container}>
            <style>{keyframes}</style>
            <h1 style={styles.title}>파일 업로드</h1>

            <div style={styles.inputGroup}>
                <label style={styles.label} htmlFor="file-upload">파일 선택</label>
                <div style={styles.fileInputContainer}>
                    <label htmlFor="file-upload" style={styles.fileInputButton}>
                        {fileName}
                    </label>
                    <input
                        id="file-upload"
                        type="file"
                        onChange={handleFileChange}
                        style={{ position: 'absolute', left: '-9999px' }}
                    />
                </div>
            </div>

            <div style={styles.inputGroup}>
                <label style={styles.label} htmlFor="user_no">사용자 번호 (user_no)</label>
                <input
                    id="user_no"
                    type="text"
                    name="user_no"
                    value={uploadParams.user_no}
                    onChange={handleParamChange}
                    placeholder="WIN000019"
                    style={styles.input}
                />
            </div>

            <div style={styles.inputGroup}>
                <label style={styles.label} htmlFor="rprs_ognz_no">대표 조직 번호 (rprs_ognz_no)</label>
                <input
                    id="rprs_ognz_no"
                    type="text"
                    name="rprs_ognz_no"
                    value={uploadParams.rprs_ognz_no}
                    onChange={handleParamChange}
                    placeholder="WIN"
                    style={styles.input}
                />
            </div>

            <div style={styles.inputGroup}>
                <label style={styles.label} htmlFor="proc_nm">프로세스 이름 (proc_nm)</label>
                <input
                    id="proc_nm"
                    type="text"
                    name="proc_nm"
                    value={uploadParams.proc_nm}
                    onChange={handleParamChange}
                    placeholder="TEST"
                    style={styles.input}
                />
            </div>

            <div style={{ marginTop: '30px' }}>
                <button
                    onClick={handleUpload}
                    disabled={isLoading || !selectedFile}
                    style={styles.uploadButton}
                >
                    {isLoading ? (
                        <>
                            <span style={styles.loadingSpinner}></span>
                            업로드 중...
                        </>
                    ) : (
                        '업로드'
                    )}
                </button>
            </div>

            {uploadResult && (
                <div
                    style={{
                        ...styles.resultMessage,
                        ...(uploadResult.startsWith('❌') ? styles.errorMessage : styles.successMessage),
                    }}
                >
                    {uploadResult}
                </div>
            )}
        </div>
    );
};

export default FileUploadPage;
