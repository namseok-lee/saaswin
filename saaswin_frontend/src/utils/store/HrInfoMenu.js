'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useHrInfoMenuStore = create(
    persist(
        (set) => ({
            hrInfoMenuList: [],
            setHrInfoMenuList: (list) =>
                set({
                    hrInfoMenuList: list,
                }),
            removeHrInfoMenuList: () =>
                set({
                    hrInfoMenuList: [],
                }),
        }),
        {
            name: 'hrInfoMenu', // localStorage에 hrInfoMenu로 저장됨
        }
    )
);
