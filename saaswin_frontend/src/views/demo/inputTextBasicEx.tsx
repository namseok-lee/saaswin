import InputTextBox from '@/components/InputTextBox';
import styles from '../../styles/pages/Demo/page.module.scss';
import { useState } from 'react';

const InputTextBasic = () => {
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
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}>Enabled</div>
            <div className={`${styles.col} ${styles.title}`}>Error</div>
            <div className={`${styles.col} ${styles.title}`}>Warning</div>
            <div className={`${styles.col} ${styles.title}`}>Success</div>
            <div className={`${styles.col} ${styles.title}`}>Enable</div>
            <div className={`${styles.col} ${styles.title}`}>Vertical</div>
            <div className={styles.col}>
                <InputTextBox
                    type='text'
                    id='test1'
                    placeholder='Input'
                    hasToggle={false}
                    showPassword={false}
                    label='Label'
                    asterisk
                    countText
                    validationText='validation text'
                    value={inputValues.test1}
                    onChange={(e) => handleChange('test1', e.target.value)}
                    onDelete={() => handleDelete('test1')}
                />
            </div>
            <div className={styles.col}>
                <InputTextBox
                    type='text'
                    id='test2'
                    placeholder='Input'
                    error={valid}
                    label='Label'
                    asterisk
                    countText
                    validationText={validText}
                    value={inputValues.test2}
                    onChange={(e) => handleChange('test2', e.target.value)}
                    onDelete={() => handleDelete('test2')}
                />
            </div>
            <div className={styles.col}>
                <InputTextBox
                    type='text'
                    id='test3'
                    placeholder='Input'
                    warning
                    label='Label'
                    asterisk
                    countText
                    validationText='validation text'
                    value={inputValues.test3}
                    onChange={(e) => handleChange('test3', e.target.value)}
                    onDelete={() => handleDelete('test3')}
                />
            </div>
            <div className={styles.col}>
                <InputTextBox
                    type='text'
                    id='test4'
                    placeholder='Input'
                    success
                    label='Label'
                    asterisk
                    countText
                    validationText='validation text'
                    value={inputValues.test4}
                    onChange={(e) => handleChange('test4', e.target.value)}
                    onDelete={() => handleDelete('test4')}
                />
            </div>
            <div className={`${styles.col} ${styles.title}`}>Enable</div>
            <div className={`${styles.col} ${styles.title}`}>Horizontal</div>
            <div className={styles.col}>
                <InputTextBox
                    type='text'
                    id='test5'
                    placeholder='Input'
                    hasToggle={false}
                    showPassword={false}
                    label='Label'
                    asterisk
                    countText
                    validationText='validation text'
                    vertical
                    value={inputValues.test1}
                    onChange={(e) => handleChange('test1', e.target.value)}
                    onDelete={() => handleDelete('test1')}
                    color='white'
                />
            </div>
            <div className={styles.col}>
                <InputTextBox
                    type='text'
                    id='test6'
                    placeholder='Input'
                    error
                    label='Label'
                    asterisk
                    countText
                    validationText='validation text'
                    vertical
                    value={inputValues.test2}
                    onChange={(e) => handleChange('test2', e.target.value)}
                    onDelete={() => handleDelete('test2')}
                />
            </div>
            <div className={styles.col}>
                <InputTextBox
                    type='text'
                    id='test7'
                    placeholder='Input'
                    warning
                    label='Label'
                    asterisk
                    countText
                    validationText='validation text'
                    vertical
                    value={inputValues.test3}
                    onChange={(e) => handleChange('test3', e.target.value)}
                    onDelete={() => handleDelete('test3')}
                />
            </div>
            <div className={styles.col}>
                <InputTextBox
                    type='text'
                    id='test8'
                    placeholder='Input'
                    success
                    label='Label'
                    asterisk
                    countText
                    validationText='validation text'
                    vertical
                    value={inputValues.test4}
                    onChange={(e) => handleChange('test4', e.target.value)}
                    onDelete={() => handleDelete('test4')}
                />
            </div>
            <div className={`${styles.col} ${styles.title}`}>Disabled</div>
            <div className={`${styles.col} ${styles.title}`}>Vertical</div>
            <div className={styles.col}>
                <InputTextBox
                    type='text'
                    id='test9'
                    placeholder='Input'
                    hasToggle={false}
                    showPassword={false}
                    label='Label'
                    asterisk
                    countText
                    validationText='validation text'
                    disabled
                    value={inputValues.test5}
                    onChange={(e) => handleChange('test5', e.target.value)}
                    onDelete={() => handleDelete('test5')}
                />
            </div>
            <div className={styles.col}>
                <InputTextBox
                    type='text'
                    id='test10'
                    placeholder='Input'
                    error
                    label='Label'
                    asterisk
                    countText
                    validationText='validation text'
                    disabled
                    value={inputValues.test5}
                    onChange={(e) => handleChange('test5', e.target.value)}
                    onDelete={() => handleDelete('test5')}
                />
            </div>
            <div className={styles.col}>
                <InputTextBox
                    type='text'
                    id='test11'
                    placeholder='Input'
                    warning
                    label='Label'
                    asterisk
                    countText
                    validationText='validation text'
                    disabled
                    value={inputValues.test5}
                    onChange={(e) => handleChange('test5', e.target.value)}
                    onDelete={() => handleDelete('test5')}
                />
            </div>
            <div className={styles.col}>
                <InputTextBox
                    type='text'
                    id='test12'
                    placeholder='Input'
                    success
                    label='Label'
                    asterisk
                    countText
                    validationText='validation text'
                    disabled
                    value={inputValues.test5}
                    onChange={(e) => handleChange('test5', e.target.value)}
                    onDelete={() => handleDelete('test5')}
                />
            </div>
            <div className={`${styles.col} ${styles.title}`}>Disabled</div>
            <div className={`${styles.col} ${styles.title}`}>Horizontal</div>
            <div className={styles.col}>
                <InputTextBox
                    type='text'
                    id='test13'
                    placeholder='Input'
                    hasToggle={false}
                    showPassword={false}
                    label='Label'
                    asterisk
                    countText
                    validationText='validation text'
                    disabled
                    vertical
                    value={inputValues.test5}
                    onChange={(e) => handleChange('test5', e.target.value)}
                    onDelete={() => handleDelete('test5')}
                />
            </div>
            <div className={styles.col}>
                <InputTextBox
                    type='text'
                    id='test14'
                    placeholder='Input'
                    error
                    label='Label'
                    asterisk
                    countText
                    validationText='validation text'
                    disabled
                    vertical
                    value={inputValues.test5}
                    onChange={(e) => handleChange('test5', e.target.value)}
                    onDelete={() => handleDelete('test5')}
                />
            </div>
            <div className={styles.col}>
                <InputTextBox
                    type='text'
                    id='test15'
                    placeholder='Input'
                    warning
                    label='Label'
                    asterisk
                    countText
                    validationText='validation text'
                    disabled
                    vertical
                    value={inputValues.test5}
                    onChange={(e) => handleChange('test5', e.target.value)}
                    onDelete={() => handleDelete('test5')}
                />
            </div>
            <div className={styles.col}>
                <InputTextBox
                    type='text'
                    id='test16'
                    placeholder='Input'
                    success
                    label='Label'
                    asterisk
                    countText
                    validationText='validation text'
                    disabled
                    vertical
                    value={inputValues.test5}
                    onChange={(e) => handleChange('test5', e.target.value)}
                    onDelete={() => handleDelete('test5')}
                />
            </div>
        </>
    );
};

export default InputTextBasic;
