'use client';
import React from 'react';
import BoxSelect from 'components/BoxSelect';
import Checkbox from 'components/Checkbox';
import styles from '../../../styles/pages/Template/page.module.scss';
import Switch from 'components/Switch';

interface SettingArticleItemProps {
    article: {
        key: string;
        artcl_se_cd: string;
        nm: string;
        excl_psblty_yn: string;
        type_cd: string;
        esntl_artcl: string;
        use_yn: string;
        [key: string]: any;
    };
    typeCd: Array<{ value: string; label: string; [key: string]: any }> | undefined;
    onTypeChange: (artclId: string, value: string) => void;
    onEsntlChange: (artclId: string) => void;
    onUseYnChange: (artclId: string) => void;
}

const SettingArticleItem: React.FC<SettingArticleItemProps> = ({
    article,
    typeCd,
    onTypeChange,
    onEsntlChange,
    onUseYnChange,
}) => {
    return (
        <div className={styles.formItem}>
            <BoxSelect
                id={article.key}
                placeholder='선택하지 않음'
                label={article.artcl_se_cd !== 'hpo_group01026_cm0003' && article.nm}
                asterisk={false}
                value={article.type_cd || ''}
                onChange={(e) => onTypeChange(article.key, e.target.value)}
                options={typeCd?.map((item) => ({
                    value: item.com_cd,
                    label: item.com_cd_nm,
                }))}
                className={styles.item}
            />
            {article.excl_psblty_yn === 'Y' && (
                <div className={styles.chkOption}>
                    <Checkbox
                        id={`esntl_${article.key}`}
                        label={'필수'}
                        checked={article.esntl_artcl === 'Y'}
                        value={'Y'}
                        onChange={() => onEsntlChange(article.key)}
                    />
                    <Switch
                        id={`use_yn_${article.key}`}
                        checked={article.use_yn === 'Y'}
                        onChange={() => onUseYnChange(article.key)}
                        className={styles.switch}
                        size='small'
                    />
                    <label htmlFor={`use_yn_${article.key}`} className={styles.label}>
                        사용
                    </label>
                </div>
            )}
        </div>
    );
};

export default SettingArticleItem;
