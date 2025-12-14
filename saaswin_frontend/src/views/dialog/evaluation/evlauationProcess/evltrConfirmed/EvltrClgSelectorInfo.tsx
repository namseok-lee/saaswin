'use client';

import { styled } from '@mui/material/styles';
import { DataGridPremium, GridColDef } from '@mui/x-data-grid-premium';
import Button from 'components/Button';
import ButtonGroup from 'components/ButtonGroup';
import Checkbox from 'components/Checkbox';
import SwModal from 'components/Modal';
import Toast from 'components/Toast';
import { useEffect, useState } from 'react';
import pages from 'styles/pages/Demo/page.module.scss';
import styles from '../../../../../components/FullDialog/evaluation/style.module.scss';
interface Props {
    data: Record<string, any>;
    filteredEvltrInfo: Record<string, any>;
}
export default function EvltrClgSelectorInfo({ data, filteredEvltrInfo }: Props) {
    const StyledDataGrid = styled(DataGridPremium)`
        .missing-value-cell {
            background-color: #ffcccc;
            color: #ff0000;
        }
    `;
    const clgEvl = data?.proc_info?.find((item) => item.proc_cd === 'hpm_group01015_cm0002'); // 동료평가
    const [rows, setRows] = useState([]);
    const [open, setOpen] = useState(false); // 리마인드 모달
    const [toastOpen, setToastOpen] = useState(false); // 성공알림창 토스트

    const [checkItems, setCheckItems] = useState({
        clg_selector: true,
        ldr: true,
        insaIT: true,
        sms: false,
        kakao: false,
        email: false,
    });
    const trpr_info = data?.trpr_info?.map((item) => item.user_no);
    const min_nope = clgEvl.ptcp_clg_nope?.min_nope;
    const max_nope = clgEvl.ptcp_clg_nope?.max_nope;
    const columns: GridColDef[] = [
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
            width: 150,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'clg_selector',
            headerName: '동료 선정자',
            width: 150,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                return params.row.clg_selector?.flnm || '';
            },
        },
        {
            field: 'clg_selected',
            headerName:
                min_nope !== undefined && max_nope !== undefined ? `선택 동료(${min_nope} ~ ${max_nope})` : '선택 동료',
            width: 300,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'ldr_aprv_yn',
            headerName: '승인여부',
            width: 150,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                return params.row.ldr_aprv_info === 'auto_aprv'
                    ? '자동승인'
                    : params.row.ldr_aprv_info === 'Y'
                    ? '승인완료'
                    : '승인 전';
            },
        },
        {
            field: 'ldr_nm',
            headerName: '리더',
            width: 150,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                return params.row.ldr_info?.flnm || '';
            },
            flex: 1,
        },
    ];

    // 리마인드 팝업
    const handleOpen = () => {
        setOpen(!open);
    };
    // 리마인드 발송
    const handleSubmit = () => {
        setOpen(!open);
        handleToastClose();
    };
    const handleCheck = (e, type) => {
        setCheckItems((prev) => ({
            ...prev,
            [type]: e,
        }));
    };
    // 발송성공 알림창
    const handleToastClose = () => {
        setToastOpen(!toastOpen);
    };
    useEffect(() => {
        // const clg_chc_mthd = clgEvl?.clg_chc_mthd.clg_chc_mthd; // 동료선택방식
        // const ldr_aprv_yn = clgEvl?.clg_chc_mthd.ldr_aprv_yn; // 리더승인여부
        // const getClgSelector = (item) => {
        //     switch (clg_chc_mthd) {
        //         case 'trpr_chc':
        //             return item.clg_selector.flnm;
        //         case 'ldr_chc':
        //             // 리더 선택 시 사용할 값 (예: item.ldrName)
        //             return item.ldrName;
        //         default:
        //             // 운영자 선택 시 사용할 값 (예: item.adminName)
        //             return item.adminName;
        //     }
        // };
        // const addClgSelector = filteredEvltrInfo.map((item) => ({
        //     ...item,
        //     // clg_selector: item.clg_selector?.flnm || '',
        //     // ldr_nm: item.ldr_info?.flnm || '',
        // }));
        setRows(filteredEvltrInfo);
    }, [filteredEvltrInfo]);

    return (
        <>
            <ButtonGroup className={styles.tableOptions}>
                <Button id='btnDefault11' type='default' size='sm'>
                    엑셀 업로드
                </Button>
                <Button id='btnDefault11' type='default' size='sm' onClick={handleOpen}>
                    리마인드
                </Button>
            </ButtonGroup>
            <div className={styles.dataGrid}>
                <StyledDataGrid
                    sx={{
                        width: '100%',
                        height: '500px', // 전체 높이 설정 (스크롤 활성화를 위해 제한 필요)
                        overflow: 'auto', // 스크롤 가능하게 설정
                    }}
                    getRowId={(row) => row.user_no}
                    rows={rows}
                    columns={columns}
                    hideFooter
                />
                <div className={styles.total}>Total Rows: 380</div>
            </div>
            <div className={pages.col}>
                <SwModal open={open} onClose={handleOpen} title='리마인드'>
                    <div className='msg'>1. 알림 대상</div>
                    <div className={pages.col}>
                        <Checkbox
                            id='test2'
                            label='동료 선정자'
                            value={2}
                            checked={checkItems.clg_selector}
                            onChange={(e) => handleCheck(e, 'clg_selector')}
                        />
                    </div>
                    <div className={pages.col}>
                        <Checkbox
                            id='test2'
                            label='리더'
                            value={2}
                            checked={checkItems.ldr}
                            onChange={(e) => handleCheck(e, 'ldr')}
                        />
                    </div>
                    <div className='msg'>2. 알림 방식</div>
                    <div className={pages.col}>
                        <Checkbox
                            id='test2'
                            label='insa-IT'
                            value={2}
                            checked={checkItems.insaIT}
                            onChange={(e) => handleCheck(e, 'insaIT')}
                        />
                    </div>
                    <div className={pages.col}>
                        <Checkbox
                            id='test2'
                            label='문자'
                            value={2}
                            checked={checkItems.sms}
                            onChange={(e) => handleCheck(e, 'sms')}
                        />
                    </div>
                    <div className={pages.col}>
                        <Checkbox
                            id='test2'
                            label='카카오톡'
                            value={2}
                            checked={checkItems.kakao}
                            onChange={(e) => handleCheck(e, 'kakao')}
                        />
                    </div>
                    <div className={pages.col}>
                        <Checkbox
                            id='test2'
                            label='이메일'
                            value={2}
                            checked={checkItems.email}
                            onChange={(e) => handleCheck(e, 'email')}
                        />
                    </div>
                    <div className='msg'>
                        문자, 카카오톡 알림을 선택하였으나, 핸드폰 정보가 없을 경우, 이메일로 리마인드 알림이 갑니다.
                    </div>
                    <div className='actions'>
                        <Button id='btnDefault11' type='default' size='lg' className='btnWithIcon' onClick={handleOpen}>
                            취소
                        </Button>
                        <Button
                            id='btnPrmary12'
                            type='primary'
                            size='lg'
                            className='btnWithIcon'
                            onClick={handleSubmit}
                        >
                            발송
                        </Button>
                    </div>
                </SwModal>
            </div>
            <Toast open={toastOpen} message='알림 발송하였습니다.' onClose={handleToastClose} />
        </>
    );
}
