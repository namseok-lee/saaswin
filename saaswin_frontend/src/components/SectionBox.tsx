import { ReactNode } from 'react';

interface SectionBoxProps {
    className?: string;
    children?: ReactNode;
}

const SectionBox = ({ className = '', children }: SectionBoxProps) => {
    return <div className={`sectionBox ${className}}`}>{children}</div>;
};

export default SectionBox;
