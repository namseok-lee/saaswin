'use client';
import {
    Avatar,
    Box,
    Button,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    TextField,
    Tooltip,
} from '@mui/material';
// import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import SwDatePicker from 'components/DatePicker';
import InputTextBox from '@/components/InputTextBox';
import Checkbox from 'components/Checkbox';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { maskRrno } from 'utils/formatData/index';
import CustomButton from './CustomButton';
import { fetcherPostCommonSave, fetcherPostData } from 'utils/axios';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CommonPopup from './ComPopup/CommonPopup';
import { useSnackbar } from 'notistack';
import { randomId } from '@mui/x-data-grid-generator';
import Typography from 'components/Typography';
import { useTranslation } from 'react-i18next';
import BoxSelect from './BoxSelect';
import { validateRecursive } from '@/utils/validation/encryption';

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

    // 다국어
    const { t } = useTranslation();

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
                value['initParam'] = [{ slry_ocrn_id: formData.slry_ocrn_id }];

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
            case 'SAVE_HPO':
                handleSaveHpo(item);
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

    const handleSaveHpo = async (item) => {
        let totalRows = [formData];
        let msg = '';

        if (item.type === 'SAVE_HPO') {
            msg = '저장하시겠습니까?';

            // 암호화 필요 데이터 검증
            const encryptedData = await validateRecursive(totalRows);
            if (!encryptedData) {
                console.log('암호화에 필요한 user_no가 없습니다.', encryptedData);
                return;
            }
        }

        // 서치박스에서 user_No를 가져온다
        const insertParamPlus = item.param;
        const whereData = initParam?.[0]?.params?.[0] || [];

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

        const additionalParams = insertParamPlus[0] || {};

        console.log('insertParamPlus', insertParamPlus);

        // 해당 컬럼 저장을 위해 앞의 key를 기준으로 병합 + 히스토리용 chg_info 생성
        const transformedRows = totalRows.map((row) => {
            const transformedRow = {
                ...additionalParams,
                chg_info: {}, // 히스토리용
            };

            for (const [key, value] of Object.entries(row)) {
                if (key.includes('|')) {
                    const [parentKey, childKey] = key.split('|');

                    if (!transformedRow[parentKey]) {
                        transformedRow[parentKey] = [{}];
                    }

                    transformedRow[parentKey][0][childKey] = value;
                    transformedRow.chg_info[childKey] = value; // 히스토리 테이블용
                    transformedRow.chg_col_nm = parentKey; // 히스토리 테이블용
                } else {
                    transformedRow[key] = value;
                }
            }
            // 기본 속성 설정
            transformedRow.del_yn = 'N';
            transformedRow.action_type = 'm'; // 업서트

            return transformedRow;
        });

        // totalRows에 변환된 행들을 추가
        totalRows = [...transformedRows];

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
                        alert('저장되었습니다.');
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
    const comboItem = (enumValue: string) => {
        const formattedOptions = (comboData[enumValue] || [])
            .map((item: any) => ({
                value: item.com_cd,
                label: item.com_cd_nm,
            }))
            .sort((a, b) => Number(a.cd_prord) - Number(b.cd_prord));
        return formattedOptions;
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
                                                {cell.type.toLowerCase() !== 'img' ? (
                                                    <>
                                                        {/* 헤더 셀 */}
                                                        <TableCell
                                                            key={cell.id}
                                                            rowSpan={
                                                                parseInt(cell.rowspan) === 0
                                                                    ? undefined
                                                                    : parseInt(cell.rowspan)
                                                            }
                                                            sx={{ width: '200px' }}
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
                                                                width:
                                                                    cell.type.toLowerCase() === 'date' ||
                                                                    cell.type.toLowerCase() === 'dateym'
                                                                        ? '250px'
                                                                        : '100px',
                                                                textAlign: 'left', // 수평 좌측 정렬
                                                                verticalAlign: 'middle', // 수직 중앙 정렬
                                                            }}
                                                        >
                                                            {
                                                                cell.type.toLowerCase() === 'combo' ? (
                                                                    <BoxSelect
                                                                        id={cell.id}
                                                                        label=''
                                                                        asterisk={false}
                                                                        value={formData?.[cell.id] ?? ''}
                                                                        onChange={(e) =>
                                                                            handleChange(
                                                                                cell.id,
                                                                                e.target.value,
                                                                                'combo'
                                                                            )
                                                                        }
                                                                        displayEmpty={true}
                                                                        options={comboItem(cell.enum) || []}
                                                                        multiple={false}
                                                                    />
                                                                ) : cell.type.toLowerCase() === 'input' ? (
                                                                    <InputTextBox
                                                                        id={cell.id}
                                                                        placeholder=''
                                                                        type='text'
                                                                        value={
                                                                            cell.id === 'bsc_info|rrno'
                                                                                ? maskRrno(formData[cell.id]) || ''
                                                                                : formData?.[cell.id] || ''
                                                                        }
                                                                        disabled={cell.readonly || false}
                                                                        onChange={(e) =>
                                                                            handleChange(
                                                                                cell.id,
                                                                                e.target.value,
                                                                                'input'
                                                                            )
                                                                        }
                                                                        onDelete={() =>
                                                                            handleChange(cell.id, '', 'input')
                                                                        }
                                                                        validate={true} // 유효성 검사 활성화 가능
                                                                        onValidationResult={(isValid) => {
                                                                            // 유효성 검사 결과 처리 --> 있으면 저장 안되도록 저장 필요(상태값 하나 만들 것)
                                                                        }}
                                                                    />
                                                                ) : cell.type.toLowerCase() === 'date' ? (
                                                                    <SwDatePicker
                                                                        label=''
                                                                        id={cell.id}
                                                                        validationText=''
                                                                        vertical
                                                                        disabled={cell.readonly}
                                                                        value={
                                                                            formData?.[cell.id] !== undefined
                                                                                ? dayjs(formData?.[cell.id])
                                                                                : cell.default === 'now_ymd'
                                                                                ? dayjs(new Date())
                                                                                : null
                                                                        }
                                                                        onChange={(date) =>
                                                                            handleChange(
                                                                                cell.id,
                                                                                dayjs(new Date(date)).format(
                                                                                    'YYYYMMDD'
                                                                                ),
                                                                                'date'
                                                                            )
                                                                        }
                                                                        color='white'
                                                                    />
                                                                ) : cell.type.toLowerCase() === 'dateym' ? (
                                                                    <SwDatePicker
                                                                        label=''
                                                                        id={cell.id}
                                                                        validationText=''
                                                                        vertical
                                                                        disabled={cell.readonly}
                                                                        value={
                                                                            formData?.[cell.id] !== undefined
                                                                                ? dayjs(formData?.[cell.id])
                                                                                : cell.default === 'now_ymd'
                                                                                ? dayjs(new Date())
                                                                                : null
                                                                        }
                                                                        onChange={(date) =>
                                                                            handleChange(
                                                                                cell.id,
                                                                                dayjs(new Date(date)).format(
                                                                                    'YYYYMMDD'
                                                                                ),
                                                                                'date'
                                                                            )
                                                                        }
                                                                        color='white'
                                                                    />
                                                                ) : cell.type.toLowerCase() === 'check' ? (
                                                                    <Checkbox
                                                                        id={cell.id}
                                                                        label=''
                                                                        value=''
                                                                        checked={
                                                                            formData?.[cell.id] !== undefined
                                                                                ? formData?.[cell.id] === 'Y'
                                                                                    ? true
                                                                                    : false
                                                                                : cell.default
                                                                        }
                                                                        disabled={cell.readonly}
                                                                        onChange={(newValue) =>
                                                                            handleChange(
                                                                                cell.id,
                                                                                e.target.checked ? 'Y' : 'N',
                                                                                cell.type.toLowerCase()
                                                                            )
                                                                        }
                                                                    />
                                                                ) : cell.type.toLowerCase() === 'com_popup' &&
                                                                  tableData ? (
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
                                                                                    cell.type.toLowerCase()
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
