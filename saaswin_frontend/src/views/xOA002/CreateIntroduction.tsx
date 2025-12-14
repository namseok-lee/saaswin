'use client';
import { IcoInfo } from '@/assets/Icon';
import Button from '@/components/Button';
import Switch from '@/components/Switch';
import { Box, Modal, Stack, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';

export default function CreateIntroduction({ open, onClose }: { open: boolean; onClose: () => void }) {
    const [isChecked, setIsChecked] = useState(false);
    return (
        <Modal
            open={open}
            onClose={() => {}} // 닫기 방지
            disableEscapeKeyDown // ESC 키 무효
            hideBackdrop // 백드롭 제거
            disableAutoFocus
            disableEnforceFocus
            disableRestoreFocus
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '30%',
                    left: '50%',
                    transform: 'translate(-50%, -30%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    border: '1px solid #ccc',
                    boxShadow: 3,
                    p: 3,
                }}
            >
                <Stack direction='row' alignItems='center' spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', pt: '2px' }}>
                        <Switch id='switch' checked={isChecked} onChange={setIsChecked} />
                    </Box>
                    <Typography variant='body1'>내 소개 (0/5)</Typography>
                    <Tooltip
                        title='구성원들에게 보여줄 내 소개를 만들어 보세요. off시 작성된 내용은 나만 볼 수 있습니다.'
                        placement='right'
                        slotProps={{
                            tooltip: {
                                sx: {
                                    backgroundColor: '#e1f5fc',
                                    color: '#000',
                                    fontSize: '0.875rem',
                                    border: '1px solid #90caf9',
                                },
                            },
                        }}
                    >
                        <Box component='span'>
                            <IcoInfo />
                        </Box>
                    </Tooltip>
                </Stack>
                <Stack direction='row' justifyContent='center' alignItems='center' spacing={2}>
                    <Button
                        id='btnPrmary1'
                        type='primary'
                        size='lg'
                        className='btnWithIcon'
                        onClick={() => {
                            onClose();
                        }}
                    >
                        저장하기
                    </Button>
                </Stack>
            </Box>
        </Modal>
    );
}
