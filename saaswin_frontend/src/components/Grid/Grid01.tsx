'use client';
import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { DataGridPremiumProps, GridColDef, GridColumnGroupingModel } from '@mui/x-data-grid-premium';
import { useTranslation } from 'react-i18next';
import { ColBinding } from '../../data/ColBinding';
import { randomId } from '@mui/x-data-grid-generator';

// 커스텀 훅 임포트
import { useGridState } from './hooks/useGridState';
import { useGridHandlers } from './hooks/useGridHandlers';

// 컴포넌트 임포트
import GridButtons from './GridButtons';
import GridContextMenu from './components/GridContextMenu';
import GridModals from './components/GridModals';
import { handleAttach, handleCheckModal, handleFullModal, handleOrgChartModal } from './components/GridModalHandlers';

// 커스텀 컴포넌트 임포트
import { StyledDataGrid, CustomNoRowsOverlay } from './utils/gridStyles';
import CustomColumnMenu from './components/CustomColumnMenu';
import EditToolbar from './components/EditToolbar';

// 타입 임포트
import { GridDataProps, SortBySeqBtnItem } from './types';

function Grid01({
    masterUI,
    tpcdParam,
    setMasterRetrieve,
    gridData,
    gridSortData,
    rowData,
    treeCol,
    sheetName,
    setDataParam,
    dataSeInfo,
    item,
    gridKey,
    userData,
    ognzData,
    comboData,
    initParam,
    setKey,
    formName,
    handleSend,
    setHasChange,
    invtnId: propInvtnId,
    triggerSave,
}: GridDataProps) {
    // 커스텀 훅을 통한 상태 관리
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
        // valiColumn,
        // setValiColumn,
        requiredColumn,
        setRequiredColumn,
    } = gridState;
    // 데이터 및 설정
    const description = masterUI?.grid_tit_info?.[0].description;
    const gridTitleData = masterUI?.grid_tit_info?.[0].title;
    const gridButtonData = masterUI?.grid_btn_info || [];
    const whereData = initParam?.[0]?.params?.[0] || [];
    const displayStyle = '';
    // 다국어 설정
    const { t } = useTranslation();
    // console.log('masterUI:', masterUI);
    // 그리드 높이를 관리할 상태 추가
    const [gridHeight, setGridHeight] = useState('calc(100vh - 200px)'); // 기본값 설정

    // 이벤트 핸들러
    const handleAnchor = () => setAnchorEl(!anchorEl);
    const handleMailModalClose = () => setMailModalOpen(false);
    const handleAgtAuthModalClose = () => setAgtAuthModalOpen(false);
    const handleReorgModalClose = () => setReorgModalOpen(false);
    const handleAddressOpen = () => setPostOpen(!postOpen);
    const handleCloseModal = () => {
        setComModalOpen((prev) => !prev);
        setComModalData(null);
    };
    const handleOrgChartClose = () => setOrgChartOpen(false);

    // 트리 데이터 관련 설정
    const treeYn = !!treeCol;
    const getTreeDataPath: DataGridPremiumProps['getTreeDataPath'] = (row) => row?.['hierarchy']?.split('$') || [];
    const groupingColDef: DataGridPremiumProps['groupingColDef'] = {
        headerName: '',
        headerAlign: 'center',
        width: 20,
        filterOperators: [],
    };

    // 팝업 핸들러
    const handleCommonPopup = (param: Record<string, any>) => {
        setComModalData(param);
        setComModalOpen(true);
    };

    // 커스텀 훅을 통한 이벤트 핸들러 관리
    const {
        CheckEvent,
        editStartEvent,
        handleRowClick,
        changeDifferRow,
        handleContextMenu,
        handleAddRow,
        handleDeleteRow,
        handleAddressSelection,
        handleCellClick,
        handleActionClick,
        handleRowEditable,
        handleEncrypt,
        handleAttachModal,
    } = useGridHandlers({
        treeYn,
        gridRef,
        rows,
        setRows,
        setContextMenu,
        setAnchorEl,
        setModalData,
        setDataParam,
        dataSeInfo,
        sheetName,
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
    // 버튼 필터링
    const showByKeyBtn = (Array.isArray(gridButtonData) ? gridButtonData : [])
        .filter((aItem) => {
            const butonKey = aItem.btnKey;
            const butonValue = aItem.btnValue;
            const btnType = aItem.btnType;

            if (btnType === 'sb') {
                return (whereData.hasOwnProperty(butonKey) && butonValue == whereData[butonKey]) || butonKey === 'all';
            } else if (btnType === 'inq') {
                return butonValue == whereData.job_ddln_yn || butonKey === 'all';
            } else {
                return butonKey === 'all';
            }
        })
        .slice()
        .sort((a: SortBySeqBtnItem, b: SortBySeqBtnItem) => Number(b.seq) - Number(a.seq));
    // 열 데이터 설정
    useEffect(() => {
        if (gridData.length > 0) {
            const {
                columns,
                columnGroupingModel,
                pinnedColumns,
                requiredColumn,
                insertParam,
                columnVisibilityModel,
                checkboxSelection,
            } = ColBinding(
                gridData,
                gridRef,
                setPostOpen,
                setClickRow,
                setClickField,
                changeDifferRow,
                userData,
                ognzData,
                comboData,
                handleActionClick,
                handleCellClick,
                handleCommonPopup,
                handleEncrypt,
                handleAttachModal
                // setValiColumn
            );

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
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gridData, comboData, userData, ognzData]);
    useEffect(() => {
        if (gridRef.current) {
            const hasChanges = rows.some((row) => row.isNew === true || row.hasChanged === true);
            if (setHasChange) {
                setHasChange(hasChanges);
            }
        }
    }, [rows]);

    // 행 데이터 설정
    useEffect(() => {
        if (rowData?.clct_nm) {
            setInvtnId(rowData?.invtn_clct_id);
            setInvtnNm(rowData?.clct_nm);
            rowData = rowData.artcl_info;
        }

        // Check if rowData is a non-empty array and gridData is a non-empty array
        if (
            rowData &&
            Array.isArray(rowData) &&
            rowData.length > 0 &&
            gridData &&
            Array.isArray(gridData) &&
            gridData.length > 0
        ) {
            let seq = 1;
            // const id = randomId(); // This line was part of the original debugging, but processedRow.id uses randomId() + index, so this specific 'id' const might be unused if not used elsewhere for updatedRows. Assuming it might be used or was for other purposes. If it's truly unused after this edit, it can be removed in a subsequent step.

            // gridData를 기반으로 emptyvalue를 빠르게 찾기 위한 맵 생성
            const emptyValueMap = {};
            gridData.forEach((colDef) => {
                // Iterate through gridData
                // Check if 'id' (instead of 'field') exists and emptyvalue is explicitly set
                if (colDef.id && colDef.emptyvalue !== undefined && colDef.emptyvalue !== null) {
                    emptyValueMap[colDef.id] = colDef.emptyvalue; // Use colDef.id as key
                }
            });

            const updatedRows = rowData.map((row, index) => {
                const processedRow = {
                    id: randomId() + index, // Ensure row.id is unique, not to be confused with colDef.id
                    seq: seq++,
                    ...(seq === 2 ? { status: 'clicked' } : {}),
                    ...row, // Spread existing row data
                };

                // 각 필드를 순회하며 emptyvalue 적용
                for (const dataFieldKey in processedRow) {
                    // Use a different variable name for clarity
                    // Check if the property belongs to the object itself
                    if (processedRow.hasOwnProperty(dataFieldKey)) {
                        // 해당 필드에 대한 emptyvalue가 맵에 존재하고, 현재 값이 null 또는 undefined인 경우
                        // emptyValueMap uses colDef.id as keys
                        if (
                            emptyValueMap.hasOwnProperty(dataFieldKey) &&
                            (processedRow[dataFieldKey] === null || processedRow[dataFieldKey] === undefined)
                        ) {
                            processedRow[dataFieldKey] = emptyValueMap[dataFieldKey];
                        }
                    }
                }

                return processedRow;
            });

            // Check if treeData is a function before calling it
            setRows(treeCol && typeof treeData === 'function' ? treeData(updatedRows, treeCol) : updatedRows);
        } else {
            setRows([]);
        }
        // Add gridData to the dependency array
    }, [rowData, setInvtnId, setInvtnNm, treeCol, gridData]);

    // 주소 데이터 변경 처리
    useEffect(() => {
        if (adressData && clickRow) {
            handleAddressSelection(adressData, clickRow, clickfield);
        }
    }, [adressData, clickRow, clickfield, handleAddressSelection]);

    // props로 받은 값을 내부 상태에 설정
    useEffect(() => {
        if (propInvtnId) {
            setInvtnId(propInvtnId);
        }
    }, [propInvtnId, setInvtnId]);

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
            const gridContainer = document.getElementById(sheetName);
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

            // 콘솔에 디버깅 정보 출력
            console.log('Grid Height Calculation:', {
                viewportHeight,
                containerOffset,
                calculatedHeight,
                finalHeight,
            });
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
    }, [sheetName]); // sheetName이 변경될 때만 실행
    return (
        <>
            <GridButtons
                masterUI={masterUI}
                gridTitleData={gridTitleData}
                description={description}
                showByKeyBtn={showByKeyBtn}
                tpcdParam={tpcdParam}
                rowData={rowData}
                item={item}
                gridKey={gridKey}
                setMasterRetrieve={setMasterRetrieve}
                setRows={setRows}
                setKey={setKey}
                handleSend={handleSend}
                formName={formName}
                invtnNm={invtnNm}
                invtnId={invtnId}
                gridRef={gridRef}
                setMailModalOpen={setMailModalOpen}
                setAgtAuthModalOpen={setAgtAuthModalOpen}
                setAgtAuthData={setAgtAuthData}
                setReorgModalOpen={setReorgModalOpen}
                rows={rows}
                initParam={initParam}
                whereData={whereData}
                insertParam={insertParam}
                setModalData={setModalData}
                setPayModalData={setPayModalData}
                handleSend={handleSend}
                triggerSave={triggerSave}
                requiredColumn={requiredColumn}
                changeDifferRow={changeDifferRow}
            />
            <div
                id={sheetName}
                style={{
                    display: displayStyle,
                    // height: '100%',
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
                            apiRef={gridRef}
                            rows={rows}
                            columns={columns}
                            editMode='cell'
                            rowModesModel={rowModesModel}
                            columnGroupingModel={columnGroupingModel}
                            initialState={{
                                pinnedColumns: pinnedColumns,
                                sorting: {
                                    sortModel: gridSortData,
                                },
                            }}
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
                            onCellClick={CheckEvent}
                            rowHeight={30}
                            isCellEditable={(params) => {
                                // 예: 특정 ID를 가진 행은 편집 불가능
                                // return params.row.clct_type !== 'hpr_group00002_cm0001'; // ID가 1인 행만 편집 불가능
                                return handleRowEditable(params);
                            }}
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
            <GridModals
                modalData={modalData}
                setModalData={setModalData}
                payModalData={payModalData}
                setPayModalData={setPayModalData}
                comModalData={comModalData}
                comModalOpen={comModalOpen}
                handleCloseModal={handleCloseModal}
                postOpen={postOpen}
                setAdressData={setAdressData}
                handleAddressOpen={handleAddressOpen}
                mailModalOpen={mailModalOpen}
                handleMailModalClose={handleMailModalClose}
                agtAuthModalOpen={agtAuthModalOpen}
                handleAgtAuthModalClose={handleAgtAuthModalClose}
                agtAuthData={agtAuthData}
                reorgModalOpen={reorgModalOpen}
                handleReorgModalClose={handleReorgModalClose}
                orgChartOpen={orgChartOpen}
                orgChartData={orgChartData}
                handleOrgChartClose={handleOrgChartClose}
                orgChartKey={orgChartKey}
                orgChartLoading={orgChartLoading}
                setOrgChartLoading={setOrgChartLoading}
                setOrgChartData={setOrgChartData}
                setOrgChartOpen={setOrgChartOpen}
                setMasterRetrieve={setMasterRetrieve}
                gridRef={gridRef}
                attachModalData={attachModalData}
                setAttachModalData={setAttachModalData}
                changeDifferRow={changeDifferRow}
            />
        </>
    );
}

export default Grid01;
