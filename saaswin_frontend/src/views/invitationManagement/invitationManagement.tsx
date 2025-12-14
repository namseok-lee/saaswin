import React, { useState } from 'react';
import { Box, Typography, Paper, Button, IconButton, Divider, TextField } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CollectItemsTableModal, { TableRowData } from './CollectItemsTableModal';

const TABLE_DATA = [
    {
        id: 1,
        항목: '개인 연락처',
        수집유형: '입력',
        초대시수집여부: true,
        가입필수응답: false,
    },
    {
        id: 2,
        항목: '거주지 주소',
        수집유형: '입력',
        초대시수집여부: false,
        가입필수응답: true,
    },
    {
        id: 3,
        항목: '주민등록번호',
        수집유형: '입력',
        초대시수집여부: false,
        가입필수응답: false,
    },
    {
        id: 4,
        항목: '급여계좌',
        수집유형: '센터/입력',
        초대시수집여부: true,
        가입필수응답: false,
    },
    {
        id: 5,
        항목: '국적',
        수집유형: '입력',
        초대시수집여부: false,
        가입필수응답: false,
    },
    {
        id: 6,
        항목: '영문 이름',
        수집유형: '입력',
        초대시수집여부: false,
        가입필수응답: false,
    },
    {
        id: 7,
        항목: '신분증 사본',
        수집유형: '업로드',
        초대시수집여부: false,
        가입필수응답: false,
    },
    {
        id: 8,
        항목: '주민등록등본',
        수집유형: '업로드',
        초대시수집여부: true,
        가입필수응답: true,
    },
    {
        id: 9,
        항목: '통장 사본',
        수집유형: '업로드',
        초대시수집여부: false,
        가입필수응답: false,
    },
    {
        id: 10,
        항목: '건강보험자격득실확인서',
        수집유형: '업로드',
        초대시수집여부: false,
        가입필수응답: false,
    },
    {
        id: 11,
        항목: '경력증명서',
        수집유형: '업로드',
        초대시수집여부: false,
        가입필수응답: false,
    },
    {
        id: 12,
        항목: '학력증명서',
        수집유형: '업로드',
        초대시수집여부: false,
        가입필수응답: false,
    },
];

/** 각 항목(Item)마다 별도의 테이블을 갖도록 함 */
type ItemType = {
    name: string; // 버튼 라벨
    isEditing: boolean; // 인라인 편집 여부
    tableData: TableRowData[]; // 이 항목만의 테이블 데이터
};

export default function InviteManagement() {
    // 1) 기본 수집 항목
    const [collectItemName, setCollectItemName] = useState('기본 수집 항목');
    // 이름 설정
    const [isEditingCollectItem, setIsEditingCollectItem] = useState(false);

    // "기본 수집 항목"도 12개 행이 있는 테이블을 가짐
    const [collectItemTable, setCollectItemTable] = useState<TableRowData[]>(
        TABLE_DATA.map((row) => ({ ...row })) // 초기 복사
    );

    // 2) 추가되는 항목들
    const [items, setItems] = useState<ItemType[]>([]);
    const [count, setCount] = useState(1); // 새 항목 번호

    // 3) 모달 열림 제어
    const [openModal, setOpenModal] = useState(false);
    // 4) 현재 어떤 항목의 모달을 열고 있는지 구분 (null = 기본 수집 항목)
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    // ---------------------------------------------------------
    //   "양식 추가하기" -> 새 항목(12개 행) 생성
    // ---------------------------------------------------------
    const handleAddItem = () => {
        const newName = `수집 항목 양식 ${count}`;
        // 새 항목도 12개 행을 복사해서 가짐
        const newTable = TABLE_DATA.map((row) => ({ ...row }));

        const newItem: ItemType = {
            name: newName,
            isEditing: false,
            tableData: newTable,
        };

        setItems((prev) => [...prev, newItem]);
        setCount((prev) => prev + 1);
    };

    // 항목 삭제
    const handleDeleteItem = (index: number) => {
        setItems((prev) => prev.filter((_, i) => i !== index));
    };

    // 항목 이름 편집 토글
    const toggleEditItem = (index: number) => {
        setItems((prev) => {
            const newArr = [...prev];
            newArr[index].isEditing = !newArr[index].isEditing;
            return newArr;
        });
    };

    // 항목 이름 변경
    const handleChangeItemName = (index: number, newName: string) => {
        setItems((prev) => {
            const newArr = [...prev];
            newArr[index].name = newName;
            return newArr;
        });
    };

    //   모달 열기 기본 항목
    const openDialogForCollectItem = () => {
        setSelectedIndex(null); // 기본 수집 항목
        setOpenModal(true);
    };

    // 모달 열기 추가 항목
    const openDialogForItem = (index: number) => {
        setSelectedIndex(index); // items[index]
        setOpenModal(true);
    };

    //   모달에서 체크박스 변경 -> 부모 상태 갱신
    const handleUpdateTableData = (newData: TableRowData[]) => {
        if (selectedIndex === null) {
            // 기본 수집 항목 테이블 변경
            setCollectItemTable(newData);
        } else {
            // items[selectedIndex] 테이블 변경
            setItems((prev) => {
                const newArr = [...prev];
                newArr[selectedIndex].tableData = newData;
                return newArr;
            });
        }
    };

    // 현재 모달에 표시해야 할 tableData
    let currentTableData: TableRowData[] = [];
    if (selectedIndex === null) {
        currentTableData = collectItemTable;
    } else {
        currentTableData = items[selectedIndex].tableData;
    }

    return (
        <Box sx={{ p: 2 }}>
            {/* 상단 타이틀 & 구분선 */}
            <Typography variant="h5" gutterBottom>
                초대 관리
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {/* 연한 회색 배경의 카드 형태 */}
            <Paper
                sx={{
                    p: 2,
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px',
                }}
            >
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    구성원 초대 시 수집 항목 관리
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                    구성원이 초대 메일을 받고 첫 가입 전, 제출하는 항목을 관리합니다.
                </Typography>

                {/* 기본 수집 항목 (버튼 + 수정) */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    {isEditingCollectItem ? (
                        <TextField
                            value={collectItemName}
                            onChange={(e) => setCollectItemName(e.target.value)}
                            size="small"
                            onBlur={() => setTimeout(() => setIsEditingCollectItem(false), 200)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.target.blur();
                                }
                            }}
                            autoFocus
                            sx={{ width: '200px' }}
                        />
                    ) : (
                        // 버튼 클릭 -> 모달 (기본 항목)
                        <Button
                            variant="outlined"
                            size="small"
                            sx={{ width: '200px' }}
                            onClick={openDialogForCollectItem}
                        >
                            {collectItemName}
                        </Button>
                    )}
                    <IconButton size="small" onClick={() => setIsEditingCollectItem((prev) => !prev)}>
                        <EditIcon fontSize="small" />
                    </IconButton>
                </Box>

                {/* 추가된 항목들 */}
                {items.map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        {item.isEditing ? (
                            <TextField
                                value={item.name}
                                onChange={(e) => handleChangeItemName(index, e.target.value)}
                                size="small"
                                onBlur={() => toggleEditItem(index)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.target.blur();
                                    }
                                }}
                                autoFocus
                                sx={{ width: '200px' }}
                            />
                        ) : (
                            // 버튼 클릭 -> 모달 (이 항목의 테이블)
                            <Button
                                variant="outlined"
                                size="small"
                                sx={{ width: '200px' }}
                                onClick={() => openDialogForItem(index)}
                            >
                                {item.name}
                            </Button>
                        )}
                        <IconButton
                            size="small"
                            onMouseDown={(e) => {
                                e.preventDefault(); // 포커스 이동을 방지 -> onBlur 동작 X
                                toggleEditItem(index);
                            }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteItem(index)}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Box>
                ))}

                {/* 양식 추가하기 버튼 */}
                <Button variant="contained" onClick={handleAddItem} sx={{ width: '100%', height: '36px', mt: 2 }}>
                    양식 추가하기
                </Button>
            </Paper>

            {/* 모달 (항목별로 다른 tableData) */}
            <CollectItemsTableModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                tableData={currentTableData}
                onUpdateTableData={handleUpdateTableData}
            />
        </Box>
    );
}
