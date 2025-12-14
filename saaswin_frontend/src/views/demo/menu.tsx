'use client';

import styles from '../../styles/pages/Demo/page.module.scss';

interface MenuItem {
    label: string;
    children?: MenuItem[];
}

interface MenuProps {
    onMenuClick?: (index: number) => void;
}

const menuItems: MenuItem[] = [
    {
        label: 'TextField',
        children: [
            { label: 'Basic' },
            { label: 'Search' },
            { label: 'Password' },
            { label: 'Date Picker' },
            { label: 'Number' },
        ],
    },
    { label: 'Select' },
    { label: 'Checkbox' },
    { label: 'Radio' },
    { label: 'Button' },
    { label: 'Switch' },
    { label: 'Typography' },
    { label: 'Badge' },
    { label: 'Chips' },
    { label: 'Grid(Table)' },
    { label: 'Tooltip' },
    { label: 'Empty' },
    {
        label: 'Feedback',
        children: [{ label: 'Snackbar' }, { label: 'Notification' }],
    },
    {
        label: 'Surface',
        children: [{ label: 'Card' }],
    },
    {
        label: 'Utils',
        children: [{ label: 'Modal' }],
    },
];

const DemoMenu = ({ onMenuClick }: MenuProps) => {
    let itemIndex = 0; // 전체 메뉴 항목에 대한 인덱스 관리

    return (
        <div className={styles.demo}>
            <div className={styles.wrap}>
                <ul className={styles.menuList}>
                    {menuItems.map((item) => {
                        const currentIndex = itemIndex++; // 현재 아이템의 인덱스 저장

                        return (
                            <li
                                key={currentIndex}
                                className={styles.item}
                                onClick={() => !item.children && onMenuClick && onMenuClick(currentIndex - 1)}
                            >
                                {item.label}
                                {item.children && (
                                    <ul className={styles.subMenuList}>
                                        {item.children.map((subItem) => {
                                            const subIndex = itemIndex++; // 서브 메뉴도 전체 카운트 유지
                                            return (
                                                <li
                                                    key={subIndex}
                                                    className={styles.item}
                                                    onClick={() => onMenuClick && onMenuClick(subIndex - 1)}
                                                >
                                                    {subItem.label}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default DemoMenu;
