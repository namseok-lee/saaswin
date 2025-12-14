'use client';
import dynamic from 'next/dynamic';
// import Ssw01 from 'views/ssw01/ssw01';
const Efs_Template_List = dynamic(() => import('views/efs_template_list/efs_template_list'), {
    ssr: false,
});

export default function Efs_Template_Listpage({ params }: { params: { tpcd: string } }) {
    const { tpcd } = params;
    return <Efs_Template_List tpcd={tpcd as string} />;
}
