'use client';
import { Box, Button, Stack } from '@mui/material';
import Loader from 'components/Loader';
import Typography from 'components/Typography';
import AIChart from 'components/AIChart';
import Image from 'next/image';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell } from 'recharts';

import { fetcherPost, fetcherPostAIChart, fetcherPostData } from 'utils/axios';
interface Props {
    data: Record<string, any>;
    setData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
    setValidation: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}
const renderCustomizedInnerLabel = (props) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, index, value, name } = props;
    const RADIAN = Math.PI / 180;
    // 각 섹션의 중앙 위치 계산 (innerRadius와 outerRadius 사이)
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    // 섹션이 너무 작으면 값을 표시하지 않음
    if (percent < 0.05) {
        return null;
    }
    return (
        <text x={x} y={y} fill='white' textAnchor='middle' dominantBaseline='central' fontSize={12}>
            {/* {`${(percent * 100).toFixed(0)}%`} */}
            {value}
        </text>
    );
};
export default function EvlMonitoring({ data, setData, setValidation }: Props) {
    const procInfo = data?.proc_info;
    const [evltrInfo, setEvltrInfo] = useState([]);
    const [aiChartInfo, setAichartInfo] = useState('');
    const [dataLoading, setDataLoading] = useState(false);
    const [chartView, setChartView] = useState('rechart');
    const evlData = [
        {
            evltrInfo,
        },
    ];
    const COLORS = ['#FFD6D6', '#2E94EC', '#838383'];
    const handleAIChart = () => {
        const item = {
            title: '부서별 인원 수',
            labels: ['HR', '개발', '영업'],
            type: 'bar',
            values: [5, 12, 8],
        };
        setDataLoading(true);
        fetcherPostAIChart(item)
            .then((response) => {
                console.log(response);
                setAichartInfo(response);
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                setDataLoading(false);
            });
    };
    useEffect(() => {
        const item = [
            {
                sqlId: 'hpm_evl01',
                sql_key: 'hpm_evltr_get',
                params: [
                    {
                        evl_id: data?.evl_id,
                    },
                ],
            },
        ];
        fetcherPostData(item) // fetcherPost 함수 사용
            .then((response) => {
                const resData = response;
                const grouped = resData?.reduce((acc: Record<string, any[]>, cur: any) => {
                    const groupKey = cur.procs_cpst_cd;
                    if (groupKey) {
                        if (!acc[groupKey]) {
                            acc[groupKey] = [];
                        }
                        acc[groupKey].push(cur);
                    }
                    return acc;
                }, {});
                setEvltrInfo(grouped);
            })
            .catch((error) => {
                console.error(error);
            });
        setValidation((prev) => ({
            ...prev,
            validation: true,
            type: 'cm002-2',
        }));
    }, []);
    if (dataLoading) return <Loader />;
    return <Image src={'/img/evl/evlMonitoring.png'} alt='evlMonitoring' width={1000} height={1000} />;
    // return (
    //     <>
    //         <Button
    //             variant='contained'
    //             onClick={() => {
    //                 handleAIChart();
    //             }}
    //         >
    //             AI 차트 실행(rechart)
    //         </Button>
    //         {aiChartInfo && <AIChart svg={aiChartInfo} />}

    //         <Box
    //             display='flex'
    //             flexDirection='row'
    //             gap={1}
    //             sx={{
    //                 backgroundColor: '#F5F5F5',
    //                 borderRadius: 2,
    //                 p: 2,
    //             }}
    //         >
    //             <Box sx={{ display: 'flex', flexDirection: 'column' }}>
    //                 <Stack direction={'row'} spacing={1} alignItems='center'>
    //                     <div
    //                         style={{
    //                             width: '10px', // 고정 너비
    //                             height: '10px', // 고정 높이
    //                             background: '#FFD6D6', // CSS 변수 대신 직접 색상 지정
    //                             borderRadius: '50%', // 완전한 원형으로 수정
    //                         }}
    //                     />
    //                     <Typography type='section'>진행중</Typography>
    //                 </Stack>
    //                 <Stack direction={'row'} spacing={1} alignItems='center'>
    //                     <div
    //                         style={{
    //                             width: '10px', // 고정 너비
    //                             height: '10px', // 고정 높이
    //                             background: '#2E94EC', // CSS 변수 대신 직접 색상 지정
    //                             borderRadius: '50%', // 완전한 원형으로 수정
    //                         }}
    //                     />
    //                     <Typography type='section'>진행완료</Typography>
    //                 </Stack>
    //                 <Stack direction={'row'} spacing={1} alignItems='center'>
    //                     <div
    //                         style={{
    //                             width: '10px', // 고정 너비
    //                             height: '10px', // 고정 높이
    //                             background: '#838383', // CSS 변수 대신 직접 색상 지정
    //                             borderRadius: '50%', // 완전한 원형으로 수정
    //                         }}
    //                     />
    //                     <Typography type='section'>선행 완료 대기</Typography>
    //                 </Stack>
    //             </Box>
    //             {procInfo &&
    //                 procInfo.map((item, index) => {
    //                     return (
    //                         <Box
    //                             key={index}
    //                             sx={{
    //                                 display: 'flex',
    //                                 flexDirection: 'column',
    //                                 alignItems: 'center',
    //                                 // 음수 마진으로 간격 줄이기 (오른쪽 마진을 음수로)
    //                                 mr: index < procInfo.length - 1 ? -3 : 0,
    //                             }}
    //                         >
    //                             {/* width = cx*2 , height = cy*2 */}
    //                             <PieChart width={190} height={190}>
    //                                 <Pie
    //                                     data={evlData}
    //                                     cx={95}
    //                                     cy={95}
    //                                     innerRadius={40} // cx-50 권장
    //                                     outerRadius={70} // cy-20 권장
    //                                     dataKey='value'
    //                                     label={renderCustomizedInnerLabel}
    //                                     labelLine={false}
    //                                 >
    //                                     {evlData.map((entry, index) => (
    //                                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
    //                                     ))}
    //                                 </Pie>
    //                                 <svg>
    //                                     <text
    //                                         x={97} // Pie cx + 2 권장
    //                                         y={99} // Pie cy + 4 권장
    //                                         textAnchor='middle'
    //                                         dominantBaseline='middle'
    //                                         fill='#333333'
    //                                         fontSize={12}
    //                                         fontWeight='bold'
    //                                     >
    //                                         {item.com_cd_nm}
    //                                     </text>
    //                                 </svg>
    //                             </PieChart>
    //                         </Box>
    //                     );
    //                 })}
    //         </Box>
    //     </>
    // );
}
