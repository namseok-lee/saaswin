// material-ui
import { Button, IconButton, Stack, Typography } from '@mui/material';
import Image from 'next/image';
type QuickMenuItem = {
    id: string;
    seq: string;
    link: string;
    title: string;
};

type QuickMenuInfo = QuickMenuItem[];

interface QuickMenuProps {
    quickMenuInfo: QuickMenuInfo;
    tpcdParam: string;
}
export default function QuickMenu({ quickMenuInfo, tpcdParam }: QuickMenuProps) {
    const scr_no = tpcdParam;
    const getImage = (id: string) => {
        switch (id) {
            case 'bsc':
                return '/images/id-card-24-dp-000-fill-0-wght-300-grad-0-opsz-241.svg';
            case 'addr':
                return '/images/phone-iphone-24-dp-000-fill-0-wght-300-grad-0-opsz-241.svg';
            case 'apnt':
                return '/images/order-approve-24-dp-000-fill-0-wght-300-grad-0-opsz-241.svg';
            case 'acbg':
                return '/images/school-24-dp-aac-1-f-0-fill-0-wght-300-grad-0-opsz-241.svg';
            case 'crr':
                return '/images/description-24-dp-000-fill-0-wght-300-grad-0-opsz-2411.svg';
            case 'qlfc':
                return '/images/license-24-dp-000-fill-0-wght-300-grad-0-opsz-241.svg';
            case 'lgsdy':
                return '/images/globe-book-24-dp-000-fill-0-wght-300-grad-0-opsz-241.svg';
            case 'duty':
                return '/images/work-history-24-dp-000-fill-0-wght-300-grad-0-opsz-241.svg';
            case 'wnawrdDspn':
                return '/images/summarize-24-dp-000-fill-0-wght-300-grad-0-opsz-241.svg';
            case 'edu':
                return '/images/history-edu-24-dp-000-fill-0-wght-300-grad-0-opsz-241.svg';
            case 'mltsvc':
                return '/images/military-tech-24-dp-000-fill-0-wght-300-grad-0-opsz-241.svg';
            case 'fam':
                return '/images/diversity-424-dp-000-fill-0-wght-300-grad-0-opsz-241.svg';
            case 'dsblty':
                return '/images/person-add-disabled-24-dp-000-fill-0-wght-300-grad-0-opsz-241.svg';
            case 'rwdptr':
                return '/images/flag-24-dp-000-fill-0-wght-300-grad-0-opsz-241.svg';
            default:
                return '/images/id-card-24-dp-000-fill-0-wght-300-grad-0-opsz-241.svg';
        }
    };

    return (
        <Stack
            direction='column'
            spacing={0.5}
            sx={{
                minWidth: '150px',
                borderRadius: 3,
                border: '3px solid',
                borderColor: 'primary.200',
                padding: '8px', // 내부 여백
            }}
        >
            {quickMenuInfo?.map((item, index) => (
                // <Tab key={index} label={item.title} value={item.type} />
                <Stack
                    key={index}
                    direction={'row'}
                    sx={{
                        backgroundColor: item.link.split('/').pop() === scr_no ? 'primary.50' : '',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                    }}
                >
                    <Button
                        component='a'
                        href={`${item.link}?user_no=WIN000031`}
                        fullWidth
                        size='small'
                        sx={{
                            display: 'flex', // 아이콘과 텍스트를 한 줄에 배치
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            textAlign: 'left', // 텍스트 정렬
                            color: '#000', // 버튼 텍스트 색상
                            '&:hover': {
                                backgroundColor: 'primary.50',
                            },
                            padding: '8px', // 버튼 내부 여백
                        }}
                    >
                        <Image
                            src={getImage(item.id)}
                            alt='Mask Group Icon'
                            style={{ filter: 'invert(50%)', marginRight: '8px' }} // 아이콘과 텍스트 간격
                            width={25}
                            height={25}
                        />
                        <Typography>{item.title}</Typography>
                    </Button>
                </Stack>
            ))}

            <IconButton
                sx={{
                    color: 'primary.700',
                }}
                onClick={() => {}}
            >
                <Image
                    src='/images/tune-24-dp-000-fill-0-wght-300-grad-0-opsz-241.svg'
                    alt='Mask Group Icon'
                    width={25}
                    height={25}
                />
            </IconButton>
        </Stack>
    );
}
