import React, { ReactNode } from 'react';

interface LinkProps {
    id?: string;
    href: string;
    className?: string;
    disabled?: boolean;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

export default function Link({ id, href, className, disabled, children, size }: LinkProps) {
    return (
        <a
            href={href}
            id={id}
            className={`btnLink ${className} ${disabled && 'disabled'} ${size === 'sm' && 'sm'} ${
                size === 'md' && 'md'
            } ${size === 'lg' && 'lg'}`}
        >
            {children}
        </a>
    );
}
