import { ReactNode } from 'react';
import Button from './Button';

interface CardProps {
    className?: string;
    onClick?: () => void;
    icon?: ReactNode;
    title: string;
    children?: ReactNode;
    isEmpty?: ReactNode;
    type?: 'title';
}

// eslint-disable-next-line react/display-name
const Card = ({ className = '', onClick, icon, title, children, isEmpty, type }: CardProps) => {
    return (
        <div className={`card ${className} ${type === 'title' ? 'titleType' : ''}`}>
            <Button id='titNoti' className='tit' onClick={onClick}>
                <span className='icon'>{icon}</span>
                <div className='text'>{title}</div>
            </Button>
            <div className='infoSection'>{children}</div>
        </div>
    );
};

export default Card;
