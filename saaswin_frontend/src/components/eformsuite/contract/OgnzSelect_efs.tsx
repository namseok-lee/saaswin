'use client';
import React, { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import dayjs from 'dayjs';
import { fetcherPost } from 'utils/axios';
import { Box, Checkbox, Collapse, List, ListItemButton, ListItemText } from '@mui/material';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import SubdirectoryArrowRightOutlinedIcon from '@mui/icons-material/SubdirectoryArrowRightOutlined';
import IndeterminateCheckBoxOutlinedIcon from '@mui/icons-material/IndeterminateCheckBoxOutlined';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
export default function OgnzSelect_efs({ item, handleChange, selectValue }) {
    console.log('ognzselect item', item);
    console.log('ognzselect selectValue', selectValue);
    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;

    const [data, setData] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [updateSelected, setUpdateSelected] = useState([]);
    const [collapseOpen, setCollapseOpen] = useState<Record<string, boolean>>({});
    const [filteredData, setFilteredData] = useState([]);
    const [inputValue, setInputValue] = useState('');
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

    useEffect(() => {
        if (selectValue === '' || selectValue === null || selectValue === undefined) {
            setSelectedOptions([]);
            setUpdateSelected([]);
            setCollapseOpen({});
        }
    }, [selectValue]);

    const dataMap = new Map(filteredData.map((item) => [item.ognz_no, item]));

    const findAllParents = (dataMap, ognz_no) => {
        const node = dataMap.get(ognz_no);
        if (!node || !node.parent_no) return [];
        const parent = dataMap.get(node.parent_no);
        return parent ? [parent, ...findAllParents(dataMap, parent.ognz_no)] : [];
    };

    const handleCheked = (option) => {
        const missingItems = selectedOptions.filter(
            (item1) => !option.some((item2) => JSON.stringify(item1) === JSON.stringify(item2))
        );

        missingItems.forEach((child) => {
            const parents = findAllParents(dataMap, child.ognz_no);
            setUpdateSelected((prev) => {
                const updated = { ...prev };
                delete updated[child.ognz_no];
                return updated;
            });
            parents.forEach((parentNode) => {
                setUpdateSelected((prev) => {
                    const updated = { ...prev };
                    delete updated[parentNode.ognz_no];
                    return updated;
                });
            });
        });
    };

    const handleOptionSelect = (event, option) => {
        const updateSelection = (node, isChecked) => {
            // 노드 상태 업데이트
            setUpdateSelected((prev) => {
                return {
                    ...prev,
                    [node.ognz_no]: isChecked,
                };
            });

            // 자식 노드도 동일한 선택 상태로 설정
            if (filteredData.some((child) => child.parent_no === node.ognz_no)) {
                // 자식을 체크 해제할 경우 부모도 체크 해제
                if (!isChecked) {
                    setUpdateSelected((prev) => {
                        if (prev[node.parent_no]) {
                            const updated = { ...prev }; // 이전 상태 복사
                            delete updated[node.parent_no]; // 특정 키 삭제
                            return updated; // 업데이트된 객체 반환
                        } else {
                            return {
                                ...prev,
                            };
                        }
                    });
                }
                setSelectedOptions((prevSelected) => {
                    if (prevSelected.includes(node) && !isChecked) {
                        return prevSelected.filter((selected) => selected.ognz_no !== node.ognz_no);
                    } else {
                        return [...prevSelected];
                    }
                });
                const childNode = filteredData.filter((child) => child.parent_no === node.ognz_no);
                childNode.forEach((child) => updateSelection(child, isChecked));
            } else {
                // 최하위노드인 경우
                // 자식을 체크 해제할 경우 부모도 체크 해제
                if (!isChecked) {
                    const parents = findAllParents(dataMap, node.ognz_no);

                    parents.forEach((parentNode) => {
                        setUpdateSelected((prev) => {
                            if (prev[parentNode.ognz_no]) {
                                const updated = { ...prev }; // 이전 상태 복사
                                delete updated[parentNode.ognz_no]; // 특정 키 삭제
                                return updated; // 업데이트된 객체 반환
                            } else {
                                return {
                                    ...prev,
                                };
                            }
                        });
                    });
                }

                setSelectedOptions((prevSelected) => {
                    if (prevSelected.includes(node) && !isChecked) {
                        // 이미 선택된 경우 선택 해제 (제거)
                        return prevSelected.filter((selected) => selected.ognz_no !== node.ognz_no);
                    } else {
                        // 선택되지 않은 경우 추가
                        if (prevSelected.includes(node)) {
                            return [...prevSelected];
                        } else {
                            return [...prevSelected, node];
                        }
                    }
                });
            }
        };

        // 현재 노드의 선택 상태를 토글
        const isCurrentlyChecked = updateSelected[option.ognz_no] || false;
        updateSelection(option, !isCurrentlyChecked);
    };

    useEffect(() => {
        const selectedOgnzNo = selectedOptions.map((item) => item.ognz_no).join(',');
        const selectedOgnzNm = selectedOptions.map((item) => item['ognz_info|ognz_nm']).join(',');
        handleChange(item.id, selectedOgnzNo, 'OGNZ_COM', selectedOgnzNm);
    }, [selectedOptions]);

    useEffect(() => {
        const item = [
            {
                sqlId: '6',
                params: [
                    {
                        std_ymd: dayjs(new Date()).format('YYYY.MM.DD'),
                        rprs_ognz_no: 'WIN',
                    },
                ],
            },
        ];
        fetcherPost([process.env.NEXT_PUBLIC_SSW_SQL_SEARCH_API_URL, item])
            .then((response) => {
                setData(response[0].data);
                setFilteredData(response[0].data);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    const searchInTree = (nodes, searchTerm) => {
        const results = [];

        const addParentNodes = (parentNo, allNodes) => {
            const parentNode = allNodes.find((node) => node.ognz_no === parentNo);
            if (parentNode && !results.some((node) => node.ognz_no === parentNode.ognz_no)) {
                handleCollapseToggle(parentNode.ognz_no, 'search');
                results.unshift(parentNode); // 부모 노드를 결과에 추가
                if (parentNode.parent_no) {
                    addParentNodes(parentNode.parent_no, allNodes); // 재귀적으로 부모를 추가
                }
            }
        };

        nodes.forEach((node) => {
            if (
                node['ognz_info|ognz_nm']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                node.child_no?.toLowerCase().includes(searchTerm.toLowerCase())
            ) {
                results.push(node); // 검색된 데이터 추가
                handleCollapseToggle(node.ognz_no, 'search');
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
                <React.Fragment key={item.ognz_no}>
                    <ListItemButton
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCollapseToggle(item.ognz_no, '');
                        }}
                        style={{ paddingLeft: level * 30 }}
                    >
                        <Checkbox
                            icon={icon}
                            checkedIcon={checkedIcon}
                            style={{ marginRight: 8 }}
                            checked={updateSelected[item.ognz_no] || false}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOptionSelect(e, item);
                            }}
                        />
                        {filteredData.some((child) => child.parent_no === item.ognz_no) ? (
                            collapseOpen[item.ognz_no] ? (
                                <IndeterminateCheckBoxOutlinedIcon />
                            ) : (
                                <AddBoxOutlinedIcon />
                            )
                        ) : (
                            <SubdirectoryArrowRightOutlinedIcon />
                        )}
                        <ListItemText primary={item['ognz_info|ognz_nm']} />
                    </ListItemButton>
                    <Collapse in={collapseOpen[item.ognz_no]} timeout="auto" unmountOnExit>
                        {renderTree(item.ognz_no, level + 1)}
                    </Collapse>
                </React.Fragment>
            ));
    };

    return (
        <Autocomplete
            multiple
            id="checkboxes-tags-demo"
            disableCloseOnSelect
            limitTags={2}
            options={filteredData}
            value={selectedOptions}
            onChange={(event, value) => {
                setSelectedOptions(value);
                handleCheked(value);
            }}
            getOptionLabel={(option) => option['ognz_info|ognz_nm'] || ''}
            inputValue={inputValue}
            onInputChange={(event, value) => {
                handleInputChange(event, value);
            }}
            filterOptions={(options) => options} // option을 필터링 없이 그대로 전달
            renderOption={(props, option, { selected }) => {
                const isExpanded = collapseOpen[option.ognz_no] || false;
                if (option.parent_no === null) {
                    return (
                        <>
                            <Box sx={{ position: 'sticky', top: 0, backgroundColor: '#e0e0e0', zIndex: 1 }}>
                                <ListItemButton key={'010101'}>
                                    <Checkbox
                                        icon={icon}
                                        checkedIcon={checkedIcon}
                                        checked={true}
                                        style={{ marginRight: 8 }}
                                    />
                                    <ListItemText primary={'010101'} />
                                </ListItemButton>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column' }} key={option.ognz_no}>
                                {/* 세로로 나열되는 리스트 */}
                                <ListItemButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCollapseToggle(option.ognz_no, '');
                                    }}
                                >
                                    <Checkbox
                                        icon={icon}
                                        checkedIcon={checkedIcon}
                                        style={{ marginRight: 8 }}
                                        checked={updateSelected[option.ognz_no] || false}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleOptionSelect(e, option);
                                        }}
                                    />
                                    {data.some((child) => child.parent_no === option.ognz_no) ? (
                                        isExpanded ? (
                                            <IndeterminateCheckBoxOutlinedIcon />
                                        ) : (
                                            <AddBoxOutlinedIcon />
                                        )
                                    ) : null}
                                    <ListItemText primary={option['ognz_info|ognz_nm']} />
                                </ListItemButton>
                                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding>
                                        {renderTree(option.ognz_no, 1)}
                                    </List>
                                </Collapse>
                            </Box>
                        </>
                    );
                }
            }}
            fullWidth
            renderInput={(params) => <TextField {...params} label="조직찾기" />}
        />
    );
}
