'use client';

import React, { useEffect, useState } from 'react';
import {
    fetcherPost,
    fetcherPostCmcd,
    fetcherPostCommonGridData,
    fetcherPostData,
    fetcherPostGridData,
    fetcherPostScr,
} from 'utils/axios';
import Loader from 'components/Loader';
import { Box, Button, ButtonGroup, Grid, IconButton } from '@mui/material';
import SearchCondition from 'components/SearchCondition';
import SettingsIcon from '@mui/icons-material/Settings';
import Grid01 from 'components/Grid/Grid01';
import { useSearchParams } from 'next/navigation';
import dayjs from 'dayjs';
import Link from 'next/link';
import QuickMenu from 'components/QuickMenu';
import { Param } from '@/types/component/SearchCondition';

export default function Ssw02({ tpcd }: { tpcd: string }) {
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
        data_se_info: any[]; // 데이터 타입에 맞게 수정.
        grid_tit_info: any[];
        grid_btn_info: any; // 데이터 타입에 맞게 수정
        grid_info: any; // 데이터 타입에 맞게 수정
    }
    const tpcdParam = tpcd;
    const [userComData, setUserComData] = useState([]);
    const [tpcdOn, setTpcdOn] = useState('');
    const [tpcdUnder, setTpcdUnder] = useState('');
    const [comboData, setComboData] = useState([]);
    const [ognzComData, setOgnzComData] = useState([]);
    const [masterUI, setMasterUI] = useState<MasterUIData | null>(null);
    const [detailUI, setDetailUI] = useState<MasterUIData | null>(null);
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
    const [detailRetrieve, setDetailRetrieve] = useState(false); // 그리드row클릭(true/false)
    const [initRetrieve, setInitRetrieve] = useState(true); // 조회버튼(true/false)
    const [initDetailRetrieve, setInitDetailRetrieve] = useState(true); // 조회버튼(true/false)
    const [masterData, setMasterData] = useState(null); // 마스터그리드 데이터
    const [detailData, setDetailData] = useState(null); // 디테일그리드 데이터
    const [gridKey, setGridKey] = useState('');
    const [display, setDisplay] = useState('block');
    const searchParams = new URLSearchParams(useSearchParams());
    const data_se_info = masterUI?.data_se_info || [];
    const gridTitleData = masterUI?.grid_tit_info[0].title;
    const description = masterUI?.grid_tit_info[0].description;
    const treeCol = masterUI?.grid_tit_info[0].treeCol;
    const gridButtonData = masterUI?.grid_btn_info;
    const gridData = masterUI?.grid_info;
    const data_se_info_under = detailUI?.data_se_info || [];
    const gridTitleData_under = detailUI?.grid_tit_info[0].title;
    const description_under = detailUI?.grid_tit_info[0].description;
    const treeCol_under = detailUI?.grid_tit_info[0].treeCol;
    const gridButtonData_under = detailUI?.grid_btn_info;
    const gridData_under = detailUI?.grid_info;
    const quickMenuInfo = masterUI?.mvmn_menu_info?.sort((a, b) => Number(a.seq) - Number(b.seq));
    const sortBySeqBtn: SortBySeqBtnItem[] = (gridButtonData || [])
        .slice()
        .sort((a: SortBySeqBtnItem, b: SortBySeqBtnItem) => Number(b.seq) - Number(a.seq)); // seq 기준으로 역순정렬

    // 가장 상위 조회버튼
    const handleSubmit = () => {
        if (dataParam?.master) {
            setMasterRetrieve(true); // 데이터를 가져오도록 설정
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

    const rprs_ognz_no = 'WIN'; // 로그인 만들어지면 수정 필요
    // title, button, searchBox, 마스터 그리드헤더 조회
    useEffect(() => {
        const item = {
            scr_no: tpcdParam,
        };
        fetcherPostScr(item) // fetcherPost 함수 사용
            .then((response) => {
                setMasterUI(response.tab_info[0]);
                setTpcdOn(response.tab_info[0].scr_no);
                setDetailUI(response.tab_info[1]);
                setTpcdUnder(response.tab_info[1].scr_no);
                setDataLoading(false);
            })
            .catch((error) => {
                console.error(error);
            });
        // ssw01(tpcdParam, setMasterUI, setDataLoading);
    }, [tpcdParam]);

    // 마스터 그리드 데이터조회
    useEffect(() => {
        if (detailRetrieve) {
            const url = process.env.NEXT_PUBLIC_SSW_SQL_SEARCH_API_URL;
            const sqlId = dataParamUnder?.master[0]?.sqlId;
            const sqlKey = dataParamUnder?.master[0]?.sql_key;
            const params = dataParamUnder?.master[0]?.params[0];

            const item = [{ sqlId: sqlId, sql_key: sqlKey, params: [params] }];
            const item2 = dataParamUnder?.master;
            if (item2[0].sqlId === '0' || item2[0].sqlId === 0) {
                fetcherPostCommonGridData(item)
                    .then((response) => {
                        setDetailData(response);
                    })
                    .catch((error) => {
                        console.error(error);
                    })
                    .finally(() => {
                        setDataLoading(false);
                        setDetailRetrieve(false);
                    });
            } else {
                fetcherPostGridData(item)
                    .then((response) => {
                        setDetailData(response);
                    })
                    .catch((error) => {
                        console.error(error);
                    })
                    .finally(() => {
                        setDataLoading(false);
                        setDetailRetrieve(false);
                    });
            }
        }
    }, [detailRetrieve]);

    // 마스터 그리드 데이터조회
    useEffect(() => {
        if (masterRetrieve) {
            // 그리드 둘 다 조회때리기
            const url = process.env.NEXT_PUBLIC_SSW_SQL_SEARCH_API_URL;
            const sqlId = dataParam?.master[0]?.sqlId;
            const sqlKey = dataParam?.master[0]?.sql_key;
            const params = dataParam?.master[0]?.params[0];

            const item = [{ sqlId: sqlId, sql_key: sqlKey, params: [params] }];
            const item2 = dataParam?.master;
            if (item2[0].sqlId === '0' || item2[0].sqlId === 0) {
                fetcherPostCommonGridData(item)
                    .then((response) => {
                        setMasterData(response);
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
                        setMasterData(response);
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

    // initRetrieve 관련 로직만 분리하여 별도의 useEffect로 처리
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

    // initRetrieve 관련 로직만 분리하여 별도의 useEffect로 처리
    useEffect(() => {
        if (dataParamUnder?.master?.[0]?.sqlId === '0' || dataParamUnder?.master?.[0]?.sqlId === 0) {
            if (initDetailRetrieve && dataParamUnder?.master?.[0]?.params[0]?.where[0]) {
                const BtnArray = detailUI?.srch_btn_info;
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
            if (initDetailRetrieve && dataParamUnder?.master?.[0]?.params[0]) {
                const BtnArray = detailUI?.srch_btn_info;
                const hasEntry = BtnArray?.some((item) => item.type === 'SEARCH' && item.initClick === true);

                if (hasEntry) {
                    // 한 번만 실행되도록 플래그 즉시 업데이트
                    setInitDetailRetrieve(false);

                    // 약간의 지연을 줘서 모든 컴포넌트가 초기화될 시간을 보장
                    setTimeout(() => {
                        handleSubmitUnder();
                    }, 500);
                }
            }
        }
    }, [initDetailRetrieve, dataParamUnder?.master, detailUI?.srch_btn_info]);

    // initRetrieve 관련 로직만 분리하여 별도의 useEffect로 처리
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
            const isUserCom = gridData?.find((item) => item.type === 'USER_COM');
            const isUserComUnder = gridData_under?.find((item) => item.type === 'USER_COM');
            const isOgnzCom = gridData?.find((item) => item.type === 'OGNZ_COM');
            const isOgnzComUnder = gridData_under?.find((item) => item.type === 'OGNZ_COM');
            const isCombo = gridData
                ?.filter((item) => item.type === 'COMBO')
                .reduce((acc, item2) => {
                    if (!acc.some((combo) => combo.enum === item2.enum)) {
                        acc.push(item2);
                    }
                    return acc;
                }, []);
            const isCombo_under = gridData_under
                ?.filter((item) => item.type === 'COMBO')
                .reduce((acc, item2) => {
                    if (!acc.some((combo) => combo.enum === item2.enum)) {
                        acc.push(item2);
                    }
                    return acc;
                }, []);

            const isCombo_all = [...isCombo, ...isCombo_under];

            const isCombo_reduce = isCombo_all.reduce((acc, item) => {
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

            if (isUserCom || isUserComUnder) {
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
                        const data = response[0].data;

                        setUserComData(data);
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }

            if (isOgnzCom || isOgnzComUnder) {
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
    }, [masterUI, detailUI]);
    // 데이터 조회 시 필요한 기능 추가
    // 주소팝업 사원, 조직 트리콤보
    // 상단그리드에 따라 하단그리드 전부 그리고 첫번째 데이터로 show + 데이터 조회
    // 상단 그리드 데이터 바뀌면 하단 그리드 조회
    if (dataLoading)
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
                데이터를 불러오는 중...
            </div>
        );

    if (!masterUI)
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
                데이터를 불러올 수 없습니다. (tpcd: {tpcdParam})
            </div>
        );
    return (
        <Box
            sx={{
                p: 2,
                flexGrow: 1,
                height: '100%',
                maxHeight: '100vh',
            }}
        >
            <Grid container spacing={2}>
                <Grid item xs={12} sx={{ pr: 2 }}>
                    <Grid item xs={12} sx={{ display: display }}>
                        <SearchCondition
                            masterUIinfo={masterUI}
                            tpcdParam={tpcdOn}
                            dataParam={dataParam}
                            searchParam={searchParams}
                            setDataParam={setDataParam}
                            handleSubmit={handleSubmit}
                            setDisplay={setDisplay}
                        />
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs={quickMenuInfo ? 10.3 : 12} sx={{ pr: 2 }}>
                            <Grid item xs={12}>
                                <Grid01
                                    masterUI={masterUI}
                                    tpcdParam={tpcdOn}
                                    setMasterRetrieve={setMasterRetrieve}
                                    gridData={gridData}
                                    rowData={masterData}
                                    treeCol={treeCol}
                                    sheetName='mySheet1'
                                    setDataParam={setDataParam}
                                    dataSeInfo={''}
                                    userData={userComData}
                                    ognzData={ognzComData}
                                    comboData={comboData}
                                    initParam={dataParam.master}
                                />
                            </Grid>
                            <Grid item xs={12} sx={{ display: display }}>
                                <SearchCondition
                                    masterUIinfo={detailUI}
                                    tpcdParam={tpcdUnder}
                                    dataParam={dataParamUnder}
                                    searchParam={searchParams}
                                    setDataParam={setDataParamUnder}
                                    handleSubmit={handleSubmitUnder}
                                    setDisplay={setDisplay}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Grid01
                                    masterUI={detailUI}
                                    tpcdParam={tpcdUnder}
                                    setMasterRetrieve={setDetailRetrieve}
                                    gridData={gridData_under}
                                    rowData={detailData}
                                    treeCol={treeCol_under}
                                    sheetName='mySheet2'
                                    setDataParam={setDataParamUnder}
                                    dataSeInfo={''}
                                    userData={userComData}
                                    ognzData={ognzComData}
                                    comboData={comboData}
                                    initParam={dataParamUnder.master}
                                />
                            </Grid>
                        </Grid>
                        {quickMenuInfo && (
                            <Grid
                                item
                                xs={1.7}
                                sx={{
                                    mt: 2,
                                    pb: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '100%',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    position: 'sticky', // 스크롤 시 고정
                                    top: '50px', // 상단 여백 설정 (원하는 값으로 조정)
                                    zIndex: 1,
                                }}
                            >
                                <QuickMenu tpcdParam={tpcdParam} quickMenuInfo={quickMenuInfo} />
                            </Grid>
                        )}
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
}
