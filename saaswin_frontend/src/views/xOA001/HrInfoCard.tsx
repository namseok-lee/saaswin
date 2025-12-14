'use client';

import Card from '@/components/Card';
import Empty from '@/components/Empty';
import { useEffect, useRef, useState } from 'react';
import { cardData as defaultCardItems } from './cardData';
import styles from './page.module.scss';
import { useCardOrderStore } from '@/utils/store/useCardOrderStore';

interface UserData {
    brdt?: string;
    bsc_info?: Record<string, unknown>;
    [key: string]: unknown;
}

interface HrInfoCardProps {
    userData: UserData | null;
    dragEnabled: boolean;
    dutyYn: boolean;
    onOrderChange?: (order: string[], items?: string[]) => void;
    onCardClick?: (cardKey: string, cardTitle: string) => void;
}

export default function HrInfoCard({ userData, dragEnabled, dutyYn, onOrderChange, onCardClick }: HrInfoCardProps) {
    const containerRef = useRef<HTMLUListElement | null>(null);
    const { order, itemMap, setOrder, initializeFromStorage } = useCardOrderStore();
    const [orderedItems, setOrderedItems] = useState<(typeof defaultCardItems)[0][]>([]);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null); // 드래그 오버 상태 관리
    const [isInitialized, setIsInitialized] = useState(false);
    const prevOrderRef = useRef<string[]>([]); // 🔐 이전 order 기록
    const [customDragElement, setCustomDragElement] = useState<HTMLElement | null>(null);
    const [autoScrollInterval, setAutoScrollInterval] = useState<NodeJS.Timeout | null>(null);
    const [tempOrder, setTempOrder] = useState<string[]>([]); // 임시 순서 저장
    const [tempItemMap, setTempItemMap] = useState<Record<string, string>>({}); // 임시 아이템 맵
    // 초기화
    useEffect(() => {
        initializeFromStorage();
        setIsInitialized(true);
    }, [initializeFromStorage]);

    // localStorage에서 불러온 순서를 임시 순서로도 설정
    useEffect(() => {
        if (isInitialized && order.length > 0) {
            setTempOrder(order);
            setTempItemMap(itemMap);
        }
    }, [order, itemMap, isInitialized]);

    // 컴포넌트 언마운트 시 자동 스크롤 정리
    useEffect(() => {
        return () => {
            if (autoScrollInterval) {
                clearInterval(autoScrollInterval);
            }
        };
    }, [autoScrollInterval]);

    // 부모에게 순서 변경 알림 (임시 순서 기준)
    useEffect(() => {
        if (isInitialized && tempOrder.length > 0 && onOrderChange) {
            const items =
                Object.keys(tempItemMap).length > 0 ? tempOrder.map((key) => tempItemMap[key] || key) : tempOrder;

            const prevOrder = prevOrderRef.current;
            if (JSON.stringify(prevOrder) !== JSON.stringify(tempOrder)) {
                onOrderChange(tempOrder, items);
                prevOrderRef.current = tempOrder;
            }
        }
    }, [tempOrder, tempItemMap, onOrderChange, isInitialized]);

    // 기본 순서로 초기화
    useEffect(() => {
        if (isInitialized && order.length === 0 && defaultCardItems.length > 0) {
            const defaultOrder = defaultCardItems.map((card) => String(card.key));
            const newItemMap: Record<string, string> = {};
            defaultOrder.forEach((key) => {
                newItemMap[key] = key;
            });
            setOrder(defaultOrder, newItemMap);
            setTempOrder(defaultOrder);
            setTempItemMap(newItemMap);
        }
    }, [order.length, setOrder, isInitialized]);

    // 정렬된 카드 아이템 계산 (임시 순서 기준)
    useEffect(() => {
        if (tempOrder.length > 0) {
            const sorted = getOrderedItems();
            const filteredItems = dutyYn ? sorted : sorted.filter((item) => item.key !== 'cardSlot8');
            setOrderedItems(filteredItems);
        }
    }, [tempOrder, dutyYn]);
    // 자동 스크롤 함수
    const handleAutoScroll = (clientY: number) => {
        const scrollContainer = containerRef.current?.closest('.hrInfoCard') as HTMLElement;
        if (!scrollContainer) return;

        const containerRect = scrollContainer.getBoundingClientRect();
        const scrollThreshold = 100; // 스크롤 트리거 영역 (픽셀)
        const scrollSpeed = 10; // 스크롤 속도

        // 기존 자동 스크롤 정리
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
            setAutoScrollInterval(null);
        }

        // 위쪽 영역에서 위로 스크롤
        if (clientY < containerRect.top + scrollThreshold) {
            const interval = setInterval(() => {
                scrollContainer.scrollTop -= scrollSpeed;
                if (scrollContainer.scrollTop <= 0) {
                    clearInterval(interval);
                    setAutoScrollInterval(null);
                }
            }, 16); // 60fps
            setAutoScrollInterval(interval);
        }
        // 아래쪽 영역에서 아래로 스크롤
        else if (clientY > containerRect.bottom - scrollThreshold) {
            const interval = setInterval(() => {
                const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
                scrollContainer.scrollTop += scrollSpeed;
                if (scrollContainer.scrollTop >= maxScroll) {
                    clearInterval(interval);
                    setAutoScrollInterval(null);
                }
            }, 16); // 60fps
            setAutoScrollInterval(interval);
        }
    };

    // 드래그 중 마우스 위치 업데이트
    const updateDragPosition = (e: React.DragEvent) => {
        if (customDragElement) {
            customDragElement.style.left = e.clientX - 150 + 'px';
            customDragElement.style.top = e.clientY - 100 + 'px';
        }

        // 자동 스크롤 처리
        handleAutoScroll(e.clientY);
    };

    const handleCardMove = (sourceIndex: number, destinationIndex: number) => {
        if (sourceIndex === destinationIndex) return;

        // console.log(`카드 이동: ${sourceIndex} -> ${destinationIndex}`);
        // console.log('이동 전 순서:', tempOrder);
        // console.log(
        //     '이동 전 아이템:',
        //     orderedItems.map((item) => item.title)
        // );

        // 배열 복사
        const newTempOrder = [...tempOrder];

        // 간단한 swap 방식 사용
        const temp = newTempOrder[sourceIndex];
        newTempOrder[sourceIndex] = newTempOrder[destinationIndex];
        newTempOrder[destinationIndex] = temp;

        // console.log('이동 후 순서:', newTempOrder);

        const newTempItemMap: Record<string, string> = { ...tempItemMap };
        newTempOrder.forEach((key) => {
            if (!newTempItemMap[key]) {
                newTempItemMap[key] = key;
            }
        });

        // 임시 상태만 업데이트
        setTempOrder(newTempOrder);
        setTempItemMap(newTempItemMap);
    };

    const handleDragStart = (e: React.DragEvent<HTMLLIElement>, index: number) => {
        if (!dragEnabled) {
            e.preventDefault();
            return;
        }

        console.log(
            `드래그 시작: 인덱스 ${index}, 카드: ${orderedItems[index]?.title}, 키: ${orderedItems[index]?.key}`
        );

        // 브라우저 기본 드래그 이미지를 투명하게 만들기
        const emptyImg = new Image();
        emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        e.dataTransfer.setDragImage(emptyImg, 0, 0);

        // 커스텀 드래그 요소 생성
        const draggedEl = e.currentTarget;
        const cardWrap = draggedEl.querySelector(`.${styles.cardWrap}`) as HTMLElement;

        if (cardWrap) {
            const clone = cardWrap.cloneNode(true) as HTMLElement;
            clone.style.position = 'fixed';
            clone.style.left = e.clientX - 150 + 'px';
            clone.style.top = e.clientY - 100 + 'px';
            clone.style.width = cardWrap.offsetWidth + 'px';
            clone.style.height = cardWrap.offsetHeight + 'px';
            clone.style.opacity = '1';
            clone.style.pointerEvents = 'none';
            clone.style.zIndex = '9999';
            clone.style.transform = 'rotate(0deg)';
            clone.style.boxShadow = '0 8px 16px rgba(0,0,0,0.3)';
            clone.style.transition = 'none';

            document.body.appendChild(clone);
            setCustomDragElement(clone);
        }

        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(index));
        setDraggedIndex(index);
    };

    const handleDrag = (e: React.DragEvent<HTMLLIElement>) => {
        if (!dragEnabled) return;
        // 드래그 중 위치 업데이트
        updateDragPosition(e);
    };

    const handleDragEnd = (e: React.DragEvent<HTMLLIElement>) => {
        setDraggedIndex(null);
        setDragOverIndex(null); // 드래그 오버 상태도 초기화

        // 자동 스크롤 정리
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
            setAutoScrollInterval(null);
        }

        // 커스텀 드래그 요소 제거
        if (customDragElement) {
            document.body.removeChild(customDragElement);
            setCustomDragElement(null);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLLIElement>, index: number) => {
        if (!dragEnabled || draggedIndex === null) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        // 드래그 중인 카드와 다른 카드에만 드래그 오버 상태 설정
        if (draggedIndex !== index) {
            setDragOverIndex(index);
        }

        // 드래그 오버 중에도 위치 업데이트
        updateDragPosition(e);
    };

    const handleDragEnter = (e: React.DragEvent<HTMLLIElement>, index: number) => {
        if (!dragEnabled) return;
        e.preventDefault();

        // 드래그 오버 상태 설정
        if (draggedIndex !== index) {
            setDragOverIndex(index);
        }
    };

    const handleDragLeave = (e: React.DragEvent<HTMLLIElement>, index: number) => {
        if (!dragEnabled) return;

        // 이벤트가 자식 요소로 이동하는 경우 무시
        if (e.currentTarget.contains(e.relatedTarget as Node)) {
            return;
        }

        // 현재 드래그 오버 중인 인덱스와 일치하는 경우에만 제거
        if (dragOverIndex === index) {
            setDragOverIndex(null);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLLIElement>, dropIndex: number) => {
        if (!dragEnabled) return;
        e.preventDefault();

        const dragIndex = Number(e.dataTransfer.getData('text/plain'));

        // console.log(
        //     `드롭: 인덱스 ${dropIndex}, 카드: ${orderedItems[dropIndex]?.title}, 키: ${orderedItems[dropIndex]?.key}`
        // );
        // console.log(`드래그: ${dragIndex} -> 드롭: ${dropIndex}`);

        // 드래그 오버 상태 초기화
        setDragOverIndex(null);

        if (!isNaN(dragIndex) && dragIndex !== dropIndex) {
            handleCardMove(dragIndex, dropIndex);
        }
    };

    function getOrderedItems() {
        if (tempOrder.length > 0) {
            const sorted = tempOrder
                .map((key) => defaultCardItems.find((item) => String(item.key) === key))
                .filter((item): item is (typeof defaultCardItems)[0] => !!item);

            const missingItems = defaultCardItems.filter((item) => !tempOrder.includes(String(item.key)));

            return [...sorted, ...missingItems];
        }
        return defaultCardItems;
    }

    if (!userData) return null;

    // 첫 렌더 시만 정렬
    if (orderedItems.length === 0 && tempOrder.length > 0) {
        const sorted = getOrderedItems();
        const filteredItems = dutyYn ? sorted : sorted.filter((item) => item.key !== 'cardSlot8');
        setOrderedItems(filteredItems);
    }

    // 카드 클릭 핸들러
    const handleCardClick = (cardKey: string, cardTitle: string) => {
        if (!dragEnabled && onCardClick) {
            onCardClick(cardKey, cardTitle);
        }
    };

    return (
        <ul className={styles.hrCardList} ref={containerRef}>
            {orderedItems.map((card, index) => {
                const slotKey = String(card.key);
                const isDragging = draggedIndex === index;
                const isDragOver = dragOverIndex === index && draggedIndex !== index; // 자기 자신은 제외

                return (
                    <li
                        key={slotKey}
                        className={`${styles.item} ${isDragging ? styles.dragging : ''} ${
                            isDragOver ? styles.dragOver : ''
                        }`}
                        draggable={dragEnabled}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDrag={handleDrag}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnter={(e) => handleDragEnter(e, index)}
                        onDragLeave={(e) => handleDragLeave(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                        onClick={() => handleCardClick(slotKey, card.title)}
                        data-card-id={slotKey}
                    >
                        <div className={styles.cardWrap}>
                            {userData ? (
                                <Card title={card.title} icon={card.icon}>
                                    {card.content(userData)}
                                </Card>
                            ) : (
                                <Card title={card.title} icon={card.icon} isEmpty>
                                    <div className={styles.emptyCard}>
                                        {card.title != '인적사항' ? (
                                            <Empty>등록된 {card.title} 사항이 없습니다.</Empty>
                                        ) : (
                                            <Empty>등록된 {card.title}이 없습니다.</Empty>
                                        )}
                                    </div>
                                </Card>
                            )}
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
