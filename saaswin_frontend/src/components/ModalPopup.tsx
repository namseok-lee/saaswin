import { forwardRef, ReactNode } from 'react';
import { IcoWavingHand } from '../../public/asset/Icon';
import CustomButton from './CustomButton';
import HeaderTitleClose from './PopupComponent/HeaderTitleClose';
import PopupInputs from './PopupComponent/PopupInputs';

interface ModalPopupProps {
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
const ModalPopup = forwardRef<HTMLDivElement, ModalPopupProps>(
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
                <HeaderTitleClose title={'비밀번호 설정'} onClose={onClose} />
                    <div className='content-wrap password-content-wrap'>
                        <div className='popup-icon-wrap'>
                            <div>
                            <IcoWavingHand fill='#666' />
                            </div>
                        </div>
                        <div className='text-wrap' style={{paddingBottom:'0.9375rem'}}>
                            <div>
                                <h1><span>화이트정보통신</span>의 <span>‘라이언’</span>님,<br/>
                                 인사잇에 오신것을 환영합니다!</h1>
                            </div>
                        </div>
                        <div className='sub-text'>
                            <p>사용할 비밀번호를 설정해주세요.</p>
                        </div>
                        <div className='password-slot-wrap'>
                            <div>
                                <div>
                                    <span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="3" height="3" viewBox="0 0 3 3" fill="none">
                                        <circle cx="1.5" cy="1.5" r="1.5" fill="#C4C4C4"/>
                                        </svg>
                                    </span>
                                    <p>
                                    [영문 대문자, 영문 소문자, 숫자, 특수문자] 중 3가지 이상을 사용한 10자리 
                                    이상 문자열
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className='password-input-wrap'>
                            <PopupInputs disabled={true} placeholder='아이디를 입력해주세요' title='아이디'/>
                            <PopupInputs title='새 비밀번호 입력' type='password'/>
                            <PopupInputs title='새 비밀번호 확인' type='password'/>
                        </div>
                    </div>
                    <div className='btn-wrap'>
                            <div className='btn-wrap-inner'>
                                <CustomButton customButton="비밀번호 저장"></CustomButton>
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

export default ModalPopup; 