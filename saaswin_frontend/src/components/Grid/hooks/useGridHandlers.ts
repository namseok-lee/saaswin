import { useCallback } from 'react';
import { GridApiRef, GridEventListener, GridRowId } from '@mui/x-data-grid-premium';
import { randomId } from '@mui/x-data-grid-generator';
import { useSheetStore } from 'utils/store/sheet';
import { RowData } from '../types';
import { fetcherPostDecrypt } from 'utils/axios';
import { CryptoService } from '@/services/CryptoService';

interface ModalData {
    modal_info: {} | null;
    // evl_prgrs_stts_cd: string;
    open: boolean;
    modalPath: string;
}
interface UseGridHandlersProps {
    treeYn: boolean;
    gridRef: GridApiRef;
    rows: RowData[];
    setRows: React.Dispatch<React.SetStateAction<RowData[]>>;
    setContextMenu: React.Dispatch<
        React.SetStateAction<{
            mouseX: number;
            mouseY: number;
            row: Record<string, any>;
        } | null>
    >;
    setAnchorEl: React.Dispatch<React.SetStateAction<boolean>>;
    setDataParam?: (value: React.SetStateAction<any>) => void;
    setModalData: React.Dispatch<React.SetStateAction<ModalData | null>>;
    dataSeInfo?: any[];
    sheetName?: string;
    handleFullModal: (id: string, path: string) => void | Promise<void>;
    handleAttachModal: (id: string, path: string) => void | Promise<void>;
    handleOrgChartModal: (id?: string) => void | Promise<void>;
}

export function useGridHandlers({
    treeYn,
    gridRef,
    rows,
    setRows,
    setModalData,
    setContextMenu,
    setAnchorEl,
    setDataParam,
    dataSeInfo = [],
    sheetName = '',
    handleFullModal,
    handleAttachModal,
    handleOrgChartModal,
}: UseGridHandlersProps) {
    // useSheetStore에서 필요한 상태와 함수 가져오기
    const changeSheet = useSheetStore((state) => state.changeSheet);

    // 체크박스 클릭 이벤트 핸들러
    const CheckEvent: GridEventListener<'cellClick'> = useCallback(
        (params, event, details) => {
            const rowId = params.row.id;
            const field = params.field;
            const isNew = params.row.isNew;

            changeSheet(gridRef.current, rowId);

            if (field === '__check__' && isNew && !treeYn) {
                gridRef.current.updateRows([{ id: rowId, _action: 'delete' }]);
                setRows((rows) => rows.filter((item) => item.id !== rowId));

                const firstId = gridRef.current.getRowIdFromRowIndex(0);
                if (firstId) {
                    handleRowClick(gridRef.current.getRowParams(firstId));
                }
            }
        },
        [gridRef, setRows, changeSheet]
    );

    // 셀 편집 시작 이벤트 핸들러
    const editStartEvent: GridEventListener<'cellEditStart'> = useCallback(
        (params, event, details) => {
            const rowId = params.id;
            const field = params.field;
            const prefield = `${field}preValue`;
            let value = gridRef.current.getCellValue(rowId, field); // 이전값
            const isNew = params.row.isNew ?? false;

            if (!params.row[prefield] && !isNew) {
                if (typeof value === 'boolean') {
                    value = value ? 'Y' : 'N';
                }

                gridRef.current.updateRows([{ id: rowId, [prefield]: value === undefined ? null : value }]);

                setRows((prevItems) =>
                    prevItems.map((item) =>
                        item.id === rowId && item[prefield] === undefined
                            ? { ...item, [prefield]: value === undefined ? null : value }
                            : item
                    )
                );
            }
        },
        [gridRef, setRows]
    );

    // 행 클릭 이벤트 핸들러
    const handleRowClick = useCallback(
        (params: { id: GridRowId; row: RowData }) => {
            const clickedRowId = params.id;
            setRows((prevRows) =>
                prevRows.map((row) => {
                    if (row.id === clickedRowId) {
                        return { ...row, status: 'clicked', prevStatus: row.status };
                    } else {
                        const { status, prevStatus, ...rest } = row;
                        if (status === 'clicked' && prevStatus) {
                            return { ...rest, status: row.prevStatus };
                        } else {
                            return row as RowData;
                        }
                    }
                })
            );

            if (sheetName === 'mySheet1' && dataSeInfo.length > 0) {
                setDataParam?.((prevDataParam: any) => {
                    const currentDetail = prevDataParam?.detail || [];
                    return {
                        ...prevDataParam,
                        detail: currentDetail.map((item: any) => ({
                            ...item,
                            selectedRow: params.row,
                        })),
                    };
                });
            }
        },
        [setRows, setDataParam, dataSeInfo, sheetName]
    );

    // 행 수정 시 변경 사항 처리
    const changeDifferRow = useCallback(
        (newRow: RowData, oldRow: RowData, type: string) => {
            const isNew = oldRow?.isNew ?? false;
            const rowId = newRow.id;
            let updatedFields = Object.keys(newRow).filter((key) => newRow[key] !== oldRow[key])[0];
            if (!isNew && updatedFields !== undefined) {
                const comFieles = Object.keys(newRow).filter((key) => newRow[key] !== oldRow[key] && key in oldRow);

                if (type === 'user') updatedFields = 'user_no';
                else if (type === 'ognz') updatedFields = 'ognz_info|ognz_no';
                else if (type === 'user_info|zip') updatedFields = 'user_info|zip';
                else if (type === 'ognz_info|zip') updatedFields = 'ognz_info|zip';

                const preFields = updatedFields + 'preValue';

                const replaceWithNullUsingRegex = (str: string | object) => {
                    if (typeof str === 'object') {
                        return str;
                    }
                    return /^\s*$/.test(str) ? null : str;
                };

                const originValue =
                    newRow[preFields] === undefined ? null : replaceWithNullUsingRegex(newRow[preFields]);
                let changeValue =
                    newRow[updatedFields] === undefined ? null : replaceWithNullUsingRegex(newRow[updatedFields]);

                if (typeof changeValue === 'boolean') {
                    changeValue = changeValue ? 'Y' : 'N';
                }

                Object.keys(newRow).forEach((key) => {
                    if (key === updatedFields) {
                        newRow[updatedFields] = changeValue;
                    }
                    if (newRow[key] === undefined) {
                        newRow[key] = null;
                    }
                });

                // 복호화 값 적용
                if (type === 'encrypt') {
                    gridRef.current.updateRows([newRow]);
                    setRows((prevItems) => prevItems.map((item) => (item.id === rowId ? { ...newRow } : item)));
                    return newRow;
                }

                if (originValue !== changeValue) {
                    const changeRow = { ...newRow, hasChanged: true, status: 'modify' };

                    gridRef.current.updateRows([changeRow]);
                    setRows((prevItems) => prevItems.map((item) => (item.id === rowId ? { ...changeRow } : item)));
                    return changeRow;
                } else if (originValue === changeValue) {
                    const changeRow = { ...newRow };
                    if (comFieles.length > 0) {
                        comFieles.forEach((element) => {
                            delete changeRow[element + 'preValue'];
                        });
                    }

                    delete changeRow[preFields];
                    const matchingField = Object.keys(changeRow).filter((key) => key === 'preValue');
                    if (matchingField.length === 0) {
                        delete changeRow.hasChanged;
                        delete changeRow.status;
                    }

                    gridRef.current.updateRows([changeRow]);
                    setRows((prevItems) => prevItems.map((item) => (item.id === rowId ? { ...changeRow } : item)));
                    return changeRow;
                }
            }

            setRows((prevItems) => prevItems.map((item) => (item.id === rowId ? { ...newRow } : item)));

            return newRow;
        },
        [gridRef, setRows]
    );

    // 컨텍스트 메뉴 핸들러
    const handleContextMenu = useCallback(
        (event: React.MouseEvent, row: Record<string, any>) => {
            event.preventDefault();
            event.stopPropagation();
            setContextMenu({
                mouseX: event.clientX,
                mouseY: event.clientY,
                row,
            });
            setAnchorEl(true);
        },
        [setContextMenu, setAnchorEl]
    );

    // 새 행 추가 핸들러
    const handleAddRow = useCallback(() => {
        const contextMenuState = gridRef.current.getState().contextMenu;
        if (!contextMenuState) return;

        const contextRowId = contextMenuState.id;
        if (!contextRowId) return;

        const contextRow = rows.find((row) => row.id === contextRowId);
        if (!contextRow) return;

        const hierarchyArray =
            typeof contextRow.hierarchy === 'string' ? contextRow.hierarchy.split('$') : contextRow.hierarchy;

        const newRow = {
            ...Object.keys(contextRow).reduce((acc, key) => {
                acc[key] = Array.isArray(contextRow[key])
                    ? []
                    : typeof contextRow[key] === 'object' && contextRow[key] !== null
                    ? null
                    : '';
                return acc;
            }, {} as Record<string, any>),
            id: randomId(),
            hierarchy: [...hierarchyArray, '새 그룹'],
            seq: rows.length + 1,
        };

        const rowIndex = rows.findIndex((r) => r.id === contextRow.id);
        if (rowIndex === -1) {
            console.error('Row not found.');
            return;
        }

        const updatedRows = [...rows];
        updatedRows.splice(rowIndex + 1, 0, newRow);
        setRows(updatedRows);
        setAnchorEl(false);
    }, [gridRef, rows, setRows, setAnchorEl]);

    // 행 삭제 핸들러
    const handleDeleteRow = useCallback(() => {
        const contextMenuState = gridRef.current.getState().contextMenu;
        if (!contextMenuState) return;

        const contextRowId = contextMenuState.id;
        if (!contextRowId) return;

        const contextRow = rows.find((row) => row.id === contextRowId);
        if (!contextRow) return;

        const targetHierarchy = contextRow.hierarchy;

        setRows((prevData) =>
            prevData.filter((row) => {
                return !row.hierarchy.some(
                    (_: any, index: number) => row.hierarchy.slice(0, index + 1).join('/') === targetHierarchy.join('/')
                );
            })
        );

        setAnchorEl(false);
    }, [gridRef, rows, setRows, setAnchorEl]);

    // 주소 선택 처리 핸들러
    const handleAddressSelection = useCallback(
        (addressData: Record<string, any>, clickRow: GridRowId, clickField: string) => {
            if (!clickRow) return;

            const row = gridRef.current.getRow(clickRow);
            const postField = clickField?.substring(0, clickField.indexOf('zip'));
            if (!postField) return;
            const isNew = row.isNew ?? false;
            let updateRow = { ...row, hasChanged: true };

            if (addressData?.zip) {
                updateRow = {
                    ...updateRow,
                    [clickField]: addressData?.zip,
                    [`${postField}addr`]: addressData?.addr,
                    [`${postField}eng_addr`]: addressData?.eng_addr,
                };
            }

            changeDifferRow(updateRow, row, 'zip');
            gridRef.current.updateRows([updateRow]);
        },
        [gridRef, changeDifferRow]
    );

    // 셀 클릭 핸들러
    const handleCellClick = useCallback(
        (id: string, path: string) => {
            handleFullModal(id, path);
        },
        [handleFullModal]
    );

    // 행 관련 액션 핸들러
    const handleActionClick = useCallback(
        (type: string, id: string, row: Record<string, any>, sqlId: string) => {
            switch (type) {
                case 'EVL_POP':
                    handleFullModal(id);
                    break;
                case 'ORG_POP':
                    handleOrgChartModal(id);
                    break;
                default:
                    break;
            }
        },
        [handleFullModal, handleOrgChartModal]
    );

    // 행 편집 가능 여부 체크
    // 해당 기능 사용 시 전체 컬럼에 조건을 넣어주어야합니다.
    const handleRowEditable = (params: any) => {
        const { row, colDef } = params;
        const isNew = row.isNew ?? false;

        const editCondition = colDef.editCondition; // 편집 조건
        const editValue = colDef.editValue; // 기준 값
        const editColumn = colDef.editColumn; // 기준 열

        if (isNew) {
            return true;
        }

        // 조건 없는 경우 편집가능
        if (!colDef.editCondition || colDef.editValue === undefined) {
            return true;
        }

        // 연산자 조건 추가
        const conditionOperators = {
            less: (a, b) => a < b,
            lessOrEqual: (a, b) => a <= b,
            equal: (a, b) => a === b,
            notEqual: (a, b) => a !== b,
            greater: (a, b) => a > b,
            greaterOrEqual: (a, b) => a >= b,
            contains: (a, b) => String(a).includes(b),
            startsWith: (a, b) => String(a).startsWith(b),
            endsWith: (a, b) => String(a).endsWith(b),
            isEmpty: (a) => a === null || a === undefined || a === '',
            isNotEmpty: (a) => a !== null && a !== undefined && a !== '',
        };

        // 기준열 열의 실제 데이터
        const fieldValue = row[editColumn];

        // 연산자 조합
        const operator = conditionOperators[editCondition];

        if (!operator) {
            return true; // 지원하지 않는 연산자
        }

        // 연산 결과 true면 해당 행 편집 불가능
        return !operator(fieldValue, editValue);
    };

    // 복호화
    const handleEncrypt = async (params: any, encryptFields: string) => {
        const { row, field } = params;
        const { user_no } = row;
        const pipeIndex = encryptFields.indexOf('|'); // jsonb타입 필드인지 확인
        const newKey = pipeIndex !== -1 ? encryptFields.substring(pipeIndex + 1) : encryptFields; // jsonb타입 필드일 경우 필드명 추출
        let encptData = {};
        let privateKeyPEM = '';
        let decryptedValue = '';
        const item = [{ user_no: user_no, trgt_key: newKey }];
        fetcherPostDecrypt([process.env.NEXT_PUBLIC_SSW_ENCRYPT_API_URL, item])
            .then(async (response) => {
                // user_no와 work_user_no가 동일한 경우 본인이므로 그리드에 있는 데이터를 반환
                //  다른 경우 조회해온 암호문을 같이 반환하여야한다.
                const data = response[0];
                if (user_no !== data.work_user_no) {
                    encptData = {
                        encryptedAesKey: data.encryptedAesKey,
                        encryptedData: data.encryptedData,
                        iv: data.iv,
                        user_no: user_no,
                    };
                } else {
                    encptData = row[field];
                }
                // 개인키
                privateKeyPEM = data.work_user_prvtkey;
                decryptedValue = await CryptoService.decryptHybrid(encptData, privateKeyPEM);

                params.api.setEditCellValue({
                    id: params.id,
                    field: params.field,
                    value: decryptedValue ? decryptedValue : '',
                });

                const newRow = {
                    ...row,
                    ...(typeof row[params.field] === 'object'
                        ? { [params.field + 'preValue']: row[params.field] }
                        : {}),
                    [params.field]: decryptedValue.substring(0, 6) + '-' + decryptedValue.substring(6, 13),
                };

                changeDifferRow(newRow, row, 'encrypt');
            })
            .catch((error) => {
                console.error(error);
            });
    };

    return {
        CheckEvent,
        editStartEvent,
        handleRowClick,
        changeDifferRow,
        handleContextMenu,
        handleAddRow,
        handleDeleteRow,
        handleAddressSelection,
        handleCellClick,
        handleActionClick,
        handleRowEditable,
        handleEncrypt,
        handleAttachModal,
    };
}
