import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ButtonTextState {
    buttonText: string | null;
    setButtonText: (text: string) => void;
    clearButtonText: () => void;
}

export const buttonTextStore = create<ButtonTextState>()(
    persist(
        (set) => ({
            buttonText: '',
            setButtonText: (text) => set({ buttonText: text }),
            clearButtonText: () => set({ buttonText: null }),
        }),
        {
            name: 'buttonText',
        }
    )
);
