// RejectModal.tsx
'use client';

import Button from 'components/Button';
import SwModal from 'components/Modal';
import Typography from 'components/Typography';
import React, { useState } from 'react';
import { IcoCheck, IcoDelete } from '@/assets/Icon';
import styles from '../../../styles/pages/templateApply/page.module.scss';

interface RejectModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
}

const ApplyRejectModal: React.FC<RejectModalProps> = ({ open, onClose, onConfirm }) => {
    const [rejectReason, setRejectReason] = useState('');

    const handleConfirm = () => {
        if (!rejectReason.trim()) {
            alert('반려 사유를 입력해주세요.');
            return;
        }
        onConfirm(rejectReason);
        setRejectReason(''); // 입력 필드 초기화
    };

    const handleCancel = () => {
        setRejectReason(''); // 입력 필드 초기화
        onClose();
    };

    return (
        <SwModal
            open={open}
            onClose={handleCancel}
            size='sm'
            maxWidth='500px'
            className={styles.rejectModal}
            bottoms={false}
        >
            <Typography title='반려 사유' type='form'>
                반려 사유
            </Typography>

            <div className={styles.context}>
                <div className='tblWrap'>
                    <table className='tbl'>
                        <colgroup>
                            <col style={{ width: '100%' }} />
                        </colgroup>
                        <tbody>
                            <tr>
                                <td>
                                    <textarea
                                        rows={5}
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        placeholder='반려 사유를 입력해주세요.'
                                        className={styles.rejectTextarea}
                                        style={{ width: '100%' }}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className='actions alignRight borderStyle'>
                <Button id='btnRejectCancel' type='default' size='lg' className='btnWithIcon' onClick={handleCancel}>
                    <IcoDelete fill='#7C7C7C' />
                    취소
                </Button>
                <Button id='btnRejectConfirm' type='primary' size='lg' className='btnWithIcon' onClick={handleConfirm}>
                    <IcoCheck fill='#fff' /> 반려
                </Button>
            </div>
        </SwModal>
    );
};

export default ApplyRejectModal;
