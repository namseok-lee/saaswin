'use client';
import PropTypes from 'prop-types';
import {
    Grid,
    Checkbox,
    Button,
    Typography,
    IconButton,
    AppBar,
    Toolbar,
    Stack,
    Dialog,
    Box,
    Snackbar,
    Alert,
    Divider,
    Select,
    MenuItem,
    FormControlLabel,
} from '@mui/material';
import { CloseCircleTwoTone, LeftCircleTwoTone } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import Loader from 'components/Loader';
import SettingsIcon from '@mui/icons-material/Settings';
import { fetcherPost, fetcherPostGridData } from 'utils/axios';
import { enqueueSnackbar } from 'notistack';
import InputTextBox from '@/components/InputTextBox';
import Chip from 'components/Chip';

export default function AuthDialog({ open, handleClose, params, setMasterRetrieve }) {
    const { authrt_nm, authrt_cd, action_type, basic_se_cd } = params;
    const [saveData, setSaveData] = useState(params);

    const authSave = () => {
        console.log('authSave');
    };

    const handleChange = (value: string) => {
        setSaveData((prev) => ({
            ...prev,
            authrt_nm: value,
        }));
    };

    // 구성원 정보 섹션 데이터
    const infoGroups = [
        {
            title: '기본 정보',
            rows: ['항목 1', '항목 2', '항목 3'],
        },
        {
            title: '복무 정보',
            rows: ['복무 항목 1', '복무 항목 2'],
        },
    ];

    // 기능 권한 섹션 데이터
    const functionSections = [
        {
            title: '인사 업무',
            groups: [
                {
                    label: '조직 관리',
                    options: ['조직 등록', '조직 수정', '조직 삭제'],
                },
                {
                    label: '직책 관리',
                    options: ['직책 생성', '직책 편집'],
                },
            ],
        },
        {
            title: '보상',
            groups: [
                {
                    label: '급여 관리',
                    options: ['급여 등록', '급여 조회', '급여 수정'],
                },
            ],
        },
    ];

    return (
        <>
            <Dialog
                fullScreen
                scroll={'paper'}
                open={open}
                onClose={handleClose}
                disableEscapeKeyDown
                transitionDuration={{
                    enter: 0,
                    exit: 0,
                }}
            >
                <AppBar sx={{ position: 'sticky' }} color='inherit' elevation={1}>
                    <Toolbar sx={{ position: 'relative' }}>
                        <Stack direction='row' alignItems='center' sx={{ marginRight: 'auto', maxWidth: '30%' }}>
                            {/* 풀모달 명 옆에 나가기 아이콘 */}
                            <IconButton
                                color='inherit'
                                // onClick={activeStep < steps.length ? handleOpenAlert : handleClose}
                                onClick={handleClose}
                                aria-label='close'
                                sx={{ marginLeft: 'auto' }}
                            >
                                <CloseCircleTwoTone style={{ fontSize: '30px' }} twoToneColor='#bfbfbf' />
                            </IconButton>
                            {/* 상단 타이틀 */}
                            {action_type === 'i' ? (
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
                                    새 커스텀 권한 편집
                                </Typography>
                            ) : (
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
                                    {authrt_nm} 편집
                                </Typography>
                            )}
                        </Stack>
                        <Stack direction='row' alignItems='center' spacing={1} sx={{ marginLeft: 'auto' }}>
                            <Button variant='outlined' color='inherit' onClick={authSave()}>
                                저장하기
                            </Button>
                        </Stack>
                    </Toolbar>
                </AppBar>
                {/* 하단 전체 */}
                <div style={{ width: '100%', overflowX: 'auto', display: 'block' }}>
                    <Box
                        sx={{
                            width: '100%',
                            p: 2,
                            display: 'flex',
                            justifyContent: 'left',
                            alignItems: 'center',
                        }}
                    >
                        {action_type === 'i' ? (
                            <InputTextBox
                                type='text'
                                id='authrt_nm'
                                placeholder='권한 이름을 입력하세요'
                                hasToggle={false}
                                showPassword={false}
                                label='권한명 설정'
                                asterisk
                                validationText=''
                                value={saveData?.authrt_nm || ''}
                                onChange={(e) => handleChange(e.target.value)}
                            />
                        ) : (
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
                                {authrt_nm}
                            </Typography>
                        )}
                        {basic_se_cd === 'basic' ? (
                            <Chip type='default' close={false}>
                                기본 권한
                            </Chip>
                        ) : (
                            <Chip type='default' close={false}>
                                커스텀 권한
                            </Chip>
                        )}
                    </Box>
                    <div>
                        {authrt_cd === 'GA001'
                            ? '모든 권한이 부여된 총괄 관리자 권한입니다. 관리자 권한은 항목 별 권한을 해제할 수 없으며, 구성원을 추가할 수 있습니다.'
                            : authrt_cd === 'GA002'
                            ? '조직장으로 설정된 구성원에게 자동으로 부여되는 권합입니다. 권한 설정을 변경할 수 있습니다.'
                            : authrt_cd === 'GA003'
                            ? '인사잇에 초대된 모든 구성원에게 자동으로 부여되는 권한입니다. 관리자, 조직장, 커스텀 권한 부여를 하지 않은 경우에는 자동으로 개인 권한이 부여됩니다.'
                            : ''}
                    </div>
                    <Box display='flex' gap={5} p={3}>
                        {/* 구성원 정보 표시 편집권한 */}
                        <Box
                            flex={4}
                            sx={{
                                overflowY: 'auto',
                                overflowX: 'hidden',
                                maxHeight: '85vh',
                                width: '100%',
                            }}
                        >
                            <Typography variant='h6' gutterBottom>
                                구성원 정보 표시/편집 권한
                            </Typography>

                            {infoGroups.map((group, gIdx) => (
                                <Box key={gIdx} mb={3}>
                                    <Typography variant='subtitle1' sx={{ mb: 1 }}>
                                        {group.title}
                                    </Typography>
                                    <Stack spacing={1}>
                                        <Grid container alignItems='center' spacing={2} key={gIdx}>
                                            <Grid item xs={4}>
                                                <Typography>항목</Typography>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Typography>접근 허용 범위</Typography>
                                            </Grid>
                                            <Grid item xs={1}>
                                                <Typography>조회 권한</Typography>
                                            </Grid>
                                            <Grid item xs={1}>
                                                <Typography>편집 권한</Typography>
                                            </Grid>
                                        </Grid>
                                        {group.rows.map((label, rIdx) => (
                                            <Grid container alignItems='center' spacing={2} key={rIdx}>
                                                <Grid item xs={4}>
                                                    <Typography>{label}</Typography>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Select fullWidth size='small'>
                                                        <MenuItem value='all'>모든 구성원</MenuItem>
                                                    </Select>
                                                </Grid>
                                                <Grid item xs={1}>
                                                    <Checkbox />
                                                </Grid>
                                                <Grid item xs={1}>
                                                    <Checkbox />
                                                </Grid>
                                            </Grid>
                                        ))}
                                    </Stack>
                                </Box>
                            ))}
                        </Box>

                        {/* 업무 기능 별 권한 */}
                        <Box flex={4} sx={{ overflowY: 'auto', maxHeight: '85vh' }}>
                            <Typography variant='h6' gutterBottom>
                                업무 기능 별 권한
                            </Typography>

                            {functionSections.map((section, sIdx) => (
                                <>
                                    <Box key={sIdx} mb={4}>
                                        <Typography variant='subtitle1' sx={{ mb: 2 }}>
                                            {section.title}
                                        </Typography>
                                        <Stack spacing={2}>
                                            {section.groups.map((group, gIdx) => (
                                                <Box key={gIdx}>
                                                    <Box
                                                        display='flex'
                                                        flexWrap='wrap'
                                                        gap={2}
                                                        mt={1}
                                                        alignItems='center'
                                                    >
                                                        <Typography sx={{ fontWeight: 600 }}>{group.label}</Typography>
                                                        전체선택 <Checkbox />
                                                    </Box>
                                                    <Box display='flex' flexWrap='wrap' gap={2} mt={1}>
                                                        {group.options.map((opt, i) => (
                                                            <FormControlLabel
                                                                key={i}
                                                                control={<Checkbox />}
                                                                label={opt}
                                                            />
                                                        ))}
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Stack>
                                    </Box>
                                    <Divider sx={{ my: 2 }} />
                                </>
                            ))}
                        </Box>

                        {/* 권한 적용 대상 */}
                        <Box flex={2} width={260}>
                            <Typography variant='h6' gutterBottom>
                                권한 적용 대상
                            </Typography>
                            <Button variant='outlined' size='small' fullWidth>
                                구성원 편집하기
                            </Button>
                            <Divider sx={{ my: 2 }} />
                            <Stack spacing={2}>
                                <Box sx={{ p: 1, border: '1px solid #ccc', borderRadius: 1 }}>
                                    <Typography fontWeight='bold'>홍길동</Typography>
                                    <Typography variant='body2'>기획팀 / 팀장</Typography>
                                </Box>
                                <Box sx={{ p: 1, border: '1px solid #ccc', borderRadius: 1 }}>
                                    <Typography fontWeight='bold'>김철수</Typography>
                                    <Typography variant='body2'>HR팀 / 매니저</Typography>
                                </Box>
                            </Stack>
                        </Box>
                    </Box>
                </div>
            </Dialog>
        </>
    );
}
