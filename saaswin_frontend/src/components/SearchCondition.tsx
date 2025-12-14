'use client';
import { Accordion, AccordionDetails, AccordionSummary, Box, Chip } from '@mui/material';
import { useEffect, useState } from 'react';
import '../styles/component/search.scss';
import { detailOptionsProps, searchDataProps, searchOption, sendDataItem } from '../types/component/SearchCondition';
import './styles.css';

import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { useTranslation } from 'react-i18next';
import { IcoArrow, IcoCol } from '@/assets/Icon';
import InfoModal from './InfoModal';
import OgnzSelect from './OgnzSelect';
import CheckComponent from './SearchCondition/CheckComponent';
import ComboAddComponent from './SearchCondition/ComboAddComponent';
import ComboComponent from './SearchCondition/ComboComponent';
import DateComComponent from './SearchCondition/DateComComponent';
import DateComponent from './SearchCondition/DateComponent';
import DateComSlryComponent from './SearchCondition/DateComSlryComponent';
import DateFromToComponent from './SearchCondition/DateFromToComponent';
import TextComponent from './SearchCondition/TextComponent';
import Typography from './Typography';
import UserSelect from './UserSelect';
import Button from './Button';

dayjs.locale('ko');
interface RetrieveSqlItem {
    sql: string;
    sqlId: string;
    text: string;
    type: string;
}
export default function SearchCondition({
    masterUIinfo,
    tpcdParam,
    searchParam,
    setDataParam,
    handleSubmit,
    setDisplay,
}: searchDataProps) {
    const searchData = masterUIinfo?.srch_info || [];
    const customButton = masterUIinfo?.srch_btn_info || [];
    const tab_info = masterUIinfo?.tab_info || [];
    const title = masterUIinfo?.scr_tit || [];
    const scr_no = masterUIinfo?.scr_no || '';
    const retrieveSqlId = customButton?.find((item: RetrieveSqlItem) => item.type === 'SEARCH')?.sqlId;
    const retrieveSqlKey = customButton?.find((item: RetrieveSqlItem) => item.type === 'SEARCH')?.sqlKey;
    const [detailOptions, setDetailOptions] = useState<detailOptionsProps>({
        items: [],
    });
    const [sendData, setSendData] = useState<sendDataItem>({});
    const [summaryData, setSummaryData] = useState<sendDataItem>([]);
    const [searchOpen, setSearchOpen] = useState(true);

    // 컴포넌트 초기화 상태 관리
    const [pendingComponents, setPendingComponents] = useState(new Set());
    const [allComponentsReady, setAllComponentsReady] = useState(false);

    // 컴포넌트 렌더링 완료 후 자동 조회 실행 여부
    const [shouldAutoSearch, setShouldAutoSearch] = useState(false);
    const [initialDataSet, setInitialDataSet] = useState(false);
    // SEARCH 버튼과 initClick 확인
    const searchButton = customButton?.find((item: any) => item.type === 'SEARCH');
    const hasInitClick = searchButton?.initClick === true;
    // 모든 검색 조건이 visible: false인지 확인
    const allInvisible = searchData.length > 0 && searchData.every((item) => item.visible === false);
    // 검색 조건이 모두 보이지 않고, initClick이 true인 경우 검색 조건만 숨김
    const shouldHideSearchBox = allInvisible && hasInitClick;

    // 컴포넌트 초기화 완료 추적 함수
    const handleComponentReady = (componentId) => {
        setPendingComponents((prev) => {
            const newSet = new Set(prev);
            newSet.delete(componentId);
            return newSet;
        });
    };

    // 다국어
    const { t } = useTranslation();

    const handleOpen = () => {
        setSearchOpen(!searchOpen);
    };

    // 서치 박스 chip 형태로 보이는 조건
    const searchItem = Object.entries(summaryData)
        .filter(([key, value]) => value !== null && value !== undefined && value !== '' && value.length > 0)
        .map(([key, value]) => ({ key, value }));

    const handleDelete = (id: string): void => {
        handleChange(id, '', null, null);
    };

    const handleChange = (id: string, value: string, type: string | null, summaryValue: string | null) => {
        setSendData((prev) => {
            if (type === 'CHECK') {
                if (value) {
                    return {
                        ...prev,
                        [id]: 'Y',
                    };
                } else if (!value) {
                    return {
                        ...prev,
                        [id]: 'N',
                    };
                }
            } else {
                // id가 'baseStartYear' 또는 'baseEndYear'일 때 처리
                return {
                    ...prev,
                    [id]: value,
                };
            }
            return prev; // typescript error 발생하지 않기위해서 임의로 넣음
        });
        setSummaryData((prev) => {
            if (type === 'CHECK') {
                if (summaryValue) {
                    return {
                        ...prev,
                        [id]: 'Y',
                    };
                } else if (!summaryValue) {
                    return {
                        ...prev,
                        [id]: 'N',
                    };
                }
            } else {
                // id가 'baseStartYear' 또는 'baseEndYear'일 때 처리
                return {
                    ...prev,
                    [id]: summaryValue,
                };
            }
            return prev; // typescript error 발생하지 않기위해서 임의로 넣음
        });
    };

    // 모달창 설정
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 초기화 시 컴포넌트 목록 설정
    useEffect(() => {
        if (searchData && searchData.length > 0) {
            const comboComponentIds = searchData
                .filter((item) => item.type === 'COMBO' && item.visible !== false)
                .map((item) => item.id);

            if (comboComponentIds.length > 0) {
                setPendingComponents(new Set(comboComponentIds));
                setAllComponentsReady(false);
            } else {
                // 콤보 컴포넌트가 없으면 바로 준비 완료 상태로 설정
                setAllComponentsReady(true);
            }
        }
    }, [searchData]);

    // 모든 컴포넌트가 준비되었는지 확인
    useEffect(() => {
        if (pendingComponents.size === 0 && initialDataSet) {
            setAllComponentsReady(true);
        }
    }, [pendingComponents, initialDataSet]);

    // 컴포넌트 마운트 시 자동 조회 상태 설정
    useEffect(() => {
        if (hasInitClick) {
            setShouldAutoSearch(true);
        }
    }, [hasInitClick]);

    // 데이터와 초기값이 준비된 후 자동 조회 실행
    useEffect(() => {
        if (shouldAutoSearch && allComponentsReady && initialDataSet) {
            // 중복 실행 방지
            setShouldAutoSearch(false);
            // 실제 조회 실행
            setTimeout(() => {
                onSubmit();
            }, 100); // 약간의 지연을 줘서 마지막 상태 업데이트가 반영되도록 함
        }
    }, [shouldAutoSearch, allComponentsReady, initialDataSet]);

    // 초기 데이터 설정을 추적
    useEffect(() => {
        if (Object.keys(sendData).length > 0) {
            setInitialDataSet(true);
        }
    }, [sendData]);

    useEffect(() => {
        const detailOptionsList: detailOptionsProps = { items: [] };
        let visibleCount = 0;
        if (searchData.length > 0) {
            // 기본 값 있을 경우 추가
            const initialSendDataForSql = searchData.reduce((acc: { [key: string]: string | null }, item) => {
                const visible = item.visible ?? true;
                const initValue = searchParam.get(item.id);
                if (item.type === 'FROM_TO_DATE') {
                    if (item.default === null) {
                        const fromName = item.id;
                        const toName = item.id + '_end';
                        acc[fromName] = null;
                        acc[toName] = null;
                    } else if (item.default === 'BEFORE_1Y') {
                        const fromName = item.id;
                        const toName = item.id + '_end';
                        // regi_ymd는 삭제하고 대신 from_regi_ymd와 to_regi_ymd를 추가
                        // -> 시작일필드 bgng만 넣어주고 to는 _end 붙임
                        acc[fromName] = dayjs().add(-1, 'year').format('YYYYMMDD'); // 현재 날짜 - 1년
                        acc[toName] = dayjs().format('YYYYMMDD'); // 현재 날짜
                    } else {
                        const fromName = item.id;
                        const toName = item.id + '_end';
                        // regi_ymd는 삭제하고 대신 from_regi_ymd와 to_regi_ymd를 추가
                        // -> 시작일필드 bgng만 넣어주고 to는 _end 붙임
                        acc[fromName] = dayjs().format('YYYYMMDD'); // 현재 날짜
                        acc[toName] = dayjs().add(1, 'year').format('YYYYMMDD'); // 현재 날짜 + 1년
                    }
                } else if (item.type === 'DATE' && item.default === 'curr') {
                    acc[item.id] = dayjs().format('YYYYMMDD'); // 현재 날짜
                } else if (item.id === 'std_ymd') {
                    // 기준일자 1개인 경우 추가
                    acc['std_ymd'] = dayjs().format('YYYYMMDD'); // 현재 날짜
                } else if (item.type === 'CHECK') {
                    acc[item.id] = item.default;
                } else if (item.id === 'dept' || item.id === 'emp') {
                    acc[item.id] = item.default || [];
                } else if (item.type === 'DATE_SLRY') {
                    acc[item.id.split('||')[0]] = item.default === 'curr' ? dayjs().format('YYYYMM') : '';
                    acc[item.id.split('||')[1]] = '';
                } else if (item.type === 'COMBO') {
                    if (item.default !== 'all') {
                        // acc[item.id] = '';
                        acc[item.id] = item.default;
                    } else if (item.default === 'all') {
                        acc[item.id] = '';
                    }
                    // if (initValue) {
                    //     acc[item.id] = initValue;
                    // }
                } else if (item.type === 'COMBO_MULTI') {
                    if (item.default !== 'all') {
                        // acc[item.id] = '';
                        acc[item.id] = item.default;
                    } else if (item.default === 'all') {
                        acc[item.id] = '';
                    }
                    // if (initValue) {
                    //     acc[item.id] = initValue;
                    // }
                } else {
                    // 다른 필드들은 그대로 추가
                    acc[item.id] =
                        item.default === 'CURRENT_YEAR' ? new Date().getFullYear().toString() : item.default || '';
                }
                if (item.type === 'COM_POPUP_DEPT_UNDER_ORG') {
                    const so: searchOption = {
                        id: item.id,
                        checkbox_id: 'under_org_' + item.id,
                        type: item.type,
                        text: '하위조직포함',
                        visible: item.visible,
                    };
                    detailOptionsList.items.push(so);
                }
                if (!visible) {
                    visibleCount++;
                }
                if (initValue) {
                    acc[item.id] = initValue;
                }
                return acc;
            }, {});

            setSendData(initialSendDataForSql);
            setSummaryData(initialSendDataForSql);
            setDetailOptions(detailOptionsList);
        }

        if (searchData.length === visibleCount && typeof setDisplay === 'function') {
            setDisplay('none');
        }
    }, [retrieveSqlId, searchData]);

    useEffect(() => {
        // 공통조회의 경우는 데이터를 다르게 만든다
        // searchData의 id와 sendData의 key가 같은것을 찾는다.
        // type이 FROM_TO_DATE 인 것은 sendData의 key가  id + '_to' 가 붙은것은 key명을 bgng를 end로 변경하여 추가로 넣어준다.
        const mappedItems: Array<{ fdname: string; value: string | null | undefined; condition: string }> = [];

        // 매번 새로운 조건으로 초기화 - 중복 방지를 위한 fdname 추적
        const addedFdnames = new Set<string>();

        searchData.forEach((item) => {
            let fdname = item.id;
            let value = sendData[item.id]; // 기본값
            let condition = '';

            if (item.type === 'DATE_SLRY') {
                fdname = item.id.split('||')[1];
                value = sendData[fdname];
                condition = 'equals';

                const fdname2 = item.id.split('||')[2];
                const param2 = {
                    fdname: fdname2,
                    value: sendData[fdname2],
                    condition: '', // <=
                };
                if (
                    param2.value !== undefined &&
                    param2.value !== null &&
                    param2.value !== '' &&
                    !addedFdnames.has(fdname2)
                ) {
                    mappedItems.push(param2);
                    addedFdnames.add(fdname2);
                }
            }

            if (item.type === 'TEXT') {
                condition = 'like';
            }
            if (item.type === 'FROM_TO_DATE') {
                // bgng가 있다면 end도 존재할것이기에 end로 넣어주고
                // bgng가 아니라면 동일한 id로 condition만 다르게해서 넣어준다
                const fdname2 = fdname.replace('bgng', 'end');
                const param2 = {
                    fdname: fdname2,
                    value: sendData[item.id + '_end'],
                    condition: 'less than to equal', // <=
                };
                if (
                    param2.value !== undefined &&
                    param2.value !== null &&
                    param2.value !== '' &&
                    !addedFdnames.has(fdname2)
                ) {
                    mappedItems.push(param2);
                    addedFdnames.add(fdname2);
                }

                condition = 'more than to equal'; // >=
            }
            if (item.type === 'COMBO' || item.type === 'COM_POPUP_EMP') {
                condition = 'in';
            }

            //기준일이면 bgng_ymd , end_ymd 로 2개 넣기기
            if (fdname === 'std_ymd') {
                const param1 = {
                    fdname: 'bgng_ymd',
                    value: value,
                    condition: 'less than to equal', // >=
                };
                const param2 = {
                    fdname: 'end_ymd',
                    value: value,
                    condition: 'more than to equal', // <=
                };

                if (!addedFdnames.has('bgng_ymd')) {
                    mappedItems.push(param1);
                    addedFdnames.add('bgng_ymd');
                }

                if (!addedFdnames.has('end_ymd')) {
                    mappedItems.push(param2);
                    addedFdnames.add('end_ymd');
                }
            }

            // 값이 있을때만 넣는다
            if (
                value !== undefined &&
                value !== null &&
                value !== '' &&
                fdname !== 'std_ymd' &&
                !addedFdnames.has(fdname)
            ) {
                const param = {
                    fdname: fdname,
                    value: value,
                    condition: condition,
                };
                mappedItems.push(param);
                addedFdnames.add(fdname);
            }
        });

        // SQL 조회 데이터 구조
        const finalDataForSql = {
            master: [
                {
                    sqlId: retrieveSqlId || '',
                    sql_key: retrieveSqlKey || '',
                    params: [{ ...sendData }], // sendData의 현재 상태를 params에 포함
                },
            ],
            detail: [
                {
                    scr_no: scr_no,
                    scr_type_cd: scr_no,
                    companyCd: '',
                    objectId: '',
                },
            ],
        };

        // 공통 조회 데이터 구조 - 항상 매핑된 아이템만 포함
        const finalDataForCommon = {
            master: [
                {
                    sqlId: 0,
                    params: [
                        {
                            user_no: '',
                            scr_no: tpcdParam,
                            where: mappedItems,
                        },
                    ],
                },
            ],
            detail: [
                {
                    scr_itg_no: tpcdParam,
                    scr_type_cd: tpcdParam,
                    scr_no: tpcdParam,
                    companyCd: '',
                    objectId: '',
                },
            ],
        };

        // SQL ID에 따라 적절한 데이터 설정
        if (retrieveSqlId === undefined || retrieveSqlId === null || retrieveSqlId === '0' || retrieveSqlId === 0) {
            setDataParam(finalDataForCommon);
        } else {
            setDataParam(finalDataForSql);
        }
    }, [sendData, retrieveSqlId, setDataParam, tpcdParam]);

    // 화면에 모달 띄우기
    const handleModal = (e: any) => {
        setIsModalOpen((prev) => !prev);
    };

    // 조회 버튼 클릭 시 처리하는 로직 (handleSubmit 함수를 직접 감싸서 처리)
    const onSubmit = () => {
        // 조회 버튼 클릭 시 원래 handleSubmit 함수 호출 전에
        // initialData를 다시 계산하여 조건을 초기화한다
        const mappedItems: Array<{ fdname: string; value: string | null | undefined; condition: string }> = [];
        const addedFdnames = new Set<string>();
        searchData.forEach((item) => {
            let fdname = item.id;
            let value = sendData[item.id];
            let condition = '';

            if (item.type === 'DATE_SLRY') {
                fdname = item.id.split('||')[1];
                value = sendData[fdname];
                condition = 'equals';

                const fdname2 = item.id.split('||')[2];
                const param2 = {
                    fdname: fdname2,
                    value: sendData[fdname2],
                    condition: '',
                };
                if (
                    param2.value !== undefined &&
                    param2.value !== null &&
                    param2.value !== '' &&
                    !addedFdnames.has(fdname2)
                ) {
                    mappedItems.push(param2);
                    addedFdnames.add(fdname2);
                }
            }

            if (item.type === 'TEXT') {
                condition = 'like';
            }
            if (item.type === 'FROM_TO_DATE') {
                const fdname2 = fdname.replace('bgng', 'end');
                const param2 = {
                    fdname: fdname2,
                    value: sendData[item.id + '_end'],
                    condition: 'less than to equal',
                };
                if (
                    param2.value !== undefined &&
                    param2.value !== null &&
                    param2.value !== '' &&
                    !addedFdnames.has(fdname2)
                ) {
                    mappedItems.push(param2);
                    addedFdnames.add(fdname2);
                }

                condition = 'more than to equal';
            }
            if (item.type === 'COMBO' || item.type === 'COM_POPUP_EMP') {
                condition = 'in';
            }

            if (fdname === 'std_ymd') {
                const param1 = {
                    fdname: 'bgng_ymd',
                    value: value,
                    condition: 'less than to equal',
                };
                const param2 = {
                    fdname: 'end_ymd',
                    value: value,
                    condition: 'more than to equal',
                };

                if (!addedFdnames.has('bgng_ymd')) {
                    mappedItems.push(param1);
                    addedFdnames.add('bgng_ymd');
                }

                if (!addedFdnames.has('end_ymd')) {
                    mappedItems.push(param2);
                    addedFdnames.add('end_ymd');
                }
            }

            if (
                value !== undefined &&
                value !== null &&
                value !== '' &&
                fdname !== 'std_ymd' &&
                !addedFdnames.has(fdname)
            ) {
                const param = {
                    fdname: fdname,
                    value: value,
                    condition: condition,
                };
                mappedItems.push(param);
                addedFdnames.add(fdname);
            }
        });

        // 최종 데이터 설정
        const finalDataForSql = {
            master: [
                {
                    sqlId: retrieveSqlId || '',
                    sql_key: retrieveSqlKey || '',
                    params: [{ ...sendData }],
                },
            ],
            detail: [
                {
                    scr_no: scr_no,
                    scr_type_cd: scr_no,
                    companyCd: '',
                    objectId: '',
                },
            ],
        };

        const finalDataForCommon = {
            master: [
                {
                    sqlId: 0,
                    params: [
                        {
                            user_no: '',
                            scr_no: tpcdParam,
                            where: mappedItems,
                        },
                    ],
                },
            ],
            detail: [
                {
                    scr_itg_no: tpcdParam,
                    scr_type_cd: tpcdParam,
                    scr_no: tpcdParam,
                    companyCd: '',
                    objectId: '',
                },
            ],
        };
        // 데이터 설정
        if (retrieveSqlId === undefined || retrieveSqlId === null || retrieveSqlId === '0' || retrieveSqlId === 0) {
            setDataParam(finalDataForCommon);
        } else {
            setDataParam(finalDataForSql);
        }

        // 원래 handleSubmit 호출
        handleSubmit();
    };

    // selectValue={summaryData[item.id]}
    return (
        <>
            <div className='pageHeader'>
                {tab_info.length === 0 && title.length > 0 && (
                    <div className='pageInfo'>
                        <Typography type='page' tooltip onClickDesc={handleModal}>
                            {t(title)}
                        </Typography>
                        <InfoModal
                            title='평가관리'
                            url='https://docs.google.com/document/d/18Qn9wrfJ7NQuLaW2UItsMkT1JN_Rjq31gDpsHWVqj_A/edit?usp=sharing#heading=h.w56nw9rlwsc'
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                        />
                    </div>
                )}
            </div>
            {/* 검색 조건 컴포넌트는 항상 렌더링되고, shouldHideSearchBox가 true면 보이지 않게 처리 */}
            <div style={{ display: shouldHideSearchBox ? 'none' : 'block' }}>
                {!searchOpen && (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row-reverse',
                            justifyContent: 'flex-end',
                            gap: '10px',
                            mb: '5px',
                            marginRight: '15px',
                            marginTop: '0',
                        }}
                    >
                        {searchItem.map((item, index) => (
                            <Chip
                                key={item.key}
                                label={item.value}
                                variant='outlined'
                                size='small'
                                onDelete={() => handleDelete(item.key)}
                                sx={{ maxWidth: '190px', background: '#f5f5f5' }}
                            />
                        ))}
                    </Box>
                )}
                <Accordion expanded={searchOpen} className='accordion'>
                    <AccordionSummary
                        onClick={handleOpen}
                        expandIcon={
                            !searchOpen && (
                                <button onClick={handleOpen} className='btnToggleSearchBox'>
                                    <IcoArrow fill='#13a9e9' />
                                </button>
                            )
                        }
                        sx={{
                            display: 'flex',
                            margin: '0px',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minHeight: '0px !important',
                            maxHeight: '0px',
                            padding: '0 15px',
                            '& .MuiAccordionSummary-content': { display: 'none' },
                            '& .MuiAccordionSummary-expandIconWrapper': {
                                position: 'absolute',
                                left: '50%',
                                top: '50%',
                                transform: 'translate(-50%, -50%)',
                            },
                        }}
                    ></AccordionSummary>
                    <AccordionDetails
                        sx={{
                            padding: 0,
                            position: 'relative',
                        }}
                        className='searchBox'
                    >
                        <div className='searchBoxWrap'>
                            {searchData.map((item, index) => {
                                const { type, id } = item;
                                const visible = item.visible ?? true;
                                const uniqueKey = `${id}-${index}`;
                                switch (type) {
                                    case 'TEXT':
                                        return (
                                            <div className='formItem' key={`${index} - ${id}`}>
                                                <TextComponent
                                                    key={uniqueKey}
                                                    item={item}
                                                    scr_no={''}
                                                    id={uniqueKey}
                                                    uniqueKey={uniqueKey}
                                                    sendDataItem={sendData}
                                                    handleChange={handleChange}
                                                    visible={visible}
                                                    type='text'
                                                    onDelete={() => handleDelete(uniqueKey)}
                                                    placeholder='Input'
                                                />
                                            </div>
                                        );
                                    case 'DATE':
                                        return (
                                            <div className='formItem' key={`${index} - ${id}`}>
                                                <DateComponent
                                                    key={uniqueKey}
                                                    item={item}
                                                    scr_no={''}
                                                    uniqueKey={uniqueKey}
                                                    sendDataItem={sendData}
                                                    handleChange={handleChange}
                                                    visible={visible}
                                                />
                                            </div>
                                        );
                                    case 'DATE_COM':
                                        return (
                                            <div className='formItem' key={`${index} - ${id}`}>
                                                <DateComComponent
                                                    key={uniqueKey}
                                                    item={item}
                                                    scr_no={scr_no}
                                                    uniqueKey={uniqueKey}
                                                    sendDataItem={sendData}
                                                    handleChange={handleChange}
                                                    visible={visible}
                                                />
                                            </div>
                                        );
                                    case 'DATE_SLRY':
                                        return (
                                            <div className='formItem' key={`${index} - ${id}`}>
                                                <DateComSlryComponent
                                                    key={uniqueKey}
                                                    item={item}
                                                    scr_no={''}
                                                    uniqueKey={uniqueKey}
                                                    sendDataItem={sendData}
                                                    handleChange={handleChange}
                                                    visible={visible}
                                                />
                                            </div>
                                        );
                                    case 'FROM_TO_DATE':
                                        const fromName = item.id;
                                        const toName = item.id + '_end';

                                        let defaultFrom: dayjs.Dayjs | null = null;
                                        let defaultTo: dayjs.Dayjs | null = null;

                                        if (item.default === 'BEFORE_1Y') {
                                            defaultFrom = dayjs().add(-1, 'year');
                                            defaultTo = dayjs();
                                        } else if (item.default === null) {
                                            defaultFrom = null;
                                            defaultTo = null;
                                        } else {
                                            defaultFrom = dayjs();
                                            defaultTo = dayjs().add(1, 'year');
                                        }

                                        return (
                                            <div className='formItem' key={`${index} - ${id}`}>
                                                <DateFromToComponent
                                                    key={uniqueKey}
                                                    item={item}
                                                    scr_no={''}
                                                    uniqueKey={uniqueKey}
                                                    sendDataItem={sendData}
                                                    handleChange={handleChange}
                                                    visible={visible}
                                                    defaultValue={
                                                        defaultFrom && defaultTo ? [defaultFrom, defaultTo] : undefined
                                                    }
                                                />
                                            </div>
                                        );
                                    case 'COMBO':
                                        return (
                                            <div className='formItem' key={`${index} - ${id}`}>
                                                <ComboComponent
                                                    key={uniqueKey}
                                                    item={item}
                                                    scr_no={''}
                                                    uniqueKey={uniqueKey}
                                                    sendDataItem={sendData}
                                                    handleChange={handleChange}
                                                    visible={true}
                                                    onReady={handleComponentReady}
                                                    multiple={false}
                                                />
                                            </div>
                                        );
                                    case 'COMBO_MULTI':
                                        return (
                                            <div className='formItem' key={`${index} - ${id}`}>
                                                <ComboComponent
                                                    key={uniqueKey}
                                                    item={item}
                                                    scr_no={''}
                                                    uniqueKey={uniqueKey}
                                                    sendDataItem={sendData}
                                                    handleChange={handleChange}
                                                    visible={true}
                                                    onReady={handleComponentReady}
                                                    multiple={true}
                                                />
                                            </div>
                                        );
                                    case 'COMBO_ADD':
                                        return (
                                            <div className='formItem' key={`${index} - ${id}`}>
                                                <ComboAddComponent
                                                    key={uniqueKey}
                                                    item={item}
                                                    scr_no={''}
                                                    uniqueKey={uniqueKey}
                                                    sendDataItem={sendData}
                                                    handleChange={handleChange}
                                                    visible={visible}
                                                />
                                            </div>
                                        );
                                    case 'COM_POPUP_DEPT':
                                    case 'COM_POPUP_DEPT_UNDER_ORG':
                                        return (
                                            visible && (
                                                <div key={uniqueKey} className='formItem'>
                                                    <div className='row'>
                                                        <label htmlFor={id} className='label'>
                                                            {t(item.text)}
                                                        </label>
                                                        <OgnzSelect
                                                            item={item}
                                                            handleChange={handleChange}
                                                            selectValue={summaryData[item.id]}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        );
                                    case 'COM_POPUP_EMP':
                                        return (
                                            visible && (
                                                <div key={uniqueKey} className='formItem'>
                                                    <div className='row'>
                                                        <label htmlFor={id} className='label'>
                                                            {t(item.text)}
                                                        </label>
                                                        <UserSelect
                                                            item={item}
                                                            handleChange={handleChange}
                                                            selectValue={summaryData[item.id]}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        );
                                    case 'CHECK':
                                        return (
                                            <div className='formItem' key={`${index} - ${id}`}>
                                                <CheckComponent
                                                    key={uniqueKey}
                                                    item={item}
                                                    scr_no={''}
                                                    uniqueKey={uniqueKey}
                                                    sendDataItem={sendData}
                                                    handleChange={handleChange}
                                                    visible={visible}
                                                />
                                            </div>
                                        );
                                    default:
                                        return '';
                                }
                            })}
                            {searchOpen &&
                                customButton?.map((item: any) => (
                                    <Button
                                        key={item.seq}
                                        onClick={onSubmit}
                                        type='primary'
                                        size='md'
                                        className='btnWithIcon btnSearch'
                                    >
                                        {t(item.text)}
                                        <IcoCol fill='#fff' />
                                    </Button>
                                ))}
                            {searchOpen && (
                                <Button onClick={handleOpen} className='btnToggleSearchBox on'>
                                    <IcoArrow fill='#13a9e9' />
                                </Button>
                            )}
                        </div>
                    </AccordionDetails>
                </Accordion>
            </div>
        </>
    );
}
