'use client';
import Button from '@/components/Button';
import { Box, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';

import Typography from 'components/Typography';
import { t } from 'i18next';
import { IcoCardHr } from '../../../public/asset/Icon';
import InputTextBox from '@/components/InputTextBox';
import { useEffect, useState } from 'react';
import SwDatePicker from '@/components/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import BoxSelect from '@/components/BoxSelect';
import { fetcherPostCmcd, fetcherPostData, fetcherPostDecrypt } from '@/utils/axios';
import Loader from '@/components/Loader';
import { CryptoService } from '@/services/CryptoService';
import { validateJsonFields } from '@/utils/validation/valid';

export default function HrInfoBasicTable({
    userData,
    setRetrieve,
    setMasterRetrieve,
}: {
    userData: Record<string, any>;
    setRetrieve: (retrieve: boolean) => void;
    setMasterRetrieve: (masterRetrieve: boolean) => void;
}) {
    const userLanguage = localStorage.getItem('userLanguage') || 'ko';
    const [languageNameList, setLanguageNameList] = useState<
        { type: string; label: string; key: string; value: string }[]
    >([]);
    const [dataLoading, setDataLoading] = useState(false);
    const [inputValues, setInputValues] = useState<Record<string, string>>({});
    const [comboData, setComboData] = useState<Record<string, any>>({});
    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [requiredCheck, setRequiredCheck] = useState<Record<string, boolean>>({});
    // 필수 필드 정의 (asterisk prop을 가진 필드들)
    const requiredFields = {
        jncmp_ymd: '입사일자',
        annul_rck_ymd: '연차기산일자',
        crr_se_cd: '경력구분',
        lbr_formt_cd: '근로형태',
        dompl_frgnr_se_cd: '내외국인구분',
        ntn_cd: '국적',
        brdt: '생년월일',
        rrno_plain: '주민번호',
        mrg_ymd: '결혼일자', // 조건부 필수
    };

    const handleChange = (id: string, value: string) => {
        setInputValues((prevValues) => {
            const newValues = { ...prevValues, [id]: value };
            // 결혼구분이 '미혼'으로 변경되면 결혼일자를 null로 설정
            if (id === 'mrg_cd' && value === 'hpo_group00752_cm0001') {
                newValues.mrg_ymd = '';
            }
            return newValues;
        });

        // 값이 변경되면 해당 필드의 에러 상태 초기화
        if (errors[id]) {
            setErrors({ ...errors, [id]: false });
        }
    };
    const handleChangeDate = (id: string, value: Dayjs) => {
        const formattedValue = value.format('YYYY-MM-DD');
        setInputValues({ ...inputValues, [id]: formattedValue });
        // 값이 변경되면 해당 필드의 에러 상태 초기화
        if (errors[id]) {
            setErrors({ ...errors, [id]: false });
        }
    };

    // validation 함수
    const validateForm = () => {
        const newErrors: Record<string, boolean> = {};
        const isRequiredCheckValid = Object.values(requiredCheck).every((isValid) => isValid === true);

        // 이름 관련 검증
        if (languageNameList.length === 0) {
            newErrors['name_required'] = true;
        } else {
            // 각 이름 종류별로 이름이 입력되었는지 검증
            languageNameList.forEach((nameItem, index) => {
                if (!inputValues[nameItem.key] || inputValues[nameItem.key].trim() === '') {
                    newErrors[nameItem.key] = true;
                }
            });

            // 중복된 이름 종류 검증
            const types = languageNameList.map((item) => item.type);
            const duplicateTypes = types.filter((type, index) => types.indexOf(type) !== index);
            if (duplicateTypes.length > 0) {
                duplicateTypes.forEach((type) => {
                    const duplicateIndexes = languageNameList
                        .map((item, index) => (item.type === type ? index : -1))
                        .filter((index) => index !== -1);
                    duplicateIndexes.forEach((index) => {
                        newErrors[`nm_knd_${index}`] = true;
                    });
                });
            }
        }

        // 기본 필수 필드 검증
        Object.keys(requiredFields).forEach((field) => {
            if (field === 'rrno_plain') {
                // 주민번호 유효성 체크
                const failedFields = validateJsonFields({ rrno_plain: inputValues.rrno_plain });
                if (failedFields) {
                    newErrors[field] = true;
                }
            } else if (field === 'mrg_ymd') {
                // 결혼일자는 결혼구분이 '결혼'일 때만 필수
                if (inputValues.mrg_cd === 'hpo_group00752_cm0002' && !inputValues[field]) {
                    newErrors[field] = true;
                }
            } else {
                // 일반 필수 필드
                if (!inputValues[field] || inputValues[field].trim() === '') {
                    newErrors[field] = true;
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0 && isRequiredCheckValid;
    };

    // 저장 함수
    const handleSave = async () => {
        // 모든 이름 필드를 기본값으로 초기화
        const nameFields = {
            korn_flnm: '',
            eng_flnm: '',
            jpl_flnm: '',
            cnl_flnm: '',
        };
        const { rrno_plain, ...filteredInputValues } = inputValues;
        // languageNameList에 있는 필드들만 실제 값으로 업데이트
        languageNameList.forEach((nameItem) => {
            if (inputValues[nameItem.key]) {
                nameFields[nameItem.key] = inputValues[nameItem.key];
            }
        });
        let encryptedValue = null;
        if (rrno_plain) {
            encryptedValue = await CryptoService.encryptHybrid(inputValues.rrno_plain, userData.user_no);
        }

        // 최종 저장 데이터 (누락된 이름 필드들은 빈 문자열)
        const saveData = {
            ...filteredInputValues,
            ...nameFields,
            ...(encryptedValue ? { encrypt_rrNo: encryptedValue } : {}), // 조건부로 encrypt_rrNo 추가
        };

        const isValid = validateForm();
        const sqlId = 'hrs_com01';
        const sqlKey = 'hrs_tom_bsc_update';
        const item = {
            sqlId: sqlId,
            sql_key: sqlKey,
            params: [
                {
                    bsc_info: saveData,
                    user_no: userData.user_no,
                },
            ],
        };
        if (isValid) {
            if (confirm('저장하시겠습니까?')) {
                // 저장 로직 실행
                fetcherPostData([item]).then(() => {
                    setMasterRetrieve(true);
                    setRetrieve(true);
                });
            }
            // TODO: 실제 저장 API 호출
        } else {
            alert('필수 항목를 입력해주세요.');
        }
    };

    const comboCd = [
        'hpo_group00493', // 경력구분
        'hpo_group00263', // 근로형태
        'hrs_group00328', // 내외국인 구분
        'hrs_group00755', // 국가
        'hpo_group00752', // 결혼구분
    ];

    useEffect(() => {
        comboCd.forEach((cd) => {
            fetcherPostCmcd({
                group_cd: cd,
                rprs_ognz_no: 'COMGRP',
            })
                .then((response) => {
                    setComboData((prev) => ({
                        ...prev,
                        [cd]: response,
                    }));
                })
                .catch((error) => {
                    console.error(error);
                });
        });
    }, []);
    // 복호화 함수
    const handleDecrypt = async () => {
        const user_no = userData?.user_no;
        try {
            const item = [{ user_no: user_no, trgt_key: 'encrypt_rrNo' }];
            // fetcherPostDecrypt가 Promise를 반환한다고 가정
            const response = await fetcherPostDecrypt([process.env.NEXT_PUBLIC_SSW_ENCRYPT_API_URL, item]);
            const data = response[0];

            let encptData = {};
            let privateKeyPEM = '';

            encptData = {
                encryptedAesKey: data.encryptedAesKey,
                encryptedData: data.encryptedData,
                iv: data.iv,
                user_no: user_no,
            };
            // 개인키
            privateKeyPEM = data.work_user_prvtkey;
            // encptData가 비어있지 않은지 확인
            if (Object.keys(encptData).length === 0) {
                return null; // 또는 적절한 기본값
            }
            const decryptedValue = await CryptoService.decryptHybrid(encptData, privateKeyPEM);
            return decryptedValue;
        } catch (error) {
            console.error('handleDecrypt error:', error);
            throw error; // 또는 적절한 에러 처리
        }
    };
    useEffect(() => {
        const initializeData = async () => {
            // 주민등록번호 복호화
            const decryptedValue = await handleDecrypt();

            const nameList: { type: string; label: string; key: string; value: string }[] = [];
            const languageConfig = {
                ko: { type: 'ko', label: '한글', key: 'korn_flnm' },
                en: { type: 'en', label: '영문', key: 'eng_flnm' },
                jp: { type: 'jp', label: '일본어', key: 'jpl_flnm' },
                cn: { type: 'cn', label: '중국어', key: 'cnl_flnm' },
            };

            const primaryType =
                userLanguage === 'ko'
                    ? 'ko'
                    : userLanguage === 'en'
                    ? 'en'
                    : userLanguage === 'jp'
                    ? 'jp'
                    : userLanguage === 'cn'
                    ? 'cn'
                    : 'ko';

            const primaryConfig = languageConfig[primaryType];
            nameList.push({
                ...primaryConfig,
                value: userData.bsc_info[primaryConfig.key] || '',
            });

            Object.keys(languageConfig).forEach((type) => {
                if (type !== primaryType && userData.bsc_info[languageConfig[type].key]) {
                    nameList.push({
                        ...languageConfig[type],
                        value: userData.bsc_info[languageConfig[type].key],
                    });
                }
            });

            setLanguageNameList(nameList);

            const findComboValue = (groupKey: string, currentValue: string) => {
                const groupData = comboData[groupKey];
                if (!groupData || !Array.isArray(groupData)) return null;

                const foundItem = groupData.find((item) => item.com_cd_nm === currentValue);
                return foundItem ? foundItem.com_cd : null;
            };

            setInputValues({
                korn_flnm: userData.bsc_info.korn_flnm || '',
                eng_flnm: userData.bsc_info.eng_flnm || '',
                jpl_flnm: userData.bsc_info.jpl_flnm || '',
                cnl_flnm: userData.bsc_info.cnl_flnm || '',
                jncmp_ymd: userData.bsc_info.jncmp_ymd || null,
                rrno_plain: decryptedValue || '', // 여기에서 정상 텍스트 값 할당됨
                annul_rck_ymd: userData.bsc_info.annul_rck_ymd || null,
                lbr_ctrt_bgng_ymd: userData.bsc_info.lbr_ctrt_bgng_ymd || null,
                lbr_ctrt_end_ymd: userData.bsc_info.lbr_ctrt_end_ymd || null,
                prbtn_bgng_ymd: userData.bsc_info.prbtn_bgng_ymd || null,
                prbtn_end_ymd: userData.bsc_info.prbtn_end_ymd || null,
                crr_se_cd: findComboValue('hpo_group00493', userData.bsc_info.crr_se_cd) || null,
                lbr_formt_cd: findComboValue('hpo_group00263', userData.bsc_info.lbr_formt_cd) || null,
                dompl_frgnr_se_cd: findComboValue('hrs_group00328', userData.bsc_info.dompl_frgnr_se_cd) || null,
                brdt: userData.bsc_info.brdt || null,
                ntn_cd: findComboValue('hrs_group00755', userData.bsc_info.ntn_cd) || null,
                mrg_cd: findComboValue('hpo_group00752', userData.bsc_info.mrg_cd) || null,
                mrg_ymd: userData.bsc_info.mrg_ymd || null,
                rmrk: userData.bsc_info.rmrk || '',
            });

            setDataLoading(true);
        };

        if (comboData && Object.keys(comboData).length > 0) {
            initializeData();
        }
    }, [userData, userLanguage, comboData]);
    const formmatedSelectItem = (cd: string) => {
        return (
            comboData[cd]?.map((item: any) => ({
                label: item.com_cd_nm,
                value: item.com_cd,
            })) || []
        );
    };
    // 언어 종류 변경 핸들러
    const handleLanguageChange = (index: number, field: string, value: string) => {
        const updatedList = [...languageNameList];

        if (field === 'type') {
            const languageConfig = {
                ko: { type: 'ko', label: '한글', key: 'korn_flnm' },
                en: { type: 'en', label: '영문', key: 'eng_flnm' },
                jp: { type: 'jp', label: '일본어', key: 'jpl_flnm' },
                cn: { type: 'cn', label: '중국어', key: 'cnl_flnm' },
            };

            // 선택된 config가 존재하는지 확인
            const selectedConfig = languageConfig[value];
            if (!selectedConfig) {
                console.error('Invalid language config:', value);
                return;
            }

            // 중복 체크 (type 기준으로)
            const isAlreadyUsed = languageNameList.some((item, i) => i !== index && item.type === value);
            if (isAlreadyUsed) {
                alert('이미 선택된 이름 종류입니다.');
                return;
            }

            // 기존 입력값 유지하면서 config 업데이트
            updatedList[index] = {
                ...selectedConfig,
                value: updatedList[index].value || inputValues[selectedConfig.key] || '',
            };

            // 에러 상태 초기화
            if (errors[`nm_knd_${index}`]) {
                setErrors((prev) => ({ ...prev, [`nm_knd_${index}`]: false }));
            }
        }

        setLanguageNameList(updatedList);
    };

    // 이름 필드 추가
    const addNameField = () => {
        // 사용하지 않은 언어 찾기
        const usedTypes = languageNameList.map((item) => item.type);
        const availableTypes = ['ko', 'en', 'jp', 'cn'].filter((type) => !usedTypes.includes(type));

        if (availableTypes.length > 0) {
            const languageConfig = {
                ko: { type: 'ko', label: '한글', key: 'korn_flnm' },
                en: { type: 'en', label: '영문', key: 'eng_flnm' },
                jp: { type: 'jp', label: '일본어', key: 'jpl_flnm' },
                cn: { type: 'cn', label: '중국어', key: 'cnl_flnm' },
            };

            const newType = availableTypes[0];
            setLanguageNameList([
                ...languageNameList,
                {
                    ...languageConfig[newType],
                    value: '',
                },
            ]);
        } else {
            alert('더 이상 추가할 수 있는 이름 종류가 없습니다.');
        }
    };

    // 이름 필드 제거
    const removeNameField = (index: number) => {
        const updatedList = languageNameList.filter((_, i) => i !== index);
        setRequiredCheck((prev) => {
            const newRequiredCheck = { ...prev };
            delete newRequiredCheck[languageNameList[index].key];
            return newRequiredCheck;
        });
        setLanguageNameList(updatedList);

        // 해당 필드의 값도 제거
        const removedItem = languageNameList[index];
        if (removedItem) {
            setInputValues((prev) => {
                const newValues = { ...prev };
                delete newValues[removedItem.key];
                return newValues;
            });
        }
    };
    if (!dataLoading) return <Loader />;
    return (
        <Box sx={{ p: 1 }}>
            <Stack direction={'row'} sx={{ justifyContent: 'space-between', margin: 0 }}>
                <Stack
                    direction={'row'}
                    spacing={2}
                    sx={{ justifyContent: 'space-between', margin: 0, alignItems: 'center', pb: '15px' }}
                >
                    <span className='icon'>{<IcoCardHr fill='#666666' />}</span>
                    <Typography type='table'>{t('근로자정보')}</Typography>
                </Stack>
                <Stack direction={'row'} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button onClick={handleSave} className='btnPrimary' size='md'>
                        {'저장'}
                    </Button>
                </Stack>
            </Stack>
            <TableContainer
                component={Paper}
                sx={{
                    width: '100%',
                    margin: 'auto',
                    marginTop: 3,
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                }}
            >
                <Table>
                    <TableBody>
                        {languageNameList.map((nameItem, index) => (
                            <TableRow key={nameItem.type}>
                                <TableCell sx={{ width: '33.3%' }}>
                                    <BoxSelect
                                        placeholder='선택하지 않음'
                                        label='이름 종류'
                                        asterisk
                                        disabled={index === 0}
                                        error={errors[`nm_knd_${index}`]}
                                        validationText={errors[`nm_knd_${index}`] ? '이름 종류가 중복되었습니다.' : ''}
                                        value={nameItem.type || ''}
                                        onChange={(e) => handleLanguageChange(index, 'type', e.target.value)}
                                        options={[
                                            { label: '한글', value: 'ko' },
                                            { label: '영문', value: 'en' },
                                            { label: '일본어', value: 'jp' },
                                            { label: '중국어', value: 'cn' },
                                        ]}
                                        vertical
                                    />
                                </TableCell>

                                <TableCell sx={{ width: '33.3%' }}>
                                    <InputTextBox
                                        type='text'
                                        id={nameItem.key}
                                        error={errors[nameItem.key]}
                                        placeholder='내용을 입력하세요.'
                                        hasToggle={false}
                                        showPassword={false}
                                        label={`이름`}
                                        asterisk
                                        validationText={errors[nameItem.key] ? `이름은 필수항목입니다.` : ''}
                                        vertical
                                        value={inputValues[nameItem.key] || ''}
                                        onChange={(e) => handleChange(nameItem.key, e.target.value)}
                                        onDelete={() => {}}
                                        onValidationResult={(isValid) => {
                                            setRequiredCheck((prev) => ({ ...prev, [nameItem.key]: isValid }));
                                        }}
                                    />
                                </TableCell>
                                <TableCell sx={{ width: '33.3%' }}>
                                    {/* 이름 추가/삭제 버튼 */}
                                    <Stack direction='row' spacing={1}>
                                        {languageNameList.length > 1 && index > 0 && (
                                            <Button
                                                onClick={() => removeNameField(index)}
                                                size='sm'
                                                className='btnDefault'
                                            >
                                                삭제
                                            </Button>
                                        )}
                                        {index === languageNameList.length - 1 && languageNameList.length < 4 && (
                                            <Button onClick={() => addNameField()} size='sm' className='btnDefault'>
                                                이름 추가
                                            </Button>
                                        )}
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableRow>
                            <TableCell sx={{ width: '33.3%' }}>
                                <SwDatePicker
                                    label='입사일자'
                                    id='jncmp_ymd'
                                    error={errors.jncmp_ymd}
                                    validationText={errors.jncmp_ymd ? '입사일자는 필수항목입니다.' : ''}
                                    asterisk
                                    vertical
                                    value={dayjs(inputValues.jncmp_ymd)}
                                    onChange={(newValue) => handleChangeDate('jncmp_ymd', newValue)}
                                />
                            </TableCell>
                            <TableCell sx={{ width: '33.3%' }}>
                                <SwDatePicker
                                    label='연차기산일자'
                                    id='annul_rck_ymd'
                                    error={errors.annul_rck_ymd}
                                    validationText={errors.annul_rck_ymd ? '연차기산일자는 필수항목입니다.' : ''}
                                    asterisk
                                    vertical
                                    value={dayjs(inputValues.annul_rck_ymd)}
                                    onChange={(newValue) => handleChangeDate('annul_rck_ymd', newValue)}
                                />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ width: '33.3%' }}>
                                <SwDatePicker
                                    label='근로계약 시작일자'
                                    id='lbr_ctrt_bgng_ymd'
                                    vertical
                                    disabled={inputValues.lbr_ctrt_bgng_ymd === null || !inputValues.lbr_ctrt_bgng_ymd}
                                    value={dayjs(inputValues.lbr_ctrt_bgng_ymd)}
                                    onChange={(newValue) => handleChangeDate('lbr_ctrt_bgng_ymd', newValue)}
                                />
                            </TableCell>
                            <TableCell sx={{ width: '33.3%' }}>
                                <SwDatePicker
                                    label='근로계약 종료일자'
                                    id='lbr_ctrt_end_ymd'
                                    disabled={inputValues.lbr_ctrt_end_ymd === null || !inputValues.lbr_ctrt_end_ymd}
                                    vertical
                                    value={dayjs(inputValues.lbr_ctrt_end_ymd)}
                                    onChange={(newValue) => handleChangeDate('lbr_ctrt_end_ymd', newValue)}
                                />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ width: '33.3%' }}>
                                <SwDatePicker
                                    label='수습기간 시작일자'
                                    id='prbtn_bgng_ymd'
                                    disabled={inputValues.prbtn_bgng_ymd === null || !inputValues.prbtn_bgng_ymd}
                                    vertical
                                    value={dayjs(inputValues.prbtn_bgng_ymd)}
                                    onChange={(newValue) => handleChangeDate('prbtn_bgng_ymd', newValue)}
                                />
                            </TableCell>
                            <TableCell sx={{ width: '33.3%' }}>
                                <SwDatePicker
                                    label='수습기간 종료일자'
                                    id='prbtn_end_ymd'
                                    disabled={inputValues.prbtn_end_ymd === null || !inputValues.prbtn_end_ymd}
                                    vertical
                                    value={dayjs(inputValues.prbtn_end_ymd)}
                                    onChange={(newValue) => handleChangeDate('prbtn_end_ymd', newValue)}
                                />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ width: '33.3%' }}>
                                <BoxSelect
                                    placeholder='선택하지 않음'
                                    label='경력구분'
                                    error={errors.crr_se_cd}
                                    validationText={errors.crr_se_cd ? '경력구분은 필수항목입니다.' : ''}
                                    asterisk
                                    value={inputValues.crr_se_cd || ''}
                                    onChange={(e) => handleChange('crr_se_cd', e.target.value)}
                                    options={formmatedSelectItem('hpo_group00493') || []}
                                    vertical
                                />
                            </TableCell>
                            <TableCell sx={{ width: '33.3%' }}>
                                <BoxSelect
                                    placeholder='선택하지 않음'
                                    label='근로형태'
                                    error={errors.lbr_formt_cd}
                                    validationText={errors.lbr_formt_cd ? '근로형태는 필수항목입니다.' : ''}
                                    asterisk
                                    value={inputValues.lbr_formt_cd || ''}
                                    onChange={(e) => handleChange('lbr_formt_cd', e.target.value)}
                                    options={formmatedSelectItem('hpo_group00263') || []}
                                    vertical
                                />
                            </TableCell>
                            <TableCell sx={{ width: '33.3%' }}>
                                <BoxSelect
                                    placeholder='선택하지 않음'
                                    label='근무유형'
                                    asterisk
                                    value={'고정출퇴근제 기본형'}
                                    onChange={() => {}}
                                    options={[
                                        {
                                            label: '시차 출퇴근제',
                                            value: '시차 출퇴근제',
                                        },
                                        {
                                            label: '단축근무',
                                            value: '단축근무',
                                        },
                                        {
                                            label: '재량근무',
                                            value: '재량근무',
                                        },
                                        {
                                            label: '탄력근무제',
                                            value: '탄력근무제',
                                        },
                                        {
                                            label: '재택근무제',
                                            value: '재택근무제',
                                        },
                                        {
                                            label: '고정출퇴근제 기본형',
                                            value: '고정출퇴근제 기본형',
                                        },
                                    ]}
                                    vertical
                                />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ width: '33.3%' }}>
                                <BoxSelect
                                    placeholder='선택하지 않음'
                                    label='내외국인구분'
                                    error={errors.dompl_frgnr_se_cd}
                                    validationText={errors.dompl_frgnr_se_cd ? '내외국인구분은 필수항목입니다.' : ''}
                                    asterisk
                                    value={inputValues.dompl_frgnr_se_cd || ''}
                                    onChange={(e) => handleChange('dompl_frgnr_se_cd', e.target.value)}
                                    options={formmatedSelectItem('hrs_group00328') || []}
                                    vertical
                                />
                            </TableCell>
                            <TableCell sx={{ width: '33.3%' }}>
                                <BoxSelect
                                    placeholder='선택하지 않음'
                                    label='국적'
                                    error={errors.ntn_cd}
                                    validationText={errors.ntn_cd ? '국적은 필수항목입니다.' : ''}
                                    asterisk
                                    value={inputValues.ntn_cd || 'hrs_group00755_cm0114'}
                                    onChange={(e) => handleChange('ntn_cd', e.target.value)}
                                    options={formmatedSelectItem('hrs_group00755') || []}
                                    vertical
                                />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ width: '33.3%' }}>
                                <InputTextBox
                                    type='text'
                                    id='rrno_plain'
                                    error={errors.rrno_plain}
                                    placeholder='내용을 입력하세요'
                                    hasToggle={false}
                                    showPassword={false}
                                    label='주민번호'
                                    asterisk
                                    validationText={errors.rrno_plain ? '주민번호는 필수항목입니다.' : ''}
                                    vertical
                                    value={inputValues.rrno_plain}
                                    onChange={(e) => handleChange('rrno_plain', e.target.value)}
                                    onDelete={() => {}}
                                    onValidationResult={(isValid) => {
                                        setRequiredCheck((prev) => ({ ...prev, rrno_plain: isValid }));
                                    }}
                                />
                            </TableCell>
                            <TableCell sx={{ width: '33.3%' }}>
                                <SwDatePicker
                                    label='생년월일'
                                    id='brdt'
                                    error={errors.brdt}
                                    validationText={errors.brdt ? '생년월일은 필수항목입니다.' : ''}
                                    asterisk
                                    vertical
                                    value={dayjs(inputValues.brdt)}
                                    onChange={(newValue) => handleChangeDate('brdt', newValue)}
                                />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ width: '33.3%' }}>
                                <BoxSelect
                                    placeholder='선택하지 않음'
                                    label='결혼구분'
                                    value={inputValues.mrg_cd || ''}
                                    onChange={(e) => handleChange('mrg_cd', e.target.value)}
                                    options={formmatedSelectItem('hpo_group00752') || []}
                                    vertical
                                />
                            </TableCell>
                            <TableCell sx={{ width: '33.3%' }}>
                                <SwDatePicker
                                    label='결혼일자'
                                    id='mrg_ymd'
                                    disabled={inputValues.mrg_cd === 'hpo_group00752_cm0001' || !inputValues.mrg_cd}
                                    vertical
                                    value={dayjs(inputValues.mrg_ymd)}
                                    onChange={(newValue) => handleChangeDate('mrg_ymd', newValue)}
                                />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell colSpan={2}>
                                <InputTextBox
                                    type='text'
                                    id='rmrk'
                                    placeholder='내용을 입력하세요'
                                    hasToggle={false}
                                    showPassword={false}
                                    label='비고'
                                    countText
                                    validationText='validation text'
                                    vertical
                                    value={inputValues.rmrk}
                                    onChange={(e) => handleChange('rmrk', e.target.value)}
                                    onDelete={() => {}}
                                />
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
