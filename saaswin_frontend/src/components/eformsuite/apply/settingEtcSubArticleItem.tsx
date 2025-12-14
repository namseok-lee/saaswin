'use client';
import React from 'react';
import BoxSelect from 'components/BoxSelect';
import Checkbox from 'components/Checkbox';
import styles from '../../../styles/pages/Template/page.module.scss';

interface Article {
    key: string;
    nm: string;
    type_cd: string;
    use_yn: string;
    esntl_yn: string;
    value: string;
    [key: string]: any;
}

interface EtcOption {
    key: string;
    use_yn: string;
    [key: string]: any;
}

interface SettingEtcSubArticleItemProps {
    artcl: Article;
    etc_option: EtcOption;
    typeCd: Array<{ value: string; label: string; [key: string]: any }> | undefined;
    setSettingData: React.Dispatch<React.SetStateAction<any>>;
}

const SettingEtcSubArticleItem: React.FC<SettingEtcSubArticleItemProps> = ({
    artcl,
    etc_option,
    typeCd,
    setSettingData,
}) => {
    // 값 처리 핸들러
    const handleValueChange = (selectedValue: any) => {
        const value = selectedValue.target ? selectedValue.target.value : selectedValue;

        setSettingData((prevSettingData: any) => {
            const updatedDocArtclInfo = prevSettingData.setting_info.artcl_info.map((item: any) => {
                if (item.artcl_se_cd === 'hpo_group01026_cm0002') {
                    const updatedEtcOptions = item.etc_options.map((option: any) => {
                        if (!option.artcl) return option;

                        const updatedArtcl = option.artcl.map((a: any) =>
                            a && a.key === artcl.key
                                ? {
                                      ...a,
                                      [artcl.key === 'uld_qntt_lmt' ? 'value' : 'type_cd']: value,
                                  }
                                : a
                        );

                        return {
                            ...option,
                            artcl: updatedArtcl,
                        };
                    });

                    return {
                        ...item,
                        etc_options: updatedEtcOptions,
                    };
                }
                return item;
            });

            return {
                ...prevSettingData,
                setting_info: {
                    ...prevSettingData.setting_info,
                    artcl_info: updatedDocArtclInfo,
                },
            };
        });
    };

    // 체크박스 상태 변경 핸들러
    const handleCheckboxChange = (type: string) => {
        setSettingData((prevSettingData: any) => {
            const updatedDocArtclInfo = prevSettingData.setting_info.artcl_info.map((item: any) => {
                if (item.artcl_se_cd === 'hpo_group01026_cm0002') {
                    const updatedEtcOptions = item.etc_options.map((option: any) => {
                        if (!option.artcl) return option;

                        const updatedArtcl = option.artcl.map((a: any) =>
                            a && a.key === artcl.key
                                ? {
                                      ...a,
                                      [type]: a[type] === 'Y' ? 'N' : 'Y',
                                  }
                                : a
                        );

                        return {
                            ...option,
                            artcl: updatedArtcl,
                        };
                    });

                    return {
                        ...item,
                        etc_options: updatedEtcOptions,
                    };
                }
                return item;
            });

            return {
                ...prevSettingData,
                setting_info: {
                    ...prevSettingData.setting_info,
                    artcl_info: updatedDocArtclInfo,
                },
            };
        });
    };

    // 사용여부 또는 필수항목 체크박스 렌더링
    const renderCheckbox = () => {
        if (artcl.key === 'flco_cal') {
            return (
                <Checkbox
                    id={`use_yn_${artcl.key}`}
                    label={'사용여부'}
                    checked={artcl.use_yn === 'Y'}
                    value={'Y'}
                    onChange={() => handleCheckboxChange('use_yn')}
                    disabled={etc_option.use_yn !== 'Y'}
                />
            );
        } else {
            return (
                <Checkbox
                    id={`esntl_yn_${artcl.key}`}
                    label={'필수'}
                    checked={artcl.esntl_yn === 'Y'}
                    value={'Y'}
                    onChange={() => handleCheckboxChange('esntl_yn')}
                    disabled={etc_option.use_yn !== 'Y'}
                />
            );
        }
    };

    // 옵션 설정
    const getOptions = () => {
        if (artcl.key === 'uld_qntt_lmt') {
            return [1, 2, 3, 4, 5].map((num) => ({
                value: num.toString(),
                label: num.toString(),
            }));
        } else {
            return (
                typeCd?.map((type) => ({
                    value: type.com_cd,
                    label: type.com_cd_nm,
                })) || []
            );
        }
    };

    return (
        <>
            <td>{artcl.nm || '이름 없음'}</td>
            <td>
                <BoxSelect
                    id={artcl.key}
                    placeholder='선택하지 않음'
                    asterisk={false}
                    validationText=''
                    value={artcl.key === 'uld_qntt_lmt' ? artcl.value || '' : artcl.type_cd || ''}
                    onChange={handleValueChange}
                    options={getOptions()}
                    disabled={etc_option.use_yn !== 'Y'}
                    vertical
                    className={styles.item}
                />
            </td>
            <td> {renderCheckbox()}</td>
        </>
    );
};

export default SettingEtcSubArticleItem;
