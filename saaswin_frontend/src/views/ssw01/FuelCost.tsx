import SwModal from 'components/Modal';
import styles from '../../../styles/pages/templateApply/page.module.scss';
import InputSearch from 'components/InputSearch';
import { useState } from 'react';
import Typography from 'components/Typography';

const FuelCost = (open, handleClose) => {
    const [inputValues, setInputValues] = useState({
        test1: '06058',
        test2: '',
        test3: '',
        test4: '',
    });
    const handleChange = (id: string, value: string) => {
        setInputValues((prev) => ({ ...prev, [id]: value }));
    };
    return (
        <SwModal open={open} size='lg' onClose={handleClose} title='유류비 계산'>
            <div className={styles.fuelCost}>
                <section className={styles.guideTxt}>
                    국내에서 차량 이동 시 발생하는 예상 비용을 제공합니다.
                    <br />
                    유류비 = 연료비 + 통행료 (*왕복일 경우 2배로 계산)
                    <br />
                    계산 시점에 따라 유가가 다를 수 있습니다.
                </section>
                <section className={styles.detailInfo}>
                    <div className='tblWrap'>
                        <table className='tbl'>
                            <colgroup>
                                <col style={{ width: '130px' }} />
                                <col style={{ width: '*' }} />
                            </colgroup>
                            <tbody>
                                <tr>
                                    <th>이용구분</th>
                                    <td>왕복</td>
                                </tr>
                                <tr>
                                    <th>출발지 주소</th>
                                    <td>
                                        <div className={styles.address}>
                                            <div className={styles.formItem}>
                                                <InputSearch
                                                    type='text'
                                                    id='test1'
                                                    placeholder='Search'
                                                    value={inputValues.test1}
                                                    onChange={(e) => handleChange('test1', e.target.value)}
                                                    color='white'
                                                />
                                            </div>
                                            <div className={styles.text}>
                                                서울특별시 강남구 언주로 725, 7층 (논현동, 보전빌딩)
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <th>도착지 주소</th>
                                    <td>
                                        <div className={styles.address}>
                                            <div className={styles.formItem}>
                                                <InputSearch
                                                    type='text'
                                                    id='test1'
                                                    placeholder='Search'
                                                    value={inputValues.test1}
                                                    onChange={(e) => handleChange('test1', e.target.value)}
                                                    color='white'
                                                />
                                            </div>
                                            <div className={styles.text}>
                                                서울특별시 강남구 언주로 725, 7층 (논현동, 보전빌딩)
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
                <section className={styles.outWorkingCost}>
                    <Typography title='출장 비용 신청' type='section'>
                        출장 비용 신청
                    </Typography>
                </section>
                <section className={styles.ps}>경유지 3(최대 5)</section>
                <section className={styles.totalCost}>유류비:24,559원</section>
            </div>
        </SwModal>
    );
};

export default FuelCost;
