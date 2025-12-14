import { dia, ui, layout } from '@joint/plus';
import React from 'react';

export interface OrgChartFormData {
    level: string;
    end_ymd: string;
    ognz_nm: string;
    bgng_ymd: string;
    child_no: string;
    parent_no: string;
    corp_eng_nm: string;
    ognz_type_cd: string;
    action_type?: string; // 추가(I), 삭제(D), 수정(U) 상태값
}

export interface OrgChartMasterData {
    ognz_nm: string;
    level: string;
    end_ymd: string;
    bgng_ymd: string;
    child_no: string;
    parent_no: string;
    corp_eng_nm: string;
    ognz_type_cd: string;
    action_type?: string; // 추가(I), 삭제(D), 수정(U) 상태값
}

export interface OrgChartProps {
    masterData?: OrgChartMasterData[];
    onCellSelect?: (selectedCell: dia.Element | null) => void;
    onMultiSelect?: (isMulti: boolean) => void;
    formData: OrgChartFormData;
    editable?: boolean;
    layoutType?: string; // 레이아웃 타입 추가
}

export interface OrgChartPageProps {
    masterData?: OrgChartMasterData[];
    showInspector?: boolean;
    editable?: boolean;
    dataPram: Record<string, unknown>;
    setIsLoading?: (isLoading: boolean) => void;
    isLoading?: boolean;
    searchParams?: Record<string, unknown>;
    outMasterData?: OrgChartMasterData[] | null;
    open?: boolean;
    onOpen?: () => void;
    onClose?: () => void;
    isDialog?: boolean;
}

export interface OrgChartInstance {
    paper: dia.Paper | null;
    graph: dia.Graph | null;
    scroller: ui.PaperScroller | null;
    treeLayout: layout.TreeLayout | null;
    selection: ui.Selection | null;
    currentScale: number;
    handleUndo: () => void;
    handleRedo: () => void;
    canUndo: () => boolean;
    canRedo: () => boolean;
    handleZoomIn: () => void;
    handleZoomOut: () => void;
    handleZoomToFit: () => void;
    exportToPNG: () => void;
    exportToPDF: () => void;
    handleCreateOrg: (event: React.MouseEvent, formData: OrgChartFormData, sourceElement?: dia.Element | null) => void;
    handleRemoveMember: () => void;
    fetchData: () => Promise<void>;
    canZoomIn: boolean;
    canZoomOut: boolean;
    members: dia.Element[];
    validateRequiredFields: (data: OrgChartFormData) => { isValid: boolean; errorMessage: string };
    validateMemberEdit: (element: dia.Element) => { isValid: boolean; errorMessage: string };
    updateMemberValidation: (element: dia.Element) => void;
    handleToggleCollapse: (element: dia.Element) => void;
}
