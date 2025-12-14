/**
 * ID 값을 생성합니다.
 * @returns 현재 시간 기반 고유 ID 문자열
 */
export const generateId = (): string => {
    return Date.now().toString();
};

/**
 * 트리 구조를 위한 계층 데이터 경로를 반환합니다.
 * @param row - 행 데이터 객체
 * @param hierarchyField - 계층 필드명 (기본값: 'hierarchy')
 * @returns 계층 구조 배열 또는 빈 배열
 */
export const getTreeDataPath = (row: any, hierarchyField: string = 'hierarchy'): string[] => {
    return row[hierarchyField] || [];
};

/**
 * 행 데이터에서 변경된 항목만 추출합니다.
 * @param rows - 그리드 행 데이터 배열
 * @returns 변경된(isNew 또는 hasChanged가 true) 항목만 필터링된 배열
 */
export const getChangedRows = (rows: any[]): any[] => {
    if (!rows || !Array.isArray(rows)) return [];

    return rows.filter((row) => row.isNew === true || row.hasChanged === true);
};

/**
 * 행 데이터에 상태 값을 추가합니다.
 * @param newRow - 새 행 데이터
 * @param oldRow - 기존 행 데이터
 * @param type - 업데이트 타입 (origin, edited 등)
 * @returns 상태가 업데이트된 행 데이터
 */
export const changeDifferRow = (newRow: any, oldRow: any, type: string = 'origin'): any => {
    // 기존 값인지 확인
    const isNew = oldRow?.isNew ?? false;
    const rowId = newRow.id;

    if (!isNew) {
        // 값 변경 감지
        let changeRow = { ...newRow };

        // 원본 값과 변경된 값 비교
        const originValue = oldRow?.[Object.keys(newRow)[0]];
        const changeValue = newRow?.[Object.keys(newRow)[0]];

        // 값이 변경되었으면 hasChanged를 true로 설정
        if (originValue !== changeValue) {
            changeRow = { ...newRow, hasChanged: true };
            return changeRow;
        }
    }

    return newRow;
};

/**
 * 데이터를 트리 구조로 변환합니다.
 * @param data - 원본 데이터 배열
 * @param treeCol - 트리 컬럼명
 * @returns 트리 구조로 변환된 데이터
 */
export const convertToTreeData = (data: any[], treeCol: string): any[] => {
    if (!data || !Array.isArray(data) || !treeCol) {
        return data;
    }

    // 계층 구조 추가
    return data.map((item) => {
        const paths = item[treeCol]?.toString().split('/') || [];
        return {
            ...item,
            hierarchy: paths,
        };
    });
};

/**
 * 인덱스 기반 행 ID를 순차적으로 설정합니다.
 * @param rows - 행 데이터 배열
 * @param idPrefix - ID 접두사 (기본값: '')
 * @returns ID가 설정된 행 데이터 배열
 */
export const setSequentialIds = (rows: any[], idPrefix: string = ''): any[] => {
    if (!rows || !Array.isArray(rows)) return [];

    return rows.map((row, index) => ({
        ...row,
        id: `${idPrefix}${index + 1}`,
    }));
};

/**
 * 그리드 행 데이터의 깊은 복사본을 생성합니다.
 * @param rows - 원본 행 데이터 배열
 * @returns 깊은 복사된 행 데이터 배열
 */
export const cloneGridRows = (rows: any[]): any[] => {
    if (!rows || !Array.isArray(rows)) return [];

    return JSON.parse(JSON.stringify(rows));
};

/**
 * 행 데이터에 action_type을 설정합니다. (i: 삽입, u: 업데이트, d: 삭제)
 * @param rows - 행 데이터 배열
 * @param actionType - 설정할 액션 타입 ('i', 'u', 'd' 중 하나)
 * @returns action_type이 설정된 행 데이터 배열
 */
export const setActionType = (rows: any[], actionType: 'i' | 'u' | 'd'): any[] => {
    if (!rows || !Array.isArray(rows)) return [];

    return rows.map((row) => ({
        ...row,
        action_type: actionType,
    }));
};

/**
 * 삭제할 행 ID 목록에 해당하는 행들을 삭제 플래그로 설정합니다.
 * @param rows - 전체 행 데이터 배열
 * @param selectedIds - 선택된(삭제할) 행 ID 세트 또는 배열
 * @returns 삭제 플래그가 설정된 행 데이터 배열
 */
export const markRowsForDeletion = (rows: any[], selectedIds: Set<string> | string[]): any[] => {
    if (!rows || !Array.isArray(rows)) return [];

    // Set으로 변환
    const idSet = selectedIds instanceof Set ? selectedIds : new Set(selectedIds);

    return rows.map((row) => {
        if (idSet.has(row.id)) {
            return { ...row, action_type: 'd' };
        }
        return row;
    });
};
