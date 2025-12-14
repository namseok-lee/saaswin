'use client';

import Button from '@/components/Button';
import { useRef } from 'react';
import { IcoSetDrag } from '../../../public/asset/Icon';
import styles from './page.module.scss';
import { useDragStore } from '@/utils/store/UseDragStore';

interface MenuItem {
    id: string;
    icon: React.ReactNode;
    label: string;
}

export default function QuickMenu({
    items,
    dragEnabled,
    onItemClick,
}: {
    items: MenuItem[];
    dragEnabled: boolean;
    onItemClick?: (cardKey: string, cardTitle: string) => void;
}) {
    const containerRef = useRef<HTMLUListElement | null>(null);
    const { toggleDrag } = useDragStore();
    // 메뉴 아이템 클릭 시 상세 페이지로 이동 또는 스크롤
    const handleItemClick = (id: string, label: string) => {
        if (dragEnabled) return; // 드래그 모드에서는 기능 비활성화

        // onItemClick이 제공되면 상세 페이지로 이동
        if (onItemClick) {
            onItemClick(id, label);
        } else {
            // 기존 스크롤 기능 유지
            const cardElement = document.querySelector(`[data-card-id="${id}"]`);
            if (cardElement) {
                cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    };

    return (
        <div className={styles.quickMenu}>
            <ul className={styles.menuList} ref={containerRef}>
                {items.map((item) => (
                    <li key={item.id} className={styles.item} onClick={() => handleItemClick(item.id, item.label)}>
                        <div className={styles.icon}>{item.icon}</div>
                        <div className={styles.text}>{item.label}</div>
                    </li>
                ))}
            </ul>
            <Button className={styles.btnSetDrag} onClick={toggleDrag}>
                <IcoSetDrag />
            </Button>
        </div>
    );
}
