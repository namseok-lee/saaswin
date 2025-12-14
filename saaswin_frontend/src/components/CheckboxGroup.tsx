import React, { ReactNode } from 'react';

interface CheckboxGroupProps {
    className?: string;
    children: ReactNode;
    direction?: 'vertical' | 'horizontal';
}

export default function CheckboxGroup({ className, children, direction }: CheckboxGroupProps) {
    return (
        <div className={`checkboxGroup ${className || ''} ${direction === 'vertical' ? 'vertical' : 'horizontal'}`}>
            {children}
        </div>
    );
}
