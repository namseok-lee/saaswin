import { Tooltip } from '@mui/material';
import { ReactNode, forwardRef } from 'react';

interface TooltipProps {
    className?: string;
    placement?: 'top' | 'bottom' | 'left' | 'right'; // MUI에서 허용하는 placement 타입 적용
    children: ReactNode; // children은 필수
    title: string;
    arrow?: boolean;
}

const SwTooltip = forwardRef<HTMLDivElement, TooltipProps>(({ className, children, title, placement, arrow }, ref) => {
    return (
        <Tooltip title={title} className={`tooltip ${className || ''}`} placement={placement} arrow={arrow}>
            <div ref={ref} className='contentWrap'>
                {children}
            </div>
        </Tooltip>
    );
});

export default SwTooltip;
