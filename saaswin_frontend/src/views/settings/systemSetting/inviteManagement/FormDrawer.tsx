import InfoIcon from '@mui/icons-material/Info';
import { Box, FormControlLabel, Tooltip } from '@mui/material';
import InputTextBox from '@/components/InputTextBox';
import Checkbox from 'components/Checkbox';
import CheckboxGroup from 'components/CheckboxGroup';
import SwModal from 'components/Modal';
import Switch from 'components/Switch';
import Typography from 'components/Typography';
import { useEffect, useState } from 'react';
import { fetcherPostData } from 'utils/axios';
import { IcoCheckFill, IcoDelete } from '@/assets/Icon';
import Button from 'components/Button';
import RadioGroup from 'components/RadioGroup';
import Radio from 'components/Radio';
import SwTooltip from 'components/Tooltip';

const FormDrawer = ({ open, onClose, title, setTitle, id, isNewForm = false }) => {
    const [globalToggles, setGlobalToggles] = useState({});
    const [hrInfo, setHrInfo] = useState([]);
    const [workInfo, setWorkInfo] = useState([]);
    const [salaryInfo, setSalaryInfo] = useState([]);
    const [localTitle, setLocalTitle] = useState(title);
    const [radioValue, setRadioValue] = useState('hpr_group00003_cm0001');
    const [isLoading, setIsLoading] = useState(false);
    const [empNo, setEmpNo] = useState('');

    useEffect(() => {
        if (open) {
            setLocalTitle(title);

            if (isNewForm) {
                // 새 양식 기본값 설정
                setGlobalToggles({
                    hmrs_info: false,
                    lbr_info: false,
                    slry_info: false,
                });

                // 기본 체크박스 항목 설정 - 토글이 꺼져있으므로 value를 'false'로 설정
                setHrInfo([
                    { key: 'ognz', value: 'false', korn_nm: '조직' },
                    { key: 'jbttl', value: 'false', korn_nm: '직책' },
                    { key: 'ognz_ldr', value: 'false', korn_nm: '조직장' },
                    { key: 'duty', value: 'false', korn_nm: '직무' },
                    { key: 'jbps', value: 'false', korn_nm: '직위' },
                    { key: 'jbgd', value: 'false', korn_nm: '직급' },
                    { key: 'user_no', value: 'false', korn_nm: '사용자번호' },
                ]);

                setWorkInfo([
                    { key: 'lbr_ctrt_bgng_ymd', value: 'false', korn_nm: '근로계약 시작일' },
                    { key: 'lbr_ctrt_end_ymd', value: 'false', korn_nm: '근로계약 종료일' },
                    { key: 'rcrut_stts', value: 'false', korn_nm: '채용상태' },
                    { key: 'aplcn_work_type', value: 'false', korn_nm: '근무형태' },
                    { key: 'prbtn_prd_info', value: 'false', korn_nm: '수습기간 정보' },
                ]);

                setSalaryInfo([
                    { key: 'slry_ctrt_bgng_ymd', value: 'false', korn_nm: '급여계약 시작일' },
                    { key: 'slry_ctrt_end_ymd', value: 'false', korn_nm: '급여계약 종료일' },
                    { key: 'slry_dcsn_mthd', value: 'false', korn_nm: '급여결정방식' },
                    { key: 'ctrt_amt', value: 'false', korn_nm: '계약금액' },
                    { key: 'ctrt_mthd', value: 'false', korn_nm: '계약방식' },
                ]);

                setRadioValue('hpr_group00003_cm0003');

                // 사용자 번호 자동 채번 설정 조회 (새 항목에 대해서도)
                fetchUserNoSetting();
            } else {
                fetchData();
            }
        }
    }, [open, title, isNewForm]);

    // 버튼 클릭시 디테일 조회 함수
    const fetchData = () => {
        if (!id) return;

        setIsLoading(true);
        const item = [
            {
                sqlId: 'hpr_invtn01',
                sql_key: 'hpr_invtn_inpt_dtl_select',
                params: [{ invtn_inpt_id: id }],
            },
        ];

        fetcherPostData(item)
            .then((response) => {
                if (!response || response.length === 0) {
                    console.log('응답 데이터 없음, 기본값 사용');
                    return;
                }

                // 조회 값 초기화
                // 이름은 부모 카드에서 받아와서 사용
                const responseData = response;
                let parsedToggles = {}; // 전체 토글키
                let parsedHrInfo = []; // 인사 정보
                let parsedWorkInfo = []; // 근로 정보
                let parsedSalaryInfo = []; // 급여 정보
                let entrySetting = ''; // 입사일 기준 설정 라디오 버튼
                let emp_no = ''; // 사용자 번호

                if (responseData.length >= 7) {
                    if (Array.isArray(responseData[1].jsonb_build_object)) {
                        // 토글키 true / false 값 저장
                        responseData[1].jsonb_build_object.forEach((toggleItem) => {
                            parsedToggles[toggleItem.key] = toggleItem.value === 'true';
                        });
                    }

                    // 인사, 근로, 급여 정보 저장
                    parsedHrInfo = Array.isArray(responseData[2]?.jsonb_build_object)
                        ? responseData[2]?.jsonb_build_object
                        : [];
                    parsedWorkInfo = Array.isArray(responseData[3]?.jsonb_build_object)
                        ? responseData[3]?.jsonb_build_object
                        : [];
                    parsedSalaryInfo = Array.isArray(responseData[4]?.jsonb_build_object)
                        ? responseData[4]?.jsonb_build_object
                        : [];

                    // 입사일 기준 값 저장
                    entrySetting = responseData[5]?.jsonb_build_object?.jncmp_ymd_crtr_stng || 'hpr_group00003_cm0001';
                    emp_no = responseData[6]?.jsonb_build_object?.com_cd || '';
                }

                // 로컬 값에 저장
                setGlobalToggles(parsedToggles);
                setHrInfo(parsedHrInfo);
                setWorkInfo(parsedWorkInfo);
                setSalaryInfo(parsedSalaryInfo);
                setRadioValue(entrySetting);
                setEmpNo(emp_no);

                // 초기 설정: 스위치가 false면 내부 체크박스도 모두 false로 설정
                Object.keys(parsedToggles).forEach((key) => {
                    if (!parsedToggles[key]) {
                        handleToggleChange(key, false);
                    }
                });
            })
            .catch((error) => {
                console.error(' 데이터 불러오기 오류:', error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    // 저장시 형태 변환 함수 (배열에 seq 포함)
    const convertToKeyValue = (dataArray) => {
        return dataArray.map((field, index) => ({
            seq: (index + 1).toString(),
            [field.key]: field.value,
        }));
    };

    // 스위치 변경 함수 (OFF 시 내부 체크박스 false로 변경)
    const handleToggleChange = (key, isUserAction = true) => {
        setGlobalToggles((prev) => {
            const newState = isUserAction ? !prev[key] : prev[key];

            if (!newState) {
                if (key === 'hmrs_info') {
                    setHrInfo((prev) => prev.map((field) => ({ ...field, value: 'false' })));
                } else if (key === 'lbr_info') {
                    setWorkInfo((prev) => prev.map((field) => ({ ...field, value: 'false' })));
                    // 근로 계약 시작일이 선택되어 있으면 직접 입력으로 변경
                    if (radioValue === 'hpr_group00003_cm0001') {
                        setRadioValue('hpr_group00003_cm0003');
                    }
                } else if (key === 'slry_info') {
                    setSalaryInfo((prev) => prev.map((field) => ({ ...field, value: 'false' })));
                    // 임금 계약 시작일이 선택되어 있으면 직접 입력으로 변경
                    if (radioValue === 'hpr_group00003_cm0002') {
                        setRadioValue('hpr_group00003_cm0003');
                    }
                }
            }

            return {
                ...prev,
                [key]: newState,
            };
        });
    };

    // 체크박스 변경 함수
    const handleCheckboxChange = (categoryKey, fieldKey) => {
        if (categoryKey === 'hmrs_info') {
            setHrInfo((prev) =>
                prev.map((field) =>
                    field.key === fieldKey ? { ...field, value: field.value === 'true' ? 'false' : 'true' } : field
                )
            );
        } else if (categoryKey === 'lbr_info') {
            setWorkInfo((prev) =>
                prev.map((field) =>
                    field.key === fieldKey ? { ...field, value: field.value === 'true' ? 'false' : 'true' } : field
                )
            );
        } else if (categoryKey === 'slry_info') {
            setSalaryInfo((prev) =>
                prev.map((field) =>
                    field.key === fieldKey ? { ...field, value: field.value === 'true' ? 'false' : 'true' } : field
                )
            );
        }
    };

    // 저장 버튼 클릭 시 실행되는 함수
    const sendHandler = () => {
        // 양식 이름이 비어있는지 확인
        if (!localTitle || localTitle.trim() === '') {
            alert('양식 이름을 입력해주세요.');
            return;
        }

        // 모든 양식 데이터 포맷팅
        const formattedData = {
            visible_info: [
                { seq: '1', hmrs_info: globalToggles.hmrs_info ? 'true' : 'false' },
                { seq: '2', lbr_info: globalToggles.lbr_info ? 'true' : 'false' },
                { seq: '3', slry_info: globalToggles.slry_info ? 'true' : 'false' },
            ],
            hmrs_info: convertToKeyValue(hrInfo),
            ibr_info: convertToKeyValue(workInfo),
            slry_info: convertToKeyValue(salaryInfo),
            jncmp_ymd_crtr_stng: radioValue,
        };

        // 양식 이름과 함께 모든 설정을 부모 컴포넌트로 전달
        // 부모 컴포넌트에서 저장 처리를 일관되게 수행하도록 함
        const result = setTitle(localTitle, formattedData);

        // 제목 중복 체크 통과 시 모달 닫기
        if (result) {
            onClose();
        }
    };

    const sectionTitles = {
        hmrs_info: '인사 정보',
        lbr_info: '근로 정보',
        slry_info: '급여 정보',
    };

    // 사용자 번호 자동 채번 설정 조회 함수
    const fetchUserNoSetting = () => {
        const item = [
            {
                sqlId: 'hpr_invtn01',
                sql_key: 'hpr_invtn_inpt_dtl_select',
                params: [{}],
            },
        ];

        fetcherPostData(item)
            .then((response) => {
                if (response && response.length >= 1) {
                    const com_cd = response[4]?.jsonb_build_object?.com_cd || '';
                    setEmpNo(com_cd);
                }
            })
            .catch((error) => {
                console.error('사용자 번호 설정 조회 실패:', error);
            });
    };

    return (
        <SwModal
            open={open}
            size='xl'
            maxWidth='900px'
            onClose={onClose}
            PaperProps={{
                sx: {
                    m: 0,
                    height: '100vh', // 화면 높이 전체 (100vh)
                    Maximize: '100vh',
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: 0, // 모서리 둥글지 않게
                },
            }}
            className='configuration inviteFormDrawer'
        >
            {/* 상단 타이틀 */}
            <Typography type='form'>입력 항목 기본 양식</Typography>
            <div className='context'>
                <InputTextBox
                    type='text'
                    id='test1'
                    placeholder='입력 항목 기본 양식'
                    label='양식 이름'
                    asterisk
                    validationText=''
                    value={localTitle}
                    vertical
                    onChange={(e) => setLocalTitle(e.target.value)}
                    onDelete={() => setLocalTitle('')}
                />
            </div>
            <Typography
                type='section'
                tooltip
                title='관리자가 입력할 구성원 정보 양식을 설정합니다. 항목은 초대 후에도 입력할 수 있으며, 여러 필수 데이터를 일괄로 입력할 수 있습니다.'
            >
                초대 후 입력 항목 양식 관리
            </Typography>
            {Object.entries(globalToggles).map(([categoryKey, value]) => {
                const fields =
                    categoryKey === 'hmrs_info' ? hrInfo : categoryKey === 'lbr_info' ? workInfo : salaryInfo;

                return (
                    <section className='section' key={categoryKey}>
                        <div className='sectionTitle'>
                            <Switch
                                id={`${categoryKey}_switch`}
                                className='switch'
                                checked={value}
                                onChange={() => handleToggleChange(categoryKey)}
                            />
                            {sectionTitles[categoryKey]}
                        </div>
                        <div className='sectionCont'>
                            <CheckboxGroup className='checkboxGroup' direction='horizontal'>
                                {fields.map((field) => (
                                    <SwTooltip
                                        key={field.key}
                                        title={
                                            field.key === 'user_no' && empNo === 'hpo_group01029_cm0001'
                                                ? '사번이 자동채번으로 설정되어 있습니다. 사번을 직접 입력하시려면' +
                                                  '[환경설정>인사관리>인사정보기준>코드기준] 화면에서 설정을 변경해주세요'
                                                : ''
                                        }
                                        placement='bottom'
                                        arrow={true}
                                    >
                                        <span>
                                            <Checkbox
                                                key={field.key}
                                                checked={field.value === 'true'}
                                                onChange={() => handleCheckboxChange(categoryKey, field.key)}
                                                disabled={
                                                    // 토글이 꺼져있거나 사용자 번호 자동 채번이 설정되어 있으면 disabled
                                                    !globalToggles[categoryKey] ||
                                                    (field.key === 'user_no' && empNo === 'hpo_group01029_cm0001')
                                                }
                                                label={field.korn_nm}
                                                value={1}
                                            />
                                        </span>
                                    </SwTooltip>
                                ))}
                            </CheckboxGroup>
                        </div>
                    </section>
                );
            })}
            <div className='startDaySetting'>
                <Typography
                    type='section'
                    tooltip
                    title='근로 시작일 또는 임금 계약 시작일을 필수 정보로 설정하면 입사일 기준으로 설정할 수 있습니다.'
                >
                    입사일 기준 설정
                </Typography>
                <section className='section'>
                    <div className='sectionCont'>
                        <RadioGroup>
                            <Radio
                                id='radio1'
                                name='entrySetting'
                                label='근로 계약 시작일'
                                value='hpr_group00003_cm0001'
                                checked={radioValue === 'hpr_group00003_cm0001'}
                                onChange={() => setRadioValue('hpr_group00003_cm0001')}
                                disabled={!globalToggles.lbr_info}
                            />
                            <Radio
                                id='radio2'
                                name='entrySetting'
                                label='임금 계약 시작일'
                                value='hpr_group00003_cm0002'
                                checked={radioValue === 'hpr_group00003_cm0002'}
                                onChange={() => setRadioValue('hpr_group00003_cm0002')}
                                disabled={!globalToggles.slry_info}
                            />
                            <Radio
                                id='radio3'
                                name='entrySetting'
                                label='직접 입력'
                                value='hpr_group00003_cm0003'
                                checked={radioValue === 'hpr_group00003_cm0003'}
                                onChange={() => setRadioValue('hpr_group00003_cm0003')}
                            />
                        </RadioGroup>
                    </div>
                </section>
            </div>

            <div className='pageBtnArea'>
                <Button type='default' size='lg' onClick={onClose} className='btnWithIcon'>
                    <IcoDelete fill='#7C7C7C' />
                    닫기
                </Button>
                <Button type='primary' size='lg' onClick={sendHandler} className='btnWithIcon'>
                    <IcoCheckFill fill='#FFFFFF' />
                    양식 저장하기
                </Button>
            </div>
        </SwModal>
    );
};

export default FormDrawer;
