'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set) => ({
            // 상태 정의
            username: null,
            userNo: null,
            ognzNo: null,
            rprsOgnzNo: null,
            duty_cd: null,
            duty_nm: null,
            jbgd_cd: null,
            jbgd_nm: null,
            jbgp_cd: null,
            jbgp_nm: null,
            jbps_cd: null,
            jbps_nm: null,
            jbttl_cd: null,
            jbttl_nm: null,
            ipv4: null,
            ipv6: null,
            // 전역변수 상태 저장
            setAuth: (authData) =>
                set({
                    username: authData.username,
                    userNo: authData.userNo,
                    ognzNo: authData.ognzNo,
                    rprsOgnzNo: authData.rprsOgnzNo,
                    duty_cd: authData.duty_cd,
                    duty_nm: authData.duty_nm,
                    jbgd_cd: authData.jbgd_cd,
                    jbgd_nm: authData.jbgd_nm,
                    jbgp_cd: authData.jbgp_cd,
                    jbgp_nm: authData.jbgp_nm,
                    jbps_cd: authData.jbps_cd,
                    jbps_nm: authData.jbps_nm,
                    jbttl_cd: authData.jbttl_cd,
                    jbttl_nm: authData.jbttl_nm,
                    ipv4: authData.ipv4,
                    ipv6: authData.ipv6,
                }),
            // 전역변수 상태 삭제
            clearAuth: () =>
                set({
                    username: null,
                    userNo: null,
                    ognzNo: null,
                    rprsOgnzNo: null,
                    duty_cd: null,
                    duty_nm: null,
                    jbgd_cd: null,
                    jbgd_nm: null,
                    jbgp_cd: null,
                    jbgp_nm: null,
                    jbps_cd: null,
                    jbps_nm: null,
                    jbttl_cd: null,
                    jbttl_nm: null,
                }),
        }),
        {
            name: 'auth', // localStorage에 저장될 키 이름
        }
    )
);
