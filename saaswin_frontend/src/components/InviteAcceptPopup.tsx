import { forwardRef, ReactNode } from 'react';
import CustomButton from './CustomButton';
import HeaderTitleClose from './PopupComponent/HeaderTitleClose';
import PopupInputs from './PopupComponent/PopupInputs';
import { IcoEditBlue } from '../../public/asset/Icon';

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
const InviteAcceptPopup = forwardRef<HTMLDivElement, ModalPopupProps>(
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
                            <IcoEditBlue  fill='#13A9E9' />
                            </div>
                        </div>
                        <div className='text-wrap' style={{paddingBottom:'0.9375rem'}}>
                            <div>
                                <h1>필수 정보를 입력하고 초대를 수락해보세요.<br/>
                                인사잇과 간편한 업무생활이 시작됩니다.</h1>
                            </div>
                        </div>
                        <div className='sub-text invite-sub-text'>
                            <p>필수 응답 항목 이외의 내용은 초대를 수락하고 나중에 입력할 수 있습니다.</p>
                            <p>필수 응답 항목<span>*</span></p>
                        </div>
                        <div className='password-input-wrap'>
                            <PopupInputs required={true} placeholder='휴대폰 번호를 입력하세요요' title='개인 연락처'/>
                            <PopupInputs title='거주지 주소' placeholder='휴대폰 번호를 입력하세요' type='text'/>
                            <PopupInputs title='주민등록번호' placeholder='주민등록번호를 입력하세요' type='text'/>
                            <div className='select-wrap'>
                                <div className='select-first'>
                            <PopupInputs title='급여 계좌' placeholder='은행 선택'   options={[
                                { value: 1, label: '개발팀' },
                                { value: 2, label: '디자인팀' },
                                { value: 3, label: '기획팀' }
                            ]} onChange={(value) => console.log(value)} type="select"/>
                                </div>
                                <div className='select-second'>
                                <PopupInputs placeholder='계좌번호를 입력하세요' type='number'/>
                                </div>
                            </div>
                            <div className='upload-wrap'>
                            <PopupInputs title='신분증 사본 업로드' disabled={true} placeholder='파일을 업로드 하세요.' type='upload'/>
                            </div>
                            <div className='upload-wrap'>
                            <PopupInputs title='주민등록등본 업로드' disabled={true} placeholder='파일을 업로드 하세요.' type='upload'/>
                            </div>
                            <div className='upload-wrap'>
                            <PopupInputs title='통장사본 업로드' disabled={true} placeholder='파일을 업로드 하세요.' type='upload'/>
                            </div>
                        </div>
                    </div>
                    <div className='btn-wrap'>
                            <div className='btn-wrap-inner'>
                                <CustomButton customButton="초대 수락하고 서비스 시작하기"></CustomButton>
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

export default InviteAcceptPopup; 