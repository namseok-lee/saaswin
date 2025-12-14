'use client';
import { useEffect, useState } from 'react';
import { TextField, Typography } from '@mui/material';
import { fetcherPostData } from 'utils/axios';
import { useAuthStore } from 'utils/store/auth';

// 정규식 정의
const passwordRegex = {
    hrs_group00928_cm0001: /^(?=.*[a-z])(?=.*\d)[a-z\d]{8,}$/, // 영문 소문자 + 숫자 포함, 8자 이상
    hrs_group00928_cm0002: /^(?=(?:.*[A-Z])?(?:.*[a-z])?(?:.*\d)?(?:.*[\W_])?.{10,})[A-Za-z\d\W_]{10,}$/, // 대소문자, 숫자, 특수문자 중 3가지 이상, 10자 이상
    hrs_group00928_cm0003: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{10,}$/, // 대소문자, 숫자, 특수문자 포함, 10자 이상
};

const passwordDescriptions = {
    hrs_group00928_cm0001: '영문 소문자 + 숫자 포함, 8자 이상',
    hrs_group00928_cm0002: '대소문자, 숫자, 특수문자 중 3가지 이상, 10자 이상',
    hrs_group00928_cm0003: '대소문자, 숫자, 특수문자 모두 포함 10자 이상',
};

export default function PasswordValidationForm({ password, onValidationResult, onRuleChange, onReuseLimitChange }) {
    const [passwordComplexity, setPasswordComplexity] = useState('hrs_group00928_cm0002'); // 기본값 설정
    const [passwordReuseLimit, setPasswordReuseLimit] = useState(5); // 비밀번호 재사용 제한 설정
    const rprsOgnzNo = useAuthStore((state) => state.rprsOgnzNo); // 조직번호 가져오기

    useEffect(() => {
        const item = [
            {
                sqlId: 'hrs_login01',
                sql_key: 'hrs_login_crtr_stng_get',
                params: [{}],
            },
        ];
        fetcherPostData(item)
            .then((response) => {
                const value = response[0].hrs_info;
                console.log('비밀번호 규칙 API 값:', value);
                setPasswordComplexity(value.pswd_scrty_knd);
                setPasswordReuseLimit(value.pswd_ruse_lmt_cnt);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    const isValid = passwordRegex[passwordComplexity]?.test(password) ?? false;

    useEffect(() => {
        onValidationResult(isValid); // 벨리데이션 체크
    }, [isValid, onValidationResult]);

    useEffect(() => {
        onRuleChange(passwordDescriptions[passwordComplexity]); // 부모의 setPasswordRule을 실행하여 값 업데이트
    }, [passwordComplexity, onRuleChange]);

    useEffect(() => {
        onReuseLimitChange(passwordReuseLimit);
    }, [passwordReuseLimit, onReuseLimitChange]);

    return null;
}
