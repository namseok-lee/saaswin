'use client';

import { Box, Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import {
    fetcherPost,
    fetcherPostCmcd,
    fetcherPostCommonGridData,
    fetcherPostData,
    fetcherPostGridData,
    fetcherPostScr,
} from 'utils/axios';
import { useAuthStore } from 'utils/store/auth';
import CustomTable from 'components/CustomTable';
import Loader from 'components/Loader';
import QuickMenu from 'components/QuickMenu';
import dayjs from 'dayjs';
import SearchCondition from 'components/SearchCondition';
import { useSearchParams } from 'next/navigation';
import { Param } from '@/types/component/SearchCondition';
export default function Ssw01_tb({ tpcd }: { tpcd: string }) {
    interface SortBySeqBtnItem {
        api: string;
        seq: string;
        sql: string;
        sqlId: string;
        text: string;
        type: string;
    }

    interface MasterUIData {
        data_se_info: any[]; // 데이터 타입에 맞게 수정
        srch_btn_info: any[];
        srch_info: any[];
        table_tit_info: any[];
        table_btn_info: any; // 데이터 타입에 맞게 수정
        table_info: any; // 데이터 타입에 맞게 수정
        mvmn_menu_info: any[];
    }

    const tpcdParam = tpcd;
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
    const [initRetrieve, setInitRetrieve] = useState(true); // 조회버튼(true/false)
    const [masterData, setMasterData] = useState(null); // 마스터그리드 데이터
    const [gridKey, setGridKey] = useState('');
    const tableData = masterUI?.table_info;
    const searchParams = new URLSearchParams(useSearchParams());
    const [display, setDisplay] = useState('block');
    const rprs_ognz_no = useAuthStore((state) => state.rprsOgnzNo);
    const quickMenuInfo = masterUI?.mvmn_menu_info?.sort((a, b) => Number(a.seq) - Number(b.seq));

    // 가장 상위 조회버튼
    const handleSubmit = () => {
        if (dataParam?.master) {
            setMasterRetrieve(true); // 데이터를 가져오도록 설정
        } else {
            console.log('조회할 데이터가 없습니다.');
        }
    };

    useEffect(() => {
        const item = {
            scr_no: tpcdParam,
        };
        fetcherPostScr(item)
            .then((response) => {
                setMasterUI(response);
                setDataLoading(false);
            })
            .catch((error) => {
                console.error(error);
            });
    }, [tpcdParam]);

    // 마스터 그리드 데이터조회
    useEffect(() => {
        if (masterRetrieve) {
            const url = process.env.NEXT_PUBLIC_SSW_SQL_SEARCH_API_URL;
            const sqlId = dataParam?.master[0]?.sqlId;
            const sqlKey = dataParam?.master[0]?.sql_key;
            const params = dataParam?.master[0]?.params[0];
            const item = [{ sqlId: sqlId, sql_key: sqlKey, params: [params] }];
            const item2 = dataParam?.master;
            if (
                item2[0].sqlId === undefined ||
                item2[0].sqlId === null ||
                item2[0].sqlId === '0' ||
                item2[0].sqlId === 0
            ) {
                fetcherPostCommonGridData(item)
                    .then((response) => {
                        const return_cd = response[0].return_cd;
                        if (return_cd === '40003') {
                            setMasterData([]);
                        } else {
                            setMasterData(response);
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                    })
                    .finally(() => {
                        setDataLoading(false);
                        setMasterRetrieve(false);
                    });
            } else {
                fetcherPostGridData(item)
                    .then((response) => {
                        const return_cd = response[0].return_cd;
                        if (return_cd === '40003') {
                            setMasterData([]);
                        } else {
                            setMasterData(response);
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                    })
                    .finally(() => {
                        setDataLoading(false);
                        setMasterRetrieve(false);
                    });
            }
        }
    }, [masterRetrieve]);

    useEffect(() => {
        if (dataParam?.master?.[0]?.sqlId === '0' || dataParam?.master?.[0]?.sqlId === 0) {
            if (initRetrieve && dataParam?.master?.[0]?.params[0]?.where[0]) {
                const BtnArray = masterUI?.srch_btn_info;
                const hasEntry = BtnArray?.some((item) => item.type === 'SEARCH' && item.initClick === true);

                if (hasEntry) {
                    // 한 번만 실행되도록 플래그 즉시 업데이트
                    setInitRetrieve(false);

                    // 약간의 지연을 줘서 모든 컴포넌트가 초기화될 시간을 보장
                    setTimeout(() => {
                        handleSubmit();
                    }, 500);
                }
            }
        } else {
            if (initRetrieve && dataParam?.master?.[0]?.params[0]) {
                const BtnArray = masterUI?.srch_btn_info;
                const hasEntry = BtnArray?.some((item) => item.type === 'SEARCH' && item.initClick === true);

                if (hasEntry) {
                    // 한 번만 실행되도록 플래그 즉시 업데이트
                    setInitRetrieve(false);

                    // 약간의 지연을 줘서 모든 컴포넌트가 초기화될 시간을 보장
                    setTimeout(() => {
                        handleSubmit();
                    }, 500);
                }
            }
        }
    }, [initRetrieve, dataParam?.master, masterUI?.srch_btn_info]);

    useEffect(() => {
        if (masterUI) {
            const isUserCom = tableData?.find((item) => item.type.toLowerCase() === 'user_com');
            const isOgnzCom = tableData?.find((item) => item.type.toLowerCase() === 'ognz_com');
            const isCombo = tableData
                ?.filter((item) => item.type.toLowerCase() === 'combo')
                .reduce((acc, item2) => {
                    if (!acc.some((combo) => combo.enum === item2.enum)) {
                        acc.push(item2);
                    }
                    return acc;
                }, []);

            const isCombo_reduce = isCombo.reduce((acc, item) => {
                if (!acc.some((combo) => combo.enum === item.enum)) {
                    acc.push(item);
                }
                return acc;
            }, []);

            if (isCombo_reduce.length > 0) {
                isCombo_reduce.forEach((data) => {
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
                                rprs_ognz_no: rprs_ognz_no,
                            },
                        ],
                    },
                ];
                fetcherPostData(item)
                    .then((response) => {
                        const data = response[0].data;

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
                        setOgnzComData(response);
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }
        }
    }, [masterUI]);

    if (dataLoading) return <Loader />;
    return (
        <div className='contContainer'>
            <SearchCondition
                masterUIinfo={masterUI}
                tpcdParam={tpcdParam}
                dataParam={dataParam}
                searchParam={searchParams}
                setDataParam={setDataParam}
                handleSubmit={handleSubmit}
                setDisplay={setDisplay}
            />
            <Grid container spacing={2}>
                <Grid item xs={quickMenuInfo ? 10 : 12}>
                    <CustomTable
                        masterInfo={masterUI}
                        tableData={masterData?.[0]}
                        comboData={comboData}
                        userData={userComData}
                        ognzData={ognzComData}
                        gridKey={gridKey}
                        setMasterRetrieve={setMasterRetrieve}
                        initParam={dataParam?.master}
                    />
                </Grid>
                {quickMenuInfo && (
                    <Grid
                        item
                        xs={2}
                        sx={{
                            mt: 2,
                            pb: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            justifyContent: 'center',
                            alignItems: 'center',
                            position: 'sticky',
                            top: '50px',
                            zIndex: 1,
                        }}
                    >
                        <QuickMenu tpcdParam={tpcdParam} quickMenuInfo={quickMenuInfo} />
                    </Grid>
                )}
            </Grid>
        </div>
    );
}
