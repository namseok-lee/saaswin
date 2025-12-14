'use client';

import { Stack } from '@mui/material';
import { DataGridPremium, GridColDef } from '@mui/x-data-grid-premium';
import Button from 'components/Button';
import { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import styles from '../../../../../components/FullDialog/evaluation/style.module.scss';
import ButtonGroup from 'components/ButtonGroup';

interface Props {
    data: Record<string, any>;
    filteredEvltrInfo: Record<string, any>;
    setTabView: React.Dispatch<React.SetStateAction<boolean>>;
    setTabValue: React.Dispatch<React.SetStateAction<string>>;
}

export default function EvltrConfirmed({ data, filteredEvltrInfo, setTabView, setTabValue }: Props) {
    const StyledDataGrid = styled(DataGridPremium)`
        .missing-value-cell {
            background-color: #ffcccc;
            color: #ff0000;
        }
    `;
    const isClgEvl = data?.proc_info?.find((item) => item.proc_cd === 'hpm_group01015_cm0002'); // 동료평가 유무
    const [columns, setColumns] = useState<GridColDef[]>([]);
    useEffect(() => {
        // 컬럼 동적 그리기
        const baseColumns: GridColDef[] = [
            {
                field: 'flnm',
                headerName: '평가 대상자',
                width: 100,
                align: 'center',
                headerAlign: 'center',
            },
            {
                field: 'user_no',
                headerName: '사번',
                width: 100,
                align: 'center',
                headerAlign: 'center',
            },
            {
                field: 'ognz_nm',
                headerName: '소속',
                width: 150,
                align: 'center',
                headerAlign: 'center',
            },
            {
                field: 'jbgp_nm',
                headerName: '직군',
                width: 100,
                align: 'center',
                headerAlign: 'center',
            },
        ];
        // proc_info가 있는 경우 동적 컬럼 추가
        if (data?.proc_info && data.proc_info.length > 0) {
            // proc_info 배열에서 추가 컬럼 정의 생성
            const dynamicColumns: GridColDef[] = data.proc_info.map((proc, index, array) => ({
                field: proc.proc_cd,
                headerName: proc.com_cd_nm,
                headerAlign: 'center',
                align: 'center',
                width: 150,
                renderCell: (params) => {
                    if (proc.proc_cd === 'hpm_group01015_cm0002') {
                        // 값이 없는 경우
                        if (!params.value) {
                            return (
                                <div
                                    style={{
                                        backgroundColor: '#ffcccc', // 연한 붉은색 배경
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    미지정
                                </div>
                            );
                        }
                        return params.value;
                    } else {
                        return params.value || '-';
                    }
                },
                cellClassName: (params) => {
                    if (proc.proc_cd === 'hpm_group01015_cm0002' && !params.value) {
                        return 'missing-value-cell'; // CSS 클래스 이름
                    }
                    return '';
                },
                flex: index === array.length - 1 ? 1 : 0,
            }));
            // 기본 컬럼과 동적 컬럼 합치기
            setColumns([...baseColumns, ...dynamicColumns]);
        } else {
            // proc_info가 없으면 기본 컬럼만 설정
            setColumns(baseColumns);
        }
    }, []);
    return (
        <>
            <ButtonGroup className={styles.tableOptions}>
                <Button id='btnDefault11' type='default' size='sm'>
                    엑셀 업로드
                </Button>
                <Button id='btnDefault11' type='default' size='sm'>
                    엑셀 다운로드
                </Button>
                {isClgEvl && (
                    <Button
                        id='btnPrmary12'
                        type='primary'
                        size='sm'
                        onClick={() => {
                            setTabView(true);
                            setTabValue('clgSelect');
                        }}
                    >
                        동료 선택 시작
                    </Button>
                )}
            </ButtonGroup>
            <div className={styles.dataGrid}>
                <StyledDataGrid
                    sx={{
                        width: '100%',
                        height: '500px', // 전체 높이 설정 (스크롤 활성화를 위해 제한 필요)
                        overflow: 'auto', // 스크롤 가능하게 설정
                    }}
                    getRowId={(row) => row.user_no}
                    rows={filteredEvltrInfo}
                    columns={columns}
                    hideFooter
                />
            </div>
            <div className={styles.total}>Total Rows: 380</div>
        </>
    );
}
