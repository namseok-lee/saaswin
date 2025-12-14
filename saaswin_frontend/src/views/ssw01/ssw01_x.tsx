'use client';

import React, { useEffect, useState } from 'react';
import {
    fetcherPostCmcd,
    fetcherPostCommonGridData,
    fetcherPostData,
    fetcherPostGridData,
    fetcherPostScr,
} from 'utils/axios';
import Loader from 'components/Loader';
import { Grid } from '@mui/material';
import SearchCondition from 'components/SearchCondition';
import Grid01 from 'components/Grid/Grid01';
import { useRouter, useSearchParams } from 'next/navigation';
import dayjs from 'dayjs';
import QuickMenu from 'components/QuickMenu';
import { SnackbarProvider } from 'notistack';

export default function Ssw01_x({ tpcd }: { tpcd: string }) {
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
        grid_sort_info: any[]; // default 정렬정보
    }
    const [key, setKey] = useState(0); // 서치박스 상태 변경용
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
    const [detailRetrieve, setDetailRetrieve] = useState(false); // 그리드row클릭(true/false)
    const [initRetrieve, setInitRetrieve] = useState(true); // 조회버튼(true/false)
    const [masterData, setMasterData] = useState(null); // 마스터그리드 데이터
    const [detailData, setDetailData] = useState(null); // 디테일그리드 데이터
    const [gridKey, setGridKey] = useState('');
    const [display, setDisplay] = useState('block');
    const [applyModalData, setApplyModalData] = useState({});
    const searchParamsResult = useSearchParams();
    const searchParams = new URLSearchParams(searchParamsResult || '');
    const data_se_info = masterUI?.data_se_info || [];
    const gridTitleData = masterUI?.grid_tit_info?.[0]?.title;
    const description = masterUI?.grid_tit_info?.[0]?.description;
    const treeCol = masterUI?.grid_tit_info?.[0]?.treeCol;
    const gridButtonData = masterUI?.grid_btn_info;
    const gridData = masterUI?.grid_info;
    const gridSortData = masterUI?.grid_sort_info;
    const quickMenuInfo = masterUI?.mvmn_menu_info?.sort((a, b) => Number(a.seq) - Number(b.seq));
    const [emptyResponseModal, setEmptyResponseModal] = useState(false);

    const router = useRouter();
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

    const rprs_ognz_no = ''; // 로그인 만들어지면 수정 필요

    // title, button, searchBox, 마스터 그리드헤더 조회 - DB(tsm_scr) 값 조회
    useEffect(() => {
        fetcherPostScr({ tpcd: tpcdParam }) // tpcd 파라미터 전달
            .then((response) => {
                setMasterUI(response);
                setDataLoading(false);
            })
            .catch((error) => {
                console.error('fetcherPostScr error:', error);
                setDataLoading(false);
            });
        // ssw01(tpcdParam, setMasterUI, setDataLoading);
    }, [tpcdParam]);

    // 마스터 그리드 데이터조회
    useEffect(() => {
        if (masterRetrieve) {
            const sqlId = dataParam?.master[0]?.sqlId;
            const sqlKey = dataParam?.master[0]?.sql_key;
            const params = dataParam?.master[0]?.params;
            const item = [{ sqlId: sqlId, sql_key: sqlKey, params: params }];
            const item2 = dataParam?.master;
            if (dataParam?.master[0].sqlId === '0' || item2[0].sqlId === 0) {
                fetcherPostCommonGridData([{ sqlId: sqlId, sql_key: sqlKey, params: params }])
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
                fetcherPostGridData([{ sqlId: sqlId, sql_key: sqlKey, params: params }])
                    .then((response) => {
                        if (sqlKey === 'hrb_slry_trpr_info_get') {
                            setMasterData(response);
                        } else if (sqlKey === 'hpr_invtn_trpr_get') {
                            // 빈 배열 체크 및 모달 열기
                            if (Array.isArray(response) && response.length === 0) {
                                setEmptyResponseModal(true); // 모달 열기
                            }
                            setMasterData(response);
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
        if (data_se_info.length > 0) {
            const data_se_cd = data_se_info[0].data_se_info.grid_value;
            setGridKey(data_se_cd);
            const element = document.getElementById('mySheet' + data_se_cd);
            element.style.display = 'block';
            for (let i = 0; i < data_se_info.length; i++) {
                const grid = document.getElementById('grid' + data_se_info[i].data_se_info.grid_value);

                if (i !== 0) {
                    grid.style.display = 'none';
                } else {
                    grid.style.display = 'block';
                }
            }
        }
    }, [data_se_info]);

    useEffect(() => {
        // retrieveData가 존재하면 submit를 false로 설정하여 재요청 방지
        setMasterRetrieve(false); // 이미 데이터를 받았으므로 submit를 false로 설정
        if (masterData) {
            // data_se_info >0 인 경우 첫번째 행의 정보를 조회해서 mySheet2에 넣는다
            const dataLength = data_se_info.length;
            if (dataLength > 0) {
                const keyId = data_se_info[0].data_se_info.grid_key_id; // 구분정보

                const row = masterData[0];
                // 하단 시트 바로 생성
                for (let i = 0; i < data_se_info.length - 1; i++) {
                    const data_se_cd = data_se_info[i].data_se_cd;
                    const prevElement = document.getElementById('mySheet' + gridKey);
                    const prevGrid = document.getElementById('grid' + gridKey);
                    const element = document.getElementById('mySheet' + data_se_cd);
                    const grid = document.getElementById('grid' + data_se_cd);
                    if (data_se_cd === keyId) {
                        setGridKey(data_se_cd);
                        prevElement.style.display = 'none';
                        prevGrid.style.display = 'none';
                        element.style.display = 'block';
                        grid.style.display = 'block';
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
                      ).srvc_no
                    : data_se_info[0].srvc_no;
            //2024.10.29 한경 추가
            const keyId = data_se_info[0].data_se_info.grid_key_id;
            const selectValue = data_se_info.length > 1 ? selectedRow[keyId] : '0';

            const prevElement = document.getElementById('mySheet' + gridKey);
            const prevGrid = document.getElementById('grid' + gridKey);
            const element = document.getElementById('mySheet' + selectValue);
            const grid = document.getElementById('grid' + selectValue);

            if (gridKey != selectValue) {
                setGridKey(selectValue);

                prevElement.style.display = 'none';
                element.style.display = 'block';
                prevGrid.style.display = 'none';
                grid.style.display = 'block';
            }

            const updatedItems = [
                {
                    sqlId,
                    params: [selectedRow],
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

    // 디테일 관련 로직은 별도의 useEffect로 분리
    useEffect(() => {
        const isSelectedRow = () => !!dataParam?.detail?.[0]?.selectedRow;
        const isNewRow = () => !!dataParam?.detail?.[0]?.selectedRow.isNew;

        if (isSelectedRow() && !isNewRow()) {
            setDetailRetrieve(true);
        } else if (isSelectedRow() && isNewRow()) {
            setDetailData(null);
        }
    }, [dataParam?.detail]);

    // 콤보 데이터 세팅
    useEffect(() => {
        if (masterUI) {
            const isUserCom = gridData?.find((item) => item.type === 'USER_COM');
            const isOgnzCom = gridData?.find((item) => item.type === 'OGNZ_COM');
            const isCombo = (gridData || [])
                .filter((item) => item.type === 'COMBO')
                .reduce((acc, item2) => {
                    if (!acc.some((combo) => combo.enum === item2.enum)) {
                        acc.push(item2);
                    }
                    return acc;
                }, []); // 기본값으로 빈 배열 설정

            const isCombo_under = (data_se_info || []).flatMap((innerArray) =>
                (innerArray.grid_info || []).filter((item) => item.type === 'COMBO')
            ); // 기본값으로 빈 배열 설정

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
        <div className='contContainer'>
            <SnackbarProvider maxSnack={3}>
                <SearchCondition
                    masterUIinfo={masterUI}
                    tpcdParam={tpcdParam}
                    dataParam={dataParam}
                    searchParam={searchParams}
                    setDataParam={setDataParam}
                    handleSubmit={handleSubmit}
                    setDisplay={setDisplay}
                    key={key}
                />

                <Grid container spacing={2}>
                    <Grid item xs={quickMenuInfo ? 10 : 12}>
                        <Grid01
                            setKey={setKey}
                            masterUI={masterUI}
                            tpcdParam={tpcdParam}
                            setMasterRetrieve={setMasterRetrieve}
                            gridData={gridData}
                            gridSortData={gridSortData}
                            rowData={masterData}
                            treeCol={treeCol}
                            sheetName='mySheet1'
                            setDataParam={setDataParam}
                            dataSeInfo={data_se_info}
                            userData={userComData}
                            ognzData={ognzComData}
                            comboData={comboData}
                            initParam={dataParam.master}
                        />
                        {data_se_info.length > 0 &&
                            data_se_info.map((item: DataSeInfoItem) => (
                                <Grid id={'grid' + item.data_se_cd} key={item.data_se_cd} item xs={12}>
                                    <Grid01
                                        masterUI={masterUI}
                                        gridData={item.grid_info}
                                        rowData={detailData}
                                        treeCol={item.grid_tit_info.treeCol}
                                        sheetName={'mySheet' + item.data_se_cd}
                                        setDataParam={''}
                                        gridKey={gridKey}
                                        item={item}
                                        dataSeInfo={''}
                                        userData={userComData}
                                        ognzData={ognzComData}
                                        comboData={comboData}
                                        initParam={dataParam.detail}
                                    />
                                </Grid>
                            ))}
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
            </SnackbarProvider>

            {/* <ApplyDetail params={applyModalData} setParams={setApplyModalData} /> */}
        </div>
    );
}
