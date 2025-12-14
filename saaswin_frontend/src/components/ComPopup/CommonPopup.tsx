import React, { useEffect, useState } from 'react';
import {
    IconButton,
    Grid,
    Modal,
    Box,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from '@mui/material';
import { useSearchParams } from 'next/navigation';
import dayjs from 'dayjs';
import SearchCondition from '../SearchCondition';
import Grid01 from 'components/Grid/Grid01';
import {
    fetcherPostCmcd,
    fetcherPostCommonGridData,
    fetcherPostData,
    fetcherPostGridData,
    fetcherPostScr,
} from 'utils/axios';
import Loader from '../Loader';
import CloseIcon from '@mui/icons-material/Close';

const CommonPopup = ({ open, onClose, params }: { open: boolean; onClose: () => void; params: any }) => {
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
    }
    const { scr_no, initParam } = params;
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
    const [detailData, setDetailData] = useState(null); // 디테일그리드 데이터
    const [gridKey, setGridKey] = useState('');
    const [display, setDisplay] = useState('block');
    const searchParams = new URLSearchParams(useSearchParams());
    const searchData = masterUI?.srch_info || [];
    const data_se_info = masterUI?.data_se_info || [];
    const titleData = masterUI?.scr_tit;
    const description = masterUI?.grid_tit_info[0].description;
    const treeCol = masterUI?.grid_tit_info[0].treeCol;
    const gridButtonData = masterUI?.grid_btn_info;
    const gridSrchData = masterUI?.srch_btn_info;
    const gridData = masterUI?.grid_info;

    const sortBySeqBtn: SortBySeqBtnItem[] = (gridButtonData || [])
        .slice()
        .sort((a: SortBySeqBtnItem, b: SortBySeqBtnItem) => Number(b.seq) - Number(a.seq)); // seq 기준으로 역순정렬

    const handleSubmit = () => {
        if (dataParam?.master) {
            setMasterRetrieve(true); // 데이터를 가져오도록 설정
        } else {
            console.log('조회할 데이터가 없습니다.');
        }
    };

    const rprs_ognz_no = 'WIN'; // 로그인 만들어지면 수정 필요
    // title, button, searchBox, 마스터 그리드헤더 조회
    useEffect(() => {
        const item = {
            scr_no: scr_no,
        };

        fetcherPostScr(item) // fetcherPost 함수 사용
            .then((response) => {
                setMasterUI(response);
                setDataLoading(false);
            })
            .catch((error) => {
                console.error(error);
            });
    }, [params]);

    // 마스터 그리드 데이터조회
    useEffect(() => {
        if (masterRetrieve) {
            const sqlId = dataParam?.master[0]?.sqlId;
            const sqlKey = dataParam?.master[0]?.sql_key;
            const params = dataParam?.master[0]?.params[0];
            if (initParam) {
                Object.keys(initParam[0]).forEach((key) => {
                    if (params.hasOwnProperty(key)) {
                        params[key] = initParam[0][key]; // A의 값을 B의 해당 키에 반영
                    }
                });
            }

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

    useEffect(() => {
        if (data_se_info.length > 0) {
            const data_se_cd = data_se_info[0].data_se_info.grid_value;

            setGridKey(data_se_cd);
            const element = document.getElementById('mySheet' + data_se_cd);
            if (element) element.style.display = 'block';
            for (let i = 0; i < data_se_info.length; i++) {
                const grid = document.getElementById('grid' + data_se_info[i].data_se_info.grid_value);

                if (i !== 0) {
                    if (grid) grid.style.display = 'none';
                } else {
                    if (grid) grid.style.display = 'block';
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
                    sqlId: sqlId,
                    sql_key: sqlKey,
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

    useEffect(() => {
        const isSelectedRow = () => !!dataParam?.detail?.[0]?.selectedRow;
        const isNewRow = () => !!dataParam?.detail?.[0]?.selectedRow.isNew;

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
                innerArray.grid_info?.filter((item) => item.type === 'COMBO')
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
                            // const data = response[0].data[0];
                            // setComboData((prev) => ({
                            //     ...prev,
                            //     [cd]: data['data|json_agg'],
                            // }));
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
                        const data = response;

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
                        setOgnzComData(response);
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }

            if (initParam) {
                const sqlId = gridSrchData[0]?.sqlId;
                const sqlKey = gridSrchData[0]?.sqlKey;
                let sendParam = [{}];
                const mappedItems = [];
                searchData.map((item) => {
                    const fdname = item.id;
                    const value = initParam[0][fdname]; // 기본값

                    let condition = '';

                    if (item.type === 'TEXT') {
                        condition = 'like';
                    }
                    if (item.type === 'FROM_TO_DATE') {
                        // bgng가 있다면 end도 존재할것이기에 end로 넣어주고
                        // bgng가 아니라면 동일한 id로 condition만 다르게해서 넣어준다
                        const fdname2 = fdname.replace('bgng', 'end');
                        const param2 = {
                            fdname: fdname2,
                            value: sendData[item.id + '_end'],
                            condition: 'less than to equal', // <=
                        };
                        if (param2.value !== undefined && param2.value !== null && param2.value !== '') {
                            mappedItems.push(param2);
                        }

                        condition = 'more than to equal'; // >=
                    }
                    if (item.type === 'COMBO' || item.type === 'COM_POPUP_EMP') {
                        condition = 'in';
                    }

                    // 값이 있을때만 넣는다
                    if (value !== undefined && value !== null && value !== '') {
                        const param = {
                            fdname: fdname,
                            value: value,
                            condition: condition,
                        };
                        mappedItems.push(param);
                    }
                });

                if (sqlId === '0' || sqlId === 0) {
                    sendParam = [
                        {
                            param_data: [
                                {
                                    work_user_no: 'WIN000031', // 로그인 만들어지면 수정 필요
                                    rprs_ognz_no: 'WIN', // 로그인 만들어지면 수정 필요
                                    user_no: '',
                                    scr_no: scr_no,
                                    where: mappedItems,
                                },
                            ],
                        },
                    ];
                } else {
                    sendParam = initParam;
                }
                const item = [{ sqlId: sqlId, sql_key: sqlKey, params: sendParam }];

                if (sqlId === '0' || sqlId === 0) {
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
        }
    }, [masterUI]);

    if (dataLoading) return <Loader />;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth='lg' // 최대 너비 설정
            fullWidth // 너비를 꽉 채우도록 설정
            PaperProps={{
                sx: {
                    width: '1500px', // 다이얼로그 너비
                    height: '800px', // 다이얼로그 높이
                    padding: '16px',
                },
            }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography component='div' variant='h3' fontWeight='bold'>
                    {titleData}
                </Typography>
                <IconButton onClick={onClose} sx={{ ml: 'auto' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Grid item xs={12} sx={{ pr: 2 }}>
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
                    <Grid container spacing={2}>
                        <Grid item xs={12} sx={{ pr: 2 }}>
                            <Grid item xs={12}>
                                <Grid01
                                    masterUI={masterUI}
                                    tpcdParam={tpcdParam}
                                    setMasterRetrieve={setMasterRetrieve}
                                    gridData={gridData}
                                    rowData={masterData}
                                    treeCol={treeCol}
                                    sheetName='mySheet1'
                                    setDataParam={setDataParam}
                                    dataSeInfo={data_se_info}
                                    userData={userComData}
                                    ognzData={ognzComData}
                                    comboData={comboData}
                                    initParam={initParam}
                                />
                            </Grid>
                            {data_se_info.length > 0 &&
                                data_se_info?.map((item: DataSeInfoItem, index: number) => (
                                    <Grid
                                        id={'grid' + item.data_se_cd}
                                        key={item.data_se_cd}
                                        item
                                        xs={12} /*sx={{ display: 'none' }}*/
                                    >
                                        <Grid01
                                            gridData={item.grid_info}
                                            rowData={detailData}
                                            treeCol={item.grid_tit_info.treeCol}
                                            sheetName={'mySheet' + item.data_se_cd}
                                            setMasterRetrieve={setDetailRetrieve}
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
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    );
};

export default CommonPopup;
