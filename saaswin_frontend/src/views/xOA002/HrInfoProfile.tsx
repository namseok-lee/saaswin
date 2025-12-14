'use client';

import Button from '@/components/Button';
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
    IcoArrowLeft,
    IcoCollapse,
    IcoCopy,
    IcoEditFill,
    IcoExpand,
    IcoGroup3,
    IcoPerson,
    IcoProfileStroke,
} from '../../../public/asset/Icon';
import styles from './page.module.scss';
import CreaateMyIntrodution from './CreateMyIntrodution';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import InputSearch from '@/components/InputSearch';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import MemberCard from '../sys/obj_manage/components/MemberCard';
import { IcoPersonFill } from '@/assets/Icon';
import { fetcherPostData } from '@/utils/axios';
import dayjs from 'dayjs';
import CommonAttachFileModal from '@/components/ComPopup/CommonAttachFileModal';
import Image from 'next/image';

interface MemberData {
    user_no: string;
    flnm: string;
    ognz_nm: string;
    ognz_no: string;
    apnt_jbps_cd?: string;
    apnt_jbttl_cd?: string;
    apnt_duty_cd?: string;
    apnt_jbgd_cd?: string;
    apnt_grdslry_cd?: string;
    apnt_ttl_cd?: string;
    position?: string;
    bsc_info?: any;
    apnt_info?: any;
}

interface OrgNode {
    ognz_no: string;
    ognz_nm: string;
    up_ognz_no: string | null;
    level: number;
    members: MemberData[];
    children: OrgNode[];
}

export default function HrInfoProfile({
    userData,
    setUserData,
    setRetrieve,
    setMyInfoClick,
}: {
    userData: any;
    setUserData: (data: any) => void;
    setRetrieve: (retrieve: boolean) => void;
    setMyInfoClick: (myInfoClick: boolean) => void;
}) {
    const [tabState, setTabState] = useState('tab1');
    const [modalOpen, setModalOpen] = useState(false);
    const [attachModalData, setAttachModalData] = useState<any>({});
    const [memberList, setMemberList] = useState<any[]>([]);
    const [inputValues, setInputValues] = useState({ searchGroupInfo: '' });
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
    const [myIntro, setMyIntro] = useState<boolean>(true);
    const { user_no, bsc_info, apnt_info, ognz_nm } = userData || {};

    const handleTabClick = (id: string) => {
        if (id === 'tab1') {
            setMyInfoClick(true);
            setRetrieve(true);
            setMyIntro(true);
        } else {
            setMyIntro(false);
        }
        setTabState(id);
    };
    const emailRef = useRef<HTMLDivElement>(null);
    const mobileRef = useRef<HTMLDivElement>(null);
    const telRef = useRef<HTMLDivElement>(null);
    const addressRef = useRef<HTMLDivElement>(null);
    function getWorkDuration(startDateStr: string): string {
        //YYYYMMDD 형식으로 날짜로 근무 개월수 N년 MM월 DD일 형식으로 반환
        if (!startDateStr || startDateStr.length !== 8) return '-';

        const year = parseInt(startDateStr.substring(0, 4), 10);
        const month = parseInt(startDateStr.substring(4, 6), 10) - 1; // JS는 0부터 시작
        const day = parseInt(startDateStr.substring(6, 8), 10);

        const startDate = new Date(year, month, day);
        const today = new Date();

        let years = today.getFullYear() - startDate.getFullYear();
        let months = today.getMonth() - startDate.getMonth();
        let days = today.getDate() - startDate.getDate();

        if (days < 0) {
            months -= 1;
            const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            days += prevMonth.getDate();
        }

        if (months < 0) {
            years -= 1;
            months += 12;
        }

        return `${years}년 ${months}개월 ${days}일`;
    }
    const handleCopy = (ref: React.RefObject<HTMLElement>) => {
        const text = ref.current?.textContent?.trim() || '';
        if (!text) return;
        navigator.clipboard
            .writeText(text)
            .then(() => {
                console.log('success');
            })
            .catch((err) => {
                console.error('복사 실패:', err);
            });
    };

    const handleChange = (id: string, value: string) => {
        setInputValues((prev) => ({ ...prev, [id]: value }));
    };

    const handleMemberClick = (user_no: string) => {
        const selected = filteredMembers.find((m) => m.user_no === user_no);
        if (selected) {
            setUserData(selected);
            setSelectedMemberId(user_no);
            // setSelectedUserData(selected);
        }
    };
    const handleProfileClick = () => {
        setAttachModalData((prev) => ({ ...prev, open: !prev.open }));
    };
    const handleUpload = (attachFileList: any) => {
        if (attachFileList.length === 0) {
            alert('첨부파일을 첨부해주세요.');
            return;
        }
        const file_id = attachFileList[0].file_id;
        const user_no = userData.user_no;
        const bsc_id = bsc_info.bsc_id;
        const sqlId = 'hrs_com01';
        const sqlKey = 'hrs_photo_cud';
        const item = [
            {
                sqlId: sqlId,
                sql_key: sqlKey,
                params: [{ file_id: file_id, user_no: user_no, bsc_id }],
            },
        ];
        fetcherPostData(item)
            .then((response) => {
                console.log('response', response);
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                setRetrieve(true);
            });
    };

    // 데이터 전처리 및 트리 구조 생성 함수
    // 수정된 processOrgData 함수
    const processOrgData = (memberList: any[]) => {
        // 1. 조직 정보와 사용자 정보 분리
        const orgMap = new Map();
        const usersByOrg = new Map();

        memberList.forEach((item) => {
            const {
                ognz_no,
                ognz_nm,
                up_ognz_no,
                level,
                user_no,
                user_id,
                bsc_info,
                apnt_info,
                my_gdntc_info,
                // 추가된 info 필드들
                actno_info,
                comut_info,
                bztrp_info,
                fam_info,
                crr_info,
                dsblty_info,
                rwdptr_info,
                mltsvc_info,
                acbg_info,
                edu_info,
                lgsdy_info,
                wnawd_info,
                qlfc_info,
                dspn_info,
                duty_info,
                itvw_info,
                rprsv_user_no,
            } = item;

            // 조직 정보 저장 (중복 제거)
            if (!orgMap.has(ognz_no)) {
                orgMap.set(ognz_no, {
                    ognz_no,
                    ognz_nm,
                    up_ognz_no,
                    level,
                    rprsv_user_no, // 조직장 정보 추가
                    children: [],
                });
            }

            // 사용자 정보 저장 (user_no가 있는 경우만)
            if (user_no) {
                if (!usersByOrg.has(ognz_no)) {
                    usersByOrg.set(ognz_no, []);
                }
                usersByOrg.get(ognz_no).push({
                    user_no,
                    user_id, // 추가
                    bsc_info,
                    apnt_info,
                    my_gdntc_info, // 추가
                    ognz_no,
                    flnm: bsc_info?.korn_flnm,
                    ognz_nm,
                    apnt_jbps_cd: apnt_info?.apnt_jbps_cd,
                    apnt_jbttl_cd: apnt_info?.apnt_jbttl_cd,
                    apnt_jbgd_cd: apnt_info?.apnt_jbgd_cd,
                    apnt_grdslry_cd: apnt_info?.apnt_grdslry_cd,
                    apnt_ttl_cd: apnt_info?.apnt_ttl_cd,
                    // 추가 info 필드들도 포함
                    actno_info,
                    comut_info,
                    bztrp_info,
                    fam_info,
                    crr_info,
                    dsblty_info,
                    rwdptr_info,
                    mltsvc_info,
                    acbg_info,
                    edu_info,
                    lgsdy_info,
                    wnawd_info,
                    qlfc_info,
                    dspn_info,
                    duty_info,
                    itvw_info,
                });
            }
        });

        // 2. 조직별 사용자 정보 추가
        orgMap.forEach((org, ognz_no) => {
            org.members = usersByOrg.get(ognz_no) || [];
        });

        return { orgMap, usersByOrg };
    };

    // 수정된 buildTree 함수
    const buildTree = (memberList: any[], parentNo: string | null = null): OrgNode[] => {
        const { orgMap } = processOrgData(memberList);

        // 조직 계층 구조 생성
        const buildOrgTree = (parentNo: string | null): OrgNode[] => {
            const result: OrgNode[] = [];

            orgMap.forEach((org) => {
                if (org.up_ognz_no === parentNo) {
                    const orgNode: OrgNode = {
                        ...org,
                        children: buildOrgTree(org.ognz_no),
                    };
                    result.push(orgNode);
                }
            });

            // level 순서로 정렬
            return result.sort((a, b) => a.level - b.level);
        };

        return buildOrgTree(parentNo);
    };

    // 수정된 renderTree 함수
    function renderTree(
        node: OrgNode,
        allMembers: MemberData[],
        isSearchMatched: (member: MemberData) => boolean,
        handleMemberClick: (user_no: string) => void,
        styles: any
    ) {
        // 고유 ID 생성 (조직별로)
        const nodeId = `org-${node.ognz_no}`;

        return (
            <TreeItem key={nodeId} itemId={nodeId} label={node.ognz_nm}>
                {/* 해당 조직의 멤버들 먼저 렌더링 */}
                {node.members &&
                    node.members.length > 0 &&
                    node.members.map((member, index) => (
                        <div key={`user-${member.user_no}`}>
                            <MemberCard
                                member={member}
                                tagText={index === 0 ? '조직장' : ''}
                                isLeader={index === 0}
                                className={`${isSearchMatched(member) ? 'searchResult' : ''} ${styles.memberInfoCard}`}
                                onClick={() => handleMemberClick(member.user_no)}
                            />
                        </div>
                    ))}

                {/* 하위 조직들 재귀 렌더링 */}
                {node.children?.map((child) =>
                    renderTree(child, allMembers, isSearchMatched, handleMemberClick, styles)
                )}
            </TreeItem>
        );
    }

    // memberList를 조직 구조로 변환
    const processedTree = useMemo(() => {
        if (!memberList || memberList.length === 0) return [];

        // 최상위 조직 찾기 (up_ognz_no가 null인 조직들)
        const rootNodes = memberList.filter((item) => item.up_ognz_no === null);

        if (rootNodes.length === 0) {
            // 만약 null인 항목이 없다면, level이 0인 항목들을 찾기
            const levelZeroNodes = memberList.filter((item) => item.level === 0);
            if (levelZeroNodes.length > 0) {
                return buildTree(memberList, levelZeroNodes[0].up_ognz_no);
            }
            // 그래도 없다면 첫 번째 항목의 up_ognz_no 사용
            return buildTree(memberList, memberList[0]?.up_ognz_no);
        }

        return buildTree(memberList, null);
    }, [memberList]);

    // 검색 필터링된 멤버들
    const filteredMembers = useMemo(() => {
        if (!memberList) return [];

        const allMembers = memberList
            .filter((item) => item.user_no) // user_no가 있는 항목만
            .map((item) => ({
                user_no: item.user_no,
                user_id: item.user_id, // 추가
                flnm: item.bsc_info?.korn_flnm,
                ognz_nm: item.ognz_nm,
                ognz_no: item.ognz_no,
                apnt_jbps_cd: item.apnt_info?.apnt_jbps_cd,
                apnt_jbttl_cd: item.apnt_info?.apnt_jbttl_cd,
                apnt_jbgd_cd: item.apnt_info?.apnt_jbgd_cd,
                apnt_grdslry_cd: item.apnt_info?.apnt_grdslry_cd,
                apnt_ttl_cd: item.apnt_info?.apnt_ttl_cd,
                bsc_info: item.bsc_info,
                apnt_info: item.apnt_info,
                my_gdntc_info: item.my_gdntc_info,
                // 추가 info 필드들
                actno_info: item.actno_info,
                comut_info: item.comut_info,
                bztrp_info: item.bztrp_info,
                fam_info: item.fam_info,
                crr_info: item.crr_info,
                dsblty_info: item.dsblty_info,
                rwdptr_info: item.rwdptr_info,
                mltsvc_info: item.mltsvc_info,
                acbg_info: item.acbg_info,
                edu_info: item.edu_info,
                lgsdy_info: item.lgsdy_info,
                wnawd_info: item.wnawd_info,
                qlfc_info: item.qlfc_info,
                dspn_info: item.dspn_info,
                duty_info: item.duty_info,
                itvw_info: item.itvw_info,
            }));

        const keyword = inputValues.searchGroupInfo.trim().toLowerCase();
        if (!keyword) return allMembers;

        return allMembers.filter((member) =>
            [
                member.flnm,
                member.ognz_nm,
                member.apnt_jbps_cd,
                member.apnt_jbttl_cd,
                member.apnt_jbgd_cd,
                member.apnt_grdslry_cd,
                member.apnt_ttl_cd,
            ]
                .filter(Boolean)
                .some((field) => field.toLowerCase().includes(keyword))
        );
    }, [memberList, inputValues.searchGroupInfo]);

    // selectedMember 계산
    const selectedMember = useMemo(() => {
        if (!selectedMemberId) return null;

        // 실제 데이터에서 찾기
        const realMember = filteredMembers.find((member) => member.user_no === selectedMemberId);
        if (realMember) return realMember;

        return null;
    }, [selectedMemberId, filteredMembers]);

    // isSearchMatched 함수 수정
    const isSearchMatched = useCallback(
        (member: MemberData) => {
            const keyword = inputValues.searchGroupInfo.trim().toLowerCase();
            if (!keyword) return false;

            return [member.flnm, member.ognz_nm, member.apnt_jbps_cd, member.apnt_jbttl_cd]
                .filter(Boolean)
                .some((field) => field!.toLowerCase().includes(keyword));
        },
        [inputValues.searchGroupInfo]
    );

    // 2. 조직장 여부 판별
    const selectedMemberOrg = useMemo(() => {
        if (!selectedMember || !memberList) return null;

        // memberList에서 해당 사용자의 조직 정보 찾기
        const orgInfo = memberList.find(
            (item) => item.user_no === selectedMember.user_no && item.ognz_no === selectedMember.ognz_no
        );

        return orgInfo;
    }, [selectedMember, memberList]);
    const isLeaderMember = useMemo(() => {
        if (!selectedMemberOrg) return false;

        // rprsv_user_no와 user_no가 같으면 조직장
        return selectedMemberOrg.rprsv_user_no === selectedMemberOrg.user_no;
    }, [selectedMemberOrg]);

    useEffect(() => {
        const item = [
            {
                sqlId: 'hrs_com01',
                sql_key: 'hrs_ognztree_get_nm',
                params: [{ crtr_ymd: dayjs().format('YYYYMMDD'), std_ymd: dayjs().format('YYYYMMDD') }],
            },
        ];
        setAttachModalData({
            open: false,
            isEditable: false,
            procType: 'hpo',
            value: null,
        });
        fetcherPostData(item)
            .then((response) => {
                setMemberList(response);
            })
            .catch((error) => {
                console.error(error);
            });
    }, [userData]);

    return (
        <div className={styles.hrMyInfo}>
            {selectedMember && (
                <Button className={`${styles.btnBack} btnWithIcon`} onClick={() => setSelectedMemberId(null)}>
                    <IcoArrowLeft fill='#7c7c7c' /> 뒤로가기
                </Button>
            )}
            <div className='tabButtons'>
                <Button
                    className={tabState === 'tab1' ? 'btnTab on btnWithIcon' : 'btnTab btnWithIcon'}
                    id='tab1'
                    onClick={() => handleTabClick('tab1')}
                >
                    내정보
                    <IcoProfileStroke />
                </Button>
                <Button
                    className={tabState === 'tab2' ? 'btnTab on btnWithIcon' : 'btnTab btnWithIcon'}
                    id='tab2'
                    onClick={() => handleTabClick('tab2')}
                >
                    조직원
                    <IcoGroup3 />
                </Button>
            </div>
            {tabState === 'tab1' ? (
                <div className={`tabContents ${styles.myInfo} ${styles.tabCont}`} data-id='tab1'>
                    <div className={styles.container}>
                        <div className={styles.profileImg} onClick={() => handleProfileClick()}>
                            {userData?.bsc_info?.photo_file_nm ? (
                                <Image
                                    src={`https://www.h5on.com/api/file/imgView/${userData?.bsc_info?.photo_file_nm}`}
                                    alt='프로필 이미지'
                                    width={70}
                                    height={70}
                                />
                            ) : (
                                <IcoPerson fill='#666666' />
                            )}
                        </div>
                        <Button className={`btnWithIcon ${styles.btnCreateMyInfo}`} onClick={() => setModalOpen(true)}>
                            내 소개 만들기 <IcoEditFill fill='#7C7C7C' />
                        </Button>
                        <ul className={styles.infoList}>
                            {bsc_info?.korn_flnm && (
                                <li className={styles.item}>
                                    <span className={styles.title}>이름</span>
                                    <div className={styles.text}>{bsc_info.korn_flnm}</div>
                                </li>
                            )}
                            {userData?.user_no && (
                                <li className={styles.item}>
                                    <span className={styles.title}>사번</span>
                                    <div className={styles.text}>{user_no}</div>
                                </li>
                            )}
                            <li className={styles.item}>
                                <span className={styles.title}>소속부서</span>
                                <div className={styles.text}>{ognz_nm}</div>
                            </li>
                            {/* <li className={styles.item}>
                                <span className={styles.title}>겸직부서</span>
                                <div className={styles.text}>기술솔루션팀</div>
                            </li> */}
                            {bsc_info?.lbr_formt_cd && (
                                <li className={styles.item}>
                                    <span className={styles.title}>근로형태</span>
                                    <div className={styles.text}>{bsc_info.lbr_formt_cd}</div>
                                </li>
                            )}
                            <li className={styles.item}>
                                <span className={styles.title}>근무유형</span>
                                <div className={styles.text}>고정출퇴근제 기본형</div>
                            </li>
                            {apnt_info?.apnt_jbps_cd && (
                                <li className={styles.item}>
                                    <span className={styles.title}>직위</span>
                                    <div className={styles.text}>{apnt_info.apnt_jbps_cd}</div>
                                </li>
                            )}
                            {apnt_info?.apnt_jbttl_cd && (
                                <li className={styles.item}>
                                    <span className={styles.title}>직책</span>
                                    <div className={styles.text}>{apnt_info.apnt_jbttl_cd}</div>
                                </li>
                            )}
                            {apnt_info?.apnt_jbgd_cd && apnt_info?.apnt_jbgd_cd !== '직급없음' && (
                                <li className={styles.item}>
                                    <span className={styles.title}>직급</span>
                                    <div className={styles.text}>{apnt_info.apnt_jbgd_cd}</div>
                                </li>
                            )}
                            {apnt_info?.apnt_grdslry_cd && apnt_info?.apnt_grdslry_cd !== '호봉없음' && (
                                <li className={styles.item}>
                                    <span className={styles.title}>호봉</span>
                                    <div className={styles.text}>{apnt_info.apnt_grdslry_cd}</div>
                                </li>
                            )}
                            {apnt_info?.apnt_ttl_cd && apnt_info?.apnt_ttl_cd !== '호칭없음' && (
                                <li className={styles.item}>
                                    <span className={styles.title}>호칭</span>
                                    <div className={styles.text}>{apnt_info.apnt_ttl_cd}</div>
                                </li>
                            )}
                            {bsc_info?.frst_jncmp_ymd && (
                                <>
                                    <li className={styles.item}>
                                        <span className={styles.title}>근무년수</span>
                                        <div className={styles.text}>{getWorkDuration(bsc_info.frst_jncmp_ymd)}</div>
                                    </li>
                                    <li className={styles.item}>
                                        <span className={styles.title}>입사일</span>
                                        <div className={styles.text}>
                                            {dayjs(bsc_info.frst_jncmp_ymd).format('YYYY.MM.DD')}
                                        </div>
                                    </li>
                                    <li className={styles.item}>
                                        <span className={styles.title}>최초입사일</span>
                                        <div className={styles.text}>
                                            {dayjs(bsc_info.frst_jncmp_ymd).format('YYYY.MM.DD')}
                                        </div>
                                    </li>
                                </>
                            )}
                            {bsc_info?.rsgntn_ymd && (
                                <li className={styles.item}>
                                    <span className={styles.title}>퇴사일자</span>
                                    <div className={styles.text}>{bsc_info.rsgntn_ymd}</div>
                                </li>
                            )}
                        </ul>
                        <ul className={styles.infoList}>
                            {userData?.user_id && (
                                <li className={styles.item}>
                                    <span className={styles.title}>이메일</span>
                                    <div className={styles.text} ref={emailRef}>
                                        {userData.user_id}
                                        <Button className={styles.btnCopy} onClick={() => handleCopy(emailRef)}>
                                            <IcoCopy fill='#666666' />
                                        </Button>
                                    </div>
                                </li>
                            )}
                            {bsc_info?.user_mbl_telno && (
                                <li className={styles.item}>
                                    <span className={styles.title}>휴대폰</span>
                                    <div className={styles.text} ref={mobileRef}>
                                        {bsc_info.user_mbl_telno}
                                        <Button className={styles.btnCopy} onClick={() => handleCopy(mobileRef)}>
                                            <IcoCopy fill='#666666' />
                                        </Button>
                                    </div>
                                </li>
                            )}
                            {bsc_info?.ext_no && (
                                <li className={styles.item}>
                                    <span className={styles.title}>내선 번호</span>
                                    <div className={styles.text} ref={telRef}>
                                        {bsc_info.ext_no}
                                        <Button className={styles.btnCopy} onClick={() => handleCopy(telRef)}>
                                            <IcoCopy fill='#666666' />
                                        </Button>
                                    </div>
                                </li>
                            )}
                            {bsc_info?.home_telno && (
                                <li className={styles.item}>
                                    <span className={styles.title}>자택 전화번호</span>
                                    <div className={styles.text} ref={telRef}>
                                        {bsc_info.home_telno}
                                        <Button className={styles.btnCopy} onClick={() => handleCopy(telRef)}>
                                            <IcoCopy fill='#666666' />
                                        </Button>
                                    </div>
                                </li>
                            )}
                            {bsc_info?.addr && (
                                <li className={styles.item}>
                                    <span className={styles.title}>주소</span>
                                    <div className={styles.text} ref={addressRef}>
                                        {bsc_info.addr}
                                        <Button className={styles.btnCopy} onClick={() => handleCopy(addressRef)}>
                                            <IcoCopy fill='#666666' />
                                        </Button>
                                    </div>
                                </li>
                            )}
                            {bsc_info?.brdt && (
                                <li className={styles.item}>
                                    <span className={styles.title}>생년월일</span>
                                    <div className={styles.text}>{dayjs(bsc_info.brdt).format('YYYY.MM.DD')}</div>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            ) : (
                <div className={`tabContents ${styles.groupInfo} ${styles.myInfo} ${styles.tabCont}`} data-id='tab2'>
                    {selectedMember ? (
                        <div className={styles.memberGroupInfo}>
                            <MemberCard
                                key={selectedMember.user_no}
                                member={selectedMember}
                                tagText={isLeaderMember ? '조직장' : ''}
                                isLeader={isLeaderMember}
                                className={`${styles.memberInfoCard}`}
                                onClick={() => handleMemberClick(selectedMember.user_no!)}
                                code={false}
                                isOrg={false}
                            />
                            {selectedMember?.my_gdntc_info?.gdntc_rls_yn === 'Y' ? (
                                <Button
                                    className={`btnWithIcon ${styles.btnCreateMyInfo}`}
                                    onClick={() => setModalOpen(true)}
                                >
                                    자기 소개 보기 <IcoPersonFill fill='#7C7C7C' />
                                </Button>
                            ) : null}
                            <ul className={styles.infoList}>
                                {selectedMember?.bsc_info?.korn_flnm && (
                                    <li className={styles.item}>
                                        <span className={styles.title}>이름</span>
                                        <div className={styles.text}>{selectedMember.bsc_info.korn_flnm}</div>
                                    </li>
                                )}
                                {selectedMember?.user_no && (
                                    <li className={styles.item}>
                                        <span className={styles.title}>사번</span>
                                        <div className={styles.text}>{selectedMember.user_no}</div>
                                    </li>
                                )}
                                {selectedMember?.ognz_nm && (
                                    <li className={styles.item}>
                                        <span className={styles.title}>소속부서</span>
                                        <div className={styles.text}>{selectedMember.ognz_nm}</div>
                                    </li>
                                )}
                                {selectedMember?.apnt_info?.apnt_emp_se_cd && (
                                    <li className={styles.item}>
                                        <span className={styles.title}>근로형태</span>
                                        <div className={styles.text}>{selectedMember.bsc_info.lbr_formt_cd}</div>
                                    </li>
                                )}
                                {selectedMember?.apnt_jbps_cd && (
                                    <li className={styles.item}>
                                        <span className={styles.title}>직위 </span>
                                        <div className={styles.text}>{selectedMember.apnt_jbps_cd}</div>
                                    </li>
                                )}
                                {selectedMember?.apnt_jbttl_cd && (
                                    <li className={styles.item}>
                                        <span className={styles.title}>직책</span>
                                        <div className={styles.text}>{selectedMember.apnt_jbttl_cd}</div>
                                    </li>
                                )}
                                {selectedMember?.apnt_jbgd_cd && selectedMember?.apnt_jbgd_cd !== '직급없음' && (
                                    <li className={styles.item}>
                                        <span className={styles.title}>직급</span>
                                        <div className={styles.text}>{selectedMember.apnt_jbgd_cd}</div>
                                    </li>
                                )}
                                {selectedMember?.apnt_grdslry_cd && selectedMember?.apnt_grdslry_cd !== '호봉없음' && (
                                    <li className={styles.item}>
                                        <span className={styles.title}>호봉</span>
                                        <div className={styles.text}>{selectedMember.apnt_grdslry_cd}</div>
                                    </li>
                                )}
                                {selectedMember?.apnt_ttl_cd && selectedMember?.apnt_ttl_cd !== '호칭없음' && (
                                    <li className={styles.item}>
                                        <span className={styles.title}>호칭</span>
                                        <div className={styles.text}>{selectedMember.apnt_ttl_cd}</div>
                                    </li>
                                )}
                                {selectedMember?.bsc_info?.apnt_jncmp_ymd && (
                                    <li className={styles.item}>
                                        <span className={styles.title}>근무년수</span>
                                        <div className={styles.text}>
                                            {getWorkDuration(selectedMember.apnt_info.apnt_jncmp_ymd)}
                                        </div>
                                    </li>
                                )}
                                {selectedMember?.apnt_info?.apnt_jncmp_ymd && (
                                    <li className={styles.item}>
                                        <span className={styles.title}>입사일</span>
                                        <div className={styles.text}>{selectedMember.apnt_info.apnt_jncmp_ymd}</div>
                                    </li>
                                )}
                            </ul>
                            <ul className={styles.infoList}>
                                {selectedMember?.user_id && (
                                    <li className={styles.item}>
                                        <span className={styles.title}>이메일</span>
                                        <div className={styles.text} ref={emailRef}>
                                            {selectedMember.user_id}
                                            <Button className={styles.btnCopy} onClick={() => handleCopy(emailRef)}>
                                                <IcoCopy fill='#666666' />
                                            </Button>
                                        </div>
                                    </li>
                                )}
                                {selectedMember?.bsc_info?.user_mbl_telno && (
                                    <li className={styles.item}>
                                        <span className={styles.title}>휴대폰</span>
                                        <div className={styles.text} ref={mobileRef}>
                                            {selectedMember.bsc_info.user_mbl_telno}
                                            <Button className={styles.btnCopy} onClick={() => handleCopy(mobileRef)}>
                                                <IcoCopy fill='#666666' />
                                            </Button>
                                        </div>
                                    </li>
                                )}
                                {selectedMember?.bsc_info?.co_telno && (
                                    <li className={styles.item}>
                                        <span className={styles.title}>내선 번호</span>
                                        <div className={styles.text} ref={telRef}>
                                            {selectedMember.bsc_info.co_telno}
                                            <Button className={styles.btnCopy} onClick={() => handleCopy(telRef)}>
                                                <IcoCopy fill='#666666' />
                                            </Button>
                                        </div>
                                    </li>
                                )}
                                {selectedMember?.bsc_info?.addr && (
                                    <li className={styles.item}>
                                        <span className={styles.title}>주소</span>
                                        <div className={styles.text} ref={addressRef}>
                                            {selectedMember.bsc_info.addr}
                                            <Button className={styles.btnCopy} onClick={() => handleCopy(addressRef)}>
                                                <IcoCopy fill='#666666' />
                                            </Button>
                                        </div>
                                    </li>
                                )}
                                {selectedMember?.bsc_info?.brdt && (
                                    <li className={styles.item}>
                                        <span className={styles.title}>생년월일</span>
                                        <div className={styles.text}>
                                            {`${selectedMember.bsc_info.brdt.slice(
                                                0,
                                                4
                                            )}.${selectedMember.bsc_info.brdt.slice(
                                                4,
                                                6
                                            )}.${selectedMember.bsc_info.brdt.slice(6, 8)}`}
                                        </div>
                                    </li>
                                )}
                            </ul>
                        </div>
                    ) : (
                        <>
                            <div className={styles.searchBox}>
                                <InputSearch
                                    type='text'
                                    id='searchGroupInfo'
                                    placeholder='Search'
                                    value={inputValues.searchGroupInfo}
                                    onChange={(e) => handleChange('searchGroupInfo', e.target.value)}
                                    color='white'
                                />
                            </div>
                            <SimpleTreeView
                                slots={{
                                    expandIcon: () => <IcoCollapse />,
                                    collapseIcon: () => <IcoExpand />,
                                    endIcon: () => <IcoExpand />,
                                }}
                                className={`treeView ${styles.treeView}`}
                            >
                                {processedTree.map((rootNode) =>
                                    renderTree(rootNode, filteredMembers, isSearchMatched, handleMemberClick, styles)
                                )}
                            </SimpleTreeView>
                        </>
                    )}
                </div>
            )}
            <CreaateMyIntrodution
                userData={myIntro ? userData : selectedMember}
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                setRetrieve={setRetrieve}
            />
            <CommonAttachFileModal
                params={attachModalData}
                setParams={setAttachModalData}
                handleUpload={handleUpload}
                allowMultiple={false}
            />
        </div>
    );
}
