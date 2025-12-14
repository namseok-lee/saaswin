'use client';
import React, { useEffect, useState } from 'react';
import '@nosferatu500/react-sortable-tree/style.css';
import SortableTree from '@nosferatu500/react-sortable-tree';
import { Box, Grid, Menu, MenuItem, Modal, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { fetcherPost } from 'utils/axios';
import { useSearchParams } from 'next/navigation';
import SearchCondition from 'components/SearchCondition';
import CustomButton from 'components/CustomButton';
import Loader from 'components/Loader';
import { BoxStyles, DatePickerStyles, TypographyStyles } from 'styles/component/SearchCondition';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

const TreeNode = ({ node, onContextMenu, onDoubleClick, isEditing, onEditChange, onEditSubmit }) => {
    return (
        <div
            className={node.flnm}
            onContextMenu={onContextMenu}
            onDoubleClick={onDoubleClick}
            style={{ padding: '10px', cursor: 'context-menu' }}
        >
            {isEditing ? (
                <TextField
                    value={node.editValue || ''}
                    onChange={(e) => onEditChange(e.target.value, node)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            onEditSubmit(node);
                        }
                    }}
                    autoFocus
                />
            ) : (
                <>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <img
                            src={'/api/image/' + node['user_info|img_nm']}
                            alt="Logo"
                            style={{ width: '80px', height: '100px', display: 'inline' }}
                        />
                        <Stack alignItems="flex-start" sx={{ width: 150, height: 80, borderRadius: 50 }}>
                            <Typography sx={{ fontSize: 12 }}>{node.corp_nm}</Typography>
                            <Typography color="#475467" sx={{ fontSize: 12 }}>
                                {node['ognz_info|ognz_nm']}
                            </Typography>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Typography sx={{ fontWeight: 600 }}>{node.flnm}</Typography>
                                <Typography color="#475467" sx={{ fontSize: 12 }}>
                                    {node['user_info|jbps_nm']}
                                </Typography>
                            </Stack>
                        </Stack>
                    </Stack>
                </>
            )}
        </div>
    );
};

interface MasterUIData {
    data_se_info: any[]; // 데이터 타입에 맞게 수정
    grid_tit_info: any[];
    grid_btn_info: any; // 데이터 타입에 맞게 수정
    grid_info: any; // 데이터 타입에 맞게 수정
    scr_no: string;
    scr_url: string;
}
export default function ObjManage({ TabmasterUI }: { TabmasterUI: MasterUIData[] }) {
    interface MasterUIData {
        data_se_info: any[]; // 데이터 타입에 맞게 수정
        grid_tit_info: any[];
        grid_btn_info: any; // 데이터 타입에 맞게 수정
        grid_info: any; // 데이터 타입에 맞게 수정
        scr_no: string;
    }

    const [nodeDataState, setNodeDataState] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);
    const [editingNode, setEditingNode] = useState(null);

    const tpcdParam = TabmasterUI?.scr_no;
    const [masterUI, setMasterUI] = useState<MasterUIData | null>(null);
    const [masterRetrieve, setMasterRetrieve] = useState(false); // 조회버튼(true/false)
    const [dataParam, setDataParam] = useState<Param>({
        master: [], // 마스터그리드 데이터 파라미터
        detail: [], // 하단그리드 데이터 파라미터
    });
    const [dataLoading, setDataLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const searchParams = new URLSearchParams(useSearchParams());

    const handleCloseModal = () => {
        setModalOpen((prev) => !prev); // 상태를 안전하게 토글
    };

    const modalBtn = [
        {
            api: 'null',
            seq: '2',
            text: '발령확정',
            type: 'SAVE',
            sqlId: 'null',
        },
        {
            api: 'null',
            seq: '1',
            text: '닫기',
            type: 'CLOSE',
            sqlId: 'null',
        },
    ];

    // 가장 상위 조회버튼
    const handleSubmit = () => {
        if (dataParam?.master) {
            setMasterRetrieve(true); // 데이터를 가져오도록 설정
        } else {
            console.log('조회할 데이터가 없습니다.');
        }
    };

    const sortBySeqBtn = [
        {
            api: 'null',
            seq: '2',
            text: '저장',
            type: 'TEMPSAVE',
            sqlId: 'null',
        },
        {
            api: 'null',
            seq: '1',
            text: '발령',
            type: 'CONFIRM',
            sqlId: 'null',
        },
    ]; // seq 기준으로 역순정렬

    // title, button, searchBox, 마스터 그리드헤더 조회
    useEffect(() => {
        if (TabmasterUI) {
            setMasterUI(TabmasterUI);
            setDataLoading(false);
        }
    }, [TabmasterUI]);

    const handleChange = (
        data: SetStateAction<
            {
                flnm: string;
                Items: ({ flnm: string; Items?: undefined } | { flnm: string; Items: { flnm: string }[] })[];
            }[]
        >
    ) => {
        setNodeDataState(data);
    };

    const handleContextMenu = (event, node) => {
        event.preventDefault();
        setSelectedNode(node);
        setContextMenu(
            contextMenu === null
                ? {
                      mouseX: event.clientX - 2,
                      mouseY: event.clientY - 4,
                  }
                : null
        );
    };

    const handleClose = () => {
        setContextMenu(null);
    };

    const handleAddChild = () => {
        if (selectedNode) {
            selectedNode.children = selectedNode.children || [];
            const newChild = { ...selectedNode };
            newChild.flnm = '새 노드';
            newChild['user_info|img_nm'] = 'noimage.jpg';
            newChild.children = [];
            selectedNode.children.push(newChild);
            setNodeDataState([...nodeDataState]);
        }
        handleClose();
    };

    const handleDeleteNode = () => {
        const deleteNodeRecursively = (nodes, nodeToDelete) => {
            return nodes.filter((node) => {
                if (node === nodeToDelete) {
                    return false;
                }
                if (node.children) {
                    node.children = deleteNodeRecursively(node.children, nodeToDelete);
                }
                return true;
            });
        };
        setNodeDataState(deleteNodeRecursively(nodeDataState, selectedNode));
        handleClose();
    };

    const handleDoubleClick = (node) => {
        setEditingNode(node);
        node.editValue = node.flnm;
        setNodeDataState([...nodeDataState]);
    };

    const handleEditChange = (value, node) => {
        node.editValue = value;
        setNodeDataState([...nodeDataState]);
    };

    const handleEditSubmit = (node) => {
        if (node) {
            node.flnm = node.editValue;
            setEditingNode(null);
            setNodeDataState([...nodeDataState]);
        }
    };

    // items 이름을 children으로 변경 (react-sortable-tree 는 하위노드는 children이라는 이름이 반드시 와야함)
    const convertItemsToChildren = (data) => {
        return data.map((item) => {
            const newItem = { ...item };

            // Items가 존재하면 children으로 이름을 변경하고 재귀 호출
            if (newItem.Items) {
                newItem.children = convertItemsToChildren(newItem.Items);
                delete newItem.Items; // 원래의 Items 속성 삭제
            }

            return newItem;
        });
    };
    // 특정 depth 펼치기 (1 depth)
    const expandOneDepth = (data) => {
        return data.map((node) => {
            const newNode = { ...node };
            if (newNode.level == 0) {
                // 처음 한 depth만 펼치기
                if (newNode.children) {
                    newNode.expanded = true; // 1 depth 노드 펼치기
                    newNode.children = expandOneDepth(newNode.children); // 자식 노드도 재귀적으로 처리
                }
            }

            return newNode;
        });
    };

    useEffect(() => {
        if (masterRetrieve) {
            const item = dataParam?.master;
            fetcherPost([process.env.NEXT_PUBLIC_SSW_SQL_SEARCH_API_URL, item])
                .then((response) => {
                    const jsonData = JSON.parse(response[0].data[0].dsctn); // JSON 변환
                    setNodeDataState(jsonData);
                    // 계층적 json으로 데이터 가공 후, items -> children으로 이름변경후 state에 넣어줌
                    // setNodeDataState(expandOneDepth(convertItemsToChildren(treeData(response[0].data))));
                })
                .catch((error) => {
                    console.error(error);
                })
                .finally(() => {
                    //setDataLoading(false);
                });
        }
    }, [masterRetrieve]);

    useEffect(() => {
        if (nodeDataState) {
            setMasterRetrieve(false);
        }
    }, [nodeDataState]);
    // 버튼 타입별 Handler 실행
    const handleClick = (type: string) => {
        switch (type) {
            case 'CONFIRM':
                setModalOpen(true);
                break;
            case 'TEMPSAVE':
                break;
            case 'SAVE':
                if (confirm('발령을 확정하시겠습니까?')) {
                    handleCloseModal();
                } else {
                    return;
                }
                break;
            case 'CLOSE':
                handleCloseModal();
                break;
            default:
                break;
        }
    };
    if (dataLoading) return <Loader />;

    return (
        <>
            <Grid container spacing={2}>
                {/* title , search button , sesarch box */}
                <Grid item xs={12}>
                    <SearchCondition
                        masterUIinfo={masterUI}
                        tpcdParam={tpcdParam}
                        dataParam={dataParam}
                        searchParam={searchParams}
                        setDataParam={setDataParam}
                        handleSubmit={handleSubmit}
                        setDisplay={''}
                    />
                </Grid>
                {/* grid title , grid description , grid */}
                <Grid item xs={12}>
                    <Stack direction={'row'} sx={{ justifyContent: 'space-between', margin: 0 }}>
                        <Stack
                            direction={'row'}
                            sx={{ justifyContent: 'space-between', margin: 0, alignItems: 'center' }}
                        >
                            <Tooltip title="조직개편 시뮬레이션 화면입니다." placement="right-start" sx={{ margin: 0 }}>
                                <Typography
                                    sx={{
                                        fontWeight: 'bold',
                                        fontSize: '20px',
                                        '&:hover': {
                                            cursor: 'pointer',
                                        },
                                    }}
                                >
                                    조직개편 시뮬레이션
                                </Typography>
                            </Tooltip>
                        </Stack>
                        <Stack direction={'row'} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                            {sortBySeqBtn?.map((item) => (
                                <CustomButton
                                    key={item.seq}
                                    customButton={item}
                                    clickEvent={() => handleClick(item.type)}
                                />
                            ))}
                        </Stack>
                    </Stack>
                    {nodeDataState && (
                        <Stack sx={{ height: 2000, left: 600 }}>
                            <div style={{ height: 1000, left: 600 }}>
                                <SortableTree
                                    treeData={nodeDataState}
                                    rowHeight={130}
                                    debugMode={true}
                                    react-virtuoso={false}
                                    onChange={(newTreeData) => handleChange(newTreeData)}
                                    generateNodeProps={(rowInfo) => ({
                                        title: (
                                            <TreeNode
                                                node={rowInfo.node}
                                                onContextMenu={(event) => handleContextMenu(event, rowInfo.node)}
                                                onDoubleClick={() => handleDoubleClick(rowInfo.node)}
                                                isEditing={editingNode === rowInfo.node}
                                                onEditChange={handleEditChange}
                                                onEditSubmit={handleEditSubmit}
                                            />
                                        ),
                                    })}
                                />
                                <Menu
                                    open={contextMenu !== null}
                                    onClose={handleClose}
                                    anchorReference="anchorPosition"
                                    anchorPosition={
                                        contextMenu !== null
                                            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                                            : undefined
                                    }
                                >
                                    <MenuItem onClick={handleAddChild}>하위에 노드추가</MenuItem>
                                    <MenuItem onClick={handleDeleteNode}>노드삭제</MenuItem>
                                </Menu>
                            </div>
                        </Stack>
                    )}
                </Grid>
            </Grid>
            {nodeDataState && (
                <Modal
                    open={modalOpen}
                    onClose={handleCloseModal}
                    aria-labelledby="modal-title"
                    aria-describedby="modal-description"
                >
                    <Grid
                        item
                        xs={12}
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 600,
                            bgcolor: 'background.paper',
                            boxShadow: 24,
                            p: 4,
                        }}
                    >
                        <Stack direction={'row'} sx={{ justifyContent: 'space-between', margin: 1 }}>
                            <Stack
                                direction={'row'}
                                sx={{ justifyContent: 'space-between', margin: 0, alignItems: 'center' }}
                            >
                                <Tooltip
                                    title="조직개편 시뮬레이션의 발령을 확정합니다."
                                    placement="right-start"
                                    sx={{ margin: 0 }}
                                >
                                    <Typography
                                        sx={{
                                            fontWeight: 'bold',
                                            fontSize: '20px',
                                            '&:hover': {
                                                cursor: 'pointer',
                                            },
                                        }}
                                    >
                                        발령확정
                                    </Typography>
                                </Tooltip>
                            </Stack>
                            <Stack direction={'row'} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                {modalBtn?.map((item) => (
                                    <CustomButton
                                        key={item.seq}
                                        customButton={item}
                                        clickEvent={() => handleClick(item.type)}
                                    />
                                ))}
                            </Stack>
                        </Stack>

                        <Box sx={BoxStyles()}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <Typography variant="body1" sx={TypographyStyles()}>
                                    발령일자
                                </Typography>
                                <DatePicker
                                    value={
                                        dataParam.master[0]?.params[0].std_ymd
                                            ? dayjs(dataParam.master[0]?.params[0].std_ymd, 'YYYYMMDD')
                                            : dayjs(new Date())
                                    }
                                    sx={DatePickerStyles()}
                                    format="YYYY.MM.DD"
                                    minDate={dayjs(new Date('1900-01-01'))}
                                    maxDate={dayjs(new Date('2999-12-31'))}
                                />
                            </LocalizationProvider>
                        </Box>
                    </Grid>
                </Modal>
            )}
        </>
    );
}
