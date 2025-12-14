'use client';
import dynamic from 'next/dynamic';
// import Ssw01 from 'views/ssw01/ssw01';
const Efs_apply_setting_List = dynamic(() => import('views/efs_apply_setting_list/efs_apply_setting_list'), {
    ssr: false,
});

export default function Efs_Template_Listpage({ params }: { params: { tpcd: string } }) {
    const { tpcd } = params;
    return <Efs_apply_setting_List tpcd={tpcd as string} />;
}
