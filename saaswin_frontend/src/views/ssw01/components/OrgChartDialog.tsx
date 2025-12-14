import React, { useEffect } from 'react';
import { AppBar, Dialog, DialogContent, IconButton, Stack, Toolbar, Typography } from '@mui/material';
import { CloseCircleTwoTone } from '@ant-design/icons';
import Button from 'components/Button';
import OrgChartPage from 'views/sys/obj_manage/OrgChartPage';
import { OrgChartMasterData } from 'views/sys/obj_manage/types';

interface OrgChartDialogProps {
    open: boolean;
    onClose: () => void;
    masterData?: OrgChartMasterData[] | null;
    isLoading: boolean;
    searchParams?: Record<string, unknown>;
}

const OrgChartDialog: React.FC<OrgChartDialogProps> = ({ open, onClose, masterData, isLoading, searchParams }) => {
    useEffect(() => {
        // console.log(masterData, searchParams);
    }, []);

    return (
        <Dialog fullScreen open={open} onClose={onClose} disableEscapeKeyDown={true} maxWidth='md'>
            <AppBar sx={{ position: 'sticky' }} color='inherit' elevation={1}>
                <Toolbar sx={{ position: 'relative' }}>
                    <Stack direction='row' alignItems='center' sx={{ marginRight: 'auto', maxWidth: '30%' }}>
                        <IconButton color='inherit' onClick={onClose} aria-label='close' sx={{ marginLeft: 'auto' }}>
                            <CloseCircleTwoTone style={{ fontSize: '30px' }} twoToneColor='#bfbfbf' />
                        </IconButton>
                        <Typography
                            sx={{
                                ml: 1,
                                mr: 1,
                                fontSize: '24px',
                                fontWeight: 'bold',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            조직도
                        </Typography>
                    </Stack>
                    <Stack direction='row' alignItems='center' spacing={1} sx={{ marginLeft: 'auto' }}>
                        <Button type='default' size='sm' onClick={onClose}>
                            나가기
                        </Button>
                    </Stack>
                </Toolbar>
            </AppBar>
            <DialogContent sx={{ overflow: 'hidden', paddingBottom: 2 }}>
                <OrgChartPage
                    dataPram={{}}
                    masterData={masterData ? masterData : []}
                    showInspector={true}
                    editable={true}
                    isLoading={isLoading}
                    searchParams={searchParams}
                    isDialog={true}
                />
            </DialogContent>
        </Dialog>
    );
};

export default OrgChartDialog;
