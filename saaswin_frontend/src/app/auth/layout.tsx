// components/AuthLayout.tsx
import AuthLayout from 'app/layout/authLayout';
import React from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => <AuthLayout>{children}</AuthLayout>;

export default Layout;
