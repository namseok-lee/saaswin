'use client';
import { Box, Button, Divider, MenuItem, Select, Stack, Switch, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { fetcherPost, fetcherPostCmcd } from 'utils/axios';

export default function SlryTrprCrtrSetting() {
    const data = [
        { id: '인사 정보', type: 'HrInfo', title: '인사 정보', seq: '1', isTrue: true },
        { id: '개인 정보', type: 'HrInfo', title: '개인 정보', seq: '2', isTrue: false },
        { id: '업무 정보', type: 'HrInfo', title: '업무 정보', seq: '3', isTrue: true },
        { id: '경력, 학력, 역량 정보', type: 'HrInfo', title: '경력, 학력, 역량 정보', seq: '4', isTrue: false },
        { id: '신청 문서', type: 'HrInfo', title: '신청 문서', seq: '5', isTrue: true },
        { id: '계약 문서', type: 'HrInfo', title: '계약 문서', seq: '6', isTrue: false },
        { id: '근무 정보', type: 'HrInfo', title: '근무 정보', seq: '7', isTrue: true },
        { id: '휴가 정보', type: 'HrInfo', title: '휴가 정보', seq: '8', isTrue: false },
        { id: '출장 정보', type: 'HrInfo', title: '출장 정보', seq: '9', isTrue: true },
        { id: '급여 지급', type: 'bosang', title: '급여 지급', seq: '1', isTrue: false },
        { id: '급여 관리정보', type: 'bosang', title: '급여 관리정보', seq: '2', isTrue: true },
        { id: '계약 정보', type: 'bosang', title: '계약 정보', seq: '3', isTrue: true },
        { id: '예산 관리정보', type: 'bosang', title: '예산 관리정보', seq: '4', isTrue: true },
        { id: '회계 정보', type: 'bosang', title: '회계 정보', seq: '5', isTrue: false },
    ];


    const trprData = [
        {
            type: 'hrb_group00578_cm0001',
            type_nm: '급여',
            use_yn: 'Y',
            seq: '1',
            crtr: [
                {
                    type: 'and',
                    cnd: [
                        {
                            cnd_cd: 'hdof_yn_cm0001',
                            cnd_nm: '재직여부',
                            cnd_type: 'combo',
                            sqlId: 'hpo_group00191||COMGRP',
                            value: ['hpo_group00191_cm0001'],
                            related: [
                                {
                                    cnd_cd: 'rsgntn_ymd_cm0001',
                                    cnd_nm: '퇴직일자',
                                    cnd_type: 'combo',
                                    sqlId: '',
                                    value: ['end_ymd'],
                                },
                            ],
                        },
                        {
                            cnd_cd: 'hdof_yn_cm0002',
                            cnd_nm: '재직여부',
                            cnd_type: 'combo',
                            sqlId: 'hpo_group00191||COMGRP',
                            value: 'hpo_group00191_cm0002',
                            related: [
                                {
                                    cnd_cd: 'rsgntn_ymd_cm0002',
                                    cnd_nm: '퇴직일자',
                                    cnd_type: 'combo',
                                    sqlId: '',
                                    value: ['null', 'end_ymd'],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            type: 'hrb_group00578_cm0012',
            type_nm: '경평포상금',
            seq: '12',
            use_yn: 'Y',
            crtr: [
                {
                    type: 'and',
                    cnd: [
                        {
                            cnd_cd: 'hdof_yn_cm0001',
                            cnd_nm: '재직여부',
                            cnd_type: 'combo',
                            cnd_seq: '1',
                            sqlId: 'hpo_group00191||COMGRP',
                            value: ['hpo_group00191_cm0001'],
                            related: [
                                {
                                    cnd_cd: 'rsgntn_ymd_cm0001',
                                    cnd_nm: '퇴직일자',
                                    cnd_type: 'combo',
                                    cnd_seq: '1',
                                    sqlId: '',
                                    value: ['end_ymd'],
                                },
                            ],
                        },
                        {
                            cnd_cd: 'hdof_yn_cm0002',
                            cnd_nm: '재직여부',
                            cnd_type: 'combo',
                            cnd_seq: '2',
                            sqlId: 'hpo_group00191||COMGRP',
                            value: ['hpo_group00191_cm0002'],
                            related: [
                                {
                                    cnd_cd: 'rsgntn_ymd_cm0002',
                                    cnd_nm: '퇴직일자',
                                    cnd_type: 'combo',
                                    cnd_seq: '1',
                                    sqlId: '',
                                    value: ['null', 'end_ymd'],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            type: 'hrb_group00578_cm0002',
            type_nm: '정기상여',
            seq: '2',
            use_yn: 'Y',
            crtr: [
                {
                    type: 'and',
                    cnd: [
                        {
                            cnd_cd: 'hdof_yn_cm0001',
                            cnd_nm: '재직여부',
                            cnd_type: 'combo',
                            cnd_seq: '1',
                            sqlId: 'hpo_group00191||COMGRP',
                            value: ['hpo_group00191_cm0001'],
                            related: [
                                {
                                    cnd_cd: 'cnts_se_cd_cm0001',
                                    cnd_nm: '계약구분',
                                    cnd_type: 'combo',
                                    cnd_seq: '2',
                                    sqlId: 'hpo_group00263||COMGRP',
                                    value: ['hpo_group00263_cm0001'],
                                },
                                {
                                    cnd_cd: 'emp_se_cd_cm0001',
                                    cnd_nm: '직원구분',
                                    cnd_type: 'combo',
                                    cnd_seq: '1',
                                    sqlId: 'hpo_group00263||COMGRP',
                                    value: ['hpo_group00263_cm0001'],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ];

    

    // 그룹별 정렬
    // for (const type in cndData) {
    //     cndData[type].sort((a, b) => parseInt(a.seq) - parseInt(b.seq));
    // }
    const [switches, setSwitches] = useState(false);
    const [trptCndData, setTrprCndData] = useState(null);
    const [comboData, setComboData] = useState(null);
    const handleSwitchesChange = () => {
        setSwitches((prev) => !prev);
    };

    const cndData = trptCndData?
        .sort((a, b) => Number(a.seq) - Number(b.seq))
        .reduce((acc, item) => {
            acc[item.type] = item.crtr[0].cnd;
            return acc;
        }, []);

    const extractCDs = (data) => {
        let cdList = [];

        data.forEach(item => {
            const cndList = item.crtr[0].cnd;

            cndList.forEach(cndIitem => {
                if (cndIitem.cnd_type === 'combo') {
                    if(cndIitem.sqlId !== '' && cndIitem.sqlId !== null){
                        cdList.push(cndIitem.sqlId);
                    }
                   
                }
        
                // related 배열이 존재할 경우 추가 탐색
                if (Array.isArray(cndIitem.related)) {
                    cndIitem.related.forEach(relatedItem => {
                        if (relatedItem.cnd_type === 'combo') {
                            if(relatedItem.sqlId !== '' && relatedItem.sqlId !== null){
                                cdList.push(relatedItem.sqlId);
                            }
                            
                        }
                    });
                }

            });
            
        });
    
        return cdList;
    };


    useEffect(() => {
        if(trprData){
            setTrprCndData(trprData);

            const cdList = extractCDs(trprData).reduce((acc, item) => {
                if (!acc.some((combo) => combo === item)) {
                    acc.push(item);
                }
                return acc;
            }, []);

            if (cdList.length > 0) {
                cdList.forEach((data) => {
                    const cd = data.split('||')[0];
                    const rprs_ognz_no = data.split('||')[1];
                    
                    fetcherPostCmcd({ group_cd: cd, rprs_ognz_no: rprs_ognz_no })
                        .then((response) => {
                            setComboData((prev) => ({
                                ...prev,
                                [cd+'||'+rprs_ognz_no]: response,
                            }));
                        })
                        .catch((error) => {
                            console.error(error);
                        });
                });
            }
        }
        
    }, [])

      const handleSwitchesTypeChange = (type: string, useYn:string) => {
        setTrprCndData((prev) => 
            prev.map(item =>
                item.type === type
                    ? { ...item, use_yn: useYn }
                    : item
            )
        );
    };

    const handleChange = (type: string, cnd_cd: string, value:string) => {
        setTrprCndData(prevData =>
            prevData.map(item =>  item.type === type
                ? {
                ...item,
                crtr: item.crtr.map(crtrItem => ({
                    ...crtrItem,
                    cnd: crtrItem.cnd.map(cndItem => ({
                        ...cndItem,
                        value: cndItem.cnd_cd === cnd_cd ? value : cndItem.value, 
                        related: cndItem.related?.map(relatedItem =>
                            relatedItem.cnd_cd === cnd_cd
                                ? { ...relatedItem, value: value } 
                                : relatedItem
                        )
                    }))
                }))
            }: item)
        );
    };

    return (
        <Box sx={{ p: 2, pr: 5 }}>
            <Stack
                direction="row"
                spacing={2}
                alignItems="center" 
                sx={{
                    pl: 2,
                    pr: 2,
                    justifyContent: 'space-between',
                    marginBottom: 2, // 각 항목 간격
                }}
            >
                <Typography variant="h4" sx={{ pb: 2 }}>
                    {'급여대상자 생성 기준 설정'}
                </Typography>
                <Button variant="contained" color="primary" size="small">
                    저장
                </Button>
            </Stack>
            <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{
                    pl: 2,
                    justifyContent: 'flex-start',
                    marginBottom: 2, // 각 항목 간격
                }}
            >
                <Typography variant="h4">{'정기급여 시 퇴직급여 처리 여부'}</Typography>
                <Switch onChange={handleSwitchesChange} checked={switches} />
            </Stack>
            <Box>
                {trptCndData?.map((item) => (
                    <>
                        <Stack
                            key={item.type}
                            direction="row"
                            spacing={2}
                            alignItems="center"
                            flexWrap="wrap"
                            sx={{
                                pl: 2,
                                justifyContent: 'flex-start',
                                marginBottom: 2, // 각 항목 간격
                            }}
                        >
                            <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                                sx={{
                                    pl: 2,
                                    pb: 2,
                                    justifyContent: 'flex-start',
                                    marginBottom: 2, // 각 항목 간격
                                }}
                            >
                                <Typography minWidth={'130px'}>{item.type_nm}</Typography>
                                <Switch onChange={(e) => handleSwitchesTypeChange(item.type, e.target.checked ? 'Y':'N')} checked={item.use_yn === 'Y' ? true : false} />
                            </Stack>
                            {item.use_yn === 'Y' &&
                                cndData[item.type] &&
                                cndData[item.type].map((items) => (
                                    <React.Fragment key={items.cnd_seq}>
                                        <Box sx={{ width: '100%' }} />
                                        <Stack
                                            direction="row"
                                            spacing={2}
                                            alignItems="center"
                                            sx={{
                                                pl: 2,
                                                pb: 2,
                                                justifyContent: 'space-between',
                                                marginBottom: 2,
                                            }}
                                        >
                                            <Typography minWidth={'130px'}>{items.cnd_nm}</Typography>
                                            {items.cnd_type === 'switch' ? (
                                                <Switch checked={items.value === 'Y' ? true : false} />
                                            ) : items.cnd_type === 'combo' ? (
                                                <Select
                                                    id="personal-experience"
                                                    value={Array.isArray(items.value) ? items.value : ['']}
                                                    sx={{ width: '180px', height: '40px' ,
                                                        '& .MuiSelect-select': {
                                                            display: 'flex',
                                                            alignItems: 'center', // ✅ 수직 중앙 정렬
                                                            justifyContent: 'flex-start', // ✅ 수평 중앙 정렬
                                                            textAlign: 'left',
                                                            height: '100%', // 높이를 부모에 맞춤
                                                        },}}
                                                    multiple
                                                    onChange={(e) => handleChange(item.type, items.cnd_cd, e.target.value)}
                                                >
                                                    <MenuItem value="">선택안함</MenuItem>
                                                    {comboData 
                                                        ? comboData[items.sqlId]?.map((comboItem, index) => (
                                                                <MenuItem key={index} value={comboItem.com_cd}>
                                                                    {comboItem.com_cd_nm}
                                                                </MenuItem>
                                                            ))
                                                        : null}
                                                </Select>
                                            ) : items.cnd_type === 'input' ? (
                                                <TextField fullWidth size="small" sx={{ width: '200px' }} />
                                            ) : (
                                                ''
                                            )}
                                        </Stack>
                                        {items.related &&
                                            items.related.sort((a, b) => Number(a.cnd_seq) - Number(b.cnd_seq)).map((relatedItem) => (
                                                <Stack
                                                    key={relatedItem.cnd_seq}
                                                    direction="row"
                                                    spacing={2}
                                                    alignItems="center"
                                                    sx={{
                                                        pl: 2,
                                                        pb: 2,
                                                        justifyContent: 'space-between',
                                                        marginBottom: 2,
                                                    }}
                                                >
                                                    <Typography minWidth={'130px'}>{relatedItem.cnd_nm}</Typography>
                                                    {relatedItem.cnd_type === 'switch' ? (
                                                        <Switch checked={relatedItem.value === 'Y' ? true : false} />
                                                    ) : relatedItem.cnd_type === 'combo' ? (
                                                        <Select
                                                            id="personal-experience-related"
                                                            value={
                                                                Array.isArray(relatedItem.value)
                                                                    ? relatedItem.value
                                                                    : ['']
                                                            }
                                                            sx={{ width: '180px', height: '40px' }}
                                                            multiple
                                                            onChange={(e) => handleChange(item.type, relatedItem.cnd_cd, e.target.value)}
                                                        >
                                                            <MenuItem value="">선택안함</MenuItem>
                                                        {comboData?.[relatedItem.sqlId]
                                                            ? comboData[relatedItem.sqlId]?.map((comboItem, index) => (
                                                                    <MenuItem key={index} value={comboItem.com_cd}>
                                                                        {comboItem.com_cd_nm}
                                                                    </MenuItem>
                                                                ))
                                                            : [
                                                                <MenuItem key="null" value="null">퇴직일자 없음</MenuItem>,
                                                                <MenuItem key="end_ymd" value="end_ymd">산정기간 종료일자</MenuItem>
                                                            ]}
                                                            {/* <MenuItem value="null">퇴직일자 없음</MenuItem>
                                                            <MenuItem value="end_ymd">산정기간 종료일자</MenuItem> */}
                                                        </Select>
                                                    ) : relatedItem.cnd_type === 'input' ? (
                                                        <TextField fullWidth size="small" sx={{ width: '200px' }} />
                                                    ) : (
                                                        ''
                                                    )}
                                                </Stack>
                                            ))}
                                    </React.Fragment>
                                ))}
                        </Stack>
                        <Divider sx={{ my: 2 }} />
                    </>
                ))}
            </Box>
        </Box>
    );
}
