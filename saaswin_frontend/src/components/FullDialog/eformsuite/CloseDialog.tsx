import PropTypes from 'prop-types';
// material-ui
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { mutate } from 'swr';
// project import

// assets

import LockFilled from '@ant-design/icons/LockFilled';
import { useRef } from 'react';

// ==============================|| CUSTOMER - DELETE ||============================== //

export default function CloseTemplate({ open, handleClose, handleDialogClose, saveData, setSaveData }) {
    const initialSaveDataRef = useRef(saveData);
    const handleExit = (isSave) => {
        if (isSave) {
            // updateReview(saveData);
        } else {
            setSaveData(initialSaveDataRef.current);
        }
        // mutate('/copyCoding/review/searchReview');
        handleClose();
        handleDialogClose();
    };
    return (
        <Dialog
            open={open}
            onClose={handleClose}
            keepMounted
            maxWidth="xs"
            fullWidth
            aria-labelledby="column-delete-title"
            aria-describedby="column-delete-description"
        >
            <DialogContent sx={{ mt: 2, my: 1 }}>
                <Stack alignItems="center" spacing={3.5}>
                    {/* <Avatar color="error" sx={{ width: 72, height: 72, fontSize: '1.75rem' }}>
                        <LockFilled />
                    </Avatar> */}
                    <Stack spacing={2}>
                        <Typography variant="h4" align="center">
                            창을 닫으시겠습니까?
                        </Typography>
                    </Stack>
                    <Stack direction="row" spacing={2} sx={{ width: 1, justifyContent: 'flex-end' }}>
                        <Button onClick={handleClose} color="secondary" variant="outlined">
                            취소
                        </Button>
                        <Button
                            color="error"
                            variant="contained"
                            onClick={() => {
                                handleExit(false);
                            }}
                        >
                            닫기
                        </Button>
                    </Stack>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}

CloseTemplate.propTypes = {
    open: PropTypes.bool,
    handleClose: PropTypes.func,
    handleDialogClose: PropTypes.func,
    saveData: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    setSaveData: PropTypes.func,
};
