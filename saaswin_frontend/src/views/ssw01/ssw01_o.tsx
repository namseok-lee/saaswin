'use client';

import { CloseCircleTwoTone } from '@ant-design/icons';
import {
    AppBar,
    Box,
    CircularProgress,
    Dialog,
    DialogContent,
    Grid,
    IconButton,
    Stack,
    Toolbar,
    Typography,
} from '@mui/material';
import Card from 'components/Card';
import Loader from 'components/Loader';
import SearchCondition from 'components/SearchCondition';
import styles from '../../styles/pages/Demo/page.module.scss';
import { useSearchParams } from 'next/navigation';
import { SnackbarProvider } from 'notistack';
import { useEffect, useState } from 'react';
import { fetcherPost, fetcherPostScr } from 'utils/axios';
import OrgChartPage from 'views/sys/obj_manage/OrgChartPage';
import { IcoCardTitle } from '@/assets/Icon';
import Empty from 'components/Empty';
import Button from 'components/Button';
import { OrgChartMasterData } from 'views/sys/obj_manage/types';
import OrgChartDialog from './components/OrgChartDialog';

export default function Ssw01_o({ tpcd }: { tpcd: string }) {
    interface MasterUIData {
        data_se_info: any[]; // 데이터 타입에 맞게 수정
        grid_tit_info: any[];
        grid_btn_info: any; // 데이터 타입에 맞게 수정
        grid_info: any; // 데이터 타입에 맞게 수정
    }

    const [key, setKey] = useState(0); // 서치박스 상태 변경용
    const tpcdParam = tpcd;
    const [masterUI, setMasterUI] = useState<MasterUIData | null>(null);
    const [dataLoading, setDataLoading] = useState(true);
    const [dataParam, setDataParam] = useState<any>({
        master: [], // 마스터그리드 데이터 파라미터
        detail: [], // 하단그리드 데이터 파라미터
    });

    const [masterRetrieve, setMasterRetrieve] = useState(false); // 조회버튼(true/false)
    const [detailRetrieve, setDetailRetrieve] = useState(false); // 그리드row클릭(true/false)
    const [initRetrieve, setInitRetrieve] = useState(true); // 조회버튼(true/false)
    const [masterData, setMasterData] = useState<OrgChartMasterData[] | null>(null); // 마스터그리드 데이터
    const [detailData, setDetailData] = useState(null); // 디테일그리드 데이터
    const [display, setDisplay] = useState('block');
    const searchParams = new URLSearchParams(useSearchParams());
    const [isLoading, setIsLoading] = useState(true);
    const handleSubmit = () => {
        console.log('handleSubmit', dataParam);
        if (dataParam?.master) {
            setMasterRetrieve(true); // 데이터를 가져오도록 설정
            setKey((prevKey) => prevKey + 1); // OrgChartPage를 다시 그리기 위해 key 증가
        } else {
            console.log('조회할 데이터가 없습니다.');
        }
    };

    const rprs_ognz_no = ''; // 로그인 만들어지면 수정 필요

    const [open, setOpen] = useState(false);

    const handleOpenDialog = () => {
        setOpen(true);
    };

    useEffect(() => {
        console.log('ssw01_o.tsx Mounted');
    }, []);

    const handleCloseDialog = () => {
        setOpen(false);
        // 대화상자를 닫을 수 없도록 의도적으로 비워둠
        return;
    };

    // title, button, searchBox, 마스터 그리드헤더 조회
    useEffect(() => {
        const item = {
            scr_no: tpcdParam,
        };

        fetcherPostScr(item) // fetcherPost 함수 사용
            .then((response) => {
                setMasterUI(response);
                setDataLoading(false);
            })
            .catch((error) => {
                console.error(error);
            });
    }, [tpcdParam]);

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
                            />
                        </Grid>
                        <Grid container>
                            <Grid item xs={12}>
                                <div style={{ position: 'relative' }}>
                                    <OrgChartPage
                                        dataPram={dataParam}
                                        showInspector={true}
                                        editable={false}
                                        setIsLoading={setIsLoading}
                                        isLoading={isLoading}
                                        searchParams={dataParam?.master[0]?.params[0]}
                                        open={open}
                                        onOpen={handleOpenDialog}
                                        onClose={handleCloseDialog}
                                    />
                                </div>
                            </Grid>
                        </Grid>
                    </Grid>
                </SnackbarProvider>
            </Grid>
        </Box>
    );
}
