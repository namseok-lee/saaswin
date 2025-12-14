'use client';

import Button from 'components/Button';
import CommonFile from 'components/File/commonFile';
import SwModal from 'components/Modal';
import Typography from 'components/Typography';
import React, { useState } from 'react';
import styles from '../../../styles/pages/templateApply/page.module.scss';
import { AttachFile } from '@mui/icons-material';
import ApplyLine from 'components/eformsuite/apply/applyLine';
import { IcoDelete, IcoTemplateSave, IcoCheck, IcoDownload, IcoTakeBack } from '@/assets/Icon';
import RejectReason from './RejectReason';
import ApplyContext from './ApplyContext';
import FuelCost from './FuelCost';

interface ApplyDetailProps {
    params: { open: boolean; [key: string]: any };
    setParams: React.Dispatch<React.SetStateAction<any>>;
    procType: string;
}

const ApplyDetail: React.FC<ApplyDetailProps> = ({ params, setParams }) => {
    // 결제라인
    const [applyLineData, setApplyLineData] = useState([]);

    // 내용데이터
    const [applyContentData, setApplyContentData] = useState([]);

    // file
    const [applyFileData, setApplyFileData] = useState([]);

    const procType = params.proc_type || 'HPO'; // 임시로 hpo 넣어놓았음. 실제 데이터로 넣어야함

    // 저장
    const onSave = () => {};

    // 임시저장
    const onTempSave = () => {};

    // 닫기
    const onClose = () => {
        // 1개라도 조작이 있었다면 confirm 띄움
        if (applyLineData.length > 0 || applyContentData.length > 0 || applyFileData.length > 0) {
            // 변경사항저장 알림 팝업
        }

        // 모두 초기화 후 닫음
        setApplyLineData([]); // 결재
        setApplyContentData([]); //내용
        setApplyFileData([]); // 파일
        setParams((prev) => {
            // 신청서 선택데이터
            return {
                ...prev,
                open: false,
                apply_info: {},
            };
        });
    };

    return (
        <SwModal
            open={open}
            onClose={onClose}
            size='xl'
            maxWidth='794px'
            className={styles.outWorking}
            bottoms={false}
            PaperProps={{
                sx: {
                    m: 0,
                    height: '100vh', // 화면 높이 전체 (100vh)
                    Maximize: '100vh',
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: 0, // 모서리 둥글지 않게
                },
            }}
        >
            {/* 상단 타이틀 */}
            <Typography title='출장' type='form'>
                출장
            </Typography>
            <div className={styles.context}>
                {/* 결제 라인 */}
                <Typography title='결재라인' type='section' className={styles.sectionTit}>
                    결재라인
                </Typography>
                <ApplyLine params={applyLineData} setParams={setApplyLineData} />

                {/* 반려사유 */}
                <Typography title='반려사유' type='section' className={styles.sectionTit}>
                    반려사유
                </Typography>
                <RejectReason />

                {/* 신청 내용 */}
                <Typography title='결재라인' type='section' className={styles.sectionTit}>
                    신청내용
                </Typography>
                <ApplyContext />

                {/* 출장 비용 신청 */}
                <Typography title='출장 비용 신청' type='section' className={styles.sectionTit}>
                    출장 비용 신청
                </Typography>

                {/* 세부 일정 */}
                <Typography title='세부 일정' type='section' className={styles.sectionTit}>
                    세부 일정
                </Typography>

                {/* 파일 영역 - 첨부 파일 */}
                <Typography title='첨부 파일' type='section' className={styles.sectionTit}>
                    첨부파일
                </Typography>
                {/* 파일 영역 - 첨부파일 */}
                <AttachFile />
                {/* <CommonFile params={applyFileData} setParams={setApplyFileData} procType={procType} /> */}
            </div>
            {/* 하단버튼 */}
            <div className={`actions alignRight borderStyle`}>
                <Button id='btnDefault11' type='default' size='lg' className='btnWithIcon' onClick={onClose}>
                    <IcoTakeBack fill='#7C7C7C' />
                    회수
                </Button>
                <Button id='btnDefault11' type='primary' size='lg' className='btnWithIcon' onClick={onTempSave}>
                    <IcoDownload fill='#fff' />
                    다운로드
                </Button>
            </div>
            <FuelCost open={true} />
        </SwModal>
    );
};

export default ApplyDetail;
