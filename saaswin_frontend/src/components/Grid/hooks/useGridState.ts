import { useState } from 'react';
import { randomId } from '@mui/x-data-grid-generator';
import {
    GridColDef,
    GridColumnGroupingModel,
    GridRowId,
    GridRowModesModel,
    useGridApiRef,
} from '@mui/x-data-grid-premium';
import { RowData } from '../types';
import { treeData } from 'data/gridTreeBinding';

interface ModalData {
    evl_id: string;
    evl_prgrs_stts_cd: string;
    open: boolean;
}

interface PayModalData {
    slry_ocrn_id: string;
    isNew: boolean;
    step_cd: string;
    open: boolean;
}

interface ContextMenuData {
    mouseX: number;
    mouseY: number;
    row: Record<string, any>;
}

export function useGridState(treeCol?: string) {
    // 그리드 API 참조
    const gridRef = useGridApiRef();

    // 모달 관련 상태
    const [modalData, setModalData] = useState<ModalData | null>(null);
    const [payModalData, setPayModalData] = useState<PayModalData | null>(null);
    const [comModalData, setComModalData] = useState<Record<string, any> | null>(null);
    const [comModalOpen, setComModalOpen] = useState(false);
    const [mailModalOpen, setMailModalOpen] = useState(false);
    const [agtAuthModalOpen, setAgtAuthModalOpen] = useState(false);
    const [agtAuthData, setAgtAuthData] = useState<Record<string, any> | null>(null);
    const [reorgModalOpen, setReorgModalOpen] = useState(false);
    const [orgChartOpen, setOrgChartOpen] = useState(false);
    const [orgChartData, setOrgChartData] = useState<Record<string, any>[] | null>(null);
    const [orgChartLoading, setOrgChartLoading] = useState(false);
    const [orgChartKey, setOrgChartKey] = useState(0);
    const [attachModalData, setAttachModalData] = useState<ModalData | null>(null);

    // 그리드 칼럼 관련 상태
    const [columns, setColumns] = useState<GridColDef[] | null>(null);
    const [columnGroupingModel, setColumnGroupingModel] = useState<GridColumnGroupingModel | null>(null);
    const [pinnedColumns, setPinnedColumns] = useState({});
    const [insertParam, setInsertParam] = useState({});
    const [columnVisibilityModel, setColumnVisibilityModel] = useState({});
    const [checkboxSelection, setCheckboxSelection] = useState(false);
    // const [valiColumn, setValiColumn] = useState(true);
    const [requiredColumn, setRequiredColumn] = useState<Record<string, string>>({});

    // 그리드 데이터 관련 상태
    const [rows, setRows] = useState<RowData[]>([]);
    const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

    // 주소 검색 관련 상태
    const [adressData, setAdressData] = useState<Record<string, any> | undefined>();
    const [postOpen, setPostOpen] = useState(false);
    const [clickRow, setClickRow] = useState<GridRowId | null>(null);
    const [clickfield, setClickField] = useState<GridRowId | null>(null);

    // 컨텍스트 메뉴 관련 상태
    const [anchorEl, setAnchorEl] = useState<boolean>(false);
    const [contextMenu, setContextMenu] = useState<ContextMenuData | null>(null);

    // 초대 관련 상태
    const [invtnId, setInvtnId] = useState('');
    const [invtnNm, setInvtnNm] = useState('');

    // 트리 관련 상태
    const [treeDepth, setTreeDepth] = useState(0);

    // 행 데이터 설정 함수
    const setRowData = (rowData: any, treeColumn?: string) => {
        if (rowData?.clct_nm) {
            setInvtnId(rowData?.invtn_clct_id);
            setInvtnNm(rowData?.clct_nm);
            rowData = rowData.artcl_info;
        }

        if (rowData && rowData.length > 0) {
            let seq = 1;
            const id = randomId();
            const updatedRows = rowData.map((row: any, index: number) => ({
                id: id + index,
                seq: seq++,
                ...(seq === 2 ? { status: 'clicked' } : {}),
                ...row,
            }));

            setRows(treeColumn ? treeData(updatedRows, treeColumn) : updatedRows);
        } else {
            setRows([]);
        }
    };

    return {
        // 그리드 참조
        gridRef,

        // 모달 관련 상태 및 설정 함수
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
        attachModalData,
        setAttachModalData,

        // 그리드 칼럼 관련 상태 및 설정 함수
        columns,
        setColumns,
        columnGroupingModel,
        setColumnGroupingModel,
        pinnedColumns,
        setPinnedColumns,
        requiredColumn,
        setRequiredColumn,
        insertParam,
        setInsertParam,
        columnVisibilityModel,
        setColumnVisibilityModel,
        checkboxSelection,
        setCheckboxSelection,
        // valiColumn,
        // setValiColumn,

        // 그리드 데이터 관련 상태 및 설정 함수
        rows,
        setRows,
        rowModesModel,
        setRowModesModel,
        setRowData,

        // 주소 검색 관련 상태 및 설정 함수
        adressData,
        setAdressData,
        postOpen,
        setPostOpen,
        clickRow,
        setClickRow,
        clickfield,
        setClickField,

        // 컨텍스트 메뉴 관련 상태 및 설정 함수
        anchorEl,
        setAnchorEl,
        contextMenu,
        setContextMenu,

        // 초대 관련 상태 및 설정 함수
        invtnId,
        setInvtnId,
        invtnNm,
        setInvtnNm,

        // 트리 관련 상태 및 설정 함수
        treeDepth,
        setTreeDepth,
    };
}
