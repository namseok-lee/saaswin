import { create } from 'zustand';

interface CardOrderState {
    order: string[];
    itemMap: Record<string, string>;
    setOrder: (newOrder: string[], itemMap?: Record<string, string>) => void;
    initializeFromStorage: () => void;
    resetOrder: () => void;
}

// localStorage 키
const STORAGE_ORDER_KEY = 'hr_card_order';
const STORAGE_ITEMMAP_KEY = 'hr_card_itemMap';

export const useCardOrderStore = create<CardOrderState>((set) => ({
    order: [],
    itemMap: {},
    setOrder: (newOrder, newItemMap = {}) => {
        try {
            // localStorage에 슬롯 순서 저장
            localStorage.setItem(STORAGE_ORDER_KEY, JSON.stringify(newOrder));

            // 슬롯-아이템 맵도 저장
            localStorage.setItem(STORAGE_ITEMMAP_KEY, JSON.stringify(newItemMap));

            set({ order: newOrder, itemMap: newItemMap });
        } catch (error) {
            console.error('카드 순서 저장 중 오류 발생:', error);
        }
    },
    initializeFromStorage: () => {
        try {
            // 슬롯 순서 불러오기
            const savedOrder = localStorage.getItem(STORAGE_ORDER_KEY);
            const savedItemMap = localStorage.getItem(STORAGE_ITEMMAP_KEY);

            const newState: { order: string[]; itemMap: Record<string, string> } = {
                order: savedOrder ? JSON.parse(savedOrder) : [],
                itemMap: savedItemMap ? JSON.parse(savedItemMap) : {},
            };

            set(newState);
        } catch (error) {
            console.error('localStorage에서 카드 순서 불러오기 실패:', error);
            set({ order: [], itemMap: {} });
        }
    },
    resetOrder: () => {
        localStorage.removeItem(STORAGE_ORDER_KEY);
        localStorage.removeItem(STORAGE_ITEMMAP_KEY);
        set({ order: [], itemMap: {} });
    },
}));
