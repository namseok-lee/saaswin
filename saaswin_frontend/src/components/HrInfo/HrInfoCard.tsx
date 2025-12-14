'use client';
import { Box, Card, CardContent, Chip, Divider, IconButton, Stack, Typography } from '@mui/material';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import dayjs from 'dayjs';
import { Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getBirthInfo, maskRrno, calculateWorkDuration, formatPhoneNumber } from 'utils/formatData/index';
interface Item {
    seq: string;
    title: string;
    type: string;
    link: string;
}

// CustomCard 컴포넌트 정의
interface CustomCardProps {
    item: Item;
    data: Record<string, any>;
}
export default function HrInfoCard({ item, data }: CustomCardProps) {
    const title = item.title;
    const type = item.type;
    const link = item.link;
    const {
        user_info, // 인적사항
        apnt_info: apntInfo, // 발령정보
        acbg_info: acbgInfo, // 학력정보
        crr_info: crrInfo, // 경력정보
        qlfc_info: qlfcInfo, // 자격정보
        lgsdy_info: lgsdyInfo, // 어학정보
        duty_info: dutyInfo, // 직무정보
        wnawd_info: wnawdInfo, // 포상정보
        dspn_info: dspnInfo, // 징계정보
        edu_info: eduInfo, // 교육정보
        mltsvc_info, // 병역정보
        fam_info: famInfo, // 가족정보
        dsblty_info: dsbltyInfo, // 장애정보
        rwdptr_info: rwdptrInfo, // 보훈정보
    } = data || {};

    const userInfo = user_info ? user_info : {};
    const mltsvcInfo = mltsvc_info ? mltsvc_info[0] : {};
    const handleClick = () => {
        console.log(item);
    };

    function renderComponent(type: string) {
        switch (type) {
            case 'tom_bsc': // 인적사항
                return (
                    <>
                        <Stack
                            direction={'row'}
                            sx={{ mb: 1, justifyContent: 'space-between', alignItems: 'center' }}
                            spacing={1}
                        >
                            <Stack direction={'row'} sx={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                                <IconButton onClick={() => {}} sx={{ justifyContent: 'flex-start' }}>
                                    <Box
                                        sx={{
                                            backgroundColor: 'primary.400', // 원형 배경색
                                            width: '40px', // 원형의 너비 (조정 가능)
                                            height: '40px', // 원형의 높이 (조정 가능)
                                            borderRadius: '50%', // 원형으로 만들기
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Image
                                            src="/images/id-card-24-dp-000-fill-0-wght-300-grad-0-opsz-241.svg"
                                            alt="Mask Group Icon"
                                            width={25}
                                            height={25}
                                        />
                                    </Box>
                                </IconButton>
                                <Typography sx={{ fontWeight: 'bold' }}>{title}</Typography>
                            </Stack>
                            <Stack direction={'row'} sx={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                                <ChevronRightIcon />
                            </Stack>
                        </Stack>
                        <Stack direction={'row'} sx={{ mb: 1 }} spacing={1}>
                            <Typography variant="h5" fontWeight={'bold'}>
                                {userInfo?.flnm}
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 'normal' }}>
                                |
                            </Typography>
                            <Typography variant="h5" fontWeight={'bold'}>
                                {userInfo.eng_flnm}
                            </Typography>
                        </Stack>
                        <Stack direction={'row'} sx={{ mb: 1 }} spacing={1}>
                            <Typography variant="h5" fontWeight={'bold'}>
                                만 {getBirthInfo(userInfo?.rrno, 'age')}세
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 'normal' }}>
                                |
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 'normal' }}>
                                양력 {getBirthInfo(userInfo?.rrno, 'birthDate')}
                            </Typography>
                        </Stack>
                        <Stack direction={'row'} sx={{ mb: 1, alignItems: 'center' }} spacing={1}>
                            <Chip label="주민번호" sx={{ height: '20px', fontSize: '0.875rem', lineHeight: '28px' }} />
                            <Typography sx={{ lineHeight: '28px' }}>{maskRrno(userInfo?.rrno)}</Typography>
                        </Stack>
                        <Stack direction={'row'} sx={{ mb: 1, alignItems: 'center' }} spacing={1}>
                            <Chip
                                label="국적"
                                size="small"
                                sx={{ height: '20px', fontSize: '0.875rem', lineHeight: '28px' }}
                            />
                            <Typography sx={{ lineHeight: '28px' }}>대한민국</Typography>
                        </Stack>
                        <Stack direction={'row'} sx={{ mb: 1, alignItems: 'center' }} spacing={1}>
                            <Chip
                                label="입사일"
                                size="small"
                                sx={{ height: '20px', fontSize: '0.875rem', lineHeight: '28px' }}
                            />
                            <Typography sx={{ lineHeight: '28px' }}>
                                {dayjs(userInfo?.jncmp_ymd).format('YYYY.MM.DD')}
                            </Typography>
                        </Stack>
                    </>
                );
            case 'addr': // 주소/연락처
                return (
                    <>
                        <Stack
                            direction={'row'}
                            sx={{ mb: 1, justifyContent: 'space-between', alignItems: 'center' }}
                            spacing={1}
                        >
                            <Stack direction={'row'} sx={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                                <IconButton onClick={() => {}} sx={{ justifyContent: 'flex-start' }}>
                                    <Box
                                        sx={{
                                            backgroundColor: 'primary.400', // 원형 배경색
                                            width: '40px', // 원형의 너비 (조정 가능)
                                            height: '40px', // 원형의 높이 (조정 가능)
                                            borderRadius: '50%', // 원형으로 만들기
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Image
                                            src="/images/phone-iphone-24-dp-000-fill-0-wght-300-grad-0-opsz-241.svg"
                                            alt="Mask Group Icon"
                                            width={25}
                                            height={25}
                                        />
                                    </Box>
                                </IconButton>
                                <Typography sx={{ fontWeight: 'bold' }}>{title}</Typography>
                            </Stack>
                            <Stack direction={'row'} sx={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                                <ChevronRightIcon />
                            </Stack>
                        </Stack>
                        <Stack direction={'row'} sx={{ mb: 1, alignItems: 'center' }} spacing={1}>
                            <Chip
                                label="주소"
                                size="small"
                                sx={{ height: '20px', fontSize: '0.875rem', lineHeight: '28px' }}
                            />
                            <Typography variant="h5" sx={{ fontWeight: 'normal', lineHeight: '28px' }}>
                                |
                            </Typography>
                            <Typography sx={{ lineHeight: '28px' }}> 06109</Typography>
                        </Stack>
                        <Stack direction={'row'} sx={{ mb: 1 }}>
                            <Typography variant="h5" fontWeight={'bold'}>
                                {userInfo?.addr}
                            </Typography>
                        </Stack>
                        <Stack direction={'row'} sx={{ mb: 1, alignItems: 'center' }} spacing={1}>
                            <Chip
                                label="이메일"
                                size="small"
                                sx={{ height: '20px', fontSize: '0.875rem', lineHeight: '28px' }}
                            />
                            <Typography sx={{ lineHeight: '28px' }}>{data.user_id}</Typography>
                        </Stack>
                        <Stack direction={'row'} sx={{ mb: 1, alignItems: 'center' }} spacing={1}>
                            <Chip
                                label="개인번호"
                                size="small"
                                sx={{ height: '20px', fontSize: '0.875rem', lineHeight: '28px' }}
                            />
                            <Typography sx={{ lineHeight: '28px' }}>{formatPhoneNumber(userInfo?.telno)}</Typography>
                        </Stack>
                        <Stack direction={'row'} sx={{ mb: 1, alignItems: 'center' }} spacing={1}>
                            <Chip
                                label="내선번호"
                                size="small"
                                sx={{ height: '20px', fontSize: '0.875rem', lineHeight: '28px' }}
                            />
                            <Typography sx={{ lineHeight: '28px' }}>{userInfo?.co_telno}</Typography>
                        </Stack>
                    </>
                );
            case 'tom_apnt': // 발령
                return (
                    <>
                        <Stack
                            direction={'row'}
                            sx={{ mb: 1, justifyContent: 'space-between', alignItems: 'center' }}
                            spacing={1}
                        >
                            <Stack direction={'row'} sx={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                                <IconButton onClick={() => {}} sx={{ justifyContent: 'flex-start' }}>
                                    <Box
                                        sx={{
                                            backgroundColor: 'primary.400', // 원형 배경색
                                            width: '40px', // 원형의 너비 (조정 가능)
                                            height: '40px', // 원형의 높이 (조정 가능)
                                            borderRadius: '50%', // 원형으로 만들기
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Image
                                            src="/images/order-approve-24-dp-000-fill-0-wght-300-grad-0-opsz-241.svg"
                                            alt="Mask Group Icon"
                                            width={25}
                                            height={25}
                                        />
                                    </Box>
                                </IconButton>
                                <Typography sx={{ fontWeight: 'bold' }}>{title}</Typography>
                            </Stack>
                            <Stack direction={'row'} sx={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                                <ChevronRightIcon />
                            </Stack>
                        </Stack>
                        {apntInfo?.map((item, index) => (
                            <Fragment key={index}>
                                <Stack direction={'column'} sx={{ mb: 1 }} spacing={1}>
                                    <Typography variant="h5" sx={{ fontWeight: 'normal' }}>
                                        {dayjs(item.apnt_ymd).format('YYYY.MM.DD')}
                                    </Typography>
                                    <Stack direction={'row'} sx={{ mb: 1 }} spacing={1}>
                                        <Typography variant="h5" fontWeight="bold">
                                            {item.apnt_type === 'cm001'
                                                ? '채용'
                                                : item.apnt_type === 'cm002'
                                                ? '퇴직'
                                                : item.apnt_type === 'cm003'
                                                ? '보직'
                                                : item.apnt_type === 'cm004'
                                                ? '승진'
                                                : item.apnt_type === 'cm005'
                                                ? '대기'
                                                : item.apnt_type === 'cm006'
                                                ? '휴직'
                                                : item.apnt_type === 'cm007'
                                                ? '휴직해제'
                                                : item.apnt_type === 'cm008'
                                                ? '파견'
                                                : item.apnt_type === 'cm009'
                                                ? '복귀'
                                                : item.apnt_type === 'cm010'
                                                ? '이동'
                                                : '기타'}
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 'normal' }}>
                                            |
                                        </Typography>
                                        <Typography variant="h5" fontWeight="bold">
                                            {item.hq}
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 'normal' }}>
                                            |
                                        </Typography>
                                        <Typography variant="h5" fontWeight="bold">
                                            {item.apnt_jbttl === 'cm001'
                                                ? 'CEO'
                                                : item.apnt_jbttl === 'cm002'
                                                ? 'CFO'
                                                : item.apnt_jbttl === 'cm003'
                                                ? 'COO'
                                                : item.apnt_jbttl === 'cm004'
                                                ? '사업부장'
                                                : item.apnt_jbttl === 'cm005'
                                                ? '본부장'
                                                : item.apnt_jbttl === 'cm006'
                                                ? '실장'
                                                : item.apnt_jbttl === 'cm007'
                                                ? '팀장'
                                                : item.apnt_jbttl === 'cm008'
                                                ? '파트장'
                                                : item.apnt_jbttl === 'cm009'
                                                ? '팀원'
                                                : '기타'}{' '}
                                            ㆍ {item.apnt_jbgd}
                                        </Typography>
                                    </Stack>
                                </Stack>
                                {apntInfo.length !== index + 1 ? <Divider sx={{ mt: 1, mb: 1 }} /> : null}
                            </Fragment>
                        ))}
                    </>
                );

            case 'tom_acbg': // 학력
                return (
                    <>
                        <Stack
                            direction={'row'}
                            sx={{ mb: 1, justifyContent: 'space-between', alignItems: 'center' }}
                            spacing={1}
                        >
                            <Stack direction={'row'} sx={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                                <IconButton onClick={() => {}} sx={{ justifyContent: 'flex-start' }}>
                                    <Box
                                        sx={{
                                            backgroundColor: 'primary.400', // 원형 배경색
                                            width: '40px', // 원형의 너비 (조정 가능)
                                            height: '40px', // 원형의 높이 (조정 가능)
                                            borderRadius: '50%', // 원형으로 만들기
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Image
                                            src="/images/school-24-dp-aac-1-f-0-fill-0-wght-300-grad-0-opsz-241.svg"
                                            alt="Mask Group Icon"
                                            width={25}
                                            height={25}
                                        />
                                    </Box>
                                </IconButton>
                                <Typography sx={{ fontWeight: 'bold' }}>{title}</Typography>
                            </Stack>
                            <Stack direction={'row'} sx={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                                <ChevronRightIcon />
                            </Stack>
                        </Stack>
                        {acbgInfo.map((item, index) => (
                            <Fragment key={index}>
                                <Stack direction={'row'} sx={{ mb: 1 }} spacing={1}>
                                    <Typography variant="h5" fontWeight={'bold'}>
                                        {item.acbg}
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 'normal' }}>
                                        |
                                    </Typography>
                                    <Typography variant="h5" fontWeight={'bold'}>
                                        {item.schl}
                                    </Typography>
                                </Stack>
                                <Stack direction={'row'} sx={{ mb: 1, alignItems: 'center' }} spacing={1}>
                                    <Chip
                                        label="졸업년월"
                                        size="small"
                                        sx={{ height: '20px', fontSize: '0.875rem', lineHeight: '28px' }}
                                    />
                                    <Typography sx={{ lineHeight: '28px' }}>{item.grdtn_ym}</Typography>
                                </Stack>
                                <Stack direction={'row'} sx={{ mb: 1, alignItems: 'center' }} spacing={1}>
                                    <Chip
                                        label="전공"
                                        size="small"
                                        sx={{ height: '20px', fontSize: '0.875rem', lineHeight: '28px' }}
                                    />
                                    <Typography sx={{ lineHeight: '28px' }}>{item.mjr} **전공</Typography>
                                </Stack>
                                <Stack direction={'row'} sx={{ mb: 1, alignItems: 'center' }} spacing={1}>
                                    <Chip
                                        label="부전공"
                                        size="small"
                                        sx={{ height: '20px', fontSize: '0.875rem', lineHeight: '28px' }}
                                    />
                                    <Typography sx={{ lineHeight: '28px' }}>{item.mnr_mjr} **부전공</Typography>
                                </Stack>
                                <Stack direction={'row'} sx={{ mb: 1, alignItems: 'center' }} spacing={1}>
                                    <Chip
                                        label="평균학점"
                                        size="small"
                                        sx={{ height: '20px', fontSize: '0.875rem', lineHeight: '28px' }}
                                    />
                                    <Typography sx={{ lineHeight: '28px' }}>{item.gpa} ** </Typography>
                                </Stack>
                                {acbgInfo.length !== index + 1 ? <Divider sx={{ mt: 1, mb: 1 }} /> : null}
                            </Fragment>
                        ))}
                    </>
                );

            case 'tom_crr': // 경력
                return (
                    <>
                        <Stack
                            direction={'row'}
                            sx={{ mb: 1, justifyContent: 'space-between', alignItems: 'center' }}
                            spacing={1}
                        >
                            <Stack direction={'row'} sx={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                                <IconButton onClick={() => {}} sx={{ justifyContent: 'flex-start' }}>
                                    <Box
                                        sx={{
                                            backgroundColor: 'primary.400', // 원형 배경색
                                            width: '40px', // 원형의 너비 (조정 가능)
                                            height: '40px', // 원형의 높이 (조정 가능)
                                            borderRadius: '50%', // 원형으로 만들기
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Image
                                            src="/images/description-24-dp-000-fill-0-wght-300-grad-0-opsz-2411.svg"
                                            alt="Mask Group Icon"
                                            width={25}
                                            height={25}
                                        />
                                    </Box>
                                </IconButton>
                                <Typography sx={{ fontWeight: 'bold' }}>{title}</Typography>
                            </Stack>
                            <Stack direction={'row'} sx={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                                <ChevronRightIcon />
                            </Stack>
                        </Stack>
                        {crrInfo.slice(0, 2).map((item, index) => (
                            <Fragment key={index}>
                                <Stack direction={'row'} sx={{ mb: 1 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 'normal' }}>
                                        {`${item.work_bgng_ym} ~ ${item.work_end_ym} [${calculateWorkDuration(
                                            item.work_bgng_ym,
                                            item.work_end_ym
                                        )}]`}
                                    </Typography>
                                </Stack>
                                <Stack direction={'row'} sx={{ mb: 1, alignItems: 'center' }} spacing={1}>
                                    <Chip
                                        label="근무회사"
                                        size="small"
                                        sx={{ height: '20px', fontSize: '0.875rem', lineHeight: '28px' }}
                                    />
                                    <Typography sx={{ lineHeight: '28px' }}>{item.work_inst_nm}</Typography>
                                </Stack>
                                <Stack direction={'row'} sx={{ mb: 1, alignItems: 'center' }} spacing={1}>
                                    <Chip
                                        label="근무부서"
                                        size="small"
                                        sx={{ height: '20px', fontSize: '0.875rem', lineHeight: '28px' }}
                                    />
                                    <Typography sx={{ lineHeight: '28px' }}>{item.work_dept}</Typography>
                                </Stack>
                                {crrInfo.length !== index + 1 ? <Divider sx={{ mt: 1, mb: 1 }} /> : null}
                            </Fragment>
                        ))}
                    </>
                );
            case 'tom_qlfc': // 자격
                return (
                    <>
                        <Stack
                            direction={'row'}
                            sx={{ mb: 1, justifyContent: 'space-between', alignItems: 'center' }}
                            spacing={1}
                        >
                            <Stack direction={'row'} sx={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                                <IconButton onClick={() => {}} sx={{ justifyContent: 'flex-start' }}>
                                    <Box
                                        sx={{
                                            backgroundColor: 'primary.400', // 원형 배경색
                                            width: '40px', // 원형의 너비 (조정 가능)
                                            height: '40px', // 원형의 높이 (조정 가능)
                                            borderRadius: '50%', // 원형으로 만들기
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Image
                                            src="/images/license-24-dp-000-fill-0-wght-300-grad-0-opsz-241.svg"
                                            alt="Mask Group Icon"
                                            width={25}
                                            height={25}
                                        />
                                    </Box>
                                </IconButton>
                                <Typography sx={{ fontWeight: 'bold' }}>{title}</Typography>
                            </Stack>
                            <Stack direction={'row'} sx={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                                <ChevronRightIcon />
                            </Stack>
                        </Stack>
                        {qlfcInfo.slice(0, 2).map((item, index) => (
                            <Fragment key={index}>
                                <Stack direction={'row'} sx={{ mb: 1 }} spacing={1}>
                                    <Typography variant="h5" fontWeight="bold">
                                        {item.crtfct}
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 'normal' }}>
                                        |
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 'normal' }}>
                                        {item.acqs_ymd}
                                    </Typography>
                                </Stack>
                                <Stack direction={'row'} sx={{ mb: 1, alignItems: 'center' }} spacing={1}>
                                    <Chip
                                        label="자격구분"
                                        size="small"
                                        sx={{ height: '20px', fontSize: '0.875rem', lineHeight: '28px' }}
                                    />
                                    <Typography sx={{ lineHeight: '28px' }}>{item.qlfc}</Typography>
                                </Stack>
                                <Stack direction={'row'} sx={{ mb: 1, alignItems: 'center' }} spacing={1}>
                                    <Chip
                                        label="발행기관"
                                        size="small"
                                        sx={{ height: '20px', fontSize: '0.875rem', lineHeight: '28px' }}
                                    />
                                    <Typography sx={{ lineHeight: '28px' }}>{item.issu_inst}</Typography>
                                </Stack>
                                {qlfcInfo.length !== index + 1 ? <Divider sx={{ mt: 1, mb: 1 }} /> : null}
                            </Fragment>
                        ))}
                    </>
                );
            case 'tom_lgsdy': // 어학
                return (
                    <>
                        <Stack
                            direction={'row'}
                            sx={{ mb: 1, justifyContent: 'space-between', alignItems: 'center' }}
                            spacing={1}
                        >
                            <Stack direction={'row'} sx={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                                <IconButton onClick={() => {}} sx={{ justifyContent: 'flex-start' }}>
                                    <Box
                                        sx={{
                                            backgroundColor: 'primary.400', // 원형 배경색
                                            width: '40px', // 원형의 너비 (조정 가능)
                                            height: '40px', // 원형의 높이 (조정 가능)
                                            borderRadius: '50%', // 원형으로 만들기
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Image
                                            src="/images/globe-book-24-dp-000-fill-0-wght-300-grad-0-opsz-241.svg"
                                            alt="Mask Group Icon"
                                            width={25}
                                            height={25}
                                        />
                                    </Box>
                                </IconButton>
                                <Typography sx={{ fontWeight: 'bold' }}>{title}</Typography>
                            </Stack>
                            <Stack direction={'row'} sx={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                                <ChevronRightIcon />
                            </Stack>
                        </Stack>
                        {lgsdyInfo.slice(0, 2).map((item, index) => (
                            <Fragment key={index}>
                                <Stack direction={'row'} sx={{ mb: 1 }} spacing={1}>
                                    <Typography variant="h5" fontWeight="bold">
                                        {item.lgsdy_nm}
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 'normal' }}>
                                        |
                                    </Typography>
                                    <Typography variant="h5" fontWeight="bold">
                                        {item.lgsdy_scr}
                                    </Typography>
                                </Stack>
                                <Stack direction={'row'} sx={{ mb: 1, alignItems: 'center' }} spacing={1}>
                                    <Chip
                                        label="평가기관"
                                        size="small"
                                        sx={{ height: '20px', fontSize: '0.875rem', lineHeight: '28px' }}
                                    />
                                    <Typography sx={{ lineHeight: '28px' }}>{item.evl_inst}</Typography>
                                </Stack>
                                <Stack direction={'row'} sx={{ mb: 1, alignItems: 'center' }} spacing={1}>
                                    <Chip
                                        label="인정기간"
                                        size="small"
                                        sx={{ height: '20px', fontSize: '0.875rem', lineHeight: '28px' }}
                                    />
                                    <Typography
                                        sx={{ lineHeight: '28px' }}
                                    >{`${item.lgsdy_acqs_ymd} ~ ${item.lgsdy_expry_ymd}`}</Typography>
                                </Stack>
                                {lgsdyInfo.slice(0, 2).length !== index + 1 ? <Divider sx={{ mt: 1, mb: 1 }} /> : null}
                            </Fragment>
                        ))}
                    </>
                );
            case 'tom_duty': // 직무이력
                return (
                    <>
                        <Stack
                            direction={'row'}
                            sx={{ mb: 1, justifyContent: 'space-between', alignItems: 'center' }}
                            spacing={1}
                        >
                            <Stack direction={'row'} sx={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                                <IconButton onClick={() => {}} sx={{ justifyContent: 'flex-start' }}>
                                    <Box
                                        sx={{
                                            backgroundColor: 'primary.400', // 원형 배경색
                                            width: '40px', // 원형의 너비 (조정 가능)
                                            height: '40px', // 원형의 높이 (조정 가능)
                                            borderRadius: '50%', // 원형으로 만들기
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Image
                                            src="/images/work-history-24-dp-000-fill-0-wght-300-grad-0-opsz-241.svg"
                                            alt="Mask Group Icon"
                                            width={25}
                                            height={25}
                                        />
                                    </Box>
                                </IconButton>
                                <Typography sx={{ fontWeight: 'bold' }}>{title}</Typography>
                            </Stack>
                            <Stack direction={'row'} sx={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                                <ChevronRightIcon />
                            </Stack>
                        </Stack>
                        {dutyInfo.slice(0, 3).map((item, index) => (
                            <Fragment key={index}>
                                <Stack direction={'row'} sx={{ mb: 1 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 'normal' }}>
                                        {`${item.bgng_ymd} ~ ${item.end_ymd} [${calculateWorkDuration(
                                            item.bgng_ymd,
                                            item.end_ymd
                                        )}]`}
                                    </Typography>
                                </Stack>
                                <Stack direction={'row'} sx={{ mb: 1 }} spacing={1}>
                                    <Typography variant="h5" fontWeight="bold">
                                        {item.duty}
                                    </Typography>
                                </Stack>
                                {dutyInfo.length !== index + 1 ? <Divider sx={{ mt: 1, mb: 1 }} /> : null}
                            </Fragment>
                        ))}
                    </>
                );
            case 'tom_wnawd|tom_dspn': // 상벌
                return (
                    <>
                        <Stack
                            direction={'row'}
                            sx={{ mb: 1, justifyContent: 'space-between', alignItems: 'center' }}
                            spacing={1}
                        >
                            <Stack direction={'row'} sx={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                                <IconButton onClick={() => {}} sx={{ justifyContent: 'flex-start' }}>
                                    <Box
                                        sx={{
                                            backgroundColor: 'primary.400', // 원형 배경색
                                            width: '40px', // 원형의 너비 (조정 가능)
                                            height: '40px', // 원형의 높이 (조정 가능)
                                            borderRadius: '50%', // 원형으로 만들기
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Image
                                            src="/images/summarize-24-dp-000-fill-0-wght-300-grad-0-opsz-241.svg"
                                            alt="Mask Group Icon"
                                            width={25}
                                            height={25}
                                        />
                                    </Box>
                                </IconButton>
                                <Typography sx={{ fontWeight: 'bold' }}>{title}</Typography>
                            </Stack>
                            <Stack direction={'row'} sx={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                                <ChevronRightIcon />
                            </Stack>
                        </Stack>
                        {wnawdInfo?.slice(0, 2).map((item, index) => (
                            <Fragment key={index}>
                                <Stack direction={'row'} sx={{ mb: 1 }} spacing={1}>
                                    <Typography variant="h5" fontWeight="bold">
                                        포상
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 'normal' }}>
                                        |
                                    </Typography>
                                    <Typography variant="h5" fontWeight="bold">
                                        {item.rwrd_knd === 'cm001'
                                            ? '내부 표창'
                                            : item.rwrd_knd === 'cm002'
                                            ? '외부 표창'
                                            : item.rwrd_knd === 'cm003'
                                            ? '인사팀 표창'
                                            : '기타'}
                                    </Typography>
                                </Stack>
                                <Stack direction={'row'} sx={{ mb: 1, alignItems: 'center' }} spacing={1}>
                                    <Chip
                                        label="포상명"
                                        size="small"
                                        sx={{ height: '20px', fontSize: '0.875rem', lineHeight: '28px' }}
                                    />
                                    <Typography sx={{ lineHeight: '28px' }}>{item.rwrd_nm}</Typography>
                                </Stack>
                                <Stack direction={'row'} sx={{ mb: 1, alignItems: 'center' }} spacing={1}>
                                    <Chip
                                        label="포상일"
                                        size="small"
                                        sx={{ height: '20px', fontSize: '0.875rem', lineHeight: '28px' }}
                                    />
                                    <Typography sx={{ lineHeight: '28px' }}>
                                        {dayjs(item.rwrd_ymd).format('YYYY.MM.DD')}{' '}
                                    </Typography>
                                </Stack>
                                {lgsdyInfo.length !== index + 1 ? <Divider sx={{ mt: 1, mb: 1 }} /> : null}
                            </Fragment>
                        ))}
                        {dspnInfo?.slice(0, 2).map((item, index) => (
                            <Fragment key={index}>
                                <Stack direction={'row'} sx={{ mb: 1 }} spacing={1}>
                                    <Typography variant="h5" fontWeight="bold">
                                        징계
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 'normal' }}>
                                        |
                                    </Typography>
                                    <Typography variant="h5" fontWeight="bold">
                                        {item.dspn_knd === 'cm001'
                                            ? '내부 징계'
                                            : item.dspn_knd === 'cm002'
                                            ? '외부 징계'
                                            : item.dspn_knd === 'cm003'
                                            ? '견책'
                                            : '기타'}
                                    </Typography>
                                </Stack>
                                <Stack direction={'row'} sx={{ mb: 1, alignItems: 'center' }} spacing={1}>
                                    <Chip
                                        label="징계사유"
                                        size="small"
                                        sx={{ height: '20px', fontSize: '0.875rem', lineHeight: '28px' }}
                                    />
                                    <Typography sx={{ lineHeight: '28px' }}>{item.dspn_rsn}</Typography>
                                </Stack>
                                <Stack direction={'row'} sx={{ mb: 1, alignItems: 'center' }} spacing={1}>
                                    <Chip
                                        label="징계일"
                                        size="small"
                                        sx={{ height: '20px', fontSize: '0.875rem', lineHeight: '28px' }}
                                    />
                                    <Typography sx={{ lineHeight: '28px' }}>
                                        {dayjs(item.dspn_ymd).format('YYYY.MM.DD')} ~{' '}
                                        {dayjs(item.dspn_ersr_dt).format('YYYY.MM.DD')}{' '}
                                    </Typography>
                                </Stack>
                            </Fragment>
                        ))}
                    </>
                );
            case 'tom_edu': // 교육
                return (
                    <>
                        <Stack
                            direction={'row'}
                            sx={{ mb: 1, justifyContent: 'space-between', alignItems: 'center' }}
                            spacing={1}
                        >
                            <Stack direction={'row'} sx={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                                <IconButton onClick={() => {}} sx={{ justifyContent: 'flex-start' }}>
                                    <Box
                                        sx={{
                                            backgroundColor: 'primary.400', // 원형 배경색
                                            width: '40px', // 원형의 너비 (조정 가능)
                                            height: '40px', // 원형의 높이 (조정 가능)
                                            borderRadius: '50%', // 원형으로 만들기
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Image
                                            src="/images/history-edu-24-dp-000-fill-0-wght-300-grad-0-opsz-241.svg"
                                            alt="Mask Group Icon"
                                            width={25}
                                            height={25}
                                        />
                                    </Box>
                                </IconButton>
                                <Typography sx={{ fontWeight: 'bold' }}>{title}</Typography>
                            </Stack>
                            <Stack direction={'row'} sx={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                                <ChevronRightIcon />
                            </Stack>
                        </Stack>
                        {eduInfo.slice(0, 2).map((item, index) => (
                            <Fragment key={index}>
                                <Stack direction={'row'} sx={{ mb: 1 }} spacing={1}>
                                    <Typography variant="h5" fontWeight="bold">
                                        {item.edu_se}
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 'normal' }}>
                                        |
                                    </Typography>
                                    <Typography variant="h5" fontWeight="bold">
                                        {item.ednst}
                                    </Typography>
                                </Stack>
                                <Stack direction={'row'} sx={{ mb: 1, alignItems: 'center' }} spacing={1}>
                                    <Chip
                                        label="교육명"
                                        size="small"
                                        sx={{ height: '20px', fontSize: '0.875rem', lineHeight: '28px' }}
                                    />
                                    <Typography sx={{ lineHeight: '28px' }}>
                                        {item['evl-inst']}
                                        {item.edu_nm}
                                    </Typography>
                                </Stack>
                                <Stack direction={'row'} sx={{ mb: 1, alignItems: 'center' }} spacing={1}>
                                    <Chip
                                        label="교육기간"
                                        size="small"
                                        sx={{ height: '20px', fontSize: '0.875rem', lineHeight: '28px' }}
                                    />
                                    <Typography
                                        sx={{ lineHeight: '28px' }}
                                    >{`${item.bgng_ymd} ~ ${item.end_ymd}`}</Typography>
                                </Stack>
                                {eduInfo.length !== index + 1 ? <Divider sx={{ mt: 1, mb: 1 }} /> : null}
                            </Fragment>
                        ))}
                    </>
                );
            case 'tom_mltsvc': // 병역
                return (
                    <>
                        <Stack
                            direction={'row'}
                            sx={{ mb: 1, justifyContent: 'space-between', alignItems: 'center' }}
                            spacing={1}
                        >
                            <Stack direction={'row'} sx={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                                <IconButton onClick={() => {}} sx={{ justifyContent: 'flex-start' }}>
                                    <Box
                                        sx={{
                                            backgroundColor: 'primary.400', // 원형 배경색
                                            width: '40px', // 원형의 너비 (조정 가능)
                                            height: '40px', // 원형의 높이 (조정 가능)
                                            borderRadius: '50%', // 원형으로 만들기
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Image
                                            src="/images/military-tech-24-dp-000-fill-0-wght-300-grad-0-opsz-241.svg"
                                            alt="Mask Group Icon"
                                            width={25}
                                            height={25}
                                        />
                                    </Box>
                                </IconButton>
                                <Typography sx={{ fontWeight: 'bold' }}>{title}</Typography>
                            </Stack>
                            <Stack direction={'row'} sx={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                                <ChevronRightIcon />
                            </Stack>
                        </Stack>
                        {mltsvcInfo && (
                            <>
                                <Stack direction={'row'} sx={{ mb: 1 }} spacing={1}>
                                    <Typography variant="h5" fontWeight="bold">
                                        {mltsvcInfo.srvc_se === 'cm001'
                                            ? '군필'
                                            : mltsvcInfo.srvc_se === 'cm002'
                                            ? '미필'
                                            : mltsvcInfo.srvc_se === 'cm003'
                                            ? '면제'
                                            : '기타'}
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 'normal' }}>
                                        |
                                    </Typography>
                                    <Typography variant="h5" fontWeight="bold">
                                        {mltsvcInfo.dcrg_se === 'cm001'
                                            ? '만기전역'
                                            : mltsvcInfo.dcrg_se === 'cm002'
                                            ? '의가사전역'
                                            : mltsvcInfo.dcrg_se === 'cm003'
                                            ? '의병전역'
                                            : mltsvcInfo.dcrg_se === 'cm004'
                                            ? '소집해제'
                                            : mltsvcInfo.dcrg_se === 'cm005'
                                            ? '귀휴전역'
                                            : mltsvcInfo.dcrg_se === 'cm006'
                                            ? '징집면제'
                                            : mltsvcInfo.dcrg_se === 'cm007'
                                            ? '소집면제'
                                            : '기타'}
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 'normal' }}>
                                        |
                                    </Typography>
                                    <Typography variant="h5" fontWeight="bold">
                                        {mltsvcInfo.echln === 'cm001'
                                            ? '이병'
                                            : mltsvcInfo.echln === 'cm002'
                                            ? '일병'
                                            : mltsvcInfo.echln === 'cm003'
                                            ? '상병'
                                            : mltsvcInfo.echln === 'cm004'
                                            ? '병장'
                                            : mltsvcInfo.echln === 'cm005'
                                            ? '간부'
                                            : '기타'}
                                    </Typography>
                                </Stack>
                                <Stack direction={'row'} sx={{ mb: 1, alignItems: 'center' }} spacing={1}>
                                    <Chip
                                        label="복무기간"
                                        size="small"
                                        sx={{ height: '20px', fontSize: '0.875rem', lineHeight: '28px' }}
                                    />
                                    <Typography sx={{ lineHeight: '28px' }}>
                                        {dayjs(mltsvcInfo.enlstm_ymd).format('YYYY.MM.DD')} ~{' '}
                                        {dayjs(mltsvcInfo.dcrg_ymd).format('YYYY.MM.DD')}
                                    </Typography>
                                </Stack>
                                <Stack direction={'row'} sx={{ mb: 1, alignItems: 'center' }} spacing={1}>
                                    <Chip
                                        label="병과"
                                        size="small"
                                        sx={{ height: '20px', fontSize: '0.875rem', lineHeight: '28px' }}
                                    />
                                    <Typography sx={{ lineHeight: '28px' }}>
                                        {mltsvcInfo.mtrs_cls === 'cm001'
                                            ? '보병'
                                            : mltsvcInfo.mtrs_cls === 'cm002'
                                            ? '기갑'
                                            : mltsvcInfo.mtrs_cls === 'cm003'
                                            ? '포병'
                                            : mltsvcInfo.mtrs_cls === 'cm004'
                                            ? '방공'
                                            : mltsvcInfo.mtrs_cls === 'cm005'
                                            ? '정보'
                                            : mltsvcInfo.mtrs_cls === 'cm006'
                                            ? '공병'
                                            : mltsvcInfo.mtrs_cls === 'cm007'
                                            ? '정보통신'
                                            : mltsvcInfo.mtrs_cls === 'cm008'
                                            ? '항공'
                                            : mltsvcInfo.mtrs_cls === 'cm009'
                                            ? '화학'
                                            : mltsvcInfo.mtrs_cls === 'cm010'
                                            ? '병기'
                                            : mltsvcInfo.mtrs_cls === 'cm011'
                                            ? '병참'
                                            : mltsvcInfo.mtrs_cls === 'cm012'
                                            ? '수송'
                                            : mltsvcInfo.mtrs_cls === 'cm013'
                                            ? '부관'
                                            : '기타'}
                                    </Typography>
                                </Stack>
                                <Stack direction={'row'} sx={{ mb: 1, alignItems: 'center' }} spacing={1}>
                                    <Chip
                                        label="민방위편성여부"
                                        size="small"
                                        sx={{ height: '20px', fontSize: '0.875rem', lineHeight: '28px' }}
                                    />
                                    <Typography sx={{ lineHeight: '28px' }}>
                                        {mltsvcInfo.cvdf_frmt_yn === 'cm001' ? 'Y' : 'N'}
                                    </Typography>
                                </Stack>
                            </>
                        )}
                    </>
                );
            case 'tom_fam': // 가족
                return (
                    <>
                        <Stack
                            direction={'row'}
                            sx={{ mb: 1, justifyContent: 'space-between', alignItems: 'center' }}
                            spacing={1}
                        >
                            <Stack direction={'row'} sx={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                                <IconButton onClick={() => {}} sx={{ justifyContent: 'flex-start' }}>
                                    <Box
                                        sx={{
                                            backgroundColor: 'primary.400', // 원형 배경색
                                            width: '40px', // 원형의 너비 (조정 가능)
                                            height: '40px', // 원형의 높이 (조정 가능)
                                            borderRadius: '50%', // 원형으로 만들기
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Image
                                            src="/images/diversity-424-dp-000-fill-0-wght-300-grad-0-opsz-241.svg"
                                            alt="Mask Group Icon"
                                            width={25}
                                            height={25}
                                        />
                                    </Box>
                                </IconButton>
                                <Typography sx={{ fontWeight: 'bold' }}>{title}</Typography>
                            </Stack>
                            <Stack direction={'row'} sx={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                                <ChevronRightIcon />
                            </Stack>
                        </Stack>
                        {famInfo.slice(0, 6).map((item, index) => (
                            <Fragment key={index}>
                                <Stack direction={'row'} sx={{ mb: 1, alignItems: 'center' }} spacing={1}>
                                    <Chip
                                        label={item.fam_rel}
                                        size="small"
                                        sx={{ height: '20px', fontSize: '0.875rem', lineHeight: '28px' }}
                                    />

                                    <Typography sx={{ lineHeight: '28px' }}>
                                        {item.fam_lastnm}
                                        {item.fam_frstnm}
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 'normal', lineHeight: '28px' }}>
                                        |
                                    </Typography>
                                    <Typography sx={{ lineHeight: '28px' }}> {item.gndr_nm}</Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 'normal', lineHeight: '28px' }}>
                                        |
                                    </Typography>
                                    <Typography sx={{ lineHeight: '28px' }}>
                                        만 {getBirthInfo(item?.fam_rrno, 'age')}세
                                    </Typography>
                                </Stack>

                                {famInfo.length !== index + 1 ? <Divider sx={{ mt: 1, mb: 1 }} /> : null}
                            </Fragment>
                        ))}
                    </>
                );
            // case 'tom_fam': // 가족
            //     return (
            //         <>
            //             {famInfo.map((item, index) => (
            //                 <Fragment key={index}>
            //                     <Stack direction={'row'} sx={{ mb: 1, alignItems: 'center' }} spacing={1}>
            //                         <Chip
            //                             label="가족관계"
            //                             size="small"
            //                             sx={{ height: '20px', fontSize: '0.875rem', lineHeight: '28px' }}
            //                         />

            //                         <Typography sx={{ lineHeight: '28px' }}> 성이름</Typography>
            //                         <Typography variant="h5" sx={{ fontWeight: 'normal', lineHeight: '28px' }}>
            //                             |
            //                         </Typography>
            //                         <Typography sx={{ lineHeight: '28px' }}> {item.gndr_nm}</Typography>
            //                         <Typography variant="h5" sx={{ fontWeight: 'normal', lineHeight: '28px' }}>
            //                             |
            //                         </Typography>
            //                         <Typography sx={{ lineHeight: '28px' }}>
            //                             만 {getUserInfo(item?.fam_rrno, 'age')}세
            //                         </Typography>
            //                     </Stack>

            //                     {famInfo.length !== index + 1 ? <Divider sx={{ mt: 1, mb: 1 }} /> : null}
            //                 </Fragment>
            //             ))}
            //         </>
            //     );
            case 'tom_dsblty': // 장애
                return (
                    <>
                        <Stack
                            direction={'row'}
                            sx={{ mb: 1, justifyContent: 'space-between', alignItems: 'center' }}
                            spacing={1}
                        >
                            <Stack direction={'row'} sx={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                                <IconButton onClick={() => {}} sx={{ justifyContent: 'flex-start' }}>
                                    <Box
                                        sx={{
                                            backgroundColor: 'primary.400', // 원형 배경색
                                            width: '40px', // 원형의 너비 (조정 가능)
                                            height: '40px', // 원형의 높이 (조정 가능)
                                            borderRadius: '50%', // 원형으로 만들기
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Image
                                            src="/images/person-add-disabled-24-dp-000-fill-0-wght-300-grad-0-opsz-241.svg"
                                            alt="Mask Group Icon"
                                            width={25}
                                            height={25}
                                        />
                                    </Box>
                                </IconButton>
                                <Typography sx={{ fontWeight: 'bold' }}>{title}</Typography>
                            </Stack>
                            <Stack direction={'row'} sx={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                                <ChevronRightIcon />
                            </Stack>
                        </Stack>
                        {dsbltyInfo.slice(0, 2).map((item, index) => (
                            <Fragment key={index}>
                                <Stack direction={'row'} sx={{ mb: 1, alignItems: 'center' }} spacing={1}>
                                    <Typography variant="h5" fontWeight="bold">
                                        {item.dsblty_se}
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 'normal', lineHeight: '28px' }}>
                                        |
                                    </Typography>
                                    <Typography variant="h5" fontWeight="bold">
                                        {item.dsblty_type}
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 'normal', lineHeight: '28px' }}>
                                        |
                                    </Typography>
                                    <Typography variant="h5" fontWeight="bold">
                                        {item.dsblty_dgre}
                                    </Typography>
                                </Stack>
                                <Stack direction={'row'} sx={{ mb: 1, alignItems: 'center' }} spacing={1}>
                                    <Chip
                                        label="장애판정"
                                        size="small"
                                        sx={{ height: '20px', fontSize: '0.875rem', lineHeight: '28px' }}
                                    />

                                    <Typography sx={{ lineHeight: '28px' }}> {item.bgng_ymd} ~</Typography>
                                </Stack>
                                <Stack direction={'row'} sx={{ mb: 1, alignItems: 'center' }} spacing={1}>
                                    <Chip
                                        label="장애ID"
                                        size="small"
                                        sx={{ height: '20px', fontSize: '0.875rem', lineHeight: '28px' }}
                                    />

                                    <Typography sx={{ lineHeight: '28px' }}> {item.dsblty_no}</Typography>
                                </Stack>

                                {dsbltyInfo.length !== index + 1 ? <Divider sx={{ mt: 1, mb: 1 }} /> : null}
                            </Fragment>
                        ))}
                    </>
                );
            case 'tom_rwdptr': // 보훈
                return (
                    <>
                        <Stack
                            direction={'row'}
                            sx={{ mb: 1, justifyContent: 'space-between', alignItems: 'center' }}
                            spacing={1}
                        >
                            <Stack direction={'row'} sx={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                                <IconButton onClick={() => {}} sx={{ justifyContent: 'flex-start' }}>
                                    <Box
                                        sx={{
                                            backgroundColor: 'primary.400', // 원형 배경색
                                            width: '40px', // 원형의 너비 (조정 가능)
                                            height: '40px', // 원형의 높이 (조정 가능)
                                            borderRadius: '50%', // 원형으로 만들기
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Image
                                            src="/images/flag-24-dp-000-fill-0-wght-300-grad-0-opsz-241.svg"
                                            alt="Mask Group Icon"
                                            width={25}
                                            height={25}
                                        />
                                    </Box>
                                </IconButton>
                                <Typography sx={{ fontWeight: 'bold' }}>{title}</Typography>
                            </Stack>
                            <Stack direction={'row'} sx={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                                <ChevronRightIcon />
                            </Stack>
                        </Stack>
                        {rwdptrInfo.slice(0, 2).map((item, index) => (
                            <Fragment key={index}>
                                <Stack direction={'row'} sx={{ mb: 1, alignItems: 'center' }} spacing={1}>
                                    <Typography variant="h5" fontWeight="bold">
                                        {item.rwdptr_dsctn}
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 'normal', lineHeight: '28px' }}>
                                        |
                                    </Typography>
                                    <Typography variant="h5" fontWeight="bold">
                                        {item.rwdptr_inst}
                                    </Typography>
                                </Stack>
                                <Stack direction={'row'} sx={{ mb: 1, alignItems: 'center' }} spacing={1}>
                                    <Chip
                                        label="보훈기간"
                                        size="small"
                                        sx={{ height: '20px', fontSize: '0.875rem', lineHeight: '28px' }}
                                    />

                                    <Typography sx={{ lineHeight: '28px' }}>
                                        {item.rwdptr_reg_ymd} ~ {item.rwdptr_rmv_ymd}
                                    </Typography>
                                </Stack>
                                <Stack direction={'row'} sx={{ mb: 1, alignItems: 'center' }} spacing={1}>
                                    <Chip
                                        label="보훈번호"
                                        size="small"
                                        sx={{ height: '20px', fontSize: '0.875rem', lineHeight: '28px' }}
                                    />
                                    <Typography sx={{ lineHeight: '28px' }}> {item.rwdptr_no}</Typography>
                                </Stack>

                                {rwdptrInfo.length !== index + 1 ? <Divider sx={{ mt: 1, mb: 1 }} /> : null}
                            </Fragment>
                        ))}
                    </>
                );
            case 'direct':
                return (
                    <>
                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{ justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}
                        >
                            <SentimentSatisfiedAltIcon sx={{ fontSize: '45px' }} />
                            <Typography
                                sx={{
                                    fontWeight: 'bold',
                                    fontSize: '28px',
                                    borderBottom: '2px solid black',
                                    paddingBottom: '2px',
                                }}
                            >
                                {title}
                            </Typography>
                        </Stack>
                    </>
                );
            default:
                return null;
        }
    }
    return (
        <Link href={`${link}?user_no=WIN000031`} passHref>
            <Stack
                direction={'column'}
                spacing={1}
                sx={{ cursor: 'pointer' }}
                onClick={() => {
                    handleClick();
                }}
            >
                <Card
                    sx={{
                        backgroundColor: '#ffffff',
                        height: '320px',
                        display: 'flex',
                        flexDirection: 'column',
                        border: '1px solid #cccccc', // 약한 테두리 설정
                        borderRadius: '8px',
                    }}
                >
                    <CardContent sx={{ flex: 1, overflowY: 'auto', p: '10px', pb: '10px !important' }}>
                        {renderComponent(type)}
                    </CardContent>
                </Card>
            </Stack>
        </Link>
    );
}
