import React, { useState, useEffect } from 'react';
import { TextField, Typography, Box, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff, ErrorOutline } from '@mui/icons-material';
import { fetcherPost, fetcherPostOri } from 'utils/axios'; // fetcherPost 함수 불러오기
import ButtonGroup from 'components/ButtonGroup';
import Button from 'components/Button';
import { IcoArrow } from '@/assets/Icon';
import InputTextBox from '@/components/InputTextBox';
import { useTranslation } from 'react-i18next';
import { CryptoService } from '@/services/CryptoService';

// 비밀번호 보안 수준 데이터 (하드코딩)
// const PASSWORD_SECURITY_LEVELS = [
//     {
//         com_cd: 'hrs_group00928_cm0001',
//         del_yn: 'N',
//         end_ymd: '29991231',
//         bgng_ymd: '19000101',
//         cd_prord: '1',
//         com_cd_nm: '영문소문자, 숫자 8자이상',
//         scr_otpt_nm: '영문 소문자, 숫자 8자이상',
//         regex: '^(?=.*[a-z])(?=.*\\d)[a-z\\d]{8,}$', // 정규식 추가
//     },
//     {
//         com_cd: 'hrs_group00928_cm0002',
//         del_yn: 'N',
//         end_ymd: '29991231',
//         bgng_ymd: '19000101',
//         cd_prord: '2',
//         com_cd_nm: '영문대문자,소문자,숫자,특수문자,중 3가지 이상, 10자 이상',
//         scr_otpt_nm: '영문대문자,소문자,숫자,특수문자 중 3가지 이상, 10자 이상',
//         // 복잡한 정규식: 3가지 조합 (긍정탐색 활용)
//         regex: '^(?:(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)|(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}\\[\\]:;<>,.?/~\\\\-])|(?=.*[a-z])(?=.*\\d)(?=.*[!@#$%^&*()_+{}\\[\\]:;<>,.?/~\\\\-])|(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+{}\\[\\]:;<>,.?/~\\\\-]))[A-Za-z\\d!@#$%^&*()_+{}\\[\\]:;<>,.?/~\\\\-]{10,}$',
//     },
//     {
//         com_cd: 'hrs_group00928_cm0003',
//         del_yn: 'N',
//         end_ymd: '29991231',
//         bgng_ymd: '19000101',
//         cd_prord: '3',
//         com_cd_nm: '영문대문자,소문자,숫자,특수문자, 모두 포함 1220자 이상',
//         scr_otpt_nm: '영문대문자,소문자,숫자,특수문자 모두 포함 10자 이상',
//         regex: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+{}\\[\\]:;<>,.?/~\\\\-])[A-Za-z\\d!@#$%^&*()_+{}\\[\\]:;<>,.?/~\\\\-]{10,}$',
//     },
// ];

// 상태 타입 정의
type FormDataType = {
    nowPswd: string;
    changePswd: string;
    rePswd: string;
};

type ShowPasswordType = {
    nowPswd: boolean;
    changePswd: boolean;
    rePswd: boolean;
};

type ErrorsType = {
    nowPswd: string;
    changePswd: string;
    rePswd: string;
};

// SecurityLevelType 정의: API com_cd_info와 regex를 포함하도록 타입 확장
type SecurityLevelType = {
    com_cd: string;
    cd_prord?: string;
    com_cd_nm: string;
    scr_otpt_nm: string;
    regex?: string;
};

// PasswordChange 컴포넌트 props 타입 정의
interface PasswordChangeProps {
    userNo: string;
    userId: string;
}

export default function PasswordChange({ userNo, userId }: PasswordChangeProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<FormDataType>({ nowPswd: '', changePswd: '', rePswd: '' });
    const [showPassword, setShowPassword] = useState<ShowPasswordType>({
        nowPswd: false,
        changePswd: false,
        rePswd: false,
    });
    const [errors, setErrors] = useState<ErrorsType>({
        nowPswd: '',
        changePswd: '',
        rePswd: '',
    });
    const [selectedSecurityLevel, setSelectedSecurityLevel] = useState<SecurityLevelType | null>(null);

    // 다국어
    const { t } = useTranslation();
    useEffect(() => {
        const item = [
            {
                sqlId: 'hrs_login01',
                sql_key: 'hrs_login_crtr_stng_get',
                params: [{}],
            },
        ];

        fetcherPost([process.env.NEXT_PUBLIC_SSW_REDIS_SEARCH_ORIGIN_API_URL, item])
            .then((response) => {
                console.log('정규식 API 응답:', response);

                const dataItem = response?.[0]?.data?.[0];
                const comCdInfo = dataItem?.com_cd_info;

                if (comCdInfo) {
                    // API에서 넘어온 com_cd_info를 그대로 사용하여 보안 수준 설정
                    setSelectedSecurityLevel(comCdInfo as SecurityLevelType);
                    console.log('적용된 보안 수준:', comCdInfo.scr_otpt_nm);
                } else {
                    console.warn('API 응답에 com_cd_info가 없습니다. 기본값을 유지합니다.');
                }
            })
            .catch((error) => {
                console.error('비밀번호 설정 로딩 실패:', error);
            });
    }, []);

    const validatePassword = (password: string): boolean => {
        const originalRegexPattern = selectedSecurityLevel?.regex;
        // 원본 패턴 로깅
        console.log('Original Regex Pattern:', originalRegexPattern);
        // JSON 문자열 값 로깅 (이스케이프 확인용)
        console.log('Original Regex Pattern JSON:', JSON.stringify(originalRegexPattern));

        if (!originalRegexPattern) {
            console.warn('선택된 보안 수준의 정규식이 없습니다.');
            return false;
        }

        let correctedRegexPattern = originalRegexPattern;
        try {
            // 문자열 내의 \\ 를 \ 로 변경 시도 (가장 흔한 문제)
            // 주의: 이 변경이 모든 경우에 맞지 않을 수 있음. API 응답 형식을 정확히 아는 것이 중요.
            correctedRegexPattern = originalRegexPattern.replace(/\\\\/g, '\\'); // JSON.stringify된 형태 기준 \\\\ -> \\
            console.log('Attempt 1: Corrected Pattern (\\\\ -> \\):', correctedRegexPattern);

            // 수정된 패턴으로 RegExp 객체 생성
            const regex = new RegExp(correctedRegexPattern);
            const isValid = regex.test(password);
            console.log(`Validating "${password}" with corrected pattern "${correctedRegexPattern}":`, isValid);

            // 만약 위 수정으로도 실패하면, 원본 패턴으로 다시 시도 (디버깅 목적)
            if (!isValid) {
                console.log('Correction failed, trying original pattern again for comparison.');
                const originalRegex = new RegExp(originalRegexPattern);
                const isOriginalValid = originalRegex.test(password);
                console.log(
                    `Validating "${password}" with original pattern "${originalRegexPattern}":`,
                    isOriginalValid
                );
                // 여기서 결과를 결정해야 함. 일단 수정된 패턴의 결과를 따르도록 유지.
                // return isOriginalValid; // 필요시 원본 결과 반환
            }

            return isValid; // 수정된 패턴의 결과 반환
        } catch (error) {
            console.error('정규식 생성/테스트 오류:', correctedRegexPattern, error);
            // 오류 발생 시 원본 패턴으로 다시 시도해볼 수도 있음
            try {
                console.log('Error with corrected pattern, trying original pattern as fallback.');
                const originalRegex = new RegExp(originalRegexPattern);
                const isOriginalValid = originalRegex.test(password);
                console.log(`Fallback validation with original pattern "${originalRegexPattern}":`, isOriginalValid);
                return isOriginalValid;
            } catch (fallbackError) {
                console.error(
                    'Fallback validation with original pattern also failed:',
                    originalRegexPattern,
                    fallbackError
                );
                return false;
            }
        }
    };

    const handleChange = (fieldId: keyof FormDataType, value: string) => {
        // 입력값 앞뒤 공백 제거
        const trimmedValue = value.trim();

        setFormData((prev) => {
            // trim된 값 사용
            const updatedFormData = { ...prev, [fieldId]: trimmedValue };
            // 여기서 newErrors를 선언하고 현재 errors 상태로 초기화합니다.
            const newErrors = { ...errors };

            if (fieldId === 'nowPswd') {
                // 현재 비밀번호 필드는 입력 여부만 체크합니다. (실제 유효성은 서버에서 확인)
                newErrors.nowPswd = trimmedValue ? '' : '현재 비밀번호를 입력해주세요.';
            }

            if (fieldId === 'changePswd') {
                if (!trimmedValue) {
                    newErrors.changePswd = '새로운 비밀번호를 입력해주세요.';
                    // selectedSecurityLevel이 있고 regex가 있을 때만 유효성 검사 수행 (trim된 값으로 검사)
                } else if (selectedSecurityLevel?.regex && !validatePassword(trimmedValue)) {
                    newErrors.changePswd = `비밀번호 형식이 올바르지 않습니다 (${
                        selectedSecurityLevel?.scr_otpt_nm ?? '규칙 확인'
                    }).`;
                    // selectedSecurityLevel이 아직 로드되지 않았거나 regex가 없는 경우 에러 메시지 초기화
                } else if (!selectedSecurityLevel?.regex) {
                    newErrors.changePswd = '보안 수준 정보를 불러오는 중입니다...'; // 또는 다른 적절한 메시지
                } else {
                    newErrors.changePswd = ''; // 유효성 검사 통과 또는 regex 없음
                }

                // 새로운 비밀번호 변경 시, 재확인 필드도 다시 검사
                if (updatedFormData.rePswd && updatedFormData.rePswd !== trimmedValue) {
                    newErrors.rePswd = '비밀번호가 일치하지 않습니다.';
                } else if (updatedFormData.rePswd) {
                    newErrors.rePswd = ''; // 일치하면 에러 없음
                }
            }

            if (fieldId === 'rePswd') {
                if (!trimmedValue) {
                    newErrors.rePswd = '비밀번호를 재입력해주세요.';
                } else if (trimmedValue !== updatedFormData.changePswd) {
                    newErrors.rePswd = '비밀번호가 일치하지 않습니다.';
                } else {
                    newErrors.rePswd = ''; // 일치하면 에러 없음
                }
            }

            setErrors(newErrors); // 업데이트된 에러 상태 설정
            return updatedFormData;
        });
    };

    const handlePasswordChange = async () => {
        // handlePasswordChange 시작 시 newErrors 객체 초기화
        const newErrors: ErrorsType = { nowPswd: '', changePswd: '', rePswd: '' };

        // 현재 비밀번호 필드 검사
        if (!formData.nowPswd) {
            newErrors.nowPswd = '현재 비밀번호를 입력해주세요.';
        }

        // 새로운 비밀번호 필드 검사
        if (!formData.changePswd) {
            newErrors.changePswd = '새로운 비밀번호를 입력해주세요.';
            // selectedSecurityLevel 및 regex 존재 여부 확인 후 유효성 검사
        } else if (selectedSecurityLevel?.regex && !validatePassword(formData.changePswd)) {
            newErrors.changePswd = `비밀번호 형식이 올바르지 않습니다 (${
                selectedSecurityLevel?.scr_otpt_nm ?? '규칙 확인'
            }).`;
            // selectedSecurityLevel이 아직 로드되지 않았거나 regex가 없는 경우 (API 호출 막기 위해 에러 처리)
        } else if (!selectedSecurityLevel?.regex) {
            newErrors.changePswd = '보안 수준 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.';
        }

        // 비밀번호 재확인 필드 검사
        if (!formData.rePswd) {
            newErrors.rePswd = '비밀번호를 재입력해주세요.';
        } else if (formData.changePswd !== formData.rePswd) {
            newErrors.rePswd = '비밀번호가 일치하지 않습니다.';
        }

        setErrors(newErrors); // 최종 에러 상태 업데이트

        // 유효성 검사 실패 시 API 호출 중단
        if (Object.values(newErrors).some((msg) => msg !== '')) return;

        // --- 기존 API 호출 로직 ---
        const item = [
            {
                sqlId: 'hrs_login01',
                sql_key: 'hrs_login_vrfc_chg_pswd',
                params: [
                    {
                        now_pswd: formData.nowPswd,
                        chg_pswd: formData.changePswd,
                        user_no: userNo,
                        user_id: userId,
                        encrypt_nowPswd: await CryptoService.encryptHybrid(formData.nowPswd, userNo),
                        encrypt_nowChgPswd: await CryptoService.encryptHybrid(formData.changePswd, userNo),
                    },
                ],
            },
        ];
        fetcherPostOri([process.env.NEXT_PUBLIC_SSW_REDIS_SEARCH_ORIGIN_API_URL, item])
            .then((response) => {
                const rtnCode = response?.rtnCode;
                if (rtnCode !== '40002') {
                    // 비밀번호 불일치 또는 다른 오류 처리
                    const errorMessage = response?.rtnMsg || '현재 비밀번호가 일치하지 않습니다.'; // 백엔드 메시지 사용 또는 기본값
                    setErrors((prev) => ({ ...prev, nowPswd: errorMessage }));
                    return;
                }

                // 비밀번호 변경 성공 처리
                console.log('비밀번호 변경 성공 응답:', JSON.stringify(response, null, 2));

                alert('비밀번호가 정상적으로 변경되었습니다.');
                setIsEditing(false);

                // 성공 후 상태 초기화
                setFormData({ nowPswd: '', changePswd: '', rePswd: '' });
                setErrors({ nowPswd: '', changePswd: '', rePswd: '' });
                setShowPassword({ nowPswd: false, changePswd: false, rePswd: false });
            })
            .catch((error) => {
                console.error('비밀번호 변경 실패:', error);
                alert('비밀번호 변경 중 오류가 발생했습니다. 다시 시도해주세요.');
            });
    };

    const togglePasswordVisibility = (field: keyof ShowPasswordType) => {
        setShowPassword((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    type FieldKey = keyof FormDataType;
    const fields: FieldKey[] = ['nowPswd', 'changePswd', 'rePswd'];

    return (
        <div className='passwordChange'>
            {isEditing ? (
                <>
                    <Button
                        type='default'
                        size='sm'
                        onClick={() => setIsEditing(false)}
                        className='btnWithIcon btnChangePwd on'
                    >
                        {/* 비밀번호 변경하기 <IcoArrow fill='#7C7C7C' /> */}
                        {t('50037')} <IcoArrow fill='#7C7C7C' />
                    </Button>
                    <div className='chageAction'>
                        {fields.map((field, index) => {
                            const hasError = !!errors[field];
                            const isNowPswd = field === 'nowPswd';
                            const isChangePswd = field === 'changePswd';

                            return (
                                <div key={index} className='formItem'>
                                    <InputTextBox
                                        type={showPassword[field] ? 'text' : 'password'}
                                        id={field}
                                        // placeholder={
                                        //     isNowPswd
                                        //         ? '현재 사용중인 비밀번호를 입력하세요.'
                                        //         : '새로운 비밀번호를 입력하세요.'
                                        // }
                                        placeholder={isNowPswd ? t('50035') : t('50036')}
                                        hasToggle={true}
                                        showPassword={!showPassword[field]}
                                        // label={
                                        //     isNowPswd
                                        //         ? '현재 비밀번호'
                                        //         : isChangePswd
                                        //         ? '새로운 비밀번호'
                                        //         : '비밀번호 재확인'
                                        // }
                                        label={
                                            isNowPswd
                                                ? t('현재 비밀번호')
                                                : isChangePswd
                                                ? t('신규 비밀번호')
                                                : t('비밀번호 확인')
                                        }
                                        validationText={hasError ? errors[field] : ''}
                                        onTogglePassword={() => togglePasswordVisibility(field)}
                                        onChange={(e) => handleChange(field, e.target.value)}
                                        onDelete={() =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                [field]: '',
                                            }))
                                        }
                                        vertical
                                        error={hasError}
                                        value={formData[field]}
                                    />
                                </div>
                            );
                        })}

                        <ButtonGroup align='center' className='btnGroup'>
                            <Button type='default' size='sm' onClick={() => setIsEditing(false)}>
                                {t('취소')}
                            </Button>
                            <Button type='primary' size='sm' onClick={handlePasswordChange}>
                                {t('변경')}
                            </Button>
                        </ButtonGroup>
                    </div>
                </>
            ) : (
                <Button
                    type='default'
                    size='sm'
                    onClick={() => setIsEditing(true)}
                    className='btnWithIcon btnChangePwd'
                >
                    {/* {t('비밀번호 변경하기')} <IcoArrow fill='#7C7C7C' /> */}
                    {t('50037')} <IcoArrow fill='#7C7C7C' />
                </Button>
            )}
        </div>
    );
}
