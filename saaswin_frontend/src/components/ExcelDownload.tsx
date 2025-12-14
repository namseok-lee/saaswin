import * as XLSX from 'xlsx';
import { Button } from '@mui/material';

const ExcelDownloader = ({ data }) => {
    const downloadExcel = (data) => {
        const formattedData = data.map((row) => ({
            ...row,
            isAdmin: row.isAdmin === 'true' || row.isAdmin === true ? true : false,
        }));

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

        XLSX.writeFile(workbook, 'saaswin.xlsx');
    };

    return (
        <div style={{ padding: '20px' }}>
            <Button
                variant="contained"
                component="label"
                onClick={() => {
                    downloadExcel(data);
                }}
            >
                다운로드
            </Button>
        </div>
    );
};

export default ExcelDownloader;
