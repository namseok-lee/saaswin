'use client';
import { fetcherPostChartSearch } from 'utils/esAxios/chartTest/axios';
// import { fetcherPostESRechart } from 'utils//axios';
import { useEffect, useState } from 'react';
import Loader from 'components/Loader';
import CommonLineChart from 'components/Chart/CommonLineChart';
import Typography from 'components/Typography';
import InfoModal from 'components/InfoModal';
import Button from 'components/Button';
import { IcoFavorite, IcoFavoriteOn, IcoSetting } from '@/assets/Icon';
import CommonPieChart from 'components/Chart/CommonPieChart';
import CommonAreaChart from 'components/Chart/CommonAreaChart';
import chartColor from 'themes/theme/chartColor';
import CommonBarChart from 'components/Chart/CommonBarChart';
import ChartSettingModal from './ChartSettingModal';
import BoxSelect from 'components/BoxSelect';
import { useTranslation } from 'react-i18next';
interface VA001Type {
    selectedOgnz: [];
}
export default function VA001({ selectedOgnz }: VA001Type) {
    const [chartInfo, setChartInfo] = useState([]);
    const [parsedChart, setParsedChart] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [favState, setFavState] = useState(true);
    const [colors, setColors] = useState<string[]>(chartColor());
    const [settingOpen, setSettingOpen] = useState(false);
    const handleFav = () => {
        setFavState(!favState);
    };
    // 다국어
    const { t } = useTranslation();
    // 설정 모달 열기
    const handleSettingOpen = () => {
        setSettingOpen(!settingOpen);
    };
    // 화면에 모달 띄우기
    const handleModal = () => {
        setIsModalOpen((prev) => !prev);
    };
    // 색상 변경
    const handleColorChange = (colors: string[]) => {
        setColors(colors);
    };
    const options = [
        { com_cd: 'line', com_cd_nm: '선형그래프' },
        { com_cd: 'bar', com_cd_nm: '막대그래프' },
        { com_cd: 'area', com_cd_nm: '면적그래프' },
        { com_cd: 'pie', com_cd_nm: '파이그래프' },
    ];

    const handleChartTypeChange = (id: string) => (e: any) => {
        const value = e.target.value;
        setParsedChart((prev) => prev.map((item) => (item.id === id ? { ...item, default_type: value } : item)));
    };
    useEffect(() => {
        const url = '/api/es/rechart/searchTestChart';
        const body = {
            // 차트 키를 입력하면 해당 차트만 조회 가능
            // chart key
            // - 재직자 수 -> user_count
            // - 계약 유형 -> ctrt_type
            // - 근속 일수 -> cnsvc
            // - 직위 분포 -> jbps_dstb
            // - 직책 분포 -> jbttl_dstb
            // - 직급 분포 -> jbgd_dstb
            // - 최종 학력 -> last_acbg
            // - 성별 -> gndr
            // - 연령 -> age
            // ex) params: [{chart_key:"user_count" }]
            params: [{}], // 빈값 -> 전체조회
        };
        setColors(chartColor());
        fetcherPostChartSearch(url, body)
            .then((response) => {
                const sortedData = response.sort((a, b) => Number(a.seq) - Number(b.seq));
                setChartInfo(sortedData);
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                setDataLoading(false);
            });
    }, []);
    useEffect(() => {
        if (!chartInfo || !selectedOgnz) return;

        const parsed = chartInfo.map((chartItem) => {
            const filteredOrgs = chartItem.data?.filter((orgItem) => selectedOgnz.includes(orgItem.ognz_no)) || [];

            const formattedData = filteredOrgs.map((orgItem) => {
                const row = { label: orgItem.ognz_nm };
                orgItem.data.forEach((entry) => {
                    row[entry.label] = entry.value;
                });
                return row;
            });

            return {
                ...chartItem, // ✅ chartItem의 나머지 모든 필드 포함 (id, title 등)
                data: formattedData, // ✅ 기존 data만 가공된 값으로 덮어쓰기
            };
        });
        setParsedChart(parsed);
    }, [chartInfo, selectedOgnz]);
    if (dataLoading) return <Loader />;
    return (
        <div className='contContainer'>
            {/* page header */}
            <div className='pageHeader'>
                <div
                    className='pageInfo'
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                    <Typography type='page' desc onClickDesc={handleModal}>
                        {t('인원 통계')}
                    </Typography>
                    <Button
                        onClick={() => {
                            handleSettingOpen();
                        }}
                    >
                        <IcoSetting />
                    </Button>
                    <InfoModal
                        title='평가관리'
                        // url="https://docs.google.com/document/d/e/2PACX-1vQvfxSoqEqQd6_CRF1aQufCUJYue2HpeMhWwTvGLgYIUrtudcrtf3nRLp8e_BlCLl-0HyfW0WuLCqIb/pub?embedded=true"
                        url='https://docs.google.com/document/d/18Qn9wrfJ7NQuLaW2UItsMkT1JN_Rjq31gDpsHWVqj_A/edit?usp=sharing#heading=h.w56nw9rlwsc'
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                    />
                </div>
            </div>
            <div className='visualization'>
                <ul className='visualiz-list'>
                    {parsedChart?.map((item, index) => (
                        <li className='item' key={index}>
                            <div className='title'>
                                <div className='text'>{item.title}</div>
                                {favState ? (
                                    <Button id='' onClick={handleFav}>
                                        <IcoFavorite fill='#C4C4C4' />
                                    </Button>
                                ) : (
                                    <Button id='' className='btnFavOn' onClick={handleFav}>
                                        <IcoFavoriteOn />
                                    </Button>
                                )}
                            </div>
                            <div
                                className='chart-setting'
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                            >
                                {item.description && <div className='stastics'>{item.description}</div>}
                                <BoxSelect
                                    id={item.id}
                                    label='보기'
                                    value={item.default_type}
                                    onChange={handleChartTypeChange(item.id)}
                                    options={options}
                                    vertical
                                />
                            </div>
                            {item.description_sub && <div className='subText'>{item.description_sub}</div>}
                            <div className='chart'>
                                {item.default_type === 'line' && (
                                    <CommonLineChart chartInfo={item.data} colors={colors} />
                                )}
                                {item.default_type === 'bar' && (
                                    <CommonBarChart chartInfo={item.data} colors={colors} />
                                )}
                                {item.default_type === 'area' && (
                                    <CommonAreaChart chartInfo={item.data} colors={colors} />
                                )}
                                {item.default_type === 'pie' && (
                                    <CommonPieChart chartInfo={item.data} colors={colors} />
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <ChartSettingModal
                settingOpen={settingOpen}
                handleSettingOpen={handleSettingOpen}
                handleColorChange={handleColorChange}
            />
        </div>
    );
}
