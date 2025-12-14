'use client';
import React, { useMemo } from 'react';
import {
    IcoSignature,
    IcoTextbox,
    IcoNumber,
    IcoCalendar,
    IcoRadio,
    IcoCheckbox,
    IcoDropdown,
    IcoLink,
    IcoAttachFile,
    IcoLabel,
    IcoStamp,
    IcoMemberName,
    IcoIdentification,
    IcoBirth,
    IcoAddress,
} from '@/assets/Icon';
import InputSearch from 'components/InputSearch';
import styles from '../../../styles/pages/Template/page.module.scss';

interface LeftSidebarProps {
    images: File | null;
    addComponent: (pageNumber: number, type: string) => void;
    inputValues: { searchDataItem: string };
    handleSearchBox: (id: string, value: string) => void;
}

// 인사잇 데이터 항목 정의
interface InsaitItem {
    type: string;
    icon: React.ReactNode;
    label: string;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ images, addComponent, inputValues, handleSearchBox }) => {
    if (!images) return <>&nbsp;</>;

    // 인사잇 데이터 항목 목록
    const insaitItems: InsaitItem[] = [
        {
            type: 'insait_seal',
            icon: <IcoStamp fill='#666666' />,
            label: '회사 직인',
        },
        {
            type: 'insait_user_nm',
            icon: <IcoMemberName />,
            label: '구성원 이름',
        },
        {
            type: 'insait_user_rrno',
            icon: <IcoIdentification />,
            label: '구성원 주민등록번호',
        },
        {
            type: 'insait_user_birth',
            icon: <IcoBirth />,
            label: '구성원 생년월일',
        },
        {
            type: 'insait_user_addr',
            icon: <IcoAddress />,
            label: '구성원 주소',
        },
    ];

    // 검색어에 따라 필터링된 인사잇 데이터 항목 목록
    const filteredInsaitItems = useMemo(() => {
        const searchText = inputValues.searchDataItem.toLowerCase().trim();
        if (!searchText) return insaitItems; // 검색어가 없으면 전체 표시

        return insaitItems.filter((item) => item.label.toLowerCase().includes(searchText));
    }, [insaitItems, inputValues.searchDataItem]);

    return (
        <div className={`${styles.sideArea} ${styles.btns}`}>
            {/* 기본 항목 섹션 */}
            <div className={styles.category}>
                <div className={styles.tit}>기본 항목</div>
                <div className={styles.btnArea}>
                    <button className={`${styles.btnAddComp} btnWithIcon`} onClick={() => addComponent(1, 'sign')}>
                        <div className={styles.icon}>
                            <IcoSignature />
                        </div>
                        서명
                    </button>
                    <button className={`${styles.btnAddComp} btnWithIcon`} onClick={() => addComponent(1, 'textbox')}>
                        <div className={styles.icon}>
                            <IcoTextbox />
                        </div>
                        텍스트
                    </button>
                    <button className={`${styles.btnAddComp} btnWithIcon`} onClick={() => addComponent(1, 'number')}>
                        <div className={styles.icon}>
                            <IcoNumber />
                        </div>
                        숫자
                    </button>
                    <button
                        className={`${styles.btnAddComp} btnWithIcon`}
                        onClick={() => addComponent(1, 'datepicker')}
                    >
                        <div className={styles.icon}>
                            <IcoCalendar />
                        </div>
                        날짜/시간
                    </button>
                    <button className={`${styles.btnAddComp} btnWithIcon`} onClick={() => addComponent(1, 'radio')}>
                        <div className={styles.icon}>
                            <IcoRadio fill='#fff' />
                        </div>
                        라디오 버튼
                    </button>
                    <button className={`${styles.btnAddComp} btnWithIcon`} onClick={() => addComponent(1, 'checkbox')}>
                        <div className={styles.icon}>
                            <IcoCheckbox />
                        </div>
                        체크박스
                    </button>
                    <button className={`${styles.btnAddComp} btnWithIcon`} onClick={() => addComponent(1, 'combobox')}>
                        <div className={styles.icon}>
                            <IcoDropdown />
                        </div>
                        드롭다운
                    </button>
                    <button className={`${styles.btnAddComp} btnWithIcon`} onClick={() => addComponent(1, 'link')}>
                        <div className={styles.icon}>
                            <IcoLink />
                        </div>
                        링크
                    </button>
                    <button className={`${styles.btnAddComp} btnWithIcon`} onClick={() => addComponent(1, 'file')}>
                        <div className={styles.icon}>
                            <IcoAttachFile />
                        </div>
                        첨부파일
                    </button>
                    <button className={`${styles.btnAddComp} btnWithIcon`} onClick={() => addComponent(1, 'label')}>
                        <div className={styles.icon}>
                            <IcoLabel fill='#fff' />
                        </div>
                        레이블
                    </button>
                </div>
            </div>

            {/* 인사잇 데이터 항목 섹션 */}
            <div className={styles.category}>
                <div className={styles.tit}>인사잇 데이터 항목</div>
                <div className={styles.searchBox}>
                    <InputSearch
                        type='text'
                        id='searchDataItem'
                        placeholder='Search'
                        value={inputValues.searchDataItem}
                        onChange={(e) => handleSearchBox('searchDataItem', e.target.value)}
                        vertical
                        color='white'
                    />
                </div>
                <div className={styles.btnArea}>
                    {filteredInsaitItems.length > 0 ? (
                        filteredInsaitItems.map((item, index) => (
                            <button
                                key={item.type}
                                className={`${styles.btnAddComp} btnWithIcon`}
                                onClick={() => addComponent(1, item.type)}
                            >
                                <div className={styles.icon}>{item.icon}</div>
                                {item.label}
                            </button>
                        ))
                    ) : (
                        <div className={styles.noResults}>검색 결과가 없습니다.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeftSidebar;
