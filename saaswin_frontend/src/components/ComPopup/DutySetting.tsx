import Button from 'components/Button';
import SwModal from 'components/Modal';
import Typography from 'components/Typography';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetcherPostData } from 'utils/axios';
import { IcoCheckFill, IcoCol, IcoDelete } from '@/assets/Icon';
import styles from '../../styles/pages/OgnzOwnereReg/page.module.scss';
import Loader from '../Loader';
import { Box } from '@mui/material';
import { CustomColumnMenu, CustomNoRowsOverlay, StyledDataGrid } from 'components/Grid';
import { DataGridPremiumProps, GridColDef, GridRowModesModel, useGridApiRef } from '@mui/x-data-grid-premium';
import { randomId } from '@mui/x-data-grid-generator';
import DateComponent from '../SearchCondition/DateComponent';
import { sendDataItem } from '@/types/component/SearchCondition';
import TreeInputTextBox from '../TreeInputTextBox';
import InputTextBox from '../InputTextBox';

interface DutySettingProps {
    params: any;
    setParams: (params: any) => void;
    changeDifferRow?: (newRow: any, row: any, field: string) => void;
}

const DutySetting = ({ params, setParams }: DutySettingProps) => {
    const { mainColumns, userNo, open, setMainRows } = params;
    const [masterRetrieve, setMasterRetrieve] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [masterData, setMasterData] = useState(null);

    const [sendData, setSendData] = useState<sendDataItem>({
        rprs_group_cd: 'hrs_group00934',
        std_ymd: dayjs(new Date()).format('YYYYMMDD'),
        duty_nm: '',
    });
    const TreeInput = (params: any) => {
        const { field, isEditable, value, row, rowNode } = params;

        return (
            <Box>
                <TreeInputTextBox
                    id={field}
                    placeholder=''
                    type='text'
                    value={(value && value) || ''}
                    disabled={!isEditable}
                    depth={rowNode?.depth || 0}
                />
            </Box>
        );
    };

    const columns = [
        {
            field: 'duty_nm',
            headerName: '직무이름',
            width: 250,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => TreeInput(params),
        },
        {
            field: 'duty_cd',
            headerName: '직무코드',
            width: 200,
            headerAlign: 'center',
            align: 'center',
            flex: 1,
            minWidth: 200,
        },
    ] as GridColDef[];

    const searchData = [
        {
            id: 'std_ymd',
            seq: '1',
            text: '기준일자',
            type: 'DATE',
            sqlId: null,
            default: 'now_ymd',
            visible: true,
            required: null,
            placeholder: '',
        },
        {
            id: 'duty_nm',
            seq: '2',
            text: '직무명',
            type: 'TEXT',
            sqlId: null,
            default: null,
            visible: true,
            required: null,
            placeholder: null,
        },
    ];

    const gridRef = useGridApiRef();
    const [rows, setRows] = useState([]);
    const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});
    const auth = JSON.parse(localStorage.getItem('auth') ?? '{}');
    const rprsOgnzNo = auth?.state?.rprsOgnzNo ?? '';
    const { t } = useTranslation();
    const getTreeDataPath: DataGridPremiumProps['getTreeDataPath'] = (row) => row?.['hierarchy']?.split('$') || [];
    const groupingColDef: DataGridPremiumProps['groupingColDef'] = {
        headerName: '',
        headerAlign: 'center',
        width: 20,
        filterOperators: [],
    };

    const onClose = () => {
        setParams((prev) => {
            return {
                ...prev,
                open: !open,
            };
        });
    };

    const handleDelete = (id: string): void => {
        handleChange(id, '');
    };

    const handleChange = (id: string, value: string) => {
        setSendData((prev) => {
            return {
                ...prev,
                [id]: value,
            };
        });
    };

    const handleSubmit = () => {
        setMasterRetrieve(true);
    };

    const getParentHierarchy = (row: any) => {
        const path = row.hierarchy?.split('$');
        if (!path || path.length < 2) return null;
        // 부모의 전체 경로
        return path.slice(0, -1).join('$');
    };

    const getAllParentHierarchies = (row: any, allRows: any) => {
        const parents = [];
        let current = row;
        while (true) {
            const parentHierarchy = getParentHierarchy(current);
            if (!parentHierarchy) break;
            const parentRow = allRows.find((r) => r.hierarchy === parentHierarchy);
            if (!parentRow) break;
            parents.push(parentRow);
            current = parentRow;
        }
        return parents;
    };

    const onSave = () => {
        const selectRows = gridRef.current.getSelectedRows() || null;

        if (selectRows.size === 0) {
            alert('등록할 직무를 선택하세요');
        } else {
            //duty_cd 겹치는경우 어떻게 할건지?
            const selectrow = Array.from(selectRows.values()); // row 객체 배열
            const selectedIds = selectrow.map((row) => row.id); // id 배열

            const parentHierarchies = new Set();
            rows.forEach((row) => {
                if (selectedIds.includes(row.id)) {
                    const parentRows = getAllParentHierarchies(row, rows);
                    parentRows.forEach((parentRow) => {
                        parentHierarchies.add(parentRow.id);
                    });
                }
            });

            // parentHierarchies는 id Set이므로, id로 row 객체를 찾아야 함
            const parentRowsArr = Array.from(parentHierarchies).map((id) => rows.find((r) => r.id === id));

            // 최종 선택: selectrow(객체배열) + parentRowsArr(객체배열) 중복 없이
            const allSelectedRows = [
                ...selectrow,
                ...parentRowsArr.filter((parentRow) => !selectedIds.includes(parentRow?.id)),
            ];

            const dutyNmColumn = mainColumns.find((col) => {
                const field = col.field;
                const pipeIndex = field.indexOf('|');
                return pipeIndex !== -1 && field.substring(pipeIndex + 1) === 'duty_nm';
            });
            const originKey = dutyNmColumn ? dutyNmColumn.field.split('|')[0] + '|' : '';

            const newRow = allSelectedRows.map((row) => {
                const obj = {};
                mainColumns.forEach((col) => {
                    const field = col.field;
                    const pipeIndex = field.indexOf('|'); // jsonb타입 필드인지 확인
                    const newKey = pipeIndex !== -1 ? field.substring(pipeIndex + 1) : field; // jsonb타입 필드일 경우 필드명 추출

                    if (newKey === 'duty_nm') {
                        obj[field] = row[newKey];
                    } else if (newKey === 'bgng_ymd') {
                        obj[field] = dayjs(new Date()).format('YYYYMMDD');
                    } else if (newKey === 'duty_cd') {
                        obj[field] = row.com_cd;
                    } else if (newKey === 'end_ymd') {
                        obj[field] = null;
                    }
                });

                if (originKey) {
                    obj[originKey + 'parent_nm'] = row.parent_nm;
                    obj[originKey + 'sort_seq'] = row.sort_seq;
                    obj[originKey + 'del_yn'] = 'N';
                } else {
                    obj.parent_nm = row.parent_nm;
                    obj.sort_seq = row.sort_seq;
                    obj.del_yn = 'N';
                }
                obj.user_no = userNo;
                obj.id = randomId();
                obj.hierarchy = row.hierarchy;
                obj.isNew = true;

                return obj;
            });

            setMainRows((prev) => {
                const prevDutyCdSet = new Set(prev.map((row) => row.hierarchy));
                const filteredNewRow = newRow.filter((row) => !prevDutyCdSet.has(row.hierarchy));

                return [...prev, ...filteredNewRow];
            });
            onClose();
        }
    };

    // 직무조회
    useEffect(() => {
        const item = [
            {
                sqlId: 'hrs_com01',
                sql_key: 'hrs_rprs_ognz_duty_cd_get',
                params: [sendData],
            },
        ];

        fetcherPostData(item)
            .then((response) => {
                const data = response[0].data;
                if (data === null) {
                    setMasterData([]);
                } else {
                    setMasterData(response);
                }
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                setDataLoading(false);
                setMasterRetrieve(false);
            });
    }, [params, masterRetrieve]);

    useEffect(() => {
        if (masterData && masterData.length > 0) {
            let seq = 1;
            const id = randomId(); // 고유 ID 추가
            const rows = masterData.map((row, index) => ({
                id: id + index,
                seq: seq++,
                ...row,
            }));
            setRows(rows);
        } else {
            setRows([]);
        }
    }, [masterData]);

    if (dataLoading) return <Loader />;

    return (
        <>
            <SwModal open={open} size='xl' maxWidth='900px' onClose={onClose} className={styles.ognzOwnerReg}>
                {/* 상단 타이틀 */}
                <Typography type='form'>직무찾기</Typography>
                <div className='searchBoxWrap'>
                    {searchData.map((item, index) => {
                        const { type, id } = item;
                        const visible = item.visible ?? true;
                        const uniqueKey = `${id}-${index}`;
                        switch (type) {
                            case 'TEXT':
                                return (
                                    <div className='formItem' key={`${index} - ${id}`}>
                                        <InputTextBox
                                            id={uniqueKey}
                                            placeholder='직무를 입력해주세요'
                                            type='text'
                                            value={(sendData[id] && sendData[id]) || ''}
                                            onChange={(e) => handleChange(id, e.target.value)}
                                            onDelete={() => handleDelete(uniqueKey)}
                                        />
                                    </div>
                                );
                            case 'DATE':
                                return (
                                    <div className='formItem' key={`${index} - ${id}`}>
                                        <DateComponent
                                            key={uniqueKey}
                                            item={item}
                                            scr_no={''}
                                            uniqueKey={uniqueKey}
                                            sendDataItem={sendData}
                                            handleChange={handleChange}
                                            visible={visible}
                                        />
                                    </div>
                                );
                            default:
                                return '';
                        }
                    })}
                    <Button key={1} onClick={handleSubmit} type='primary' size='sm' className='btnWithIcon btnSearch'>
                        {t('조회')}
                        <IcoCol fill='#fff' />
                    </Button>
                </div>
                <div className={styles.registration}>
                    <ul className={styles.list}></ul>
                </div>
                <div className='gridHeader'>
                    <Typography type='table'>{t('직무항목')}</Typography>
                </div>
                <Box
                    sx={{
                        width: '100%',
                        height: '400px',
                        '& .actions': {
                            color: 'text.secondary',
                        },
                        '& .textPrimary': {
                            color: 'text.primary',
                        },
                    }}
                >
                    <StyledDataGrid
                        treeData
                        getTreeDataPath={getTreeDataPath}
                        groupingColDef={groupingColDef}
                        defaultGroupingExpansionDepth={-1}
                        key={rows.length}
                        apiRef={gridRef}
                        rows={rows}
                        columns={columns}
                        editMode='cell'
                        rowModesModel={rowModesModel}
                        slots={{
                            noRowsOverlay: CustomNoRowsOverlay,
                            columnMenu: CustomColumnMenu,
                        }}
                        checkboxSelection={true}
                        // disableMultipleRowSelection={true}
                        disableRowSelectionOnClick
                        hideFooterRowCount
                        onProcessRowUpdateError={(error) => console.log(error)}
                        localeText={{
                            columnMenuSortAsc: '오름차순 정렬',
                            columnMenuSortDesc: '내림차순 정렬',
                            columnMenuUnsort: '정렬 해제',
                            columnMenuFilter: '필터',
                            filterPanelAddFilter: '필터 추가',
                            noRowsLabel: '표시할 데이터가 없습니다',
                            noResultsOverlayLabel: '표시할 데이터가 없습니다.',
                        }}
                        getRowClassName={(params) => `super-app-theme--${params.row.status}`}
                        rowHeight={30}
                        rowSelectionPropagation={{ parents: true, descendants: true }}
                    />
                </Box>
                <div className={styles.pageBtnArea}>
                    <Button type='default' size='lg' onClick={onClose} className='btnWithIcon'>
                        <IcoDelete fill='#7C7C7C' />
                        취소
                    </Button>
                    <Button type='primary' size='lg' onClick={onSave} className='btnWithIcon'>
                        <IcoCheckFill fill='#FFFFFF' />
                        적용
                    </Button>
                </div>
            </SwModal>
        </>
    );
};

export default DutySetting;
