import { fetcherPost } from 'utils/axios';
import { fetcherPostData } from 'utils/axios';

/**
 * API 요청을 위한 공통 인터페이스
 */
export interface ApiRequestItem {
    sqlId: string;
    sql_key?: string;
    params: any[];
}

/**
 * 그리드 데이터 저장 파라미터 인터페이스
 */
export interface GridSaveParams {
    /** 화면 번호 */
    scr_no?: string;
    /** 사용자 번호 */
    user_no?: string;
    /** 대표 조직 번호 */
    rprs_ognz_no?: string;
    /** 작업 타입 (i: 입력, u: 수정, d: 삭제) */
    action_type?: 'i' | 'u' | 'd';
    /** 기타 필요한 매개변수 */
    [key: string]: any;
}

/**
 * 그리드 행 데이터 타입
 */
export interface GridRowData {
    id: string;
    [key: string]: any;
}

/**
 * API URL을 결정합니다.
 * @param sqlId - SQL ID
 * @param apiUrl - API URL (직접 지정할 경우)
 * @returns 적절한 API URL
 */
export const getApiUrl = (sqlId: string, apiUrl?: string): string => {
    if (apiUrl) return apiUrl;

    // sqlId에 따라 URL 결정
    if (sqlId === '0') {
        return process.env.NEXT_PUBLIC_SSW_COMMON_SAVE_API_URL || '';
    } else {
        return process.env.NEXT_PUBLIC_SSW_REDIS_SEARCH_ORIGIN_API_URL || '';
    }
};

/**
 * 그리드 데이터 저장 요청을 보냅니다.
 * @param rows - 저장할 행 데이터
 * @param sqlId - SQL ID
 * @param sqlKey - SQL 키(있는 경우)
 * @param baseParams - 기본 파라미터 (화면번호, 사용자번호 등)
 * @param apiUrl - API URL (직접 지정할 경우)
 * @returns Promise 객체
 */
export const saveGridData = async (
    rows: GridSaveParams[],
    sqlId: string,
    sqlKey?: string,
    baseParams?: GridSaveParams,
    apiUrl?: string
): Promise<any> => {
    if (!rows || rows.length === 0) {
        throw new Error('저장할 데이터가 없습니다');
    }

    const url = getApiUrl(sqlId, apiUrl);

    // 기본 파라미터 적용
    const processedRows = rows.map((row) => ({
        ...row,
        scr_no: baseParams?.scr_no || row.scr_no,
        user_no: baseParams?.user_no || row.user_no || '', // 기본값 (실제로는 로그인 사용자 정보 사용)
        rprs_ognz_no: baseParams?.rprs_ognz_no || row.rprs_ognz_no || '',
    }));

    const items: ApiRequestItem[] = [
        {
            sqlId,
            ...(sqlKey && { sql_key: sqlKey }),
            params: processedRows,
        },
    ];

    try {
        const response = await fetcherPost([url, items]);
        return response;
    } catch (error) {
        console.error('데이터 저장 중 오류가 발생했습니다:', error);
        throw error;
    }
};

/**
 * 그리드 데이터 상세 저장 함수
 * @param item - 저장 항목 정보
 * @param rows - 저장할 행 데이터
 * @param confirmMessage - 확인 메시지 (기본값: '저장하시겠습니까?')
 * @param onSuccess - 성공 콜백
 * @param onError - 오류 콜백
 */
export const handleGridSave = async (
    item: { sqlId: string; sqlKey?: string; type?: string },
    rows: GridSaveParams[],
    confirmMessage: string = '저장하시겠습니까?',
    onSuccess?: (response: any) => void,
    onError?: (error: any) => void
): Promise<void> => {
    if (!confirm(confirmMessage)) return;

    try {
        const response = await saveGridData(rows, item.sqlId, item.sqlKey);
        const return_cd = response?.[0]?.data?.[0]?.return_cd;

        if (return_cd === '40000' || return_cd === '40002') {
            alert('저장되었습니다.');
            if (onSuccess) onSuccess(response);
        } else {
            alert('저장 중 오류가 발생했습니다.');
            if (onError) onError(new Error('저장 실패'));
        }
    } catch (error) {
        console.error('저장 중 오류:', error);
        alert('저장 중 오류가 발생했습니다.');
        if (onError) onError(error);
    }
};

/**
 * 그리드 행 삭제 함수
 * @param id - 삭제할 행 ID
 * @param gridRef - 그리드 참조
 * @param sqlId - SQL ID
 * @param sqlKey - SQL 키
 * @param extraParams - 추가 파라미터
 * @param onSuccess - 성공 콜백
 */
export const handleRowDelete = async (
    id: string,
    gridRef: any,
    sqlId: string,
    sqlKey: string,
    extraParams?: Record<string, any>,
    onSuccess?: () => void
): Promise<void> => {
    if (!confirm('행을 삭제하시겠습니까?')) return;

    try {
        const row = gridRef.current.getRow(id);
        if (!row) throw new Error('삭제할 행을 찾을 수 없습니다');

        // 삭제 파라미터 생성
        const params = { ...extraParams };

        const items = [
            {
                sqlId,
                params: [{ sql_key: sqlKey, ...params }],
            },
        ];

        const response = await fetcherPostData(items);

        alert('삭제되었습니다.');
        if (onSuccess) onSuccess();
    } catch (error) {
        console.error('행 삭제 중 오류:', error);
        alert('행 삭제 중 오류가 발생했습니다');
    }
};

/**
 * 선택된 행을 삭제 표시합니다.
 * @param rows - 기존 행 데이터 배열
 * @param selectedRows - 선택된 행의 Set
 * @returns 삭제 표시된 새 행 배열
 */
export const markRowsForDeletion = <T extends GridRowData>(rows: T[], selectedRows: Set<string>): T[] => {
    return rows.map((row) => {
        if (selectedRows.has(row.id)) {
            return { ...row, action_type: 'd' };
        }
        return row;
    });
};
