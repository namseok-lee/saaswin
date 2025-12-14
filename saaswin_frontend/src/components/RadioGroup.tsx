import React, { ReactNode } from 'react';

interface RadioGroupProps {
    className?: string;
    children: ReactNode;
    direction?: 'vertical' | 'horizontal';
}

export default function RadioGroup({ className, children, direction }: RadioGroupProps) {
    return (
        <div className={`radioGroup ${className || ''} ${direction === 'vertical' ? 'vertical' : 'horizontal'}`}>
            {children}
        </div>
    );
}
