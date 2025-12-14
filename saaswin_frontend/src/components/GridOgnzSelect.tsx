'use client';
import React, { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { Box, Collapse, List, ListItemButton, ListItemText } from '@mui/material';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import SubdirectoryArrowRightOutlinedIcon from '@mui/icons-material/SubdirectoryArrowRightOutlined';
import IndeterminateCheckBoxOutlinedIcon from '@mui/icons-material/IndeterminateCheckBoxOutlined';
import { useSheetStore } from 'utils/store/sheet';
export default function GridOgnzSelect({ ognzData, changeDifferRow, ognzNo, editable }) {
    const [data, setData] = useState(ognzData);
    const [selectedOption, setSelectedOption] = useState('');
    const [collapseOpen, setCollapseOpen] = useState<Record<string, boolean>>({});
    const [filteredData, setFilteredData] = useState(ognzData);
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');

    const gridRef = useSheetStore((state) => state.gridRef);
    const rowId = useSheetStore((state) => state.rowId);

    const handleCollapseToggle = (child_no: string, type: string) => {
        if (type === 'search') {
            setCollapseOpen((prev) => ({
                ...prev,
                [child_no]: true,
            }));
        } else {
            setCollapseOpen((prev) => ({
                ...prev,
                [child_no]: !prev[child_no],
            }));
        }
    };

    const handleOptionSelect = (event, option) => {
        setSelectedOption(option || '');
        setCollapseOpen({});
        setOpen(false);
        if (gridRef) {
            const row = gridRef.getRow(rowId);
            const isNew = row.isNew ?? false;
            let updateRow = { ...row, hasChanged: true };

            const matchingOgnzNo = Object.keys(row).filter((key) => key === 'apnt_dept_cd');
            const matchingOgnzNm = Object.keys(row).filter((key) => key === 'ognz_nm');

            const ognzNoPre = row[matchingOgnzNo] || null;
            const ognzNmPre = row[matchingOgnzNm] || null;

            if (option) {
                const child_no = option?.child_no || null;
                const ognz_nm = option?.ognz_nm || null;

                if (matchingOgnzNo.length > 0 && child_no) {
                    if (row[matchingOgnzNo + 'preValue'] === undefined && !isNew) {
                        updateRow = { ...updateRow, [matchingOgnzNo + 'preValue']: ognzNoPre };
                    }
                    updateRow = { ...updateRow, [matchingOgnzNo]: child_no };
                }

                if (matchingOgnzNm.length > 0 && ognz_nm) {
                    if (row[matchingOgnzNm + 'preValue'] === undefined && !isNew) {
                        updateRow = { ...updateRow, [matchingOgnzNm + 'preValue']: ognzNmPre };
                    }
                    updateRow = { ...updateRow, [matchingOgnzNm]: ognz_nm };
                }
            } else {
                if (matchingOgnzNo.length > 0) {
                    if (row[matchingOgnzNo + 'preValue'] === undefined && !isNew) {
                        updateRow = { ...updateRow, [matchingOgnzNo + 'preValue']: ognzNoPre };
                    }
                    updateRow = { ...updateRow, [matchingOgnzNo]: null };
                }

                if (matchingOgnzNm.length > 0) {
                    if (row[matchingOgnzNm + 'preValue'] === undefined && !isNew) {
                        updateRow = { ...updateRow, [matchingOgnzNm + 'preValue']: ognzNmPre };
                    }
                    updateRow = { ...updateRow, [matchingOgnzNm]: null };
                }
            }
            changeDifferRow(updateRow, row, 'ognz');
            // setRows((prevItems) => prevItems.map((item) => (item.id === rowId ? updateRow : item)));

            gridRef.updateRows([updateRow]);
        }
    };

    useEffect(() => {
        if (data && ognzNo !== '') {
            const ognz_nm = data.find((node) => node.child_no === ognzNo);
            if (ognzNo !== '' && ognz_nm) setSelectedOption(ognz_nm);
        }
    }, []);

    const searchInTree = (nodes, searchTerm) => {
        const results = [];
        const addParentNodes = (parentNo, allNodes) => {
            const parentNode = allNodes.find((node) => node.child_no === parentNo);
            if (parentNode && !results.some((node) => node.child_no === parentNode.child_no)) {
                handleCollapseToggle(parentNode.child_no, 'search');
                results.unshift(parentNode); // 부모 노드를 결과에 추가
                if (parentNode.parent_no) {
                    addParentNodes(parentNode.parent_no, allNodes); // 재귀적으로 부모를 추가
                }
            }
        };

        nodes.forEach((node) => {
            if (
                node?.ognz_nm?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                node.child_no?.toLowerCase().includes(searchTerm.toLowerCase())
            ) {
                results.push(node); // 검색된 데이터 추가
                handleCollapseToggle(node.child_no, 'search');
                if (node.parent_no) {
                    addParentNodes(node.parent_no, nodes); // 부모 데이터 추가
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

    // 자식 노드를 재귀적으로 렌더링하는 함수
    const renderTree = (parentNo, level = 0) => {
        return filteredData
            .filter((item) => item.parent_no === parentNo)
            .map((item) => (
                <React.Fragment key={item.child_no}>
                    <ListItemButton
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCollapseToggle(item.child_no, '');
                        }}
                        style={{ paddingLeft: level * 30 }}
                    >
                        {filteredData.some((child) => child.parent_no === item.child_no) ? (
                            collapseOpen[item.child_no] ? (
                                <>
                                    <IndeterminateCheckBoxOutlinedIcon />
                                    <ListItemText primary={item?.ognz_nm} />
                                </>
                            ) : (
                                <>
                                    <AddBoxOutlinedIcon />
                                    <ListItemText primary={item?.ognz_nm} />
                                </>
                            )
                        ) : (
                            <>
                                <SubdirectoryArrowRightOutlinedIcon />
                                <ListItemText
                                    primary={item?.ognz_nm}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOptionSelect(e, item);
                                    }}
                                />
                            </>
                        )}
                    </ListItemButton>
                    <Collapse in={collapseOpen[item.child_no]} timeout='auto' unmountOnExit>
                        {renderTree(item.child_no, level + 1)}
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
            disabled={!editable}
            inputValue={inputValue}
            getOptionLabel={(option) => option?.ognz_nm || ''}
            onInputChange={(event, value) => {
                handleInputChange(event, value);
            }}
            filterOptions={(options) => options} // option을 필터링 없이 그대로 전달
            renderOption={(props, option, { selected }) => {
                const isExpanded = collapseOpen[option.child_no] || false;
                if (option.parent_no === null) {
                    return (
                        <Box sx={{ display: 'flex', flexDirection: 'column' }} key={option.child_no}>
                            {/* 세로로 나열되는 리스트 */}
                            <ListItemButton
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCollapseToggle(option.child_no, '');
                                }}
                            >
                                {filteredData.some((child) => child.parent_no === option.child_no) ? (
                                    isExpanded ? (
                                        <IndeterminateCheckBoxOutlinedIcon />
                                    ) : (
                                        <AddBoxOutlinedIcon />
                                    )
                                ) : null}
                                <ListItemText primary={option?.ognz_nm} />
                            </ListItemButton>
                            <Collapse in={isExpanded} timeout='auto' unmountOnExit>
                                <List component='div'>{renderTree(option.child_no, 1)}</List>
                            </Collapse>
                        </Box>
                    );
                }
            }}
            style={{ width: 280 }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label='조직찾기'
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
