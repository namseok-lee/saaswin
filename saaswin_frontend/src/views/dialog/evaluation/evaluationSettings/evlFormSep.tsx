'use client';

import { useEffect, useState } from 'react';
interface Props {
    data: Record<string, any>;
    setData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
    setValidation: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}
import styles from '../../../../components/FullDialog/evaluation/style.module.scss';
import Radio from 'components/Radio';
export default function EvlFormSeperator({ data, setData, setValidation }: Props) {
    const value = data?.separator_info;
    const allRadioLabel = (
        <div style={{ lineHeight: '2' }}>
            <strong>모든 직군 동일한 평가 양식 사용</strong>
            <br />
            직군에 상관없이 공통된 평가 양식으로 평가를 진행합니다.
        </div>
    );
    const selctedRadioLabel = (
        <div style={{ lineHeight: '2' }}>
            <strong>직군별로 다른 평가 양식 사용</strong>
            <br />
            직군에 따라 다른 평가 양식으로 평가를 진행합니다. 직군이 설정되지 않은 대상은 디폴드 양식으로 진행합니다.
        </div>
    );
    // const [radioValue, setRadioValue] = useState(value || 'N');
    const [initialized, setInitialized] = useState(false);
    // 라디오버튼 체크 상태
    const [selectedOption, setSelectedOption] = useState(value || 'N');
    // const handleChange = (event) => {
    //     const newValue = event.target.value;
    //     const formattedData = { separator_info: newValue };
    //     setData((prev) => ({
    //         ...prev,
    //         separator_info: formattedData,
    //     }));
    //     setRadioValue(event.target.value);
    // };

    // 데이터 세팅
    useEffect(() => {
        if (!initialized && value) {
            setSelectedOption(value);
            setInitialized(true); // 초기화 완료
        }
    }, [data, initialized]);

    // Validation 설정 (radioValue 변경 시)

    useEffect(() => {
        if (value) {
            setData((prev) => ({
                ...prev,
                separator_info: selectedOption,
            }));
        }
        setValidation((prev) => ({
            ...prev,
            validation: true,
            type: 'cm001-4',
        }));
    }, [selectedOption]);

    return (
        <div className={styles.evalFormSeperator}>
            <section className={styles.selectTarget}>
                <label htmlFor='selectN' className={`${styles.radioBox} ${selectedOption === 'N' ? styles.on : ''}`}>
                    <div className={styles.wrap}>
                        <Radio
                            id='selectN'
                            name='selectMember'
                            value='N'
                            checked={selectedOption === 'N'}
                            onChange={() => setSelectedOption('N')}
                        />
                        <div className={styles.label}>{allRadioLabel}</div>
                    </div>
                </label>
                <label htmlFor='selectY' className={`${styles.radioBox} ${selectedOption === 'Y' ? styles.on : ''}`}>
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
                </label>
            </section>
        </div>
    );
}
