'use client';

import React from 'react';
import Typography from 'components/Typography';
import styles from '../../../styles/pages/templateApply/page.module.scss';

interface ApplyRejectProps {
    params: {
        apln_info?: {
            apply?: Array<{
                flnm?: string;
                atrz_stts_se_cd?: string;
                rjct_rsn?: string;
            }>;
        };
    };
}

const ApplyReject: React.FC<ApplyRejectProps> = ({ params }) => {
    // 반려자 정보 찾기 (atrz_stts_se_cd가 hrs_group00160_cm0003인 사용자)
    const rejecter = params.apln_info?.apply?.find((user) => user.atrz_stts_se_cd === 'hrs_group00160_cm0003');

    // 반려자 이름과 반려 사유 추출
    const rejecterName = rejecter?.flnm || '정보 없음';
    const rejectReason = rejecter?.rjct_rsn || '반려 사유가 입력되지 않았습니다.';

    return (
        <section className={`${styles.approvalLine} ${styles.section}`}>
            <Typography title='반려사유' type='section' className={styles.sectionTit}>
                반려사유
            </Typography>
            <div className='tblWrap'>
                <table className='tbl'>
                    <colgroup>
                        <col style={{ width: '180px' }} />
                        <col style={{ width: '*' }} />
                    </colgroup>
                    <tbody>
                        <tr>
                            <th>반려자</th>
                            <td>{rejecterName}</td>
                        </tr>
                        <tr>
                            <th>반려사유</th>
                            <td>{rejectReason}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default ApplyReject;
