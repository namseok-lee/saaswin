'use client';

import { Box, Dialog, Stack } from '@mui/material';
import { DataGridPremium, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid-premium';
import Button from 'components/Button';
import ButtonGroup from 'components/ButtonGroup';
import OgnzSelect from 'components/OgnzSelect';
import UserSelect from 'components/UserSelect';
import React, { useEffect, useState } from 'react';
import { fetcherPost, fetcherPostCmcd, fetcherPostData } from 'utils/axios';
import styles from '../../../styles/pages/templateApply/page.module.scss';
import SwModal from 'components/Modal';
import Typography from 'components/Typography';
import BoxSelect from 'components/BoxSelect';
import { IcoTemplateAdd, IcoTemplateExclusion } from '@/assets/Icon';
import { useAuthStore } from 'utils/store/auth';

// 타입 정의 추가 (ApplyLineUser 인터페이스)
interface ApplyLineUser {
    // 실제 필요한 필드들을 명시하는 것이 좋습니다.
    // 예시:
    seq?: string;
    user_no: string;
    flnm: string;
    ognz_nm: string;
    ognz_no: string;
    apnt_jbps_cd?: string;
    apnt_jbps_cd_nm?: string;
    apnt_jbgd_cd_nm?: string;
    [key: string]: any; // 기타 속성 허용 (점진적 타입 강화)
}

interface ApplyLinePopProps {
    params: {
        open: boolean;
        apply?: ApplyLineUser[]; // apply 타입 명시
        receive?: ApplyLineUser[]; // receive 타입 명시
        [key: string]: any;
    };
    setParams: React.Dispatch<React.SetStateAction<any>>;
}

// params -> apply_line : []
const ApplyLinePop: React.FC<ApplyLinePopProps> = ({ params, setParams }) => {
    // params.apply    [] - 결재자
    // params.receive  [] - 수신자

    const userNo = useAuthStore((state) => state.userNo);
    const rprsOgnzNo = useAuthStore((state) => state.rprsOgnzNo);

    // 구성원 grid에 담기는 데이터
    const [audience, setAudience] = useState<ApplyLineUser[]>([]); // 타입 명시

    // 구성원에서 선택 시 데이터 (id만)
    const [rowSelection, setRowSelection] = useState<GridRowSelectionModel>([]);
    // 구성원에서 선택된 데이터 (full data)
    const [selectedAdd, setSelectedAdd] = useState<ApplyLineUser[]>([]); // 타입 명시

    // 결재자 행의 id
    const [rowSelection2, setRowSelection2] = useState<GridRowSelectionModel>([]);
    // 결재자 그리드의 Data
    const [selectedRows2, setSelectedRows2] = useState<ApplyLineUser[]>([]); // 타입 명시

    // 수신참조자 행의 id
    const [rowSelection4, setRowSelection4] = useState<GridRowSelectionModel>([]);
    // 수신참조자 그리드의 Data
    const [selectedRows4, setSelectedRows4] = useState<ApplyLineUser[]>([]); // 타입 명시

    // 직책 공통코드정보
    const [jbpsCd, setJbpsCd] = useState<any[]>([]); // 타입 명시 (any 대신 구체적인 타입 권장)
    // 직급 공통코드정보
    const [jbgdCd, setJbgdCd] = useState<any[]>([]); // 타입 명시 (any 대신 구체적인 타입 권장)

    const userItem = 'user_no';
    const ognzItem = 'ognz_no';

    // 구성원 찾기 파라미터
    const [retrieveParams, setRetrieveParams] = useState({
        user_no: '',
        ognz_no: '',
    });

    const columns: GridColDef<(typeof rows)[number]>[] = [
        {
            field: 'ognz_nm',
            headerName: '소속',
            headerAlign: 'center',
            width: 100,
        },
        {
            field: 'flnm',
            headerName: '이름',
            headerAlign: 'center',
            width: 60,
            // valueGetter: (params) => {
            //     // 안전하게 접근하기 위해 옵셔널 체이닝(?.)과 기본값 설정
            //     return params.flnm || ''; // 값이 없을 경우 빈 문자열 반환
            // },
        },
        {
            field: 'user_no',
            headerName: '사번',
            headerAlign: 'center',
            width: 90,
        },
        {
            field: 'apnt_jbps_cd',
            headerName: '직책',
            headerAlign: 'center',
            width: 60,
            type: 'singleSelect',
            valueOptions: () => {
                // cd_prord 기준으로 정렬
                const sortedOptions = (jbpsCd || [])
                    .slice()
                    .sort((a, b) => Number(a.cd_prord) - Number(b.cd_prord))
                    .map((item) => ({
                        value: item.com_cd,
                        label: item.com_cd_nm,
                    }));

                return sortedOptions;
            },
        },
        {
            field: 'apnt_jbgd_cd',
            headerName: '직급',
            headerAlign: 'center',
            width: 70,
            type: 'singleSelect',
            valueOptions: () => {
                // cd_prord 기준으로 정렬
                const sortedOptions = (jbgdCd || [])
                    .slice()
                    .sort((a, b) => Number(a.cd_prord) - Number(b.cd_prord))
                    .map((item) => ({
                        value: item.com_cd,
                        label: item.com_cd_nm,
                    }));

                return sortedOptions;
            },
        },
    ];
    const apply_columns: GridColDef<(typeof rows)[number]>[] = [
        {
            field: 'seq',
            headerName: '결재순서',
            headerAlign: 'center',
            width: 80,
        },
        {
            field: 'ognz_nm',
            headerName: '소속',
            headerAlign: 'center',
            width: 100,
        },
        {
            field: 'flnm',
            headerName: '이름',
            headerAlign: 'center',
            width: 100,
        },
        {
            field: 'user_no',
            headerName: '사번',
            headerAlign: 'center',
            width: 100,
        },
    ];
    const receive_columns: GridColDef<(typeof rows)[number]>[] = [
        {
            field: 'ognz_nm',
            headerName: '소속',
            headerAlign: 'center',
            width: 100,
        },
        {
            field: 'flnm',
            headerName: '이름',
            headerAlign: 'center',
            width: 100,
        },
        {
            field: 'user_no',
            headerName: '사번',
            headerAlign: 'center',
            width: 100,
        },
    ];

    // 팝업 오픈 시, 전달받은 params 데이터로 내부 상태 초기화
    useEffect(() => {
        if (params.open) {
            // params.apply가 배열인지 확인 후 설정 (없으면 빈 배열)
            setSelectedRows2(Array.isArray(params.apply) ? params.apply : []);
            // params.receive가 배열인지 확인 후 설정 (없으면 빈 배열)
            setSelectedRows4(Array.isArray(params.receive) ? params.receive : []);
        }
        // 팝업이 닫힐 때 선택 상태 초기화 (선택사항)
        // else {
        //     setRowSelection([]);
        //     setSelectedAdd([]);
        //     setRowSelection2([]);
        //     setRowSelection4([]);
        //     setAudience([]); // 구성원 목록도 초기화할지 여부 결정
        // }
    }, [params.open, params.apply, params.receive]); // 의존성 배열에 params 관련 값 추가

    // 공통코드 fetch useEffect
    useEffect(() => {
        // 직책
        fetcherPostCmcd({ group_cd: 'hrs_group00936', rprs_ognz_no: rprsOgnzNo })
            .then((response) => {
                setJbpsCd(response);
            })
            .catch((error) => {
                console.error(error);
            });

        //직급
        fetcherPostCmcd({ group_cd: 'hpo_group00638', rprs_ognz_no: rprsOgnzNo })
            .then((response) => {
                setJbgdCd(response);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    const handleChange = (id: string) => (e: any) => {
        setSelectedValues((prev) => ({
            ...prev,
            [id]: e.target.value,
        }));
    };

    // 구성원 조회
    const onUserSearch = () => {
        //setAudience([]);
        const params = retrieveParams;
        const item = [{ sqlId: 'hpo_apnt01', sql_key: 'hpo_apnt_ognzno_userno', params: [params] }];
        fetcherPostData(item) // fetcherPost 함수 사용
            .then((response) => {
                setAudience(response);
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                //setRetrieve(false);
            });
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

    // 부서 / 구성원 선택
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

    // 추가
    const handleAdd = (type: string) => {
        // 결재자
        if (type === '2') {
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
                // 현재 가장 높은 seq 값 찾기
                const maxSeq =
                    selectedRows2.length > 0 ? Math.max(...selectedRows2.map((row) => parseInt(row.seq) || 0)) : 0;

                // 새로운 행에 순차적인 seq 값 부여
                const newRowsWithSeq = uniqueRowsToAdd.map((row, index) => {
                    // 직책 코드명 찾기
                    const apnt_jbps_cd_nm = jbpsCd?.find((item) => item.com_cd === row.apnt_jbps_cd)?.com_cd_nm || '';

                    // 직급 코드명 찾기
                    const apnt_jbgd_cd_nm = jbgdCd?.find((item) => item.com_cd === row.apnt_jbgd_cd)?.com_cd_nm || '';

                    return {
                        ...row,
                        seq: (maxSeq + index + 1).toString(), // maxSeq 다음부터 순차적으로 번호 부여
                        apnt_jbps_cd_nm: apnt_jbps_cd_nm,
                        apnt_jbgd_cd_nm: apnt_jbgd_cd_nm,
                    };
                });

                // 중복을 제외한 데이터 추가
                setSelectedRows2((prev) => [...prev, ...newRowsWithSeq]);
            }
            setRowSelection([]);
        }
        // 수신 참조자
        if (type === '4') {
            // 기존 selectedRows2의 ID 목록
            const existingIds = selectedRows4.map((row) => row.user_no);
            // selectedAdd에서 기존에 없는 ID만 추가
            const uniqueRowsToAdd = selectedAdd.filter((row) => !existingIds.includes(row.user_no));
            // 중복된 데이터 확인
            const duplicateRows = selectedAdd.filter((row) => existingIds.includes(row.user_no));
            if (duplicateRows.length > 0) {
                // 중복된 데이터가 있을 경우 경고 메시지
                alert(`해당 사원은 이미 추가되어 있습니다: ${duplicateRows.map((row) => row.user_no).join(', ')}`);
            }
            if (uniqueRowsToAdd.length > 0) {
                // 직책/직급 코드명 추가
                const newRowsWithNames = uniqueRowsToAdd.map((row) => {
                    // 직책 코드명 찾기
                    const apnt_jbps_cd_nm = jbpsCd?.find((item) => item.com_cd === row.apnt_jbps_cd)?.com_cd_nm || '';

                    // 직급 코드명 찾기
                    const apnt_jbgd_cd_nm = jbgdCd?.find((item) => item.com_cd === row.apnt_jbgd_cd)?.com_cd_nm || '';

                    return {
                        ...row,
                        apnt_jbps_cd_nm: apnt_jbps_cd_nm,
                        apnt_jbgd_cd_nm: apnt_jbgd_cd_nm,
                    };
                });

                // 중복을 제외한 데이터 추가
                setSelectedRows4((prev) => [...prev, ...newRowsWithNames]);
            }
            setRowSelection([]);
        }
    };

    // 제외
    const handleDelete = (type: string) => {
        // 결재자
        if (type === '2') {
            if (rowSelection2.length === 0) {
                alert('삭제할 행을 선택하세요.');
                return;
            }
            // 선택된 ID를 제외한 나머지 데이터로 필터링
            const updatedAudience = selectedRows2.filter((row) => !rowSelection2.includes(row.user_no));

            // 남은 행들의 seq 값을 1부터 순차적으로 재정렬
            const reorderedAudience = updatedAudience.map((row, index) => ({
                ...row,
                seq: (index + 1).toString(), // 1부터 시작하는 번호 재할당
            }));

            setSelectedRows2(reorderedAudience);
            // 선택 상태 초기화
        }
        // 수신 참조자
        if (type === '4') {
            if (rowSelection4.length === 0) {
                alert('삭제할 행을 선택하세요.');
                return;
            }
            // 선택된 ID를 제외한 나머지 데이터로 필터링
            const updatedAudience = selectedRows4.filter((row) => !rowSelection4.includes(row.user_no));
            setSelectedRows4(updatedAudience);
            // 선택 상태 초기화
        }
    };

    // 적용
    const onSave = () => {
        // 결재자
        const apply = selectedRows2;

        // 수신참조자
        const receive = selectedRows4;

        setParams((prev) => {
            // 신청서 선택데이터
            return {
                ...prev,
                apply: apply,
                receive: receive,
                open: false,
            };
        });
    };

    // 취소
    const onClose = () => {
        setParams((prev) => {
            // 신청서 선택데이터
            return {
                ...prev,
                open: false,
            };
        });
    };

    return (
        <SwModal
            open={params.open}
            onClose={onClose}
            size='xxl'
            maxWidth='1100px'
            bottoms={false}
            title='결재라인 지정'
        >
            <div className={styles.setApprovalLine}>
                {/* 왼쪽 */}
                <div className={styles.col}>
                    <div className='formType'>
                        <div className='formItem'>
                            {/* 구성원 리스트 */}
                            <div className='tblWrap'>
                                <div className='tblHeader'>
                                    <Typography type='table' title='구성원 리스트' desc={false}>
                                        구성원 리스트
                                    </Typography>
                                    <Button id='' type='default' size='sm' onClick={onUserSearch}>
                                        조회
                                    </Button>
                                </div>
                                <table className='tbl'>
                                    <colgroup>
                                        <col style={{ width: '130px' }} />
                                        <col style={{ width: '*' }} />
                                    </colgroup>
                                    <tbody>
                                        <tr>
                                            <th>소속</th>
                                            <td>
                                                <OgnzSelect
                                                    item={ognzItem}
                                                    handleChange={handleSelectChange}
                                                    selectValue={ognzItem}
                                                    className='ognzSelect transparent'
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>구성원</th>
                                            <td>
                                                <UserSelect
                                                    item={userItem}
                                                    handleChange={handleSelectChange}
                                                    selectValue={userItem}
                                                    className='userSelect transparent'
                                                />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className='formItem'>
                            <div className='gridHeader alignRight'>
                                <Button id='' type='default' size='sm' onClick={handleSelectAll}>
                                    전체선택
                                </Button>
                            </div>
                            <DataGridPremium
                                sx={{
                                    width: '430px',
                                    height: '230px', // 전체 높이 설정 (스크롤 활성화를 위해 제한 필요)
                                    overflow: 'auto', // 스크롤 가능하게 설정
                                }}
                                getRowId={(row) => row.user_no}
                                rows={audience}
                                columns={columns}
                                checkboxSelection
                                rowSelectionModel={rowSelection}
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
                {/* 결재자 추가/제외 버튼 */}
                <div className={styles.btnSettings}>
                    <div className={styles.btnArea}>
                        <Button
                            id=''
                            size='sm'
                            type='default'
                            onClick={() => {
                                handleAdd('2');
                            }}
                            className='btnWithIcon'
                        >
                            추가
                            <IcoTemplateAdd fill='#7C7C7C' />
                        </Button>
                        <Button
                            id=''
                            size='sm'
                            type='default'
                            onClick={() => {
                                handleDelete('2');
                            }}
                            className='btnWithIcon'
                        >
                            제외
                            <IcoTemplateExclusion fill='#7C7C7C' />
                        </Button>
                    </div>
                    <div className={styles.btnArea}>
                        <Button
                            id=''
                            size='sm'
                            type='default'
                            onClick={() => {
                                handleAdd('4');
                            }}
                            className='btnWithIcon'
                        >
                            추가
                            <IcoTemplateAdd fill='#7C7C7C' />
                        </Button>
                        <Button
                            id=''
                            size='sm'
                            type='default'
                            onClick={() => {
                                handleDelete('4');
                            }}
                            className='btnWithIcon'
                        >
                            제외
                            <IcoTemplateExclusion fill='#7C7C7C' />
                        </Button>
                    </div>
                </div>
                <div className={styles.col}>
                    <div className='formType'>
                        {/* 결재자 */}
                        <div className='formItem'>
                            <Typography type='table' title='결재자' desc={false}>
                                결재자
                            </Typography>
                            <DataGridPremium
                                sx={{
                                    width: '437px',
                                    height: '200x', // 전체 높이 설정 (스크롤 활성화를 위해 제한 필요)
                                    overflow: 'auto', // 스크롤 가능하게 설정
                                }}
                                getRowId={(row) => row.user_no}
                                rows={selectedRows2}
                                columns={apply_columns}
                                checkboxSelection
                                rowSelectionModel={rowSelection2}
                                onRowSelectionModelChange={(newRowSelectionModel) => {
                                    // 선택된 ID 저장
                                    setRowSelection2(newRowSelectionModel as GridRowSelectionModel);
                                }}
                                hideFooter
                            />
                        </div>
                        {/* 수신 참조자 */}
                        <div className='formItem'>
                            <Typography type='table' title='결재자' desc={false}>
                                수신참조자
                            </Typography>
                            <DataGridPremium
                                sx={{
                                    width: '437px',
                                    height: '200px', // 전체 높이 설정 (스크롤 활성화를 위해 제한 필요)
                                    overflow: 'auto', // 스크롤 가능하게 설정
                                }}
                                getRowId={(row) => row.user_no}
                                rows={selectedRows4}
                                columns={receive_columns}
                                checkboxSelection
                                rowSelectionModel={rowSelection4}
                                onRowSelectionModelChange={(newRowSelectionModel) => {
                                    // 선택된 ID 저장
                                    setRowSelection4(newRowSelectionModel as GridRowSelectionModel);
                                }}
                                hideFooter
                            />
                        </div>
                    </div>
                </div>
            </div>
            {/* 하단버튼 */}
            <div className='actions'>
                <Button id='btnDefault11' type='default' size='lg' className='btnWithIcon' onClick={onClose}>
                    취소
                </Button>
                <Button id='btnPrmary12' type='primary' size='lg' className='btnWithIcon' onClick={onSave}>
                    적용
                </Button>
            </div>
        </SwModal>
    );
};

export default ApplyLinePop;
