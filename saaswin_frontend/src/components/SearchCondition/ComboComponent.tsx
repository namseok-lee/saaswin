'use client';
import { FormControl, InputLabel } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetcherPostCmcd } from 'utils/axios';
import { componentProps } from '../../types/component/SearchCondition';
import BoxSelect from 'components/BoxSelect';

const ComboComponent = ({
    item,
    uniqueKey,
    sendDataItem,
    handleChange,
    visible,
    selectboxProps,
    onReady, // 변경됨
    multiple,
}: componentProps) => {
    // 다국어
    const { t } = useTranslation();
    const auth = JSON.parse(localStorage.getItem('auth'));
    const rprsOgnzNo = auth?.state?.rprsOgnzNo ?? '';

    const groupCd = item.sqlId.split('||')[0];
    const rprsKey = item.sqlId.split('||')[1] || rprsOgnzNo;

    const [comboData, setComboData] = useState([]);
    const [selectedValue, setSeletedValue] = useState('');
    const [selectedMultiValue, setSeletedMultiValue] = useState([]);
    const [loadingComplete, setLoadingComplete] = useState(false);

    // 데이터 로드 및 초기값 설정
    useEffect(() => {
        let isMounted = true;
        fetcherPostCmcd({ group_cd: groupCd, rprs_ognz_no: rprsKey })
            .then((response) => {
                if (!isMounted) return;
                const formattedOptions = response.map((item) => ({
                    value: item.com_cd,
                    label: item.com_cd_nm,
                }));
                setComboData(formattedOptions);

                // 초기값 설정
                let sendCd = '';
                let sendValue = '';

                if (response && response.length > 0) {
                    if (item.default === 'all') {
                        sendCd = '';
                        sendValue = '전체';
                    } else {
                        sendCd = response[0].com_cd;
                        sendValue = response[0].com_cd_nm;
                    }
                }

                if (multiple && item.default === 'all') {
                    const allValues = response.map((item) => item.com_cd);

                    handleChange(item.id, allValues, item.type, sendValue);
                    setSeletedMultiValue([...allValues, '']);
                } else {
                    handleChange(item.id, sendCd, item.type, sendValue);
                    setSeletedValue(sendCd);
                }

                setLoadingComplete(true);
                // onReady 콜백 호출
                if (onReady) {
                    onReady(item.id);
                }
            })
            .catch((error) => {
                console.error(`Error loading combo data for ${item.id}:`, error);
                if (!isMounted) return;

                // 오류 발생 시에도 로딩 완료 처리
                setLoadingComplete(true);

                // onReady 콜백 호출 (오류가 있어도)
                if (onReady) {
                    onReady(item.id);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    // 복수선택 select 전체선택 분기용 handler
    const multiSelectHandler = (value) => {
        const allValues = comboData.map((item) => item.value);
        const isNowAllSelected = value.includes(''); // 현재 누른 값에 전체가 포함되어있음
        const wasAllSelected = selectedMultiValue.includes(''); // 이미 전체가 포함되어있음

        if (isNowAllSelected && !wasAllSelected) {
            // 전체선택이 아닌상태에서 전체선택 체크
            setSeletedMultiValue([...allValues, '']);
        } else if (!isNowAllSelected && wasAllSelected) {
            // 전체선택 상태에서 전체 다시 선택(빈배열로 수정)
            setSeletedMultiValue([]);
        } else if (!isNowAllSelected && !wasAllSelected) {
            // 다른 코드 선택
            setSeletedMultiValue(value);
        } else if (isNowAllSelected && wasAllSelected) {
            // 다른 코드 선택
            setSeletedMultiValue(value.filter((v) => v !== ''));
        }
    };

    // 복수선택 시 render 옵션
    const MultiRenderValue = (selected: string[]) => {
        if (selected.includes('')) return '전체';
        if (selected.length === 0) return '선택 없음';
        return selected.map((code) => comboData.find((item) => item.value === code)?.label || code).join(', ');
    };

    useEffect(() => {
        handleChange(
            item.id,
            selectedMultiValue.filter((v) => v !== ''),
            'COMBO',
            comboData?.find((comboItem) => comboItem.value === selectedMultiValue[0])?.label
        );
    }, [selectedMultiValue]);

    useEffect(() => {
        console.log('Value just before Select:', selectedValue, typeof selectedValue);
    }, [selectedValue]);
    return (
        // 항상 렌더링하고, visible이 false면 CSS로 숨김 처리
        <div style={{ display: visible ? 'block' : 'none' }}>
            <div
                className={`selectBasicBox ${selectboxProps?.className} ${selectboxProps?.error ? 'error' : ''} ${
                    selectboxProps?.disabled ? 'disabled' : ''
                }`}
            >
                <div className='row'>
                    {/* {item.text && (
                        <label htmlFor={item.id} className='label'>
                            {t(item.text)}
                        </label>
                    )} */}
                    <div className='textWrap'>
                        <FormControl fullWidth>
                            {selectboxProps?.placeholder && (
                                <InputLabel id={`${item.id}-label`}>{selectboxProps?.placeholder}</InputLabel>
                            )}
                            <BoxSelect
                                id={`${item.id}-label`}
                                label={t(item.text) || item.text}
                                asterisk={item.required ?? false}
                                value={multiple ? selectedMultiValue || '' : selectedValue || ''}
                                onChange={(e) => {
                                    console.log('e', e.target.value);
                                    if (multiple) {
                                        multiSelectHandler(e.target.value);
                                    } else {
                                        setSeletedValue(e.target.value);
                                        handleChange(
                                            item.id,
                                            e.target.value,
                                            'COMBO',
                                            comboData?.find((comboItem) => comboItem.value === e.target.value)?.label
                                        );
                                    }
                                }}
                                renderValue={multiple ? MultiRenderValue : undefined}
                                displayEmpty={true}
                                options={comboData || []}
                                multiple={multiple}
                                disabled={selectboxProps?.disabled}
                                defaultValue={item.default}
                            />
                            {/* <Select
                                labelId={`${item.id}-label`}
                                id={item.id}
                                displayEmpty
                                value={multiple ? selectedMultiValue || '' : selectedValue || ''}
                                onChange={(e) => {
                                    if (multiple) {
                                        multiSelectHandler(e.target.value);
                                    } else {
                                        setSeletedValue(e.target.value);
                                        handleChange(
                                            item.id,
                                            e.target.value,
                                            'COMBO',
                                            comboData?.find((comboItem) => comboItem.com_cd === e.target.value)
                                                ?.com_cd_nm
                                        );
                                    }
                                }}
                                renderValue={multiple ? customRenderValue : undefined}
                                disabled={selectboxProps?.disabled}
                                multiple={multiple}
                            >
                                {item.default === 'all' ? <MenuItem value="">전체</MenuItem> : null}
                                {comboData && comboData.length > 0
                                    ? comboData.map((comboItem, index) => (
                                          <MenuItem key={index} value={comboItem.com_cd}>
                                              {comboItem.com_cd_nm}
                                          </MenuItem>
                                      ))
                                    : null}
                            </Select> */}
                        </FormControl>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComboComponent;
