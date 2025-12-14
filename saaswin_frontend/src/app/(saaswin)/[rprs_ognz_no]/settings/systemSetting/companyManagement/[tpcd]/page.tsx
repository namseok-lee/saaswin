'use client';
import dynamic from 'next/dynamic';
// import Ssw01 from 'views/ssw01/ssw01';
const CompanyMangement = dynamic(() => import('views/settings/systemSetting/companyMangement/CompanyMangement'), {
    ssr: false,
});

export default function CompanyMangement_page({ params }: { params: { tpcd: string } }) {
    const { tpcd } = params;
    return <CompanyMangement tpcd={tpcd as string} />;
}
