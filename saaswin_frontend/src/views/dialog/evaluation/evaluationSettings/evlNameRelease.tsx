'use client';

import { FormControlLabel, RadioGroup, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { IcoAccount, IcoCoworker, IcoUpEvaluation } from '@/assets/Icon';
import styles from '../../../../components/FullDialog/evaluation/style.module.scss';
import Radio from 'components/Radio';

interface Props {
    data: Record<string, any>;
    setData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
    setValidation: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}
export default function EvlNameRelease({ data, setData, setValidation }: Props) {
    const [radioValue, setRadioValue] = useState({});
    const [procItem, setProcItem] = useState();
    const handleRadioChange = (e: { target: { value: string } }, type: string) => {
        const value = e.target.value;
        setRadioValue((prev) => ({ ...prev, [type]: value }));

        const updated = procItem.map((item) => {
            if (type === 'clgEvl' && item.proc_cd === 'hpm_group01015_cm0002') {
                return { ...item, evltr_nm_rls_ctgry: value };
            }
            if (type === 'upEvl' && item.proc_cd === 'hpm_group01015_cm0003') {
                return { ...item, evltr_nm_rls_ctgry: value };
            }
            return item;
        });

        setProcItem(updated);
    };

    useEffect(() => {
        if (data) {
            setProcItem(data.proc_info);
            const clgEvl = data.proc_info.find((item) => item.proc_cd === 'hpm_group01015_cm0002') || [];
            const upEvl = data.proc_info.find((item) => item.proc_cd === 'hpm_group01015_cm0003') || [];
            setProcItem((prevItems) =>
                prevItems.map((item) => {
                    // proc_cd가 'hpm_group01015_cm0002'인 경우에만 수정
                    if (item.proc_cd === 'hpm_group01015_cm0002') {
                        return {
                            ...item,
                            evltr_nm_rls_ctgry: clgEvl.evltr_nm_rls_ctgry ? clgEvl.evltr_nm_rls_ctgry : 'prvt',
                        };
                    } else if (item.proc_cd === 'hpm_group01015_cm0003') {
                        return {
                            ...item,
                            evltr_nm_rls_ctgry: upEvl.evltr_nm_rls_ctgry ? upEvl.evltr_nm_rls_ctgry : 'prvt',
                        };
                    }
                    return item; // 조건에 맞지 않으면 변경하지 않음
                })
            );
            setRadioValue({
                clgEvl: clgEvl?.evltr_nm_rls_ctgry ? clgEvl?.evltr_nm_rls_ctgry : 'prvt', // 동료평가 공개범위
                upEvl: upEvl?.evltr_nm_rls_ctgry ? upEvl?.evltr_nm_rls_ctgry : 'prvt', // 선행평가 공개범위
            });
        }
    }, []);
    useEffect(() => {
        setData((prev) => ({
            ...prev,
            proc_info: procItem,
        }));
        setValidation((prev) => ({
            ...prev,
            validation: true,
            type: 'cm001-3',
        }));
    }, [procItem]);
    const hasClgProcCd = procItem?.some((item) => ['hpm_group01015_cm0002'].includes(item.proc_cd)); // 동료평가 존재유무
    const hasMatchingProcCd = procItem?.some((item) => ['hpm_group01015_cm0003'].includes(item.proc_cd)); // 상향평가 존재유무
    return (
        <div className={styles.nameRelease}>
            {procItem?.map((item) => {
                return (
                    <div key={item.proc_cd}>
                        {item.proc_cd === 'hpm_group01015_cm0002' && (
                            <section className={styles.section}>
                                <div className={styles.title}>
                                    <IcoCoworker fill='#666' />
                                    동료 평가
                                </div>
                                <div className={styles.userName}>
                                    <IcoAccount fill='#666' />
                                    평가자 이름
                                </div>
                                <RadioGroup
                                    aria-labelledby='demo-controlled-radio-buttons-group'
                                    name='controlled-radio-buttons-group'
                                    value={radioValue?.clgEvl}
                                    onChange={(e) => {
                                        handleRadioChange(e, 'clgEvl');
                                    }}
                                    className={styles.radioGroup}
                                >
                                    <Radio
                                        id='radio-whol_rls'
                                        name='controlled-radio-buttons-group'
                                        label='전체공개'
                                        value='whol_rls'
                                        checked={radioValue?.clgEvl === 'whol_rls'}
                                        onChange={() => handleRadioChange({ target: { value: 'whol_rls' } }, 'clgEvl')}
                                    />
                                    <Radio
                                        id='radio-supr_operr_rls'
                                        name='controlled-radio-buttons-group'
                                        label='평가 대상자의 직속 상사, 총괄운영자에게만 공개'
                                        value='supr_operr_rls'
                                        checked={radioValue?.clgEvl === 'supr_operr_rls'}
                                        onChange={() =>
                                            handleRadioChange({ target: { value: 'supr_operr_rls' } }, 'clgEvl')
                                        }
                                    />
                                    <Radio
                                        id='radio-operr_rls'
                                        name='controlled-radio-buttons-group'
                                        label='총괄운영자에게만 공개'
                                        value='operr_rls'
                                        checked={radioValue?.clgEvl === 'operr_rls'}
                                        onChange={() => handleRadioChange({ target: { value: 'operr_rls' } }, 'clgEvl')}
                                    />
                                    <Radio
                                        id='radio-prvt'
                                        name='controlled-radio-buttons-group'
                                        label='비공개(총괄운영자도 확인 불가)'
                                        value='prvt'
                                        checked={radioValue?.clgEvl === 'prvt'}
                                        onChange={() => handleRadioChange({ target: { value: 'prvt' } }, 'clgEvl')}
                                    />
                                </RadioGroup>
                            </section>
                        )}
                    </div>
                );
            })}
            {hasMatchingProcCd && (
                <section className={styles.section}>
                    <div className={styles.title}>
                        <IcoUpEvaluation fill='#666' />
                        상향 평가
                    </div>
                    <div className={styles.userName}>
                        <IcoAccount fill='#666' />
                        평가자 이름
                    </div>
                    <RadioGroup
                        aria-labelledby='demo-controlled-radio-buttons-group2'
                        name='controlled-radio-buttons-group2'
                        value={radioValue?.upEvl}
                        onChange={(e) => {
                            handleRadioChange(e, 'upEvl');
                        }}
                        className={styles.radioGroup}
                    >
                        <Radio
                            id='radio-whol_rls2'
                            name='controlled-radio-buttons-group2'
                            label='전체공개'
                            value='whol_rls2'
                            checked={radioValue?.upEvl === 'whol_rls2'}
                            onChange={() => handleRadioChange({ target: { value: 'whol_rls2' } }, 'upEvl')}
                        />
                        <Radio
                            id='radio-supr_operr_rls2'
                            name='controlled-radio-buttons-group2'
                            label='평가 대상자의 직속 상사, 총괄운영자에게만 공개'
                            value='supr_operr_rls2'
                            checked={radioValue?.upEvl === 'supr_operr_rls2'}
                            onChange={() => handleRadioChange({ target: { value: 'supr_operr_rls2' } }, 'upEvl')}
                        />
                        <Radio
                            id='radio-operr_rls2'
                            name='controlled-radio-buttons-group2'
                            label='총괄운영자에게만 공개'
                            value='operr_rls2'
                            checked={radioValue?.upEvl === 'operr_rls2'}
                            onChange={() => handleRadioChange({ target: { value: 'operr_rls2' } }, 'upEvl')}
                        />
                        <Radio
                            id='radio-prvt2'
                            name='controlled-radio-buttons-group2'
                            label='비공개(총괄운영자도 확인 불가)'
                            value='prvt2'
                            checked={radioValue?.upEvl === 'prvt2'}
                            onChange={() => handleRadioChange({ target: { value: 'prvt2' } }, 'upEvl')}
                        />
                    </RadioGroup>
                </section>
            )}
            {!hasClgProcCd && !hasMatchingProcCd && <div>동료/상향평가가 없습니다. 다음단계로 이동하세요.</div>}
        </div>
    );
}
