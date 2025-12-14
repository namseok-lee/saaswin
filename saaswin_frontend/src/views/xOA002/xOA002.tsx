'use client';

import Typography from '@/components/Typography';
import { useEffect, useState } from 'react';
import { useLayoutStyle } from '../../app/layout/mainLayout/context/LayoutStyleContext';
import HrInfoCard from './HrInfoCard';
import styles from './page.module.scss';
import QuickMenu from './QuickMenu';
import dayjs from 'dayjs';
import { fetcherPostCommonData, fetcherPostData } from '@/utils/axios';
import CardDetail from './CardDetail';
import {
    IcoCardCareer,
    IcoCardContact,
    IcoCardAppointment,
    IcoCardEducation,
    IcoCardHistory,
    IcoCardData,
    IcoCardReward,
    IcoCardTraining,
    IcoCardMilitary,
    IcoCardFamily,
    IcoCardDisabled,
    IcoCardPatriptism,
    IcoCardQualification,
    IcoCardLanguage,
    IcoCardHr,
} from '../../../public/asset/Icon';
import { useDragStore } from '@/utils/store/UseDragStore';
import { useCardOrderStore } from '@/utils/store/useCardOrderStore';

interface UserData {
    bsc_info?: Record<string, any>;
    apnt_info?: Record<string, any>;
    acbg_info?: any[];
    [key: string]: any;
}

// 초기 메뉴 아이템 정의
const initialMenuItems = [
    { id: 'cardSlot1', icon: <IcoCardHr fill='#666666' />, label: '근로자정보' },
    { id: 'cardSlot2', icon: <IcoCardContact fill='#666666' />, label: '주소/연락처' },
    { id: 'cardSlot3', icon: <IcoCardAppointment fill='#666666' />, label: '발령' },
    { id: 'cardSlot4', icon: <IcoCardEducation fill='#666666' />, label: '학력' },
    { id: 'cardSlot5', icon: <IcoCardCareer fill='#666666' />, label: '경력' },
    { id: 'cardSlot6', icon: <IcoCardQualification fill='#666666' />, label: '자격' },
    { id: 'cardSlot7', icon: <IcoCardLanguage fill='#666666' />, label: '어학' },
    { id: 'cardSlot8', icon: <IcoCardHistory fill='#666666' />, label: '직무이력' },
    { id: 'cardSlot9', icon: <IcoCardTraining fill='#666666' />, label: '교육' },
    { id: 'cardSlot10', icon: <IcoCardReward fill='#666666' />, label: '상벌' },
    { id: 'cardSlot11', icon: <IcoCardMilitary fill='#666666' />, label: '병역' },
    { id: 'cardSlot12', icon: <IcoCardFamily fill='#666666' />, label: '가족' },
    { id: 'cardSlot13', icon: <IcoCardDisabled fill='#666666' />, label: '장애' },
    { id: 'cardSlot14', icon: <IcoCardPatriptism fill='#666666' />, label: '보훈' },
    { id: 'cardSlot15', icon: <IcoCardData fill='#666666' />, label: '자료함' },
];

export default function XOA002({ tpcdParam }: { tpcdParam: string }) {
    const auth = JSON.parse(localStorage.getItem('auth') || '{}');
    const work_user_no = auth?.state?.userNo;
    const [userData, setUserData] = useState<UserData | null>(null);
    const [retrieve, setRetrieve] = useState(true);
    const [dutyYn, setDutyYn] = useState(false);
    const [currentOrder, setCurrentOrder] = useState<string[]>([]); // 슬롯 순서 저장용
    const [currentItems, setCurrentItems] = useState<string[]>([]); // 아이템 순서 저장용
    const [menuItems, setMenuItems] = useState<any[]>([]); // 메뉴 아이템 상태
    const { order, setOrder, resetOrder } = useCardOrderStore();
    const { dragEnabled, toggleDrag } = useDragStore();
    // const [photoFileId, setPhotoFileId] = useState('');
    // 상세보기 상태 추가
    const [showDetail, setShowDetail] = useState(false);
    const [selectedCardKey, setSelectedCardKey] = useState('');
    const [selectedCardTitle, setSelectedCardTitle] = useState('');
    const [myInfoClick, setMyInfoClick] = useState(false);
    // 카드 키에 따른 tpcd 매핑
    const getTpcdByCardKey = (key: string): string => {
        const cardMapping: Record<string, string> = {
            cardSlot1: 'RE002T01', // 근로자정보 (인적사항)
            cardSlot2: 'RE002T02', // 주소/연락처
            cardSlot3: 'RE002T03', // 발령
            cardSlot4: 'RE002T04', // 학력
            cardSlot5: 'RE002T05', // 경력
            cardSlot6: 'RE002T06', // 자격
            cardSlot7: 'RE002T07', // 어학
            cardSlot8: 'RE002T08', // 직무이력
            cardSlot9: 'RE002T09', // 교육
            cardSlot10: 'RE002T10', // 상벌
            cardSlot11: 'RE002T11', // 병역
            cardSlot12: 'RE002T12', // 가족
            cardSlot13: 'RE002T13', // 장애
            cardSlot14: 'RE002T14', // 보훈
            cardSlot15: 'RE002T15', // 자료함
        };
        return cardMapping[key] || 'RE002T01';
    };

    // 카드 클릭 핸들러
    const handleCardClick = (cardKey: string, cardTitle: string) => {
        setSelectedCardKey(cardKey);
        setSelectedCardTitle(cardTitle);
        setShowDetail(true);
    };

    // 목록으로 돌아가기 핸들러
    const handleBackToList = () => {
        setShowDetail(false);
        setSelectedCardKey('');
        setSelectedCardTitle('');
        setRetrieve(true);
    };

    useEffect(() => {
        if (retrieve) {
            const myUserNo = !userData?.user_no || myInfoClick ? work_user_no : userData.user_no;

            const sqlId = 'hpo_com01';
            const sqlKey = 'hpo_tom_bsc_all_select';

            const item = {
                sqlId: sqlId,
                sql_key: sqlKey,
                params: [{ std_ymd: dayjs().format('YYYYMMDD'), user_no: myUserNo }],
            };

            fetcherPostData([item])
                .then((res) => {
                    setUserData(res[0]);
                })
                .finally(() => {
                    setRetrieve(false);
                    setMyInfoClick(false);
                });
        }
    }, [retrieve, myInfoClick]);
    useEffect(() => {
        const item = {
            sqlId: 'hrs_sqlgen01',
            sql_key: 'hrs_sqlgen_select',
            params: [
                {
                    work_user_no: work_user_no,
                    scr_no: 'SE',
                    where: [
                        {
                            condition: 'equals',
                            fdname: 'rprs_ognz_no',
                            value: 'WIN',
                        },
                    ],
                    user_no: work_user_no,
                },
            ],
        };
        fetcherPostCommonData([item]).then((res) => {
            const resData = res[0].hpo_info?.duty;
            if (!resData) {
                setMenuItems(initialMenuItems.filter((item) => item.id !== 'cardSlot8'));
            } else {
                setMenuItems(initialMenuItems);
            }

            setDutyYn(resData);
        });
    }, [userData]);
    const { setBgColor, setPadding } = useLayoutStyle();
    useEffect(() => {
        setBgColor('#f6f9fb'); // AliceBlue
        setPadding('0 0 0 181px'); // 페이지에 맞는 패딩
    }, [setBgColor, setPadding]);

    // 저장된 카드 순서에 따라 메뉴 아이템 정렬
    useEffect(() => {
        if (order.length > 0) {
            // 저장된 카드 순서에 맞게 메뉴 아이템 재정렬
            const sortedMenuItems = order
                .map((cardId) => {
                    // 카드 ID에 해당하는 메뉴 아이템 찾기
                    return initialMenuItems.find((item) => item.id === cardId);
                })
                .filter(Boolean) as typeof initialMenuItems;

            // 정렬된 메뉴 아이템으로 상태 업데이트
            setMenuItems(sortedMenuItems);
        }
    }, [order]);

    // 카드 순서 변경 시 호출되는 함수
    const handleOrderChange = (slots: string[], items?: string[]) => {
        if (items && items.length > 0) {
            setCurrentItems(items);
        }
        setCurrentOrder(slots);

        // 카드 순서에 맞게 메뉴 아이템도 재정렬
        const newMenuItems = slots
            .map((slot) => initialMenuItems.find((item) => item.id === slot))
            .filter(Boolean) as typeof initialMenuItems;

        setMenuItems(newMenuItems);
    };

    // 저장 버튼 클릭 시 호출되는 함수
    const handleSaveOrder = () => {
        if (currentOrder.length > 0) {
            // 슬롯과 아이템 정보 모두 저장
            const itemMap: Record<string, string> = {};

            // 현재 슬롯과 아이템 정보로 맵 생성
            if (currentItems.length === currentOrder.length) {
                currentOrder.forEach((slot, index) => {
                    itemMap[slot] = currentItems[index];
                });
            }

            // 슬롯 순서와 아이템 맵 모두 저장
            setOrder(currentOrder, itemMap);
            toggleDrag(); // 저장 후 드래그 모드 종료
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.titleArea}>
                <Typography type='page' tooltip title='통합 인사정보 관리'>
                    통합 인사정보 관리
                </Typography>
            </div>
            <div className={styles.hrPersonalInfo}>
                <div className={styles.hrInfoCard}>
                    {/* 인사정보 일괄관리 이낫정보 1:1보기 넣기 */}

                    {showDetail ? (
                        <div style={{ height: 'calc(100vh - 120px)', overflow: 'auto' }}>
                            {(() => {
                                const tpcd = getTpcdByCardKey(selectedCardKey);
                                return (
                                    <CardDetail
                                        tpcd={tpcd}
                                        title={selectedCardTitle}
                                        userData={userData}
                                        setMasterRetrieve={setRetrieve}
                                    />
                                );
                            })()}
                        </div>
                    ) : (
                        <HrInfoCard
                            dutyYn={dutyYn}
                            userData={userData}
                            dragEnabled={dragEnabled}
                            onOrderChange={handleOrderChange} // 자식 → 부모 순서 업데이트 전달
                            onCardClick={handleCardClick} // 카드 클릭 핸들러 추가
                        />
                    )}
                </div>
                <div className={styles.quickMenuArea}>
                    <QuickMenu items={menuItems} dragEnabled={dragEnabled} onItemClick={handleCardClick} />
                </div>
            </div>
        </div>
    );
}
