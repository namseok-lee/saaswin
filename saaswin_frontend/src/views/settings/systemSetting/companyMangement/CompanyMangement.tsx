'use client';

import Button from 'components/Button';
import ButtonGroup from 'components/ButtonGroup';
import Typography from 'components/Typography';
import { useRef, useState } from 'react';
import { fetcherPostData } from 'utils/axios';
import { IcoAdd, IcoCircle, IcoCompany, IcoStamp } from '@/assets/Icon';
import MultiCompanyManagement from './MultiCompanyManagement';
import { useTranslation } from 'react-i18next';

export default function CompanyMangement({ params }: { params: { tpcd: string } }) {
    const [isNew, setIsNew] = useState(true);
    const [companyInfo, setCompanyInfo] = useState({
        corp_nm: '', // 회사 명
        corp_eng_nm: '', // 법인 영문명
        corp_rprsv_nm: '', // 법인 대표 이름
        rprsv_rrno: '', //  대표자 주민번호
        corp_rprsv_eng_nm: '', // 대표자 영문명
        crno: '', // 법인번호
        hdofc_brno: '', // 사업자번호
        bplc_telno: '', // 전화번호
        bplc_fxno: '', // 팩스번호
        bplc_zip: '', // 우편번호
        bplc_addr: '', // 주소
        bplc_daddr: '', // 상세주소
        bplc_eng_addr: '', // 영문주소
        pic_nm: '', // 담당자 이름
        pic_ogdp_nm: '', // 담당자 소속명
        pic_telno: '', // 담당자 연락처
    });
    // 이미지 미리보기
    const [imgFile, setImgFile] = useState('');
    const imgRef = useRef<HTMLInputElement | null>(null);

    // 이미지 미리보기
    const saveImgFile = () => {
        const file = imgRef.current?.files?.[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            setImgFile(reader.result as string);
        };
    };
    // 다국어
    const { t } = useTranslation();
    const handleChange = (id: string, value: string) => {
        setCompanyInfo((prev) => ({ ...prev, [id]: value }));
    };
    const handleDelete = (id: string) => {
        setCompanyInfo((prev) => ({ ...prev, [id]: '' }));
    };
    const handleSave = () => {
        const isValid = Object.entries(companyInfo).every(([key, value]) => {
            // 영문명 필드는 검사에서 제외
            if (key === 'corp_eng_nm' || key === 'corp_rprsv_eng_nm' || key === 'bplc_eng_addr') {
                return true;
            }
            // 나머지 필드는 빈 값이 아닌지 확인
            return value !== '';
        });
        if (!isValid) {
            alert('필수 정보를 모두 입력해주세요.');
            return; // 저장 중단
        }
        const params = [
            {
                ...companyInfo,
                com_cd: '',
                del_yn: 'N',
                bgng_ymd: '19000101',
                end_ymd: '19000101',
                cd_prord: null,
                action_type: isNew ? 'i' : 'u',
            },
        ];
        const item = [
            {
                sqlId: 'hrs_com01',
                sql_key: 'hrs_rprs_ognz_cd_grid_cud',
                params: [{ ognz_info: params, group_cd: 'hpr_group00004' }],
            },
        ];
        fetcherPostData(item)
            .then((response) => {
                console.log('response', response);
            })
            .catch((error) => {
                console.error(error);
            });
    };
    // useEffect(() => {
    //     const item = [
    //         {
    //             sqlId: 'hrs_com01',
    //             sql_key: 'hrs_rprs_ognz_cd_get',
    //             params: [{ rprs_group_cd: 'hpr_group00004' }],
    //         },
    //     ];
    //     fetcherPostData(item)
    //         .then((response) => {
    //             const resData = response[0].data;
    //             if (resData) {
    //                 setIsNew(false);
    //             }
    //             setCompanyInfo(resData[0]); // 임시적으로 0번째를 주사업장으로 지정함. (기획논의 후 변경)
    //         })
    //         .catch((error) => {
    //             console.error(error);
    //         });
    // }, []);
    return (
        <div className='contContainer'>
            <div className='configuration companyInfoManage'>
                <div className='pageHeader'>
                    <div className='pageInfo'>
                        <Typography type='page' desc tooltip title='heading title'>
                            {t('회사 정보 관리')}
                        </Typography>
                    </div>
                    <ButtonGroup className='options'>
                        <Button id='btnDefault' type='default' size='sm' className='btnWithIcon'>
                            {t('다중 사업장 관리')}
                        </Button>
                        <Button id='btnDefault' type='default' size='sm' className='btnWithIcon'>
                            {t('다중 법인 관리')}
                        </Button>
                    </ButtonGroup>
                </div>
                {/* 회사 정보 입력 */}
                {/* <section className='section infoSubmit'>
                    <div className='sectionTitle'>
                        <div className='ico'>
                            <IcoCompany />
                        </div>
                        회사 정보 입력
                    </div>
                    <div className='sectionCont'>
                        <ul className='formList'>
                            <li className='item'>
                                <InputTextBox
                                    type='text'
                                    id='corp_nm'
                                    placeholder='회사 이름 (법인명)을 입력하세요.'
                                    hasToggle={false}
                                    showPassword={false}
                                    label='회사 이름 (법인 명)'
                                    asterisk
                                    vertical
                                    validationText=''
                                    value={companyInfo.corp_nm}
                                    onChange={(e) => handleChange('corp_nm', e.target.value)}
                                    onDelete={() => handleDelete('corp_nm')}
                                />
                            </li>
                            <li className='item'>
                                <InputTextBox
                                    type='text'
                                    id='corp_eng_nm'
                                    placeholder='법인 영문명을 입력하세요.'
                                    hasToggle={false}
                                    showPassword={false}
                                    label='법인 영문명'
                                    vertical
                                    validationText=''
                                    value={companyInfo.corp_eng_nm}
                                    onChange={(e) => handleChange('corp_eng_nm', e.target.value)}
                                    onDelete={() => handleDelete('corp_eng_nm')}
                                />
                            </li>
                            <li></li>

                            <li className='item'>
                                <InputTextBox
                                    type='text'
                                    id='corp_rprsv_nm'
                                    placeholder='법인 대표 이름을 입력하세요.'
                                    hasToggle={false}
                                    showPassword={false}
                                    label='법인 대표 이름'
                                    asterisk
                                    vertical
                                    validationText=''
                                    value={companyInfo.corp_rprsv_nm}
                                    onChange={(e) => handleChange('corp_rprsv_nm', e.target.value)}
                                    onDelete={() => handleDelete('corp_rprsv_nm')}
                                />
                            </li>
                            <li className='item'>
                                <InputTextBox
                                    type='text'
                                    id='rprsv_rrno'
                                    placeholder='대표자 주민번호'
                                    hasToggle={false}
                                    showPassword={false}
                                    label='대표자 주민번호를 입력하세요.'
                                    asterisk
                                    vertical
                                    validationText=''
                                    value={companyInfo.rprsv_rrno}
                                    onChange={(e) => handleChange('rprsv_rrno', e.target.value)}
                                    onDelete={() => handleDelete('rprsv_rrno')}
                                />
                            </li>
                            <li className='item'>
                                <InputTextBox
                                    type='text'
                                    id='corp_rprsv_eng_nm'
                                    placeholder='대표자 영문 이름'
                                    hasToggle={false}
                                    showPassword={false}
                                    label='대표자 영문명을 입력하세요.'
                                    vertical
                                    validationText=''
                                    value={companyInfo.corp_rprsv_eng_nm}
                                    onChange={(e) => handleChange('corp_rprsv_eng_nm', e.target.value)}
                                    onDelete={() => handleDelete('corp_rprsv_eng_nm')}
                                />
                            </li>

                            <li className='item'>
                                <InputTextBox
                                    type='text'
                                    id='crno'
                                    placeholder='법인 번호'
                                    hasToggle={false}
                                    showPassword={false}
                                    label='법인 번호를 입력하세요.'
                                    asterisk
                                    vertical
                                    validationText=''
                                    value={companyInfo.crno}
                                    onChange={(e) => handleChange('crno', e.target.value)}
                                    onDelete={() => handleDelete('crno')}
                                />
                            </li>
                            <li className='item'>
                                <InputTextBox
                                    type='text'
                                    id='hdofc_brno'
                                    placeholder='사업자 번호'
                                    hasToggle={false}
                                    showPassword={false}
                                    label='사업자 번호를 입력하세요.'
                                    asterisk
                                    vertical
                                    validationText=''
                                    value={companyInfo.hdofc_brno}
                                    onChange={(e) => handleChange('hdofc_brno', e.target.value)}
                                    onDelete={() => handleDelete('hdofc_brno')}
                                />
                            </li>
                            <li className='item'></li>

                            <li className='item'>
                                <InputTextBox
                                    type='text'
                                    id='bplc_telno'
                                    placeholder='전화번호를 입력하세요.'
                                    hasToggle={false}
                                    showPassword={false}
                                    label='전화번호'
                                    asterisk
                                    vertical
                                    validationText=''
                                    value={companyInfo.bplc_telno}
                                    onChange={(e) => handleChange('bplc_telno', e.target.value)}
                                    onDelete={() => handleDelete('bplc_telno')}
                                />
                            </li>
                            <li className='item'>
                                <InputTextBox
                                    type='text'
                                    id='bplc_fxno'
                                    placeholder='팩스번호를 입력하세요.'
                                    hasToggle={false}
                                    showPassword={false}
                                    label='팩스번호'
                                    asterisk
                                    vertical
                                    validationText=''
                                    value={companyInfo.bplc_fxno}
                                    onChange={(e) => handleChange('bplc_fxno', e.target.value)}
                                    onDelete={() => handleDelete('bplc_fxno')}
                                />
                            </li>
                            <li className='item'></li>

                            <li className='item'>
                                <InputTextBox
                                    type='text'
                                    id='bplc_zip'
                                    placeholder='우편번호를 입력하세요.'
                                    hasToggle={false}
                                    showPassword={false}
                                    label='우편번호'
                                    asterisk
                                    vertical
                                    validationText=''
                                    value={companyInfo.bplc_zip}
                                    onChange={(e) => handleChange('bplc_zip', e.target.value)}
                                    onDelete={() => handleDelete('bplc_zip')}
                                />
                            </li>
                            <li className='item'></li>
                            <li className='item'></li>
                            <li className='item col'>
                                <InputTextBox
                                    type='text'
                                    id='bplc_addr'
                                    placeholder='주소를 입력하세요.'
                                    hasToggle={false}
                                    showPassword={false}
                                    label='주소'
                                    asterisk
                                    vertical
                                    validationText=''
                                    value={companyInfo.bplc_addr}
                                    onChange={(e) => handleChange('bplc_addr', e.target.value)}
                                    onDelete={() => handleDelete('bplc_addr')}
                                />
                            </li>
                            <li className='item col'>
                                <InputTextBox
                                    type='text'
                                    id='bplc_daddr'
                                    placeholder='상세주소를 입력하세요.'
                                    hasToggle={false}
                                    showPassword={false}
                                    label='상세주소'
                                    asterisk
                                    vertical
                                    validationText=''
                                    value={companyInfo.bplc_daddr}
                                    onChange={(e) => handleChange('bplc_daddr', e.target.value)}
                                    onDelete={() => handleDelete('bplc_daddr')}
                                />
                            </li>
                            <li className='item col'>
                                <InputTextBox
                                    type='text'
                                    id='bplc_eng_addr'
                                    placeholder='영문주소를 입력하세요.'
                                    hasToggle={false}
                                    showPassword={false}
                                    label='영문주소'
                                    vertical
                                    validationText=''
                                    value={companyInfo.bplc_eng_addr}
                                    onChange={(e) => handleChange('bplc_eng_addr', e.target.value)}
                                    onDelete={() => handleDelete('bplc_eng_addr')}
                                />
                            </li>
                            <li className='item'>
                                <InputTextBox
                                    type='text'
                                    id='pic_nm'
                                    placeholder='담당자 이름을 입력하세요.'
                                    hasToggle={false}
                                    showPassword={false}
                                    label='담당자 이름'
                                    asterisk
                                    vertical
                                    validationText=''
                                    value={companyInfo.pic_nm}
                                    onChange={(e) => handleChange('pic_nm', e.target.value)}
                                    onDelete={() => handleDelete('pic_nm')}
                                />
                            </li>
                            <li className='item'>
                                <InputTextBox
                                    type='text'
                                    id='pic_ogdp_nm'
                                    placeholder='담당자 소속을 입력하세요.'
                                    hasToggle={false}
                                    showPassword={false}
                                    label='담당자 소속'
                                    asterisk
                                    vertical
                                    validationText=''
                                    value={companyInfo.pic_ogdp_nm}
                                    onChange={(e) => handleChange('pic_ogdp_nm', e.target.value)}
                                    onDelete={() => handleDelete('pic_ogdp_nm')}
                                />
                            </li>
                            <li className='item'>
                                <InputTextBox
                                    type='text'
                                    id='pic_telno'
                                    placeholder='담당자 연락처를 입력하세요.'
                                    hasToggle={false}
                                    showPassword={false}
                                    label='담당자 연락처'
                                    asterisk
                                    vertical
                                    validationText=''
                                    value={companyInfo.pic_telno}
                                    onChange={(e) => handleChange('pic_telno', e.target.value)}
                                    onDelete={() => handleDelete('pic_telno')}
                                />
                            </li>
                        </ul>
                    </div>
                </section> */}
                {/* 다중 사업장 관리 */}
                <MultiCompanyManagement />
                {/* 회사 직인 */}
                <section className='section infoSubmit'>
                    <div className='sectionTitle'>
                        <div className='ico'>
                            <IcoCompany />
                        </div>
                        {t('회사 직인')}
                    </div>
                    <div className='sectionCont'>
                        {/* <div className='desc'>등록된 직인은 재직증명서 등 전자계약 시에 활용됩니다.</div> */}
                        <div className='desc'>{t('50040')}</div>
                        <div className='officailStamp'>
                            {!imgFile ? (
                                <>
                                    <label htmlFor='fileStamp' className='upload'>
                                        <IcoStamp fill='#C4C4C4' />
                                        <div className='text'>
                                            {t('직인등록')} <IcoAdd fill='#C4C4C4' />
                                        </div>
                                    </label>
                                    <input
                                        type='file'
                                        name='fileStamp'
                                        id='fileStamp'
                                        className='inputFile'
                                        multiple
                                        accept='.jpg, .jpeg, .png, .gif'
                                        ref={imgRef}
                                        onChange={saveImgFile}
                                    />
                                </>
                            ) : (
                                <div className='preview'>
                                    <img src={imgFile ? imgFile : ''} alt='직인 이미지' className='img' />
                                    <label htmlFor='fileStamp' className='swichImg'>
                                        <div className='btnWithIcon btnSwitchImg'>
                                            {t('변경')} <IcoCircle fill='#fff' />
                                        </div>
                                    </label>
                                    <input
                                        type='file'
                                        name='fileStamp'
                                        id='fileStamp'
                                        className='inputFile'
                                        multiple
                                        accept='.jpg, .jpeg, .png, .gif'
                                        ref={imgRef}
                                        onChange={saveImgFile}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </section>
                {/* <div className='pageBtnArea'>
                    <Button
                        type='primary'
                        size='lg'
                        onClick={() => {
                            handleSave();
                        }}
                        className='btnWithIcon'
                    >
                        <IcoCheckFill fill='#FFFFFF' />
                        저장
                    </Button>
                </div> */}
            </div>
        </div>
    );
}
