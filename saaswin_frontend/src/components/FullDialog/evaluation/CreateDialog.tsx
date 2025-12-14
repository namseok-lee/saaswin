'use client';
import PropTypes from 'prop-types';
import Stepper from '@mui/material/Stepper';
import CheckCircleFilled from '@ant-design/icons/CheckCircleFilled';
import Step from '@mui/material/Step';
import { StepLabel } from '@mui/material/index';
import EvlTitle from 'views/dialog/evaluation/evaluationSettings/evlTitle';
import EvlTarget from 'views/dialog/evaluation/evaluationSettings/evlTarget';
import EvlProcedual from 'views/dialog/evaluation/evaluationSettings/evlProcedual';
import EvlFormSeperation from 'views/dialog/evaluation/evaluationSettings/evlFormSep';
import EvlProcedualSetting from 'views/dialog/evaluation/evaluationSettings/evlProcedualSetting';
import EvlGradeDistribution from 'views/dialog/evaluation/evaluationSettings/evlGradeDistribution';
import EvlTargetRfltYn from 'views/dialog/evaluation/evaluationSettings/evlTargetRfltYn';
import EvlTargetRfltSetting from 'views/dialog/evaluation/evaluationSettings/evlTargetRfltSetting';
import EvlReferenceInfo from 'views/dialog/evaluation/evaluationSettings/evlReferenceInfo';
import EvlNameReleaseInfo from 'views/dialog/evaluation/evaluationSettings/evlNameRelease';
import EvlScheduleInfo from 'views/dialog/evaluation/evaluationSettings/evlSchedule';
import EvlPreReview from 'views/dialog/evaluation/evlauationProcess/evlPreReview';
import EvltrConfirmed from 'views/dialog/evaluation/evlauationProcess/evltrConfirmed';
import EvlResult from 'views/dialog/evaluation/evlauationProcess/evlResult';
import EvlMonitoring from 'views/dialog/evaluation/evlauationProcess/evlMonitoring/EvlMonitoring';
import Loader from 'components/Loader';
import styles from './style.module.scss';
export default function CreateDialog({
    activeStep,
    setActiveStep,
    step,
    currentStepData,
    activeType,
    data,
    setData,
    setValidation,
    dataLoading,
}) {
    const step_nm = currentStepData?.com_cd_nm || '';
    const description = currentStepData?.description || '';
    function getStepContent(step: number) {
        //  평가 구성
        if (activeType === 'hpm_group01014_cm0001') {
            switch (step) {
                case 1:
                    return <EvlTitle data={data} setData={setData} setValidation={setValidation} />;
                case 2:
                    return <EvlTarget data={data} setData={setData} setValidation={setValidation} />;
                case 3:
                    return <EvlProcedual data={data} setData={setData} setValidation={setValidation} />;
                case 4:
                    return <EvlFormSeperation data={data} setData={setData} setValidation={setValidation} />;
                case 5:
                    return <EvlProcedualSetting data={data} setData={setData} setValidation={setValidation} />;
                case 6:
                    return <EvlTargetRfltYn data={data} setData={setData} setValidation={setValidation} />;
                case 7:
                    return <EvlTargetRfltSetting data={data} setData={setData} setValidation={setValidation} />;
                case 8:
                    return <EvlGradeDistribution data={data} setData={setData} setValidation={setValidation} />;
                case 9:
                    return <EvlReferenceInfo data={data} setData={setData} setValidation={setValidation} />;
                case 10:
                    return <EvlNameReleaseInfo data={data} setData={setData} setValidation={setValidation} />;
                case 11:
                    return <EvlScheduleInfo data={data} setData={setData} setValidation={setValidation} />;
            }
            // 평가 진행
        } else {
            switch (step) {
                case 1:
                    return <EvlPreReview data={data} setData={setData} setValidation={setValidation} />;
                case 2:
                    return <EvltrConfirmed data={data} setData={setData} setValidation={setValidation} />;
                case 3:
                    return <EvlMonitoring data={data} setData={setData} setValidation={setValidation} />;
                case 4:
                    return <EvlResult data={data} setData={setData} setValidation={setValidation} />;
            }
        }
    }
    const handleStepClick = (activeStep: number) => {
        setActiveStep(activeStep);
    };
    if (dataLoading) return <Loader />;
    return (
        <>
            <div className={styles.context}>
                <div className={styles.stepper}>
                    <Stepper nonLinear orientation='vertical' activeStep={activeStep - 1}>
                        {step.map((step) => (
                            <Step key={step.com_cd_nm}>
                                <StepLabel
                                    sx={{ cursor: 'pointer' }}
                                    onClick={() => {
                                        handleStepClick(parseInt(step?.com_cd.slice(-2), 10));
                                    }}
                                    icon={
                                        parseInt(step?.com_cd?.slice(-2), 10) > activeStep ? (
                                            <div className={styles.icoStepReady}></div>
                                        ) : parseInt(step?.com_cd?.slice(-2), 10) < activeStep ? (
                                            <CheckCircleFilled className={styles.icoStepDone} />
                                        ) : (
                                            <div className={styles.icoStepIng}></div>
                                        )
                                    }
                                >
                                    {step.com_cd_nm}
                                </StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </div>
                <div className={styles.contents}>
                    {activeStep === 1 && activeType === 'hpm_group01014_cm0001' ? (
                        <div className={styles.evaluationName}>
                            <div className={styles.nameWrap}>
                                <div className={styles.name}>{step_nm}</div>
                                <div className={styles.desc}>
                                    {currentStepData?.com_cd !== 'hpm_group01016_cm0009' ? (
                                        description
                                    ) : (
                                        <>
                                            평가를 진행할 때 참고자료로 활용할 내용과 열람 가능한 평가자를 지정할 수
                                            있습니다.
                                            <br />
                                            선행 평가란, 현재 평가 진행자의 앞에서 이루어진 모든 평가를 의미합니다.
                                        </>
                                    )}
                                </div>
                                {getStepContent(activeStep)}
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className={styles.pageName}>
                                <div className={styles.name}>{step_nm}</div>
                                <div className={styles.desc}>
                                    {currentStepData?.com_cd !== 'hpm_group01016_cm0009' ? (
                                        <div className={styles.txtGuide}>{description}</div>
                                    ) : (
                                        <>
                                            평가를 진행할 때 참고자료로 활용할 내용과 열람 가능한 평가자를 지정할 수
                                            있습니다.
                                            <br />
                                            선행 평가란, 현재 평가 진행자의 앞에서 이루어진 모든 평가를 의미합니다.
                                        </>
                                    )}
                                </div>
                            </div>
                            {getStepContent(activeStep)}
                        </>
                    )}
                </div>
            </div>
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
