import Button from '@/components/Button';
import SwModal from '@/components/Modal';
import Textarea from '@/components/Textarea';
import { IcoPersonFill, IcoPlus, IcoShortInfo, IcoTrashFill } from '../../../public/asset/Icon';
import { useEffect, useState } from 'react';
import SwTooltip from '@/components/Tooltip';
import styles from './page.module.scss';
import Switch from '@/components/Switch';
import { randomId } from '@mui/x-data-grid-generator';
import { fetcherPostData } from '@/utils/axios';
import Typography from '@/components/Typography';

interface IntroItem {
    id: string;
    gdntc_name: string;
    gdntc_cn: string;
    seq: number;
}

interface Props {
    userData: any;
    open: boolean;
    onClose: () => void;
    setRetrieve: (retrieve: boolean) => void;
}

const CreaateMyIntrodution = ({ userData, open, onClose, setRetrieve }: Props) => {
    const auth = JSON.parse(localStorage.getItem('auth') || '{}');
    const work_user_no = auth?.state?.userNo ?? '';
    const insertMode = userData?.user_no === work_user_no;
    const [introItems, setIntroItems] = useState<IntroItem[]>([]);
    const [introSwitch, setIntroSwitch] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    // 항목 추가
    const handleAddItem = () => {
        const createId = randomId();
        if (inputValue.trim() === '') return;
        if (introItems.length >= 5) return alert('최대 5개까지 입력할 수 있습니다.');
        setIntroItems((prev) => [
            ...prev,
            {
                id: createId,
                gdntc_name: inputValue.trim(),
                gdntc_cn: '',
                seq: prev.length + 1,
            },
        ]);
        setInputValue('');
    };
    const handleAddFromRecommand = (gdntc_name: string) => {
        const createId = randomId();
        if (introItems.length >= 5) {
            alert('최대 5개까지 입력할 수 있습니다.');
            return;
        }

        // 중복 추가 방지 (선택사항)
        if (introItems.find((item) => item.gdntc_name === gdntc_name)) {
            alert('이미 추가된 항목입니다.');
            return;
        }

        setIntroItems((prev) => [
            ...prev,
            {
                id: createId,
                gdntc_name: gdntc_name,
                gdntc_cn: '',
                seq: prev.length + 1,
            },
        ]);
        setInputValue(''); // 입력창 초기화
        setIsFocused(false); // 추천 숨김
    };

    // 항목 삭제
    const handleRemoveItem = (id: string) => {
        setIntroItems((prev) =>
            prev
                .filter((item) => item.id !== id)
                .map((item, index) => ({
                    ...item,
                    seq: index + 1,
                }))
        );
    };

    // 내용 입력
    const handleChangeContent = (id: string, value: string) => {
        setIntroItems((prev) => prev.map((item) => (item.id === id ? { ...item, gdntc_cn: value } : item)));
    };

    // 저장
    const handleSave = () => {
        const confirmed = window.confirm('저장하시겠습니까?');
        if (!confirmed) return;
        const SqlId = 'hrs_com01';
        const sqlKey = 'hrs_gdntc_info_cud';
        const { user_no } = userData;
        const gdntc_rls_yn = introSwitch ? 'Y' : 'N';

        const item = {
            sqlId: SqlId,
            sql_key: sqlKey,
            params: [{ user_no, gdntc_rls_yn: gdntc_rls_yn, gdntc_info: introItems }],
        };
        fetcherPostData([item])
            .then((res) => {
                console.log(res);
                alert('저장되었습니다.');
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                setRetrieve(true);
                onClose();
            });
    };
    useEffect(() => {
        if (open && userData?.my_gdntc_info) {
            setIntroSwitch(userData?.my_gdntc_info?.gdntc_rls_yn === 'Y' ? true : false);
            setIntroItems(userData?.my_gdntc_info?.gdntc_info);
        }
    }, [open]);
    return (
        <SwModal
            open={open}
            onClose={onClose}
            size='xs'
            maxWidth='380px'
            className={styles.editMyInfoModal}
            hideBackdrop
            PaperProps={{
                sx: {
                    m: 0,
                    height: 'calc(100vh - 220px)',
                    Maximize: '100vh',
                    position: 'fixed',
                    top: 110,
                    left: 520,
                    bottom: 0,
                    border: '1px solid #B6B6B6',
                    borderRadius: '4px',
                },
            }}
        >
            <h3 className={styles.modalTitle}>
                <div className={styles.container}>
                    {insertMode ? (
                        <>
                            <Switch
                                id='switch'
                                size='small'
                                checked={introSwitch}
                                onChange={() => setIntroSwitch(!introSwitch)}
                            />
                            <div className={styles.text}>내 소개 {`(${introItems.length}/5)`}</div>
                            <SwTooltip
                                title='구성원들에게 보여줄 내 소개를 만들어보세요.Off시 작성된 내용은 나만 볼 수 있습니다.'
                                placement='right'
                                arrow={true}
                                className={styles.showTooltip}
                            >
                                <Button className={styles.btnShowTooltip}>
                                    <IcoShortInfo fill='var(--primary)' />
                                </Button>
                            </SwTooltip>
                        </>
                    ) : (
                        <Typography type='section' className={styles.modalTitle}>
                            자기 소개 보기 <IcoPersonFill fill='#7C7C7C' />
                        </Typography>
                    )}
                </div>
            </h3>
            <div className={styles.context}>
                <div className={styles.form}>
                    <div className={styles.formItem}>
                        <div className={styles.multiTypeSelectbox}>
                            {insertMode && (
                                <>
                                    <input
                                        type='text'
                                        className={styles.inputText}
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onFocus={() => setIsFocused(true)}
                                        onBlur={() => {
                                            setTimeout(() => setIsFocused(false), 100);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault(); // Enter 시 form submit 방지
                                                handleAddItem();
                                            }
                                        }}
                                        placeholder='항목명을 입력하세요'
                                    />
                                    <Button type='default' size='sm' onClick={handleAddItem}>
                                        추가
                                    </Button>
                                </>
                            )}
                            {isFocused && (
                                <div className={styles.recommandItem}>
                                    <div className={styles.title}>추천항목</div>
                                    <ul className={styles.recommandList}>
                                        <li
                                            className={styles.item}
                                            onMouseDown={() => handleAddFromRecommand('팀 내 포지션')}
                                        >
                                            <IcoPlus fill='#7C7C7C' className={styles.ico} /> 팀 내 포지션
                                        </li>
                                        <li
                                            className={styles.item}
                                            onMouseDown={() => handleAddFromRecommand('요즘 집중하는 일')}
                                        >
                                            <IcoPlus fill='#7C7C7C' className={styles.ico} /> 요즘 집중하는 일
                                        </li>
                                        <li
                                            className={styles.item}
                                            onMouseDown={() => handleAddFromRecommand('나의 목표')}
                                        >
                                            <IcoPlus fill='#7C7C7C' className={styles.ico} /> 나의 목표
                                        </li>
                                        <li
                                            className={styles.item}
                                            onMouseDown={() => handleAddFromRecommand('좋아하는 것')}
                                        >
                                            <IcoPlus fill='#7C7C7C' className={styles.ico} /> 좋아하는 것
                                        </li>
                                        <li
                                            className={styles.item}
                                            onMouseDown={() => handleAddFromRecommand('하고 싶은 말')}
                                        >
                                            <IcoPlus fill='#7C7C7C' className={styles.ico} /> 하고 싶은 말
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                    {insertMode ? (
                        <>
                            {introItems.map((item, index) => (
                                <div className={styles.formItem} key={item.id}>
                                    <div className={styles.formTitle}>
                                        <div className={styles.text}>{item.gdntc_name || `입력항목 ${index + 1}`}</div>
                                        <Button onClick={() => handleRemoveItem(item.id)}>
                                            <IcoTrashFill fill='#7C7C7C' />
                                        </Button>
                                    </div>
                                    <Textarea
                                        placeholder='내용을 입력하세요.'
                                        countText
                                        className={styles.textarea}
                                        value={item.gdntc_cn}
                                        onChange={(e) => handleChangeContent(item.id, e.target.value)}
                                    />
                                </div>
                            ))}
                        </>
                    ) : (
                        <>
                            {introItems.map((item, index) => (
                                <div className={styles.formItem} key={item.id}>
                                    <div className={styles.formTitle}>
                                        <div className={styles.text}>{item.gdntc_name || `입력항목 ${index + 1}`}</div>
                                    </div>
                                    <div className={styles.text}>{item.gdntc_cn}</div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>

            {insertMode && (
                <div className='actions' style={{ padding: '10px' }}>
                    <Button id='btnPrmary12' type='primary' size='lg' className='btnWithIcon' onClick={handleSave}>
                        저장하기
                    </Button>
                </div>
            )}
        </SwModal>
    );
};

export default CreaateMyIntrodution;
