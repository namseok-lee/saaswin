'use client';

import styles from '../../styles/pages/templateApply/page.module.scss';
import { useEffect, useRef, useState } from 'react';
import { FileUploader } from 'react-drag-drop-files';
import { CircularProgress } from '@mui/material';
import { IcoFile, IcoTrash, IcoUpload } from '@/assets/Icon';
import Button from 'components/Button';
import { useAuthStore } from 'utils/store/auth';
import { fetcherGetFileDown, fetcherGetFileInfo, fetcherPostFile } from 'utils/axios';
import Typography from 'components/Typography';
import SwModal from '../Modal';

interface AttachFileModalProps {
    params: any;
    setParams: (params: any) => void;
    changeDifferRow?: (newRow: any, row: any, field: string) => void;
}

const AttachFileModal = ({ params, setParams, changeDifferRow }: AttachFileModalProps) => {
    // 로그인한 사용자번호
    const userNo = useAuthStore((state) => state.userNo);
    const [attachFileList, setAttachFileList] = useState([]);
    const { colDef, isEditable, row, api, field, value } = params?.params;
    console.log(value);
    const procType = colDef?.procType;

    // 로딩
    const [loading, setLoading] = useState(false);

    // 오류메시지
    const [errorMsg, setErrorMsg] = useState('');

    // 업로드가능한 파일 확장자
    const fileTypes = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'jpg', 'png', 'jpeg'];

    // 파일 Input Ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 파일 변경 핸들러 (드래그 앤 드롭 및 파일 선택)
    const handleFileChange = (files: File | FileList) => {
        //const fileList = Array.isArray(files) ? files : [files];

        // FileList인 경우 배열로 변환
        const fileList = files instanceof FileList ? Array.from(files) : [files];

        // 유효한 파일 필터링
        const validFiles = fileList.filter((file) => {
            // 파일 크기 제한 (예: 50MB)
            const maxSize = 50 * 1024 * 1024;
            if (file.size > maxSize) {
                setErrorMsg(`${file.name}의 파일 크기가 50MB를 초과합니다.`);
                return false;
            }

            // 확장자 검증
            const fileExtension = file.name.split('.').pop()?.toLowerCase();
            if (!fileTypes.includes(fileExtension || '')) {
                setErrorMsg(`${file.name}은 허용되지 않은 파일 형식입니다.`);
                return false;
            }

            return true;
        });

        // 유효한 파일만 추가 (중복 제거)
        const newFiles = validFiles.filter(
            (newFile) => !attachFileList.some((existFile) => existFile.name === newFile.name)
        );

        setLoading(true);
        try {
            // 파일 업로드
            const item = {
                user_no: userNo,
                proc_nm: procType, // process.env.NEXT_PUBLIC_EFS_UPLOAD_THUMBNAIL_PATH,
            };
            newFiles.forEach((file) => {
                fetcherPostFile(file, item)
                    .then((fileId) => {
                        // 썸네일 생성 후 파일 ID 저장
                        fetcherGetFileInfo(fileId)
                            .then((response) => {
                                // 파일 추가
                                setAttachFileList((prevFiles) => [...prevFiles, response]);
                            })
                            .catch((error) => {
                                console.error(error);
                            });
                    })
                    .catch((error) => {
                        console.error('썸네일 파일 업로드 중 오류 발생:', error);
                    });
            });
        } catch (error) {
            console.error('파일 업로드 중 오류 발생:', error);
            setErrorMsg('파일 업로드 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 추가 버튼 클릭 시 파일 다이얼로그 오픈
    const onUpload = () => {
        fileInputRef.current?.click();
    };

    // 업로드
    const handleChange = (selectedFiles: File) => {
        setAttachFileList(selectedFiles);
    };

    // 오류
    const handleTypeError = () => {
        setErrorMsg('허용되지 않은 파일 형식입니다.');
    };

    // 파일 삭제
    const handleFileRemove = (file) => {
        setAttachFileList((prevFiles) => prevFiles.filter((prevFiles) => prevFiles.file_id !== file.file_id));
    };

    // 모달 닫을 때 fildId 엄데이트
    const onClose = () => {
        const fileIdList = attachFileList.map((item) => item.file_id);

        api.setEditCellValue({
            id: params.id,
            field: params.field,
            value: fileIdList ?? null,
        });

        const newRow = {
            ...row,
            [field]: fileIdList,
        };

        if (changeDifferRow !== undefined) {
            changeDifferRow(newRow, row, '');
        }
        setParams({ open: false });
    };

    // 파일 다운로드
    const handleFileDownload = (file) => {
        fetcherGetFileDown(file.file_id)
            .then((data) => {
                // 파일 확장자에 따른 MIME 타입 설정
                let mimeType = 'application/octet-stream';
                if (file.orgnfl_extn_nm === 'pdf') {
                    mimeType = 'application/pdf';
                } else if (file.orgnfl_extn_nm === 'png') {
                    mimeType = 'image/png';
                } else if (file.orgnfl_extn_nm === 'jpg' || file.orgnfl_extn_nm === 'jpeg') {
                    mimeType = 'image/jpeg';
                } else if (file.orgnfl_extn_nm === 'ppt') {
                    mimeType = 'application/vnd.ms-powerpoint';
                } else if (file.orgnfl_extn_nm === 'pptx') {
                    mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
                } else if (file.orgnfl_extn_nm === 'doc') {
                    mimeType = 'application/msword';
                } else if (file.orgnfl_extn_nm === 'docx') {
                    mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                } else if (file.orgnfl_extn_nm === 'xls') {
                    mimeType = 'application/vnd.ms-excel';
                } else if (file.orgnfl_extn_nm === 'xlsx') {
                    mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                } else if (file.orgnfl_extn_nm === 'gif') {
                    mimeType = 'image/gif';
                } else if (file.orgnfl_extn_nm === 'svg') {
                    mimeType = 'image/svg+xml';
                } else if (file.orgnfl_extn_nm === 'hwp') {
                    mimeType = 'application/x-hwp';
                } else if (file.orgnfl_extn_nm === 'hwpx') {
                    mimeType = 'application/x-hwpx';
                } else if (file.orgnfl_extn_nm === 'zip') {
                    mimeType = 'application/zip';
                }

                // Blob 생성
                const blob = new Blob([data], { type: mimeType });
                const url = window.URL.createObjectURL(blob);

                // 파일 이름
                const filename = `${file.orgnfl_nm}.${file.orgnfl_extn_nm}`;

                // <a> 태그 생성 후 다운로드 트리거
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            })
            .catch((error) => {
                console.error('파일 다운로드 중 오류 발생:', error);
            });
    };

    // 파일 크기 포맷팅
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // 모달 열 때 파일 조회해서 세팅
    useEffect(() => {
        if (value) {
            setLoading(true);
            try {
                value.forEach((fileId: string) => {
                    fetcherGetFileInfo(fileId)
                        .then((response) => {
                            // 파일 추가
                            setAttachFileList((prevFiles) => [...prevFiles, response]);
                        })
                        .catch((error) => {
                            console.error(error);
                        });
                });
            } catch (error) {
                console.error('파일 조회 중 오류 발생:', error);
                setErrorMsg('파일 조회 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        }
    }, [params]);

    return (
        <SwModal open={params.open} onClose={onClose} title='첨부 파일' size='md' className={styles.attachFile}>
            <section className={`${styles.attachFile} ${styles.section}`}>
                <div className={styles.fileTitle}>
                    <Typography title='첨부 파일' type='section' className={styles.sectionTit}>
                        첨부파일
                    </Typography>
                    {/* 수정 가능할 때만 추가 버튼 표시 */}
                    {isEditable && (
                        <Button
                            id='btnDefault11'
                            type='default'
                            size='sm'
                            className={`btnWithIcon ${styles.btnAddFile}`}
                            onClick={onUpload}
                        >
                            추가
                        </Button>
                    )}
                </div>
                {/* 숨겨진 파일 입력 */}
                <input
                    type='file'
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    multiple
                    accept={fileTypes.map((type) => `.${type}`).join(',')}
                    onChange={(e) => {
                        if (!isEditable) return; // 수정 불가능하면 무시
                        const files = e.target.files;
                        if (files) {
                            handleFileChange(files);
                        }
                    }}
                />

                <div className='dragNdropFile'>
                    {attachFileList.length === 0 ? (
                        <FileUploader
                            handleChange={isEditable ? handleFileChange : () => {}} // 수정 불가능하면 빈 함수
                            name='files'
                            types={fileTypes}
                            classes='dropArea'
                            onTypeError={handleTypeError}
                            hoverTitle=''
                            dropMessageStyle={{ display: 'none' }}
                            multiple={true}
                            disabled={!isEditable} // 수정 불가능하면 비활성화
                        >
                            {loading ? (
                                <CircularProgress size={120} />
                            ) : (
                                <div className='fileDrop'>
                                    <IcoUpload />
                                    <p className='guideText'>
                                        {isEditable ? (
                                            <>
                                                여기를 클릭 해 파일을 업로드 하거나, <br />
                                                파일을 여기로 드래그하세요.
                                            </>
                                        ) : (
                                            '첨부된 파일이 없습니다.'
                                        )}
                                    </p>
                                </div>
                            )}
                        </FileUploader>
                    ) : (
                        <div className={`fileList ${styles.fileList}`}>
                            <ul className='list'>
                                {attachFileList.map((file, index) => (
                                    <li key={index} className='item'>
                                        <div className='fileInfo'>
                                            <IcoFile fill='#7C7C7C' />
                                            <p onClick={() => handleFileDownload(file)}>
                                                {file.orgnfl_nm} ({formatFileSize(file.orgnfl_sz)})
                                            </p>
                                        </div>
                                        {/* 수정 가능할 때만 삭제 버튼 표시 */}
                                        {isEditable && (
                                            <Button id='' onClick={() => handleFileRemove(file)} className='btnDelete'>
                                                <IcoTrash fill='#666' />
                                            </Button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className='fileSize'>
                        ({' '}
                        {attachFileList.length > 0
                            ? `${attachFileList.reduce((acc, file) => acc + file.orgnfl_sz, 0)} KB`
                            : '0 MB'}{' '}
                        /20MB)
                    </div>
                    {errorMsg && <p className='errorMsg'>{errorMsg}</p>}
                </div>
            </section>
        </SwModal>
    );
};

export default AttachFileModal;
