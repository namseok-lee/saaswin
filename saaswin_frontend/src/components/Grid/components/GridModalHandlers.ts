import { MutableRefObject } from 'react';
import { OrgChartMasterData } from 'views/sys/obj_manage/types';

// 인터페이스 정의
interface ModalData {
    modal_info: {} | null;
    // evl_prgrs_stts_cd: string;
    modalPath: string;
    open: boolean;
}

interface AttachModalData {
    params: any;
    // evl_prgrs_stts_cd: string;
    modalPath: string;
    open: boolean;
}

interface PayModalData {
    slry_ocrn_id: string;
    isNew: boolean;
    step_cd: string;
    open: boolean;
}

// 평가 모달 핸들러
export const handleFullModal = async (
    id: string,
    gridRef: MutableRefObject<any>,
    modalPath: string,
    setModalData: React.Dispatch<React.SetStateAction<ModalData | null>>
) => {
    if (id !== 'NEW') {
        const modal_info = gridRef.current.getRow(id);
        setModalData({
            modal_info: modal_info,
            modalPath: modalPath,
            open: true,
        });
    } else {
        setModalData({
            modal_info: gridRef.current,
            modalPath: modalPath,
            open: true,
        });
    }
};

// 체크박스 모달 핸들러
export const handleCheckModal = async (
    gridRef: MutableRefObject<any>,
    modalPath: string,
    setModalData: React.Dispatch<React.SetStateAction<ModalData | null>>
) => {
    const checkRow = gridRef.current.getSelectedRows();

    if (checkRow.size === 0) alert('선택된 행이 없습니다.');
    else {
        setModalData({
            modal_info: Array.from(checkRow.values()),
            modalPath: modalPath,
            open: true,
        });
    }
};

// 첨부파일 모달 핸들러
export const handleAttach = async (
    params: any,
    gridRef: MutableRefObject<any>,
    modalPath: string,
    setAttachModalData: React.Dispatch<React.SetStateAction<AttachModalData | null>>
) => {
    setAttachModalData({
        params: params,
        modalPath: modalPath,
        open: true,
    });
};

// 직무 설정 모달 핸들러
export const handleDutySetting = async (
    gridRef: MutableRefObject<any>,
    modalPath: string,
    setModalData: React.Dispatch<React.SetStateAction<ModalData | null>>,
    setRows: React.Dispatch<React.SetStateAction<any[]>>,
    userNo: string
) => {
    setModalData({
        modal_info: gridRef.current,
        modalPath: modalPath,
        open: true,
        mainColumns: gridRef.current.getAllColumns(),
        setMainRows: setRows,
        userNo: userNo,
    });
};

// 급여 모달 핸들러
// export const handleFullModal_Slry = async (
//     id: string,
//     gridRef: MutableRefObject<any>,
//     setPayModalData: React.Dispatch<React.SetStateAction<PayModalData | null>>
// ) => {
//     if (id !== 'NEW') {
//         const slry_ocrn_id = gridRef.current.getRow(id).slry_ocrn_id;
//         const step_cd = gridRef.current.getRow(id).slry_prgrs_step_cd;
//         setPayModalData({
//             slry_ocrn_id,
//             isNew: false,
//             step_cd,
//             open: true,
//         });
//     } else {
//         setPayModalData({
//             slry_ocrn_id: '',
//             isNew: true,
//             step_cd: 'hrb_group01018_cm0001',
//             open: true,
//         });
//     }
// };

// 조직도 모달 핸들러
export const handleOrgChartModal = async (
    id: string = 'NEW',
    gridRef: MutableRefObject<any>,
    setOrgChartData: React.Dispatch<React.SetStateAction<OrgChartMasterData[] | null>>,
    setOrgChartLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setOrgChartOpen: (open: boolean) => void,
    handleReorgModalClose: () => void
) => {
    setOrgChartLoading(true);
    try {
        if (id === 'NEW') {
            setOrgChartData([]);
            setOrgChartOpen(true);
            handleReorgModalClose();
        } else {
            const row = gridRef.current.getRow(id);
            let orgData: OrgChartMasterData[] = [];

            if (row.reorg_info) {
                if (typeof row.reorg_info === 'object' && !Array.isArray(row.reorg_info)) {
                    orgData = [row.reorg_info as OrgChartMasterData];
                } else if (Array.isArray(row.reorg_info)) {
                    orgData = row.reorg_info as OrgChartMasterData[];
                }
            }

            setOrgChartData(orgData);
            setOrgChartOpen(true);
        }
    } catch (error) {
        console.error('조직도 데이터 로드 오류:', error);
        alert('조직도 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
        setOrgChartLoading(false);
    }
};
