import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, FormControl, IconButton } from '@mui/material';
import Radio from 'components/Radio';
import RadioGroup from 'components/RadioGroup';
import CloseIcon from '@mui/icons-material/Close';
import Button from 'components/Button';
import { fetcherPostData } from 'utils/axios';
import Typography from 'components/Typography';
import SwModal from 'components/Modal';
import styles from '../../styles/pages/AgtAuthModal/page.module.scss';
import { IcoInfo } from '@/assets/Icon';

const AcntLockModal = ({ params, setParams, setMasterRetrieve }) => {
    const [value, setValue] = useState('hpo_group01031_cm0001'); // 기본 선택
    const { open, modal_info } = params;
    const { acnt_stts_cd, 'bsc_info|flnm': flnm, authrt_cd } = modal_info[0];
    const masterYn = modal_info?.find((item) => item?.authrt_cd.includes('GA001')) ? true : false;

    const onClose = () => {
        setParams((prev) => {
            return {
                ...prev,
                open: !open,
            };
        });
    };

    const authHandler = (chgSttsCd: string) => {
        const items = [
            {
                sqlId: 'hpr_invtn01',
                sql_key: 'hpr_user_acnt_stts_update',
                params: [{ acnt_stts_cd: chgSttsCd, acnt_info: modal_info }],
            },
        ];

        fetcherPostData(items)
            .then((response) => {
                alert('계정 잠금/해제 처리 완료');
                setMasterRetrieve(true);
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                onClose();
            });
    };

    return (
        <SwModal open={open} onClose={onClose} title="계정 잠금/해제" size="md" className={styles.agtAuth}>
            <div className={styles.msg}>
                <IcoInfo fill="var(--primary)" />
                {masterYn
                    ? `관리자의 계정은 잠금 처리할 수 없습니다.`
                    : modal_info?.length === 1
                    ? acnt_stts_cd === 'hpr_group00009_cm0002'
                        ? `'${flnm}'님의 계정을 일시적으로 잠금 처리하시겠습니까?`
                        : `'${flnm}'님의 계정을 잠금 해제하시겠습니까?`
                    : acnt_stts_cd === 'hpr_group00009_cm0002'
                    ? `'${flnm}'님 외 ${modal_info?.length - 1}명의 계정을 일시적으로 잠금 처리하시겠습니까?`
                    : `'${flnm}'님 외 ${modal_info?.length - 1}명의 계정을 잠금 해제하시겠습니까?`}
            </div>

            {!masterYn && (
                <div className={styles.caution}>
                    {acnt_stts_cd === 'hpr_group00009_cm0003'
                        ? `잠금 해제된 계정은 '활성화' 상태로 전환됩니다.`
                        : `잠긴 계정은 다시 [계정 잠금] 버튼으로 잠금 해제할 수 있습니다.`}
                </div>
            )}
            <div className="actions">
                {!masterYn && (
                    <Button id="close" key="close" size="lg" onClick={() => onClose()} className="btnDefault" size="sm">
                        취소
                    </Button>
                )}
                <Button
                    id="confirm"
                    key="confirm"
                    size="lg"
                    onClick={() =>
                        authrt_cd.includes('GA001')
                            ? onClose()
                            : authHandler(
                                  acnt_stts_cd === 'hpr_group00009_cm0002'
                                      ? 'hpr_group00009_cm0003'
                                      : 'hpr_group00009_cm0002'
                              )
                    }
                    className="btnPrimary"
                    size="sm"
                >
                    확인
                </Button>
            </div>
        </SwModal>
    );
};

export default AcntLockModal;
