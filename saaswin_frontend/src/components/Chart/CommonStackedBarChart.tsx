'use client';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Tooltip, XAxis, YAxis } from 'recharts';

export default function CommonStackedBarChart({ chartInfo }) {
    const COLORS = [
        '#FFD6D6', // 연한 빨강
        '#2E94EC', // 파랑
        '#FFB347', // 주황
        '#A9D18E', // 연두
        '#9E480E', // 갈색
        '#6FA8DC', // 연파랑
        '#D5A6BD', // 연보라
        '#B4C7E7', // 파스텔 블루
        '#F4CCCC', // 연핑크
        '#838383', // 회색
    ];

    const renderCustomLegend = () => {
        return (
            <ul className='legendList'>
                {chartInfo.map((entry, index) => (
                    <li key={`legend-${index}`} style={{ display: 'flex', alignItems: 'center' }}>
                        <div
                            style={{
                                width: 12,
                                height: 12,
                                backgroundColor: COLORS[index % COLORS.length],
                                marginRight: 6,
                                borderRadius: 2,
                            }}
                        />
                        {entry.label}
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <>
            {chartInfo.length > 0 && (
                <BarChart width={400} height={300} data={chartInfo} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='name' />
                    <YAxis />
                    <Tooltip />
                    <Legend content={renderCustomLegend} />
                    <Bar dataKey='uv'>
                        {chartInfo.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                    <Bar dataKey='pv'>
                        {chartInfo.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            )}
        </>
    );
}
