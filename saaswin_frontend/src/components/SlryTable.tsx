'use client';
import {
    Avatar,
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    TextField,
    Tooltip,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { maskRrno } from 'utils/formatData/index';
import CustomButton from './CustomButton';
import { fetcherPostCommonSave, fetcherPostData } from 'utils/axios';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CommonPopup from './CommonPopup';
import { useSnackbar } from 'notistack';
import { randomId } from '@mui/x-data-grid-generator';
import Typography from 'components/Typography';
import { t } from 'i18next';

interface CustomTableType {
    tableData: Record<string, any>;
    masterInfo: Array<Record<string, any>>;
    comboData: Record<string, any>;
    userData: Record<string, any>;
    ognzData: Record<string, any>;
    tpcdParam: string;
    gridKey: string;
    item: Record<string, any>;
    setMasterRetrieve: any;
    initParam: Record<string, any>;
    setData: any;
    setValidation: any;
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
export default function CustomTable({
    masterInfo,
    tableData,
    comboData,
    tpcdParam,
    userData,
    ognzData,
    gridKey,
    setMasterRetrieve,
    initParam,
    setData,
    setValidation,
}: CustomTableType) {
    const { enqueueSnackbar } = useSnackbar();
    const tableInfo = masterInfo?.table_info || [];
    const tableButtonData = masterInfo?.table_btn_info || [];
    const tableTitleData = masterInfo?.table_tit_info || [];
    const selectedRow = initParam[0]?.selectedRow ?? false;
    const isNew = initParam[0]?.selectedRow?.isNew ?? false;
    const sortBySeqBtn: SortBySeqBtnItem[] = (tableButtonData || [])
        .slice()
        .sort((a: SortBySeqBtnItem, b: SortBySeqBtnItem) => Number(b.seq) - Number(a.seq)); // seq 기준으로 역순정렬
    const [formData, setFormData] = useState(tableData);
    const [comModalData, setComModalData] = useState(null);
    const [comModalOpen, setComModalOpen] = useState(false);

    const handleCloseModal = () => {
        setComModalOpen((prev) => !prev);
        setComModalData(null);
    };

    const handleChange = (id: string, value: any, type: string) => {
        if (type === 'date') {
            const formattedDate = value ? dayjs(value).format('YYYYMMDD') : '';
            setFormData((prevData) => ({
                ...prevData,
                [id]: formattedDate,
            }));
        } else if (type === 'dateym') {
            const formattedDate = value ? dayjs(value).format('YYYYMM') : '';
            setFormData((prevData) => ({
                ...prevData,
                [id]: formattedDate,
            }));
        } else if (type === 'com_popup') {
            if (id === 'slry_type_cd') {
                console.log(formData);
                value['initParam'] = [{ slry_ocrn_id: formData.slry_ocrn_id }];

                console.log('세팅값', value);
                setComModalData(value);
                setComModalOpen(true);
            }
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [id]: value,
            }));
        }
    };

    // 버튼 함수 추가
    const handleBtnClick = (item: SortBySeqBtnItem) => {
        switch (item.type) {
            case 'SAVE':
                handleBtn(item);
                break;
            case 'SLRY_SAVE':
                handleSlryBtn(item);
                break;
            default:
                break;
        }
    };

    // 저장/삭제 함수 추가
    const handleBtn = (item: SortBySeqBtnItem) => {
        const totalRows = [formData];
        let msg = '';
        if (item.type === 'SAVE') {
            msg = '저장하시겠습니까?';
        } else if (item.type === 'DELETE') {
            msg = '삭제하시겠습니까?';
        }

        // api 호출
        // 1. sqlId가 0이면 공통.
        // 2. sqlId가 있다면 sqlId로 호출.
        // 3. api가 있다면 api url로 호출
        const params = [...totalRows];
        totalRows.forEach((row) => {
            row.scr_no = tpcdParam; // 화면번호
            row.action_type = 'U';
        });
        const items = [
            {
                sqlId: 0,
                params: [{ params }], // sendData의 현재 상태를 params에 포함
            },
        ];

        if (confirm(msg)) {
            if (item.sqlId === '0') {
                fetcherPostCommonSave(items)
                    .then((response) => {
                        // 결과 코드에 따라 재조회 또는 alert
                        console.log('성공', response);
                        // setMasterRetrieve(true);
                    })
                    .catch((error) => {
                        console.error(error);
                    })
                    .finally(() => {});
            } else {
                fetcherPostData(items)
                    .then((response) => {
                        // 결과 코드에 따라 재조회 또는 alert
                        console.log('성공', response);
                        // setMasterRetrieve(true);
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

    // 저장/삭제 함수 추가
    const handleSlryBtn = (item: SortBySeqBtnItem) => {
        const totalRows = [formData];
        // 필수값 체크로직 추가 필요
        let msg = '';
        let succ_msg = '';
        if (item.type === 'SLRY_SAVE') {
            msg = '저장하시겠습니까?';
            succ_msg = '저장되었습니다.';
        } else if (item.type === 'SLRY_DELETE') {
            msg = '삭제하시겠습니까?';
        }

        // api 호출
        // 1. sqlId가 0이면 공통.
        // 2. sqlId가 있다면 sqlId로 호출.
        // 3. api가 있다면 api url로 호출

        const tmp_slry_ocrn_id = formData?.slry_ocrn_id;

        if (tmp_slry_ocrn_id === undefined) {
            formData.type = 'isnew';
        }

        const items = [
            {
                sqlId: item.sqlId,
                sql_key: item.sqlKey,
                params: [{ slry_info: formData }], // sendData의 현재 상태를 params에 포함
            },
        ];

        if (confirm(msg)) {
            fetcherPostData(items)
                .then((response) => {
                    alert(succ_msg);
                    const slry_ocrn_id = response[0].data.slry_ocrn_id;

                    if (slry_ocrn_id !== undefined) {
                        setValidation((prev) => ({
                            ...prev,
                            validation: true,
                        }));
                    }

                    setData((prev) => ({
                        ...prev,
                        slry_ocrn_id: slry_ocrn_id,
                    }));
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

    // 날짜 초기 바인딩 추가
    useEffect(() => {
        const initialSendDataForSql = tableInfo.reduce((acc: { [key: string]: string | null }, item) => {
            if (item.type === 'date') {
                if (item.default === 'now_ymd') {
                    acc[item.id] = dayjs().format('YYYYMMDD'); // 현재 날짜
                } else {
                    acc[item.id] = null;
                }
            } else if (item.type === 'dateym') {
                if (item.default === 'now_ymd') {
                    acc[item.id] = dayjs().format('YYYYMM'); // 현재 날짜
                } else {
                    acc[item.id] = null;
                }
            } else if (item.type === 'COMBO') {
                if (item.default === 'first') {
                    const sortBySeqCombo = (comboData[item.enum] || [])
                        .slice()
                        .sort((a, b) => Number(a.cd_prord) - Number(b.cd_prord));
                    const com_cd = sortBySeqCombo[0]?.com_cd;
                    if (com_cd !== undefined) {
                        acc[item.id] = com_cd;
                    }
                }
            } else {
                if (item.default === 'isnew') {
                    acc[item.id] = randomId();
                    acc.type = 'isnew';
                } else {
                    acc[item.id] = item.default;
                }
            }

            return acc;
        }, {});

        setFormData(initialSendDataForSql);
    }, []);

    useEffect(() => {
        setFormData((prevData) => ({
            // ...prevData,
            ...tableData,
        }));
        // setFormData(tableData);
    }, [tableData]);

    const groupedRows =
        tableInfo?.reduce((acc, cell) => {
            const rowIndex = parseInt(cell.row, 10); // 문자열 row를 숫자로 변환
            if (!acc[rowIndex]) {
                acc[rowIndex] = [];
            }
            acc[rowIndex].push(cell);
            return acc;
        }, {}) || {};
    let maxLength = 0;
    Object.entries(groupedRows).forEach(([rowIndex, cells]) => {
        const sortedCells = cells.sort((a, b) => parseInt(a.col, 10) - parseInt(b.col, 10));
        if (sortedCells.length > maxLength) {
            maxLength = sortedCells.length;
        }
    });
    const comboItem = (enumValue) => {
        // 콤보 우선순위 정렬 추가
        const sortBySeqCombo = (comboData[enumValue] || [])
            .slice()
            .sort((a, b) => Number(a.cd_prord) - Number(b.cd_prord));
        return sortBySeqCombo?.map((item) => (
            <MenuItem key={item.com_cd} value={item.com_cd}>
                {item.com_cd_nm}
            </MenuItem>
        ));
    };
    return (
        <Box sx={{ p: 1 }}>
            {/* <Typography variant="h2">{tableTitle}</Typography> */}
            <Stack direction={'row'} sx={{ justifyContent: 'space-between', margin: 0 }}>
                {!tableInfo ? (
                    <>
                        <Stack
                            direction={'row'}
                            spacing={2}
                            sx={{ justifyContent: 'space-between', margin: 0, alignItems: 'center', pb: '15px' }}
                        >
                            {masterInfo.data_se_cd === gridKey && (
                                <Typography type='table' tooltip title={t(masterInfo.table_tit_info?.description)}>
                                    {masterInfo.table_tit_info?.title}
                                </Typography>
                            )}
                        </Stack>
                        <Stack direction={'row'} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                            {masterInfo.data_se_cd === gridKey && masterInfo.table_btn_info
                                ? masterInfo.table_btn_info
                                      .slice() // 원본 배열을 복사하여 새로운 배열 생성
                                      .sort((a, b) => b.seq - a.seq) // seq 값 기준으로 내림차순 정렬
                                      .map((items: SortBySeqBtnItem) => (
                                          <CustomButton
                                              key={items.seq}
                                              customButton={items}
                                              clickEvent={() => handleBtnClick(items)}
                                              className='btnPrimary sm reset'
                                          />
                                      ))
                                : ''}
                        </Stack>
                    </>
                ) : (
                    <>
                        <Stack
                            direction={'row'}
                            spacing={2}
                            sx={{ justifyContent: 'space-between', margin: 0, alignItems: 'center', pb: '15px' }}
                        >
                            <Typography type='table' tooltip title={t(tableTitleData[0].description)}>
                                {tableTitleData[0].title}
                            </Typography>
                        </Stack>
                        <Stack direction={'row'} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                            {sortBySeqBtn?.map((item: SortBySeqBtnItem) => (
                                <CustomButton
                                    key={item.seq}
                                    customButton={item}
                                    clickEvent={() => handleBtnClick(item)}
                                    setData={''}
                                />
                            ))}
                        </Stack>
                    </>
                )}
            </Stack>
            <TableContainer
                component={Paper}
                sx={{
                    pointerEvents: gridKey !== '' && (!selectedRow || isNew) ? 'none' : 'auto',
                    width: '100%',
                    margin: 'auto',
                    marginTop: 3,
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                }}
            >
                <Table>
                    <TableBody>
                        {Object.entries(groupedRows).map(([rowIndex, cells]) => (
                            <TableRow key={`row-${rowIndex}`}>
                                {cells
                                    .sort((a, b) => parseInt(a.col, 10) - parseInt(b.col, 10)) // col 값 기준 정렬
                                    .map((cell, index) => {
                                        const isLastCell = index === cells.length - 1;

                                        return (
                                            <React.Fragment key={`${cell.id}-${index}`}>
                                                {cell.type !== 'IMG' ? (
                                                    <>
                                                        {/* 헤더 셀 */}
                                                        <TableCell
                                                            key={cell.id}
                                                            rowSpan={
                                                                parseInt(cell.rowspan) === 0
                                                                    ? undefined
                                                                    : parseInt(cell.rowspan)
                                                            }
                                                            sx={{ width: '400px' }}
                                                        >
                                                            <Typography type='table'>{cell.title}</Typography>
                                                        </TableCell>

                                                        {/* value 셀 */}
                                                        <TableCell
                                                            key={`${cell.id}-${index}-value`}
                                                            colSpan={parseInt(cell.colspan)} // colspan 적용
                                                            rowSpan={
                                                                parseInt(cell.rowspan) === 0
                                                                    ? undefined
                                                                    : parseInt(cell.rowspan)
                                                            }
                                                            sx={{
                                                                textAlign: 'left', // 수평 좌측 정렬
                                                                verticalAlign: 'middle', // 수직 중앙 정렬
                                                            }}
                                                        >
                                                            {
                                                                cell.type === 'COMBO' ? (
                                                                    <Select
                                                                        id='personal-experience'
                                                                        value={formData?.[cell.id] ?? ''}
                                                                        sx={{
                                                                            width: '200px',
                                                                            height: '40px',
                                                                            '& .MuiSelect-select': {
                                                                                display: 'flex',
                                                                                alignItems: 'center', // ✅ 수직 중앙 정렬
                                                                                justifyContent: 'flex-start', // ✅ 수평 중앙 정렬
                                                                                textAlign: 'left',
                                                                                height: '100%', // 높이를 부모에 맞춤
                                                                            },
                                                                        }}
                                                                        onChange={(e) =>
                                                                            handleChange(
                                                                                cell.id,
                                                                                e.target.value,
                                                                                'combo'
                                                                            )
                                                                        }
                                                                    >
                                                                        {comboItem(cell.enum)}
                                                                    </Select>
                                                                ) : cell.type === 'input' ? (
                                                                    <TextField
                                                                        fullWidth
                                                                        size='small'
                                                                        sx={{ width: '200px' }}
                                                                        value={
                                                                            cell.id === 'bsc_info|rrno'
                                                                                ? maskRrno(formData[cell.id]) || ''
                                                                                : formData?.[cell.id] || ''
                                                                        }
                                                                        onChange={(e) => {
                                                                            handleChange(
                                                                                cell.id,
                                                                                e.target.value,
                                                                                'input'
                                                                            );
                                                                        }}
                                                                    />
                                                                ) : cell.type === 'date' ? (
                                                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                                        <DatePicker
                                                                            defaultValue={
                                                                                cell.default === 'now_ymd'
                                                                                    ? dayjs(new Date())
                                                                                    : null
                                                                            }
                                                                            value={
                                                                                formData?.[cell.id] !== undefined
                                                                                    ? dayjs(formData?.[cell.id])
                                                                                    : null
                                                                            }
                                                                            sx={{
                                                                                background: 'white',
                                                                                height: '40px',
                                                                                width: '200px',
                                                                                '& .MuiInputBase-root': {
                                                                                    height: '100%',
                                                                                },
                                                                            }}
                                                                            onChange={(date) =>
                                                                                handleChange(
                                                                                    cell.id,
                                                                                    dayjs(new Date(date)).format(
                                                                                        'YYYYMMDD'
                                                                                    ),
                                                                                    'date'
                                                                                )
                                                                            }
                                                                            format='YYYY.MM.DD'
                                                                            minDate={dayjs(new Date('1900-01-01'))}
                                                                            maxDate={dayjs(new Date('2999-12-31'))}
                                                                        />
                                                                    </LocalizationProvider>
                                                                ) : cell.type === 'dateym' ? (
                                                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                                        <DatePicker
                                                                            views={['month', 'year']}
                                                                            openTo='month'
                                                                            value={
                                                                                formData?.[cell.id] !== undefined
                                                                                    ? dayjs(formData?.[cell.id])
                                                                                    : null
                                                                            }
                                                                            sx={{
                                                                                background: 'white',
                                                                                height: '40px',
                                                                                width: '200px',
                                                                                '& .MuiInputBase-root': {
                                                                                    height: '100%',
                                                                                },
                                                                            }}
                                                                            onChange={(date) =>
                                                                                handleChange(
                                                                                    cell.id,
                                                                                    dayjs(new Date(date)).format(
                                                                                        'YYYYMM'
                                                                                    ),
                                                                                    'dateym'
                                                                                )
                                                                            }
                                                                            format='YYYY.MM'
                                                                            minDate={dayjs(new Date('1900-01'))}
                                                                            maxDate={dayjs(new Date('2999-12'))}
                                                                        />
                                                                    </LocalizationProvider>
                                                                ) : cell.type === 'check' ? (
                                                                    <Checkbox
                                                                        id={cell.id}
                                                                        checked={
                                                                            formData?.[cell.id] !== undefined
                                                                                ? formData?.[cell.id] === 'Y'
                                                                                    ? true
                                                                                    : false
                                                                                : cell.default
                                                                        }
                                                                        onChange={(e) =>
                                                                            handleChange(
                                                                                cell.id,
                                                                                e.target.checked ? 'Y' : 'N',
                                                                                cell.type
                                                                            )
                                                                        }
                                                                    />
                                                                ) : cell.type === 'com_popup' && tableData ? (
                                                                    <Box>
                                                                        <TextField
                                                                            variant='standard'
                                                                            size='small'
                                                                            sx={{
                                                                                width: '100px',
                                                                                verticalAlign: 'middle',
                                                                                fontSize: '13px',
                                                                                '& .MuiInputBase-input.Mui-disabled': {
                                                                                    WebkitTextFillColor: 'blue',
                                                                                    pointerEvents: 'auto', // 클릭 이벤트 활성화
                                                                                    '&:hover': {
                                                                                        cursor: 'pointer',
                                                                                    },
                                                                                },
                                                                            }}
                                                                            value={cell.default}
                                                                            disabled
                                                                        />
                                                                        <Button
                                                                            startIcon={<ArrowForwardIosIcon />}
                                                                            onClick={() => {
                                                                                handleChange(
                                                                                    cell.id,
                                                                                    {
                                                                                        scr_no: cell.popupId,
                                                                                    },
                                                                                    cell.type
                                                                                );
                                                                            }}
                                                                        ></Button>
                                                                    </Box>
                                                                ) : (
                                                                    ''
                                                                )
                                                                // : (
                                                                //     <Typography sx={{ textAlign: 'left' }}>
                                                                //         {cell.title}
                                                                //     </Typography>
                                                                // )
                                                            }
                                                        </TableCell>
                                                    </>
                                                ) : (
                                                    <TableCell
                                                        key={cell.id}
                                                        width='250px'
                                                        colSpan={parseInt(cell.colspan)} // 이미지 셀에 colspan 적용
                                                        rowSpan={
                                                            parseInt(cell.rowspan) === 0
                                                                ? undefined
                                                                : parseInt(cell.rowspan)
                                                        }
                                                        sx={{
                                                            textAlign: 'center',
                                                            verticalAlign: 'middle',
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                            }}
                                                        >
                                                            <Avatar
                                                                sx={{
                                                                    width: 190,
                                                                    height: 190,
                                                                }}
                                                                src={'/api/image/' + tableData[`bsc_info|file_mng_no`]}
                                                            />
                                                        </Box>
                                                    </TableCell>
                                                )}
                                                {/* 남은 셀 채우기 */}
                                                {isLastCell &&
                                                    (parseInt(cell.col) === maxLength ? null : (
                                                        <>
                                                            <TableCell />
                                                            <TableCell />
                                                        </>
                                                    ))}
                                            </React.Fragment>
                                        );
                                    })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            {comModalData && <CommonPopup open={comModalOpen} onClose={handleCloseModal} params={comModalData} />}
        </Box>
    );
}
