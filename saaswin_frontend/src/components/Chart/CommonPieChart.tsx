'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function CommonPieChart({ chartInfo, colors }: { chartInfo: any[]; colors: string[] }) {
    const isSingle = chartInfo.length === 1;

    const pieKeys = isSingle
        ? Object.entries(chartInfo[0])
              .filter(([key]) => key !== 'label')
              .map(([key]) => key)
        : Object.keys(chartInfo[0]).filter((k) => k !== 'label');

    const transformedData = isSingle
        ? Object.entries(chartInfo[0])
              .filter(([key]) => key !== 'label')
              .map(([key, value]) => ({ label: key, value }))
        : pieKeys.map((key) => {
              const total = chartInfo.reduce((sum, item) => sum + (item[key] ?? 0), 0);
              return { label: key, value: total };
          });

    const legendLabels = pieKeys;

    const renderCustomLegend = (labels: string[]) => (
        <ul className='legendList'>
            {labels.map((label, index) => (
                <li key={`legend-${index}`} style={{ display: 'flex', alignItems: 'center' }}>
                    <div
                        style={{
                            width: 12,
                            height: 12,
                            backgroundColor: colors[index % colors.length],
                            marginRight: 6,
                            borderRadius: 2,
                        }}
                    />
                    {label}
                </li>
            ))}
        </ul>
    );

    return (
        <>
            {chartInfo.length > 0 && (
                <ResponsiveContainer width='100%' height={300}>
                    <PieChart>
                        <Legend content={() => renderCustomLegend(legendLabels)} />
                        <Tooltip />
                        <Pie
                            data={transformedData}
                            dataKey='value'
                            nameKey='label'
                            cx='50%'
                            cy='50%'
                            outerRadius={100}
                            labelLine={false}
                            label={({ value, percent }) => (percent > 0.05 ? `${value}` : null)}
                        >
                            {transformedData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            )}
        </>
    );
}
