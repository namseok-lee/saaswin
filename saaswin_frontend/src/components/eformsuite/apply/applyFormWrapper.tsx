'use client';

import React, { useEffect, useState } from 'react';
import ApplyForm from 'components/eformsuite/apply/applyForm';
import { fetcherPostData } from 'utils/axios';
import Loader from 'components/Loader';
import dayjs from 'dayjs';

interface ApplyFormWrapperProps {
    params: {
        open: boolean;
        id?: string;
        aply_form_id?: string;
        modal_info?: {
            atrz_id?: string;
            // 기타 모달 정보
        };
        [key: string]: any;
    };
    setParams: React.Dispatch<React.SetStateAction<any>>;
    tpcdParam: string;
}

// FormMode 타입 정의 (ApplyForm 컴포넌트의 정의와 일치시키기)
type FormMode = 'approval' | 'application' | 'tempSave' | 'view';

const ApplyFormWrapper: React.FC<ApplyFormWrapperProps> = ({ params, setParams, tpcdParam }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<any>({ open: params.open });
    // 폼 모드를 결정하는 상태 추가
    const [formMode, setFormMode] = useState<FormMode>('approval'); // 기본값 설정

    console.log('params', params);

    useEffect(() => {
        // params에 open이 true이고 필요한 ID가 있을 때만 데이터 가져오기
        if (params && params.open && params.modal_info && params.modal_info.atrz_id) {
            setLoading(true);

            // API 호출 파라미터 구성
            const apiParams = [
                {
                    sqlId: 'hpo_efs01',
                    sql_key: 'hpo_efs_aprvr_detail',
                    params: [
                        {
                            atrz_id: params.modal_info.atrz_id,
                            bgng_ymd: dayjs().subtract(1, 'year').format('YYYYMMDD'),
                            bgng_ymd_end: dayjs().format('YYYYMMDD'),
                        },
                    ],
                },
            ];

            // 데이터 가져오기
            fetcherPostData(apiParams)
                .then((response) => {
                    if (response && response[0]) {
                        // API 응답 데이터로 formData 구성
                        const responseData = response[0];
                        setFormData({
                            open: true,
                            ...responseData, // response[0]의 속성들을 직접 포함
                            // 기타 필요한 데이터 추가 (필요 시)
                        });

                        // formMode 결정 로직
                        determineFormMode(responseData);
                    } else {
                        // 응답이 없거나 예상과 다를 경우 처리
                        console.error('유효한 데이터를 받지 못했습니다.');
                        setParams((prev: any) => ({ ...prev, open: false }));
                    }
                })
                .catch((error) => {
                    console.error('데이터 로딩 중 오류 발생:', error);
                    setParams((prev: any) => ({ ...prev, open: false }));
                })
                .finally(() => {
                    setLoading(false);
                });
        } else if (params && params.open) {
            // 신규 작성 모드
            setFormMode('application');
            setFormData({ open: params.open });
        } else {
            // open이 false인 경우
            setFormData({ open: false });
        }
    }, [params, params.open, params.modal_info?.atrz_id]);

    // 응답 데이터에 따라 formMode 결정하는 함수
    const determineFormMode = (data: any) => {
        try {
            // 데이터 구조 검증 및 안전하게 접근
            const ap_data = data?.ap_data || {};

            // 결재 상태 코드
            const approval_status_cd = ap_data.approval_status_cd || ap_data.atrz_stts_se_cd;

            // 임시 저장 상태인지 확인
            //const isTempSave = approval_status_cd === 'hrs_group00165_cm0001';
            const isTempSave = ap_data.atrz_stts_se_cd === 'hrs_group00165_cm0001';

            // 결재 가능한 상태인지 확인 (예: 결재 대기 상태)
            const isAwaitingApproval = approval_status_cd === 'hrs_group00165_cm0500';

            // 아래는 예시 조건들입니다. 실제 로직은 필요에 따라 조정하세요.
            if (isTempSave) {
                setFormMode('tempSave');
            } else if (isAwaitingApproval) {
                setFormMode('approval');
            } else {
                // 그 외의 경우 (이미 처리된 경우 , 참조 등)
                setFormMode('view');
            }

            console.log('결정된 폼 모드:', formMode);
        } catch (error) {
            console.error('폼 모드 결정 중 오류 발생:', error);
            // 오류 발생 시 안전하게 기본 모드 설정
            setFormMode('view');
        }
    };

    // ApplyForm에 적용할 setParams 함수 래핑
    const handleSetFormData = (newData: any) => {
        setFormData(newData);

        // formData.open이 false로 변경되면 부모 컴포넌트의 상태도 업데이트
        if (newData && newData.open === false) {
            setParams((prev) => ({ ...prev, open: false }));
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <ApplyForm
            params={formData}
            setParams={handleSetFormData}
            tpcdParam={tpcdParam}
            formMode={formMode} // 폼 모드 전달
        />
    );
};

export default ApplyFormWrapper;
