// InviteManagement.tsx
'use client';

import { Alert, Snackbar } from '@mui/material';
import Typography from 'components/Typography';
import { useEffect, useState } from 'react';

import Button from 'components/Button';
import { IcoAdd, IcoArrowOutWard, IcoEdit, IcoMaster, IcoPersonFill, IcoTrashFill } from '@/assets/Icon';
import { fetcherPost, fetcherPostData } from 'utils/axios';
import SwModal from 'components/Modal';
import { VisitInfo } from 'views/vA002/VisitInfo';
import AuthDialog from './AuthDialog';

const AuthSetting = () => {
    const TrackedButton = VisitInfo('a', 'SG');
    const [masterRetrieve, setMasterRetrieve] = useState(true);
    const [masterData, setMasterData] = useState(null);
    const [open, setOpen] = useState(false);
    const [params, setParams] = useState([]);

    const handleOpen = (params: any, action_type: string) => {
        setOpen(true);
        params.action_type = action_type;
        setParams(params);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleAuthrtDelete = (authrt_cd: string) => {
        console.log(authrt_cd);

        const item = [
            {
                sqlId: 'hrs_com01',
                sql_key: 'hrs_authrt_cud',
                params: [{ action_type: 'd', authrt_cd: authrt_cd }],
            },
        ];

        fetcherPostData(item)
            .then((response) => {
                const data = response;
                const nullData = response?.[0].data;

                console.log('data', data);
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                setMasterRetrieve(false);
            });
    };

    useEffect(() => {
        if (masterRetrieve) {
            const item = [
                {
                    sqlId: 'hrs_com01',
                    sql_key: 'hrs_authrt_list_get',
                    params: [{}],
                },
            ];

            fetcherPostData(item)
                .then((response) => {
                    const data = response;
                    const nullData = response?.[0].data;

                    if (nullData === null) {
                        setMasterData(nullData);
                    } else setMasterData(data);
                })
                .catch((error) => {
                    console.error(error);
                })
                .finally(() => {
                    setMasterRetrieve(false);
                });
        }
    }, [masterRetrieve]);

    return (
        <div className='contContainer'>
            <div className='configuration inviteManagement'>
                <div className='pageHeader'>
                    <div className='pageInfo'>
                        <Typography type='page' desc>
                            권한 관리
                        </Typography>
                    </div>
                </div>

                {/* 기본권한관리 */}
                {/* 삭제 안되는 권한 */}
                <section className='part'>
                    <div className='partTitle'>기본권한관리</div>
                    <div className='partTitle'>
                        인사잇을 사용하기 위해 기본적으로 필요한 권한을 관리해보세요 <br />
                        권한 내용을 편집하고 구성원에게 권한을 부여할 수 있습니다.
                    </div>
                    <div className='sectionCont'>
                        <div className='btnFormArea'>
                            {masterData
                                ?.filter((item) => item.basic_se_cd === 'basic')
                                ?.map((form, index) => (
                                    <div className='btnForm basic' key={index} onClick={() => handleOpen(form, 'u')}>
                                        <div className='ico'>
                                            <IcoEdit fill='#fff' />
                                        </div>
                                        {form.authrt_nm}
                                        <IcoArrowOutWard fill='#c4c4c4' className='icoArrow' />
                                        <div>{form.user_cnt}명의 구성원</div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </section>

                {/* 커스텀권한관리 */}
                {/* 삭제 가능한 권한 */}
                <section className='part'>
                    <div className='partTitle'>커스텀 권한 관리</div>
                    <div className='partTitle'>
                        우리 회사만의 커스텀 권한을 만들고 관리해보세요. <br />
                        기본 권한 외 새로운 권한을 생성하고 자유롭게 권한 범위를 설정할 수 있습니다.
                    </div>
                    <div className='sectionCont'>
                        <div className='btnFormArea'>
                            {masterData
                                ?.filter((item) => item.basic_se_cd === 'custom')
                                .map((form, index) => (
                                    <div className='btnForm basic' key={index} onClick={() => handleOpen(form, 'u')}>
                                        <div className='ico'>
                                            <IcoEdit fill='#fff' />
                                        </div>
                                        {form.authrt_nm}
                                        <IcoArrowOutWard fill='#c4c4c4' className='icoArrow' />
                                        <div>{form.user_cnt}명의 구성원</div>
                                        <Button
                                            className='btnDelete'
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAuthrtDelete(form.authrt_se_cd);
                                            }}
                                        >
                                            <IcoTrashFill fill='#7C7C7C' />
                                            삭제
                                        </Button>
                                    </div>
                                ))}
                            <div className='btnForm add' onClick={() => handleOpen({}, 'i')}>
                                <div className='ico'>
                                    <IcoAdd fill='#fff' />
                                </div>
                                권한 추가하기
                                <IcoArrowOutWard fill='#c4c4c4' className='icoArrow' />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <AuthDialog open={open} handleClose={handleClose} params={params} setMasterRetrieve={setMasterRetrieve} />
        </div>
    );
};

export default AuthSetting;
