'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from 'utils/store/auth';

const GateWayPage = () => {
    const setAuth = useAuthStore((state) => state.setAuth);
    const router = useRouter();
    const searchParams = useSearchParams();

    // 상태로 관리하여 초기 렌더링에서 searchParams 값이 없을 때 대비
    const [ognzNo, setOgnzNo] = useState('');
    const [userNo, setUserNo] = useState('');
    const [rprsOgnzNo, setRprsOgnzNo] = useState('');
    const [PswdLckNocs, setPswdLckNocs] = useState('');
    const [isLoading, setIsLoading] = useState(true); // ✅ 로딩 상태 추가
    const [acntSttsCd, setAcntSttsCd] = useState(''); // 계정 잠김 코드
    const [currentFailCount, setCurrentFailCount] = useState(0); // 현재 실패 횟수

    // ✅ access_token 가져오기
    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const deleteCookie = (name, path = '/') => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
    };

    useEffect(() => {
        const ognz_no = searchParams?.get('ognz_no') || '';
        const user_no = searchParams?.get('user_no') || '';
        const rprs_ognz_no = searchParams?.get('rprs_ognz_no') || '';
        const pswd_lck_nocs = searchParams?.get('pswd_lck_nocs') || '';
        const acnt_stts_cd = searchParams?.get('acnt_stts_cd') || '';
        const current_fail_count = searchParams?.get('current_fail_count') || '';
        // searchParams가 업데이트된 후 상태 업데이트
        setOgnzNo(ognz_no);
        setUserNo(user_no);
        setRprsOgnzNo(rprs_ognz_no);
        setPswdLckNocs(pswd_lck_nocs);
        setAcntSttsCd(acnt_stts_cd); // 계정 잠김 코드 확인
        setCurrentFailCount(Number(current_fail_count) || 0); // 현재 실패 횟수
        setIsLoading(false); // ✅ 데이터가 업데이트되면 로딩 완료
    }, [searchParams]); //  searchParams가 변경될 때만 실행

    // 현재 공백으로 받든, 값이 있든 값이 세팅 되어 밑에 useEffect를 타게 됨
    useEffect(() => {
        if (isLoading) return; // ✅ 데이터가 로딩되기 전까지 체크하지 않음
        if (ognzNo === '' || userNo === '' || rprsOgnzNo === '') {
            alert('sns에 연동된 상태가 아닙니다. 일반 로그인으로 접속해서 연동 후 이용해주세요.');
            router.replace('/auth');
            return;
        }

        // 비밀번호 실패 횟수 확인
        if (Number(currentFailCount) >= Number(PswdLckNocs)) {
            alert('비밀번호 실패 횟수가 초과되었습니다. 관리자에게 문의하세요.');
            router.replace('/auth');
            return;
        }

        // 계정 잠김 확인
        if (acntSttsCd !== 'hpr_group00009_cm0002') {
            alert('계정이 활성화 상태가 아닙니다. 관리자에게 문의하세요.');
            router.replace('/auth');
            return;
        }

        //  URL에서 가져온 값이 비어 있으면 '/auth'로 리다이렉트
        const accessToken = getCookie('access_token');
        const refreshToken = getCookie('refresh_token');
        console.log('accessToken', accessToken);
        console.log('refreshToken', refreshToken);
        if (accessToken !== undefined) {
            localStorage.setItem('accessToken', accessToken);
            deleteCookie('access_token');
        }

        if (refreshToken !== undefined) {
            localStorage.setItem('refreshToken', refreshToken);
            deleteCookie('refresh_token');
        }

        // 인증 정보를 저장하고 홈으로 이동
        setAuth({ ognzNo, userNo, rprsOgnzNo });
        router.push('/');
    }, [ognzNo, userNo, rprsOgnzNo, PswdLckNocs, isLoading, router, setAuth]);

    return <div></div>;
};

export default GateWayPage;
