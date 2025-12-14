import { ReactNode } from 'react';
import { IcoClose } from '@/assets/Icon';

interface ChipProps {
    className?: string;
    type?: 'primary' | 'default' | 'info' | 'error' | 'warning' | 'success' | 'label';
    style?: 'filled' | 'outlined';
    state?: 'active' | 'disabled';
    close?: boolean;
    children?: ReactNode;
    onClick?: () => void;
}

export default function Chip({ className, type, state, children, close = true, style, onClick }: ChipProps) {
    return (
        <>
            <div
                className={`chip ${type === 'primary' && 'primary'} ${type === 'default' && 'default'} ${
                    type === 'info' && 'info'
                } ${type === 'error' && 'error'} ${type === 'warning' && 'warning'} ${
                    type === 'success' && 'success'
                } ${type === 'label' && 'label'}
                ${state === 'active' && 'active'} ${state === 'disabled' && 'disabled'} ${
                    style === 'outlined' && 'outlined'
                } ${className ? className : ''}
                    }`}
                onClick={onClick}
            >
                {children}
                {close ? (
                    <button disabled={state === 'disabled'}>
                        <IcoClose />
                    </button>
                ) : (
                    ''
                )}
            </div>
        </>
    );
}
