import React from 'react';
import Loader from 'components/Loader';
import dynamic from 'next/dynamic';
import SwModal from 'components/Modal';
import Button from 'components/Button';
import dayjs from 'dayjs';
import { handleOrgChartModal } from './GridModalHandlers';
import { OrgChartMasterData } from 'views/sys/obj_manage/types';
import SearchAddress from 'components/SearchAddress';
interface ModalData {
    modal_info: {} | null;
    // evl_prgrs_stts_cd: string;
    open: boolean;
    modalPath: string;
}

interface PayModalData {
    slry_ocrn_id: string;
    isNew: boolean;
    step_cd: string;
    open: boolean;
}

interface GridModalsProps {
    modalData: ModalData | null;
    setModalData: React.Dispatch<React.SetStateAction<ModalData | null>>;
    payModalData: PayModalData | null;
    setPayModalData: React.Dispatch<React.SetStateAction<PayModalData | null>>;
    comModalData: Record<string, any> | null;
    comModalOpen: boolean;
    handleCloseModal: () => void;
    postOpen: boolean;
    setAdressData: React.Dispatch<React.SetStateAction<Record<string, any> | undefined>>;
    handleAddressOpen: () => void;
    mailModalOpen: boolean;
    handleMailModalClose: () => void;
    agtAuthModalOpen: boolean;
    handleAgtAuthModalClose: () => void;
    agtAuthData: Record<string, any> | null;
    reorgModalOpen: boolean;
    handleReorgModalClose: () => void;
    orgChartOpen: boolean;
    orgChartData: OrgChartMasterData[] | null;
    handleOrgChartClose: () => void;
    orgChartKey: number;
    orgChartLoading: boolean;
    setOrgChartLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setOrgChartData: React.Dispatch<React.SetStateAction<OrgChartMasterData[] | null>>;
    setOrgChartOpen: (open: boolean) => void;
    setMasterRetrieve?: (value: boolean) => void;
    gridRef: React.MutableRefObject<any>;
    attachModalData: ModalData | null;
    setAttachModalData: React.Dispatch<React.SetStateAction<ModalData | null>>;
}

function GridModals({
    modalData,
    setModalData,
    mailModalOpen,
    handleMailModalClose,
    agtAuthModalOpen,
    handleAgtAuthModalClose,
    agtAuthData,
    reorgModalOpen,
    handleReorgModalClose,
    orgChartOpen,
    orgChartData,
    orgChartKey,
    orgChartLoading,
    setOrgChartData,
    setOrgChartLoading,
    setOrgChartOpen,
    handleOrgChartClose,
    gridRef,
    setMasterRetrieve,
    attachModalData,
    setAttachModalData,
    changeDifferRow,
    postOpen,
    setAdressData,
    handleAddressOpen,
}: GridModalsProps) {
    const modalPath = modalData?.modalPath; // 모달 컴포넌트 경로
    const DynamicDialog = dynamic(() => import(`components/${modalPath}`), {
        loading: () => <Loader />,
        ssr: false, // 클라이언트 사이드에서만 로드
    });

    const DynamicAgtAuthSendModal = dynamic(() => import('components/ComPopup/AgtAuthModal'), {
        loading: () => <Loader />,
        ssr: false,
    });

    const DynamicMailSendModal = dynamic(() => import('components/MailSendModal'), {
        loading: () => <Loader />,
        ssr: false,
    });

    const DynamicAttachFileModal = dynamic(() => import('components/ComPopup/AttachFileModal'), {
        loading: () => <Loader />,
        ssr: false,
    });

    const DynamicOrgChartDialog = dynamic(() => import('views/ssw01/components/OrgChartDialog'), {
        loading: () => <Loader />,
        ssr: false,
    });

    return (
        <>
            <SearchAddress modalOpen={postOpen} setData={setAdressData} handleOpen={handleAddressOpen} />
            {modalPath && modalData.open && (
                <DynamicDialog params={modalData} setParams={setModalData} setMasterRetrieve={setMasterRetrieve} />
            )}

            {agtAuthModalOpen && (
                <DynamicAgtAuthSendModal
                    open={agtAuthModalOpen}
                    onClose={handleAgtAuthModalClose}
                    params={agtAuthData}
                    setMasterRetrieve={setMasterRetrieve}
                />
            )}

            {attachModalData?.open && (
                <DynamicAttachFileModal
                    params={attachModalData}
                    setParams={setAttachModalData}
                    changeDifferRow={changeDifferRow}
                />
            )}

            {/* {comModalData && (
                <DynamicCommonPopup open={comModalOpen} onClose={handleCloseModal} params={comModalData} />
            )} */}

            {/* {mailModalOpen && <DynamicMailSendModal open={mailModalOpen} onClose={handleMailModalClose} />} */}

            <SwModal open={reorgModalOpen} onClose={handleReorgModalClose} title='개편 그룹 생성'>
                <div>
                    현재의 조직을 기준으로, 조직 개편안을 등록할 새로운 개편 그룹을 생성합니다. 개편 그룹에 여러 개의
                    개편안을 생성해 시뮬레이션 할 수 있습니다.
                </div>
                <div className='msg'>조직 개편을 시작하시겠습니까?</div>
                <div className='actions'>
                    <Button
                        id='btnDefault'
                        type='default'
                        size='lg'
                        className='btnWithIcon'
                        onClick={handleReorgModalClose}
                    >
                        취소
                    </Button>
                    <Button
                        id='btnPrimary'
                        type='primary'
                        size='lg'
                        className='btnWithIcon'
                        onClick={() =>
                            handleOrgChartModal(
                                'NEW',
                                gridRef,
                                setOrgChartData,
                                setOrgChartLoading,
                                setOrgChartOpen,
                                handleReorgModalClose
                            )
                        }
                    >
                        개편시작
                    </Button>
                </div>
            </SwModal>

            <DynamicOrgChartDialog
                open={orgChartOpen}
                onClose={handleOrgChartClose}
                masterData={orgChartData}
                searchParams={{
                    std_ymd: dayjs().format('YYYYMMDD'),
                    org_allign: 'hrs_group00931_cm0001',
                }}
                key={orgChartKey}
                isLoading={orgChartLoading}
            />
        </>
    );
}

export default GridModals;
