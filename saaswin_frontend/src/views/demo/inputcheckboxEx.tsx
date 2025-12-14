import { useState } from 'react';
import styles from '../../styles/pages/Demo/page.module.scss';
import Checkbox from 'components/Checkbox';
import CheckboxGroup from 'components/CheckboxGroup';

const InputCheckboxEx = () => {
    const [isChecked1, setIsChecked1] = useState(false);
    const [isChecked2, setIsChecked2] = useState(true);
    return (
        <>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}>Inactive</div>
            <div className={`${styles.col} ${styles.title}`}>Active</div>
            <div className={`${styles.col} ${styles.title}`}>Checkbox group(horizontal)</div>
            <div className={`${styles.col} ${styles.title}`}>Checkbox group(vertical)</div>
            <div className={`${styles.col} ${styles.title}`}>Enable</div>
            <div className={`${styles.col} ${styles.title}`}>Show label</div>
            <div className={styles.col}>
                <Checkbox
                    id='test1'
                    label='label'
                    value={1}
                    checked={isChecked1}
                    onChange={() => setIsChecked1(!isChecked1)}
                />
            </div>
            <div className={styles.col}>
                <Checkbox
                    id='test2'
                    label='Checkbox'
                    value={2}
                    checked={isChecked2}
                    onChange={() => setIsChecked2(!isChecked2)}
                />
                <br />
                <p>현재 상태: {isChecked2 ? '체크됨' : '체크 안됨'}</p>
            </div>
            <div className={`${styles.col} ${styles.row}`}>
                <CheckboxGroup>
                    {Array.from({ length: 10 }).map((_, index) => {
                        const id = index + 1;
                        return (
                            <Checkbox
                                key={id}
                                id={`'label'${id}`}
                                label={`'label'${id}`}
                                value={id}
                                checked={isChecked1}
                                onChange={() => setIsChecked1(!isChecked1)}
                            />
                        );
                    })}
                </CheckboxGroup>
            </div>
            <div className={`${styles.col} ${styles.row}`}>
                <div className='checkboxGroupWrap'>
                    <CheckboxGroup direction='vertical'>
                        {Array.from({ length: 10 }).map((_, index) => {
                            const id = index + 10;
                            return (
                                <Checkbox
                                    key={id}
                                    id={`'label'${id}`}
                                    label={`'label'${id}`}
                                    value={id}
                                    checked={isChecked1}
                                    onChange={() => setIsChecked1(!isChecked1)}
                                />
                            );
                        })}
                    </CheckboxGroup>
                    <CheckboxGroup direction='vertical'>
                        {Array.from({ length: 10 }).map((_, index) => {
                            const id = index + 10;
                            return (
                                <Checkbox
                                    key={id}
                                    id={`'label'${id}`}
                                    label={`'label'${id}`}
                                    value={id}
                                    checked={isChecked1}
                                    onChange={() => setIsChecked1(!isChecked1)}
                                />
                            );
                        })}
                    </CheckboxGroup>
                </div>
            </div>
            <div className={`${styles.col} ${styles.title}`}>Enable</div>
            <div className={`${styles.col} ${styles.title}`}>Hide label</div>
            <div className={styles.col}>
                <Checkbox id='test3' value={3} checked={isChecked1} onChange={() => setIsChecked1(!isChecked1)} />
            </div>
            <div className={styles.col}>
                <Checkbox id='test4' value={4} checked={isChecked2} onChange={() => setIsChecked2(!isChecked2)} />
                <br />
                <p>현재 상태: {isChecked2 ? '체크됨' : '체크 안됨'}</p>
            </div>
            <div className={`${styles.col} ${styles.title}`}>Disabled</div>
            <div className={`${styles.col} ${styles.title}`}>Show label</div>
            <div className={styles.col}>
                <Checkbox
                    id='test5'
                    label='label'
                    value={5}
                    checked={isChecked1}
                    onChange={() => setIsChecked1(!isChecked1)}
                    disabled
                />
            </div>
            <div className={styles.col}>
                <Checkbox
                    id='test6'
                    label='Checkbox'
                    value={6}
                    checked={isChecked2}
                    onChange={() => setIsChecked2(!isChecked2)}
                    disabled
                />
                <br />
                <p>현재 상태: {isChecked2 ? '체크됨' : '체크 안됨'}</p>
            </div>
            <div className={`${styles.col} ${styles.title}`}>Disabled</div>
            <div className={`${styles.col} ${styles.title}`}>Hide label</div>
            <div className={styles.col}>
                <Checkbox
                    id='test7'
                    value={7}
                    checked={isChecked1}
                    onChange={() => setIsChecked1(!isChecked1)}
                    disabled
                />
            </div>
            <div className={styles.col}>
                <Checkbox
                    id='test8'
                    value={8}
                    checked={isChecked2}
                    onChange={() => setIsChecked2(!isChecked2)}
                    disabled
                />
                <br />
                <p>현재 상태: {isChecked2 ? '체크됨' : '체크 안됨'}</p>
            </div>
        </>
    );
};

export default InputCheckboxEx;
