'use client';
import React, { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { Box, Collapse, List, ListItemButton, ListItemText } from '@mui/material';
import { useSheetStore } from 'utils/store/sheet';
import dayjs from 'dayjs';
import { IcoArrow, IcoArrowUp } from '@/assets/Icon';

export default function GridUserSelect({ userData, changeDifferRow, userNo, editable }) {
    const [data, setData] = useState(userData);
    const [selectedOption, setSelectedOption] = useState('');
    const [collapseOpen, setCollapseOpen] = useState<Record<string, boolean>>({});
    const [inputValue, setInputValue] = useState('');
    const [filteredData, setFilteredData] = useState(userData);
    const [open, setOpen] = useState(false);
    // const today = dayjs(new Date()).format('YYYYMMDD');

    const gridRef = useSheetStore((state) => state.gridRef);
    const rowId = useSheetStore((state) => state.rowId);

    const handleCollapseToggle = (ognz_no: string, type: string) => {
        if (type === 'search') {
            setCollapseOpen((prev) => ({
                ...prev,
                [ognz_no]: true,
            }));
        } else {
            setCollapseOpen((prev) => ({
                ...prev,
                [ognz_no]: !prev[ognz_no],
            }));
        }
    };

    const handleOptionSelect = (event, option) => {
        setSelectedOption(option?.bsc_info?.korn_flnm || '');
        setCollapseOpen({});
        setOpen(false);
        if (gridRef) {
            const row = gridRef.getRow(rowId);
            const isNew = row.isNew ?? false;
            let updateRow = { ...row, hasChanged: true };
            const matchingkorn_flnm = Object.keys(row).filter((key) => key === 'korn_flnm'); // 성명
            const matchingCallNm = Object.keys(row).filter((key) => key === 'ttl_cd'); // 호칭
            const matchingUserType = Object.keys(row).filter((key) => key === 'lbr_formt_cd'); // 직원구분
            const matchingJbpsNm = Object.keys(row).filter((key) => key === 'jbps_cd'); // 직위
            const matchingJbttlNm = Object.keys(row).filter((key) => key === 'jbttl_cd'); // 직책
            const matchingJncmpYmd = Object.keys(row).filter((key) => key === 'jncmp_ymd'); // 입사일
            const matchingRsYmd = Object.keys(row).filter((key) => key === 'rsgntn_ymd'); // 퇴사일
            const matchingUserNo = Object.keys(row).filter((key) => key === 'user_no'); // 유저번호
            const matchingOgnzNo = Object.keys(row).filter((key) => key === 'dept_no'); // 부서명
            const matchingOgnzNm = Object.keys(row).filter((key) => key === 'ognz_nm'); // 부서명

            const korn_flnmPre = row[matchingkorn_flnm] || null;
            const call_nmPre = row[matchingCallNm] || null;
            const emp_typePre = row[matchingUserType] || null;
            const jbps_nmPre = row[matchingJbpsNm] || null;
            const jbttl_nmPre = row[matchingJbttlNm] || null;
            const jncmp_ymdPre = row[matchingJncmpYmd] || null;
            const rsgntn_ymdPre = row[matchingRsYmd] || null;
            const user_noPre = row[matchingUserNo] || null;
            const ognz_noPre = row[matchingOgnzNo] || null;
            const ognz_nmPre = row[matchingOgnzNm] || null;
            if (option) {
                const korn_flnm = option?.bsc_info?.korn_flnm || null;
                const call_nm = option?.apnt_info?.apnt_ttl_cd || null;
                const emp_type = option?.apnt_info?.apnt_emp_se_cd || null;
                const jbps_nm = option?.apnt_info?.apnt_jbps_cd || null;
                const jbttl_nm = option?.apnt_info?.apnt_jbttl_cd || null;
                const jncmp_ymd = option?.bsc_info?.jncmp_ymd || null;
                const rsgntn_ymd = option?.bsc_info?.rsgntn_ymd || null;
                const user_no = option?.user_no || null;
                const ognz_no = option?.ognz_no || null;
                const ognz_nm = option?.ognz_nm || null;

                if (matchingkorn_flnm.length > 0 && korn_flnm) {
                    if (row[matchingkorn_flnm + 'preValue'] === undefined && !isNew) {
                        updateRow = { ...updateRow, [matchingkorn_flnm + 'preValue']: korn_flnmPre };
                    }
                    updateRow = { ...updateRow, [matchingkorn_flnm]: korn_flnm };
                }
                if (matchingCallNm.length > 0 && call_nm) {
                    if (row[matchingCallNm + 'preValue'] === undefined && !isNew) {
                        updateRow = { ...updateRow, [matchingCallNm + 'preValue']: call_nmPre };
                    }
                    updateRow = { ...updateRow, [matchingCallNm]: call_nm };
                }
                if (matchingUserType.length > 0 && emp_type) {
                    if (row[matchingUserType + 'preValue'] === undefined && !isNew) {
                        updateRow = { ...updateRow, [matchingUserType + 'preValue']: emp_typePre };
                    }
                    updateRow = { ...updateRow, [matchingUserType]: emp_type };
                }
                if (matchingJbttlNm.length > 0 && jbttl_nm) {
                    if (row[matchingJbttlNm + 'preValue'] === undefined && !isNew) {
                        updateRow = { ...updateRow, [matchingJbttlNm + 'preValue']: jbttl_nmPre };
                    }
                    updateRow = { ...updateRow, [matchingJbttlNm]: jbttl_nm };
                }
                if (matchingJncmpYmd.length > 0 && jncmp_ymd) {
                    if (row[matchingJncmpYmd + 'preValue'] === undefined && !isNew) {
                        updateRow = { ...updateRow, [matchingJncmpYmd + 'preValue']: jncmp_ymdPre };
                    }
                    updateRow = {
                        ...updateRow,
                        [matchingJncmpYmd]: dayjs(jncmp_ymd).format('YYYY.MM.DD'),
                    };
                }
                if (matchingRsYmd.length > 0 && rsgntn_ymd) {
                    if (row[matchingRsYmd + 'preValue'] === undefined && !isNew) {
                        updateRow = { ...updateRow, [matchingRsYmd + 'preValue']: rsgntn_ymdPre };
                    }
                    updateRow = {
                        ...updateRow,
                        [matchingRsYmd]: dayjs(rsgntn_ymd).format('YYYY.MM.DD'),
                    };
                }
                if (matchingUserNo.length > 0 && user_no) {
                    if (row[matchingUserNo + 'preValue'] === undefined && !isNew) {
                        updateRow = { ...updateRow, [matchingUserNo + 'preValue']: user_noPre };
                    }
                    updateRow = { ...updateRow, [matchingUserNo]: user_no };
                }
                if (matchingJbpsNm.length > 0 && jbps_nm) {
                    if (row[matchingJbpsNm + 'preValue'] === undefined && !isNew) {
                        updateRow = { ...updateRow, [matchingJbpsNm + 'preValue']: jbps_nmPre };
                    }
                    updateRow = { ...updateRow, [matchingJbpsNm]: jbps_nm };
                }
                if (matchingOgnzNo.length > 0 && ognz_no) {
                    if (row[matchingOgnzNo + 'preValue'] === undefined && !isNew) {
                        updateRow = { ...updateRow, [matchingOgnzNo + 'preValue']: ognz_noPre };
                    }
                    updateRow = { ...updateRow, [matchingOgnzNo]: ognz_no, ognz_no: ognz_no };
                }
                if (matchingOgnzNm.length > 0 && ognz_nm) {
                    if (row[matchingOgnzNm + 'preValue'] === undefined && !isNew) {
                        updateRow = { ...updateRow, [matchingOgnzNm + 'preValue']: ognz_nmPre };
                    }
                    updateRow = { ...updateRow, [matchingOgnzNm]: ognz_nm };
                }
            } else {
                if (matchingkorn_flnm.length > 0) {
                    if (row[matchingkorn_flnm + 'preValue'] === undefined && !isNew) {
                        updateRow = { ...updateRow, [matchingkorn_flnm + 'preValue']: korn_flnmPre };
                    }
                    updateRow = { ...updateRow, [matchingkorn_flnm]: null };
                }
                if (matchingCallNm.length > 0) {
                    if (row[matchingCallNm + 'preValue'] === undefined && !isNew) {
                        updateRow = { ...updateRow, [matchingCallNm + 'preValue']: call_nmPre };
                    }
                    updateRow = { ...updateRow, [matchingCallNm]: null };
                }
                if (matchingUserType.length > 0) {
                    if (row[matchingUserType + 'preValue'] === undefined && !isNew) {
                        updateRow = { ...updateRow, [matchingUserType + 'preValue']: emp_typePre };
                    }
                    updateRow = { ...updateRow, [matchingUserType]: null };
                }
                if (matchingJbttlNm.length > 0) {
                    if (row[matchingJbttlNm + 'preValue'] === undefined && !isNew) {
                        updateRow = { ...updateRow, [matchingJbttlNm + 'preValue']: jbttl_nmPre };
                    }
                    updateRow = { ...updateRow, [matchingJbttlNm]: null };
                }
                if (matchingJncmpYmd.length > 0) {
                    if (row[matchingJncmpYmd + 'preValue'] === undefined && !isNew) {
                        updateRow = { ...updateRow, [matchingJncmpYmd + 'preValue']: jncmp_ymdPre };
                    }
                    updateRow = {
                        ...updateRow,
                        [matchingJncmpYmd]: null,
                    };
                }
                if (matchingRsYmd.length > 0) {
                    if (row[matchingRsYmd + 'preValue'] === undefined && !isNew) {
                        updateRow = { ...updateRow, [matchingRsYmd + 'preValue']: rsgntn_ymdPre };
                    }
                    updateRow = {
                        ...updateRow,
                        [matchingRsYmd]: null,
                    };
                }
                if (matchingUserNo.length > 0) {
                    if (row[matchingUserNo + 'preValue'] === undefined && !isNew) {
                        updateRow = { ...updateRow, [matchingUserNo + 'preValue']: user_noPre };
                    }
                    updateRow = { ...updateRow, [matchingUserNo]: null };
                }
                if (matchingJbpsNm.length > 0) {
                    if (row[matchingJbpsNm + 'preValue'] === undefined && !isNew) {
                        updateRow = { ...updateRow, [matchingJbpsNm + 'preValue']: jbps_nmPre };
                    }
                    updateRow = { ...updateRow, [matchingJbpsNm]: null };
                }
                if (matchingOgnzNo.length > 0) {
                    if (row[matchingOgnzNo + 'preValue'] === undefined && !isNew) {
                        updateRow = { ...updateRow, [matchingOgnzNo + 'preValue']: ognz_noPre };
                    }
                    updateRow = { ...updateRow, [matchingOgnzNo]: null };
                }
                if (matchingOgnzNm.length > 0) {
                    if (row[matchingOgnzNm + 'preValue'] === undefined && !isNew) {
                        updateRow = { ...updateRow, [matchingOgnzNm + 'preValue']: ognz_nmPre };
                    }
                    updateRow = { ...updateRow, [matchingOgnzNm]: null };
                }
            }
            changeDifferRow(updateRow, row, 'user');

            // setRows((prevItems) => prevItems.map((item) => (item.id === rowId ? updateRow : item)));
            gridRef.updateRows([updateRow]);
        }
    };

    useEffect(() => {
        if (data && userNo !== '') {
            const korn_flnm = data.find((node) => node.user_no === userNo || node.bsc_info?.korn_flnm === userNo)
                ?.bsc_info?.korn_flnm;
            if (userNo !== '' && korn_flnm) setSelectedOption(korn_flnm);
        }
        setFilteredData(userData);
    }, [userData]);

    const searchInTree = (nodes, searchTerm) => {
        const results = [];

        const addParentNodes = (parentNo, allNodes) => {
            const parentNode = allNodes.find((node) => node.ognz_no === parentNo);
            if (parentNode && !results.some((node) => node.ognz_no === parentNode.ognz_no)) {
                handleCollapseToggle(parentNode.ognz_no, 'search');
                results.unshift(parentNode); // 부모 노드를 결과에 추가
                if (parentNode.up_ognz_no) {
                    addParentNodes(parentNode.up_ognz_no, allNodes); // 재귀적으로 부모를 추가
                }
            }
        };

        nodes.forEach((node) => {
            if (
                node.bsc_info?.korn_flnm?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                node.user_no?.toLowerCase().includes(searchTerm.toLowerCase())
            ) {
                results.push(node); // 검색된 데이터 추가
                handleCollapseToggle(node.ognz_no, 'search');
                if (node.up_ognz_no) {
                    addParentNodes(node.up_ognz_no, nodes); // 부모 데이터 추가
                }
            }
        });

        return results;
    };

    const handleInputChange = (event, value) => {
        setInputValue(value); // 입력값을 상태로 저장
        if (value.trim() === '') {
            setFilteredData([...data]); // 검색어가 없으면 전체 데이터
            return;
        }

        const searchResults = searchInTree(data, value); // 검색 결과

        setFilteredData([...searchResults]);
    };

    const renderTree = (parentNo, level = 0) => {
        const departments = filteredData
            .filter((item) => item.up_ognz_no === parentNo && item.ognz_nm)
            .reduce((acc, item) => {
                // 조직을 중복 없이 그룹화
                if (!acc.some((dept) => dept.ognz_no === item.ognz_no)) {
                    acc.push(item);
                }
                return acc;
            }, []);

        return departments.map((dept) => (
            <React.Fragment key={dept.ognz_no}>
                {/* 부서 렌더링 */}
                <ListItemButton
                    onClick={(e) => {
                        e.stopPropagation(); // 기본 동작 중단
                        handleCollapseToggle(dept.ognz_no, '');
                    }}
                    style={{ paddingLeft: level * 30 }}
                >
                    {filteredData.some((child) => child.ognz_no === dept.ognz_no) &&
                        (collapseOpen[dept.ognz_no] ? <IcoArrowUp fill='#666' /> : <IcoArrow fill='#666' />)}
                    <ListItemText primary={dept.ognz_nm} />
                </ListItemButton>

                {/* 해당 부서의 사원 목록 */}
                <Collapse in={collapseOpen[dept.ognz_no]} timeout='auto' unmountOnExit>
                    <List component='div'>
                        {filteredData
                            .filter(
                                (person) =>
                                    (person.ognz_no || '') === (dept.ognz_no || '') &&
                                    person.bsc_info?.korn_flnm &&
                                    (!inputValue ||
                                        person.bsc_info?.korn_flnm.includes(inputValue) ||
                                        person.user_no.toLowerCase().includes(inputValue.toLowerCase()))
                            )
                            .map((person) => (
                                <ListItemButton
                                    key={person.ognz_no + person.user_no}
                                    style={{ paddingLeft: (level + 1) * 30 }}
                                    onClick={(e) => {
                                        e.stopPropagation(); // 사원 클릭 시 부서 토글 방지
                                        handleOptionSelect(e, person);
                                    }}
                                >
                                    <ListItemText primary={person.bsc_info?.korn_flnm} />
                                </ListItemButton>
                            ))}

                        {/* 재귀적으로 하위 부서 렌더링 */}
                        {renderTree(dept.ognz_no, level + 1)}
                    </List>
                </Collapse>
            </React.Fragment>
        ));
    };
    return (
        <Autocomplete
            id='free-solo'
            open={open}
            options={filteredData}
            value={selectedOption}
            onChange={(event, value) => {
                handleOptionSelect(event, value);
            }}
            onOpen={() => setOpen(true)}
            onClose={() => {
                setOpen(false);
            }}
            inputValue={inputValue}
            onInputChange={(event, value) => {
                handleInputChange(event, value);
            }}
            getOptionLabel={(option) => {
                if (typeof option === 'string') {
                    return option || '';
                } else if (typeof option === 'object' && option !== null) {
                    return option.bsc_info?.korn_flnm || '';
                }
                return '';
            }}
            disabled={!editable}
            filterOptions={(options) => options} // option을 필터링 없이 그대로 전달
            renderOption={(props, option) => {
                const isExpanded = collapseOpen[option.ognz_no] || false;
                if (option.up_ognz_no === null) {
                    return (
                        <Box sx={{ display: 'flex', flexDirection: 'column' }} key={option.ognz_no}>
                            <ListItemButton
                                onClick={(e) => {
                                    handleCollapseToggle(option.ognz_no, '');
                                }}
                            >
                                {filteredData.some((child) => child.up_ognz_no === option.ognz_no) &&
                                    (isExpanded ? <IcoArrowUp fill='#666' /> : <IcoArrow fill='#666' />)}
                                <ListItemText primary={option.ognz_nm} />
                            </ListItemButton>

                            {/* 하위 부서 및 구성원 */}
                            <Collapse in={isExpanded} timeout='auto' unmountOnExit>
                                <List component='div'>
                                    {filteredData
                                        .filter(
                                            (person) =>
                                                person.up_ognz_no === null &&
                                                (!inputValue ||
                                                    person.bsc_info?.korn_flnm.includes(inputValue) ||
                                                    person.user_no.toLowerCase().includes(inputValue.toLowerCase()))
                                        )
                                        .map((person) => (
                                            <ListItemButton
                                                key={person.ognz_no + person.user_no}
                                                style={{ paddingLeft: 30 }}
                                                onClick={(e) => {
                                                    e.stopPropagation(); // 사원 클릭 시 부서 토글 방지
                                                    handleOptionSelect(e, person);
                                                }}
                                            >
                                                <ListItemText primary={person.bsc_info?.korn_flnm} />
                                            </ListItemButton>
                                        ))}
                                    {renderTree(option.ognz_no, option.level + 1)}
                                </List>
                            </Collapse>
                        </Box>
                    );
                }
            }}
            style={{ width: 280 }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label='사원찾기'
                    variant='standard'
                    sx={{
                        '& .MuiInputBase-input.MuiInput-input.Mui-disabled': {
                            WebkitTextFillColor: 'black', // 비활성화된 입력 글씨 색
                        },
                    }}
                />
            )}
        />
    );
}
