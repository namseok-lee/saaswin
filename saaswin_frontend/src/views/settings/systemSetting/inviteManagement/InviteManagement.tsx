// InviteManagement.tsx
'use client';

import { Alert, Snackbar } from '@mui/material';
import Typography from 'components/Typography';
import { useEffect, useState } from 'react';
import FormDrawer from './FormDrawer';
import FormClct from './FormClct';
import Button from 'components/Button';
import { IcoAdd, IcoArrowOutWard, IcoEdit, IcoMaster, IcoPersonFill, IcoTrashFill } from '@/assets/Icon';
import { fetcherPost, fetcherPostCmcd, fetcherPostData } from 'utils/axios';
import SwModal from 'components/Modal';
import { VisitInfo } from 'views/vA002/VisitInfo';

const InviteManagement = () => {
    const [openDrawer, setOpenDrawer] = useState(false);
    const [openClct, setOpenClct] = useState(false);
    const [title, setTitle] = useState('');
    const [selectedIndex, setSelectedIndex] = useState<{ type: 'input' | 'collect'; index: number } | null>(null);
    const [selectedForm, setSelectedForm] = useState<any>(null);
    const [inputForms, setInputForms] = useState<any[]>([]);
    const [collectForms, setCollectForms] = useState<any[]>([]);
    const [deleteSnackbarOpen, setDeleteSnackbarOpen] = useState(false);
    const [deleteMessage, setDeleteMessage] = useState('');
    const [deleteCallback, setDeleteCallback] = useState(() => () => {});
    const [refreshForms, setRefreshForms] = useState(false);

    const [defaultArticleData, setDefaultArticleData] = useState<any[]>([]);
    const [defaultDataLoaded, setDefaultDataLoaded] = useState(false);

    useEffect(() => {
        const loadDefaultArticleData = async () => {
            try {
                const response = await fetcherPostCmcd({
                    group_cd: 'hpr_group00001',
                    rprs_ognz_no: 'COMGRP',
                });

                // Grid에서 사용할 형태로 변환
                const formattedData = response.map((item) => ({
                    artcl: item.com_cd,
                    com_cd_nm: item.com_cd_nm,
                    clct_type: item.clct_type,
                    clct_yn: item.clct_yn,
                    esntl_yn: item.esntl_yn,
                }));

                //setDefaultArticleData(formattedData);
                setDefaultArticleData(response);
                setDefaultDataLoaded(true);
            } catch (error) {
                console.error('기본 개인정보 항목 조회 실패:', error);
                setDefaultArticleData([]);
                setDefaultDataLoaded(true); // 에러여도 로드 완료로 표시
            }
        };

        loadDefaultArticleData();
    }, []);

    useEffect(() => {
        if (refreshForms) {
            fetchCollectForms();
            setRefreshForms(false);
        }
    }, [refreshForms]);

    // 삭제 스낵바 열기
    const handleShowDeleteSnackbar = (type: 'input' | 'collect', index: number) => {
        const formName = type === 'input' ? inputForms[index].inpt_nm : collectForms[index].clct_nm;

        setDeleteMessage(`"${formName}" 항목을 삭제하시겠습니까?`);

        // 삭제 콜백 함수 설정
        setDeleteCallback(() => () => {
            if (type === 'input') {
                console.log('입력 항목 삭제', inputForms);
                // 입력 항목 삭제
                const selectedId = inputForms[index]?.invtn_inpt_id;
                const item = [
                    {
                        sqlId: 'hpr_invtn01',
                        sql_key: 'hpr_invtn_inpt_dtl_delete',
                        params: [{ invtn_inpt_id: selectedId }],
                    },
                ];
                fetcherPostData(item)
                    .then((response) => {
                        fetchInputForms();
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            } else {
                // 수집 항목 삭제
                const selectedId = collectForms[index]?.invtn_clct_id;
                const item = [
                    {
                        sqlId: 'hpr_invtn01',
                        sql_key: 'hpr_invtn_clct_delete',
                        params: [{ invtn_clct_id: selectedId }],
                    },
                ];
                fetcherPostData(item)
                    .then((response) => {
                        fetchCollectForms();
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            }
            // 스낵바 닫기
            setDeleteSnackbarOpen(false);
        });

        // 스낵바 열기
        setDeleteSnackbarOpen(true);
    };

    // 스낵바 닫기
    const handleCloseDeleteSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setDeleteSnackbarOpen(false);
    };

    //  모달 열기 (선택한 유형과 인덱스를 저장)
    const handleOpenDrawer = (type: 'input' | 'collect', index: number) => {
        setSelectedIndex({ type, index });

        const selectedForm = type === 'input' ? inputForms[index] : collectForms[index];

        // 폼 타입에 따라 title 설정
        if (type === 'input') {
            setTitle(selectedForm.inpt_nm || '');
        } else {
            // collectForms가 문자열이면 그대로 사용, 객체면 clct_nm 속성 사용
            setTitle(typeof selectedForm === 'string' ? selectedForm : selectedForm.clct_nm || '');
        }

        setSelectedForm(selectedForm);

        if (type === 'input') {
            setOpenDrawer(true);
        } else {
            setOpenClct(true);
        }
    };

    //  모달 닫기
    const handleCloseDrawer = () => {
        setOpenDrawer(false);
        setSelectedIndex(null);
    };

    const handleCloseClct = () => {
        setOpenClct(false);
        setRefreshForms(true);
        setSelectedIndex(null);
    };

    // 이름 변경시 실행하는 함수
    const handleUpdateFormTitle = (newTitle: string, formData: any = null): boolean => {
        // 중복 체크
        if (!newTitle || newTitle.trim() === '') {
            alert('양식 이름을 입력해주세요.');
            return false;
        }

        // 새 항목 추가인 경우
        if (selectedIndex && selectedIndex.index === -1) {
            // 현재 선택된 양식 유형
            const isInputType = selectedIndex.type === 'input';

            // 기존 목록에서 중복 체크
            const isDuplicate = isInputType
                ? inputForms.some((form) => form.inpt_nm === newTitle)
                : collectForms.some((form) => form.clct_nm === newTitle);

            if (isDuplicate) {
                alert(isInputType ? '이미 존재하는 입력 항목 제목입니다.' : '이미 존재하는 수집 항목 제목입니다.');
                return false;
            }

            // 입력 항목인 경우 API 호출하여 저장
            if (isInputType) {
                // API 호출 데이터 구성
                const item = [
                    {
                        sqlId: 'hpr_invtn01',
                        sql_key: 'hpr_invtn_inpt_upsert',
                        params: [
                            {
                                inpt_nm: newTitle,
                                ...(formData || {}), // FormDrawer에서 전달된 데이터 포함
                            },
                        ],
                    },
                ];

                fetcherPostData(item)
                    .then((response) => {
                        // 성공 시 목록 새로고침
                        fetchInputForms();
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            }

            // 양식 상태 업데이트
            setTitle(newTitle);
            return true;
        }

        // 기존 항목 수정 - 이름 중복 체크
        // 양식 유형 확인
        const isInputType = selectedIndex.type === 'input';
        const currentForms = isInputType ? inputForms : collectForms;
        const currentIndex = selectedIndex.index;

        // 중복 체크
        const isDuplicate = currentForms.some(
            (form, i) => i !== currentIndex && (isInputType ? form.inpt_nm : form.clct_nm) === newTitle
        );

        if (isDuplicate) {
            alert(isInputType ? '이미 존재하는 입력 항목 제목입니다.' : '이미 존재하는 수집 항목 제목입니다.');
            return false;
        }

        // 폼 상태 업데이트
        if (isInputType) {
            setInputForms((prev) =>
                prev.map((form, i) => (i === currentIndex ? { ...form, inpt_nm: newTitle } : form))
            );

            // 입력 항목인 경우 API 호출하여 저장
            const seletedId = inputForms[currentIndex]?.invtn_inpt_id;
            const item = [
                {
                    sqlId: 'hpr_invtn01',
                    sql_key: 'hpr_invtn_inpt_upsert',
                    params: [
                        {
                            invtn_inpt_id: seletedId,
                            inpt_nm: newTitle,
                            ...(formData || {}), // FormDrawer에서 전달된 데이터 포함
                        },
                    ],
                },
            ];

            fetcherPostData(item)
                .then((response) => {
                    fetchInputForms();
                })
                .catch((error) => {
                    console.log(error);
                });
        } else {
            setCollectForms((prev) =>
                prev.map((form, i) => (i === currentIndex ? { ...form, clct_nm: newTitle } : form))
            );
            // 수집 항목은 GridButtons에서 저장
        }

        // 선택된 폼 업데이트
        setSelectedForm((prev) =>
            prev
                ? {
                      ...prev,
                      ...(isInputType ? { inpt_nm: newTitle } : { clct_nm: newTitle }),
                  }
                : prev
        );

        // 타이틀 업데이트
        setTitle(newTitle);
        return true;
    };

    // 입력 항목 전체 조회
    useEffect(() => {
        fetchInputForms();
        fetchCollectForms();
    }, []);

    // 입력 항목 추가 - API 호출 없이 드로워만 열기
    const handleAddInputForm = () => {
        // 현재 날짜/시간을 포맷팅하여 고유한 이름 생성
        // const now = new Date();
        // const year = now.getFullYear();
        // const month = String(now.getMonth() + 1).padStart(2, '0');
        // const day = String(now.getDate()).padStart(2, '0');
        // const hours = String(now.getHours()).padStart(2, '0');
        // const minutes = String(now.getMinutes()).padStart(2, '0');
        // const seconds = String(now.getSeconds()).padStart(2, '0');

        // const formattedDateTime = `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
        // const newFormName = `입력항목 ${formattedDateTime}`;
        const newFormName = '';

        // 양식 정보 및 UI 상태 초기화
        setTitle(newFormName);
        setSelectedForm({}); // 빈 객체로 설정 (id 없음)
        setSelectedIndex({ type: 'input', index: -1 }); // -1은 신규 항목 의미

        // 드로워만 열기 (API 호출 없음)
        setOpenDrawer(true);
    };

    // 수집항목 추가 - API 호출 없이 드로워만 열기
    const handleAddCollectForm = () => {
        // 현재 날짜/시간 기반 이름 생성
        // const now = new Date();
        // const year = now.getFullYear();
        // const month = String(now.getMonth() + 1).padStart(2, '0');
        // const day = String(now.getDate()).padStart(2, '0');
        // const hours = String(now.getHours()).padStart(2, '0');
        // const minutes = String(now.getMinutes()).padStart(2, '0');
        // const seconds = String(now.getSeconds()).padStart(2, '0');

        // const formattedDateTime = `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
        // const newFormName = `수집항목 ${formattedDateTime}`;
        const newFormName = '';

        // 양식 정보 및 UI 상태 초기화
        setTitle(newFormName);
        setSelectedForm({}); // 빈 객체로 설정 (id 없음)
        setSelectedIndex({ type: 'collect', index: -1 }); // -1은 신규 항목 의미

        // 드로워만 열기 (API 호출 없음)
        setOpenClct(true);
    };

    // 입력 항목 조회
    const fetchInputForms = async () => {
        const item = [
            {
                sqlId: 'hpr_invtn01',
                sql_key: 'hpr_invtn_inpt_select',
                params: [{}],
            },
        ];
        fetcherPostData(item)
            .then((response) => {
                setInputForms(response);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    // 수집항목 조회
    const fetchCollectForms = async () => {
        const item = [
            {
                sqlId: 'hpr_invtn01',
                sql_key: 'hpr_invtn_clct_select',
                params: [{}],
            },
        ];
        fetcherPostData(item)
            .then((response) => {
                setCollectForms(response);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    // 입력 항목 삭제 함수
    const handleDeleteInputForm = (indexToDelete: number) => {
        const seletedId = inputForms[indexToDelete]?.invtn_inpt_id;
        const item = [
            {
                sqlId: 'hpr_invtn01',
                sql_key: 'hpr_invtn_inpt_dtl_delete',
                params: [{ invtn_inpt_id: seletedId }],
            },
        ];
        // 입력항목 삭제
        fetcherPostData(item)
            .then((response) => {
                fetchInputForms();
            })
            .catch((error) => {
                console.log(error);
            });
    };

    // 수집 항목 삭제 함수
    const handleDeleteCollectForm = (indexToDelete: number) => {
        const seletedId = collectForms[indexToDelete]?.invtn_clct_id;
        const item = [
            {
                sqlId: 'hpr_invtn01',
                sql_key: 'hpr_invtn_clct_dtl_delete',
                params: [{ invtn_clct_id: seletedId }],
            },
        ];
        console.log('수집 항목 삭제');
        // 수집항목 삭제
        fetcherPostData(item)
            .then((response) => {
                fetchCollectForms();
            })
            .catch((error) => {
                console.log(error);
            });
    };
    const TrackedButton = VisitInfo('a', 'SF');
    return (
        <div className='contContainer'>
            <div className='configuration inviteManagement'>
                <div className='pageHeader'>
                    <div className='pageInfo'>
                        <Typography type='page' desc tooltip title='초대 관리'>
                            초대 관리
                        </Typography>
                    </div>
                </div>

                {/* 구성원 제출 항목 */}
                <section className='part'>
                    <div className='partTitle'>
                        <div className='tag'>
                            <IcoMaster /> <div className='text'>관리자용</div>
                        </div>
                        초대 후 입력 항목 양식 관리
                    </div>
                    <div className='sectionCont'>
                        <div className='btnFormArea'>
                            {inputForms.map((form, index) => (
                                <div
                                    className='btnForm basic'
                                    key={index}
                                    onClick={() => handleOpenDrawer('input', index)}
                                >
                                    <div className='ico'>
                                        <IcoEdit fill='#fff' />
                                    </div>
                                    {form.inpt_nm}
                                    <IcoArrowOutWard fill='#c4c4c4' className='icoArrow' />
                                    {inputForms.length > 1 && ( // 2개 이상일 때만 삭제 버튼 표시
                                        <TrackedButton
                                            className='btnDelete'
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleShowDeleteSnackbar('input', index);
                                            }}
                                        >
                                            <IcoTrashFill fill='#7C7C7C' />
                                            삭제
                                        </TrackedButton>
                                    )}
                                </div>
                            ))}
                            <div className='btnForm add' onClick={handleAddInputForm}>
                                <div className='ico'>
                                    <IcoAdd fill='#fff' />
                                </div>
                                양식 추가하기
                                <IcoArrowOutWard fill='#c4c4c4' className='icoArrow' />
                            </div>
                        </div>
                    </div>
                </section>

                {/* 관리자 수집 항목 */}
                <section className='part'>
                    <div className='partTitle'>
                        <div className='tag'>
                            <IcoPersonFill /> <div className='text'>구성원용</div>
                        </div>
                        구성원 제출 항목 양식 관리
                    </div>

                    <div className='sectionCont'>
                        <div className='btnFormArea'>
                            {collectForms.map((form, index) => (
                                <div
                                    className='btnForm basic'
                                    key={index}
                                    onClick={() => handleOpenDrawer('collect', index)}
                                >
                                    <div className='ico'>
                                        <IcoEdit fill='#fff' />
                                    </div>
                                    {form.clct_nm}
                                    <IcoArrowOutWard fill='#c4c4c4' className='icoArrow' />
                                    {collectForms.length > 1 && ( // 2개 이상일 때만 삭제 버튼 표시
                                        <Button
                                            className='btnDelete'
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleShowDeleteSnackbar('collect', index);
                                            }}
                                        >
                                            <IcoTrashFill fill='#7C7C7C' />
                                            삭제
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <div className='btnForm add' onClick={handleAddCollectForm}>
                                <div className='ico'>
                                    <IcoAdd fill='#fff' />
                                </div>
                                양식 추가하기
                                <IcoArrowOutWard fill='#c4c4c4' className='icoArrow' />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Form Modals */}
                {selectedIndex !== null && (
                    <FormDrawer
                        open={openDrawer}
                        onClose={handleCloseDrawer}
                        title={title}
                        setTitle={handleUpdateFormTitle}
                        id={selectedForm?.invtn_inpt_id}
                        isNewForm={selectedIndex.index === -1}
                    />
                )}
                {selectedIndex !== null && (
                    <FormClct
                        defaultArticleData={defaultArticleData}
                        defaultDataLoaded={defaultDataLoaded}
                        tpcd={'SYS002'}
                        open={openClct}
                        onClose={handleCloseClct}
                        title={title}
                        setTitle={handleUpdateFormTitle}
                        id={selectedForm?.invtn_clct_id}
                        isNewForm={selectedIndex.index === -1}
                        setRefreshForms={setRefreshForms}
                    />
                )}

                {/* alert */}
                <SwModal
                    open={deleteSnackbarOpen}
                    onClose={handleCloseDeleteSnackbar}
                    title='Popup Title'
                    txtBtn1='txtBtn1'
                    txtBtn2='txtBtn2'
                >
                    <div className='msg'>{deleteMessage}</div>
                    <div className='actions'>
                        <Button
                            id='btnDefault11'
                            type='default'
                            size='lg'
                            className='btnWithIcon'
                            onClick={handleCloseDeleteSnackbar}
                        >
                            취소
                        </Button>
                        <Button
                            id='btnPrmary12'
                            type='primary'
                            size='lg'
                            className='btnWithIcon'
                            onClick={deleteCallback}
                        >
                            삭제
                        </Button>
                    </div>
                </SwModal>
            </div>
        </div>
    );
};

export default InviteManagement;
