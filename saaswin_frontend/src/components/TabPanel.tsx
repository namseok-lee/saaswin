import TabPanel from '@mui/lab/TabPanel';
import { ReactNode } from 'react';

interface SwTabPanelProps {
    className?: string;
    value: number | string;
    children: ReactNode;
}

const SwTabPanel = ({ className = '', value, children }: SwTabPanelProps) => {
    return (
        <TabPanel className={`tabPanel ${className}`} value={value}>
            {children}
        </TabPanel>
    );
};

export default SwTabPanel;
