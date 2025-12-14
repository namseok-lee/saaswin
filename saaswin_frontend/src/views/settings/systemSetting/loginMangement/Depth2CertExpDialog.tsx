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

const Depth2CertExpDialog = ({ open, onClose }) => {
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
            title='2단계 인증 제외 IP 등록'
            size='md'
        >
            <div className='mailFindCoworker'>
                <label htmlFor='' className='label'>
                    IP주소
                </label>
                <UserSelect item={'user_no'} handleChange={handleSelectChange} selectValue={'user_no'} />
                <Button type='default' size='sm' className='btnAdd'>
                    추가
                </Button>
            </div>
            <div className='mailSendTarget'>
                <div className='title'>등록된 IP 주소 리스트</div>
                <div className='targetList'>
                    <div className='empty'>
                        <Empty>등록된 IP 주소가 없습니다.</Empty>
                    </div>
                </div>
                <div className='targetList'>
                    <ul className='ipAddressList'>
                        {Array.from({ length: 10 }).map((_, index) => {
                            return (
                                <li className='item' key={index}>
                                    <div className='ip'>73.227.130.85</div>
                                    <Button>
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
                    저장
                </Button>
            </div>
        </SwModal>
    );
};

export default Depth2CertExpDialog;
