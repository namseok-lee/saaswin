'use client';

import { FormControl, FormControlLabel, RadioGroup, Stack, Typography } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import styles from '../../../../components/FullDialog/evaluation/style.module.scss';
import Radio from 'components/Radio';
import DateRangePicker from 'components/DateRangePicker';
import BoxSelect from 'components/BoxSelect';
import SwDateRangePicker from 'components/DateRangePicker';
interface Props {
    data: Record<string, any>;
    setData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
    setValidation: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}
export default function EvlTargetRfltYn({ data, setData, setValidation }: Props) {
    const defalutRadioLabel = (
        <div style={{ lineHeight: '2' }}>
            <strong>현 소속 기준</strong>
            <br />
            평가 대상자의 소속 변경 여부와 무관하게 현재 소속을 기준으로 평가를 진행합니다.
            <br />
            겸직 중일 경우 주 소속을 기준으로 평가를 진행합니다.
        </div>
    );
    const selctedRadioLabel = (
        <div style={{ lineHeight: '2' }}>
            <strong>소속 별 비율 반영</strong>
            <br />
            정해진 기간 내에 평가대상자의 소속이 바뀌었거나 겸직 중인 경우, 소속 별로 반영할 평가 비율을 설정합니다.
        </div>
    );
    const [rtftInfo, setRtftInfo] = useState(); // 소속비율 반영 여부
    const [rangeValue, setRangeValue] = useState<DateRange<Dayjs>>([dayjs().add(-1, 'year'), dayjs()]); // 소속정보반영기간
    const [selectedValue, setSelectedValue] = useState(''); // 비율 반영 방식
    const [radioValue, setRadioValue] = useState('Y');
    const [initialized, setInitialized] = useState(false);
    // 라디오버튼 체크 상태
    const [selectedOption, setSelectedOption] = useState('N');
    const [selectedValues, setSelectedValues] = useState({
        test1: [1, 2, 3],
    });
    const options = {
        test1: [{ value: 'wk_prd_rflt', label: '근무 기간 비율 반영' }],
        test2: [{ value: 'trpr_rt_input', label: '대상자 별로 비율 직접 입력' }],
    };
    const handleChange = (event) => {
        const value = event.target.value;
        if (value === 'N') {
            setRtftInfo({ dept_rt_bthd_yn: value });
            setSelectedValue('');
            setRangeValue([dayjs().add(-1, 'year'), dayjs()]);
        } else {
            setRtftInfo((prev) => ({
                ...prev,
                dept_rt_bthd_yn: value,
            }));
            setRtftInfo((prev) => ({
                ...prev,
                bgng_ymd: dayjs(rangeValue[0]).format('YYYYMMDD'),
                end_ymd: dayjs(rangeValue[1]).format('YYYYMMDD'),
            }));
        }
        // setData((prev) => ({
        //     ...prev,
        //     separator_info: formattedData,
        // }));
        setRadioValue(event.target.value);
    };
    const handleRangeChange = (newRange) => {
        setRangeValue(newRange);
        setRtftInfo((prev) => ({
            ...prev,
            bgng_ymd: newRange[0] ? newRange[0].format('YYYYMMDD') : null,
            end_ymd: newRange[1] ? newRange[1].format('YYYYMMDD') : null,
        }));
    };
    const handleSelectChange = (e) => {
        const value = e.target.value;
        setSelectedValue(value);
        setRtftInfo((prev) => ({
            ...prev,
            rt_rflt_bthd: value,
        }));
    };
    // 데이터 세팅
    useEffect(() => {
        // rtft_info가 없으면 기본 객체를 사용합니다.
        const rtft = data?.dept_rt_bthd_yn ?? { dept_rt_bthd_yn: 'N' };
        setRtftInfo(rtft);
        setRadioValue(rtft.dept_rt_bthd_yn ?? 'N');
        setRangeValue([
            rtft.bgng_ymd ? dayjs(rtft.bgng_ymd, 'YYYYMMDD') : dayjs().add(-1, 'year'),
            rtft.end_ymd ? dayjs(rtft.end_ymd, 'YYYYMMDD') : dayjs(),
        ]);
        setSelectedValue(rtft.rt_rflt_bthd ?? '');
    }, []);
    // Validation 설정 (radioValue 변경 시)
    useEffect(() => {
        const valid = radioValue === 'Y' && rtftInfo?.rt_rflt_bthd === undefined;
        if (valid) {
            setValidation((prev) => ({
                ...prev,
                validation: false,
                message: '비율 반영 방식을 선택하세요.',
            }));
        } else {
            console.log('save!!!');
            setData((prev) => ({
                ...prev,
                dept_rt_bthd_yn: rtftInfo,
            }));
            setValidation((prev) => ({
                ...prev,
                validation: true,
                type: 'cm001-7',
            }));
        }
    }, [rtftInfo]);
    return (
        <>
            <div className={styles.updateRateWhether}>
                <section className={styles.selectTarget}>
                    <label
                        htmlFor='selectN'
                        className={`${styles.radioBox} ${selectedOption === 'N' ? styles.on : ''}`}
                    >
                        <div className={styles.wrap}>
                            <Radio
                                id='selectN'
                                name='selectMember'
                                value='N'
                                checked={selectedOption === 'N'}
                                onChange={() => setSelectedOption('N')}
                            />
                            <div className={styles.label}>{defalutRadioLabel}</div>
                        </div>
                    </label>
                    <label
                        htmlFor='selectY'
                        className={`${styles.radioBox} ${selectedOption === 'Y' ? styles.on : ''}`}
                    >
                        <div className={styles.wrap}>
                            <Radio
                                id='selectY'
                                name='selectMember'
                                value='Y'
                                checked={selectedOption === 'Y'}
                                onChange={() => setSelectedOption('Y')}
                            />
                            <div className={styles.label}>{selctedRadioLabel}</div>
                        </div>
                        {selectedOption === 'Y' && (
                            <div className={styles.addInfo}>
                                <SwDateRangePicker
                                    label='소속 정보 반영 기간'
                                    id='test10'
                                    vertical
                                    onChange={(e) => handleRangeChange(e)}
                                />
                                <BoxSelect
                                    id='test1'
                                    placeholder='선택해 주세요'
                                    label='비율 반영 방식'
                                    displayEmpty
                                    value={selectedValue}
                                    onChange={(e) => handleSelectChange(e)}
                                    vertical
                                    options={options['test1'] || []}
                                />
                            </div>
                        )}
                    </label>
                </section>
            </div>
        </>
    );
}
