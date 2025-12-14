'use client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function CommonAreaChart({ chartInfo }: { chartInfo: any[] }) {
    const COLORS = [
        '#2E94EC',
        '#FFD6D6',
        '#FFB347',
        '#A9D18E',
        '#9E480E',
        '#6FA8DC',
        '#D5A6BD',
        '#B4C7E7',
        '#F4CCCC',
        '#838383',
    ];

    const renderCustomLegend = (labels: string[]) => (
        <ul className='legendList'>
            {labels.map((label, index) => (
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
                    {label}
                </li>
            ))}
        </ul>
    );

    const isSingle = chartInfo.length === 1;

    const transformedData = isSingle
        ? Object.entries(chartInfo[0])
              .filter(([key]) => key !== 'label' && key !== 'name')
              .map(([key, value]) => ({
                  label: key,
                  [chartInfo[0].label || chartInfo[0].name]: value,
              }))
        : (() => {
              const timeLabels = Object.keys(chartInfo[0]).filter((k) => k !== 'label' && k !== 'name');
              return timeLabels.map((time) => {
                  const entry: any = { label: time };
                  chartInfo.forEach((item) => {
                      const seriesName = item.label || item.name;
                      entry[seriesName] = item[time];
                  });
                  return entry;
              });
          })();

    const dataKeys = isSingle
        ? [chartInfo[0].label || chartInfo[0].name]
        : chartInfo.map((item) => item.label || item.name);

    return (
        chartInfo.length > 0 && (
            <ResponsiveContainer width='100%' height={300}>
                <AreaChart data={transformedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='label' />
                    <YAxis />
                    <Tooltip />
                    <Legend content={() => renderCustomLegend(dataKeys)} />
                    {dataKeys.map((key, index) => (
                        <Area
                            key={key}
                            type='monotone'
                            dataKey={key}
                            stroke={COLORS[index % COLORS.length]}
                            fill={COLORS[index % COLORS.length]}
                            fillOpacity={0.5}
                            activeDot={{ r: 6 }}
                        />
                    ))}
                </AreaChart>
            </ResponsiveContainer>
        )
    );
}
