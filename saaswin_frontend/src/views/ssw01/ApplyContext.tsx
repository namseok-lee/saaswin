'use client';

const ApplyContext = () => {
    return (
        <section>
            <div className='tblWrap'>
                <table className='tbl'>
                    <colgroup>
                        <col style={{ width: '180px' }} />
                        <col style={{ width: '*' }} />
                    </colgroup>
                    <tbody>
                        <tr>
                            <th>신청자</th>
                            <td>제이지</td>
                        </tr>
                        <tr>
                            <th>동반 구성원</th>
                            <td>무지, 튜브</td>
                        </tr>
                        <tr>
                            <th>출장 기간</th>
                            <td>2025.03.06 ~ 2025.03.06 (총 1일)</td>
                        </tr>
                        <tr>
                            <th>출장지</th>
                            <td>화이트 대전지부</td>
                        </tr>
                        <tr>
                            <th>출장 목적</th>
                            <td>화이트 대전지부</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default ApplyContext;
