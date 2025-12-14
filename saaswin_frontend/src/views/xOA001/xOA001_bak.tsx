'use client';

import { Box, Button, Grid, Stack, Typography } from '@mui/material';
import HrInfoCard from 'components/HrInfo/HrInfoCard';
import { useEffect, useState } from 'react';
import { fetcherPost } from 'utils/axios';
import Loader from 'components/Loader';
import HrInfoTable from 'components/HrInfo/HrInfoTable';
import { useAuthStore } from 'utils/store/auth';
import QuickMenu from 'components/QuickMenu';

export default function XOA001({ tpcdParam }: { tpcdParam: string }) {
    const [scrData, setScrData] = useState({});
    const [data, setData] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);
    const userNo = useAuthStore((state) => state.userNo);
    const tableInfo = scrData?.table_info?.sort((a, b) => Number(a.seq) - Number(b.seq));
    const quickMenuInfo = scrData?.mvmn_menu_info?.sort((a, b) => Number(a.seq) - Number(b.seq));
    const sortedData = scrData?.card_info?.sort((a, b) => Number(a.seq) - Number(b.seq));
    useEffect(() => {
        const user_no = userNo; // 로그인 만들어지면 수정 필요
        const scrUrl = 'api/ssw/01';
        const scrItem = {
            user_no: user_no,
            scr_no: tpcdParam,
            rprs_ognz_no: 'WIN',
        };
        const dataUrl = 'api/ssw/002';
        const dataParamItem = [
            {
                sqlId: '32',
                params: [{ user_no: user_no }],
            },
        ];
        if (userNo) {
            setDataLoading(true); // 데이터 로딩 시작
            Promise.all([fetcherPost([scrUrl, scrItem]), fetcherPost([dataUrl, dataParamItem])])
                .then(([scrResponse, dataResponse]) => {
                    setScrData(scrResponse);
                    setData(dataResponse[0].data[0]);
                })
                .catch((error) => {
                    console.error(error);
                })
                .finally(() => {
                    setDataLoading(false); // 모든 작업 완료 후 로딩 상태 해제
                });
        }
    }, [userNo]);
    if (dataLoading) return <Loader />;
    return (
        <Box
            sx={{
                ml: '-40px', // 좌측 40px 패딩 상쇄
                mr: '-40px', // 좌측 40px 패딩 상쇄
                height: '100vh',
                display: 'flex', // 하위 Box를 수평 정렬
                border: '1px solid #ccc',
            }}
        >
            <HrInfoTable tableInfo={tableInfo} data={data} />
            <Box
                sx={{
                    p: 2,
                    pl: 4,
                    flexGrow: 1,
                    height: '100%',
                    overflowY: 'auto',
                    maxHeight: '100vh',
                    backgroundColor: 'rgba(232, 241, 244, 0.4)',
                }}
            >
                <Grid container spacing={2}>
                    <Grid item xs={quickMenuInfo ? 10.3 : 12}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sx={{ alignSelf: 'flex-start', pt: 1 }}>
                                <Stack direction='row' spacing={2} sx={{ alignItems: 'center' }}>
                                    <Typography variant='h4'>{data?.bsc_info[0]?.flnm} 님의 인사정보 요약</Typography>
                                    <Button
                                        variant='outlined'
                                        size='small'
                                        sx={{
                                            backgroundColor: '#fff',
                                            color: '#424242',
                                            borderColor: '#BDBDBD',
                                            '&:hover': {
                                                backgroundColor: '#eeeeee',
                                            },
                                        }}
                                    >
                                        인사기록카드 보기
                                    </Button>
                                </Stack>
                            </Grid>
                            {sortedData.map((item, index) => (
                                <Grid item xs={4} key={index} sx={{ pb: 2, pr: 2 }}>
                                    <HrInfoCard item={item} data={data} />
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                    {quickMenuInfo && (
                        <Grid
                            item
                            xs={1.7}
                            sx={{
                                pr: '16px',
                                pb: 1,
                                maxWidth: '50px',
                                flexBasis: 'auto', // 추가: 크기를 내용에 따라 조정
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                                justifyContent: 'center',
                                alignItems: 'center',
                                position: 'sticky', // 스크롤 시 고정
                                top: '32px', // 상단 여백 설정 (원하는 값으로 조정)
                                zIndex: 1,
                            }}
                        >
                            <QuickMenu tpcdParam={tpcdParam} quickMenuInfo={quickMenuInfo} />
                        </Grid>
                    )}
                </Grid>
            </Box>
        </Box>
    );
}
