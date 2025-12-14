import Button from 'components/Button';
import SwModal from 'components/Modal';
import Typography from 'components/Typography';
import dayjs from 'dayjs';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    fetcherPostCmcd,
    fetcherPostCommonGridData,
    fetcherPostData,
    fetcherPostGridData,
    fetcherPostScr,
} from 'utils/axios';
import { IcoCheckFill, IcoDelete, IcoEdit, IcoGroup, IcoInfo, IcoPerson } from '@/assets/Icon';
import styles from '../../styles/pages/OgnzOwnereReg/page.module.scss';
import Loader from '../Loader';
import SwDateRangePicker from 'components/DateRangePicker';
import { Box, Stack } from '@mui/material';
import { CustomColumnMenu, CustomNoRowsOverlay, StyledDataGrid } from 'components/Grid';
import { GridColDef, GridRowModesModel, useGridApiRef } from '@mui/x-data-grid-premium';
import { randomId } from '@mui/x-data-grid-generator';
import CustomButton from 'components/CustomButton';
import BoxSelect from 'components/BoxSelect';

const OgnzOwnerReg = ({ params, setParams, setMasterRetrieve }) => {
    const { modal_info, open } = params;
    const [dataLoading, setDataLoading] = useState(true);
    const [masterData, setMasterData] = useState(null);
    const [leaderData, setLeaderData] = useState(null);
    const [comboData, setComboData] = useState(null);
    const [agtData, setAgtData] = useState(null);
    const [clickData, setClickData] = useState(null);
    const [editYn, setEditYn] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteData, setDeleteData] = useState(null);
    const [leaderOpen, setLeaderOpen] = useState(false);
    const keysToRemove = [
        'ognz_no',
        'ognz_info|ognz_ldr_user_no',
        'ognz_info|agt_user_no',
        'ognz_info|agt_dsgn_bgng_ymd',
        'ognz_info|agt_dsgn_end_ymd',
    ];

    const filteredData = Object.fromEntries(Object.entries(modal_info).filter(([key]) => keysToRemove.includes(key)));

    const transformedObj = Object.entries(filteredData).reduce((newObj, [key, value]) => {
        const pipeIndex = key.indexOf('|');
        const newKey = pipeIndex !== -1 ? key.substring(pipeIndex + 1) : key;
        newObj[newKey] = value;
        return newObj;
    }, {});

    const [sendData, setSendData] = useState(transformedObj);

    const columns = [
        { field: 'flnm', headerName: '이름', width: 150, headerAlign: 'center', align: 'center' },
        { field: 'user_no', headerName: '사번', width: 150, headerAlign: 'center', align: 'center' },
        {
            field: 'apnt_duty',
            headerName: '직무',
            width: 150,
            headerAlign: 'center',
            align: 'center',
            enum: 'hrs_group00934',
        }, // 새로 추가
        {
            field: 'apnt_jbps',
            headerName: '직위',
            width: 150,
            headerAlign: 'center',
            align: 'center',
            enum: 'hrs_group00935',
        },
        {
            field: 'apnt_jbttl',
            headerName: '직책',
            width: 150,
            minWidth: 150,
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            enum: 'hrs_group00936',
        },
    ] as GridColDef[];
    const btnInfo = [
        {
            seq: '1',
            text: '조직장 등록',
            type: 'LEADER_AUTH_OPEN',
        },
        {
            seq: '2',
            text: '대리인 등록',
            type: 'AGT_AUTH',
        },
    ];
    const gridRef = useGridApiRef();
    const comboList = ['hrs_group00934', 'hrs_group00935', 'hrs_group00936', 'hpo_group01031'];
    const [rows, setRows] = useState([]);
    const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});
    const auth = JSON.parse(localStorage.getItem('auth'));
    const rprsOgnzNo = auth?.state?.rprsOgnzNo ?? '';
    const { t } = useTranslation();

    const onClose = () => {
        setParams((prev) => {
            return {
                ...prev,
                open: !open,
            };
        });
    };

    const onSelectClose = () => {
        setLeaderOpen(false);
    };

    const onDeleteClose = () => {
        setDeleteOpen(false);
    };

    const onChangeSelect = (value) => {
        setClickData((prev) => ({
            ...prev,
            apnt_jbttl_cd: value,
        }));
    };

    const onDelete = (type: string, flnm: string) => {
        setDeleteData({
            type: type,
            flnm: flnm,
        });
        setDeleteOpen(true);
    };

    const onChangeDatePicker = (value) => {
        console.log(value);
        const bgng_ymd = dayjs(value[0]).format('YYYYMMDD');
        const end_ymd = dayjs(value[1]).format('YYYYMMDD');

        if (bgng_ymd !== 'Invalid Date') {
            setSendData((prev) => ({
                ...prev,
                agt_dsgn_bgng_ymd: bgng_ymd,
            }));
        }

        if (end_ymd !== 'Invalid Date') {
            setSendData((prev) => ({
                ...prev,
                agt_dsgn_end_ymd: end_ymd,
            }));
        }
    };

    const onSave = () => {
        const leader_user_no = sendData.ognz_ldr_user_no;

        if (leader_user_no === undefined || leader_user_no === null || !leader_user_no) {
            alert('조직장을 등록해주세요');
        } else {
            const items = [
                {
                    sqlId: 'hrs_com01',
                    sql_key: 'ognz_leader_agt_update',
                    params: [{ ognz_info: sendData }],
                },
            ];

            fetcherPostData(items)
                .then((response) => {
                    setMasterRetrieve(true);
                    onClose();
                })
                .catch((error) => {
                    console.error(error);
                })
                .finally(() => {});
        }
    };

    const handleBtnClick = (type: string) => {
        const selectRows = gridRef.current.getSelectedRows() || null;

        if (selectRows.size === 0 && type !== 'LEADER_AUTH_DELETE' && type !== 'AGT_AUTH_DELETE') {
            alert('등록할 구성원을 선택하세요');
        } else {
            switch (type) {
                case 'LEADER_AUTH_OPEN':
                    setLeaderOpen(true);
                    selectRows.forEach((row) => {
                        setClickData({
                            apnt_jbttl_cd: row.apnt_jbttl_cd,
                            flnm: row.flnm,
                        });
                    });

                    break;
                case 'LEADER_AUTH':
                    // 저장 시 추후 발령 로직 필요(직책변경)
                    setLeaderOpen(false);
                    selectRows.forEach((row) => {
                        if (modal_info?.ognz_ldr_user_no !== row.user_no) {
                            setSendData((prev) => ({
                                ...prev,
                                ognz_ldr_user_no: row.user_no,
                                ognz_ldr_flnm: row.flnm,
                                ognz_ldr_reg_ymd: dayjs(new Date()).format('YYYYMMDD'),
                                apnt_jbttl: comboData?.['hrs_group00935']?.find(
                                    (v) => v.com_cd === clickData?.apnt_jbttl_cd
                                )?.com_cd_nm,
                            }));
                            setLeaderData({
                                ...row,
                                ognz_ldr_reg_ymd: dayjs(new Date()).format('YYYYMMDD'),
                                apnt_jbttl: comboData?.['hrs_group00935']?.find(
                                    (v) => v.com_cd === clickData?.apnt_jbttl_cd
                                )?.com_cd_nm,
                            });
                        } else {
                            setSendData((prev) => ({
                                ...prev,
                                ognz_ldr_user_no: row.user_no,
                                ognz_ldr_flnm: row.flnm,
                                ognz_ldr_reg_ymd: modal_info.ognz_ldr_reg_ymd,
                                apnt_jbttl: row.apnt_jbttl,
                            }));
                            setLeaderData({ ...row, ognz_ldr_reg_ymd: modal_info.ognz_ldr_reg_ymd });
                        }
                    });
                    break;
                case 'LEADER_AUTH_DELETE':
                    setDeleteOpen(false);
                    // 해당 조직장의 직책이 인사기준정보의 조직장여부에 체크 되어있는지 확인 필요
                    setLeaderData([]);
                    setSendData((prev) => ({
                        ...prev,
                        ognz_ldr_user_no: null,
                        ognz_ldr_flnm: null,
                        ognz_ldr_reg_ymd: null,
                    }));
                    break;
                case 'AGT_AUTH_DELETE':
                    setDeleteOpen(false);
                    setAgtData([]);
                    setSendData((prev) => ({
                        ...prev,
                        agt_user_no: null,
                        agt_flnm: null,
                        agt_dsgn_bgng_ymd: null,
                        agt_dsgn_end_ymd: null,
                    }));
                    break;
                case 'AGT_AUTH':
                    selectRows.forEach((row) => {
                        if (modal_info?.agt_user_no !== row.user_no) {
                            setSendData((prev) => ({
                                ...prev,
                                agt_user_no: row.user_no,
                                agt_flnm: row.flnm,
                                agt_dsgn_bgng_ymd: dayjs(new Date()).format('YYYYMMDD'),
                                agt_dsgn_end_ymd: null,
                            }));
                            setAgtData({
                                ...row,
                                agt_dsgn_prd: dayjs(new Date()).format('YYYYMMDD') + ' ~ ',
                            });
                        } else {
                            console.log(11111);
                            setSendData((prev) => ({
                                ...prev,
                                agt_user_no: row.user_no,
                                agt_flnm: row.flnm,
                                agt_dsgn_bgng_ymd: modal_info?.agt_dsgn_bgng_ymd,
                                agt_dsgn_end_ymd: modal_info?.agt_dsgn_end_ymd,
                            }));
                            setAgtData({
                                ...row,
                                agt_dsgn_prd: modal_info?.agt_dsgn_prd,
                            });
                        }
                    });
                    break;
                default:
                    break;
            }
        }
    };

    // 마스터 그리드 데이터조회
    useEffect(() => {
        const item = [
            {
                sqlId: 'hpo_apnt01',
                sql_key: 'hpo_apnt_ognzno_userno',
                params: [{ ognz_no: modal_info?.ognz_no, user_no: '' }],
            },
        ];

        fetcherPostData(item)
            .then((response) => {
                const data = response;
                const nullData = response?.[0].data;

                if (nullData === null) {
                    setMasterData(nullData);
                } else setMasterData(data);
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                setDataLoading(false);
            });

        comboList.map((data) => {
            fetcherPostCmcd({
                group_cd: data,
                rprs_ognz_no: data === 'hpo_group01031' ? 'COMGRP' : rprsOgnzNo,
            })
                .then((response) => {
                    setComboData((prev) => ({
                        ...prev,
                        [data]: response,
                    }));
                })
                .catch((error) => {
                    console.error(error);
                });
        });
    }, [params]);

    useEffect(() => {
        if (masterData && masterData.length > 0) {
            let seq = 1;
            const id = randomId(); // 고유 ID 추가
            const rows = masterData.map((row, index) => ({
                id: id + index,
                seq: seq++,
                ...(seq === 2 ? { status: 'clicked' } : {}),
                apnt_duty: comboData?.['hrs_group00934']?.find((v) => v.com_cd === row.apnt_duty_cd)?.com_cd_nm,
                apnt_jbps: comboData?.['hrs_group00936']?.find((v) => v.com_cd === row.apnt_jbps_cd)?.com_cd_nm,
                apnt_jbttl: comboData?.['hrs_group00935']?.find((v) => v.com_cd === row.apnt_jbttl_cd)?.com_cd_nm,
                ...row,
            }));
            setRows(rows);
            setLeaderData(
                Object.values(rows).find((obj) => obj.user_no === modal_info?.['ognz_info|ognz_ldr_user_no'])
            );
            setAgtData(Object.values(rows).find((obj) => obj.user_no === modal_info?.['ognz_info|agt_user_no']));
        } else {
            setRows([]);
            setLeaderData([]);
            setAgtData([]);
        }
    }, [masterData, comboData]);

    // if (dataLoading) return <Loader />;

    return (
        <>
            <SwModal
                open={open}
                size='xl'
                maxWidth='900px'
                onClose={onClose}
                PaperProps={{
                    sx: {
                        m: 0,
                        height: '100vh', // 화면 높이 전체 (100vh)
                        Maximize: '100vh',
                        position: 'fixed',
                        top: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: 0, // 모서리 둥글지 않게
                    },
                }}
                className={styles.ognzOwnerReg}
            >
                {/* 상단 타이틀 */}
                <Typography type='form'>조직장, 대리인 지정</Typography>
                <div className={styles.organizationName}>
                    <div className={styles.icon}>
                        <IcoGroup fill='#666' />
                    </div>
                    {modal_info?.['ognz_info|ognz_nm']} <span className='code'>{modal_info?.ognz_no}</span>
                </div>
                <div className={styles.registration}>
                    <ul className={styles.list}>
                        {leaderData && Object.keys(leaderData).length > 0 ? (
                            <li className={styles.item}>
                                <div className={styles.tit}>조직장</div>
                                <div className={styles.info}>
                                    <div className={styles.img}>
                                        <Image
                                            src={'/api/file/imgView/' + leaderData?.file_nm}
                                            width={34}
                                            height={34}
                                            alt={''}
                                        ></Image>
                                    </div>
                                    <div className={styles.text}>
                                        <div className={styles.name}>{leaderData?.flnm}</div>
                                        <div className={styles.position}>
                                            {leaderData?.ognz_nm}, {leaderData?.apnt_jbps}, {leaderData?.apnt_jbttl}
                                        </div>
                                        <div className={styles.term}>
                                            <div className={styles.title}>대결자지정</div>
                                            <div className={styles.date}>
                                                {
                                                    comboData?.['hpo_group01031']?.find(
                                                        (v) => v.com_cd === modal_info?.['ognz_info|agt_dsgn_authrt_cd']
                                                    )?.com_cd_nm
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.code}>{leaderData?.user_no}</div>
                                </div>
                                <Button
                                    type='default'
                                    size='sm'
                                    className={styles.btnUnReg}
                                    onClick={() => onDelete('조직장', leaderData?.flnm)}
                                >
                                    조직장 해제
                                </Button>
                            </li>
                        ) : (
                            <li className={styles.item}>
                                <div className={styles.tit}>조직장</div>
                                <div className={`${styles.info} ${styles.noData}`}>
                                    <div className={styles.icon}>
                                        <IcoPerson fill='#666666' />
                                    </div>
                                    조직장이 지정되지 않았습니다.
                                </div>
                                {/* <Button type='default' size='sm' className={styles.btnUnReg}>
                                    조직장 해제
                                </Button> */}
                            </li>
                        )}
                        {agtData && Object.keys(agtData).length > 0 ? (
                            <li className={styles.item}>
                                <div className={styles.tit}>대리인</div>
                                <div className={styles.info}>
                                    <div className={styles.img}>
                                        <Image
                                            src={'/api/file/imgView/' + agtData?.file_nm}
                                            width={34}
                                            height={34}
                                            alt={''}
                                        ></Image>
                                    </div>
                                    <div className={styles.text}>
                                        <div className={styles.name}>{agtData?.flnm}</div>
                                        <div className={styles.position}>
                                            {agtData?.ognz_nm}, {agtData?.apnt_jbps}, {agtData?.apnt_jbttl}
                                        </div>
                                        <div className={styles.term}>
                                            {editYn ? (
                                                <SwDateRangePicker
                                                    id={agtData?.user_no}
                                                    defaultValue={dayjs(new Date())}
                                                    value={[
                                                        dayjs(sendData?.agt_dsgn_bgng_ymd),
                                                        dayjs(sendData?.agt_dsgn_end_ymd),
                                                    ]}
                                                    onChange={onChangeDatePicker}
                                                />
                                            ) : (
                                                <>
                                                    <div className={styles.title}>지정 기간</div>
                                                    <div className={styles.date}>{agtData?.agt_dsgn_prd}</div>
                                                    <Button className={styles.btnEdit} onClick={() => setEditYn(true)}>
                                                        <IcoEdit fill='#666666' />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className={styles.code}>{agtData?.user_no}</div>
                                </div>
                                <Button
                                    type='default'
                                    size='sm'
                                    className={styles.btnUnReg}
                                    onClick={() => onDelete('대리인', agtData?.flnm)}
                                >
                                    대리인 해제
                                </Button>
                            </li>
                        ) : (
                            <li className={styles.item}>
                                <div className={styles.tit}>대리인</div>
                                <div className={`${styles.info} ${styles.noData}`}>
                                    <div className={styles.icon}>
                                        <IcoPerson fill='#666666' />
                                    </div>
                                    대리인이 지정되지 않았습니다.
                                </div>
                                {/* <Button type='default' size='sm' className={styles.btnUnReg}>
                                    대리인 해제
                                </Button> */}
                            </li>
                        )}
                    </ul>
                </div>
                <div className='gridHeader'>
                    <Typography type='table'>{t('구성원관리')}</Typography>
                    <Stack direction={'row'} sx={{ justifyContent: 'space-between', alignItems: 'center', gap: '5px' }}>
                        {btnInfo?.map((item) => (
                            <CustomButton
                                key={item.seq}
                                customButton={item}
                                clickEvent={() => handleBtnClick(item.type)}
                                setData={setRows}
                                className='btnDefault sm reset'
                            />
                        ))}
                    </Stack>
                </div>
                <Box
                    sx={{
                        width: '100%',
                        height: '400px',
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
                        apiRef={gridRef}
                        rows={rows}
                        columns={columns}
                        editMode='cell'
                        rowModesModel={rowModesModel}
                        slots={{
                            noRowsOverlay: CustomNoRowsOverlay,
                            columnMenu: CustomColumnMenu,
                        }}
                        checkboxSelection={true}
                        disableMultipleRowSelection={true}
                        disableRowSelectionOnClick
                        hideFooterRowCount
                        onProcessRowUpdateError={(error) => console.log(error)}
                        localeText={{
                            columnMenuSortAsc: '오름차순 정렬',
                            columnMenuSortDesc: '내림차순 정렬',
                            columnMenuUnsort: '정렬 해제',
                            columnMenuFilter: '필터',
                            filterPanelAddFilter: '필터 추가',
                            noRowsLabel: '표시할 데이터가 없습니다',
                            noResultsOverlayLabel: '표시할 데이터가 없습니다.',
                        }}
                        getRowClassName={(params) => `super-app-theme--${params.row.status}`}
                        rowHeight={30}
                    />
                </Box>
                <div className={styles.pageBtnArea}>
                    <Button type='default' size='lg' onClick={onClose} className='btnWithIcon'>
                        <IcoDelete fill='#7C7C7C' />
                        취소
                    </Button>
                    <Button type='primary' size='lg' onClick={onSave} className='btnWithIcon'>
                        <IcoCheckFill fill='#FFFFFF' />
                        저장
                    </Button>
                </div>
            </SwModal>
            <SwModal open={leaderOpen} onClose={onSelectClose} className={styles.agtAuth} title='조직장 등록'>
                <div className={styles.msg}>
                    <IcoInfo fill='var(--primary)' />
                    조직장으로 등록 시 사용할 직책을 선택해주세요.
                    <br />
                    현재의 직책을 그대로 유지할 수도 있습니다.
                </div>
                <BoxSelect
                    id='apnt_jbttl_cd'
                    placeholder='선택하지 않음'
                    label='직책'
                    asterisk
                    value={clickData?.apnt_jbttl_cd}
                    onChange={(e) => {
                        onChangeSelect(e.target.value);
                    }}
                    options={comboData?.['hrs_group00935'] || []}
                    vertical
                />
                <div className={styles.caution}>
                    &apos;<span className={styles.emphasis}>{clickData?.flnm}</span>&lsquo;님을 조직장 등록
                    하시겠습니까?
                </div>
                <div className='actions'>
                    <Button
                        id='close'
                        key='close'
                        size='lg'
                        onClick={() => onSelectClose()}
                        className='btnDefault'
                        size='sm'
                    >
                        취소
                    </Button>
                    <Button
                        id='confirm'
                        key='confirm'
                        size='lg'
                        onClick={() => handleBtnClick('LEADER_AUTH')}
                        className='btnPrimary'
                        size='sm'
                    >
                        확인
                    </Button>
                </div>
            </SwModal>
            <SwModal open={deleteOpen} onClose={onDeleteClose} size='md' className={styles.agtAuth}>
                <div className={styles.msg}>
                    {deleteData?.flnm}님을 {deleteData?.type} 해제하시겠습니까?
                </div>
                {/* <div className={styles.msg}>{agtData?.flnm}님을 대리인 해제하시겠습니까?</div> */}
                <div className='actions'>
                    <Button
                        id='close'
                        key='close'
                        size='lg'
                        onClick={() => onDeleteClose()}
                        className='btnDefault'
                        size='sm'
                    >
                        취소
                    </Button>
                    <Button
                        id='confirm'
                        key='confirm'
                        size='lg'
                        onClick={() =>
                            deleteData?.type === '조직장'
                                ? handleBtnClick('LEADER_AUTH_DELETE')
                                : handleBtnClick('AGT_AUTH_DELETE')
                        }
                        className='btnPrimary'
                        size='sm'
                    >
                        확인
                    </Button>
                </div>
            </SwModal>
        </>
    );
};

export default OgnzOwnerReg;
