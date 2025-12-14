import InputTextBox from '@/components/InputTextBox';
import styles from '../../styles/pages/Demo/page.module.scss';
import { useState } from 'react';

const InputNumberEx = () => {
    const [inputValues, setInputValues] = useState({
        test1: '',
        test2: '',
        test3: '',
        test4: '',
        test5: '',
    });

    const [valid, setValid] = useState(false);
    const [validText, setValidText] = useState('');

    // input 값 변경
    const handleChange = (id: string, value: string) => {
        console.log('handleChange', value);

        if (value === '1234') {
            setValid(true);
            setValidText('잘못입력함');
        } else {
            setValid(false);
            setValidText('');
        }

        setInputValues((prev) => ({ ...prev, [id]: value }));
    };

    // input 삭제 핸들러
    const handleDelete = (id: string) => {
        setValid(false);
        setValidText('');
        setInputValues((prev) => ({ ...prev, [id]: '' }));
    };

    return (
        <>
            <div className={`${styles.col} ${styles.title}`}>Number</div>
            <div className={`${styles.col} ${styles.title}`}>Number</div>
            <div className={styles.col}>
                <InputTextBox
                    type='number'
                    id='test16'
                    placeholder='Input'
                    label='Label'
                    asterisk
                    validationText=''
                    value={inputValues.test5}
                    onChange={(e) => handleChange('test5', e.target.value)}
                    onDelete={() => handleDelete('test5')}
                />
            </div>
        </>
    );
};

export default InputNumberEx;
