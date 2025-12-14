import { useEffect, useRef, useState } from 'react';
import Button from 'components/Button';
import Snackbar from 'components/Snackbar';
import styles from '../../styles/pages/Demo/page.module.scss';

const SnackbarEx = () => {
    const [open, setOpen] = useState(false);
    const snackbarRef = useRef<HTMLDivElement>(null);

    const handleOpen = () => {
        setOpen(true);
    };

    // 외부 클릭 감지 함수
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (snackbarRef.current && !snackbarRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);

    return (
        <>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}>None</div>
            <div className={`${styles.col} ${styles.title}`}>downRight</div>
            <div className={`${styles.col} ${styles.title}`}>upLeft</div>
            <div className={`${styles.col} ${styles.title}`}>upRight</div>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}></div>

            <div className={styles.col}>
                <Button id='test1' type='primary' size='lg' onClick={handleOpen}>
                    Show Snackbar
                </Button>
                <Snackbar message='snack bar' open={open} className='custom-snackbar' ref={snackbarRef} />
            </div>
            <div className={styles.col}>position을 downRight으로 설정</div>
            <div className={styles.col}>position을 upLeft으로 설정</div>
            <div className={styles.col}>position을 upRight으로 설정</div>
            <div className={styles.col}></div>
        </>
    );
};

export default SnackbarEx;
