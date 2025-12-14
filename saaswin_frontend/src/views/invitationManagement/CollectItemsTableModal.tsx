import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Checkbox,
} from '@mui/material';

/** 테이블 각 행(Row)에 대한 타입 */
export interface TableRowData {
    id: number;
    항목: string;
    수집유형: string;
    초대시수집여부: boolean;
    가입필수응답: boolean;
}

/** 모달 컴포넌트에 전달할 Props */
interface CollectItemsTableModalProps {
    open: boolean; // 모달 열림 여부
    onClose: () => void; // 모달 닫기 함수
    tableData: TableRowData[]; // 현재 선택된 항목(또는 기본 항목)의 테이블 데이터
    onUpdateTableData: (newData: TableRowData[]) => void;
    // 체크박스 변경 시 부모로 전달할 콜백
}

const CollectItemsTableModal: React.FC<CollectItemsTableModalProps> = ({
    open,
    onClose,
    tableData,
    onUpdateTableData,
}) => {
    // 체크박스 토글 -> 부모 상태 갱신
    const handleCheckboxChange = (rowId: number, field: '초대시수집여부' | '가입필수응답') => {
        const newData = tableData.map((row) => (row.id === rowId ? { ...row, [field]: !row[field] } : row));
        onUpdateTableData(newData);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>항목 상세 설정</DialogTitle>
            <DialogContent>
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ width: '25%' }}>항목</TableCell>
                                <TableCell sx={{ width: '25%' }}>수집 유형</TableCell>
                                <TableCell sx={{ width: '25%' }}>초대 시 수집 여부</TableCell>
                                <TableCell sx={{ width: '25%' }}>가입 필수 응답</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tableData.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell>{row.항목}</TableCell>
                                    <TableCell>{row.수집유형}</TableCell>
                                    <TableCell>
                                        <Checkbox
                                            size="small"
                                            checked={row.초대시수집여부}
                                            onChange={() => handleCheckboxChange(row.id, '초대시수집여부')}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Checkbox
                                            size="small"
                                            checked={row.가입필수응답}
                                            onChange={() => handleCheckboxChange(row.id, '가입필수응답')}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="contained">
                    저장
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CollectItemsTableModal;
