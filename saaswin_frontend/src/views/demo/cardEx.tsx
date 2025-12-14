import Card from 'components/Card';
import styles from '../../styles/pages/Demo/page.module.scss';
import { IcoCardTitle } from '@/assets/Icon';

const CardEx = () => {
    return (
        <>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}>basic</div>
            <div className={`${styles.col} ${styles.title}`}>empty</div>
            <div className={`${styles.col} ${styles.title}`}>title type</div>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}></div>

            <div className={styles.col}></div>
            <div className={styles.col}>
                <Card title='인적사항' icon={<IcoCardTitle />}>
                    <div className='infoSection'>
                        <div className='emphasis'>
                            <div className='title'>가나다라 컴퍼니</div>
                            <div className='text'>대리, 파트장</div>
                        </div>
                    </div>
                    <div className='infoRow'>
                        <div className='rowTitle'>주소</div>
                        <div className='rowText'>서울시 강남구 도산대로 17길</div>
                    </div>
                    <div className='infoRow'>
                        <div className='rowTitle'>상세주소</div>
                        <div className='rowText'>
                            만세컨벤션 프레스티지 컴플렉스 빌딩 17층 1701호(압구정 2동 45-2번지 컨벤션 프레스티지 빌딩)
                        </div>
                    </div>
                    <div className='infoRow'>
                        <div className='rowTitle'>우편번호</div>
                        <div className='rowText'>06109</div>
                    </div>
                    <div className='infoRow'>
                        <div className='rowTitle'>이메일</div>
                        <div className='rowText'>test@win.co.kr</div>
                    </div>
                    <div className='infoRow'>
                        <div className='rowTitle'>개인번호</div>
                        <div className='rowText'>010-1234-5678</div>
                    </div>
                    <div className='infoRow'>
                        <div className='rowTitle'>내선번호</div>
                        <div className='rowText'>02-123-4567</div>
                    </div>
                </Card>
            </div>
            <div className={styles.col}>
                <Card title='Title' icon={<IcoCardTitle />} isEmpty />
            </div>
            <div className={styles.col}>
                <Card title='Title' icon={<IcoCardTitle />} type='title' />
            </div>
            <div className={styles.col}></div>
        </>
    );
};

export default CardEx;
