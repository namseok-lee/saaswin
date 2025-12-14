'use client';
import { CloseCircleTwoTone, LeftCircleTwoTone } from '@ant-design/icons';
import { Alert, AppBar, Box, Button, Dialog, IconButton, Snackbar, Stack, Toolbar, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import CreateDialog from './CreateDialog';
// import ScrollX from 'components/ScrollX';
import Loader from 'components/Loader';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { pdfjs } from 'react-pdf';
import { fetcherGetImage, fetcherPost, fetcherPostCommonData } from 'utils/axios';
import { useAuthStore } from 'utils/store/auth';
import styles from '../../../styles/pages/Template/page.module.scss';
//import CloseTemplate from './CloseDialog';
export default function EformsuiteFullDialog({ params, setParams }) {
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

    console.log('ef full dialog tmpltData', tmpltData);

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
                            param_data: [
                                {
                                    rprs_ognz_no: 'WIN',
                                    work_user_no: 'WIN000031', // 추후 로그인 되면 변경
                                    scr_no: 'TTEFST1',
                                    where: [
                                        {
                                            value: params.template_info.tmplt_id,
                                            fdname: 'tmplt_id',
                                            condition: 'equals',
                                        },
                                    ],
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

                    fetcherGetImage(tmplt_data.tmplt_file_id)
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
                {/* 평가제목 +  뒤로가기/저장후다음 버튼 */}
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
                                저장
                            </Button>
                        </Stack>
                    </Toolbar>
                </AppBar>
                {/* 하단 전체 */}
                <div style={{ width: '100%', overflowX: 'auto' }}>
                    <Box>
                        {/* step별 화면 컨트롤 */}
                        <CreateDialog
                            data={{ ...tmpltData }}
                            setData={setTmpltData}
                            updateItem={updateItem}
                            handleStep={handleStep}
                            handleModalClose={handleClose}
                        />
                    </Box>
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
        </>
    );
}

EformsuiteFullDialog.propTypes = {
    params: PropTypes.object,
    setParams: PropTypes.func,
};
