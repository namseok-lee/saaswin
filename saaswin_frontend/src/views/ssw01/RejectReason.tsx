'use client';

const RejectReason = () => {
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
                            <th>반려자</th>
                            <td>어피치</td>
                        </tr>
                        <tr>
                            <th>반려사유</th>
                            <td>
                                <span className='error'>예산상의 이유로 출장을 진행할 수 없는 상황입니다.</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default RejectReason;
