'use client';
import { CloseCircleTwoTone, LeftCircleTwoTone } from '@ant-design/icons';
import {
    Alert,
    AppBar,
    Box,
    Button,
    Dialog,
    IconButton,
    Snackbar,
    Stack,
    TextField,
    Toolbar,
    Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import CreateDialog from './CreateDialog';
// import ScrollX from 'components/ScrollX';
import Loader from 'components/Loader';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { fetcherGetImage, fetcherPost, fetcherPostCommonData } from 'utils/axios';
import { useAuthStore } from 'utils/store/auth';
import styles from '../../../styles/pages/Template/page.module.scss';
import OgnzSelect_efs from 'components/eformsuite/contract/OgnzSelect_efs';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import SignPopup from 'components/eformsuite/contract/SignPopup';
//import CloseTemplate from './CloseDialog';
export default function PreviewFullDialog({ params, setParams }) {
    const user_no = useAuthStore((state) => state.userNo);
    const rprs_ognz_no = 'WIN';
    const [validation, setValidation] = useState({ validation: true, type: '', message: '' }); // 저장조건에 맞지 않을 시 snackbar에 띄울 메시지 저장 type ->현재 화면정보 ex)cm001-1, cm001-2
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [dataLoading, setDataLoading] = useState(false);
    const [saveData, setSaveData] = useState({});
    const [activeType, setActiveType] = useState(); // 현재 상태
    const [activeStep, setActiveStep] = useState(1); // 현재 단계
    const [openAlert, setOpenAlert] = useState(false); // 닫기버튼 클릭 시 알림
    const [titleMode, setTitleMode] = useState(false); // 타이틀이 있는지 없는지?
    const [title, setTitle] = useState(''); // 현재 리뷰의 타이틀
    const { open } = params;
    const [step, setStep] = useState([]);

    // 템플릿 data
    const [tmpltData, setTmpltData] = useState({});
    // 이미지
    const [images, setImages] = useState<File | null>(null);

    const [numPages, setNumPages] = useState<number>(0);
    const canvasRef = useRef<HTMLCanvasElement | null>(null); // 캔버스 참조
    const [canvasDimensions, setCanvasDimensions] = useState<{
        width: number;
        height: number;
    }>({ width: 0, height: 0 });
    const [openSignPopup, setOpenSignPopup] = useState(false); // 사인 팝업 상태

    // 인쇄할 영역을 감싸는 ref (PDF와 컴포넌트들이 렌더링된 영역)
    const printableAreaRef = useRef<HTMLDivElement>(null);

    // 사인할때 사인하려는 컴포넌트의 id
    const [selectedSignId, setSelectedSignId] = useState<string | null>(null);

    const onLoadSuccess = ({ numPages }: { numPages: number }) => {
        // 총 페이지 수 설정
        setNumPages(numPages);
    };
    const onPageLoadSuccess = (pageWidth: number, pageHeight: number, pageNumber: number) => {
        // 페이지 로드 성공 시 canvas의 크기 저장
        setCanvasDimensions({ width: pageWidth, height: pageHeight });
    };

    console.log('ef full dialog tmpltData', tmpltData);

    // 사인 팝업 열기
    const handleOpenSignPopup = () => {
        setOpenSignPopup(true);
    };

    // 사인 팝업 닫기
    const handleCloseSignPopup = () => {
        setOpenSignPopup(false);
    };

    // 사인
    const handleSaveSign = (signImage: string) => {
        setTmpltData((prevData) => ({
            ...prevData,
            component_info: prevData.component_info.map((component) =>
                component.type === 'sign' && component.id === selectedSignId ? { ...component, signImage } : component
            ),
        }));
        // selectedSignId를 초기화
        setSelectedSignId(null);
    };

    // 인쇄 버튼 - 각 페이지 컨테이너에 id를 부여하여 개별 캡쳐 후, 하나의 PDF로 결합
    const handlePrint = async () => {
        if (numPages === 0) return;

        let pdf;
        // 페이지마다 순서대로 캡쳐 후 PDF에 추가
        for (let i = 0; i < numPages; i++) {
            const pageElement = document.getElementById(`pdf-page-${i}`);
            if (pageElement) {
                const canvas = await html2canvas(pageElement, {
                    scale: 1, // 해상도 조정 (필요에 따라 조정 - 숫자클수록 좋아짐)
                    // 만약 스크롤에 의해 일부 영역이 잘린다면 아래 옵션 추가 고려:
                    // scrollY: -window.scrollY,
                });
                const imgData = canvas.toDataURL('image/png');

                // 첫 페이지: pdf 인스턴스 생성
                if (i === 0) {
                    pdf = new jsPDF({
                        orientation: 'portrait',
                        unit: 'pt',
                        format: [canvas.width, canvas.height],
                    });
                    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                } else {
                    pdf.addPage([canvas.width, canvas.height], 'portrait');
                    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                }
            }
        }
        if (pdf) {
            pdf.save('document.pdf');
        }
    };

    const handlePreview = () => {};

    // 부서 , 사원 콤보박스 선택
    const handleChange = (id: string, value: string, type: string | null, summaryValue: string | null) => {
        console.log('handleChange id', id);
        console.log('handleChange value', value);
        console.log('handleChange type', type);
        console.log('handleChange summaryValue', summaryValue);
    };

    // CreateDialog 에서 pdf 뜰때 초기화
    useEffect(() => {
        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
            pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'; // 경로 확인
        }
    }, []); // 한 번만 실행하도록 설정

    useEffect(() => {
        if (!Array.isArray(params)) {
            const item = [
                {
                    sqlId: '0',
                    params: [
                        {
                            scr_no: 'TTEFST1',
                            where: [
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
            fetcherPostCommonData(item)
                .then((response) => {
                    console.log('tmplt_data', response[0]);
                    const tmplt_data = response[0];

                    // 1. tmplt_tit -> 상단제목 셋팅 ok
                    // 2. tmplt_file_id -> pdfjs로 화면에 바인딩 ok
                    // 3. component_info -> map for 돌면서 pdfjs에 바인딩 . textbox , datepiker , sign(모달팝업에서 탭 마우스사인,이름사인,도장이미지)
                    // 4. 미리보기 추가 모달팝업
                    // 5. 인쇄기능 추가
                    // 6. height 크기에따라서 글자의 font 조절되어야함
                    // 7. 써야할것 강조표시 css
                    // 8. 그리드로 현재 컴포넌트보여지고 그리드의 선택하면 해당컴포넌트에 포커스
                    // 9. 등록하는화면도 fullmodal에서 하도록 옮기기
                    // 10. 등록하는 화면에서는 grid에서 삭제하면 컴포넌트도 삭제되고 추가시 그리드에서도 추가됨 (좌나 우에 세로스크롤에 영향받지않게 고정)
                    // 11. 등록하는 화면에서 컴포넌트목록부분 추가 (좌나 우에 세로스크롤에 영향받지않게 고정)
                    // 12. 등록하는 화면에서 컴포넌트를 클릭후 재클릭 or 드래그해서 끌어놓기
                    // **콤포넌트로 쪼개서 바인딩할것. textbox, datepicker는 몰라도 signpopup은 따로쪼개서 호출할것

                    fetcherGetImage(tmplt_data.file_id)
                        .then((response) => {
                            const pdfData = new Uint8Array(response);

                            // Uint8Array를 Blob으로 변환
                            const blob = new Blob([pdfData], { type: 'application/pdf' });

                            // Blob을 File 객체로 변환
                            const file = new File([blob], 'downloaded.pdf', { type: 'application/pdf' });
                            tmplt_data.file = file;
                            setTmpltData(tmplt_data);
                            console.log('tmplt_data', tmplt_data);
                        })
                        .catch((error) => {
                            console.log('error', error);
                            console.error(error);
                        });
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }, [params]);
    console.log('saveData', saveData);
    // 뒤로가기 및 다음 시 단계 이동
    const handleStep = (step) => () => {
        if (step >= 1 && step <= 12) {
            setActiveStep(step);
        }
        setValidation((prev) => ({
            ...prev,
            validation: true,
        }));
    };

    const handleSubmit = (type: string) => {};

    const updateItem = () => {
        if (validation.validation) {
            if (activeStep < 12) {
                handleSubmit(validation.type);
                setActiveStep((prevStep) => {
                    const newStep = prevStep + 1;
                    handleStep(newStep); // step 증가를 직접 호출
                    return newStep;
                });
            }
        } else {
            setSnackbarOpen(true);
        }
    };

    // 닫기
    const handleClose = () => {
        setTmpltData({});

        setActiveStep(1);
        setTitleMode(false);
        setParams((prev) => {
            return {
                ...prev,
                open: !open,
                template_info: {}, // pdfjs 의 버그로인해 무조건 초기화해주어야함. 초기화없을 시, 2번째띄울때부터 오류발생
            };
        });
        // CreateDialog에 데이터 초기화 작업 전달
        setParams((prevParams) => ({
            ...prevParams,
            template_info: { file: null, component_info: [] }, // 초기화하는 값
        }));
    };

    // 알림 띄우기
    const handleOpenAlert = () => {
        setOpenAlert(!openAlert);
    };

    // 평가이름 저장
    const submitTitle = (isSubmit) => {
        if (isSubmit && title !== '') {
            setTitleMode(!titleMode);
        } else if (isSubmit && titleMode && title === '') {
            enqueueSnackbar(`제목을 입력하여 주세요.`, {
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                },
                variant: 'error',
                autoHideDuration: 2000,
            });
        } else {
            setTitle('');
            setTitleMode(!titleMode);
        }
    };

    // 평가이름 수정
    const changeTitle = (e) => {
        const value = e.target.value;
        setTitle(value);
    };

    const handleSnackBarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return; // 클릭으로 닫히는 것을 방지
        }
        setSnackbarOpen(false); // Snackbar 닫기
    };
    if (dataLoading) return <Loader />;
    return (
        <>
            <Dialog
                fullScreen
                scroll={'paper'}
                open={open}
                onClose={handleClose}
                transitionDuration={{
                    enter: 0,
                    exit: 0,
                }}
                className={styles.template}
            >
                <AppBar sx={{ position: 'sticky' }} color='inherit' elevation={1}>
                    <Toolbar sx={{ position: 'relative' }}>
                        <Stack direction='row' alignItems='center' sx={{ marginRight: 'auto', maxWidth: '30%' }}>
                            {/* 풀모달 명 옆에 나가기 아이콘 */}
                            <IconButton
                                color='inherit'
                                onClick={activeStep < step.length ? handleOpenAlert : handleClose}
                                aria-label='close'
                                sx={{ marginLeft: 'auto' }}
                            >
                                {/* 데이터 조회 후 nav의 길이에 맞추기 */}
                                {activeStep < step.length ? (
                                    <CloseCircleTwoTone className={styles.icoClose} twoToneColor='#bfbfbf' />
                                ) : (
                                    <LeftCircleTwoTone className={styles.icoClose} twoToneColor='#bfbfbf' />
                                )}
                            </IconButton>
                            <Typography
                                sx={{
                                    ml: 1,
                                    mr: 1,
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {tmpltData.tmplt_tit || '제목'}
                            </Typography>
                        </Stack>
                        <Stack direction='row' alignItems='center' spacing={1} sx={{ marginLeft: 'auto' }}>
                            <Button variant='contained' onClick={updateItem}>
                                저장 1
                            </Button>
                            {/* PDF 출력 버튼 추가 */}
                            <Button variant='contained' onClick={handlePrint} style={{ marginLeft: '16px' }}>
                                PDF 출력 1
                            </Button>
                        </Stack>
                    </Toolbar>
                </AppBar>
                {/* 하단 전체 */}
                <div style={{ width: '100%', overflowX: 'auto' }}>
                    <div className={`${styles.templateWrap} ${styles.templateEditWrap}`}>
                        {/* 좌측 */}
                        <div className={`${styles.sideArea} ${styles.colGrid}`}>
                            좌측
                            <br />
                            좌<br />
                            측<br />
                        </div>
                        {/* 중앙 */}
                        <div className={`${styles.contentsArea}`}>
                            {/* pdfjs 바인딩 */}
                            <div className={`${styles.pdfViewer}`} ref={printableAreaRef}>
                                {tmpltData.file && (
                                    <Document file={tmpltData.file} onLoadSuccess={onLoadSuccess}>
                                        {' '}
                                        {/* options={{ cMapUrl: '', cMapPacked:true}} */}
                                        {Array.from(new Array(numPages), (el, index) => (
                                            <div
                                                className={styles.pageWrap}
                                                id={`pdf-page-${index}`}
                                                key={index}
                                                style={{
                                                    width: canvasDimensions.width,
                                                    position: 'relative', // 중요 추가
                                                }}
                                            >
                                                {/* PDF 페이지 */}
                                                <Page
                                                    pageNumber={index + 1}
                                                    renderTextLayer={false}
                                                    renderAnnotationLayer={false}
                                                    canvasRef={canvasRef}
                                                    onLoadSuccess={() => {
                                                        if (canvasRef.current) {
                                                            const intrinsicWidth = canvasRef.current.width;
                                                            const intrinsicHeight = canvasRef.current.height;
                                                            onPageLoadSuccess(
                                                                intrinsicWidth,
                                                                intrinsicHeight,
                                                                index + 1
                                                            );
                                                        }
                                                    }}
                                                />

                                                {/* 컴포넌트들 덮기 */}
                                                {tmpltData.component_info
                                                    .filter((component) => component.page === index + 1)
                                                    .map((component) => (
                                                        <div
                                                            key={component.id}
                                                            onClick={
                                                                component.type === 'sign'
                                                                    ? handleOpenSignPopup
                                                                    : undefined
                                                            }
                                                            className={styles.componentContainer}
                                                            style={{
                                                                position: 'absolute',
                                                                top: component.y,
                                                                left: component.x,
                                                                width: component.width,
                                                                height: component.height,
                                                            }}
                                                        >
                                                            {component.type === 'textbox' && (
                                                                <TextField
                                                                    variant='standard'
                                                                    InputProps={{
                                                                        disableUnderline: true,
                                                                        style: { padding: 0, borderRadius: 0 },
                                                                    }}
                                                                    className={styles.componentItemText}
                                                                />
                                                            )}
                                                            {component.type === 'datepicker' && (
                                                                <input
                                                                    type='date'
                                                                    className={styles.componentItemDatePicker}
                                                                />
                                                            )}
                                                            {component.type === 'sign' && (
                                                                <img
                                                                    src={component.signImage || '/default-sign.png'}
                                                                    alt='Sign'
                                                                    className={styles.componentItemSign}
                                                                    onClick={() => {
                                                                        setSelectedSignId(component.id);
                                                                        handleOpenSignPopup();
                                                                    }}
                                                                />
                                                            )}
                                                            {component.type === 'label' && (
                                                                <label className={styles.componentItemLabel}>
                                                                    레이블
                                                                </label>
                                                            )}
                                                            {component.type === 'checkbox' && (
                                                                <input
                                                                    type='checkbox'
                                                                    className={styles.componentItemCheckbox}
                                                                />
                                                            )}
                                                            {component.type === 'number' && (
                                                                <input
                                                                    type='number'
                                                                    className={styles.componentItemNumber}
                                                                />
                                                            )}
                                                            {component.type === 'combobox' && (
                                                                <select className={styles.componentItemSelect} />
                                                            )}
                                                            {component.type === 'multiline' && (
                                                                <textarea className={styles.componentItemTextarea} />
                                                            )}
                                                            {component.type === 'ognzcombobox' && (
                                                                <OgnzSelect_efs
                                                                    item={{
                                                                        default: null,
                                                                        id: 'ognz_no',
                                                                        placeholder: '조직명을 조회하세요',
                                                                        required: null,
                                                                        seq: '3',
                                                                        sqlId: null,
                                                                        text: '소속',
                                                                        type: 'COM_POPUP_DEPT_UNDER_ORG',
                                                                    }}
                                                                    handleChange={handleChange}
                                                                    selectValue={undefined}
                                                                />
                                                            )}
                                                            {component.type === 'usercombobox' && (
                                                                <TextField
                                                                    variant='standard'
                                                                    InputProps={{
                                                                        disableUnderline: true,
                                                                        style: { padding: 0, borderRadius: 0 },
                                                                    }}
                                                                    className={styles.componentItemText}
                                                                />
                                                            )}
                                                        </div>
                                                    ))}
                                            </div>
                                        ))}
                                    </Document>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={2000}
                    onClose={(event, reason) => handleSnackBarClose(event, reason)}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert
                        onClose={handleSnackBarClose}
                        icon={false} // 아이콘 제거
                        severity='error'
                        sx={{ width: '100%', backgroundColor: '#ff1744', color: 'white' }}
                    >
                        {validation.message}
                    </Alert>
                </Snackbar>
                {/* 저장 중간에 나가기 눌렀을 경우 == 화면별로 세팅 필요 */}
                {/* <CloseTemplate
                    open={openAlert}
                    handleClose={handleOpenAlert}
                    handleDialogClose={handleClose}
                    saveData={saveData}
                    setSaveData={setSaveData}
                /> */}
            </Dialog>

            {/* 사인 팝업 */}
            <SignPopup open={openSignPopup} onClose={handleCloseSignPopup} onSave={handleSaveSign} />
        </>
    );
}
