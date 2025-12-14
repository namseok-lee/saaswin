'use client';
import React from 'react';
import { IcoEdit } from '@/assets/Icon';
import styles from '../../../styles/pages/Template/page.module.scss';
import SettingArticleItem from './settingArticleItem';

interface SettingBasicArticleSectionProps {
    artclSeCd: Array<{ value: string; label: string; [key: string]: any }> | undefined;
    settingData: {
        setting_info?: {
            artcl_info?: Array<{
                artcl_se_cd: string;
                key: string;
                [key: string]: any;
            }>;
            [key: string]: any;
        };
        [key: string]: any;
    };
    typeCd: Array<{ value: string; label: string; [key: string]: any }> | undefined;
    handleTypeChange: (artclId: string, value: string) => void;
    handleEsntlArtclChange: (artclId: string) => void;
    handleUseYnChange: (artclId: string) => void;
}

const SettingBasicArticleSection: React.FC<SettingBasicArticleSectionProps> = ({
    artclSeCd,
    settingData,
    typeCd,
    handleTypeChange,
    handleEsntlArtclChange,
    handleUseYnChange,
}) => {
    return (
        <section className={styles.section}>
            {artclSeCd
                ?.filter((artcl_se_cd) => artcl_se_cd.com_cd === 'hpo_group01026_cm0001')
                .map((artcl_se_cd, index) => (
                    <div key={index}>
                        <div className={styles.sectionTit}>
                            <span className={styles.ico}>
                                <IcoEdit fill='#1CAC70' />
                            </span>
                            {artcl_se_cd.com_cd_nm}
                        </div>
                        <div className={styles.formCont}>
                            {settingData?.setting_info?.artcl_info
                                ?.filter((artcl_info) => artcl_info.artcl_se_cd === artcl_se_cd.com_cd)
                                .map((article, innerIndex) => (
                                    <SettingArticleItem
                                        key={innerIndex}
                                        article={article}
                                        typeCd={typeCd}
                                        onTypeChange={handleTypeChange}
                                        onEsntlChange={handleEsntlArtclChange}
                                        onUseYnChange={handleUseYnChange}
                                    />
                                ))}
                        </div>
                    </div>
                ))}
        </section>
    );
};

export default SettingBasicArticleSection;
