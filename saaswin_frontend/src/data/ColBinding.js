import { GRID_CHECKBOX_SELECTION_COL_DEF, GridActionsCellItem } from '@mui/x-data-grid';
import UserSelect from 'components/GridUserSelect';
import OgnzSelect from 'components/GridOgnzSelect';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Box, Button, TextField } from '@mui/material';
import dayjs from 'dayjs';
import LensIcon from '@mui/icons-material/Lens';
import Checkbox from 'components/Checkbox';
import SwDatePicker from 'components/DatePicker';
import InputTextBox from '@/components/InputTextBox';
import TreeInputTextBox from '@/components/TreeInputTextBox';

export const ColBinding = (
    data = [],
    gridRef,
    setPostOpen,
    setClickRow,
    setClickField,
    changeDifferRow,
    userComData,
    ognzComData,
    comboData,
    handleActionClick,
    handleCellClick, // CELL에 이벤트 넣어야 할 경우 Grid01.tsx에서 handleCellClick에 추가 후 사용하시면 됩니다.
    handleCommonPopup,
    handleEncrypt,
    handleAttachModal
) => {
    // 현재 연도를 가져오기
    const currentYear = new Date().getFullYear();
    const today = dayjs(new Date()).format('YYYYMMDD');
    const sortBySeqData = data.slice().sort((a, b) => a.seq - b.seq); // seq 기준으로 정렬
    const isActions = data?.find((item) => item.id === 'actions');

    // 사원찾기
    const Userselect = (params) => {
        const editable = params.isEditable;
        const user_no = params.value || '';
        return (
            <UserSelect userData={userComData} changeDifferRow={changeDifferRow} userNo={user_no} editable={editable} />
        );
    };

    // 조직찾기
    const Ognzselect = (params) => {
        const editable = params.isEditable;
        const ognz_no = params.value || '';
        return (
            <OgnzSelect ognzData={ognzComData} changeDifferRow={changeDifferRow} ognzNo={ognz_no} editable={editable} />
        );
    };

    // 셀렉트박스용
    const getOptionValue = (value) => {
        return value.com_cd;
    };

    // 셀렉트박스용
    const getOptionLabel = (value) => {
        return value.com_cd_nm;
    };

    // 기본 텍스트박스
    const defaultTextbox = (params) => {
        const { field, isEditable, value, row, colDef } = params;
        const required = colDef.required ?? false;

        return (
            <Box>
                <InputTextBox
                    id={field}
                    placeholder=''
                    error={required && !value}
                    asterisk={required}
                    type='text'
                    value={(value && value) || ''}
                    disabled={!isEditable}
                    onChange={(e) => {
                        const newValue = e.target.value;

                        params.api.setEditCellValue({
                            id: params.id,
                            field: params.field,
                            value: newValue ? newValue : '',
                        });
                        const newRow = {
                            ...row,
                            [params.field]: newValue,
                        };
                        changeDifferRow(newRow, row, '');
                    }}
                    onDelete={() => {
                        params.api.setEditCellValue({
                            id: params.id,
                            field: params.field,
                            value: '',
                        });
                        const newRow = {
                            ...row,
                            [params.field]: '',
                        };
                        changeDifferRow(newRow, row, '');
                    }}
                    validate={true} // 유효성 검사 활성화 가능
                    // onValidationResult={(isValid) => {
                    //     // 유효성 검사 결과 처리 --> 있으면 저장 안되도록 저장 필요(상태값 하나 만들 것)
                    //     setValiColumn(isValid);
                    // }}
                />
            </Box>
        );
    };

    // 포맷 적용 + 숫자만저장 텍스트필드
    const numberTextbox = (params) => {
        const { field, isEditable, value, row, colDef } = params;
        const required = colDef.required ?? false;

        return (
            <Box>
                <InputTextBox
                    id={field}
                    placeholder=''
                    error={required && !value}
                    asterisk={required}
                    type='text'
                    value={(value && value) || ''}
                    disabled={!isEditable}
                    onChange={(e) => {
                        const newValue = e.target.value;

                        params.api.setEditCellValue({
                            id: params.id,
                            field: params.field,
                            value: newValue ? newValue.replace(/[^0-9]/g, '') : '',
                        });
                        const newRow = {
                            ...row,
                            [params.field]: newValue ? newValue.replace(/[^0-9]/g, '') : '',
                        };
                        changeDifferRow(newRow, row, '');
                    }}
                    onDelete={() => {
                        params.api.setEditCellValue({
                            id: params.id,
                            field: params.field,
                            value: '',
                        });
                        const newRow = {
                            ...row,
                            [params.field]: '',
                        };
                        changeDifferRow(newRow, row, '');
                    }}
                    validate={true} // 유효성 검사 활성화 가능
                    // onValidationResult={(isValid) => {
                    //     // 유효성 검사 결과 처리 --> 있으면 저장 안되도록 저장 필요(상태값 하나 만들 것)
                    //     setValiColumn(isValid);
                    // }}
                />
            </Box>
        );
    };

    // 트리텍스트박스
    const TreeInput = (params) => {
        const { field, isEditable, value, row, rowNode } = params;
        // console.log('rowNode', rowNode);
        return (
            <Box>
                <TreeInputTextBox
                    id={field}
                    placeholder=''
                    type='text'
                    value={(value && value) || ''}
                    disabled={!isEditable}
                    depth={rowNode?.depth || 0}
                    onChange={(e) => {
                        const newValue = e.target.value;

                        params.api.setEditCellValue({
                            id: params.id,
                            field: params.field,
                            value: newValue ? newValue : '',
                        });
                        const newRow = {
                            ...row,
                            [params.field]: newValue,
                        };
                        changeDifferRow(newRow, row, '');
                    }}
                    onDelete={() => {
                        params.api.setEditCellValue({
                            id: params.id,
                            field: params.field,
                            value: '',
                        });
                        const newRow = {
                            ...row,
                            [params.field]: '',
                        };
                        changeDifferRow(newRow, row, '');
                    }}
                    validate={true} // 유효성 검사 활성화 가능
                    onValidationResult={(isValid) => {
                        // 유효성 검사 결과 처리 --> 있으면 저장 안되도록 저장 필요(상태값 하나 만들 것)
                    }}
                />
            </Box>
        );
    };

    // 암호화 텍스트박스
    const encryptTextbox = (params) => {
        const { field, isEditable, value, row } = params;
        const isNew = row.isNew ?? false;
        const pipeIndex = field.indexOf('|'); // jsonb타입 필드인지 확인
        const originKey = pipeIndex !== -1 ? field.substring(0, pipeIndex) : field; // jsonb타입 필드일 경우 jsonb명 추출
        const newKey = pipeIndex !== -1 ? field.substring(pipeIndex + 1) : field; // jsonb타입 필드일 경우 필드명 추출
        const encryptedFields = newKey.toLowerCase().replace(/encrypt_/g, ''); // 복호화 한 값을 넣을 필드
        let encryptField = ''; // 암호화 필드
        if (encryptedFields === 'rrno') encryptField = pipeIndex !== -1 ? originKey + '|encrypt_rrNo' : 'encrypt_rrNo';
        else if (encryptedFields === 'frno')
            encryptField = pipeIndex !== -1 ? originKey + '|encrypt_frNo' : 'encrypt_frNo';
        else if (encryptedFields === 'dln')
            encryptField = pipeIndex !== -1 ? originKey + '|encrypt_dlN' : 'encrypt_dlN';
        else if (encryptedFields === 'pno')
            encryptField = pipeIndex !== -1 ? originKey + '|encrypt_pNo' : 'encrypt_pNo';
        else if (encryptedFields === 'fam_rrno')
            encryptField = pipeIndex !== -1 ? originKey + '|encrypt_fam_rrNo' : 'encrypt_fam_rrNo';

        const handleHide = () => {
            params.api.setEditCellValue({
                id: params.id,
                field: params.field,
                value: '암호화',
            });
            const newRow = {
                ...row,
                [params.field]: row[params.field + 'preValue'],
            };
            changeDifferRow(newRow, row, 'encrypt');
        };

        return (
            <Box>
                <InputTextBox
                    id={field}
                    placeholder=''
                    type='text'
                    value={(value && typeof value === 'object' ? '암호화' : value) || ''}
                    disabled={isEditable ? false : value && typeof value === 'object' ? true : false}
                    onChange={(e) => {
                        const newValue = e.target.value;

                        params.api.setEditCellValue({
                            id: params.id,
                            field: params.field,
                            value: newValue ? newValue : '',
                        });
                    }}
                    onDelete={() => {
                        params.api.setEditCellValue({
                            id: params.id,
                            field: params.field,
                            value: '',
                        });
                        const newRow = {
                            ...row,
                            [params.field]: '',
                        };
                        changeDifferRow(newRow, row, '');
                    }}
                    validate={true} // 유효성 검사 활성화 가능
                    onValidationResult={(isValid) => {
                        // 유효성 검사 결과 처리 --> 있으면 저장 안되도록 저장 필요(상태값 하나 만들 것)
                    }}
                />
                {!isNew &&
                    (value !== null && typeof value === 'object' ? (
                        <button onClick={() => handleEncrypt(params, encryptField)}>복호화</button>
                    ) : (
                        <button onClick={() => handleHide()}>가리기</button>
                    ))}
            </Box>
        );
    };

    // 주소찾기
    const zipPopup = (params) => {
        const field = params.field;
        const { id } = params.row; // params에서 id 추출
        const value = params.value;
        return (
            <Box>
                <TextField
                    variant='standard'
                    size='small'
                    sx={{
                        width: '50px',
                        verticalAlign: 'middle',
                        '& .MuiInputBase-input.Mui-disabled': {
                            WebkitTextFillColor: '#000000',
                        },
                    }}
                    value={(value && value) || ''}
                    disabled
                />
                <Button
                    startIcon={<SearchIcon />}
                    onClick={() => {
                        setClickRow(id);
                        setClickField(field);
                        setPostOpen(true);
                    }}
                ></Button>
            </Box>
        );
    };

    // 날짜포맷
    const dateFormat = (params) => {
        const { value, row, isEditable, colDef, field } = params;
        const isNew = row.isNew ?? false;
        const insertDefault = colDef.insertdefault || null;

        const currentValue = params.row && params.field ? params.row[params.field] : value;

        let defaultValue = (currentValue && dayjs(currentValue)) || null;

        if (isNew && !currentValue) {
            if (insertDefault === 'now_ymd') {
                defaultValue = dayjs(new Date());
            } else if (insertDefault === 'first_ymd') {
                defaultValue = dayjs('1900.01.01');
            }
        }

        return (
            <SwDatePicker
                label=''
                id={field}
                validationText=''
                vertical
                disabled={!isEditable}
                value={defaultValue}
                onChange={(newValue) => {
                    params.api.setEditCellValue({
                        id: params.id,
                        field: params.field,
                        value: newValue ? dayjs(new Date(newValue)).format('YYYY.MM.DD') : '',
                    });
                    const newRow = {
                        ...row,
                        [params.field]: newValue ? dayjs(new Date(newValue)).format('YYYY.MM.DD') : '',
                    };
                    changeDifferRow(newRow, row, '');
                }}
                color='white'
            />
            // <SwDatePicker
            //     label=''
            //     id={params.field}
            //     validationText=''
            //     vertical
            //     disabled={!isEditable}
            //     value={defaultValue}
            //     onChange={(newValue) => {
            //         params.api.setEditCellValue({
            //             id: params.id,
            //             field: params.field,
            //             value: newValue ? dayjs(new Date(newValue)).format('YYYYMM') : '',
            //         });
            //         const newRow = {
            //             ...row,
            //             [params.field]: newValue ? dayjs(new Date(newValue)).format('YYYYMM') : '',
            //         };
            //         changeDifferRow(newRow, row, '');
            //     }}
            //     color='white'
            // />
            // <SwDatePicker
            //     label=''
            //     id={params.field}
            //     disabled={!isEditable}
            //     validationText=''
            //     error={false}
            //     vertical
            //     value={defaultValue}
            //     onChange={(newValue) => {
            //         params.api.setEditCellValue({
            //             id: params.id,
            //             field: params.field,
            //             value: newValue ? dayjs(new Date(newValue)).format('YYYYMM') : '',
            //         });
            //         const newRow = {
            //             ...row,
            //             [params.field]: newValue ? dayjs(new Date(newValue)).format('YYYYMM') : '',
            //         };
            //         changeDifferRow(newRow, row, '');
            //     }}
            //     onDelete={() => {
            //         params.api.setEditCellValue({
            //             id: params.id,
            //             field: params.field,
            //             value: '',
            //         });
            //         const newRow = {
            //             ...row,
            //             [params.field]: '',
            //         };
            //         changeDifferRow(newRow, row, '');
            //     }}
            //     color='white'
            // />
            // <LocalizationProvider dateAdapter={AdapterDayjs}>
            //     <DatePicker
            //         key={`${params.id}-${params.field}-${currentValue}`}
            //         defaultValue={defaultValue}
            //         format='YYYY.MM.DD'
            //         disabled={!isEditable}
            //         readOnly={!isEditable}
            //         sx={{
            //             width: '150px',
            //             '& .MuiInputBase-input.MuiOutlinedInput-input.Mui-disabled': {
            //                 WebkitTextFillColor: 'black',
            //             },
            //         }}
            //         onChange={(newValue) => {
            //             params.api.setEditCellValue({
            //                 id: params.id,
            //                 field: params.field,
            //                 value: newValue ? dayjs(new Date(newValue)).format('YYYY.MM.DD') : '',
            //             });
            //             const newRow = {
            //                 ...row,
            //                 [params.field]: newValue ? dayjs(new Date(newValue)).format('YYYY.MM.DD') : '',
            //             };
            //             changeDifferRow(newRow, row, '');
            //         }}
            //         onAccept={(newValue) => {
            //             params.api.setEditCellValue({
            //                 id: params.id,
            //                 field: params.field,
            //                 value: newValue ? dayjs(new Date(newValue)).format('YYYY.MM.DD') : '',
            //             });
            //         }}
            //     />
            // </LocalizationProvider>
        );
    };

    //년월 달력포맷
    const dateYmFormat = (params) => {
        const { value, row, isEditable, colDef } = params;
        const isNew = row.isNew ?? false;
        const insertDefault = colDef.insertdefault;
        let defaultValue = (value && dayjs(value)) || null;

        if (isNew && insertDefault === 'now_ymd') {
            defaultValue = dayjs(new Date());
        }
        return (
            <SwDatePicker
                label=''
                id='bgng_ymd'
                disabled={!isEditable}
                vertical
                value={defaultValue}
                onChange={(newValue) => {
                    params.api.setEditCellValue({
                        id: params.id,
                        field: params.field,
                        value: newValue ? dayjs(new Date(newValue)).format('YYYYMM') : '',
                    });
                    const newRow = {
                        ...row,
                        [params.field]: newValue ? dayjs(new Date(newValue)).format('YYYYMM') : '',
                    };
                    changeDifferRow(newRow, row, '');
                }}
                onDelete={() => {
                    params.api.setEditCellValue({
                        id: params.id,
                        field: params.field,
                        value: '',
                    });
                    const newRow = {
                        ...row,
                        [params.field]: '',
                    };
                    changeDifferRow(newRow, row, '');
                }}
                color='white'
            />

            // <LocalizationProvider dateAdapter={AdapterDayjs}>
            //     <DatePicker
            //         defaultValue={defaultValue}
            //         views={['month', 'year']}
            //         openTo='month'
            //         format='YYYY.MM'
            //         disabled={!isEditable}
            //         sx={{
            //             width: '120px',
            //             '& .MuiInputBase-input.MuiOutlinedInput-input.Mui-disabled': {
            //                 WebkitTextFillColor: 'black', // 비활성화된 입력 글씨 색
            //             },
            //         }}
            // onChange={(newValue) => {
            //     params.api.setEditCellValue({
            //         id: params.id,
            //         field: params.field,
            //         value: newValue ? dayjs(new Date(newValue)).format('YYYYMM') : '',
            //     });
            //     const newRow = {
            //         ...row,
            //         [params.field]: newValue ? dayjs(new Date(newValue)).format('YYYYMM') : '',
            //     };
            //     changeDifferRow(newRow, row, '');
            // }}
            //         onAccept={(newValue) =>
            //             params.api.setEditCellValue({
            //                 id: params.id,
            //                 field: params.field,
            //                 value: newValue ? dayjs(new Date(newValue)).format('YYYYMM') : '',
            //             })
            //         }
            //     />
            // </LocalizationProvider>
        );
    };

    const checkFormat = (params) => {
        const { value, row, isEditable, colDef } = params;
        const isNew = row.isNew ?? false;
        const insertDefault = colDef.insertdefault ?? false;
        let ischeked = '';

        if (isNew && value === null) {
            ischeked = insertDefault === 'Y' ? true : false;
        } else {
            ischeked = value === 'Y' ? true : false;
        }

        return (
            <div style={{ width: '100%', textAlign: 'center' }}>
                <div
                    style={{
                        width: 'fit-content',
                        margin: 'auto',
                        paddingTop: '5%',
                    }}
                >
                    <Checkbox
                        id={row.id}
                        label=''
                        value=''
                        checked={ischeked}
                        disabled={!isEditable}
                        onChange={(newValue) => {
                            params.api.setEditCellValue({
                                id: params.id,
                                field: params.field,
                                value: newValue,
                            });
                            const newRow = {
                                ...row,
                                [params.field]: newValue ? 'Y' : 'N',
                            };
                            changeDifferRow(newRow, row, '');
                        }}
                    />
                </div>
            </div>
        );
    };

    const requiredHeader = (value) => {
        const { colDef } = value;
        return (
            <>
                {colDef.headerName}
                <span className='asterisk'>*</span>
            </>
        );
    };

    const nullFormat = (value) => {
        if (value === null || value === undefined) {
            return '';
        }
        return value;
    };

    const rrnoFormat = (value) => {
        if (value === null || value === undefined || value === '') {
            return '';
        }
        const formattedValue = value.replace(/-/g, '');
        const firstValue = formattedValue.substring(0, 6);
        const lastValue = formattedValue.substring(6, 13);

        return value && firstValue + '-' + lastValue;
        //  + '******';
    };

    const telnoFormat = (value) => {
        if (value === null || value === undefined) {
            return '';
        }

        const firstValue = value.substring(0, 3);
        const middleValue = value.substring(3, 7);
        const lastValue = value.substring(7);

        return value && firstValue + '-' + middleValue + '-' + lastValue;
    };

    const nameFormat = (value) => {
        if (value === null || value === undefined) {
            return '';
        }

        const firstValue = value.substring(0, 1);
        return value && firstValue + '**';
    };

    const addrOgnzFormat = (value) => {
        if (value === null || value === undefined) {
            return '';
        }

        return (
            value && `(${row['ognz_info|zip'] || ''}) ${row['ognz_info|addr'] || ''} ${row['ognz_info|daddr'] || ''}`
        );
    };

    const addrFormat = (value) => {
        if (value === null || value === undefined) {
            return '';
        }

        return (
            value && `(${row['user_info|zip'] || ''}) ${row['user_info|addr'] || ''} ${row['user_info|daddr'] || ''}`
        );
    };

    // const checkFormat = (value) => {
    //     if (value === null || value === undefined) {
    //         return false;
    //     }

    //     return value === 'Y' ? true : false;
    // };

    // 금액 포맷
    const amountFormat = (value) => {
        if (value === null || value === undefined) {
            return '0';
        }

        const numericValue = Number(String(value).replace(/,/g, ''));

        if (isNaN(numericValue)) {
            return value;
        }

        return numericValue.toLocaleString('ko-KR');
    };

    const clickEvtCell = (params) => {
        const { value, row, modalPath } = params;
        const { id } = row;
        const isNew = row.isNew ?? false;
        if (isNew) {
            return (
                <TextField
                    value={params.value || ''}
                    onChange={(e) =>
                        params.api.setEditCellValue({
                            id: params.id,
                            field: params.field,
                            value: e.target.value,
                        })
                    }
                    fullWidth
                    autoFocus
                />
            );
        }
        return (
            <Box>
                <TextField
                    variant='standard'
                    size='small'
                    sx={{
                        width: '180px',
                        verticalAlign: 'middle',
                        fontSize: '13px',
                        '& .MuiInputBase-input.Mui-disabled': {
                            WebkitTextFillColor: '#000000',
                            pointerEvents: 'auto', // 클릭 이벤트 활성화
                            '&:hover': {
                                cursor: 'pointer',
                            },
                        },
                    }}
                    value={value}
                    disabled
                />
                <Button
                    startIcon={<ArrowForwardIosIcon />}
                    onClick={() => {
                        handleCellClick(id, modalPath);
                    }}
                ></Button>
            </Box>
        );
    };

    const comPopCell = (params) => {
        const { field, value, colDef, row } = params;
        const isNew = row.isNew ?? false;
        let popupId = colDef.popupId;
        let popupPrord = colDef.popupPrord;
        let param = [];
        let inputValue = '';
        switch (field) {
            case 'slry_type_cd':
                param = { scr_no: popupId, initParam: [{ slry_ocrn_id: row.slry_ocrn_id }] };
                inputValue = '관리하기';
                break;
            default:
                break;
        }
        return (
            !isNew && (
                <Box>
                    <TextField
                        variant='standard'
                        size='small'
                        sx={{
                            width: '50px',
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
                        value={inputValue}
                        disabled
                    />
                    <Button
                        startIcon={<ArrowForwardIosIcon />}
                        onClick={() => {
                            handleCommonPopup(param);
                        }}
                    ></Button>
                </Box>
            )
        );
    };

    const comAttachCell = (params) => {
        const { value, row } = params;
        const { id } = row;
        // const isNew = row.isNew ?? false;

        return (
            // !isNew && (
            <Box>
                업로드
                <Button
                    label='업로드'
                    onClick={() => {
                        console.log('id', id);
                        handleAttachModal(params, 'ComPopup/AttachFileModal');
                        // handleAttachModal(id, 'ComPopup/AttachFileModal');
                    }}
                ></Button>
            </Box>
            // )
        );
    };

    const getActions = ({ id, row }) => {
        return isActions?.dataformat.map((action) => (
            <GridActionsCellItem
                key={action.seq} // seq를 key로 사용 (각 요소의 고유 식별자)
                label={action.name} // 이름 설정
                onClick={() => handleActionClick(action.type, id, row, action.sqlId)} // 타입에 따라 동작 처리
                sx={{
                    color:
                        action.type === 'delete' ||
                        action.type === 'delete_bsc' ||
                        action.type === 'delete_all' ||
                        action.type === 'evl_delete'
                            ? 'red'
                            : 'inherit',
                }}
                showInMenu
                closeMenuOnClick
            />
        ));
    };
    const ColData = {
        columns: [],
        columnGroupingModel: [],
        pinnedColumns: { left: [], right: [] },
        insertParam: { isNew: true, status: 'clicked' },
        columnVisibilityModel: {},
        checkboxSelection: false,
        requiredColumn: {},
    };
    // Header push
    // 빈값이면 push X
    // seq 날라오는 대로 sort 필요

    /*
        valueGetter : 데이터 커스텀 --> 주소 또는 text로 온 value를 new Date(value)로 변환 가능 : string
         valueSetter: (value, row) => {
            const [firstName, lastName] = value!.toString().split(' ');
            return { ...row, firstName, lastName };
            },
            return `${row.firstName || ''} ${row.lastName || ''}`;
        valueFormatter : 데이터 포맷 설정 : string
        renderCell: 데이터 커스텀 : reactNode / hook 쓰기도 가능 대신에 만들어서 컴포넌트식으로 써야함  
        Cloumn types 
            - string
            - number
            - date
            - dateTime
            - boolean
            - singleSelect : valueOptions :array[{code,label}]/function(return array) 속성과 함께 사용 /  getOptionValue: (value: any) => value.code, getOptionLabel: (value: any) => value.name,
            - actions : getActions 속성과 함께 사용 --> 컴포넌트에 showInMenu를 사용하면 점 메뉴에서 볼 수 있음
        description : header tooltip
        renderHeader : header 커스텀
        disableColumnMenu : 컬럼메뉴 사용(true/false) --> 테스트 필요
        pinnable : 틀고정 사용 (true/false)



        columnGroupingModel={[
            {
                groupId: 'internal_data',
                headerName: 'Internal',
                description: '',
                renderHeaderGroup: (params) => (
                <HeaderWithIcon {...params} icon={<BuildIcon fontSize="small" />} />
                ),
                children: [{ field: 'id' }],
            },
            {
                groupId: 'character',
                description: 'Information about the character',
                headerName: 'Basic info',
                renderHeaderGroup: (params) => (
                <HeaderWithIcon {...params} icon={<PersonIcon fontSize="small" />} />
                ),
                children: [
                {
                    groupId: 'naming',
                    headerName: 'Names',
                    headerClassName: 'my-super-theme--naming-group',
                    children: [{ field: 'lastName' }, { field: 'firstName' }],
                },
                { field: 'age' },
                ],
            },
        ]}
    
    
    */
    sortBySeqData.map((item, index) => {
        let id = ''; // field
        let type = ''; // type : GridColType
        let align = '';
        let width = 0; // 동일
        let required = false;
        let canedit = true; // editable (true/false)
        let insertedit = '';
        let insertdefault = ''; // param 따로 배열로 보내기
        let visible = true; // hideable(true/false)
        let enumKey = ''; // valueOptions
        let emptyValue = '';
        let customformat = '';
        let formula = '';
        let dataformat = '';
        let maxwidth = 0; // maxWidth
        let minwidth = 0; // minWidth
        let headerName = ''; // headerName
        let mergeHeader = ''; // merge
        let rendercell = null; // 컴포넌트
        let valueGetter = null;
        let actions = null;
        let flex = null;
        let valueOptions = [];
        let popupId = '';
        let popupPrord = '';
        let editColumn = '';
        let editCondition = '';
        let editValue = '';
        let procType = '';
        let rowspan = false;

        Object.entries(item).map(([key, value], index) => {
            switch (key) {
                case 'id':
                    id = value;
                    break;
                case 'header1': // 머지용
                    if (value !== null) {
                        const target = ColData.columnGroupingModel.find(
                            (item) => item.headerName && item.headerName.includes(value)
                        );
                        if (!target) {
                            ColData.columnGroupingModel.push({
                                groupId: value,
                                headerName: value,
                                headerAlign: 'center',
                                children: [],
                            });
                        }
                    }
                    mergeHeader = value;
                    break;
                case 'header2':
                    if (value === 'CBOX') {
                        ColData.pinnedColumns.left = [
                            GRID_CHECKBOX_SELECTION_COL_DEF.field,
                            ...ColData.pinnedColumns.left,
                        ];
                        ColData.checkboxSelection = true;
                    }

                    headerName = value;
                    break;
                case 'type':
                    switch (value) {
                        // 순서(고정값)
                        case 'SEQUENCE':
                            type = 'string';
                            ColData.pinnedColumns.left = [...ColData.pinnedColumns.left, 'seq'];
                            break;
                        // 체크박스
                        case 'CHECKBOX':
                            // type = 'boolean';
                            // valueGetter = checkFormat;
                            rendercell = checkFormat;
                            break;
                        // 텍스트
                        // case 'TEXT':
                        //     type = 'string';
                        //     break;
                        case 'NUMBER':
                            rendercell = numberTextbox;
                            break;
                        case 'TEXT':
                            rendercell = defaultTextbox;
                            break;
                        case 'TREE_TEXT':
                            rendercell = TreeInput;
                            break;

                        // 날짜
                        case 'DATE':
                            // type = 'date';
                            rendercell = dateFormat;
                            break;
                        // 년월날짜
                        case 'DATEYM':
                            // type = 'date';
                            rendercell = dateYmFormat;
                            break;
                        // textarea
                        case 'LINES':
                            type = 'string';
                            break;
                        case 'FLOAT':
                            type = 'number';
                            break;
                        case 'INT':
                            type = 'number';
                            break;
                        // 공통 체크박스(좌측 선택 헤더)
                        case 'COMM_CHECK':
                            type = 'boolean';
                            break;
                        // 사원찾기
                        case 'USER_COM':
                            rendercell = Userselect;
                            break;
                        // 조직찾기
                        case 'OGNZ_COM':
                            rendercell = Ognzselect;
                            break;
                        // 셀렉트박스
                        case 'COMBO':
                            type = 'singleSelect';
                            break;
                        // 주소찾기
                        case 'JUSO_POP':
                            rendercell = zipPopup;
                            valueGetter = nullFormat;
                            break;
                        case 'CELL_POP':
                            rendercell = (params) => {
                                const currentField = id; // 'id'가 현재 필드 이름을 포함한다고 가정
                                const fieldConfig = sortBySeqData.find((config) => config.id === currentField);
                                const modalPath = fieldConfig?.modalPath || null;

                                // 컴포넌트 반환값을 사용해야 UI에 표시됩니다
                                return clickEvtCell({
                                    ...params,
                                    modalPath: modalPath, // modalPath를 params 객체에 추가
                                });
                            };
                            break;
                        // 버튼공통팝업
                        case 'COM_POP':
                            rendercell = comPopCell;
                            break;
                        // 첨부파일
                        case 'ATTACH_POP':
                            rendercell = comAttachCell;
                            break;
                        // 우측 액션메뉴
                        case 'actions':
                            type = 'actions';
                            actions = getActions;
                            ColData.pinnedColumns.right = [...ColData.pinnedColumns.right, 'actions'];
                            break;
                        case 'ENCPT':
                            rendercell = encryptTextbox;
                            break;
                        default:
                            type = 'text';
                            break;
                    }
                    break;
                case 'enum':
                    if (value !== null && comboData) {
                        const sortBySeqCombo = (comboData[value] || [])
                            .slice()
                            .sort((a, b) => Number(a.cd_prord) - Number(b.cd_prord));
                        valueOptions = sortBySeqCombo;
                    }
                    break;
                case 'align':
                    align = value;
                    break;
                case 'width':
                    width = value;
                    break;
                case 'required':
                    required = value;
                    break;
                case 'canedit':
                    if (value !== null) {
                        canedit = value;
                    }
                    break;
                case 'insertededit':
                    insertedit = value;
                    break;
                case 'insertdefault':
                    switch (value) {
                        // 해당년도1월1일
                        case 'CURRENT_YEAR_01':
                            value = currentYear + '.01.01';
                            break;
                        //해당년도 12월31일
                        case 'CURRENT_YEAR_31':
                            value = currentYear + '.12.31';
                            break;
                        case 'CURRENT_YMD':
                            value = today;
                            break;
                        case 'CURRENT_YM':
                            value = dayjs(new Date()).format('YYYYMM');
                            break;
                    }
                    insertdefault = value;
                    break;
                case 'visible':
                    visible = value;
                    break;
                case 'enumKey':
                    enumKey = value;
                    break;
                case 'emptyvalue':
                    switch (value) {
                        // 해당년도1월1일
                        case 'CURRENT_DATE':
                            value = currentYear + '.01.01';
                            break;
                        //해당년도 12월31일
                        case 'CURRENT_YEAR_31':
                            value = currentYear + '.12.31';
                            break;
                        case 'CURRENT_YMD':
                            value = today;
                            break;
                    }
                    emptyValue = value;
                    break;
                case 'customformat':
                    switch (value) {
                        case 'RRNO':
                            valueGetter = rrnoFormat;
                            break;
                        case 'TELNO':
                            valueGetter = telnoFormat;
                            break;
                        case 'NAME':
                            valueGetter = nameFormat;
                            break;
                        case 'FULL_ADDR':
                            valueGetter = addrFormat;
                            break;
                        case 'FULL_ADDR_OGNZ':
                            valueGetter = addrOgnzFormat;
                            break;
                        case 'AMOUNT':
                            valueGetter = amountFormat;
                            break;
                    }
                    // customformat = value;
                    break;
                case 'formula':
                    formula = value;
                    break;
                case 'dataformat':
                    dataformat = value;
                    break;
                case 'maxwidth':
                    maxwidth = value;
                    break;
                case 'minwidth':
                    minwidth = value;
                    break;
                case 'popupId':
                    if (value !== null) popupId = value;
                    break;
                case 'popupPrord':
                    if (value !== null) popupPrord = value;
                    break;
                case 'size':
                    size = value;
                    break;
                case 'editCondition':
                    editCondition = value;
                    break;
                case 'editValue':
                    editValue = value;
                    break;
                case 'editColumn':
                    editColumn = value;
                    break;
                case 'procType':
                    procType = value;
                    break;
                case 'rowspan':
                    if (value !== null) rowspan = value;
                    break;
            }
        });

        if (mergeHeader !== null) {
            const target = ColData.columnGroupingModel.find(
                (item) => item.headerName && item.headerName.includes(mergeHeader)
            );

            target.children.push({ field: id });
        }

        if (!visible && visible !== '' && visible !== null) {
            ColData.columnVisibilityModel = {
                ...ColData.columnVisibilityModel,
                [id]: visible,
            };
        }

        if (insertdefault !== undefined) {
            if (insertdefault === 'now_ymd') {
                ColData.insertParam = {
                    ...ColData.insertParam,
                    [id]: today,
                };
            } else {
                ColData.insertParam = {
                    ...ColData.insertParam,
                    [id]: insertdefault,
                };
            }
        }

        // const customFormat = (value) => {
        //     const result = customtext.split('$');

        //     if (value === null || value === undefined) {
        //         return '';
        //     }

        //     return `(${row['user_info|zip'] || ''}) ${row['user_info|addr'] || ''} ${row['user_info|daddr'] || ''}`;
        // };

        // if (emptyValue !== null && emptyValue !== undefined && emptyValue !== '') {
        //     valueGetter = (value) => {
        //         if (value !== null && value !== undefined && value !== '') {
        //             if (type === 'date') {
        //                 return value && new Date(value);
        //             }

        //             return value;
        //         }

        //         return emptyValue;
        //     };
        // }

        // 데이터 타입별 포맷 정의 필요
        // 조직 사원은 renderCell 속성 추가
        // 동적으로 Cols에 추가할 새로운 컬럼 객체 생성
        const newCol = {
            ...(headerName !== null && headerName !== undefined && headerName !== '' && { headerName: headerName }),
            ...(id !== null && id !== undefined && id !== '' && { field: id }),
            ...(type !== null && type !== undefined && type !== '' && { type: type }),
            ...(rendercell !== null && rendercell !== undefined && rendercell !== '' && { renderCell: rendercell }),
            ...(rendercell !== null && rendercell !== undefined && rendercell !== '' && { renderEditCell: rendercell }),
            ...(actions !== null && actions !== undefined && actions !== '' && { getActions: actions }),
            ...(valueGetter !== null &&
                valueGetter !== undefined &&
                valueGetter !== '' && { valueGetter: valueGetter }),
            ...{ headerAlign: 'center' },
            ...(align !== null && align !== undefined && align !== '' && { align: align }),
            ...(width !== null && width !== undefined && width !== 0 && { width: width }),
            ...(canedit !== null && canedit !== undefined && canedit !== '' && { editable: canedit }),
            ...(maxwidth !== null && maxwidth !== undefined && maxwidth !== 0 && { maxWidth: maxwidth }),
            ...(minwidth !== null && minwidth !== undefined && minwidth !== 0 && { minWidth: minwidth }),
            ...(valueOptions?.length > 0 && { valueOptions: valueOptions }),
            ...(valueOptions?.length > 0 && { getOptionValue: getOptionValue }),
            ...(valueOptions?.length > 0 && { getOptionLabel: getOptionLabel }),
            ...(flex !== null && flex !== undefined && flex !== '' && { flex: flex }),
            ...(popupId !== null && popupId !== undefined && popupId !== '' && { popupId: popupId }),
            ...(popupPrord !== null && popupPrord !== undefined && popupPrord !== '' && { popupPrord: popupPrord }),
            ...(insertdefault !== null &&
                insertdefault !== undefined &&
                insertdefault !== '' && { insertdefault: insertdefault }),
            ...(required !== null &&
                required !== undefined &&
                required !== '' &&
                required && { renderHeader: requiredHeader, required: true }),
            ...(editCondition !== null &&
                editCondition !== undefined &&
                editCondition !== '' && { editCondition: editCondition }),
            ...(editValue !== null && editValue !== undefined && editValue !== '' && { editValue: editValue }),
            ...(editColumn !== null && editColumn !== undefined && editColumn !== '' && { editColumn: editColumn }),
            ...(procType !== null && procType !== undefined && procType !== '' && { procType: procType }),
            ...(!rowspan && {
                rowSpanValueGetter: (value, row) => {
                    return row ? `${row.id}` : value;
                },
            }),
            cellClassName: (params) => {
                // 1. 셀 값이 비어있는지 확인
                const isEmpty = params.value === null || params.value === undefined || params.value === '';
                // 2. 해당 컬럼이 필수 입력 필드인지 확인
                // params.colDef에서 renderHeader 함수가 requiredHeader 함수와 동일한지 비교
                const isRequired = params.colDef.renderHeader === requiredHeader;

                // 3. 두 조건이 모두 참일 경우에만 클래스 적용
                if (isEmpty && isRequired) {
                    return 'required-empty-cell'; // 새로운 클래스 이름
                }
                return ''; // 그 외의 경우에는 클래스 없음
            },
        };
        if (headerName !== 'CBOX') ColData.columns.push(newCol);
        if (required) ColData.requiredColumn[id] = headerName;

        if (index === sortBySeqData.length - 1) {
            if (id === 'actions') {
                ColData.columns[ColData.columns.length - 2].flex = 1;
            } else {
                ColData.columns[ColData.columns.length - 1].flex = 1;
            }
        }
    });

    return ColData;
};
