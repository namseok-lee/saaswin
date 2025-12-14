import { useState } from 'react';
import styles from '../../styles/pages/Demo/page.module.scss';
import Radio from 'components/Radio';
import RadioGroup from 'components/RadioGroup';

const InputRadioEx = () => {
    const [isChecked1, setIsChecked1] = useState(false);
    const [isChecked2, setIsChecked2] = useState(true);
    return (
        <>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}>Inactive</div>
            <div className={`${styles.col} ${styles.title}`}>Active</div>
            <div className={`${styles.col} ${styles.title}`}>Radio group(horizontal)</div>
            <div className={`${styles.col} ${styles.title}`}>Radio group(vertical)</div>
            <div className={`${styles.col} ${styles.title}`}>Enable</div>
            <div className={`${styles.col} ${styles.title}`}>Show label</div>
            <div className={styles.col}>
                <Radio
                    id='test1'
                    name='test'
                    label='label'
                    value={1}
                    checked={isChecked1}
                    onChange={() => setIsChecked1(true)}
                />
            </div>
            <div className={styles.col}>
                <Radio
                    id='test2'
                    name='tester'
                    label='Radio'
                    value={2}
                    checked={isChecked2}
                    onChange={() => setIsChecked2(isChecked2)}
                />
                <br />
                <p>현재 상태: {isChecked2 ? '체크됨' : '체크 안됨'}</p>
            </div>
            <div className={`${styles.col} ${styles.row}`}>
                <RadioGroup>
                    {Array.from({ length: 10 }).map((_, index) => {
                        const id = index + 90;
                        return (
                            <Radio
                                key={id}
                                id={`'label'${id}`}
                                name='testRadio'
                                label={`'label'${id}`}
                                value={id}
                                checked={isChecked1}
                                onChange={() => setIsChecked1(true)}
                            />
                        );
                    })}
                </RadioGroup>
            </div>
            <div className={`${styles.col} ${styles.row}`}>
                <div className='radioGroupWrap'>
                    <RadioGroup direction='vertical'>
                        {Array.from({ length: 10 }).map((_, index) => {
                            const id = index + 10;
                            return (
                                <Radio
                                    key={id}
                                    name='testRadioBtn'
                                    id={`'label'${id}`}
                                    label={`'label'${id}`}
                                    value={id}
                                    checked={isChecked2}
                                    onChange={() => setIsChecked1(isChecked2)}
                                />
                            );
                        })}
                    </RadioGroup>
                    <RadioGroup direction='vertical'>
                        {Array.from({ length: 5 }).map((_, index) => {
                            const id = index + 20;
                            return (
                                <Radio
                                    key={id}
                                    name='textRadioBtns'
                                    id={`'label'${id}`}
                                    label={`'label'${id}`}
                                    value={id}
                                    checked={isChecked2}
                                    onChange={() => setIsChecked1(isChecked2)}
                                />
                            );
                        })}
                    </RadioGroup>
                </div>
            </div>
            <div className={`${styles.col} ${styles.title}`}>Enable</div>
            <div className={`${styles.col} ${styles.title}`}>Hide label</div>
            <div className={styles.col}>
                <Radio name='test' id='test3' value={3} checked={isChecked1} onChange={() => setIsChecked1(true)} />
            </div>
            <div className={styles.col}>
                <Radio
                    name='tester'
                    id='test4'
                    value={4}
                    checked={isChecked2}
                    onChange={() => setIsChecked2(isChecked2)}
                />
                <br />
                <p>현재 상태: {isChecked2 ? '체크됨' : '체크 안됨'}</p>
            </div>
            <div className={`${styles.col} ${styles.title}`}>Disabled</div>
            <div className={`${styles.col} ${styles.title}`}>Show label</div>
            <div className={styles.col}>
                <Radio
                    id='test5'
                    name='test'
                    label='label'
                    value={5}
                    checked={isChecked1}
                    onChange={() => setIsChecked1(true)}
                    disabled
                />
            </div>
            <div className={styles.col}>
                <Radio
                    id='test6'
                    name='tester'
                    label='Radio'
                    value={6}
                    checked={isChecked2}
                    onChange={() => setIsChecked2(isChecked2)}
                    disabled
                />
                <br />
                <p>현재 상태: {isChecked2 ? '체크됨' : '체크 안됨'}</p>
            </div>
            <div className={`${styles.col} ${styles.title}`}>Disabled</div>
            <div className={`${styles.col} ${styles.title}`}>Hide label</div>
            <div className={styles.col}>
                <Radio
                    name='test'
                    id='test7'
                    value={7}
                    checked={isChecked1}
                    onChange={() => setIsChecked1(true)}
                    disabled
                />
            </div>
            <div className={styles.col}>
                <Radio
                    name='tester'
                    id='test8'
                    value={8}
                    checked={isChecked2}
                    onChange={() => setIsChecked2(isChecked2)}
                    disabled
                />
                <br />
                <p>현재 상태: {isChecked2 ? '체크됨' : '체크 안됨'}</p>
            </div>
        </>
    );
};

export default InputRadioEx;
