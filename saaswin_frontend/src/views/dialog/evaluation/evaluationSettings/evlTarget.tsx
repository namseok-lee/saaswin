'use client';

import { Box, Menu, MenuItem, Stack } from '@mui/material';
import { DataGridPremium, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid-premium';
import OgnzSelect from 'components/OgnzSelect';
import UserSelect from 'components/UserSelect';
import * as XLSX from 'xlsx';
import { useEffect, useState } from 'react';
import { fetcherPost, fetcherPostData } from 'utils/axios';
import styles from '../../../../components/FullDialog/evaluation/style.module.scss';
import Radio from 'components/Radio';
import Typography from 'components/Typography';
import Button from 'components/Button';
import { IcoCol, IcoTemplateAdd, IcoTemplateExclusion } from '@/assets/Icon';
interface Props {
    data: Record<string, any>;
    setData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
    setValidation: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}
export default function EvlTarget({ data, setData, setValidation }: Props) {
    const allRadioLabel = (
        <div style={{ lineHeight: '2' }}>
            <strong>모든 구성원</strong>
            <br />
            소속된 모든 구성원을 받는 사람으로 지정합니다.
        </div>
    );
    const selctedRadioLabel = (
        <div style={{ lineHeight: '2' }}>
            <strong>특정 구성원</strong>
            <br />
            평가받을 특정 구성원을 선택합니다.
        </div>
    );
    const userItem = 'user_no';
    const ognzItem = 'ognz_no';
    const formattedData =
        data?.trpr_info?.map((item) => ({
            flnm: item.flnm,
            ognz_nm: item.ognz_nm,
            user_no: item.user_no,
        })) || [];
    // const [radioValue, setRadioValue] = useState('all');
    // 구성원 찾기 파라미터
    const [retrieveParams, setRetrieveParams] = useState({
        user_no: '',
        ognz_no: '',
    });
    // 구성원 찾기 버튼
    const [retrieve, setRetrieve] = useState(false);
    // 구성원 조회
    const [audience, setAudience] = useState([]);
    // 선택된 행의 id
    const [rowSelection, setRowSelection] = useState<GridRowSelectionModel>([]);
    // 선택된 데이터
    const [selectedAdd, setSelectedAdd] = useState([]);
    // 평가대상자 행의 id
    const [rowSelection2, setRowSelection2] = useState<GridRowSelectionModel>([]);
    // 평가대상자 행의 Data
    const [selectedRows2, setSelectedRows2] = useState(formattedData);
    // 엑셀 업로드 버튼
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    // 라디오버튼 체크 상태
    const [selectedOption, setSelectedOption] = useState('all');

    const columns: GridColDef<(typeof rows)[number]>[] = [
        {
            field: 'ognz_no',
            headerName: 'ognz_no',
            width: 150,
        },
        {
            field: 'ognz_nm',
            headerName: '소속',
            width: 150,
        },
        {
            field: 'flnm',
            headerName: '이름',
            width: 150,
        },
        {
            field: 'user_no',
            headerName: '사번',
            width: 150,
        },
    ];
    // const handleChange = (event) => {
    //     setRadioValue(event.target.value);
    // };
    const handleSelectChange = (id: string, value: string, type: string | null) => {
        setRetrieveParams((prev) => {
            if (type === 'USER_COM') {
                return {
                    ...prev,
                    user_no: value,
                };
            } else {
                return {
                    ...prev,
                    ognz_no: value,
                };
            }
        });
    };

    // 조회버튼
    const handleRetrieve = () => {
        setRetrieve(true);
    };

    // 전체 선택
    const handleSelectAll = () => {
        if (rowSelection.length === audience.length) {
            // 이미 모두 선택된 경우, 선택 해제
            setRowSelection([]);
            setSelectedAdd([]);
        } else {
            // 전체 선택
            setRowSelection(audience.map((item) => item.user_no));
            setSelectedAdd(audience);
        }
    };

    // 추가
    const handleAdd = () => {
        // 기존 selectedRows2의 ID 목록
        const existingIds = selectedRows2.map((row) => row.user_no);

        // selectedAdd에서 기존에 없는 ID만 추가
        const uniqueRowsToAdd = selectedAdd.filter((row) => !existingIds.includes(row.user_no));
        // 중복된 데이터 확인
        const duplicateRows = selectedAdd.filter((row) => existingIds.includes(row.user_no));

        if (duplicateRows.length > 0) {
            // 중복된 데이터가 있을 경우 경고 메시지
            alert(`해당 사원은 이미 추가되어 있습니다: ${duplicateRows.map((row) => row.user_no).join(', ')}`);
        }

        if (uniqueRowsToAdd.length > 0) {
            // 중복을 제외한 데이터 추가
            setSelectedRows2((prev) => [...prev, ...uniqueRowsToAdd]);
        }
        setRowSelection([]);
    };
    // 업로드 메뉴 열기
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    // 업로드 메뉴 닫기
    const handleClose = () => {
        setAnchorEl(null);
    };
    // 양식 다운로드
    const handleDownload = () => {
        // 정적 파일의 URL
        const fileUrl = '/excel/evlTarget.xlsx';
        // 다운로드 링크 생성
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = 'evlTarget.xlsx'; // 저장될 파일명
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        handleClose();
    };
    // 엑셀 업로드
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
            const formattedHeaders = headers.map((item) => {
                if (item === '사번') {
                    return 'user_no';
                } else if (item === '이름') {
                    return 'flnm';
                } else if (item === '소속') {
                    return 'ognz_nm';
                } else {
                    return item; // 매칭되지 않는 경우 원래 값을 유지
                }
            });
            const rows = jsonData.slice(1);

            const filteredRows = rows.filter((row: any[]) => {
                return row.some((cell) => cell !== null && cell !== undefined && cell !== '');
            });
            const formattedData = filteredRows.map((row: any[], rowIndex: number) => {
                const rowObject: any = {};
                formattedHeaders.forEach((key: string, colIndex: number) => {
                    rowObject[key] = row[colIndex] || null;
                });
                // rowObject.id = rowIndex + 1;
                return rowObject;
            });
            setSelectedRows2(formattedData);
            // **중요**: 파일 입력 값을 초기화
            event.target.value = '';
        };
        reader.readAsBinaryString(file);
        handleClose();
    };

    // 선택 삭제
    const handleDelete = () => {
        if (rowSelection2.length === 0) {
            alert('삭제할 행을 선택하세요.');
            return;
        }
        // 선택된 ID를 제외한 나머지 데이터로 필터링
        const updatedAudience = selectedRows2.filter((row) => !rowSelection2.includes(row.user_no));
        setSelectedRows2(updatedAudience);
        // 선택 상태 초기화
    };
    // 전체 삭제
    const handleDeleteAll = () => {
        // 선택 상태 초기화
        setRowSelection([]);
        setSelectedAdd([]);
        setSelectedRows2([]);
    };
    useEffect(() => {
        if (retrieve) {
            setAudience([]);
            const params = retrieveParams;
            const item = [
                {
                    sqlId: 'hpo_apnt01',
                    sql_key: 'hpo_apnt_ognzno_userno',
                    params: [params],
                },
            ];
            fetcherPostData(item) // fetcherPost 함수 사용
                .then((response) => {
                    const resData = response;
                    const isNullData = resData === null;
                    if (resData && !isNullData) {
                        setAudience(resData);
                    }
                })
                .catch((error) => {
                    console.error(error);
                })
                .finally(() => {
                    setRetrieve(false);
                });
        }
    }, [retrieve]);
    useEffect(() => {
        if (selectedOption === 'all') {
            // 전체 구성원 선택
            setValidation((prev) => ({
                ...prev,
                type: 'cm001-2_1',
                validation: true,
            }));
            return; // 이후 로직 건너뜀
        } else if (selectedOption === 'selected') {
            const isEmpty = selectedRows2.length === 0;
            if (isEmpty) {
                // 특정 구성원 옵션 선택 후 평가 대상자 미지정
                setValidation((prev) => ({
                    ...prev,
                    validation: false,
                    message: '대상자를 선택하세요.',
                }));
            } else {
                // 특정 구성원 - 평가 대상자 생성
                const value = selectedRows2.map((item) => ({
                    user_no: item.user_no,
                    flnm: item.flnm,
                    ognz_no: item.ognz_no,
                    ognz_nm: item.ognz_nm,
                }));
                setData((prev) => ({
                    ...prev,
                    trpr_info: value,
                }));
                setValidation((prev) => ({
                    ...prev,
                    type: 'cm001-2',
                    validation: true,
                }));
            }
        }
    }, [selectedRows2, selectedOption, setValidation, setData]);
    return (
        <div className={styles.evaluationTarget}>
            <section className={styles.selectTarget}>
                <label
                    htmlFor='selectAll'
                    className={`${styles.radioBox} ${selectedOption === 'all' ? styles.on : ''}`}
                >
                    <div className={styles.wrap}>
                        <Radio
                            id='selectAll'
                            name='selectMember'
                            value='all'
                            checked={selectedOption === 'all'}
                            onChange={() => setSelectedOption('all')}
                        />
                        <div className={styles.label}>{allRadioLabel}</div>
                    </div>
                </label>
                <label
                    htmlFor='selectPart'
                    className={`${styles.radioBox} ${selectedOption === 'selected' ? styles.on : ''}`}
                >
                    <div className={styles.wrap}>
                        <Radio
                            id='selectPart'
                            name='selectMember'
                            value='selected'
                            checked={selectedOption === 'selected'}
                            onChange={() => setSelectedOption('selected')}
                        />
                        <div className={styles.label}>{selctedRadioLabel}</div>
                    </div>
                </label>
            </section>
            {selectedOption === 'selected' && (
                <section className={styles.findMember}>
                    {/* 구성원 찾기 영역 */}
                    <div className={styles.col}>
                        <Typography type='form' title='구성원 찾기'>
                            구성원 찾기
                        </Typography>
                        <div className={styles.colWrap}>
                            <div className={`searchBox ${styles.searchBox}`}>
                                <div className={`searchBoxWrap ${styles.searchBoxWrap}`}>
                                    <div className='selectBasicBox'>
                                        <div className='row'>
                                            <label className='label'>조직찾기</label>
                                            <div className='textWrap'>
                                                <OgnzSelect
                                                    item={ognzItem}
                                                    handleChange={handleSelectChange}
                                                    selectValue={ognzItem}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className='selectBasicBox'>
                                        <div className='row'>
                                            <label className='label'>사원찾기</label>
                                            <div className='textWrap'>
                                                <UserSelect
                                                    item={userItem}
                                                    handleChange={handleSelectChange}
                                                    selectValue={userItem}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => {
                                            handleRetrieve();
                                        }}
                                        type='primary'
                                        size='lg'
                                        className='btnSearch btnWithIcon'
                                    >
                                        조회
                                        <IcoCol fill='#fff' />
                                    </Button>
                                </div>
                            </div>
                            <div className={styles.dateGrid}>
                                <div className={styles.gridBtns}>
                                    <Button type='default' size='sm' onClick={handleSelectAll}>
                                        전체선택
                                    </Button>
                                </div>
                                <DataGridPremium
                                    sx={{
                                        width: '100%',
                                        height: '195px', // 전체 높이 설정 (스크롤 활성화를 위해 제한 필요)
                                        overflow: 'auto', // 스크롤 가능하게 설정
                                    }}
                                    getRowId={(row) => row.user_no}
                                    rows={audience}
                                    columns={columns}
                                    checkboxSelection
                                    rowSelectionModel={rowSelection}
                                    columnVisibilityModel={{ ognz_no: false }}
                                    onRowSelectionModelChange={(newRowSelectionModel) => {
                                        // 선택된 ID 저장
                                        setRowSelection(newRowSelectionModel as GridRowSelectionModel);

                                        // 선택된 ID를 기반으로 전체 행 데이터 추출 및 저장
                                        const selectedData = audience.filter((row) =>
                                            newRowSelectionModel.includes(row.user_no)
                                        );
                                        setSelectedAdd(selectedData);
                                    }}
                                    hideFooter
                                />
                            </div>
                        </div>
                    </div>
                    {/* 추가/제외 버튼 영역 */}
                    <div className={styles.btnSettings}>
                        <div className={styles.btnArea}>
                            <Button id='' size='sm' type='default' onClick={handleAdd} className='btnWithIcon'>
                                추가
                                <IcoTemplateAdd fill='#7C7C7C' />
                            </Button>
                            <Button id='' size='sm' type='default' onClick={handleDelete} className='btnWithIcon'>
                                제외
                                <IcoTemplateExclusion fill='#7C7C7C' />
                            </Button>
                        </div>
                    </div>
                    {/* 평가 대상자 영역 */}
                    <div className={styles.col}>
                        <Typography type='form' title='평가 대상자'>
                            평가 대상자
                        </Typography>
                        <div className={styles.colWrap}>
                            <div className={styles.dateGrid}>
                                <div className={styles.gridBtns}>
                                    <Button type='default' size='sm' onClick={handleClick}>
                                        엑셀 업로드
                                    </Button>
                                    <Button type='default' size='sm' onClick={handleDeleteAll}>
                                        전체 삭제
                                    </Button>
                                </div>
                                <DataGridPremium
                                    sx={{
                                        width: '100%',
                                        height: '317px', // 전체 높이 설정 (스크롤 활성화를 위해 제한 필요)
                                        overflow: 'auto', // 스크롤 가능하게 설정
                                    }}
                                    getRowId={(row) => row.user_no}
                                    rows={selectedRows2}
                                    columns={columns}
                                    checkboxSelection
                                    rowSelectionModel={rowSelection2}
                                    columnVisibilityModel={{ ognz_no: false }}
                                    onRowSelectionModelChange={(newRowSelectionModel) => {
                                        // 선택된 ID 저장
                                        setRowSelection2(newRowSelectionModel as GridRowSelectionModel);
                                    }}
                                    hideFooter
                                />
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)} // 메뉴 열기 여부
                                    onClose={handleClose} // 메뉴 닫기
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'left',
                                    }}
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'left',
                                    }}
                                >
                                    <MenuItem onClick={() => {}}>
                                        <Button onClick={handleDownload}>양식 다운로드</Button>
                                    </MenuItem>
                                    <MenuItem onClick={() => {}}>
                                        <Button>
                                            <input
                                                type='file'
                                                accept='.xlsx, .xls, .csv'
                                                hidden
                                                onChange={(e) => {
                                                    handleFileUpload(e); // handleFileUpload 함수가 상위 컨텍스트에 정의되어 있어야 함 , Button에 직접사용할 경우 component="label" 프롭스가 있어야 함
                                                }}
                                            />
                                            엑셀 업로드
                                        </Button>
                                    </MenuItem>
                                </Menu>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
