'use client';

import { ApexOptions } from 'apexcharts';
import Button from 'components/Button';
import { useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { VisitInfo } from './VisitInfo';
import PayDialog from '@/components/ComPopup/PayDialog';

export default function VA002() {
    const [open, setOpen] = useState(false);
    // 차트
    const data = [
        { dept: '경영지원', revenue: 12000, id: '1' },
        { dept: '영업본부', revenue: 18000, id: '2' },
        { dept: '사업부', revenue: 20000, id: '3' },
        { dept: '전략기획', revenue: 15000, id: '4' },
        { dept: 'C/S사업본부', revenue: 25000, id: '5' },
    ];

    const options: ApexOptions = {
        xaxis: {
            categories: data.map((item) => item.dept),
        },
    };

    const series = [
        {
            name: 'revenue',
            data: data.map((item) => item.revenue),
        },
    ];

    const [chartType, setChartType] = useState('line');
    const handleClose = () => {
        setOpen(false);
    };
    const getButtonStyle = (type) => ({
        backgroundColor: chartType === type ? '#3b82f6' : 'white',
        color: chartType === type ? 'white' : '#3b82f6',
        fontWeight: 'bold',
        padding: '8px',
        borderRadius: '8px',
        border: '1px solid #3b82f6',
        cursor: 'pointer',
        marginRight: '8px',
    });

    // const TrackedButton = VisitInfo(Button, 'VA002--ChartButton');

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                flexWrap: 'wrap',
                gap: '20px',
            }}
        >
            <ReactApexChart options={options} series={series} type={chartType} width='500px' height='500px' />
            <div
                style={{
                    display: 'flex',
                    gap: '20px',
                }}
            >
                <button style={getButtonStyle('bar')} onClick={() => setChartType('bar')}>
                    막대
                </button>
                <button style={getButtonStyle('line')} onClick={() => setChartType('line')}>
                    라인
                </button>
            </div>
            {/* <TrackedButton>테스트 버튼</TrackedButton> */}
            <div>
                <Button onClick={() => setOpen(true)}>결제요청</Button>
            </div>
            <PayDialog open={open} handleClose={handleClose} />
        </div>
    );
}
