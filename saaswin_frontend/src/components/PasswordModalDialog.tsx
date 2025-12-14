'use client';
import { Dialog, DialogContent } from '@mui/material';
import ResetCompleteForm from './ResetCompleteForm';
import { useState } from 'react';

interface ModalDialogProps {
    open: boolean;
    onClose: () => void;
    type: string;
    onBack: () => void;
    userId: string;
}

export default function ModalDialog({ open, onClose, type, onBack, userId }: ModalDialogProps) {
    return (
        <Dialog
            open={open}
            onClose={(event, reason) => {
                return; // 어떤 이유로든 닫히지 않도록 차단
            }}
            disableEscapeKeyDown={true} // ESC 키로 닫기 방지
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
                <ResetCompleteForm type={type} onClose={onClose} onBack={onBack} propUserId={userId} />
            </DialogContent>
        </Dialog>
    );
}
