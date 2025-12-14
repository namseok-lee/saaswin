import React, { Fragment, useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Box,
    Typography,
    List,
    ListItem,
    Paper,
    IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { fetcherPost, fetcherPostData } from 'utils/axios';
import UserSelect from 'components/UserSelect';
import SwModal from 'components/Modal';
import { IcoClose, IcoExclamation } from '@/assets/Icon';
import Empty from 'components/Empty';
import Button from 'components/Button';

const PasswordResetDialog = ({ open, onClose }) => {
    const [search, setSearch] = useState('');
    const [recipients, setRecipients] = useState([]);
    const [userAdd, setUserAdd] = useState(false);
    const [retrieveParams, setRetrieveParams] = useState([]);
    const handleClose = () => {
        setRecipients([]);
        if (onClose) {
            // 부모에서 props로 내려준 값이 있는 지 확인하고
            onClose();
        }
    };

    const handleSendEmail = () => {
        const item = {
            sqlId: 'hrs_login01',
            sql_key: 'hrs_login_send_random_pwsd',
            params: [
                {
                    user_emails: [...recipients],
                },
            ],
        };

        // TODO: 메일 서버 생성 후 값 받아옴
        fetcherPost(['http://localhost:9001/api/mailSending', item])
            .then((response) => {
                console.log('response 값' + JSON.stringify(response, null, 2));
                console.log('response 값' + JSON.stringify(response[0].data[0].data, null, 2));
                alert('난수 비밀번호 : ' + response[0].data[0].data);
            })
            .catch((error) => {
                console.log(error);
            });
        handleClose();
    };

    const handleAddRecipient = () => {
        // if (search.trim() && !recipients.includes(search)) {
        //     setRecipients([...recipients, search]);
        //     setSearch('');
        // }
        setUserAdd(true);
    };
    const handleSelectChange = (id: string, value: string, type: string | null) => {
        setRetrieveParams((prev) => ({
            ...prev,
            ognz_no: '',
            user_no: value,
        }));
    };
    useEffect(() => {
        if (userAdd) {
            const params = retrieveParams;
            const item = [
                {
                    sqlId: 'hpo_apnt01',
                    sql_key: 'hpo_apnt_ognzno_userno',
                    params: [params],
                },
            ];
            fetcherPostData(item) // fetcherPost 함수 사용
                .then((response) => {
                    const resData = response[0].data[0].data;
                    const userList = resData.map((user) => ({
                        user_no: user.user_no,
                        flnm: user.flnm,
                    }));
                    const isNullData = resData[0].data === null;
                    if (resData && !isNullData) {
                        setRecipients(userList);
                    }
                })
                .catch((error) => {
                    console.error(error);
                })
                .finally(() => {
                    setUserAdd(false);
                });
        }
    }, [userAdd]);
    return (
        <SwModal
            open={open}
            onClose={(event, reason) => {
                if (reason !== 'backdropClick') {
                    onClose();
                }
            }}
            title='비밀번호 재설정 링크 메일 발송'
            size='md'
        >
            <div className='resetMailGuide'>
                <div className='ico'>
                    <IcoExclamation fill='var(--primary)' />
                </div>
                <div className='text'>
                    재설정 링크의 유효기간은 24시간 입니다.
                    <br />
                    메일 발송한 대상자는 자동으로 비활성화 해제되며 기존의 비밀번호는 초기화 됩니다.
                </div>
            </div>
            <div className='mailFindCoworker'>
                <label htmlFor='' className='label'>
                    사원찾기
                </label>
                <UserSelect item={'user_no'} handleChange={handleSelectChange} selectValue={'user_no'} />
            </div>
            <div className='mailSendTarget'>
                <div className='title'>메일 발송 대상자</div>
                <div className='targetList'>
                    <div className='empty'>
                        <Empty>발송 대상자가 없습니다.</Empty>
                    </div>
                </div>
                <div className='targetList'>
                    <ul className='list'>
                        {Array.from({ length: 20 }).map((_, index) => {
                            return (
                                <li className='item' key={index}>
                                    <div className='text'>
                                        <span className='name'>최은수1</span> 경영지원팀, 사원
                                    </div>
                                    <Button className='btnDel'>
                                        <IcoClose fill='#666666' />
                                    </Button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
            <div className='resetMailFooter'>
                <Button type='primary' size='lg' onClick={handleSendEmail} disabled={recipients.length === 0}>
                    재설정 메일 발송
                </Button>
            </div>
            <DialogContent>
                <Typography variant='subtitle1' sx={{ mt: 2 }}>
                    메일 발송 대상자
                </Typography>

                <Paper variant='outlined' sx={{ minHeight: 100, mt: 1, p: 1 }}>
                    {recipients.length > 0 ? (
                        <List>
                            {recipients.map((recipient, index) => (
                                <Fragment key={index}>
                                    <ListItem>{recipient.user_no}</ListItem>
                                    <ListItem>{recipient.flnm}</ListItem>
                                </Fragment>
                            ))}
                        </List>
                    ) : (
                        <Typography variant='body2' color='textSecondary'>
                            발송 대상자가 없습니다
                        </Typography>
                    )}
                </Paper>
            </DialogContent>
        </SwModal>
    );
};

export default PasswordResetDialog;
