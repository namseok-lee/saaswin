'use client';

import React, { useEffect, useState } from 'react';
import { fetcherPost, fetcherPostCmcd, fetcherPostCommonData, fetcherPostData, fetcherPostGridData } from 'utils/axios';
import Loader from 'components/Loader';
import { Box, Grid } from '@mui/material';
import SearchCondition from 'components/SearchCondition';
import Grid01 from 'components/Grid/Grid01';
import { useSearchParams } from 'next/navigation';
import { SnackbarProvider } from 'notistack';
import CrtrCheckDialog from 'views/dialog/crtr/crtrCheckDialog';
import CrtrGrid from 'components/Grid/CrtrGrid';
import BoxSelect from 'components/BoxSelect';
import CrtrTable from 'components/CrtrTable';
import { Param } from '@/types/component/SearchCondition';

interface MasterUIData {
    data_se_info: any[]; // 데이터 타입에 맞게 수정
    grid_tit_info: any[];
    grid_btn_info: any; // 데이터 타입에 맞게 수정
    grid_info: any; // 데이터 타입에 맞게 수정
    table_info: any; // 데이터 타입에 맞게 수정
}

export default function Ssw01_crtr({
    TabmasterUI,
    setCrtrRetrieve,
    crtrData,
}: {
    TabmasterUI: MasterUIData[];
    setCrtrRetrieve: (value: boolean) => void;
    crtrData: any;
}) {
    const scr_no = TabmasterUI?.scr_no;
    const tpcdParam = TabmasterUI?.scr_no;
    const [open, setOpen] = useState(false);
    const [key, setKey] = useState(0); // 서치박스 상태 변경용
    const [comboData, setComboData] = useState([]);
    const [masterUI, setMasterUI] = useState<MasterUIData | null>(null);
    const [dataLoading, setDataLoading] = useState(true);
    const [dataParam, setDataParam] = useState<Param>({
        master: [], // 마스터그리드 데이터 파라미터
        detail: [], // 하단그리드 데이터 파라미터
    });
    const [masterRetrieve, setMasterRetrieve] = useState(false); // 조회버튼(true/false)
    const [initRetrieve, setInitRetrieve] = useState(true); // 조회버튼(true/false)
    const [masterData, setMasterData] = useState(null); // 마스터그리드 데이터
    const [display, setDisplay] = useState('block');
    const [param, setParam] = useState({ nmData: '', cdData: '', groupData: '', title: '', description: '' });
    const searchParams = new URLSearchParams(useSearchParams());
    const treeCol = masterUI?.grid_tit_info?.[0]?.treeCol;
    const treeColNm = masterUI?.grid_tit_info?.[0]?.treeColNm;
    const gridData = masterUI?.grid_info;
    const tableData = masterUI?.table_info;
    const gridIdData = gridData?.sort((a, b) => Number(a.seq) - Number(b.seq)).map(({ id }) => ({ id }));

    // 가장 상위 조회버튼
    const handleSubmit = () => {
        if (dataParam?.master) {
            setMasterRetrieve(true); // 데이터를 가져오도록 설정
        } else {
            console.log('조회할 데이터가 없습니다.');
        }
    };

    const handleOpen = () => {
        setOpen(!open);
    };

    useEffect(() => {
        if (TabmasterUI) {
            setMasterUI(TabmasterUI);
            setDataLoading(false);

            switch (scr_no) {
                case 'SYSHRS001':
                    break;
                case 'SYSHRS002':
                    setParam({
                        nmData: 'ognz_type_nm',
                        cdData: 'ognz_type_cd',
                        groupData: 'hrs_group00933',
                        title: '조직유형 설정 시작하기',
                        description:
                            ' 우리 회사에서 사용할 조직 유형을 선택해보세요. 선택한 데이터는 수정 및 추가할 수 있습니다. \n조직유형 데이터를 생성하지 않으면 인사 시스템에서 ‘조직유형’ 관련 정보는 표시되지 않습니다.',
                    });
                    // setGroupData('hrs_group00933');
                    // setNmData('ognz_type_nm');
                    // setCdData('ognz_type_cd');
                    break;
                case 'SYSHRS003':
                    setParam({
                        nmData: 'duty_nm',
                        cdData: 'duty_cd',
                        groupData: 'hrs_group00934',
                        title: '직무 설정 시작하기',
                        description:
                            ' 우리 회사에서 사용할 직무를 선택해보세요. 선택한 데이터는 수정 및 추가할 수 있습니다. \n직무 데이터를 생성하지 않으면 인사 시스템에서 ‘직무’ 관련 정보는 표시되지 않습니다.',
                    });
                    // setGroupData('hrs_group00934');
                    // setNmData('duty_nm');
                    // setCdData('duty_cd');
                    break;
                case 'SYSHRS004':
                    setParam({
                        nmData: 'jbttl_nm',
                        cdData: 'jbttl_cd',
                        groupData: 'hrs_group00935',
                        title: '직책 설정 시작하기',
                        description:
                            ' 우리 회사에서 사용할 직책을 선택해보세요. 선택한 데이터는 수정 및 추가할 수 있습니다. \n직책 데이터를 생성하지 않으면 인사 시스템에서 ‘직책’ 관련 정보는 표시되지 않습니다.',
                    });
                    // setGroupData('hrs_group00935');
                    // setNmData('jbttl_nm');
                    // setCdData('jbttl_cd');
                    break;
                case 'SYSHRS005':
                    setParam({
                        nmData: 'jbps_nm',
                        cdData: 'jbps_cd',
                        groupData: 'hrs_group00936',
                        title: '직위 설정 시작하기',
                        description:
                            ' 우리 회사에서 사용할 직위를 선택해보세요. 선택한 데이터는 수정 및 추가할 수 있습니다. \n직위 데이터를 생성하지 않으면 인사 시스템에서 ‘직위’ 관련 정보는 표시되지 않습니다.',
                    });
                    // setGroupData('hrs_group00936');
                    // setNmData('jbps_nm');
                    // setCdData('jbps_cd');
                    break;
                case 'SYSHRS006':
                    setParam({
                        nmData: 'jbgd_nm',
                        cdData: 'jbgd_cd',
                        groupData: 'hrs_group00937',
                        title: '직급 설정 시작하기',
                        description:
                            ' 우리 회사에서 사용할 직급을 선택해보세요. 선택한 데이터는 수정 및 추가할 수 있습니다. \n직급 데이터를 생성하지 않으면 인사 시스템에서 ‘직급’ 관련 정보는 표시되지 않습니다.',
                    });
                    // setGroupData('hrs_group00937');
                    // setNmData('jbgd_nm');
                    // setCdData('jbgd_cd');
                    break;
                default:
                    break;
            }
        }
    }, [TabmasterUI]);

    const rprs_ognz_no = 'WIN'; // 로그인 만들어지면 수정 필요

    // 마스터 그리드 데이터조회
    useEffect(() => {
        if (masterRetrieve) {
            const sqlId = dataParam?.master[0]?.sqlId;
            const sql_key = dataParam?.master[0]?.sql_key;
            const params = dataParam?.master[0]?.params[0];
            const item = [{ sqlId: sqlId, sql_key: sql_key, params: [params] }];
            const item2 = dataParam?.master;
            if (item2[0].sqlId === '0' || item2[0].sqlId === 0) {
                fetcherPostCommonData(item)
                    .then((response) => {
                        const data = response;

                        if (data === null && scr_no !== 'SYSHRS001') {
                            setOpen(true);
                        } else {
                            setMasterData(data);
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
                        const data = response[0].data;
                        const transformedData = response.map((obj) => {
                            if (obj.data === null) {
                                return null;
                            }
                            // 각 객체의 키를 변환
                            return Object.entries(obj).reduce((newObj, [key, value]) => {
                                // | 문자가 있는지 확인
                                const pipeIndex = key.indexOf('|');

                                // | 문자가 있으면 그 이후의 문자열을 새 키로 사용, 없으면 원래 키 사용
                                const newKey = pipeIndex !== -1 ? key.substring(pipeIndex + 1) : key;

                                // 새 객체에 변환된 키와 원래 값을 추가
                                newObj[newKey] = value;
                                return newObj;
                            }, {});
                        });
                        if ((data === null || transformedData.length === 0) && scr_no !== 'SYSHRS001') {
                            setOpen(true);
                        } else {
                            setMasterData(transformedData);
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
        // retrieveData가 존재하면 submit를 false로 설정하여 재요청 방지
        setMasterRetrieve(false); // 이미 데이터를 받았으므로 submit를 false로 설정
    }, [masterData]);

    useEffect(() => {
        if (initRetrieve) {
            if (dataParam?.master?.[0]?.params[0]) {
                const BtnArray = masterUI?.srch_btn_info;
                const hasEntry = BtnArray.some((item) => item.type === 'SEARCH' && item.initClick === true);

                if (hasEntry) {
                    setInitRetrieve(false);
                    handleSubmit();
                }
            }
        }
    }, [dataParam]);

    useEffect(() => {
        if (masterUI && gridData) {
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
        } else if (masterUI && tableData) {
            const isCombo = tableData
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
                maxHeight: '100vh',
            }}
        >
            <Grid container spacing={2}>
                <SnackbarProvider maxSnack={3}>
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
                                key={key}
                            />
                        </Grid>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sx={{ pr: 2 }}>
                                <Grid item xs={12}>
                                    {gridData?.length > 0 && (
                                        <CrtrGrid
                                            treeCol={treeCol}
                                            masterUI={masterUI}
                                            tpcdParam={tpcdParam}
                                            setMasterRetrieve={setMasterRetrieve}
                                            gridData={gridData}
                                            rowData={masterData}
                                            comboData={comboData}
                                            initParam={dataParam.master}
                                            param={param}
                                        />
                                    )}
                                    {tableData?.length > 0 && (
                                        <CrtrTable
                                            masterInfo={masterUI}
                                            tableData={masterData?.[0]}
                                            comboData={comboData}
                                            setMasterRetrieve={setMasterRetrieve}
                                            setCrtrRetrieve={setCrtrRetrieve}
                                            crtrData={crtrData}
                                        />
                                    )}
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                    <CrtrCheckDialog
                        open={open}
                        onClose={handleOpen}
                        setMasterData={setMasterData}
                        gridData={gridIdData}
                        scr_no={scr_no}
                        param={param}
                    />
                </SnackbarProvider>
            </Grid>
        </Box>
    );
}
