'use client';
import React from 'react';
import { IcoEdit } from '@/assets/Icon';
import Button from 'components/Button';
import Checkbox from 'components/Checkbox';
import InputTextBox from '@/components/InputTextBox';
import styles from '../../../styles/pages/Template/page.module.scss';
import SettingArticleItem from './settingArticleItem';

interface Article {
    key: string;
    artcl_se_cd: string;
    nm: string;
    selected: string;
    type_cd: string;
    esntl_artcl: string;
    use_yn: string;
    [key: string]: any;
}

interface SettingCustomArticleSectionProps {
    artclSeCd: Array<{ value: string; label: string; [key: string]: any }> | undefined;
    settingData: {
        setting_info?: {
            artcl_info?: Array<Article>;
            [key: string]: any;
        };
        [key: string]: any;
    };
    typeCd: Array<{ value: string; label: string; [key: string]: any }> | undefined;
    handleTypeChange: (artclId: string, value: string) => void;
    handleEsntlArtclChange: (artclId: string) => void;
    handleUseYnChange: (artclId: string) => void;
    addCustomItem: () => void;
    deleteCustomItem: () => void;
    setSettingData: React.Dispatch<React.SetStateAction<any>>;
}

// 커스텀항목 선택 핸들러
const handleCustomItemSelection = (article: Article, setSettingData: React.Dispatch<React.SetStateAction<any>>) => {
    setSettingData((prevSettingData: any) => {
        const updatedDocArtclInfo = prevSettingData.setting_info.artcl_info.map((item: Article) => {
            if (item.key === article.key) {
                return {
                    ...item,
                    selected: item.selected === 'Y' ? 'N' : 'Y',
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

// 커스텀항목 이름 변경 핸들러
const handleCustomItemNameChange = (
    article: Article,
    newName: string,
    setSettingData: React.Dispatch<React.SetStateAction<any>>
) => {
    setSettingData((prevSettingData: any) => {
        const updatedDocArtclInfo = prevSettingData.setting_info.artcl_info.map((item: Article) =>
            item.key === article.key ? { ...item, nm: newName } : item
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

const SettingCustomArticleSection: React.FC<SettingCustomArticleSectionProps> = ({
    artclSeCd,
    settingData,
    typeCd,
    handleTypeChange,
    handleEsntlArtclChange,
    handleUseYnChange,
    addCustomItem,
    deleteCustomItem,
    setSettingData,
}) => (
    <section className={styles.section}>
        {artclSeCd
            ?.filter((artcl_se_cd) => artcl_se_cd.com_cd === 'hpo_group01026_cm0003')
            .map((artcl_se_cd, index) => {
                const filteredArticles = settingData?.setting_info?.artcl_info?.filter(
                    (artcl_info) => artcl_info.artcl_se_cd === artcl_se_cd.com_cd
                );

                return (
                    <div key={index}>
                        <div className={styles.sectionTit}>
                            <span className={styles.ico}>
                                <IcoEdit fill='#1CAC70' />
                            </span>
                            {artcl_se_cd.com_cd_nm}
                            <div className={styles.btnOptions}>
                                <Button type='default' size='sm' onClick={deleteCustomItem}>
                                    삭제
                                </Button>
                                <Button type='primary' size='sm' onClick={addCustomItem}>
                                    추가
                                </Button>
                            </div>
                        </div>
                        <p></p>

                        <div className={`${styles.formCont}`}>
                            {filteredArticles && filteredArticles.length > 0 ? (
                                filteredArticles.map((article) => (
                                    <div key={article.key} className={styles.custom}>
                                        <div className={styles.customInput}>
                                            <Checkbox
                                                id={`select_${article.key}`}
                                                checked={article.selected === 'Y'}
                                                value={'Y'}
                                                onChange={() => handleCustomItemSelection(article, setSettingData)}
                                            />
                                            <InputTextBox
                                                type='text'
                                                placeholder='직접 입력(문자)'
                                                validationText=''
                                                value={article.nm}
                                                onChange={(e) =>
                                                    handleCustomItemNameChange(article, e.target.value, setSettingData)
                                                }
                                                onDelete={() => handleCustomItemNameChange(article, '', setSettingData)}
                                                className={styles.input}
                                            />
                                        </div>
                                        <SettingArticleItem
                                            article={article}
                                            typeCd={typeCd}
                                            onTypeChange={handleTypeChange}
                                            onEsntlChange={handleEsntlArtclChange}
                                            onUseYnChange={handleUseYnChange}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div>추가된 항목이 없습니다.</div>
                            )}
                        </div>
                    </div>
                );
            })}
    </section>
);

export default SettingCustomArticleSection;
