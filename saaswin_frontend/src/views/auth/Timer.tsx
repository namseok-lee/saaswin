'use client';
import { useEffect, useState } from 'react';
import { Typography } from '@mui/material';

interface TimerProps {
    initialTime: number;
    onTimeEnd: () => void;
    isActive: boolean;
}

export default function Timer({ initialTime, onTimeEnd, isActive }: TimerProps) {
    const [time, setTime] = useState(initialTime); // `useState`로 상태 관리

    useEffect(() => {
        if (isActive && time > 0) {
            const interval = setInterval(() => {
                setTime((prev) => {
                    if (prev <= 1) {
                        onTimeEnd(); // 시간이 끝나면 콜백 호출
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(interval); // 클린업 함수
        }
    }, [isActive, time, onTimeEnd]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (!isActive || time <= 0) return null; // 타이머가 꺼지면 UI에서 제거

    return (
        <Typography
            sx={{
                color: 'red',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                whiteSpace: 'nowrap',
            }}
        >
            {formatTime(time)}
        </Typography>
    );
}
