import React, { ReactNode } from 'react';

interface ChipsGroupProps {
    className?: string;
    children: ReactNode;
}

export default function ChipsGroup({ className, children }: ChipsGroupProps) {
    return <div className={`chipsGroup ${className || ''}`}>{children}</div>;
}
