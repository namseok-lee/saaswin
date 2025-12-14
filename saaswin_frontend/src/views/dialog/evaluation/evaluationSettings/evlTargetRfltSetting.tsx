'use client';

import { Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { fetcherPost } from 'utils/axios';

interface Props {
    data: Record<string, any>;
    setData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
    setValidation: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}
export default function EvlTargetRfltSetting({ data, setData, setValidation }: Props) {
    const [trprInfo, setTrprInfo] = useState([]);
    // useEffect(() => {
    //     if (data) {
    //         const userNoArray = data?.trpr_info.map((item) => ({
    //             user_no: item.user_no,
    //         }));
    //         console.log(userNoArray);
    //         const item = [
    //             {
    //                 sqlId: '82',
    //                 params: [
    //                     {
    //                         apnt_bgng_ymd: '19000101',
    //                         apnt_end_ymd: '29991231',
    //                         user_list: userNoArray,
    //                     },
    //                 ],
    //             },
    //         ];
    //         fetcherPost([process.env.NEXT_PUBLIC_SSW_SQL_SEARCH_ORIGIN_API_URL, item])
    //             .then((response) => {
    //                 console.log(response);
    //             })
    //             .catch((error) => {
    //                 console.error(error);
    //             });
    //         setTrprInfo(data?.trpr_info);
    //     }
    // }, []);
    useEffect(() => {
        setValidation((prev) => ({
            ...prev,
            validation: true,
            type: 'cm001-7',
        }));
    }, []);
    return (
        <>
            <Stack direction={'column'} spacing={3} sx={{ p: 2, backgroundColor: '#f6f6f6', borderRadius: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography component="div">
                        <div style={{ lineHeight: '2' }}>
                            <strong>대상자 소속 별 반영 비율</strong>
                            <br />
                            반영 비율은 대상자 별로 총 합이 100이 되게 작성하여 주세요
                        </div>
                    </Typography>
                </Stack>
                {/* <Stack direction={'row'} alignItems="center" sx={{ justifyContent: 'space-between' }}>
                    <DataGridPremium
                        rows={procRows}
                        columns={columns}
                        getRowId={(row) => `${row.id}_${row.evlfm_id}_${index}`}
                        processRowUpdate={(updatedRow, originalRow) => {
                            return processRowUpdate(updatedRow, originalRow);
                        }}
                        isCellEditable={(params) =>
                            params.row.id === 'hpm_group01015_cm0002' || params.row.id === 'hpm_group01015_cm0003'
                                ? false
                                : true
                        }
                        onProcessRowUpdateError={(error) => console.log(error)}
                    />
                </Stack> */}
            </Stack>
        </>
    );
}
