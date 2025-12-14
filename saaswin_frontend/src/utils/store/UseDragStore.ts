// store/useDragStore.ts
import { create } from 'zustand';

interface DragStore {
    dragEnabled: boolean;
    toggleDrag: () => void;
    setDragEnabled: (enabled: boolean) => void;
}

export const useDragStore = create<DragStore>((set) => ({
    dragEnabled: false,
    toggleDrag: () => set((state) => ({ dragEnabled: !state.dragEnabled })),
    setDragEnabled: (enabled) => set({ dragEnabled: enabled }),
}));
