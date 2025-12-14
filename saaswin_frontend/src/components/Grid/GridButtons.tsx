'use client';
import React, { useEffect } from 'react';
import { Stack } from '@mui/material';
import Button from 'components/Button';
import Typography from 'components/Typography';
import CustomButton from '../CustomButton';
import { randomId } from '@mui/x-data-grid-generator';
import {
    fetcherPost,
    fetcherPostCommonSave,
    fetcherPostData,
    fetcherPostUserClickLog,
    sendAligoKakaoTalk,
} from 'utils/axios';
import { enqueueSnackbar } from 'notistack';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { handleCheckModal, handleDutySetting, handleFullModal } from './components/GridModalHandlers';
import { useAuthStore } from 'utils/store/auth';
import { getOs } from '@/utils/clientEnv/clientEnv';
import { getBrowser } from '@/utils/clientEnv/clientEnv';
import { validateRecursive } from '@/utils/validation/encryption';

// 버튼 아이템 타입 정의
interface SortBySeqBtnItem {
    api: string;
    seq: string;
    sql: string;
    sqlId: string;
    sqlKey: string;
    text: string;
    type: string;
    modalPath: string;
    param: Record<string, any>;
    retrieveYn?: boolean;
    btnKey?: string;
    btnValue?: string;
    btnType?: string;
}

interface GridButtonsProps {
    // 기본 속성
    masterUI?: any;
    gridTitleData?: string;
    description?: string;
    showByKeyBtn?: SortBySeqBtnItem[];
    sortBySeqBtn?: SortBySeqBtnItem[];
    tpcdParam?: string;
    rowData?: any[];
    item?: any;
    gridKey?: string;

    // 이벤트 핸들러와 상태 업데이트 함수
    setMasterRetrieve: (value: boolean) => void;
    setRows: React.Dispatch<React.SetStateAction<any[]>>;
    setKey?: (prevKey: any) => void;
    handleSend?: () => void;
    formName?: string;
    invtnNm?: string;
    invtnId?: string;
    gridRef: any;
    setMailModalOpen?: (open: boolean) => void;
    setAgtAuthModalOpen?: (open: boolean) => void;
    setAgtAuthData: Record<string, any> | null;
    setReorgModalOpen?: (open: boolean) => void;
    rows: any[];
    initParam: any;
    whereData: any;
    insertParam: any;
    setModalData?: React.Dispatch<
        React.SetStateAction<{ modal_info: {} | null; modalPath: string; open: boolean } | null>
    >;
    setPayModalData?: React.Dispatch<
        React.SetStateAction<{ slry_ocrn_id: string; isNew: boolean; step_cd: string; open: boolean } | null>
    >;
    triggerSave?: boolean;
    requiredColumn?: string[];
    changeDifferRow?: (newRow: any, oldRow: any, field: string) => void;
}

const GridButtons: React.FC<GridButtonsProps> = ({
    masterUI,
    gridTitleData,
    description,
    showByKeyBtn,
    tpcdParam,
    rowData,
    item,
    gridKey,
    setMasterRetrieve,
    setRows,
    setKey,
    handleSend,
    formName,
    invtnNm,
    invtnId,
    gridRef,
    setMailModalOpen,
    setAgtAuthModalOpen,
    setAgtAuthData,
    setReorgModalOpen,
    rows,
    initParam,
    whereData,
    insertParam,
    setModalData,
    triggerSave,
    requiredColumn,
    changeDifferRow,
}) => {
    const { t } = useTranslation();

    const userNo = useAuthStore((state) => state.userNo);
    const rprsOgnzNo = useAuthStore((state) => state.rprsOgnzNo);
    // console.log('buttons:', masterUI);
    // 엑셀 다운로드 (ExcelJS 라이브러리 사용)
    const exportToExcel = async () => {
        // ExcelJS를 사용하여 새로운 워크북(엑셀 파일) 객체를 생성합니다.
        const workbook = new ExcelJS.Workbook();
        // 워크북 안에 'Sheet1'이라는 이름의 새 워크시트를 추가합니다.
        const worksheet = workbook.addWorksheet('Sheet1');

        // 현재 그리드(gridRef)에서 화면에 보이는 컬럼들의 정보를 가져옵니다.
        const columnData = gridRef.current.getAllColumns();
        const visibleColumns = gridRef.current.getVisibleColumns();

        // Create a set of visible column field names for quick lookup
        const visibleColumnFields = new Set(visibleColumns.map((col) => col.field));

        // 현재 그리드 데이터(rows prop)를 가져옵니다.
        const gridRows = rows;

        // 컬럼 헤더를 정의합니다. (기존 로직과 동일)
        // worksheet.columns = columnData // 기존 코드 주석 처리

        // 1. 보이는 컬럼 필터링 및 엑셀 컬럼 정의 생성
        const excelColumns = columnData
            .filter((column) => {
                const isNotCheckbox = column.headerName !== 'Checkbox selection';
                const isText = column.type === 'string';
                const isDateColumn = column.renderEditCell?.name === 'dateFormat';
                const isNotSequenceNumber = column.headerName !== '번호';
                const baseCriteria = isNotCheckbox && (isText || isDateColumn) && isNotSequenceNumber;

                // const isCurrentlyHidden = column.hide === true; // 이전 로직 제거
                const isVisible = visibleColumnFields.has(column.field); // 현재 보이는 컬럼인지 확인
                const isEmailColumn = column.headerName === '이메일';

                // 기본 조건 만족하고, (현재 보이거나 || 이메일 컬럼인 경우)
                return baseCriteria && (isVisible || isEmailColumn);
            })
            .map((column) => {
                const excelColumnDef = {
                    header: column.headerName,
                    key: column.field,
                    width: column.width / 8,
                    style: {},
                };
                return excelColumnDef;
            });

        // 2. user_id 컬럼 존재 여부 확인 및 추가
        const userIdColumnExists = excelColumns.some((col) => col.key === 'user_id');
        if (!userIdColumnExists && gridRows.length > 0 && gridRows[0]?.hasOwnProperty('user_id')) {
            excelColumns.push({
                header: '사용자 ID', // 필요시 헤더명 변경
                key: 'user_id',
                width: 15, // 적절한 너비 설정
                style: {},
            });
        }

        // 3. 워크시트 컬럼 설정
        worksheet.columns = excelColumns;

        // 가져온 그리드 데이터 행들을 워크시트에 추가합니다.
        // 각 행 객체의 키가 worksheet.columns에서 정의한 key와 일치해야 데이터가 올바르게 매핑됩니다.
        worksheet.addRows(gridRows);

        // 워크시트의 첫 번째 행(헤더 행)의 각 셀에 스타일을 적용합니다.
        worksheet.getRow(1).eachCell((cell) => {
            // 셀 배경색을 회색으로 설정합니다.
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFDDDDDD' }, // 회색 배경
            };
            // 셀 테두리를 얇은 선으로 설정합니다.
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
            // 셀 폰트를 굵게 설정합니다.
            cell.font = { bold: true };
        });

        // 설정된 워크북을 XLSX 형식의 버퍼(데이터 조각)로 비동기적으로 변환합니다.
        const buffer = await workbook.xlsx.writeBuffer();
        // 생성된 버퍼를 사용하여 Blob 객체를 생성합니다. Blob은 파일과 유사한 데이터 객체입니다.
        // type 속성으로 파일의 MIME 타입을 지정합니다 (Excel 파일 형식).
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        // file-saver 라이브러리의 saveAs 함수를 사용하여 Blob 객체를 다운로드합니다.
        // 파일 이름은 gridTitleData prop 값을 사용하고, 없으면 'grid_data.xlsx'를 기본값으로 사용합니다.
        const fileName = `${gridTitleData || 'grid_data'}.xlsx`;
        saveAs(blob, fileName);
    };

    // 엑셀 다운로드
    const downloadExcel = (data) => {
        if (data.length === 0) {
            alert('데이터가 없습니다');
            return;
        }
        const formattedData = data.map((row) => ({
            ...row,
            isAdmin: row.isAdmin === 'true' || row.isAdmin === true ? true : false,
        }));
        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

        XLSX.writeFile(workbook, 'saaswin.xlsx');
    };

    // 행 추가 핸들러
    const handleInsert = (type: string) => {
        const id = randomId();
        const newRow = { ...insertParam, id: id };

        if (type === 'GRID_INSERT_M') newRow.action_type = 'm';

        gridRef.current.updateRows([newRow]);
        setRows((oldRows) => [newRow, ...oldRows]);
        gridRef.current.getRowParams &&
            gridRef.current.getRowParams(id) &&
            handleRowClick(gridRef.current.getRowParams(id));
    };

    // 행 업데이트 시 행 클릭 핸들러
    const handleRowClick = (params) => {
        if (!params) return;
        const clickedRowId = params.id;
        setRows((prevRows) =>
            prevRows.map((row) => {
                const prevStatus = row.status || '';
                if (row.id === clickedRowId) {
                    return { ...row, status: 'clicked', prevStatus: prevStatus };
                } else {
                    const { status, isNew, hasChanged, prevStatus } = row;
                    if (status === 'clicked') {
                        if (isNew) {
                            return { ...row, status: 'new' };
                        } else if (hasChanged) {
                            return { ...row, status: 'modify' };
                        } else if (prevStatus === 'error') {
                            return { ...row, status: prevStatus };
                        } else {
                            return { ...row, status: '' };
                        }
                    } else {
                        return row;
                    }
                }
            })
        );
    };

    // 서치박스에서 행 추가
    const handleSbInsert = (item: SortBySeqBtnItem) => {
        const insertParamPlus = item.param;
        if (initParam[0].sqlId === 0) {
            const whereData0 = initParam[0].params[0].where;

            const whereMap = whereData0.reduce((acc, item) => {
                acc[item.fdname] = item.value;
                return acc;
            }, {});

            insertParamPlus.forEach((obj) => {
                Object.keys(whereMap).forEach((key) => {
                    if (obj.hasOwnProperty(key)) {
                        obj[key] = whereMap[key];
                    }
                });
            });
        } else {
            insertParamPlus.forEach((obj) => {
                Object.keys(whereData).forEach((key) => {
                    if (obj.hasOwnProperty(key)) {
                        obj[key] = whereData[key];
                    }
                });
            });
        }

        insertParamPlus.forEach((obj) => {
            Object.keys(insertParam).forEach((key) => {
                if (obj.hasOwnProperty(key)) {
                    insertParam[key] = obj[key];
                }
            });
        });

        const id = randomId();
        const newRow = { ...insertParam, id: id };
        if (item.type === 'GRID_INSERT_SB_M') newRow.action_type = 'm';

        gridRef.current.updateRows([newRow]);
        gridRef.current.getRowParams &&
            gridRef.current.getRowParams(id) &&
            handleRowClick(gridRef.current.getRowParams(id));
        setRows((oldRows) => [newRow, ...oldRows]);
    };

    // 그리드 저장/삭제
    const handleBtn = async (item: SortBySeqBtnItem) => {
        const totalRows = [];
        let msg = '';
        if (item.type === 'GRID_SAVE') {
            msg = '저장하시겠습니까?';
            const editmodel = gridRef.current.getRowModels();

            editmodel.forEach((row) => {
                if (row.hasOwnProperty('isNew')) {
                    const isNew = row?.isNew ?? false;

                    if (isNew) {
                        if (row.status === 'upsert') {
                            row.action_type = 'm';
                        } else {
                            row.action_type = 'i';
                        }
                        totalRows.push(row);
                    }
                } else if (row.hasOwnProperty('hasChanged')) {
                    const hasChanged = row?.hasChanged ?? false;
                    if (hasChanged) {
                        row.action_type = 'u';
                        totalRows.push(row);
                    }
                }
                row.del_yn = 'N';
            });
            if (totalRows.length === 0) {
                alert('저장할 데이터가 없습니다.');
                return;
            }

            // 암호화 필요 데이터 검증
            const encryptedData = await validateRecursive(totalRows);
            if (!encryptedData) {
                console.log('암호화에 필요한 user_no가 없습니다.', encryptedData);
                return;
            }
        } else if (item.type === 'GRID_DELETE') {
            msg = '삭제하시겠습니까?';
            const selectRows = gridRef.current.getSelectedRows();

            // isNew가 아닌 행만 필터링
            const rowsToDelete = Array.from(selectRows).filter((row) => !row.isNew);
            rowsToDelete.forEach((row) => {
                row.action_type = 'd';
                row.del_yn = 'Y';
                totalRows.push(row);
            });

            if (selectRows.length === 0) {
                alert('삭제할 데이터가 없습니다.');
                return;
            }
        } else if (item.type === 'GRID_SAVE_ALL') {
            msg = '저장하시겠습니까?';
            rows.forEach((row) => {
                if (row.hasOwnProperty('isNew')) {
                    const isNew = row.isNew ?? false;

                    if (isNew) {
                        if (row.action_type === undefined) {
                            row.action_type = 'i';
                        }
                    }
                } else if (row.hasOwnProperty('hasChanged')) {
                    const hasChanged = row.hasChanged ?? false;
                    if (hasChanged) {
                        row.action_type = 'u';
                    }
                }

                row.del_yn = 'N';
                totalRows.push(row);
            });
            if (totalRows.length === 0) {
                alert('저장할 데이터가 없습니다.');
                return;
            }

            // 암호화 필요 데이터 검증
            const encryptedData = await validateRecursive(totalRows);
            if (!encryptedData) {
                console.log('암호화에 필요한 user_no가 없습니다.', encryptedData);
                return;
            }
        }

        const params = [...totalRows];

        params.forEach((row) => {
            row.scr_no = tpcdParam; // 화면번호
            row.scr_no = tpcdParam?.split('--')[0];
            row.scr_prord = tpcdParam?.split('--')[1];
        });

        const keysToRemove = ['seq', 'isNew', 'cbox', 'id', 'hasChanged', 'status', 'prevStatus'];

        const filteredData = params?.map((obj) =>
            Object.fromEntries(
                Object.entries(obj).filter(
                    ([key]) => !keysToRemove.includes(key) && !key.includes('preValue') && !key.includes('_plain')
                )
            )
        );

        let items = [
            {
                sqlId: item.sqlId,
                sql_key: item.sqlKey,
                params: filteredData,
            },
        ];

        let commonSaveData = [];

        // 공통저장의 경우 컬럼명을 기준으로 분리하여 저장한다
        if (item.sqlId === '0') {
            commonSaveData = filteredData.map((obj) => {
                const result = {};
                result.chg_info = {}; // 히스토리용 chg_info

                for (const [key, value] of Object.entries(obj)) {
                    if (key.includes('|')) {
                        const [parentKey, childKey] = key.split('|');

                        if (!result[parentKey]) {
                            result[parentKey] = {};
                        }

                        result[parentKey][childKey] = value;
                        result.chg_info[childKey] = value; // 히스토리 테이블용
                        result.chg_col_nm = parentKey; // 히스토리 테이블용
                    } else {
                        result[key] = value;
                    }
                }

                return result;
            });

            items = [
                {
                    sqlId: item.sqlId,
                    sql_key: item.sqlKey,
                    params: commonSaveData,
                },
            ];
        }

        if (confirm(msg)) {
            if (item.sqlId === '0') {
                fetcherPostCommonSave(items)
                    .then((response) => {
                        setMasterRetrieve(true);
                        // 재조회
                    })
                    .catch((error) => {
                        console.error(error);
                    })
                    .finally(() => {});
            } else {
                fetcherPostData(items)
                    .then((response) => {
                        // const return_cd = response[0].return_cd;
                        // if (return_cd === '40000') setMasterRetrieve(true);
                        // 재조회
                        setMasterRetrieve(true);
                    })
                    .catch((error) => {
                        console.error(error);
                    })
                    .finally(() => {});
            }
        } else {
            return;
        }
    };

    const mergeSequentialObjects = (data) => {
        if (!Array.isArray(data) || data.length === 0) return [];

        const result = [];
        let current = null;

        const objectFieldKeys = Object.entries(data[0])
            .filter(([_, v]) => typeof v === 'object' && !Array.isArray(v) && v !== null)
            .map(([k]) => k);

        for (let i = 0; i < data.length; i++) {
            const item = data[i];

            if (!current) {
                // 첫 객체 복사
                current = { ...item };

                // object 필드 초기화
                objectFieldKeys.forEach((key) => {
                    if (current[key]) current[key] = [current[key]];
                });
            } else {
                // 비교 기준 필드 (object 외 필드)만 비교
                const isSame = Object.entries(item).every(([k, v]) => {
                    // object 필드는 제외하고 비교
                    if (objectFieldKeys.includes(k)) return true;
                    return current[k] === v;
                });

                if (isSame) {
                    objectFieldKeys.forEach((key) => {
                        if (item[key]) current[key].push(item[key]);
                    });
                } else {
                    result.push(current);
                    current = { ...item };
                    objectFieldKeys.forEach((key) => {
                        if (current[key]) current[key] = [current[key]];
                    });
                }
            }
        }

        if (current) result.push(current);
        return result;
    };

    const handleSaveHpo = async (item) => {
        let totalRows = [];
        let msg = '';

        // 저장하지 않아야 할 key 삭제
        const keysToRemove = ['seq', 'isNew', 'cbox', 'id', 'hasChanged', 'status', 'prevStatus', 'hierarchy'];

        let filteredData = rows?.map((obj) =>
            Object.fromEntries(
                Object.entries(obj).filter(([key]) => !keysToRemove.includes(key) && !key.includes('preValue'))
            )
        );

        if (item.type === 'GRID_SAVE_HPO') {
            msg = '저장하시겠습니까?';

            // isNew나 hasChanged 있는지 확인
            const hasNewOrChanged = rows.some((row) => row.isNew || row.hasChanged);

            if (!hasNewOrChanged) {
                alert('저장할 데이터가 없습니다.');
                return;
            }

            // 암호화 필요 데이터 검증
            const encryptedData = await validateRecursive(filteredData);
            if (!encryptedData) {
                console.log('암호화에 필요한 user_no가 없습니다.', encryptedData);
                return;
            }
        } else if (item.type === 'GRID_DELETE_HPO') {
            msg = '삭제하시겠습니까?';

            // 체크 데이터 가져오기
            const selectRows = Array.from(gridRef.current.getSelectedRows().values());
            // isNew가 아닌 행만 필터링
            const rowsToDelete = selectRows.filter((row) => !row.isNew);

            // 체크 데이터 제외
            const filteredRows = rows.filter((row) => !rowsToDelete.some((deleteRow) => deleteRow.id === row.id));
            // 필요없는 key 삭제
            filteredData = filteredRows?.map((obj) =>
                Object.fromEntries(
                    Object.entries(obj).filter(([key]) => !keysToRemove.includes(key) && !key.includes('preValue'))
                )
            );
        }

        // 해당 컬럼 저장을 위해 앞의 key를 기준으로 병합 + 히스토리용 chg_info 생성
        const transformedRows = filteredData.map((row) => {
            const transformedRow = {};
            transformedRow.chg_info = {}; // 히스토리용 chg_info

            for (const [key, value] of Object.entries(row)) {
                if (key.includes('|')) {
                    const [parentKey, childKey] = key.split('|');

                    if (!transformedRow[parentKey]) {
                        transformedRow[parentKey] = {};
                    }

                    transformedRow[parentKey][childKey] = value;
                    transformedRow.chg_info[childKey] = value; // 히스토리 테이블용
                    transformedRow.chg_col_nm = parentKey; // 히스토리 테이블용
                } else {
                    transformedRow[key] = value;
                }
            }

            // 기본 속성 설정
            transformedRow.del_yn = 'N';
            transformedRow.scr_no = tpcdParam;
            if (!transformedRow.action_type) {
                transformedRow.action_type = 'm'; // 업서트
            }

            return transformedRow;
        });

        // 2단계: 객체 필드 병합
        const finalResult = mergeSequentialObjects(transformedRows);

        // totalRows에 변환된 행들을 추가
        totalRows = [...finalResult];

        const items = [
            {
                sqlId: item.sqlId,
                sql_key: item.sqlKey,
                params: totalRows,
            },
        ];

        if (confirm(msg)) {
            if (item.sqlId === '0') {
                fetcherPostCommonSave(items)
                    .then((response) => {
                        setMasterRetrieve(true);
                        // 재조회
                    })
                    .catch((error) => {
                        console.error(error);
                    })
                    .finally(() => {});
            } else {
                fetcherPostData(items)
                    .then((response) => {
                        // const return_cd = response[0].return_cd;
                        // if (return_cd === '40000') setMasterRetrieve(true);
                        // 재조회
                        setMasterRetrieve(true);
                    })
                    .catch((error) => {
                        console.error(error);
                    })
                    .finally(() => {});
            }
        } else {
            return;
        }
    };

    const handleSaveInvtn = (item) => {
        const totalRows = [];
        let msg = '';
        if (item.type === 'GRID_SAVE_INVTN') {
            msg = '저장하시겠습니까?';
            const editmodel = gridRef.current.getRowModels();
            editmodel.forEach((row) => {
                if (row.hasOwnProperty('isNew')) {
                    const isNew = row?.isNew ?? false;

                    if (isNew) {
                        row.action_type = 'i';
                        totalRows.push(row);
                    }
                } else if (row.hasOwnProperty('hasChanged')) {
                    const hasChanged = row?.hasChanged ?? false;
                    if (hasChanged) {
                        row.action_type = 'u';
                        totalRows.push(row);
                    }
                }
            });
        } else if (item.type === 'GRID_DELETE_INVTN') {
            msg = '삭제하시겠습니까?';
            const selectRows = gridRef.current.getSelectedRows();
            selectRows.forEach((row) => {
                row.action_type = 'd';
                totalRows.push(row);
            });
        } else if (item.type === 'GRID_INVTIN_RTRCN') {
            msg = '취소하시겠습니까?';
            const selectRows = gridRef.current.getSelectedRows();
            selectRows.forEach((row) => {
                row.action_type = 'c';
                totalRows.push(row);
            });
        }

        const param_data = [...totalRows];

        const items = [
            {
                sqlId: item.sqlId,
                sql_key: 'hpr_invtn_trpr_grid_cud',
                params: [{ trpr_info: param_data }],
            },
        ];

        const url = process.env.NEXT_PUBLIC_SSW_REDIS_SEARCH_ORIGIN_API_URL || '';

        if (confirm(msg)) {
            if (item.type === 'GRID_INVTIN_RTRCN') {
                let canCancel = true;
                items[0].params[0].trpr_info.forEach((row) => {
                    if (row.invtn_stts_cd !== 'hpr_group00005_cm0002') {
                        console.log('초대취소 불가 - 상태:', row.invtn_stts_cd);
                        canCancel = false;
                    }
                });

                if (!canCancel) {
                    alert("초대 상태가 '초대 대기중'이 아닌 항목이 있어 취소할 수 없습니다.");
                    return;
                }
            }

            fetcherPost([url, items])
                .then((response) => {
                    setMasterRetrieve(true);

                    console.log('response###', response[0].data[0].saaswin_hpr_invtn_trpr_grid_cud.err_json);
                    // user_no 배열 생성
                    const user_no_array = [];

                    // response 구조 확인 및 err_json 접근
                    if (
                        response &&
                        response[0] &&
                        response[0].data &&
                        response[0].data[0] &&
                        response[0].data[0].saaswin_hpr_invtn_trpr_grid_cud &&
                        response[0].data[0].saaswin_hpr_invtn_trpr_grid_cud.err_json
                    ) {
                        const errJson = response[0].data[0].saaswin_hpr_invtn_trpr_grid_cud.err_json;
                        console.log('err_json:', errJson);

                        // err_json 배열 순회
                        errJson.forEach((item) => {
                            // action_type이 'i'이고 error_msg가 없는 항목만 추가
                            if (item.action_type === 'i' && !item.error_msg && item.user_no) {
                                user_no_array.push(item.user_no);
                            }
                        });
                    }

                    // 배열에 값이 없으면 return
                    if (user_no_array.length === 0) {
                        console.log('성공한 초대가 없습니다.');
                        return;
                    }

                    // 배열에 값이 있으면 console.log 찍기
                    // console.log('성공한 초대의 user_no 배열:', user_no_array);
                    // 여기서 user_no_array 활용 가능
                    handleSaveKey(user_no_array);
                })
                .catch((error) => {
                    console.error(error);
                })
                .finally(() => {});
        } else {
            return;
        }
    };

    const handleSaveKey = (item: string[]) => {
        console.log('item', item);

        const items = [
            {
                sqlId: 'hrs_login01',
                sql_key: 'hrs_gen_one_rsakey',
                params: [{ user_no: item }],
            },
        ];

        fetcherPostData(items)
            .then((response) => {
                console.log('response#####', response);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    // 서치박스 핸들러
    const searchBoxHandler = (item: SortBySeqBtnItem) => {
        const srchParam = item.param;
        const msg = '실행하시겠습니까?';

        if (initParam[0].sqlId === 0) {
            const whereData0 = initParam[0].params[0].params[0].where;

            const whereMap = whereData0.reduce((acc, item) => {
                acc[item.fdname] = item.value;
                return acc;
            }, {});

            srchParam.forEach((obj) => {
                Object.keys(whereMap).forEach((key) => {
                    if (obj.hasOwnProperty(key)) {
                        obj[key] = whereMap[key];
                    }
                });
            });
        } else {
            srchParam.forEach((obj) => {
                Object.keys(whereData).forEach((key) => {
                    if (obj.hasOwnProperty(key)) {
                        obj[key] = whereData[key];
                    }
                });
            });
        }

        const url = process.env.NEXT_PUBLIC_SSW_SQL_SEARCH_API_URL;

        const items = [
            {
                sqlId: item.sqlId,
                params: srchParam,
            },
        ];

        if (confirm(msg)) {
            fetcherPost([url, items])
                .then((response) => {
                    alert('실행되었습니다.');
                    setMasterRetrieve(true);
                })
                .catch((error) => {
                    console.error(error);
                })
                .finally(() => {});
        } else {
            return;
        }
    };

    // SB 핸들러
    const SBHandler = (item: SortBySeqBtnItem) => {
        const srchParam = item.param;
        let msg = '';
        let succ_msg = '';

        if (initParam[0].sqlId === 0) {
            const whereData = initParam[0].params[0].params[0].where;

            const whereMap = whereData.reduce((acc, item) => {
                acc[item.fdname] = item.value;
                return acc;
            }, {});

            srchParam.forEach((obj) => {
                Object.keys(whereMap).forEach((key) => {
                    if (obj.hasOwnProperty(key)) {
                        obj[key] = whereMap[key];
                    }
                });
            });
        } else {
            const whereData = initParam[0].params[0].params[0].where;

            srchParam.forEach((obj) => {
                Object.keys(whereData).forEach((key) => {
                    if (obj.hasOwnProperty(key)) {
                        obj[key] = whereData[key];
                    }
                });
            });
        }

        if (item.type === 'SLRY_TRPR') {
            msg = '대상자를 생성하시겠습니까? 기존 대상자는 삭제 후 다시 생성합니다.';
            succ_msg = '생성되었습니다.';
        } else if (item.type === 'JOB_DDLN') {
            msg = ' 작업을 마감하시겠습니까?';
            succ_msg = '대상자 선정이 마감 처리되었습니다.';

            srchParam.forEach((obj) => {
                obj.flag = 'Y';
            });
        } else if (item.type === 'JOB_DDLN_CLS') {
            msg = ' 작업을 마감취소하시겠습니까?';
            succ_msg = '대상자 선정이 마감 취소처리되었습니다.';

            srchParam.forEach((obj) => {
                obj.flag = 'N';
            });
        }

        const items = [
            {
                sqlId: item.sqlId,
                sql_key: item.sqlKey,
                params: [srchParam[0]],
            },
        ];

        if (confirm(msg)) {
            fetcherPostData(items)
                .then((response) => {
                    if (item.retrieveYn) {
                        enqueueSnackbar(succ_msg, {
                            anchorOrigin: {
                                vertical: 'top',
                                horizontal: 'center',
                            },
                            variant: 'info',
                            autoHideDuration: 2000,
                        });
                        setKey && setKey((prevKey) => prevKey + 1);
                        setMasterRetrieve(true);
                    } else {
                        const data = response[0].data;

                        if (data && data.length > 0) {
                            const return_cd = response.return_cd;
                            if (return_cd === '40003') {
                                alert('대상자가 없습니다.');
                                setRows([]);
                            } else {
                                let seq = 1;
                                const id = randomId(); // 고유 ID 추가
                                const newRows = data.map((row, index) => ({
                                    id: id + index,
                                    seq: seq++,
                                    isNew: true,
                                    ...(seq === 2 ? { status: 'clicked' } : {}),
                                    ...(seq > 2 ? { status: 'new' } : {}),
                                    ...row,
                                }));
                                alert('생성되었습니다.');
                                setRows(newRows);
                            }
                        } else {
                            setRows([]);
                        }
                    }
                })
                .catch((error) => {
                    console.error(error);
                })
                .finally(() => {});
        } else {
            return;
        }
    };

    // 급여 버튼 핸들러
    const handleSlryBtn = (item: SortBySeqBtnItem) => {
        const user_no = 'WIN000031'; // 로그인 만들어지면 수정 필요
        const rprs_ognz_no = 'WIN';
        let totalRows = [];
        let msg = '';
        let succ_msg = '';

        let slry_ocrn_id = '';

        if (initParam[0]?.params[0]?.slry_ocrn_id) {
            slry_ocrn_id = initParam[0]?.params[0]?.slry_ocrn_id;
        }

        if (gridRef.current.getRowsCount() === 0) {
            alert('행이 없습니다.');
            return;
        }

        if (item.type === 'SLRY_SAVE') {
            msg = '저장하시겠습니까?';
            succ_msg = '저장되었습니다.';
            const editmodel = gridRef.current.getRowModels();
            const newOrEditingRows = Array.from(editmodel.values()).filter((row) => row.isNew || row.hasChanged);

            newOrEditingRows.forEach((row) => {
                if (row.hasOwnProperty('isNew')) {
                    const isNew = row?.isNew ?? false;

                    if (isNew) {
                        row.action_type = 'i';
                    }
                } else if (row.hasOwnProperty('hasChanged')) {
                    const hasChanged = row?.hasChanged ?? false;
                    if (hasChanged) {
                        row.action_type = 'u';
                    }
                }

                if (slry_ocrn_id !== '') {
                    row.slry_ocrn_id = slry_ocrn_id;
                }

                totalRows.push(row);
            });
        } else if (item.type === 'SLRY_DELETE') {
            msg = '삭제하시겠습니까?';
            succ_msg = '삭제되었습니다.';
            const selectRows = gridRef.current.getSelectedRows();
            // isNew가 아닌 행만 필터링
            const rowsToDelete = Array.from(selectRows).filter((row) => !row.isNew);
            rowsToDelete.forEach((row) => {
                row.action_type = 'd';
                totalRows.push(row);
            });
        } else if (item.type === 'SLRY_TRPR_SAVE') {
            msg = '저장하시겠습니까?';
            succ_msg = '저장되었습니다.';

            rows.forEach((row) => {
                totalRows.push(row);
            });
        } else if (item.type === 'SLRY_TRPR_DELETE') {
            msg = '삭제하시겠습니까?';
            succ_msg = '삭제되었습니다.';

            const selectRows = gridRef.current.getSelectedRows();
            // isNew가 아닌 행만 필터링
            const rowsToDelete = Array.from(selectRows).filter((row) => !row.isNew);

            const AllIds = gridRef.current.getAllRowIds();
            const filteredA = AllIds.filter((item) => !rowsToDelete.has(item));

            totalRows = rows.filter((item) => filteredA.some((deleteItem) => deleteItem === item.id));
        } else if (item.type === 'SLRY_DDLN') {
            msg = '급여를 마감하시겠습니까?';
            succ_msg = '마감되었습니다.';
            const selectRows = gridRef.current.getSelectedRows();
            // isNew가 아닌 행만 필터링
            const rowsToDelete = Array.from(selectRows).filter((row) => !row.isNew);

            rowsToDelete.forEach((row) => {
                row.flag = '1';
                totalRows.push(row);
            });
        } else if (item.type === 'SLRY_DDLN_CLS') {
            msg = '급여를 마감취소하시겠습니까?';
            succ_msg = '마감 취소되었습니다.';
            const selectRows = gridRef.current.getSelectedRows();
            // isNew가 아닌 행만 필터링
            const rowsToDelete = Array.from(selectRows).filter((row) => !row.isNew);

            rowsToDelete.forEach((row) => {
                row.flag = '2';
                totalRows.push(row);
            });
        } else if (item.type === 'SLRY_SAVE_ALL') {
            msg = '저장하시겠습니까?';
            succ_msg = '저장되었습니다.';

            rows.forEach((row) => {
                if (row.hasOwnProperty('isNew')) {
                    const isNew = row.isNew ?? false;

                    if (isNew) {
                        row.action_type = 'i';
                    }
                } else if (row.hasOwnProperty('hasChanged')) {
                    const hasChanged = row.hasChanged ?? false;
                    if (hasChanged) {
                        row.action_type = 'u';
                    }
                }

                if (slry_ocrn_id !== '') {
                    row.slry_ocrn_id = slry_ocrn_id;
                }

                totalRows.push(row);
            });
        } else if (item.type === 'SLRY_DELETE_ALL') {
            msg = '삭제하시겠습니까?!!';
            succ_msg = '삭제되었습니다.';

            const selectRows = gridRef.current.getSelectedRows();
            // isNew가 아닌 행만 필터링
            const rowsToDelete = Array.from(selectRows).filter((row) => !row.isNew);

            totalRows = rows.map((aItem) => {
                const isInB = rowsToDelete.has(aItem.id);

                // B 배열에 있으면 특정 키 추가
                if (isInB) {
                    return { ...aItem, action_type: 'd' };
                }
                return aItem;
            });
        }

        if (gridKey !== undefined) {
            const selectedRow = initParam[0].selectedRow;
            totalRows.forEach((obj) => {
                Object.keys(selectedRow).forEach((key) => {
                    obj[key] = selectedRow[key];
                });
            });
        }

        const items = [
            {
                sqlId: item.sqlId,
                sql_key: item.sqlKey,
                params: [{ slry_info: totalRows, slry_ocrn_id: slry_ocrn_id }],
            },
        ];

        if (confirm(msg)) {
            fetcherPostData(items)
                .then((response) => {
                    alert(succ_msg);
                    setMasterRetrieve(true);
                })
                .catch((error) => {
                    console.error(error);
                })
                .finally(() => {});
        } else {
            return;
        }
    };

    useEffect(() => {
        if (triggerSave) {
            // item이 undefined일 경우 기본 객체를 생성하여 전달
            console.log('itemasdfsadf');
            const defaultItem = {
                type: 'INVTN_SAVE',
            };
            // item이 있으면 그대로 사용하고, 없으면 기본 객체 사용
            if (item?.type !== 'CLCT_COL_DELETE') {
                handleInvtn(item || defaultItem);
            }
        }
    }, [triggerSave]);

    // 양식 저장 버튼 클릭시 실행 - formClct에서 사용
    const handleInvtn = (item: SortBySeqBtnItem) => {
        let msg = '';
        const editmodel = gridRef.current.getRowModels();
        const totalRows = [];
        if (item.type === 'INVTN_SAVE') {
            msg = '하시겠습니까?';
            if (confirm(msg)) {
                editmodel.forEach((row) => {
                    if (!invtnId) {
                        row.action_type = 'i';
                        totalRows.push(row);
                    } else {
                        if (row.hasOwnProperty('isNew')) {
                            const isNew = row?.isNew ?? false;

                            if (isNew) {
                                row.action_type = 'i';
                                totalRows.push(row);
                            }
                        } else if (row.hasOwnProperty('hasChanged')) {
                            const hasChanged = row?.hasChanged ?? false;
                            if (hasChanged) {
                                row.action_type = 'u';
                                totalRows.push(row);
                            }
                        } else {
                            if (!row.hasOwnProperty('action_type')) {
                                row.action_type = 'u';
                                totalRows.push(row);
                            }
                        }
                    }
                });
            }
        } else if (item.type === 'CLCT_COL_DELETE') {
            msg = '삭제하시겠습니까?';
            if (confirm(msg)) {
                const selectRows = gridRef.current.getSelectedRows();
                selectRows.forEach((row) => {
                    row.action_type = 'd';
                    totalRows.push(row);
                });
                console.log('totalRows', totalRows);
            }
        }

        console.log('editmodel', editmodel);
        // const param_data = [...totalRows];

        // handleSend 함수가 있으면 호출하고 결과 확인
        if (handleSend) {
            const sendResult = handleSend(item.type);
            // 명시적으로 false를 반환했을 경우 저장 중단
            if (sendResult === false) {
                return; // 제목 중복되면 저장 중단
            }
        }

        // 필요한 필드만 추출하여 새 배열 생성
        const extractedData = Array.from(editmodel.values()).map((row) => {
            return {
                action_type: row.action_type,
                artcl: row.artcl,
                com_cd_nm: row.com_cd_nm,
                com_cd: row.com_cd,
                clct_type: row.clct_type,
                clct_yn: row.clct_yn,
                esntl_yn: row.esntl_yn,
            };
        });

        console.log('extractedData', extractedData);
        const nameToUse = formName || invtnNm;

        if (nameToUse === null || nameToUse === undefined || nameToUse.trim() === '') {
            alert('양식 이름을 입력해주세요.');
            return;
        }

        const saveItem = [
            {
                sqlId: 'hpr_invtn01',
                sql_key: 'hpr_invtn_clct_dtl_cud',
                params: [
                    {
                        group_cd: 'hpr_group00001',
                        invtn_clct_id: invtnId || null, // 신규는 null, 수정은 ID 사용
                        clct_nm: nameToUse, // 현재 선택된 양식의 이름
                        artcl_info: extractedData,
                    },
                ],
            },
        ];

        fetcherPostData(saveItem)
            .then((response) => {
                console.log('양식 저장 완료:', response);
                setMasterRetrieve(true); // 저장 후 재조회
            })
            .catch((error) => {
                console.error('저장 에러:', error);
            });
    };

    // 일괄결재/반려 함수
    const handleAllApprove = (isApprove: boolean) => {
        // 1. 선택된 행 확인
        const selectedRows = gridRef.current.getSelectedRows();

        // 2. 선택된 항목이 없는 경우 처리
        if (selectedRows.size === 0) {
            alert('선택된 신청서가 없습니다.');
            return;
        }

        // 3. 선택된 행 추출
        const selectedRowsList = Array.from(selectedRows.values());

        // 4. 모든 선택된 행이 결재요청 상태인지 확인
        const invalidStatusExists = selectedRowsList.some((row) => row.approval_status_cd !== 'hrs_group00165_cm0500');

        if (invalidStatusExists) {
            alert('결재요청 상태인 신청서만 처리가 가능합니다.');
            return;
        }

        // 5. 선택된 행의 atrz_id 추출하여 쉼표로 연결
        const atrzIds = selectedRowsList.map((row) => row.atrz_id).join(',');

        // 6. 확인 메시지 표시
        const confirmMessage = isApprove
            ? '선택한 신청서를 일괄 결재하시겠습니까?'
            : '선택한 신청서를 일괄 반려하시겠습니까?';
        if (!confirm(confirmMessage)) {
            return;
        }

        // 7. API 호출
        const items = [
            {
                sqlId: 'hpo_efs01',
                sql_key: 'hpo_efs_aprvr_proc',
                params: [
                    {
                        atrz_id: atrzIds,
                        user_no: userNo,
                        is_approval: isApprove,
                        rjct_rsn: isApprove ? '' : '', // 반려 시 기본 사유 (필요시 모달로 입력 받을 수 있음)
                    },
                ],
            },
        ];

        fetcherPostData(items)
            .then((response) => {
                if (response && response.length > 0) {
                    const result = response[0].data;
                    if (result && result.success) {
                        alert(isApprove ? '일괄 결재가 완료되었습니다.' : '일괄 반려가 완료되었습니다.');
                        setMasterRetrieve(true); // 그리드 재조회
                    } else {
                        alert(result?.message || '처리 중 오류가 발생했습니다.');
                    }
                } else {
                    alert('처리 중 오류가 발생했습니다.');
                }
            })
            .catch((error) => {
                console.error(error);
                alert('처리 중 오류가 발생했습니다.');
            });
    };

    // 임시 시연 이벤트
    const handleTempEvent = () => {
        const formattedDate = dayjs().format('YYYY-MM-DD');
        const jbps = '상무';

        const paramList = [];

        // 시연할때 i를 1로 바꿔야함
        for (let i = 1; i < 34; i++) {
            if (i === 5) {
                continue;
            }
            const formattedNumber = String(i).padStart(6, '0');
            const obj = {
                move_dt: formattedDate,
                before_jbps_nm: '',
                after_jbps_nm: jbps,
                user_no: 'WIN' + formattedNumber,
            };
            paramList.push(obj);
        }

        const itemTest = [
            {
                nt_tmplt: 'TW_6589',
                scr_itg_no: '14',
                params: paramList,
            },
        ];

        sendAligoKakaoTalk(itemTest);
    };

    // 조직 개편 모달 열기
    const handleReorgRun = () => {
        setReorgModalOpen && setReorgModalOpen(true);
    };

    // 버튼 클릭 핸들러
    const handleBtnClick = (item: SortBySeqBtnItem) => {
        // const auth = JSON.parse(localStorage.getItem('auth') || '{}');
        // const {
        //     userNo,
        //     rprsOgnzNo,
        //     duty_cd,
        //     duty_nm,
        //     jbgd_cd,
        //     jbgd_nm,
        //     jbgp_cd,
        //     jbgp_nm,
        //     jbps_cd,
        //     jbps_nm,
        //     jbttl_cd,
        //     jbttl_nm,
        //     ipv4,
        //     ipv6,
        // } = auth?.state;
        // const os = getOs();
        // const buttonInfo = JSON.parse(localStorage.getItem('buttonText'));
        // const buttonText = buttonInfo?.state?.buttonText;
        // const browser = getBrowser();
        // const currPath = window.location.pathname;
        // const tpcd = currPath.split('/').pop() || '';
        // const buttonItem = {
        //     menu_no: tpcd,
        //     os,
        //     browser,
        //     ipv4,
        //     ipv6,
        //     userNo,
        //     duty_cd,
        //     duty_nm,
        //     jbgd_cd,
        //     jbgd_nm,
        //     jbgp_cd,
        //     jbgp_nm,
        //     jbps_cd,
        //     jbps_nm,
        //     jbttl_cd,
        //     jbttl_nm,
        //     buttonText,
        //     rprsOgnzNo,
        // };
        // fetcherPostUserClickLog(buttonItem);
        const checkRow = gridRef.current.getSelectedRows();

        // 저장의 경우 필수값체크
        if (item.type.includes('SAVE')) {
            const editmodel = gridRef.current.getRowModels();
            const newOrEditingRows = Array.from(editmodel.values()).filter((row) => row.isNew || row.hasChanged);
            const hasError = newOrEditingRows.some((row) => {
                return Object.keys(requiredColumn).some((col) => {
                    if (!row[col] || row[col] === '' || row[col] === null || row[col] === undefined) {
                        alert(`${requiredColumn[col]} 은(는) 필수 입력 항목입니다.`);
                        return true;
                    }
                    return false;
                });
            });

            if (hasError) {
                return;
            }
        }

        switch (item.type) {
            case 'GRID_DOWNLOAD':
            // gridRef.current.exportDataAsExcel(); // 기존 코드 주석 처리
            // exportToExcel(); // exportToExcel 함수 호출
            // break;
            case 'GRID_ALL_DOWNLOAD':
                // downloadAllHandler(sheetName);
                exportToExcel(); // ex
                break;
            case 'GRID_UPLOAD':
                console.log('GRID_UPLOAD');
                // handleFileUpload(event);
                break;
            case 'GRID_DELETE':
            case 'GRID_SAVE':
            case 'GRID_SAVE_ALL': // 전체 행 저장용
                handleBtn(item);
                break;
            case 'GRID_INVTIN_RTRCN':
            case 'GRID_SAVE_INVTN':
            case 'GRID_DELETE_INVTN':
                handleSaveInvtn(item);
                break;
            case 'CLCT_COL_DELETE':
            case 'CLCT_SAVE':
                handleInvtn(item);
                break;
            case 'SLRY_TRPR_DELETE':
            case 'SLRY_DELETE':
            case 'SLRY_DELETE_ALL':
            case 'SLRY_TRPR_SAVE':
            case 'SLRY_SAVE':
            case 'SLRY_SAVE_ALL':
            case 'SLRY_DDLN':
            case 'SLRY_DDLN_CLS':
                handleSlryBtn(item);
                break;
            case 'REORG_RUN':
                handleReorgRun();
                break;
            case 'GRID_INSERT_M': // upsert용
            case 'GRID_INSERT':
                handleInsert(item.type);
                break;
            case 'GRID_INSERT_SB_M': // upsert용
            case 'GRID_INSERT_SB':
                handleSbInsert(item);
                break;
            case 'GRID_SAVE_HPO':
            case 'GRID_DELETE_HPO':
                handleSaveHpo(item);
                break;
            case 'SEARCH':
                if (confirm('작업한 내용을 취소하고 처음 조회된 데이터로 되돌리시겠습니까?')) {
                    // 원래 데이터로 되돌리는 로직
                }
                break;
            case 'GRID_OPTION':
                // optionHandler();
                break;
            case 'GRID_OPTION_SB':
                searchBoxHandler(item);
                break;
            case 'SLRY_TRPR':
            case 'JOB_DDLN':
            case 'JOB_DDLN_CLS':
                SBHandler(item);
                break;
            case 'COM_POP':
                if (setModalData) {
                    handleFullModal('NEW', gridRef, item.modalPath, setModalData);
                }
                break;
            case 'PAY_CAL':
                if (setModalData) {
                    handleFullModal('NEW', gridRef, item.modalPath, setModalData);
                }
                break;
            case 'TEMP_EVENT':
                handleTempEvent();
                break;
            case 'COM_CHK_POP':
                if (setModalData) {
                    handleCheckModal(gridRef, item.modalPath, setModalData);
                }
                break;
            case 'COM_DUTY_POP':
                if (setModalData) {
                    handleDutySetting(gridRef, item.modalPath, setModalData, setRows, userNo);
                }
                break;
            case 'AGT_AUTH':
                if (checkRow.size === 0) alert('권한을 변경할 행을 선택해주세요');
                else {
                    setAgtAuthData(Array.from(checkRow.values()));
                    setAgtAuthModalOpen && setAgtAuthModalOpen(true);
                }
                break;
            case 'ACNT_LOCK':
                const rowData = Array.from(checkRow.values());
                let lockYn = true;
                if (rowData.length > 1) {
                    for (let i = 0; i < rowData.length - 1; i++) {
                        const currentElement = rowData[i];
                        const nextElement = rowData[i + 1];

                        // 다른 계정상태가 섞여있으면 break
                        if (currentElement?.['bsc_info|acnt_stts_cd'] !== nextElement?.['bsc_info|acnt_stts_cd']) {
                            enqueueSnackbar(
                                '계정 잠금/잠금해제를 실행할 수 없습니다. \n "활성화" 또는 "계정 잠김" 상태 1가지만 선택 후 실행해주세요.',
                                {
                                    anchorOrigin: {
                                        vertical: 'top',
                                        horizontal: 'center',
                                    },
                                    variant: 'error',
                                    autoHideDuration: 2000,
                                }
                            );
                            lockYn = false;
                            break;
                        }
                    }
                }

                if (lockYn && setModalData) {
                    handleCheckModal(gridRef, item.modalPath, setModalData);
                }
                break;

            case 'ALL_APPROVE':
                handleAllApprove(true);
                break;
            case 'ALL_REJECT':
                handleAllApprove(false);
                break;
            default:
                break;
        }
    };

    // 버튼 렌더링 함수
    const renderGridButtons = () => {
        if (!masterUI) {
            // 일반 버튼 렌더링
            return (
                <>
                    <Stack
                        direction={'row'}
                        spacing={2}
                        sx={{ justifyContent: 'space-between', margin: 0, alignItems: 'center', pb: '15px' }}
                    >
                        {item && item.data_se_cd === gridKey && (
                            <>
                                <Typography type='table' tooltip title={t(item.grid_tit_info?.description) || ''}>
                                    {t(item.grid_tit_info?.ttl) || ''}
                                </Typography>
                                {rowData && <span>총 {rowData.length}건</span>}
                            </>
                        )}
                    </Stack>
                    <Stack direction={'row'} sx={{ justifyContent: 'space-between', alignItems: 'center', gap: '5px' }}>
                        {item && item.data_se_cd === gridKey && item.grid_btn_info
                            ? item.grid_btn_info
                                  .slice() // 원본 배열을 복사하여 새로운 배열 생성
                                  .sort((a, b) => b.seq - a.seq) // seq 값 기준으로 내림차순 정렬
                                  .map((items: SortBySeqBtnItem) => (
                                      <Button
                                          id={items.seq}
                                          key={items.seq}
                                          onClick={() => handleBtnClick(items)}
                                          className='btnPrimary'
                                          size='md'
                                      >
                                          {items.text}
                                      </Button>
                                  ))
                            : ''}
                    </Stack>
                </>
            );
        } else {
            // masterUI가 있는 경우의 버튼 렌더링
            return (
                <div className='gridHeader'>
                    <Typography type='table' tooltip title={t(description) || ''}>
                        {t(gridTitleData || '')}
                    </Typography>
                    {rowData && <span className='total'>총 {rowData.length}건</span>}
                    <Stack direction={'row'} sx={{ justifyContent: 'space-between', alignItems: 'center', gap: '5px' }}>
                        {showByKeyBtn?.map((item: SortBySeqBtnItem) => {
                            return (
                                <CustomButton
                                    key={item.seq}
                                    customButton={item}
                                    clickEvent={() => handleBtnClick(item)}
                                    setData={setRows}
                                    className='btnPrimary sm reset'
                                    masterUI={masterUI}
                                />
                            );
                        })}
                    </Stack>
                </div>
            );
        }
    };

    return <>{renderGridButtons()}</>;
};

export default GridButtons;
