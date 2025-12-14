'use client';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import IndeterminateCheckBoxOutlinedIcon from '@mui/icons-material/IndeterminateCheckBoxOutlined';
import SubdirectoryArrowRightOutlinedIcon from '@mui/icons-material/SubdirectoryArrowRightOutlined';
import { Box, Checkbox, Collapse, List, ListItemButton, ListItemText } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { fetcherPost, fetcherPostData } from 'utils/axios';
import styles from '../components/FullDialog/evaluation/style.module.scss';
import { useTranslation } from 'react-i18next';
export default function OgnzSelect({ item, handleChange, selectValue, className }) {
    const icon = <CheckBoxOutlineBlankIcon fontSize='small' />;
    const checkedIcon = <CheckBoxIcon fontSize='small' />;

    // 다국어
    const { t } = useTranslation();
    const [data, setData] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [updateSelected, setUpdateSelected] = useState([]);
    const [collapseOpen, setCollapseOpen] = useState<Record<string, boolean>>({});
    const [filteredData, setFilteredData] = useState([]);
    const [inputValue, setInputValue] = useState('');
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

    useEffect(() => {
        if (selectValue === '' || selectValue === null || selectValue === undefined) {
            setSelectedOptions([]);
            setUpdateSelected([]);
            setCollapseOpen({});
        }
    }, [selectValue]);

    const dataMap = new Map(filteredData?.map((item) => [item.child_no, item]));

    const findAllParents = (dataMap, child_no) => {
        const node = dataMap.get(child_no);
        if (!node || !node.parent_no) return [];
        const parent = dataMap.get(node.parent_no);
        return parent ? [parent, ...findAllParents(dataMap, parent.child_no)] : [];
    };

    const handleCheked = (option) => {
        const missingItems = selectedOptions.filter(
            (item1) => !option.some((item2) => JSON.stringify(item1) === JSON.stringify(item2))
        );

        missingItems.forEach((child) => {
            const parents = findAllParents(dataMap, child.child_no);
            setUpdateSelected((prev) => {
                const updated = { ...prev };
                delete updated[child.child_no];
                return updated;
            });
            parents.forEach((parentNode) => {
                setUpdateSelected((prev) => {
                    const updated = { ...prev };
                    delete updated[parentNode.child_no];
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
                    [node.child_no]: isChecked,
                };
            });

            // 자식 노드도 동일한 선택 상태로 설정
            if (filteredData.some((child) => child.parent_no === node.child_no)) {
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
                        return prevSelected.filter((selected) => selected.child_no !== node.child_no);
                    } else {
                        return [...prevSelected, node]; // 전체부서 나오도록 추가
                    }
                });
                const childNode = filteredData.filter((child) => child.parent_no === node.child_no);
                childNode.forEach((child) => updateSelection(child, isChecked));
            } else {
                // 최하위노드인 경우
                // 자식을 체크 해제할 경우 부모도 체크 해제
                if (!isChecked) {
                    const parents = findAllParents(dataMap, node.child_no);

                    parents.forEach((parentNode) => {
                        setUpdateSelected((prev) => {
                            if (prev[parentNode.child_no]) {
                                const updated = { ...prev }; // 이전 상태 복사
                                delete updated[parentNode.child_no]; // 특정 키 삭제
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
                        return prevSelected.filter((selected) => selected.child_no !== node.child_no);
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
        const isCurrentlyChecked = updateSelected[option.child_no] || false;
        updateSelection(option, !isCurrentlyChecked);
    };

    useEffect(() => {
        const selectedOgnzNo = selectedOptions.map((item) => item.child_no).join(',');
        const selectedOgnzNm = selectedOptions.map((item) => item.ognz_nm).join(',');
        handleChange(item.id, selectedOgnzNo, 'OGNZ_COM', selectedOgnzNm);
    }, [selectedOptions]);

    useEffect(() => {
        const item = [
            {
                sqlId: 'hrs_com01',
                sql_key: 'hrs_ognztree_recursive',
                params: [
                    {
                        std_ymd: dayjs(new Date()).format('YYYYMMDD'),
                    },
                ],
            },
        ];
        fetcherPostData(item)
            .then((response) => {
                setData(response);
                setFilteredData(response);
            })
            .catch((error) => {
                console.error(error);
            });
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
                node.ognz_nm?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
                        <Checkbox
                            icon={icon}
                            checkedIcon={checkedIcon}
                            style={{ marginRight: 8 }}
                            checked={updateSelected[item.child_no] || false}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOptionSelect(e, item);
                            }}
                        />
                        {filteredData.some((child) => child.parent_no === item.child_no) ? (
                            collapseOpen[item.child_no] ? (
                                <IndeterminateCheckBoxOutlinedIcon />
                            ) : (
                                <AddBoxOutlinedIcon />
                            )
                        ) : (
                            <SubdirectoryArrowRightOutlinedIcon />
                        )}
                        <ListItemText primary={item.ognz_nm} />
                    </ListItemButton>
                    <Collapse in={collapseOpen[item.child_no]} timeout='auto' unmountOnExit>
                        {renderTree(item.child_no, level + 1)}
                    </Collapse>
                </React.Fragment>
            ));
    };
    return (
        <Autocomplete
            multiple
            id='checkboxes-tags-demo'
            disableCloseOnSelect
            limitTags={2}
            options={filteredData}
            value={selectedOptions}
            onChange={(event, value) => {
                setSelectedOptions(value);
                handleCheked(value);
            }}
            getOptionLabel={(option) => option.ognz_nm || ''}
            inputValue={inputValue}
            onInputChange={(event, value) => {
                handleInputChange(event, value);
            }}
            filterOptions={(options) => options} // option을 필터링 없이 그대로 전달
            renderOption={(props, option, { selected }) => {
                const isExpanded = collapseOpen[option.child_no] || false;
                if (option.parent_no === null) {
                    return (
                        <>
                            {/* <Box sx={{ position: 'sticky', top: 0, backgroundColor: '#e0e0e0', zIndex: 1 }}>
                                <ListItemButton key={'010101'}>
                                    <Checkbox
                                        icon={icon}
                                        checkedIcon={checkedIcon}
                                        checked={true}
                                        style={{ marginRight: 8 }}
                                    />
                                    <ListItemText primary={'010101'} />
                                </ListItemButton>
                            </Box> */}

                            <Box sx={{ display: 'flex', flexDirection: 'column' }} key={option.child_no}>
                                {/* 세로로 나열되는 리스트 */}
                                <ListItemButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCollapseToggle(option.child_no, '');
                                    }}
                                >
                                    <Checkbox
                                        icon={icon}
                                        checkedIcon={checkedIcon}
                                        style={{ marginRight: 8 }}
                                        checked={updateSelected[option.child_no] || false}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleOptionSelect(e, option);
                                        }}
                                    />
                                    {data.some((child) => child.parent_no === option.child_no) ? (
                                        isExpanded ? (
                                            <IndeterminateCheckBoxOutlinedIcon />
                                        ) : (
                                            <AddBoxOutlinedIcon />
                                        )
                                    ) : null}
                                    <ListItemText primary={option.ognz_nm} />
                                </ListItemButton>
                                <Collapse in={isExpanded} timeout='auto' unmountOnExit>
                                    <List component='div' disablePadding>
                                        {renderTree(option.child_no, 1)}
                                    </List>
                                </Collapse>
                            </Box>
                        </>
                    );
                }
            }}
            fullWidth
            renderInput={(params) => <TextField {...params} label={t('조직찾기')} />}
            className={className}
        />
    );
}
