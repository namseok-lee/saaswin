import { Tab } from '@mui/material';
import { FC } from 'react';

interface SwTabProps {
    label: string;
    value: string;
    className?: string;
}

const SwTab: FC<SwTabProps> = ({ label, value, className = '' }) => {
    return <Tab className={`tabs ${className}`} label={label} value={value} />;
};

export default SwTab;
