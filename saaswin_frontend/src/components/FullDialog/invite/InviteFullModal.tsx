'use client';
import React, { useState, useEffect } from 'react';
import SwModal from 'components/Modal';
import Button from 'components/Button';
import { IconButton, Stack, Snackbar, Alert, Box } from '@mui/material';
import { IcoClose, IcoCheck } from '@/assets/Icon';
import styles from './InviteFormModal.module.scss';
import Grid01 from 'components/Grid/Grid01';
import { fetcherPostCmcd, fetcherPost, fetcherPostData } from 'utils/axios';

// 풀스크린 모달용 컴포넌트
interface InviteFullModalProps {
    open: boolean;
    handleClose: () => void;
    templateId: string;
    templateName: string;
    selectedRowCount: number;
    modal_info?: Record<string, unknown>;
    templateDetailData: InputFormDetails | null;
}

// InputFormDetails 타입 정의
interface InputFormDetails {
    hrInfo: Array<Record<string, unknown>> | null;
    laborInfo: Array<Record<string, unknown>> | null;
    salaryInfo: Array<Record<string, unknown>> | null;
    [key: string]: unknown;
}

// 그리드 데이터 타입 정의
interface GridDataItem {
    seq: string;
    id: string;
    header1: string | null;
    header2: string;
    type: string;
    align?: string;
    width: string;
    required?: string | null;
    canedit?: boolean | string;
    insertedit?: string | null;
    insertdefault?: string | null;
    visible?: boolean | string;
    enum?: string | null;
    emptyvalue?: string | null;
    customformat?: string | null;
    formula?: string;
    dateformat?: string;
    maxWidth?: string;
    minwidth?: string | null;
    format?: unknown;
    enumKey?: string | null;
    popupId?: string | null;
    maxwidth?: string | null;
    customtext?: string | null;
    dataformat?: string | null;
    popupPrord?: string | null;
}

// 그리드 행 데이터 타입 정의
interface GridRowData {
    id: string;
    [key: string]: unknown;
}

// 타입 추가
type UserInfoItem = {
    key?: string;
    id?: string;
    visible?: boolean;
    korn_nm?: string;
    label?: string;
    name?: string;
    [key: string]: unknown;
};

const InviteFullModal: React.FC<InviteFullModalProps> = ({
    open,
    handleClose,
    templateId,
    templateName,
    selectedRowCount,
    modal_info,
    templateDetailData,
}) => {
    const [openAlert, setOpenAlert] = useState<boolean>(false);
    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string>('');
    const [gridData, setGridData] = useState<GridDataItem[]>([]);
    const [rowData, setRowData] = useState<GridRowData[]>([]);
    const [masterRetrieve, setMasterRetrieve] = useState<boolean>(false);
    const [comboData, setComboData] = useState<Record<string, unknown>>({});
    console.log('templateDetailData', templateDetailData);
    // 임시 샘플 데이터 생성
    useEffect(() => {
        // 그리드 컬럼 정의
        const columns: GridDataItem[] = [
            {
                id: 'user_no',
                seq: '0',
                enum: null,
                type: 'text',
                align: 'center',
                width: '40',
                format: null,
                canedit: false,
                enumKey: null,
                header1: null,
                header2: 'user_no',
                popupId: null,
                visible: true,
                maxwidth: null,
                minwidth: null,
                required: null,
                customtext: null,
                dataformat: null,
                emptyvalue: null,
                insertedit: null,
                popupPrord: null,
                customformat: null,
                insertdefault: null,
            },
            {
                id: 'cbox',
                seq: '1',
                enum: null,
                type: 'COMM_CHECK',
                align: 'center',
                width: '40',
                format: null,
                canedit: true,
                enumKey: null,
                header1: null,
                header2: 'CBOX',
                popupId: null,
                visible: true,
                maxwidth: null,
                minwidth: null,
                required: null,
                customtext: null,
                dataformat: null,
                emptyvalue: null,
                insertedit: null,
                popupPrord: null,
                customformat: null,
                insertdefault: null,
            },
            {
                id: 'nm',
                seq: '2',
                enum: null,
                type: 'TEXT',
                align: 'center',
                width: '150',
                format: null,
                canedit: true,
                enumKey: null,
                header1: null,
                header2: '이름',
                popupId: null,
                visible: true,
                maxwidth: null,
                minwidth: null,
                required: null,
                customtext: null,
                dataformat: null,
                emptyvalue: null,
                insertedit: null,
                popupPrord: null,
                customformat: null,
                insertdefault: null,
            },
            {
                id: 'eml',
                seq: '3',
                enum: null,
                type: 'TEXT',
                align: 'center',
                width: '150',
                format: null,
                canedit: true,
                enumKey: null,
                header1: null,
                header2: '이메일',
                popupId: null,
                visible: true,
                maxwidth: null,
                minwidth: null,
                required: null,
                customtext: null,
                dataformat: null,
                emptyvalue: null,
                insertedit: null,
                popupPrord: null,
                customformat: null,
                insertdefault: null,
            },
            {
                id: 'jncmp_ymd',
                seq: '4',
                enum: null,
                type: 'DATE',
                align: 'center',
                width: '150',
                format: null,
                canedit: true,
                enumKey: null,
                header1: null,
                header2: '입사일',
                popupId: null,
                visible: true,
                maxwidth: null,
                minwidth: null,
                required: null,
                customtext: null,
                dataformat: null,
                emptyvalue: null,
                insertedit: null,
                popupPrord: null,
                customformat: null,
                insertdefault: null,
            },
            {
                id: 'lbr_formt',
                seq: '5',
                enum: 'hpo_group00263',
                type: 'COMBO',
                align: 'center',
                width: '150',
                format: null,
                canedit: true,
                enumKey: 'COMGRP',
                header1: null,
                header2: '근로 형태',
                popupId: null,
                visible: true,
                maxwidth: null,
                minwidth: null,
                required: null,
                customtext: null,
                dataformat: null,
                emptyvalue: null,
                insertedit: null,
                popupPrord: null,
                customformat: null,
                insertdefault: null,
            },
        ];

        // templateDetailData에서 데이터 추출하여 동적 컬럼 생성
        const dynamicColumnsData: Array<{ key: string; seq: string; value: string; korn_nm: string }> = [];

        if (templateDetailData) {
            // 근로정보, 급여정보, 인사정보 데이터 결합
            const laborInfo = templateDetailData.laborInfo || [];
            const salaryInfo = templateDetailData.salaryInfo || [];
            const hrInfo = templateDetailData.hrInfo || [];

            // 각 정보를 dynamicColumnsData 형식으로 변환하여 추가
            let seqCounter = 1;

            // 인사정보 처리
            if (Array.isArray(hrInfo)) {
                hrInfo.forEach((item) => {
                    dynamicColumnsData.push({
                        key: (item.key as string) || (item.id as string) || `hr_${seqCounter}`,
                        seq: String(seqCounter++),
                        value: item.visible === true ? 'true' : 'false',
                        korn_nm:
                            (item.korn_nm as string) || (item.label as string) || (item.name as string) || '인사정보',
                    });
                });
            }

            // 근로정보 처리
            if (Array.isArray(laborInfo)) {
                laborInfo.forEach((item) => {
                    dynamicColumnsData.push({
                        key: (item.key as string) || (item.id as string) || `labor_${seqCounter}`,
                        seq: String(seqCounter++),
                        value: item.visible === true ? 'true' : 'false',
                        korn_nm:
                            (item.korn_nm as string) || (item.label as string) || (item.name as string) || '근로정보',
                    });
                });
            }

            // 급여정보 처리,
            if (Array.isArray(salaryInfo)) {
                salaryInfo.forEach((item) => {
                    dynamicColumnsData.push({
                        key: (item.key as string) || (item.id as string) || `salary_${seqCounter}`,
                        seq: String(seqCounter++),
                        value: item.visible === true ? 'true' : 'false',
                        korn_nm:
                            (item.korn_nm as string) || (item.label as string) || (item.name as string) || '급여정보',
                    });
                });
            }
        }

        const newColumns: GridDataItem[] = dynamicColumnsData.map((data) => {
            const baseSeq = 5; // 기존 컬럼의 마지막 seq
            const dynamicSeq = parseInt(data.seq, 10); // 받아온 seq
            const calculatedSeq = (baseSeq + dynamicSeq).toString(); // 새로운 seq 계산
            const columnType = data.key.includes('ymd') ? 'DATE' : 'TEXT';
            const visibleValue = true; //data.value === 'true'; // value를 boolean visible로 변환

            return {
                id: data.key,
                seq: calculatedSeq,
                enum: null,
                type: columnType,
                align: 'center',
                width: '150',
                format: null,
                canedit: true,
                enumKey: null,
                header1: null,
                header2: data.korn_nm,
                popupId: null,
                visible: visibleValue,
                maxwidth: null,
                minwidth: null,
                required: null,
                customtext: null,
                dataformat: null,
                emptyvalue: null,
                insertedit: null,
                popupPrord: null,
                customformat: null,
                insertdefault: null,
            };
        });

        // 기존 columns 배열에 새로운 컬럼들 추가
        const updatedColumns = [...columns, ...newColumns];
        console.log('updatedColumns', updatedColumns);
        // 실제 행 데이터
        let rows: GridRowData[] = [];

        // 선택된 그리드 데이터가 있는 경우 해당 데이터를 가져옵니다
        if (modal_info && typeof modal_info.getSelectedRows === 'function') {
            try {
                const selectedRows = modal_info.getSelectedRows();

                // 선택된 행 데이터가 있는지 확인하고 변환
                if (selectedRows && selectedRows.size > 0) {
                    // Map 객체인 경우 values()를 통해 행 데이터를 배열로 변환
                    rows = Array.from(selectedRows.values()).map((row: any, index: number) => ({
                        id: `row_${index + 1}`,
                        user_no: row.user_no || '',
                        nm: row.nm || '',
                        eml: row.eml || '',
                        jncmp_ymd: row.jncmp_ymd || '',
                        lbr_formt: row.lbr_formt || '',
                        // 필요한 경우 여기에 추가 데이터 매핑
                    }));
                } else if (Array.isArray(selectedRows) && selectedRows.length > 0) {
                    // 배열인 경우 직접 매핑
                    rows = selectedRows.map((row: any, index: number) => ({
                        id: `row_${index + 1}`,
                        user_no: row.user_no || '',
                        nm: row.nm || '',
                        eml: row.eml || '',
                        jncmp_ymd: row.jncmp_ymd || '',
                        lbr_formt: row.lbr_formt || '',
                        // 필요한 경우 여기에 추가 데이터 매핑
                    }));
                }
            } catch (error) {
                console.error('선택된 행 데이터 가져오기 오류:', error);
                // 오류 발생 시 기본 데이터 생성
                rows = generateDefaultRows(selectedRowCount);
            }
        } else {
            // 선택된 행 데이터가 없는 경우 기본 데이터 생성
            rows = generateDefaultRows(selectedRowCount);
        }

        setGridData(updatedColumns);
        setRowData(rows);

        // COMBO 타입 컬럼들을 필터링하여 콤보 데이터 조회를 위한 목록 생성
        const comboColumns = updatedColumns.filter((column) => column.type === 'COMBO' && column.enum);

        // 중복 제거된 enum 값들을 기준으로 콤보 데이터 조회
        const uniqueComboInfo = comboColumns.reduce((acc, column) => {
            if (column.enum && !acc.some((item) => item.enum === column.enum)) {
                acc.push({
                    enum: column.enum,
                    enumKey: column.enumKey || 'COMGRP', // 기본값 설정
                });
            }
            return acc;
        }, [] as Array<{ enum: string; enumKey: string | any }>);

        // 각 고유한 콤보 정보에 대해 데이터 조회
        uniqueComboInfo.forEach((info) => {
            fetcherPostCmcd({
                group_cd: info.enum,
                rprs_ognz_no: info.enumKey,
            })
                .then((response) => {
                    setComboData((prev) => ({
                        ...prev,
                        [info.enum]: response,
                    }));
                })
                .catch((error) => {
                    console.error(`콤보 데이터(${info.enum}) 조회 오류:`, error);
                });
        });
    }, [modal_info, selectedRowCount, templateDetailData]);

    // 기본 행 데이터 생성 함수
    const generateDefaultRows = (count: number): GridRowData[] => {
        return Array.from({ length: count }, (_, i) => ({
            id: `row_${i + 1}`,
            nm: `구성원${i + 1}`,
            eml: `user${i + 1}@mail.co.kr`,
            jncmp_ymd: '',
            lbr_formt: '',
        }));
    };

    // 그리드 재조회 처리
    useEffect(() => {
        if (masterRetrieve) {
            // 실제로는 여기서 API 호출 등을 통해 데이터를 갱신할 수 있습니다.
            console.log('그리드 데이터 재조회');
            setMasterRetrieve(false);
        }
    }, [masterRetrieve]);

    // 알림 띄우기
    const handleOpenAlert = () => {
        setOpenAlert(!openAlert);
    };

    const handleSnackBarClose = (event: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    const saveData = async () => {
        try {
            // 로딩 상태 설정 (필요시)
            // setLoading(true);

            // 그리드 데이터 가져오기
            const gridRows = rowData;

            // 템플릿 데이터에서 인사, 근로, 급여 정보 추출
            const hrInfoData = templateDetailData?.hrInfo || ([] as UserInfoItem[]);
            const laborInfoData = templateDetailData?.laborInfo || ([] as UserInfoItem[]);
            const salaryInfoData = templateDetailData?.salaryInfo || ([] as UserInfoItem[]);

            // 각 행(구성원)별 데이터를 요청된 형식으로 변환
            const userDataList = gridRows.map((row) => {
                // 기본 정보 (bsc_info) 구성
                const bsc_info = {
                    name: row.nm || '',
                    email: row.eml || '',
                    phone: row.phone || '',
                };

                // 인사 정보 (apnt_info) 구성
                const apnt_info: Record<string, any> = {
                    joinDate: row.jncmp_ymd || '',
                };

                // hrInfo 데이터 중 부서, 직급 정보 추가
                hrInfoData.forEach((item) => {
                    const key = (item.key as string) || (item.id as string) || '';
                    const value = row[key];

                    // 부서 정보
                    if (key.includes('dept') || key.includes('department')) {
                        apnt_info.department = value || '';
                    }
                    // 직급 정보
                    else if (key.includes('position') || key.includes('jbgd')) {
                        apnt_info.position = value || '';
                    }
                    // 기타 인사 관련 정보도 추가 가능
                });

                // 계좌 정보 (actno_info) 구성
                const actno_info: Record<string, any> = {};

                // 은행, 계좌번호, 급여 정보는 salaryInfo에서 추출
                salaryInfoData.forEach((item) => {
                    const key = (item.key as string) || (item.id as string) || '';
                    const value = row[key];

                    // 은행명
                    if (key.includes('bank')) {
                        actno_info.bankName = value || '';
                    }
                    // 계좌번호
                    else if (key.includes('account') || key.includes('actno')) {
                        actno_info.accountNumber = value || '';
                    }
                    // 급여 정보
                    else if (key.includes('salary') || key.includes('pay')) {
                        actno_info.salary = value || 0;
                    }
                });

                // 근로 정보는 필요시 추가 가능
                const auth = JSON.parse(localStorage.getItem('auth'));
                const userNo = auth?.state?.userNo ?? '';
                // 최종 사용자 데이터 반환
                console.log(row);
                return {
                    user_no: row.user_no,
                    bsc_info,
                    apnt_info,
                    actno_info,
                    upd_id: userNo, // 기본값 설정 또는 로그인한 사용자 ID 등 사용
                    jikyang_form: templateName,
                };
            });
            console.log('userDataList', userDataList);
            // API 호출 파라미터 구성
            const items = [
                {
                    sqlId: 'hpr_invtn01',
                    sql_key: 'hpr_tom_bsc_upsert_info',
                    params: userDataList,
                },
            ];

            // DB 함수 호출 (fetcherPostData 사용)
            const result = await fetcherPostData(items);

            console.log('저장 결과:', result);

            // 성공 메시지 표시
            setSnackbarMessage('저장되었습니다.');
            setSnackbarOpen(true);

            // 성공 후 추가 작업 (창 닫기 등)
            if (result && !result.error) {
                // 필요시 창 닫기
                handleClose();

                // 그리드 재조회
                // setMasterRetrieve(true);
            }
        } catch (error) {
            console.error('저장 중 오류 발생:', error);
            setSnackbarMessage('저장 중 오류가 발생했습니다.');
            setSnackbarOpen(true);
        } finally {
            // 로딩 상태 해제 (필요시)
            // setLoading(false);
        }
    };

    // 더미 함수
    const setDetailRetrieve = (value: boolean) => {
        console.log('setDetailRetrieve', value);
    };

    return (
        <SwModal fullScreen fullWidth open={open} onClose={handleClose} size='full' closeButton={false}>
            <div className='modalBar'>
                <div className='tit'>
                    <IconButton color='inherit' onClick={handleOpenAlert} aria-label='close'>
                        <IcoClose fill='#fff' />
                    </IconButton>
                    {templateName} 정보 입력 ({selectedRowCount}명)
                </div>
                <div className='stepbtns'>
                    <Stack direction={'row'} spacing={1}>
                        <Button onClick={saveData} className='btnWithIcon btnStep'>
                            <IcoCheck fill='#fff' />
                            저장하기
                        </Button>
                    </Stack>
                </div>
            </div>

            {/* 본문 컨텐츠 - Grid01 컴포넌트 사용 */}
            <div className={styles.contentContainer} style={{ height: '100%', width: '100%' }}>
                <div className={styles.guideText}>
                    <div className={styles.title}>초대자 정보 일괄 입력하기</div>
                    <div className={styles.text}>
                        초대 대상자의 인사, 근로, 급여 정보 중 양식에서 필수 데이터로 지정된 항목을 일괄 입력합니다.
                        <br />
                        입력한 데이터는 초대자의 최초 인사정보로 등록되며, 나중에 입력하거나 수정할 수 있습니다.
                        <br />
                        양식에 없는 항목도 인사운영에서 대상자 별로 데이터를 추가로 입력할 수 있습니다.
                    </div>
                </div>
                <Box sx={{ width: '100%', height: '80%' }}>
                    {gridData.length > 0 && (
                        <Grid01
                            masterUI={{}}
                            tpcdParam=''
                            gridData={gridData}
                            rowData={rowData}
                            treeCol=''
                            sheetName='inviteTemplateGrid'
                            setDetailRetrieve={setDetailRetrieve}
                            dataSeInfo={{}}
                            gridKey='inviteTemplateGrid'
                            item={{}}
                            initParam={{}}
                            gridSortData={[]}
                            setMasterRetrieve={setMasterRetrieve}
                            comboData={comboData}
                        />
                    )}
                </Box>
            </div>

            {/* 스낵바 알림 */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={2000}
                onClose={handleSnackBarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleSnackBarClose}
                    icon={false}
                    severity='success'
                    sx={{ width: '100%', backgroundColor: '#4caf50', color: 'white' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>

            {/* 닫기 확인 모달이 필요한 경우 추가 */}
            <SwModal
                open={openAlert}
                onClose={handleOpenAlert}
                title='정보 입력 종료'
                size='md'
                bottomAlign='right'
                bottoms={false}
            >
                <div className={styles.alertModalContent}>
                    <div className={styles.alertText}>
                        <p>입력 중인 내용이 있습니다. 정말 종료하시겠습니까?</p>
                        <p>저장되지 않은 내용은 모두 사라집니다.</p>
                    </div>

                    <div className={styles.alertButtonContainer}>
                        <Button
                            id='confirm-button'
                            type='primary'
                            size='lg'
                            onClick={() => {
                                handleOpenAlert();
                                handleClose();
                            }}
                        >
                            확인
                        </Button>
                        <Button id='cancel-button' type='default' size='lg' onClick={handleOpenAlert}>
                            취소
                        </Button>
                    </div>
                </div>
            </SwModal>
        </SwModal>
    );
};

export default InviteFullModal;
