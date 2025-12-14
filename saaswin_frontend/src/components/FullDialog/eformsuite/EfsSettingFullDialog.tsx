'use client';
import React, { useEffect, useState } from 'react';
import { IconButton } from '@mui/material';
import { randomId } from '@mui/x-data-grid-generator';
import SwModal from 'components/Modal';
import Button from 'components/Button';
import { fetcherPost, fetcherPostCmcd, fetcherPostCommonSave } from 'utils/axios';
import { useAuthStore } from 'utils/store/auth';
import { IcoCheck, IcoClose, IcoPreview } from '@/assets/Icon';
import styles from '../../../styles/pages/Template/page.module.scss';
import SettingBasicArticleSection from 'components/eformsuite/apply/settingBasicArticleSection';
import SettingCustomArticleSection from 'components/eformsuite/apply/settingCustomArticleSection';
import SettingEtcArticleSection from 'components/eformsuite/apply/settingEtcArticleSection';

interface EfsSettingFullDialogProps {
    params: {
        open: boolean;
        setting_info?: {
            artcl_info?: Array<any>;
            knd_cd_nm?: string;
            [key: string]: any;
        };
        [key: string]: any;
    };
    setParams: React.Dispatch<React.SetStateAction<any>>;
    tpcdParam: string;
}

const EfsSettingFullDialog: React.FC<EfsSettingFullDialogProps> = ({ params, setParams, tpcdParam }) => {
    const user_no = useAuthStore((state) => state.userNo);
    const rprs_ognz_no = 'WIN';
    const [validation, setValidation] = useState({ validation: true, type: '', message: '' });
    const { open } = params;

    // 깊은 복사를 통한 상태 초기화
    const [settingData, setSettingData] = useState(() =>
        JSON.parse(
            JSON.stringify({
                ...params,
                setting_info: {
                    ...(params?.setting_info || {}),
                    artcl_info: params?.setting_info?.artcl_info || [],
                },
            })
        )
    );

    // 항목분류 코드 - 기본항목 / 커스텀항목 / 기타항목
    const [artclSeCd, setArtclSeCd] = useState<Array<any>>([]);
    // 입력항목속성 코드 - text, combo 등
    const [typeCd, setTypeCd] = useState<Array<any>>([]);

    // 초기 데이터 로드
    useEffect(() => {
        // 항목분류 코드 가져오기
        fetcherPostCmcd({ group_cd: 'hpo_group01026', rprs_ognz_no: 'COMGRP' })
            .then((response) => {
                setArtclSeCd(response);
            })
            .catch((error) => console.error('항목분류 코드 로딩 오류:', error));

        // 입력항목속성 코드 가져오기
        fetcherPostCmcd({ group_cd: 'hpo_group01027', rprs_ognz_no: 'COMGRP' })
            .then((response) => {
                setTypeCd(response);
            })
            .catch((error) => console.error('입력항목속성 코드 로딩 오류:', error));
    }, []);

    // params 변경 시 settingData 업데이트
    useEffect(() => {
        setSettingData(
            JSON.parse(
                JSON.stringify({
                    ...params,
                    setting_info: {
                        ...(params?.setting_info || {}),
                        artcl_info: params?.setting_info?.artcl_info || [],
                    },
                })
            )
        );
    }, [params]);
    // 항목속성 콤보박스값 변경 - 기본항목, 커스텀항목
    const handleTypeChange = (artclId: string, newValue: string) => {
        setSettingData((prevSettingData: any) => {
            const updatedDocArtclInfo = prevSettingData.setting_info.artcl_info.map((item: any) =>
                item.key === artclId ? { ...item, type_cd: newValue } : item
            );

            return {
                ...prevSettingData,
                setting_info: {
                    ...prevSettingData.setting_info,
                    artcl_info: updatedDocArtclInfo,
                },
            };
        });
    };

    // 필수항목 체크박스 - 기본항목, 커스텀항목
    const handleEsntlArtclChange = (artclId: string) => {
        setSettingData((prevSettingData: any) => {
            const updatedDocArtclInfo = prevSettingData.setting_info.artcl_info.map((item: any) =>
                item.key === artclId ? { ...item, esntl_artcl: item.esntl_artcl === 'Y' ? 'N' : 'Y' } : item
            );

            return {
                ...prevSettingData,
                setting_info: {
                    ...prevSettingData.setting_info,
                    artcl_info: updatedDocArtclInfo,
                },
            };
        });
    };

    // 사용여부 체크박스 - 기본항목, 커스텀항목
    const handleUseYnChange = (artclId: string) => {
        setSettingData((prevSettingData: any) => {
            const updatedDocArtclInfo = prevSettingData.setting_info.artcl_info.map((item: any) =>
                item.key === artclId ? { ...item, use_yn: item.use_yn === 'Y' ? 'N' : 'Y' } : item
            );

            return {
                ...prevSettingData,
                setting_info: {
                    ...prevSettingData.setting_info,
                    artcl_info: updatedDocArtclInfo,
                },
            };
        });
    };

    // 적용 - 데이터 저장
    const updateItem = () => {
        // 저장 데이터 준비
        const params = [];

        // 컴포넌트정보 설정
        const updatedSettingInfo = {
            ...settingData.setting_info,
            action_type: 'U',
            scr_no: tpcdParam,
            work_user_no: user_no,
            rprs_ognz_no: rprs_ognz_no,
        };

        params.push(updatedSettingInfo);

        // API 호출
        const items = [
            {
                sqlId: 0,
                params: params,
            },
        ];

        fetcherPostCommonSave(items)
            .then((response) => {
                alert('성공하였습니다.');
                // 성공 시 모달 닫고 부모 컴포넌트에 재조회 신호 전달
                setParams((prev: any) => ({
                    ...prev,
                    open: false,
                    needRefresh: true, // 부모 컴포넌트에 재조회 신호
                }));
            })
            .catch((error) => {
                alert('오류가 발생하였습니다.');
                console.error(error);
            });
    };

    // 미리보기
    const previewItem = () => {
        // 미리보기 기능 구현
        console.log('미리보기 데이터:', settingData);
    };

    // 커스텀항목 추가
    const addCustomItem = () => {
        setSettingData((prevSettingData: any) => {
            // 기존 커스텀 항목 중 key의 최대값 찾기
            const existingCustomItems = prevSettingData.setting_info.artcl_info.filter(
                (item: any) => item.artcl_se_cd === 'hpo_group01026_cm0003'
            );

            // 최대 nm 값 추출 및 증가
            const maxNm = Math.max(
                ...existingCustomItems
                    .map((item: any) => {
                        const match = item.nm.match(/custom(\d+)/);
                        return match ? parseInt(match[1], 10) : 0;
                    })
                    .filter((num: number) => !isNaN(num)),
                0
            );

            // 새로운 커스텀 항목 생성
            const newCustomItem = {
                artcl_se_cd: 'hpo_group01026_cm0003',
                esntl_artcl: 'Y',
                esntl_artcl_dflt: 'N',
                excl_psblty_yn: 'Y',
                key: randomId(),
                nm: `custom${maxNm + 1}`,
                selected: 'N',
                type_cd: 'hpo_group01027_cm0001',
                use_yn: 'Y',
            };

            return {
                ...prevSettingData,
                setting_info: {
                    ...prevSettingData.setting_info,
                    artcl_info: [...prevSettingData.setting_info.artcl_info, newCustomItem],
                },
            };
        });
    };

    // 커스텀항목 삭제
    const deleteCustomItem = () => {
        setSettingData((prevSettingData: any) => {
            // 선택된 커스텀 항목 삭제
            const updatedDocArtclInfo = prevSettingData.setting_info.artcl_info.filter(
                (item: any) => !(item.artcl_se_cd === 'hpo_group01026_cm0003' && item.selected === 'Y')
            );

            return {
                ...prevSettingData,
                setting_info: {
                    ...prevSettingData.setting_info,
                    artcl_info: updatedDocArtclInfo,
                },
            };
        });
    };

    // 모달 닫기
    const handleClose = () => {
        setParams((prev: any) => ({
            ...prev,
            open: !open,
        }));
    };

    return (
        <SwModal fullScreen size='full' open={open} closeButton={false} className={styles.editTemplate}>
            {/* 헤더 영역 */}
            <div className='modalBar'>
                <div className='tit'>
                    <IconButton color='inherit' onClick={handleClose} aria-label='close'>
                        <IcoClose fill='#fff' />
                    </IconButton>
                    {params?.setting_info?.doc_knd_cd_nm || '제목'}
                </div>
                <div className='btnOptions'>
                    <Button type='text' onClick={previewItem} className='btnWithIcon'>
                        <IcoPreview fill='#fff' />
                        미리보기
                    </Button>
                    <Button type='text' onClick={updateItem} className='btnWithIcon'>
                        <IcoCheck fill='#fff' />
                        적용
                    </Button>
                </div>
            </div>
            {/* 본문 영역 */}
            <div className={styles.context}>
                {/* 기본항목 섹션 */}
                <SettingBasicArticleSection
                    artclSeCd={artclSeCd}
                    settingData={settingData}
                    typeCd={typeCd}
                    handleTypeChange={handleTypeChange}
                    handleEsntlArtclChange={handleEsntlArtclChange}
                    handleUseYnChange={handleUseYnChange}
                />

                {/* 커스텀항목 섹션 */}
                <SettingCustomArticleSection
                    artclSeCd={artclSeCd}
                    settingData={settingData}
                    typeCd={typeCd}
                    handleTypeChange={handleTypeChange}
                    handleEsntlArtclChange={handleEsntlArtclChange}
                    handleUseYnChange={handleUseYnChange}
                    addCustomItem={addCustomItem}
                    deleteCustomItem={deleteCustomItem}
                    setSettingData={setSettingData}
                />

                {/* 기타항목 섹션 */}
                <SettingEtcArticleSection
                    artclSeCd={artclSeCd}
                    settingData={settingData}
                    typeCd={typeCd}
                    setSettingData={setSettingData}
                />
            </div>
        </SwModal>
    );
};

export default EfsSettingFullDialog;
