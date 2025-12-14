'use client';
import { Box, Divider, IconButton, Stack, Tooltip } from '@mui/material';
import { darken, lighten, styled, Theme } from '@mui/material/styles';
import { randomId } from '@mui/x-data-grid-generator';
import {
    DataGridPremium,
    DataGridPremiumProps,
    GridCellParams,
    GridColDef,
    GridColumnGroupingModel,
    GridColumnMenuFilterItem,
    GridColumnMenuPinningItem,
    GridColumnMenuProps,
    GridColumnMenuSortItem,
    GridEditInputCell,
    GridEventListener,
    GridRowId,
    GridRowModesModel,
    GridRowsProp,
    GridSlots,
    useGridApiEventHandler,
    useGridApiRef,
} from '@mui/x-data-grid-premium';
import CommonPopup from 'components/CommonPopup';
import { treeData } from 'data/gridTreeBinding';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetcherPostData } from 'utils/axios';
import { useSheetStore } from 'utils/store/sheet';
import { ColBinding } from '../../data/ColBinding';
import CustomButton from '../CustomButton';
import '../../styles/styles.scss';
import Typography from 'components/Typography';
import SearchAddress from 'components/SearchAddress';
import dayjs from 'dayjs';
import { StyledDataGrid, CustomNoRowsOverlay } from './utils/gridStyles';
import CustomColumnMenu from './components/CustomColumnMenu';
import EditToolbar from './components/EditToolbar';
import GridContextMenu from './components/GridContextMenu';
import { useGridState } from './hooks/useGridState';
import { handleAttach, handleFullModal, handleOrgChartModal } from './components/GridModalHandlers';
import { useGridHandlers } from './hooks/useGridHandlers';
import { handleCheckModal } from './components/GridModalHandlers';
import SearchIcon from '@mui/icons-material/Search';

interface enumItemProps {
    enum: string;
    enumKey: string;
}
interface gridDataItem {
    seq: string;
    id: string;
    header1: string | null;
    header2: string;
    type: string;
    align?: string;
    width: string;
    required?: string;
    canedit?: string;
    insertedit?: string;
    insertdefault?: string;
    visible?: string;
    enum?: enumItemProps;
    emptyvalue?: string;
    customformat?: string;
    formula?: string;
    dateformat?: string;
    maxWidth?: string;
    minwidth?: string;
}
interface gridDataProps {
    masterUI: any;
    treeCol: string;
    treeColNm: string;
    tpcdParam: string;
    setMasterRetrieve: Function;
    gridData: any;
    rowData: any;
    comboData: any;
    initParam: any;
    param: any;
}

interface EditToolbarProps {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (newModel: (oldModel: GridRowModesModel) => GridRowModesModel) => void;
}
interface SortBySeqBtnItem {
    api: string;
    seq: string;
    sql: string;
    sqlId: string;
    sqlKey: string;
    text: string;
    type: string;
    param: Record<string, any>;
}
function CrtrGrid({
    masterUI,
    treeCol,
    tpcdParam,
    setMasterRetrieve,
    gridData,
    rowData,
    comboData,
    initParam,
    param,
}: gridDataProps) {
    const gridState = useGridState(treeCol);
    const {
        gridRef,
        rows,
        setRows,
        columns,
        setColumns,
        columnGroupingModel,
        setColumnGroupingModel,
        pinnedColumns,
        setPinnedColumns,
        insertParam,
        setInsertParam,
        columnVisibilityModel,
        setColumnVisibilityModel,
        checkboxSelection,
        setCheckboxSelection,
        rowModesModel,
        setRowModesModel,
        modalData,
        setModalData,
        payModalData,
        setPayModalData,
        comModalData,
        setComModalData,
        comModalOpen,
        setComModalOpen,
        mailModalOpen,
        setMailModalOpen,
        agtAuthModalOpen,
        setAgtAuthModalOpen,
        agtAuthData,
        setAgtAuthData,
        reorgModalOpen,
        setReorgModalOpen,
        orgChartOpen,
        setOrgChartOpen,
        orgChartData,
        setOrgChartData,
        orgChartLoading,
        setOrgChartLoading,
        orgChartKey,
        setOrgChartKey,
        adressData,
        setAdressData,
        postOpen,
        setPostOpen,
        clickRow,
        setClickRow,
        clickfield,
        setClickField,
        anchorEl,
        setAnchorEl,
        contextMenu,
        setContextMenu,
        invtnId,
        setInvtnId,
        invtnNm,
        setInvtnNm,
        attachModalData,
        setAttachModalData,
        treeDepth,
        setTreeDepth,
        requiredColumn,
        setRequiredColumn,
    } = gridState;

    const handleAddressOpen = () => setPostOpen(!postOpen);

    const description = masterUI?.grid_tit_info?.[0].description;
    const gridTitleData = masterUI?.grid_tit_info?.[0].title;
    const gridButtonData = masterUI?.grid_btn_info || [];
    const whereData = initParam[0]?.params?.[0] || [];
    const auth = JSON.parse(localStorage.getItem('auth'));
    const rprsOgnzNo = auth?.state?.rprsOgnzNo ?? '';
    const groupData = param.groupData;
    const nmData = param.nmData;
    const cdData = param.cdData;

    const [gridHeight, setGridHeight] = useState('calc(100vh - 200px)'); // 기본값 설정
    const handleAnchor = () => setAnchorEl(!anchorEl);

    const showByKeyBtn = (Array.isArray(gridButtonData) ? gridButtonData : [])
        .filter((aItem) => {
            const butonKey = aItem.btnKey;
            const butonValue = aItem.btnValue;
            const btnType = aItem.btnType;

            // 숨김조건을 조회박스에서 가져온다
            if (btnType === 'sb') {
                if ((whereData.hasOwnProperty(butonKey) && butonValue == whereData[butonKey]) || butonKey === 'all') {
                    return true;
                }
                return false;
            } else if (btnType === 'inq') {
                // 숨김조건을 조회한다
                if (butonValue == whereData.job_ddln_yn || butonKey === 'all') {
                    return true;
                }
                return false;
            } else {
                if (butonKey === 'all') {
                    return true;
                }
                return false;
            }
        })
        .slice()
        .sort((a: SortBySeqBtnItem, b: SortBySeqBtnItem) => Number(b.seq) - Number(a.seq));

    const handleCloseModal = () => {
        setComModalOpen((prev) => !prev); // 상태를 안전하게 토글
        setComModalData(null);
    };

    const treeYn = !!treeCol;
    const getTreeDataPath: DataGridPremiumProps['getTreeDataPath'] = (row) => row?.['hierarchy']?.split('$') || [];
    const groupingColDef: DataGridPremiumProps['groupingColDef'] = {
        headerName: '',
        headerAlign: 'center',
        width: 20,
        filterOperators: [],
    };

    const {
        CheckEvent,
        editStartEvent,
        handleRowClick,
        changeDifferRow,
        handleContextMenu,
        handleAddRow,
        handleDeleteRow,
        handleCellClick,
        handleActionClick,
    } = useGridHandlers({
        treeYn,
        gridRef,
        rows,
        setRows,
        setClickRow,
        setClickField,
        setContextMenu,
        setAnchorEl,
        setModalData,
        setDataParam: '',
        dataSeInfo: [],
        sheetName: tpcdParam,
        handleFullModal: (id: string, modalPath: string) => handleFullModal(id, gridRef, modalPath, setModalData),
        handleCheckModal: (modalPath: string) => handleCheckModal(gridRef, modalPath, setModalData),
        handleAttachModal: (params: any, modalPath: string) =>
            handleAttach(params, gridRef, modalPath, setAttachModalData),
        handleOrgChartModal: (id?: string) =>
            handleOrgChartModal(
                id,
                gridRef,
                setOrgChartData,
                setOrgChartLoading,
                setOrgChartOpen,
                handleReorgModalClose
            ),
    });

    // 다국어
    const { t, i18n } = useTranslation();

    const handleInsert = () => {
        const id = randomId();
        const lastPrord = rows[rows.length - 1]?.sort_seq || rows.length;
        const maxCode = Math.max(
            ...rows
                .map((row) => {
                    const value = row[cdData];
                    // 값이 null/undefined/빈문자열이 아니면 substring, 아니면 NaN 반환
                    return value ? Number(value.substring(rprsOgnzNo.length)) : NaN;
                })
                .filter((num) => !isNaN(num)) // NaN 값은 제외
        );
        const formattedNumber = (maxCode + 1).toString().padStart(4, '0');
        const newRow = {
            ...insertParam,
            id: id,
            // [cdData]: rprsOgnzNo + formattedNumber,
            // sort_seq: lastPrord + 1,
            seq: lastPrord + 1,
        };

        if (cdData) {
            newRow[cdData] = rprsOgnzNo + formattedNumber;
            newRow.sort_seq = lastPrord + 1;
        }

        gridRef.current.updateRows([{ ...newRow }]);
        handleRowClick(gridRef.current.getRowParams(id));

        setRows((oldRows) => [...oldRows, newRow]);
    };

    const handleTreeInsert = () => {
        const id = randomId();
        // const lastPrord = rows[rows.length - 1]?.sort_seq || rows.length;
        const maxPrord = Math.max(
            ...rows
                .filter((row) => row.parent_nm === null) // parent_nm이 null인 행만 필터링
                .map((row) => Number(row.sort_seq)) // sort_seq를 숫자로 변환
                .filter((num) => !isNaN(num)) // NaN 값은 제외
        );
        const maxCode = Math.max(
            ...rows
                .map((row) => {
                    const value = row[cdData];
                    // 값이 null/undefined/빈문자열이 아니면 substring, 아니면 NaN 반환
                    return value ? Number(value.substring(rprsOgnzNo.length)) : NaN;
                })
                .filter((num) => !isNaN(num)) // NaN 값은 제외
        );
        const formattedNumber = (maxCode + 1).toString().padStart(4, '0');
        const newRow = {
            ...insertParam,
            id: id,
            bgng_ymd: dayjs(new Date()).format('YYYY.MM.DD'), // 시작일자를 오늘로 설정
            hierarchy: '새 직무' + (maxPrord + 1),
            duty_nm: '새 직무' + (maxPrord + 1),
            seq: maxPrord + 1,
            parent_nm: null,
        };

        if (cdData) {
            newRow[cdData] = rprsOgnzNo + formattedNumber;
            newRow.sort_seq = maxPrord + 1;
        }

        gridRef.current.updateRows([{ ...newRow }]);
        handleRowClick(gridRef.current.getRowParams(id));

        setRows((oldRows) => [...oldRows, newRow]);
    };

    const handleTreeUnderInsert = () => {
        const selectedRows = Array.from(gridRef.current.getSelectedRows().values());
        if (selectedRows.length > 1) {
            alert('1개의 행을 선택해주세요');
            return;
        } else if (selectedRows.length === 0) {
            alert('하위항목을 입력할 행을 선택해주세요.');
            return;
        }

        const selectedRow = selectedRows[0];

        const id = randomId();

        const rowNode = gridRef.current.getRowNode(selectedRow.id);

        if (rowNode?.depth && rowNode.depth > 4) {
            alert('하위 직무는 5단계까지만 가능합니다.');
            return;
        }
        let sortSeq = 1;
        if (rowNode?.type === 'group') {
            sortSeq = rowNode.children.length + 1;
        }

        const maxCode = Math.max(
            ...rows
                .map((row) => {
                    const value = row[cdData];
                    // 값이 null/undefined/빈문자열이 아니면 substring, 아니면 NaN 반환
                    return value ? Number(value.substring(rprsOgnzNo.length)) : NaN;
                })
                .filter((num) => !isNaN(num)) // NaN 값은 제외
        );
        const formattedNumber = (maxCode + 1).toString().padStart(4, '0');

        const newRow = {
            ...insertParam,
            id: id,
            bgng_ymd: dayjs(new Date()).format('YYYY.MM.DD'), // 시작일자를 오늘로 설정
            end_ymd: null,
            isNew: true,
            status: 'clicked',
            hierarchy: selectedRow.hierarchy + ('$새 하위 직무' + sortSeq),
            duty_nm: '새 하위 직무' + sortSeq,
            sort_seq: sortSeq,
            parent_nm: selectedRow.duty_nm,
            [cdData]: rprsOgnzNo + formattedNumber,
        };

        if (rowNode?.depth && rowNode?.depth > treeDepth) setTreeDepth(rowNode?.depth);
        setRows((oldRows) => [...oldRows, newRow]);
    };

    const handleBtn = (item: SortBySeqBtnItem) => {
        const totalRows = [];
        let msg = '';
        let succMsg = '';
        if (item.type === 'GRID_SAVE') {
            msg = '저장하시겠습니까?';
            succMsg = '저장되었습니다.';
            const editmodel = gridRef.current.getRowModels();
            editmodel.forEach((row) => {
                if (row.hasOwnProperty('isNew')) {
                    const isNew = row?.isNew ?? false;

                    if (isNew) {
                        row.action_type = 'i';
                        row.del_yn = 'N';
                        totalRows.push(row);
                    }
                } else if (row.hasOwnProperty('hasChanged')) {
                    const hasChanged = row?.hasChanged ?? false;
                    if (hasChanged) {
                        row.action_type = 'u';
                        totalRows.push(row);
                    }
                }

                row.com_cd_nm = row[nmData];
            });
        } else if (item.type === 'GRID_DELETE') {
            msg = '삭제하시겠습니까?';
            succMsg = '삭제되었습니다.';
            const selectRows = gridRef.current.getSelectedRows();
            selectRows.forEach((row) => {
                row.action_type = 'd';
                totalRows.push(row);
            });
        }

        const keysToRemove = ['seq', 'isNew', 'cbox', 'id', 'hasChanged', 'status', 'hierarchy', 'prevStatus'];

        const filteredData = totalRows?.map((obj) =>
            Object.fromEntries(
                Object.entries(obj).filter(([key]) => !keysToRemove.includes(key) && !key.includes('preValue'))
            )
        );

        const transformedData = filteredData.map((obj) => {
            // 각 객체의 키를 변환
            return Object.entries(obj).reduce((newObj, [key, value]) => {
                // | 문자가 있는지 확인
                const pipeIndex = key.indexOf('|');

                // | 문자가 있으면 그 이후의 문자열을 새 키로 사용, 없으면 원래 키 사용
                const newKey = pipeIndex !== -1 ? key.substring(pipeIndex + 1) : key;

                // 새 객체에 변환된 키와 원래 값을 추가
                newObj[newKey] = value;
                return newObj;
            }, {});
        });

        // api 호출
        // 1. sqlId가 0이면 공통.
        // 2. sqlId가 있다면 sqlId로 호출.
        // 3. api가 있다면 api url로 호출

        const items = [
            {
                sqlId: item.sqlId,
                sql_key: item.sqlKey,
                params: [{ ognz_info: transformedData, group_cd: groupData }], // sendData의 현재 상태를 params에 포함
            },
        ];

        if (confirm(msg)) {
            fetcherPostData(items)
                .then((response) => {
                    alert(succMsg);
                    setMasterRetrieve(true);
                })
                .catch((error) => {
                    console.error(error);
                })
                .finally(() => {});
        } else {
            return;
        }
    };

    const handleBtnClick = (item: SortBySeqBtnItem) => {
        if (item.type.includes('SAVE')) {
            const editmodel = gridRef.current.getRowModels();
            const newOrEditingRows = Array.from(editmodel.values()).filter((row) => row.isNew || row.hasChanged);
            const hasError = newOrEditingRows.some((row) => {
                return Object.keys(requiredColumn).some((col) => {
                    if (!row[col] || row[col] === '' || row[col] === null || row[col] === undefined) {
                        alert(`${requiredColumn[col]} 은(는) 필수 입력 항목입니다.`);
                        return true;
                    }
                    return false;
                });
            });

            if (hasError) {
                return;
            }
        }

        switch (item.type) {
            case 'GRID_DOWNLOAD':
                // exportToExcel();
                // downloadExcel(rows);
                gridRef.current.exportDataAsExcel();
                break;
            case 'GRID_ALL_DOWNLOAD':
                // downloadAllHandler(sheetName);
                break;
            case 'GRID_UPLOAD':
                break;
            case 'GRID_INSERT':
                handleInsert();
                break;
            case 'GRID_DELETE':
            case 'GRID_SAVE':
                handleBtn(item);
                break;
            case 'CRTR_COPY':
                copyHandler(false);
                break;
            case 'CRTR_COPY_TREE':
                copyHandler(true);
                break;
            case 'GRID_TREE_INSERT':
                handleTreeInsert();
                break;
            case 'GRID_TREE_UNDER_INSERT':
                handleTreeUnderInsert();
                break;
            default:
                break;
        }
    };

    const copyHandler = (treeYn: boolean) => {
        const selectedRows = Array.from(gridRef.current.getSelectedRows().values()).sort(
            (a, b) => Number(a.seq) - Number(b.seq)
        );

        const lastPrord = rows[rows.length - 1]?.sort_seq || rows.length;

        selectedRows.forEach((row, index) => {
            const id = randomId();

            const newRow = {
                ...row,
                id: id,
                seq: lastPrord + index + 1,
                bgng_ymd: dayjs(new Date()).format('YYYY.MM.DD'), // 시작일자를 오늘로 설정
                end_ymd: null,
                isNew: true,
                com_cd: null,
                ...(index === selectedRows.length - 1 ? { status: 'clicked' } : { status: 'new' }),
                ...(treeYn ? { hierarchy: row.hierarchy + '복사' } : {}),
                ...(treeYn ? { duty_nm: row.duty_nm + '복사' } : {}),
            };

            const changeRow = {
                ...row,
                hasChanged: true,
                status: 'modify',
                end_ymd: dayjs().subtract(1, 'day').format('YYYY.MM.DD'), // 종료일자를 어제로 설정
            };

            gridRef.current.updateRows([{ ...newRow, ...changeRow }]);

            setRows((oldRows) => {
                const updatedRows = oldRows.map((item) => (item.id === row.id ? { ...changeRow } : item));

                return [...updatedRows, newRow];
            });
        });
    };

    const handleCommonPopup = (param: any) => {
        setComModalData(param);
        setComModalOpen(true);
    };

    const changeSheet = useSheetStore((state) => state.changeSheet);
    const displayStyle = '';

    function EditToolbar(props: EditToolbarProps) {
        const { setRows, setRowModesModel } = props;

        const CellClickEvent: GridEventListener<'cellClick'> = (
            params, // GridCellParams<any>
            event, // MuiEvent<React.MouseEvent<HTMLElement>>
            details // GridCallbackDetails
        ) => {
            const field = params.field;
            const rowId = params.id;
            const row = params.row;

            changeSheet(gridRef.current, rowId);
        };

        // useGridApiEventHandler(gridRef, 'cellClick', CheckEvent);
        // useGridApiEventHandler(gridRef, 'cellEditStart', editStartEvent);
        useGridApiEventHandler(gridRef, 'cellClick', CellClickEvent);
    }

    useEffect(() => {
        const {
            columns,
            columnGroupingModel,
            pinnedColumns,
            insertParam,
            columnVisibilityModel,
            checkboxSelection,
            requiredColumn,
        } = ColBinding(
            gridData,
            gridRef,
            setPostOpen,
            setClickRow,
            setClickField,
            changeDifferRow,
            [],
            [],
            [],
            handleActionClick,
            handleCellClick,
            handleCommonPopup,
            '',
            ''
        ); // 페이지 공통 변수
        columns.forEach((column: GridColDef) => {
            if (column.headerName) {
                column.headerName = t(column.headerName as string);
            }
        });
        columnGroupingModel.forEach((model: GridColumnGroupingModel) => {
            if (model.headerName) {
                model.headerName = t(model.headerName as string);
            }
        });
        setColumns(columns);
        setColumnGroupingModel(columnGroupingModel);
        setPinnedColumns(pinnedColumns);
        setInsertParam(insertParam);
        setColumnVisibilityModel(columnVisibilityModel);
        setCheckboxSelection(checkboxSelection);
        setRequiredColumn(requiredColumn);
    }, [gridData, comboData, i18n.language, i18n.initialized]);

    useEffect(() => {
        if (rowData && rowData.length > 0) {
            let seq = 1;

            // 중복 hierarchy 체크를 위한 Map
            const hierarchyCount = new Map<string, number>();

            // 먼저 모든 hierarchy의 개수를 센다
            rowData.forEach((row) => {
                if (row.hierarchy) {
                    const count = hierarchyCount.get(row.hierarchy) || 0;
                    hierarchyCount.set(row.hierarchy, count + 1);
                }
            });

            const rows = rowData.map((row, index) => {
                const newRow = {
                    id: randomId() + index,
                    seq: seq++,
                    ...(seq === 2 ? { status: 'clicked' } : {}),
                    ...row,
                };

                // 중복된 hierarchy가 있는 경우에만 고유 식별자 추가
                if (treeYn && newRow.hierarchy && hierarchyCount.get(newRow.hierarchy) > 1) {
                    newRow.hierarchy = `${newRow.hierarchy}_${newRow.id}`;
                }

                return newRow;
            });
            setRows(rows);
        } else {
            setRows([]);
        }
    }, [rowData, treeYn]);

    // 주소 데이터 변경 처리
    useEffect(() => {
        if (adressData && clickRow) {
            if (!clickRow || !clickfield) return;

            const row = gridRef.current.getRow(clickRow);

            const field = clickfield.includes('|')
                ? clickfield.replace(/(\|[^_]+)_.*$/, '$1')
                : clickfield.replace(/([^_]+)_.*$/, '$1');

            let updateRow = { ...row, hasChanged: true };

            if (adressData?.zip) {
                updateRow = {
                    ...updateRow,
                    [clickfield]: adressData?.zip,
                    [`${field}_addr`]: adressData?.addr,
                    [`${field}_eng_addr`]: adressData?.eng_addr,
                };
            }

            changeDifferRow(updateRow, row, clickfield);
            gridRef.current.updateRows([updateRow]);
        }
    }, [adressData]);

    // 언어 변경 이벤트 감지 로그
    useEffect(() => {
        const handler = (lng) => {
            console.log('[CrtrGrid] i18n languageChanged 이벤트 발생:', lng);
        };
        i18n.on('languageChanged', handler);
        return () => i18n.off('languageChanged', handler);
    }, [i18n]);

    // 그리드 높이를 동적으로 계산
    useEffect(() => {
        // debounce 함수 구현
        const debounce = (func: Function, wait: number) => {
            let timeout: NodeJS.Timeout;
            return function executedFunction(...args: any[]) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        };

        const calculateGridHeight = () => {
            // 그리드 컨테이너 요소 (grid buttons 등을 제외한 순수 그리드가 들어갈 공간)
            const gridContainer = document.getElementById(tpcdParam);
            if (!gridContainer) return;

            // 페이지 가시 영역 높이 (스크롤바 제외)
            const viewportHeight = document.documentElement.clientHeight;

            // 그리드 컨테이너의 오프셋 계산 (컨테이너가 페이지 상단으로부터 얼마나 떨어져 있는지)
            const containerOffset = gridContainer.getBoundingClientRect().top;

            // 여백을 고려한 높이 계산 (하단 여백 20px)
            const calculatedHeight = viewportHeight - containerOffset - 20;

            // 최소 높이 보장 (400px 이하로 내려가지 않도록)
            const finalHeight = Math.max(calculatedHeight, 400);

            // 계산된 높이 설정
            setGridHeight(`${finalHeight}px`);
        };

        // 초기 높이 계산
        calculateGridHeight();

        // 최적화된 리사이즈 이벤트 핸들러
        const debouncedCalculateHeight = debounce(calculateGridHeight, 200);

        // 창 크기가 변경될 때 높이 재계산 (디바운스 적용)
        window.addEventListener('resize', debouncedCalculateHeight);

        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
            window.removeEventListener('resize', debouncedCalculateHeight);
        };
    }, [tpcdParam]); // sheetName이 변경될 때만 실행

    // useEffect(() => {
    //     if (treeDepth > 0) {
    //         const baseWidth = 50;
    //         const depthPadding = 5; // 각 깊이당 추가 패딩
    //         const newWidth = baseWidth + treeDepth * depthPadding;

    //         setTimeout(() => {
    //             gridRef.current.setColumnWidth('__tree_data_group__', newWidth);
    //         }, 0);
    //     }
    // }, [treeDepth]);

    return (
        <>
            <div className='gridHeader'>
                <Typography type='table' tooltip title={t(description)}>
                    {t(gridTitleData)}
                </Typography>
                {rowData && <span className='total'>총 {rowData.length}건</span>}
                <Stack direction={'row'} sx={{ justifyContent: 'space-between', alignItems: 'center', gap: '5px' }}>
                    {showByKeyBtn?.map((item: SortBySeqBtnItem) => (
                        <CustomButton
                            key={item.seq}
                            customButton={item}
                            clickEvent={() => handleBtnClick(item)}
                            setData={setRows}
                            className='btnPrimary sm reset'
                            masterUI={masterUI}
                        />
                    ))}
                </Stack>
            </div>
            <div
                id={tpcdParam}
                style={{
                    display: displayStyle,
                    width: '100%',
                    minHeight: '400px',
                    overflow: 'hidden', // 이 컨테이너 내부에서만 스크롤 허용
                }}
            >
                {columns && (
                    <Box
                        sx={{
                            width: '100%',
                            height: gridHeight,
                            overflow: 'auto', // 내부 스크롤 허용
                            '& .actions': {
                                color: 'text.secondary',
                            },
                            '& .textPrimary': {
                                color: 'text.primary',
                            },
                        }}
                    >
                        <StyledDataGrid
                            treeData={treeYn}
                            getTreeDataPath={getTreeDataPath}
                            groupingColDef={groupingColDef}
                            defaultGroupingExpansionDepth={treeYn ? -1 : 0}
                            key={rows.length}
                            apiRef={gridRef}
                            rows={rows} // data
                            columns={columns} // header
                            editMode='cell'
                            rowModesModel={rowModesModel} // row상태
                            columnGroupingModel={columnGroupingModel} // merge할 header
                            initialState={{ pinnedColumns: pinnedColumns }} // 처음 그려질 때 있어야하는 컬럼(?) 체크박스 있는 경우 왼편에 고정해야 하므로 받아오는게 나을듯?
                            slots={{
                                toolbar: EditToolbar,
                                noRowsOverlay: CustomNoRowsOverlay,
                                columnMenu: CustomColumnMenu,
                            }}
                            slotProps={{
                                toolbar: {
                                    setRows,
                                    setRowModesModel,
                                    gridRef,
                                    CheckEvent,
                                    editStartEvent,
                                },
                                row: {
                                    ...(treeYn
                                        ? {
                                              onContextMenu: (event: React.MouseEvent<HTMLDivElement>) => {
                                                  event.preventDefault();
                                                  event.stopPropagation();
                                                  const rowId = event.currentTarget.getAttribute('data-id');
                                                  const row = rows.find((row) => String(row.id) === rowId);
                                                  if (row) {
                                                      handleContextMenu(event, row);
                                                  }
                                              },
                                          }
                                        : null),
                                },
                            }}
                            checkboxSelection={checkboxSelection}
                            disableRowSelectionOnClick
                            columnVisibilityModel={columnVisibilityModel}
                            processRowUpdate={(updatedRow, originalRow) => {
                                return changeDifferRow(updatedRow, originalRow, 'origin');
                            }}
                            hideFooterRowCount
                            onProcessRowUpdateError={(error) => console.log(error)}
                            localeText={{
                                columnMenuSortAsc: '오름차순 정렬',
                                columnMenuSortDesc: '내림차순 정렬',
                                columnMenuUnsort: '정렬 해제',
                                columnMenuFilter: '필터',
                                filterPanelAddFilter: '필터 추가',
                                noRowsLabel: '표시할 데이터가 없습니다',
                                noResultsOverlayLabel: '표시할 데이터가 없습니다.',
                            }}
                            getRowClassName={(params) => `super-app-theme--${params.row.status}`}
                            onRowClick={handleRowClick}
                            rowHeight={30}
                            // rowSelectionPropagation={{ parents: true, descendants: true }}
                            // unstable_rowSpanning
                        />
                        <GridContextMenu
                            anchorEl={anchorEl}
                            contextMenu={contextMenu}
                            handleAnchor={handleAnchor}
                            handleAddRow={handleAddRow}
                            handleDeleteRow={handleDeleteRow}
                        />
                    </Box>
                )}
            </div>
            {comModalData && <CommonPopup open={comModalOpen} onClose={handleCloseModal} params={comModalData} />}
            <SearchAddress modalOpen={postOpen} setData={setAdressData} handleOpen={handleAddressOpen} />
        </>
    );
}
export default CrtrGrid;
