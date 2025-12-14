'use client';

import { MenuItem, Select, Stack, TableCell } from '@mui/material';
import InputTextBox from '@/components/InputTextBox';
import Typography from 'components/Typography';
import { useEffect, useState } from 'react';
import { fetcherPostCommonSave, fetcherPostData } from 'utils/axios';
import CommonPopup from './CommonPopup';
import CustomButton from './CustomButton';
import '../../src/styles/component/crtrTable.scss';
import { useTranslation } from 'react-i18next';
import BoxSelect from './BoxSelect';
import Checkbox from './Checkbox';

interface CustomTableType {
    tableData: Record<string, any>;
    masterInfo: Array<Record<string, any>>;
    comboData: Record<string, any>;
    setMasterRetrieve: any;
    setCrtrRetrieve: any;
    crtrData: any;
}

interface SortBySeqBtnItem {
    api: string;
    seq: string;
    sql: string;
    sqlId: string;
    sqlKey: string;
    text: string;
    type: string;
}

export default function CrtrTable({
    masterInfo,
    tableData,
    comboData,
    setMasterRetrieve,
    setCrtrRetrieve,
    crtrData,
}: CustomTableType) {
    const [formData, setFormData] = useState(null);
    const [comModalData, setComModalData] = useState(null);
    const [comModalOpen, setComModalOpen] = useState(false);
    const [checked, setChecked] = useState({
        ognz_type: false,
        duty: false,
        jbttl: false,
        jbps: false,
        jbgd: false,
    });
    const tableInfo = masterInfo?.table_info || [];
    const tableButtonData = masterInfo?.table_btn_info || [];
    const tableTitleData = masterInfo?.table_tit_info || [];
    const hpoInfoData = crtrData && crtrData[0] ? crtrData[0].hpo_info : {};
    const btnInfo = {
        seq: '1',
        sqlId: 'hrs_com01',
        sqlKey: 'hrs_tsm_crtr_stng_cud',
        text: '저장',
        type: 'SAVE2',
    };

    // 다국어
    const { t } = useTranslation();

    const sortBySeqBtn: SortBySeqBtnItem[] = (tableButtonData || [])
        .slice()
        .sort((a: SortBySeqBtnItem, b: SortBySeqBtnItem) => Number(b.seq) - Number(a.seq));

    const handleChange = (id: string, value: any, type: string) => {
        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
    };

    const handleBtnClick = (item: SortBySeqBtnItem) => {
        if (item.type === 'SAVE') {
            handleBtn(item);
        } else if (item.type === 'SAVE2') {
            handleBtn2(item);
        }
    };

    const handleBtn = (item: SortBySeqBtnItem) => {
        // const totalRows = Object.entries(formData).map(([key, value]) => ({ [key]: value }));
        const updatedFormData = {
            ...formData,
            group_cd: 'hpo_group01032',
        };
        const items = [
            {
                sqlId: item.sqlId,
                sql_key: item.sqlKey,
                params: [{ crtr_info: [updatedFormData] }],
            },
        ];

        if (confirm('저장하시겠습니까?')) {
            const url =
                item.sqlId === '0'
                    ? process.env.NEXT_PUBLIC_SSW_COMMON_SAVE_API_URL
                    : process.env.NEXT_PUBLIC_SSW_REDIS_SEARCH_ORIGIN_API_URL;

            const fetcher = item.sqlId === '0' ? fetcherPostCommonSave : fetcherPostData;

            fetcher(items)
                .then(() => {
                    alert('저장되었습니다.');
                    setMasterRetrieve(true);
                })
                .catch((error) => console.error(error));
        }
    };
    const handleBtn2 = (item: SortBySeqBtnItem) => {
        const items = [
            {
                sqlId: item.sqlId,
                sql_key: item.sqlKey,
                params: [
                    {
                        info_type: 'hpo_info',
                        value: checked,
                    },
                ],
            },
        ];
        if (confirm('저장하시겠습니까?')) {
            const fetcher = item.sqlId === '0' ? fetcherPostCommonSave : fetcherPostData;
            fetcher(items)
                .then(() => {
                    alert('저장되었습니다.');
                    setCrtrRetrieve(true);
                })
                .catch((error) => console.error(error));
        }
    };

    const groupedRows = tableInfo.reduce((acc: any, cell: any) => {
        const rowIndex = parseInt(cell.row, 10);
        if (!acc[rowIndex]) acc[rowIndex] = [];
        acc[rowIndex].push(cell);
        return acc;
    }, {});

    const comboItem = (enumValue: string) => {
        // const sorted = (comboData[enumValue] || []).sort((a, b) => Number(a.cd_prord) - Number(b.cd_prord));
        const formattedOptions = (comboData[enumValue] || [])
            .map((item: any) => ({
                value: item.com_cd,
                label: item.com_cd_nm,
            }))
            .sort((a, b) => Number(a.cd_prord) - Number(b.cd_prord));
        return formattedOptions;
        // return sorted.map((item) => (
        //     <MenuItem key={item.com_cd} value={item.com_cd}>
        //         {item.com_cd_nm}
        //     </MenuItem>
        // ));
    };
    const handleCheckboxChange = (id: string, value: any) => {
        setChecked((prevData) => ({
            ...prevData,
            [id]: value,
        }));
    };
    useEffect(() => {
        if (tableData) {
            setFormData(tableData);
        }
    }, [tableData]);
    useEffect(() => {
        if (crtrData) {
            const hpoInfoData = crtrData[0]?.hpo_info || {};
            setChecked(hpoInfoData);
        }
    }, [crtrData]);
    return (
        <>
            <div className='crtrTable'>
                <div className='title'>
                    <Typography type='table' tooltip title={tableTitleData[0]?.description}>
                        {t(tableTitleData[0]?.title)}
                    </Typography>
                    <Stack direction='row' spacing={1}>
                        {sortBySeqBtn.map((item) => (
                            <CustomButton
                                key={item.seq}
                                customButton={item}
                                clickEvent={() => handleBtnClick(item)}
                                setData=''
                                className='btnPrimary sm reset'
                            />
                        ))}
                    </Stack>
                </div>
                <ul className='formList'>
                    {Object.entries(groupedRows).map(([rowIndex, cells]) => (
                        <li key={`row-${rowIndex}`} className='formRow'>
                            {cells.map((cell, index) => (
                                <div key={`${cell.id}-${index}`} className='formItem'>
                                    {/* <label className='formLabel'>{t(cell.title)}</label> */}
                                    <TableCell
                                        key={cell.id}
                                        rowSpan={parseInt(cell.rowspan) === 0 ? undefined : parseInt(cell.rowspan)}
                                        sx={{
                                            width: '300px',
                                            verticalAlign: 'middle',
                                            display: cell.visible ? '' : 'none',
                                        }}
                                    >
                                        <Typography type='table'>{t(cell.title)}</Typography>
                                    </TableCell>
                                    {cell.type === 'COMBO' ? (
                                        <TableCell
                                            key={`${cell.id}-${index}-value`}
                                            colSpan={parseInt(cell.colspan)} // colspan 적용
                                            rowSpan={parseInt(cell.rowspan) === 0 ? undefined : parseInt(cell.rowspan)}
                                            sx={{
                                                width: '300px',
                                                verticalAlign: 'middle',
                                                display: cell.visible ? '' : 'none',
                                            }}
                                        >
                                            <BoxSelect
                                                id={cell.id}
                                                label=''
                                                asterisk={false}
                                                value={formData?.[cell.id] ?? ''}
                                                onChange={(e) => handleChange(cell.id, e.target.value, 'combo')}
                                                displayEmpty={true}
                                                options={comboItem(cell.enum) || []}
                                                multiple={false}
                                            />
                                        </TableCell>
                                    ) : (
                                        <TableCell
                                            key={`${cell.id}-${index}-value`}
                                            colSpan={parseInt(cell.colspan)} // colspan 적용
                                            rowSpan={parseInt(cell.rowspan) === 0 ? undefined : parseInt(cell.rowspan)}
                                            sx={{
                                                textAlign: 'left', // 수평 좌측 정렬
                                                verticalAlign: 'middle', // 수직 중앙 정렬
                                                display: cell.visible ? 'flex' : 'none',
                                            }}
                                        >
                                            <InputTextBox
                                                type='text'
                                                id={cell.id}
                                                placeholder={cell.placeholder || ''}
                                                hasToggle={false}
                                                showPassword={false}
                                                label=''
                                                asterisk
                                                validationText=''
                                                value={formData?.[cell.id] || ''}
                                                onChange={(e) => handleChange(cell.id, e.target.value, 'input')}
                                                onDelete={() => handleChange(cell.id, '', 'input')}
                                            />
                                        </TableCell>
                                    )}
                                </div>
                            ))}
                        </li>
                    ))}
                </ul>
                {comModalData && (
                    <CommonPopup open={comModalOpen} onClose={() => setComModalOpen(false)} params={comModalData} />
                )}
            </div>
            <div className='crtrTable'>
                <div className='title'>
                    <Typography
                        type='table'
                        tooltip
                        title='우리 회사에서 사용할 인사정보 관리기준을 선택합니다. 사용을 원하지 않을 경우, 선택 해제해주세요. 사용 해제한 기준은 업무 화면에서 표시되지 않습니다'
                    >
                        {t('사용할 기준 설정')}
                    </Typography>
                    <Stack direction='row' spacing={1}>
                        <CustomButton
                            key={1}
                            customButton={btnInfo}
                            clickEvent={() => handleBtnClick(btnInfo)}
                            setData=''
                            className='btnPrimary sm reset'
                        />
                    </Stack>
                </div>
                <ul className='formList'>
                    <li className='formRow'>
                        <div className='formItem'>
                            <Checkbox
                                id='ognz_type'
                                label='조직유형'
                                value={1}
                                checked={checked.ognz_type}
                                onChange={() => handleCheckboxChange('ognz_type', !checked.ognz_type)}
                            />
                        </div>
                        <div className='formItem'>
                            <Checkbox
                                id='duty'
                                label='직무'
                                value={1}
                                checked={checked.duty}
                                onChange={() => handleCheckboxChange('duty', !checked.duty)}
                            />
                        </div>
                        <div className='formItem'>
                            <Checkbox
                                id='jbttl'
                                label='직책'
                                value={1}
                                checked={checked.jbttl}
                                onChange={() => handleCheckboxChange('jbttl', !checked.jbttl)}
                            />
                        </div>
                        <div className='formItem'>
                            <Checkbox
                                id='jbps'
                                label='직위'
                                value={1}
                                checked={checked.jbps}
                                onChange={() => handleCheckboxChange('jbps', !checked.jbps)}
                            />
                        </div>
                        <div className='formItem'>
                            <Checkbox
                                id='jbgd'
                                label='직급'
                                value={1}
                                checked={checked.jbgd}
                                onChange={() => handleCheckboxChange('jbgd', !checked.jbgd)}
                            />
                        </div>
                    </li>
                </ul>
            </div>
        </>
    );
}
