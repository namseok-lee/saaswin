'use client';

import { dia, format, layout, ui } from '@joint/plus';
import '@joint/plus/joint-plus.css';
import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import './styles.scss';
import { OrgChartProps, OrgChartFormData, OrgChartInstance } from './types';
import { createMember, createLink, processOrgChartData } from './utils/orgChartUtils';
import { useOrgChartGraph } from './hooks/useOrgChartGraph';
import { useOrgChartLayout } from './hooks/useOrgChartLayout';
import { VALIDATION_MESSAGES } from './utils/constants';
import joint from '@joint/plus/joint-plus';
import jsPDF from 'jspdf';

// constants.ts에서 가져온 VALIDATION_MESSAGES를 재내보냄
export { VALIDATION_MESSAGES };

// 부모 컴포넌트에 ref를 전달하기 위해 React.forwardRef 사용
const OrgChart = React.forwardRef<OrgChartInstance, OrgChartProps>((props, ref) => {
    const { masterData, onCellSelect, onMultiSelect, formData, editable = false, layoutType } = props;

    const canvas = useRef<HTMLDivElement | null>(null);

    // 불필요한 리렌더링을 방지하기 위한 안정적인 참조 저장
    const selectedCellRef = useRef<dia.Element | null>(null);
    const [selectedCell, setSelectedCell] = useState<dia.Element | null>(null);

    // 관련 상태를 그룹화하여 상태 변수 개수 줄이기
    const zoomStateRef = useRef({
        currentScale: 1,
        canZoomIn: true,
        canZoomOut: true,
    });

    const [isMulti, setIsMulti] = useState(false);

    // 줌 매개변수를 위한 상수
    const ZOOM_CONFIG = useMemo(
        () => ({
            MIN_SCALE: 0.2,
            MAX_SCALE: 2,
            ZOOM_STEP: 0.2,
        }),
        []
    );

    useEffect(() => {
        console.log('OrgChart 마운트됨', masterData);
    }, [masterData]);

    // 불필요한 재계산을 방지하기 위해 useMemo로 데이터 효율적 처리
    const processedData = useMemo(() => {
        if (!masterData || masterData.length === 0) {
            return { members: [], connections: [] };
        }
        return processOrgChartData(masterData, editable);
    }, [masterData, editable]);

    const { members: membersData, connections: connectionsData } = processedData;

    // 안정적인 참조로 그래프 초기화
    const { graph, paper, scroller, selection, commandManager } = useOrgChartGraph(
        canvas,
        membersData,
        connectionsData,
        editable
    );

    // 안정적인 참조로 레이아웃 초기화
    const treeLayout = useOrgChartLayout(graph, paper, editable, layoutType);

    // layoutType이 변경될 때 레이아웃을 다시 적용
    useEffect(() => {
        console.log('레이아웃 타입 변경됨:', layoutType);
        if (treeLayout && graph) {
            // 레이아웃 다시 적용
            treeLayout.layout();
        }
    }, [treeLayout, graph, layoutType]);

    // 줌 상태 변경을 위한 일괄 업데이트 사용
    useEffect(() => {
        if (!scroller) return;

        const onScale = (scale: number) => {
            zoomStateRef.current = {
                currentScale: scale,
                canZoomIn: scale < ZOOM_CONFIG.MAX_SCALE,
                canZoomOut: scale > ZOOM_CONFIG.MIN_SCALE,
            };
        };

        scroller.on('scale', onScale);

        return () => {
            scroller.off('scale', onScale);
        };
    }, [scroller, ZOOM_CONFIG.MAX_SCALE, ZOOM_CONFIG.MIN_SCALE]);

    // 렌더링마다 재생성되는 것을 방지하기 위해 줌 함수 메모이제이션
    const handleZoomIn = useCallback(() => {
        if (zoomStateRef.current.currentScale < ZOOM_CONFIG.MAX_SCALE && scroller) {
            scroller.zoom(ZOOM_CONFIG.ZOOM_STEP, { max: ZOOM_CONFIG.MAX_SCALE });
        }
    }, [ZOOM_CONFIG.MAX_SCALE, ZOOM_CONFIG.ZOOM_STEP, scroller]);

    const handleZoomOut = useCallback(() => {
        if (zoomStateRef.current.currentScale > ZOOM_CONFIG.MIN_SCALE && scroller) {
            scroller.zoom(-ZOOM_CONFIG.ZOOM_STEP, { min: ZOOM_CONFIG.MIN_SCALE });
        }
    }, [ZOOM_CONFIG.MIN_SCALE, ZOOM_CONFIG.ZOOM_STEP, scroller]);

    const handleZoomToFit = useCallback(() => {
        if (scroller) {
            scroller.zoomToFit({
                padding: 50,
                minScale: 0.2,
                maxScale: 1.5,
            });
        }
    }, [scroller]);

    // 필수값 검증 함수 추가
    const validateRequiredFields = useCallback((data: OrgChartFormData): { isValid: boolean; errorMessage: string } => {
        // 필수 필드 목록 정의
        const requiredFields = ['ognz_nm', 'corp_eng_nm', 'bgng_ymd', 'ognz_type_cd'] as const;

        // 누락된 필드 확인
        const missingFields = requiredFields.filter((field) => {
            const value = data[field] || '';
            return !value || value.trim() === '';
        });

        // 유효성 검사 결과
        const isValid = missingFields.length === 0;

        // 통일된 메시지 반환
        return { isValid, errorMessage: isValid ? '' : VALIDATION_MESSAGES.REQUIRED_FIELD };
    }, []);

    // 조직 편집 검증 함수 - 필요할 경우 사용
    const validateMemberEdit = useCallback((element: dia.Element): { isValid: boolean; errorMessage: string } => {
        if (!element) return { isValid: false, errorMessage: VALIDATION_MESSAGES.NO_SELECTION };

        // 필수 필드 목록
        const requiredFields = ['ognz_nm', 'corp_eng_nm', 'bgng_ymd', 'ognz_type_cd'] as const;

        // 필수 필드 값 검사
        const missingFields = requiredFields.filter((field) => {
            const value = element.prop(`data/${field}`) || '';
            return !value || value.trim() === '';
        });

        // 유효성 상태 결정 (누락된 필드가 없으면 유효함)
        const isValid = missingFields.length === 0;

        // 간단한 메시지로 통일
        return { isValid, errorMessage: isValid ? '' : VALIDATION_MESSAGES.REQUIRED_FIELD };
    }, []);

    // 요소 추가 시 검증 및 아이콘 표시 로직 추가
    const updateMemberValidation = useCallback(
        (element: dia.Element) => {
            if (!element.isElement() || element.get('type') !== 'Member') return;

            // 필수 필드 목록
            const requiredFields = ['ognz_nm', 'corp_eng_nm', 'bgng_ymd', 'ognz_type_cd'] as const;

            // 필수 필드 값 검사
            const missingFields = requiredFields.filter((field) => {
                const value = element.prop(`data/${field}`) || '';
                return !value || value.trim() === '';
            });

            // 유효성 상태 결정 (누락된 필드가 없으면 유효함)
            const isValid = missingFields.length === 0;

            // 현재 표시 상태
            const currentDisplay = element.attr('warningContainer/display');
            // 새 표시 상태 결정
            const newDisplay = isValid ? 'none' : 'block';

            // 표시 상태가 변경될 때만 업데이트
            if (currentDisplay !== newDisplay) {
                // 배치 작업 시작 - 링크 처리를 위해
                graph?.startBatch('update-validation');

                // 경고 아이콘 표시 상태 변경 (카드 크기에 영향 없이)
                element.attr('warningContainer/display', newDisplay);

                // 툴크 메시지 통일 - 모든 검증 실패에 동일한 메시지 사용
                if (!isValid) {
                    element.attr('warningContainer/data-tooltip', VALIDATION_MESSAGES.REQUIRED_FIELD);
                }

                // 배치 작업 종료
                graph?.stopBatch('update-validation');
            }

            return { isValid, errorMessage: isValid ? '' : VALIDATION_MESSAGES.REQUIRED_FIELD };
        },
        [graph]
    );

    // 두 데이터 객체가 다른지 비교하는 함수
    const isDataDifferent = (data1: OrgChartFormData, data2: OrgChartFormData) => {
        // 비교할 필드 목록
        const fieldsToCompare = ['ognz_nm', 'corp_eng_nm', 'bgng_ymd', 'end_ymd', 'ognz_type_cd'] as const;

        return fieldsToCompare.some((field) => {
            // 양쪽 모두 필드가 없으면 같다고 간주
            if (!data1[field] && !data2[field]) return false;

            // 한쪽만 필드가 있거나 값이 다르면 다르다고 간주
            return data1[field] !== data2[field];
        });
    };

    // 액션 타입에 따라 상태 아이콘 업데이트 함수 추가
    const updateStatusIcons = useCallback((element: dia.Element) => {
        if (!element || !element.isElement()) return;

        const actionType = element.prop('data/action_type');

        // 모든 상태 아이콘 초기화
        element.attr('inputStatusIcon/display', 'none');
        element.attr('updateStatusIcon/display', 'none');
        element.attr('updateStatusIconUpdate/display', 'none');

        // 액션 타입에 따라 적절한 아이콘 표시
        if (actionType === 'I') {
            // 추가 상태 아이콘 (초록색)
            element.attr('inputStatusIcon/display', 'block');
            element.attr('inputStatusIconBg/stroke', 'none');
            element.attr('inputStatusIconBg/fill', '#37AE34');
            element.attr('inputStatusIconPlus/display', 'block');
            element.attr('inputStatusIconPlusBg/stroke', 'none');
            element.attr('inputStatusIconPlusBg/fill', '#f4fff4');
            element.attr('inputStatusIconPlusBg/fillOpacity', 0.03);
            element.attr('inputStatusIconPlusSymbol/stroke', '#37AE34');
            element.attr('inputStatusIconPlusSymbol/fill', '#37AE34');
        } else if (actionType === 'U') {
            // 수정 상태 아이콘 (주황색)
            element.attr('updateStatusIcon/display', 'block');
            element.attr('updateStatusIconBg/fill', '#FFA830');
            element.attr('updateStatusIconBg/stroke', 'none');
            element.attr('updateStatusIconUpdate/display', 'block');
            element.attr('updateStatusIconUpdate/stroke', 'none');
        } else if (actionType === 'D') {
            // 삭제 상태 아이콘 (빨간색)
            element.attr('updateStatusIcon/display', 'block');
            element.attr('updateStatusIconBg/fill', '#ff0000');
            element.attr('updateStatusIconBg/stroke', 'none');
            element.attr('root/opacity', 0.5);
            element.attr('body/stroke', '#ff0000');
        } else {
            // 액션 타입이 없는 경우 (원래 상태)
            element.attr('body/stroke', '#e4e4e4');
            element.attr('root/opacity', 1);
        }
    }, []);

    // 요소 데이터 업데이트 및 액션 타입 'U' 설정 함수 추가
    const updateMemberData = useCallback(
        (element: dia.Element, newData: Partial<OrgChartFormData>) => {
            if (!element || !graph) return;

            graph.startBatch('update-member');

            // 기존 데이터 가져오기
            const existingData = { ...element.prop('data') };
            const isNewElement = existingData.action_type === 'I';
            const initialData = element.prop('initialData') || { ...existingData };

            // 새 데이터로 업데이트
            const updatedData = { ...existingData, ...newData };
            element.prop('data', updatedData);

            // 초기 데이터를 아직 저장하지 않았다면 저장
            if (!element.prop('initialData')) {
                element.prop('initialData', initialData);
            }

            // 초기 데이터와 현재 데이터 비교하여 액션 타입 결정
            if (!isNewElement && element.prop('data/action_type') !== 'D') {
                const isDifferent = isDataDifferent(initialData as OrgChartFormData, updatedData as OrgChartFormData);

                // 데이터가 다르면 'U', 같으면 액션 타입 제거
                if (isDifferent) {
                    element.prop('data/action_type', 'U');
                } else if (existingData.action_type === 'U') {
                    // 'U' 상태에서 다시 원래대로 돌아온 경우
                    delete updatedData.action_type;
                    element.prop('data', updatedData);
                }
            }

            // 상태 아이콘 업데이트
            updateStatusIcons(element);

            // 검증 업데이트
            updateMemberValidation(element);

            graph.stopBatch('update-member');

            return element;
        },
        [graph, updateStatusIcons, updateMemberValidation, isDataDifferent]
    );

    // 조직 생성을 위한 안정적인 참조
    const handleCreateOrg = useCallback(
        (event: React.SyntheticEvent, formData: OrgChartFormData, sourceElement: dia.Element | null = null) => {
            event.stopPropagation();

            if (!graph || !treeLayout) {
                console.warn('그래프 또는 레이아웃이 초기화되지 않았습니다');
                return;
            }

            // 명시적인 배치 이름 설정 - CommandManager에서 이 이름으로 필터링
            graph.startBatch('add-member');

            // 최신 값을 보장하기 위해 ref에서 현재 선택된 셀 사용
            const currentSelectedCell = selectedCellRef.current;

            // 기존 멤버 가져오기
            const existingMembers = graph
                .getCells()
                .filter((cell) => cell.isElement() && cell.get('type') === 'Member');

            const newOrgNumber = existingMembers ? existingMembers.length + 1 : 1;
            console.log('newOrgNumber', newOrgNumber, formData);
            const newOrgName = formData.ognz_nm || `새조직${newOrgNumber}`;

            // 위치 계산 - 반복 줄이기 위해 최적화
            let newX = 100;
            let newY = 100;

            if (existingMembers.length > 0) {
                // 모든 요소를 반복하지 않고 최대 위치 찾기
                const maxPositions = existingMembers.reduce(
                    (acc, member) => {
                        const memberBBox = member.getBBox();
                        return {
                            x: Math.max(acc.x, memberBBox.x + memberBBox.width),
                            y: Math.max(acc.y, memberBBox.y + memberBBox.height),
                        };
                    },
                    { x: 0, y: 0 }
                );

                newX = maxPositions.x + 50;
                newY = maxPositions.y - 50;
            }

            // 부모에 기반한 레벨 계산
            const parentLevel = sourceElement
                ? parseInt(sourceElement.prop('data/level') || '0')
                : currentSelectedCell
                ? parseInt(currentSelectedCell.prop('data/level') || '0')
                : 0;

            const newLevel = parentLevel + 1;

            // 새 조직 생성
            const newMember = createMember(newOrgName, editable);
            newMember.position(newX, newY);

            // 부모 ID 가져오기
            const parentId = sourceElement
                ? sourceElement.prop('data/child_no')
                : currentSelectedCell
                ? currentSelectedCell.prop('data/child_no')
                : null;

            // 새 조직 코드 생성
            const newOrgCode = formData.child_no || `NEW${Date.now().toString().substring(6)}`;

            // 데이터 속성 설정
            const memberData = {
                level: newLevel.toString(),
                end_ymd: formData.end_ymd || '29991231',
                ognz_nm: newOrgName,
                bgng_ymd: formData.bgng_ymd || new Date().toISOString().slice(0, 10).replace(/-/g, ''),
                child_no: newOrgCode,
                parent_no: parentId,
                corp_eng_nm: formData.corp_eng_nm || '',
                ognz_type_cd: formData.ognz_type_cd || '',
                action_type: formData.action_type || 'I', // 기본값으로 'I' 설정
            };

            newMember.prop('data', memberData);

            // 초기 데이터로도 저장 (나중에 변경 여부 비교용)
            newMember.prop('initialData', { ...memberData });

            // 필요시 연결 생성
            if (sourceElement) {
                const newConnection = createLink(sourceElement, newMember);
                graph.addCells([newMember, newConnection]);
            } else if (currentSelectedCell) {
                const newConnection = createLink(currentSelectedCell, newMember);
                graph.addCells([newMember, newConnection]);
            } else {
                graph.addCell(newMember);
            }

            // 새 요소에 대한 검증 및 경고 아이콘 표시
            updateMemberValidation(newMember);

            // 상태 아이콘 업데이트
            updateStatusIcons(newMember);

            // 레이아웃 적용
            treeLayout?.layout();

            // 배치 작업 종료 - add-member 명령으로 끝내기
            graph.stopBatch('add-member');

            return newMember;
        },
        [graph, treeLayout, updateMemberValidation, updateStatusIcons]
    );

    // 조직 제거를 위한 안정적인 참조
    const handleRemoveMember = useCallback(() => {
        if (!selectedCellRef.current || !graph) return;

        const currentSelectedCell = selectedCellRef.current;

        // action_type 확인
        const actionType = currentSelectedCell.prop('data/action_type');

        // 자식 노드 확인
        const selectedChildNo = currentSelectedCell.prop('data/child_no');
        const allCells = graph.getCells() || [];

        // 빠른 조회를 위한 Map 사용
        const childMap = new Map();

        // 부모-자식 관계 구축
        allCells.forEach((cell) => {
            const parentNo = cell.prop('data/parent_no');
            if (parentNo) {
                if (!childMap.has(parentNo)) {
                    childMap.set(parentNo, []);
                }
                childMap.get(parentNo).push(cell);
            }
        });
        console.log('childMap', childMap);
        // 직접적인 자식 노드 확인 - 여기서 child_no를 키로 사용합니다
        const directChildren = childMap.get(selectedChildNo) || [];
        console.log('directChildren', directChildren);

        // 자식 노드가 있는 경우 삭제 방지
        if (directChildren.length > 0) {
            alert(
                `이 요소에는 ${directChildren.length}개의 하위 조직이 있어 삭제할 수 없습니다. 먼저 하위 조직을 삭제해주세요.`
            );
            return;
        }

        // action_type이 'I'인 경우 실제로 삭제, 그렇지 않은 경우 'D'로 표시만 함
        if (actionType === 'I') {
            // 실제 삭제 수행
            graph.startBatch('remove-member');
            treeLayout?.removeElement(currentSelectedCell);
            graph.stopBatch('remove-member');

            // 선택 초기화
            setSelectedCell(null);
            selectedCellRef.current = null;
        } else {
            // 삭제 대신 action_type을 'D'로 설정
            const data = { ...currentSelectedCell.prop('data') };
            data.action_type = 'D';
            currentSelectedCell.prop('data', data);

            // 상태 아이콘 업데이트
            updateStatusIcons(currentSelectedCell);
        }
    }, [graph, treeLayout, updateStatusIcons]);

    // 자식 노드 접기/펼치기 처리 함수
    const handleToggleCollapse = useCallback(
        (element: dia.Element) => {
            if (!graph) return;

            graph.startBatch('toggle-collapse');

            const isCollapsed = element.prop('isCollapsed') || false;
            element.prop('isCollapsed', !isCollapsed);

            // 아이콘 변경
            if (!isCollapsed) {
                // 접기 아이콘 (왼쪽 삼각형)
                element.attr('toggleButtonIcon/d', 'M0.958496 8.05731V0.945312L6.54493 4.50131L0.958496 8.05731Z');
                element.attr('toggleButtonIcon/display', 'block');
                element.attr('toggleButtonIconExpanded/display', 'none');
                // 접기 아이콘 스타일
                element.attr('toggleButtonBody/fill', 'var(--primary)');
                element.attr('toggleButtonBody/stroke', 'var(--primary)');
                element.attr('toggleButtonIcon/stroke', '#FFFFFF');
                element.attr('toggleButtonIcon/fill', '#FFFFFF');
            } else {
                // 펼치기 아이콘 (오른쪽 삼각형)
                element.attr('toggleButtonIcon/d', 'M6.54493 0.945312V8.05731L0.958496 4.50131L6.54493 0.945312Z');
                element.attr('toggleButtonIcon/display', 'block');
                element.attr('toggleButtonIconExpanded/display', 'none');
                // 펼치기 아이콘 스타일
                element.attr('toggleButtonBody/fill', '#FFF');
                element.attr('toggleButtonBody/stroke', '#E2E2E2');
                element.attr('toggleButtonIcon/stroke', '#666666');
                element.attr('toggleButtonIcon/fill', '#666666');
            }

            // 자식 요소 처리
            const childLinks = graph.getConnectedLinks(element, { outbound: true });
            const childElements: dia.Element[] = [];

            childLinks.forEach((link) => {
                const targetId = link.get('target').id;
                const targetElement = graph.getCell(targetId);

                if (targetElement && targetElement.isElement()) {
                    childElements.push(targetElement as dia.Element);
                    link.attr('line/display', isCollapsed ? 'block' : 'none');
                }
            });

            // 재귀적으로 모든 자식 요소 표시/숨김 처리
            const processChildren = (parentElement: dia.Element, isVisible: boolean) => {
                const pChildLinks = graph.getConnectedLinks(parentElement, { outbound: true });

                pChildLinks.forEach((childLink) => {
                    childLink.attr('line/display', isVisible ? 'block' : 'none');

                    const childId = childLink.get('target').id;
                    const childElement = graph.getCell(childId) as dia.Element;

                    if (childElement && childElement.isElement()) {
                        childElement.attr('root/display', isVisible ? 'block' : 'none');
                        processChildren(childElement, isVisible && !(childElement.prop('isCollapsed') || false));
                    }
                });
            };

            // 접힘 상태에 따라 자식 요소 처리
            childElements.forEach((childElement) => {
                childElement.attr('root/display', isCollapsed ? 'block' : 'none');
                processChildren(childElement, isCollapsed && !(childElement.prop('isCollapsed') || false));
            });

            graph.stopBatch('toggle-collapse');
        },
        [graph]
    );

    // 자식 노드 여부에 따라 접기/펼치기 버튼 표시/숨김 처리
    const updateToggleButtonVisibility = useCallback(() => {
        if (!graph) return;

        // 그래프의 모든 요소 순회
        graph.getElements().forEach((element) => {
            if (element.get('type') !== 'Member') return;

            // 자식 연결 확인
            const childLinks = graph.getConnectedLinks(element, { outbound: true });

            // 자식이 있는 경우에만 토글 버튼 표시
            const hasChildren = childLinks.length > 0;
            element.prop('hasChildren', hasChildren);
            element.attr('toggleButton/display', hasChildren ? 'block' : 'none');
        });
    }, [graph]);

    // 이벤트 핸들러들을 컴포넌트의 최상위 레벨로 이동
    const handleElementMemberAdd = useCallback(
        (elementView: dia.ElementView, evt: MouseEvent) => {
            evt.stopPropagation();
            const defaultFormData: OrgChartFormData = {
                level: '',
                end_ymd: '29991231',
                ognz_nm: '',
                bgng_ymd: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
                child_no: '',
                parent_no: '',
                corp_eng_nm: '',
                ognz_type_cd: '',
                action_type: 'I', // 하위조직 추가 버튼으로 추가할 때만 'I'로 설정
            };
            // 이벤트 객체를 React.SyntheticEvent로 변환
            const syntheticEvent = { stopPropagation: () => evt.stopPropagation() } as React.SyntheticEvent;
            handleCreateOrg(syntheticEvent, defaultFormData, elementView.model);
        },
        [handleCreateOrg]
    );

    const handleElementToggle = useCallback(
        (elementView: dia.ElementView, evt: MouseEvent) => {
            evt.stopPropagation();
            handleToggleCollapse(elementView.model);
        },
        [handleToggleCollapse]
    );

    // 이벤트 핸들러 타입 수정
    const handleElementPointerUp = useCallback(
        (elementView: dia.ElementView, evt: joint.dia.Event, x: number, y: number) => {
            evt.stopPropagation();
            const model = elementView.model;
            const mouseEvent = evt as unknown as MouseEvent;
            if (mouseEvent.shiftKey || mouseEvent.metaKey) {
                if (selection?.collection.includes(model)) {
                    selection?.collection.remove(model);
                } else {
                    selection?.collection.add(model);
                }
            } else {
                selection?.collection.reset([model]);
            }

            // 새로 선택된 요소의 테두리 색상 변경
            if (model.isElement()) {
                // 이전에 선택된 요소의 테두리 색상 초기화
                if (selectedCellRef.current) {
                    // 삭제된 요소가 아닌 경우에만 기본 테두리 색상으로 복원
                    if (selectedCellRef.current.prop('data/action_type') !== 'D') {
                        selectedCellRef.current.attr('body/stroke', '#e4e4e4');
                    }
                    selectedCellRef.current.attr('body/strokeWidth', 1);
                    selectedCellRef.current.attr('memberAddButton/fill', '#ffffff');
                    selectedCellRef.current.attr('memberAddButton/stroke', '#e4e4e4');
                    selectedCellRef.current.attr('memberAddButtonIcon/fill', '#666666');
                    selectedCellRef.current.attr('memberAddButtonIcon/stroke', '#666666');
                }

                // 새로 선택된 요소의 action_type이 'D'가 아닌 경우에만 테두리 색상 변경
                if (model.prop('data/action_type') !== 'D') {
                    model.attr('body/stroke', 'var(--primary)');
                }
                model.attr('body/strokeWidth', 1);
                model.attr('memberAddButton/fill', 'var(--deeper)');
                model.attr('memberAddButton/stroke', 'var(--deeper)');
                model.attr('memberAddButtonIcon/fill', '#fff');
                model.attr('memberAddButtonIcon/stroke', '#fff');
                selectedCellRef.current = model;
                setSelectedCell(model);

                // 셀 정보 콘솔에 출력
                const cellData = model.prop('data');
                console.log('선택된 셀 정보:', {
                    id: model.id,
                    ...cellData,
                });
            }

            if (onCellSelect) onCellSelect(model);
            if (onMultiSelect && selection) {
                const isMultiSelected = selection.collection.models?.length > 1;
                onMultiSelect(isMultiSelected);
            }
        },
        [selection, onCellSelect, onMultiSelect]
    );

    const handleBlankPointerDown = useCallback(
        (evt: joint.dia.Event, x: number, y: number) => {
            const mouseEvent = evt as unknown as MouseEvent;
            if (mouseEvent.shiftKey || mouseEvent.metaKey) {
                // 선택 상자
            } else {
                scroller?.startPanning(evt);
                selection?.collection.reset([]);
                // 선택 해제 시 테두리 색상 초기화
                if (selectedCellRef.current) {
                    selectedCellRef.current.attr('body/stroke', '#e4e4e4');
                    selectedCellRef.current.attr('body/strokeWidth', 1);
                    selectedCellRef.current.attr('memberAddButton/fill', '#ffffff');
                    selectedCellRef.current.attr('memberAddButton/stroke', '#e4e4e4');
                    selectedCellRef.current.attr('memberAddButtonIcon/fill', '#666666');
                    selectedCellRef.current.attr('memberAddButtonIcon/stroke', '#666666');
                }
                setSelectedCell(null);
                selectedCellRef.current = null;
                setIsMulti(false);
                if (onCellSelect) onCellSelect(null);
                if (onMultiSelect) onMultiSelect(false);
            }
        },
        [scroller, selection, onCellSelect, onMultiSelect]
    );

    const handleMouseWheel = useCallback(
        (evt: WheelEvent) => {
            if (evt.shiftKey && scroller) {
                evt.preventDefault();
                const clientPoint = paper?.clientToLocalPoint({
                    x: evt.clientX,
                    y: evt.clientY,
                });
                const delta = evt.deltaY < 0 ? ZOOM_CONFIG.ZOOM_STEP : -ZOOM_CONFIG.ZOOM_STEP;
                const nextScale = zoomStateRef.current.currentScale + delta;
                if (nextScale >= ZOOM_CONFIG.MIN_SCALE && nextScale <= ZOOM_CONFIG.MAX_SCALE) {
                    scroller.zoom(delta, {
                        min: ZOOM_CONFIG.MIN_SCALE,
                        max: ZOOM_CONFIG.MAX_SCALE,
                        grid: ZOOM_CONFIG.ZOOM_STEP,
                        ox: clientPoint?.x,
                        oy: clientPoint?.y,
                    });
                }
            }
        },
        [scroller, paper, ZOOM_CONFIG]
    );

    // 이벤트 리스너 설정
    useEffect(() => {
        if (!paper || !scroller || !selection || !graph) return;

        paper.on('element:member:add', handleElementMemberAdd);
        paper.on('element:toggle', handleElementToggle);
        paper.on('blank:pointerdown', handleBlankPointerDown);
        paper.on('element:pointerup', handleElementPointerUp);
        paper.on('element:mouseenter', (elementView) => {
            const element = elementView.model;
            if (element.prop('data/action_type') !== 'D') {
                element.attr('body/stroke', 'var(--primary)');
                element.attr('memberAddButton/fill', 'var(--primary)');
                element.attr('memberAddButton/stroke', 'var(--primary)');
                element.attr('memberAddButtonIcon/fill', '#FFFFFF');
                element.attr('memberAddButtonIcon/stroke', '#FFFFFF');
            }
        });
        paper.on('element:mouseleave', (elementView) => {
            const element = elementView.model;
            if (element.prop('data/action_type') !== 'D' && !selection?.collection.includes(element)) {
                element.attr('body/stroke', '#e4e4e4');
                element.attr('memberAddButton/fill', '#FFFFFF');
                element.attr('memberAddButton/stroke', '#E2E2E2');
                element.attr('memberAddButtonIcon/fill', '#666666');
                element.attr('memberAddButtonIcon/stroke', '#666666');
            }
        });
        paper.el.addEventListener('wheel', handleMouseWheel, { passive: false });

        return () => {
            paper.off('element:member:add', handleElementMemberAdd);
            paper.off('element:toggle', handleElementToggle);
            paper.off('blank:pointerdown', handleBlankPointerDown);
            paper.off('element:pointerup', handleElementPointerUp);
            paper.off('element:mouseenter');
            paper.off('element:mouseleave');
            paper.el.removeEventListener('wheel', handleMouseWheel);
        };
    }, [
        paper,
        scroller,
        selection,
        graph,
        handleElementMemberAdd,
        handleElementToggle,
        handleBlankPointerDown,
        handleElementPointerUp,
        handleMouseWheel,
    ]);

    // 그래프 업데이트시 접기/펼치기 버튼 가시성 업데이트
    useEffect(() => {
        if (!graph) return;
        updateToggleButtonVisibility();
    }, [graph, updateToggleButtonVisibility]);

    // 조직 추가/삭제 후 접기/펼치기 버튼 가시성 업데이트
    useEffect(() => {
        if (!graph) return;

        const handleCellsChanged = () => {
            updateToggleButtonVisibility();
        };

        graph.on('add remove', handleCellsChanged);

        return () => {
            graph.off('add remove', handleCellsChanged);
        };
    }, [graph, updateToggleButtonVisibility]);

    const exportToPNG = useCallback(
        (event: React.SyntheticEvent) => {
            event.preventDefault();
            if (!paper || !graph) return;

            // 임시로 경고 아이콘 숨기기
            const elements = graph.getElements();
            const warningStates: Record<string, string> = {};

            // 경고 아이콘 상태 저장 및 숨기기
            elements.forEach((element) => {
                if (element.isElement() && element.get('type') === 'Member') {
                    const displayState = element.attr('warningContainer/display');
                    warningStates[element.id as string] = displayState;
                    element.attr('warningContainer/display', 'none');
                }
            });

            // 현재 보이는 영역 계산
            let boundingBox;
            if (scroller && paper) {
                // 페이퍼의 콘텐츠 영역 사용
                boundingBox = paper.getContentBBox();
                // 여백 추가
                boundingBox.inflate(50);
            } else if (graph) {
                boundingBox = graph.getBBox() || new dia.g.Rect();
                // 여백 추가
                boundingBox.inflate(50);
            } else {
                // 그래프와 페이퍼가 모두 없는 경우 기본 영역 설정
                boundingBox = new dia.g.Rect(0, 0, 800, 600);
            }

            // 최신 JointJS Plus 이미지 내보내기 옵션
            const exportOptions = {
                area: boundingBox,
                padding: 20,
                backgroundColor: '#FFFFFF',
                quality: 1,
                size: '2x', // 고해상도 출력
                useComputedStyle: true,
                grid: false,
            };

            // 올바른 API인 format.toPNG 사용 - 콜백 함수에서 성공과 오류 모두 처리
            format.toPNG(
                paper,
                (dataUri, error) => {
                    // 경고 아이콘 상태 복원
                    elements.forEach((element) => {
                        if (element.isElement() && element.get('type') === 'Member') {
                            const originalState = warningStates[element.id as string];
                            if (originalState) {
                                element.attr('warningContainer/display', originalState);
                            }
                        }
                    });

                    if (error) {
                        console.error('PNG 내보내기 오류:', error);
                        alert('PNG 이미지 생성 중 오류가 발생했습니다.');
                        return;
                    }

                    // PNG 다운로드
                    const link = document.createElement('a');
                    link.download = `organization-chart-${new Date().toISOString().slice(0, 10)}.png`;
                    link.href = dataUri;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                },
                exportOptions
            );
        },
        [paper, graph, scroller]
    );

    // PDF 내보내기 함수 구현 - jsPDF 라이브러리 사용
    const exportToPDF = useCallback(
        (event: React.SyntheticEvent) => {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            if (!paper || !graph) return;

            // 임시로 경고 아이콘 숨기기
            const elements = graph.getElements();
            const warningStates: Record<string, string> = {};

            // 경고 아이콘 상태 저장 및 숨기기
            elements.forEach((element) => {
                if (element.isElement() && element.get('type') === 'Member') {
                    const displayState = element.attr('warningContainer/display');
                    warningStates[element.id as string] = displayState;
                    element.attr('warningContainer/display', 'none');
                }
            });

            // 현재 보이는 영역 계산
            let boundingBox;
            if (scroller && paper) {
                // 페이퍼의 콘텐츠 영역 사용
                boundingBox = paper.getContentBBox();
                // 여백 추가
                boundingBox.inflate(50);
            } else if (graph) {
                boundingBox = graph.getBBox() || new dia.g.Rect();
                // 여백 추가
                boundingBox.inflate(50);
            } else {
                // 그래프와 페이퍼가 모두 없는 경우 기본 영역 설정
                boundingBox = new dia.g.Rect(0, 0, 800, 600);
            }

            // 최신 JointJS Plus 이미지 내보내기 옵션
            const exportOptions = {
                area: boundingBox,
                padding: 20,
                backgroundColor: '#FFFFFF',
                quality: 1,
                size: '2x', // 고해상도 출력
                useComputedStyle: true,
                grid: false,
            };

            // 먼저 format.toCanvas를 사용하여 canvas 가져오기 - 콜백 함수에서 성공과 오류 모두 처리
            format.toCanvas(
                paper,
                (canvas, error) => {
                    // 경고 아이콘 상태 복원
                    elements.forEach((element) => {
                        if (element.isElement() && element.get('type') === 'Member') {
                            const originalState = warningStates[element.id as string];
                            if (originalState) {
                                element.attr('warningContainer/display', originalState);
                            }
                        }
                    });

                    if (error) {
                        console.error('Canvas 내보내기 오류:', error);
                        alert('PDF 생성을 위한 Canvas 내보내기 중 오류가 발생했습니다.');
                        return;
                    }

                    try {
                        // Canvas를 이미지 데이터로 변환
                        const imgData = canvas.toDataURL('image/png');

                        // Canvas 크기 가져오기
                        const canvasWidth = canvas.width;
                        const canvasHeight = canvas.height;

                        // 가로 방향으로 할지 세로 방향으로 할지 결정
                        const orientation = canvasWidth > canvasHeight ? 'landscape' : 'portrait';

                        // PDF 페이지 크기 계산
                        // A4 크기: 가로 297mm x 세로 210mm (landscape)
                        // A4 크기: 가로 210mm x 세로 297mm (portrait)
                        const a4Width = orientation === 'landscape' ? 297 : 210;
                        const a4Height = orientation === 'landscape' ? 210 : 297;

                        // 여백 설정 (mm)
                        const margin = 10;

                        // 이미지 크기 계산 (이미지 비율 유지)
                        const aspectRatio = canvasWidth / canvasHeight;

                        // PDF에 들어갈 수 있는 최대 크기 계산
                        const maxImageWidth = a4Width - margin * 2;
                        const maxImageHeight = a4Height - margin * 2;

                        // 비율에 맞게 이미지 크기 조정
                        let imageWidth, imageHeight;
                        if (aspectRatio > maxImageWidth / maxImageHeight) {
                            // 이미지가 더 넓은 경우
                            imageWidth = maxImageWidth;
                            imageHeight = imageWidth / aspectRatio;
                        } else {
                            // 이미지가 더 높은 경우
                            imageHeight = maxImageHeight;
                            imageWidth = imageHeight * aspectRatio;
                        }

                        // jsPDF 인스턴스 생성
                        // 필요에 따라 import { jsPDF } from 'jspdf'를 추가해야 할 수 있습니다.
                        const pdf = new jsPDF({
                            orientation: orientation,
                            unit: 'mm',
                            format: 'a4',
                        });

                        // PDF에 이미지 추가
                        pdf.addImage(imgData, 'PNG', margin, margin, imageWidth, imageHeight);

                        // PDF 저장
                        pdf.save(`organization-chart-${new Date().toISOString().slice(0, 10)}.pdf`);
                    } catch (error) {
                        console.error('PDF 생성 오류:', error);
                        alert('PDF 생성 중 오류가 발생했습니다.');
                    }
                },
                exportOptions
            );
        },
        [paper, graph, scroller]
    );

    // 더미 데이터 가져오기 함수
    const fetchData = useCallback(async () => {
        console.log('fetchData 호출됨');
    }, []);

    // 그래프 변경사항 모니터링 및 상태 업데이트
    useEffect(() => {
        if (!graph) return;

        const handleCellChange = (cell: dia.Cell) => {
            if (cell.isElement() && cell.get('type') === 'Member') {
                const element = cell as dia.Element;

                // 초기 데이터 저장 (아직 없는 경우)
                if (!element.prop('initialData') && element.prop('data')) {
                    element.prop('initialData', { ...element.prop('data') });
                }

                // 현재 데이터와 초기 데이터 비교
                const currentData = element.prop('data') as OrgChartFormData;
                const initialData = element.prop('initialData') as OrgChartFormData;

                if (initialData && currentData) {
                    // 새로 생성된 요소가 아니고 삭제된 요소도 아닌 경우만 비교
                    if (currentData.action_type !== 'I' && currentData.action_type !== 'D') {
                        const isDifferent = isDataDifferent(initialData, currentData);

                        if (isDifferent && currentData.action_type !== 'U') {
                            // 변경되었지만 아직 U가 아닌 경우
                            currentData.action_type = 'U';
                            element.prop('data', currentData);
                        } else if (!isDifferent && currentData.action_type === 'U') {
                            // 다시 같아졌는데 U 상태인 경우
                            delete currentData.action_type;
                            element.prop('data', currentData);
                        }
                    }
                }

                updateStatusIcons(element);
            }
        };

        graph.on('change:data', handleCellChange);

        // 그래프의 모든 요소에 대해 초기 데이터 저장
        graph.getElements().forEach((element) => {
            if (element.get('type') === 'Member' && !element.prop('initialData')) {
                element.prop('initialData', { ...element.prop('data') });
            }
        });

        return () => {
            graph.off('change:data', handleCellChange);
        };
    }, [graph, updateStatusIcons, isDataDifferent]);

    // ref를 통해 부모에게 메서드 노출 - updateMemberData 추가
    React.useImperativeHandle(
        ref,
        () => ({
            paper,
            graph,
            scroller,
            treeLayout,
            selection,
            currentScale: zoomStateRef.current.currentScale,
            handleUndo: () => commandManager?.undo(),
            handleRedo: () => commandManager?.redo(),
            handleStack: () => console.log(commandManager?.toJSON()),
            canUndo: () => commandManager?.hasUndo() || false,
            canRedo: () => commandManager?.hasRedo() || false,
            handleZoomIn,
            handleZoomOut,
            handleZoomToFit,
            exportToPNG,
            exportToPDF,
            handleCreateOrg,
            handleRemoveMember,
            fetchData,
            canZoomIn: zoomStateRef.current.canZoomIn,
            canZoomOut: zoomStateRef.current.canZoomOut,
            members: membersData,
            validateRequiredFields,
            validateMemberEdit,
            updateMemberValidation,
            handleToggleCollapse,
            updateStatusIcons,
            updateMemberData,
        }),
        [
            paper,
            graph,
            scroller,
            treeLayout,
            selection,
            commandManager,
            handleZoomIn,
            handleZoomOut,
            handleZoomToFit,
            exportToPNG,
            exportToPDF,
            handleCreateOrg,
            handleRemoveMember,
            fetchData,
            membersData,
            validateRequiredFields,
            validateMemberEdit,
            updateMemberValidation,
            handleToggleCollapse,
            updateStatusIcons,
            updateMemberData,
        ]
    );

    // 캔버스 요소만 렌더링
    return <div id='canvas' ref={canvas} className='canvas'></div>;
});

// 디스플레이 이름 설정
OrgChart.displayName = 'OrgChart';

// OrgChart 컴포넌트의 React.memo 비교 함수 최적화
export default React.memo(OrgChart, (prevProps, nextProps) => {
    // masterData가 변경되었지만 실제 내용이 같으면 리렌더링 방지
    if (prevProps.masterData && nextProps.masterData) {
        // 길이가 같고 선택된 노드의 데이터만 변경된 경우
        if (prevProps.masterData.length === nextProps.masterData.length) {
            // 선택된 노드는 이미 직접 업데이트했으므로 리렌더링 불필요
            return true;
        }
    }

    // 다른 prop들 비교
    return prevProps.editable === nextProps.editable && prevProps.layoutType === nextProps.layoutType;
});
