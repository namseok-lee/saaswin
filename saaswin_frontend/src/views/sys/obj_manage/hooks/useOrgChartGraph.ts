import { useState, useEffect, useRef } from 'react';
import { dia, shapes, ui } from '@joint/plus';
import { getShapes } from '../utils/orgChartUtils';

export function useOrgChartGraph(canvas, members, connections, editable = false) {
    const commandManagerRef = useRef<dia.CommandManager | null>(null);
    // Use refs to maintain stable references
    const graphRef = useRef<dia.Graph | null>(null);
    const paperRef = useRef<dia.Paper | null>(null);
    const scrollerRef = useRef<ui.PaperScroller | null>(null);
    const selectionRef = useRef<ui.Selection | null>(null);

    // Use state for React's rendering
    const [graph, setGraph] = useState<dia.Graph | null>(null);
    const [paper, setPaper] = useState<dia.Paper | null>(null);
    const [scroller, setScroller] = useState<ui.PaperScroller | null>(null);
    const [selection, setSelection] = useState<ui.Selection | null>(null);

    // Track initialization to prevent redundant setup
    const isInitialized = useRef(false);

    // 데이터의 내용 변화를 감지하기 위한 참조
    const membersDataRef = useRef('');
    const connectionsDataRef = useRef('');

    useEffect(() => {
        // Skip if canvas is not available
        if (!canvas.current) return;

        // Skip if already initialized
        if (isInitialized.current) return;

        // Set initialization flag
        isInitialized.current = true;
        console.log('editable', editable);
        // Get appropriate shapes based on editable flag
        const { Member, Link } = getShapes(editable);

        // Define cell namespace with custom components
        const cellNamespace = {
            ...shapes,
            standard: {
                ...shapes.standard,
                Link: Link,
            },
            Member,
            Link: Link,
        };

        // Create graph
        const newGraph = new dia.Graph({}, { cellNamespace: cellNamespace });
        graphRef.current = newGraph;
        setGraph(newGraph);

        // Create command manager for undo/redo
        const newCommandManager = new dia.CommandManager({
            graph: newGraph,

            cmdBeforeAdd: function (cmdName, cell, collection, options = {}) {
                // 배치 작업인지 확인하는 방법
                const isBatchOperation = newGraph.hasActiveBatch?.() || Boolean(newGraph._batches?.length);

                if (cmdName === 'change:attrs') {
                    return false;
                }
                // 배치와 관련된 세부 정보 확인
                if (isBatchOperation) {
                    return true;
                }
                return false;
            },
        });
        commandManagerRef.current = newCommandManager;

        // Create paper
        const newPaper = new dia.Paper({
            model: newGraph,
            width: 300,
            height: 300,
            gridSize: 10,
            async: true,
            frozen: true,
            clickThreshold: 10,
            sorting: dia.Paper.sorting.APPROX,
            background: { color: '#F3F7F6' },
            interactive: false,
            cellViewNamespace: cellNamespace,
            defaultConnector: {
                name: 'straight',
                args: {
                    cornerType: 'cubic',
                },
            },
            defaultAnchor: {
                name: 'modelCenter',
            },
        });
        paperRef.current = newPaper;
        setPaper(newPaper);

        // Create scroller
        const newScroller = new ui.PaperScroller({
            paper: newPaper,
            autoResizePaper: true,
            cursor: 'grab',
            baseWidth: 1,
            baseHeight: 1,
            contentOptions: {
                allowNewOrigin: 'any',
                padding: 100,
                useModelGeometry: true,
            },
        });
        scrollerRef.current = newScroller;
        setScroller(newScroller);

        // Create selection handler
        const newSelection = new ui.Selection({
            paper: newScroller,
            graph: newGraph,
            frames: new ui.HTMLSelectionFrameList({
                style: {
                    pointerEvents: 'none',
                    display: 'none',
                },
            }),
            useModelGeometry: false,
            allowTranslate: false,
            handles: [],
            strictSelection: false,
            selectionFilter: function (element) {
                return element.isElement() && element.attr('body/ref') === 'rect';
            },
        });
        selectionRef.current = newSelection;
        setSelection(newSelection);

        // Append scroller to canvas
        if (canvas.current) {
            canvas.current.appendChild(newScroller.el);
        }

        // Unfreeze paper after initial rendering
        newPaper.unfreeze();

        // Clean up function
        return () => {
            isInitialized.current = false;

            if (canvas.current) {
                while (canvas.current.firstChild) {
                    canvas.current.removeChild(canvas.current.firstChild);
                }
            }
        };
    }, [canvas, editable]); // Add editable to dependency array

    // useOrgChartGraph.ts - members와 connections 변경 시 호출되는 useEffect
    useEffect(() => {
        if (!graphRef.current || (!members.length && !connections.length)) return;

        // 새 그래프 생성 시에만 resetCells 사용 (최초 렌더링)
        if (graphRef.current.getCells().length === 0) {
            graphRef.current.resetCells([...members, ...connections]);
            return;
        }

        // 이후 변경 시에는 개별 노드 업데이트 (이 부분은 생략 - updateFormData에서 처리)
        // 또는 추가/삭제된 노드만 처리
    }, [members, connections]);

    return {
        graph: graphRef.current,
        paper: paperRef.current,
        scroller: scrollerRef.current,
        selection: selectionRef.current,
        commandManager: commandManagerRef.current,
    };
}
