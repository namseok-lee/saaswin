'use client';

import { MenuItem } from '@mui/material';
import Switch from 'components/Switch';
import { useEffect, useState } from 'react';
import { fetcherPostCmcd } from 'utils/axios';
import { IcoCoworker, IcoDownEvaluation, IcoGroup, IcoPersonFill, IcoUpEvaluation } from '@/assets/Icon';
import styles from '../../../../components/FullDialog/evaluation/style.module.scss';
import BoxSelect from 'components/BoxSelect';
interface Props {
    data: Record<string, any>;
    setData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
    setValidation: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}
export default function EvlProcedual({ data, setData, setValidation }: Props) {
    const rprs_ognz_no = 'COMGRP';
    const targetComCd = [
        'hpm_group01015_cm0004',
        'hpm_group01015_cm0005',
        'hpm_group01015_cm0006',
        'hpm_group01015_cm0007',
        'hpm_group01015_cm0008',
    ]; // 하향 코드
    const targetComCd2 = [
        'hpm_group01015_cm0005',
        'hpm_group01015_cm0006',
        'hpm_group01015_cm0007',
        'hpm_group01015_cm0008',
    ]; // 하향1차 미 포함 하향 코드

    const [down1st, setDown1st] = useState(false); // 하향 n차인 경우(1차가 아닌) 하향 1차가 false이기때문에 따로 관리
    const [evlProcess, setEvelProcess] = useState([]);
    const [selectedValue, setSelectedValue] = useState('');
    const [selectedItem, setSelectedItem] = useState([]);
    // 하향 1차 switch
    const handleDown1stSwitchChange = (checked: boolean) => {
        setDown1st(checked);

        if (!checked) {
            setSelectedValue('hpm_group01015_cm0004');
            setEvelProcess((prev) =>
                prev.map((item) => (targetComCd.includes(item.com_cd) ? { ...item, selected: false } : item))
            );
        } else {
            setSelectedValue('');
            setEvelProcess((prev) =>
                prev.map((item) => (item.com_cd === 'hpm_group01015_cm0004' ? { ...item, selected: true } : item))
            );
        }
    };

    // Switch 상태 변경 핸들러
    const handleSwitchChange = (com_cd: string) => {
        setEvelProcess((prev) =>
            prev.map((item) => (item.com_cd === com_cd ? { ...item, selected: !item.selected } : item))
        );
    };

    // 하향 n차 업데이트
    const handleChange = (e: React.ChangeEvent<{ value: unknown }>) => {
        const value = e.target.value as string;
        setSelectedValue(value);
        // 선택한 평가 단계가 targetComCd2에 있다면 해당 인덱스를 구함
        const selectedIndex = targetComCd2.indexOf(value);
        setEvelProcess((prev) =>
            prev.map((item) => {
                // targetComCd2에 포함된 평가 항목인 경우
                if (targetComCd2.includes(item.com_cd)) {
                    // 선택한 평가 단계와 그 이하(순서상 index가 같거나 큰)는 true, 그 위는 false
                    return { ...item, selected: targetComCd2.indexOf(item.com_cd) <= selectedIndex };
                }
                // targetComCd2에 포함되지 않은 항목은 기존 값 그대로 반환 (필요에 따라 조정)
                return item;
            })
        );
    };

    useEffect(() => {
        // 절차구성 조회 (공통코드)
        // const item = [
        //     {
        //         sqlId: 'hrs_com01',
        //         sql_key: 'hrs_comcd_0getval',
        //         params: [
        //             {
        //                 key: 'hpm_group01015',
        //                 rprsKey: 'COMGRP',
        //                 crtr_ymd: '20250215',
        //             },
        //         ],
        //     },
        // ];
        fetcherPostCmcd({ group_cd: 'hpm_group01015', rprs_ognz_no: 'COMGRP' })
            .then((response) => {
                const resData = response;
                const procInfo = data?.proc_info || [];
                const formattedData = resData.map((proc) => {
                    let description = ''; // 기본 값 설정
                    // com_cd에 따라 description 설정
                    if (proc.com_cd === 'hpm_group01015_cm0001') {
                        // 자기평가
                        description = '리뷰 대상자가 직접 평가를 작성합니다.';
                    } else if (proc.com_cd === 'hpm_group01015_cm0002') {
                        // 동료평가
                        description = '동료가 평가대상자의 평가를 작성합니다.';
                    } else if (proc.com_cd === 'hpm_group01015_cm0003') {
                        // 상향평가
                        description = '팀원이 평가대상자(리더)의 평가를 작성합니다.';
                    } else if (proc.com_cd === 'hpm_group01015_cm0004') {
                        // 하향평가
                        description = '리더가 평가 대상자의 평가를 작성합니다';
                    } else if (proc.com_cd === 'hpm_group01015_cm0009') {
                        // 위원평가
                        description = '평가위원이 평가 대상자 평가를 작성합니다.';
                    }
                    const isSelected = procInfo.some((item) => item.proc_cd === proc.com_cd) || false;
                    return {
                        com_cd: proc.com_cd,
                        com_cd_nm: proc.com_cd_nm,
                        cd_prord: proc.com_cd_nm,
                        description: description,
                        selected: isSelected,
                    };
                });
                const selectedItem = formattedData
                    .filter((item) => targetComCd.includes(item.com_cd) && item.selected)
                    .slice(-1)[0];

                const isSelectedItem =
                    formattedData?.find((item) => targetComCd.includes(item.com_cd) && item.selected) !== undefined;

                setDown1st(isSelectedItem);
                setSelectedValue(selectedItem ? selectedItem.com_cd : '');
                setEvelProcess(formattedData);
                const selectedItems = formattedData.filter((item) => targetComCd.includes(item.com_cd)) || [];
                setSelectedItem(selectedItems);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    // 데이터 세팅
    useEffect(() => {
        const hasTrueInTargetComCd = evlProcess.some((item) => targetComCd2.includes(item.com_cd) && item.selected);
        // 2~5차가 선택이 되었다면 1차는 false로 변경
        const formattedData = evlProcess.filter((item) => {
            // 4번은 5~8번 중 하나라도 true가 있을 경우 제외
            if (item.com_cd === 'hpm_group01015_cm0004' && hasTrueInTargetComCd) {
                return false;
            }
            // 나머지 selected가 true인 항목만 포함
            return item.selected;
        });
        const procInfo = data?.proc_info || [];
        let newItems = [];
        if (procInfo.length === 0) {
            // 최소 생성: proc_info가 빈 배열이면 formattedData의 모든 항목을 추가
            newItems = formattedData.map((item) => ({
                proc_cd: item.com_cd,
            }));
        } else {
            // 기존 데이터: 기존 데이터가 있는 경우, formattedData 중 proc_cd가 없는 항목만 추가
            newItems = formattedData
                .filter((item) => !procInfo.some((proc) => proc.proc_cd === item.com_cd))
                .map((item) => ({
                    proc_cd: item.com_cd,
                }));
        }
        if (evlProcess.every((item) => !item.selected)) {
            setValidation((prev) => ({
                ...prev,
                validation: false,
                message: '평가 종류를 선택하세요.',
            }));
        } else {
            setData((prev) => ({
                ...prev,
                proc_info: [...(prev.proc_info || []), ...newItems],
                // proc_info: newItems,
            }));
            setValidation((prev) => ({
                ...prev,
                validation: true,
                type: 'cm001-3',
            }));
        }
    }, [evlProcess, selectedValue]);
    return (
        <div className={styles.stepFormation}>
            <ul className={styles.list}>
                {evlProcess
                    ?.filter((item) => !targetComCd2.includes(item.com_cd))
                    .map((item) => (
                        <li key={item.com_cd} className={`${styles.item} ${item.selected ? styles.on : ''}`}>
                            <div className={styles.icon}>
                                {item.com_cd === 'hpm_group01015_cm0001' ? (
                                    <IcoPersonFill fill='#666666' />
                                ) : item.com_cd === 'hpm_group01015_cm0002' ? (
                                    <IcoCoworker fill='#666666' />
                                ) : item.com_cd === 'hpm_group01015_cm0003' ? (
                                    <IcoUpEvaluation fill='#666666' />
                                ) : item.com_cd === 'hpm_group01015_cm0009' ? (
                                    <IcoGroup fill='#666666' />
                                ) : (
                                    <IcoDownEvaluation fill='#666666' />
                                )}
                            </div>
                            <div className={styles.itemWrap}>
                                <div className={styles.tit}>
                                    {item.com_cd === 'hpm_group01015_cm0004' ? '하향평가' : item.com_cd_nm}
                                </div>
                                <div className={styles.desc}>{item.description}</div>
                                {item.com_cd === 'hpm_group01015_cm0004' && (item.selected || down1st) && (
                                    <BoxSelect
                                        value={selectedValue}
                                        onChange={(e) => {
                                            handleChange(e);
                                        }}
                                        displayEmpty // 차수선택이 보이도록 하는 설정
                                        className={styles.selectbox}
                                        options={selectedItem.map((item) => ({
                                            value: item.com_cd, // string 이지만 일단 컴포넌트 타입 수정 제안도 아래 참고
                                            label: item.com_cd_nm,
                                        }))}
                                    ></BoxSelect>
                                )}
                            </div>
                            {item?.com_cd === 'hpm_group01015_cm0004' ? (
                                <Switch
                                    checked={down1st}
                                    onChange={handleDown1stSwitchChange}
                                    className={styles.switch}
                                />
                            ) : (
                                <Switch
                                    checked={item.selected}
                                    onChange={() => handleSwitchChange(item.com_cd)}
                                    className={styles.switch}
                                />
                            )}
                        </li>
                    ))}
            </ul>
        </div>
    );
}
