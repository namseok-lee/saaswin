import Button from 'components/Button';
import Notification from 'components/Notification';
import { useRef, useState } from 'react';
import styles from '../../styles/pages/Demo/page.module.scss';

const NotificationEx = () => {
    const [open, setOpen] = useState(false);
    const snackbarRef = useRef<HTMLDivElement>(null);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const messageList = (
        <>
            {Array.from({ length: 4 }).map((_, index) => (
                <li key={index} className='msg'>
                    <div className='text'>
                        가나다라 마바사 아자차카타파하 Abcdefg notification List 알림내역 {index + 1}
                    </div>
                </li>
            ))}
        </>
    );

    return (
        <>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}>notification</div>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}></div>

            <div className={styles.col}></div>
            <div className={styles.col}>
                <Button id='test1' type='primary' size='lg' onClick={handleOpen}>
                    Show notification
                </Button>
                <Notification messageList={messageList} open={open} onClose={handleClose} ref={snackbarRef} />
            </div>
            <div className={styles.col}></div>
            <div className={styles.col}></div>
            <div className={styles.col}></div>
        </>
    );
};

export default NotificationEx;
