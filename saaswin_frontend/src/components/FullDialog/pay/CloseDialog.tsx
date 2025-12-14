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

export default function CloseReview({ open, handleClose, handleDialogClose, saveData, setSaveData, updateSlry }) {
    const initialSaveDataRef = useRef(saveData);
    const handleExit = (isSave) => {
        // if (isSave) {
        //      updateSlry(saveData);
        // } else {
        //     setSaveData(initialSaveDataRef.current);
        // }

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
                            급여계산을 그만두고 나가시겠습니까?
                        </Typography>
                        <Typography align="center" sx={{ whiteSpace: 'pre-line' }}>
                            {`작성 중 나가기 버튼을 누르면 변경사항이 저장되지 않습니다.
                   저장 후 나가시겠습니까?`}
                        </Typography>
                    </Stack>
                    <Stack direction="row" spacing={2} sx={{ width: 1, justifyContent: 'flex-end' }}>
                        <Button onClick={handleClose} color="secondary" variant="outlined">
                            취소
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => {
                                handleExit(true);
                            }}
                            autoFocus
                        >
                            저장 후 나가기
                        </Button>
                        <Button
                            color="error"
                            variant="contained"
                            onClick={() => {
                                handleExit(false);
                            }}
                        >
                            나가기
                        </Button>
                    </Stack>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}

CloseReview.propTypes = {
    open: PropTypes.bool,
    handleClose: PropTypes.func,
    handleDialogClose: PropTypes.func,
    saveData: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    setSaveData: PropTypes.func,
};
