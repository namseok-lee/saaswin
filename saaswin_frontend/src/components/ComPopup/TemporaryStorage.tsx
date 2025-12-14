import React from 'react';
import { Button } from '@mui/material';
import PropTypes from 'prop-types';
import SwModal from 'components/Modal';

export default function TemporaryStorage({ params, setParams }) {
    const { open } = params;
    // 닫기
    const handleClose = () => {
        setParams((prev) => {
            return {
                ...prev,
                open: !open,
            };
        });
    };
    return (
        <>
            <SwModal
                open={open}
                onClose={handleClose}
                title='임시저장 모달'
                // keepMounted
            >
                <div className='msg'>차장오빠야~</div>
                <div className='actions'>
                    <Button id='btnDefault11' type='default' size='lg' onClick={() => {}}>
                        취소
                    </Button>
                    <Button
                        id='btnPrmary12'
                        type='primary'
                        size='lg'
                        onClick={() => {
                            handleClose();
                        }}
                    >
                        나가기
                    </Button>
                </div>
            </SwModal>
        </>
    );
}

TemporaryStorage.propTypes = {
    params: PropTypes.object,
    setParams: PropTypes.func,
};
