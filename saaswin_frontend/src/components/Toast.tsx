import { forwardRef, useEffect } from 'react';
import { IcoToastBasic, IcoToastError } from '@/assets/Icon';

interface ToastProps {
    className?: string;
    open: boolean;
    onClose: () => void;
    message: string;
    type?: 'error';
}

// eslint-disable-next-line react/display-name
const Toast = forwardRef<HTMLDivElement, ToastProps>(({ open, onClose, message, className = '', type }, ref) => {
    useEffect(() => {
        if (open) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [open, onClose]);

    return (
        <div ref={ref} className={`toast ${className} ${open ? 'on' : ''} ${type === 'error' ? 'error' : ''}`}>
            <div className='msg'>
                {type === 'error' ? <IcoToastError /> : <IcoToastBasic className='icoToast' />}
                <div className='text'>{message}</div>
            </div>
        </div>
    );
});

export default Toast;
