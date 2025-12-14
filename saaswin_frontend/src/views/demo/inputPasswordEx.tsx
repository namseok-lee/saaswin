import InputTextBox from '@/components/InputTextBox';
import styles from '../../styles/pages/Demo/page.module.scss';
import { useState } from 'react';

const InputPasswordEx = () => {
    const [passwordVisibility, setpasswordVisibility] = useState<{ [key: string]: string }>({});
    const [inputValues, setInputValues] = useState({
        test1: '',
        test2: '',
        test3: '',
        test4: '',
        test5: '',
        test6: '',
        test7: '',
        test8: '',
    });

    const togglePasswordvisibility = (id: string | undefined) => {
        setpasswordVisibility((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };
    const handleChange = (id: string, value: string) => {
        setInputValues((prev) => ({ ...prev, [id]: value }));
    };

    const handleDelete = (id: string) => {
        setInputValues((prev) => ({ ...prev, [id]: '' }));
    };

    return (
        <>
            {/* 상단 타이틀 */}
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}>Enabled</div>
            <div className={`${styles.col} ${styles.title}`}>Error</div>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}></div>
            {/* enabled horizontal */}
            <div className={`${styles.col} ${styles.title}`}>Enabled</div>
            <div className={`${styles.col} ${styles.title}`}>Horizontal</div>
            <div className={styles.col}>
                <InputTextBox
                    type='password'
                    id='test1'
                    placeholder='비밀번호를 입력해주세요'
                    label='label'
                    asterisk
                    countText
                    validationText='validation Text'
                    hasToggle={true}
                    onTogglePassword={() => togglePasswordvisibility('password1')}
                    showPassword={passwordVisibility['password1'] || false}
                    value={inputValues.test1 || ''}
                    onChange={(e) => handleChange('test1', e.target.value)}
                    onDelete={() => handleDelete('test1')}
                />
            </div>
            <div className={styles.col}>
                <InputTextBox
                    type='password'
                    id='test2'
                    placeholder='비밀번호를 입력해주세요'
                    label='label'
                    asterisk
                    countText
                    validationText='validation Text'
                    hasToggle={true}
                    onTogglePassword={() => togglePasswordvisibility('password2')}
                    showPassword={passwordVisibility['password2'] || false}
                    error
                    value={inputValues.test2 || ''}
                    onChange={(e) => handleChange('test2', e.target.value)}
                    onDelete={() => handleDelete('test2')}
                />
            </div>
            <div className={styles.col}>
                <InputTextBox
                    type='password'
                    id='test2'
                    placeholder='비밀번호를 입력해주세요'
                    label='label'
                    asterisk
                    countText
                    validationText='validation Text'
                    hasToggle={true}
                    onTogglePassword={() => togglePasswordvisibility('password2')}
                    showPassword={passwordVisibility['password2'] || false}
                    value={inputValues.test2 || ''}
                    onChange={(e) => handleChange('test2', e.target.value)}
                    onDelete={() => handleDelete('test2')}
                    color='white'
                />
            </div>
            <div className={styles.col}></div>
            {/* enabled vertical */}
            <div className={`${styles.col} ${styles.title}`}>Enabled</div>
            <div className={`${styles.col} ${styles.title}`}>Vertical</div>
            <div className={styles.col}>
                <InputTextBox
                    type='password'
                    id='test3'
                    placeholder='비밀번호를 입력해주세요'
                    label='label'
                    asterisk
                    countText
                    validationText='validation Text'
                    hasToggle={true}
                    onTogglePassword={() => togglePasswordvisibility('password3')}
                    showPassword={passwordVisibility['password3'] || false}
                    onChange={(e) => handleChange('test3', e.target.value)}
                    onDelete={() => handleDelete('test3')}
                    value={inputValues.test3 || ''}
                    vertical
                />
            </div>
            <div className={styles.col}>
                <InputTextBox
                    type='password'
                    id='test4'
                    placeholder='비밀번호를 입력해주세요'
                    label='label'
                    asterisk
                    countText
                    validationText='validation Text'
                    hasToggle={true}
                    onTogglePassword={() => togglePasswordvisibility('password4')}
                    showPassword={passwordVisibility['password4'] || false}
                    onChange={(e) => handleChange('test4', e.target.value)}
                    onDelete={() => handleDelete('test4')}
                    error
                    value={inputValues.test4 || ''}
                    vertical
                />
            </div>
            <div className={styles.col}></div>
            <div className={styles.col}></div>
            {/* disabled horizontal */}
            <div className={`${styles.col} ${styles.title}`}>disabled</div>
            <div className={`${styles.col} ${styles.title}`}>Horizontal</div>
            <div className={styles.col}>
                <InputTextBox
                    type='password'
                    id='test5'
                    placeholder='비밀번호를 입력해주세요'
                    label='label'
                    asterisk
                    countText
                    onTogglePassword={() => togglePasswordvisibility('password5')}
                    showPassword={passwordVisibility['password5'] || false}
                    onDelete={() => handleDelete('test5')}
                    value={inputValues.test5 || ''}
                    disabled
                />
            </div>
            <div className={styles.col}>
                <InputTextBox
                    type='password'
                    id='test6'
                    placeholder='비밀번호를 입력해주세요'
                    label='label'
                    asterisk
                    countText
                    onTogglePassword={() => togglePasswordvisibility('password6')}
                    showPassword={passwordVisibility['password6'] || false}
                    onDelete={() => handleDelete('test6')}
                    error
                    value={inputValues.test6 || ''}
                    disabled
                />
            </div>
            <div className={styles.col}></div>
            <div className={styles.col}></div>
            {/* disabled vertical */}
            <div className={`${styles.col} ${styles.title}`}>disabled</div>
            <div className={`${styles.col} ${styles.title}`}>Vertical</div>
            <div className={styles.col}>
                <InputTextBox
                    type='password'
                    id='test7'
                    placeholder='비밀번호를 입력해주세요'
                    label='label'
                    asterisk
                    countText
                    hasToggle={false}
                    onTogglePassword={() => {}}
                    showPassword={passwordVisibility['password7'] || false}
                    onDelete={() => handleDelete('test7')}
                    vertical
                    value={inputValues.test7 || ''}
                    disabled
                />
            </div>
            <div className={styles.col}>
                <InputTextBox
                    type='password'
                    id='test8'
                    placeholder='비밀번호를 입력해주세요'
                    label='label'
                    asterisk
                    countText
                    hasToggle={false}
                    onTogglePassword={() => {}}
                    showPassword={passwordVisibility['password8'] || false}
                    onDelete={() => handleDelete('test8')}
                    vertical
                    error
                    value={inputValues.test8 || ''}
                    disabled
                />
            </div>
            <div className={styles.col}></div>
            <div className={styles.col}></div>
        </>
    );
};

export default InputPasswordEx;
