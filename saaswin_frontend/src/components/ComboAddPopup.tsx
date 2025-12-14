import React, { useEffect, useState } from 'react';
import { Grid, Modal, Stack, TextField, Tooltip, Typography } from '@mui/material';
import CustomButton from './CustomButton';
import { fetcherPost } from 'utils/axios';
import { treeData } from 'data/treeBinding';
import dayjs from 'dayjs';

const ComboAddPopup = ({ open, onClose, scrItgNo }: { open: boolean; onClose: () => void; scrItgNo: string }) => {
    const [dsctn, setDsctn] = useState(null);
    const today = dayjs(new Date()).format('YYYYMMDD');

    const saveBtn = [
        {
            api: 'null',
            seq: '2',
            text: '저장',
            type: 'SAVE',
            sqlId: 'null',
        },
        {
            api: 'null',
            seq: '1',
            text: '닫기',
            type: 'CLOSE',
            sqlId: 'null',
        },
    ];
    const convertItemsToChildren = (data) => {
        return data.map((item) => {
            const newItem = { ...item };

            // Items가 존재하면 children으로 이름을 변경하고 재귀 호출
            if (newItem.Items) {
                newItem.children = convertItemsToChildren(newItem.Items);
                delete newItem.Items; // 원래의 Items 속성 삭제
            }

            return newItem;
        });
    };
    const expandOneDepth = (data) => {
        return data.map((node) => {
            const newNode = { ...node };
            if (newNode.level == 0) {
                // 처음 한 depth만 펼치기
                if (newNode.children) {
                    newNode.expanded = true; // 1 depth 노드 펼치기
                    newNode.children = expandOneDepth(newNode.children); // 자식 노드도 재귀적으로 처리
                }
            }

            return newNode;
        });
    };

    useEffect(() => {
        // 조직개편의 경우 작업목록에 현재 조직도를 인서트 해야함
        if (scrItgNo === 'RD003-S') {
            const item = [
                {
                    sqlId: '53',
                    params: [
                        {
                            std_ymd: today,
                        },
                    ],
                },
            ];
            fetcherPost([process.env.NEXT_PUBLIC_SSW_SQL_SEARCH_API_URL, item])
                .then((response) => {
                    setDsctn(expandOneDepth(convertItemsToChildren(treeData(response[0].data))));
                })
                .catch((error) => {
                    console.error(error);
                })
                .finally(() => {
                    //setDataLoading(false);
                });
        }
    }, []);

    const handleClick = (type: string) => {
        switch (type) {
            case 'SAVE':
                break;
            case 'CLOSE':
                onClose();
                break;
            default:
                break;
        }
    };

    return (
        <Modal open={open} onClose={onClose} aria-labelledby="modal-title" aria-describedby="modal-description">
            <Grid
                item
                xs={12}
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 600,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                }}
            >
                <Stack direction={'row'} sx={{ justifyContent: 'space-between', margin: 0 }}>
                    <Stack direction={'row'} sx={{ justifyContent: 'space-between', margin: 0, alignItems: 'center' }}>
                        <Tooltip
                            title="조직개편 시뮬레이션의 작업을 생성합니다."
                            placement="right-start"
                            sx={{ margin: 0 }}
                        >
                            <Typography
                                sx={{
                                    fontWeight: 'bold',
                                    fontSize: '20px',
                                    '&:hover': {
                                        cursor: 'pointer',
                                    },
                                }}
                            >
                                조직개편 작업명 생성
                            </Typography>
                        </Tooltip>
                    </Stack>
                    <Stack direction={'row'} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        {saveBtn?.map((item) => (
                            <CustomButton
                                key={item.seq}
                                customButton={item}
                                clickEvent={() => handleClick(item.type)}
                            />
                        ))}
                    </Stack>
                </Stack>

                <TextField fullWidth variant="outlined" placeholder="그리드 들어갈 부분" sx={{ mt: 2 }} />
            </Grid>
        </Modal>
    );
};

export default ComboAddPopup;
