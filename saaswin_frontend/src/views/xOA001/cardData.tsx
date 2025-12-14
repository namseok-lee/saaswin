import dayjs from 'dayjs';
import {
    IcoCardCareer,
    IcoCardContact,
    IcoCardAppointment,
    IcoCardEducation,
    IcoCardQualification,
    IcoCardLanguage,
    IcoCardHistory,
    IcoCardData,
    IcoCardReward,
    IcoCardTraining,
    IcoCardMilitary,
    IcoCardFamily,
    IcoCardDisabled,
    IcoCardPatriptism,
    IcoCardHr,
} from '../../../public/asset/Icon';
import Empty from '@/components/Empty';
import { Fragment } from 'react';

// 사용자 데이터 타입 정의
interface UserData {
    user_id?: string;
    addr_info?: any;
    telno_info?: any;
    brdt?: string;
    korn_flnm?: string;
    eng_flnm?: string;
    ntn_cd?: string;
    jncmp_ymd?: string;
    reg_no?: string;
    bsc_info?: any;
    acbg_info?: any;
    apnt_info?: any;
    wnawd_info?: any;
    dspn_info?: any;
    edu_info?: any;
    lgsdy_info?: any;
    rwdptr_info?: any;
    mltsvc_info?: any;
    fam_info?: any;
    dsblty_info?: any;
    qlfc_info?: any;
    crr_info?: any;
    eldoc_file_info?: any;
    [key: string]: unknown;
}

export const cardData = [
    {
        key: 'cardSlot1',
        title: '근로자정보',
        icon: <IcoCardHr fill='#ffffff' />,
        content: (userData: UserData | null) => {
            if (!userData || !userData.bsc_info) return <Empty>데이터가 없습니다.</Empty>;
            const bsc_info = userData.bsc_info as Record<string, string>;
            return (
                <>
                    <div className='primary'>
                        <div className='emphasis'>
                            <div className='title'>{bsc_info?.korn_flnm || '-'}</div>
                            <div className='text'>{bsc_info?.eng_flnm || '-'}</div>
                        </div>
                    </div>
                    {bsc_info?.brdt && (
                        <div className='infoRow'>
                            <div className='rowTitle'>나이</div>
                            <div className='rowText'>
                                만 {dayjs().diff(dayjs(bsc_info?.brdt, 'YYYYMMDD'), 'year') || '-'}세
                            </div>
                        </div>
                    )}
                    {bsc_info?.brdt && (
                        <div className='infoRow'>
                            <div className='rowTitle'>생년월일</div>
                            <div className='rowText'>
                                {bsc_info?.brdt &&
                                    `양력 ${dayjs(bsc_info?.brdt).format('YYYY')}년 ${dayjs(bsc_info?.brdt).format(
                                        'MM'
                                    )}월 ${dayjs(bsc_info?.brdt).format('DD')}일`}
                            </div>
                        </div>
                    )}
                    {bsc_info?.ntn_cd && (
                        <div className='infoRow'>
                            <div className='rowTitle'>국적</div>
                            <div className='rowText'>{bsc_info?.ntn_cd || '-'}</div>
                        </div>
                    )}
                    {bsc_info?.jncmp_ymd && (
                        <div className='infoRow'>
                            <div className='rowTitle'>입사일</div>
                            <div className='rowText'>{dayjs(bsc_info?.jncmp_ymd).format('YYYY.MM.DD')}</div>
                        </div>
                    )}
                </>
            );
        },
    },
    {
        key: 'cardSlot2',
        title: '주소/연락처',
        icon: <IcoCardContact fill='#ffffff' />,
        content: (userData: UserData | null) => {
            if (!userData || (!userData.addr_info && !userData.telno_info && !userData.user_id)) {
                return <Empty>데이터가 없습니다.</Empty>;
            }

            const addr_info =
                userData?.addr_info?.find((item: any) => item.addr_knd_cd === '현거주지') || userData?.addr_info?.[0];
            const telno_info =
                userData?.telno_info?.find((item: any) => item.telno_knd_cd === '개인번호') ||
                userData?.telno_info?.[0];
            const isExtNo = userData?.telno_info?.find((item: any) => item.telno_knd_cd === '내선번호');
            return (
                <>
                    {addr_info?.addr && (
                        <div className='infoRow'>
                            <div className='rowTitle'>주소</div>
                            <div className='rowText'>{addr_info?.addr || '-'}</div>
                        </div>
                    )}
                    {addr_info?.daddr && (
                        <div className='infoRow'>
                            <div className='rowTitle'>상세주소</div>
                            <div className='rowText'>{addr_info?.daddr || '-'}</div>
                        </div>
                    )}
                    {addr_info?.zip && (
                        <div className='infoRow'>
                            <div className='rowTitle'>우편번호</div>
                            <div className='rowText'>{addr_info?.zip || '-'}</div>
                        </div>
                    )}
                    {userData?.user_id && (
                        <div className='infoRow'>
                            <div className='rowTitle'>이메일</div>
                            <div className='rowText'>{userData?.user_id || '-'}</div>
                        </div>
                    )}
                    {telno_info?.tel_no && (
                        <div className='infoRow'>
                            <div className='rowTitle'>개인번호</div>
                            <div className='rowText'>{telno_info?.telno || '-'}</div>
                        </div>
                    )}
                    {isExtNo?.telno && (
                        <div className='infoRow'>
                            <div className='rowTitle'>내선번호</div>
                            <div className='rowText'>{isExtNo?.telno || '-'}</div>
                        </div>
                    )}
                </>
            );
        },
    },
    {
        key: 'cardSlot3',
        title: '발령',
        icon: <IcoCardAppointment fill='#ffffff' />,
        content: (userData: UserData | null) => {
            if (!userData || !userData.apnt_info) return <Empty>데이터가 없습니다.</Empty>;
            const apnt = userData.apnt_info as Record<string, string>;
            return (
                <>
                    <div className='primary'>
                        <div className='emphasis'>
                            <div className='title'>조직변경, 승진</div>
                            <div className='text'>2025.01.01</div>
                        </div>
                    </div>
                    <ul className='infoWordList'>
                        <li className='item'>기술지원실</li>
                        <li className='item'>차장</li>
                        <li className='item'>본부장</li>
                    </ul>
                    <hr className='diviLine' />
                    <div className='primary'>
                        <div className='emphasis'>
                            <div className='title'>승진</div>
                            <div className='text'>2024.01.01</div>
                        </div>
                    </div>
                    <ul className='infoWordList'>
                        <li className='item'>경영지원팀</li>
                        <li className='item'>과장</li>
                        <li className='item'>파트장</li>
                    </ul>
                    <hr className='diviLine' />
                    <div className='primary'>
                        <div className='emphasis'>
                            <div className='title'>채용</div>
                            <div className='text'>{apnt?.apnt_jncmp_ymd || '-'}</div>
                        </div>
                    </div>
                    <ul className='infoWordList'>
                        <li className='item'>경영지원팀</li>
                        <li className='item'>{apnt?.apnt_jbps_cd || '-'}</li>
                        <li className='item'>{apnt?.apnt_jbttl_cd || '-'}</li>
                    </ul>
                </>
            );
        },
    },
    {
        key: 'cardSlot4',
        title: '학력',
        icon: <IcoCardEducation fill='#ffffff' />,
        content: (userData: UserData | null) => {
            if (!userData || !Array.isArray(userData?.acbg_info) || userData.acbg_info.length === 0) {
                return <Empty>데이터가 없습니다.</Empty>;
            }
            const lastAcbg = userData.acbg_info[userData.acbg_info.length - 1];
            return (
                <>
                    {lastAcbg.schl_nm && (
                        <div className='primary'>
                            <div className='emphasis'>학사</div>
                            <div className='emphasis'>{lastAcbg?.schl_nm || '-'}</div>
                            <div className='emphasis'>{lastAcbg?.grdtn_cd || '-'}</div>
                        </div>
                    )}
                    {lastAcbg.mtcltn_ym && (
                        <div className='infoRow'>
                            <div className='rowTitle'>재학기간</div>
                            <div className='rowText'>
                                {dayjs(lastAcbg?.mtcltn_ym).format('YYYY.MM')} ~{' '}
                                {dayjs(lastAcbg?.grdtn_ym).format('YYYY.MM')}
                            </div>
                        </div>
                    )}
                    {lastAcbg.scsbjt && (
                        <div className='infoRow'>
                            <div className='rowTitle'>학과</div>
                            <div className='rowText'>{lastAcbg?.scsbjt || '-'}</div>
                        </div>
                    )}
                    {lastAcbg.mjr && (
                        <div className='infoRow'>
                            <div className='rowTitle'>전공</div>
                            <div className='rowText'>{lastAcbg?.mjr || '-'}</div>
                        </div>
                    )}
                    {lastAcbg.dbl_mjr && (
                        <div className='infoRow'>
                            <div className='rowTitle'>복수전공</div>
                            <div className='rowText'>{lastAcbg?.dbl_mjr || '-'}</div>
                        </div>
                    )}
                    {lastAcbg.mnr_mjr && (
                        <div className='infoRow'>
                            <div className='rowTitle'>부전공</div>
                            <div className='rowText'>{lastAcbg?.mnr_mjr || '-'}</div>
                        </div>
                    )}
                </>
            );
        },
    },
    {
        key: 'cardSlot5',
        title: '경력',
        icon: <IcoCardCareer fill='#ffffff' />,
        content: (userData: UserData | null) => {
            if (!userData || !Array.isArray(userData?.crr_info) || userData.crr_info.length === 0) {
                return <Empty>데이터가 없습니다.</Empty>;
            }
            const recentCrr = userData.crr_info
                .slice()
                .sort((a, b) => b.work_end_ym.localeCompare(a.work_end_ym))
                .slice(0, 2);
            return (
                <>
                    {recentCrr.map((item, index) => (
                        <Fragment key={`crr-${index}`}>
                            {item.work_co_nm && (
                                <div className='primary'>
                                    <div className='emphasis'>
                                        <span className='title'>{item.work_co_nm}</span>
                                        {item.jbgd_nm && (
                                            <div className='text'>
                                                {item.jbgd_nm}, {item.jbttl_nm}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {item.work_bgng_ym && item.work_end_ym && (
                                <div className='infoRow'>
                                    <div className='rowTitle'>근무기간</div>
                                    <div className='rowText'>
                                        {dayjs(item.work_bgng_ym).format('YYYY.MM')} ~{' '}
                                        {dayjs(item.work_end_ym).format('YYYY.MM')}
                                    </div>
                                </div>
                            )}
                            {item.work_dept_nm && (
                                <div className='infoRow'>
                                    <div className='rowTitle'>근무부서</div>
                                    <div className='rowText'>{item.work_dept_nm}</div>
                                </div>
                            )}
                            {index !== recentCrr.length - 1 && <hr className='diviLine' />}
                        </Fragment>
                    ))}
                </>
            );
        },
    },
    {
        key: 'cardSlot6',
        title: '자격',
        icon: <IcoCardQualification fill='#ffffff' />,
        content: (userData: UserData | null) => {
            if (!userData || !Array.isArray(userData?.qlfc_info) || userData.qlfc_info.length === 0) {
                return <Empty>데이터가 없습니다.</Empty>;
            }
            const recentQlfc = userData.qlfc_info
                .slice()
                .sort((a, b) => b.acqs_ymd.localeCompare(a.acqs_ymd))
                .slice(0, 2);
            return (
                <>
                    {recentQlfc.map((item, index) => (
                        <Fragment key={`qlfc-${index}`}>
                            <div className='primary'>
                                <div className='emphasis'>
                                    <span className='title'>{item.crtfct}</span>
                                    <div className='text'>{dayjs(item.acqs_ymd).format('YYYY.MM.DD')}</div>
                                </div>
                            </div>
                            {item.qlfc_se_cd && (
                                <div className='infoRow'>
                                    <div className='rowTitle'>자격구분</div>
                                    <div className='rowText'>{item.qlfc_se_cd}</div>
                                </div>
                            )}
                            {item.pblcn_inst_nm && (
                                <div className='infoRow'>
                                    <div className='rowTitle'>발행기관</div>
                                    <div className='rowText'>{item.pblcn_inst_nm}</div>
                                </div>
                            )}
                            {index !== recentQlfc.length - 1 && <hr className='diviLine' />}
                        </Fragment>
                    ))}
                </>
            );
        },
    },
    {
        key: 'cardSlot7',
        title: '어학',
        icon: <IcoCardLanguage fill='#ffffff' />,
        content: (userData: UserData | null) => {
            if (!userData || !Array.isArray(userData?.lgsdy_info) || userData.lgsdy_info.length === 0) {
                return <Empty>데이터가 없습니다.</Empty>;
            }
            const recentLgsdy = userData.lgsdy_info
                .slice()
                .sort((a, b) => b.bgng_ymd.localeCompare(a.bgng_ymd))
                .slice(0, 2);
            return (
                <>
                    {recentLgsdy.map((item, index) => (
                        <Fragment key={`lgsdy-${index}`}>
                            {item.lgsdy_se_cd && (
                                <div className='primary'>
                                    <div className='emphasis'>
                                        <span className='title'>{item.lgsdy_se_cd}</span>
                                    </div>
                                    {item.lgsdy_nm && (
                                        <div className='emphasis'>
                                            <span className='title'>{item.lgsdy_nm}</span>
                                        </div>
                                    )}
                                    {item.lgsdy_scre && (
                                        <div className='emphasis'>
                                            <span className='title'>{item.lgsdy_scre}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                            {item.evl_inst_nm && (
                                <div className='infoRow'>
                                    <div className='rowTitle'>평가기관</div>
                                    <div className='rowText'>{item.evl_inst_nm}</div>
                                </div>
                            )}
                            {item.bgng_ymd && item.end_ymd && (
                                <div className='infoRow'>
                                    <div className='rowTitle'>유효기간</div>
                                    <div className='rowText'>
                                        {dayjs(item.bgng_ymd).format('YYYY.MM.DD')} ~{' '}
                                        {dayjs(item.end_ymd).format('YYYY.MM.DD')}
                                    </div>
                                </div>
                            )}
                            {index !== recentLgsdy.length - 1 && <hr className='diviLine' />}
                        </Fragment>
                    ))}
                </>
            );
        },
    },
    {
        key: 'cardSlot8',
        title: '직무이력',
        icon: <IcoCardHistory fill='#ffffff' />,
        content: (userData: UserData | null) => {
            if (!userData || !Array.isArray(userData?.duty_info) || userData.duty_info.length === 0) {
                return <Empty>데이터가 없습니다.</Empty>;
            }
            const duty_info = userData.duty_info;
            return (
                <>
                    <div className='primary'>
                        <div className='emphasis'>재무</div>
                        <div className='emphasis'>회계</div>
                    </div>
                    <div className='infoRow'>
                        <div className='rowTitle'>직무기간</div>
                        <div className='rowText'>2017.12.30 ~ (7년 6개월)</div>
                    </div>
                    <hr className='diviLine' />
                    <div className='primary'>
                        <div className='emphasis'>경영기획</div>
                    </div>
                    <div className='infoRow'>
                        <div className='rowTitle'>직무기간</div>
                        <div className='rowText'>2017.12.30 ~ (7년 6개월)</div>
                    </div>
                    <hr className='diviLine' />
                    <div className='primary'>
                        <div className='emphasis'>경영지원</div>
                    </div>
                    <div className='infoRow'>
                        <div className='rowTitle'>직무기간</div>
                        <div className='rowText'>2017.12.30 ~ (7년 6개월)</div>
                    </div>
                </>
            );
        },
    },
    {
        key: 'cardSlot9',
        title: '교육',
        icon: <IcoCardTraining fill='#ffffff' />,
        content: (userData: UserData | null) => {
            if (!userData || !Array.isArray(userData?.edu_info) || userData.edu_info.length === 0) {
                return <Empty>데이터가 없습니다.</Empty>;
            }
            const recentEdu = userData.edu_info
                .slice()
                .sort((a, b) => b.end_ymd.localeCompare(a.end_ymd))
                .slice(0, 2);
            return (
                <>
                    {recentEdu.map((item, index) => (
                        <Fragment key={`edu-${index}`}>
                            <div className='primary'>
                                <div className='emphasis'>
                                    <span className='title'>{item.edu_se_cd}</span>
                                    <div className='text'>
                                        {dayjs(item.start_ymd).format('YYYY.MM.DD')} ~{' '}
                                        {dayjs(item.end_ymd).format('YYYY.MM.DD')}
                                    </div>
                                </div>
                            </div>
                            <div className='infoRow'>
                                <div className='rowTitle'>교육명</div>
                                <div className='rowText'>{item.edu_nm}</div>
                            </div>
                            <div className='infoRow'>
                                <div className='rowTitle'>교육기관</div>
                                <div className='rowText'>{item.ednst_nm}</div>
                            </div>
                            {index !== recentEdu.length - 1 && <hr className='diviLine' />}
                        </Fragment>
                    ))}
                </>
            );
        },
    },
    {
        key: 'cardSlot10',
        title: '상벌',
        icon: <IcoCardReward fill='#ffffff' />,
        content: (userData: UserData | null) => {
            if (!userData || (!userData.wnawd_info && !userData.dspn_info)) {
                return <Empty>데이터가 없습니다.</Empty>;
            }

            // 빈 객체 체크 함수
            const isEmpty = (obj) => obj == null || (typeof obj === 'object' && Object.keys(obj).length === 0);

            const wnawd_info_list = Array.isArray(userData.wnawd_info) ? userData.wnawd_info : [];
            const dspn_info_list = Array.isArray(userData.dspn_info) ? userData.dspn_info : [];

            const wnawd_info = wnawd_info_list.reduce(
                (latest: any, current: any) =>
                    (current.rwrd_ymd || '0') > (latest.rwrd_ymd || '0') ? current : latest,
                {} // 초기값 넣어주는 것도 중요 (빈 배열일 경우 에러 방지)
            );

            const dspn_info = dspn_info_list.reduce(
                (latest: any, current: any) =>
                    (current.rwrd_ymd || '0') > (latest.dspn_ymd || '0') ? current : latest,
                {} // 초기값 넣어주는 것도 중요
            );

            // 실제 데이터 존재 여부 체크
            const hasWnawd = !isEmpty(wnawd_info) && wnawd_info.rwrd_knd_cd;
            const hasDspn = !isEmpty(dspn_info) && dspn_info.dspn_knd_cd;

            if (!hasWnawd && !hasDspn) {
                return <Empty>데이터가 없습니다.</Empty>;
            }

            return (
                <>
                    {hasWnawd && (
                        <>
                            {wnawd_info.rwrd_knd_cd && (
                                <div className='primary'>
                                    <div className='emphasis'>포상</div>
                                    <div className='emphasis'>{wnawd_info?.rwrd_knd_cd || '-'}</div>
                                </div>
                            )}
                            {wnawd_info.rwrd_nm && (
                                <div className='infoRow'>
                                    <div className='rowTitle'>포상명</div>
                                    <div className='rowText'>{wnawd_info?.rwrd_nm || '-'}</div>
                                </div>
                            )}
                            {wnawd_info?.rwrd_ymd && (
                                <div className='infoRow'>
                                    <div className='rowTitle'>포상일</div>
                                    <div className='rowText'>
                                        {dayjs(wnawd_info?.rwrd_ymd).format('YYYY.MM.DD') || '-'}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* 수정된 구분선 조건: 둘 다 데이터가 있을 때만 표시 */}
                    {hasWnawd && hasDspn && <hr className='diviLine' />}

                    {hasDspn && (
                        <>
                            {dspn_info.dspn_knd_cd && (
                                <div className='primary'>
                                    <div className='emphasis'>징계</div>
                                    <div className='emphasis'>{dspn_info?.dspn_knd_cd || '-'}</div>
                                </div>
                            )}
                            {dspn_info.dspn_rsn_nm && (
                                <div className='infoRow'>
                                    <div className='rowTitle'>징계사유</div>
                                    <div className='rowText'>{dspn_info?.dspn_rsn_nm || '-'}</div>
                                </div>
                            )}
                            {dspn_info.dspn_ymd && (
                                <div className='infoRow'>
                                    <div className='rowTitle'>징계일</div>
                                    <div className='rowText'>
                                        {dayjs(dspn_info?.dspn_ymd).format('YYYY.MM.DD') || '-'}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </>
            );
        },
    },
    {
        key: 'cardSlot11',
        title: '병역',
        icon: <IcoCardMilitary fill='#ffffff' />,
        content: (userData: UserData | null) => {
            if (!userData || !Array.isArray(userData?.mltsvc_info) || userData.mltsvc_info.length === 0) {
                return <Empty>데이터가 없습니다.</Empty>;
            }

            const mltsvc_info = userData.mltsvc_info[0];
            return (
                <>
                    {mltsvc_info.srvc_se_cd && (
                        <div className='primary'>
                            <div className='emphasis'>{mltsvc_info.srvc_se_cd}</div>
                            <div className='emphasis'>{mltsvc_info.dcrg_se_cd}</div>
                        </div>
                    )}
                    {mltsvc_info.mtrs_knd_cd && (
                        <div className='infoRow'>
                            <div className='rowTitle'>군별</div>
                            <div className='rowText'>{mltsvc_info.mtrs_knd_cd}</div>
                        </div>
                    )}
                    {mltsvc_info.echln_cd && (
                        <div className='infoRow'>
                            <div className='rowTitle'>계급</div>
                            <div className='rowText'>{mltsvc_info.echln_cd}</div>
                        </div>
                    )}
                    {mltsvc_info.mtrs_srvc_mm && (
                        <div className='infoRow'>
                            <div className='rowTitle'>복무기간</div>
                            <div className='rowText'>{mltsvc_info.mtrs_srvc_mm} 개월</div>
                        </div>
                    )}
                    {mltsvc_info.mtrs_cls_cd && (
                        <div className='infoRow'>
                            <div className='rowTitle'>병과</div>
                            <div className='rowText'>{mltsvc_info.mtrs_cls_cd}</div>
                        </div>
                    )}
                    {mltsvc_info.cvdf_frmt_yn_cd && (
                        <div className='infoRow'>
                            <div className='rowTitle'>민방위편성</div>
                            <div className='rowText'>{mltsvc_info.cvdf_frmt_yn_cd}</div>
                        </div>
                    )}
                </>
            );
        },
    },
    {
        key: 'cardSlot12',
        title: '가족',
        icon: <IcoCardFamily fill='#ffffff' />,
        content: (userData: UserData | null) => {
            if (!userData || !Array.isArray(userData?.fam_info) || userData.fam_info.length === 0) {
                return <Empty>데이터가 없습니다.</Empty>;
            }
            const fam_info = userData.fam_info;
            return (
                <>
                    {fam_info.map((item, index) => {
                        let ageText = '';
                        if (item.brdt && /^\d{4}\.\d{2}\.\d{2}$/.test(item.brdt)) {
                            const [year, month, day] = item.brdt.split('.').map(Number);
                            const birthDate = new Date(year, month - 1, day);
                            const today = new Date();
                            let age = today.getFullYear() - birthDate.getFullYear();
                            const m = today.getMonth() - birthDate.getMonth();
                            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                                age--;
                            }
                            ageText = ` (만 ${age}세)`;
                        }
                        return (
                            <div className='infoRow' key={`family-${index}`}>
                                <div className='rowTitle'>{item.fam_rel_cd}</div>
                                <div className='rowText'>
                                    {item.flnm}, {item.gndr_cd}, {item.brdt}, {ageText}
                                </div>
                            </div>
                        );
                    })}
                </>
            );
        },
    },
    {
        key: 'cardSlot13',
        title: '장애',
        icon: <IcoCardDisabled fill='#ffffff' />,
        content: (userData: UserData | null) => {
            if (!userData || !Array.isArray(userData.dsblty_info) || userData.dsblty_info.length === 0) {
                return <Empty>데이터가 없습니다.</Empty>;
            }
            const dsblty_info = Array.isArray(userData.dsblty_info) ? userData.dsblty_info : [];
            return (
                <>
                    {dsblty_info?.map((item, index) => {
                        return (
                            <Fragment key={`dsblty-${index}`}>
                                <div className='primary'>
                                    <div className='emphasis'>{item.dsblty_se_cd}</div>
                                    <div className='emphasis'>{item.dsblty_type_cd}</div>
                                    <div className='emphasis'>{item.dsblty_dgre_cd}</div>
                                </div>
                                <div className='infoRow'>
                                    <div className='rowTitle'>장애판정</div>
                                    <div className='rowText'>
                                        {dayjs(item.bgng_ymd).format('YYYY.MM.DD')}
                                        {item.end_ymd ? ` ~ ${dayjs(item.end_ymd).format('YYYY.MM.DD')}` : ''}
                                    </div>
                                </div>
                                <div className='infoRow'>
                                    <div className='rowTitle'>장애ID</div>
                                    <div className='rowText'>{item.dsblty_id_no}</div>
                                </div>
                            </Fragment>
                        );
                    })}
                </>
            );
        },
    },
    {
        key: 'cardSlot14',
        title: '보훈',
        icon: <IcoCardPatriptism fill='#ffffff' />,
        content: (userData: UserData | null) => {
            if (!userData || !Array.isArray(userData.rwdptr_info) || userData.rwdptr_info.length === 0) {
                return <Empty>데이터가 없습니다.</Empty>;
            }
            const rwdptr_info = Array.isArray(userData.rwdptr_info) ? userData.rwdptr_info : [];
            const recentRwdptr = rwdptr_info
                .slice()
                .sort((a, b) => b.bgng_ymd.localeCompare(a.bgng_ymd))
                .slice(0, 2);
            return (
                <>
                    {recentRwdptr?.map((item, index) => {
                        return (
                            <Fragment key={`rwdptr-${index}`}>
                                {item.rwdptr_dsctn_cd && (
                                    <div className='primary'>
                                        <div className='emphasis'>{item.rwdptr_dsctn_cd}</div>
                                        <div className='emphasis'>{item.rwdptr_inst_cd}</div>
                                    </div>
                                )}
                                {item.bgng_ymd && (
                                    <>
                                        <div className='infoRow'>
                                            <div className='rowTitle'>보훈기간</div>
                                            <div className='rowText'>
                                                {dayjs(item.bgng_ymd).format('YYYY.MM.DD')}
                                                {item.end_ymd ? ` ~ ${dayjs(item.end_ymd).format('YYYY.MM.DD')}` : ''}
                                            </div>
                                        </div>
                                    </>
                                )}
                                {item.rwdptr_no && (
                                    <div className='infoRow'>
                                        <div className='rowTitle'>보훈번호</div>
                                        <div className='rowText'>{item.rwdptr_no}</div>
                                    </div>
                                )}
                            </Fragment>
                        );
                    })}
                </>
            );
        },
    },
    {
        key: 'cardSlot15',
        title: '자료함',
        icon: <IcoCardData fill='#ffffff' />,
        content: (userData: UserData | null) => {
            if (!userData || !Array.isArray(userData.eldoc_file_info) || userData.eldoc_file_info.length === 0) {
                return <Empty>데이터가 없습니다.</Empty>;
            }
            const eldoc_file_info = Array.isArray(userData.eldoc_file_info) ? userData.eldoc_file_info : [];
            const recentEldoc = eldoc_file_info
                .slice()
                .sort((a, b) => b.reg_ymd.localeCompare(a.reg_ymd))
                .slice(0, 2);
            return (
                <>
                    {recentEldoc.map((item, index) => (
                        <div key={`data-${index}`}>
                            <div className='primary'>
                                <div className='emphasis'>
                                    <span className='title'>{item.data_knd_cd}</span>
                                    <div className='text'>{dayjs(item.reg_ymd).format('YYYY.MM.DD')}</div>
                                </div>
                            </div>
                            {index !== recentEldoc.length - 1 && <hr className='diviLine' />}
                        </div>
                    ))}
                </>
            );
        },
    },
];
