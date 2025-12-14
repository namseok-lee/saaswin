'use client';

import React, { useEffect, useState } from 'react';
import { fetcherPost, fetcherPostCmcd, fetcherPostData, fetcherPostScr } from 'utils/axios';
import Loader from 'components/Loader';
import { Box, Button, Grid } from '@mui/material';
import dayjs from 'dayjs';
import SlryGrid from 'components/Grid/SlryGrid';

export default function PayUserCreate({
    scr_no,
    data,
    stepSqlId,
    stepSqlKey,
}: {
    scr_no: string;
    data: Record<string, any>;
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
    const [key, setKey] = useState(0); // 화면 상태 변경용
    const tpcdParam = scr_no;
    const [userComData, setUserComData] = useState([]);
    const [comboData, setComboData] = useState([]);
    const [ognzComData, setOgnzComData] = useState([]);
    const [masterUI, setMasterUI] = useState<MasterUIData | null>(null);
    const [dataLoading, setDataLoading] = useState(true);
    const [dataParam, setDataParam] = useState<Param>({
        master: [], // 마스터그리드 데이터 파라미터
        detail: [], // 하단그리드 데이터 파라미터
    });
    const [masterRetrieve, setMasterRetrieve] = useState(false); // 조회버튼(true/false)
    const [detailRetrieve, setDetailRetrieve] = useState(false); // 그리드row클릭(true/false)
    const [masterData, setMasterData] = useState(null); // 마스터그리드 데이터
    const gridData = masterUI?.grid_info;

    // 급여일자 그리드 조회
    const handleSubmit = () => {
        if (dataParam?.master) {
            setMasterRetrieve(true); // 데이터를 가져오도록 설정
        } else {
            console.log('조회할 데이터가 없습니다.');
        }
    };

    // 처음 헤더 가져올 때
    const rprs_ognz_no = 'WIN'; // 로그인 만들어지면 수정 필요
    useEffect(() => {
        setMasterData(null);
        const item = {
            scr_no: scr_no,
        };
        fetcherPostScr(item) // fetcherPost 함수 사용
            .then((response) => {
                setMasterUI(response);
                setMasterRetrieve(true);
                setDataLoading(false);
            })
            .catch((error) => {
                console.error(error);
            });

        const items = [
            {
                sqlId: 'hrb_slry01',
                sql_key: 'hrb_slry_ocrn_ddln_get',
                params: [
                    {
                        slry_ocrn_id: data.slry_ocrn_id,
                        ddln_task_type_cd: 'hrb_group01023_cm0001',
                    },
                ],
            },
        ];
        fetcherPostData(items)
            .then((response) => {
                const return_cd = response.return_cd;

                if (return_cd === '40002') {
                    const ddln_yn = response[0].ddln_yn;
                    setDataParam({
                        master: [
                            {
                                params: [
                                    {
                                        slry_ocrn_id: data.slry_ocrn_id,
                                        job_ddln_yn: ddln_yn,
                                    },
                                ],
                            },
                        ],
                        detail: [],
                    });
                }
                // 재조회
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {});
    }, [scr_no, key]);

    // 마스터 그리드 데이터조회
    useEffect(() => {
        if (masterRetrieve) {
            const sqlKey = stepSqlKey;

            const item = [
                {
                    sqlId: stepSqlId,
                    sql_key: sqlKey,
                    params: [
                        {
                            slry_ocrn_id: data.slry_ocrn_id,
                            current_step: data.slry_prgrs_step_cd,
                        },
                    ],
                },
            ];

            fetcherPostData(item)
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
            const isUserCom = gridData?.find((item) => item.type === 'USER_COM');
            const isOgnzCom = gridData?.find((item) => item.type === 'OGNZ_COM');
            // 테이블 공통코드 조회
            const isCombo = gridData
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

            if (isUserCom) {
                const item = [
                    {
                        sqlId: 'hrs_com01',
                        sql_key: 'hrs_ognztree_get',
                        params: [
                            {
                                rprs_ognz_no: 'WIN',
                            },
                        ],
                    },
                ];
                fetcherPostData(item)
                    .then((response) => {
                        const data = response.data;

                        setUserComData(data);
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
                        setOgnzComData(response.data);
                    })
                    .catch((error) => {
                        console.error(error);
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
                    <SlryGrid
                        setKey={setKey}
                        masterUI={masterUI}
                        tpcdParam={tpcdParam}
                        setMasterRetrieve={setMasterRetrieve}
                        gridData={gridData}
                        rowData={masterData}
                        treeCol={''}
                        sheetName='mySheet1'
                        setDataParam={setDataParam}
                        dataSeInfo={''}
                        userData={userComData}
                        ognzData={ognzComData}
                        comboData={comboData}
                        initParam={dataParam.master}
                    />
                </Grid>
            </Grid>
        </Box>
    );
}
