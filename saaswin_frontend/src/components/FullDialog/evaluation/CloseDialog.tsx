import PropTypes from 'prop-types';
// project import
import { useRef } from 'react';
import SwModal from 'components/Modal';
import Button from 'components/Button';

// ==============================|| CUSTOMER - DELETE ||============================== //

interface CloseDialogProps {
    open: boolean;
    handleClose: () => void;
    handleDialogClose: () => void;
    saveData: unknown[] | Record<string, unknown>;
    setSaveData: (data: unknown[] | Record<string, unknown>) => void;
    setParams: (params: unknown[]) => void;
    setActiveType: (type: string) => void;
    updateReviewItem: () => void;
    setMasterRetrieve: (value: boolean) => void;
}

export default function CloseDialog({
    open,
    handleClose,
    handleDialogClose,
    saveData,
    setSaveData,
    setParams,
    setActiveType,
    updateReviewItem,
    setMasterRetrieve,
}: CloseDialogProps) {
    const handleExit = (isSave: boolean) => {
        if (isSave) {
            updateReviewItem();
        }
        // else {
        //     setSaveData(initialSaveDataRef.current);
        // }
        setSaveData({});
        setParams([]);
        setMasterRetrieve(true);
        setActiveType('hpm_group01014_cm0001');
        handleClose();
        handleDialogClose();
    };
    return (
        <SwModal
            open={open}
            onClose={handleClose}
            title='평가 생성을 그만두고 나가시겠습니까?'
            // keepMounted
        >
            <div className='msg'>
                작성 중 나가기 버튼을 누르면
                <br />
                변경사항이 저장되지 않습니다.
                <br />
                저장 후 나가시겠습니까?
            </div>
            <div className='actions'>
                <Button id='btnDefault11' type='default' size='lg' onClick={handleClose}>
                    취소
                </Button>
                <Button
                    id='btnDefault11'
                    type='primary'
                    size='lg'
                    onClick={() => {
                        handleExit(true);
                    }}
                >
                    저장 후 나가기
                </Button>
                <Button
                    id='btnPrmary12'
                    type='primary'
                    size='lg'
                    onClick={() => {
                        handleExit(false);
                    }}
                >
                    나가기
                </Button>
            </div>
        </SwModal>
    );
}

CloseDialog.propTypes = {
    open: PropTypes.bool,
    handleClose: PropTypes.func,
    handleDialogClose: PropTypes.func,
    saveData: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    setSaveData: PropTypes.func,
};
