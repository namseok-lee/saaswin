import TabList from '@mui/lab/TabList';
import { ReactNode } from 'react';

interface SwTabListProps {
    className?: string;
    children: ReactNode;
    onChange: (event: React.SyntheticEvent, newValue: string) => void;
}

const SwTabList = ({ className = '', onChange, children }: SwTabListProps) => {
    return (
        <TabList onChange={onChange} className={`tabList ${className}`}>
            {children}
        </TabList>
    );
};

export default SwTabList;
