import InputSearch from 'components/InputSearch';
import styles from '../../styles/pages/Demo/page.module.scss';
import { useState } from 'react';

const InputSearchEx = () => {
    const [inputValues, setInputValues] = useState({
        test1: '',
        test2: '',
        test3: '',
        test4: '',
    });

    // input 값 변경
    const handleChange = (id: string, value: string) => {
        setInputValues((prev) => ({ ...prev, [id]: value }));
    };

    return (
        <>
            {/* enabled horizontal */}
            <div className={`${styles.col} ${styles.title}`}>Enabled</div>
            <div className={`${styles.col} ${styles.title}`}>Horizontal</div>
            <div className={styles.col}>
                <InputSearch
                    type='text'
                    id='test1'
                    placeholder='Search'
                    value={inputValues.test1}
                    onChange={(e) => handleChange('test1', e.target.value)}
                />
            </div>
            <div className={styles.col}>
                <InputSearch
                    type='text'
                    id='test4'
                    placeholder='Search'
                    value={inputValues.test4}
                    onChange={(e) => handleChange('test4', e.target.value)}
                    vertical
                    color='white'
                />
            </div>
            <div className={styles.col}></div>
            <div className={styles.col}></div>
            {/* enabled Vertical */}
            <div className={`${styles.col} ${styles.title}`}>Enabled</div>
            <div className={`${styles.col} ${styles.title}`}>Vertical</div>
            <div className={styles.col}>
                <InputSearch
                    type='text'
                    id='test2'
                    placeholder='Search'
                    value={inputValues.test2}
                    onChange={(e) => handleChange('test2', e.target.value)}
                    vertical
                />
            </div>
            <div className={styles.col}></div>
            <div className={styles.col}></div>
            <div className={styles.col}></div>
            {/* disabled horizontal */}
            <div className={`${styles.col} ${styles.title}`}>Enabled</div>
            <div className={`${styles.col} ${styles.title}`}>Horizontal</div>
            <div className={styles.col}>
                <InputSearch
                    type='text'
                    id='test3'
                    placeholder='Search'
                    value={inputValues.test3}
                    onChange={(e) => handleChange('test3', e.target.value)}
                    disabled={true}
                />
            </div>
            <div className={styles.col}></div>
            <div className={styles.col}></div>
            <div className={styles.col}></div>
            {/* disabled Vertical */}
            <div className={`${styles.col} ${styles.title}`}>disabled</div>
            <div className={`${styles.col} ${styles.title}`}>Vertical</div>
            <div className={styles.col}>
                <InputSearch
                    type='text'
                    id='test4'
                    placeholder='Search'
                    value={inputValues.test4}
                    onChange={(e) => handleChange('test4', e.target.value)}
                    vertical
                    disabled={true}
                />
            </div>
            <div className={styles.col}></div>
            <div className={styles.col}></div>
            <div className={styles.col}></div>
        </>
    );
};

export default InputSearchEx;
