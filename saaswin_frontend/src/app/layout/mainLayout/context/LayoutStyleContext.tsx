// components/context/LayoutStyleContext.tsx
'use client';

import { createContext, useContext } from 'react';

type LayoutStyleSetter = {
    setBgColor: (color: string) => void;
    setPadding: (padding: string) => void;
};

export const LayoutStyleContext = createContext<LayoutStyleSetter>({
    setBgColor: () => {},
    setPadding: () => {},
});

export const useLayoutStyle = () => useContext(LayoutStyleContext);
