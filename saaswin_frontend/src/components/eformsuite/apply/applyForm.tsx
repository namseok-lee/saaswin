'use client';

import Button from 'components/Button';
import SwModal from 'components/Modal';
import Typography from 'components/Typography';
import React, { useEffect, useMemo, useState } from 'react';
import { IcoCheck, IcoDelete, IcoTemplateSave } from '@/assets/Icon';
import styles from '../../../styles/pages/templateApply/page.module.scss';
import ApplyContents from './applyContents';
import ApplyLine from './applyLine';
import AttachFile from '../../File/attachFile';
import { useAuthStore } from 'utils/store/auth';
import { fetcherPost, fetcherPostCommonSave, fetcherPostData } from 'utils/axios';
import { randomId } from '@mui/x-data-grid-generator';
import dayjs from 'dayjs';
import ApplyRejectModal from './applyRejectModal';
import ApplyReject from './applyReject';

// 필요한 타입 정의 (임시로 any 사용, 실제 타입 정의 권장)
interface ApplyLineUser {
    [key: string]: any;
}
interface ApplyLineState {
    open: boolean;
    apply: ApplyLineUser[];
    receive: ApplyLineUser[];
    apln_info?: { apply: ApplyLineUser[]; receive: ApplyLineUser[] };
}

// ap_data 구조에 대한 타입 (간략화)
interface ApData {
    apln_info?: { apply: ApplyLineUser[]; receive: ApplyLineUser[] };
    [key: string]: any; // 기타 속성 허용
}

// Form 상태를 나타내는 타입 정의 (영문 예시)
type FormMode = 'approval' | 'application' | 'tempSave' | 'view';
// 또는 한글을 원하시면: type FormMode = '결재' | '신청' | '임시저장' | '조회';

interface ApplyFormProps {
    params: {
        open: boolean;
        ap_data?: ApData;
        ui_data?: any;
        [key: string]: any;
    };
    setParams: React.Dispatch<React.SetStateAction<any>>;
    procType: string;
    tpcdParam: string;
    formMode?: FormMode; // <--- 새로운 prop 추가
}

const ApplyForm: React.FC<ApplyFormProps> = ({ params, setParams, tpcdParam, formMode }) => {
    const userNo = useAuthStore((state) => state.userNo);
    const rprsOgnzNo = useAuthStore((state) => state.rprsOgnzNo);

    let atrz_id = '';
    // 화면 데이터
    let applyUIData = JSON.parse(JSON.stringify(params)); // 깊은 복사
    if (params.ui_data) {
        applyUIData.apply_info = JSON.parse(JSON.stringify(params.ui_data)); // 깊은 복사하여 apply_info에 할당
        atrz_id = params.ap_data?.atrz_id;
    }

    // 신청서 종류
    const procType = applyUIData.proc_type || 'HPO';

    // 반려상태확인
    const isRejected =
        params.ap_data?.atrz_stts_se_cd === 'hrs_group00165_cm0003' ||
        params.ap_data?.apln_info?.apply?.some((user) => user.atrz_stts_se_cd === 'hrs_group00160_cm0003');

    // 결제라인 (초기값 설정 시 params.ap_data.apln_info 데이터 사용)
    const [applyLineData, setApplyLineData] = useState<ApplyLineState>(() => {
        const initialApply = params.ap_data?.apln_info?.apply || [];
        const initialReceive = params.ap_data?.apln_info?.receive || [];
        return {
            open: false,
            apply: initialApply,
            receive: initialReceive,
        };
    });

    // 내용데이터 (초기값 설정 시 params.ap_data.doc_artcl_info.artcl_info 사용)
    const [applyContentData, setApplyContentData] = useState<Record<string, any>>(() => {
        const initialContentData: Record<string, any> = {};
        const artclInfo = params.ap_data?.doc_artcl_info?.artcl_info;

        if (Array.isArray(artclInfo)) {
            artclInfo.forEach((item: any) => {
                if (!item) return;
                if (item.artcl_se_cd === 'hpo_group01026_cm0002' && Array.isArray(item.etc_options)) {
                    item.etc_options.forEach((option: any) => {
                        if (option && option.key && option.value !== undefined) {
                            initialContentData[option.key] = option.value;
                        }
                    });
                }
                // 기본 항목 또는 다른 커스텀 항목 처리 (key와 value 직접 사용)
                else if (item.key && item.value !== undefined) {
                    // TODO: 필요 시 여기서 값 형식 변환 (예: 날짜 문자열 -> Dayjs 객체 배열)
                    // 예: if (item.key === 'bztrp_prd' && typeof item.value === 'string') { ... }
                    initialContentData[item.key] = item.value;
                }
            });
        }

        return initialContentData;
    });

    // file 상태 초기화 시 ap_data의 file_info를 사용하도록 수정
    const [applyFileData, setApplyFileData] = useState(() => {
        // ap_data에서 파일 정보 가져오기
        const fileInfo = params.ap_data?.doc_artcl_info?.file_info || [];
        return fileInfo;
    });
    // 첨부파일 표시 여부
    const [showAttachFile, setShowAttachFile] = useState(false);

    // 반려팝업
    const [rejectModalOpen, setRejectModalOpen] = useState(false);

    // 문서 신청자 확인 (ap_data 또는 다른 필드에서 가져와야 함)
    const applicantUserNo = params.ap_data?.user_no; // 예시: 신청자 user_no가 ap_data에 있다고 가정

    // 회수 가능 여부 계산 (useMemo 사용)
    const canWithdraw = useMemo(() => {
        // 1. formMode가 view 또는 approval 일 때 (이미 제출된 상태)
        const isSubmittedState = formMode === 'view' || formMode === 'approval';

        // 2. 현재 사용자가 신청자인지 확인
        const isApplicant = userNo === applicantUserNo;

        // 3. 모든 결재자가 '신청중' 상태인지 확인
        const allApproversPending = applyLineData.apply?.every(
            (approver) => approver.atrz_stts_se_cd === 'hrs_group00160_cm0001' // '신청중' 상태 코드 확인 필요
        );

        console.log('회수 가능 조건 확인:', { isSubmittedState, isApplicant, allApproversPending });

        return isSubmittedState && isApplicant && allApproversPending;
    }, [params]);

    // 저장
    const onSave = (isTemp: boolean) => {
        console.log('전체 applyContentData:', JSON.stringify(applyContentData, null, 2));

        // 0. validation
        // 임시저장일 경우 필수 입력 체크 건너뛰기
        if (!isTemp) {
            // 필수 입력 체크
            const missingItems = [];

            // 기본항목 커스텀 정보 중 필수 항목 체크
            const requiredBasicItems =
                applyUIData.apply_info?.artcl_info?.filter(
                    (artcl_info) =>
                        (artcl_info.artcl_se_cd === 'hpo_group01026_cm0001' ||
                            artcl_info.artcl_se_cd === 'hpo_group01026_cm0003') &&
                        artcl_info.use_yn === 'Y' &&
                        artcl_info.esntl_artcl === 'Y'
                ) || [];

            requiredBasicItems.forEach((item) => {
                const value = applyContentData[item.key];
                // null, undefined, 빈 문자열 또는 빈 배열이면 누락된 것으로 처리
                if (
                    value === undefined ||
                    value === null ||
                    value === '' ||
                    (Array.isArray(value) && value.length === 0)
                ) {
                    missingItems.push(item.nm || item.key);
                }
            });

            // 기타항목 중 필수 항목 체크
            const etcItems =
                applyUIData.apply_info?.artcl_info?.filter(
                    (artcl_info) => artcl_info.artcl_se_cd === 'hpo_group01026_cm0002' && artcl_info.use_yn === 'Y'
                ) || [];

            if (etcItems.length > 0 && etcItems[0].etc_options) {
                // 각 기타항목(그리드) 검사
                etcItems[0].etc_options.forEach((option) => {
                    // 사용 중이고 필수 항목인 옵션만 검사
                    if (option.use_yn === 'Y' && option.esntl_yn === 'Y') {
                        const gridKey = option.key;
                        const gridData = applyContentData[gridKey];

                        // 콘솔에 현재 검사 중인 그리드 정보 출력
                        console.log(`검사 중인 그리드: ${gridKey}, 데이터:`, gridData);

                        // 그리드 데이터가 없는 경우
                        if (!gridData) {
                            missingItems.push(option.nm || gridKey);
                            return;
                        }

                        // 배열인 경우 (그리드 데이터)
                        if (Array.isArray(gridData)) {
                            // 빈 배열이면 누락
                            if (gridData.length === 0) {
                                missingItems.push(option.nm || gridKey);
                                return;
                            }

                            // 필수 필드 목록
                            const requiredFields = (option.artcl || []).filter(
                                (artcl) =>
                                    artcl && artcl.use_yn === 'Y' && artcl.esntl_yn === 'Y' && artcl.key !== 'flco_cal'
                            );

                            console.log(
                                `${gridKey}의 필수 필드:`,
                                requiredFields.map((f) => f.key)
                            );

                            // 중요: 필수 필드가 없으면 더 이상 검사하지 않음
                            if (requiredFields.length === 0) {
                                return;
                            }

                            // 각 행 검사
                            gridData.forEach((row, rowIndex) => {
                                requiredFields.forEach((field) => {
                                    const fieldValue = row[field.key];

                                    // 0인 경우는 유효한 값으로 처리
                                    if (
                                        (fieldValue === undefined || fieldValue === null || fieldValue === '') &&
                                        fieldValue !== 0
                                    ) {
                                        console.log(`누락된 필드 발견: ${gridKey}[${rowIndex}].${field.key}`);
                                        missingItems.push(
                                            `${option.nm || gridKey} - ${rowIndex + 1}행 - ${field.nm || field.key}`
                                        );
                                    }
                                });
                            });
                        }
                    }
                });
            }

            // 필수 입력 항목이 누락된 경우 알림 표시
            if (missingItems.length > 0) {
                alert(`다음 필수 항목을 입력해주세요:\n${missingItems.join('\n')}`);
                return;
            }
        }

        // 1. 결재라인 데이터
        const saveApplyLineData = JSON.parse(JSON.stringify(applyLineData)); // 깊은 복사

        if (
            saveApplyLineData.apply === undefined ||
            saveApplyLineData.apply === null ||
            saveApplyLineData.apply.length === 0
        ) {
            alert('결재자를 선택하세요.');
            return;
        }

        // saveApplyLineData.apply가 배열인 경우에만 map 함수 실행
        saveApplyLineData.apply = saveApplyLineData.apply.map((row) => {
            return {
                seq: row.seq,
                user_no: row.user_no,
                flnm: row.flnm,
                ognz_nm: row.ognz_nm,
                ognz_no: row.ognz_no,
                apnt_jbps_cd: row.apnt_jbps_cd,
                apnt_jbps_cd_nm: row.apnt_jbps_cd_nm,
                atrz_stts_se_cd: 'hrs_group00160_cm0001', // 결재승인상태 - 신청중
                atrz_prcs_dt: '', // 결재처리시각
            };
        });
        saveApplyLineData.receive = saveApplyLineData.receive.map((row) => {
            return {
                seq: row.seq,
                user_no: row.user_no,
                flnm: row.flnm,
                ognz_nm: row.ognz_nm,
                ognz_no: row.ognz_no,
                apnt_jbps_cd: row.apnt_jbps_cd,
                apnt_jbps_cd_nm: row.apnt_jbps_cd_nm,
            };
        });

        // 2. 데이터
        const saveApplyContentData: any[] = [];

        // 기본항목 커스텀 정보 가져오기
        const basicCustomItems =
            applyUIData.apply_info?.artcl_info?.filter(
                (artcl_info) =>
                    (artcl_info.artcl_se_cd === 'hpo_group01026_cm0001' ||
                        artcl_info.artcl_se_cd === 'hpo_group01026_cm0003') &&
                    artcl_info.use_yn === 'Y'
            ) || [];

        basicCustomItems.forEach((item) => {
            const basic = {};

            basic.artcl_se_cd = item.artcl_se_cd;
            basic.type_cd = item.type_cd;
            basic.key = item.key;

            // 사용자 입력값 가져오기
            let userValue = applyContentData[item.key] || null;
            // 값이 배열인 경우 쉼표로 구분된 문자열로 변환
            if (Array.isArray(userValue)) {
                // 배열 요소들이 객체인 경우 (예: dayjs 객체) 처리
                userValue = userValue
                    .map((val) => {
                        // dayjs 객체인 경우 포맷팅
                        if (val && typeof val === 'object' && val.format) {
                            return val.format('YYYYMMDD');
                        }
                        return val;
                    })
                    .join(',');
            }

            basic.value = userValue;

            saveApplyContentData.push(basic);
        });

        // 기타항목
        const etcItems =
            applyUIData.apply_info?.artcl_info?.filter(
                (artcl_info) => artcl_info.artcl_se_cd === 'hpo_group01026_cm0002' && artcl_info.use_yn === 'Y'
            ) || [];

        const processedEtcItems = etcItems.map((item) => {
            // 깊은 복사로 새 객체 생성
            const newItem = JSON.parse(JSON.stringify(item));

            // 기존 etc_options가 있는 경우에만 처리
            if (newItem.etc_options && newItem.etc_options.length > 0) {
                // 각 옵션에 사용자 입력 값 추가
                newItem.etc_options = newItem.etc_options
                    .filter((option) => option.use_yn === 'Y')
                    .map((option) => {
                        // 깊은 복사로 새 옵션 객체 생성
                        const newOption = JSON.parse(JSON.stringify(option));
                        // 사용자 입력 값 설정
                        newOption.value = applyContentData[option.key] || null;
                        return newOption;
                    });
            }

            return newItem;
        });

        saveApplyContentData.push(processedEtcItems[0]);

        // 결재라인 open 필드 제거
        if (saveApplyLineData.hasOwnProperty('open')) {
            delete saveApplyLineData.open;
        }

        const doc_artcl_info = {};
        doc_artcl_info.artcl_info = saveApplyContentData;
        doc_artcl_info.file_info = applyFileData;

        /*
        atrz_trgt_id = params.aply_form_id; // 신청서아이디
        atrz_se_cd  = params.task_clsf_cd; // 결재구분코드 (신청서 , 계약서 , 출력물) -> 여기서는 신청서가 들어감
        atrz_stts_se_cd = isTemp ? 'hrs_group00165_cm0001' : 'hrs_group00165_cm0002'; // 결재상태코드 (신청중 hrs_group00165_cm0002 or 임시저장 hrs_group00165_cm0001 ) 
        apln_info = saveApplyLineData; // 결재라인
        doc_artcl_info = doc_artcl_info; // 신청내용
        user_id = userNo; // 결제올리는 사람
        */

        const paramsArr = [];
        const param = {};

        const atrzId = params.ap_data?.atrz_id;
        // 저장 데이터
        param.action_type = atrzId ? 'U' : 'I';
        param.atrz_id = atrzId ? atrzId : randomId();
        param.atrz_trgt_info = [
            {
                id: applyUIData.apply_info.aply_form_id,
            },
        ]; // 신청서아이디를 jsonb 형태로 저장
        param.atrz_se_cd = applyUIData.apply_info.task_clsf_cd; // 결재구분코드 (신청서 , 계약서 , 출력물) -> 여기서는 신청서가 들어감
        param.atrz_stts_se_cd = isTemp ? 'hrs_group00165_cm0001' : 'hrs_group00165_cm0002'; // 결재상태코드 (신청중 hrs_group00165_cm0002 or 임시저장 hrs_group00165_cm0001 )
        param.apln_info = saveApplyLineData; // 결재라인
        param.doc_artcl_info = doc_artcl_info; // 신청내용
        param.user_no = userNo; // 결제올리는 사람
        if (tpcdParam) {
            param.scr_no = tpcdParam;
        }
        param.atrz_prcs_dt_info = {
            atrz_dmnd_dt: dayjs().format('YYYYMMDDHHmmss'),
            atrz_cmptn_dt: '',
            atrz_rtrcn_dt: '',
            atrz_rjct_dt: '',
        };
        param.del_yn = 'N';
        paramsArr.push(param);

        const items = [
            {
                sqlId: 0,
                params: paramsArr, // sendData의 현재 상태를 params에 포함
            },
        ];

        const response = fetcherPostCommonSave(items)
            .then((response) => {
                alert('저장되었습니다.');
                onClose();
                //window.location.href = '/ssw01_x/OI001--1';
            })
            .catch((error) => {
                alert('오류가 발생하였습니다.');
                console.error(error);
            })
            .finally(() => {});
    };

    // 닫기
    const onClose = () => {
        // 1개라도 조작이 있었다면 confirm 띄움
        // if (
        //     !params.ap_data &&
        //     (applyLineData.apply?.length > 0 ||
        //         applyLineData.receive?.length > 0 ||
        //         applyContentData.length > 0 ||
        //         applyFileData.length > 0)
        // ) {
        //     if (!confirm('작성 중인 내용이 있습니다. 정말 닫으시겠습니까?')) {
        //         return; // 사용자가 취소하면 함수 종료
        //     }
        // }

        // 모두 초기화 후 닫음
        setApplyLineData({ open: false, apply: [], receive: [] }); // 결재
        setApplyContentData({}); //내용
        setApplyFileData([]); // 파일
        if (!formMode) {
            setParams((prev) => {
                // 신청서 선택데이터
                return {
                    ...prev,
                    open: false,
                    apply_info: {},
                };
            });
        } else {
            setParams({
                open: false,
            });
        }
    };

    // handleApproval 함수 수정
    const handleApproval = (isApproval: boolean, rejectReason?: string) => {
        // 승인
        if (isApproval) {
            processApproval(isApproval, '');
        }
        // 반려 버튼 클릭 시
        else if (!rejectReason) {
            // 반려 사유 모달
            setRejectModalOpen(true);
        }
        // 반려 모달에서 확인 버튼 클릭 시
        else {
            processApproval(isApproval, rejectReason);
        }
    };

    // 승인반려 처리
    const processApproval = (isApproval: boolean, rejectReason: string) => {
        const item = [
            {
                sqlId: 'hpo_efs01',
                sql_key: 'hpo_efs_aprvr_proc',
                params: [
                    {
                        atrz_id: atrz_id,
                        user_no: userNo,
                        is_approval: isApproval,
                        rjct_rsn: rejectReason,
                    },
                ],
            },
        ];

        fetcherPostData(item)
            .then((response) => {
                if (response && response.length > 0 && response[0].data?.success) {
                    alert(isApproval ? '승인이 완료되었습니다.' : '반려가 완료되었습니다.');
                    onClose(); // 창 닫기
                    window.location.href = window.location.href;
                    //window.location.href = '/ssw01_x/OI002--1'; // 목록 페이지로 이동
                } else {
                    alert(response[0].data?.message || '처리 중 오류가 발생했습니다.');
                }
            })
            .catch((error) => {
                console.error(error);
                alert('처리 중 오류가 발생했습니다.');
            });
    };

    // 회수 처리 함수
    const handleWithdraw = () => {
        // 확인 메시지 표시
        if (!confirm('결재 요청을 회수하시겠습니까? 회수는 결재자가 처리하기 전에만 가능합니다.')) {
            return;
        }

        const item = [
            {
                sqlId: 'hpo_efs01',
                sql_key: 'hpo_efs_aprvr_proc',
                params: [
                    {
                        atrz_id: atrz_id,
                        user_no: userNo,
                        is_withdraw: true, // 회수 처리 플래그
                    },
                ],
            },
        ];

        fetcherPostData(item)
            .then((response) => {
                if (response && response.length > 0 && response[0].data?.success) {
                    alert('회수가 완료되었습니다.');
                    onClose(); // 창 닫기
                    //window.location.href = '/ssw01_x/OI001--1'; // 목록 페이지로 이동
                } else {
                    alert(response[0].data?.message || '처리 중 오류가 발생했습니다.');
                }
            })
            .catch((error) => {
                console.error(error);
                alert('처리 중 오류가 발생했습니다.');
            });
    };

    // 반려
    const handleRejectConfirm = (reason: string) => {
        setRejectModalOpen(false);
        handleApproval(false, reason);
    };

    // 첨부파일 표시 여부 계산
    useEffect(() => {
        if (applyUIData.apply_info?.artcl_info) {
            // 첨부파일
            const fileArticle = applyUIData.apply_info.artcl_info.find(
                (item) => item.artcl_se_cd === 'hpo_group01026_cm0004' && item.use_yn === 'Y'
            );
            setShowAttachFile(!!fileArticle);
        }
    }, [applyUIData]);

    return (
        <SwModal
            open={params.open}
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
            <Typography title={applyUIData.apply_info?.doc_knd_cd_nm} type='form'>
                {applyUIData.apply_info?.doc_knd_cd_nm}
            </Typography>

            <div className={styles.context}>
                {/* 결제 라인 */}
                <ApplyLine params={applyLineData} setParams={setApplyLineData} formMode={formMode} />

                {/* 반려상태일때 */}
                {isRejected && <ApplyReject params={params.ap_data} />}

                {/* 내용 */}
                <ApplyContents
                    params={applyContentData}
                    setParams={setApplyContentData}
                    applyUIData={applyUIData.apply_info}
                    formMode={formMode}
                />

                {/* 파일 영역 - 첨부파일 */}
                {showAttachFile && (
                    <AttachFile
                        params={applyFileData}
                        setParams={setApplyFileData}
                        procType={procType}
                        formMode={formMode}
                    />
                )}
            </div>

            {/* 하단버튼 */}
            <div className='actions alignRight borderStyle'>
                <Button id='btnDefault11' type='default' size='lg' className='btnWithIcon' onClick={onClose}>
                    <IcoDelete fill='#7C7C7C' />
                    취소
                </Button>
                {/* 회수 버튼 (조건부 표시) */}
                {canWithdraw && (
                    <Button
                        id='btnPrmary13'
                        type='primary'
                        size='lg'
                        className='btnWithIcon'
                        onClick={() => handleWithdraw()}
                    >
                        <IcoCheck fill='#fff' /> 회수
                    </Button>
                )}

                {formMode !== 'approval' && formMode !== 'view' && (
                    <>
                        <Button
                            id='btnDefault11'
                            type='default'
                            size='lg'
                            className='btnWithIcon'
                            onClick={() => onSave(true)}
                        >
                            <IcoTemplateSave fill='#7C7C7C' />
                            임시저장
                        </Button>
                        <Button
                            id='btnPrmary12'
                            type='primary'
                            size='lg'
                            className='btnWithIcon'
                            onClick={() => onSave(false)}
                        >
                            <IcoCheck fill='#fff' /> 신청
                        </Button>
                    </>
                )}
                {formMode === 'approval' && (
                    <>
                        <Button
                            id='btnReject'
                            type='default'
                            size='lg'
                            className='btnWithIcon'
                            onClick={() => handleApproval(false)}
                        >
                            <IcoDelete fill='#7C7C7C' /> 반려
                        </Button>
                        <Button
                            id='btnApproval'
                            type='primary'
                            size='lg'
                            className='btnWithIcon'
                            onClick={() => handleApproval(true)}
                        >
                            <IcoCheck fill='#fff' /> 승인
                        </Button>
                    </>
                )}
            </div>

            {/* 반려 사유 입력 모달 */}
            <ApplyRejectModal
                open={rejectModalOpen}
                onClose={() => setRejectModalOpen(false)}
                onConfirm={handleRejectConfirm}
            />
        </SwModal>
    );
};

export default ApplyForm;
