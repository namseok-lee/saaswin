'use client';

import { Tab } from '@mui/material';
import InputTextBox from '@/components/InputTextBox';
import Button from 'components/Button';
import SwTabContext from 'components/TabContext';
import SwTabList from 'components/TabList';
import { useEffect, useRef, useState } from 'react';
import { fetcherPost, fetcherPostData } from 'utils/axios';
import { IcoCol } from '@/assets/Icon';
import styles from '../../../../components/FullDialog/evaluation/style.module.scss';
import EvltrClgSelectorInfo from './evltrConfirmed/EvltrClgSelectorInfo';
import EvltrConfirmedInfo from './evltrConfirmed/EvltrConfirmedInfo';
interface Props {
    data: Record<string, any>;
    setData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
    setValidation: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}
export default function EvltrConfirmed({ data, setData, setValidation }: Props) {
    const trprInfoRef = useRef(null);
    const evltrInfoRef = useRef(null);
    const [tabView, setTabView] = useState(false);
    const [tabValue, setTabValue] = useState('evltr');
    const [evltrInfo, setEvltrInfo] = useState([]);
    const [filteredEvltrInfo, setFilteredEvltrInfo] = useState([]);
    console.log('filteredEvltrInfo', filteredEvltrInfo);
    const renderComponent = () => {
        switch (tabValue) {
            // 동료 선택 현황
            case 'clgSelect':
                return (
                    <EvltrClgSelectorInfo
                        data={data}
                        filteredEvltrInfo={filteredEvltrInfo}
                        setTabView={setTabView}
                        setTabValue={setTabValue}
                    />
                );
            default:
                // 평가자 별 대상자
                return (
                    <EvltrConfirmedInfo
                        data={data}
                        filteredEvltrInfo={filteredEvltrInfo}
                        setTabView={setTabView}
                        setTabValue={setTabValue}
                    />
                );
        }
    };
    const handleSearchButton = () => {
        // ref를 통해 현재 입력값 가져오기
        // const trprInfoValue = trprInfoRef.current ? trprInfoRef.current.value : '';
        // const evltrInfoValue = evltrInfoRef.current ? evltrInfoRef.current.value : '';
        const trprInfoValue = inputValues.text1 ? inputValues.text1 : '';
        const evltrInfoValue = inputValues.text2 ? inputValues.text2 : '';

        // 현재 입력값을 기반으로 데이터 필터링
        let filtered = [...evltrInfo];

        // 평가 대상자(trpr) 필터링
        if (trprInfoValue.trim() !== '') {
            filtered = filtered.filter(
                (item) => item.flnm && item.flnm.toLowerCase().includes(trprInfoValue.toLowerCase())
            );
        }
        // 평가자(evltr) 필터링
        if (evltrInfoValue.trim() !== '') {
            filtered = filtered.filter((item) => {
                return Object.keys(item).some(
                    (key) =>
                        key.startsWith('hpm_group') &&
                        item[key] &&
                        item[key].toLowerCase().includes(evltrInfoValue.toLowerCase())
                );
            });
        }
        // 필터링된 결과 설정
        setFilteredEvltrInfo(filtered);
    };
    const handleChangeTab = (event: React.SyntheticEvent, newValue: string) => {
        if (trprInfoRef.current) {
            trprInfoRef.current.value = '';
        }
        if (evltrInfoRef.current) {
            evltrInfoRef.current.value = '';
        }
        handleSearchButton();
        setTabValue(newValue);
    };
    useEffect(() => {
        const trprInfo = data?.trpr_info || [];
        const isClgEvl = data?.proc_info?.find((item) => item.proc_cd === 'hpm_group01015_cm0002'); // 동료평가 유무
        const clg_chc_mthd = isClgEvl?.clg_chc_mthd?.clg_chc_mthd; // 동료 선택방식
        let updatedTrprInfo = trprInfo;
        // processEvltrInfo 함수를 별도로 정의하여 재사용 가능하게 함
        const processEvltrInfo = (data) => {
            return data.map((item) => {
                // evltr_info 분리 후 나머지 속성을 복사
                const { evltr_info, ...rest } = item;
                const newItem = { ...rest };
                if (evltr_info) {
                    Object.keys(evltr_info).forEach((key) => {
                        if (key.startsWith('hpm_group')) {
                            // 모든 키에 대해 동일하게 flnm 값을 추출하여 설정
                            const flnmValues = evltr_info[key].evltr_info
                                ?.map((person) => person.flnm || '')
                                .filter(Boolean);

                            // 모든 hpm_group 키에 대해 동일하게 값 설정
                            newItem[key] = flnmValues.join(',');

                            // hpm_group01015_cm0002 키에 대한 특별 처리
                            if (key === 'hpm_group01015_cm0002') {
                                const person = evltr_info[key];

                                // clg_selector 추가
                                if (person?.clg_selector) {
                                    newItem['clg_selector'] = person.clg_selector;
                                } else if (person) {
                                    // clg_selector가 없는 경우, person의 정보로 생성
                                    newItem['clg_selector'] = {
                                        flnm: person.flnm,
                                        user_no: person.user_no,
                                    };
                                }
                                // 리더승인 여부
                                if (person?.ldr_aprv_info) {
                                    newItem['ldr_aprv_info'] = person.ldr_aprv_info;
                                } else if (person) {
                                    newItem['ldr_aprv_info'] = 'auto_aprv';
                                }
                                // ldr_info 추가
                                if (person?.ldr_info) {
                                    newItem['ldr_info'] = person.ldr_info;
                                }
                            }
                        }
                    });
                }
                return newItem;
            });
        };
        if (isClgEvl) {
            // 동료평가가 있을 경우 동료선정자 세팅 후 업데이트
            const isNew = trprInfo.every((item) => !item.evltr_info?.hpm_group01015_cm0002);
            if (isNew) {
                updatedTrprInfo = trprInfo.map((item) => ({
                    ...item,
                    evltr_info: {
                        ...item.evltr_info, // 기존의 evltr_info 유지
                        hpm_group01015_cm0002: {
                            // 새로운 키 추가
                            evltr_info: [],
                            ldr_aprv_info: 'auto_aprv',
                            clg_selector: {
                                flnm: item.flnm,
                                user_no: item.user_no,
                            },
                            // 적절한 값으로 대체
                        },
                    },
                }));
                switch (clg_chc_mthd) {
                    case 'trpr_chc':
                        // 동료선정자가 대상자로 선택된 경우 업데이트
                        const trprItem = [
                            {
                                sqlId: 'hpm_evl01',
                                sql_key: 'hpm_clg_evltr_create',
                                params: [
                                    {
                                        evl_id: data?.evl_id,
                                        clg_chc_mthd: 'trpr_chc',
                                        value: updatedTrprInfo,
                                    },
                                ],
                            },
                        ];
                        fetcherPostData(trprItem)
                            .then((response) => {
                                const resData = response[0].saaswin_hpm_clg_evltr_create;
                                // API 응답으로 받은 데이터를 사용하여 processedEvltrInfo 계산
                                const processedEvltrInfo = processEvltrInfo(resData);

                                // 상태 업데이트
                                setData((prev) => ({
                                    ...prev,
                                    trpr_info: resData,
                                }));

                                // 필터링된 정보 설정
                                setEvltrInfo(processedEvltrInfo); // 검색 state
                                setFilteredEvltrInfo(processedEvltrInfo);
                            })
                            .catch((error) => {
                                console.error(error);
                            });
                        break;
                    case 'ldr_chc':
                        // 동료선정자 = 리더
                        const ldrItem = [
                            {
                                sqlId: 'hpm_evl01',
                                sql_key: 'hpm_clg_evltr_create',
                                params: [
                                    {
                                        evl_id: data?.evl_id,
                                        clg_chc_mthd: 'ldr_chc',
                                        value: updatedTrprInfo,
                                    },
                                ],
                            },
                        ];
                        fetcherPostData(ldrItem)
                            .then((response) => {
                                const resData = response[0].saaswin_hpm_clg_evltr_create;
                                // API 응답으로 받은 데이터를 사용하여 processedEvltrInfo 계산
                                const processedEvltrInfo = processEvltrInfo(resData);
                                // 상태 업데이트
                                setData((prev) => ({
                                    ...prev,
                                    trpr_info: resData,
                                }));
                                // 필터링된 정보 설정
                                setEvltrInfo(processedEvltrInfo); // 검색 state
                                setFilteredEvltrInfo(processedEvltrInfo);
                            })
                            .catch((error) => {
                                console.error(error);
                            });
                        break;
                    default:
                        // 운영자가 선택된 경우, 기본 처리
                        const processedEvltrInfo = processEvltrInfo(updatedTrprInfo);
                        setEvltrInfo(processedEvltrInfo); // 검색 state
                        setFilteredEvltrInfo(processedEvltrInfo);
                        break;
                }
            } else {
                // 동료평가가 없는 경우 기본 처리
                const processedEvltrInfo = processEvltrInfo(trprInfo);
                setEvltrInfo(processedEvltrInfo); // 검색 state
                setFilteredEvltrInfo(processedEvltrInfo);
            }
        } else {
            const processedEvltrInfo = processEvltrInfo(updatedTrprInfo);
            setEvltrInfo(processedEvltrInfo); // 검색 state
            setFilteredEvltrInfo(processedEvltrInfo);
        }
    }, []);

    const [inputValues, setInputValues] = useState({
        text1: '',
        text2: '',
    });

    const [valid, setValid] = useState(false);
    const [validText, setValidText] = useState('');

    // input 값 변경
    const handleChange = (id: string, value: string) => {
        console.log('handleChange', value);

        if (value === '1234') {
            setValid(true);
            setValidText('잘못입력함');
        } else {
            setValid(false);
            setValidText('');
        }

        setInputValues((prev) => ({ ...prev, [id]: value }));
    };

    // input 삭제 핸들러
    const handleDelete = (id: string) => {
        setValid(false);
        setValidText('');
        setInputValues((prev) => ({ ...prev, [id]: '' }));
    };
    return (
        <div className={styles.evltrConfirmed}>
            <div className={styles.tabs}>
                {tabView ? (
                    <SwTabContext value={tabValue}>
                        <SwTabList onChange={handleChangeTab} aria-label='lab API tabs example'>
                            <Tab label={'평가자 별 대상자'} value={'evltr'} />
                            <Tab label={'동료 선택 현황'} value={'clgSelect'} />
                        </SwTabList>
                    </SwTabContext>
                ) : null}
            </div>
            <div className={styles.searchCondition}>
                <InputTextBox
                    type='text'
                    id='text1'
                    label='평가 대상자'
                    validationText=''
                    value={inputValues.text1}
                    onChange={(e) => handleChange('text1', e.target.value)}
                    onDelete={() => handleDelete('text1')}
                />
                <InputTextBox
                    type='text'
                    id='text2'
                    label='평가자'
                    validationText=''
                    value={inputValues.text2}
                    onChange={(e) => handleChange('text2', e.target.value)}
                    onDelete={() => handleDelete('text2')}
                />
                {/* inputRef={evltrInfoRef}*/}
                <Button
                    size='md'
                    type='primary'
                    onClick={() => {
                        handleSearchButton();
                    }}
                    className={`${styles.btnSearch} btnWithIcon`}
                >
                    조회 <IcoCol />
                </Button>
            </div>
            {renderComponent()}
        </div>
    );
}
