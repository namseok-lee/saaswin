'use client';
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function CommonBarChart({ chartInfo, colors }: { chartInfo: any[]; colors: string[] }) {
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
    const isSingle = chartInfo.length === 1;
    // 단일 데이터일 경우 구조 변경
    const transformedData = isSingle
        ? Object.entries(chartInfo[0])
              .filter(([key]) => key !== 'label')
              .map(([key, value]) => ({
                  label: key,
                  [chartInfo[0].label]: value,
              }))
        : chartInfo;
    const dataKeys = isSingle
        ? [chartInfo[0].label] // 단일 부서명이 dataKey가 됨
        : Object.keys(chartInfo[0]).filter((k) => k !== 'label');
    const legendLabels = Object.keys(chartInfo[0]).filter((key) => key !== 'label');
    return (
        <>
            {chartInfo.length > 0 && (
                <ResponsiveContainer width='100%' height={300}>
                    <BarChart data={transformedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray='3 3' />
                        <XAxis dataKey='label' />
                        <YAxis />
                        <Tooltip />
                        <Legend content={() => renderCustomLegend(legendLabels)} />
                        {isSingle ? (
                            <Bar dataKey={dataKeys[0]}>
                                {transformedData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                ))}
                            </Bar>
                        ) : (
                            dataKeys.map((key, index) => (
                                <Bar key={index} dataKey={key} fill={colors[index % colors.length]} stackId='a' />
                            ))
                        )}
                    </BarChart>
                </ResponsiveContainer>
            )}
        </>
    );
}
