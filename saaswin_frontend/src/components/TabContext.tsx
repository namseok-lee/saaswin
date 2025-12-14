import TabContext from '@mui/lab/TabContext';
import { ReactNode } from 'react';

interface SwTabContextProps {
    className?: string;
    value?: string | number;
    children: ReactNode;
}

const SwTabContext = ({ className = '', value, children }: SwTabContextProps) => {
    return (
        <TabContext value={value} className={`tabContext ${className}`}>
            {children}
        </TabContext>
    );
};

export default SwTabContext;
