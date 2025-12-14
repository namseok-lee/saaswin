'use client';
import InfoModal from 'components/InfoModal';
import Typography from 'components/Typography';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { searchDataProps } from 'types/component/SearchCondition';
import { loadLanguage } from 'i18n/i18n';
import { IcoCheckFill, IcoDelete, IcoFont, IcoLanguage, IcoPaint } from '@/assets/Icon';
import RadioGroup from 'components/RadioGroup';
import Radio from 'components/Radio';
import SvgFontSizeSm from '../../../../../public/img/font_size_sm.svg';
import SvgFontSizeMd from '../../../../../public/img/font_size_md.svg';
import SvgFontSizeLg from '../../../../../public/img/font_size_lg.svg';
import SvgThemeBlue from '../../../../../public/img/ico/ico_theme_blue.svg';
import SvgThemeGreen from '../../../../../public/img/ico/ico_theme_green.svg';
import Image from 'next/image';
import Button from 'components/Button';
export const IcoFontSizeSm = ({ className, fill }: { className?: string; fill?: string }) => {
    return <SvgFontSizeSm className={className} fill={fill} />;
};
export const IcoFontSizeMd = ({ className, fill }: { className?: string; fill?: string }) => {
    return <SvgFontSizeMd className={className} fill={fill} />;
};
export const IcoFontSizeLg = ({ className, fill }: { className?: string; fill?: string }) => {
    return <SvgFontSizeLg className={className} fill={fill} />;
};
export const IcoThemeBlue = ({ className, fill }: { className?: string; fill?: string }) => {
    return <SvgThemeBlue className={className} fill={fill} />;
};
export const IcoThemeGreen = ({ className, fill }: { className?: string; fill?: string }) => {
    return <SvgThemeGreen className={className} fill={fill} />;
};

export default function SettingsScreen_page({ params, masterUIinfo }: searchDataProps) {
    const tab_info = masterUIinfo?.tab_info || [];
    const title = masterUIinfo?.scr_tit || [];
    const [isChecked1, setIsChecked1] = useState('');
    // 다국어
    const { t } = useTranslation();
    // 모달창 설정
    const [isModalOpen, setIsModalOpen] = useState(false);
    // 테마 설정
    const [theme, setTheme] = useState('blue');
    // 화면에 모달 띄우기
    const handleModal = (e: any) => {
        setIsModalOpen((prev) => !prev);
    };
    // 글자 크기
    const [fontSize, setFontSize] = useState('14px');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'blue';
        setTheme(savedTheme);
        document.body.className = savedTheme;
        document.body.setAttribute('data-theme', savedTheme);

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `/styles/_theme_${savedTheme}.css`;
        document.head.appendChild(link);

        // 저장된 폰트 크기 적용
        const savedFontSize = localStorage.getItem('fontSize') || '14px';
        setFontSize(savedFontSize);
        document.documentElement.style.fontSize = savedFontSize;

        return () => {
            document.head.removeChild(link);
        };
    }, []);

    const changeTheme = (newTheme: string) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.body.className = newTheme;
        document.body.setAttribute('data-theme', newTheme);
        window.location.reload();
    };

    const changeFontSize = (size: string) => {
        setFontSize(size);
        localStorage.setItem('fontSize', size);
        document.documentElement.style.fontSize = size;
    };
    const languageChange = (value: string) => {
        const lng = value;
        setIsChecked1(lng);
        loadLanguage(lng, true); // 선택된 언어 데이터 로딩 및 캐싱
    };

    useEffect(() => {
        const languageData = localStorage.getItem('userLanguage');

        setIsChecked1(languageData);
    }, []);
    return (
        <div className='contContainer'>
            <div className='configuration screen'>
                <div className='pageHeader'>
                    <div className='pageInfo'>
                        <Typography type='page' onClickDesc={handleModal} title={t('화면설정')}>
                            {t('화면설정')}
                        </Typography>
                        <InfoModal
                            title={t('화면설정')}
                            // url="https://docs.google.com/document/d/e/2PACX-1vQvfxSoqEqQd6_CRF1aQufCUJYue2HpeMhWwTvGLgYIUrtudcrtf3nRLp8e_BlCLl-0HyfW0WuLCqIb/pub?embedded=true"
                            url='https://docs.google.com/document/d/18Qn9wrfJ7NQuLaW2UItsMkT1JN_Rjq31gDpsHWVqj_A/edit?usp=sharing#heading=h.w56nw9rlwsc'
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                        />
                    </div>
                </div>
                <section className='section'>
                    <div className='sectionTitle'>
                        <div className='ico'>
                            <IcoLanguage />
                        </div>
                        {t('언어설정')}
                    </div>
                    <div className='sectionCont'>
                        <RadioGroup direction='vertical'>
                            <Radio
                                id='ko'
                                name='lang'
                                label={'한국어'}
                                value={1}
                                checked={isChecked1 === 'ko'}
                                onChange={() => languageChange('ko')}
                            />
                            <Radio
                                id='en'
                                name='lang'
                                label='English'
                                value={2}
                                checked={isChecked1 === 'en'}
                                onChange={() => languageChange('en')}
                            />
                            <Radio
                                id='cn'
                                name='lang'
                                label='简体中文'
                                value={3}
                                checked={isChecked1 === 'cn'}
                                onChange={() => languageChange('cn')}
                            />
                            <Radio
                                id='ctfl'
                                name='lang'
                                label='繁體中文'
                                value={4}
                                checked={isChecked1 === 'ctfl'}
                                onChange={() => languageChange('ctfl')}
                            />
                            <Radio
                                id='jp'
                                name='lang'
                                label='日本語'
                                value={5}
                                checked={isChecked1 === 'jp'}
                                onChange={() => languageChange('jp')}
                            />
                        </RadioGroup>
                    </div>
                </section>
                <section className='section'>
                    <div className='sectionTitle'>
                        <div className='ico'>
                            <IcoFont />
                        </div>
                        {t('글자크기')}
                    </div>
                    <div className='sectionCont fontSize'>
                        <label htmlFor='fontSizeSm' className='label'>
                            <input
                                type='radio'
                                name='fontSize'
                                id='fontSizeSm'
                                className='iptRdo'
                                checked={fontSize === '14px'}
                                onChange={() => changeFontSize('14px')}
                            />
                            <div className='img'>
                                <SvgFontSizeSm />
                            </div>
                            <div className='text'>{t('축소')}</div>
                        </label>
                        <label htmlFor='fontSizeMd' className='label'>
                            <input
                                type='radio'
                                name='fontSize'
                                id='fontSizeMd'
                                className='iptRdo'
                                checked={fontSize === '16px'}
                                onChange={() => changeFontSize('16px')}
                            />
                            <div className='img'>
                                <SvgFontSizeMd />
                            </div>
                            <div className='text'>{t('기본값')}</div>
                        </label>
                        <label htmlFor='fontSizeLg' className='label'>
                            <input
                                type='radio'
                                name='fontSize'
                                id='fontSizeLg'
                                className='iptRdo'
                                checked={fontSize === '18px'}
                                onChange={() => changeFontSize('18px')}
                            />
                            <div className='img'>
                                <SvgFontSizeLg />
                            </div>
                            <div className='text'>{t('확대')}</div>
                        </label>
                    </div>
                </section>
                <section className='section'>
                    <div className='sectionTitle'>
                        <div className='ico'>
                            <IcoPaint />
                        </div>
                        {t('컬러테마')}
                    </div>
                    <div className='sectionCont theme'>
                        <label htmlFor='themeBlue' className='label'>
                            <input
                                type='radio'
                                name='theme'
                                id='themeBlue'
                                className='iptRdo'
                                checked={theme === 'blue'}
                                onChange={() => changeTheme('blue')}
                            />
                            <div className='wrapper'>
                                <div>
                                    <div className='img'>
                                        <IcoThemeBlue fill='#13A9E9' />
                                    </div>
                                    <div className='text'>{t('테마')}1</div>
                                </div>
                                <div className='preview'>
                                    <Image src='/img/theme_blue.png' alt='' width={400} height={225} />
                                </div>
                            </div>
                        </label>
                        <label htmlFor='themeGreen' className='label'>
                            <input
                                type='radio'
                                name='theme'
                                id='themeGreen'
                                className='iptRdo'
                                checked={theme === 'green'}
                                onChange={() => changeTheme('green')}
                            />
                            <div className='wrapper'>
                                <div>
                                    <div className='img'>
                                        <IcoThemeGreen fill='#1CAC70' />
                                    </div>
                                    <div className='text'>{t('테마')}2</div>
                                </div>
                                <div className='preview'>
                                    <Image src='/img/theme_green.png' alt='' width={400} height={225} />
                                </div>
                            </div>
                        </label>
                    </div>
                </section>
            </div>
        </div>
    );
}
