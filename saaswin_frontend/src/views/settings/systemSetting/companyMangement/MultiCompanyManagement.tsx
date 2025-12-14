import InputTextBox from '@/components/InputTextBox';
import Typography from 'components/Typography';
import { useEffect, useState } from 'react';
import { fetcherPostCommonGridData, fetcherPostData, fetcherPostGridData, fetcherPostScr } from 'utils/axios';
import { IcoCompany } from '@/assets/Icon';
import { Param } from 'types/component/SearchCondition';
import Loader from 'components/Loader';
import { Box, Grid } from '@mui/material';
import SearchCondition from 'components/SearchCondition';
import CrtrTable from 'components/CrtrTable';
import CrtrGrid from 'components/Grid/CrtrGrid';
import { useSearchParams } from 'next/navigation';

const MultiCompanyManagement = () => {
    interface MasterUIData {
        data_se_info: any[];
        grid_tit_info: any[];
        grid_btn_info: any;
        grid_info: any;
        table_btn_info: any;
        table_info: any;
    }

    const tpcdParam = 'SC';
    const [masterUI, setMasterUI] = useState<MasterUIData | null>(null);
    const [dataLoading, setDataLoading] = useState(true);
    const [dataParam, setDataParam] = useState<Param>({
        master: [], // 마스터그리드 데이터 파라미터
        detail: [], // 하단그리드 데이터 파라미터
    });
    const [masterRetrieve, setMasterRetrieve] = useState(false); // 조회버튼(true/false)
    const [initRetrieve, setInitRetrieve] = useState(true); // 조회버튼(true/false)
    const [masterData, setMasterData] = useState(null); // 마스터그리드 데이터
    const [tableData, setTableData] = useState(null); // 마스터그리드 데이터
    const gridData = masterUI?.grid_info;
    const searchParams = new URLSearchParams(useSearchParams());

    // 가장 상위 조회버튼
    const handleSubmit = () => {
        if (dataParam?.master) {
            setMasterRetrieve(true); // 데이터를 가져오도록 설정
        } else {
            console.log('조회할 데이터가 없습니다.');
        }
    };

    useEffect(() => {
        const item = {
            scr_no: 'SC',
        };
        fetcherPostScr({ item }) // fetcherPost 함수 사용
            .then((response) => {
                setMasterUI(response);
                setDataLoading(false);
            })
            .catch((error) => {
                console.error(error);
            });
        // ssw01(tpcdParam, setMasterUI, setDataLoading);
    }, []);

    useEffect(() => {
        if (masterRetrieve) {
            const sqlId = dataParam?.master[0]?.sqlId;
            const sqlKey = dataParam?.master[0]?.sql_key;
            const params = dataParam?.master[0]?.params[0];

            const item = [{ sqlId: sqlId, sql_key: sqlKey, params: [params] }];
            const item2 = [{ sqlId: sqlId, sql_key: 'hrs_corp_get', params: [{}] }];

            fetcherPostGridData(item)
                .then((response) => {
                    console.log('response', response);
                    setMasterData(response);
                })
                .catch((error) => {
                    console.error(error);
                })
                .finally(() => {
                    setDataLoading(false);
                    setMasterRetrieve(false);
                });

            fetcherPostData(item2)
                .then((response) => {
                    console.log('responsetable', response);
                    setTableData(response[0]?.ognz_info);
                })
                .catch((error) => {
                    console.error(error);
                })
                .finally(() => {
                    setDataLoading(false);
                    setMasterRetrieve(false);
                });
        }
    }, [masterRetrieve]);

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

    if (dataLoading) return <Loader />;

    return (
        <div className='multiCompanyManage'>
            <Grid item xs={12} sx={{ display: 'none' }}>
                <SearchCondition
                    masterUIinfo={masterUI}
                    tpcdParam={tpcdParam}
                    dataParam={dataParam}
                    searchParam={searchParams}
                    setDataParam={setDataParam}
                    handleSubmit={handleSubmit}
                    setDisplay={''}
                    key={''}
                />
            </Grid>
            <CrtrTable
                masterInfo={masterUI}
                tableData={tableData}
                comboData={''}
                setMasterRetrieve={setMasterRetrieve}
            />
            <CrtrGrid
                masterUI={masterUI}
                tpcdParam={tpcdParam}
                setMasterRetrieve={setMasterRetrieve}
                gridData={gridData}
                rowData={masterData}
                comboData={''}
                initParam={dataParam.master}
                param={{ groupData: 'hpr_group00004' }}
            />
        </div>
    );
};

export default MultiCompanyManagement;
