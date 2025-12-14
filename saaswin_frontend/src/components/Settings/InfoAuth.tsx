'use client';
import { Box, Divider, Stack, Switch, Typography } from '@mui/material';
import { useState } from 'react';

export default function SettingScreen() {
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
    const groupedData = data.reduce((acc, item) => {
        if (!acc[item.type]) acc[item.type] = [];
        acc[item.type].push(item);
        return acc;
    }, {} as Record<string, typeof data>);

    // 그룹별 정렬
    for (const type in groupedData) {
        groupedData[type].sort((a, b) => parseInt(a.seq) - parseInt(b.seq));
    }
    const [switches, setSwitches] = useState(groupedData);
    const handleSwitchesChange = (type: string, id: string) => {
        setSwitches((prev) => ({
            ...prev,
            [type]: prev[type].map((item) => (item.id === id ? { ...item, isTrue: !item.isTrue } : item)),
        }));
    };

    // const flattenData = Object.values(groupedData).flat();
    return (
        <>
            {Object.entries(switches).map(([type, items]) => (
                <Box sx={{ p: 2, pr: 5 }} key={type}>
                    <Typography variant="h4" sx={{ pb: 2 }}>
                        {type === 'HrInfo' ? '인사운영' : type === 'bosang' ? '보상관리' : ''}
                    </Typography>
                    <Box>
                        {items.map((item) => (
                            <Stack
                                key={item.id}
                                direction="row"
                                spacing={2}
                                alignItems="center"
                                sx={{
                                    pl: 2,
                                    justifyContent: 'space-between',
                                    marginBottom: 2, // 각 항목 간격
                                }}
                            >
                                <Typography minWidth={'130px'}>{item.title}</Typography>
                                <Switch onChange={() => handleSwitchesChange(type, item.id)} checked={item.isTrue} />
                            </Stack>
                        ))}
                    </Box>
                    <Divider sx={{ my: 2 }} />
                </Box>
            ))}
        </>
    );
}
