'use client';

import { Chip, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import styles from '../../../../components/FullDialog/evaluation/style.module.scss';
import { IcoCoworker, IcoDownEvaluation, IcoGroup, IcoPersonFill, IcoUpEvaluation } from '@/assets/Icon';
interface Props {
    data: Record<string, any>;
    setData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
    setValidation: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}
export default function EvlPreReview({ data, setData, setValidation }: Props) {
    const [procItem, setprocItem] = useState([]);
    useEffect(() => {
        const procInfo = data?.proc_info;
        setprocItem(procInfo);
        setValidation((prev) => ({
            ...prev,
            validation: true,
            type: 'cm002-1',
        }));
    }, []);
    return (
        <div className={styles.prereview}>
            {procItem?.map((item, index) => (
                <section key={index} className={styles.section}>
                    {/* 이거 아이콘 분기 기준 뭘로 잡아야할지 몰라서 임의로 했어요. 다시 잡아주세요 */}
                    <div className={styles.title}>
                        {item.proc_cd === 'hpm_group01015_cm0001' ? (
                            <IcoPersonFill fill='#666666' />
                        ) : item.proc_cd === 'hpm_group01015_cm0002' ? (
                            <IcoCoworker fill='#666666' />
                        ) : item.proc_cd === 'hpm_group01015_cm0003' ? (
                            <IcoUpEvaluation fill='#666666' />
                        ) : item.proc_cd === 'hpm_group01015_cm0004' ? (
                            <IcoGroup fill='#666666' />
                        ) : (
                            <IcoDownEvaluation fill='#666666' />
                        )}
                        {item.com_cd_nm}
                    </div>
                    <div className={styles.reviewCont}>
                        {item.hpm_group01018_cm0001 &&
                            item.hpm_group01018_cm0001.evlfmItem?.map((evlItems, index) => (
                                <div key={index}>
                                    <div className={styles.text}>
                                        <span className={styles.emphasis}>일반 평가:</span> {evlItems.evlfm_nm}
                                        {item.hpm_group01018_cm0001.wgvl !== undefined &&
                                            item.hpm_group01018_cm0001.wgvl !== null &&
                                            item.hpm_group01018_cm0001.wgvl !== '0' && (
                                                <span className={styles.perentage}>
                                                    {item.hpm_group01018_cm0001.wgvl} %
                                                </span>
                                            )}
                                    </div>
                                    {/* 수정된 부분 */}
                                </div>
                            ))}
                        {item.proc_cd === 'hpm_group01015_cm0002' && item.clg_chc_mthd?.clg_chc_mthd && (
                            <div className={styles.detailText}>
                                - 동료 선택 주체:
                                {item.clg_chc_mthd?.clg_chc_mthd === 'operr_chc'
                                    ? '운영자'
                                    : item.clg_chc_mthd?.clg_chc_mthd === 'trpr_chc'
                                    ? '평가 대상자'
                                    : '리더'}
                            </div>
                        )}
                        {item.clg_chc_mthd?.clg_chc_mthd !== 'operr_chc' && item.ptcp_clg_nope && (
                            <div className={styles.detailText}>
                                - 선택 인원: {`${item.ptcp_clg_nope?.min_nope} ~ ${item.ptcp_clg_nope?.max_nope}명`}
                            </div>
                        )}
                        {item.hpm_group01018_cm0002 &&
                            item.hpm_group01018_cm0002.evlfmItem?.map((evlItems, index) => (
                                <div key={index} direction={'row'} spacing={2}>
                                    <div className={styles.text}>
                                        <span className={styles.emphasis}>업적 평가:</span>
                                        {evlItems.evlfm_nm}
                                        {item.hpm_group01018_cm0002.wgvl !== undefined &&
                                            item.hpm_group01018_cm0002.wgvl !== null &&
                                            item.hpm_group01018_cm0002.wgvl !== '0' && (
                                                <span className={styles.perentage}>
                                                    {item.hpm_group01018_cm0002.wgvl} %
                                                </span>
                                            )}
                                    </div>
                                </div>
                            ))}
                        {item.hpm_group01018_cm0003 &&
                            item.hpm_group01018_cm0003.evlfmItem?.map((evlItems, index) => (
                                <div key={index} direction={'row'} spacing={2}>
                                    <div className={styles.text}>
                                        <span className={styles.emphasis}>종합 평가:</span>
                                        {evlItems.evlfm_nm}
                                        {item.hpm_group01018_cm0003.wgvl !== undefined &&
                                            item.hpm_group01018_cm0003.wgvl !== null &&
                                            item.hpm_group01018_cm0003.wgvl !== '0' && (
                                                <span className={styles.perentage}>
                                                    {item.hpm_group01018_cm0003.wgvl} %
                                                </span>
                                            )}
                                    </div>
                                </div>
                            ))}
                        {item.evl_dv && item.evl_dv?.evl_dv_bthd && (
                            <div className={styles.detailText}>
                                - 종합 등급 배분 가이드:
                                {item.evl_dv?.evl_dv_bthd === 'rt_bthd' ? ' 비율 기준' : ' 인원 기준'}
                            </div>
                        )}
                        {item.evl_dv && item.evl_dv?.rsn_yn && (
                            <div className={styles.detailText}>
                                - 가이드 미 준수 : {item.evl_dv?.rsn_yn === 'Y' ? '제출 허용' : '제출 미허용'}
                            </div>
                        )}
                    </div>
                </section>
            ))}
        </div>
    );
}
