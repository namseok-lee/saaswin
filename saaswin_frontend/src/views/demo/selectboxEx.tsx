import BoxSelect from 'components/BoxSelect';
import { useState } from 'react';
import styles from '../../styles/pages/Demo/page.module.scss';

const SelectboxEx = () => {
    const [selectedValues, setSelectedValues] = useState({
        test1: [1, 2, 3],
        test2: [],
        test3: [],
        test4: [],
        test5: '',
        test6: '',
        test7: '',
        test8: '',
        test9: '',
        test10: '',
        test11: '',
        test12: '',
        test13: '',
        test14: '',
        test15: '',
        test16: '',
    });

    const options = {
        test1: [
            { value: 1, label: 'Option A' },
            { value: 2, label: 'Option B' },
            { value: 3, label: 'Option C' },
        ],
        test2: [
            { value: 10, label: 'Option A' },
            { value: 20, label: 'Option B' },
            { value: 30, label: 'Option C' },
        ],
        test3: [
            { value: 40, label: 'Item 1' },
            { value: 50, label: 'Item 2' },
        ],
        test4: [
            { value: 60, label: 'Choice X' },
            { value: 70, label: 'Choice Y' },
            { value: 80, label: 'Choice Z' },
        ],
        test5: [
            { value: 90, label: 'Red' },
            { value: 100, label: 'Blue' },
            { value: 110, label: 'Green' },
        ],
        test6: [
            { value: 120, label: 'Dog' },
            { value: 130, label: 'Cat' },
            { value: 140, label: 'Rabbit' },
        ],
        test7: [
            { value: 150, label: 'Apple' },
            { value: 160, label: 'Banana' },
            { value: 170, label: 'Grapes' },
        ],
    };

    const handleChange = (id: string) => (e: any) => {
        setSelectedValues((prev) => ({
            ...prev,
            [id]: e.target.value,
        }));
    };

    return (
        <>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}>Enabled</div>
            <div className={`${styles.col} ${styles.title}`}>Error</div>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}>Enable</div>
            <div className={`${styles.col} ${styles.title}`}>Vertical</div>

            {[{ id: 'test1', error: false }, { id: 'test2', error: true }, { id: 'test3' }, { id: 'test4' }].map(
                ({ id, error }) => (
                    <div key={id} className={styles.col}>
                        <BoxSelect
                            id={id}
                            placeholder='선택하지 않음'
                            label='Label'
                            asterisk
                            validationText='validation text'
                            error={error}
                            value={selectedValues[id]}
                            onChange={handleChange(id)}
                            options={options[id] || []}
                            multiple
                            vertical
                        />
                    </div>
                )
            )}

            <div className={`${styles.col} ${styles.title}`}>Enable</div>
            <div className={`${styles.col} ${styles.title}`}>Horizontal</div>

            {[{ id: 'test5', error: false }, { id: 'test6', error: true }, { id: 'test7' }, { id: 'test8' }].map(
                ({ id, error }) => (
                    <div key={id} className={styles.col}>
                        <BoxSelect
                            id={id}
                            placeholder='선택하지 않음'
                            label='Label'
                            asterisk
                            validationText='validation text'
                            error={error}
                            value={selectedValues[id]}
                            onChange={handleChange(id)}
                            options={options[id] || []}
                        />
                    </div>
                )
            )}

            <div className={`${styles.col} ${styles.title}`}>Disabled</div>
            <div className={`${styles.col} ${styles.title}`}>Vertical</div>
            {[
                { id: 'test9', error: false, disabled: true },
                { id: 'test10', error: true, disabled: true },
                { id: 'test11' },
                { id: 'test12' },
            ].map(({ id, error, disabled }) => (
                <div key={id} className={styles.col}>
                    <BoxSelect
                        id={id}
                        placeholder='선택하지 않음'
                        label='Label'
                        asterisk
                        validationText='validation text'
                        error={error}
                        value={selectedValues[id]}
                        onChange={handleChange(id)}
                        options={options[id] || []}
                        disabled={disabled}
                        vertical
                    />
                </div>
            ))}

            <div className={`${styles.col} ${styles.title}`}>Disabled</div>
            <div className={`${styles.col} ${styles.title}`}>Horizontal</div>

            {[
                { id: 'test13', error: false, disabled: true },
                { id: 'test14', error: true, disabled: true },
                { id: 'test15' },
                { id: 'test16' },
            ].map(({ id, error, disabled }) => (
                <div key={id} className={styles.col}>
                    <BoxSelect
                        id={id}
                        placeholder='선택하지 않음'
                        label='Label'
                        asterisk
                        validationText='validation text'
                        error={error}
                        value={selectedValues[id]}
                        onChange={handleChange(id)}
                        options={options[id] || []}
                        disabled={disabled}
                    />
                </div>
            ))}
        </>
    );
};

export default SelectboxEx;
