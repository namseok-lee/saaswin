'use client';
import PropTypes from 'prop-types';
import { Grid, Stack, Typography } from '@mui/material';
import Stepper from '@mui/material/Stepper';
import Box from '@mui/material/Box';
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye';
import CheckCircleFilled from '@ant-design/icons/CheckCircleFilled';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import Step from '@mui/material/Step';
import { StepLabel } from '@mui/material/index';
import { useEffect, useRef } from 'react';
import PayDayCreate from 'views/dialog/pay/payDayCreate';
import PayUserCreate from 'views/dialog/pay/payUserCreate';
import GridTab from 'views/sys01/gridTab';
import PayDiff from 'views/dialog/pay/payDIff';

// import payTarget from 'views/dialog/evaluation/payTarget';
// import payProcedual from 'views/dialog/evaluation/payProcedual';
export default function CreateDialog({ activeStep, step, data, setData, setValidation }) {
    const currentStepData = step?.find((item) => item?.step_seq === activeStep) || null; // step이 비어 있으면 null 반환
    const step_cd = currentStepData?.slry_step_cd || '';
    const step_seq = currentStepData?.step_seq || '';
    const step_nm = currentStepData?.slry_step_nm || '';
    const description = currentStepData?.step_scr_info?.description || '';
    const scr_no = currentStepData?.step_scr_info?.scr_no || '';
    const sqlId = currentStepData?.step_scr_info?.sql_id || '';
    const sqlKey = currentStepData?.step_scr_info?.sql_key || '';
    const stackRef = useRef(null);
    const { isNew } = data;

    function getStepContent(step: number) {
        switch (step) {
            case 1:
            case 4:
                return (
                    <PayDayCreate
                        scr_no={scr_no}
                        data={data}
                        setData={setData}
                        setValidation={setValidation}
                        stepSqlId={sqlId}
                        stepSqlKey={sqlKey}
                        isNew={isNew}
                    />
                );
            case 2:
            case 3:
                return <PayUserCreate scr_no={scr_no} data={data} stepSqlId={sqlId} stepSqlKey={sqlKey} />;
            case 5:
                return <PayDiff scr_no={scr_no} data={data} stepSqlId={sqlId} />;
        }
    }

    useEffect(() => {
        setData((prev) => ({
            ...prev,
            slry_prgrs_step_cd: step_cd,
            step_seq: step_seq,
        }));
    }, [currentStepData]);

    return (
        <>
            <Grid container spacing={2} sx={{ position: 'relative', height: '100%' }}>
                <Grid
                    item
                    xs={1.5}
                    sx={{
                        bgcolor: activeStep < 8 ? 'rgba(1,1, 1, 0.02)' : null,
                        position: 'relative',
                        border: '1px solid',
                        height: '100vh', // 전체 화면 높이 고정
                        mt: 2,
                    }}
                >
                    <Box sx={{ maxWidth: 400, marginLeft: '16px', display: 'flex', position: 'sticky', top: 25 }}>
                        <Stepper nonLinear orientation='vertical' activeStep={activeStep - 1}>
                            {step.map((step) => (
                                <Step key={step.slry_step_nm}>
                                    <StepLabel
                                        icon={
                                            step.step_seq === activeStep ? (
                                                <RadioButtonCheckedIcon
                                                    sx={{
                                                        fontSize: '25px', // 아이콘 크기 조정
                                                        color: '#1976d2', // 파란색 점
                                                    }}
                                                />
                                            ) : step.step_seq < step_seq ? (
                                                <CheckCircleFilled style={{ fontSize: '25px', color: '#389e0d' }} />
                                            ) : (
                                                <PanoramaFishEyeIcon style={{ fontSize: '25px' }} />
                                            )
                                        }
                                    >
                                        {step.slry_step_nm}
                                    </StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </Box>
                </Grid>
                <Grid item xs={10.5} sx={{ pb: 2 }}>
                    <Grid
                        container
                        spacing={2}
                        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 5 }}
                    >
                        <Stack direction={'row'} spacing={1.5} ref={stackRef}>
                            <Stack direction={'column'}>
                                <Stack
                                    direction={'column'}
                                    spacing={2}
                                    sx={{
                                        pb: 2,
                                        minWidth: '805px',
                                    }}
                                >
                                    <Typography variant='h2' sx={{ textAlign: 'left' }}>
                                        {step_nm}
                                    </Typography>
                                    <Typography variant='h4' sx={{ textAlign: 'left' }}>
                                        {description}
                                    </Typography>
                                    {getStepContent(activeStep)}
                                </Stack>
                            </Stack>
                        </Stack>
                    </Grid>
                </Grid>
            </Grid>
        </>
    );
}
CreateDialog.propTypes = {
    activeStep: PropTypes.number,
    data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    setData: PropTypes.func,
    setValidation: PropTypes.func,
    updateReviewItem: PropTypes.func,
    handleStep: PropTypes.func,
    handleModalClose: PropTypes.func,
};
