import { Drawer } from '@mui/material';
import { useState } from 'react';
import chartColor from 'themes/theme/chartColor';

export default function ChartSettingModal({
    settingOpen,
    handleSettingOpen,
    handleColorChange,
}: {
    settingOpen: boolean;
    handleSettingOpen: () => void;
    handleColorChange: (colors: string[]) => void;
}) {
    const [colors, setColors] = useState<string[]>(chartColor());

    const handleChangeColor = (index: number, newColor: string) => {
        const updated = [...colors];
        updated[index] = newColor;
        setColors(updated);
        handleColorChange(updated);
    };

    const handleReset = () => {
        setColors(chartColor());
        handleColorChange(chartColor());
    };

    return (
        <Drawer anchor='right' open={settingOpen} onClose={handleSettingOpen}>
            <div style={{ padding: 20, width: 300 }}>
                <h3>색상 설정</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {colors.map((color, index) => (
                        <li key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                            <span style={{ width: 60 }}>Index {index}</span>
                            <input
                                type='color'
                                value={color}
                                onChange={(e) => handleChangeColor(index, e.target.value)}
                                style={{ marginLeft: 10 }}
                            />
                        </li>
                    ))}
                </ul>
                <button onClick={handleReset}>기본 색상으로 초기화</button>
            </div>
        </Drawer>
    );
}
