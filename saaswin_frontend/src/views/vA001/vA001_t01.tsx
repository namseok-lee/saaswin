'use client';

import { Grid } from '@mui/material';
import Loader from 'components/Loader';
import SearchCondition from 'components/SearchCondition';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Param } from 'types/component/SearchCondition';
import VA001 from './vA001';
interface MasterUIData {
    data_se_info: any[]; // 데이터 타입에 맞게 수정
    grid_tit_info: any[];
    grid_btn_info: any; // 데이터 타입에 맞게 수정
    grid_info: any; // 데이터 타입에 맞게 수정
    scr_url: string;
    scr_no: string;
}

export default function Ssw01_x({ TabmasterUI }: { TabmasterUI: MasterUIData[] }) {
    const tpcdParam = TabmasterUI?.scr_no;
    const [masterUI, setMasterUI] = useState<MasterUIData | null>(null);
    const [dataLoading, setDataLoading] = useState(true);
    const [dataParam, setDataParam] = useState<Param>({
        master: [], // 마스터그리드 데이터 파라미터
        detail: [], // 하단그리드 데이터 파라미터
    });
    const [masterRetrieve, setMasterRetrieve] = useState(false); // 조회버튼(true/false)
    const searchParams = new URLSearchParams(useSearchParams());
    const [display, setDisplay] = useState('block');
    const [selectedOgnz, setSelectedOgnz] = useState([]);
    // 가장 상위 조회버튼
    const handleSubmit = () => {
        if (dataParam?.master) {
            setMasterRetrieve(true); // 데이터를 가져오도록 설정
        } else {
            console.log('조회할 데이터가 없습니다.');
        }
    };
    // title, button, searchBox, 마스터 그리드헤더 조회
    useEffect(() => {
        if (TabmasterUI) {
            setMasterUI(TabmasterUI);
            setDataLoading(false);
        }
    }, [TabmasterUI]);

    // 마스터 그리드 데이터조회
    useEffect(() => {
        if (masterRetrieve) {
            const initData = dataParam.master[0].params[0].where[0]?.value.split(',') || [];
            setSelectedOgnz(initData);
            setMasterRetrieve(!masterRetrieve);
        }
    }, [masterRetrieve]);
    if (dataLoading) return <Loader />;
    return (
        <div>
            <Grid container spacing={0} sx={{ padding: 0 }}>
                <Grid item xs={12} sx={{ display: display, padding: 0 }}>
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
                {selectedOgnz.length > 0 && (
                    <Grid item xs={12} sx={{ display: display, padding: 0 }}>
                        <VA001 selectedOgnz={selectedOgnz} />
                    </Grid>
                )}
            </Grid>
        </div>
    );
}
