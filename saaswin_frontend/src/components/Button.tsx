'use client';
import { fetcherPostUserClickLog } from '@/utils/axios';
import { getIp, getOs } from '@/utils/clientEnv/clientEnv';
import { getBrowser } from '@/utils/clientEnv/clientEnv';
import React, { forwardRef, ReactNode, useEffect, useState } from 'react';
import { buttonTextStore } from 'utils/store/buttonInfo';

interface ButtonProps {
    id?: string;
    className?: string;
    disabled?: boolean;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    children: ReactNode;
    type?: 'primary' | 'default' | 'text' | 'iconPrimary' | 'icon';
    size?: 'sm' | 'md' | 'lg';
    round?: boolean;
    isUpload?: boolean;
    htmlFor?: string;
}

// eslint-disable-next-line react/display-name
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ id, className, disabled, onClick, children, type, size, round, isUpload, htmlFor, ...rest }, ref) => {
        const [auth, setAuth] = useState({});
        const [tpcd, setTpcd] = useState('');

        const os = getOs();
        const browser = getBrowser();
        const {
            userNo,
            rprsOgnzNo,
            duty_cd,
            duty_nm,
            jbgd_cd,
            jbgd_nm,
            jbgp_cd,
            jbgp_nm,
            jbps_cd,
            jbps_nm,
            jbttl_cd,
            jbttl_nm,
            ipv4,
            ipv6,
        } = auth?.state || {};
        // URL에서 scr_no와 추출
        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            const text = e.currentTarget.textContent?.trim() || '';
            const userClickInfo = {
                os,
                browser,
                ipv4,
                ipv6,
                text,
                menu: tpcd,
                userNo,
                rprsOgnzNo,
                duty_cd,
                duty_nm,
                jbgd_cd,
                jbgd_nm,
                jbgp_cd,
                jbgp_nm,
                jbps_cd,
                jbps_nm,
                jbttl_cd,
                jbttl_nm,
            };
            buttonTextStore.getState().setButtonText(text);
            if (onClick) {
                fetcherPostUserClickLog(userClickInfo);
                onClick(e);
            }
        };
        useEffect(() => {
            if (typeof window !== 'undefined') {
                const authData = JSON.parse(localStorage.getItem('auth') || '{}');
                const currPath = window.location.pathname;
                const lastPath = currPath.split('/').pop() || '';
                setTpcd(lastPath);
                setAuth(authData);
            }
        }, []);
        if (isUpload) {
            return (
                <button
                    ref={ref}
                    id={id}
                    className={`${className ? className : ''} ${type === 'primary' && 'btnPrimary'} ${
                        type === 'default' && 'btnDefault'
                    } ${type === 'text' && 'btnText'} ${type === 'iconPrimary' && 'btnOnlyIconPrimary'} ${
                        type === 'icon' && 'btnOnlyIcon'
                    } ${size === 'sm' && 'sm'} ${size === 'md' && 'md'} ${size === 'lg' && 'lg'} ${
                        round ? 'rounded' : ''
                    }`}
                    disabled={disabled}
                    onClick={handleClick}
                    {...rest}
                >
                    <label htmlFor={htmlFor} style={{ cursor: 'pointer', width: '100%', display: 'inline-block' }}>
                        {children}
                    </label>
                </button>
            );
        }
        return (
            <button
                ref={ref}
                id={id}
                className={`${className ? className : ''} ${type === 'primary' && 'btnPrimary'} ${
                    type === 'default' && 'btnDefault'
                } ${type === 'text' && 'btnText'} ${type === 'iconPrimary' && 'btnOnlyIconPrimary'} ${
                    type === 'icon' && 'btnOnlyIcon'
                } ${size === 'sm' && 'sm'} ${size === 'md' && 'md'} ${size === 'lg' && 'lg'} ${round ? 'rounded' : ''}`}
                disabled={disabled}
                onClick={handleClick}
                {...rest}
            >
                {children}
            </button>
        );
    }
);

export default Button;
