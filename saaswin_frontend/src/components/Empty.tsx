import { ReactNode } from 'react';
import { IcoEmpty2Blue, IcoEmpty2Grey, IcoEmptyBlue, IcoEmptyGrey } from '@/assets/Icon';

interface EmptyProps {
    className?: string;
    color?: 'blue';
    children: ReactNode;
    type?: 'file';
}

export default function Empty({ type, className, color, children }: EmptyProps) {
    return (
        <div className='emptyNoData'>
            {type === 'file' ? (
                color === 'blue' ? (
                    <IcoEmptyGrey />
                ) : (
                    <IcoEmptyBlue className='icoBlue' />
                )
            ) : color === 'blue' ? (
                <IcoEmpty2Grey className='icoBlue' />
            ) : (
                <IcoEmpty2Blue />
            )}

            <div className='text'>{children}</div>
        </div>
    );
}
