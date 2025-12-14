'use client';
import { Collapse, Modal, Box, Typography, Menu, MenuItem } from '@mui/material';
import Drawer from '@mui/material/Drawer';
import { Theme, useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import {
    fetcherPostLogInsight,
    fetcherPostLogout,
    fetcherPostMenuTreeData,
    fetcherPostUserClickLog,
} from 'utils/axios';
import { useThemeStore } from 'utils/store/theme';
import {
    IcoAnalytics,
    IcoArrow,
    IcoCase,
    IcoDemography,
    IcoFinance,
    IcoInventory,
    IcoLogo,
    IcoMaster,
    IcoNet,
    IcoPeople,
    IcoPerson,
    IcoSetting,
} from '@/assets/Icon';
import '../styles/component/lnb.scss';
import '../styles/styles.scss';
import Badge from './Badge';
import { VisitInfo } from 'views/vA002/VisitInfo';
import { useTranslation } from 'react-i18next';
import { getBrowser, getOs } from '@/utils/clientEnv/clientEnv';
import { useAuthStore } from '@/utils/store/auth';
import { useHrInfoMenuStore } from '@/utils/store/HrInfoMenu';
interface MenuIconMap {
    [key: string]: React.ComponentType<{ fill: string }>;
}
const Sidebar = ({ drawerOpen, setDrawerOpen }) => {
    const theme: Theme = useTheme();
    const [collapseOpen, setCollapseOpen] = useState<Record<string, boolean>>({});
    const [parentMenuTitle, SetParentMenuTitle] = useState<string | null>(''); // 최상위 메뉴 title
    const [selectedParentMenuNo, setSelectedParentMenuNo] = useState<string | null>(null); // 좌측아이콘메뉴 번호 상태
    const [selectedMenuNo, setSelectedMenuNo] = useState<string | null>(null); // 좌측트리메뉴 번호 상태
    const [lnbWidth, setLnbWidth] = useState(false);
    const [modalOpen, setModalOpen] = useState(false); // 프로필 클리시 모달 생성
    const clearAuth = useAuthStore((state) => state.clearAuth); // 전역 변수 삭제
    const { setHrInfoMenuList } = useHrInfoMenuStore();
    // 세팅 버튼 이벤트 수정
    // const handleTheme = (event: React.MouseEvent<HTMLElement>) => {
    //     setAnchorEl(event.currentTarget); // anchor 설정
    // };
    // Popover 닫기
    // const handlePopoverClose = () => {
    //     setAnchorEl(null); // anchor 해제
    // };

    // 프로필 클릭시
    const handleOpenModal = () => {
        setModalOpen(true);
    };

    // 모달 닫기
    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleLogOut = async () => {
        const currentUsername = JSON.parse(localStorage.getItem('auth') || '{}').state.username;
        console.log('currentUsername', currentUsername);
        await fetcherPostLogout(currentUsername);
        //1. localStorage에서 auth, accessToken, refreshToken 데이터 삭제
        localStorage.removeItem('auth');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        //2. Zustand 스토어의 clearAuth 함수 호출로 전역변수 내용 삭제
        clearAuth();

        //3. 로그인 페이지로 리다이렉트 - 로그아웃이므로 window.location 사용 (상태 리셋)
        window.location.href = '/auth';
        //4. 모달 닫기
        setModalOpen(false);
    };

    // 다국어
    const { t } = useTranslation();

    const handleLnbWidth = () => {
        setLnbWidth(!lnbWidth);
    };
    const handleToggle = () => {
        setDrawerOpen((prev) => !prev); // Sidebar 상태 토글
    };
    const handleCollapseToggle = (itemText: string) => {
        setCollapseOpen((prev) => ({
            ...prev,
            [itemText]: !prev[itemText],
        }));
    };
    const [filterData, setFilterData] = useState('');
    const [menu, setMenu] = useState([]);

    useEffect(() => {
        const item = [
            {
                sqlId: process.env.NEXT_PUBLIC_SSW_MENU_TREE_SQL_ID,
                sql_key: 'hrs_menutree_get',
                params: [{}],
            },
        ];
        fetcherPostMenuTreeData(item)
            .then((response) => {
                const data = response.data;
                const menuData = [];
                data.forEach((item) => {
                    const hasChildren = data.some((child: any) => child.up_menu_no === item.menu_no);
                    let menuItem = {};
                    if (item.up_menu_no) {
                        if (hasChildren) {
                            menuItem = {
                                text: t(item.menu_nm),
                                href: item.scr_url,
                                type: 'collapse',
                                parent: item.up_menu_no,
                                menu_no: item.menu_no,
                            };
                        } else {
                            if (item.scr_no !== null) {
                                // up_menu_no가 'WINSYS'로 시작하면 href를 scr_url만 사용
                                if (typeof item.up_menu_no === 'string' && item.up_menu_no.startsWith('WINSYS')) {
                                    menuItem = {
                                        text: t(item.menu_nm),
                                        href: '/' + item.scr_url.split('/').pop(),
                                        type: 'item',
                                        parent: item.up_menu_no,
                                        menu_no: item.menu_no,
                                    };
                                } else {
                                    menuItem = {
                                        text: t(item.menu_nm),
                                        href: item.scr_url + item.scr_no,
                                        type: 'item',
                                        parent: item.up_menu_no,
                                        menu_no: item.menu_no,
                                    };
                                }
                            }
                        }
                    } else {
                        menuItem = {
                            text: t(item.menu_nm),
                            href: item.scr_url,
                            type: 'collapse',
                            parent: item.up_menu_no,
                            menu_no: item.menu_no,
                        };
                    }
                    if (menuItem !== {}) {
                        menuData.push(menuItem);
                    }
                });
                SetParentMenuTitle(menuData[0].text);
                setMenu(menuData);
                const hrInfoMenuList = menuData.filter((item) => item.menu_no?.startsWith('OJ'));
                setHrInfoMenuList(hrInfoMenuList);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    useEffect(() => {
        if (filterData) {
            setCollapseOpen((prev) => {
                const newCollapseOpen = { ...prev };
                menu.forEach((item) => {
                    if (item.type === 'collapse') {
                        newCollapseOpen[item.parent] = true;
                    }
                });
                return newCollapseOpen;
            });
        }
    }, [filterData]);

    // 메뉴변경시, 좌측아이콘 선택상태되도록
    useEffect(() => {
        if (menu.length === 0) {
            return;
        }

        // 현재 URL
        const currentPath = window.location.pathname;
        // 메뉴 찾기
        const selectedMenu = menu.find((item) => currentPath.includes(item.href));

        /*
         * 인사잇의 메뉴는 최대3단계라서 2단계가오면 바로 찾아지고 3단계가오면 두번찾으면 최상위가 나옴
         */

        // 1. 일치하는 메뉴 없으면 첫번째 메뉴 선택
        if (!selectedMenu) {
            setSelectedParentMenuNo(menu[0].menu_no);
            return;
        }

        // 2. 1depth의 메뉴일경우 (1depth는 거의 없다고 보이기는함)
        const parentMenuNo = selectedMenu.parent;
        const parentMenu = menu.find((item) => item.menu_no === parentMenuNo);
        if (!parentMenu) {
            setSelectedParentMenuNo(parentMenuNo); // 좌측 최상위메뉴
            //SetParentMenuTitle(parentMenu.text); // 최상위메뉴 text
            setSelectedMenuNo(selectedMenu.menu_no); // 현재메뉴 선택
            return;
        }

        // 3. 2depth의 메뉴일경우
        if (!parentMenu.parent) {
            setSelectedParentMenuNo(parentMenuNo); // 좌측 최상위메뉴
            SetParentMenuTitle(parentMenu.text); // 최상위메뉴 text
            setSelectedMenuNo(selectedMenu.menu_no); // 현재메뉴 선택
            return;
        }

        // 3. 3 depth의 메뉴일경우
        const parentparentMenuNo = parentMenu.parent;
        const parentparentMenu = menu.find((item) => item.menu_no === parentparentMenuNo);
        setSelectedParentMenuNo(parentparentMenuNo); // 좌측 최상위메뉴
        SetParentMenuTitle(parentparentMenu.text); // 최상위메뉴 text
        setSelectedMenuNo(selectedMenu.menu_no); // 현재메뉴 선택
        setCollapseOpen((prev) => ({ ...prev, [parentMenu.menu_no]: true })); // 상위메뉴 펼치기 - 3단계까지가야 펼칠 상위가있음
    }, [menu]);
    const menuClick = (menu_no: string) => {
        setSelectedMenuNo(menu_no);
        const auth = JSON.parse(localStorage.getItem('auth') || '{}');
        const {
            userNo,
            rprsOgnzNo,
            duty_cd,
            duty_nm,
            jbgd_cd,
            jbgd_nm,
            jbgp_cd,
            jbgp_nm,
            jbps_cd,
            jbps_nm,
            jbttl_cd,
            jbttl_nm,
            ipv4,
            ipv6,
        } = auth?.state;
        const os = getOs();
        const browser = getBrowser();
        const item = {
            menu_no,
            os,
            browser,
            userNo,
            buttonText: '',
            rprsOgnzNo,
            duty_cd,
            duty_nm,
            jbgd_cd,
            jbgd_nm,
            jbgp_cd,
            jbgp_nm,
            jbps_cd,
            jbps_nm,
            jbttl_cd,
            jbttl_nm,
            ipv4,
            ipv6,
        };
        fetcherPostUserClickLog(item);
    };
    // 메뉴트리
    const renderTree = (parentMenuNo: string | null) => {
        if (menu.length === 0) {
            return null;
        }

        // 부모 메뉴 번호가 null인 경우 selectedParentMenuNo 사용
        if (parentMenuNo === null) {
            parentMenuNo = selectedParentMenuNo; // 상태에서 선택된 메뉴 번호 사용
        }
        if (parentMenuNo === null || parentMenuNo === '') {
            parentMenuNo = menu[0].menu_no;
        }

        const parentItem = menu.filter((item: any) => item.menu_no === parentMenuNo);
        if (parentItem.length === 0) {
            return null;
        }
        const items = menu.filter((item: any) => item.parent === parentMenuNo);
        if (items.length === 0) {
            return null;
        }
        return (
            <ul className='subMenuList'>
                {items.map((item: any, itemIndex: number) => {
                    const hasChildren = menu.some((child: any) => child.parent === item.menu_no);
                    const isFiltered = filterData === '' || item.text.toLowerCase().includes(filterData.toLowerCase());
                    if (!isFiltered) return null;
                    const isSelected = selectedMenuNo === item.menu_no;
                    const TrackedButton = VisitInfo('a', item.menu_no);
                    return (
                        <li key={item.menu_no} className='item'>
                            {!item.href && hasChildren && (
                                <div
                                    className='depth2'
                                    key={`item-${itemIndex}`}
                                    onClick={() => hasChildren && handleCollapseToggle(item.menu_no)}
                                >
                                    <ul
                                        className={`${
                                            hasChildren && collapseOpen[item.menu_no] ? 'depth2Item on' : 'depth2Item'
                                        }`}
                                    >
                                        {t(item.text)}
                                        <IcoArrow className='icoDepth2' />
                                    </ul>
                                </div>
                            )}
                            {item.href && (
                                <TrackedButton
                                    href={item.href}
                                    key={`item-${itemIndex}`}
                                    onClick={
                                        () => {
                                            menuClick(item.menu_no);
                                        }
                                        // () => setSelectedMenuNo(item.menu_no)
                                        // sessionStorage.setItem(
                                        //   "menu_no",
                                        //   JSON.stringify({ menu_no: item.menu_no })
                                        // )
                                    }
                                    className={`${isSelected ? 'linkTo on' : 'linkTo'}`}
                                >
                                    {t(item.text)}
                                </TrackedButton>
                            )}
                            {hasChildren && (
                                <Collapse
                                    in={collapseOpen[item.menu_no] || filterData !== ''}
                                    timeout='auto'
                                    unmountOnExit
                                    className='depth3'
                                >
                                    {renderTree(item.menu_no)} {/* 하위 메뉴 재귀 호출 */}
                                </Collapse>
                            )}
                        </li>
                    );
                })}
            </ul>
        );
    };

    //menu mui
    const [contextMenu, setContextMenu] = useState<{
        mouseX: number;
        mouseY: number;
    } | null>(null);

    const handleContextMenuOpen = (event: React.MouseEvent) => {
        event.preventDefault();
        setContextMenu(
            contextMenu === null
                ? {
                      mouseX: event.clientX + 2,
                      mouseY: event.clientY - 6,
                  }
                : null
        );
    };
    const handleCloseMenu = () => {
        setContextMenu(null);
    };

    //좌측 아이콘
    const renderIconsForMenu = () => {
        if (menu.length === 0) {
            return null;
        }

        const level0Menu = menu.filter((item) => item.parent === null); // 레벨 0인 항목만 추출
        return level0Menu.map((item) => (
            <li
                key={item.menu_no}
                onClick={() => handleMenuChange(item.menu_no)} // menu_no를 전달
                className={`${selectedParentMenuNo === item.menu_no ? 'item on' : 'item'}`}
            >
                {getIconForMenuType(item)} {/* 아이콘을 동적으로 설정 */}
            </li>
        ));
    };
    const getIconForMenuType = (menu: any) => {
        const menu_no = menu?.menu_no;
        const text = menu?.text;

        const iconMap: MenuIconMap = {
            R: IcoPeople, // 인사기획
            O: IcoDemography, // 인사운영
            B: IcoCase, // 보상관리
            I: IcoInventory, // 결제관리
            V: IcoFinance, // 시각화
            S: IcoSetting, // 환경설정
            WINSYS: IcoMaster, // 시스템관리
        };

        const IconComponent = iconMap[menu_no] ?? IcoPeople;

        return (
            <div className='menu'>
                <div className='icoWrap'>
                    <IconComponent fill='#fff' />
                </div>
                <div className='menuName'>{t(text)}</div>
            </div>
        );
    };

    // 좌측아이콘 클릭 - 메뉴체인지
    const handleMenuChange = (parentMenuNo: string | null) => {
        if (menu.length === 0) {
            return null;
        }

        const selectedMenu = menu.filter((item: any) => item.menu_no === parentMenuNo);

        if (selectedMenu) {
            SetParentMenuTitle(selectedMenu[0].text); // 메뉴 타이틀 업데이트
            setSelectedParentMenuNo(parentMenuNo); // 선택된 메뉴 번호 상태 업데이트
        }
        setDrawerOpen(true);
    };
    const drawerContent = (
        <>
            <div className={`${drawerOpen ? 'lnb active' : 'lnb'}`}>
                <>
                    {/* 첫 번째 Grid 아이템 */}
                    <a href='/' title='' className={`${lnbWidth ? 'linkToHome on' : 'linkToHome'}`}>
                        <div className='logoWrap'>
                            <IcoLogo fill='#D9D9D9' className='lnbLogo' />
                        </div>
                    </a>
                    <a href='/' className='linkTocompanyInfo'>
                        <div className='companyInfoWrap'>
                            <div className='companyName'>화이트정보통신</div>
                            <Badge type='noti'>
                                99<span className='more'>+</span>
                            </Badge>
                        </div>
                    </a>
                    <ul className='lnbList' onMouseEnter={handleLnbWidth} onMouseLeave={() => setLnbWidth(false)}>
                        <>
                            {renderIconsForMenu()}
                            {/* <li className='item' onClick={handleSettingOpen}>
                                <div className='menu '>
                                    <div className='icoWrap'>
                                        <IcoSetting fill='#fff' />
                                    </div>
                                    <div className="menuName">설정</div>
                                </div>
                            </li> */}
                            <li className='item'>
                                <div className='menu'>
                                    <div className='icoWrap'>
                                        <IcoNet fill='#fff' />
                                    </div>
                                    <div className='menuName'>{t('전체보기')}</div>
                                </div>
                            </li>
                            <li className='item'>
                                <button
                                    className={`${lnbWidth ? 'profile on active' : 'profile on'}`}
                                    onClick={handleContextMenuOpen}
                                >
                                    <IcoPerson fill='#fff' />
                                </button>
                                <Menu
                                    open={contextMenu !== null}
                                    onClose={handleCloseMenu}
                                    anchorReference='anchorPosition'
                                    anchorPosition={
                                        contextMenu !== null
                                            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                                            : undefined
                                    }
                                >
                                    <MenuItem id='myInfo' onClick={handleLogOut}>
                                        내정보
                                    </MenuItem>
                                    <MenuItem id='ULogOut' onClick={handleOpenModal}>
                                        로그아웃
                                    </MenuItem>
                                </Menu>
                            </li>
                        </>
                    </ul>
                </>
                <div className='lnbSub'>
                    <h2 className='subMenuTitle'>
                        {t(parentMenuTitle)}
                        <span className='menuIco'>{getIconForMenuType(selectedParentMenuNo)?.props.children[0]}</span>
                    </h2>
                    {renderTree(null)}
                </div>
                <button className='btnToggleLnb' onClick={handleToggle}>
                    <IcoArrow fill='#fff' />
                </button>
            </div>
            {/* <SettingScreen
                open={settingOpen}
                fontFamily={fontFamily}
                handleFontFamilyChange={handleFontFamilyChange}
                handleOpen={handleSettingOpen}
                presetColor={presetColor}
                handleColorChange={handleColorChange}
                themeMapping={themeMapping}
                selectedTheme={selectedTheme}
                handleThemeChange={handleThemeChange}
            /> */}
        </>
    );

    const modalContent = (
        <Modal
            open={modalOpen}
            onClose={handleCloseModal}
            aria-labelledby='profile-modal-title'
            aria-describedby='profile-modal-description'
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 1,
                }}
            >
                <Typography id='profile-modal-title' variant='h6' component='h2' gutterBottom>
                    로그아웃
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <button variant='contained' onClick={handleLogOut}>
                        확인
                    </button>
                </Box>
            </Box>
        </Modal>
    );

    return (
        <>
            <Drawer
                variant='permanent'
                open={drawerOpen}
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': {
                        position: 'relative',
                        whiteSpace: 'nowrap',
                        transition: theme.transitions.create('width', {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                        overflowX: 'hidden',
                        boxSizing: 'border-box',
                        border: 'none',
                    },
                }}
            >
                {drawerContent}
            </Drawer>
            {modalContent}
        </>
    );
};

export default Sidebar;
