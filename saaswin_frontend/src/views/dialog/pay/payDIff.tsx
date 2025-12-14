'use client';

import React, { useEffect, useState } from 'react';
import { fetcherPost, fetcherPostCmcd, fetcherPostData, fetcherPostScr } from 'utils/axios';
import Loader from 'components/Loader';
import { Box, Button, Grid, IconButton, Stack, Tab } from '@mui/material';
import dayjs from 'dayjs';
import Grid01 from 'components/Grid/Grid01';
import TitleBox from 'components/TitleBox';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import PayUserCreate from './payUserCreate';

export default function PayDiff({
    scr_no,
    data,
    stepSqlId,
}: {
    scr_no: string;
    data: Record<string, any>;
    stepSqlId: string;
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
    useEffect(() => {
        const item = {
            scr_no: scr_no,
        };
        fetcherPostScr(item) // fetcherPost 함수 사용
            .then((response) => {
                setMasterUI(response.tab_info[0]);
                setDataLoading(false);
            })
            .catch((error) => {
                console.error(error);
            });
    }, [scr_no]);

    // 마스터 그리드 데이터조회
    useEffect(() => {
        if (masterRetrieve) {
            let url = process.env.NEXT_PUBLIC_SSW_SQL_SEARCH_API_URL;
            const sqlId = stepSqlId;

            if (sqlId === 'hrb_slry01') {
                url = process.env.NEXT_PUBLIC_SSW_SLRY_SEARCH_API_URL;
            }

            const item = [
                {
                    sqlId: sqlId,
                    params: [
                        {
                            slry_ocrn_id: data.slry_ocrn_id,
                            current_step: data.slry_prgrs_step_cd,
                        },
                    ],
                },
            ];

            fetcherPost([url, item])
                .then((response) => {
                    setMasterData(response[0].data[0]);
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
        }
    }, [masterUI]);

    const handleCreateBtn = (type: string) => {
        const totalRows = [];
        let apiType = '';
        let msg = '';
        const err_msg = '';
        let succ_msg = '';
        // 저장 시 급여발생id없으면 저장 불가
        if (type === 'user') {
            msg = '대상자를 생성하시겠습니까?';
            apiType = 'userCreate';
            succ_msg = '대상자가 생성되었습니다. 저장을 눌러야 대상자가 저장됩니다.';
        } else if (type === 'mst_change') {
            msg = '기초원장을 생성하시겠습니까?';
            apiType = 'mstCreate';
            succ_msg = '기초원장이 생성되었습니다.';
        }

        const url = process.env.NEXT_PUBLIC_SSW_SQL_SEARCH_API_URL; // 상대 경로만 사용

        const param_data = [
            {
                json: totalRows,
                type: apiType,
                rprs_ognz_no: rprs_ognz_no,
                user_no: user_no,
                slry_ocrn_id: data.slry_ocrn_id,
                current_step: data.slry_prgrs_step_cd,
            },
        ];

        const items = [
            {
                sqlId: stepSqlId,
                params: param_data, // sendData의 현재 상태를 params에 포함
            },
        ];

        if (confirm(msg)) {
            console.log(items);
            // fetcherPost([url, items])
            //     .then((response) => {
            //         const return_cd = response[0].data[0].return_cd;
            //         if (return_cd === '40000') {
            //             alert(succ_msg);
            //             setMasterData(response[0].data);
            //         }
            //     })
            //     .catch((error) => {
            //         console.error(error);
            //     })
            //     .finally(() => {});
        } else {
            return;
        }
    };

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
                    <Grid01
                        setKey={''}
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
