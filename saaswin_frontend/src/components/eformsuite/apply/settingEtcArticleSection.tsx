'use client';
import React, { useState } from 'react';
import BoxSelect from 'components/BoxSelect';
import Typography from 'components/Typography';
import { IcoEdit } from '@/assets/Icon';
import styles from '../../../styles/pages/Template/page.module.scss';
import SettingEtcSubArticleItem from './settingEtcSubArticleItem';
import InputTextBox from '@/components/InputTextBox';
import Switch from 'components/Switch';

interface SettingEtcArticleSectionProps {
    artclSeCd: Array<{ value: string; label: string; [key: string]: any }> | undefined;
    settingData: {
        setting_info?: {
            artcl_info?: Array<{
                artcl_se_cd: string;
                etc_options?: Array<{
                    key: string;
                    nm: string;
                    use_yn: string;
                    artcl?: Array<{
                        key: string;
                        nm: string;
                        use_yn: string;
                        [key: string]: any;
                    } | null>;
                    [key: string]: any;
                }>;
                [key: string]: any;
            }>;
            [key: string]: any;
        };
        [key: string]: any;
    };
    typeCd: Array<{ value: string; label: string; [key: string]: any }> | undefined;
    setSettingData: React.Dispatch<React.SetStateAction<any>>;
}

const SettingEtcArticleSection: React.FC<SettingEtcArticleSectionProps> = ({
    artclSeCd,
    settingData,
    typeCd,
    setSettingData,
}) => {
    // 기타옵션 사용여부 변경 핸들러
    const handleEtcOptionUseYnChange = (etc_option: { key: string; [key: string]: any }) => {
        setSettingData((prevSettingData: any) => {
            const updatedDocArtclInfo = prevSettingData.setting_info.artcl_info.map((item: any) => {
                if (item.artcl_se_cd === 'hpo_group01026_cm0002') {
                    const updatedEtcOptions = item.etc_options.map((option: any) =>
                        option.key === etc_option.key
                            ? {
                                  ...option,
                                  use_yn: option.use_yn === 'Y' ? 'N' : 'Y',
                              }
                            : option
                    );
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
    const handleCheckboxChange = (artclKey: string, type: string) => {
        setSettingData((prevSettingData: any) => {
            const updatedDocArtclInfo = prevSettingData.setting_info.artcl_info.map((item: any) => {
                if (item.artcl_se_cd === 'hpo_group01026_cm0002') {
                    const updatedEtcOptions = item.etc_options.map((option: any) => {
                        if (!option.artcl) return option;

                        const updatedArtcl = option.artcl.map((a: any) =>
                            a && a.key === artclKey
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
    // 첨부파일 사용여부 변경 핸들러
    const handleFileUseYnChange = () => {
        setSettingData((prevSettingData: any) => {
            // 첨부파일 설정이 있는지 확인
            const fileItem = prevSettingData.setting_info.artcl_info.find(
                (item: any) => item.artcl_se_cd === 'hpo_group01026_cm0004'
            );

            if (fileItem) {
                // 기존 항목 업데이트
                const updatedDocArtclInfo = prevSettingData.setting_info.artcl_info.map((item: any) =>
                    item.artcl_se_cd === 'hpo_group01026_cm0004'
                        ? { ...item, use_yn: item.use_yn === 'Y' ? 'N' : 'Y' }
                        : item
                );

                return {
                    ...prevSettingData,
                    setting_info: {
                        ...prevSettingData.setting_info,
                        artcl_info: updatedDocArtclInfo,
                    },
                };
            } else {
                // 첨부파일 항목 새로 추가
                const newFileItem = {
                    artcl_se_cd: 'hpo_group01026_cm0004',
                    key: 'atch_file',
                    nm: '첨부파일',
                    use_yn: 'Y',
                    value: '5', // 기본 첨부파일 개수 제한
                };

                return {
                    ...prevSettingData,
                    setting_info: {
                        ...prevSettingData.setting_info,
                        artcl_info: [...prevSettingData.setting_info.artcl_info, newFileItem],
                    },
                };
            }
        });
    };

    // 첨부파일 개수 제한 변경 핸들러
    const handleFileCountChange = (value: string) => {
        setSettingData((prevSettingData: any) => {
            // 첨부파일 설정이 있는지 확인
            const fileItemIndex = prevSettingData.setting_info.artcl_info.findIndex(
                (item: any) => item.artcl_se_cd === 'hpo_group01026_cm0004'
            );

            if (fileItemIndex !== -1) {
                // 기존 항목 업데이트
                const updatedDocArtclInfo = [...prevSettingData.setting_info.artcl_info];
                updatedDocArtclInfo[fileItemIndex] = {
                    ...updatedDocArtclInfo[fileItemIndex],
                    value: value,
                };

                return {
                    ...prevSettingData,
                    setting_info: {
                        ...prevSettingData.setting_info,
                        artcl_info: updatedDocArtclInfo,
                    },
                };
            } else {
                // 첨부파일 항목 새로 추가
                const newFileItem = {
                    artcl_se_cd: 'hpo_group01026_cm0004',
                    key: 'atch_file',
                    nm: '첨부파일',
                    use_yn: 'Y',
                    value: value,
                };

                return {
                    ...prevSettingData,
                    setting_info: {
                        ...prevSettingData.setting_info,
                        artcl_info: [...prevSettingData.setting_info.artcl_info, newFileItem],
                    },
                };
            }
        });
    };

    // 첨부파일 정보 가져오기
    const getFileItem = () => {
        return (
            settingData?.setting_info?.artcl_info?.find((item) => item.artcl_se_cd === 'hpo_group01026_cm0004') || {
                use_yn: 'Y',
                value: '5',
            }
        );
    };

    const [inputValues, setInputValues] = useState({
        test1: '',
    });

    const [valid, setValid] = useState(false);
    const [validText, setValidText] = useState('');

    // input 값 변경
    const handleDropdownValueChange = (artclKey: string, newValue: string) => {
        console.log('handleDropdownValueChange', artclKey, newValue);

        // 유효성 검사 (필요한 경우)
        if (newValue === '1234') {
            setValid(true);
            setValidText('잘못입력함');
        } else {
            setValid(false);
            setValidText('');
        }

        // 로컬 상태 업데이트
        setInputValues((prev) => ({ ...prev, [artclKey]: newValue }));

        // 부모 컴포넌트의 settingData 상태 업데이트
        setSettingData((prevData: any) => {
            // 깊은 복사
            const newData = JSON.parse(JSON.stringify(prevData));

            // artcl_se_cd가 'hpo_group01026_cm0002'인 항목 찾기
            const etcItemIndex = newData.setting_info.artcl_info.findIndex(
                (item: any) => item.artcl_se_cd === 'hpo_group01026_cm0002'
            );

            if (etcItemIndex === -1) return prevData; // 찾지 못한 경우 원래 데이터 반환

            // 각 etc_options 순회
            for (let i = 0; i < newData.setting_info.artcl_info[etcItemIndex].etc_options.length; i++) {
                const option = newData.setting_info.artcl_info[etcItemIndex].etc_options[i];

                if (!option.artcl) continue;

                // 각 artcl 순회하며 찾기
                for (let j = 0; j < option.artcl.length; j++) {
                    const artcl = option.artcl[j];

                    if (artcl && artcl.key === artclKey) {
                        // 값 업데이트
                        newData.setting_info.artcl_info[etcItemIndex].etc_options[i].artcl[j].value = newValue;
                    }
                }
            }

            return newData;
        });
    };

    // input 삭제 핸들러
    const handleDelete = (id: string) => {
        setValid(false);
        setValidText('');
        setInputValues((prev) => ({ ...prev, [id]: '' }));
    };

    return (
        <section className={styles.section}>
            {artclSeCd
                ?.filter((artcl_se_cd) => artcl_se_cd.com_cd === 'hpo_group01026_cm0002')
                ?.map((artcl_se_cd, index) => (
                    <div key={index}>
                        <div className={styles.sectionTit}>
                            <span className={styles.ico}>
                                <IcoEdit fill='#1CAC70' />
                            </span>
                            기타항목
                        </div>
                        <div className={styles.formCont}>
                            {settingData?.setting_info?.artcl_info
                                ?.filter((artcl_info) => artcl_info.artcl_se_cd === artcl_se_cd.com_cd)
                                .map((filtered_artcl_info, outerIndex, filteredArray) => {
                                    // 마지막인지 확인
                                    const isLastItem = outerIndex === filteredArray.length - 1;
                                    const fileItem = getFileItem();

                                    return (
                                        <div key={outerIndex} className={styles.etc}>
                                            {filtered_artcl_info.etc_options?.map((etc_option, etcIndex) => (
                                                <div key={etcIndex} className={styles.part}>
                                                    <div className={styles.chkOption}>
                                                        <div className={styles.title}>
                                                            <Typography type='section'>{etc_option.nm}</Typography>
                                                            <Switch
                                                                id={`use_yn_${etc_option.key}`}
                                                                checked={etc_option.use_yn === 'Y'}
                                                                onChange={() => handleEtcOptionUseYnChange(etc_option)}
                                                                className={styles.switch}
                                                                size='small'
                                                            />
                                                        </div>
                                                    </div>

                                                    {etc_option.artcl && etc_option.artcl.length > 0 && (
                                                        <table className='tbl'>
                                                            <colgroup>
                                                                <col style={{ width: '33.3%' }}></col>
                                                                <col style={{ width: '33.3%' }}></col>
                                                                <col style={{ width: '33.3%' }}></col>
                                                            </colgroup>
                                                            <thead>
                                                                <tr>
                                                                    <th>헤더 항목 명</th>
                                                                    <th>타입</th>
                                                                    <th>입력 필수</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {etc_option.artcl.map(
                                                                    (artcl, artclIndex) =>
                                                                        artcl &&
                                                                        artcl.key !== 'flco_cal' &&
                                                                        etc_option.use_yn === 'Y' && (
                                                                            <tr key={artclIndex}>
                                                                                <SettingEtcSubArticleItem
                                                                                    artcl={artcl}
                                                                                    etc_option={etc_option}
                                                                                    typeCd={typeCd}
                                                                                    setSettingData={setSettingData}
                                                                                />
                                                                            </tr>
                                                                        )
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    )}

                                                    {/* 드롭다운 항목정의 */}
                                                    {etc_option.artcl &&
                                                        etc_option.artcl.length > 0 &&
                                                        etc_option.artcl.map(
                                                            (artcl, artclIndex) =>
                                                                artcl &&
                                                                artcl.type_cd === 'hpo_group01027_cm0011' && (
                                                                    <div className={styles.tblFooter} key={artclIndex}>
                                                                        <label
                                                                            htmlFor={`input_${artcl.key}`}
                                                                            className='label'
                                                                        >
                                                                            {artcl.nm}
                                                                        </label>
                                                                        <InputTextBox
                                                                            type='text'
                                                                            id={`input_${artcl.key}`}
                                                                            placeholder="드롭다운에 나타날 항목을 ','로 분리하여 입력해주세요."
                                                                            validationText={valid ? validText : ''}
                                                                            value={artcl.value || ''}
                                                                            onChange={(e) =>
                                                                                handleDropdownValueChange(
                                                                                    artcl.key,
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                            onDelete={() =>
                                                                                handleDropdownValueChange(artcl.key, '')
                                                                            }
                                                                            disabled={etc_option.use_yn !== 'Y'}
                                                                        />
                                                                    </div>
                                                                )
                                                        )}
                                                    {/* artcl.key === 'flco_cal' 유류비 */}
                                                    {etc_option.artcl &&
                                                        etc_option.artcl.length > 0 &&
                                                        etc_option.artcl.map(
                                                            (artcl, artclIndex) =>
                                                                artcl &&
                                                                artcl.key === 'flco_cal' &&
                                                                etc_option.use_yn === 'Y' && (
                                                                    <div className={styles.tblHeader} key={artclIndex}>
                                                                        <Typography type='section'>
                                                                            {artcl.nm}
                                                                        </Typography>
                                                                        <Switch
                                                                            id={`use_yn_${artcl.key}`}
                                                                            checked={artcl.use_yn === 'Y'}
                                                                            onChange={() =>
                                                                                handleCheckboxChange(
                                                                                    artcl.key,
                                                                                    'use_yn'
                                                                                )
                                                                            }
                                                                            className={styles.switch}
                                                                            size='small'
                                                                            disabled={etc_option.use_yn !== 'Y'}
                                                                        />
                                                                        <label
                                                                            htmlFor={`use_yn_${artcl.key}`}
                                                                            className={`${styles.label}`}
                                                                        >
                                                                            사용
                                                                        </label>
                                                                    </div>
                                                                )
                                                        )}
                                                </div>
                                            ))}

                                            {/* 첨부파일 - 마지막 항목에서만 렌더링 */}
                                            {isLastItem && (
                                                <div className={styles.part}>
                                                    <div className={styles.chkOption}>
                                                        <div className={styles.title}>
                                                            <Typography type='section'>첨부파일</Typography>
                                                            <Switch
                                                                id='file_use_yn'
                                                                checked={fileItem.use_yn === 'Y'}
                                                                onChange={handleFileUseYnChange}
                                                                className={styles.switch}
                                                                size='small'
                                                            />
                                                        </div>
                                                    </div>

                                                    <BoxSelect
                                                        placeholder='선택하지 않음'
                                                        label='업로드 개수 제한'
                                                        validationText=''
                                                        onChange={(e) => handleFileCountChange(e.target.value)}
                                                        options={[
                                                            { value: '1', label: '1' },
                                                            { value: '2', label: '2' },
                                                            { value: '3', label: '3' },
                                                            { value: '4', label: '4' },
                                                            { value: '5', label: '5' },
                                                        ]}
                                                        vertical
                                                        value={fileItem.value || '5'}
                                                        className={styles.select}
                                                        disabled={fileItem.use_yn !== 'Y'}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                ))}
        </section>
    );
};

export default SettingEtcArticleSection;
