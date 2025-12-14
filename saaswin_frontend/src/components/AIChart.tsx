import React from 'react';

interface AIChartProps {
    svg: string;
}

const AIChart: React.FC<AIChartProps> = ({ svg }) => {
    return <div style={{ width: '100%', height: 'auto' }} dangerouslySetInnerHTML={{ __html: svg }} />;
};

export default AIChart;
