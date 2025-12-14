'use client';
import { Grid } from '@mui/material';
import '@nosferatu500/react-sortable-tree/style.css';
import EfsSettingFullDialog from 'components/FullDialog/eformsuite/EfsSettingFullDialog';
import Loader from 'components/Loader';
import SearchCondition from 'components/SearchCondition';
import Typography from 'components/Typography';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Param } from 'types/component/SearchCondition';
import { CardData } from 'types/component/eformsuite';
import { fetcherPostData, fetcherPostScr } from 'utils/axios';
import { IcoTemplateThumbDoc } from '@/assets/Icon';
import styles from '../../styles/pages/Template/page.module.scss';

interface MasterUIData {
    data_se_info: any[]; // 데이터 타입에 맞게 수정
    grid_tit_info: any[];
    grid_btn_info: any; // 데이터 타입에 맞게 수정
    grid_info: any; // 데이터 타입에 맞게 수정
    scr_url: string;
    scr_no: string;
}

export default function Efs_apply_Setting_List({ tpcd }: { tpcd: string }) {
    interface MasterUIData {
        data_se_info: any[]; // 데이터 타입에 맞게 수정
        grid_tit_info: any[];
        grid_btn_info: any; // 데이터 타입에 맞게 수정
        grid_info: any; // 데이터 타입에 맞게 수정
        scr_no: string;
    }

    const tpcdParam = tpcd;
    const [masterUI, setMasterUI] = useState<MasterUIData | null>(null);
    const [masterRetrieve, setMasterRetrieve] = useState(false); // 조회버튼(true/false)
    const [initRetrieve, setInitRetrieve] = useState(true); // 조회버튼(true/false)
    const [dataParam, setDataParam] = useState<Param>({
        master: [], // 마스터그리드 데이터 파라미터
        detail: [], // 하단그리드 데이터 파라미터
    });
    const [dataLoading, setDataLoading] = useState(true);
    const searchParams = new URLSearchParams(useSearchParams());

    const [settingListData, setSettingListData] = useState([]);
    const [settingModalData, setSettingModalData] = useState({});

    const observer = useRef<IntersectionObserver | null>(null);
    const [renderedData, setRenderedData] = useState<CardData[]>([]);

    const [itemsToShow, setItemsToShow] = useState(0);

    const lastElementRef = useRef<HTMLDivElement | null>(null);

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

    // 가장 상위 조회버튼
    const handleSubmit = () => {
        if (dataParam?.master) {
            setMasterRetrieve(true); // 데이터를 가져오도록 설정
            setItemsToShow(15); // 조회 버튼 클릭 시 처음에는 15개만 보이도록 초기화
        } else {
            console.log('조회할 데이터가 없습니다.');
        }
    };

    useEffect(() => {
        if (settingListData?.length > 0) {
            setItemsToShow(15); // 조회 후 처음에는 15개만 표시
            setRenderedData(settingListData?.slice(0, 15)); // 즉시 반영
        }
    }, [settingListData]);

    useEffect(() => {
        const item = {
            scr_no: tpcdParam,
        };

        fetcherPostScr(item)
            .then((response) => {
                setMasterUI(response);
                setDataLoading(false);
            })
            .catch((error) => {
                console.error(error);
            });
    }, [tpcdParam]);

    useEffect(() => {
        if (masterRetrieve) {
            const item = dataParam?.master;
            // 0022
            fetcherPostData(item)
                .then((response) => {
                    setSettingListData(response);
                    setRenderedData(response.slice(0, 10)); // 처음 5개만 렌더링
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }, [masterRetrieve]);

    useEffect(() => {
        setRenderedData(settingListData?.slice(0, itemsToShow));
    }, [itemsToShow, settingListData]);

    useEffect(() => {
        if (!lastElementRef.current || itemsToShow < 15) return; // 처음에는 Observer를 활성화하지 않음

        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && itemsToShow < settingModalData?.length) {
                    setItemsToShow((prev) => prev + 5); // 스크롤 시 5개씩 추가 로드
                }
            },
            {
                root: null,
                rootMargin: '100px',
                threshold: 1.0,
            }
        );

        observer.current.observe(lastElementRef.current);

        return () => observer.current?.disconnect();
    }, [itemsToShow, settingModalData]);

    useEffect(() => {
        setMasterRetrieve(false); // 이미 데이터를 받았으므로 submit를 false로 설정
    }, [settingModalData]);
    useEffect(() => {
        // 모달이 닫히고 재조회가 필요한 경우
        if (settingModalData.needRefresh === true && !settingModalData.open) {
            // 재조회 로직 실행
            handleSubmit();

            // needRefresh 초기화
            setSettingModalData((prev) => ({
                ...prev,
                needRefresh: false,
            }));
        }
    }, [settingModalData]);
    // 버튼 타입별 Handler 실행
    if (dataLoading) return <Loader />;

    // 템플릿 클릭 시 modal - 조회한 값을 넘김 (화면 바인딩 안되는현상 수정)
    const handleSettingClick = (setting: CardData) => {
        setSettingModalData((prev) => {
            return {
                ...prev,
                setting_info: setting,
                open: true,
                needRefresh: false, // 재조회 필요 여부 초기화
            };
        });
    };

    return (
        <div className='contContainer'>
            <Grid
                item
                xs={12}
                style={{
                    position: 'sticky',
                    top: 0,
                    backgroundColor: '#fff',
                    zIndex: 9,
                }}
            >
                <SearchCondition
                    masterUIinfo={masterUI}
                    tpcdParam={tpcdParam}
                    dataParam={dataParam}
                    searchParam={searchParams}
                    setDataParam={setDataParam}
                    handleSubmit={handleSubmit}
                />
            </Grid>
            <Grid item xs={12} sx={{ paddingTop: '0px' }}>
                <Typography type='form' title='신청서 리스트'>
                    신청서 리스트
                </Typography>
                <ul className={`${styles.infiniteScroller} ${styles.noThumbType}`}>
                    {renderedData?.map((setting, index) => (
                        <li
                            key={index}
                            className={`${styles.card} ${styles.on} `}
                            onClick={() => handleSettingClick(setting)}
                        >
                            <div className={styles.title}>
                                {setting.doc_knd_cd_nm}
                                <div className={styles.insait}>insa-IT 제공</div>
                                <div className={styles.docType}>
                                    <IcoTemplateThumbDoc fill='#666' />
                                </div>
                                {/* <div className="ico"><IcoTemplateThumbContract/></div> */}
                                {/* <div className="ico"><IcoTemplateThumbNotice/></div> */}
                            </div>
                        </li>
                    ))}
                </ul>
            </Grid>
            <div ref={lastElementRef} style={{ height: '1px' }}>
                &nbsp;
            </div>

            <EfsSettingFullDialog params={settingModalData} setParams={setSettingModalData} tpcdParam={tpcdParam} />
        </div>
    );
}
