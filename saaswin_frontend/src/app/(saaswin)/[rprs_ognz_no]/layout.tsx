'use client';
import MainLayout from '@/app/layout/mainLayout';
import { LicenseInfo } from '@mui/x-license';

//LicenseInfo.setLicenseKey('7b6b007738db8ab41fd201b08286abffTz0xMDQwMTMsRT0xNzY1NDM1MDMwMDAwLFM9cHJlbWl1bSxMTT1wZXJwZXR1YWwsUFY9aW5pdGlhbCxLVj0y');
LicenseInfo.setLicenseKey(process.env.NEXT_PUBLIC_MUI_LICENSE_KEY || '');
export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <MainLayout>{children}</MainLayout>;
}
