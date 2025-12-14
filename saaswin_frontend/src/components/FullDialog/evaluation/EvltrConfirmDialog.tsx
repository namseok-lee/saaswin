import PropTypes from 'prop-types';
// material-ui

import SwModal from 'components/Modal';
import Button from 'components/Button';
import { GridColDef } from '@mui/x-data-grid';
import { DataGridPremium } from '@mui/x-data-grid-premium';
import { useEffect } from 'react';

// ==============================|| CUSTOMER - DELETE ||============================== //

export default function EvltrConfirmDialog({ open, data, validation, setValidation, handleClose, updateReviewItem }) {
    const handleExit = () => {
        setValidation((prev) => ({
            ...prev,
            validation: true,
            type: 'cm002-2',
        }));
        updateReviewItem();
        handleClose();
    };
    const trprInfo = data?.trpr_info || [];
    //평가자 세팅 완료 유무
    const emptyEvltrInfosByGroup = trprInfo
        ?.map((item) => {
            const result = { flnm: item.flnm, user_no: item.user_no, ognz_nm: item.ognz_nm, emptyGroups: [] };

            // evltr_info 객체 확인
            const evltrInfo = item.evltr_info;
            if (!evltrInfo) return result;

            // 각 그룹 키에 대해 검사
            for (const key in evltrInfo) {
                const groupInfo = evltrInfo[key];
                // evltr_info 배열이 있고 길이가 0인 경우만 추가
                if (groupInfo.evltr_info && groupInfo.evltr_info.length === 0) {
                    result.emptyGroups.push(key);
                }
            }

            return result;
        })
        .filter((item) => item.emptyGroups.length > 0);

    const columns: GridColDef<(typeof rows)[number]>[] = [
        {
            field: 'flnm',
            headerName: '이름',
            width: 150,
        },
        {
            field: 'user_no',
            headerName: '사번',
            width: 150,
        },
        {
            field: 'ognz_no',
            headerName: 'ognz_no',
            width: 150,
        },
        {
            field: 'ognz_nm',
            headerName: '소속',
            width: 150,
            flex: 1,
        },
        {
            field: 'emptyGroups',
            headerName: '미완료 평가',
            width: 250,
            renderCell: (params) => {
                const emptyGroups = params.row.emptyGroups || [];
                const groupNames = {
                    hpm_group01015_cm0001: '자기평가',
                    hpm_group01015_cm0002: '동료평가',
                    hpm_group01015_cm0003: '상향평가',
                    hpm_group01015_cm0004: '하향 1차평가',
                    hpm_group01015_cm0005: '하향 2차평가',
                    hpm_group01015_cm0006: '하향 3차평가',
                    hpm_group01015_cm0007: '하향 4차평가',
                    hpm_group01015_cm0008: '하향 5차평가',
                    hpm_group01015_cm0009: '위원평가',
                };
                return emptyGroups.map((group) => groupNames[group] || group).join(', ');
            },
        },
    ];
    useEffect(() => {
        if (open) {
            setValidation((prev) => ({
                ...prev,
                validation: true,
                type: 'cm002-2',
            }));
        }
    }, [open]);
    return (
        <SwModal
            open={open}
            onClose={handleClose}
            size='xl'
            maxWidth='300px'
            title='평가자가 지정되지 않은 대상자'
            // keepMounted
        >
            <div className='msg'>
                다음 평가 대상자는 동료평가자 수가 권장인원과 맞지 않거나,
                <br />
                평가 위원이 지정되지 않았습니다. 평가자가 지정되지 않은 경우, 해당 평가는 진행되지 않습니다.
                <br />
                그대로 시작 하시겠습니까?
                <br />
            </div>
            <div className='msg'>총 {emptyEvltrInfosByGroup.length}명</div>
            <DataGridPremium
                sx={{
                    width: '100%',
                    height: '317px', // 전체 높이 설정 (스크롤 활성화를 위해 제한 필요)
                    overflow: 'auto', // 스크롤 가능하게 설정
                }}
                getRowId={(row) => row.user_no}
                rows={emptyEvltrInfosByGroup}
                columns={columns}
                columnVisibilityModel={{ ognz_no: false }}
                hideFooter
            />
            <div className='actions'>
                <Button id='btnDefault11' type='default' size='lg' onClick={handleClose}>
                    취소
                </Button>
                <Button
                    id='btnPrmary12'
                    type='primary'
                    size='lg'
                    onClick={() => {
                        handleExit();
                    }}
                >
                    평가 시작
                </Button>
            </div>
        </SwModal>
    );
}

EvltrConfirmDialog.propTypes = {
    open: PropTypes.bool,
    handleClose: PropTypes.func,
    handleDialogClose: PropTypes.func,
    saveData: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    setSaveData: PropTypes.func,
};
7;
