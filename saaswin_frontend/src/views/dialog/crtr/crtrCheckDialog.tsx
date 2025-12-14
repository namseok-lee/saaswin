import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Button,
    Grid,
    Typography,
    Box,
} from '@mui/material';
import { randomId } from '@mui/x-data-grid-generator';
import { fetcherPostCmcd } from 'utils/axios';

// 첫번째 컬럼이랑 조직유형코드 받기
const CrtrCheckDialog = ({ open, onClose, setMasterData, gridData, scr_no, param }) => {
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [organizationTypes, setOrganizationTypes] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const auth = JSON.parse(localStorage.getItem('auth'));
    const rprsOgnzNo = auth?.state?.rprsOgnzNo ?? '';
    const groupData = param.groupData;
    const nm_data = param.nmData;
    const cd_data = param.cdData;
    const title = param.title;
    const description = param.description;

    useEffect(() => {
        if (groupData !== '') {
            fetcherPostCmcd({
                group_cd: groupData,
                rprs_ognz_no: 'COMGRP',
            })
                .then((response) => {
                    setOrganizationTypes(response);
                })
                .catch((error) => {
                    console.error(error);
                });
        } else {
            setOrganizationTypes([]);
            setSelectedTypes([]);
            setSelectAll(false);
        }
    }, [scr_no]);

    // 개별 체크박스 선택 핸들러
    const handleCheckboxChange = (type) => {
        setSelectedTypes((prev) =>
            prev.some((t) => t.cd_prord === type.cd_prord)
                ? prev.filter((t) => t.cd_prord !== type.cd_prord)
                : [...prev, type]
        );
    };
    // 전체 선택 핸들러
    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedTypes([]); // 전체 해제
        } else {
            setSelectedTypes(organizationTypes); // 전체 선택
        }
        setSelectAll(!selectAll);
    };

    const handleMasterData = () => {
        const transformedData = [];

        selectedTypes.forEach((item, index) => {
            const newObj = {};
            const id = randomId(); // 고유 ID 추가
            const formattedNumber = (index + 1).toString().padStart(4, '0');

            gridData.forEach(({ id }) => {
                newObj[id] = item[id] || null; // 해당 키가 없으면 null로 설정
            });

            newObj.id = id;
            newObj.seq = index + 1;
            newObj.sort_seq = index + 1;
            newObj.bgng_ymd = item.bgng_ymd;
            newObj.end_ymd = item.end_ymd;
            newObj[nm_data] = item.com_cd_nm;
            newObj[cd_data] = rprsOgnzNo + formattedNumber;
            newObj.isNew = true;

            if (nm_data === 'duty_nm') newObj.hierarchy = item.com_cd_nm;

            if (index === 0) {
                newObj.status = 'clicked';
            } else {
                newObj.status = 'new';
            }

            transformedData.push(newObj);
        });

        setMasterData(transformedData);
        setTimeout(() => {
            onClose();
        }, 100);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
            {/* 제목 데이터로 받아야함 */}
            <DialogTitle>{title}</DialogTitle>

            <DialogContent>
                {/* 설명 문구 데이터로 받아야함*/}
                <Typography variant='body2' color='textSecondary' sx={{ mb: 2 }}>
                    {description}
                </Typography>

                {/* 전체 선택 체크박스 */}
                <FormControlLabel
                    control={<Checkbox checked={selectAll} onChange={handleSelectAll} />}
                    label='전체 선택'
                    sx={{ mb: 2 }}
                />

                {/* 조직유형 체크박스 리스트 */}
                <Box sx={{ border: '1px solid #ccc', borderRadius: 2, p: 2 }}>
                    <Grid container spacing={2}>
                        {organizationTypes.map((type) => (
                            <Grid item xs={4} key={type.cd_prord}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={selectedTypes.some((t) => t.cd_prord === type.cd_prord)}
                                            onChange={() => handleCheckboxChange(type)}
                                        />
                                    }
                                    label={type.com_cd_nm}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* 버튼 영역 */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Button variant='contained' color='primary' sx={{ mx: 1 }} onClick={handleMasterData}>
                        선택 적용하기
                    </Button>
                    <Button variant='contained' color='secondary' sx={{ mx: 1 }} onClick={onClose}>
                        직접 등록하기
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default CrtrCheckDialog;
