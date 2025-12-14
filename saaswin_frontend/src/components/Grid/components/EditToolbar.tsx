import React from 'react';
import { useGridApiContext, useGridApiEventHandler, GridEventListener } from '@mui/x-data-grid-premium';
import { EditToolbarProps } from '../types';

/**
 * 그리드 상단에 표시되는 툴바 컴포넌트
 * 그리드 이벤트를 처리합니다.
 */
function EditToolbar(
    props: EditToolbarProps & {
        gridRef: ReturnType<typeof useGridApiContext>;
        CheckEvent: GridEventListener<'cellClick'>;
        editStartEvent: GridEventListener<'cellEditStart'>;
    }
) {
    const { gridRef, CheckEvent, editStartEvent } = props;

    // 이벤트 핸들러 등록
    useGridApiEventHandler(gridRef, 'cellClick', CheckEvent);
    useGridApiEventHandler(gridRef, 'cellEditStart', editStartEvent);

    // 실제로 렌더링할 UI가 없으므로 null 반환
    return null;
}

export default EditToolbar;
