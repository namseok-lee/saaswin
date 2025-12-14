// useOrgChartLayout.ts - 최적화 버전
import { useState, useEffect, useRef } from 'react';
import { layout, ui, dia } from '@joint/plus';

// Joint.js에서 사용하는 방향 타입 정의
type Direction = 'L' | 'R' | 'T' | 'B';

export const useOrgChartLayout = (
    graph: dia.Graph | null,
    paper: dia.Paper | null,
    editable: boolean = true,
    layoutType: string = 'R'
) => {
    // 안정적인 참조를 위한 ref 사용
    const treeLayoutRef = useRef<layout.TreeLayout | null>(null);
    const [treeLayout, setTreeLayout] = useState<layout.TreeLayout | null>(null);

    // 정리를 위한 레이아웃 뷰 추적
    const layoutViewRef = useRef<ui.TreeLayoutView | null>(null);

    // 초기화 플래그
    const isInitialized = useRef(false);

    // 현재 방향 추적
    const currentDirectionRef = useRef<string>('');

    useEffect(() => {
        if (!graph || !paper) return;

        // 필요할 때까지 레이아웃 초기화 방지
        if (graph.getCells().length === 0) return;

        // 레이아웃 타입에 따른 방향 결정
        // 레이아웃 타입이 유효한 Direction 타입인지 확인하고 변환
        const direction =
            layoutType === 'L' || layoutType === 'R' || layoutType === 'T' || layoutType === 'B'
                ? (layoutType as Direction)
                : ('R' as Direction);

        // 새 레이아웃을 생성하거나 기존 레이아웃을 업데이트해야 하는지 확인
        // 안전하게 options 속성 접근 (옵션이 없거나 direction이 없는 경우 대비)
        const currentDirection = currentDirectionRef.current;
        // layoutType이 변경될 때마다 새 레이아웃을 만들도록 강제
        const needsNewLayout = !treeLayoutRef.current || currentDirection !== direction;

        if (needsNewLayout) {
            // 이전 레이아웃 뷰가 있으면 정리
            if (layoutViewRef.current) {
                layoutViewRef.current.remove();
                layoutViewRef.current = null;
            }

            // 새 트리 레이아웃 생성
            const newTreeLayout = new layout.TreeLayout({
                graph: graph,
                direction: direction,
                parentGap: 75,
                siblingGap: 10,
            });

            // 현재 방향 저장
            currentDirectionRef.current = direction;

            // 참조 저장
            treeLayoutRef.current = newTreeLayout;
            setTreeLayout(newTreeLayout);

            // 편집 가능한 경우 레이아웃 뷰 생성
            if (editable) {
                const newLayoutView = new ui.TreeLayoutView({
                    theme: 'modern',
                    paper,
                    model: newTreeLayout,
                    className: 'tree-layout member-tree-layout',
                    useModelGeometry: true,
                    clone: (element) => {
                        const clone = element.clone();
                        // 클론에서 불필요한 요소 숨기기
                        clone.attr(['memberAddButtonBody', 'display'], 'none');
                        clone.attr(['memberRemoveButtonBody', 'display'], 'none');
                        clone.attr(['body', 'stroke'], 'none');
                        return clone;
                    },
                    validatePosition: () => false, // 요소는 트리에 연결되어 있어야 함
                    canInteract: (elementView) => !graph.isSource(elementView.model),
                    previewAttrs: {
                        parent: {
                            rx: 5,
                            ry: 5,
                        },
                    },
                });

                // 레이아웃 뷰 참조 저장
                layoutViewRef.current = newLayoutView;
            }

            // 레이아웃 적용
            newTreeLayout.layout();

            // 초기화 플래그 설정
            isInitialized.current = true;
        } else if (isInitialized.current) {
            // 트리 구조가 변경된 경우 레이아웃만 다시 적용
            treeLayoutRef.current?.layout();
        }

        // 정리 함수
        return () => {
            if (layoutViewRef.current) {
                layoutViewRef.current.remove();
                layoutViewRef.current = null;
            }
        };
    }, [graph, paper, editable, layoutType]);

    // 안정적인 참조 반환
    return treeLayoutRef.current;
};
