'use client';
import { FormControl, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import Button from 'components/Button';
import SwModal from 'components/Modal';
import React, { useEffect, useState } from 'react';
import { fetcherPostData } from 'utils/axios';
import { useAuthStore } from 'utils/store/auth';
import styles from './InviteFormModal.module.scss';
import InviteFullModal from './InviteFullModal';

// 입력 양식 데이터 인터페이스
interface InputForm {
    invtn_inpt_id: string;
    inpt_nm: string;
    // 필요한 경우 추가 속성들을 여기에 정의할 수 있습니다
}

// 상세 정보 항목 인터페이스
interface DetailItem {
    key: string;
    seq: string;
    value: string;
    korn_nm: string;
}

// 입력 양식 상세 데이터 인터페이스
export interface InputFormDetails {
    인사정보: DetailItem[];
    근로정보: DetailItem[];
    급여정보: DetailItem[];
}

interface InviteFormModalProps {
    params: {
        open: boolean;
        modal_info: Record<string, unknown> | null;
        modalPath: string;
    };
    setParams: React.Dispatch<
        React.SetStateAction<{
            open: boolean;
            modal_info: Record<string, unknown> | null;
            modalPath: string;
        } | null>
    >;
    setMasterRetrieve?: (value: boolean) => void;
}

const InviteFormModal: React.FC<InviteFormModalProps> = ({ params, setParams, setMasterRetrieve }) => {
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [templateOptions, setTemplateOptions] = useState<Array<{ value: string; label: string }>>([]);
    const [loading, setLoading] = useState<boolean>(false);
    // 풀스크린 모달 상태
    const [fullModalOpen, setFullModalOpen] = useState<boolean>(false);
    const [selectedTemplateName, setSelectedTemplateName] = useState<string>('');
    // 선택된 행 수
    const [selectedRowCount, setSelectedRowCount] = useState<number>(0);

    // 입력 양식 상세 정보 상태
    const [templateDetails, setTemplateDetails] = useState<Record<string, InputFormDetails | null>>({});

    // 사용자 정보
    const userNo = useAuthStore((state) => state.userNo);

    // props 값 확인용 console.log
    useEffect(() => {
        console.log('InviteFormModal params:', params);
        if (params?.modal_info && typeof params.modal_info.getAllRowIds === 'function') {
            console.log('InviteFormModal modal_info:', params.modal_info);

            // 선택된 행 수 가져오기
            if (typeof params.modal_info.getSelectedRows === 'function') {
                try {
                    const selectedRows = params.modal_info.getSelectedRows();
                    // size 프로퍼티가 있는지 확인
                    if (selectedRows && typeof selectedRows.size === 'number') {
                        setSelectedRowCount(selectedRows.size);
                    } else if (Array.isArray(selectedRows)) {
                        setSelectedRowCount(selectedRows.length);
                    } else {
                        setSelectedRowCount(0);
                    }
                    console.log('선택된 행:', selectedRows);
                } catch (error) {
                    console.error('선택된 행 가져오기 오류:', error);
                    setSelectedRowCount(0);
                }
            }
        } else {
            console.log('InviteFormModal modal_info: No valid getAllRowIds method');
        }
    }, [params]);

    // 모달 닫기
    const handleClose = () => {
        setParams((prev) => {
            if (prev) {
                return {
                    ...prev,
                    open: false,
                };
            }
            return prev;
        });
        // 재조회가 필요한 경우 호출
        if (setMasterRetrieve) {
            setMasterRetrieve(true);
        }
    };

    // 입력 항목 조회
    const fetchInputForms = async () => {
        setLoading(true);
        const item = [
            {
                sqlId: 'hpr_invtn01',
                sql_key: 'hpr_invtn_inpt_select',
                params: [{}],
            },
        ];

        try {
            const response = (await fetcherPostData(item)) as InputForm[];
            // API 응답으로부터 템플릿 옵션 생성 (value는 ID로 유지)
            const options = response.map((form: InputForm) => ({
                value: form.invtn_inpt_id,
                label: form.inpt_nm,
            }));
            setTemplateOptions(options);

            // 각 템플릿의 상세 정보 비동기적으로 가져오기
            const detailsPromises = response.map(async (form: InputForm) => {
                const details = await fetchInputForms2(form.invtn_inpt_id);
                return { id: form.invtn_inpt_id, details };
            });

            const detailsResults = await Promise.all(detailsPromises);
            // 상세 정보를 객체 형태로 저장 (ID를 키로 사용)
            const detailsMap: Record<string, InputFormDetails | null> = {};
            detailsResults.forEach((result) => {
                if (result.id) {
                    detailsMap[result.id] = result.details;
                }
            });
            setTemplateDetails(detailsMap);
        } catch (error) {
            console.error('입력 항목 조회 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    // 입력 항목 조회2
    const fetchInputForms2 = async (id: string): Promise<InputFormDetails | null> => {
        // 주의: 이 함수는 fetchInputForms 내에서 호출되므로 별도의 로딩 상태 관리는 필요 없을 수 있습니다.
        // setLoading(true); // <- 여기서 개별 로딩 상태를 관리하지 않습니다.
        const item = [
            {
                sqlId: 'hpr_invtn01',
                sql_key: 'hpr_invtn_inpt_dtl_select',
                params: [{ invtn_inpt_id: id }],
            },
        ];

        try {
            const response = await fetcherPostData(item);
            // TODO: response의 실제 타입에 따라 any[] 대신 더 구체적인 타입으로 변경해야 합니다.
            const hrInfo = response[2]?.jsonb_build_object.filter((item: DetailItem) => item.value === 'true') || [];
            const laborInfo = response[3]?.jsonb_build_object.filter((item: DetailItem) => item.value === 'true') || [];
            const salaryInfo =
                response[4]?.jsonb_build_object.filter((item: DetailItem) => item.value === 'true') || [];

            // 조회된 정보들을 객체로 감싸서 반환
            return { hrInfo, laborInfo, salaryInfo };
        } catch (error) {
            console.error(`입력 항목2 조회 실패 (${id}):`, error);
            // 오류 발생 시 null을 반환
            return null;
        } finally {
            // setLoading(false); // <- 여기서 개별 로딩 상태를 관리하지 않습니다.
        }
    };

    // 컴포넌트 마운트 시 양식 조회
    useEffect(() => {
        fetchInputForms();
    }, []);

    // 정보 입력하기 버튼 클릭 시
    const handleSubmit = () => {
        if (!selectedTemplate) {
            alert('양식을 선택해주세요.');
            return;
        }

        // 선택된 행이 없으면 진행 불가
        if (selectedRowCount === 0) {
            alert('선택된 대상자가 없습니다. 대상자를 선택한 후 다시 시도해주세요.');
            return;
        }

        // 선택된 템플릿 이름 찾기
        const template = templateOptions.find((option) => option.value === selectedTemplate);
        if (template) {
            setSelectedTemplateName(template.label);
        }

        // 선택된 템플릿의 상세 정보 가져오기
        const detailsForModal = templateDetails[selectedTemplate];

        // 풀스크린 모달 열기
        setFullModalOpen(true);
    };

    const handleChange = (event: SelectChangeEvent) => {
        setSelectedTemplate(event.target.value);
    };

    const handleFullModalClose = () => {
        setFullModalOpen(false);
        handleClose(); // 원래 모달도 닫기
    };

    return (
        <>
            <SwModal
                open={params.open}
                onClose={handleClose}
                title='입력 항목 양식 선택'
                size='md'
                closeButton={true}
                bottoms={false}
            >
                <div className={styles.modalContent}>
                    <div className={styles.description}>
                        구성원의 인사, 근로, 급여 정보를 입력하는 양식을 선택하세요.
                    </div>

                    <div className={styles.formSection}>
                        <label className={styles.formLabel}>입력 양식</label>
                        <FormControl fullWidth>
                            <Select
                                value={selectedTemplate}
                                onChange={handleChange}
                                displayEmpty
                                className={styles.select}
                            >
                                <MenuItem value='' disabled>
                                    양식을 선택해주세요
                                </MenuItem>
                                {templateOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>

                    <div className={styles.confirmMessage}>
                        양식을 적용하고 총 {selectedRowCount}명의 대상자의 정보를 입력하시겠습니까?
                    </div>

                    <div className={styles.buttonContainer}>
                        <Button id='confirm-button' type='primary' size='lg' onClick={handleSubmit}>
                            정보 입력하기
                        </Button>
                        <Button id='cancel-button' type='default' size='lg' onClick={handleClose}>
                            취소
                        </Button>
                    </div>
                </div>
            </SwModal>

            {/* 풀스크린 모달 컴포넌트 */}

            <InviteFullModal
                open={fullModalOpen}
                handleClose={handleFullModalClose}
                templateId={selectedTemplate}
                templateName={selectedTemplateName}
                selectedRowCount={selectedRowCount}
                modal_info={params.modal_info || undefined}
                templateDetailData={templateDetails[selectedTemplate]}
            />
        </>
    );
};

export default InviteFormModal;
