import { useMemo } from 'react';
import { fetcherPost } from '../utils/axios';
import useSWR from 'swr';


export function googleCalendarInsert(tpcdParam, setData, setDataLoading) {
    const url = '/api/google/calendar/insert';
    const item = {
        companyCd: '',
        objectId: '',
        scr_itg_no: tpcdParam,
        scr_type_cd: tpcdParam,
    };
    fetcherPost([url, item]) // fetcherPost 함수 사용
        .then((response) => {
            setData(response);
            setDataLoading(false);
        })
        .catch((error) => {
            console.error(error);
        });
}
