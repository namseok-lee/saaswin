import React from 'react';
import { Box, Card, IconButton, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
interface FormButtonProps {
    title: string;
    onClick: () => void;
}

const FormButton: React.FC<FormButtonProps> = ({ title, onClick, form, handleShowDeleteSnackbar, type, index }) => {
    return (
        <Card
            variant='outlined'
            onClick={(e) => {
                // 삭제 버튼에서 이벤트가 시작되지 않았을 때만 onClick 실행
                if (!e.defaultPrevented) {
                    onClick(e);
                }
            }}
            sx={{
                display: 'flex',
                alignItems: 'center',
                width: '280px',
                height: '120px',
                padding: '16px',
                borderRadius: '12px',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                justifyContent: 'space-between',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EditIcon color='primary' sx={{ marginRight: 1 }} />
                <Typography variant='body1'>{title}</Typography>
            </Box>
            {form?.length > 1 && (
                <IconButton
                    onClick={(e) => {
                        e.stopPropagation(); // 카드 onClick 이벤트 전파 방지
                        e.preventDefault(); // 추가: 기본 이벤트도 방지
                        handleShowDeleteSnackbar(type, index);
                        return false; // 추가: 이벤트 전파를 확실히 중단
                    }}
                    sx={{
                        right: 8,
                        top: 8,
                        padding: '4px',
                        backgroundColor: '#F5F5F5',
                        borderRadius: '4px',
                        '&:hover': {
                            backgroundColor: '#E0E0E0',
                        },
                    }}
                >
                    <DeleteIcon />
                </IconButton>
            )}
        </Card>
    );
};
export default FormButton;
