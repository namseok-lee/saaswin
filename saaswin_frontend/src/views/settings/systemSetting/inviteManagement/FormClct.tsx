'use client';

import { Box, Grid, TextField } from '@mui/material';
import InputTextBox from '@/components/InputTextBox';
import Grid01 from 'components/Grid/Grid01';
import Loader from 'components/Loader';
import SwModal from 'components/Modal';
import SearchCondition from 'components/SearchCondition';
import Typography from 'components/Typography';
import { useSearchParams } from 'next/navigation';
import { SnackbarProvider } from 'notistack';
import { useEffect, useState } from 'react';
import { fetcherPostCmcd, fetcherPostCommonData, fetcherPostData, fetcherPostScr } from 'utils/axios';
import { IcoCheckFill, IcoDelete } from '@/assets/Icon';
import Button from 'components/Button';

export default function FormClct({
    tpcd,
    open,
    onClose,
    title,
    setTitle,
    id,
    isNewForm = false,
    defaultArticleData,
    defaultDataLoaded,
    setRefreshForms,
}: {
    tpcd: string;
    open: boolean;
    onClose: () => void;
    setTitle: (title: string, formData?: any) => boolean;
    title: string;
    id?: any;
    isNewForm?: boolean;
    defaultArticleData: any[];
    defaultDataLoaded: boolean;
    setRefreshForms: (refresh: boolean) => void;
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
        data_se_info: any[];
        grid_tit_info: any[];
        grid_btn_info: any;
        grid_info: any;
    }

    const [key, setKey] = useState(0); // 서치박스 상태 변경용
    const tpcdParam = tpcd;
    const [comboData, setComboData] = useState([]);
    const [masterUI, setMasterUI] = useState<MasterUIData | null>(null);
    const [dataLoading, setDataLoading] = useState(true);
    const [dataParam, setDataParam] = useState<Param>({
        master: [],
        detail: [],
    });
    const [masterRetrieve, setMasterRetrieve] = useState(false);
    const [initRetrieve, setInitRetrieve] = useState(true);
    const [masterData, setMasterData] = useState(null);
    const [display, setDisplay] = useState('block');
    const searchParams = new URLSearchParams(useSearchParams());
    const [hasChange, setHasChange] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    const data_se_info = masterUI?.data_se_info || [];
    const gridTitleData = masterUI?.grid_tit_info[0]?.title;
    const description = masterUI?.grid_tit_info[0]?.description;
    const treeCol = masterUI?.grid_tit_info[0]?.treeCol;
    const gridButtonData = masterUI?.grid_btn_info;
    const gridData = masterUI?.grid_info;
    const [triggerSave, setTriggerSave] = useState(false);
    const [localTitle, setLocalTitle] = useState(title);

    const sortBySeqBtn: SortBySeqBtnItem[] = (gridButtonData || [])
        .slice()
        .sort((a: SortBySeqBtnItem, b: SortBySeqBtnItem) => Number(b.seq) - Number(a.seq));

    const handleSubmit = () => {
        if (dataParam?.master) {
            setMasterRetrieve(true);
        } else {
            console.log('조회할 데이터가 없습니다.');
        }
    };

    // tsm_scr에 등록한 값을 다 받아옴
    useEffect(() => {
        const item = {
            scr_no: tpcdParam,
        };

        fetcherPostScr(item)
            .then((response) => {
                setMasterUI(response); // 받아온 값 MasterUI에 저장
                setDataLoading(false); // 로딩 X
            })
            .catch((error) => {
                console.error(error);
            });
    }, [tpcdParam]);

    // 처음에 조회하는 코드
    useEffect(() => {
        if (masterRetrieve && id !== undefined && id !== null) {
            const sqlId = dataParam?.master[0]?.sqlId;
            const sqlKey = dataParam?.master[0]?.sql_key;
            const params = dataParam?.master[0]?.params[0];

            const item = [{ sqlId: sqlId, sql_key: sqlKey, params: [{ invtn_clct_id: id }] }];
            const item2 = dataParam?.master;
            if (item2[0].sqlId === '0' || item2[0].sqlId === 0) {
                fetcherPostCommonData(item)
                    .then((response) => {
                        setMasterData(response);
                    })
                    .catch((error) => {
                        console.error(error);
                    })
                    .finally(() => {
                        setDataLoading(false);
                        setMasterRetrieve(false);
                        setHasChange(false); // 변경점 저장되었으면
                    });
            } else {
                fetcherPostData(item)
                    .then((response) => {
                        setMasterData(response[0]?.artcl_info);
                    })
                    .catch((error) => {
                        console.error(error);
                    })
                    .finally(() => {
                        setDataLoading(false);
                        setMasterRetrieve(false);
                        setHasChange(false); // 변경점 저장되었으면
                    });
            }
        } else if (masterRetrieve) {
            // 초기 화면 일시 조회 X
            setMasterRetrieve(false);
        }
    }, [masterRetrieve, id, dataParam]);

    useEffect(() => {
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
    }, [dataParam]);

    // 콤보 데이터를 받아옴
    useEffect(() => {
        if (masterUI) {
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
        }
    }, [masterUI]);

    // 기본 항목 데이터 생성 함수 추가 (코드 재사용)
    const getDefaultArticleInfo = () => {
        // props로 받은 데이터를 그대로 리턴
        return defaultArticleData;
    };

    // open 상태가 변경될 때 초기 데이터 설정
    useEffect(() => {
        if (open) {
            setLocalTitle(title);

            // 신규 양식이고 기본 데이터가 로드되었을 때만 설정
            if (isNewForm && defaultDataLoaded) {
                const defaultItems = getDefaultArticleInfo();
                console.log('기본 데이터 설정:', defaultItems); // 디버깅용
                setMasterData(defaultItems);
            }
        }
    }, [open, title, isNewForm, defaultDataLoaded, defaultArticleData]);

    if (dataLoading) return <Loader />;

    const handleSend = (item) => {
        if (!localTitle || localTitle.trim() === '') {
            alert('양식 이름을 입력해주세요.');
            return false;
        }
        // 제목 중복 체크만 수행하고 실제 저장은 GridButtons.tsx에서 수행
        const result = setTitle(localTitle);
        // 제목 중복 체크 통과 시 모달 닫기
        if (result) {
            console.log('수집 항목 제목 설정 성공:', localTitle);
            if (item === 'INVTN_SAVE') {
                setTriggerSave(true); // 이걸로 저장을 일으킴
            }

            // triggerSave가 적용되고 useEffect가 호출될 시간을 확보하기 위해
            // setTimeout을 사용하여 지연시킨 후 모달 닫기
            setTimeout(() => {
                onClose();
                setTriggerSave(false);
            }, 200); // 0.5초 지연
        }

        return result;
    };

    const handleClose = () => {
        if (hasChange) {
            setModalOpen(true); // 모달 열기
        } else {
            onClose();
        }
    };
    return (
        <SwModal
            open={open}
            size='xl'
            maxWidth='900px'
            onClose={handleClose}
            PaperProps={{
                sx: {
                    m: 0,
                    height: '100vh', // 화면 높이 전체 (100vh)
                    Maximize: '100vh',
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: 0, // 모서리 둥글지 않게
                },
            }}
            className='configuration inviteFormDrawer'
        >
            {/* 상단 타이틀 */}
            <Typography type='form'>수집 항목 기본 양식</Typography>
            <div className='context'>
                <InputTextBox
                    type='text'
                    id='test1'
                    placeholder='수집 항목 기본 양식'
                    label='양식 이름'
                    asterisk
                    validationText=''
                    value={localTitle}
                    vertical
                    disabled={!isNewForm}
                    onChange={(e) => setLocalTitle(e.target.value)}
                    onDelete={() => setLocalTitle('')}
                />
            </div>
            <div>
                <SnackbarProvider maxSnack={3}>
                    {/* 검색 조건 UI */}
                    <Box sx={{ display: display }}>
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
                    </Box>

                    {/* 데이터 그리드 UI */}
                    <Grid item xs={12} sx={{ pr: 2 }}>
                        <Grid01
                            setKey={setKey}
                            masterUI={masterUI}
                            tpcdParam={tpcdParam}
                            setMasterRetrieve={setMasterRetrieve}
                            gridData={gridData}
                            rowData={masterData}
                            treeCol={treeCol}
                            sheetName='mySheet1'
                            setDataParam={setDataParam}
                            dataSeInfo={data_se_info}
                            userData={{}} // 필요한 경우 데이터 추가
                            ognzData={{}} // 필요한 경우 데이터 추가
                            invtnId={id}
                            comboData={comboData}
                            initParam={dataParam.master}
                            formName={localTitle}
                            setHasChange={setHasChange}
                            handleSend={handleSend}
                            triggerSave={triggerSave}
                        />
                    </Grid>
                </SnackbarProvider>

                <div className='pageBtnArea'>
                    <Button
                        type='primary'
                        size='lg'
                        onClick={() => {
                            handleSend('INVTN_SAVE');
                        }}
                        className='btnWithIcon'
                    >
                        <IcoCheckFill fill='#FFFFFF' />
                        저장하기
                    </Button>
                </div>
            </div>

            <SwModal open={modalOpen} onClose={() => setModalOpen(false)} title='알림'>
                <div className='msg'>변경된 내용이 있습니다. 양식 저장을 눌러주세요.</div>
                <div className='actions'>
                    <Button
                        type='default'
                        size='lg'
                        className='btnWithIcon'
                        onClick={() => {
                            setModalOpen(false); // 내부 모달 닫기
                            onClose(); // 외부 모달 닫기
                        }}
                    >
                        취소
                    </Button>
                    <Button
                        type='primary'
                        size='lg'
                        className='btnWithIcon'
                        onClick={() => {
                            setModalOpen(false); // 내부 모달 닫기
                            handleSend(); // 저장 함수 호출
                        }}
                    >
                        확인(저장)
                    </Button>
                </div>
            </SwModal>
        </SwModal>
    );
}
