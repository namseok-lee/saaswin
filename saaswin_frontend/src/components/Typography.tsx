import { ReactNode, useState } from 'react';
import { IcoFavorite, IcoFavoriteOn, IcoGuide, IcoShortInfo, IcoTemp } from '@/assets/Icon';
import Button from './Button';
import SwTooltip from './Tooltip';

interface TypographyProps {
    className?: string;
    type?: 'page' | 'section' | 'table' | 'form';
    children: ReactNode;
    onClickDesc?: () => void;
    title?: string;
    desc?: boolean;
    tooltip?: boolean;
    button?: boolean;
    txtBtn?: ReactNode;
}

export default function Typography({
    type,
    className = '',
    children,
    onClickDesc,
    title,
    desc,
    tooltip,
    button,
    txtBtn,
}: TypographyProps) {
    const [favState, setFavState] = useState(true);
    const handleFav = () => {
        setFavState(!favState);
    };
    return (
        <>
            <div className='titPageArea'>
                {type === 'page' &&
                    (favState ? (
                        <Button id='' onClick={handleFav}>
                            <IcoFavorite fill='#C4C4C4' />
                        </Button>
                    ) : (
                        <Button id='' className='btnFavOn' onClick={handleFav}>
                            <IcoFavoriteOn />
                        </Button>
                    ))}
                {type === 'page' && <h3 className={`titPage ${className ? className : ''}`}>{children}</h3>}
                {type === 'section' && <h3 className={`titSection ${className ? className : ''}`}>{children}</h3>}
                {type === 'table' && <h3 className={`titTable ${className ? className : ''}`}>{children}</h3>}
                {type === 'form' && <h3 className={`titForm ${className ? className : ''}`}>{children}</h3>}
                {tooltip && (
                    <div className='tooltipWrap'>
                        <SwTooltip title={String(title)} arrow placement='right'>
                            <Button id='' className='btnShortInfo'>
                                <IcoShortInfo />
                            </Button>
                        </SwTooltip>
                    </div>
                )}
                {desc === true && (
                    <Button id='' onClick={onClickDesc} className='btnGuide'>
                        <IcoGuide />
                    </Button>
                )}
                {button && (
                    <Button id='' onClick={handleFav} type='default' size='sm' className='btnOption'>
                        {txtBtn}
                    </Button>
                )}
            </div>
        </>
    );
}
