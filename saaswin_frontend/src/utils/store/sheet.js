'use client';
import { create } from 'zustand';

export const useSheetStore = create(
    (set) => ({
        gridRef: null,
        rowId: '',
        changeSheet: (gridRef, rowId) => {
            set({
                gridRef: gridRef,
                rowId: rowId,
            });
        },
    }),
    {
        name: 'sheet', // localStorage에 저장될 항목의 이름
    }
);
