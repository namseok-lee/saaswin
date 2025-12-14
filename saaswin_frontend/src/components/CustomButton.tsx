import { useTranslation } from 'react-i18next';
// import * as XLSX from 'xlsx'; // XLSX 직접 사용 제거
// excel.ts에서 파일 업로드 유틸리티 함수 import (이름 충돌 방지 위해 as 사용)
import { handleFileUpload as handleExcelUpload } from './Grid/utils/excel';
import Button from './Button';

interface CustomButtonItem {
    seq: string;
    text: string;
    type: string;
    sqlId: string;
}

// gridInfo 배열의 아이템 타입 정의 (가정)
interface GridInfoItem {
    id: string;
    header2?: string; // header2는 선택적일 수 있음
    type?: string; // 컬럼 타입 추가 (예: 'DATE', 'STRING', 'NUMBER')
}

interface CustomBtnProps {
    // masterUI 타입을 더 구체적으로 정의
    masterUI?: { grid_info?: GridInfoItem[] };
    customButton: CustomButtonItem | string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    clickEvent?: any; // clickEvent는 다양한 형태일 수 있어 일단 any 유지
    // setData 타입을 더 구체적으로 정의
    setData?: React.Dispatch<React.SetStateAction<Record<string, unknown>[]>>;
    className?: string;
}

const CustomButton = ({ masterUI, customButton, clickEvent, setData, className }: CustomBtnProps) => {
    // 다국어
    const { t } = useTranslation();

    const text = typeof customButton !== 'string' ? customButton.text : customButton;
    const isUpload = typeof customButton !== 'string' && customButton.type === 'GRID_UPLOAD';

    // excel.ts의 handleExcelUpload 성공 시 호출될 콜백 함수
    const handleUploadSuccess = (parsedData: Record<string, unknown>[]) => {
        // setData prop이 없는 경우 경고 출력 후 함수 종료
        if (!setData) {
            console.warn('setData prop is missing in CustomButton');
            return;
        }

        // masterUI에서 그리드 설정 정보 가져오기
        const gridInfo = masterUI?.grid_info;
        console.log(gridInfo);
        // 그리드 정보가 배열이 아니면 오류 알림 후 함수 종료
        if (!Array.isArray(gridInfo)) {
            alert('그리드 정보를 불러올 수 없습니다. 설정을 확인해주세요.');
            return;
        }

        // 그리드 헤더(header2)를 실제 데이터 키(id)와 타입(type)으로 매핑하는 객체 생성
        const headerToIdMap: { [key: string]: { id: string; type?: string } } = {};
        gridInfo.forEach((item: GridInfoItem) => {
            if (item.header2 && item.id) {
                // 타입 정보도 함께 저장
                headerToIdMap[item.header2] = { id: item.id, type: item.type };
            }
        });

        // 파싱된 데이터가 비어있는 경우 setData를 빈 배열로 설정하고 함수 종료
        if (parsedData.length === 0) {
            setData([]);
            return;
        }

        console.log(parsedData);

        // 오류 정보 저장 배열
        const invalidDateEntries: { headerKey: string; value: unknown; rowIndex: number }[] = [];

        // 파싱된 데이터를 그리드 형식에 맞게 변환
        const formattedData = parsedData.map((row: Record<string, unknown>, index: number) => {
            const rowObject: Record<string, unknown> = {};
            // const isRowValid = true; // isRowValid는 현재 사용되지 않음

            Object.keys(row).forEach((headerKey: string) => {
                // 'id' 키는 건너뜀 (별도 처리)
                if (headerKey === 'id') return;

                // 헤더 키에 해당하는 그리드 정보 조회 (ID 및 타입 포함)
                const gridMapping = headerToIdMap[headerKey];
                // 그리드 ID가 존재하면 해당 키로 값을 할당 (값이 없으면 빈 문자열로 변경)
                if (gridMapping) {
                    const gridId = gridMapping.id;
                    const gridType = gridMapping.type;
                    const value = row[headerKey];

                    // gridId가 'seq'인 경우 자동 채번
                    if (gridId === 'seq') {
                        rowObject[gridId] = index + 1; // 1부터 시작하는 순번
                    } else if (gridType === 'DATE') {
                        // 타입이 'DATE'인 경우
                        // value 타입을 string 또는 number로 확인
                        if (typeof value === 'string' || typeof value === 'number') {
                            const dateObj = new Date(value);
                            const timeVal = dateObj.getTime();

                            // new Date()로 변환 시 유효한 날짜인지 확인
                            // value가 빈 문자열이 아닌 경우에만 isNaN 검사 (null/undefined는 typeof 검사에서 걸러짐)
                            if (value !== '' && isNaN(timeVal)) {
                                // 오류 정보 저장
                                invalidDateEntries.push({ headerKey, value, rowIndex: index + 1 }); // 1-based index
                                rowObject[gridId] = ''; // 유효하지 않으면 빈 문자열로 처리
                            } else {
                                // 유효하거나 빈 값이면 그대로 할당
                                rowObject[gridId] = value;
                            }
                        } else if (value !== null && value !== undefined && value !== '') {
                            // string/number가 아니면서 비어있지 않은 값은 오류로 처리
                            invalidDateEntries.push({ headerKey, value, rowIndex: index + 1 });
                            rowObject[gridId] = '';
                        } else {
                            // null, undefined, 빈 문자열은 빈 값으로 처리
                            rowObject[gridId] = '';
                        }
                    } else {
                        // 'DATE' 타입이 아니면 기존 로직대로 값 할당 (nullish coalescing 제거, unknown 타입이므로 명시적 처리)
                        rowObject[gridId] = value !== null && value !== undefined ? value : '';
                    }
                }
            });
            // 각 행의 원본 'id' 값 유지
            rowObject.id = row.id;
            rowObject.isNew = true;
            return rowObject;
        });
        console.log(formattedData);

        // 변환된 데이터로 상태 업데이트
        setData(formattedData);

        // 잘못된 날짜 항목이 있으면 알림 표시
        if (invalidDateEntries.length > 0) {
            // 오류 메시지 생성
            let alertMessage = '다음 항목에서 잘못된 날짜 형식이 발견되어 빈 값으로 처리되었습니다:\n\n';
            const groupedErrors: { [key: string]: { value: unknown; rowIndices: number[] }[] } = {};

            // 오류를 열(headerKey) 기준으로 그룹화
            invalidDateEntries.forEach((entry) => {
                if (!groupedErrors[entry.headerKey]) {
                    groupedErrors[entry.headerKey] = [];
                }
                // 동일한 값에 대한 항목 찾기
                const valueEntry = groupedErrors[entry.headerKey].find((e) => e.value === entry.value);
                if (valueEntry) {
                    valueEntry.rowIndices.push(entry.rowIndex);
                } else {
                    groupedErrors[entry.headerKey].push({ value: entry.value, rowIndices: [entry.rowIndex] });
                }
            });

            // 그룹화된 오류로 메시지 구성
            Object.keys(groupedErrors).forEach((headerKey) => {
                alertMessage += `열 "${headerKey}":\n`;
                groupedErrors[headerKey].forEach((error) => {
                    alertMessage += `  - 값: "${error.value}", 행: ${error.rowIndices.join(', ')}\n`;
                });
            });

            alert(alertMessage);
        }
    };

    // excel.ts의 handleExcelUpload 실패 시 호출될 콜백 함수
    const handleUploadError = (error: Error) => {
        alert(`파일 업로드 중 오류 발생: ${error.message}`);
        // 필요 시 추가적인 에러 로깅 또는 사용자 알림 처리
    };

    // 파일 input의 onChange 핸들러
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const target = event.target;
        handleExcelUpload(event, handleUploadSuccess, handleUploadError);
        target.value = '';
    };

    return (
        <>
            <Button
                className='btnPrimary'
                size='md'
                onClick={isUpload ? undefined : clickEvent}
                // component={isUpload ? 'label' : 'button'}
                htmlFor={isUpload ? 'hidden-upload-input' : undefined}
                isUpload={isUpload}
            >
                {t(text)}
                {isUpload && (
                    <input
                        id='hidden-upload-input'
                        type='file'
                        accept='.xlsx, .xls, .csv'
                        hidden
                        onChange={handleFileChange}
                    />
                )}
            </Button>
        </>
    );
};

export default CustomButton;
