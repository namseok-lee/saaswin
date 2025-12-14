'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import styles from '../../../../components/FullDialog/evaluation/style.module.scss';
import { IcoCoworker, IcoDownEvaluation } from '@/assets/Icon';
import BoxSelect from 'components/BoxSelect';
import { SelectChangeEvent } from '@mui/material';

interface Props {
    data: Record<string, any>;
    setData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
    setValidation: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

export default function EvlReferenceInfo({ data, setData, setValidation }: Props) {
    const [selectedValue, setSelectedValue] = useState({
        onslf_evl_rls_ctgry: '',
        bfr_evl_rls_ctgry: '',
    });
    const [procItem, setProcItem] = useState<any[]>([]);
    const [initialized, setInitialized] = useState(false); // 무한루프 방지용 플래그

    const handleSelectChange = (e: SelectChangeEvent, type: string) => {
        const value = e.target.value;
        setSelectedValue((prev) => ({ ...prev, [type]: value }));

        const updatedProcItems = procItem.map((item) => {
            if (type === 'onslf_evl_rls_ctgry' && item.proc_cd === 'hpm_group01015_cm0002') {
                return { ...item, onslf_evl_rls_ctgry: value };
            }
            if (type === 'bfr_evl_rls_ctgry' && item.proc_cd === 'hpm_group01015_cm0004') {
                return { ...item, bfr_evl_rls_ctgry: value };
            }
            return item;
        });

        setProcItem(updatedProcItems);
    };

    useEffect(() => {
        if (data?.proc_info && !initialized) {
            const clgEvl = data.proc_info.find((item) => item.proc_cd === 'hpm_group01015_cm0002') || {};
            const downEvl = data.proc_info.find((item) => item.proc_cd === 'hpm_group01015_cm0004') || {};

            const updatedProcItems = data.proc_info.map((item) => {
                if (item.proc_cd === 'hpm_group01015_cm0002') {
                    return {
                        ...item,
                        onslf_evl_rls_ctgry: clgEvl.onslf_evl_rls_ctgry || 'prvt',
                    };
                }
                if (item.proc_cd === 'hpm_group01015_cm0004') {
                    return {
                        ...item,
                        bfr_evl_rls_ctgry: downEvl.bfr_evl_rls_ctgry || 'prvt',
                    };
                }
                return item;
            });

            setProcItem(updatedProcItems);
            setSelectedValue({
                onslf_evl_rls_ctgry: clgEvl.onslf_evl_rls_ctgry || 'prvt',
                bfr_evl_rls_ctgry: downEvl.bfr_evl_rls_ctgry || 'prvt',
            });

            setData((prev) => ({ ...prev, proc_info: updatedProcItems }));
            setValidation((prev) => ({ ...prev, validation: true, type: 'cm001-3' }));
            setInitialized(true);
        }
    }, [data, initialized, setData, setValidation]);

    const hasDownEval = procItem.some((item) =>
        [
            'hpm_group01015_cm0004',
            'hpm_group01015_cm0005',
            'hpm_group01015_cm0006',
            'hpm_group01015_cm0007',
            'hpm_group01015_cm0008',
        ].includes(item.proc_cd)
    );

    const downItem = procItem.find((item) => item.proc_cd === 'hpm_group01015_cm0004');

    return (
        <div className={styles.reference}>
            {procItem
                .filter((item) => item.proc_cd === 'hpm_group01015_cm0002')
                .map((item) => (
                    <section key={item.proc_cd} className={styles.section}>
                        <div className={styles.title}>
                            <IcoCoworker fill='#666' />
                            동료 평가
                        </div>
                        <BoxSelect
                            id='onslf_select'
                            label='자기 평가 공개 범위'
                            value={selectedValue.onslf_evl_rls_ctgry}
                            onChange={(e) => handleSelectChange(e, 'onslf_evl_rls_ctgry')}
                            options={[
                                { value: 'prvt', label: '비공개' },
                                { value: 'onslf_elv_rls', label: '동료에게 자기 평가 내용 공개' },
                            ]}
                            displayEmpty
                            vertical
                            className={styles.selectBox}
                        />
                    </section>
                ))}

            {hasDownEval && downItem && (
                <section key={downItem.proc_cd} className={styles.section}>
                    <div className={styles.title}>
                        <IcoDownEvaluation fill='#666' />
                        하향 평가
                    </div>
                    <BoxSelect
                        id='bfr_select'
                        label='선행 평가 공개 범위'
                        value={selectedValue.bfr_evl_rls_ctgry}
                        onChange={(e) => handleSelectChange(e, 'bfr_evl_rls_ctgry')}
                        options={[
                            { value: 'prvt', label: '비공개' },
                            { value: 'trpr_rt_input', label: '모든 평가자에게 선행 평가 내용 공개' },
                            { value: 'last_evltr_bfr_evl_rls', label: '최종 평가자에게만 선행 평가 내용 공개' },
                        ]}
                        displayEmpty
                        vertical
                        className={styles.selectBox}
                    />
                </section>
            )}
        </div>
    );
}
