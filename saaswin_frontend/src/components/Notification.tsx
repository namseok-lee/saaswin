import { forwardRef, ReactNode } from 'react';
import { IcoAdd, IcoClose } from '@/assets/Icon';
import Button from './Button';

interface NotificationProps {
    className?: string;
    open: boolean;
    onClick?: () => void;
    onClose?: () => void;
    messageList: ReactNode;
}

// eslint-disable-next-line react/display-name
const Notification = forwardRef<HTMLDivElement, NotificationProps>(
    ({ open, onClick, onClose, messageList, className = '' }, ref) => {
        console.log('open', open);
        return (
            <div ref={ref} className={`notificationPoper ${className} ${open ? 'on' : ''}`}>
                <div className='tit'>
                    <Button id='noti' className='btnTit' onClick={onClick}>
                        알림
                        <IcoAdd fill='#0D9BDB' />
                    </Button>
                </div>
                <ul className='msgList'>{messageList}</ul>
                <Button id='btnCloseNoti' className='btnClose' onClick={onClose}>
                    <IcoClose fill='#7C7C7C' />
                </Button>
            </div>
        );
    }
);

export default Notification;
