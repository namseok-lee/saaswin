'use client';

import Button from '@/components/Button';
import '../styles.scss';
import { IcoArrowOutWard, IcoEdit, IcoPerson } from '../../../../../public/asset/Icon';
import Image from 'next/image';

interface MemberData {
    flnm?: string;
    name?: string;
    user_no?: string;
    code?: string;
    ognz_nm?: string;
    apnt_jbps_cd?: string;
    apnt_duty_cd?: string;
    position?: string;
    [key: string]: any; // 기타 추가 속성을 위한 인덱스 시그니처
}

interface MemberCardProps {
    member?: MemberData;
    type?: string;
    isLeader?: boolean;
    isEmpty?: boolean;
    hasEtc?: boolean;
    tagText?: string;
    authText?: string;
    dateRange?: string | null;
    showUnselect?: boolean;
    showSetLeader?: boolean;
    onUnselect?: () => void;
    onSetLeader?: () => void;
    onEditDate?: () => void;
    className?: string;
    onClick?: () => void;
    code?: boolean;
    isOrg?: boolean;
}
/**
 * MemberCard 컴포넌트 - 조직원 정보를 표시하는 공통 컴포넌트
 */
const MemberCard: React.FC<MemberCardProps> = ({
    member = {},
    type = '',
    isLeader = false,
    isEmpty = false,
    hasEtc = false,
    tagText = '',
    authText = '',
    dateRange = null,
    showUnselect = false,
    showSetLeader = false,
    onUnselect = () => {},
    onSetLeader = () => {},
    onEditDate = () => {},
    className,
    onClick,
    code,
}) => {
    const photoFileId = member?.bsc_info?.photo_file_nm;

    // 빈 상태 (데이터 없음)
    if (isEmpty) {
        return (
            <div className={`memberInfo nodata ${isLeader ? 'leader' : ''}`}>
                <div className='icon'>
                    <IcoPerson fill='#666666' />
                </div>
                <div className='text'>
                    {type === '조직장' ? (
                        <>
                            아직 조직장이 없습니다.
                            <br />
                            조직장을 설정해보세요
                        </>
                    ) : (
                        `${type}이(가) 지정되지 않았습니다.`
                    )}
                </div>
                {showSetLeader && (
                    <Button type='default' size='sm' className='btnWithIcon btnSetLeader' onClick={onSetLeader}>
                        조직장 지정하기
                        <IcoArrowOutWard />
                    </Button>
                )}
            </div>
        );
    }

    // 멤버 카드 (데이터 있음)
    return (
        <>
            {type && (
                <div className='type'>
                    {type}
                    {showUnselect && (
                        <Button type='default' size='sm' className='btnUnSelect' onClick={onUnselect}>
                            {type} 해제
                        </Button>
                    )}
                </div>
            )}
            <div className={`${className ? className : ''} memberInfo ${isLeader ? 'leader' : ''}`} onClick={onClick}>
                <div className='img'>
                    <Image
                        src={`https://www.h5on.com/api/file/imgView/${photoFileId}`}
                        alt='프로필 이미지'
                        width={70}
                        height={70}
                    />
                    {/* <img src='/img/profile_temp.png' alt='' /> */}
                </div>
                <div className='profile'>
                    <div className='name'>{member?.bsc_info?.korn_flnm || '-'}</div>
                    <div className='position'>
                        {member.apnt_info?.jbps_cd || '-'} , {member.apnt_info?.jbttl_cd || '-'}
                    </div>
                    {(hasEtc || tagText || authText || dateRange) && (
                        <div className='etc'>
                            {tagText && <div className='tag'>{tagText}</div>}
                            {authText && <div className='auth'>{authText}</div>}
                            {dateRange && (
                                <div className='text'>
                                    {dateRange}
                                    <Button className='btnEditTerm' onClick={onEditDate}>
                                        <IcoEdit fill='#666666' />
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                    {!tagText && isLeader && !hasEtc && <div className='tag'>조직장</div>}
                </div>
                {code && <div className='code'>{member.user_no || member.code}</div>}
            </div>
        </>
    );
};

export default MemberCard;
