'use client';
import { Grid, Menu, MenuItem, Stack } from '@mui/material';
import '@nosferatu500/react-sortable-tree/style.css';
import Button from 'components/Button';
import ButtonGroup from 'components/ButtonGroup';
import ContractFullDialog from 'components/FullDialog/eformsuite/ContractFullDialog';
import PreviewFullDialog from 'components/FullDialog/eformsuite/PreviewFullDialog';
import TemplateCreateFullDialog from 'components/FullDialog/eformsuite/TemplateCreateFullDialog';
import Loader from 'components/Loader';
import SearchCondition from 'components/SearchCondition';
import Typography from 'components/Typography';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Param } from 'types/component/SearchCondition';
import { CardData } from 'types/component/eformsuite';
import { fetcherPostCommonGridData, fetcherPostCommonSave, fetcherPostData, fetcherPostScr } from 'utils/axios';
import styles from '../../styles/pages/Template/page.module.scss';
import { IcoCheck, IcoEditFill, IcoPreview } from '@/assets/Icon';
import { useAuthStore } from 'utils/store/auth';
import { randomId } from '@mui/x-data-grid-generator';

interface MasterUIData {
    data_se_info: any[];
    grid_tit_info: any[];
    grid_btn_info: any;
    grid_info: any;
    scr_url: string;
    scr_no: string;
}

export default function Efs_Template_List({ TabmasterUI }: { TabmasterUI: MasterUIData[] }) {
    const userNo = useAuthStore((state) => state.userNo);

    const tpcdParam = TabmasterUI?.scr_no;
    const [masterUI, setMasterUI] = useState<MasterUIData | null>(null);
    const [dataLoading, setDataLoading] = useState(true);
    const [dataParam, setDataParam] = useState<Param>({ master: [], detail: [] });
    const [templateData, setTemplateData] = useState<CardData[]>([]);
    const [selectedTemplates, setSelectedTemplates] = useState<CardData[]>([]);
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
    const [currentTemplate, setCurrentTemplate] = useState<CardData | null>(null);
    const [open, setOpen] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [templateModalData, setTemplateModalData] = useState({});
    const [renderedData, setRenderedData] = useState<CardData[]>([]);
    const [itemsToShow, setItemsToShow] = useState(0);
    const observer = useRef<IntersectionObserver | null>(null);
    const searchParams = new URLSearchParams(useSearchParams());
    const [isInitial, setIsInitial] = useState(true); // 직인등록여부
    const [isEditMode, setIsEditMode] = useState(false);
    const [templateToEdit, setTemplateToEdit] = useState<CardData | null>(null);

    // 템플릿 식별자 생성 함수 추가
    const getTemplateIdentifier = (template) => {
        return `${template.rprs_ognz_no}_${template.task_clsf_cd}_${template.doc_knd_cd}`;
    };

    const handleMenuClick = (e: React.MouseEvent<HTMLDivElement>, template: CardData) => {
        e.preventDefault();
        setCurrentTemplate(template);
        setMenuPosition({ top: e.clientY, left: e.clientX });
    };

    const handleMenuClose = () => {
        setMenuPosition(null);
        setCurrentTemplate(null);
    };

    // 복수 선택이 가능하도록 수정된 선택 로직
    const handleSelectClick = (template: CardData) => {
        setSelectedTemplates((prev) => {
            const templateId = getTemplateIdentifier(template);
            const isSelected = prev.some((item) => getTemplateIdentifier(item) === templateId);

            if (isSelected) {
                // 이미 선택된 템플릿이라면 해당 템플릿만 제거
                return prev.filter((item) => getTemplateIdentifier(item) !== templateId);
            } else {
                // 선택되지 않은 템플릿이라면 기존 선택에 추가
                return [...prev, template];
            }
        });
    };

    const handleTemplateClick = (template: CardData) => {
        setTemplateModalData((prev) => ({ ...prev, template_info: template, open: true }));
    };

    const handleEditClick = (template: CardData) => {
        console.log('편집 시작:', template);

        // 복합 키 사용하도록 템플릿 모달 데이터 설정
        setTemplateModalData({
            template_info: {
                ...template,
                // 복합 키로 변경
                rprs_ognz_no: template.rprs_ognz_no,
                task_clsf_cd: template.task_clsf_cd,
                doc_knd_cd: template.doc_knd_cd,
                // 추가 필요 정보
                file_id: template.file_id,
                tmplt_tit: template.tmplt_tit,
            },
            isEditMode: true,
        });

        // 다이얼로그 열기
        setOpen(true);
    };

    const handleClick = (item: { type: string }) => {
        switch (item.type) {
            case 'EFS_TEM_DEL':
                if (selectedTemplates.length === 0) {
                    alert('삭제할 템플릿을 선택해주세요.');
                    return;
                }
                handleDeleteTemplates();
                break;
            case 'EFS_TEM_COPY':
                if (selectedTemplates.length === 0) {
                    alert('복사할 템플릿을 선택해주세요.');
                    return;
                }
                handleCopyTemplates();
                break;
            case 'EFS_TEM_INS':
                setTemplateModalData({ template_info: { task_clsf_cd: null, doc_knd_cd: null }, open: false });
                setOpen(true);
                break;
            case 'EFS_CONT_REQ':
                if (selectedTemplates.length === 0) {
                    alert('최소 1개 이상의 템플릿을 선택해주세요.');
                    return;
                }
                setOpenModal(true);
                break;
        }
    };

    // 템플릿 삭제
    const handleDeleteTemplates = () => {
        if (!confirm(`선택한 ${selectedTemplates.length}개의 템플릿을 삭제하시겠습니까?`)) {
            return;
        }

        // 템플릿 ID 배열 생성
        const templateIds = selectedTemplates.map((template) => template.tmplt_id);

        // 삭제할 템플릿들을 개별 파라미터로 변환
        const deleteParams = templateIds.map((templateId) => ({
            action_type: 'D', // 삭제 액션 타입
            tmplt_id: templateId, // 삭제할 템플릿 ID
            work_user_no: userNo, // 작업자 ID
        }));

        const items = [
            {
                sqlId: '0', // sqlId 설정
                params: deleteParams, // 삭제할 템플릿 파라미터 배열
            },
        ];

        // 삭제 처리 시작 로딩 표시
        setDataLoading(true);

        // fetcherPostCommonSave를 통해 삭제
        fetcherPostCommonSave(items)
            .then((response) => {
                console.log('삭제 결과:', response);
                alert(`${templateIds.length}개의 템플릿이 삭제되었습니다.`);

                // 선택된 템플릿 초기화
                setSelectedTemplates([]);

                // 템플릿 목록 새로고침
                if (dataParam?.master?.[0]?.params[0]) {
                    fetcherPostCommonGridData(dataParam.master)
                        .then((updatedData) => {
                            setTemplateData(updatedData);
                            setRenderedData(updatedData.slice(0, 10));
                        })
                        .catch((error) => {
                            console.error('목록 새로고침 오류:', error);
                        })
                        .finally(() => {
                            setDataLoading(false);
                        });
                } else {
                    setDataLoading(false);
                }
            })
            .catch((error) => {
                console.error('템플릿 삭제 오류:', error);
                alert('삭제 처리 중 오류가 발생했습니다.');
                setDataLoading(false);
            });
    };

    // 템플릿 복사 함수 추가
    const handleCopyTemplates = async () => {
        if (!confirm(`선택한 ${selectedTemplates.length}개의 템플릿을 복사하시겠습니까?`)) {
            return;
        }

        // 현재 날짜/시간을 YYYYMMDDHHmmss 형식으로 변환
        const currentDate = new Date()
            .toISOString()
            .replace(/[-T:\.Z]/g, '')
            .slice(0, 14);

        try {
            // 선택된 템플릿들을 복사하기 위한 파라미터 생성
            const copyParams = selectedTemplates.map((template) => {
                return {
                    action_type: 'I', // 삽입 액션 타입 (복사는 새로운 템플릿 생성)
                    tmplt_id: randomId(), // 새로운 UUID 생성
                    rprs_ognz_no: template.rprs_ognz_no,
                    task_clsf_cd: template.task_clsf_cd,
                    doc_knd_cd: template.doc_knd_cd,
                    tmplt_tit: template.tmplt_tit + ' (복사)', // 제목에 (복사) 추가
                    tmplt_reg_dt: currentDate,
                    component_info: template.component_info,
                    file_id: template.file_id,
                    thumbnail_file_id: template.thumbnail_file_id,
                    scr_no: tpcdParam,
                    del_yn: 'N',
                    work_user_no: userNo, // 작업자 ID
                };
            });

            const items = [
                {
                    sqlId: '0', // sqlId 설정
                    params: copyParams, // 복사할 템플릿 파라미터 배열
                },
            ];

            // 복사 처리 시작 로딩 표시
            setDataLoading(true);

            // fetcherPostCommonSave를 통해 복사 요청
            const response = await fetcherPostCommonSave(items);

            console.log('복사 결과:', response);
            alert(`${selectedTemplates.length}개의 템플릿이 복사되었습니다.`);

            // 선택된 템플릿 초기화
            setSelectedTemplates([]);

            // 템플릿 목록 새로고침
            if (dataParam?.master?.[0]?.params[0]) {
                try {
                    const updatedData = await fetcherPostCommonGridData(dataParam.master);
                    setTemplateData(updatedData);
                    setRenderedData(updatedData.slice(0, 10));
                } catch (error) {
                    console.error('목록 새로고침 오류:', error);
                } finally {
                    setDataLoading(false);
                }
            } else {
                setDataLoading(false);
            }
        } catch (error) {
            console.error('템플릿 복사 오류:', error);
            alert('복사 처리 중 오류가 발생했습니다.');
            setDataLoading(false);
        }
    };

    const handlePreviewClick = (template: CardData) => {
        setTemplateModalData((prev) => ({ ...prev, template_info: template, open: true }));
    };

    useEffect(() => {
        // 직인등록체크
        const item = [
            {
                sqlId: 'hrs_login01',
                sql_key: 'hrs_login_myinfo',
                params: [
                    {
                        user_no: userNo,
                    },
                ],
            },
        ];
        fetcherPostData(item)
            .then((response) => {
                setIsInitial(response ? true : false);
            })
            .catch((error) => {});

        if (templateData.length > 0) {
            console.log('첫 항목', templateData[0]);
        }
    }, [templateData]);

    useEffect(() => {
        const item = { scr_no: tpcdParam };
        fetcherPostScr(item)
            .then((response) => {
                setMasterUI(response);
                setDataLoading(false);
            })
            .catch((error) => console.error(error));
    }, [tpcdParam]);

    useEffect(() => {
        if (dataParam?.master?.[0]?.params[0]) {
            fetcherPostCommonGridData(dataParam.master)
                .then((response) => {
                    setTemplateData(response);
                    setRenderedData(response.slice(0, 10));
                })
                .catch((error) => {
                    console.error(error);
                    setTemplateData([]);
                    setRenderedData([]);
                });
        }
    }, [dataParam]);

    useEffect(() => {
        setRenderedData(templateData.slice(0, itemsToShow));
    }, [itemsToShow, templateData]);

    useEffect(() => {
        if (!observer.current || itemsToShow < 15) return;
        observer.current.disconnect();
        observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && itemsToShow < templateData.length) {
                setItemsToShow((prev) => prev + 5);
            }
        });
        observer.current.observe(document.getElementById('observer')!);
        return () => observer.current?.disconnect();
    }, [itemsToShow, templateData]);

    // 디버깅 로그 추가
    useEffect(() => {
        console.log('선택된 템플릿 수:', selectedTemplates.length);
        if (selectedTemplates.length > 0) {
            console.log('선택된 템플릿:', selectedTemplates);
        }
    }, [selectedTemplates]);

    if (dataLoading) return <Loader />;

    return (
        <>
            <Grid item xs={12}>
                <SearchCondition
                    masterUIinfo={masterUI}
                    tpcdParam={tpcdParam}
                    dataParam={dataParam}
                    searchParam={searchParams}
                    setDataParam={setDataParam}
                    handleSubmit={() => setItemsToShow(15)}
                />
            </Grid>
            <Grid item xs={12}>
                <Stack direction='row' justifyContent='space-between'>
                    <Typography title='계약서 리스트' type='form' />
                    <ButtonGroup>
                        <Button type='primary' size='sm' onClick={() => handleClick({ type: 'EFS_TEM_DEL' })}>
                            삭제
                        </Button>
                        <Button type='primary' size='sm' onClick={() => handleClick({ type: 'EFS_TEM_COPY' })}>
                            복사
                        </Button>
                        <Button type='primary' size='sm' onClick={() => handleClick({ type: 'EFS_TEM_INS' })}>
                            추가
                        </Button>
                        <Button type='primary' size='sm' onClick={() => handleClick({ type: 'EFS_CONT_REQ' })}>
                            계약 요청
                        </Button>
                    </ButtonGroup>
                </Stack>
            </Grid>

            {/* 직인 등록 안내 메시지 */}
            {!isInitial && (
                <Grid item xs={12}>
                    <div>
                        <Typography type='subtitle'>
                            회사 직인을 등록하시면, 전자 계약 기능을 사용할 수 있습니다.
                        </Typography>
                        <Button
                            type='primary'
                            size='sm'
                            onClick={() => {
                                // 직인 등록 페이지로 이동 또는 모달 오픈 로직
                                window.location.href = '/settings/systemSetting/companyManagement/SC--1'; // 예시 경로
                            }}
                        >
                            직인 등록하기
                        </Button>
                    </div>
                </Grid>
            )}

            <Grid item xs={12}>
                <ul className={styles.infiniteScroller}>
                    {renderedData.map((template) => (
                        <li
                            key={getTemplateIdentifier(template)}
                            className={`${styles.card} ${
                                selectedTemplates.some(
                                    (item) => getTemplateIdentifier(item) === getTemplateIdentifier(template)
                                )
                                    ? styles.on
                                    : ''
                            }`}
                            onClick={(e) => handleMenuClick(e, template)}
                        >
                            <img
                                src={process.env.NEXT_PUBLIC_SSW_FILE_IMAGE_VIEW_URL + template.thumbnail_file_id}
                                alt={template.tmplt_tit}
                                className={styles.cardImage}
                            />
                            <div className={styles.title}>{template.tmplt_tit}</div>
                        </li>
                    ))}
                </ul>
            </Grid>
            <Menu
                open={Boolean(menuPosition)}
                onClose={handleMenuClose}
                anchorReference='anchorPosition'
                anchorPosition={menuPosition || undefined}
                className='contextMenu'
            >
                <MenuItem
                    onClick={() => {
                        if (currentTemplate) handleTemplateClick(currentTemplate);
                        handleMenuClose();
                    }}
                    className={styles.item}
                >
                    <IcoPreview fill='#666666' />
                    미리보기
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        if (currentTemplate) {
                            handleSelectClick(currentTemplate);
                        }
                        handleMenuClose();
                    }}
                    className={styles.item}
                >
                    <IcoCheck fill='#666666' />
                    {currentTemplate &&
                    selectedTemplates.some(
                        (item) => getTemplateIdentifier(item) === getTemplateIdentifier(currentTemplate)
                    )
                        ? '선택 해제'
                        : '선택'}
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        if (currentTemplate) {
                            handleEditClick(currentTemplate);
                        }
                        handleMenuClose();
                    }}
                    className={styles.item}
                >
                    <IcoEditFill />
                    편집
                </MenuItem>
            </Menu>
            <div id='observer' style={{ height: '1px' }} />
            {/* <PreviewFullDialog params={templateModalData} setParams={setTemplateModalData} /> */}
            <TemplateCreateFullDialog
                open={open}
                handleClose={() => {
                    setOpen(false);
                }}
                tpcd={tpcdParam}
                params={templateModalData}
                setParams={setTemplateModalData}
            />
            <ContractFullDialog
                params={selectedTemplates}
                setParams={(newTemplates) => {
                    if (Array.isArray(newTemplates)) {
                        setSelectedTemplates((prev) => {
                            const newSelected = newTemplates.filter((template) =>
                                prev.some((item) => getTemplateIdentifier(item) === getTemplateIdentifier(template))
                            );
                            return newSelected;
                        });
                    }
                }}
                openModal={openModal}
                setOpenModal={setOpenModal}
            />
        </>
    );
}
