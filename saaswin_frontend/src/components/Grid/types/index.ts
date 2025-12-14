// Grid 컴포넌트 관련 타입 정의
import { GridRowModesModel, GridRowsProp, GridRowId } from '@mui/x-data-grid-premium';

export interface EnumItemProps {
    enum: string;
    enumKey: string;
}

export interface GridDataItem {
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
    enum?: EnumItemProps;
    emptyvalue?: string;
    customformat?: string;
    formula?: string;
    dateformat?: string;
    maxWidth?: string;
    minwidth?: string;
}

export interface GridDataProps {
    masterUI: any;
    tpcdParam: string;
    gridData: GridDataItem[];
    gridSortData?: any[];
    rowData: any;
    treeCol: string;
    sheetName: string;
    setDetailRetrieve: (value: boolean) => void;
    dataSeInfo: any;
    gridKey: string;
    item: any;
    initParam: any;
    setMasterRetrieve?: (value: boolean) => void;
    setDataParam?: Function;
    userData?: any;
    ognzData?: any;
    comboData?: any;
    setKey?: Function;
    formName?: string;
    handleSend?: () => void;
    setHasChange?: (value: boolean) => void;
}

export interface EditToolbarProps {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (newModel: (oldModel: GridRowModesModel) => GridRowModesModel) => void;
}

export interface SortBySeqBtnItem {
    api: string;
    seq: string;
    sql: string;
    sqlId: string;
    sqlKey: string;
    text: string;
    type: string;
    param: Record<string, any>;
}

export interface ContextMenuState {
    mouseX: number;
    mouseY: number;
    row: any;
}

export interface RowData {
    id: string;
    [key: string]: any;
}
