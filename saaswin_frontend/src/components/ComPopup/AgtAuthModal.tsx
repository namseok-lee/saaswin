import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, FormControl, IconButton } from '@mui/material';
import Radio from 'components/Radio';
import RadioGroup from 'components/RadioGroup';
import CloseIcon from '@mui/icons-material/Close';
import Button from 'components/Button';
import { fetcherPostData } from 'utils/axios';
import Typography from 'components/Typography';
import SwModal from 'components/Modal';
import styles from '../../styles/pages/AgtAuthModal/page.module.scss';
import { IcoInfo } from '@/assets/Icon';

const AgtAuthModal = ({ open, onClose, params, setMasterRetrieve }) => {
    const [value, setValue] = useState('hpo_group01031_cm0001'); // 기본 선택

    const authHandler = () => {
        params.forEach((row) => {
            row.agt_dsgn_authrt_cd = value;
        });

        const keysToRemove = ['seq', 'isNew', 'cbox', 'id', 'hasChanged', 'status'];

        const filteredData = params?.map((obj) =>
            Object.fromEntries(
                Object.entries(obj).filter(([key]) => !keysToRemove.includes(key) && !key.includes('preValue'))
            )
        );

        const transformedData = filteredData.map((obj) => {
            // 각 객체의 키를 변환
            return Object.entries(obj).reduce((newObj, [key, value]) => {
                // | 문자가 있는지 확인
                const pipeIndex = key.indexOf('|');

                // | 문자가 있으면 그 이후의 문자열을 새 키로 사용, 없으면 원래 키 사용
                const newKey = pipeIndex !== -1 ? key.substring(pipeIndex + 1) : key;

                // 새 객체에 변환된 키와 원래 값을 추가
                newObj[newKey] = value;
                return newObj;
            }, {});
        });

        const items = [
            {
                sqlId: 'hrs_com01',
                sql_key: 'hrs_ognz_agt_update',
                params: [{ auth_info: transformedData }],
            },
        ];

        fetcherPostData(items)
            .then((response) => {
                setMasterRetrieve(true);
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                onClose();
            });
    };

    return (
        <SwModal open={open} onClose={onClose} title='대리인 지정 권한 변경' size='md' className={styles.agtAuth}>
            <div className={styles.msg}>
                <IcoInfo fill='var(--primary)' />
                조직장이 직접 대리인을 등록할 때 사용할 방식을 선택하세요
            </div>
            <FormControl component='fieldset'>
                <RadioGroup direction='vertical' className={styles.rdoGroup}>
                    <Radio
                        key='hpo_group01031_cm0001'
                        name='hpo_group01031'
                        id='hpo_group01031_cm0001'
                        label='관리자 승인 필요'
                        value='hpo_group01031_cm0001'
                        checked={value === 'hpo_group01031_cm0001' ? true : false}
                        onChange={() => setValue('hpo_group01031_cm0001')}
                    />
                    <Radio
                        key='hpo_group01031_cm0002'
                        name='hpo_group01031'
                        id='hpo_group01031_cm0002'
                        label='승인 없이 직접 등록'
                        value='hpo_group01031_cm0002'
                        checked={value === 'hpo_group01031_cm0002' ? true : false}
                        onChange={() => setValue('hpo_group01031_cm0002')}
                    />
                </RadioGroup>
            </FormControl>

            <div className={styles.caution}>
                총 {params.length}개 조직에 대해 ‘조직장의 대리인 지정 권한’을 변경하시겠습니까?
            </div>
            <div className='actions'>
                <Button id='close' key='close' size='lg' onClick={() => onClose()} className='btnDefault' size='sm'>
                    취소
                </Button>
                <Button id='confirm' key='confirm' size='lg' onClick={() => authHandler()} className='btnPrimary'>
                    확인
                </Button>
            </div>
        </SwModal>
    );
};

export default AgtAuthModal;
