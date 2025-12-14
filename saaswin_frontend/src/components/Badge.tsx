import React, { ReactNode } from 'react';
import { IcoMail, IcoNotification } from '@/assets/Icon';

interface BadgeProps {
    className?: string;
    type?: 'standard' | 'dot' | 'state' | 'step' | 'noti' | 'mail';
    color?: 'primary' | 'success' | 'error' | 'warning' | 'offline' | 'vacancy';
    state?: 'disabled' | 'warning' | 'error' | 'progress' | 'success';
    step?: 1 | 2 | 3 | 4 | 5 | 6;
    children?: ReactNode;
}

export default function Badge({ className, type, color, state, step, children }: BadgeProps) {
    return (
        <>
            {type === 'standard' && (
                <span
                    className={`badge ${color === 'primary' && 'primary'} ${color === 'success' && 'success'} ${
                        color === 'error' && 'error'
                    } ${color === 'warning' && 'warning'} ${color === 'offline' && 'offline'} ${
                        color === 'vacancy' && 'vacancy'
                    }
                    }`}
                >
                    {children}
                </span>
            )}
            &nbsp;
            {type === 'dot' && (
                <span
                    className={`badge dot ${color === 'primary' && 'primary'} ${color === 'success' && 'success'} ${
                        color === 'error' && 'error'
                    } ${color === 'warning' && 'warning'} ${color === 'offline' && 'offline'} ${
                        color === 'vacancy' && 'vacancy'
                    }
                    }`}
                ></span>
            )}
            &nbsp;
            {type === 'state' && (
                <span
                    className={`badge state ${state === 'disabled' && 'disabled'} ${state === 'warning' && 'warning'} ${
                        state === 'error' && 'error'
                    } ${state === 'progress' && 'progress'} ${state === 'success' && 'success'}
                    }`}
                >
                    {children}
                </span>
            )}
            &nbsp;
            {type === 'noti' && (
                <div className='badge notification'>
                    <div className='num'>{children}</div>
                    <IcoNotification fill='#666' className='icoNotification' />
                </div>
            )}
            &nbsp;
            {type === 'mail' && (
                <div className='badge mail'>
                    <IcoMail fill='#fff' className='icoMail' />
                </div>
            )}
            &nbsp;
            {type === 'step' && (
                <span
                    className={`badge step ${step === 1 && 'one'} ${step === 2 && 'two'} ${step === 3 && 'three'} ${
                        step === 4 && 'four'
                    } ${step === 5 && 'five'} ${step === 6 && 'six'}
                    }`}
                >
                    {children}
                </span>
            )}
        </>
    );
}
