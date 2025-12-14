'use client';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, Stack, TextField } from '@mui/material';
import { DataGridPremium, GridColDef } from '@mui/x-data-grid-premium';
import BoxSelect from 'components/BoxSelect';
import Button from 'components/Button';
import Checkbox from 'components/Checkbox';
import Radio from 'components/Radio';
import RadioGroup from 'components/RadioGroup';
import Switch from 'components/Switch';
import Typography from 'components/Typography';
import { useEffect, useState } from 'react';
import { fetcherPostCmcd, fetcherPostData } from 'utils/axios';
import { IcoCoworker, IcoDownEvaluation, IcoEdit, IcoGroup, IcoPersonFill, IcoUpEvaluation } from '@/assets/Icon';
import styles from '../../../../components/FullDialog/evaluation/style.module.scss';
interface Props {
    data: Record<string, any>;
    setData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
    setValidation: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

export default function EvlProcedualSetting({ data, setData, setValidation }: Props) {
    const seperateYn = data?.separator_info?.separator_info;
    const jbgpItem = [
        {
            jbgp_cd: 'cm001',
            jbgp_nm: '경영지원',
        },
        {
            jbgp_cd: 'cm002',
            jbgp_nm: '영업',
        },
        {
            jbgp_cd: 'cm003',
            jbgp_nm: '개발',
        },
        {
            jbgp_cd: 'cm004',
            jbgp_nm: '총무',
        },
    ];
    const columns: GridColDef[] = [
        {
            field: 'evlfm_nm',
            headerName: '평가 양식 이름',
            type: 'string',
            width: 400,
            editable: false,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'evlfm_type_nm',
            headerName: '구분',
            type: 'string',
            width: 200,
            align: 'center',
            headerAlign: 'center',
            editable: false,
        },
        {
            field: 'wgvl',
            headerName: '가중치',
            type: 'number',
            flex: 1,
            align: 'center',
            headerAlign: 'center',
            editable: true, // 기본적으로 편집 가능
        },
    ];
    const [procItem, setProcItem] = useState([]); // (3단계 절차구성에서) 선택된 평가종류
    const [evlfm, setEvlfm] = useState([]); // 평가지 종류
    // 종합 점수 계산 스위치
    const [switchStates, setSwitchStates] = useState({});
    // 종합등급 배분 가이드
    const [guideSwitch, setGuideSwitch] = useState({});

    const [additionalForms, setAdditionalForms] = useState([]);
    const [sendItem, setSendItem] = useState([]); // api로 보내질 데이터
    const [rows, setRows] = useState([]);
    const [radioValue, setRadioValue] = useState(''); // 동료 선택방식
    const [guideValue, setGuideValue] = useState(''); // 종합 등급 배분 가이드 방식
    const [scoreState, setScoreState] = useState(false);

    // 평가 양식 선택
    const handleSelectedChange = (e, proc_cd, evlfmType, trpr_jbgp) => {
        const evlfmNm = evlfm?.[evlfmType]?.find((item) => item.evlfm_id === e.target.value).evlfm_nm;
        const value = e.target.value;
        const matchItem =
            Object.values(evlfm)
                .flat()
                .find((item) => item.evlfm_id === value)?.evl_artcl_info?.grd || null;
        const newProcItems = procItem.map((item) => {
            if (item.proc_cd === proc_cd) {
                // 해당 항목에서 evlfmItem 배열 업데이트 처리
                const currentEvlfmItem = item[evlfmType]?.evlfmItem || [];
                const updatedEvlfmItem = currentEvlfmItem.some((evlfm) => evlfm.trpr_jbgp === trpr_jbgp)
                    ? currentEvlfmItem.map((evlfm) =>
                          evlfm.trpr_jbgp === trpr_jbgp ? { ...evlfm, evlfm_id: value, evlfm_nm: evlfmNm } : evlfm
                      )
                    : [...currentEvlfmItem, { evlfm_id: value, evlfm_nm: evlfmNm, trpr_jbgp }];

                return {
                    ...item,
                    [evlfmType]: {
                        ...item[evlfmType],
                        evlfmItem: updatedEvlfmItem,
                        ...(matchItem && { grd_info: matchItem }),
                    },
                };
            } else {
                return item;
            }
        });
        // procItem 상태 업데이트
        setProcItem(newProcItems);
        const flatEvlfm = Object.values(evlfm).flat(); // 평가지 데이터가 있다면 평탄화
        const newRowsState = newProcItems.flatMap((proc) => {
            return Object.keys(proc)
                .filter((key) => key.startsWith('hpm_group'))
                .map((groupKey) => {
                    const group = proc[groupKey];
                    if (group && group.evlfmItem && group.evlfmItem.length > 0) {
                        const firstEvlfm = group.evlfmItem[0];
                        const foundEvlfm = flatEvlfm.find((e) => e.evlfm_id === firstEvlfm.evlfm_id);
                        return {
                            id: proc.proc_cd,
                            evlfm_nm: foundEvlfm ? foundEvlfm.evlfm_nm : firstEvlfm.trpr_jbgp,
                            evlfm_type_cd: groupKey,
                            evlfm_type_nm: foundEvlfm ? foundEvlfm.evlfm_type_nm : undefined,
                            wgvl: group.wgvl || '0',
                            evlfm_id: firstEvlfm.evlfm_id,
                        };
                    }
                    return null;
                })
                .filter(Boolean);
        });

        // rows 상태 업데이트
        setRows(newRowsState);
    };
    // wgvl 합계를 계산하여 100인지 확인하는 함수
    const checkTotalWgvl = (item) => {
        const wgvlValues = Object.keys(item)
            .filter((key) => key.startsWith('hpm_group'))
            .map((key) => parseInt(item[key]?.wgvl || '0', 10));

        const totalWgvl = wgvlValues.reduce((acc, val) => acc + val, 0);
        return totalWgvl === 100;
    };
    // 일반평가양식 추가
    const handleAddForm = () => {
        setAdditionalForms((prev) => [
            ...prev,
            { id: Date.now(), jbgp_cd: '', jbgp_nm: '' }, // 고유 id 생성, 초기 선택 값은 빈 문자열
        ]);
    };
    // 일반평가양식 삭제
    const handleDeleteForm = (id) => {
        setAdditionalForms((prev) => prev.filter((form) => form.id !== id));
    };

    const handleAdditionalSelectChange = (id, value) => {
        setAdditionalForms((prev) => prev.map((form) => (form.id === id ? { ...form, evlfm_id: value } : form)));
    };

    // 종합 점수 계산, 종합 등급 배분 가이드 스위치
    const handleSwitchChange = (checked: boolean, proc_cd: string, type: string) => {
        const currentItem = procItem.find((item) => item.proc_cd === proc_cd);
        if (!currentItem) return;

        if (type === 'calc') {
            const isDataMissing = Object.keys(currentItem)
                .filter((key) => key.startsWith('hpm_group'))
                .some((key) => currentItem[key]?.evlfmItem?.length === 0);

            if (isDataMissing) {
                alert('먼저 평가지를 선택해주세요.');
                return;
            }

            setProcItem((prev) =>
                prev.map((item) =>
                    item.proc_cd !== proc_cd
                        ? item
                        : {
                              ...item,
                              ...Object.fromEntries(
                                  Object.entries(item)
                                      .filter(([k]) => k.startsWith('hpm_group'))
                                      .map(([k, v]) => [k, { ...v, wgvl: checked ? '0' : '100' }])
                              ),
                          }
                )
            );

            setRows((prev) => prev.map((row) => (row.id === proc_cd ? { ...row, wgvl: checked ? '0' : '100' } : row)));

            setSwitchStates((prev) => ({
                ...prev,
                [proc_cd]: checked,
            }));
        }

        if (type === 'guide') {
            setGuideSwitch((prev) => ({
                ...prev,
                [proc_cd]: checked,
            }));

            // 평가 방식 설정도 같이 초기화해주면 좋음 (예: default 선택값)
            if (checked) {
                setProcItem((prev) =>
                    prev.map((item) =>
                        item.proc_cd === proc_cd
                            ? {
                                  ...item,
                                  evl_dv: {
                                      ...(item.evl_dv || {}),
                                      evl_dv_bthd: 'nope_bthd', // or default값
                                  },
                              }
                            : item
                    )
                );

                setGuideValue((prev) => ({
                    ...prev,
                    [proc_cd]: 'nope_bthd', // or default값
                }));
            } else {
                setProcItem((prev) =>
                    prev.map((item) =>
                        item.proc_cd === proc_cd
                            ? {
                                  ...item,
                                  evl_dv: undefined,
                              }
                            : item
                    )
                );

                setGuideValue((prev) => {
                    const newGuide = { ...prev };
                    delete newGuide[proc_cd];
                    return newGuide;
                });
            }
        }
    };

    // 가중치 handler함수
    const processRowUpdate = (updatedRow, oldRow) => {
        // 새 값만 반영하도록 상태 업데이트
        setRows((prevRows) =>
            prevRows.map((row) =>
                row.id === updatedRow.id && row.evlfm_id === updatedRow.evlfm_id
                    ? { ...row, wgvl: String(updatedRow.wgvl) } // `wgvl` 필드만 업데이트 (다른 필드는 그대로)
                    : row
            )
        );
        setProcItem((prevItems) =>
            prevItems.map((item) => {
                if (item.proc_cd === updatedRow.id) {
                    // item의 hpm_group* 키 중, updatedRow.evlfm_type_cd와 일치하는 그룹만 업데이트
                    const updatedGroup = Object.keys(item)
                        .filter((key) => key.startsWith('hpm_group'))
                        .reduce((acc, groupKey) => {
                            const group = item[groupKey];
                            if (group && group.evlfmItem && groupKey === updatedRow.evlfm_type_cd) {
                                acc[groupKey] = {
                                    ...group,
                                    wgvl: String(updatedRow.wgvl),
                                };
                            }
                            return acc;
                        }, {});
                    return { ...item, ...updatedGroup };
                }
                return item;
            })
        );

        return updatedRow;
    };

    // 동료 선택방식 handler 함수
    const handleRadioChange = (e, type, proc_cd) => {
        const value = e.target.value;
        if (type === 'calc') {
            // 운영자가 선택외의 선택 시 최소, 최대인원 0으로 초기화
            if (value !== 'operr_chc') {
                setProcItem((prevItems) =>
                    prevItems.map((item) =>
                        item.ptcp_clg_nope
                            ? {
                                  ...item,
                                  ptcp_clg_nope: {
                                      min_nope: 0,
                                      max_nope: 0,
                                  },
                              }
                            : item
                    )
                );
            }
            setRadioValue(value);
            setProcItem((prevItems) =>
                prevItems.map((item) =>
                    item.proc_cd === 'hpm_group01015_cm0002' ? { ...item, clg_chc_mthd: { clg_chc_mthd: value } } : item
                )
            );
        } else {
            // 비율로 선택할 경우 기존에 사유제출값이 존재했다면 없앤다.
            if (value === 'rt_bthd') {
                setProcItem((prevItems) =>
                    prevItems.map((item) => {
                        if (item.proc_cd === proc_cd) {
                            // 현재 evl_dv 객체가 없다면 빈 객체로 초기화하고, 있다면 rsn_yn 속성을 제거합니다.
                            const current = item.evl_dv || {};
                            const { rsn_yn, ...rest } = current; // rsn_yn을 제거하고 나머지를 rest에 저장
                            return {
                                ...item,
                                evl_dv: { ...rest, evl_dv_bthd: value },
                            };
                        }
                        return item;
                    })
                );
            } else {
                setProcItem((prevItems) =>
                    prevItems.map((item) =>
                        item.proc_cd === proc_cd
                            ? {
                                  ...item,
                                  // evl_dv가 이미 존재하면 그대로 유지하고, 없으면 {}로 초기화한 후 dv_bthd 값을 설정
                                  evl_dv: { ...(item.evl_dv || {}), evl_dv_bthd: value },
                              }
                            : item
                    )
                );
            }
            setGuideValue((prev) => ({
                ...prev,
                [proc_cd]: value,
            }));
        }
    };

    const handleCheckChange = (checked: boolean, type: string, proc_cd: string) => {
        const value = checked ? 'Y' : 'N';
        if (type === 'leader') {
            setProcItem((prevItems) =>
                prevItems.map((item) =>
                    item.proc_cd === 'hpm_group01015_cm0002'
                        ? {
                              ...item,
                              clg_chc_mthd: {
                                  ...(item.clg_chc_mthd || {}),
                                  ldr_aprv_yn: value,
                              },
                          }
                        : item
                )
            );
        } else {
            setProcItem((prevItems) =>
                prevItems.map((item) =>
                    item.proc_cd === proc_cd
                        ? {
                              ...item,
                              evl_dv: {
                                  ...(item.evl_dv || {}),
                                  rsn_yn: value,
                              },
                          }
                        : item
                )
            );
        }
    };

    const handleClgNopeChange = (e, type) => {
        const value = e.target.value;
        setProcItem((prevItems) =>
            prevItems.map((item) =>
                item.ptcp_clg_nope
                    ? {
                          ...item,
                          ptcp_clg_nope: {
                              ...item.ptcp_clg_nope,
                              [type]: value,
                          },
                      }
                    : item
            )
        );
    };

    useEffect(() => {
        if (data?.proc_info) {
            setSendItem(data.proc_info);
        }
        // 절차구성 조회 (공통코드)
        // const proc_item = [
        //     {
        //         sqlId: '85',
        //         params: [
        //             {
        //                 redis_key: `${com_rprs_ognz_no}_hpm_group01015`,
        //                 redis_db: 0,
        //             },
        //         ],
        //     },
        // ];
        const proc_item = [
            {
                sqlId: 'hrs_com01',
                sql_key: 'hrs_comcd_0getval',
                params: [
                    {
                        key: 'hpm_group01015',
                        rprsKey: 'COMGRP',
                        crtr_ymd: '20250215',
                    },
                ],
            },
        ];

        // 평가지 조회
        const evlfm_item = [
            {
                sqlId: 'hpm_evl01',
                sql_key: 'hpm_evlfm',
                params: [
                    {
                        group_key: 'COMGRP_hpm_group01018',
                        rprsKey: 'COMGRP',
                    },
                ],
            },
        ];
        Promise.all([
            fetcherPostCmcd({ group_cd: 'hpm_group01015', rprs_ognz_no: 'COMGRP' }),
            fetcherPostData(evlfm_item),
        ])
            .then(([procResponse, evlfmResponse]) => {
                const procData = procResponse;
                const evlfmData = evlfmResponse[0].data.ret_info;
                const filteredData = procData.filter((resItem) =>
                    data?.proc_info.some((proc) => proc.proc_cd === resItem.com_cd)
                );

                // 평가종류 정렬
                const sortedProcInfo = [...(data?.proc_info || [])].sort((a, b) => {
                    const getNumber = (proc_cd) => {
                        const idx = proc_cd.lastIndexOf('_cm');
                        return idx !== -1 ? parseInt(proc_cd.slice(idx + 3), 10) : 0;
                    };
                    return getNumber(a.proc_cd) - getNumber(b.proc_cd);
                });

                setEvlfm(evlfmData);

                const newProcItems = sortedProcInfo.map((proc) => {
                    const matchedItem = filteredData.find((item) => item.com_cd === proc.proc_cd);
                    let hpmGroupKeys = [];
                    // 동료평가, 상향평가인 경우
                    if (proc.proc_cd === 'hpm_group01015_cm0002' || proc.proc_cd === 'hpm_group01015_cm0003') {
                        hpmGroupKeys = ['hpm_group01018_cm0001'];
                    } else {
                        // 나머지 평가item?.ptcp_clg_nope?.max_nope || ''의 경우
                        hpmGroupKeys = ['hpm_group01018_cm0001', 'hpm_group01018_cm0002', 'hpm_group01018_cm0003'];
                    }
                    const isData = hpmGroupKeys.some((key) => proc[key]);
                    if (!isData) {
                        // 새 데이터일 경우 기본값 추가
                        const defaultValues = hpmGroupKeys.reduce((acc, groupKey) => {
                            acc[groupKey] = {
                                wgvl: '0', // 기본 가중치 0
                                evlfmItem: [], // 기본적으로 빈 evlfmItem
                            };
                            return acc;
                        }, {});

                        // 동료평가인 경우 추가 설정
                        if (proc.proc_cd === 'hpm_group01015_cm0002') {
                            return {
                                ...proc,
                                com_cd_nm: matchedItem ? matchedItem.com_cd_nm : proc.com_cd_nm,
                                ...defaultValues,
                                clg_chc_mthd: { clg_chc_mthd: 'trpr_chc', ldr_aprv_yn: 'N' },
                                ptcp_clg_nope: { min_nope: 0, max_nope: 0 },
                            };
                        } else {
                            return {
                                ...proc,
                                com_cd_nm: matchedItem ? matchedItem.com_cd_nm : proc.com_cd_nm,
                                ...defaultValues,
                            };
                        }
                    } else {
                        return {
                            ...proc, // 기존 proc_info 객체 유지
                            proc_cd: proc.proc_cd, // proc_cd 유지
                            com_cd_nm: matchedItem ? matchedItem.com_cd_nm : proc.com_cd_nm,
                        };
                    }
                });
                setProcItem(newProcItems);
                const flatEvlfm = Object.values(evlfmData).flat();
                // 종합점수 계산 세팅
                setSwitchStates((prev) => {
                    const newSwitchStates = {};
                    data?.proc_info.forEach((item) => {
                        const hpmGroups = Object.keys(item)
                            .filter((key) => key.startsWith('hpm_group'))
                            .map((groupKey) => item[groupKey]?.wgvl);

                        const totalWgvl = hpmGroups.reduce((sum, wgvl) => sum + parseInt(wgvl || '0', 10), 0);
                        newSwitchStates[item.proc_cd] = totalWgvl === 100;
                    });
                    return { ...prev, ...newSwitchStates };
                });
                // 가중치 그리드 세팅
                const newRowsState = [];
                data?.proc_info.forEach((proc) => {
                    const procRows = Object.keys(proc)
                        .filter((key) => key.startsWith('hpm_group'))
                        .map((groupKey) => {
                            const group = proc[groupKey];
                            if (group && group.evlfmItem && group.evlfmItem.length > 0) {
                                const firstEvlfm = group.evlfmItem[0];
                                const foundEvlfm = flatEvlfm.find((e) => e.evlfm_id === firstEvlfm.evlfm_id);
                                return {
                                    id: proc.proc_cd,
                                    evlfm_nm: foundEvlfm.evlfm_nm,
                                    evlfm_type_cd: groupKey,
                                    evlfm_type_nm: foundEvlfm.evlfm_type_nm,
                                    wgvl: group.wgvl || '0',
                                    evlfm_id: firstEvlfm.evlfm_id,
                                };
                            }
                            return null;
                        })
                        .filter(Boolean);
                    newRowsState.push(...procRows);
                });
                // 종합등급 배분 가이드 세팅
                const targetProcCds = [
                    'hpm_group01015_cm0004',
                    'hpm_group01015_cm0005',
                    'hpm_group01015_cm0006',
                    'hpm_group01015_cm0007',
                    'hpm_group01015_cm0008',
                    'hpm_group01015_cm0009',
                ];
                setGuideSwitch((prev) => {
                    const newSwitchStates = {};
                    data?.proc_info.forEach((item) => {
                        if (targetProcCds.includes(item.proc_cd)) {
                            newSwitchStates[item.proc_cd] = item.evl_dv !== undefined;
                        }
                    });
                    return { ...prev, ...newSwitchStates };
                });

                setGuideValue((prev) => {
                    const newGuideValue = {};
                    data.proc_info
                        .filter((item) => targetProcCds.includes(item.proc_cd))
                        .forEach((item) => {
                            if (item.evl_dv !== undefined && item.evl_dv.evl_dv_bthd !== undefined) {
                                newGuideValue[item.proc_cd] = item.evl_dv.evl_dv_bthd;
                            }
                        });
                    return { ...prev, ...newGuideValue };
                });
                setRows(newRowsState);
                setRadioValue((prev) => {
                    const clgData = data.proc_info.find((item) => item.proc_cd === 'hpm_group01015_cm0002');
                    return clgData && clgData?.clg_chc_mthd !== undefined
                        ? clgData.clg_chc_mthd.clg_chc_mthd
                        : 'trpr_chc';
                });
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);
    useEffect(() => {
        const newSwitchStates = {};
        procItem.forEach((item) => {
            newSwitchStates[item.proc_cd] = checkTotalWgvl(item);
        });
        setSwitchStates(newSwitchStates);
    }, []);
    // 유효성 체크
    useEffect(() => {
        const allValid = procItem.every((proc) => {
            // "hpm_group"으로 시작하는 키들을 필터링합니다.
            const groupKeys = Object.keys(proc).filter((key) => key.startsWith('hpm_group'));
            // 만약 해당 항목에 hpm_group 데이터가 없으면 true로 간주하거나, 필요에 따라 false로 간주할 수 있습니다.
            // 여기서는 hpm_group 데이터가 존재하면 그 값들을 검사합니다.
            return groupKeys.every((key) => proc[key]?.evlfmItem && proc[key].evlfmItem.length >= 1);
        });
        if (allValid && procItem.length !== 0) {
            console.log('save !!!');
            setValidation((prev) => ({
                ...prev,
                type: 'cm001-3',
                validation: true,
            }));
            setData((prev) => ({
                ...prev,
                proc_info: procItem,
            }));
        } else {
            setValidation((prev) => ({
                ...prev,
                validation: false,
                message: '선택되지 않은 평가양식이 있습니다.',
            }));
        }
    }, [procItem]);
    return (
        <div className={styles.evalSetting}>
            <div className={styles.wrap}>
                {procItem?.map((item, index) => {
                    // 'item.proc_cd'와 같은 평가 양식만 필터링
                    const procRows = rows.filter((row) => row.id === item.proc_cd);
                    const totalWgvl = procRows.reduce((sum, row) => sum + parseInt(row.wgvl, 10), 0);
                    const switchChecked = switchStates[item.proc_cd] || false;
                    const guideChecked = guideSwitch[item.proc_cd] || false;
                    return (
                        <section key={item.proc_cd} className={styles.section}>
                            <div className={`${styles.title}`}>
                                {item.proc_cd === 'hpm_group01015_cm0001' ? (
                                    <IcoPersonFill fill='#666666' />
                                ) : item.proc_cd === 'hpm_group01015_cm0002' ? (
                                    <IcoCoworker fill='#666666' />
                                ) : item.proc_cd === 'hpm_group01015_cm0003' ? (
                                    <IcoUpEvaluation fill='#666666' />
                                ) : item.proc_cd === 'hpm_group01015_cm0009' ? (
                                    <IcoGroup fill='#666666' />
                                ) : (
                                    <IcoDownEvaluation fill='#666666' />
                                )}
                                {item.com_cd_nm}
                                <Button className={styles.btnEditTitle}>
                                    <IcoEdit fill='#666666' />
                                </Button>
                            </div>
                            <div className={styles.selectEvalSystem}>
                                {/* 자기평가 - 일반 평가지 조회 */}
                                <div className={styles.basicSystem}>
                                    {item.hpm_group01018_cm0001 !== undefined && seperateYn === 'Y' ? (
                                        <>
                                            <Typography>
                                                직군별 양식을 설정하지 않은 직군은 디폴트 설정을 따릅니다.
                                            </Typography>
                                            <Typography>기본</Typography>
                                            <BoxSelect
                                                id={`evlfm-select-${item.proc_cd}`}
                                                placeholder='템플릿을 선택해 주세요.'
                                                label='일반 평가 방식'
                                                asterisk
                                                vertical
                                                validationText='필수 선택 항목입니다.'
                                                error={false}
                                                value={item.hpm_group01018_cm0001?.evlfmItem[0]?.evlfm_id || ''}
                                                onChange={(e) => {
                                                    handleSelectedChange(
                                                        e,
                                                        item.proc_cd,
                                                        'hpm_group01018_cm0001',
                                                        '기본'
                                                    );
                                                }}
                                                options={
                                                    evlfm?.hpm_group01018_cm0001?.map((evlfmItem) => ({
                                                        value: String(evlfmItem.evlfm_id),
                                                        label: evlfmItem.evlfm_nm,
                                                    })) || []
                                                }
                                            />
                                            {additionalForms?.map((form) => (
                                                <div key={form.id}>
                                                    <BoxSelect
                                                        id={`select-${form.id}`}
                                                        placeholder='템플릿을 선택해 주세요.'
                                                        label='일반 평가 방식'
                                                        value={form.evlfm_id || ''}
                                                        vertical
                                                        onChange={(e) =>
                                                            handleAdditionalSelectChange(form.id, e.target.value)
                                                        }
                                                        displayEmpty
                                                        options={
                                                            jbgpItem?.map((option) => ({
                                                                key: option.jbgp_cd,
                                                                value: String(option.jbgp_cd),
                                                                label: option.jbgp_nm,
                                                            })) || []
                                                        }
                                                    />
                                                    <IconButton color='error' onClick={() => handleDeleteForm(form.id)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </div>
                                            ))}
                                            <Stack
                                                direction={'row'}
                                                spacing={1}
                                                sx={{ justifyContent: 'center', alignItems: 'center' }}
                                            >
                                                <Button onClick={handleAddForm}>+ 직군별 양식 추가</Button>
                                            </Stack>
                                        </>
                                    ) : null}
                                    {item.hpm_group01018_cm0001 !== undefined && seperateYn !== 'Y' ? (
                                        <BoxSelect
                                            id={item.evlfm_id}
                                            placeholder='템플릿을 선택해 주세요.'
                                            value={item.hpm_group01018_cm0001?.evlfmItem[0]?.evlfm_id || ''}
                                            label='일반 평가 방식'
                                            vertical
                                            onChange={(e) => {
                                                handleSelectedChange(e, item.proc_cd, 'hpm_group01018_cm0001', '기본');
                                            }}
                                            options={(evlfm?.hpm_group01018_cm0001 || []).map((evlfmItem) => ({
                                                value: String(evlfmItem.evlfm_id),
                                                label: evlfmItem.evlfm_nm,
                                            }))}
                                        />
                                    ) : null}
                                </div>
                                {/* 업적 평가지 조회 */}
                                {item.hpm_group01018_cm0002 !== undefined ? (
                                    <BoxSelect
                                        id='demo-simple-select'
                                        label='업적 평가 방식'
                                        placeholder='템플릿을 선택해주세요.'
                                        vertical
                                        value={item.hpm_group01018_cm0002?.evlfmItem[0]?.evlfm_id || ''}
                                        onChange={(e) => {
                                            handleSelectedChange(e, item.proc_cd, 'hpm_group01018_cm0002', '기본');
                                        }}
                                        options={(evlfm?.hpm_group01018_cm0002 || []).map((evlfmItem) => ({
                                            value: String(evlfmItem.evlfm_id),
                                            label: evlfmItem.evlfm_nm,
                                        }))}
                                    />
                                ) : null}

                                {/* 종합 평가지 조회 */}
                                {item.hpm_group01018_cm0003 !== undefined ? (
                                    <div>
                                        <BoxSelect
                                            id='demo-simple-select'
                                            label='종합 평가 방식'
                                            placeholder='템플릿을 선택해주세요.'
                                            vertical
                                            value={item.hpm_group01018_cm0003?.evlfmItem[0]?.evlfm_id || ''}
                                            onChange={(e) => {
                                                handleSelectedChange(e, item.proc_cd, 'hpm_group01018_cm0003', '기본');
                                            }}
                                            options={(evlfm?.hpm_group01018_cm0003 || []).map((item) => ({
                                                value: String(item.evlfm_id),
                                                label: item.evlfm_nm,
                                            }))}
                                        />
                                    </div>
                                ) : null}
                            </div>
                            <div className={styles.totalScore}>
                                <div className={styles.subTitle}>
                                    <Typography type='section'> 종합 점수 계산(선택)</Typography>
                                    <Switch
                                        checked={switchStates[item.proc_cd] || false}
                                        onChange={(checked) => handleSwitchChange(checked, item.proc_cd, 'calc')}
                                        className={styles.switch}
                                    />
                                </div>
                                <div className={styles.desc}>
                                    일반/업적 템플릿에 적용한 가중치와 환산 점수로 계산된 종합 점수를 보여줄 수
                                    있습니다.
                                </div>
                            </div>
                            {switchChecked && (
                                <>
                                    <div className={styles.tbl}>
                                        <DataGridPremium
                                            rows={procRows}
                                            columns={columns}
                                            getRowId={(row) => `${row.id}_${row.evlfm_id}_${index}`}
                                            processRowUpdate={(updatedRow, originalRow) => {
                                                return processRowUpdate(updatedRow, originalRow);
                                            }}
                                            isCellEditable={(params) =>
                                                params.row.id === 'hpm_group01015_cm0002' ||
                                                params.row.id === 'hpm_group01015_cm0003'
                                                    ? false
                                                    : true
                                            }
                                            onProcessRowUpdateError={(error) => console.log(error)}
                                            sx={{
                                                width: '463px',
                                            }}
                                        />
                                    </div>
                                    {totalWgvl === 100 ? (
                                        <Typography fontWeight={'bold'}>총 가중치 {totalWgvl}%</Typography>
                                    ) : (
                                        <Typography color='#E33131' fontWeight={'bold'}>
                                            총 가중치 {totalWgvl}%
                                        </Typography>
                                    )}
                                </>
                            )}
                            {!['hpm_group01015_cm0001', 'hpm_group01015_cm0002', 'hpm_group01015_cm0003'].includes(
                                item.proc_cd
                            ) && (
                                <>
                                    <div className={styles.subTitle}>
                                        <Typography type='section'>종합 등급 배분 가이드</Typography>
                                        <Switch
                                            checked={guideSwitch[item.proc_cd] || false}
                                            onChange={(checked) => handleSwitchChange(checked, item.proc_cd, 'guide')}
                                            className={styles.switch}
                                        />
                                    </div>
                                    <div className={styles.desc}>종합 평가자에게 등급별 배분 가이드를 제공합니다.</div>
                                </>
                            )}
                            {guideChecked && (
                                <div className={styles.levelGuide}>
                                    <RadioGroup
                                        aria-labelledby='demo-controlled-radio-buttons-group'
                                        name='controlled-radio-buttons-group'
                                        value={guideValue[item.proc_cd]}
                                        onChange={(e) => {
                                            handleRadioChange(e, 'guide', item.proc_cd);
                                        }}
                                        sx={{ flexDirection: 'column' }}
                                    >
                                        <Radio
                                            id={`radio-nope_bthd-${item.proc_cd}`}
                                            name='controlled-radio-buttons-group'
                                            label='배분 가이드에 안 맞을 때 제출 제한(인원 수)'
                                            value='nope_bthd'
                                            checked={guideValue[item.proc_cd] === 'nope_bthd'}
                                            onChange={() =>
                                                handleRadioChange(
                                                    { target: { value: 'nope_bthd' } },
                                                    'guide',
                                                    item.proc_cd
                                                )
                                            }
                                        />
                                        <div className={styles.rdoDesc}>
                                            평가 대상자 수에 따라 배분 가이드를 제공하고, 가이드에 안 맞을 시 제출을
                                            제한합니다.
                                            {guideValue[item.proc_cd] === 'nope_bthd' && (
                                                <div className={styles.depthWrap}>
                                                    <Checkbox
                                                        label='사유 작성 시 제출 가능'
                                                        value='rsn_yn'
                                                        checked={item?.evl_dv?.rsn_yn === 'Y'}
                                                        onChange={(e) => {
                                                            handleCheckChange(e, 'rsn_yn', item.proc_cd);
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <Radio
                                            id={`radio-rt_bthd-${item.proc_cd}`}
                                            name='controlled-radio-buttons-group'
                                            label='배분 가이드만 제공(비율)'
                                            value='rt_bthd'
                                            checked={guideValue[item.proc_cd] === 'rt_bthd'}
                                            onChange={() =>
                                                handleRadioChange(
                                                    { target: { value: 'rt_bthd' } },
                                                    'guide',
                                                    item.proc_cd
                                                )
                                            }
                                        />
                                        <div className={styles.rdoDesc}>
                                            배분 비율을 가이드 하되, 권장 인원을 벗어나도 제출할 수 있습니다.
                                        </div>
                                    </RadioGroup>
                                </div>
                            )}
                            {item.proc_cd === 'hpm_group01015_cm0002' && (
                                <>
                                    <div className={styles.subTitle}>
                                        <Typography type='section'> 동료 선택 방식</Typography>
                                    </div>
                                    <div className={styles.desc}>
                                        평가 대상자를 평가할 동료를 어떻게 선정할 것인지 선택해주세요.
                                    </div>
                                    <div className={styles.evlCoworker}>
                                        <RadioGroup
                                            aria-labelledby='demo-controlled-radio-buttons-group'
                                            name='controlled-radio-buttons-group'
                                            value={radioValue}
                                            onChange={(e) => {
                                                handleRadioChange(e, 'calc', null);
                                            }}
                                        >
                                            <div className={styles.radioGroup}>
                                                <Radio
                                                    id='radio-trpr_chc'
                                                    name='controlled-radio-buttons-group'
                                                    label='평가 대상자가 선택'
                                                    value='trpr_chc'
                                                    checked={radioValue === 'trpr_chc'}
                                                    onChange={() =>
                                                        handleRadioChange(
                                                            { target: { value: 'trpr_chc' } },
                                                            'calc',
                                                            null
                                                        )
                                                    }
                                                />

                                                {radioValue === 'trpr_chc' && (
                                                    <div className={styles.depthWrap}>
                                                        <Checkbox
                                                            label='리더의 승인 필요'
                                                            value='value'
                                                            checked={item?.clg_chc_mthd?.ldr_aprv_yn === 'Y'}
                                                            onChange={(checked) => {
                                                                handleCheckChange(checked, 'leader', item.proc_cd);
                                                            }}
                                                        />
                                                    </div>
                                                )}

                                                <Radio
                                                    id='radio-ldr_chc'
                                                    name='controlled-radio-buttons-group'
                                                    label='평가 대상자의 리더가 선택'
                                                    value='ldr_chc'
                                                    checked={radioValue === 'ldr_chc'}
                                                    onChange={() =>
                                                        handleRadioChange(
                                                            { target: { value: 'ldr_chc' } },
                                                            'calc',
                                                            null
                                                        )
                                                    }
                                                />

                                                <Radio
                                                    id='radio-operr_chc'
                                                    name='controlled-radio-buttons-group'
                                                    label='운영자가 선택'
                                                    value='operr_chc'
                                                    checked={radioValue === 'operr_chc'}
                                                    onChange={() =>
                                                        handleRadioChange(
                                                            { target: { value: 'operr_chc' } },
                                                            'calc',
                                                            null
                                                        )
                                                    }
                                                />
                                            </div>
                                        </RadioGroup>
                                        {radioValue !== 'operr_chc' && (
                                            <div className={styles.howManyPeople}>
                                                <div className={styles.subTitle}>
                                                    <Typography type='section'>참여 동료 인원</Typography>
                                                </div>
                                                <div className={styles.desc}>
                                                    몇 명의 동료가 평가에 참여할게 할 것인지 설정해주세요. 3명 이상을
                                                    권장합니다.
                                                </div>
                                                <div className={styles.countPeople}>
                                                    <label className={styles.label}>최소</label>
                                                    <div className={styles.txtfield}>
                                                        <TextField
                                                            variant='outlined'
                                                            size='small'
                                                            value={item?.ptcp_clg_nope?.min_nope || ''}
                                                            onChange={(e) => handleClgNopeChange(e, 'min_nope')}
                                                            type='number'
                                                        />
                                                    </div>
                                                    <span className={styles.unit}>명</span>
                                                    <label className={styles.label}>최대</label>
                                                    <div className={styles.txtfield}>
                                                        <TextField
                                                            variant='outlined'
                                                            size='small'
                                                            value={item?.ptcp_clg_nope?.max_nope || ''}
                                                            onChange={(e) => handleClgNopeChange(e, 'max_nope')}
                                                            type='number'
                                                        />
                                                    </div>
                                                    <span className={styles.unit}>명</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </section>
                    );
                })}
            </div>
        </div>
    );
}
