import Chip from 'components/Chip';
import styles from '../../styles/pages/Demo/page.module.scss';
import ChipsGroup from 'components/ChipsGroup';

const ChipsEx = () => {
    return (
        <>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}>Enabled</div>
            <div className={`${styles.col} ${styles.title}`}>Default</div>
            <div className={`${styles.col} ${styles.title}`}>Active</div>
            <div className={`${styles.col} ${styles.title}`}>Disabled</div>
            <div className={`${styles.col} ${styles.title}`}>Primary</div>
            <div className={`${styles.col} ${styles.title}`}>Delete:true</div>

            <div className={styles.col}>
                <Chip>Chip</Chip>
            </div>
            <div className={styles.col}></div>
            <div className={styles.col}>
                <Chip state='active'>Chip</Chip>
            </div>
            <div className={styles.col}>
                <Chip state='disabled'>Chip</Chip>
            </div>

            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}>Delete:false</div>

            <div className={styles.col}>
                <Chip close={false}>Chip</Chip>
            </div>
            <div className={styles.col}></div>
            <div className={styles.col}>
                <Chip state='active' close={false}>
                    Chip
                </Chip>
            </div>
            <div className={styles.col}>
                <Chip state='disabled' close={false}>
                    Chip
                </Chip>
            </div>

            <div className={`${styles.col} ${styles.title}`}>Default</div>
            <div className={`${styles.col} ${styles.title}`}>Delete:true</div>
            <div className={styles.col}>
                <Chip type='default'>Chip</Chip>
            </div>
            <div className={styles.col}></div>
            <div className={styles.col}>
                <Chip type='default' state='active'>
                    Chip
                </Chip>
            </div>
            <div className={styles.col}>
                <Chip type='default' state='disabled'>
                    Chip
                </Chip>
            </div>

            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}>Delete:false</div>

            <div className={styles.col}>
                <Chip type='default' close={false}>
                    Chip
                </Chip>
            </div>
            <div className={styles.col}></div>
            <div className={styles.col}>
                <Chip type='default' state='active' close={false}>
                    Chip
                </Chip>
            </div>
            <div className={styles.col}>
                <Chip type='default' state='disabled' close={false}>
                    Chip
                </Chip>
            </div>

            <div className={`${styles.col} ${styles.title}`}>Info</div>
            <div className={`${styles.col} ${styles.title}`}>Delete:true</div>

            <div className={styles.col}>
                <Chip type='info'>Chip</Chip>
            </div>
            <div className={styles.col}></div>
            <div className={styles.col}>
                <Chip type='info' state='active'>
                    Chip
                </Chip>
            </div>
            <div className={styles.col}>
                <Chip type='info' state='disabled'>
                    Chip
                </Chip>
            </div>

            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}>Delete:false</div>

            <div className={styles.col}>
                <Chip type='info' close={false}>
                    Chip
                </Chip>
            </div>
            <div className={styles.col}></div>
            <div className={styles.col}>
                <Chip type='info' state='active' close={false}>
                    Chip
                </Chip>
            </div>
            <div className={styles.col}>
                <Chip type='info' state='disabled' close={false}>
                    Chip
                </Chip>
            </div>

            <div className={`${styles.col} ${styles.title}`}>Error</div>
            <div className={`${styles.col} ${styles.title}`}>Delete:true</div>

            <div className={styles.col}>
                <Chip type='error'>Chip</Chip>
                <Chip type='error' style='outlined'>
                    Chip
                </Chip>
            </div>
            <div className={styles.col}></div>
            <div className={styles.col}></div>
            <div className={styles.col}>
                <Chip type='error' state='disabled'>
                    Chip
                </Chip>
            </div>

            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}>Delete:false</div>

            <div className={styles.col}>
                <Chip type='error' close={false}>
                    Chip
                </Chip>
                <Chip type='error' style='outlined' close={false}>
                    Chip
                </Chip>
            </div>
            <div className={styles.col}></div>
            <div className={styles.col}></div>
            <div className={styles.col}>
                <Chip type='error' state='disabled' close={false}>
                    Chip
                </Chip>
            </div>

            <div className={`${styles.col} ${styles.title}`}>Warning</div>
            <div className={`${styles.col} ${styles.title}`}>Delete:true</div>

            <div className={styles.col}>
                <Chip type='warning'>Chip</Chip>
                <Chip type='warning' style='outlined'>
                    Chip
                </Chip>
            </div>
            <div className={styles.col}></div>
            <div className={styles.col}></div>
            <div className={styles.col}>
                <Chip type='warning' state='disabled'>
                    Chip
                </Chip>
            </div>

            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}>Delete:false</div>

            <div className={styles.col}>
                <Chip type='warning' close={false}>
                    Chip
                </Chip>
                <Chip type='warning' style='outlined' close={false}>
                    Chip
                </Chip>
            </div>
            <div className={styles.col}></div>
            <div className={styles.col}></div>
            <div className={styles.col}>
                <Chip type='warning' state='disabled' close={false}>
                    Chip
                </Chip>
            </div>

            <div className={`${styles.col} ${styles.title}`}>success</div>
            <div className={`${styles.col} ${styles.title}`}>Delete:true</div>

            <div className={styles.col}>
                <Chip type='success'>Chip</Chip>
                <Chip type='success' style='outlined'>
                    Chip
                </Chip>
            </div>
            <div className={styles.col}></div>
            <div className={styles.col}></div>
            <div className={styles.col}>
                <Chip type='success' state='disabled'>
                    Chip
                </Chip>
            </div>

            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}>Delete:false</div>

            <div className={styles.col}>
                <Chip type='success' close={false}>
                    Chip
                </Chip>
                <Chip type='success' style='outlined' close={false}>
                    Chip
                </Chip>
            </div>
            <div className={styles.col}></div>
            <div className={styles.col}></div>
            <div className={styles.col}>
                <Chip type='success' state='disabled' close={false}>
                    Chip
                </Chip>
            </div>

            <div className={`${styles.col} ${styles.title}`}>Label</div>
            <div className={`${styles.col} ${styles.title}`}>Delete:false</div>
            <div className={styles.col}></div>
            <div className={styles.col}>
                <Chip type='label' close={false}>
                    Chip
                </Chip>
            </div>
            <div className={styles.col}></div>
            <div className={styles.col}></div>

            <div className={`${styles.col} ${styles.title}`}>Group</div>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={styles.col}>
                <ChipsGroup>
                    <Chip>Chip</Chip>
                    <Chip>Chip</Chip>
                    <Chip>Chip</Chip>
                    <Chip>Chip</Chip>
                </ChipsGroup>
            </div>
            <div className={styles.col}></div>
            <div className={styles.col}></div>
            <div className={styles.col}></div>
        </>
    );
};

export default ChipsEx;
