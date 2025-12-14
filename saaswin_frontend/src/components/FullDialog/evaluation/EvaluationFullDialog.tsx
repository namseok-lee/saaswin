'use client';
import PropTypes from 'prop-types';
import { IconButton, Snackbar, Alert, Stack } from '@mui/material';

import CreateDialog from './CreateDialog';
// import ScrollX from 'components/ScrollX';
import { useEffect, useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import { TextField } from '@mui/material/index';
import CloseDialog from './CloseDialog';
import EvltrConfirmDialog from './EvltrConfirmDialog';
import { fetcherPostCmcd, fetcherPostData, fetcherPostGridData } from 'utils/axios';
import styles from './style.module.scss';
import SwModal from 'components/Modal';
import Button from 'components/Button';
import { IcoArrow, IcoBack, IcoCheck, IcoClose } from '@/assets/Icon';
export default function EvaluationFullDialog({ params, setParams, setMasterRetrieve }) {
    const user_no = 'WIN000031';
    const rprs_ognz_no = 'WIN';

    const [validation, setValidation] = useState({ validation: true, type: '', message: '' }); // 저장조건에 맞지 않을 시 snackbar에 띄울 메시지 저장 type ->현재 화면정보 ex)cm001-1, cm001-2
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [saveData, setSaveData] = useState({});
    const [activeType, setActiveType] = useState('hpm_group01014_cm0001'); // 현재 상태
    const [activeStep, setActiveStep] = useState(1); // 현재 단계
    const [openAlert, setOpenAlert] = useState(false); // 닫기버튼 클릭 시 알림
    const [titleMode, setTitleMode] = useState(false); // 타이틀이 있는지 없는지?
    const [title, setTitle] = useState(''); // 현재 리뷰의 타이틀
    const [rollback, setRollback] = useState(false); // 사전검토에서 -> 평가설정(일정)으로 rollback
    const [evltrConfirmOpen, setEvltrConfirmOpen] = useState(false);
    const { open } = params;
    const [step, setStep] = useState([]);
    const currentStepData =
        step?.find((item) => {
            const stepNumber = parseInt(item?.com_cd?.slice(-2), 10);
            return stepNumber === activeStep;
        }) || null;
    useEffect(() => {
        const fetchData = async () => {
            // 사전검토에서 평가설정(일정)으로 rollback
            if (rollback) {
                const item = [
                    {
                        sqlId: 'hpm_evl01',
                        sql_key: 'hpm_evl_step',
                        params: [
                            {
                                user_no: user_no,
                                rprs_ognz_no: rprs_ognz_no,
                                evl_id: evl_id,
                                evl_step_cd: 'hpm_group01016_cm0011',
                                value: {
                                    proc_info: evl_proc,
                                    evl_bscs_info: evl_bscs_info,
                                    evl_prgrs_stts_cd: 'hpm_group01014_cm0001',
                                },
                            },
                        ],
                    },
                ];
                const retrieveItem = [
                    {
                        sqlId: 'hpm_evl01',
                        sql_key: 'hpm_evl_id',
                        params: [
                            {
                                evl_id: params.modal_info.evl_id || saveData.evl_id,
                            },
                        ],
                    },
                ];
                try {
                    // 첫 번째 API 호출
                    await fetcherPostData(item);

                    // 두 번째 API 호출
                    const response = await fetcherPostData(retrieveItem);

                    // 두 번째 API 응답 처리
                    const evlData = response[0].data[0]?.['data|row_to_json'];
                    const evl_nm = evlData.evl_nm || '이름 없는 평가';
                    const evl_prgrs_stts_cd = evlData?.evl_prgrs_stts_cd || 'hpm_group01014_cm0001';
                    setSaveData((prev) => ({
                        ...prev,
                        evl_id: evlData.evl_id,
                        evl_nm: evl_nm,
                        evl_prgrs_stts_cd: evlData.evl_prgrs_stts_cd,
                        evl_bscs_info: evlData.evl_bscs_info,
                        ...(evlData?.trpr_info && { ['trpr_info']: evlData.trpr_info }),
                        ...(evlData?.proc_info && { ['proc_info']: evlData.proc_info }),
                        ...(evlData?.separator_info && { ['separator_info']: evlData.separator_info }),
                        ...(evlData?.dept_rt_bthd_yn && { ['dept_rt_bthd_yn']: evlData.dept_rt_bthd_yn }),
                    }));
                    setActiveType(evl_prgrs_stts_cd);
                } catch (error) {
                    console.error(error);
                } finally {
                    setActiveStep(11);
                    setRollback(false);
                }
            } else {
                if (!Array.isArray(params)) {
                    if (params?.modal_info?.evl_id || saveData.evl_id) {
                        // 기존의 평가 조회
                        const item = [
                            {
                                sqlId: 'hpm_evl01',
                                sql_key: 'hpm_evl_id',
                                params: [
                                    {
                                        evl_id: saveData.evl_id || params.modal_info.evl_id,
                                    },
                                ],
                            },
                        ];
                        try {
                            const response = await fetcherPostData(item);
                            const evlData = response[0];
                            const evl_nm = evlData.evl_nm || '이름 없는 평가';
                            const evl_prgrs_stts_cd = evlData?.evl_prgrs_stts_cd || 'hpm_group01014_cm0001';
                            setSaveData((prev) => ({
                                ...prev,
                                evl_id: evlData.evl_id,
                                evl_nm: evl_nm,
                                evl_prgrs_stts_cd: evl_prgrs_stts_cd,
                                evl_bscs_info: evlData.evl_bscs_info,
                                ...(evlData?.trpr_info && { ['trpr_info']: evlData.trpr_info }),
                                ...(evlData?.proc_info && { ['proc_info']: evlData.proc_info }),
                                ...(evlData?.separator_info && { ['separator_info']: evlData.separator_info }),
                                ...(evlData?.dept_rt_bthd_yn && { ['dept_rt_bthd_yn']: evlData.dept_rt_bthd_yn }),
                            }));
                            setActiveType(evl_prgrs_stts_cd);
                        } catch (error) {
                            console.error(error);
                        } finally {
                            setDataLoading(false);
                        }
                    } else {
                        setSaveData({
                            evl_id: '',
                            evl_nm: '이름 없는 평가',
                        });
                    }
                    const item = [
                        {
                            sqlId: 'hpm_evl01',
                            sql_key: 'hpm_step_get',
                            params: [
                                {
                                    rprs_ognz_no: rprs_ognz_no,
                                    rprsKey: 'COMGRP',
                                    crtr_ymd: '20250215',
                                },
                            ],
                        },
                    ];
                    try {
                        // 첫 번째 API 호출
                        const [redisRes, descriptionRes] = await Promise.all([
                            fetcherPostCmcd({
                                group_cd: activeType === 'hpm_group01014_cm0002' ? 'hpm_group01017' : 'hpm_group01016',
                                rprs_ognz_no: 'COMGRP',
                            }),
                            fetcherPostData(item),
                        ]);
                        //const redisData = redisRes[0]?.data[0]?.['data|json_agg'] || [];
                        const descriptionData = descriptionRes[0].json_agg || [];
                        const mergedData = redisRes.map((item) => {
                            const match = descriptionData.find((desc) => desc.evl_step_cd === item.com_cd);
                            return match ? { ...item, description: match.evl_step_scr_info.dsctn } : item;
                        });
                        setStep(mergedData);
                    } catch (error) {
                        console.error(error);
                    } finally {
                        setDataLoading(false);
                    }
                }
            }
        };
        fetchData();
    }, [params, activeType, rollback]);
    // 타입 별 submit로직
    const evl_id = saveData?.evl_id; // 평가 번호
    const evl_nm = saveData.evl_nm || '이름 없는 평가'; // 평가명
    const evl_bscs_info = saveData.evl_bscs_info; // 평가 상세정보
    const trpr_info = saveData.trpr_info || []; // 구성원
    const evl_proc = saveData.proc_info || []; // 절차구성
    const separator_info = saveData.separator_info || []; // 평가 양식분리
    const dept_rt_bthd_yn = saveData.dept_rt_bthd_yn || null; // 소속 비율 반영 여부
    const handlers = {
        'cm001-1': () => {
            if (evl_id !== '') {
                // 기존 데이터 평가명 변경
                const item = [
                    {
                        sqlId: 'hpm_evl01',
                        sql_key: 'hpm_evl_step',
                        params: [
                            {
                                evl_id: evl_id,
                                evl_step_cd: currentStepData.com_cd,
                                value: evl_nm,
                            },
                        ],
                    },
                ];
                fetcherPostGridData(item)
                    .then((response) => {
                        setSaveData((prev) => ({
                            ...prev,
                            ['cm001-1']: response[0],
                        }));
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            } else {
                // 평가 생성
                const item = [
                    {
                        sqlId: 'hpm_evl01',
                        sql_key: 'hpm_evl_create',
                        params: [
                            {
                                evl_nm: evl_nm,
                                evl_prgrs_stts_cd: 'hpm_group01014_cm0001',
                            },
                        ],
                    },
                ];
                fetcherPostData(item)
                    .then((response) => {
                        const data = response[0]['saaswin_hpm_evl_create'][0];
                        setSaveData((prev) => ({
                            ...prev,
                            evl_id: data.evl_id,
                            evl_nm: data.evl_nm,
                        }));
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }
        },
        'cm001-2_1': () => {
            // 대상자 - 모든 구성원 선택
            const item = [
                {
                    sqlId: 'hpm_evl01',
                    sql_key: 'hpm_evl_step',
                    params: [
                        {
                            evl_id: evl_id,
                            evl_step_cd: 'cm001-2_1',
                        },
                    ],
                },
            ];
            fetcherPostData(item)
                .then((response) => {
                    setSaveData((prev) => ({
                        ...prev,
                        trpr_info: response[0]['saaswin_hpm_evl_step'],
                    }));
                })
                .catch((error) => {
                    console.error(error);
                });
        },
        'cm001-2': () => {
            // 대상자 - 특정 구성원 선택
            const item = [
                {
                    sqlId: 'hpm_evl01',
                    sql_key: 'hpm_evl_step',
                    params: [
                        {
                            evl_id: evl_id,
                            evl_step_cd: currentStepData.com_cd,
                            value: trpr_info,
                        },
                    ],
                },
            ];
            fetcherPostData(item)
                .then((response) => {
                    setSaveData((prev) => ({
                        ...prev,
                        trpr_info: response[0]['saaswin_hpm_evl_step'],
                    }));
                })
                .catch((error) => {
                    console.error(error);
                });
            // 로직 작성
        },
        'cm001-3': () => {
            // 절차구성
            const item = [
                {
                    sqlId: 'hpm_evl01',
                    sql_key: 'hpm_evl_step',
                    params: [
                        {
                            evl_id: evl_id,
                            evl_step_cd: currentStepData.com_cd,
                            value: evl_proc,
                        },
                    ],
                },
            ];
            fetcherPostData(item)
                .then((response) => {
                    setSaveData((prev) => ({
                        ...prev,
                        proc_info: response[0].saaswin_hpm_evl_step,
                    }));
                })
                .catch((error) => {
                    console.error(error);
                });
        },
        'cm001-4': () => {
            // 평가 양식 분리
            const item = [
                {
                    sqlId: 'hpm_evl01',
                    sql_key: 'hpm_evl_step',
                    params: [
                        {
                            evl_id: evl_id,
                            evl_step_cd: currentStepData.com_cd,
                            value: separator_info,
                        },
                    ],
                },
            ];
            fetcherPostData(item)
                .then((response) => {
                    setSaveData((prev) => ({
                        ...prev,
                        separator_info: response[0]['saaswin_hpm_evl_step'].separator_info,
                    }));
                })
                .catch((error) => {
                    console.error(error);
                });
        },
        'cm001-7': () => {
            // 소속비율반영여부
            const item = [
                {
                    sqlId: 'hpm_evl01',
                    sql_key: 'hpm_evl_step',
                    params: [
                        {
                            evl_id: evl_id,
                            evl_step_cd: currentStepData.com_cd,
                            value: dept_rt_bthd_yn,
                        },
                    ],
                },
            ];
            fetcherPostData(item)
                .then((response) => {
                    setSaveData((prev) => ({
                        ...prev,
                        dept_rt_bthd_yn: response[0].saaswin_hpm_evl_step,
                    }));
                })
                .catch((error) => {
                    console.error(error);
                });
        },
        'cm001-11': async () => {
            // 일정
            const item = [
                {
                    sqlId: 'hpm_evl01',
                    sql_key: 'hpm_evl_step',
                    params: [
                        {
                            evl_id: evl_id,
                            evl_step_cd: currentStepData.com_cd,
                            value: {
                                proc_info: evl_proc,
                                evl_bscs_info: evl_bscs_info,
                                evl_prgrs_stts_cd: 'hpm_group01014_cm0002',
                            },
                        },
                    ],
                },
            ];
            // 재 조회
            const retrieveItem = [
                {
                    sqlId: 'hpm_evl01',
                    sql_key: 'hpm_evl_id',
                    params: [
                        {
                            evl_id: params.modal_info.evl_id || saveData.evl_id,
                        },
                    ],
                },
            ];
            try {
                const response = await fetcherPostData(item);
                setSaveData((prev) => ({
                    ...prev,
                    dept_rt_bthd_yn: response[0]['saaswin_hpm_evl_step'],
                }));
                // 평가 상태 재조회
                const retrieveRes = await fetcherPostData(retrieveItem);
                const evlData = retrieveRes[0];
                const evl_prgrs_stts_cd = evlData?.evl_prgrs_stts_cd;
                setActiveType(evl_prgrs_stts_cd);
            } catch (error) {
                console.error(error);
            } finally {
                setActiveStep(1);
                setDataLoading(false);
            }
        },
    };
    const handleSubmit = (type: string) => {
        const handler = handlers[type];
        if (handler) {
            handler();
        } else {
            console.warn(`Unhandled type: ${type}`);
        }
    };
    // 뒤로가기 및 다음 시 단계 이동
    const handleStep = (step: number, type: string) => () => {
        if (type === 'hpm_group01014_cm0002' && activeStep === 1) {
            setRollback(true);
        } else {
            if (step >= 1 && step <= 12) {
                setActiveStep(step);
            }
            setValidation((prev) => ({
                ...prev,
                validation: true,
            }));
        }
    };
    const updateReviewItem = (type: string) => {
        // if (type === 'hpm_group01014_cm0001') {
        if (validation.validation) {
            if (activeStep < step.length) {
                handleSubmit(validation.type);
                setActiveStep((prevStep) => {
                    const newStep = prevStep + 1;
                    handleStep(newStep, type); // step 증가를 직접 호출
                    return newStep;
                });
                setValidation((prev) => ({
                    ...prev,
                    validation: false,
                }));
                // 마지막 step(일정)일 경우
            } else if (activeStep === step.length) {
                handleSubmit(validation.type);
                setValidation((prev) => ({
                    ...prev,
                    validation: false,
                }));
            }
        } else {
            setSnackbarOpen(true);
        }
        // } else {
        //     if (validation.validation) {
        //         if (activeStep < step.length) {
        //             handleSubmit(validation.type);
        //             setActiveStep((prevStep) => {
        //                 const newStep = prevStep + 1;
        //                 handleStep(newStep, type); // step 증가를 직접 호출
        //                 return newStep;
        //             });
        //             setValidation((prev) => ({
        //                 ...prev,
        //                 validation: false,
        //             }));
        //             // 마지막 step(일정)일 경우
        //         }
        //     } else {
        //         setSnackbarOpen(true);
        //     }
        // }
    };
    const handleEvltrConfirmOpen = () => {
        setEvltrConfirmOpen(!evltrConfirmOpen);
    };
    // 닫기
    const handleClose = () => {
        setActiveStep(1);
        setTitleMode(false);
        setParams((prev) => {
            return {
                ...prev,
                open: !open,
            };
        });
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
    return (
        <>
            <SwModal
                fullScreen
                fullWidth
                open={open}
                onClose={handleClose}
                size='full'
                closeButton={false}
                className={styles.createEvaluation}
            >
                <div className='modalBar'>
                    {/* 평가제목 +  뒤로가기/저장후다음 버튼 */}
                    {activeStep < step.length + 1 ? null : !titleMode ? (
                        <Button
                            id=''
                            className={styles.btnTemp}
                            onClick={() => {
                                submitTitle(false);
                            }}
                        >
                            <IcoArrow fill='#fff' />
                        </Button>
                    ) : (
                        <>
                            <TextField
                                variant='standard'
                                value={title}
                                onChange={(e) => {
                                    changeTitle(e);
                                }}
                            />
                            <Button
                                onClick={() => {
                                    submitTitle(false);
                                }}
                            >
                                취소
                            </Button>
                            <Button
                                onClick={() => {
                                    submitTitle(true);
                                }}
                            >
                                확인
                            </Button>
                        </>
                    )}

                    <div className='tit'>
                        <IconButton color='inherit' onClick={handleOpenAlert} aria-label='close'>
                            {/* 데이터 조회 후 nav의 길이에 맞추기 */}
                            <IcoClose fill='#fff' />
                        </IconButton>
                        {saveData?.evl_nm || '이름 없는 평가'}
                    </div>
                    {activeType === 'hpm_group01014_cm0001' && activeStep < step.length + 1 && activeStep > 1 && (
                        <Button id='' className='btnBack btnWithIcon' onClick={handleStep(activeStep - 1, activeType)}>
                            <IcoBack /> 이전 단계
                        </Button>
                    )}
                    <div className='stepbtns'>
                        {/*마지막단계에만 다르게 설정 */}
                        <Stack direction={'row'} spacing={1}>
                            {activeType === 'hpm_group01014_cm0002' && (
                                <Button
                                    className='btnBack btnWithIcon'
                                    onClick={handleStep(activeStep - 1, activeType)}
                                >
                                    <IcoBack />
                                    {activeStep === 1
                                        ? '설정 변경'
                                        : activeStep === 2
                                        ? '이전 단계'
                                        : activeStep === 3
                                        ? '평가자 변경하기'
                                        : '평가 재활성화'}
                                </Button>
                            )}
                            {activeStep < step.length + 1 && (
                                <Button
                                    onClick={() => {
                                        if (activeType === 'hpm_group01014_cm0002' && activeStep === 2)
                                            handleEvltrConfirmOpen(activeType);
                                        else updateReviewItem(activeType);
                                    }}
                                    className='btnWithIcon btnStep'
                                >
                                    <IcoCheck fill='#fff' />
                                    {activeType === 'hpm_group01014_cm0001'
                                        ? '저장 후 다음'
                                        : activeType === 'hpm_group01014_cm0002' && activeStep === 1
                                        ? '검토 완료'
                                        : activeType === 'hpm_group01014_cm0002' && activeStep === 2
                                        ? '확정 후 시작'
                                        : activeType === 'hpm_group01014_cm0002' && activeStep === 3
                                        ? '평가 완료'
                                        : '평가 마감'}
                                </Button>
                            )}
                        </Stack>
                    </div>
                </div>

                {/* 하단 전체 */}
                <div style={{ width: '100%', overflowX: 'auto', display: 'block' }}>
                    {/* step별 화면 컨트롤 */}
                    <CreateDialog
                        activeStep={activeStep}
                        setActiveStep={setActiveStep}
                        step={step}
                        currentStepData={currentStepData}
                        activeType={activeType}
                        data={saveData}
                        setData={setSaveData}
                        setValidation={setValidation}
                        updateReviewItem={updateReviewItem}
                        handleStep={handleStep}
                        handleModalClose={handleClose}
                        dataLoading={dataLoading}
                    />
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
                        {validation.message || '완료되지 않은 작업이 있습니다.'}
                    </Alert>
                </Snackbar>
                {/* 저장 중간에 나가기 눌렀을 경우 == 화면별로 세팅 필요 */}
                <CloseDialog
                    open={openAlert}
                    handleClose={handleOpenAlert}
                    handleDialogClose={handleClose}
                    saveData={saveData}
                    setSaveData={setSaveData}
                    setParams={setParams}
                    setActiveType={setActiveType}
                    updateReviewItem={updateReviewItem}
                    setMasterRetrieve={setMasterRetrieve}
                />
                <EvltrConfirmDialog
                    open={evltrConfirmOpen}
                    data={saveData}
                    validation={validation}
                    setValidation={setValidation}
                    handleClose={handleEvltrConfirmOpen}
                    updateReviewItem={updateReviewItem}
                />
            </SwModal>
        </>
    );
}

EvaluationFullDialog.propTypes = {
    params: PropTypes.object,
    setParams: PropTypes.func,
};
