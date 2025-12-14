import Switch from 'components/Switch';
import styles from '../../styles/pages/Demo/page.module.scss';
import { useState } from 'react';

const SwitchEx = () => {
    const [isChecked, setIsChecked] = useState(true);
    return (
        <>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}>Enabled</div>
            <div className={`${styles.col} ${styles.title}`}>Disabled</div>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}>Selected(true)</div>
            <div className={styles.col}>
                <Switch id='switch' />
            </div>
            <div className={styles.col}>
                <Switch id='switch' checked disabled />
            </div>
            <div className={styles.col}></div>
            <div className={styles.col}></div>
            <div className={styles.col}></div>
            <div className={`${styles.col} ${styles.title}`}>Selected(false)</div>
            <div className={styles.col}>
                <Switch id='switch' checked={isChecked} onChange={setIsChecked} />
            </div>
            <div className={styles.col}>
                <Switch id='switch' disabled />
            </div>
            <div className={styles.col}></div>
            <div className={styles.col}></div>
            <div className={styles.col}></div>
            <div className={`${styles.col} ${styles.title}`}>small</div>
            <div className={styles.col}>
                <Switch id='switch' size='small' />
            </div>
            <div className={styles.col}>
                <Switch id='switch' disabled size='small' />
            </div>
            <div className={styles.col}></div>
            <div className={styles.col}></div>
            <div className={styles.col}></div>
        </>
    );
};

export default SwitchEx;
