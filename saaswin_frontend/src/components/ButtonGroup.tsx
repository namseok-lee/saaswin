import React, { ReactNode } from 'react';

interface ButtonGroupProps {
    className?: string;
    children: ReactNode;
    align?: 'center' | 'right';
}

export default function ButtonGroup({ className, children, align }: ButtonGroupProps) {
    return (
        <div
            className={`buttonGroup ${className || ''} ${align === 'center' ? 'alignCenter' : ''} ${
                align === 'right' ? 'alignRight' : ''
            }`}
        >
            {children}
        </div>
    );
}
