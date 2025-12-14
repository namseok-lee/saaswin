// 필수 정보 입력용 모달 컴포넌트 생성
import { Dialog, DialogContent } from '@mui/material';
// import EssentialInfoForm from './EssentialInfoForm'; // 새로 생성할 필수 정보 입력 폼 컴포넌트

interface EssentialInfoModalProps {
    open: boolean;
    onClose: () => void;
}

export default function EssentialInfoModal({ open, onClose }: EssentialInfoModalProps) {
    return (
        <Dialog
            open={open}
            onClose={(event, reason) => {
                return; // 어떤 이유로든 닫히지 않도록 차단
            }}
            disableEscapeKeyDown={true}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    maxHeight: '90vh',
                    overflow: 'hidden',
                },
            }}
        >
            <DialogContent sx={{ overflow: 'hidden', paddingBottom: 2 }}>
                {/* <EssentialInfoForm onClose={onClose} /> */}
            </DialogContent>
        </Dialog>
    );
}
