import Button from 'components/Button';
import styles from '../../styles/pages/Demo/page.module.scss';
import { IcoBookmark, IcoDemo } from '@/assets/Icon';
import Link from 'components/Link';
import ButtonGroup from 'components/ButtonGroup';

const ButtonsEx = () => {
    return (
        <>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}>Primary</div>
            <div className={`${styles.col} ${styles.title}`}>Default</div>
            <div className={`${styles.col} ${styles.title}`}>Text</div>
            <div className={`${styles.col} ${styles.title}`}>Link</div>
            <div className={`${styles.col} ${styles.title}`}>Only Icon</div>
            <div className={`${styles.col} ${styles.title}`}>Enabled</div>
            <div className={styles.col}>
                <Button id='btnPrmary1' type='primary' size='lg' className='btnWithIcon'>
                    <IcoBookmark />
                    Button
                    <IcoBookmark />
                </Button>
                Large
            </div>
            <div className={styles.col}>
                <Button id='btnDefault' type='default' size='md' className='btnWithIcon'>
                    <IcoBookmark />
                    Button
                    <IcoBookmark />
                </Button>
                Medium
                <Button id='btnDefault2' type='default' size='sm' className='btnWithIcon'>
                    <IcoBookmark />
                    Button
                    <IcoBookmark />
                </Button>
                Small
            </div>
            <div className={styles.col}>
                <Button id='btnText' type='text' size='lg' className='btnWithIcon'>
                    <IcoBookmark fill='#7C7C7C' />
                    Button
                    <IcoBookmark fill='#7C7C7C' />
                </Button>
            </div>
            <div className={styles.col}>
                <Link href='#' size='lg' className='btnWithIcon'>
                    <IcoBookmark />
                    Button
                    <IcoBookmark />
                </Link>
            </div>
            <div className={styles.col}>
                <Button id='btnOnlyIcon' type='icon' size='lg'>
                    <IcoBookmark />
                </Button>
                basic
                <Button id='btnOnlyIconPrimary' type='iconPrimary' size='lg'>
                    <IcoBookmark />
                </Button>
                primary
            </div>
            <div className={`${styles.col} ${styles.title}`}>Disabled</div>
            <div className={styles.col}>
                <Button id='btnPrmary10' type='primary' size='lg' className='btnWithIcon' disabled>
                    <IcoBookmark />
                    Button
                    <IcoBookmark />
                </Button>
            </div>
            <div className={styles.col}>
                <Button id='btnDefault10' type='default' size='lg' className='btnWithIcon' disabled>
                    <IcoBookmark />
                    Button
                    <IcoBookmark />
                </Button>
            </div>
            <div className={styles.col}>
                <Button id='btnText10' type='text' size='lg' className='btnWithIcon' disabled>
                    <IcoBookmark fill='#7C7C7C' />
                    Button
                    <IcoBookmark fill='#7C7C7C' />
                </Button>
            </div>
            <div className={styles.col}>
                <Link href='#' size='lg' className='btnWithIcon disabled'>
                    <IcoBookmark />
                    Button
                    <IcoBookmark />
                </Link>
            </div>
            <div className={styles.col}>
                <Button id='btnIcon10' type='icon' size='lg' disabled>
                    <IcoBookmark />
                </Button>
                basic
                <Button id='btnIcon11' type='icon' size='lg' disabled>
                    <IcoBookmark />
                </Button>
                primary
            </div>
            <div className={`${styles.col} ${styles.title}`}>버튼그룹</div>
            <div className={styles.col}></div>
            <div className={styles.col}>
                <ButtonGroup>
                    {Array.from({ length: 10 }).map((_, index) => {
                        const id = index + 1;
                        return (
                            <Button key={index} id='btnDefault11' type='default' size='lg' className='btnWithIcon'>
                                <IcoBookmark />
                                Button
                                <IcoBookmark />
                            </Button>
                        );
                    })}
                    <Button id='btnPrmary12' type='primary' size='lg' className='btnWithIcon'>
                        <IcoBookmark />
                        Button
                        <IcoBookmark />
                    </Button>
                </ButtonGroup>
            </div>
            <div className={styles.col}></div>
            <div className={styles.col}></div>
            <div className={styles.col}></div>
            <div className={`${styles.col} ${styles.title}`}>Round</div>
            <div className={styles.col}></div>
            <div className={styles.col}>
                <Button id='btnDefault' type='default' size='md' className='btnWithIcon' round>
                    <IcoBookmark />
                    Button
                    <IcoBookmark />
                </Button>
            </div>
        </>
    );
};

export default ButtonsEx;
