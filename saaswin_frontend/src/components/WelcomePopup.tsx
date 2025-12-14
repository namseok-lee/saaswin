import { forwardRef, ReactNode } from 'react';
import Button from './Button';
import { IcoClose } from '@/assets/Icon';
import { IcoWavingHand } from '../../public/asset/Icon';
import CustomButton from './CustomButton';

interface WelcomePopupProps {
    className?: string;
    open?: boolean;
    onClose?: () => void;
    onConfirm?: () => void;
    children?: ReactNode;
    title?: string;
    message?: string;
    confirmText?: string;
    closeText?: string;
    showCloseButton?: boolean;
    size?: 'sm' | 'md' | 'lg';
    imageSrc?: string;
    imageAlt?: string;
}

// eslint-disable-next-line react/display-name
const WelcomePopup = forwardRef<HTMLDivElement, WelcomePopupProps>(
    (
        {
            className = '',
            open = false,
            onClose,
            onConfirm,
            children,
            title = '환영합니다',
            message,
            confirmText = '확인',
            closeText = '닫기',
            showCloseButton = true,
            size = 'md',
            imageSrc,
            imageAlt = '팝업 이미지',
        },
        ref
    ) => {
        if (!open) return null;

        return (
            <div ref={ref} className={`welcome-popup-overlay ${className}`}>
                <div className={`welcome-popup ${size}`}>
                    <div className='btn-close-wrap'>
                    {showCloseButton && (
                        <Button className='btn-close' >
                           <div onClick={onClose}><IcoClose fill='#666' /></div>
                        </Button>
                    )}
                    </div>
                    <div className='content-wrap'>
                        <div className='popup-icon-wrap'>
                            <div>
                            <IcoWavingHand fill='#666' />
                            </div>
                        </div>
                        <div className='text-wrap'>
                            <div>
                                <h1><span>‘라이언’</span>님, 인사잇에 처음 오신것을 환영합니다!</h1>
                                <h2>서비스를 시작하기 전,<br/>
                                필수 기업 정보를 입력해주세요</h2>
                            </div>
                        </div>
                        <div className='slot-wrap'>
                            <div className='slot-wrap-inner'>
                                <h2>기업 기본정보 입력 위치 : 설정 &gt; 시스템 설정 &gt; 회사 정보 관리</h2>
                            </div>
                        </div>
                    </div>
                    <div className='btn-wrap'>
                            <div className='btn-wrap-inner'>
                                <CustomButton customButton="정보 입력하기"></CustomButton>
                            </div>
                        </div>
                        
                    {imageSrc && (
                        <div className='popup-image-wrap'>
                            <img src={imageSrc} alt={imageAlt} className='popup-image' />
                        </div>
                    )}
                </div>
            </div>
        );
    }
);

export default WelcomePopup; 