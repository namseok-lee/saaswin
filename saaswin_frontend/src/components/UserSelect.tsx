'use client';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { Box, Checkbox, Collapse, List, ListItemButton, ListItemText } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import dayjs from 'dayjs';
import React, { useEffect, useState, useRef } from 'react';
import { fetcherPostData } from 'utils/axios';
import { IcoArrow, IcoArrowUp } from '@/assets/Icon';
import styles from '../components/FullDialog/evaluation/style.module.scss';

export default function UserSelect({ item, handleChange, selectValue, className, disabled = false }) {
    const icon = <CheckBoxOutlineBlankIcon fontSize='small' />;
    const checkedIcon = <CheckBoxIcon fontSize='small' />;

    const [data, setData] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [updateSelected, setUpdateSelected] = useState({});
    const [collapseOpen, setCollapseOpen] = useState({});
    const [filteredData, setFilteredData] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const dataLoadedRef = useRef(false);
    const selectValueProcessedRef = useRef(false);
    const today = dayjs(new Date()).format('YYYYMMDD');

    // 사용자 데이터 로드
    useEffect(() => {
        if (dataLoadedRef.current) return;

        const fetchItem = [
            {
                sqlId: 'hrs_com01',
                sql_key: 'hrs_ognztree_get',
                params: [{}],
            },
        ];

        fetcherPostData(fetchItem)
            .then((response) => {
                if (response && Array.isArray(response)) {
                    setData(response);
                    setFilteredData(response);
                    dataLoadedRef.current = true;
                }
            })
            .catch((error) => {
                console.error('사용자 데이터 로드 실패:', error);
                dataLoadedRef.current = true;
            });
    }, []);

    // 사용자 선택값 처리 (최초 한 번만)
    useEffect(() => {
        // 데이터가 아직 로드되지 않았거나, 이미 처리했거나, selectValue가 없으면 패스
        if (!dataLoadedRef.current || selectValueProcessedRef.current || !selectValue || !data.length) {
            return;
        }

        // 쉼표로 구분된 사용자 ID 문자열을 배열로 변환
        const userIds =
            typeof selectValue === 'string'
                ? selectValue
                      .split(',')
                      .map((id) => id.trim())
                      .filter(Boolean)
                : [];

        if (userIds.length === 0) {
            selectValueProcessedRef.current = true;
            return;
        }

        // 선택된 사용자 ID에 해당하는 사용자 정보 찾기
        const foundUsers = data.filter((user) => userIds.includes(user.user_no));

        if (foundUsers.length > 0) {
            // 선택된 사용자 설정
            setSelectedOptions(foundUsers);

            // 체크박스 상태 업데이트
            const newChecked = {};
            foundUsers.forEach((user) => {
                newChecked[user.user_no] = true;
            });
            setUpdateSelected(newChecked);

            // 처리 완료 표시
            selectValueProcessedRef.current = true;
        }
    }, [data, selectValue]);

    // 선택된 사용자가 변경될 때만 handleChange 호출
    const prevSelectedRef = useRef([]);
    useEffect(() => {
        // 선택된 사용자가 없거나 변경이 없으면 무시
        if (selectedOptions.length === 0 && prevSelectedRef.current.length === 0) {
            return;
        }

        // 이전 선택과 현재 선택이 같으면 무시
        const prevIds = prevSelectedRef.current
            .map((u) => u.user_no)
            .sort()
            .join(',');
        const currentIds = selectedOptions
            .map((u) => u.user_no)
            .sort()
            .join(',');

        if (prevIds === currentIds) {
            return;
        }

        // 선택된 사용자 정보 구성
        const selectedUserNo = selectedOptions.map((user) => user.user_no).join(',');
        const selectedUserNm = selectedOptions.map((user) => user.bsc_info?.flnm || '').join(',');

        // 부모 컴포넌트에 선택 변경 알림
        const itemId = typeof item === 'object' ? item.key || item.id : item;
        handleChange(itemId, selectedUserNo, 'USER_COM', selectedUserNm);

        // 현재 선택 저장
        prevSelectedRef.current = [...selectedOptions];
    }, [selectedOptions, item, handleChange]);

    // selectValue가 빈 값으로 변경되면 선택 초기화
    useEffect(() => {
        if (selectValue === '' || selectValue === null || selectValue === undefined) {
            setSelectedOptions([]);
            setUpdateSelected({});
            selectValueProcessedRef.current = false;
        }
    }, [selectValue]);

    const handleCollapseToggle = (ognz_no, type) => {
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

    const dataMap = new Map(filteredData.map((item) => [item.ognz_no, item]));

    const findAllParents = (dataMap, ognz_no) => {
        const node = dataMap.get(ognz_no);
        if (!node || !node.up_ognz_no) return [];
        const parent = dataMap.get(node.up_ognz_no);
        return parent ? [parent, ...findAllParents(dataMap, parent.up_ognz_no)] : [];
    };

    const handleCheked = (option) => {
        const missingItems = selectedOptions.filter(
            (item1) => !option.some((item2) => item1.user_no === item2.user_no)
        );
        missingItems.forEach((child) => {
            const parents = findAllParents(dataMap, child.ognz_no);
            setUpdateSelected((prev) => {
                const updated = { ...prev };
                delete updated[child.ognz_no];
                delete updated[child.user_no];
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

    const handleOptionSelect = (event, option, type) => {
        const updateSelection = (node, isChecked) => {
            const sameNode = filteredData.filter(
                (child) => child.ognz_no === node.ognz_no && node.user_no !== child.user_no
            );

            // 노드 상태 업데이트
            setUpdateSelected((prev) => {
                if (type === 'ognz_no') {
                    if (prev[node.ognz_no]) {
                        return {
                            ...prev,
                            [node.user_no]: isChecked,
                        };
                    }

                    return {
                        ...prev,
                        [node.user_no]: isChecked,
                        [node.ognz_no]: isChecked,
                    };
                } else {
                    return {
                        ...prev,
                        [node.user_no]: isChecked,
                    };
                }
            });

            if (type === 'ognz_no') {
                sameNode.forEach((child) => {
                    setUpdateSelected((prev) => ({
                        ...prev,
                        [child.user_no]: isChecked,
                    }));
                });
            }

            // 자식 노드도 동일한 선택 상태로 설정
            if (filteredData.some((child) => child.up_ognz_no === node.ognz_no)) {
                // 자식을 체크 해제할 경우 부모도 체크 해제
                if (!isChecked) {
                    setUpdateSelected((prev) => {
                        if (prev[node.up_ognz_no]) {
                            const updated = { ...prev };
                            delete updated[node.up_ognz_no];
                            if (prev[node.ognz_no]) {
                                delete updated[node.ognz_no];
                            }
                            return updated;
                        }
                        return prev;
                    });
                }

                setSelectedOptions((prevSelected) => {
                    const exists = prevSelected.some((selected) => selected.user_no === node.user_no);
                    if (exists && !isChecked) {
                        return prevSelected.filter((selected) => selected.user_no !== node.user_no);
                    } else if (!exists && isChecked) {
                        return [...prevSelected, node];
                    }
                    return prevSelected;
                });

                const childNode = filteredData.filter((child) => child.up_ognz_no === node.ognz_no);
                if (type === 'ognz_no') childNode.forEach((child) => updateSelection(child, isChecked));
            } else {
                // 최하위노드인 경우
                if (!isChecked) {
                    const parents = findAllParents(dataMap, node.ognz_no);

                    // 본인 체크해제
                    setUpdateSelected((prev) => {
                        const updated = { ...prev };
                        delete updated[node.ognz_no];
                        if (type === 'ognz_no') delete updated[node.user_no];
                        return updated;
                    });

                    // 부모노드 체크해제
                    parents.forEach((parentNode) => {
                        setUpdateSelected((prev) => {
                            if (prev[parentNode.ognz_no]) {
                                const updated = { ...prev };
                                delete updated[parentNode.ognz_no];
                                return updated;
                            }
                            return prev;
                        });
                    });
                }

                // 본인체크
                setSelectedOptions((prevSelected) => {
                    const exists = prevSelected.some((selected) => selected.user_no === node.user_no);
                    if (exists && !isChecked) {
                        return prevSelected.filter((selected) => selected.user_no !== node.user_no);
                    } else if (!exists && isChecked) {
                        return [...prevSelected, node];
                    }
                    return prevSelected;
                });

                // 부서전부체크
                if (type === 'ognz_no') {
                    sameNode.forEach((child) => {
                        setSelectedOptions((prevSelected) => {
                            const exists = prevSelected.some((selected) => selected.user_no === child.user_no);
                            if (exists && !isChecked) {
                                return prevSelected.filter((selected) => selected.user_no !== child.user_no);
                            } else if (!exists && isChecked) {
                                return [...prevSelected, child];
                            }
                            return prevSelected;
                        });
                    });
                }
            }
        };

        // 현재 노드의 선택 상태를 토글
        if (type === 'ognz_no') {
            const isCurrentlyChecked = updateSelected[option.ognz_no] || false;
            updateSelection(option, !isCurrentlyChecked);
        } else if (type === 'user_no') {
            const isCurrentlyChecked = updateSelected[option.user_no] || false;
            updateSelection(option, !isCurrentlyChecked);
        }
    };

    const searchInTree = (nodes, searchTerm) => {
        const results = [];

        const addParentNodes = (parentNo, allNodes) => {
            const parentNode = allNodes.find((node) => node.ognz_no === parentNo);
            if (parentNode && !results.some((node) => node.ognz_no === parentNode.ognz_no)) {
                handleCollapseToggle(parentNode.ognz_no, 'search');
                results.unshift(parentNode);
                if (parentNode.up_ognz_no) {
                    addParentNodes(parentNode.up_ognz_no, allNodes);
                }
            }
        };

        nodes.forEach((node) => {
            if (
                node.bsc_info?.flnm?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                node.user_no?.toLowerCase().includes(searchTerm.toLowerCase())
            ) {
                results.push(node);
                handleCollapseToggle(node.ognz_no, 'search');
                if (node.up_ognz_no) {
                    addParentNodes(node.up_ognz_no, nodes);
                }
            }
        });

        return results;
    };

    const handleInputChange = (event, value) => {
        setInputValue(value);

        if (value.trim() === '') {
            setFilteredData([...data]);
            return;
        }

        const searchResults = searchInTree(data, value);
        setFilteredData([...searchResults]);
    };

    const renderTree = (parentNo, level = 0) => {
        const departments = filteredData
            .filter((item) => item.up_ognz_no === parentNo && item.ognz_nm)
            .reduce((acc, item) => {
                if (!acc.some((dept) => dept.ognz_no === item.ognz_no)) {
                    acc.push(item);
                }
                return acc;
            }, []);

        return departments.map((dept) => (
            <React.Fragment key={dept.ognz_no}>
                <ListItemButton
                    onClick={(e) => {
                        if (disabled) return;
                        e.stopPropagation();
                        handleCollapseToggle(dept.ognz_no, '');
                    }}
                    style={{ paddingLeft: level * 12 }}
                    disabled={disabled}
                >
                    <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{ marginRight: 8 }}
                        checked={updateSelected[dept.ognz_no] || false}
                        onClick={(e) => {
                            if (disabled) return;
                            e.stopPropagation();
                            handleOptionSelect(e, dept, 'ognz_no');
                        }}
                        className='autoCompleteChk'
                        disabled={disabled}
                    />
                    {filteredData.some((child) => child.ognz_no === dept.ognz_no) &&
                        (collapseOpen[dept.ognz_no] ? <IcoArrowUp fill='#666' /> : <IcoArrow fill='#666' />)}
                    <ListItemText primary={dept.ognz_nm} />
                </ListItemButton>

                <Collapse in={collapseOpen[dept.ognz_no]} timeout='auto' unmountOnExit>
                    <List component='div'>
                        {filteredData
                            .filter(
                                (person) =>
                                    (person.ognz_no || '') === (dept.ognz_no || '') &&
                                    person.bsc_info?.flnm &&
                                    (!inputValue ||
                                        person.bsc_info?.flnm.includes(inputValue) ||
                                        person.user_no.toLowerCase().includes(inputValue.toLowerCase()))
                            )
                            .map((person) => (
                                <ListItemButton
                                    key={person.user_no}
                                    style={{ paddingLeft: (level + 1) * 19 }}
                                    disabled={disabled}
                                >
                                    <Checkbox
                                        icon={icon}
                                        checkedIcon={checkedIcon}
                                        style={{ marginRight: 8 }}
                                        checked={updateSelected[person.user_no] || false}
                                        onClick={(e) => {
                                            if (disabled) return;
                                            e.stopPropagation();
                                            handleOptionSelect(e, person, 'user_no');
                                        }}
                                        className='autoCompleteChk'
                                        disabled={disabled}
                                    />
                                    <ListItemText primary={person.bsc_info?.flnm} />
                                </ListItemButton>
                            ))}
                        {renderTree(dept.ognz_no, level + 1)}
                    </List>
                </Collapse>
            </React.Fragment>
        ));
    };

    return (
        <Autocomplete
            multiple
            limitTags={2}
            id='checkboxes-tags-demo'
            options={filteredData}
            value={selectedOptions}
            onChange={(event, value) => {
                if (disabled) return; // disabled일 경우 변경 불가
                setSelectedOptions(value);
                handleCheked(value);
            }}
            inputValue={inputValue}
            onInputChange={(event, value) => {
                if (disabled) return; // disabled일 경우 검색 불가
                handleInputChange(event, value);
            }}
            getOptionLabel={(option) => {
                if (typeof option === 'string') {
                    return option || '';
                } else if (typeof option === 'object' && option !== null) {
                    return option.bsc_info?.flnm || '';
                }
                return '';
            }}
            disabled={disabled}
            filterOptions={(options) => options}
            renderOption={(props, option) => {
                const isExpanded = collapseOpen[option.ognz_no] || false;
                if (option.up_ognz_no === null) {
                    return (
                        <Box sx={{ display: 'flex', flexDirection: 'column' }} key={option.ognz_no}>
                            <ListItemButton
                                onClick={(e) => {
                                    if (disabled) return;
                                    handleCollapseToggle(option.ognz_no, '');
                                }}
                            >
                                <Checkbox
                                    icon={icon}
                                    checkedIcon={checkedIcon}
                                    style={{ marginRight: 8 }}
                                    checked={updateSelected[option.ognz_no] || false}
                                    onClick={(e) => {
                                        if (disabled) return;
                                        e.stopPropagation();
                                        handleOptionSelect(e, option, 'ognz_no');
                                    }}
                                    className='autoCompleteChk'
                                    disabled={disabled}
                                />
                                {filteredData.some((child) => child.up_ognz_no === option.ognz_no) &&
                                    (isExpanded ? (
                                        <IcoArrowUp fill={disabled ? '#ccc' : '#666'} />
                                    ) : (
                                        <IcoArrow fill={disabled ? '#ccc' : '#666'} />
                                    ))}
                                <ListItemText primary={option.ognz_nm} />
                            </ListItemButton>

                            <Collapse in={isExpanded} timeout='auto' unmountOnExit>
                                <List component='div'>
                                    {filteredData
                                        .filter(
                                            (person) =>
                                                person.up_ognz_no === null &&
                                                (!inputValue ||
                                                    person.bsc_info?.flnm.includes(inputValue) ||
                                                    person.user_no.toLowerCase().includes(inputValue.toLowerCase()))
                                        )
                                        .map((person) => (
                                            <ListItemButton
                                                key={person.user_no}
                                                style={{ paddingLeft: 30 }}
                                                disabled={disabled}
                                            >
                                                <Checkbox
                                                    checked={updateSelected[person.user_no] || false}
                                                    onClick={(e) => {
                                                        if (disabled) return;
                                                        e.stopPropagation();
                                                        handleOptionSelect(e, person, 'user_no');
                                                    }}
                                                    style={{ marginRight: 8 }}
                                                    className='autoCompleteChk'
                                                    disabled={disabled}
                                                />
                                                <ListItemText primary={person.bsc_info?.flnm} />
                                            </ListItemButton>
                                        ))}
                                    {renderTree(option.ognz_no, option.level + 1)}
                                </List>
                            </Collapse>
                        </Box>
                    );
                }
                return null;
            }}
            fullWidth
            renderInput={(params) => <TextField {...params} label='사원찾기' disabled={disabled} />}
            className={className}
        />
    );
}
