import axios from 'axios';

// const ESCHARTAxiosServices = axios.create({
//     baseURL: process.env.NEXT_PUBLIC_SSW_API_URL,
//     headers: {
//         'Content-Type': 'application/json',
//     },
// });

const SSWAxiosServices = axios.create({ baseURL: process.env.NEXT_PUBLIC_SSW_API_URL });
export const fetcherPostChartSearch = async (url, body) => {
    const auth = JSON.parse(localStorage.getItem('auth') || '{}');
    const userNo = auth?.state?.userNo ?? '';
    const rprsOgnzNo = auth?.state?.rprsOgnzNo ?? '';

    if (Array.isArray(body?.params)) {
        body.params[0] = {
            ...body.params[0],
            work_user_no: userNo,
            rprs_ognz_no: rprsOgnzNo,
        };
    }

    const response = await SSWAxiosServices.post(url, body);
    return response.data;
};

// export const fetcherPostChartSearchById = async (url, body) => {
//     const auth = JSON.parse(localStorage.getItem('auth') || '{}');
//     const userNo = auth?.state?.userNo ?? '';
//     const rprsOgnzNo = auth?.state?.rprsOgnzNo ?? '';

//     if (Array.isArray(body?.params)) {
//         body.params[0] = {
//             ...body.params[0],
//             work_user_no: userNo,
//             rprs_ognz_no: rprsOgnzNo,
//         };
//     }

//     const response = await SSWAxiosServices.post(url, body);
//     return response.data;
// };
