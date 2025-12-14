'use client';

import InputTextBox from '@/components/InputTextBox';
import { useEffect, useState } from 'react';
interface Props {
    data: Record<string, any>;
    setData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
    setValidation: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}
export default function EvlTitle({ data, setData, setValidation }: Props) {
    const [title, setTitle] = useState('');
    const handleTitleChange = (e) => {
        const evl_nm = e.target.value;
        setTitle(evl_nm);
        setData((prevData) => {
            if (!prevData) return prevData; // prevData가 null인 경우 처리
            // 특정 조건에 맞는 객체를 찾아 업데이트
            return {
                ...prevData,
                evl_nm: evl_nm,
            };
        });
    };
    const handleDelete = () => {
        setTitle('');
    };
    useEffect(() => {
        if (data.evl_nm) {
            setTitle(data.evl_nm);
        } else {
            setTitle('이름없는 평가');
        }
        if (title === '') {
            setValidation((prev) => ({
                ...prev,
                validation: false,
                message: '제목은 필수 입력값 입니다.',
            }));
        } else {
            setValidation((prev) => ({
                ...prev,
                type: 'cm001-1',
                validation: true,
            }));
            // setData((prevData) => {
            //     // 특정 조건에 맞는 객체를 찾아 업데이트
            //     return {
            //         ...prevData,
            //         evl_nm: title,
            //     };
            // });
        }
    }, [title, data, setValidation]);

    return (
        <>
            <InputTextBox
                type='text'
                id='reveiwTitle'
                placeholder='평가 이름을 입력 해주세요.'
                validationText={!title ? '제목은 필수입력 입니다.' : null}
                value={title}
                onChange={(e) => {
                    handleTitleChange(e);
                }}
                onDelete={handleDelete}
                color='white'
            />
        </>
    );
}
