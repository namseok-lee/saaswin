import React, { useState } from 'react';
import Button from 'components/Button';
import SwModal from 'components/Modal';
import styles from '../../styles/pages/AgtAuthModal/page.module.scss';
import { IcoInfo } from '@/assets/Icon';
import { useRouter } from 'next/navigation';
import { useAuthStore } from 'utils/store/auth';

const SettingChkModal = ({ params, setParams }: { params: any; setParams: any }) => {
    const router = useRouter();
    const { rprsOgnzNo } = useAuthStore();
    const { open, group_cd } = params;
    const group_cd_nm =
        group_cd === 'hrs_group00933'
            ? '조직 유형'
            : group_cd === 'hrs_group00934'
            ? '직무'
            : group_cd === 'hrs_group00935'
            ? '직책'
            : group_cd === 'hrs_group00936'
            ? '직위'
            : group_cd === 'hrs_group00937'
            ? '직급'
            : '';
    const onClose = () => {
        setParams((prev: any) => {
            return {
                ...prev,
                open: !open,
            };
        });
    };

    const sendSteeingPage = () => {
        router.push(`/${rprsOgnzNo}/settings/systemSetting/hrsInfoSetting/SE`);
    };

    return (
        <SwModal open={open} onClose={onClose} title='' size='md' className={styles.agtAuth}>
            <div className={styles.msg}>
                <IcoInfo fill='var(--primary)' />
                등록된 {group_cd_nm}가 없습니다. <br />
                환경설정에서 {group_cd_nm}를 먼저 생성해주세요
            </div>
            <div className='actions'>
                <Button id='confirm' key='confirm' size='lg' onClick={() => sendSteeingPage()} className='btnPrimary'>
                    환경설정 바로가기
                </Button>
                <Button id='close' key='close' size='lg' onClick={() => onClose()} className='btnDefault'>
                    닫기
                </Button>
            </div>
        </SwModal>
    );
};

export default SettingChkModal;
