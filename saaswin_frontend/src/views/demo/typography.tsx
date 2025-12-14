import Typography from 'components/Typography';
import styles from '../../styles/pages/Demo/page.module.scss';

const TypographyEx = () => {
    return (
        <>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}>Heading</div>
            <div className={`${styles.col} ${styles.title}`}>Sub heading</div>
            <div className={`${styles.col} ${styles.title}`}>Table</div>
            <div className={`${styles.col} ${styles.title}`}>Form Header</div>
            <div className={styles.col}></div>
            <div className={styles.col}></div>
            <div className={styles.col}>
                <Typography type='page' desc tooltip title='heading title'>
                    Heading Title
                </Typography>
            </div>
            <div className={styles.col}>
                <Typography type='section' button txtBtn='button' title='subheading'>
                    Subheading(Section) Title
                </Typography>
            </div>
            <div className={styles.col}>
                <Typography type='table' title='table title'>
                    Table Title
                </Typography>
            </div>
            <div className={styles.col}>
                <Typography type='form' title='form title'>
                    Form Title
                </Typography>
            </div>
        </>
    );
};

export default TypographyEx;
