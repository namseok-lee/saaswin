import Empty from 'components/Empty';
import styles from '../../styles/pages/Demo/page.module.scss';

const EmptyEx = () => {
    return (
        <>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}>color grey</div>
            <div className={`${styles.col} ${styles.title}`}>color blue</div>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}></div>

            <div className={styles.col}></div>
            <div className={styles.col}>
                <Empty>데이터가 존재하지 않습니다.</Empty>
            </div>
            <div className={styles.col}>
                <Empty color='blue'>데이터가 존재하지 않습니다.</Empty>
            </div>
            <div className={styles.col}></div>
            <div className={styles.col}></div>
        </>
    );
};

export default EmptyEx;
