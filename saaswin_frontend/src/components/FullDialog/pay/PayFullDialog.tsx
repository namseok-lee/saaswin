'use client';
import PropTypes from 'prop-types';
import { Button, Typography, IconButton, AppBar, Toolbar, Stack, Dialog, Box, Snackbar, Alert } from '@mui/material';
import { CloseCircleTwoTone, LeftCircleTwoTone } from '@ant-design/icons';
import CreateDialog from './CreateDialog';
import { useEffect, useState } from 'react';
import Loader from 'components/Loader';
import CloseReview from './CloseDialog';
import SettingsIcon from '@mui/icons-material/Settings';
import { fetcherPost, fetcherPostGridData } from 'utils/axios';
import { enqueueSnackbar } from 'notistack';

export default function PayFullDialog({ params, setParams, setMasterRetrieve }) {
    const [validation, setValidation] = useState({ validation: true, message: '' }); // 저장조건에 맞지 않을 시 snackbar에 띄울 메시지 저장
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [dataLoading, setDataLoading] = useState(false);
    const [saveData, setSaveData] = useState(null);
    const [activeStep, setActiveStep] = useState(null); // 현재 단계
    const [openAlert, setOpenAlert] = useState(false); // 닫기버튼 클릭 시 알림
    const { open, step_cd, modal_info } = params;
    // const { open, step_cd, slry_ocrn_id } = params;
    const [steps, setSteps] = useState([]);

    useEffect(() => {
        setSaveData({
            slry_ocrn_id: modal_info?.slry_ocrn_id || '',
            slry_prgrs_step_cd: step_cd || 'hrb_group01018_cm0001',
        });
        if (!Array.isArray(params)) {
            // step 가져옴
            const rprs_ognz_no = 'WIN';
            const item = [
                {
                    sqlId: 'hrb_slry01',
                    sql_key: 'hrb_slry_prgrs_step_get',
                    params: [{}],
                },
            ];
            fetcherPost([process.env.NEXT_PUBLIC_SSW_SLRY_SEARCH_ORIGIN_API_URL, item])
                .then((response) => {
                    const sortBySeq = (response[0].data[0].data[0].data || [])
                        .slice()
                        .sort((a, b) => Number(a.step_seq) - Number(b.step_seq)); // seq 기준으로 역순정렬
                    setSteps(sortBySeq);
                    const currentStep = sortBySeq?.find((item) => item?.slry_step_cd === step_cd) || null;

                    if (currentStep) {
                        setActiveStep(currentStep.step_seq);
                        setSaveData((prev) => ({
                            ...prev,
                            step_seq: currentStep.step_seq,
                            sqlId: currentStep.step_scr_info.sql_id,
                            sql_key: currentStep.step_scr_info.sql_key,
                        }));
                    } else {
                        setActiveStep(1);
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }, [params]);
    // 뒤로가기 및 다음 시 단계 이동
    const handleStep = (step) => () => {
        if (step >= 1 && step <= steps.length) {
            setActiveStep(step);
        }
        setValidation((prev) => ({
            ...prev,
            validation: true,
        }));
    };

    const updateSlryMaster = () => {
        if (validation.validation) {
            if (activeStep < steps.length) {
                updateSlryStep();
                setActiveStep((prevStep) => {
                    const newStep = prevStep + 1;
                    handleStep(newStep); // step 증가를 직접 호출
                    return newStep;
                });
            }
        } else {
            // setSnackbarOpen(true);
            enqueueSnackbar(validation.message, {
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                },
                variant: 'error',
                autoHideDuration: 2000,
            });
        }
    };

    // 저장 후 다음
    const updateSlryStep = () => {
        const item = [
            {
                sqlId: 'hrb_slry01',
                sql_key: 'hrb_slry_prgrs_step_update',
                params: [
                    {
                        slry_ocrn_id: saveData.slry_ocrn_id,
                        current_step: saveData.slry_prgrs_step_cd,
                        curr_step_seq: saveData.step_seq,
                    },
                ],
            },
        ];
        if (saveData.step_seq <= activeStep) {
            fetcherPostGridData(item)
                .then((response) => {
                    const return_cd = response[0].data[0].return_cd;
                    if (return_cd === '400002') {
                        const newStep = response[0].data[0].slry_prgrs_step_cd;
                        const newStepSeq = response[0].data[0].step_seq;
                        setSaveData((prev) => ({
                            ...prev,
                            slry_prgrs_step_cd: newStep,
                            step_seq: newStepSeq,
                        }));
                    }
                })
                .catch((error) => {
                    console.error(error);
                })
                .finally(() => {});
        }
    };

    // 닫기
    const handleClose = () => {
        setActiveStep(1);
        setParams((prev) => {
            return {
                ...prev,
                open: !open,
            };
        });
        setMasterRetrieve(true);
    };

    // 알림 띄우기
    const handleOpenAlert = () => {
        setOpenAlert(!openAlert);
    };

    const handleSnackBarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return; // 클릭으로 닫히는 것을 방지
        }
        // setSnackbarOpen(false); // Snackbar 닫기
    };

    if (dataLoading) return <Loader />;
    return (
        <>
            <Dialog
                fullScreen
                scroll={'paper'}
                open={open}
                onClose={handleClose}
                disableEscapeKeyDown
                transitionDuration={{
                    enter: 0,
                    exit: 0,
                }}
            >
                {/* 평가제목 +  뒤로가기/저장후다음 버튼 */}
                <AppBar sx={{ position: 'sticky' }} color='inherit' elevation={1}>
                    <Toolbar sx={{ position: 'relative' }}>
                        <Stack direction='row' alignItems='center' sx={{ marginRight: 'auto', maxWidth: '30%' }}>
                            {/* 풀모달 명 옆에 나가기 아이콘 */}
                            <IconButton
                                color='inherit'
                                onClick={activeStep < steps.length ? handleOpenAlert : handleClose}
                                aria-label='close'
                                sx={{ marginLeft: 'auto' }}
                            >
                                <CloseCircleTwoTone style={{ fontSize: '30px' }} twoToneColor='#bfbfbf' />
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
                                급여계산
                            </Typography>
                        </Stack>
                        <Stack direction='row' alignItems='center' spacing={1} sx={{ marginLeft: 'auto' }}>
                            {/*마지막단계에만 다르게 설정 */}
                            {activeStep <= steps.length && activeStep > 1 && (
                                <Button variant='outlined' color='inherit' onClick={handleStep(activeStep - 1)}>
                                    뒤로가기
                                </Button>
                            )}
                            {activeStep < steps.length ? (
                                <Button variant='contained' onClick={updateSlryMaster}>
                                    저장 후 다음
                                </Button>
                            ) : (
                                <Button variant='contained' color='success' onClick={handleClose}>
                                    나가기
                                </Button>
                            )}
                        </Stack>
                    </Toolbar>
                </AppBar>
                {/* 하단 전체 */}
                <div style={{ width: '100%', overflowX: 'auto', display: 'block' }}>
                    <Box>
                        {/* step별 화면 컨트롤 */}
                        <CreateDialog
                            activeStep={activeStep}
                            step={steps}
                            data={saveData}
                            setData={setSaveData}
                            setValidation={setValidation}
                            handleStep={handleStep}
                            handleModalClose={handleClose}
                        />
                    </Box>
                </div>
                {/* <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={2000}
                    onClose={(event, reason) => handleSnackBarClose(event, reason)}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert
                        onClose={handleSnackBarClose}
                        icon={false} // 아이콘 제거
                        severity="error"
                        sx={{
                            width: '100%',
                            height: '100%',
                            backgroundColor: '#ff1744',
                            color: 'white',
                            fontSize: '20px',
                        }}
                    >
                        {validation.message}
                    </Alert>
                </Snackbar> */}
                <CloseReview
                    open={openAlert}
                    handleClose={handleOpenAlert}
                    handleDialogClose={handleClose}
                    saveData={saveData}
                    setSaveData={setSaveData}
                    updateSlry={updateSlryStep}
                />
            </Dialog>
        </>
    );
}
