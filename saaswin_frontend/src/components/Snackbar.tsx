import { forwardRef } from 'react';

interface SnackbarProps {
    className?: string;
    open: boolean;
    onClick?: () => void;
    message: string;
    position?: 'downRight' | 'upLeft' | 'upRight';
}

// eslint-disable-next-line react/display-name
const Snackbar = forwardRef<HTMLDivElement, SnackbarProps>(
    ({ open, onClick, message, className = '', position }, ref) => {
        return (
            <div
                ref={ref}
                className={`snackbar ${className} ${open ? 'on' : ''} ${position === 'downRight' ? 'downRight' : ''} ${
                    position === 'upLeft' ? 'upLeft' : ''
                } ${position === 'upRight' ? 'upRight' : ''}`}
                onClick={onClick}
            >
                <div className='tit'>알림</div>
                <div className='msg'>{message}</div>
            </div>
        );
    }
);

export default Snackbar;
