import { Dialog, DialogActions, DialogContent, DialogTitle, Modal } from '@mui/material';
import { forwardRef, ReactNode } from 'react';
import Button from './Button';
import { IcoClose } from '@/assets/Icon';

interface ModalProps {
    className?: string;
    open?: boolean;
    onClick?: () => void;
    onClose?: () => void;
    children: ReactNode;
    size?: 'xs' | 'md' | 'lg' | 'xl' | 'xxl' | 'full';
    title?: string;
    bottoms?: boolean;
    txtBtn1?: string;
    txtBtn2?: string;
    bottomAlign?: 'left' | 'right';
    maxWidth?: string;
    maxHeight?: string;
    PaperProps?: object;
    fullScreen?: boolean;
    fullWidth?: boolean;
    closeButton?: boolean;
    hideBackdrop?: boolean;
}

// eslint-disable-next-line react/display-name
const SwModal = forwardRef<HTMLDivElement, ModalProps>(
    (
        {
            open = false,
            onClick,
            onClose,
            children,
            className = '',
            title,
            bottoms = true,
            txtBtn1 = '취소',
            txtBtn2 = '확인',
            size,
            maxWidth,
            maxHeight,
            PaperProps,
            bottomAlign,
            fullScreen,
            fullWidth,
            closeButton = true,
            hideBackdrop,
        },
        ref
    ) => {
        return (
            <Dialog
                open={open}
                onClose={onClose}
                className={`dialog ${className ? className : ''}`}
                maxWidth={maxWidth}
                maxHeight={maxHeight}
                PaperProps={PaperProps}
                fullScreen={fullScreen}
                fullWidth={fullWidth}
                hideBackdrop={hideBackdrop}
            >
                {title && <div className='tit'>{title}</div>}
                {closeButton && (
                    <Button id='' className='btnClose' onClick={onClose}>
                        <IcoClose fill='#666' />
                    </Button>
                )}
                <div
                    className={`cont ${size === 'xs' ? 'xs' : ''} ${size === 'md' ? 'md' : ''} ${
                        size === 'lg' ? 'lg' : ''
                    } ${size === 'xl' ? 'xl' : ''} ${size === 'xxl' ? 'xxl' : ''} ${size === 'full' ? 'full' : ''}`}
                >
                    {children}
                </div>
                {/* `{bottoms && (
                    <div
                        className={`actions ${bottomAlign === 'left' ? 'alignLeft' : ''} ${
                            bottomAlign === 'right' ? 'alignRight' : ''
                        }`}
                    >
                        {txtBtn1 && (
                            <Button id='' size='lg' type='default' onClick={onClose}>
                                {txtBtn1}
                            </Button>
                        )}
                        {txtBtn2 && (
                            <Button id='' size='lg' type='primary' onClick={onClick}>
                                {txtBtn2}
                            </Button>
                        )}
                    </div>
                )}` */}
            </Dialog>
        );
    }
);

export default SwModal;
