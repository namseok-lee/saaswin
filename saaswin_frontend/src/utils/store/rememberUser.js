'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useRemeberStore = create(
    persist(
        (set) => ({
            userNo: null,

            setRemember: (userNo) =>
                set({
                    userNo,
                }),
            removeRemember: () =>
                set({
                    userNo: null,
                }),
        }),
        {
            name: 'remember', // localStorage에 remember로 저장됨
        }
    )
);
