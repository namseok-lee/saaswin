'use client';

import { dia } from '@joint/plus';
import { Menu, MenuItem, SelectChangeEvent } from '@mui/material';
import BoxSelect from 'components/BoxSelect';
import InputTextBox from '@/components/InputTextBox';
import Button from 'components/Button';
import SwDatePicker from 'components/DatePicker';
import Empty from 'components/Empty';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetcherPostCmcd, fetcherPostData } from 'utils/axios';
import {
    IcoAdd,
    IcoAddGroup,
    IcoFile,
    IcoFitScreen,
    IcoMinus,
    IcoProfileStroke,
    IcoRedo,
    IcoTrash,
    IcoUndo,
} from '@/assets/Icon';
import OrgChartDialog from '../../ssw01/components/OrgChartDialog';
import OrgChart from './OrgChart';
import OrgMemberPage from './OrgMember';
import './styles.scss';
import { OrgChartFormData, OrgChartInstance, OrgChartMasterData, OrgChartPageProps } from './types';
import { VALIDATION_MESSAGES } from './utils/constants';
import { formattedDate, getDefaultFormData } from './utils/orgChartUtils';
import Typography from '@/components/Typography';
import OrgMember from './OrgMember';
import { IcoDownload, IcoHorizontalView, IcoPersonCheck, IcoVerticalView } from '../../../../public/asset/Icon';

const OrgChartPage: React.FC<OrgChartPageProps> = ({
    dataPram,
    outMasterData,
    editable = false,
    showInspector = true,
    setIsLoading,
    isLoading = false,
    searchParams,
    open = false,
    onOpen,
    onClose,
    isDialog = false,
}) => {
    // 안정적인 참조를 위한 refs 사용
    const orgChartRef = useRef<OrgChartInstance | null>(null);
    const selectedCellRef = useRef<dia.Element | null>(null);
    const memoizedSearchParams = useMemo(() => searchParams, [searchParams?.std_ymd, searchParams?.org_allign]);

    const isMultiRef = useRef(false);
    const [undoRedoState, setUndoRedoState] = useState({
        canUndo: false,
        canRedo: false,
    });
    // 렌더링 사이클을 줄이기 위한 관련 상태 그룹화
    const [selectionState, setSelectionState] = useState({
        selectedCell: null as dia.Element | null,
        isMulti: false,
        isTopCell: false,
    });
    const [key, setKey] = useState(0); // 서치박스 상태 변경용
    // 조직 유형 옵션
    const [optionsObject, setOptionsObject] = useState<{ value: string; label: string }[]>([]);

    // 줌 상태
    const [zoomControls, setZoomControls] = useState({
        canZoomIn: true,
        canZoomOut: true,
    });

    // 레이아웃 타입
    const [layoutType, setLayoutType] = useState<string>('R');

    // layoutType 상태 변경 감시
    useEffect(() => {
        console.log('layoutType 상태 변경됨:', layoutType);
    }, [layoutType]);

    // 필수값 검증 상태를 위한 상태 추가
    const [validationState, setValidationState] = useState<Record<string, { isValid: boolean; message: string }>>({});
    const [masterData, setMasterData] = useState<OrgChartMasterData[] | null>(null); // 마스터그리드 데이터
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    useEffect(() => {
        console.log('OrgChartPage 마운트됨', masterData);

        return () => {
            console.log('OrgChartPage 언마운트됨');
        };
    }, []);

    useEffect(() => {
        console.log('masterData changed key ', masterData);
    }, [masterData]);

    useEffect(() => {
        console.log('isDialog changed', isDialog);
        if (!isDialog) {
            setKey((prevKey) => prevKey + 1);
        }
    }, [dataPram]);

    useEffect(() => {
        (async () => {
            try {
                if (setIsLoading) {
                    setIsLoading(true); // API 호출 직전에 로딩 시작
                }
                if (outMasterData) {
                    setMasterData(outMasterData);
                    return;
                }
                const params = searchParams;
                if (params) {
                    const std_ymd = searchParams.std_ymd ?? '';
                    const org_allign = searchParams.org_allign ?? '';
                    if (std_ymd === '' || org_allign === '') return false;
                } else {
                    return false;
                }
                console.log('outMasterData changed', outMasterData);
                console.log('searchParams changed', JSON.stringify(searchParams));
                // 조직정보 조회
                const SqlId = 'hrs_com01';
                const orgInfoSqlKey = 'hrs_ognztree_recursive';
                const orgInfoItem = { sqlId: SqlId, sql_key: orgInfoSqlKey, params: [params] };

                // 조직인원 조회
                const orgMembersSqlKey = 'hrs_tom_bsc_select'; // 새로운 SQL KEY
                // 조직인원 조회에 필요한 파라미터를 `params` 또는 별도의 파라미터 객체로 구성해야 합니다.
                // 예시: const orgMembersParams = { ...params, other_param: 'value' };
                const orgMembersItem = { sqlId: SqlId, sql_key: orgMembersSqlKey, params: [params] }; // params는 예시이며, 실제 필요한 파라미터로 수정해야 합니다.

                const [orgInfoResponse, orgMembersResponse] = await Promise.all([
                    fetcherPostData([orgInfoItem]),
                    fetcherPostData([orgMembersItem]),
                ]);

                console.log('orgInfoResponse', orgInfoResponse);
                console.log('orgMembersResponse', orgMembersResponse);
                const groupedOrgMembers = groupByHqCd(orgMembersResponse);
                console.log('groupedOrgMembers', groupedOrgMembers);
                const newOrgData = orgInfoResponse; // 기존 로직과 동일하게 처리

                // newOrgData의 각 항목에 대해 child_no와 일치하는 groupedOrgMembers의 키가 있는지 확인하고
                // 있다면 해당 항목에 orgMembers 속성으로 추가
                newOrgData.forEach((item) => {
                    const childNo = item.child_no;
                    if (groupedOrgMembers[childNo]) {
                        item.orgMembers = groupedOrgMembers[childNo];
                    }
                });
                console.log('newOrgData', newOrgData);

                setMasterData(newOrgData);

                // 조직 인원 데이터 처리 (응답 구조에 맞게 수정 필요)
                // 예시: const newOrgMembersData = orgMembersResponse?.resData?.[0]?.data;
                // const newOrgMembersData = orgMembersResponse; // 실제 응답 구조에 맞게 수정
                // setOrgMembersData((prevData) => {
                //     if (JSON.stringify(prevData) === JSON.stringify(newOrgMembersData)) {
                //         return prevData;
                //     }
                //     return newOrgMembersData;
                // });
            } catch (error) {
                console.error(error);
            } finally {
                // Promise.all 이후 또는 catch 블록 이후에 항상 실행
                if (setIsLoading) {
                    setIsLoading(false); // API 호출 완료 또는 실패 시 로딩 종료
                }
            }
        })();
    }, [outMasterData, memoizedSearchParams, setIsLoading]);

    // 배열을 apnt_hq_cd를 기준으로 그룹화하는 함수
    function groupByHqCd(array: any[]) {
        const result: { [key: string]: any[] } = {};

        array.forEach((item: any) => {
            const hqCd = item.apnt_hq_cd;

            // 해당 키가 이미 결과 객체에 있는지 확인
            if (result[hqCd]) {
                // 있다면 배열에 항목 추가
                result[hqCd].push(item);
            } else {
                // 없다면 새 배열 생성 후 항목 추가
                result[hqCd] = [item];
            }
        });

        return result;
    }

    // 조직 유형 데이터를 한 번만 가져오기
    useEffect(() => {
        let isMounted = true;

        fetcherPostCmcd({
            group_cd: 'hrs_group00933',
            rprs_ognz_no: 'COMGRP',
        })
            .then((response) => {
                if (isMounted) {
                    const options = response.map((item) => ({
                        value: item.com_cd,
                        label: item.com_cd_nm,
                    }));
                    setOptionsObject(options);
                }
            })
            .catch((error) => {
                console.error('조직 유형 가져오기 오류:', error);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    // 최상위 레벨에서 useCallback 정의 (useEffect 내부가 아님)
    const updateUndoRedoState = useCallback(() => {
        if (!orgChartRef.current) return;

        const newCanUndo = orgChartRef.current.canUndo() || false;
        const newCanRedo = orgChartRef.current.canRedo() || false;

        setUndoRedoState((prev) => {
            if (prev.canUndo === newCanUndo && prev.canRedo === newCanRedo) {
                return prev;
            }
            return { canUndo: newCanUndo, canRedo: newCanRedo };
        });
    }, []);

    // useEffect 내에서는 정의된 함수만 사용
    useEffect(() => {
        if (orgChartRef.current) {
            // 초기 상태 업데이트
            updateUndoRedoState();

            const graphRef = orgChartRef.current.graph;
            if (graphRef) {
                graphRef.on('add remove change', updateUndoRedoState);
                graphRef.on('batch:stop', updateUndoRedoState);
                graphRef.on('undo redo', updateUndoRedoState);
            }

            return () => {
                if (graphRef) {
                    graphRef.off('add remove change', updateUndoRedoState);
                    graphRef.off('batch:stop', updateUndoRedoState);
                    graphRef.off('undo redo', updateUndoRedoState);
                }
            };
        }
    }, [orgChartRef.current, updateUndoRedoState]);

    // OrgChart에서 줌 컨트롤 상태 업데이트
    useEffect(() => {
        if (orgChartRef.current) {
            setZoomControls({
                canZoomIn: orgChartRef.current.canZoomIn,
                canZoomOut: orgChartRef.current.canZoomOut,
            });
        }
    }, [orgChartRef.current?.canZoomIn, orgChartRef.current?.canZoomOut]);

    // props에서 레이아웃 타입 처리
    useEffect(() => {
        if (dataPram?.master?.[0]?.params?.[0]?.org_allign) {
            const org_allign = dataPram.master[0].params[0].org_allign;
            setLayoutType(org_allign);
        }
    }, [dataPram?.master?.[0]?.params?.[0]?.org_allign]);

    // 그래프와 masterData 동기화
    useEffect(() => {
        if (!orgChartRef.current?.graph || !masterData) return;

        const graph = orgChartRef.current.graph;

        const handleCellChange = (cell) => {
            if (cell.isElement() && cell.get('type') === 'Member') {
                const cellData = cell.get('data');
                const childNo = cellData.child_no;

                // 실제 데이터가 변경된 경우에만 masterData 업데이트
                if (cellData && childNo) {
                    setMasterData((prev) => {
                        if (!prev) return prev;

                        // 해당 childNo의 노드가 masterData에 있는지 확인
                        const nodeExists = prev.some((item) => item.child_no === childNo);

                        if (nodeExists) {
                            // 기존 노드 업데이트
                            return prev.map((item) => (item.child_no === childNo ? { ...item, ...cellData } : item));
                        } else if (cellData.action_type === 'I') {
                            // 새로 추가된 노드는 masterData에 추가
                            return [...prev, cellData];
                        }

                        return prev;
                    });
                }
            }
        };

        graph.on('change:data', handleCellChange);

        return () => {
            graph.off('change:data', handleCellChange);
        };
    }, [masterData]);

    // 메모이제이션된 폼 데이터 업데이트 함수
    // updateFormData 함수 수정
    const updateFormData = useCallback(
        (field: keyof OrgChartFormData, value: string) => {
            // masterData 업데이트는 유지하되 렌더링 최소화
            setMasterData((prev) => {
                if (!prev) return null;
                // 객체 참조 보존을 위해 필요한 항목만 업데이트
                return prev.map((item) =>
                    item.child_no === selectedNodeId
                        ? { ...item, [field]: value, action_type: item.action_type === 'I' ? 'I' : 'U' }
                        : item
                );
            });

            // 그래프 노드 직접 업데이트 - 중요!
            const currentCell = selectedCellRef?.current;
            if (!currentCell) return;

            // 단일 업데이트를 위한 배치 작업
            if (orgChartRef.current?.graph) {
                orgChartRef.current.graph.startBatch('update-node');
            }

            // 필드 업데이트
            const cellData = { ...currentCell.get('data') };
            cellData[field] = value;

            // 조직명 변경 시 레이블 업데이트
            if (field === 'ognz_nm') {
                currentCell.attr('label/text', value);
            }

            // 데이터 설정
            currentCell.set('data', cellData);

            // 검증 및 상태 아이콘 업데이트
            if (orgChartRef.current) {
                orgChartRef.current.updateMemberValidation?.(currentCell);
                orgChartRef.current.updateStatusIcons?.(currentCell);
            }

            if (orgChartRef.current?.graph) {
                orgChartRef.current.graph.stopBatch('update-node');
            }
        },
        [selectedNodeId]
    );

    // 셀 선택 핸들러 - 메모이제이션
    const handleCellSelect = useCallback((cell: dia.Element | null) => {
        // 현재 셀에 대한 참조 저장
        selectedCellRef.current = cell;
        // 다중 선택 모드인 경우 건너뛰기
        if (isMultiRef.current) return;

        // 최상위 셀인지 확인
        const isTopCell = cell ? (cell.get('data')?.parent_no ?? '') === '' : false;

        // 선택 상태 업데이트
        setSelectionState((prev) => ({
            ...prev,
            selectedCell: cell,
            isTopCell,
        }));

        // 이전 검증 상태 초기화
        setValidationState({});

        if (cell) {
            const data = cell.get('data') || {};
            // 선택된 노드 ID 설정
            setSelectedNodeId(data.child_no || null);

            // 필수 필드 검증
            const requiredFields = ['ognz_nm', 'corp_eng_nm', 'bgng_ymd', 'ognz_type_cd'] as const;
            const newValidationState: Record<string, { isValid: boolean; message: string }> = {};

            requiredFields.forEach((field) => {
                const value = data[field];
                if (!value || value.trim() === '') {
                    newValidationState[field] = {
                        isValid: false,
                        message: VALIDATION_MESSAGES.REQUIRED_FIELD,
                    };
                }
            });

            // 새 검증 상태 설정
            if (Object.keys(newValidationState).length > 0) {
                setValidationState(newValidationState);
            }

            // 선택된 셀에 대해 실시간 검증 수행
            if (orgChartRef.current) {
                const { isValid } = orgChartRef.current.validateMemberEdit(cell);
                // 검증 실패 시 경고 표시를 유지하고, 검증 성공 시 경고 제거
                cell.attr('warningContainer/display', isValid ? 'none' : 'block');
            }
        } else {
            // 선택 해제 시 ID도 초기화
            setSelectedNodeId(null);
        }
    }, []);

    // 다중 선택 핸들러 - 메모이제이션
    const handleMultiSelect = useCallback((multi: boolean) => {
        // refs와 상태 업데이트
        isMultiRef.current = multi;

        setSelectionState((prev) => ({
            ...prev,
            isMulti: multi,
        }));

        if (multi) {
            // 다중 선택 모드에서 선택된 노드 초기화
            setSelectedNodeId(null);
        }
    }, []);

    // 폼 필드 변경 핸들러 - 메모이제이션
    const handleChange = useCallback(
        (
            event:
                | React.ChangeEvent<HTMLInputElement>
                | React.ChangeEvent<HTMLSelectElement>
                | SelectChangeEvent<string>
                | any,
            field: keyof OrgChartFormData
        ) => {
            let newValue: string;

            // 다양한 이벤트 유형 처리
            if (event && dayjs.isDayjs(event)) {
                newValue = event.format('YYYYMMDD');
            } else if (event && event.target) {
                newValue = event.target.value;
            } else {
                newValue = event || '';
            }

            // 폼 데이터 업데이트
            updateFormData(field, newValue);

            // 검증 업데이트 - 필수 필드인 경우
            if (field === 'ognz_nm' || field === 'corp_eng_nm' || field === 'bgng_ymd' || field === 'ognz_type_cd') {
                const value =
                    field === 'ognz_nm' || field === 'corp_eng_nm' || field === 'bgng_ymd' ? newValue : newValue;

                if (!value || value.trim() === '') {
                    setValidationState((prev) => ({
                        ...prev,
                        [field]: {
                            isValid: false,
                            message: VALIDATION_MESSAGES.REQUIRED_FIELD,
                        },
                    }));

                    // 현재 선택된 셀이 있으면 경고 아이콘 표시
                    if (selectedCellRef.current && orgChartRef.current) {
                        orgChartRef.current.updateMemberValidation(selectedCellRef.current);
                    }
                } else {
                    // 검증 오류 메시지 제거
                    setValidationState((prev) => {
                        const newState = { ...prev };
                        delete newState[field];
                        return newState;
                    });

                    // 현재 선택된 셀 검증 확인 후 경고 아이콘 제거 여부 결정
                    if (selectedCellRef.current && orgChartRef.current) {
                        orgChartRef.current.updateMemberValidation(selectedCellRef.current);
                    }
                }
            }
        },
        [updateFormData]
    );

    const getFormData = useCallback(() => {
        if (!selectedNodeId || !masterData) return getDefaultFormData();
        const selectedItem = masterData.find((item) => item.child_no === selectedNodeId);
        return selectedItem || getDefaultFormData();
    }, [masterData, selectedNodeId]);

    // 조직 추가 핸들러 - 메모이제이션
    const handleAddOrg = useCallback(
        (e: React.MouseEvent) => {
            const { isMulti, selectedCell } = selectionState;

            if (isMulti || !selectedCell) {
                alert('조직을 추가하려면 단일 조직만 선택해주세요.');
                return;
            }

            if (orgChartRef.current) {
                // 기본 데이터를 사용하여 새 조직 생성
                const defaultFormData = getDefaultFormData();
                // 추가 시 action_type을 'I'로 명시적 설정
                defaultFormData.action_type = 'I';

                // 새 노드 생성 및 반환값 받기
                const newMember = orgChartRef.current.handleCreateOrg(e, defaultFormData, selectedCell);

                // 생성된 노드가 있으면 masterData에 추가
                if (newMember) {
                    const newNodeData = newMember.prop('data');

                    // 즉시 masterData에 반영 (그래프 변경 이벤트 대기 없이)
                    setMasterData((prev) => {
                        if (!prev) return [newNodeData];
                        return [...prev, newNodeData];
                    });

                    // 새 노드 선택
                    setSelectedNodeId(newNodeData.child_no);
                }
            }
        },
        [selectionState, getDefaultFormData]
    );

    // 필수값 검증 함수 수정 - 모든 카드 검증 및 시각적 표시
    const handleValidateForm = useCallback(() => {
        if (!orgChartRef.current) {
            console.error('조직도 참조를 찾을 수 없습니다');
            return;
        }

        // 모든 카드 검증을 위해 그래프의 모든 요소를 가져옴
        const graph = orgChartRef.current.graph;
        if (!graph) {
            console.error('그래프를 찾을 수 없습니다');
            return;
        }

        // 모든 Member 요소 가져오기
        const allMemberElements = graph.getElements().filter((cell) => cell.get('type') === 'Member');

        // 검증 실패한 카드 개수 추적
        let invalidCount = 0;

        // 모든 Member 요소 검증
        allMemberElements.forEach((element) => {
            // 각 요소에 대해 검증 수행
            const { isValid } = orgChartRef.current!.validateMemberEdit(element);

            // 검증 결과에 따라 경고 아이콘 표시/숨김
            if (!isValid) {
                invalidCount++;
                // 경고 아이콘 표시
                element.attr('warningContainer/display', 'block');
                // 툴크 메시지 설정
                element.attr('warningContainer/data-tooltip', VALIDATION_MESSAGES.REQUIRED_FIELD);
            } else {
                // 경고 아이콘 숨김
                element.attr('warningContainer/display', 'none');
            }
        });

        // 검증 결과 알림
        if (invalidCount > 0) {
            alert(
                `검증 실패: ${invalidCount}개의 조직 카드에 ${VALIDATION_MESSAGES.REQUIRED_FIELD.toLowerCase()} 빨간색 느낌표가 표시된 카드를 확인해주세요.`
            );
        } else {
            alert('검증 성공: 모든 조직 카드의 필수값이 입력되었습니다.');
        }
    }, []);

    // 임시 저장 핸들러 - 메모이제이션
    const handleTempSave = useCallback(() => {
        if (!orgChartRef.current?.graph) {
            console.error('조직도 참조를 찾을 수 없습니다');
            return;
        }

        const graph = orgChartRef.current.graph;

        // 모든 요소와 링크 가져오기
        const allElements = graph.getElements();
        const allLinks = graph.getLinks();

        // 빠른 조회를 위한 요소 맵 생성
        const elementsMap = new Map();

        allElements.forEach((element) => {
            elementsMap.set(element.id, {
                element,
                childLinks: [],
                parentLinks: [],
                level: 0,
                parents: [],
            });
        });

        // 요소에 링크 매핑
        allLinks.forEach((link) => {
            const sourceId = link.source().id;
            const targetId = link.target().id;

            const sourceElement = elementsMap.get(sourceId);
            const targetElement = elementsMap.get(targetId);

            if (sourceElement) {
                sourceElement.childLinks.push(link);
            }

            if (targetElement) {
                targetElement.parentLinks.push(link);
                targetElement.parents.push(sourceId);
            }
        });

        // 루트 노드 찾기 (부모 없음)
        const rootNodes = Array.from(elementsMap.values()).filter((item) => item.parentLinks.length === 0);

        // 너비 우선 탐색을 사용하여 레벨 계산
        const queue = rootNodes.map((rootNode) => ({
            item: rootNode,
            level: 0,
        }));

        // 큐 처리
        while (queue.length > 0) {
            const { item, level } = queue.shift();
            item.level = level;

            // 자식을 큐에 추가
            item.childLinks.forEach((link) => {
                const targetId = link.target().id;
                const targetElement = elementsMap.get(targetId);

                if (targetElement) {
                    queue.push({
                        item: targetElement,
                        level: level + 1,
                    });
                }
            });
        }

        // 최종 데이터 구성
        const elementsData = Array.from(elementsMap.values()).map((item) => {
            const element = item.element;
            const data = element.get('data') || {};

            // 부모 정보 가져오기
            const parentId = item.parents.length > 0 ? item.parents[0] : '';
            const parentElement = parentId ? elementsMap.get(parentId)?.element : null;
            const parentData = parentElement ? parentElement.get('data') || {} : {};

            return {
                id: element.id,
                ...data,
                level: item.level.toString(),
                parent_no: parentData.child_no || '',
            };
        });

        // 데이터 로깅 및 저장
        console.log('임시저장된 조직도 데이터:', elementsData);
        localStorage.setItem('orgChartTempData', JSON.stringify(elementsData));
        alert('조직도가 임시저장되었습니다.');

        return elementsData;
    }, []);

    const handleUndo = useCallback(() => {
        // 1. undo 작업 수행
        if (orgChartRef.current?.canUndo()) {
            orgChartRef.current.handleUndo();

            // 2. 선택 초기화
            orgChartRef.current?.selection.collection.models.forEach((selectedCell) => {
                if (selectedCell.isElement() && selectedCell.get('type') === 'Member') {
                    selectedCell.attr('body/fill', 'white');
                }
            });

            if (orgChartRef.current?.selection) {
                orgChartRef.current.selection.collection.reset([]);
            }

            // 3. 선택된 노드 ID 초기화
            setSelectedNodeId(null);

            // 4. 선택 상태 초기화
            setSelectionState({
                selectedCell: null,
                isMulti: false,
                isTopCell: false,
            });

            // 5. ref 초기화
            selectedCellRef.current = null;
            isMultiRef.current = false;
        }
    }, []);

    const handleRedo = useCallback(() => {
        // 1. redo 작업 수행
        if (orgChartRef.current?.canRedo()) {
            orgChartRef.current.handleRedo();

            // 2. 선택 초기화
            orgChartRef.current?.selection.collection.models.forEach((selectedCell) => {
                if (selectedCell.isElement() && selectedCell.get('type') === 'Member') {
                    selectedCell.attr('body/fill', 'white');
                }
            });

            if (orgChartRef.current?.selection) {
                orgChartRef.current.selection.collection.reset([]);
            }

            // 3. 선택된 노드 ID 초기화
            setSelectedNodeId(null);

            // 4. 선택 상태 초기화
            setSelectionState({
                selectedCell: null,
                isMulti: false,
                isTopCell: false,
            });

            // 5. ref 초기화
            selectedCellRef.current = null;
            isMultiRef.current = false;
        }
    }, []);

    // 선택된 노드 접기/펼치기 핸들러 추가
    const handleToggleCollapse = useCallback(() => {
        const { selectedCell } = selectionState;

        // 노드가 선택되지 않았거나 다중 선택 모드인 경우 작업 중단
        if (!selectedCell || isMultiRef.current) {
            alert('접기/펼치기 기능을 사용하려면 단일 노드를 선택하세요.');
            return;
        }

        // 자식 노드가 있는지 확인
        const hasChildren = selectedCell.prop('hasChildren') || false;

        if (!hasChildren) {
            alert('선택된 노드에 자식 노드가 없습니다.');
            return;
        }

        // OrgChart 컴포넌트의 접기/펼치기 기능 호출
        orgChartRef.current?.handleToggleCollapse(selectedCell);
    }, [selectionState]);

    // 렌더링 성능 향상을 위한 폼 데이터 메모이제이션
    const memoizedFormData = useMemo(() => getFormData(), [selectedNodeId, masterData]);
    console.log('memoizedFormData', memoizedFormData);
    // tab
    const [tabState, setTabState] = useState('tab1');
    const handleTabClick = (id: string) => {
        setTabState(id);
    };

    //menu mui
    const [contextMenu, setContextMenu] = useState<{
        mouseX: number;
        mouseY: number;
    } | null>(null);
    const handleContextMenuOpen = (event: React.MouseEvent) => {
        event.preventDefault();
        setContextMenu(
            contextMenu === null
                ? {
                      mouseX: event.clientX + 2,
                      mouseY: event.clientY - 6,
                  }
                : null
        );
    };
    const handleClose = () => {
        setContextMenu(null);
    };

    if (isLoading && !isDialog) {
        // isDialog가 false일 때만 전체 페이지 로딩 UI 표시
        return (
            <div className='flex items-center justify-center h-screen bg-gray-100'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto'></div>
                    <p className='mt-4 text-gray-600'>로딩 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='org-chart-wrapper'>
            {!masterData || masterData.length <= 1 ? (
                <div className='org-chart-container' style={{ height: '100%' }}>
                    <div
                        className='noDataEmpty'
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100%',
                            width: '100%',
                        }}
                    >
                        <Empty>
                            아직 생성된 조직이 없습니다.
                            <br />
                            조직을 등록해보세요.
                            <div
                                className='btnArea'
                                style={{
                                    marginTop: '20px',
                                    display: 'flex',
                                    gap: '10px',
                                    justifyContent: 'center',
                                }}
                            >
                                <Button type='default' size='sm'>
                                    조직 기준 설정 바로가기
                                </Button>
                                <Button type='default' size='sm' onClick={onOpen}>
                                    조직 최초 등록 바로가기
                                </Button>
                            </div>
                        </Empty>
                    </div>
                    {open && (
                        <OrgChartDialog
                            open={open}
                            onClose={onClose}
                            isLoading={isLoading}
                            searchParams={searchParams}
                        />
                    )}
                </div>
            ) : (
                <>
                    {/* 상단 툴바 */}
                    <div className='org-tools'>
                        <div className='customToolbar'>
                            <Button
                                type='default'
                                size='sm'
                                className='btn'
                                onClick={() => {
                                    setLayoutType('R');
                                }}
                            >
                                <IcoHorizontalView fill='#666' />
                            </Button>
                            <Button
                                type='default'
                                size='sm'
                                className='btn'
                                onClick={() => {
                                    setLayoutType('B');
                                }}
                            >
                                <IcoVerticalView fill='#666' />
                            </Button>
                            <Button
                                type='default'
                                size='sm'
                                onClick={() => orgChartRef.current?.handleZoomIn()}
                                disabled={!zoomControls.canZoomIn}
                                className='btn'
                            >
                                <IcoAdd fill={zoomControls.canZoomIn ? '#666' : 'none'} />
                            </Button>
                            <Button
                                type='default'
                                size='sm'
                                onClick={() => orgChartRef.current?.handleZoomOut()}
                                disabled={!zoomControls.canZoomOut}
                                className='btn'
                            >
                                <IcoMinus fill={zoomControls.canZoomOut ? '#666' : 'none'} />
                            </Button>
                            <Button
                                type='default'
                                size='sm'
                                className='btn'
                                id='custom-zoom-to-fit'
                                onClick={() => orgChartRef.current?.handleZoomToFit()}
                            >
                                <IcoFitScreen fill='#666666' />
                            </Button>
                            <Button type='default' size='sm' className='btn' onClick={handleContextMenuOpen}>
                                <IcoDownload fill='#666' />
                            </Button>
                            <Menu
                                open={contextMenu !== null}
                                onClose={handleClose}
                                anchorReference='anchorPosition'
                                anchorPosition={
                                    contextMenu !== null
                                        ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                                        : undefined
                                }
                            >
                                <MenuItem onClick={(e) => orgChartRef.current?.exportToPNG(e)} id='export-to-png'>
                                    PNG 내보내기
                                </MenuItem>
                                <MenuItem onClick={(e) => orgChartRef.current?.exportToPDF(e)} id='export-to-pdf'>
                                    PDF 내보내기
                                </MenuItem>
                            </Menu>
                        </div>
                    </div>

                    {/* 조직도 컨테이너 */}
                    <div className='org-chart-container'>
                        {/* 차트 캔버스 */}
                        <OrgChart
                            editable={editable}
                            ref={orgChartRef}
                            masterData={masterData}
                            onCellSelect={handleCellSelect}
                            onMultiSelect={handleMultiSelect}
                            formData={memoizedFormData} // formData 대신 memoizedFormData  함수 호출 결과 전달
                            layoutType={layoutType}
                            key={`org-chart-${layoutType}`} // layoutType이 변경될 때 리렌더링을 강제
                        />
                        {/* 인스펙터 컨테이너 */}
                        <div className='inspector-container'>
                            {showInspector ? (
                                <div className='forms'>
                                    <div className='tabButtons'>
                                        <Button
                                            className={
                                                tabState === 'tab1' ? 'btnTab on btnWithIcon' : 'btnTab btnWithIcon'
                                            }
                                            id='tab1'
                                            onClick={() => handleTabClick('tab1')}
                                        >
                                            조직정보 보기
                                            <IcoFile />
                                        </Button>
                                        <Button
                                            className={
                                                tabState === 'tab2' ? 'btnTab on btnWithIcon' : 'btnTab btnWithIcon'
                                            }
                                            id='tab2'
                                            onClick={() => handleTabClick('tab2')}
                                        >
                                            조직인원 보기
                                            <IcoProfileStroke />
                                        </Button>
                                    </div>
                                    {tabState === 'tab1' && (
                                        <div className='tabContents' data-id='tab1'>
                                            <InputTextBox
                                                type='text'
                                                id='ognz_nm'
                                                placeholder={'조직명 입력'}
                                                hasToggle={false}
                                                showPassword={false}
                                                label='조직명'
                                                asterisk
                                                vertical
                                                validationText={validationState['ognz_nm']?.message || ''}
                                                error={!!validationState['ognz_nm']}
                                                value={memoizedFormData.ognz_nm}
                                                disabled={
                                                    !editable || selectionState.isMulti || selectionState.isTopCell
                                                }
                                                onChange={(e) => handleChange(e, 'ognz_nm')}
                                                onDelete={() => {
                                                    updateFormData('ognz_nm', '');
                                                    setValidationState((prev) => ({
                                                        ...prev,
                                                        ognz_nm: {
                                                            isValid: false,
                                                            message: VALIDATION_MESSAGES.REQUIRED_FIELD,
                                                        },
                                                    }));

                                                    // 현재 선택된 셀이 있으면 경고 아이콘 표시
                                                    if (selectedCellRef.current && orgChartRef.current) {
                                                        orgChartRef.current.updateMemberValidation(
                                                            selectedCellRef.current
                                                        );
                                                    }
                                                }}
                                                color='white'
                                            />

                                            <InputTextBox
                                                type='text'
                                                id='corp_eng_nm'
                                                placeholder='영문명 입력'
                                                hasToggle={false}
                                                showPassword={false}
                                                label='영문명'
                                                validationText={validationState['corp_eng_nm']?.message || ''}
                                                error={!!validationState['corp_eng_nm']}
                                                vertical
                                                value={memoizedFormData.corp_eng_nm}
                                                disabled={
                                                    !editable || selectionState.isMulti || selectionState.isTopCell
                                                }
                                                onChange={(e) => handleChange(e, 'corp_eng_nm')}
                                                onDelete={() => {
                                                    updateFormData('corp_eng_nm', '');
                                                    setValidationState((prev) => ({
                                                        ...prev,
                                                        corp_eng_nm: {
                                                            isValid: false,
                                                            message: VALIDATION_MESSAGES.REQUIRED_FIELD,
                                                        },
                                                    }));

                                                    // 현재 선택된 셀이 있으면 경고 아이콘 표시
                                                    if (selectedCellRef.current && orgChartRef.current) {
                                                        orgChartRef.current.updateMemberValidation(
                                                            selectedCellRef.current
                                                        );
                                                    }
                                                }}
                                                color='white'
                                            />

                                            <SwDatePicker
                                                label='시작일'
                                                id='bgng_ymd'
                                                asterisk
                                                validationText={validationState['bgng_ymd']?.message || ''}
                                                error={!!validationState['bgng_ymd']}
                                                disabled={!editable || selectionState.isTopCell}
                                                vertical
                                                value={
                                                    memoizedFormData.bgng_ymd
                                                        ? dayjs(formattedDate(memoizedFormData.bgng_ymd))
                                                        : null
                                                }
                                                onChange={(e) => handleChange(e, 'bgng_ymd')}
                                                onDelete={() => {
                                                    updateFormData('bgng_ymd', '');
                                                    setValidationState((prev) => ({
                                                        ...prev,
                                                        bgng_ymd: {
                                                            isValid: false,
                                                            message: VALIDATION_MESSAGES.REQUIRED_FIELD,
                                                        },
                                                    }));

                                                    // 현재 선택된 셀이 있으면 경고 아이콘 표시
                                                    if (selectedCellRef.current && orgChartRef.current) {
                                                        orgChartRef.current.updateMemberValidation(
                                                            selectedCellRef.current
                                                        );
                                                    }
                                                }}
                                                color='white'
                                            />

                                            <SwDatePicker
                                                label='종료일'
                                                id='end_ymd'
                                                validationText=''
                                                vertical
                                                disabled={!editable || selectionState.isTopCell}
                                                value={
                                                    memoizedFormData.end_ymd
                                                        ? dayjs(formattedDate(memoizedFormData.end_ymd))
                                                        : null
                                                }
                                                onChange={(e) => handleChange(e, 'end_ymd')}
                                                color='white'
                                            />

                                            <InputTextBox
                                                type='text'
                                                id='child_no'
                                                placeholder='조직코드 입력'
                                                hasToggle={false}
                                                showPassword={false}
                                                label='조직코드'
                                                vertical
                                                validationText=''
                                                value={memoizedFormData.child_no}
                                                disabled={
                                                    !editable || selectionState.isMulti || selectionState.isTopCell
                                                }
                                                onChange={(e) => handleChange(e, 'child_no')}
                                                onDelete={() => updateFormData('child_no', '')}
                                                color='white'
                                            />

                                            <BoxSelect
                                                id='ognz_type_cd'
                                                placeholder='선택하지 않음'
                                                label='조직유형'
                                                vertical
                                                validationText={validationState['ognz_type_cd']?.message || ''}
                                                error={!!validationState['ognz_type_cd']}
                                                value={memoizedFormData.ognz_type_cd}
                                                disabled={
                                                    !editable || selectionState.isMulti || selectionState.isTopCell
                                                }
                                                onChange={(e) => handleChange(e, 'ognz_type_cd')}
                                                options={optionsObject || []}
                                                onDelete={() => {
                                                    updateFormData('ognz_type_cd', '');
                                                    setValidationState((prev) => ({
                                                        ...prev,
                                                        ognz_type_cd: {
                                                            isValid: false,
                                                            message: VALIDATION_MESSAGES.REQUIRED_FIELD,
                                                        },
                                                    }));

                                                    // 현재 선택된 셀이 있으면 경고 아이콘 표시
                                                    if (selectedCellRef.current && orgChartRef.current) {
                                                        orgChartRef.current.updateMemberValidation(
                                                            selectedCellRef.current
                                                        );
                                                    }
                                                }}
                                                color='white'
                                            />
                                        </div>
                                    )}
                                    {tabState === 'tab2' && (
                                        <>
                                            {memoizedFormData.ognz_nm ? (
                                                <OrgMember selectedData={memoizedFormData} editable={editable} />
                                            ) : (
                                                <div className='noSelectedMember'>
                                                    <div className='icon'>
                                                        <IcoPersonCheck fill='#7C7C7C' />
                                                    </div>
                                                    <div className='text'>조직을 선택하면 정보가 표시됩니다.</div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            ) : (
                                <OrgMemberPage />
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default OrgChartPage;
