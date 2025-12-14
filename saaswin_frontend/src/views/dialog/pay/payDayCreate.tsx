'use client';

import React, { useEffect, useState } from 'react';
import { fetcherPost, fetcherPostCmcd, fetcherPostScr } from 'utils/axios';
import Loader from 'components/Loader';
import { Box, Grid, Step } from '@mui/material';
import SlryTable from 'components/SlryTable';

export default function PayDayCreate({
    scr_no,
    data,
    setData,
    setValidation,
    stepSqlId,
    stepSqlKey,
}: {
    scr_no: string;
    data: Record<string, any>;
    setData: any;
    setValidation: any;
    stepSqlId: string;
    stepSqlKey: string;
}) {
    interface SortBySeqBtnItem {
        api: string;
        seq: string;
        sql: string;
        sqlId: string;
        text: string;
        type: string;
    }

    interface DataSeInfoItem {
        data_se_cd: string;
        data_se_indo: any[];
        grid_btn_info: any[];
        grid_info: any[];
        grid_tit_info: any[];
    }

    interface MasterUIData {
        data_se_info: any[]; // 데이터 타입에 맞게 수정
        grid_tit_info: any[];
        grid_btn_info: any; // 데이터 타입에 맞게 수정
        grid_info: any; // 데이터 타입에 맞게 수정
        table_info: any[];
    }
    const tpcdParam = scr_no;
    const [userComData, setUserComData] = useState([]);
    const [comboData, setComboData] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [ognzComData, setOgnzComData] = useState([]);
    const [masterUI, setMasterUI] = useState<MasterUIData | null>(null);
    const [dataLoading, setDataLoading] = useState(true);
    const [dataParam, setDataParam] = useState<Param>({
        master: [], // 마스터그리드 데이터 파라미터
        detail: [], // 하단그리드 데이터 파라미터
    });
    const [dataParamUnder, setDataParamUnder] = useState<Param>({
        master: [], // 마스터그리드 데이터 파라미터
        detail: [], // 하단그리드 데이터 파라미터
    });
    const [masterRetrieve, setMasterRetrieve] = useState(false); // 조회버튼(true/false)
    const [masterData, setMasterData] = useState(null); // 마스터그리드 데이터
    const tableInfo = masterUI?.table_info || [];

    // 처음 헤더 가져올 때
    const rprs_ognz_no = 'WIN'; // 로그인 만들어지면 수정 필요

    useEffect(() => {
        const item = {
            scr_no: scr_no,
        };
        fetcherPostScr(item) // fetcherPost 함수 사용
            .then((response) => {
                setMasterUI(response);
                setDataLoading(false);

                if (data.slry_ocrn_id !== '') {
                    setMasterRetrieve(true);
                } else {
                    setValidation({ validation: false, message: '급여일자를 생성해주세요' });
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    // 마스터 테이블 데이터조회
    useEffect(() => {
        if (masterRetrieve) {
            let url = process.env.NEXT_PUBLIC_SSW_SQL_SEARCH_API_URL;
            const sqlId = stepSqlId;
            const sqlKey = stepSqlKey;
            // key 추가

            if (sqlId === 'hrb_slry01') {
                url = process.env.NEXT_PUBLIC_SSW_SLRY_SEARCH_API_URL;
            }

            const item = [
                {
                    sqlId: sqlId,
                    sql_key: sqlKey,
                    params: [
                        {
                            slry_info: [{ slry_ocrn_id: data.slry_ocrn_id }],
                        },
                    ],
                },
            ];

            fetcherPost([url, item])
                .then((response) => {
                    setMasterData(response[0].data);
                })
                .catch((error) => {
                    console.error(error);
                })
                .finally(() => {
                    setDataLoading(false);
                    setMasterRetrieve(false);
                });
        }
    }, [masterRetrieve]);

    useEffect(() => {
        if (masterUI) {
            // 테이블 공통코드 조회
            const isCombo = tableInfo
                ?.filter((item) => item.type === 'COMBO')
                .reduce((acc, item2) => {
                    if (!acc.some((combo) => combo.enum === item2.enum)) {
                        acc.push(item2);
                    }
                    return acc;
                }, []);

            if (isCombo.length > 0) {
                isCombo.forEach((data) => {
                    const cd = data.enum;
                    fetcherPostCmcd({
                        group_cd: data.enum,
                        rprs_ognz_no: data.hasOwnProperty('enumKey') ? data.enumKey : rprs_ognz_no,
                    })
                        .then((response) => {
                            setComboData((prev) => ({
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

    if (dataLoading) return <Loader />;
    return (
        <Box
            sx={{
                p: 2,
                flexGrow: 1,
                height: '100%',
                maxHeight: '80vh',
                width: '80vw',
            }}
        >
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    {/* 급여생성
                        1. 마감여부에 따라 수정/수정안됨 해야함 --> 근데 마감의 경우 애초에 이 화면에 들어올 수 없게 막는게 맞는 것 같음
                     */}
                    <SlryTable
                        masterInfo={masterUI}
                        tableData={masterData?.[0]}
                        comboData={comboData}
                        userData={userComData}
                        ognzData={ognzComData}
                        gridKey={''}
                        setMasterRetrieve={setMasterRetrieve}
                        initParam={dataParam?.master}
                        setData={setData}
                        setValidation={setValidation}
                    />
                </Grid>
            </Grid>
        </Box>
    );
}
