import * as XLSX from 'xlsx';

/**
 * JSON 데이터를 엑셀 파일로 다운로드합니다.
 * @param data - 엑셀로 변환할 데이터 배열
 * @param fileName - 다운로드할 파일 이름 (기본값: 'saaswin.xlsx')
 * @param sheetName - 엑셀 시트 이름 (기본값: 'Sheet1')
 */
export const downloadExcel = (data: any[], fileName: string = 'saaswin.xlsx', sheetName: string = 'Sheet1') => {
    if (!data || data.length === 0) {
        alert('데이터가 없습니다');
        return;
    }

    try {
        // 데이터 포맷팅 (필요한 경우 특정 필드 형식 변환)
        const formattedData = data.map((row) => ({
            ...row,
            isAdmin: typeof row.isAdmin === 'string' ? row.isAdmin === 'true' : Boolean(row.isAdmin),
        }));

        // 워크시트 생성
        const worksheet = XLSX.utils.json_to_sheet(formattedData);

        // 워크북 생성 및 워크시트 추가
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        // 파일로 저장
        XLSX.writeFile(workbook, fileName);
    } catch (error) {
        console.error('엑셀 다운로드 중 오류가 발생했습니다:', error);
        alert('엑셀 다운로드 중 오류가 발생했습니다');
    }
};

/**
 * 엑셀 파일을 JSON 데이터로 변환합니다.
 * @param file - 업로드된 엑셀 파일
 * @returns 파일 데이터를 파싱한 Promise
 */
export const parseExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error('파일이 선택되지 않았습니다'));
            return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const binaryStr = e.target?.result;
                const workbook = XLSX.read(binaryStr, { type: 'binary' });

                // 첫 번째 시트 데이터 가져오기
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // 시트를 JSON으로 변환
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true });
                const headers = jsonData[0] as string[];
                const rows = jsonData.slice(1) as any[][];

                // 데이터 포맷팅
                const formattedData = rows.map((row, rowIndex) => {
                    const rowObject: Record<string, any> = {};

                    headers.forEach((key, colIndex) => {
                        rowObject[key] = row[colIndex] || null;
                    });

                    // ID 필드 추가
                    rowObject.id = rowIndex + 1;
                    return rowObject;
                });

                resolve(formattedData);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsBinaryString(file);
    });
};

/**
 * 파일 업로드 이벤트 핸들러
 * @param event - 파일 업로드 이벤트
 * @param onSuccess - 성공 시 콜백 함수 (데이터를 인자로 받음)
 * @param onError - 실패 시 콜백 함수 (에러를 인자로 받음)
 */
export const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (data: any[]) => void,
    onError: (error: Error) => void = (error) => console.error(error)
) => {
    const file = event.target.files?.[0];

    if (!file) {
        onError(new Error('파일이 선택되지 않았습니다'));
        return;
    }

    parseExcelFile(file)
        .then(onSuccess)
        .catch((error) => {
            console.error('파일 파싱 중 오류가 발생했습니다:', error);
            onError(new Error('파일 파싱 중 오류가 발생했습니다'));
        });
};

/**
 * 데이터를 엑셀 파일로 내보내는 유틸리티 함수
 * (downloadExcel 함수의 래퍼로, 추가 기능 구현 가능)
 */
export const exportToExcel = async (data: any[]) => {
    if (!data || data.length === 0) {
        alert('데이터가 없습니다');
        return;
    }

    downloadExcel(data);
};
