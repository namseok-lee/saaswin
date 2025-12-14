'use client';

import React, { useEffect, useState } from 'react';
import { fetcherPostCmcd, fetcherPostGridData, fetcherPostScr } from 'utils/axios';
import Grid01 from 'components/Grid/Grid01';
import { Grid } from '@mui/material';
import HrInfoBasicTable from './HrInfoBasicTable';
import CustomTable from '@/components/CustomTable';
import dayjs from 'dayjs';
import SettingChkModal from '@/components/ComPopup/SettingChkModal';

interface CardDetailProps {
    tpcd: string;
    title: string;
    userData?: any; // 선택된 사용자 데이터
    setMasterRetrieve?: (masterRetrieve: boolean) => void;
}

export default function CardDetail({ tpcd, title, userData, setMasterRetrieve }: CardDetailProps) {
    const [masterUI, setMasterUI] = useState<Record<string, unknown> | null>(null);
    const [detailUI, setDetailUI] = useState<Record<string, unknown> | null>(null);
    const [masterData, setMasterData] = useState<Record<string, unknown> | null>(null);
    const [detailData, setDetailData] = useState(null);
    const [retrieve, setRetrieve] = useState(false);
    const [detailRetrieve, setDetailRetrieve] = useState(false);
    const [loading, setLoading] = useState(true);
    const [comboData, setComboData] = useState([]);
    const [tpcdOn, setTpcdOn] = useState(tpcd);
    const [tpcdUnder, setTpcdUnder] = useState('');
    const [initParam, setInitParam] = useState([{}]);
    const [initParam_under, setInitParam_under] = useState([{}]);
    const [params, setParams] = useState({ open: false, group_cd: 'hrs_group00934' }); // 직무이력 환경설정 이동 팝업
    const [dutyYn, setDutyYn] = useState(false);
    useEffect(() => {
        // 화면 정보만 조회 (데이터는 전달받은 userData 사용)
        fetcherPostScr({ tpcd })
            .then((response) => {
                if (tpcd === 'RE001T02' || tpcd === 'RE001T10') {
                    setMasterUI(response.tab_info[0]);
                    setTpcdOn(response.tab_info[0].scr_no);
                    setDetailUI(response.tab_info[1]);
                    setTpcdUnder(response.tab_info[1].scr_no);
                    setDetailRetrieve(true);
                } else if (tpcd === 'RE001T08') {
                    setMasterUI(response);
                    setTpcdOn(response.scr_no);
                    setTpcdUnder('');
                    setDutyYn(true);
                } else {
                    setMasterUI(response);
                    setTpcdOn(response.scr_no);
                    setTpcdUnder('');
                }

                setRetrieve(true);
            })
            .catch((uiError) => {
                console.error('CardDetail UI error:', uiError);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [tpcd]);
    useEffect(() => {
        // 데이터 조회
        const isBasic = tpcd === 'RE001T01'; // 근로자정보(인사기본) 일 경우
        if (retrieve && !isBasic) {
            const sqlId = 'hrs_com01';
            const sql_key =
                tpcd === 'RE001T15' || tpcd === 'RE001T02' || tpcd === 'RE001T03'
                    ? 'hrs_double_sql_select'
                    : 'hrs_simple_sql_select';
            const select_col_nm =
                tpcdOn === 'RE001T02A01'
                    ? 'addr_info'
                    : tpcdOn === 'RE001T03'
                    ? 'apnt_info'
                    : tpcdOn === 'RE001T04'
                    ? 'acbg_info'
                    : tpcdOn === 'RE001T05'
                    ? 'crr_info'
                    : tpcdOn === 'RE001T06'
                    ? 'qlfc_info'
                    : tpcdOn === 'RE001T07'
                    ? 'lgsdy_info'
                    : tpcdOn === 'RE001T08'
                    ? 'duty_info'
                    : tpcdOn === 'RE001T09'
                    ? 'edu_info'
                    : tpcdOn === 'RE001T10A01'
                    ? 'wnawd_info'
                    : tpcdOn === 'RE001T11'
                    ? 'mltsvc_info'
                    : tpcdOn === 'RE001T12'
                    ? 'fam_info'
                    : tpcdOn === 'RE001T13'
                    ? 'dsblty_info'
                    : tpcdOn === 'RE001T14'
                    ? 'rwdptr_info'
                    : tpcdOn === 'RE001T15'
                    ? 'eldoc_file_info'
                    : '';
            const select_col_nm2 = 'hdof_yn';
            const tb_nm = tpcd === 'RE001T02' || tpcd === 'RE001T03' || tpcd == 'RE001T15' ? 'tom_bsc' : 'tom_bsc_dtl';

            const params = [
                {
                    user_no: userData?.user_no,
                    hdof_yn: userData?.hdof_yn,
                    std_ymd: dayjs().format('YYYYMMDD'),
                    select_col_nm,
                    select_col_nm2,
                    tb_nm,
                },
            ];

            setInitParam([{ sqlId, sql_key, params }]);

            const item = [{ sqlId, sql_key, params }];

            fetcherPostGridData(item)
                .then((response) => {
                    setMasterData(response);
                })
                .catch((error) => {
                    console.error(error);
                })
                .finally(() => {
                    setLoading(false);
                    setRetrieve(false);
                });
        }
    }, [retrieve, userData]);

    useEffect(() => {
        if (dutyYn) {
            const sqlId = 'hrs_com01';
            const sql_key = 'hrs_rprs_ognz_duty_cd_get';

            const param = [
                {
                    rprs_group_cd: 'hrs_group00934',
                    std_ymd: dayjs(new Date()).format('YYYYMMDD'),
                    duty_nm: '',
                },
            ];

            const item = [{ sqlId, sql_key, params: param }];

            fetcherPostGridData(item)
                .then((response) => {
                    const data = response[0].data;
                    if (data === null) {
                        setParams({ open: true, group_cd: params.group_cd });
                    }
                })
                .catch((error) => {
                    console.error(error);
                })
                .finally(() => {
                    setLoading(false);
                    setDutyYn(false);
                });
        }
    }, [dutyYn]);

    useEffect(() => {
        // 데이터 조회
        if (detailRetrieve) {
            const sqlId = 'hrs_com01';
            const sql_key = tpcd === 'RE001T02' ? 'hrs_double_sql_select' : 'hrs_simple_sql_select';
            const select_col_nm =
                tpcdUnder === 'RE001T02A02' ? 'telno_info' : tpcdUnder === 'RE001T10A02' ? 'dspn_info' : '';
            const tb_nm = tpcd === 'RE001T02' ? 'tom_bsc' : 'tom_bsc_dtl';
            const select_col_nm2 = 'hdof_yn';

            const params = [
                {
                    user_no: userData?.user_no,
                    hdof_yn: userData?.hdof_yn,
                    std_ymd: dayjs().format('YYYYMMDD'),
                    select_col_nm,
                    select_col_nm2,
                    tb_nm,
                },
            ];

            setInitParam_under([{ sqlId, sql_key, params }]);
            const item = [{ sqlId, sql_key, params }];
            fetcherPostGridData(item)
                .then((response) => {
                    setDetailData(response);
                })
                .catch((error) => {
                    console.error(error);
                })
                .finally(() => {
                    setLoading(false);
                    setDetailRetrieve(false);
                });
        }
    }, [detailRetrieve]);

    useEffect(() => {
        if (masterUI) {
            const isCombo = (gridData || tableData || [])
                .filter((item: any) => item.type.toUpperCase() === 'COMBO')
                .reduce((acc: any, item2: any) => {
                    if (!acc.some((combo: any) => combo.enum === item2.enum)) {
                        acc.push(item2);
                    }
                    return acc;
                }, []); // 기본값으로 빈 배열 설정

            const isCombo_under = (gridData_under || [])
                ?.filter((item: any) => item.type === 'COMBO')
                .reduce((acc: any, item2: any) => {
                    if (!acc.some((combo: any) => combo.enum === item2.enum)) {
                        acc.push(item2);
                    }
                    return acc;
                }, []);

            const isCombo_all = [...isCombo, ...isCombo_under];

            const isCombo_reduce = isCombo_all.reduce((acc: any, item: any) => {
                if (!acc.some((combo: any) => combo.enum === item.enum)) {
                    acc.push(item);
                }
                return acc;
            }, []);

            if (isCombo_reduce.length > 0) {
                isCombo_reduce.forEach((data: any) => {
                    const cd = data.enum;
                    fetcherPostCmcd({
                        group_cd: data.enum,
                        rprs_ognz_no: data.hasOwnProperty('enumKey') ? data.enumKey : 'COMGRP',
                    })
                        .then((response) => {
                            setComboData((prev: any) => ({
                                ...prev,
                                [cd]: response,
                            }));
                        })
                        .catch((error) => {
                            console.error(error);
                        });
                });
            }
        }
    }, [masterUI]);
    if (loading) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '400px',
                    fontSize: '16px',
                    color: '#666',
                }}
            >
                {title} 정보를 불러오는 중...
            </div>
        );
    }
    if (!masterUI) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '400px',
                    fontSize: '16px',
                    color: '#666',
                }}
            >
                {title} 정보를 불러올 수 없습니다.
            </div>
        );
    }
    // 사용자 데이터를 Grid01에서 사용할 수 있는 형태로 변환
    // const convertUserDataToGridData = () => {
    //     if (!userData) return [];

    //     // 카드별로 다른 데이터 구조 사용
    //     switch (tpcd) {
    //         case 'xOA001': // 인적사항
    //             return userData.bsc_info ? [userData.bsc_info] : [];
    //         case 'xOA002': // 주소/연락처
    //             return userData.bsc_info ? [userData.bsc_info] : [];
    //         case 'xOA003': // 발령
    //             return userData.crr_info ? [userData.crr_info] : [];
    //         case 'xOA004': // 학력
    //             return userData.acbg_info || [];
    //         case 'xOA005': // 경력
    //             return userData.crr_info ? [userData.crr_info] : [];
    //         default:
    //             // 기본적으로 전체 userData 반환
    //             return [userData];
    //     }
    // };

    const gridData = (masterUI as any)?.grid_info;
    const tableData = (masterUI as any)?.table_info;
    const gridTitleData = (masterUI as any)?.grid_tit_info?.[0]?.title;
    const gridData_under = (detailUI as any)?.grid_info;
    const gridTitleData_under = (detailUI as any)?.grid_tit_info?.[0]?.title;
    // const masterData = convertUserDataToGridData();
    return (
        <div style={{ padding: '20px' }}>
            {/* 제목 */}
            {gridTitleData && (
                <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold' }}>{gridTitleData}</h4>
                </div>
            )}

            {/* 조건 분기 렌더링 */}
            {tpcd === 'RE001T01' ? (
                <HrInfoBasicTable userData={userData} setRetrieve={setRetrieve} setMasterRetrieve={setMasterRetrieve} />
            ) : tableData ? (
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <CustomTable
                            masterInfo={masterUI as any}
                            tableData={masterData?.[0] as any}
                            comboData={comboData}
                            userData={userData || []}
                            ognzData={[] as any}
                            gridKey=''
                            setMasterRetrieve={setRetrieve}
                            initParam={initParam}
                            tpcdParam={tpcdOn}
                        />
                    </Grid>
                </Grid>
            ) : gridData ? (
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Grid01
                            masterUI={masterUI as any}
                            tpcdParam={tpcdOn}
                            gridData={gridData}
                            rowData={masterData || []}
                            treeCol={tpcd === 'RE001T08' ? 'duty_cd' : ''}
                            sheetName={`cardDetail_${tpcd}`}
                            setDataParam={() => {}}
                            gridKey=''
                            item={null}
                            dataSeInfo={[] as any}
                            userData={userData || []}
                            ognzData={[] as any}
                            comboData={comboData}
                            initParam={initParam}
                            setMasterRetrieve={setRetrieve}
                        />
                    </Grid>
                    {gridData_under ? (
                        <>
                            {gridTitleData_under && (
                                <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold' }}>
                                        {gridTitleData_under}
                                    </h4>
                                </div>
                            )}
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Grid01
                                        masterUI={detailUI as any}
                                        tpcdParam={tpcdUnder}
                                        gridData={gridData_under}
                                        rowData={detailData || []}
                                        treeCol=''
                                        sheetName={`cardDetail_${tpcd}`}
                                        setDataParam={() => {}}
                                        gridKey=''
                                        item={null}
                                        dataSeInfo={[] as any}
                                        userData={userData || []}
                                        ognzData={[] as any}
                                        comboData={comboData}
                                        initParam={initParam_under}
                                        setMasterRetrieve={setDetailRetrieve}
                                    />
                                </Grid>
                            </Grid>
                        </>
                    ) : null}
                    {tpcd === 'RE001T08' ? <SettingChkModal params={params} setParams={setParams} /> : null}
                </Grid>
            ) : (
                <div
                    style={{
                        textAlign: 'center',
                        padding: '40px',
                        fontSize: '16px',
                        color: '#666',
                    }}
                >
                    화면 설정 정보를 불러올 수 없습니다.
                </div>
            )}
        </div>
    );
}
