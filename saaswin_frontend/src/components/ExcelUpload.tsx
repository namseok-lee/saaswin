import * as XLSX from 'xlsx';
import { Button } from '@mui/material';
interface ExcelUploaderProps<T> {
    setData: React.Dispatch<React.SetStateAction<T>>; // 상태 업데이트 함수 타입
}
const ExcelUploader = <T,>({ setData }: ExcelUploaderProps<T>) => {
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            alert('No file selected');
            return;
        }
        const reader = new FileReader();

        reader.onload = (e) => {
            const binaryStr = e.target?.result;
            const workbook = XLSX.read(binaryStr, { type: 'binary' });

            // 첫 번째 시트 데이터 가져오기
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // 시트를 JSON으로 변환
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true });
            // 첫 번째 행은 컬럼명으로 사용
            const headers = jsonData[0]; // 첫 번째 행(헤더)
            const rows = jsonData.slice(1); // 데이터 행들
            const formattedData = rows.map((row: any[], rowIndex: number) => {
                const rowObject: any = {};
                headers.forEach((key: string, colIndex: number) => {
                    rowObject[key] = row[colIndex] || null; // 키에 값 매핑
                });
                rowObject.id = rowIndex + 1; // 고유 ID 추가
                return rowObject;
            });
            setData(formattedData);
        };

        reader.readAsBinaryString(file);
    };

    return (
        <div style={{ padding: '20px' }}>
            <Button variant="contained" component="label">
                업로드
                <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    hidden
                    onChange={(e) => {
                        handleFileUpload(e);
                    }}
                />
            </Button>
        </div>
    );
};

export default ExcelUploader;
