'use client';
import React, { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import { randomId } from '@mui/x-data-grid-generator';
import { useGridApiRef } from '@mui/x-data-grid-premium';
import dayjs from 'dayjs';
import { FileUploader } from 'react-drag-drop-files';
import { Document, Page, pdfjs } from 'react-pdf';
import { CircularProgress, TextField } from '@mui/material';
import { IcoUpload, IcoArrow, IcoChageFile, IcoCheckFill } from '@/assets/Icon';

// 커스텀 컴포넌트 임포트
import Button from 'components/Button';
import SwModal from 'components/Modal';
import styles from '../../../styles/pages/Template/page.module.scss';
import { useAuthStore } from '@/utils/store/auth';

// 세 개의 분리된 컴포넌트 임포트
import LeftSidebar from 'components/eformsuite/contract/LeftSidebar';
import CenterContent from 'components/eformsuite/contract/CenterContent';
import RightSidebar from 'components/eformsuite/contract/RightSidebar';

// 유틸리티 임포트
import {
    fetcherGetImage,
    fetcherPostCommonData,
    fetcherPostCommonSave,
    fetcherPostEfsUploadFile,
    fetcherPostFile,
} from 'utils/axios';
import { validateJsonFields } from '@/utils/validation/valid';
import InputTextBox from '@/components/InputTextBox';

// 타입 정의
interface ParamsType {
    template_info?: {
        tmplt_id?: string;
        task_clsf_cd?: string;
        doc_knd_cd?: string;
        file?: File;
        component_info?: ComponentState[];
        rprs_ognz_no?: string;
        tmplt_tit?: string;
        file_id?: string;
        thumbnail_file_id?: string;
    };
    open?: boolean;
    isEditMode?: boolean;
    templateToEdit?: any;
}

export interface ComponentState {
    id: string;
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
    type: string;
    name?: string; // 컴포넌트 이름
    required?: boolean; // 필수 입력 여부
    readonly?: boolean; // 읽기 전용
    displayText?: string; // 표시 문구
    placeholder?: string; // 가이드 문구
    options?: string[]; // 드롭다운 옵션 목록
    textFormat?: string; // 텍스트 형식
    dateFormat?: string; // 날짜 형식
    minValue?: number; // 최소값 (숫자 컴포넌트)
    maxValue?: number; // 최대값 (숫자 컴포넌트)
    labelText?: string; // 레이블 텍스트 (체크박스, 라디오, 레이블)
    url?: string; // URL (링크 컴포넌트)
    linkText?: string; // 링크 텍스트 (링크 컴포넌트)
    fileTypes?: string[]; // 허용 파일 형식 (파일 컴포넌트)
    groupName?: string; // 라디오 버튼 그룹
}

interface TemplateSubmitData {
    action_type: string;
    tmplt_id: string;
    task_clsf_cd?: string;
    doc_knd_cd?: string;
    rprs_ognz_no?: string;
    tmplt_tit: string;
    tmplt_reg_dt: string;
    file_id: string;
    thumbnail_file_id: string;
    component_info: ComponentState[];
    scr_no: string;
    del_yn: string;
}

// 상수 정의
const FONT_FAMILY_LIST = ['Arial', 'Roboto', 'Noto Sans KR'];
const FONT_SIZE_LIST = [8, 9, 10, 11, 12, 14, 16, 18, 24, 32, 48];
const FONT_FAMILY_OPTIONS = FONT_FAMILY_LIST.map((font) => ({
    value: font,
    label: font,
}));

// 메인 컴포넌트
const TemplateCreateFullDialog = ({
    open,
    handleClose,
    tpcd,
    params,
    setParams,
}: {
    open: boolean;
    handleClose: () => void;
    tpcd: string;
    params: ParamsType;
    setParams: Dispatch<SetStateAction<ParamsType>>;
}) => {
    // ============================
    // 상태 관리
    // ============================

    // 기본 상태
    const [files, setFiles] = useState<File | null>(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<File | null>(null);
    const [numPages, setNumPages] = useState<number>(0);
    const [templateName, setTemplateName] = useState<string>('');
    const [ariaDisplay, setAreaDisplay] = useState(true);
    const [tmpltData, setTmpltData] = useState<any>({});
    const [documentScale, setDocumentScale] = useState<number>(1);

    // 컴포넌트 상태
    const [components, setComponents] = useState<ComponentState[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [currentComponent, setCurrentComponent] = useState<Partial<ComponentState> | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(0);

    // UI 상태
    const [activeStep, setActiveStep] = useState(1);
    const [openAlert, setOpenAlert] = useState(false);
    const [step, setStep] = useState([]);
    const [open3, setOpen3] = useState(true);

    // 스타일 상태
    const [fontSize, setFontSize] = useState<number>(10);
    const [fontFamily, setFontFamily] = useState<string>('Arial');
    const [bold, setBold] = useState<boolean>(false);
    const [italic, setItalic] = useState<boolean>(false);
    const [underline, setUnderline] = useState<boolean>(false);
    const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('left');

    // 폼 입력 상태
    const [inputValues, setInputValues] = useState({ searchDataItem: '' });
    const [inputTextValues, setInputTextValues] = useState({
        test1: '',
        test2: '',
        test3: '',
        test4: '',
        test5: '',
    });
    const [valid, setValid] = useState(false);
    const [validText, setValidText] = useState('');
    const [selectedValues, setSelectedValues] = useState({ test1: [1, 2, 3] });
    const [isChecked1, setIsChecked1] = useState(false);

    // 미리보기
    const [currentPreviewPage, setCurrentPreviewPage] = useState<number>(1);
    const [thumbnailScale, setThumbnailScale] = useState<number>(0.2);

    // 그리드 상태
    const gridRef = useGridApiRef();
    const [rows, setRows] = useState([]);

    // ============================
    // Refs
    // ============================
    const templateFileId = useRef('');
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const mouseRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number>(0);
    const targetX = useRef(0);
    const targetY = useRef(0);
    const currentX = useRef(0);
    const currentY = useRef(0);

    // ============================
    // 상수 및 설정값
    // ============================
    const userNo = useAuthStore((state) => state.userNo);

    const speed = 1;
    const tpcdParam = tpcd;

    const options = {
        test1: [
            { value: 1, label: 'Option A' },
            { value: 2, label: 'Option B' },
            { value: 3, label: 'Option C' },
        ],
    };

    const [canvasDimensions, setCanvasDimensions] = useState<{
        width: number;
        height: number;
    }>({ width: 0, height: 0 });

    // 편집 모드 감지
    const isEditMode = params.isEditMode || false;
    const templateToEdit = params.templateToEdit || null;

    // ============================
    // 유틸리티 함수
    // ============================

    // PDF 관련 함수
    const onLoadSuccess = ({ numPages }: { numPages: number }) => {
        console.log(`PDF 로드 완료: ${numPages}페이지`);
        setNumPages(numPages);
    };

    const onPageLoadSuccess = (pageWidth: number, pageHeight: number, pageNumber: number) => {
        console.log(`페이지 ${pageNumber} 로드 성공: ${pageWidth}x${pageHeight}`);
        setCanvasDimensions({ width: pageWidth, height: pageHeight });
    };

    // 입력 폼 관련 함수
    const handleSearchBox = (id: string, value: string) => {
        setInputValues((prev) => ({ ...prev, [id]: value }));
    };

    const handleTextChange = (id: string, value: string) => {
        if (value === '1234') {
            setValid(true);
            setValidText('잘못입력함');
        } else {
            setValid(false);
            setValidText('');
        }
        setInputTextValues((prev) => ({ ...prev, [id]: value }));
    };

    const handleTextDelete = (id: string) => {
        setValid(false);
        setValidText('');
        setInputTextValues((prev) => ({ ...prev, [id]: '' }));
    };

    const handleSelectChange = (id: string) => (e: any) => {
        setSelectedValues((prev) => ({
            ...prev,
            [id]: e.target.value,
        }));
    };

    const handleDocumentScaleChange = (scale: number) => {
        setDocumentScale(scale);
    };

    // 컴포넌트 관련 함수
    const addComponent = (pageNumber: number, type: string) => {
        setIsCreating(true);
        setCurrentPage(pageNumber);

        // 컴포넌트 타입에 따른 기본 크기 설정
        const componentDefaults: Record<string, { width: number; height: number }> = {
            textbox: { width: 100, height: 30 },
            datepicker: { width: 150, height: 30 },
            sign: { width: 75, height: 75 },
            checkbox: { width: 30, height: 30 },
            radio: { width: 30, height: 30 },
            combobox: { width: 150, height: 30 },
            number: { width: 100, height: 30 },
            link: { width: 150, height: 30 },
            file: { width: 150, height: 30 },
            insait_seal: { width: 75, height: 75 },
        };

        const defaults = componentDefaults[type] || { width: 100, height: 30 };

        // 공통 속성 설정
        const commonProperties = {
            type,
            width: defaults.width,
            height: defaults.height,
            readonly: false,
            required: false,
            fontFamily: '굴림', // 기본 글꼴
            fontSize: 12, // 기본 글자 크기
            textColor: '#000000', // 기본 글자 색
            textFormat: 'normal', // 기본 글자 포맷
            textAlign: 'left', // 기본 좌우 정렬
            verticalAlign: 'top', // 기본 세로 정렬
        };

        // 컴포넌트 타입별 특화 속성 설정
        let defaultProperties: Partial<ComponentState> = { ...commonProperties };

        // 타입별 추가 속성 설정
        switch (type) {
            case 'textbox':
                defaultProperties = {
                    ...defaultProperties,
                    name: `${type}_${components.filter((c) => c.type === 'textbox').length + 1}`,
                    displayText: '',
                    placeholder: '텍스트를 입력하세요',
                };
                break;
            case 'datepicker':
                defaultProperties = {
                    ...defaultProperties,
                    name: `${type}_${components.filter((c) => c.type === 'datepicker').length + 1}`,
                    dataType: 'date',
                    dateFormat: 'YYYY-MM-DD',
                    timeFormat: 'HH:MM',
                    placeholder: '날짜 선택',
                };
                break;
            case 'sign':
                defaultProperties = {
                    ...defaultProperties,
                    name: `${type}_${components.filter((c) => c.type === 'sign').length + 1}`,
                    placeholder: '여기에 서명하세요',
                };
                break;
            case 'checkbox':
                defaultProperties = {
                    ...defaultProperties,
                    name: `${type}_${components.filter((c) => c.type === 'checkbox').length + 1}`,
                    groupName: '',
                    defaultSelected: false,
                };
                break;
            case 'radio':
                defaultProperties = {
                    ...defaultProperties,
                    name: `${type}_${components.filter((c) => c.type === 'radio').length + 1}`,
                    groupName: `그룹${randomId().slice(0, 5)}`,
                    defaultSelected: false,
                };
                break;
            case 'combobox':
                defaultProperties = {
                    ...defaultProperties,
                    name: `${type}_${components.filter((c) => c.type === 'combobox').length + 1}`,
                    options: ['option1', 'option2', 'option3'],
                    defaultValue: '',
                    placeholder: '옵션을 선택하세요',
                };
                break;
            case 'number':
                defaultProperties = {
                    ...defaultProperties,
                    name: `${type}_${components.filter((c) => c.type === 'number').length + 1}`,
                    allowNegative: false,
                    displayText: '',
                    placeholder: '숫자 입력',
                };
                break;
            case 'link':
                defaultProperties = {
                    ...defaultProperties,
                    name: `${type}_${components.filter((c) => c.type === 'link').length + 1}`,
                    url: 'https://',
                    displayText: '링크 텍스트',
                    placeholder: '',
                };
                break;
            case 'file':
                defaultProperties = {
                    ...defaultProperties,
                    name: `${type}_${components.filter((c) => c.type === 'file').length + 1}`,
                    placeholder: '파일을 선택하세요',
                    attachFile: false,
                };
                break;
            default:
                defaultProperties.name = `${type}_${components.filter((c) => c.type === type).length + 1}`;
        }

        setCurrentComponent(defaultProperties);
    };

    // 컴포넌트 위치/크기 관련 함수
    const handleMouseMove = (e: React.MouseEvent) => {
        targetX.current = e.clientX;
        targetY.current = e.clientY;
    };

    const animate = useCallback(() => {
        currentX.current += (targetX.current - currentX.current) * speed;
        currentY.current += (targetY.current - currentY.current) * speed;

        if (mouseRef.current) {
            mouseRef.current.style.transform = `translate(${currentX.current}px, ${currentY.current}px)`;
        }

        requestRef.current = requestAnimationFrame(animate);
    }, []);

    const handleMouseDown = (e: React.MouseEvent, pageNumber: number) => {
        if (!isCreating || !currentComponent) return;

        // 클릭한 요소의 정확한 위치를 찾기 위해 직접 클릭한 페이지 요소를 찾습니다
        const pageElement = (e.target as HTMLElement).closest('.react-pdf__Page') as HTMLElement;
        if (!pageElement) return;

        // 페이지 요소의 경계 정보를 가져옵니다
        const pageBoundingRect = pageElement.getBoundingClientRect();

        // 마우스 클릭 좌표를 페이지 기준으로 계산합니다
        const x = e.clientX - pageBoundingRect.left;
        const y = e.clientY - pageBoundingRect.top;

        // 모든 currentComponent 속성을 새로운 컴포넌트에 추가합니다
        setComponents((prev) => [
            ...prev,
            {
                id: randomId(),
                page: pageNumber,
                x,
                y,
                ...currentComponent, // 모든 기본 속성을 가져옵니다
            },
        ]);

        setIsCreating(false);
        setCurrentComponent(null);
    };

    const handleResize = (id: string, width: number, height: number, x: number, y: number) => {
        // 컴포넌트 크기 및 위치 업데이트
        handleComponentUpdate(id, { width, height, x, y });
    };

    const handleDrag = (id: string, x: number, y: number) => {
        setComponents(components.map((component) => (component.id === id ? { ...component, x, y } : component)));
    };

    const handleSelect = (id: string) => {
        setSelectedId(id);
    };

    const handleDelete = () => {
        if (selectedId) {
            setComponents(components.filter((component) => component.id !== selectedId));
            setSelectedId(null);
        }
    };

    const handleClickOutside = () => {
        setSelectedId(null);
    };

    // 파일 업로드 관련 함수
    const handleChange = (selectedFile: File) => {
        setFiles(selectedFile);
        setErrorMsg('');
    };

    const handleTypeError = () => {
        setErrorMsg('허용되지 않은 파일 형식입니다.');
    };

    const handleSubmit = async () => {
        if (!files) {
            alert('파일을 업로드해 주세요.');
            return;
        }

        setLoading(true);
        try {
            // 기존 컴포넌트와 관련 상태 초기화
            setImages(null);
            setNumPages(0);
            setComponents([]);
            setSelectedId(null);

            const fileId = await fetcherPostEfsUploadFile(files, {
                user_no: userNo,
            });
            templateFileId.current = fileId;

            fetcherGetImage(templateFileId.current)
                .then((response) => {
                    const pdfData = new Uint8Array(response);
                    const blob = new Blob([pdfData], { type: 'application/pdf' });
                    const file = new File([blob], 'downloaded.pdf', {
                        type: 'application/pdf',
                    });
                    setImages(file);
                })
                .catch((error) => {
                    console.log('error', error);
                    console.error(error);
                });
        } catch (error) {
            console.error('파일 업로드 중 오류 발생:', error);
        } finally {
            setLoading(false);
            setAreaDisplay(false);
        }
    };

    // 템플릿 저장 관련 함수
    const onTemplateSubmit = (isTemporary: boolean = false) => {
        const aaa = {
            action_type: 'I',
            task_clsf_cd: params.template_info?.task_clsf_cd || randomId(),
            doc_knd_cd: params.template_info?.doc_knd_cd || randomId(),
            tmplt_tit: templateName,
            tmplt_reg_dt: dayjs().format('YYYYMMDDHHmmss'),
            file_id: templateFileId.current,
            thumbnail_file_id: '',
            component_info: components,
            scr_no: tpcdParam,
        };
        console.log('aaa', aaa);

        // 편집 모드 확인
        const isEditingTemplate = params.isEditMode || false;

        // 템플릿 이름 확인
        if (templateName === '') {
            alert('템플릿명을 입력해주세요');
            return;
        }

        // 파일 확인 (편집 모드에서는 확인 안 함)
        if (!isEditingTemplate && !images && !templateFileId.current) {
            alert('파일을 업로드해 주세요.');
            return;
        }

        // 편집 모드에 따라 다른 데이터 준비
        let actionType = 'I'; // 기본값: Insert
        let submitData: TemplateSubmitData;

        if (isEditingTemplate) {
            // 편집 모드: 복합 키와 수정 대상 필드만 포함
            actionType = 'U'; // Update

            if (!params.template_info || !params.template_info.tmplt_id) {
                alert('수정할 템플릿 정보가 올바르지 않습니다');
                return;
            }

            // 편집 모드에서는 기존 파일 ID와 썸네일 ID 유지
            submitData = {
                action_type: actionType,
                tmplt_id: params.template_info.tmplt_id,
                rprs_ognz_no: params.template_info.rprs_ognz_no,
                task_clsf_cd: params.template_info.task_clsf_cd,
                doc_knd_cd: params.template_info.doc_knd_cd,
                tmplt_tit: templateName,
                component_info: components,
                tmplt_reg_dt: dayjs().format('YYYYMMDDHHmmss'),
                file_id: params.template_info.file_id || templateFileId.current,
                thumbnail_file_id: params.template_info.thumbnail_file_id || '',
                scr_no: tpcdParam,
                del_yn: 'N',
            };

            console.log('템플릿 수정 데이터:', submitData);

            // 편집 모드에서는 파일 업로드 과정 없이 바로 API 호출
            const param_data: TemplateSubmitData[] = [submitData];

            const items = [
                {
                    sqlId: '0',
                    params: param_data,
                },
            ];

            console.log('저장 요청 데이터:', items);

            // 템플릿 저장 요청
            fetcherPostCommonSave(items)
                .then((response) => {
                    alert('수정되었습니다.');
                    // 임시저장인 경우 닫지 않음, 저장 완료인 경우 닫음
                    if (!isTemporary) {
                        handleConfirmClose(); // 성공 후 창 닫기
                    }
                })
                .catch((error) => {
                    alert('오류가 발생하였습니다.');
                    console.error(error);
                });
        } else {
            // 신규 추가 모드: 기존 코드 유지
            // 신규 추가 모드
            const newTmpltId = randomId(); // UUID 생성

            submitData = {
                action_type: 'I',
                tmplt_id: newTmpltId,
                task_clsf_cd: params.template_info?.task_clsf_cd || randomId(),
                doc_knd_cd: params.template_info?.doc_knd_cd || randomId(),
                rprs_ognz_no: params.template_info?.rprs_ognz_no,
                tmplt_tit: templateName,
                tmplt_reg_dt: dayjs().format('YYYYMMDDHHmmss'),
                file_id: templateFileId.current,
                thumbnail_file_id: '',
                component_info: components,
                scr_no: tpcdParam,
                del_yn: 'N',
            };

            // 2. 신규 모드에서만 썸네일 처리
            if (images) {
                const canvas = document.createElement('canvas');

                pdfjs
                    .getDocument({ url: URL.createObjectURL(images) })
                    .promise.then((pdfDoc) => {
                        pdfDoc
                            .getPage(1)
                            .then((page) => {
                                const scale = 0.5;
                                const viewport = page.getViewport({ scale });

                                canvas.width = viewport.width;
                                canvas.height = viewport.height;

                                const context = canvas.getContext('2d');
                                if (context) {
                                    page.render({
                                        canvasContext: context,
                                        viewport,
                                    })
                                        .promise.then(() => {
                                            canvas.toBlob((blob) => {
                                                if (blob) {
                                                    const file = new File([blob], 'thumbnail.png', {
                                                        type: 'image/png',
                                                    });

                                                    const params = {
                                                        user_no: userNo,
                                                        proc_nm: process.env.NEXT_PUBLIC_EFS_UPLOAD_THUMBNAIL_PATH,
                                                    };

                                                    fetcherPostFile(file, params)
                                                        .then((fileId) => {
                                                            console.log('썸네일 파일 ID:', fileId);

                                                            // 3. API 호출 객체 준비
                                                            const param_data: TemplateSubmitData[] = [];

                                                            // 썸네일 ID 추가
                                                            submitData.thumbnail_file_id = fileId;
                                                            param_data.push(submitData);

                                                            const items = [
                                                                {
                                                                    sqlId: '0',
                                                                    params: param_data,
                                                                },
                                                            ];

                                                            console.log('저장 요청 데이터:', items);

                                                            // 4. 템플릿 저장 요청
                                                            fetcherPostCommonSave(items)
                                                                .then((response) => {
                                                                    alert('저장되었습니다.');
                                                                    // 임시저장인 경우 닫지 않음, 저장 완료인 경우 닫음
                                                                    if (!isTemporary) {
                                                                        handleConfirmClose(); // 성공 후 창 닫기
                                                                    }
                                                                })
                                                                .catch((error) => {
                                                                    alert('오류가 발생하였습니다.');
                                                                    console.error(error);
                                                                });
                                                        })
                                                        .catch((error) => {
                                                            console.error('썸네일 파일 업로드 중 오류 발생:', error);
                                                        });
                                                }
                                            });
                                        })
                                        .catch((err) => {
                                            console.error('페이지 렌더링 중 오류 발생:', err);
                                        });
                                }
                            })
                            .catch((err) => {
                                console.error('페이지 추출 중 오류 발생:', err);
                            });
                    })
                    .catch((err) => {
                        console.error('PDF 로드 중 오류 발생:', err);
                    });
            }
        }
    };

    const onTemplatePreview = () => {
        alert('저장을 먼저 해주세요');
    };
    const onTemplateChange = () => {
        // 파일 업로드 모달을 다시 표시
        setAreaDisplay(true);
        setOpen3(true);
        setFiles(null); // 기존 파일 선택 초기화
        setErrorMsg(''); // 에러 메시지 초기화
    };

    const handleConfirmClose = () => {
        // 모든 상태 초기화
        setTemplateName('');
        setFiles(null);
        setErrorMsg('');
        setLoading(false);
        setImages(null);
        setNumPages(0);
        setComponents([]);
        setSelectedId(null);
        setIsCreating(false);
        setCurrentComponent(null);
        setCurrentPage(0);
        setActiveStep(1);
        setOpenAlert(false);
        setStep([]);
        setAreaDisplay(true);
        setTmpltData({});
        setDocumentScale(1);

        templateFileId.current = '';
        canvasRef.current = null;
        requestRef.current = 0;
        targetX.current = 0;
        targetY.current = 0;
        currentX.current = 0;
        currentY.current = 0;

        setRows([]);

        handleClose();
    };

    const handleConfirmClose2 = () => {
        if (confirm('창을 닫으시겟습니까?')) {
            handleConfirmClose();
        }
    };

    // 스타일링 관련 함수
    const handleIncrement = () => {
        setFontSize((prev) => prev + 1);
    };

    const handleDecrement = () => {
        setFontSize((prev) => (prev > 1 ? prev - 1 : prev));
    };

    const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFontSize(Number(e.target.value));
    };

    const handleFontFamilyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFontFamily(e.target.value);
    };

    const toggleBold = () => setBold((prev) => !prev);
    const toggleItalic = () => setItalic((prev) => !prev);
    const toggleUnderline = () => setUnderline((prev) => !prev);

    const handleAlignLeft = () => setAlignment('left');
    const handleAlignCenter = () => setAlignment('center');
    const handleAlignRight = () => setAlignment('right');

    const handleClose3 = () => setOpen3(false);

    // 템플릿 데이터 로드 함수
    const loadEditModeData = async () => {
        if (!isEditMode || !templateToEdit) {
            console.log('편집 모드 아님 또는 템플릿 데이터 없음');
            return;
        }

        console.log('편집 모드 데이터 로드 시작:', templateToEdit);
        setLoading(true);

        try {
            // 템플릿 이름 설정
            if (templateToEdit.tmplt_tit) {
                setTemplateName(templateToEdit.tmplt_tit);
            }

            // 파일 ID가 있으면 파일 로드
            if (templateToEdit.file_id) {
                templateFileId.current = templateToEdit.file_id;

                try {
                    const response = await fetcherGetImage(templateToEdit.file_id);
                    if (response) {
                        const pdfData = new Uint8Array(response);
                        const blob = new Blob([pdfData], { type: 'application/pdf' });
                        const file = new File([blob], 'template.pdf', { type: 'application/pdf' });
                        setImages(file);
                        setAreaDisplay(false);
                    }
                } catch (error) {
                    console.error('템플릿 파일 로드 오류:', error);
                }
            }

            // 서버에서 컴포넌트 정보 로드 - 수정된 부분
            if (templateToEdit.tmplt_id) {
                // 복합 키로 API 호출
                const item = [
                    {
                        sqlId: '0',
                        params: [
                            {
                                scr_no: 'TTEFST1',
                                where: [
                                    {
                                        value: templateToEdit.tmplt_id,
                                        fdname: 'tmplt_id',
                                        condition: 'equals',
                                    },
                                ],
                            },
                        ],
                    },
                ];

                console.log('템플릿 상세 정보 요청 (복합 키):', JSON.stringify(item));

                fetcherPostCommonData(item)
                    .then((response) => {
                        console.log('템플릿 상세 정보 응답:', response);

                        if (response && response.length > 0) {
                            const tmplt_data = response[0];
                            setTmpltData(tmplt_data);

                            // 컴포넌트 정보 추출 및 설정
                            try {
                                // component_info 필드 확인
                                if (tmplt_data.component_info) {
                                    let components = tmplt_data.component_info;

                                    // 문자열인 경우 파싱 시도
                                    if (typeof components === 'string') {
                                        components = JSON.parse(components);
                                        console.log('문자열에서 파싱된 컴포넌트 데이터:', components);
                                    }

                                    if (Array.isArray(components) && components.length > 0) {
                                        console.log(`${components.length}개 컴포넌트 설정 중...`);
                                        setComponents(components);
                                    } else {
                                        console.warn('컴포넌트 배열이 없거나 비어있음');
                                    }
                                }
                            } catch (e) {
                                console.error('컴포넌트 데이터 처리 오류:', e);
                            }
                        }
                    })
                    .catch((error) => {
                        console.error('템플릿 상세 정보 로드 오류:', error);
                    });
            } else {
                console.warn('템플릿 편집을 위한 복합 키 정보가 누락되었습니다');
            }
        } catch (error) {
            console.error('편집 모드 데이터 로드 오류:', error);
        } finally {
            setLoading(false);
        }
    };

    // 편집 모드 감지 useEffect
    useEffect(() => {
        if (open && isEditMode && templateToEdit) {
            console.log('편집 모드 감지됨');
            loadEditModeData();
        }
    }, [open, isEditMode, templateToEdit]);

    // ============================
    // 이펙트
    // ============================

    // PDF 워커 설정
    useEffect(() => {
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
        console.log('PDF.js worker initialized');
    }, []);

    // 템플릿 정보 로드
    useEffect(() => {
        if (!open) return;

        console.log('다이얼로그 열림, params 확인:', params);

        // 편집 모드와 일반 모드 구분
        if (params?.isEditMode && params?.template_info) {
            console.log('편집 모드로 실행 중:', params.template_info);

            // 1. 파일 업로드 영역 숨기기
            setAreaDisplay(false);

            // 2. 템플릿 이름 설정
            if (params.template_info.tmplt_tit) {
                setTemplateName(params.template_info.tmplt_tit);
            }

            // 3. 파일 ID 설정 및 PDF 로드
            if (params.template_info.file_id) {
                templateFileId.current = params.template_info.file_id;

                fetcherGetImage(params.template_info.file_id)
                    .then((response) => {
                        const pdfData = new Uint8Array(response);
                        const blob = new Blob([pdfData], { type: 'application/pdf' });
                        const file = new File([blob], 'template.pdf', { type: 'application/pdf' });
                        setImages(file);
                    })
                    .catch((error) => {
                        console.error('PDF 로드 오류:', error);
                    });
            }

            // 4. 템플릿 상세 정보 조회 - 컴포넌트 데이터 포함 (복합 키 사용)
            if (
                params.template_info.rprs_ognz_no &&
                params.template_info.task_clsf_cd &&
                params.template_info.doc_knd_cd
            ) {
                // 복합 키로 API 호출
                const item = [
                    {
                        sqlId: '0',
                        params: [
                            {
                                scr_no: 'TTEFST1',
                                where: [
                                    {
                                        value: params.template_info.rprs_ognz_no,
                                        fdname: 'rprs_ognz_no',
                                        condition: 'equals',
                                    },
                                    {
                                        value: params.template_info.task_clsf_cd,
                                        fdname: 'task_clsf_cd',
                                        condition: 'equals',
                                    },
                                    {
                                        value: params.template_info.doc_knd_cd,
                                        fdname: 'doc_knd_cd',
                                        condition: 'equals',
                                    },
                                ],
                            },
                        ],
                    },
                ];

                console.log('템플릿 상세 정보 요청 (복합 키):', JSON.stringify(item));

                fetcherPostCommonData(item)
                    .then((response) => {
                        console.log('템플릿 상세 정보 응답:', response);

                        if (response && response.length > 0) {
                            const tmplt_data = response[0];
                            setTmpltData(tmplt_data);

                            // 컴포넌트 정보 추출 및 설정
                            try {
                                // component_info 필드 확인
                                if (tmplt_data.component_info) {
                                    let components = tmplt_data.component_info;

                                    // 문자열인 경우 파싱 시도
                                    if (typeof components === 'string') {
                                        components = JSON.parse(components);
                                        console.log('문자열에서 파싱된 컴포넌트 데이터:', components);
                                    }

                                    if (Array.isArray(components) && components.length > 0) {
                                        console.log(`${components.length}개 컴포넌트 설정 중...`);
                                        setComponents(components);
                                    } else {
                                        console.warn('컴포넌트 배열이 없거나 비어있음');
                                    }
                                } else {
                                    console.warn('템플릿 데이터에 component_info 필드가 없음');

                                    // 복합 키로 추가 컴포넌트 정보 조회
                                    const componentQuery = [
                                        {
                                            sqlId: 'EFS_TEMPLATE_COMPONENTS',
                                            params: [
                                                {
                                                    rprs_ognz_no: params.template_info.rprs_ognz_no,
                                                    task_clsf_cd: params.template_info.task_clsf_cd,
                                                    doc_knd_cd: params.template_info.doc_knd_cd,
                                                },
                                            ],
                                        },
                                    ];

                                    console.log('컴포넌트 전용 조회 요청:', componentQuery);

                                    fetcherPostCommonData(componentQuery)
                                        .then((componentResponse) => {
                                            console.log('컴포넌트 조회 응답:', componentResponse);

                                            if (componentResponse && componentResponse.length > 0) {
                                                processComponentData(componentResponse[0]);
                                            }
                                        })
                                        .catch((error) => {
                                            console.error('컴포넌트 조회 오류:', error);
                                        });
                                }
                            } catch (e) {
                                console.error('컴포넌트 데이터 처리 오류:', e);
                            }
                        }
                    })
                    .catch((error) => {
                        console.error('템플릿 상세 정보 로드 오류:', error);
                    });
            } else {
                console.warn('템플릿 편집을 위한 복합 키 정보가 누락되었습니다');
            }
        } else if (params && params.template_info) {
            // 기존 추가 모드 코드 유지 (수정하지 않음)
            console.log('일반 모드 (템플릿 추가) 실행 중');
            const item = [
                {
                    sqlId: '0',
                    params: [
                        {
                            scr_no: 'TTEFST1',
                            where: [
                                {
                                    value: params.template_info?.task_clsf_cd,
                                    fdname: 'task_clsf_cd',
                                    condition: 'equals',
                                },
                                {
                                    value: params.template_info?.doc_knd_cd,
                                    fdname: 'doc_knd_cd',
                                    condition: 'equals',
                                },
                            ],
                        },
                    ],
                },
            ];

            fetcherPostCommonData(item)
                .then((response) => {
                    console.log('tmplt_data', response[0]);
                    const tmplt_data = response[0];

                    fetcherGetImage(tmplt_data.tmplt_file_mng_no)
                        .then((response) => {
                            const pdfData = new Uint8Array(response);
                            const blob = new Blob([pdfData], { type: 'application/pdf' });
                            const file = new File([blob], 'downloaded.pdf', {
                                type: 'application/pdf',
                            });
                            tmplt_data.file = file;
                            setTmpltData(tmplt_data);
                            console.log('tmplt_data', tmplt_data);
                        })
                        .catch((error) => {
                            console.log('error', error);
                            console.error('Error fetching image:', error);
                        });
                })
                .catch((error) => {
                    console.error('Error fetching common data:', error);
                });
        }
    }, [open, params]);

    // 마우스 이동 이벤트 및 애니메이션
    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        requestRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(requestRef.current);
        };
    }, [animate]);

    // 키보드 이벤트 처리
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Delete') {
                handleDelete();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [components, selectedId]);

    // 외부 클릭 처리
    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            const container = document.getElementById('container');
            if (container && !container.contains(event.target as Node)) {
                handleClickOutside();
            }
        };

        document.addEventListener('click', handleOutsideClick);

        return () => {
            document.removeEventListener('click', handleOutsideClick);
        };
    }, []);

    // 중앙 컨텐츠 영역 클릭 이벤트 핸들러
    const handleCenterContentClick = (e: React.MouseEvent) => {
        // 클릭한 대상이 PDF 페이지(canvas) 내부인지 확인
        const target = e.target as HTMLElement;
        const isPdfCanvas = target.closest('.react-pdf__Page__canvas');
        const isComponent = target.closest(`.${styles.rnd}`);

        // 컴포넌트를 클릭한 경우 이벤트 전파를 중지하고 처리하지 않음
        if (isComponent) return;

        // PDF 캔버스를 클릭했을 때
        if (isPdfCanvas) {
            // 컴포넌트 생성 모드인 경우
            if (isCreating && currentComponent) {
                handleMouseDown(
                    e,
                    parseInt(target.closest('.react-pdf__Page')?.getAttribute('data-page-number') || '1')
                );
            } else {
                // 컴포넌트 선택 취소
                setSelectedId(null);
            }
        } else {
            // PDF 캔버스 외부를 클릭한 경우
            setIsCreating(false);
            setCurrentComponent(null);
            setSelectedId(null);
        }
    };

    // rightSidebar에서 컴포넌트 업데이트
    const handleComponentUpdate = (id: string, updates: Partial<ComponentState>) => {
        console.log(`컴포넌트 업데이트: ID=${id}`, updates);

        setComponents((prevComponents) =>
            prevComponents.map((component) => {
                if (component.id === id) {
                    const updatedComponent = { ...component, ...updates };
                    console.log('업데이트된 컴포넌트:', updatedComponent);
                    return updatedComponent;
                }
                return component;
            })
        );
    };

    // 컴포넌트 데이터 처리 유틸리티 함수 추가
    const processComponentData = (data) => {
        let componentData = null;

        if (data.component_info) {
            componentData = data.component_info;
        } else if (typeof data === 'object') {
            componentData = [data];
        } else if (Array.isArray(data)) {
            componentData = data;
        }

        // 문자열인 경우 파싱
        if (typeof componentData === 'string') {
            try {
                componentData = JSON.parse(componentData);
            } catch (e) {
                console.error('컴포넌트 데이터 파싱 오류:', e);
            }
        }

        // 컴포넌트 설정
        if (componentData && Array.isArray(componentData) && componentData.length > 0) {
            console.log(`${componentData.length}개 컴포넌트 로드`);
            setComponents(componentData);
        }
    };

    // ============================
    // 렌더링
    // ============================

    return (
        <SwModal
            fullScreen
            fullWidth
            open={open}
            onClose={handleClose}
            size='full'
            closeButton={false}
            className={styles.editTemplateModal}
        >
            <>
                {/* 파일 업로드 모달 */}
                {ariaDisplay && (
                    <SwModal
                        open={open3}
                        onClose={handleClose3}
                        title='파일 업로드'
                        size='md'
                        txtBtn1='취소'
                        txtBtn2='적용'
                        className={styles.fileUploadModal}
                    >
                        {files ? (
                            <div className={styles.desc}>업로드할 문서를 변경하려면 파일이름을 클릭해주세요.</div>
                        ) : (
                            <div className={styles.desc}>계약서로 사용할 문서를 먼저 업로드 해 주세요.</div>
                        )}
                        <div className='dragNdropFile'>
                            <FileUploader
                                handleChange={handleChange}
                                name='files'
                                types={['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'jpg', 'png', 'jpeg']}
                                classes='dropArea'
                                onTypeError={handleTypeError}
                                hoverTitle=''
                                dropMessageStyle={{ display: 'none' }}
                            >
                                {loading ? (
                                    <CircularProgress size={120} />
                                ) : (
                                    <div className='fileDrop'>
                                        {files ? '' : <IcoUpload />}
                                        <>
                                            {files ? (
                                                <p className='guideText'>${files.name}</p>
                                            ) : (
                                                <p className='guideText'>
                                                    여기를 클릭 해 파일을 업로드 하거나, <br />
                                                    파일을 여기로 드래그하세요.
                                                    <br />
                                                    (.pdf, .docx,xlsx 등)
                                                </p>
                                            )}
                                        </>
                                    </div>
                                )}
                                <p style={{ color: 'red' }}>{errorMsg && errorMsg}</p>
                            </FileUploader>
                        </div>
                        {!loading && (
                            <div className='actions'>
                                <Button
                                    id='btnDefault11'
                                    type='default'
                                    size='lg'
                                    className='btnWithIcon'
                                    onClick={handleConfirmClose}
                                >
                                    취소
                                </Button>
                                <Button
                                    id='btnPrmary12'
                                    type='primary'
                                    size='lg'
                                    className='btnWithIcon'
                                    onClick={handleSubmit}
                                >
                                    적용
                                </Button>
                            </div>
                        )}
                    </SwModal>
                )}

                {/* 상단 툴바 */}
                {images ? (
                    <div className='modalBar'>
                        <div className={`tit ${styles.barTitle}`}>
                            <Button className={styles.btnBack} onClick={handleConfirmClose2}>
                                <IcoArrow fill='#fff' />
                            </Button>
                            <InputTextBox
                                id='templateName'
                                placeholder='템플릿명을 입력하세요'
                                value={templateName}
                                onChange={(e) => setTemplateName(e.target.value)}
                                onDelete={() => setTemplateName('')}
                                className='templateNameInput'
                            />
                            {isEditMode && <span style={{ marginLeft: '10px', color: '#fff' }}>(편집 중)</span>}
                        </div>
                        <div className='btnOptions'>
                            <Button className='btnWithIcon' onClick={onTemplateChange}>
                                <IcoChageFile fill='#ffffff' /> 파일 변경
                            </Button>
                            <Button className='btnWithIcon' onClick={() => onTemplateSubmit(false)}>
                                <IcoCheckFill fill='#fff' /> {isEditMode ? '수정 완료' : '저장 후 완료'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>&nbsp;</>
                )}

                {/* 메인 컨텐츠 영역 */}
                <div className={`${styles.templateWrap} ${styles.templateCreateWrap}`}>
                    {/* 좌측 사이드바 */}
                    <LeftSidebar
                        images={images}
                        addComponent={addComponent}
                        inputValues={inputValues}
                        handleSearchBox={handleSearchBox}
                    />

                    {/* 중앙 컨텐츠 영역 */}
                    <div onClick={handleCenterContentClick} className={styles.contentsWrap}>
                        <CenterContent
                            images={images}
                            numPages={numPages}
                            components={components}
                            selectedId={selectedId}
                            isCreating={isCreating}
                            currentComponent={currentComponent}
                            handleMouseDown={handleMouseDown}
                            handleSelect={handleSelect}
                            handleResize={handleResize}
                            handleDrag={handleDrag}
                            onTemplatePreview={onTemplatePreview}
                            onTemplateSubmit={onTemplateSubmit}
                            canvasRef={canvasRef}
                            onPageLoadSuccess={onPageLoadSuccess}
                            onLoadSuccess={onLoadSuccess}
                            fontSize={fontSize}
                            fontFamily={fontFamily}
                            bold={bold}
                            italic={italic}
                            underline={underline}
                            alignment={alignment}
                            handleDecrement={handleDecrement}
                            handleFontSizeChange={handleFontSizeChange}
                            handleIncrement={handleIncrement}
                            handleFontFamilyChange={handleFontFamilyChange}
                            toggleBold={toggleBold}
                            toggleItalic={toggleItalic}
                            toggleUnderline={toggleUnderline}
                            handleAlignLeft={handleAlignLeft}
                            handleAlignCenter={handleAlignCenter}
                            handleAlignRight={handleAlignRight}
                            FONT_FAMILY_OPTIONS={FONT_FAMILY_OPTIONS}
                            documentScale={documentScale}
                            handleDocumentScaleChange={handleDocumentScaleChange}
                        />
                    </div>

                    {/* 우측 사이드바 */}
                    <RightSidebar
                        images={images}
                        selectedId={selectedId}
                        components={components}
                        numPages={numPages}
                        thumbnailScale={thumbnailScale}
                        inputTextValues={inputTextValues}
                        handleTextChange={handleTextChange}
                        handleTextDelete={handleTextDelete}
                        selectedValues={selectedValues}
                        handleSelectChange={handleSelectChange}
                        isChecked1={isChecked1}
                        setIsChecked1={setIsChecked1}
                        options={options}
                        onComponentUpdate={handleComponentUpdate} // 여기에 함수 전달
                    />
                </div>

                {/* 마우스에 점선 테두리 보여주기 */}
                {isCreating && currentComponent && (
                    <div
                        style={{
                            position: 'absolute',
                            border: '1px dashed #010101',
                            width: currentComponent.width,
                            height: currentComponent.height,
                            top: 0,
                            left: 0,
                            pointerEvents: 'none',
                            transform: `translate(${currentX.current}px, ${currentY.current}px)`,
                            transition: 'transform 0.05s ease-out', // 부드러운 이동 효과
                        }}
                        onMouseMove={handleMouseMove}
                        ref={mouseRef}
                    />
                )}
            </>
        </SwModal>
    );
};

export default TemplateCreateFullDialog;
