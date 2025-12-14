'use client';

import Chip from 'components/Chip';
import React, { MouseEvent, useRef, useState } from 'react';
import { IcoCaution, IcoTemplateArrowRight } from '@/assets/Icon';
import styles from '../../../styles/pages/templateApply/page.module.scss';
import ApplyLinePop from './applyLinePop';
import Typography from 'components/Typography';

interface ApplyLineProps {
    params: { open: boolean; [key: string]: any };
    setParams: React.Dispatch<React.SetStateAction<any>>;
    formMode?: string; // formMode prop 추가
}

// params -> apply_line : []
const ApplyLine: React.FC<ApplyLineProps> = ({ params, setParams, formMode }) => {
    // applyLineData 이므로, 해당 안에 결제자 , 수신자 데이터 있어야함.
    // open , apply [] , receive [] 있음

    const [dragging, setDragging] = useState(false);
    const startXRef = useRef(0);
    const startYRef = useRef(0);
    const threshold = 5; // 드래그로 간주할 최소 이동 픽셀 수

    const formatDate = (dateString) => {
        if (!dateString || dateString.length < 8) return '';

        const year = dateString.substring(0, 4);
        const month = dateString.substring(4, 6);
        const day = dateString.substring(6, 8);

        return `${year}.${month}.${day}`;
    };

    const handleMouseDown = (e: MouseEvent<HTMLElement>) => {
        startXRef.current = e.clientX;
        startYRef.current = e.clientY;
        setDragging(false);
    };

    const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
        const diffX = Math.abs(e.clientX - startXRef.current);
        const diffY = Math.abs(e.clientY - startYRef.current);
        if (diffX > threshold || diffY > threshold) {
            setDragging(true);
        }
    };

    const handleClick = (e: MouseEvent<HTMLElement>) => {
        // 드래그가 발생한 경우 클릭 이벤트 무시
        if (dragging) {
            e.preventDefault();
            return;
        }
        onClick(e);
    };

    // 영역 클릭 시, 결제라인 팝업 뜸 - formMode가 approval이면 팝업 띄우지 않음
    const onClick = (e) => {
        // approval 모드에서는 클릭 무시
        if (formMode === 'approval' || formMode === 'view') return;

        setParams((prev) => {
            return {
                ...prev,
                open: true,
            };
        });
    };

    return (
        <>
            <section
                onClick={handleClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                className={`${styles.approvalLine} ${styles.section}`}
            >
                <Typography title='결재라인' type='section' className={styles.sectionTit}>
                    결재라인
                </Typography>
                <div className='tblWrap'>
                    <table className='tbl'>
                        <colgroup>
                            <col style={{ width: '180px' }} />
                            <col style={{ width: '*' }} />
                        </colgroup>
                        <tbody>
                            <tr>
                                <th>결재자</th>
                                <td>
                                    <ul className={styles.approverList}>
                                        {params.apply?.map((apply, index) => (
                                            <React.Fragment key={index}>
                                                <li className={styles.item}>
                                                    <Chip type='label' close={false}>
                                                        {apply.flnm + '(' + apply.apnt_jbps_cd_nm + ')'}
                                                    </Chip>
                                                    {apply.atrz_stts_se_cd === 'hrs_group00160_cm0002' &&
                                                        apply.atrz_prcs_dt && (
                                                            <div className={styles.state}>
                                                                결재 {formatDate(apply.atrz_prcs_dt)}
                                                            </div>
                                                        )}
                                                    {apply.atrz_stts_se_cd === 'hrs_group00160_cm0003' &&
                                                        apply.atrz_prcs_dt && (
                                                            <div className={`${styles.state} ${styles.reject}`}>
                                                                반려 {formatDate(apply.atrz_prcs_dt)}
                                                            </div>
                                                        )}
                                                </li>
                                                {index < params.apply.length - 1 && (
                                                    <IcoTemplateArrowRight fill='#666' />
                                                )}
                                            </React.Fragment>
                                        ))}
                                        {params.apply?.length === 0 && (
                                            <div className={styles.guideText}>
                                                <IcoCaution fill='#ED6C02' /> 클릭하여 결재자를 지정해주세요.
                                            </div>
                                        )}
                                    </ul>
                                </td>
                            </tr>
                            <tr>
                                <th>수신참조</th>
                                <td>
                                    <ul className={styles.approverList}>
                                        {params.receive?.map((receive, index) => (
                                            <React.Fragment key={index}>
                                                <li className={styles.item}>
                                                    <Chip type='label' close={false}>
                                                        {receive.flnm + '(' + receive.apnt_jbps_cd_nm + ')'}
                                                    </Chip>
                                                </li>
                                                {index < params.receive.length - 1 && ' , '}
                                            </React.Fragment>
                                        ))}
                                    </ul>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
            <ApplyLinePop params={params} setParams={setParams} />
        </>
    );
};

export default ApplyLine;
