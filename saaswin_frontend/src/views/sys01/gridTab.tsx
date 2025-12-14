'use client';

import { Box, Tab } from '@mui/material';
import React, { useEffect, useState } from 'react';
import Ssw01_t from 'views/tab/ssw01_t';
import ObjManage_t from 'views/tab/obj_manage_t';
import ObjManage2_t from 'views/tab/obj_manage2_t';
import { fetcherPostScr } from 'utils/axios';
import Loader from 'components/Loader';
import InfoModal from 'components/InfoModal';
import Ssw01_tb from 'views/table/ssw01_tb';
import Ssw01_gt from 'views/tab/ssw01_gt';
import Efs_Template_List from 'views/efs_template_list/efs_template_list';
import Typography from 'components/Typography';
import SwTabContext from 'components/TabContext';
import SwTabPanel from 'components/TabPanel';
import SwTabList from 'components/TabList';
import Ssw01_crtr from 'views/ssw01/ssw01_crtr';
import VA001_t01 from 'views/vA001/vA001_t01';
import Ssw01t_tg from 'views/tab/ssw01t_tg';
import { useTranslation } from 'react-i18next';

export default function GridTab({ tpcd }: { tpcd: string }) {
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
                // setTabUI(response.data[0]);
                // setValue(response.data[0].tab_info[0].tab_info.scr_no);
                setTabUI(response);
                setValue(response.tab_info[0].scr_no);

                setDataLoading(false);
            })
            .catch((error) => {
                console.error(error);
            });
    }, [tpcdParam]);

    const handleChangeTab = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };
    // const tpcd = value.split('/')[2];
    const renderComponent = (scrUrl: string, masterUI: TabInfoItem) => {
        // 화면타입 늘어날때마다 추가 필요
        switch (scrUrl) {
            case '/ssw01_x/':
                return <Ssw01_t TabmasterUI={masterUI} />;
            case '/ssw01_tb/':
                return <Ssw01_tb TabmasterUI={masterUI} />;
            case '/ssw01_gt/':
                return <Ssw01_gt TabmasterUI={masterUI} />;
            case '/ssw01_tg/':
                return <Ssw01t_tg TabmasterUI={masterUI} />;
            case '/ssw01_crtr/':
                return <Ssw01_crtr TabmasterUI={masterUI} />;
            case '/efs_template_list/':
                return <Efs_Template_List TabmasterUI={masterUI} />;
            case '/vA001_t/':
                return <Ssw01_t TabmasterUI={masterUI} />;
            case '/sys/obj_manage/':
                return <ObjManage_t TabmasterUI={masterUI} />;
            case '/sys/obj_manage2/':
                return <ObjManage2_t TabmasterUI={masterUI} />;
            case '/vA001_t01/':
                return <VA001_t01 TabmasterUI={masterUI} />;
            default:
                return <Ssw01_t TabmasterUI={masterUI} />;
        }
    };
    if (dataLoading) return <Loader />;

    // 화면 모달 띄우기
    const handleModal = (e: any) => {
        setIsModalOpen((prev) => !prev);
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
                            sortBySeqInfo?.map((item: TabInfoItem, index: number) => (
                                <Tab
                                    key={index + 1}
                                    label={item.scr_tit === '' ? t(item.tab_info?.text) : t(item.scr_tit)}
                                    value={item.scr_no}
                                />
                                // <Tab key={index + 1} label={item.data[0].scr_tit} value={item.data[0].scr_no} />
                            ))}
                    </SwTabList>
                </Box>
                {sortBySeqInfo.length > 0 &&
                    sortBySeqInfo?.map((item: TabInfoItem, index: number) => (
                        <SwTabPanel key={index + 1} value={item.scr_no}>
                            {renderComponent(item.scr_url, item)}

                            {/*  <TabPanel key={index + 1} value={item.data[0].scr_no}>
                                 {renderComponent(item.data[0].scr_url, item.data[0])} */}
                        </SwTabPanel>
                    ))}
            </SwTabContext>
        </div>
    );
}
