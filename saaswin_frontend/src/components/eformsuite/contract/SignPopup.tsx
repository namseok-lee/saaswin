import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Tabs, Tab, Box, TextField } from '@mui/material';
import SignatureCanvas from 'react-signature-canvas';

interface SignPopupProps {
    open: boolean;
    onClose: () => void;
    onSave: (signImage: string) => void;
}

const SignPopup: React.FC<SignPopupProps> = ({ open, onClose, onSave }) => {
    const signatureRef = useRef<SignatureCanvas | null>(null);
    const [value, setValue] = useState(0); // Tab 값 관리

    // 팝업이 열릴 때마다 캔버스 클리어 (재사용시 이전 사인이 남지 않도록)
    useEffect(() => {
        if (open && signatureRef.current) {
            signatureRef.current.clear();
        }
    }, [open]);

    // 사인 캔버스를 초기화
    const clearSignature = () => {
        signatureRef.current?.clear();
    };

    const handleSave = () => {
        if (signatureRef.current && !signatureRef.current.isEmpty()) {
            const signImage = signatureRef.current.toDataURL('image/png');
            onSave(signImage);
            onClose();
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>사인 입력</DialogTitle>
            <DialogContent>
                <Tabs value={value} onChange={handleTabChange} aria-label="사인, 이름, 도장 탭">
                    <Tab label="사인" />
                    <Tab label="이름" />
                    <Tab label="도장" />
                </Tabs>

                <Box
                    role="tabpanel"
                    hidden={value !== 0}
                    id="simple-tabpanel-0"
                    aria-labelledby="simple-tab-0"
                    sx={{ padding: 2, display: value === 0 ? 'block' : 'none' }}
                >
                    <SignatureCanvas
                        ref={signatureRef}
                        penColor="black"
                        minWidth={3}
                        maxWidth={3}
                        canvasProps={{ width: 500, height: 200, className: 'sigCanvas' }}
                    />
                </Box>

                <Box
                    role="tabpanel"
                    hidden={value !== 1}
                    id="simple-tabpanel-1"
                    aria-labelledby="simple-tab-1"
                    sx={{ padding: 2, display: value === 1 ? 'block' : 'none' }}
                >
                    {/* 이름 입력 필드 */}
                    <TextField label="이름" fullWidth />
                </Box>

                <Box
                    role="tabpanel"
                    hidden={value !== 2}
                    id="simple-tabpanel-2"
                    aria-labelledby="simple-tab-2"
                    sx={{ padding: 2, display: value === 2 ? 'block' : 'none' }}
                >
                    {/* 도장 입력 필드 */}
                    <TextField label="도장" fullWidth />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={clearSignature} color="primary">
                    초기화
                </Button>
                <Button onClick={handleSave} color="primary">
                    완료
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SignPopup;
