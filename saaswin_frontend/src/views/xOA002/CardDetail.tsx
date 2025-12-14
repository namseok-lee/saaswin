'use client';

import React, { useEffect, useState } from 'react';
import { fetcherPostCmcd, fetcherPostData, fetcherPostGridData, fetcherPostScr } from 'utils/axios';
import Grid01 from 'components/Grid/Grid01';
import { Grid } from '@mui/material';
import HrInfoBasicTable from './HrInfoBasicTable';
import CustomTable from '@/components/CustomTable';
import dayjs from 'dayjs';
import SearchCondition from '@/components/SearchCondition';
import { Param } from '@/types/component/SearchCondition';
import { useSearchParams } from 'next/navigation';

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
    const [userComData, setUserComData] = useState([]);
    const [ognzComData, setOgnzComData] = useState([]);
    const searchParamsResult = useSearchParams();
    const searchParams = new URLSearchParams(searchParamsResult || '');

    const [dataParam, setDataParam] = useState<Param>({
        master: [], // 마스터그리드 데이터 파라미터
        detail: [], // 하단그리드 데이터 파라미터
    });
    const [dataParamUnder, setDataParamUnder] = useState<Param>({
        master: [], // 마스터그리드 데이터 파라미터
        detail: [], // 하단그리드 데이터 파라미터
    });
    const handleSubmit = () => {
        if (dataParam?.master) {
            setRetrieve(true); // 데이터를 가져오도록 설정
        } else {
            console.log('조회할 데이터가 없습니다.');
        }
    };
    const handleSubmitUnder = () => {
        if (dataParamUnder?.master) {
            setDetailRetrieve(true); // 데이터를 가져오도록 설정
        } else {
            console.log('조회할 데이터가 없습니다.');
        }
    };
    useEffect(() => {
        // 화면 정보만 조회 (데이터는 전달받은 userData 사용)
        fetcherPostScr({ tpcd })
            .then((response) => {
                if (tpcd === 'RE002T02' || tpcd === 'RE002T10') {
                    setMasterUI(response.tab_info[0]);
                    setTpcdOn(response.tab_info[0].scr_no);
                    setDetailUI(response.tab_info[1]);
                    setTpcdUnder(response.tab_info[1].scr_no);

                    setDetailRetrieve(true);
                } else {
                    setMasterUI(response);
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
    }, [tpcd, userData]);
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
                tpcdOn === 'RE002T02A01'
                    ? 'addr_info'
                    : tpcdOn === 'RE002T03'
                    ? 'crr_info'
                    : tpcdOn === 'RE002T04'
                    ? 'acbg_info'
                    : tpcdOn === 'RE002T05'
                    ? 'crr_info'
                    : tpcdOn === 'RE002T06'
                    ? 'qlfc_info'
                    : tpcdOn === 'RE002T07'
                    ? 'lgsdy_info'
                    : tpcdOn === 'RE002T08'
                    ? 'duty_info'
                    : tpcdOn === 'RE002T09'
                    ? 'edu_info'
                    : tpcdOn === 'RE002T10A01'
                    ? 'wnawd_info'
                    : tpcdOn === 'RE002T11'
                    ? 'mltsvc_info'
                    : tpcdOn === 'RE002T12'
                    ? 'fam_info'
                    : tpcdOn === 'RE002T13'
                    ? 'dsblty_info'
                    : tpcdOn === 'RE002T14'
                    ? 'rwdptr_info'
                    : tpcdOn === 'RE002T15'
                    ? 'eldoc_file_info'
                    : '';
            const select_col_nm2 = 'hdof_yn';
            const tb_nm = tpcd === 'RE002T02' || tpcd === 'RE002T03' || tpcd == 'RE002T15' ? 'tom_bsc' : 'tom_bsc_dtl';
            const params = [
                {
                    user_no: userData?.user_no,
                    crtr_ymd: dayjs().format('YYYYMMDD'),
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
        // 데이터 조회
        if (detailRetrieve) {
            const sqlId = 'hrs_com01';
            const sql_key = 'hrs_simple_sql_select';
            const select_col_nm =
                tpcdUnder === 'RE002T02A02' ? 'telno_info' : tpcdUnder === 'RE002T10A02' ? 'dspn_info' : '';
            const tb_nm = tpcd === 'RE002T02' ? 'tom_bsc' : 'tom_bsc_dtl';

            const params = [
                {
                    user_no: userData?.user_no,
                    std_ymd: dayjs().format('YYYYMMDD'),
                    select_col_nm,
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
            const isUserCom = gridData?.find((item) => item.type === 'USER_COM');
            const isOgnzCom = gridData?.find((item) => item.type === 'OGNZ_COM');
            const isCombo = (gridData || [])
                .filter((item: any) => item.type === 'COMBO')
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
            if (isUserCom) {
                const item = [
                    {
                        sqlId: 'hrs_com01',
                        sql_key: 'hrs_ognztree_get',
                        params: [
                            {
                                rprs_ognz_no: 'WIN',
                                crtr_ymd: dayjs().format('YYYYMMDD'),
                            },
                        ],
                    },
                ];
                fetcherPostData(item)
                    .then((response) => {
                        setUserComData(response);
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }

            if (isOgnzCom) {
                const item = [
                    {
                        sqlId: 'hrs_com01',
                        sql_key: 'hrs_ognztree_recursive',
                        params: [
                            {
                                std_ymd: dayjs(new Date()).format('YYYYMMDD'),
                            },
                        ],
                    },
                ];
                fetcherPostData(item)
                    .then((response) => {
                        setOgnzComData(response);
                    })
                    .catch((error) => {
                        console.error(error);
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
            {tpcd === 'RE002T01' ? (
                <HrInfoBasicTable userData={userData} setRetrieve={setRetrieve} setMasterRetrieve={setMasterRetrieve} />
            ) : gridData && tpcd == 'RE002T11' ? (
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
            ) : gridData && tpcd !== 'RE002T11' ? (
                <div className='contContainer'>
                    <SearchCondition
                        masterUIinfo={masterUI}
                        tpcdParam={tpcdOn}
                        dataParam={dataParam}
                        searchParam={searchParams}
                        setDataParam={setDataParam}
                        handleSubmit={handleSubmit}
                    />

                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Grid01
                                masterUI={masterUI as any}
                                tpcdParam={tpcdOn}
                                gridData={gridData}
                                rowData={masterData || []}
                                treeCol=''
                                sheetName={`cardDetail_${tpcd}`}
                                setDataParam={() => {}}
                                gridKey=''
                                item={null}
                                dataSeInfo={[] as any}
                                userData={userComData}
                                ognzData={ognzComData}
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
                                        <SearchCondition
                                            masterUIinfo={detailUI}
                                            tpcdParam={tpcdUnder}
                                            dataParam={dataParamUnder}
                                            searchParam={searchParams}
                                            setDataParam={setDataParamUnder}
                                            handleSubmit={handleSubmitUnder}
                                        />
                                    </Grid>
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
                                            userData={userComData}
                                            ognzData={ognzComData}
                                            comboData={comboData}
                                            initParam={initParam_under}
                                            setMasterRetrieve={setDetailRetrieve}
                                        />
                                    </Grid>
                                </Grid>
                            </>
                        ) : null}
                    </Grid>
                </div>
            ) : tpcd === 'RE002T11' ? (
                <CustomTable
                    masterInfo={masterUI}
                    tableData={masterData?.[0]}
                    comboData={comboData}
                    setMasterRetrieve={setMasterRetrieve}
                    initParam={initParam}
                />
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
