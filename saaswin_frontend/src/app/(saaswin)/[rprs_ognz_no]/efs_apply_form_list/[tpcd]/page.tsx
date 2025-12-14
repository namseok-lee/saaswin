'use client';
import dynamic from 'next/dynamic';
// import Ssw01 from 'views/ssw01/ssw01';
const Efs_apply_form_List = dynamic(() => import('views/efs_apply_form_list/efs_apply_form_list'), {
    ssr: false,
});

export default function Efs_Template_Listpage({ params }: { params: { tpcd: string } }) {
    const { tpcd } = params;
    return <Efs_apply_form_List tpcd={tpcd as string} />;
}
