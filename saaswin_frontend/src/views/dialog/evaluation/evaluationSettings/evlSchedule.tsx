'use client';

import { Stack } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
// import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Loader from 'components/Loader';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { IcoCoworker, IcoDownEvaluation, IcoError, IcoGroup, IcoPersonFill, IcoUpEvaluation } from '@/assets/Icon';
import styles from '../../../../components/FullDialog/evaluation/style.module.scss';
import Typography from 'components/Typography';
import SwDatePicker from 'components/DatePicker';
import SwDateRangePicker from 'components/DateRangePicker';
interface Props {
    data: Record<string, any>;
    setData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
    setValidation: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}
export default function EvlScheduleInfo({ data, setData, setValidation }: Props) {
    const [procItem, setProcItem] = useState();
    const [evlYmd, setEvlYmd] = useState({}); // 평가 시작일, 종료일
    const [clgSelectYmd, setClgSelectYmd] = useState([]); // 동료 선택 기간
    const [rangeYmds, setRangeYmds] = useState({}); // 평가별 진행일

    // 평가별 날짜change함수
    const handleYmdChange = (ymd, type) => {
        setEvlYmd((prev) => ({
            ...prev,
            [type]: ymd,
        }));
    };
    const handleRangeChange = (newRange, type) => {
        const formattedBgngYmd = dayjs(newRange[0]).format('YYYYMMDD');
        const formattedEndYmd = dayjs(newRange[1]).format('YYYYMMDD');
        setRangeYmds((prev) => ({
            ...prev,
            [type]: newRange,
        }));
        setProcItem((prevItem) =>
            prevItem.map((item) =>
                item.proc_cd === type ? { ...item, bgng_ymd: formattedBgngYmd, end_ymd: formattedEndYmd } : item
            )
        );
    };
    useEffect(() => {
        if (data) {
            const procInfo = data?.proc_info?.map((item) => {
                const newItem = { ...item };
                // bgng_ymd와 end_ymd가 없으면 기본값 설정
                if (!newItem.bgng_ymd || !newItem.end_ymd) {
                    newItem.bgng_ymd = dayjs().format('YYYYMMDD');
                    newItem.end_ymd = dayjs().add(1, 'year').format('YYYYMMDD');
                }
                // proc_cd가 'hpm_group01015_cm0002'인 경우 추가 필드 업데이트
                if (newItem.proc_cd === 'hpm_group01015_cm0002') {
                    newItem.clg_selt_bgng_ymd =
                        newItem.clg_selt_bgng_ymd || dayjs().subtract(1, 'month').subtract(1, 'day').format('YYYYMMDD');
                    newItem.clg_selt_end_ymd =
                        newItem.clg_selt_end_ymd || dayjs().subtract(1, 'day').format('YYYYMMDD');
                }
                return newItem;
            });
            const evlYmdInfo = data.evl_bscs_info || {}; // 평가 정보 (일정)
            const clgYmdInfo = procInfo?.find((item) => item?.proc_cd === 'hpm_group01015_cm0002'); // 동료평가
            setEvlYmd({
                bgng_ymd: evlYmdInfo?.bgng_ymd ? dayjs(evlYmdInfo?.bgng_ymd) : dayjs(new Date()),
                end_ymd: evlYmdInfo?.end_ymd ? dayjs(evlYmdInfo?.end_ymd) : dayjs(new Date()).add(1, 'year'),
            });
            // 동료 선택기간 세팅
            setClgSelectYmd([
                clgYmdInfo?.clg_selt_bgng_ymd
                    ? dayjs(clgYmdInfo?.clg_selt_bgng_ymd)
                    : dayjs().subtract(1, 'month').subtract(1, 'day').format('YYYYMMDD'),
                clgYmdInfo?.clg_selt_end_ymd
                    ? dayjs(clgYmdInfo?.clg_selt_end_ymd)
                    : dayjs().subtract(1, 'day').format('YYYYMMDD'),
            ]);
            // 날짜를 proc_cd를 키로 하여 객체로 저장
            const newYmds = Object.fromEntries(
                procInfo?.map((item) => {
                    const bgngYmd = item?.bgng_ymd ? dayjs(item.bgng_ymd) : dayjs(new Date());
                    const endYmd = item?.end_ymd ? dayjs(item.end_ymd) : dayjs(new Date()).add(1, 'year');
                    return [item.proc_cd, [bgngYmd, endYmd]]; // [key, value] 형태로 반환
                })
            );
            // 날짜 값을 상태에 저장
            setRangeYmds(newYmds);
            setProcItem(procInfo);
        }
    }, []);
    useEffect(() => {
        setData((prev) => ({
            ...prev,
            evl_bscs_info: {
                ...prev.evl_bscs_info,
                bgng_ymd: dayjs(evlYmd?.bgng_ymd).format('YYYYMMDD'),
                end_ymd: dayjs(evlYmd?.end_ymd).format('YYYYMMDD'),
            },
            proc_info: procItem,
        }));
        setValidation((prev) => ({
            ...prev,
            validation: true,
            type: 'cm001-11',
        }));
    }, [evlYmd, procItem]);
    const isClgEvl = procItem?.find((item) => item.proc_cd === 'hpm_group01015_cm0002'); // 동료평가 유무
    if (!data.proc_info) return <Loader />;
    return (
        <div className={styles.schedule}>
            <section className={styles.section}>
                <Typography type='section'>평가 시작일</Typography>
                <div className={styles.desc}>평가 시작일자를 지정합니다. 날짜가 되면 알림을 받습니다.</div>
                <div className={styles.datePicker}>
                    <SwDatePicker
                        validationText=''
                        value={evlYmd?.bgng_ymd}
                        onChange={(e) => handleYmdChange(e, 'bgng_ymd')}
                    />
                </div>
            </section>
            {isClgEvl && (
                <section className={styles.section}>
                    <Typography type='section'>동료 선택 기간</Typography>
                    <div className={styles.desc}>평가대상자 또는 리더가 동료 평가자를 선택할 기간을 설정해주세요.</div>
                    <div className={styles.datePicker}>
                        <SwDateRangePicker
                            id='test10'
                            value={clgSelectYmd}
                            onChange={(e) => handleRangeChange(e, 'clg_pick_range')}
                        />
                    </div>
                </section>
            )}
            <section className={styles.section}>
                <Typography type='section'>평가별 진행일</Typography>
                <div className={styles.warning}>
                    <IcoError fill='#E33131' />
                    일정이 설정되지 않은 평가가 있습니다.
                </div>
                {procItem?.map((item) => {
                    return (
                        <div className={styles.datePickerGroup} key={item.proc_cd}>
                            <div className={styles.title}>
                                {item.proc_cd === 'hpm_group01015_cm0001' ? (
                                    <IcoPersonFill fill='#666' />
                                ) : item.proc_cd === 'hpm_group01015_cm0002' ? (
                                    <IcoCoworker fill='#666' />
                                ) : item.proc_cd === 'hpm_group01015_cm0003' ? (
                                    <IcoUpEvaluation fill='#666' />
                                ) : item.proc_cd === 'hpm_group01015_cm0009' ? (
                                    <IcoDownEvaluation fill='#666' />
                                ) : (
                                    <IcoGroup fill='#666' />
                                )}
                                {item.com_cd_nm}
                            </div>
                            <div className={styles.datePicker}>
                                <SwDateRangePicker
                                    id='test10'
                                    value={rangeYmds[item.proc_cd]}
                                    onChange={(e) => handleRangeChange(e, item.proc_cd)}
                                />
                            </div>
                        </div>
                    );
                })}
            </section>
            <section className={styles.section}>
                <Typography type='section'>평가 종료일</Typography>
                <div className={styles.desc}>평가 종료일자를 지정합니다. </div>
                <div className={styles.datePicker}>
                    <SwDatePicker
                        validationText=''
                        value={evlYmd?.end_ymd}
                        onChange={(e) => handleYmdChange(e, 'end_ymd')}
                    />
                </div>
            </section>
        </div>
    );
}
