import create from 'zustand';

export const useSsw01Store = create((set) => ({
    title: '',
    setTitle: () =>
        set((data) => ({
            title: data,
        })),
}));
