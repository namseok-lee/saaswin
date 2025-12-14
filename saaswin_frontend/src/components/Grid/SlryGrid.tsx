'use client';
import { Box, Divider, Menu, MenuItem, Stack, Tooltip } from '@mui/material';
import { darken, lighten, styled, Theme } from '@mui/material/styles';
import { randomId } from '@mui/x-data-grid-generator';
import {
    DataGridPremium,
    DataGridPremiumProps,
    GridColDef,
    GridColumnGroupingModel,
    GridColumnMenuFilterItem,
    GridColumnMenuPinningItem,
    GridColumnMenuProps,
    GridColumnMenuSortItem,
    GridEventListener,
    GridRowId,
    GridRowModesModel,
    GridRowsProp,
    GridSlots,
    useGridApiContext,
    useGridApiEventHandler,
    useGridApiRef,
} from '@mui/x-data-grid-premium';
import CommonPopup from 'components/CommonPopup';
import EvaluationFullDialog from 'components/FullDialog/evaluation/EvaluationFullDialog';
import PayFullDialog from 'components/FullDialog/pay/PayFullDialog';
import SearchAddress from 'components/SearchAddress';
import { treeData } from 'data/gridTreeBinding';
import dayjs from 'dayjs';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { enqueueSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetcherPost, fetcherPostCommonSave, fetcherPostData } from 'utils/axios';
import { useSheetStore } from 'utils/store/sheet';
import * as XLSX from 'xlsx';
import { ColBinding } from '../../data/ColBinding';
import CustomButton from '../CustomButton';
import '../../styles/styles.scss';
import Typography from 'components/Typography';
import Button from 'components/Button';
import { IcoEmpty2Blue } from '@/assets/Icon';

interface enumItemProps {
    enum: string;
    enumKey: string;
}
interface gridDataItem {
    seq: string;
    id: string;
    header1: string | null;
    header2: string;
    type: string;
    align?: string;
    width: string;
    required?: string;
    canedit?: string;
    insertedit?: string;
    insertdefault?: string;
    visible?: string;
    enum?: enumItemProps;
    emptyvalue?: string;
    customformat?: string;
    formula?: string;
    dateformat?: string;
    maxWidth?: string;
    minwidth?: string;
}
interface gridDataProps {
    masterUI: any;
    tpcdParam: string;
    gridData: gridDataItem[];
    rowData: any;
    treeCol: string;
    sheetName: string;
    setDetailRetrieve: Function;
    dataSeInfo: any;
    gridKey: string;
    item: any;
    initParam: any;
}

const StyledGridOverlay = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    '& .no-rows-primary': {
        fill: '#3D4751',
        ...theme.applyStyles('light', {
            fill: '#AEB8C2',
        }),
    },
    '& .no-rows-secondary': {
        fill: '#1D2126',
        ...theme.applyStyles('light', {
            fill: '#E8EAED',
        }),
    },
    '& .super-app-theme--clicked': {
        backgroundColor: '#F5FBFF',
        '&:hover': {
            ...getBackgroundColor(theme.palette.info.main, theme, 0.6),
        },
        '&.Mui-selected': {
            backgroundColor: '#F5FBFF',
            '&:hover': {
                ...getBackgroundColor(theme.palette.info.main, theme, 0.4),
            },
        },
    },
    '& .super-app-theme--new': {
        ...getBackgroundColor(theme.palette.success.main, theme, 0.9),
        '&:hover': {
            ...getBackgroundColor(theme.palette.success.main, theme, 0.7),
        },
        '&.Mui-selected': {
            backgroundColor: '#F5FBFF',
            '&:hover': {
                ...getBackgroundColor(theme.palette.success.main, theme, 0.4),
            },
        },
    },
    '& .super-app-theme--modify': {
        ...getBackgroundColor(theme.palette.warning.main, theme, 0.9),
        '&:hover': {
            ...getBackgroundColor(theme.palette.warning.main, theme, 0.7),
        },
        '&.Mui-selected': {
            backgroundColor: '#F5FBFF',
            '&:hover': {
                ...getBackgroundColor(theme.palette.warning.main, theme, 0.4),
            },
        },
    },
}));

const getBackgroundColor = (color: string, theme: Theme, coefficient: number) => ({
    backgroundColor: darken(color, coefficient),
    ...theme.applyStyles('light', {
        backgroundColor: lighten(color, coefficient),
    }),
});

function CustomNoRowsOverlay() {
    return (
        <StyledGridOverlay>
            <IcoEmpty2Blue />
            <Box sx={{ mt: 2, color: '#7C7C7C' }}>데이터가 존재하지 않습니다.</Box>
        </StyledGridOverlay>
    );
}

function customCheckbox(theme: Theme) {
    return {
        '& .MuiCheckbox-root svg': {
            width: 16,
            height: 16,
            backgroundColor: 'transparent',
            border: '1px solid #d9d9d9',
            borderRadius: 2,
            ...theme.applyStyles('dark', {
                borderColor: 'rgb(67, 67, 67)',
            }),
        },
        '& .MuiCheckbox-root svg path': {
            display: 'none',
        },
        '& .MuiCheckbox-root.Mui-checked:not(.MuiCheckbox-indeterminate) svg': {
            backgroundColor: '#1890ff',
            borderColor: '#1890ff',
        },
        '& .MuiCheckbox-root.Mui-checked .MuiIconButton-label:after': {
            position: 'absolute',
            display: 'table',
            border: '2px solid #fff',
            borderTop: 0,
            borderLeft: 0,
            transform: 'rotate(45deg) translate(-50%,-50%)',
            opacity: 1,
            transition: 'all .2s cubic-bezier(.12,.4,.29,1.46) .1s',
            content: '""',
            top: '50%',
            left: '39%',
            width: 5.71428571,
            height: 9.14285714,
        },
        '& .MuiCheckbox-root.MuiCheckbox-indeterminate .MuiIconButton-label:after': {
            width: 8,
            height: 8,
            backgroundColor: '#1890ff',
            transform: 'none',
            top: '39%',
            border: 0,
        },
    };
}

export const StyledDataGrid = styled(DataGridPremium)(({ theme }) => ({
    ...customCheckbox(theme), // 체크박스 체크 시 배경 변경
    ...theme.applyStyles('light', {
        color: 'rgba(0,0,0,.85)',
    }),
    '& .super-app-theme--clicked': {
        backgroundColor: '#F5FBFF',
        '&:hover': {
            backgroundColor: '#F5FBFF',
        },
        '&.Mui-selected': {
            backgroundColor: '#F5FBFF',
            '&:hover': {
                backgroundColor: '#F5FBFF',
            },
        },
    },
    '& .super-app-theme--new': {
        backgroundColor: '#F5FBFF',
        '&:hover': {
            backgroundColor: '#F5FBFF',
        },
        '&.Mui-selected': {
            backgroundColor: '#F5FBFF',
            '&:hover': {
                backgroundColor: '#F5FBFF',
            },
        },
    },
    '& .super-app-theme--modify': {
        backgroundColor: '#F5FBFF',
        '&:hover': {
            backgroundColor: '#F5FBFF',
        },
        '&.Mui-selected': {
            backgroundColor: '#F5FBFF',
            '&:hover': {
                backgroundColor: '#F5FBFF',
            },
        },
    },
    '& .super-app-theme--error': {
        ...getBackgroundColor(theme.palette.error.main, theme, 0.9),
        '&:hover': {
            ...getBackgroundColor(theme.palette.error.main, theme, 0.7),
        },
        '&.Mui-selected': {
            backgroundColor: '#F5FBFF',
            '&:hover': {
                ...getBackgroundColor(theme.palette.error.main, theme, 0.4),
            },
        },
    },
}));

interface EditToolbarProps {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (newModel: (oldModel: GridRowModesModel) => GridRowModesModel) => void;
}
interface SortBySeqBtnItem {
    api: string;
    seq: string;
    sql: string;
    sqlId: string;
    sqlKey: string;
    text: string;
    type: string;
    param: Record<string, any>;
}
function SlryGrid({
    masterUI,
    tpcdParam,
    setMasterRetrieve,
    gridData,
    rowData,
    treeCol,
    sheetName,
    setDataParam,
    dataSeInfo,
    item,
    gridKey,
    userData,
    ognzData,
    comboData,
    initParam,
    setKey,
    formName,
    handleSend,
    setHasChange,
}: gridDataProps) {
    const [modalData, setModalData] = useState([]);
    const [payModalData, setPayModalData] = useState([]);
    const [comModalData, setComModalData] = useState(null);
    const [comModalOpen, setComModalOpen] = useState(false);
    const [columns, setColumns] = useState<GridColDef | null>(null);
    const [columnGroupingModel, setColumnGroupingModel] = useState<GridColumnGroupingModel | null>(null);
    const [pinnedColumns, setPinnedColumns] = useState({});
    const [insertParam, setInsertParam] = useState({});
    const [columnVisibilityModel, setColumnVisibilityModel] = useState({});
    const [checkboxSelection, setCheckboxSelection] = useState(false);
    const [anchorEl, setAnchorEl] = useState<boolean>(false);
    const [adressData, setAdressData] = useState(); // 주소찾기 추가
    const [postOpen, setPostOpen] = useState(false); // 주소찾기 추가
    const [clickRow, setClickRow] = useState<GridRowId | null>(null); // 주소찾기 추가
    const [clickfield, setClickField] = useState<GridRowId | null>(null); // 주소찾기 추가
    const [contextMenu, setContextMenu] = useState<{
        mouseX: number;
        mouseY: number;
        row: any;
    } | null>(null);
    const [empOpen, setEmpOpen] = useState(false);
    const [userInfo, setUserInfo] = useState({}); // TextField에 표시될 요소
    const handleEmpOpen = () => {
        setEmpOpen(!empOpen);
    };
    const [orgOpen, setOrgOpen] = useState(false);
    const [orgInfo, setOrgInfo] = useState({});
    const handleOrgOpen = () => {
        setOrgOpen(!orgOpen);
    };
    const [rows, setRows] = useState([]);
    const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});
    const description = masterUI?.grid_tit_info?.[0].description;
    const gridTitleData = masterUI?.grid_tit_info?.[0].title;
    const gridButtonData = masterUI?.grid_btn_info || [];
    const whereData = initParam[0]?.params?.[0] || [];

    const sortBySeqBtn: SortBySeqBtnItem[] = (gridButtonData || [])
        .slice()
        .sort((a: SortBySeqBtnItem, b: SortBySeqBtnItem) => Number(b.seq) - Number(a.seq)); // seq 기준으로 역순정렬
    const showByKeyBtn = (Array.isArray(gridButtonData) ? gridButtonData : [])
        .filter((aItem) => {
            const butonKey = aItem.btnKey;
            const butonValue = aItem.btnValue;
            const btnType = aItem.btnType;

            // 숨김조건을 조회박스에서 가져온다
            if (btnType === 'sb') {
                if ((whereData.hasOwnProperty(butonKey) && butonValue == whereData[butonKey]) || butonKey === 'all') {
                    return true;
                }
                return false;
            } else if (btnType === 'inq') {
                // 숨김조건을 조회한다
                if (butonValue == whereData.job_ddln_yn || butonKey === 'all') {
                    return true;
                }
                return false;
            } else {
                if (butonKey === 'all') {
                    return true;
                }
                return false;
            }
        })
        .slice()
        .sort((a: SortBySeqBtnItem, b: SortBySeqBtnItem) => Number(b.seq) - Number(a.seq));

    const handleCloseModal = () => {
        setComModalOpen((prev) => !prev); // 상태를 안전하게 토글
        setComModalData(null);
    };

    // 다국어
    const { t } = useTranslation();

    // 엑셀 다운로드
    const exportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet1');

        const columnData = gridRef.current.getVisibleColumns();
        worksheet.columns = [
            {
                header: '조직명, 시작일, 조직코드, 조직유형은 필수 입력 항목입니다. \n상위 조직명을 입력 어쩌구',
                key: '',
                width: 10,
            },
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Name', key: 'name', width: 20 },
            { header: 'Gender', key: 'gender', width: 15 }, // 드롭다운 적용할 컬럼
        ];
        console.log(columnGroupingModel);
        worksheet.columns = columnData
            .filter(({ headerName }) => headerName !== 'Checkbox selection')
            .map(({ headerName, field, minWidth }) => ({
                header: headerName,
                key: field,
                width: minWidth,
            }));

        // const data = [
        //     {
        //         id: 0,
        //         name: 'ss',
        //         gender: '',
        //     },
        //     { id: 1, name: 'John', gender: '' },
        //     { id: 2, name: 'Jane', gender: '' },
        // ];

        // data.forEach((row) => worksheet.addRow(row));

        // worksheet.mergeCells('A1:D2');
        // worksheet.getCell('A1').alignment = { wrapText: true };
        // worksheet.getCell('A1').font = { size: 18, bold: true, color: { argb: '000000' } };
        // worksheet.getCell('A4').fill = {
        //     type: 'pattern',
        //     pattern: 'solid',
        //     fgColor: { argb: 'e6f0fe' },
        // };

        // const hiddenSheet = workbook.addWorksheet('DropdownData');

        // // 드롭다운 동적으로 가져오기
        // const dropdownOptions = ['Male', 'Female', 'Other'];
        // dropdownOptions.forEach((option, index) => {
        //     hiddenSheet.getCell(`A${index + 1}`).value = option;
        // });

        // hiddenSheet.state = 'veryHidden';

        // // 유효성검증 추가
        // for (let i = 2; i <= data.length + 1; i++) {
        //     worksheet.getCell(`C${i}`).dataValidation = {
        //         type: 'list',
        //         allowBlank: true,
        //         formulae: [`DropdownData!$A$1:$A$${dropdownOptions.length}`],
        //         // showDropDown: true,
        //         showErrorMessage: true, // 오류 메시지 표시 활성화
        //         errorTitle: '잘못된 입력',
        //         error: '목록에 없는 값을 입력할 수 없습니다.',
        //         errorStyle: 'stop', // "stop"을 사용하면 잘못된 값 입력 시 차단됨
        //     };
        // }

        // 스타일 임시 적용
        worksheet.getRow(1).eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFDDDDDD' }, // 회색 배경
            };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
            cell.font = { bold: true };
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, 'example.xlsx');
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

    //엑셀 업로드
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            alert('No file selected');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const binaryStr = e.target?.result;
            const workbook = XLSX.read(binaryStr, { type: 'binary' });
            // 첫 번째 시트 데이터 가져오기
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            // 시트를 JSON으로 변환
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true });
            const headers = jsonData[0];
            const rows = jsonData.slice(1);
            const formattedData = rows.map((row: any[], rowIndex: number) => {
                const rowObject: any = {};
                headers.forEach((key: string, colIndex: number) => {
                    rowObject[key] = row[colIndex] || null;
                });

                rowObject.id = rowIndex + 1;
                return rowObject;
            });
            setRows(formattedData);
        };
        reader.readAsBinaryString(file);
    };

    const handleInsert = () => {
        const id = randomId();
        const newRow = { ...insertParam, id: id };
        gridRef.current.updateRows([newRow]);
        handleRowClick(gridRef.current.getRowParams(id));
        setRows((oldRows) => [newRow, ...oldRows]);
    };

    const handleSbInsert = (item: SortBySeqBtnItem) => {
        const insertParamPlus = item.param;
        if (initParam[0].sqlId === 0) {
            const whereData = initParam[0].params[0];

            insertParamPlus.forEach((obj) => {
                Object.keys(whereData).forEach((key) => {
                    if (obj.hasOwnProperty(key)) {
                        obj[key] = whereData[key];
                    }
                });
            });
        } else {
            const whereData = initParam[0].params[0];

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
        gridRef.current.updateRows([newRow]);
        handleRowClick(gridRef.current.getRowParams(id));
        setRows((oldRows) => [newRow, ...oldRows]);
    };

    const handleBtn = (item: SortBySeqBtnItem) => {
        const totalRows = [];
        let msg = '';
        if (item.type === 'GRID_SAVE') {
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
        } else if (item.type === 'GRID_DELETE') {
            msg = '삭제하시겠습니까?';
            const selectRows = gridRef.current.getSelectedRows();
            selectRows.forEach((row) => {
                row.action_type = 'd';
                totalRows.push(row);
            });
        }

        // api 호출
        // 1. sqlId가 0이면 공통.
        // 2. sqlId가 있다면 sqlId로 호출.
        // 3. api가 있다면 api url로 호출

        const params = [...totalRows];
        params.forEach((row) => {
            row.scr_no = tpcdParam;
        });
        const items = [
            {
                sqlId: item.sqlId,
                sql_key: item.sqlKey,
                params: [{ params }], // params를 배열로 감싸서 전달
            },
        ];

        if (confirm(msg)) {
            if (item.sqlId === '0') {
                fetcherPostCommonSave(items)
                    .then((response) => {
                        const return_cd = response[0].return_cd;
                        if (return_cd === '40000') setMasterRetrieve(true);
                        // 재조회
                    })
                    .catch((error) => {
                        console.error(error);
                    })
                    .finally(() => {});
            } else {
                fetcherPostData(items)
                    .then((response) => {
                        const return_cd = response[0].return_cd;
                        if (return_cd === '40000') setMasterRetrieve(true);
                        // 재조회
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

    const searchBoxHandler = (item: SortBySeqBtnItem) => {
        const srchParam = item.param;
        const msg = '실행하시겠습니까?';

        if (initParam[0].sqlId === 0) {
            const whereData = initParam[0].params[0];

            srchParam.forEach((obj) => {
                Object.keys(whereData).forEach((key) => {
                    if (obj.hasOwnProperty(key)) {
                        obj[key] = whereData[key];
                    }
                });
            });
        } else {
            const whereData = initParam[0].params[0];

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
                sql_key: item.sqlKey,
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

    const SBHandler = (item: SortBySeqBtnItem) => {
        const srchParam = item.param;
        let msg = '';
        let succ_msg = '';

        if (initParam[0].sqlId === 0) {
            const whereData = initParam[0].params[0];

            srchParam.forEach((obj) => {
                Object.keys(whereData).forEach((key) => {
                    if (obj.hasOwnProperty(key)) {
                        obj[key] = whereData[key];
                    }
                });
            });
        } else {
            const whereData = initParam[0].params[0];

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
                        // alert(succ_msg);
                        setKey((prevKey) => prevKey + 1);
                        setMasterRetrieve(true);
                    } else {
                        const data = response.data[0].data;

                        if (data && data.length > 0) {
                            const return_cd = response.return_cd;
                            if (return_cd === '40003') {
                                alert('대상자가 없습니다.');
                                setRows([]);
                            } else {
                                let seq = 1;
                                const id = randomId(); // 고유 ID 추가
                                const rows = data.map((row, index) => ({
                                    id: id + index,
                                    seq: seq++,
                                    isNew: true,
                                    ...(seq === 2 ? { status: 'clicked' } : {}),
                                    ...(seq > 2 ? { status: 'new' } : {}),
                                    ...row,
                                }));
                                alert('생성되었습니다.');
                                setRows(treeCol ? treeData(rows, treeCol) : rows);
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
        console.log('initParam', initParam);
        console.log('slry_ocrn_id', slry_ocrn_id);

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
            selectRows.forEach((row) => {
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
            const AllIds = gridRef.current.getAllRowIds();
            const filteredA = AllIds.filter((item) => !selectRows.has(item));

            totalRows = rows.filter((item) => filteredA.some((deleteItem) => deleteItem === item.id));
        } else if (item.type === 'SLRY_DDLN') {
            msg = '급여를 마감하시겠습니까?';
            succ_msg = '마감되었습니다.';
            const selectRows = gridRef.current.getSelectedRows();
            selectRows.forEach((row) => {
                row.flag = '1';
                totalRows.push(row);
            });
        } else if (item.type === 'SLRY_DDLN_CLS') {
            msg = '급여를 마감취소하시겠습니까?';
            succ_msg = '마감 취소되었습니다.';
            const selectRows = gridRef.current.getSelectedRows();
            selectRows.forEach((row) => {
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

            totalRows = rows.map((aItem) => {
                // B 배열에 같은 id를 가진 객체가 있는지 확인
                // const isInB = selectRows.some((bItem) => bItem.id === aItem.id);
                const isInB = selectRows.has(aItem.id);

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

        // api 호출
        // 1. sqlId가 0이면 공통.
        // 2. sqlId가 있다면 sqlId로 호출.
        // 3. api가 있다면 api url로 호출

        const items = [
            {
                sqlId: item.sqlId,
                sql_key: item.sqlKey,
                params: [{ slry_info: totalRows, slry_ocrn_id: slry_ocrn_id }], // 추후 변경 필요
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

    const editStartEvent: GridEventListener<'cellEditStart'> = (
        params, // GridCellEditStopParams
        event, // MuiEvent<MuiBaseEvent>
        details // GridCallbackDetails
    ) => {
        const rowId = params.id;
        const prefield = params.field + 'preValue';
        let value = gridRef.current.getCellValue(rowId, params.field); // 이전값
        const isNew = params.row.isNew ?? false;

        if (params[prefield] === undefined && !isNew) {
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
    };

    // rows가 전체 그리드 값 -> 변경되면 실행시켜 change를 파악
    useEffect(() => {
        if (gridRef.current) {
            const hasChanges = rows.some((row) => row.isNew === true || row.hasChanged === true);
            if (setHasChange) {
                setHasChange(hasChanges);
            }
        }
    }, [rows]);

    //양식 저장 버튼 클릭시 실행
    const handleInvtn = (item) => {
        if (item.type === 'INVTN_SAVE') {
            const msg = '저장하시겠습니까?';
            if (confirm(msg)) {
                const editmodel = gridRef.current.getRowModels();
                handleSend(); // 제목 중복 방지 함수

                // 변경 여부 확인 로직 추가
                const hasChanges = Array.from(editmodel.values()).some((row) => row.isNew || row.hasChanged);

                // 필요한 필드만 추출하여 새 배열 생성
                const extractedData = Array.from(editmodel.values()).map((row) => {
                    return {
                        artcl: row.artcl,
                        clct_type: row.clct_type,
                        clct_yn: row.clct_yn,
                        esntl_yn: row.esntl_yn,
                    };
                });
                const nameToUse = formName || invtnNm;
                const saveItem = [
                    {
                        sqlId: 'hpr_invtn01',
                        sql_key: 'hpr_invtn_clct_upsert',
                        params: [
                            {
                                invtn_clct_id: invtnId,
                                clct_nm: nameToUse, // 현재 선택된 양식의 이름
                                artcl_info: extractedData,
                            },
                        ],
                    },
                ];
                fetcherPostData(saveItem)
                    .then((response) => {
                        setMasterRetrieve(true); // 저장 후 재조회
                    })
                    .catch((error) => {
                        console.error('저장 에러:', error);
                    });
            }
        }
    };

    const handleBtnClick = (item: SortBySeqBtnItem) => {
        switch (item.type) {
            case 'GRID_DOWNLOAD':
                // exportToExcel();
                // downloadExcel(rows);
                gridRef.current.exportDataAsExcel();
                break;
            case 'GRID_ALL_DOWNLOAD':
                // downloadAllHandler(sheetName);
                break;
            case 'GRID_UPLOAD':
                handleFileUpload(event);
                break;

            case 'GRID_UPLOAD':
                break;
            case 'GRID_DELETE':
            case 'GRID_DELETE':
            case 'GRID_SAVE':
                handleBtn(item);
                break;
            case 'INVTN_SAVE':
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
            case 'GRID_INSERT':
                handleInsert();
                break;
            case 'GRID_INSERT_SB':
                handleSbInsert(item);
                break;
            case 'SEARCH':
                if (confirm('작업한 내용을 취소하고 처음 조회된 데이터로 되돌리시겠습니까?')) {
                    if (rowData) {
                        //const ibsheet = loader.getIBSheetStatic();
                        // const mySheet1 = ibsheet[sheetId1];
                        // const custom = customData(masterData, masterUI?.grid_info);
                        // mySheet1.loadSearchData(treeCol ? treeData(custom) : custom, 0);
                    }
                }
                break;
            case 'GRID_OPTION':
                //optionHandler();
                break;
            case 'GRID_OPTION_SB':
                // 서치박스에서 파라미터를 받아 함수를 실행하는 경우
                searchBoxHandler(item);
                break;
            case 'SLRY_TRPR':
            case 'JOB_DDLN':
            case 'JOB_DDLN_CLS':
                SBHandler(item);
                break;
            case 'EVL_CREATE':
                handleFullModal('NEW');
                break;
            case 'PAY_CAL':
                handleFullModal_Slry('NEW');
                break;
            // 임시 시연용으로 알림톡 전부에게 보내기
            case 'TEMP_EVENT':
                handleTempEvent();
                break;
            default:
                break;
        }
    };

    const handleTempEvent = () => {
        const url = '/api/aligo/talk';
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

        fetcherPost([url, itemTest])
            .then((response) => {
                alert('모든직원을 2024년 12월27일 18:00시 까지 [상무]로 발령하였습니다.');
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {});
    };

    const handleCellClick = (type: string, id: string) => {
        switch (type) {
            case 'EVL_POP':
                handleFullModal(id);
                break;
            case 'SLRY_POP':
                handleFullModal_Slry(id);
                break;
            default:
                break;
        }
    };

    const handleCommonPopup = (param: any) => {
        setComModalData(param);
        setComModalOpen(true);
    };
    const handleFullModal = async (id) => {
        if (id !== 'NEW') {
            const evl_id = gridRef.current.getRow(id).evl_id;
            const evl_prgrs_stts_cd = gridRef.current.getRow(id)['evl_prgrs_stts_cd'];
            setModalData((prev) => {
                return {
                    ...prev,
                    evl_id: evl_id,
                    evl_prgrs_stts_cd: evl_prgrs_stts_cd,
                    open: true,
                };
            });
        } else {
            setModalData((prev) => {
                return {
                    ...prev,
                    evl_id: '',
                    evl_prgrs_stts_cd: 'hpm_group01014_cm0001',
                    open: true,
                };
            });
        }
    };

    const handleFullModal_Slry = async (id) => {
        if (id !== 'NEW') {
            const slry_ocrn_id = gridRef.current.getRow(id).slry_ocrn_id; // 급여일자아이디
            const step_cd = gridRef.current.getRow(id).slry_prgrs_step_cd;
            setPayModalData((prev) => {
                return {
                    ...prev,
                    slry_ocrn_id: slry_ocrn_id,
                    isNew: false,
                    step_cd: step_cd,
                    open: true,
                };
            });
        } else {
            setPayModalData((prev) => {
                return {
                    ...prev,
                    slry_ocrn_id: '',
                    isNew: true,
                    step_cd: 'hrb_group01018_cm0001',
                    open: true,
                };
            });
        }
    };

    const handleActionClick = (type, id, row, sqlId) => {
        switch (type) {
            case 'insert':
                break;
            case 'save':
                console.log(`저장 ${id}`, row);
                break;
            case 'download':
                console.log(`다운로드 ${id}`, row);
                break;
            case 'upload':
                console.log(`업로드 ${id}`, row);
                break;
            case 'delete':
                console.log(`삭제 ${id}`, row);
                break;
            case 'slry_delete':
                if (confirm('행을 삭제하시겠습니까?')) {
                    const slry_ocrn_id = gridRef.current.getRow(id).slry_ocrn_id;
                    const items = [
                        {
                            sqlId: sqlId,
                            params: [
                                {
                                    slry_ocrn_id: slry_ocrn_id,
                                },
                            ],
                        },
                    ];

                    fetcherPostData(items)
                        .then((response) => {
                            alert('삭제되었습니다.');
                            // 재조회
                            setMasterRetrieve(true);
                        })
                        .catch((error) => {
                            console.error(error);
                        })
                        .finally(() => {});
                } else {
                    return;
                }
                break;
            case 'slry_show':
                handleCellClick('SLRY_POP', id);
            default:
                break;
        }
    };

    // 주소찾기
    const handleAddressOpen = () => {
        setPostOpen(!postOpen);
    };

    const gridRef = useGridApiRef();
    const changeSheet = useSheetStore((state) => state.changeSheet);
    const rowId = useSheetStore((state) => state.rowId);
    const displayStyle = '';
    // if (sheetName === 'mySheet1') {
    //     displayStyle = 'block';
    // } else {
    //     displayStyle = 'none';
    // }

    function EditToolbar(props: EditToolbarProps) {
        const { setRows, setRowModesModel } = props;
        const apiRef = useGridApiContext();

        // const CellClickEvent: GridEventListener<'cellClick'> = (
        //     params, // GridCellParams<any>
        //     event, // MuiEvent<React.MouseEvent<HTMLElement>>
        //     details // GridCallbackDetails
        // ) => {
        //     const field = params.field;
        //     const rowId = params.id;
        //     const row = params.row;

        // };

        useGridApiEventHandler(gridRef, 'cellClick', CheckEvent);
        useGridApiEventHandler(gridRef, 'cellEditStart', editStartEvent);
        // useGridApiEventHandler(gridRef, 'cellClick', CellClickEvent);
    }
    const handleAnchor = () => {
        setAnchorEl(!anchorEl);
    };

    useEffect(() => {
        if (gridData.length > 0) {
            const {
                columns,
                columnGroupingModel,
                pinnedColumns,
                insertParam,
                columnVisibilityModel,
                checkboxSelection,
            } = ColBinding(
                gridData,
                gridRef,
                setPostOpen,
                setClickRow,
                setClickField,
                changeDifferRow,
                userData,
                ognzData,
                comboData,
                handleActionClick,
                handleCellClick,
                handleCommonPopup
            ); // 페이지 공통 변수
            columns.forEach((column) => {
                column.headerName = t(column.headerName);
            });
            columnGroupingModel.forEach((model) => {
                model.headerName = t(model.headerName);
            });

            setColumns(columns);
            setColumnGroupingModel(columnGroupingModel);
            setPinnedColumns(pinnedColumns);
            setInsertParam(insertParam);
            setColumnVisibilityModel(columnVisibilityModel);
            setCheckboxSelection(checkboxSelection);
        }
    }, [gridData, userData, ognzData, comboData]);

    useEffect(() => {
        if (rowData && rowData.length > 0) {
            let seq = 1;
            const id = randomId(); // 고유 ID 추가
            const rows = rowData.map((row, index) => ({
                id: id + index,
                seq: seq++,
                ...(seq === 2 ? { status: 'clicked' } : {}),
                ...row,
            }));
            setRows(treeCol ? treeData(rows, treeCol) : rows);
            // setRowModesModel({});
        } else {
            setRows([]);
        }
    }, [rowData]);

    const replaceWithNullUsingRegex = (str: string) => {
        return /^\s*$/.test(str) ? null : str;
    };

    function changeDifferRow(newRow, oldRow, type) {
        const isNew = oldRow?.isNew ?? false;
        const rowId = newRow.id;
        if (!isNew) {
            let updatedFields = Object.keys(newRow).filter((key) => newRow[key] !== oldRow[key])[0];
            const comFieles = Object.keys(newRow).filter((key) => newRow[key] !== oldRow[key] && key in oldRow);

            if (type === 'user') {
                updatedFields = 'user_no';
            } else if (type === 'ognz') {
                updatedFields = 'ognz_info|ognz_no';
            } else if (type === 'user_info|zip') {
                updatedFields = 'user_info|zip';
            } else if (type === 'ognz_info|zip') {
                updatedFields = 'ognz_info|zip';
            }

            const preFields = updatedFields + 'preValue';

            const originValue = newRow[preFields] === undefined ? null : replaceWithNullUsingRegex(newRow[preFields]);
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

            if (originValue !== changeValue) {
                const changeRow = { ...newRow, hasChanged: true, status: 'modify' };

                gridRef.current.updateRows([changeRow]);
                setRows((prevItems) => prevItems.map((item) => (item.id === rowId ? { ...changeRow } : item)));
                return changeRow;
            } else if (originValue === changeValue) {
                // const changeRow = { ...newRow, hasChanged: false };
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
    }
    useEffect(() => {
        if (adressData) {
            const row = gridRef.current.getRow(clickRow);
            const isNew = row.isNew ?? false;
            const columns = gridRef.current.getAllColumns();

            const field = [];

            columns.map((colItem) => {
                field.push(colItem.field);
            });

            let updateRow = { ...row, hasChanged: true };

            const matchingOgnzZip = field.includes('ognz_info|zip');
            const matchingUserZip = field.includes('user_info|zip');
            const matchingOgnzAddr = field.includes('ognz_info|addr');
            const matchingUserAddr = field.includes('user_info|addr');
            const matchingOgnzEngAddr = field.includes('ognz_info|eng_daddr');
            const matchingUserEngAddr = field.includes('user_info|eng_daddr');

            const ognzZipPre = row['ognz_info|zip'] || null;
            const ognzAddrPre = row['ognz_info|addr'] || null;
            const ognzEngAddrPre = row['ognz_info|eng_daddr'] || null;
            const userZipPre = row['user_info|zip'] || null;
            const userAddrPre = row['user_info|addr'] || null;
            const userEngAddrPre = row['user_info|eng_daddr'] || null;

            const zonecode = adressData?.zonecode;
            const roadAddress = adressData?.roadAddress;
            const roadAddressEnglish = adressData?.roadAddressEnglish;

            if (clickfield === 'user_info|zip') {
                if (matchingUserZip && zonecode) {
                    if (row['user_info|zippreValue'] === undefined && !isNew) {
                        updateRow = { ...updateRow, ['user_info|zippreValue']: userZipPre };
                    }
                    updateRow = { ...updateRow, ['user_info|zip']: zonecode };
                }
                if (matchingUserAddr && roadAddress) {
                    if (row['user_info|addrpreValue'] === undefined && !isNew) {
                        updateRow = { ...updateRow, ['user_info|addrpreValue']: userAddrPre };
                    }
                    updateRow = { ...updateRow, ['user_info|addr']: roadAddress };
                }
                if (matchingUserEngAddr && roadAddressEnglish) {
                    if (row['user_info|eng_daddrpreValue'] === undefined && !isNew) {
                        updateRow = { ...updateRow, ['user_info|eng_daddrpreValue']: userEngAddrPre };
                    }
                    updateRow = { ...updateRow, ['user_info|eng_daddr']: roadAddressEnglish };
                }
            } else if (clickfield === 'ognz_info|zip') {
                if (matchingOgnzZip && zonecode) {
                    if (row['ognz_info|zippreValue'] === undefined && !isNew) {
                        updateRow = { ...updateRow, ['ognz_info|zippreValue']: ognzZipPre };
                    }
                    updateRow = { ...updateRow, ['ognz_info|zip']: zonecode };
                }
                if (matchingOgnzAddr && roadAddress) {
                    if (row['ognz_info|addrpreValue'] === undefined && !isNew) {
                        updateRow = { ...updateRow, ['ognz_info|addrpreValue']: ognzAddrPre };
                    }
                    updateRow = { ...updateRow, ['ognz_info|addr']: roadAddress };
                }
                if (matchingOgnzEngAddr && roadAddressEnglish) {
                    if (row['ognz_info|eng_daddrpreValue'] === undefined && !isNew) {
                        updateRow = { ...updateRow, ['ognz_info|eng_daddrpreValue']: ognzEngAddrPre };
                    }
                    updateRow = { ...updateRow, ['ognz_info|eng_daddr']: roadAddressEnglish };
                }
            }

            changeDifferRow(updateRow, row, clickfield);
            // setRows((prevItems) => prevItems.map((item) => (item.id === clickRow ? updateRow : item)));
            gridRef.current.updateRows([updateRow]);
        }
    }, [adressData]);
    function CustomColumnMenu(props: GridColumnMenuProps) {
        const itemProps = {
            colDef: props.colDef,
            onClick: props.hideMenu,
        };
        return (
            <React.Fragment>
                <Stack px={0.5} py={0.5}>
                    <GridColumnMenuSortItem {...itemProps} />
                </Stack>
                <Divider />
                <Stack px={0.5} py={0.5}>
                    <GridColumnMenuPinningItem {...itemProps} />
                </Stack>
                <Divider />
                <Stack px={0.5} py={0.5}>
                    <GridColumnMenuFilterItem {...itemProps} />
                </Stack>
            </React.Fragment>
        );
    }

    const CheckEvent: GridEventListener<'cellClick'> = (
        params, // GridRowSelectionCheckboxParams
        event, // MuiEvent<React.ChangeEvent<HTMLElement>>
        details // GridCallbackDetails
    ) => {
        const rowId = params.row.id;
        const field = params.field;
        const isNew = params.row.isNew;

        changeSheet(gridRef.current, rowId);
        if (field === '__check__' && isNew) {
            gridRef.current.updateRows([{ id: rowId, _action: 'delete' }]);
            setRows(rows.filter((item) => item.id !== rowId));
            const firstId = gridRef.current.getRowIdFromRowIndex(0);
            if (firstId !== undefined && firstId !== null && firstId !== '') {
                handleRowClick(gridRef.current.getRowParams(firstId));
            }
        }
    };

    const handleRowClick = (params: any) => {
        const clickedRowId = params.id;

        setRows((prevRows: Record<string, any>) =>
            prevRows.map((row) => {
                if (row.id === clickedRowId) {
                    return { ...row, status: 'clicked' };
                } else {
                    const { status, isNew, hasChanged, ...rest } = row;
                    if (status === 'clicked') {
                        if (isNew) {
                            return { ...row, status: 'new' };
                        } else if (hasChanged) {
                            return { ...row, status: 'modify' };
                        } else {
                            return rest;
                        }
                    } else {
                        return row;
                    }
                }
            })
        );
        if (sheetName == 'mySheet1' && dataSeInfo.length > 0) {
            setDataParam((prevDataParam) => {
                const currentDetail = prevDataParam?.detail || []; // 이전 detail을 가져오고, 없으면 빈 배열로 초기화
                return {
                    ...prevDataParam, // 기존 속성 유지
                    detail: currentDetail.map((item) => ({
                        ...item,
                        selectedRow: params.row, // 기존 객체에 selectedRow 추가
                    })),
                };
            });
        }
    };

    const treeYn = treeCol ? true : false;
    const getTreeDataPath: DataGridPremiumProps['getTreeDataPath'] = (row) => row['hierarchy'];
    const groupingColDef: DataGridPremiumProps['groupingColDef'] = {
        headerName: treeCol,
        headerAlign: 'center',
    };
    return (
        <>
            <div>
                {!masterUI ? (
                    <>
                        <Stack
                            direction={'row'}
                            spacing={2}
                            sx={{ justifyContent: 'space-between', margin: 0, alignItems: 'center', pb: '15px' }}
                        >
                            {item.data_se_cd === gridKey && (
                                <>
                                    <Typography tooltip type='table' title={t(item.grid_tit_info?.description) || ''}>
                                        {t(item.grid_tit_info?.ttl) || ''}
                                    </Typography>
                                    {rowData && <span>총 {rowData.length}건</span>}
                                </>
                            )}
                        </Stack>
                        <Stack
                            direction={'row'}
                            sx={{ justifyContent: 'space-between', alignItems: 'center', gap: '5px' }}
                        >
                            {item.data_se_cd === gridKey && item.grid_btn_info
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
                ) : (
                    <div className='gridHeader'>
                        <Typography tooltip type='table' title={t(description)}>
                            {t(gridTitleData)}
                        </Typography>
                        {rowData && <span className='total'>총 {rowData.length}건</span>}
                        <Stack
                            direction={'row'}
                            sx={{ justifyContent: 'space-between', alignItems: 'center', gap: '5px' }}
                        >
                            {showByKeyBtn?.map((item: SortBySeqBtnItem) => (
                                <CustomButton
                                    key={item.seq}
                                    customButton={item}
                                    masterUI={masterUI}
                                    clickEvent={() => handleBtnClick(item)}
                                    setData={setRows}
                                    className='btnPrimary sm reset'
                                />
                            ))}
                        </Stack>
                    </div>
                )}
            </div>
            <div id={sheetName} style={{ display: displayStyle, height: '100%', width: '100%', minHeight: '400px' }}>
                {columns && (
                    <Box
                        sx={{
                            width: '100%',
                            height: !masterUI ? '400px' : '600px',
                            '& .actions': {
                                color: 'text.secondary',
                            },
                            '& .textPrimary': {
                                color: 'text.primary',
                            },
                        }}
                    >
                        <StyledDataGrid
                            key={rows.length}
                            treeData={treeYn}
                            getTreeDataPath={getTreeDataPath}
                            groupingColDef={groupingColDef}
                            defaultGroupingExpansionDepth={treeYn ? -1 : 0} // 모든 행 기본적으로 확장
                            apiRef={gridRef}
                            rows={rows} // data
                            columns={columns} // header
                            editMode='cell'
                            rowModesModel={rowModesModel} // row상태
                            columnGroupingModel={columnGroupingModel} // merge할 header
                            initialState={{ pinnedColumns: pinnedColumns }} // 처음 그려질 때 있어야하는 컬럼(?) 체크박스 있는 경우 왼편에 고정해야 하므로 받아오는게 나을듯?
                            slots={{
                                // 그리드 상단 메뉴바
                                toolbar: EditToolbar as GridSlots['toolbar'],
                                noRowsOverlay: CustomNoRowsOverlay,
                                // 컬럼메뉴
                                columnMenu: CustomColumnMenu,
                            }}
                            slotProps={{
                                // 동적으로 재정의할 컴포넌트 속성 정의
                                toolbar: { setRows, setRowModesModel },
                                row: {
                                    ...(treeYn
                                        ? {
                                              onContextMenu: (event: React.MouseEvent<HTMLDivElement>) => {
                                                  event.preventDefault(); // 기본 동작 차단
                                                  event.stopPropagation();
                                                  const rowId = event.currentTarget.getAttribute('data-id'); // data-id에서 row ID 가져오기
                                                  const row = rows.find((row) => String(row.id) === rowId); // data에서 row 데이터 검색
                                                  if (row) {
                                                      handleContextMenu(event, row);
                                                  }
                                              },
                                          }
                                        : null),
                                },
                            }}
                            // columnHeaderHeight : 헤더높이
                            // columnMenu : 컬럼메뉴
                            // disableColumnMenu 를 헤더별로 할 수 있는지?
                            checkboxSelection={checkboxSelection}
                            disableRowSelectionOnClick
                            columnVisibilityModel={columnVisibilityModel}
                            processRowUpdate={(updatedRow, originalRow) => {
                                return changeDifferRow(updatedRow, originalRow, 'origin');
                            }}
                            hideFooterRowCount
                            onProcessRowUpdateError={(error) => console.log(error)}
                            // rowsLoadingMode="server"
                            // disableVirtualization
                            localeText={{
                                // 정렬 관련 텍스트
                                columnMenuSortAsc: '오름차순 정렬',
                                columnMenuSortDesc: '내림차순 정렬',
                                columnMenuUnsort: '정렬 해제',

                                // 필터 관련 텍스트
                                columnMenuFilter: '필터',
                                //columnMenuHide: '숨기기',
                                filterPanelAddFilter: '필터 추가',
                                filterPanelDeleteIconLabel: '필터 삭제',
                                filterPanelRemoveAll: '모든 필터 삭제',
                                filterPanelColumns: '열 이름',
                                filterPanelInputLabel: '값',
                                filterPanelInputPlaceholder: '입력',
                                filterValueAny: '값',
                                filterOperatorAfter: 'after a',
                                filterOperatorBefore: 'before b',
                                filterOperatorContains: '포함',
                                filterOperatorDoesNotContain: '미포함',
                                filterOperatorDoesNotEqual: '!=',
                                filterOperatorEndsWith: '마지막 문자',
                                filterOperatorEquals: '=',
                                filterOperatorIs: 'Is h',
                                filterOperatorIsAnyOf: '여러값입력',
                                filterOperatorIsEmpty: '값 없음',
                                filterOperatorIsNotEmpty: '값 있음',
                                filterOperatorNot: 'Not l',
                                filterOperatorOnOrAfter: 'OnOrAfter m',
                                filterOperatorOnOrBefore: 'OnOrBefore n',
                                filterOperatorStartsWith: '시작 문자',
                                filterPanelLogicOperator: 'aaaa',
                                filterPanelOperator: '조건',
                                filterValueFalse: 'false value',
                                filterValueTrue: 'true value',

                                // 고정 관련 텍스트
                                pinToLeft: '좌측 고정',
                                pinToRight: '우측 고정',
                                unpin: '고정해제',

                                // 페이지 관련 텍스트
                                noRowsLabel: '표시할 데이터가 없습니다',
                                noResultsOverlayLabel: '표시할 데이터가 없습니다.',
                            }}
                            getRowClassName={(params) => `super-app-theme--${params.row.status}`}
                            onRowClick={handleRowClick}
                            onCellClick={CheckEvent}
                            rowHeight={30}
                        />
                        <SearchAddress modalOpen={postOpen} setData={setAdressData} handleOpen={handleAddressOpen} />
                        {/* <SearchEmployee
                        empOpen={empOpen}
                        userInfo={userInfo}
                        setUserInfo={setUserInfo}
                        handleOpen={handleEmpOpen}
                        sheetId={empSheetId}
                        setSheetId={setEmpSheetId}
                    />
                    <SearchOrganization
                        orgOpen={orgOpen}
                        orgInfo={orgInfo}
                        setOrgInfo={setOrgInfo}
                        handleOpen={handleOrgOpen}
                        sheetId={orgSheetId}
                        setSheetId={setOrgSheetId}
                    /> */}
                        <Menu
                            open={Boolean(anchorEl)} // 메뉴 열기 여부
                            onClose={handleAnchor} // 메뉴 닫기
                            anchorReference='anchorPosition' // 마우스 좌표 기준 위치 지정
                            anchorPosition={
                                contextMenu ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined
                            }
                            aria-hidden={false}
                            slotProps={{
                                root: {
                                    onContextMenu: (event) => {
                                        event.preventDefault();
                                        handleAnchor();
                                    },
                                },
                            }}
                        >
                            <MenuItem
                                onClick={() => {
                                    handleAddRow();
                                }}
                            >
                                추가
                            </MenuItem>
                            <MenuItem
                                onClick={() => {
                                    handleDeleteRow();
                                }}
                            >
                                <Typography>삭제</Typography>
                            </MenuItem>
                        </Menu>
                    </Box>
                )}
            </div>
            <EvaluationFullDialog params={modalData} setParams={setModalData} setMasterRetrieve={setMasterRetrieve} />
            <PayFullDialog params={payModalData} setParams={setPayModalData} setMasterRetrieve={setMasterRetrieve} />
            {comModalData && <CommonPopup open={comModalOpen} onClose={handleCloseModal} params={comModalData} />}
        </>
    );
}
export default SlryGrid;
