import Button from 'components/Button';
import SwTooltip from 'components/Tooltip';
import styles from '../../styles/pages/Demo/page.module.scss';

const TooltipEx = () => {
    return (
        <>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}>None</div>
            <div className={`${styles.col} ${styles.title}`}>Arrow + Down</div>
            <div className={`${styles.col} ${styles.title}`}>Arrow + Up</div>
            <div className={`${styles.col} ${styles.title}`}>Arrow + Left</div>
            <div className={`${styles.col} ${styles.title}`}>Arrow + Right</div>
            <div className={`${styles.col} ${styles.title}`}></div>

            <div className={styles.col}>
                <div style={{ display: 'inline-block' }}>
                    <SwTooltip title='this is a tooltip'>
                        <Button id='test1' type='primary'>
                            hover to show tooltip
                        </Button>
                    </SwTooltip>
                </div>
            </div>
            <div className={styles.col}>
                <div style={{ display: 'inline-block' }}>
                    <SwTooltip title='this is a tooltip' placement='bottom' arrow={true}>
                        <Button id='test2' size='lg' type='primary'>
                            hover to show tooltip
                        </Button>
                    </SwTooltip>
                </div>
            </div>
            <div className={styles.col}>
                <div style={{ display: 'inline-block' }}>
                    <SwTooltip title='this is a tooltip' placement='top' arrow={true}>
                        <Button id='test2' size='lg' type='primary'>
                            hover to show tooltip
                        </Button>
                    </SwTooltip>
                </div>
            </div>
            <div className={styles.col}>
                <div style={{ display: 'inline-block' }}>
                    <SwTooltip title='this is a tooltip' placement='left' arrow={true}>
                        <Button id='test2' size='lg' type='primary'>
                            hover to show tooltip
                        </Button>
                    </SwTooltip>
                </div>
            </div>
            <div className={styles.col}>
                <div style={{ display: 'inline-block' }}>
                    <SwTooltip title='this is a tooltip' placement='right' arrow={true}>
                        <Button id='test2' size='lg' type='primary'>
                            hover to show tooltip
                        </Button>
                    </SwTooltip>
                </div>
            </div>
        </>
    );
};

export default TooltipEx;
