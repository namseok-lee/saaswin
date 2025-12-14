'use client';

import React, { useEffect, useState } from 'react';
import { fetcherPostCmcd, fetcherPostCommonGridData, fetcherPostData, fetcherPostGridData } from 'utils/axios';
import Loader from 'components/Loader';
import { Grid, Stack, Tooltip, Typography } from '@mui/material';
import SearchCondition from 'components/SearchCondition';
import CustomButton from 'components/CustomButton';
import Grid01 from 'components/Grid/Grid01';
import { useSearchParams } from 'next/navigation';
import dayjs from 'dayjs';
import CustomTable from 'components/CustomTable';
import { SnackbarProvider } from 'notistack';

interface MasterUIData {
    data_se_info: any[]; // 데이터 타입에 맞게 수정
    grid_tit_info: any[];
    grid_btn_info: any; // 데이터 타입에 맞게 수정
    grid_info: any; // 데이터 타입에 맞게 수정
    scr_url: string;
    scr_no: string;
}

export default function Ssw01_gt({ TabmasterUI }: { TabmasterUI: MasterUIData[] }) {
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

    const tpcdParam = TabmasterUI?.scr_no;
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
    const [initRetrieve, setInitRetrieve] = useState(true); // 조회버튼(true/false)
    const [masterData, setMasterData] = useState(null); // 마스터그리드 데이터
    const [detailData, setDetailData] = useState(null); // 디테일그리드 데이터
    const [gridKey, setGridKey] = useState('');
    const data_se_info = TabmasterUI?.data_se_info || [];
    const gridTitleData = TabmasterUI?.grid_tit_info[0].title;
    const description = TabmasterUI?.grid_tit_info[0].description;
    const treeCol = TabmasterUI?.grid_tit_info[0].treeCol;
    const gridButtonData = TabmasterUI?.grid_btn_info;
    const gridData = TabmasterUI?.grid_info;
    const searchParams = new URLSearchParams(useSearchParams());
    const [display, setDisplay] = useState('block');
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

    // title, button, searchBox, 마스터 그리드헤더 조회
    useEffect(() => {
        if (TabmasterUI) {
            setMasterUI(TabmasterUI);
            setDataLoading(false);
        }
    }, [TabmasterUI]);

    // 마스터 그리드 데이터조회
    useEffect(() => {
        if (masterRetrieve) {
            const sqlId = dataParam?.master[0]?.sqlId;
            const sqlKey = dataParam?.master[0]?.sqlKey;
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
                        setMasterData(response);
                    })
                    .catch((error) => {
                        console.error(error);
                    })
                    .finally(() => {
                        setDataLoading(false);
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
                    });
            }
        }
    }, [masterRetrieve]);
    useEffect(() => {
        if (data_se_info.length > 0) {
            const data_se_cd = data_se_info[0].data_se_info.grid_value;
            setGridKey(data_se_cd);
            const element = document.getElementById('myTable' + data_se_cd);
            if (element) element.style.display = 'block';
            for (let i = 0; i < data_se_info.length; i++) {
                const table = document.getElementById('table' + data_se_info[i].data_se_info.grid_value);

                if (i !== 0) {
                    if (table) table.style.display = 'none';
                } else {
                    if (table) table.style.display = 'block';
                }
            }
        }
    }, [data_se_info]);
    useEffect(() => {
        // retrieveData가 존재하면 submit를 false로 설정하여 재요청 방지
        if (masterData) {
            setMasterRetrieve(false); // 이미 데이터를 받았으므로 submit를 false로 설정

            // data_se_info >0 인 경우 첫번째 행의 정보를 조회해서 mySheet2에 넣는다
            const dataLength = data_se_info.length;
            if (dataLength > 0) {
                const keyId = data_se_info[0].data_se_info.grid_key_id; // 구분정보

                const row = masterData[0];

                // 하단 시트 바로 생성
                for (let i = 0; i < data_se_info.length; i++) {
                    const data_se_cd = data_se_info[i].data_se_cd;
                    const prevElement = document.getElementById('myTable' + gridKey);
                    const prevTable = document.getElementById('table' + gridKey);
                    const element = document.getElementById('myTable' + data_se_cd);
                    const table = document.getElementById('table' + data_se_cd);
                    if (data_se_cd === keyId) {
                        setGridKey(data_se_cd);
                        prevElement.style.display = 'none';
                        prevTable.style.display = 'none';
                        element.style.display = 'block';
                        table.style.display = 'block';
                    }
                }

                // 데이터 조회 후 바로 조회
                setDataParam((prevDataParam) => {
                    const currentDetail = prevDataParam?.detail || []; // 이전 detail을 가져오고, 없으면 빈 배열로 초기화
                    return {
                        ...prevDataParam, // 기존 속성 유지
                        detail: currentDetail.map((item) => ({
                            ...item,
                            selectedRow: row, // 기존 객체에 selectedRow 추가
                        })),
                    };
                });
                // setDetailRetrieve(true);
            }
        }
    }, [masterData]);

    // 디테일 데이터 조회 추가
    useEffect(() => {
        if (detailRetrieve) {
            const items = dataParam.detail[0];
            const selectedRow = dataParam.detail[0].selectedRow;
            const sqlId =
                masterUI?.data_se_info?.length > 1
                    ? masterUI?.data_se_info?.find(
                          (item) => item.data_se_info.grid_value === items.selectedRow[item.data_se_info.grid_key_id]
                      ).srvc_no.sqlId
                    : data_se_info[0].srvc_no.sqlId;

            const sqlKey =
                masterUI?.data_se_info?.length > 1
                    ? masterUI?.data_se_info?.find(
                          (item) => item.data_se_info.grid_value === items.selectedRow[item.data_se_info.grid_key_id]
                      ).srvc_no.sqlKey
                    : data_se_info[0].srvc_no.sqlKey;

            //2024.10.29 한경 추가
            const keyId = data_se_info[0].data_se_info.grid_key_id;
            const selectValue = data_se_info.length > 1 ? selectedRow[keyId] : '0';

            const prevElement = document.getElementById('myTable' + gridKey);
            const prevTable = document.getElementById('table' + gridKey);
            const element = document.getElementById('myTable' + selectValue);
            const table = document.getElementById('table' + selectValue);

            if (gridKey != selectValue) {
                setGridKey(selectValue);

                prevElement.style.display = 'none';
                element.style.display = 'block';
                prevTable.style.display = 'none';
                table.style.display = 'block';
            }

            const updatedItems = [
                {
                    sqlId: sqlId,
                    sql_key: sqlKey,
                    params: [{ slry_info: [selectedRow] }],
                },
            ];
            fetcherPostGridData(updatedItems)
                .then((response) => {
                    setDetailData(response);
                })
                .catch((error) => {
                    console.error(error);
                })
                .finally(() => {
                    setDetailRetrieve(false);
                });
        }
    }, [detailRetrieve]);

    useEffect(() => {
        const isSelectedRow = () => !!dataParam?.detail?.[0]?.selectedRow;
        const isNewRow = () => !!dataParam?.detail?.[0]?.selectedRow.isNew;

        if (initRetrieve) {
            if (dataParam?.master?.[0]?.params[0]) {
                const params = dataParam?.master[0].params[0];
                const BtnArray = masterUI?.srch_btn_info;
                const hasEntry = BtnArray.some((item) => item.type === 'SEARCH' && item.initClick === true);

                if (hasEntry) {
                    setInitRetrieve(false);
                    handleSubmit();
                }
            }
        }

        if (isSelectedRow() && !isNewRow()) {
            setDetailRetrieve(true);
        } else if (isSelectedRow() && isNewRow()) {
            setDetailData(null);
        }
    }, [dataParam]);

    useEffect(() => {
        const rprs_ognz_no = 'WIN'; // 로그인 만들어지면 수정 필요
        if (masterUI) {
            const isUserCom = gridData?.find((item) => item.type === 'USER_COM');
            const isOgnzCom = gridData?.find((item) => item.type === 'OGNZ_COM');
            const isCombo = gridData
                ?.filter((item) => item.type === 'COMBO')
                .reduce((acc, item2) => {
                    if (!acc.some((combo) => combo.enum === item2.enum)) {
                        acc.push(item2);
                    }
                    return acc;
                }, []);
            const isCombo_under = data_se_info?.flatMap((innerArray) =>
                innerArray.table_info?.filter((item) => item.type === 'COMBO')
            );

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
                                rprs_ognz_no: 'WIN',
                            },
                        ],
                    },
                ];
                fetcherPostData(item)
                    .then((response) => {
                        setOgnzComData(response[0]?.data);
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }
        }
    }, [masterUI]);

    // 데이터 조회 시 필요한 기능 추가
    // 주소팝업 사원, 조직 트리콤보
    // 상단그리드에 따라 하단그리드 전부 그리고 첫번째 데이터로 show + 데이터 조회
    // 상단 그리드 데이터 바뀌면 하단 그리드 조회
    if (dataLoading) return <Loader />;
    return (
        <Grid container spacing={2}>
            <SnackbarProvider maxSnack={3}>
                <Grid item xs={12} sx={{ display: display }}>
                    <SearchCondition
                        masterUIinfo={masterUI}
                        tpcdParam={tpcdParam}
                        dataParam={dataParam}
                        searchParam={searchParams}
                        setDataParam={setDataParam}
                        handleSubmit={handleSubmit}
                        setDisplay={setDisplay}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Grid01
                        masterUI={masterUI}
                        gridData={gridData}
                        rowData={masterData}
                        treeCol={treeCol}
                        sheetName='mySheet1'
                        setDataParam={setDataParam}
                        setMasterRetrieve={setMasterRetrieve}
                        dataSeInfo={data_se_info}
                        userData={userComData}
                        ognzData={ognzComData}
                        comboData={comboData}
                        initParam={dataParam.master}
                    />
                </Grid>
                {data_se_info.length > 0 &&
                    data_se_info?.map((item: DataSeInfoItem, index: number) => (
                        <Grid
                            id={'table' + item.data_se_cd}
                            key={item.data_se_cd}
                            item
                            xs={12} /*sx={{ display: 'none' }}*/
                        >
                            <div
                                id={'myTable' + item.data_se_cd}
                                style={{ height: '100%', width: '100%', minHeight: '400px' }}
                            >
                                <CustomTable
                                    masterInfo={item}
                                    tableData={detailData?.[0]}
                                    comboData={comboData}
                                    userData={userComData}
                                    ognzData={ognzComData}
                                    gridKey={gridKey}
                                    setMasterRetrieve={setDetailRetrieve}
                                    initParam={dataParam.detail}
                                />
                            </div>
                        </Grid>
                    ))}
            </SnackbarProvider>
        </Grid>
    );
}
