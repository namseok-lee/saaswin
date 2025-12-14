'use client';

import { Box, Tab } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { fetcherPostCommonData, fetcherPostScr } from 'utils/axios';
import Loader from 'components/Loader';
import Ssw01_crtr from 'views/ssw01/ssw01_crtr';
import { useTranslation } from 'react-i18next';
import SwTabPanel from '@/components/TabPanel';
import SwTabContext from '@/components/TabContext';
import SwTabList from '@/components/TabList';
import Typography from '@/components/Typography';
import InfoModal from '@/components/InfoModal';

export default function HrsInfoSetting({ tpcd }: { tpcd: string }) {
    interface TabData {
        data: any[]; // 데이터 타입에 맞게 수정
        tab_info: any[]; // 데이터 타입에 맞게 수정
    }

    interface MasterUIData {
        data_se_info: any[]; // 데이터 타입에 맞게 수정
        grid_tit_info: any[];
        grid_btn_info: any; // 데이터 타입에 맞게 수정
        grid_info: any; // 데이터 타입에 맞게 수정
    }

    interface TabInfoItem {
        data_se_info: any[]; // 데이터 타입에 맞게 수정
        grid_tit_info: any[];
        grid_btn_info: any; // 데이터 타입에 맞게 수정
        grid_info: any; // 데이터 타입에 맞게 수정
        scr_no: string;
        scr_url: string;
        scr_tit: string;
        tab_info: any[]; // tab_info의 text. 신규추가
    }

    const tpcdParam = tpcd;
    const [tabUI, setTabUI] = useState<TabData | null>(null);
    const [crtrData, setCrtrData] = useState<any>(null);
    const [crtrRetrieve, setCrtrRetrieve] = useState(false);
    const tab_info: TabInfoItem[] = tabUI?.tab_info || [];
    const title = tabUI?.scr_tit || '';
    const scr_no = tab_info[0]?.scr_no || '';
    // const scr_no = tab_info[0]?.tab_info.scr_no || '';
    const [value, setValue] = useState(scr_no); // 탭 종류 저장
    const [dataLoading, setDataLoading] = useState(true);
    const sortBySeqInfo: TabInfoItem[] = (tab_info || [])
        .slice()
        .sort((a: TabInfoItem, b: TabInfoItem) => Number(a.tab_info.seq) - Number(b.tab_info.seq));

    // 모달창 설정
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 다국어
    const { t } = useTranslation();

    // 탭 정보 조회
    useEffect(() => {
        const item = {
            scr_no: tpcdParam,
        };
        fetcherPostScr(item) // fetcherPost 함수 사용
            .then((response) => {
                setTabUI(response);
                setValue(response.tab_info[0].scr_no);
                setCrtrRetrieve(true);
                setDataLoading(false);
            })
            .catch((error) => {
                console.error(error);
            });
    }, [tpcdParam]);

    useEffect(() => {
        if (crtrRetrieve) {
            const sqlId = 0;
            const sqlKey = '';
            const params = [
                {
                    scr_no: 'SE',
                    where: [],
                },
            ];
            fetcherPostCommonData([{ sqlId: sqlId, sql_key: sqlKey, params: params }])
                .then((response) => {
                    setCrtrData(response);
                })
                .catch((error) => {
                    console.error(error);
                })
                .finally(() => {
                    setCrtrRetrieve(false);
                    setDataLoading(false);
                });
        }
    }, [crtrRetrieve]);

    const handleChangeTab = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };
    if (dataLoading) return <Loader />;

    // 화면 모달 띄우기
    const handleModal = (e: any) => {
        setIsModalOpen((prev) => !prev);
    };

    const renderComponent = (index: number, item: TabInfoItem) => {
        let procNm = '';
        const hpoInfo = crtrData?.[0]?.hpo_info;
        switch (item.scr_no) {
            // 조직유형
            case 'SYSHRS002':
                procNm = 'ognz_type';
                break;
            // 직무
            case 'SYSHRS003':
                procNm = 'duty';
                break;
            // 직책
            case 'SYSHRS004':
                procNm = 'jbttl';
                break;
            // 직위
            case 'SYSHRS005':
                procNm = 'jbps';
                break;
            // 직급
            case 'SYSHRS006':
                procNm = 'jbgd';
                break;
        }

        if (hpoInfo?.[procNm]) {
            return (
                <Tab
                    key={index + 1}
                    label={item.scr_tit === '' ? t(item.tab_info?.text) : t(item.scr_tit)}
                    value={item.scr_no}
                />
            );
        } else if (item.scr_no === 'SYSHRS001') {
            return (
                <Tab
                    key={index + 1}
                    label={item.scr_tit === '' ? t(item.tab_info?.text) : t(item.scr_tit)}
                    value={item.scr_no}
                />
            );
        }
        return null;
    };

    return (
        <div className='contContainer'>
            <div className='pageHeader'>
                <div className='pageInfo'>
                    <Typography type='page' desc onClickDesc={handleModal}>
                        {t(title)}
                    </Typography>
                    <InfoModal
                        title='평가관리'
                        // url="https://docs.google.com/document/d/e/2PACX-1vQvfxSoqEqQd6_CRF1aQufCUJYue2HpeMhWwTvGLgYIUrtudcrtf3nRLp8e_BlCLl-0HyfW0WuLCqIb/pub?embedded=true"
                        url='https://docs.google.com/document/d/18Qn9wrfJ7NQuLaW2UItsMkT1JN_Rjq31gDpsHWVqj_A/edit?usp=sharing#heading=h.w56nw9rlwsc'
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                    />
                </div>
            </div>
            <SwTabContext value={value}>
                <Box>
                    <SwTabList onChange={handleChangeTab} aria-label='lab API tabs example'>
                        {sortBySeqInfo.length > 0 &&
                            sortBySeqInfo?.map(
                                (item: TabInfoItem, index: number) => renderComponent(index, item)

                                // <Tab
                                //     key={index + 1}
                                //     label={item.scr_tit === '' ? t(item.tab_info?.text) : t(item.scr_tit)}
                                //     value={item.scr_no}
                                // />
                                // <Tab key={index + 1} label={item.data[0].scr_tit} value={item.data[0].scr_no} />
                            )}
                    </SwTabList>
                </Box>
                {sortBySeqInfo.length > 0 &&
                    sortBySeqInfo?.map((item: TabInfoItem, index: number) => (
                        <SwTabPanel key={index + 1} value={item.scr_no}>
                            <Ssw01_crtr TabmasterUI={item} setCrtrRetrieve={setCrtrRetrieve} crtrData={crtrData} />
                        </SwTabPanel>
                    ))}
            </SwTabContext>
        </div>
    );
}
