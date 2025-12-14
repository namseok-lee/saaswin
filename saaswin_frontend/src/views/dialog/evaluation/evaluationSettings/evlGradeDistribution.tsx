'use client';
import { Menu, MenuItem, Stack, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import { DataGridPremium } from '@mui/x-data-grid-premium';
import { useEffect, useState } from 'react';
import { fetcherPost, fetcherPostData } from 'utils/axios';
import * as XLSX from 'xlsx';
import styles from '../../../../components/FullDialog/evaluation/style.module.scss';
import { IcoDownEvaluation, IcoError, IcoInfo } from '@/assets/Icon';
import Button from 'components/Button';
interface Props {
    data: Record<string, any>;
    setData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
    setValidation: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}
export default function EvlGradeDistribution({ data, setData, setValidation }: Props) {
    const [procItem, setProcItem] = useState();
    const [rows, setRows] = useState(); // 비율 배분 Data
    const [nopeData, setNopeData] = useState([]); // 인원 수 배분 Data
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const rateColumns: GridColDef[] = [
        {
            field: 'id',
            headerName: 'id',
            type: 'string',
            editable: false,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'grd_nm',
            headerName: '등급',
            type: 'string',
            width: 650,
            editable: false,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'rt',
            headerName: '배분 비율',
            type: 'number',
            width: 100,
            align: 'center',
            flex: 1,
            headerAlign: 'center',
            editable: true,
        },
    ];
    const nopeColumns: GridColDef[] = [
        {
            field: 'id',
            headerName: 'id',
            type: 'string',
            editable: false,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'flnm',
            headerName: '평가자',
            type: 'string',
            width: 150,
            editable: false,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'ognz_nm',
            headerName: '소속',
            type: 'number',
            width: 150,
            align: 'center',
            headerAlign: 'center',
            editable: false,
        },
        {
            field: 'jbttl_nm',
            headerName: '직책',
            type: 'number',
            width: 150,
            align: 'center',
            headerAlign: 'center',
            editable: false,
        },
        {
            field: 'evl_nope_count',
            headerName: '평가 인원',
            type: 'number',
            width: 150,
            align: 'center',
            headerAlign: 'center',
            editable: false,
        },
    ];
    const processRowUpdate = (updatedRow, oldRow, proc_cd) => {
        setRows((prevRows) =>
            prevRows.map((row) => {
                // 해당 row를 찾습니다. (여기서 row.id가 proc_cd)
                if (row.id === proc_cd) {
                    return {
                        ...row,
                        grd_info: row.grd_info.map((grade) => {
                            // grade.id와 updatedRow.id를 비교하여 업데이트합니다.
                            if (grade.id === updatedRow.id) {
                                return { ...grade, rt: updatedRow.rt };
                            }
                            return grade;
                        }),
                    };
                }
                return row;
            })
        );
        setProcItem((prevItems) =>
            prevItems.map((item) => {
                if (item.proc_cd === proc_cd) {
                    // item의 hpm_group* 키 중, updatedRow.evlfm_type_cd와 일치하는 그룹만 업데이트
                    if (item.hpm_group01018_cm0003 && Array.isArray(item.hpm_group01018_cm0003.grd_info)) {
                        return {
                            ...item,
                            hpm_group01018_cm0003: {
                                ...item.hpm_group01018_cm0003,
                                grd_info: item.hpm_group01018_cm0003.grd_info.map((grade) =>
                                    grade.id === updatedRow.id ? { ...grade, rt: updatedRow.rt } : grade
                                ),
                            },
                        };
                    }
                }
                return item;
            })
        );
        return updatedRow;
    };

    const processRowUpdate2 = (updatedRow, oldRow, proc_cd) => {
        setNopeData((prevRows) => ({
            ...prevRows,
            [proc_cd]: prevRows[proc_cd].map((row) => (row.id === updatedRow.id ? updatedRow : row)),
        }));

        return updatedRow;
    };
    // 업로드 메뉴 열기
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    // 업로드 메뉴 닫기
    const handleClose = () => {
        setAnchorEl(null);
    };
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
                    return 'user_curr_info|flnm';
                } else if (item === '소속') {
                    return 'user_curr_info|ognz_nm';
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
            // setSelectedRows2(formattedData);
            // **중요**: 파일 입력 값을 초기화
            event.target.value = '';
        };
        reader.readAsBinaryString(file);
        handleClose();
    };
    const downloadExcel = (data, type) => {
        if (type === 'rt') {
            const formattedData = data.map(({ grd_nm }) => ({
                등급: grd_nm, // grd_nm을 "등급"으로 변경
                비율: '', // rt를 문자열로 변환하여 "비율"로 변경
            }));
            const worksheet = XLSX.utils.json_to_sheet(formattedData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

            XLSX.writeFile(workbook, 'saaswin.xlsx');
        }
        // const formattedData = data.map((row) => ({
        //     ...row,

        // }));
    };
    useEffect(() => {
        const downItem = [
            'hpm_group01015_cm0004', // 1~5차 하향평가, 위원 cd
            'hpm_group01015_cm0005',
            'hpm_group01015_cm0006',
            'hpm_group01015_cm0007',
            'hpm_group01015_cm0008',
            'hpm_group01015_cm0009',
        ];
        // downProc에는 downItem에 해당하는 proc_info 항목들이 들어감
        const downProc = data?.proc_info.filter((item) => downItem.includes(item.proc_cd));
        setProcItem(downProc);

        // 프로세스 코드별 grd_info 추출
        const extracted =
            downProc.map((item) => ({
                id: item.proc_cd,
                grd_info: item.hpm_group01018_cm0003?.grd_info || [],
            })) || [];
        setRows(extracted);
        // trpr_info 데이터를 기반으로 변환
        const transformedData = data?.trpr_info?.flatMap((trpr) => {
            // trpr 엔트리에서 downItem에 해당하는 프로세스 코드들만 필터링
            const processCodes = trpr.evltr_info
                ? Object.keys(trpr.evltr_info).filter((code) => downItem.includes(code))
                : [];
            return processCodes.flatMap((procs_cpst_cd) => {
                // 현재 평가 항목의 procs_cpst_cd와 일치하는 procItem 찾기
                const matchingProc = downProc.find((item) => item.proc_cd === procs_cpst_cd);

                // matchingProc이 있을 경우, 해당 객체의 키 중 "hpm_group01018_cm00"로 시작하는 모든 키를 대상으로 evlfmItem 배열 추출
                const evlfmArr = matchingProc
                    ? Object.keys(matchingProc)
                          .filter((key) => key.startsWith('hpm_group01018_cm00'))
                          .flatMap((key) => matchingProc[key]?.evlfmItem || [])
                    : [];

                // 각 프로세스 코드에 대한 평가자 정보를 변환
                const evltrInfoForProc = Object.values(trpr.evltr_info[procs_cpst_cd].evltr_info).map((evltr) => ({
                    evl_id: data?.evl_id,
                    // evlfm_id에 추출한 평가양식 배열 세팅
                    evlfm_info: evlfmArr,
                    evltr_indv_info: {
                        user_no: evltr.user_no,
                        flnm: evltr.flnm,
                        ognz_no: evltr.ognz_no,
                        ognz_nm: evltr.ognz_nm,
                    },
                    trpr_indv_info: {
                        user_no: trpr.user_no,
                        flnm: trpr.flnm,
                        ognz_no: trpr.ognz_no,
                        ognz_nm: trpr.ognz_nm,
                    },
                    procs_cpst_cd,
                }));

                return evltrInfoForProc;
            });
        });
        const item = [
            {
                sqlId: 'hpm_evl01',
                sql_key: 'hpm_evltr_create',
                params: [
                    {
                        value: transformedData,
                    },
                ],
            },
        ];
        fetcherPostData(item)
            .then((response) => {
                const resData = response[0].saaswin_hpm_evltr_create;
                const flattenedData = resData
                    .filter((item) => Object?.values(item.evltr_indv_info).some((value) => value !== null))
                    .map((item) => ({
                        id: randomId(),
                        evl_nope_count: item.count,
                        procs_cpst_cd: item.procs_cpst_cd,
                        ...item.evltr_indv_info,
                    }));
                // setNopeData(flattenedData);
                const groupedNopeData = flattenedData.reduce((acc, row) => {
                    const key = row.procs_cpst_cd;
                    if (!acc[key]) {
                        acc[key] = [];
                    }
                    acc[key].push(row);
                    return acc;
                }, {});

                setNopeData(groupedNopeData);
            }) // evltr_indv_info의 내의 요소가 모두 null인 것(최상위 조직장)을 제거하고 evltr_indv_info의 값을 전부 flat하게 펼침
            .catch((error) => {
                console.error(error);
            });
    }, []);
    useEffect(() => {
        // grd_info가 있는 경우 rt가 총합 100이 되는지 유효성체크
        const isValidRt = procItem
            ?.filter(
                (item) =>
                    item?.hpm_group01018_cm0003 &&
                    item?.hpm_group01018_cm0003.grd_info !== undefined &&
                    item?.evl_dv?.evl_dv_bthd === 'rt_bthd'
            )
            .every((item) => {
                const grdInfoArray = item.hpm_group01018_cm0003.grd_info;
                // grade 객체 중 하나라도 rt 값이 undefined, null, 또는 빈 문자열이면 missingRt는 true
                const missingRt = grdInfoArray.some(
                    (grade) => grade.rt === undefined || grade.rt === null || grade.rt === ''
                );
                // 각 grade 객체의 rt 값을 숫자로 변환하여 총합 계산 (없으면 0으로 처리)
                const totalRt = grdInfoArray.reduce((sum, grade) => sum + (grade.rt ? Number(grade.rt) : 0), 0);
                // 모든 grade가 rt 값을 가지고 있고, 총합이 100이면 유효(true), 아니면 false
                return !missingRt && totalRt === 100;
            });
        if (isValidRt) {
            console.log('save !!!');
            setValidation((prev) => ({
                ...prev,
                type: 'cm001-3',
                validation: true,
            }));
            setData((prev) => ({
                ...prev,
                proc_info: prev.proc_info.map((item) => {
                    // proc_cd가 동일한 항목만 업데이트하고 나머지 항목은 그대로 두기
                    if (
                        item.proc_cd === 'hpm_group01015_cm0004' ||
                        item.proc_cd === 'hpm_group01015_cm0005' ||
                        item.proc_cd === 'hpm_group01015_cm0006'
                    ) {
                        return { ...item, ...procItem.find((i) => i.proc_cd === item.proc_cd) };
                    }
                    return item; // 다른 proc_cd는 그대로 두기
                }),
            }));
        } else {
            setValidation((prev) => ({
                ...prev,
                validation: false,
                message: '지정되지 않은 배분비율이 있습니다.',
            }));
        }
    }, [procItem]);
    return (
        <>
            {procItem && procItem.length > 0 ? (
                procItem.map((item, index) => {
                    // 'item.proc_cd'와 같은 평가 양식만 필터링
                    // 배분 방식
                    const evl_dv_bthd = item.evl_dv?.evl_dv_bthd || null;
                    const proc_cd = item.proc_cd;
                    const addColumnsData = item?.hpm_group01018_cm0003?.grd_info || [];
                    const additionalColumns: GridColDef[] = addColumnsData.map((grade) => ({
                        // field 값은 각 grade의 고유 식별자로 지정 (예: grade.id 또는 grade.seq를 이용)
                        field: grade.grd_nm, // 또는 grade.id
                        headerName: grade.grd_nm, // grade 이름을 헤더에 사용
                        type: 'string',
                        align: 'center',
                        headerAlign: 'center',
                        editable: true,
                    }));
                    const finalColumns = [...nopeColumns, ...additionalColumns]; // 인원 수 배분 시 그리드 컬럼
                    // const nopeDataRows = nopeData?.filter((row) => row.procs_cpst_cd === item.proc_cd); // 배분비율 시 그리드 데이터
                    const nopeDataRows = nopeData[item.proc_cd] || []; // 배분비율 시 그리드 데이터

                    const procRows = rows.filter((row) => row.id === item.proc_cd)[0]?.grd_info; // 배분비율 시 그리드 데이터
                    // const procRows = rows.filter((row) => row.id === item.proc_cd)[0]?.grd_info; // 인원 수 배분 시 그리드 데이터
                    const totalRt = item?.hpm_group01018_cm0003?.grd_info?.reduce(
                        (sum, grade) => sum + (grade.rt ? Number(grade.rt) : 0),
                        0
                    );

                    return (
                        <div className={styles.totalLevel}>
                            <section className={styles.section}>
                                <div className={styles.title}>
                                    <IcoDownEvaluation fill='#666' />
                                    {item.com_cd_nm}
                                </div>
                                {evl_dv_bthd !== null && (
                                    <>
                                        <div className={styles.btnArea}>
                                            <Button type='default' size='sm' className={styles.btnExcel}>
                                                엑셀 다운로드
                                            </Button>
                                            <Button
                                                type='default'
                                                size='sm'
                                                onClick={handleClick}
                                                className={styles.btnExcel}
                                            >
                                                엑셀 업로드
                                            </Button>
                                        </div>
                                        <Menu
                                            anchorEl={anchorEl}
                                            open={Boolean(anchorEl)}
                                            onClose={handleClose}
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
                                                <Button
                                                    onClick={() => {
                                                        downloadExcel(procRows, 'rt');
                                                    }}
                                                >
                                                    양식 다운로드
                                                </Button>
                                            </MenuItem>
                                            <MenuItem onClick={() => {}}>
                                                <Button>
                                                    <input
                                                        type='file'
                                                        accept='.xlsx, .xls, .csv'
                                                        hidden
                                                        onChange={(e) => {
                                                            handleFileUpload(e);
                                                        }}
                                                    />
                                                    엑셀 업로드
                                                </Button>
                                            </MenuItem>
                                        </Menu>
                                    </>
                                )}
                                {evl_dv_bthd !== null ? (
                                    evl_dv_bthd === 'rt_bthd' ? (
                                        <>
                                            <DataGridPremium
                                                rows={procRows}
                                                columns={rateColumns}
                                                getRowId={(row) => `${row.id}_${row.seq}_${index}`}
                                                columnVisibilityModel={{
                                                    id: false,
                                                }}
                                                processRowUpdate={(updatedRow, originalRow) =>
                                                    processRowUpdate(updatedRow, originalRow, proc_cd)
                                                }
                                                onProcessRowUpdateError={(error) => console.log(error)}
                                                hideFooter
                                            />
                                            {totalRt === 100 ? (
                                                <div>총 가중치 {totalRt}%</div>
                                            ) : (
                                                <>
                                                    <div className={styles.total}>총 가중치 {totalRt}%</div>
                                                    <div className={styles.warning}>
                                                        <IcoError fill='#E33131' />
                                                        가중치는 합계 100을 맞춰주세요. 현재 총 {totalRt}
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <DataGridPremium
                                                rows={nopeDataRows}
                                                columns={finalColumns}
                                                getRowId={(row) => `${row.id}_${index}`}
                                                columnVisibilityModel={{
                                                    id: false,
                                                }}
                                                processRowUpdate={(updatedRow, originalRow) =>
                                                    processRowUpdate2(updatedRow, originalRow, proc_cd)
                                                }
                                                onProcessRowUpdateError={(error) => console.log(error)}
                                                hideFooter
                                            />
                                        </>
                                    )
                                ) : (
                                    <div>
                                        배분방식을 선택하지 않았습니다. (가이드를 사용하지 사용을 원치 않을 경우
                                        다음단계로 가세요.)
                                    </div>
                                )}
                            </section>
                        </div>
                    );
                })
            ) : (
                <div>종합등급 배분을 선택한 평가가 없습니다. 다음단계로 이동하세요.</div>
            )}
        </>
    );
}
