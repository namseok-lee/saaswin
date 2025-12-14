import Badge from 'components/Badge';
import styles from '../../styles/pages/Demo/page.module.scss';

const BadgeEx = () => {
    return (
        <>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}>Standard+Dot</div>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}>State</div>
            <div className={`${styles.col} ${styles.title}`}>With Instance</div>
            <div className={`${styles.col} ${styles.title}`}>Step</div>
            <div className={`${styles.col} ${styles.title}`}>Primary</div>
            <div className={styles.col}>
                <Badge type='standard'>99+</Badge>
                <Badge type='dot' />
            </div>
            <div className={`${styles.col} ${styles.title}`}>Enabled</div>
            <div className={styles.col}>
                <Badge type='state'>Enabled</Badge>
            </div>
            <div className={styles.col}>
                <Badge type='noti'>
                    99<span className='more'>+</span>
                </Badge>
                <div style={{ display: 'inline-block', backgroundColor: 'skyblue' }}>
                    <Badge type='mail'></Badge>
                </div>
            </div>
            <div className={styles.col}>
                <Badge type='step' step={1}>
                    Step1
                </Badge>
            </div>
            <div className={`${styles.col} ${styles.title}`}>Success</div>
            <div className={styles.col}>
                <Badge type='standard' color='success'>
                    99+
                </Badge>
                <Badge type='dot' color='success' />
            </div>
            <div className={`${styles.col} ${styles.title}`}>Disabled</div>
            <div className={styles.col}>
                <Badge type='state' state='disabled'>
                    Disabled
                </Badge>
            </div>
            <div className={styles.col}></div>
            <div className={styles.col}>
                <Badge type='step' step={2}>
                    Step2
                </Badge>
            </div>
            <div className={`${styles.col} ${styles.title}`}>Error</div>
            <div className={styles.col}>
                <Badge type='standard' color='error'>
                    99+
                </Badge>
                <Badge type='dot' color='error' />
            </div>
            <div className={`${styles.col} ${styles.title}`}>Warning</div>
            <div className={styles.col}>
                <Badge type='state' state='warning'>
                    Warning
                </Badge>
            </div>
            <div className={styles.col}></div>
            <div className={styles.col}>
                <Badge type='step' step={3}>
                    Step3
                </Badge>
            </div>
            <div className={`${styles.col} ${styles.title}`}>Warning</div>
            <div className={styles.col}>
                <Badge type='standard' color='warning'>
                    99+
                </Badge>
                <Badge type='dot' color='warning' />
            </div>
            <div className={`${styles.col} ${styles.title}`}>Error</div>
            <div className={styles.col}>
                <Badge type='state' state='error'>
                    Error
                </Badge>
            </div>
            <div className={styles.col}></div>
            <div className={styles.col}>
                <Badge type='step' step={4}>
                    Step4
                </Badge>
            </div>
            <div className={`${styles.col} ${styles.title}`}>Offline</div>
            <div className={styles.col}>
                <Badge type='dot' color='offline' />
            </div>
            <div className={`${styles.col} ${styles.title}`}>In Progress</div>
            <div className={styles.col}>
                <Badge type='state' state='progress'>
                    In Progress
                </Badge>
            </div>
            <div className={styles.col}></div>
            <div className={styles.col}>
                <Badge type='step' step={5}>
                    Step5
                </Badge>
            </div>
            <div className={`${styles.col} ${styles.title}`}>Online</div>
            <div className={styles.col}></div>
            <div className={`${styles.col} ${styles.title}`}>Success</div>
            <div className={styles.col}>
                <Badge type='state' state='success'>
                    Success
                </Badge>
            </div>
            <div className={styles.col}></div>
            <div className={styles.col}>
                <Badge type='step' step={6}>
                    Step6
                </Badge>
            </div>
            <div className={`${styles.col} ${styles.title}`}>Seat Vacancy</div>
            <div className={styles.col}>
                <Badge type='dot' color='vacancy' />
            </div>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={styles.col}></div>
            <div className={styles.col}></div>
            <div className={styles.col}></div>
        </>
    );
};

export default BadgeEx;
