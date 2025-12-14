import { LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, ResponsiveContainer } from 'recharts';

export default function CommonLineChart({ chartInfo, colors }: { chartInfo: any[]; colors: string[] }) {
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

    // 단일 데이터 변환
    const transformedData = isSingle
        ? Object.entries(chartInfo[0])
              .filter(([key]) => key !== 'label')
              .map(([key, value]) => ({
                  label: key,
                  [chartInfo[0].label]: value,
              }))
        : (() => {
              const timeLabels = Object.keys(chartInfo[0]).filter((k) => k !== 'label');
              return timeLabels.map((month) => {
                  const entry = { label: month };
                  chartInfo.forEach((item) => {
                      entry[item.label] = item[month];
                  });
                  return entry;
              });
          })();

    const dataKeys = isSingle ? [chartInfo[0].label] : chartInfo.map((item) => item.label);

    const legendLabels = isSingle ? [chartInfo[0].label] : chartInfo.map((entry) => entry.label);
    return (
        chartInfo.length > 0 && (
            <ResponsiveContainer width='100%' height={300}>
                <LineChart data={transformedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='label' />
                    <YAxis />
                    <Tooltip />
                    <Legend content={() => renderCustomLegend(legendLabels)} />
                    {dataKeys.map((key, index) => (
                        <Line
                            key={index}
                            type='monotone'
                            dataKey={key}
                            stroke={isSingle ? colors[index % colors.length] : colors[index % colors.length]}
                            strokeWidth={2}
                            activeDot={{ r: 5 }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        )
    );
}
