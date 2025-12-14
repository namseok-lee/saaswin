'use client';
import cloneDeep from 'lodash/cloneDeep';
import styles from '../../../styles/pages/templateApply/page.module.scss';
import React, { useState, useEffect, useRef } from 'react';
import Typography from 'components/Typography';
import ApplyComponent from './applyComponent';
import { DataGridPremium, GridColDef, GridRenderCellParams, GridRowSelectionModel } from '@mui/x-data-grid-premium';
import Button from 'components/Button';
import ApplyGridComponent from './applyGridComponent';
import dayjs from 'dayjs';

interface ApplyContentsProps {
    params: Record<string, any>;
    setParams: React.Dispatch<React.SetStateAction<any>>;
    applyUIData: { [key: string]: any };

    formMode?: string;
}

interface GridData {
    id: string;
    [key: string]: any;
}

const ApplyContents: React.FC<ApplyContentsProps> = ({ params, setParams, applyUIData, formMode }) => {
    // formData 상태 초기화 시 params에서 기본/커스텀 항목 값 가져오고 날짜 변환
    const [formData, setFormData] = useState<Record<string, any>>(() => {
        const initialFormData: Record<string, any> = {};

        // 초기화할 항목 찾기
        const itemsToInitialize =
            applyUIData?.artcl_info?.filter(
                (item: any) =>
                    item &&
                    item.use_yn === 'Y' &&
                    (item.artcl_se_cd === 'hpo_group01026_cm0001' || item.artcl_se_cd === 'hpo_group01026_cm0003')
            ) || [];

        // 각 항목 처리
        itemsToInitialize.forEach((item: an) => {
            if (!item.key) return;

            // params에 해당 키가 있으면 처리
            if (params[item.key] !== undefined) {
                let valueToSet = params[item.key];

                // 유형별 처리
                if (item.type_cd === 'hpo_group01027_cm0003') {
                    // 구성원검색
                    // 객체나 배열인 경우 문자열로 변환
                    if (Array.isArray(valueToSet)) {
                        valueToSet = valueToSet.map((v) => (typeof v === 'object' ? v.user_no : v)).join(',');
                    } else if (valueToSet && typeof valueToSet === 'object') {
                        valueToSet = valueToSet.user_no || '';
                    }
                    // 문자열 아니면 빈 문자열
                    if (typeof valueToSet !== 'string') valueToSet = String(valueToSet || '');
                }
                // 기존 날짜 처리 코드...

                initialFormData[item.key] = valueToSet;
            }
        });

        return initialFormData;
    });

    // 그리드 데이터 상태 관리 (기존 로직 유지)
    const [gridData, setGridData] = useState<{ [optionKey: string]: GridData[] }>({});

    // 그리드 행 선택 상태 관리 (옵션 키별로 선택 상태 관리)
    const [rowSelections, setRowSelections] = useState<{ [optionKey: string]: GridRowSelectionModel }>({});

    // 그리드 셀 값 상태 관리 (옵션 키, 행 ID, 필드 기준으로 값 추적)
    const [cellValues, setCellValues] = useState<{ [key: string]: any }>({});

    // 총비용 - 출장비 계산
    const [totalCosts, setTotalCosts] = useState<{ [optionKey: string]: number }>({});

    // 데이터 그리드 API 참조 관리
    const dataGridApiRefs = useRef<{ [optionKey: string]: any }>({});

    const [keyMapping, setKeyMapping] = useState({});

    // 수정 가능 여부 확인 함수
    const isEditable = () => formMode !== 'approval' && formMode !== 'view';
    // 그리드 버튼 표시 여부
    const showGridButtons = isEditable();

    // 고유한 ID 생성 함수 - 개선된 버전
    const generateUniqueId = () => {
        // 특수 문자를 완전히 제거한 단순한 형식
        return `grid_row_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    };

    // input 값 변경 공통 핸들러
    const handleChange = (id: string, value: any, type: string | null = null) => {
        // 로컬 formData 업데이트
        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));

        // 상위 컴포넌트의 applyContentData 업데이트
        setParams((prev: any) => {
            const newParams = { ...prev };
            newParams[id] = value;
            return newParams;
        });
    };

    // input 삭제 핸들러
    const handleDelete = (id: string) => {
        setFormData((prevData) => {
            const newData = { ...prevData };
            delete newData[id];
            return newData;
        });

        // 필요한 경우 상위 컴포넌트에서도 삭제
        setParams((prev: any) => {
            const newParams = { ...prev };
            delete newParams[id];
            return newParams;
        });
    };

    // 그리드 데이터 초기화 useEffect
    // 그리드 데이터 초기화 useEffect
    useEffect(() => {
        // 초기 그리드 데이터 객체
        const initialGridData = {};

        // 내부 키 -> 외부 키 매핑 객체
        const internalToExternalKeyMap = {};
        const externalToInternalKeyMap = {};

        // 모든 가능한 그리드 매핑 초기화
        if (applyUIData?.artcl_info) {
            const etcItems = applyUIData.artcl_info.filter(
                (item) => item && item.artcl_se_cd === 'hpo_group01026_cm0002' && item.use_yn === 'Y'
            );

            // 그리드 키 매핑 생성
            etcItems.forEach((etcItem) => {
                if (etcItem.etc_options) {
                    etcItem.etc_options
                        .filter((option) => option && option.use_yn === 'Y')
                        .forEach((option) => {
                            // 내부용 복합 키
                            const internalKey = `${etcItem.key}_${option.key}`;
                            // 외부용 원래 키
                            const externalKey = option.key;

                            // 매핑 저장
                            internalToExternalKeyMap[internalKey] = externalKey;
                            externalToInternalKeyMap[externalKey] = internalKey;

                            // 빈 배열로 초기화
                            initialGridData[internalKey] = [];
                        });
                }
            });
        }

        // 키 매핑 상태 저장
        setKeyMapping({
            internalToExternal: internalToExternalKeyMap,
            externalToInternal: externalToInternalKeyMap,
        });

        // params에서 그리드 데이터 찾기
        Object.keys(params).forEach((key) => {
            const value = params[key];

            // 그리드 데이터인 경우 (배열)
            if (Array.isArray(value)) {
                // 매핑된 내부 키 찾기 (없으면 원래 키 사용)
                const internalKey = externalToInternalKeyMap[key] || key;

                // 행 데이터 생성 (안정적인 ID 포함)
                const rowsWithId = value.map((row, index) => ({
                    ...row,
                    id: generateUniqueId(), // 각 행마다 고유 ID 생성
                    seq: (index + 1).toString(), // 순서 값 설정
                }));

                // 그리드 데이터 설정
                initialGridData[internalKey] = rowsWithId;
            }
        });

        // 상태 업데이트
        setGridData(initialGridData);
    }, []);

    // gridData 또는 cellValues가 변경될 때마다 비용 계산
    useEffect(() => {
        // 각 옵션 키별로 총 비용 계산
        const newTotalCosts: { [optionKey: string]: number } = {};

        Object.keys(gridData).forEach((optionKey) => {
            const rows = gridData[optionKey] || [];
            let sum = 0;

            // 각 행의 cst 필드 값 합산
            rows.forEach((row) => {
                // 값이 존재하고 숫자로 변환 가능한 경우에만 합산
                if (row.cst !== undefined && row.cst !== null && row.cst !== '') {
                    // 문자열에서 숫자만 추출 (쉼표 등 제거)
                    const numericValue = String(row.cst).replace(/[^0-9.-]+/g, '');
                    if (numericValue) {
                        const value = parseFloat(numericValue);
                        if (!isNaN(value)) {
                            sum += value;
                        }
                    }
                }
            });

            newTotalCosts[optionKey] = sum;
        });

        setTotalCosts(newTotalCosts);
    }, [gridData]);

    /**
     * 그리드에 새 행을 추가하는 함수 - 개선된 버전
     */
    const handleAddRow = (optionKey, gridSchema) => {
        // 새 행 ID 생성
        const newRowId = generateUniqueId();

        // 새 행 기본 정보
        const newRow = {
            id: newRowId,
            seq: '',
        };

        // 스키마 기반 필드 초기화
        if (gridSchema && Array.isArray(gridSchema)) {
            gridSchema.forEach((field) => {
                if (field && field.key) {
                    // 필드 타입에 따른 기본값
                    if (field.key === 'seq') {
                        // seq는 후에 설정
                    } else if (field.type_cd === 'hpo_group01027_cm0007') {
                        // 날짜
                        newRow[field.key] = dayjs().format('YYYYMMDD');
                    } else if (field.type_cd === 'hpo_group01027_cm0011' && field.value) {
                        // 드롭다운
                        const options = field.value.split(',');
                        newRow[field.key] = options.length > 0 ? options[0] : '';
                    } else {
                        // 기타
                        newRow[field.key] = '';
                    }
                }
            });
        }

        // 상태 업데이트
        setGridData((prevData) => {
            // 현재 그리드 데이터
            const currentRows = [...(prevData[optionKey] || [])];

            // seq 설정
            newRow.seq = (currentRows.length + 1).toString();

            // 새 행 추가
            const updatedRows = [...currentRows, newRow];

            // 전체 상태 업데이트
            const newData = {
                ...prevData,
                [optionKey]: updatedRows,
            };

            // 상위 컴포넌트 업데이트
            setParams((prev) => {
                // ID 제외 데이터 생성
                const cleanData = updatedRows.map(({ id, ...rest }) => rest);

                // 외부 키로 변환
                const externalKey = keyMapping.internalToExternal[optionKey] || optionKey;

                console.log(`handleAddRow - 내부 키: ${optionKey}, 외부 키: ${externalKey}`);

                return {
                    ...prev,
                    [externalKey]: cleanData, // 외부 키 사용
                };
            });

            return newData;
        });

        // 그리드 업데이트
        setTimeout(() => {
            const apiRef = dataGridApiRefs.current[optionKey];
            if (apiRef) {
                try {
                    apiRef.setRowSelectionModel([]);
                    apiRef.refreshInfiniteRows();
                } catch (e) {
                    console.warn('그리드 API 호출 오류:', e);
                }
            }
        }, 50);
    };

    // 그리드 행 선택 변경 핸들러
    const handleRowSelectionChange = (optionKey: string, selectionModel: GridRowSelectionModel) => {
        setRowSelections((prev) => ({
            ...prev,
            [optionKey]: selectionModel,
        }));
    };

    // 선택된 그리드 행 삭제 핸들러
    const handleDeleteSelectedRows = (optionKey: string) => {
        const selectedIds = rowSelections[optionKey] || [];

        if (selectedIds.length === 0) {
            alert('삭제할 행을 선택해주세요.');
            return;
        }

        // 안전하게 gridData 업데이트
        setGridData((prevData) => {
            const newData = cloneDeep(prevData);
            const currentOptionData = newData[optionKey] || [];

            // 선택되지 않은 행만 유지
            newData[optionKey] = currentOptionData.filter((row) => !selectedIds.includes(row.id));

            // seq 재정렬
            newData[optionKey] = newData[optionKey].map((row, index) => ({
                ...row,
                seq: (index + 1).toString(),
            }));

            // 상위 컴포넌트에 변경사항 전달
            setParams((prevParams) => {
                const newParams = { ...prevParams };

                // 그리드 데이터를 ID 없이 변환
                const cleanGridData = newData[optionKey].map((row) => {
                    const { id, ...cleanRow } = row;
                    return cleanRow;
                });

                // 외부 키로 변환
                const externalKey = keyMapping.internalToExternal[optionKey] || optionKey;

                console.log(`handleDeleteSelectedRows - 내부 키: ${optionKey}, 외부 키: ${externalKey}`);

                // 옵션 키에 배열 할당
                newParams[externalKey] = cleanGridData; // 외부 키 사용

                return newParams;
            });

            return newData;
        });

        // 선택 상태 초기화
        setRowSelections((prev) => ({
            ...prev,
            [optionKey]: [],
        }));

        // API 참조 처리
        const apiRef = dataGridApiRefs.current[optionKey];
        if (apiRef) {
            apiRef.setRowSelectionModel([]);
            setTimeout(() => {
                apiRef.forceUpdate();
            }, 0);
        }
    };

    // 셀 값 변경 핸들러 - 개선된 버전
    const handleCellValueChange = (optionKey, rowId, fieldName, value) => {
        // 값 처리
        let processedValue = value;
        if (value && typeof value === 'object' && value.format) {
            processedValue = value.format('YYYYMMDD');
        }

        // 먼저 상태 업데이트
        setGridData((prevData) => {
            // 깊은 복사
            const newData = JSON.parse(JSON.stringify(prevData));

            // 해당 그리드 데이터 가져오기
            if (!newData[optionKey]) {
                console.warn(`그리드 키 ${optionKey}에 대한 데이터가 없습니다.`);
                newData[optionKey] = [];
            }

            // 행 찾기
            const rowIndex = newData[optionKey].findIndex((row) => row.id === rowId);

            if (rowIndex === -1) {
                console.warn(`ID ${rowId}인 행을 찾을 수 없습니다. 데이터 추가...`);
                // 행이 없으면 새로 추가 (방어 코드)
                const newRow = {
                    id: rowId,
                    [fieldName]: processedValue,
                    seq: (newData[optionKey].length + 1).toString(),
                };
                newData[optionKey].push(newRow);
            } else {
                // 기존 행 업데이트
                newData[optionKey][rowIndex] = {
                    ...newData[optionKey][rowIndex],
                    [fieldName]: processedValue,
                };
            }

            // params 업데이트를 위한 ID 없는 버전 생성
            const cleanData = newData[optionKey].map((row) => {
                const { id, ...rest } = row;
                return rest;
            });

            // 외부 키로 변환
            const externalKey = keyMapping.internalToExternal[optionKey] || optionKey;

            console.log(`handleCellValueChange - 내부 키: ${optionKey}, 외부 키: ${externalKey}`);

            // params 업데이트
            setParams((prev) => ({
                ...prev,
                [externalKey]: cleanData, // 외부 키 사용
            }));

            return newData;
        });

        // 백업 데이터 업데이트
        setCellValues((prev) => ({
            ...prev,
            [`${optionKey}_${rowId}_${fieldName}`]: processedValue,
        }));
    };

    // 셀 값 가져오기 (격리된 상태에서)
    const getCellValue = (optionKey: string, rowId: string, fieldName: string, defaultValue: any = '') => {
        // gridData에서 값 확인 (메인 소스)
        const rows = gridData[optionKey] || [];
        const row = rows.find((r) => r.id === rowId);

        // 행이 존재하고 필드 값이 undefined나 null이 아닌 경우
        if (row && row[fieldName] !== undefined && row[fieldName] !== null) {
            return row[fieldName];
        }

        // cellValues에서 백업 값 확인
        const cellKey = `${optionKey}_${rowId}_${fieldName}`;
        const cellValue = cellValues[cellKey];
        if (cellValue !== undefined && cellValue !== null) {
            return cellValue;
        }

        // 최종 기본값 반환
        return defaultValue;
    };

    // DataGrid 공통 props 생성 함수
    const getDataGridProps = (optionKey) => ({
        rows: gridData[optionKey] || [],
        rowHeight: 52,
        apiRef: (api) => {
            dataGridApiRefs.current[optionKey] = api;
        },
        getRowId: (row) => row.id,
        checkboxSelection: true,
        disableColumnFilter: false,
        rowSelectionModel: rowSelections[optionKey] || [],
        onRowSelectionModelChange: (newRowSelectionModel) => handleRowSelectionChange(optionKey, newRowSelectionModel),
        hideFooter: true,
        initialState: {
            pinnedColumns: { left: ['seq'] },
        },
        // 행 선택 설정은 유지하되 이벤트 충돌 방지
        disableRowSelectionOnClick: true,
        // 셀 클릭 이벤트 핸들러 제거 (충돌 방지)
        // onCellClick: (params, event) => {
        //     event.stopPropagation();
        // },
        // 편집 모드 설정 (이 설정은 유지)
        editMode: 'cell',
    });

    // DataGridPremium 컴포넌트에 적용할 추가 props
    const additionalDataGridProps = {
        componentsProps: {
            cell: {
                onClick: (event) => {
                    if (!event.target.closest('.MuiDataGrid-checkboxInput')) {
                        event.stopPropagation();
                    }
                },
            },
            baseCheckbox: {
                onClick: (event) => {
                    event.stopPropagation = () => {};
                },
            },
        },
    };

    // 항목 필터링
    const basicItems =
        applyUIData?.artcl_info?.filter(
            (artcl_info: any) => artcl_info.artcl_se_cd === 'hpo_group01026_cm0001' && artcl_info.use_yn === 'Y'
        ) || [];

    const customItems =
        applyUIData?.artcl_info?.filter(
            (artcl_info: any) => artcl_info.artcl_se_cd === 'hpo_group01026_cm0003' && artcl_info.use_yn === 'Y'
        ) || [];

    const etcItems =
        applyUIData?.artcl_info?.filter(
            (artcl_info: any) => artcl_info.artcl_se_cd === 'hpo_group01026_cm0002' && artcl_info.use_yn === 'Y'
        ) || [];

    return (
        <>
            <section className={`${styles.approvalLine} ${styles.section}`}>
                {/* 기본항목 , 커스텀항목 */}
                <Typography title='신청내용' type='section' className={styles.sectionTit}>
                    신청내용
                </Typography>
                <div className='tblWrap'>
                    <table className='tbl'>
                        <colgroup>
                            <col style={{ width: '180px' }} />
                            <col style={{ width: '*' }} />
                        </colgroup>
                        <tbody>
                            {/* 기본항목 */}
                            {basicItems.map((item: any, index: number) => (
                                <tr key={index}>
                                    <th>
                                        {item.nm} {item.esntl_artcl === 'Y' && <span className='asterisk'>*</span>}
                                    </th>
                                    <td>
                                        <ApplyComponent
                                            fieldInfo={item}
                                            value={formData[item.key]}
                                            onChange={handleChange}
                                            onDelete={handleDelete}
                                            options={item.options || []}
                                            disabled={!isEditable()} // 수정 가능 여부 전달
                                        />
                                    </td>
                                </tr>
                            ))}
                            {/* 커스텀항목 */}
                            {customItems.map((item: any, index: number) => (
                                <tr key={index}>
                                    <th>
                                        {item.nm} {item.esntl_artcl === 'Y' && <span className='asterisk'>*</span>}
                                    </th>
                                    <td>
                                        <ApplyComponent
                                            fieldInfo={item}
                                            value={formData[item.key]}
                                            onChange={handleChange}
                                            onDelete={handleDelete}
                                            options={item.options || []}
                                            disabled={!isEditable()} // 수정 가능 여부 전달
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 기타항목 - 그리드 */}
                {etcItems.map((etcItem) => (
                    <React.Fragment key={etcItem.key}>
                        {/* 옵션 목록 필터링 - use_yn이 'Y'인 것들만, seq 기준 정렬 */}
                        {etcItem.etc_options
                            .filter((option) => option.use_yn === 'Y')
                            .sort((a, b) => parseInt(a.seq) - parseInt(b.seq))
                            .map((option) => {
                                const gridUniqueKey = `${etcItem.key}_${option.key}`;
                                // columns 생성
                                const columns = option.artcl
                                    .filter((item) => item !== null && item.use_yn === 'Y' && item.key !== 'flco_cal')
                                    .sort((a, b) => parseInt(a!.seq) - parseInt(b!.seq))
                                    .map((article) => {
                                        // type 코드에 따라 타입 설정
                                        const isSelect = article.type_cd === 'hpo_group01027_cm0011';
                                        const isDateType =
                                            article.type_cd === 'hpo_group01027_cm0007' ||
                                            article.type_cd === 'hpo_group01027_cm0005';
                                        // seq 필드인지 확인
                                        const isSeqField = article?.key === 'seq';
                                        // 금액 필드인지 확인
                                        const isAmountField = article.type_cd === 'hpo_group01027_cm0015';

                                        const baseColumn = {
                                            field: article?.key || '',
                                            headerName: article?.nm || '',
                                            headerAlign: 'center',
                                            width: isSeqField ? 50 : 150,
                                            flex: isSeqField ? 0 : 1,
                                            editable: !isSeqField,
                                            ...(article.esntl_yn === 'Y' && {
                                                renderHeader: (params) => (
                                                    <div>
                                                        {article?.nm || ''}{' '}
                                                        <span className='asterisk' style={{ color: '#e33131' }}>
                                                            *
                                                        </span>
                                                    </div>
                                                ),
                                            }),
                                        };

                                        // 드롭다운/선택 옵션 처리
                                        const options =
                                            article.value && typeof article.value === 'string'
                                                ? article.value.split(',').map((item) => ({
                                                      label: item.trim(),
                                                      value: item.trim(),
                                                  }))
                                                : article.options || [];

                                        if (isSeqField) {
                                            return {
                                                ...baseColumn,
                                                type: 'string',
                                                align: 'center', // 중앙 정렬
                                                valueFormatter: (params) => String(params.value || ''),
                                                valueParser: (value) => String(value || ''),
                                                renderCell: (params) => (
                                                    <div
                                                        style={{
                                                            width: '100%',
                                                            textAlign: 'center',
                                                            color: 'rgba(0, 0, 0, 0.87)',
                                                        }}
                                                    >
                                                        {params.value}
                                                    </div>
                                                ),
                                                editable: false,
                                            };
                                        }

                                        // 드롭다운 필드
                                        if (isSelect) {
                                            return {
                                                ...baseColumn,
                                                type: 'singleSelect',
                                                align: 'left',
                                                valueOptions: options,
                                                editable: true,
                                            };
                                        }

                                        // 금액 필드
                                        if (isAmountField) {
                                            return {
                                                ...baseColumn,
                                                type: 'number',
                                                align: 'right',
                                                editable: true,
                                                valueGetter: (value) => {
                                                    if (value === null || value === undefined) {
                                                        return '0';
                                                    }

                                                    const numericValue = Number(String(value).replace(/,/g, ''));

                                                    if (isNaN(numericValue)) {
                                                        return value;
                                                    }

                                                    return numericValue.toLocaleString('ko-KR');
                                                },
                                            };
                                        }

                                        // 날짜 타입인 경우 직접 renderCell 정의
                                        if (isDateType) {
                                            return {
                                                ...baseColumn,
                                                renderCell: (params: GridRenderCellParams) => {
                                                    const { id, field, value, row } = params;

                                                    // 현재 셀 값 가져오기
                                                    const cellValue = getCellValue(
                                                        gridUniqueKey,
                                                        id as string,
                                                        field,
                                                        value
                                                    );

                                                    return (
                                                        <div
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                            }}
                                                            style={{ width: '100%' }}
                                                        >
                                                            <ApplyGridComponent
                                                                fieldInfo={{
                                                                    ...article,
                                                                    key: `${option.key}_${id}_${field}`,
                                                                }}
                                                                value={cellValue}
                                                                onChange={(key, value) => {
                                                                    handleCellValueChange(
                                                                        gridUniqueKey,
                                                                        id as string,
                                                                        field,
                                                                        value
                                                                    );
                                                                }}
                                                                onDelete={handleDelete}
                                                                placeHolderYn={'N'}
                                                                options={options}
                                                                disabled={!isEditable()}
                                                            />
                                                        </div>
                                                    );
                                                },
                                                editable: false,
                                            };
                                        }

                                        // 텍스트 or 숫자면 type만 지정
                                        if (article.type_cd === 'hpo_group01027_cm0001') {
                                            return {
                                                ...baseColumn,
                                                type: 'string',
                                                align: 'left',
                                                editable: true,
                                            };
                                        }
                                        if (article.type_cd === 'hpo_group01027_cm0002') {
                                            return {
                                                ...baseColumn,
                                                type: 'string', // 숫자도 문자열로 처리
                                                align: 'right', // 우측 정렬
                                                editable: true,
                                            };
                                        }

                                        // 기타 타입의 컬럼은 기존 방식대로 처리
                                        return {
                                            ...baseColumn,
                                            renderCell: (params: GridRenderCellParams) => {
                                                // 고유 ID 생성
                                                const cellId = `${option.key}_${params.id}_${params.field}`;

                                                // 현재 셀 값 가져오기
                                                const cellValue = getCellValue(
                                                    gridUniqueKey,
                                                    params.id as string,
                                                    params.field,
                                                    params.value
                                                );

                                                return (
                                                    <ApplyGridComponent
                                                        fieldInfo={{
                                                            ...article,
                                                            key: cellId,
                                                        }}
                                                        value={cellValue}
                                                        onChange={(id, value) => {
                                                            handleCellValueChange(
                                                                gridUniqueKey,
                                                                params.id as string,
                                                                params.field,
                                                                value
                                                            );
                                                        }}
                                                        onDelete={handleDelete}
                                                        placeHolderYn={'N'}
                                                        options={options}
                                                        disabled={!isEditable()}
                                                    />
                                                );
                                            },
                                            editable: false,
                                        };
                                    });

                                // 유류비 계산 존재유무
                                const flco_cal = option.artcl.filter(
                                    (item) => item !== null && item.use_yn === 'Y' && item.key === 'flco_cal'
                                );

                                return (
                                    <section key={option.key} className={`${styles.optionSection} ${styles.section}`}>
                                        <div className={styles.gridHeader}>
                                            <Typography title={option.nm} type='section' className={styles.SectionTit}>
                                                {option.nm}
                                            </Typography>
                                            {/* 버튼 표시 여부 제어 */}
                                            {showGridButtons && (
                                                <div className={styles.gridActions}>
                                                    {/* 유류비 계산 */}
                                                    {flco_cal && flco_cal.length > 0 && (
                                                        <Button
                                                            id='btnFuelCal'
                                                            type='default'
                                                            size='sm'
                                                            className='btnWithIcon'
                                                        >
                                                            유류비 계산
                                                        </Button>
                                                    )}

                                                    {/* 삭제 버튼 */}
                                                    <Button
                                                        id='btnDeleteRows'
                                                        type='default'
                                                        size='sm'
                                                        className='btnWithIcon'
                                                        onClick={() => handleDeleteSelectedRows(gridUniqueKey)}
                                                    >
                                                        삭제
                                                    </Button>

                                                    {/* 추가 버튼 */}
                                                    <Button
                                                        id='btnAddRow'
                                                        type='primary'
                                                        size='sm'
                                                        className='btnWithIcon'
                                                        onClick={() => handleAddRow(gridUniqueKey, option.artcl)}
                                                    >
                                                        추가
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                        {/* 데이터 그리드 */}
                                        <DataGridPremium
                                            rows={gridData[gridUniqueKey] || []}
                                            getRowId={(row) => row.id}
                                            columns={columns}
                                            checkboxSelection
                                            disableRowSelectionOnClick
                                            rowSelectionModel={rowSelections[gridUniqueKey] || []}
                                            onRowSelectionModelChange={(newSelection) =>
                                                handleRowSelectionChange(gridUniqueKey, newSelection)
                                            }
                                            editMode={isEditable() ? 'cell' : 'none'} // 수정 모드 제어
                                            apiRef={(api) => {
                                                dataGridApiRefs.current[gridUniqueKey] = api;
                                            }}
                                            processRowUpdate={
                                                isEditable()
                                                    ? // 수정 가능한 경우에만 행 업데이트 처리
                                                      (newRow, oldRow) => {
                                                          // 변경된 필드만 업데이트
                                                          Object.keys(newRow).forEach((field) => {
                                                              if (newRow[field] !== oldRow[field]) {
                                                                  handleCellValueChange(
                                                                      gridUniqueKey,
                                                                      newRow.id,
                                                                      field,
                                                                      newRow[field]
                                                                  );
                                                              }
                                                          });
                                                          return newRow;
                                                      }
                                                    : // 수정 불가능한 경우 원래 행 반환
                                                      (newRow, oldRow) => oldRow
                                            }
                                            onProcessRowUpdateError={(error) => {
                                                console.error('행 업데이트 오류:', error);
                                            }}
                                            sx={{
                                                height: '230px',
                                                overflow: 'auto',
                                                marginTop: '10px',
                                                '& .MuiDataGrid-cell': { zIndex: 1 },
                                                '& .MuiDataGrid-columnHeader': { zIndex: 1 },
                                            }}
                                        />
                                        <div className='tblWrap'>{/* 기존 테이블 코드 */}</div>
                                        {flco_cal && flco_cal.length > 0 && (
                                            <div className={styles.totalCost}>
                                                총 비용 :{' '}
                                                {totalCosts[gridUniqueKey]?.toLocaleString() ||
                                                    totalCosts[option.key]?.toLocaleString() ||
                                                    0}
                                                원
                                            </div>
                                        )}
                                    </section>
                                );
                            })}
                    </React.Fragment>
                ))}
            </section>
        </>
    );
};

export default ApplyContents;
