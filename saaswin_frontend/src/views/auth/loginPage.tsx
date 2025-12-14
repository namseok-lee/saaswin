'use client';
import { useState } from 'react';
import LoginForm from './LoginForm';
import ResetPasswordForm from './ResetPasswordForm';
import ResetCompleteForm from './ResetCompleteForm';
import SnackbarAlert from './SnackbarAlert';
import SecondCertForm from './SecondCertForm';

export default function LoginPage() {
    const [step, setStep] = useState<'login' | 'resetPassword' | 'resetComplete' | 'secondCertification'>('login');
    const [validation, setValidation] = useState({ open: false, message: '', type: 'single' });
    const [email, setEmail] = useState(''); // 이메일 값을 resetPasswordForm에서 resetPasswordComplete로 전달하기 위해
    const [certUserInfo, setCertUserInfo] = useState(null);
    const showSnackbar = (message: string, type: 'single' | 'double' = 'single') => {
        setValidation({ open: true, message, type });
    };

    return (
        <>
            <SnackbarAlert validation={validation} setValidation={setValidation} />

            {step === 'login' && (
                // <LoginForm onResetPassword={() => setStep('resetPassword')} showSnackbar={showSnackbar} />
                <LoginForm
                    setStep={setStep}
                    showSnackbar={showSnackbar}
                    setCertUserInfo={setCertUserInfo}
                    setEmail={setEmail}
                />
            )}
            {step === 'resetPassword' && (
                <ResetPasswordForm
                    onResetComplete={() => setStep('resetComplete')}
                    onBack={() => setStep('login')}
                    setStep={setStep}
                    setEmail={setEmail}
                />
            )}
            {step === 'resetComplete' && (
                <ResetCompleteForm
                    onBackToLogin={() => setStep('login')}
                    onBackToResetPassword={() => setStep('resetPassword')}
                    email={email}
                />
            )}
            {step === 'secondCertification' && (
                <SecondCertForm onBackToLogin={() => setStep('login')} certUserInfo={certUserInfo} email={email} />
            )}
        </>
    );
}
