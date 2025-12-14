import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
    persist(
        (set) => ({
            mode: 'light',
            fontFamily: 'Pretendard',
            presetColor: 'defalut',
            toggleMode: () =>
                set((state) => ({
                    mode: state.mode === 'light' ? 'dark' : 'light',
                })),
            changeColor: (presetColor) => set({ presetColor }),
            changeFontFamily: (fontFamily) => set({ fontFamily }),
            changeTheme: (presetColor, fontFamily) => set({ presetColor, fontFamily }),
        }),
        {
            name: 'theme', // localStorage에 저장될 항목의 이름
        }
    )
);
