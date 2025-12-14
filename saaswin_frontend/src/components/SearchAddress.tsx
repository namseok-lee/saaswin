'use client';

import { Dialog, DialogTitle, IconButton, Stack } from '@mui/material';
import DaumPostcode from 'react-daum-postcode';
import CloseIcon from '@mui/icons-material/Close';
const SearchAddress = ({ modalOpen, setData, handleOpen }) => {
    const complateHandler = (data: any) => {
        setData((prevData) => ({
            ...prevData,
            zip: data?.zonecode || '', // 우편번호
            addr: data?.roadAddress || '', // 도로명 주소
            eng_addr: data?.roadAddressEnglish || '', // 영문 도로명 주소
        }));
    };

    const themeObj = {
        postcodeTextColor: '#FA7142',
        emphTextColor: '#333333',
    };
    return (
        <Dialog
            maxWidth="lg"
            onClose={() => handleOpen()}
            open={modalOpen}
            sx={{
                '& .MuiDialog-paper': {
                    width: '800px', // 원하는 너비
                    height: '450px', // 원하는 높이
                    p: 0,
                },
            }}
            aria-describedby="alert-dialog-slide-description"
            slotProps={{ backdrop: { style: { backgroundColor: 'rgba(255, 255, 255, 0.5)' } } }}
        >
            <Stack
                direction={'row'}
                sx={{ p: 2, alignItems: 'flex-end', justifyContent: 'space-between', background: '#a6bdf3' }}
            >
                <DialogTitle sx={{ fontWeight: 'bold', p: 0 }}>주소 등록</DialogTitle>
                <IconButton aria-label="close" onClick={handleOpen}>
                    <CloseIcon />
                </IconButton>
            </Stack>
            <DaumPostcode
                theme={themeObj}
                style={{ width: '100%', height: '100%' }}
                onComplete={(data) => {
                    complateHandler(data);
                    handleOpen();
                }}
            />
        </Dialog>
    );
};
export default SearchAddress;
