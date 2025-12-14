'use client';
import { Snackbar, Alert, Stack, Button } from '@mui/material';
import { fetcherPost } from 'utils/axios';
interface Props {
    validation: { open: boolean; message: string; type: 'single' | 'double' };
    setValidation: React.Dispatch<React.SetStateAction<{ open: boolean; message: string; type: 'single' | 'double' }>>;
    user_id: string;
}

export default function SnackbarAlert({ validation, setValidation, user_id, setStep }: Props) {
    const handleClose = (confirm = false) => {
        if (confirm && validation.type === 'double') {
            // "확인" 버튼을 눌렀을 때만 실행
            const item = { user_id: user_id };
            console.log('user_id 출력', item.user_id);
            fetcherPost(['/api/initial', item])
                .then(() => {
                    console.log('초기화 실행');
                })
                .catch((error) => {
                    console.log(error);
                });

            setStep('resetComplete');
        }

        // "취소" 버튼을 누른 경우에도 여기서 닫힘 (공통 처리)
        setValidation((prev) => ({ ...prev, open: false }));
    };

    return (
        <Snackbar open={validation.open} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} onClose={handleClose}>
            <Alert icon={false}>
                {validation.message}
                <Stack direction="row" spacing={2} sx={{ mt: 2, justifyContent: 'center' }}>
                    {validation.type === 'double' && <Button onClick={() => handleClose(false)}>취소</Button>}
                    <Button onClick={() => handleClose(true)}>확인</Button>
                </Stack>
            </Alert>
        </Snackbar>
    );
}
