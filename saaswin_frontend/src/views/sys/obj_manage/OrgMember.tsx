'use client';

import BoxSelect from '@/components/BoxSelect';
import './styles.scss';
import { useState } from 'react';
import { SelectChangeEvent } from '@mui/material/Select';
import Button from '@/components/Button';
import SwModal from '@/components/Modal';
import Typography from '@/components/Typography';
import SwDateRangePicker from '@/components/DateRangePicker';
import dayjs, { Dayjs } from 'dayjs';
import MemberCard from './components/MemberCard';
import { IcoCheck, IcoDelete, IcoGroup2, IcoInfo } from '../../../../public/asset/Icon';
import { Grid01 } from '@/components/Grid';
import { Grid } from '@mui/material';
import { GridDataItem } from '@/components/Grid/types';

interface OrgMemberProps {
    selectedData: {
        ognz_nm: string;
        ognz_ldr_user_no: string;
        orgMembers?: Array<OrgMember>;
        [key: string]: any;
    };
    editable: boolean;
}

interface OrgMember {
    user_no: string;
    child_no: string;
    flnm: string;
    ognz_nm?: string;
    apnt_jbps_cd?: string;
    apnt_duty_cd?: string;
    [key: string]: any;
}

interface LeaderMemberDisplay {
    name: string;
    position: string;
    code: string;
    [key: string]: any;
}

const OrgMember: React.FC<OrgMemberProps> = ({ selectedData, editable }) => {
    const [selectedValues, setSelectedValues] = useState<Record<string, number>>({
        test1: 1,
    });
    const [isLeaderModalOpen, setIsLeaderModalOpen] = useState<boolean>(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
    const [value, setValue] = useState<Dayjs | null>(dayjs('2022-04-17'));

    const handleChange = (id: string) => (e: SelectChangeEvent) => {
        setSelectedValues((prev) => ({
            ...prev,
            [id]: Number(e.target.value),
        }));
    };

    const handleOpenLeaderModal = () => {
        setIsLeaderModalOpen(true);
    };

    const handleCloseLeaderModal = () => {
        setIsLeaderModalOpen(false);
    };

    const handleOpenConfirmModal = () => {
        setIsConfirmModalOpen(true);
    };

    const handleCloseConfirmModal = () => {
        setIsConfirmModalOpen(false);
    };
    console.log('selectedData', selectedData);
    // 리더 정보 구하기
    const leaderMember = selectedData?.orgMembers?.find(
        (member: OrgMember) => member.user_no === selectedData.ognz_ldr_user_no
    );

    // 대리인 정보 구하기
    const delegateMember = selectedData?.orgMembers?.find(
        (member: OrgMember) => member.user_no === selectedData.agt_user_no
    );

    // 일반 구성원 필터링
    const regularMembers = selectedData?.orgMembers?.filter(
        (member: OrgMember) => member.user_no !== selectedData.ognz_ldr_user_no
    );

    const btnInfo = [
        {
            seq: '1',
            text: '조직장 등록',
            type: 'LEADER_AUTH_OPEN',
            btnKey: 'all',
        },
        {
            seq: '2',
            text: '대리인 등록',
            type: 'AGT_AUTH',
            btnKey: 'all',
        },
    ];

    const columns: GridDataItem[] = [
        {
            id: 'cbox',
            seq: '0',
            enum: null,
            type: 'COMM_CHECK',
            align: 'center',
            width: '40',
            format: null,
            canedit: null,
            enumKey: null,
            header1: null,
            header2: 'CBOX',
            popupId: null,
            visible: null,
            maxwidth: null,
            minwidth: null,
            required: null,
            customtext: null,
            dataformat: null,
            emptyvalue: null,
            insertedit: null,
            popupPrord: null,
            customformat: null,
            insertdefault: null,
        },

        {
            id: 'flnm',
            seq: '1',
            enum: null,
            type: 'TEXT',
            align: 'center',
            width: '120',
            format: null,
            canedit: true,
            enumKey: null,
            header1: null,
            header2: '이름',
            popupId: null,
            visible: true,
            maxwidth: null,
            minwidth: null,
            required: null,
            customtext: null,
            dataformat: null,
            emptyvalue: null,
            insertedit: null,
            popupPrord: null,
            customformat: null,
            insertdefault: null,
        },
        {
            id: 'user_no',
            seq: '2',
            enum: null,
            type: 'text',
            align: 'center',
            width: '120',
            format: null,
            canedit: false,
            enumKey: null,
            header1: null,
            header2: '사번',
            popupId: null,
            visible: true,
            maxwidth: null,
            minwidth: null,
            required: null,
            customtext: null,
            dataformat: null,
            emptyvalue: null,
            insertedit: null,
            popupPrord: null,
            customformat: null,
            insertdefault: null,
        },
        {
            id: 'apnt_duty_cd',
            seq: '3',
            enum: null,
            type: 'text',
            align: 'center',
            width: '120',
            format: null,
            canedit: false,
            enumKey: null,
            header1: null,
            header2: '직무',
            popupId: null,
            visible: true,
            maxwidth: null,
            minwidth: null,
            required: null,
            customtext: null,
            dataformat: null,
            emptyvalue: null,
            insertedit: null,
            popupPrord: null,
            customformat: null,
            insertdefault: null,
        },
        {
            id: 'apnt_jbps_cd',
            seq: '4',
            enum: null,
            type: 'text',
            align: 'center',
            width: '120',
            format: null,
            canedit: true,
            enumKey: null,
            header1: null,
            header2: '직위',
            popupId: null,
            visible: true,
            maxwidth: null,
            minwidth: null,
            required: null,
            customtext: null,
            dataformat: null,
            emptyvalue: null,
            insertedit: null,
            popupPrord: null,
            customformat: null,
            insertdefault: null,
        },
        {
            id: 'apnt_jbttl_cd',
            seq: '5',
            enum: null,
            type: 'text',
            align: 'center',
            width: '120',
            format: null,
            canedit: true,
            enumKey: null,
            header1: null,
            header2: '직책',
            popupId: null,
            visible: true,
            maxwidth: null,
            minwidth: null,
            required: null,
            customtext: null,
            dataformat: null,
            emptyvalue: null,
            insertedit: null,
            popupPrord: null,
            customformat: null,
            insertdefault: null,
        },
    ];
    const masterUI = {
        grid_tit_info: [
            {
                title: '구성원 리스트',
                description: null,
            },
        ],
        grid_btn_info: btnInfo,
    };

    return (
        <div className='orgMemberNumber'>
            <div className='title'>
                <div className='icon'>
                    <IcoGroup2 fill='#666666' />
                </div>
                <div className='department'>{selectedData.ognz_nm}</div>
                <div className='total'>{selectedData?.orgMembers?.length ?? 0}명</div>
            </div>
            <div className='sortingOrder'>
                <BoxSelect
                    id={'test1'}
                    placeholder='선택하지 않음'
                    label='정렬순서'
                    validationText=''
                    value={selectedValues['test1']}
                    onChange={handleChange('test1')}
                    options={[
                        { value: 1, label: '조직순서' },
                        { value: 2, label: '직책, 직위 순서' },
                        { value: 3, label: '이름 순서' },
                    ]}
                    color='white'
                />
            </div>

            {/* 조직장 섹션 */}
            <MemberCard
                type='조직장'
                member={leaderMember}
                isLeader={true}
                isEmpty={!leaderMember}
                showSetLeader={!leaderMember}
                onSetLeader={handleOpenLeaderModal}
                isOrg={true}
            />

            {/* 구성원 섹션 */}
            <div className='type'>구성원</div>
            <ul className='memberList'>
                {regularMembers?.map((member: OrgMember) => (
                    <li key={member.child_no}>
                        <MemberCard member={member} />
                    </li>
                ))}
            </ul>

            {/* 조직장 설정 모달 */}
            <SwModal
                open={isLeaderModalOpen}
                onClose={handleCloseLeaderModal}
                size='xl'
                maxWidth='794px'
                className='setLeaderModal'
                bottoms={false}
                PaperProps={{
                    sx: {
                        m: 0,
                        height: '100vh',
                        Maximize: '100vh',
                        position: 'fixed',
                        top: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: 0,
                    },
                }}
            >
                <div className='modalConText'>
                    <Typography title={`${selectedData.ognz_nm} 조직장 설정`} type='form'>
                        {selectedData.ognz_nm} 조직장 설정
                    </Typography>
                    {/* 조직장 섹션 */}
                    <MemberCard
                        type='조직장'
                        isEmpty={!leaderMember}
                        showUnselect={!!leaderMember}
                        member={leaderMember || {}}
                        isLeader={true}
                        onUnselect={() => {}}
                    />

                    <ul className='memberInfoList'>
                        {/* 조직장 정보 */}
                        {leaderMember ? (
                            <li className='item'>
                                <MemberCard
                                    type='조직장'
                                    showUnselect={true}
                                    member={
                                        {
                                            name: leaderMember.flnm,
                                            position: `${leaderMember.ognz_nm}, ${leaderMember.apnt_jbps_cd}, ${leaderMember.apnt_jbttl_cd}`,
                                            code: leaderMember.user_no,
                                        } as LeaderMemberDisplay
                                    }
                                    isLeader={true}
                                    hasEtc={true}
                                    tagText='대결자 지정'
                                    authText='관리자 승인 필요'
                                    onUnselect={() => {}}
                                />
                            </li>
                        ) : (
                            <li className='item'>
                                <div className='guideText'>
                                    <IcoInfo className='icon' />
                                    조직장으로 등록 시 사용할 직책을 선택해주세요.
                                </div>
                            </li>
                        )}
                        {/* 대리인 정보 */}
                        {delegateMember ? (
                            <li className='item'>
                                <MemberCard
                                    type='대리인'
                                    showUnselect={true}
                                    member={
                                        {
                                            name: delegateMember?.flnm,
                                            position: `${delegateMember?.ognz_nm}, ${delegateMember?.apnt_jbps_cd}, ${delegateMember?.apnt_jbttl_cd}`,
                                            code: delegateMember?.user_no,
                                        } as LeaderMemberDisplay
                                    }
                                    isLeader={true}
                                    hasEtc={true}
                                    tagText='지정 기간'
                                    dateRange='2025.01.01 ~ 2025.01.30'
                                    onUnselect={() => {}}
                                    onEditDate={() => {}}
                                />
                            </li>
                        ) : (
                            <li className='item'>
                                <div className='guideText'>
                                    <IcoInfo className='icon' />
                                    대리인을 지정해주세요.
                                </div>
                            </li>
                        )}
                    </ul>

                    <Grid container spacing={2}>
                        <Grid item xs={12} sx={{ pr: 2 }}>
                            <Grid item xs={12}>
                                <Grid01
                                    masterUI={masterUI}
                                    tpcdParam=''
                                    gridData={columns}
                                    rowData={regularMembers}
                                    treeCol=''
                                    sheetName='inviteTemplateGrid'
                                    setDetailRetrieve={() => {}}
                                    dataSeInfo={{}}
                                    gridKey='inviteTemplateGrid'
                                    item={{}}
                                    initParam={{}}
                                    gridSortData={[]}
                                    setMasterRetrieve={() => {}}
                                    comboData={[]}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </div>
                <div className='actions alignRight borderStyle'>
                    <Button
                        id='btnDefault11'
                        type='default'
                        size='lg'
                        className='btnWithIcon'
                        onClick={handleCloseLeaderModal}
                    >
                        <IcoDelete fill='#7C7C7C' />
                        취소
                    </Button>
                    <Button id='btnPrmary12' type='primary' size='lg' className='btnWithIcon'>
                        <IcoCheck fill='#fff' /> 저장
                    </Button>
                </div>
            </SwModal>

            {/* 조직장 등록 확인 모달 */}
            <SwModal
                open={isConfirmModalOpen}
                onClose={handleCloseConfirmModal}
                title='조직장 등록'
                className='alertMsg'
            >
                <div className='guideText'>
                    <IcoInfo className='icon' />
                    조직장으로 등록 시 사용할 직책을 선택해주세요.
                    <br />
                    현재의 직책을 그대로 유지할 수도 있습니다.
                </div>
                <BoxSelect
                    id='test1'
                    placeholder='선택하지 않음'
                    label='직책 변경'
                    asterisk
                    validationText=''
                    value={selectedValues['test1']}
                    onChange={handleChange('test1')}
                    options={[
                        { value: 1, label: '팀원' },
                        { value: 2, label: 'Option B' },
                        { value: 3, label: 'Option C' },
                    ]}
                    vertical
                />
                <div className='message'>
                    &apos;<span className='emphasis'>간달프</span>&lsquo;님을 조직장 등록하시겠습니까?
                </div>
                <div className='actions'>
                    <Button
                        id='btnDefault11'
                        type='default'
                        size='lg'
                        className='btnWithIcon'
                        onClick={handleCloseConfirmModal}
                    >
                        취소
                    </Button>
                    <Button id='btnPrmary12' type='primary' size='lg' className='btnWithIcon'>
                        확인
                    </Button>
                </div>
            </SwModal>
        </div>
    );
};

export default OrgMember;
