'use client';
import { Tab } from '@mui/material';
import Badge from 'components/Badge';
import Button from 'components/Button';
import InfoModal from 'components/InfoModal';
import SwTabContext from 'components/TabContext';
import SwTabList from 'components/TabList';
import SwTabPanel from 'components/TabPanel';
import Typography from 'components/Typography';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import Slider from 'react-slick';
import '../../../src/styles/slick.css';
import { fetcherPost, fetcherPostData } from 'utils/axios';
import { useAuthStore } from 'utils/store/auth';
import Chart from 'chart.js/auto';
import {
    IcoAnalytics,
    IcoArrow,
    IcoBookmark2,
    IcoCase,
    IcoCoworker,
    IcoDayOff,
    IcoDownEvaluation,
    IcoEval,
    IcoFinance,
    IcoGroup,
    IcoInvite,
    IcoMail,
    IcoNoneEntered,
    IcoNotice,
    IcoNotification,
    IcoOutCompany,
    IcoPersonFill,
    IcoResetPassword,
    IcoSchdule,
    IcoUpEvaluation,
} from '@/assets/Icon';
import ModalDialog from '../../components/PasswordModalDialog';
import EssentialInfoModal from '@/components/EssentialInfoModal';
import WelcomePopup from '@/components/WelcomePopup';
import ModalPopup from '@/components/ModalPopup';
import InviteAcceptPopup from '@/components/InviteAcceptPopup';
export default function Homepage() {
    // 모달에 사용되는 변수
    const [open, setOpen] = useState(true); // 패스워드 모달 on/off
    const [welcomePopupOpen, setWelcomePopupOpen] = useState(true);
    const userNo = useAuthStore((state) => state.userNo); // 전역 userNo
    const [pswdSttsCd, setPswdSttsCd] = useState(''); // 비밀번호 상태
    const [entlInfoSttsCd, setEntlInfoSttsCd] = useState(''); // 필수정보 상태.
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [value, setValue] = useState('2024'); // 탭 종류 저장
    const [tabState, setTabState] = useState('tab1');
    const [essentialInfoModalOpen, setEssentialInfoModalOpen] = useState(false); //필수값 오픈 모달키

    const handleChangeTab = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };
    const handleTabClick = (id: string) => {
        setTabState(id);
    };
    const type = 'home';
    useEffect(() => {
        const item = [
            {
                sqlId: 'hrs_login01',
                sql_key: 'hrs_login_myinfo',
                params: [
                    {
                        user_no: userNo,
                    },
                ],
            },
        ];
        fetcherPostData(item)
            .then((response) => {
                // 성공
                const value = response[0];
                console.log('value : ', value);

                setPswdSttsCd(value.pswd_stts_cd); // 비밀번호 상태
                setEntlInfoSttsCd(value.esntl_info_stts_cd); // 필수 정보

                // 비밀번호 상태가 특정 값일 때 모달 열기
                if (value.pswd_stts_cd === 'hrs_group00929_cm0001' || value.pswd_stts_cd === 'hrs_group00929_cm0002') {
                    setOpen(true); // 비밀번호 재설정 모달 열기
                } else if (value.esnt_info_stts_cd === 'hrs_group00930_cm0001') {
                    // 필수 정보가 미입력 상태일 때 해당 모달 열기
                    setEssentialInfoModalOpen(true);
                    console.log('필수 정보 미입력 상태');
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }, [userNo]);

    // 비밀번호 모달이 닫힐 때 처리하는 함수
    const handlePasswordModalClose = () => {
        setOpen(false);

        // 비밀번호 모달이 닫힌 후 필수 정보 상태 확인
        if (entlInfoSttsCd === 'hrs_group00930_cm0001') {
            setEssentialInfoModalOpen(true);
        }
    };

    // 화면에 모달 띄우기
    const handleModal = (e: any) => {
        setIsModalOpen((prev) => !prev);
        console.log(isModalOpen);
    };

    // slick slider
    const settings = {
        dots: true,
        arrows: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
    };

    // chart

    const DATA_COUNT = 5;
    const NUMBER_CFG = { count: DATA_COUNT, min: 0, max: 100 };

    const getRandomData = (count: number, min: number, max: number) => {
        return Array.from({ length: count }, () => Math.floor(Math.random() * (max - min + 1)) + min);
    };

    const data = {
        labels: ['발생일수', '사용일수', '잔여일수'],
        datasets: [
            {
                label: '일수',
                data: getRandomData(3, 0, 100),
                backgroundColor: ['#1766E8', '#1EC9EE', '#37AE34'],
            },
        ],
    };
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstanceRef = useRef<Chart | null>(null);

    useEffect(() => {
        if (tabState === 'tab1') {
            const ctx = chartRef.current?.getContext('2d');
            if (!ctx) return;

            const newChart = new Chart(ctx, {
                type: 'doughnut',
                data,
                options: {
                    responsive: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                usePointStyle: true,
                                pointStyle: 'circle',
                                font: {
                                    family: 'pretendard',
                                    size: 12,
                                },
                                color: '#010101',
                                boxWidth: 6, //
                                boxHeight: 6, //
                                padding: 20,
                            },
                        },
                    },
                },
            });

            chartInstanceRef.current = newChart;

            return () => {
                newChart.destroy();
            };
        }
    }, [tabState]);

    return (
        <main className="main">
            <div className="container">

                {/* page header */}
                <div className="pageHeader">
                    <div className="pageInfo">
                        <Typography type="page" desc onClickDesc={handleModal}>
                            홈
                        </Typography>
                        <InfoModal
                            title="평가관리"
                            // url="https://docs.google.com/document/d/e/2PACX-1vQvfxSoqEqQd6_CRF1aQufCUJYue2HpeMhWwTvGLgYIUrtudcrtf3nRLp8e_BlCLl-0HyfW0WuLCqIb/pub?embedded=true"
                            url="https://docs.google.com/document/d/18Qn9wrfJ7NQuLaW2UItsMkT1JN_Rjq31gDpsHWVqj_A/edit?usp=sharing#heading=h.w56nw9rlwsc"
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                        />
                    </div>
                </div>
                <div className="fieldWrap">
                    <div className="filed row row1">
                        {/* 공지사항 */}
                        <section className="section notice">
                            <h3 className="sectionTitle">
                                <Link href="#" className="linkTo">
                                    <div className="icon">
                                        <IcoNotice fill="#fff" />
                                    </div>
                                    <div className="text">공지사항</div>
                                    <span className="icoLink">
                                        <IcoArrow fill="#fff" />
                                    </span>
                                </Link>
                            </h3>
                            <ul className="list">
                                <li className="item">
                                    <Link href="#" className="linkTo">
                                        <div className="title">화이트정보 창립기념일 행사 안내</div>
                                        <span className="date">2024.11.27</span>
                                    </Link>
                                </li>
                                <li className="item">
                                    <Link href="#" className="linkTo">
                                        <div className="title">연말정산 소득공제 신고기간 안내</div>
                                        <span className="date">2024.11.27</span>
                                    </Link>
                                </li>
                                <li className="item">
                                    <Link href="#" className="linkTo">
                                        <div className="title">성과지표 등록기간 안내</div>
                                        <span className="date">2024.11.27</span>
                                    </Link>
                                </li>
                                <li className="item">
                                    <Link href="#" className="linkTo">
                                        <div className="title">신인사시스템 오픈 일정 안내</div>
                                        <span className="date">2024.11.27</span>
                                    </Link>
                                </li>
                            </ul>
                        </section>
                        {/* 알림 */}
                        <section className="section alert">
                            <h3 className="sectionTitle">
                                <Link href="#" className="linkTo">
                                    <div className="icon">
                                        <IcoNotification className="icoTit" />
                                    </div>
                                    <div className="text">알림</div>
                                    <span className="icoLink">
                                        <IcoArrow fill="#C4C4C4" />
                                    </span>
                                </Link>
                            </h3>
                            <ul className="list">
                                <li className="item">
                                    <Link href="#" className="linkTo">
                                        <div className="title">김솔음 님의 연차 결재 요청이 있습니다.</div>
                                        <span className="date">3분 전</span>
                                    </Link>
                                </li>
                                <li className="item">
                                    <Link href="#" className="linkTo">
                                        <div className="title">이지헌 님의 출장 결재 요청이 있습니다.</div>
                                        <span className="date">3시간 전</span>
                                    </Link>
                                </li>
                                <li className="item">
                                    <Link href="#" className="linkTo">
                                        <div className="title">진나솔 님 외 14명의 2025년 상반기 평가 요청청</div>
                                        <span className="date">1일 전</span>
                                    </Link>
                                </li>
                                <li className="item">
                                    <Link href="#" className="linkTo">
                                        <div className="title">급여 명세서가 도착했습니다.</div>
                                        <span className="date">2025-01-01</span>
                                    </Link>
                                </li>
                            </ul>
                        </section>
                        {/* 비주얼 */}
                        <section className="section visual">
                            <div className="greeting">
                                <div className="userName">화이트님</div>
                                <div className="text">
                                    <Image
                                        src="/img/main_greeting1.png"
                                        alt="좋은 아침입니다!"
                                        width={300}
                                        height={500}
                                    />
                                </div>
                            </div>
                        </section>
                    </div>
                    <div className="row row2">
                        {/* 내 스케줄 */}
                        <section className="section filed myShedule">
                            <h3 className="sectionTitle noLink">
                                <div className="icon">
                                    <IcoSchdule className="icoTit" />
                                </div>
                                <div className="text">내 스케줄</div>
                            </h3>
                            <div className="title">
                                <span className="date">2025년 2월</span>
                                <Button className="btn btnPrev">
                                    <IcoArrow fill="#666" />
                                </Button>
                                <span className="text">이번 주</span>
                                <Button className="btn btnNext">
                                    <IcoArrow fill="#666" />
                                </Button>
                            </div>
                            <div className="state">
                                <ul className="list">
                                    <li className="item work">
                                        <Badge type="dot" color="primary" /> 근무
                                    </li>
                                    <li className="item outWork">
                                        <Badge type="dot" color="warning" /> 외근
                                    </li>
                                    <li className="item trip">
                                        <Badge type="dot" color="error" /> 출장
                                    </li>
                                    <li className="item home">
                                        <Badge type="dot" color="success" /> 재택
                                    </li>
                                    <li className="item off">
                                        <Badge type="dot" color="vacancy" /> 연차
                                    </li>
                                </ul>
                            </div>
                            <table className="table">
                                <colgroup>
                                    <col style={{ width: '147px' }} />
                                    <col style={{ width: '147px' }} />
                                    <col style={{ width: '147px' }} />
                                    <col style={{ width: '147px' }} />
                                    <col style={{ width: '147px' }} />
                                    <col style={{ width: '147px' }} />
                                    <col style={{ width: '147px' }} />
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th className="sun">일</th>
                                        <th>월</th>
                                        <th>화</th>
                                        <th>수</th>
                                        <th>목</th>
                                        <th>금</th>
                                        <th className="sat">토</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="sun">16</td>
                                        <td>
                                            <span className="today">17</span>
                                        </td>
                                        <td>18</td>
                                        <td>19</td>
                                        <td>20</td>
                                        <td>21</td>
                                        <td className="sat">22</td>
                                    </tr>
                                    <tr className="detail">
                                        <td>
                                            <ul className="list">
                                                <li className="item work">
                                                    <Badge type="dot" color="primary" /> 근무 09:00~18:00
                                                </li>
                                                <li className="item outWork">
                                                    <Badge type="dot" color="warning" /> 외근 14:00~16:00
                                                </li>
                                                <li className="item trip">
                                                    <Badge type="dot" color="error" /> 출장 16:00~18:00
                                                </li>
                                            </ul>
                                        </td>
                                        <td>
                                            <ul className="list">
                                                <li className="item work">
                                                    <Badge type="dot" color="primary" /> 근무 09:00~18:00
                                                </li>
                                                <li className="item outWork">
                                                    <Badge type="dot" color="warning" /> 외근 14:00~16:00
                                                </li>
                                            </ul>
                                        </td>
                                        <td>
                                            <ul className="list">
                                                <li className="item work">
                                                    <Badge type="dot" color="primary" /> 근무 09:00~18:00
                                                </li>
                                            </ul>
                                        </td>
                                        <td>
                                            <ul className="list">
                                                <li className="item work">
                                                    <Badge type="dot" color="primary" /> 근무 09:00~18:00
                                                </li>
                                            </ul>
                                        </td>
                                        <td>
                                            <ul className="list">
                                                <li className="item work">
                                                    <Badge type="dot" color="primary" /> 근무 09:00~18:00
                                                </li>
                                                <li className="item outWork">
                                                    <Badge type="dot" color="warning" /> 외근 14:00~16:00
                                                </li>
                                                <li className="item home">
                                                    <Badge type="dot" color="success" /> 재택 16:00~18:00
                                                </li>
                                            </ul>
                                        </td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                            <Button type="default" size="sm" className="btnAllschedule">
                                전체일정
                            </Button>
                        </section>
                        {/* 연차 */}
                        <section className="section filed dayoff">
                            <h3 className="sectionTitle noLink">
                                <div className="icon">
                                    <IcoDayOff className="icoTit" />
                                </div>
                                <div className="text">연차</div>
                            </h3>
                            <div className="tabButtons">
                                <Button
                                    className={tabState === 'tab1' ? 'btnTab on' : 'btnTab'}
                                    id="tab1"
                                    onClick={() => handleTabClick('tab1')}
                                >
                                    일수
                                </Button>
                                <Button
                                    className={tabState === 'tab2' ? 'btnTab on' : 'btnTab'}
                                    id="tab2"
                                    onClick={() => handleTabClick('tab2')}
                                >
                                    시간
                                </Button>
                            </div>
                            {tabState === 'tab1' && (
                                <div className="tabContents" data-id="tab1">
                                    <div className="chart">
                                        <canvas ref={chartRef} width={438} height={195} />
                                        <div className="text">
                                            <span className="num">20</span>일<br /> 잔여
                                        </div>
                                    </div>
                                    <div className="btnArea">
                                        <Button type="default" size="lg" className="btnWithIcon">
                                            연차 신청하기 <IcoArrow fill="#666" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {tabState === 'tab2' && (
                                <div className="tabContents" data-id="tab2">
                                    tab2
                                </div>
                            )}
                        </section>
                        {/* 즐겨찾기 */}
                        <section className="section filed bookmark">
                            <h3 className="sectionTitle noLink">
                                <div className="icon">
                                    <IcoBookmark2 className="icoTit" />
                                </div>
                                <div className="text">즐겨찾기</div>
                            </h3>
                            <Slider {...settings}>
                                <div className="slide">
                                    <ul className="list">
                                        <li className="item">
                                            <Link href="#" className="linkTo">
                                                <div className="icon">
                                                    <IcoCoworker />
                                                </div>
                                                <div className="text">개별인사정보</div>
                                                <div className="icoArrow">
                                                    <IcoArrow fill="#666" />
                                                </div>
                                            </Link>
                                        </li>
                                        <li className="item">
                                            <Link href="#" className="linkTo">
                                                <div className="icon">
                                                    <IcoAnalytics />
                                                </div>
                                                <div className="text">평가관리</div>
                                                <div className="icoArrow">
                                                    <IcoArrow fill="#666" />
                                                </div>
                                            </Link>
                                        </li>
                                        <li className="item">
                                            <Link href="#" className="linkTo">
                                                <div className="icon">
                                                    <IcoCase />
                                                </div>
                                                <div className="text">대상자현황</div>
                                                <div className="icoArrow">
                                                    <IcoArrow fill="#666" />
                                                </div>
                                            </Link>
                                        </li>
                                        <li className="item">
                                            <Link href="#" className="linkTo">
                                                <div className="icon">
                                                    <IcoFinance />
                                                </div>
                                                <div className="text">직무별분포</div>
                                                <div className="icoArrow">
                                                    <IcoArrow fill="#666" />
                                                </div>
                                            </Link>
                                        </li>
                                        <li className="item">
                                            <Link href="#" className="linkTo">
                                                <div className="icon">
                                                    <IcoCoworker />
                                                </div>
                                                <div className="text">조직이력</div>
                                                <div className="icoArrow">
                                                    <IcoArrow fill="#666" />
                                                </div>
                                            </Link>
                                        </li>
                                        <li className="item">
                                            <Link href="#" className="linkTo">
                                                <div className="icon">
                                                    <IcoMail />
                                                </div>
                                                <div className="text">받은 편지함</div>
                                                <div className="icoArrow">
                                                    <IcoArrow fill="#666" />
                                                </div>
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                                <div className="slide">
                                    <ul className="list">
                                        <li className="item">
                                            <Link href="#" className="linkTo">
                                                <div className="icon">
                                                    <IcoCoworker />
                                                </div>
                                                <div className="text">개별인사정보</div>
                                                <div className="icoArrow">
                                                    <IcoArrow fill="#666" />
                                                </div>
                                            </Link>
                                        </li>
                                        <li className="item">
                                            <Link href="#" className="linkTo">
                                                <div className="icon">
                                                    <IcoAnalytics />
                                                </div>
                                                <div className="text">평가관리</div>
                                                <div className="icoArrow">
                                                    <IcoArrow fill="#666" />
                                                </div>
                                            </Link>
                                        </li>
                                        <li className="item">
                                            <Link href="#" className="linkTo">
                                                <div className="icon">
                                                    <IcoCase />
                                                </div>
                                                <div className="text">대상자현황</div>
                                                <div className="icoArrow">
                                                    <IcoArrow fill="#666" />
                                                </div>
                                            </Link>
                                        </li>
                                        <li className="item">
                                            <Link href="#" className="linkTo">
                                                <div className="icon">
                                                    <IcoFinance />
                                                </div>
                                                <div className="text">직무별분포</div>
                                                <div className="icoArrow">
                                                    <IcoArrow fill="#666" />
                                                </div>
                                            </Link>
                                        </li>
                                        <li className="item">
                                            <Link href="#" className="linkTo">
                                                <div className="icon">
                                                    <IcoCoworker />
                                                </div>
                                                <div className="text">조직이력</div>
                                                <div className="icoArrow">
                                                    <IcoArrow fill="#666" />
                                                </div>
                                            </Link>
                                        </li>
                                        <li className="item">
                                            <Link href="#" className="linkTo">
                                                <div className="icon">
                                                    <IcoMail />
                                                </div>
                                                <div className="text">받은 편지함</div>
                                                <div className="icoArrow">
                                                    <IcoArrow fill="#666" />
                                                </div>
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                                <div className="slide">
                                    <ul className="list">
                                        <li className="item">
                                            <Link href="#" className="linkTo">
                                                <div className="icon">
                                                    <IcoCoworker />
                                                </div>
                                                <div className="text">개별인사정보</div>
                                                <div className="icoArrow">
                                                    <IcoArrow fill="#666" />
                                                </div>
                                            </Link>
                                        </li>
                                        <li className="item">
                                            <Link href="#" className="linkTo">
                                                <div className="icon">
                                                    <IcoAnalytics />
                                                </div>
                                                <div className="text">평가관리</div>
                                                <div className="icoArrow">
                                                    <IcoArrow fill="#666" />
                                                </div>
                                            </Link>
                                        </li>
                                        <li className="item">
                                            <Link href="#" className="linkTo">
                                                <div className="icon">
                                                    <IcoCase />
                                                </div>
                                                <div className="text">대상자현황</div>
                                                <div className="icoArrow">
                                                    <IcoArrow fill="#666" />
                                                </div>
                                            </Link>
                                        </li>
                                        <li className="item">
                                            <Link href="#" className="linkTo">
                                                <div className="icon">
                                                    <IcoFinance />
                                                </div>
                                                <div className="text">직무별분포</div>
                                                <div className="icoArrow">
                                                    <IcoArrow fill="#666" />
                                                </div>
                                            </Link>
                                        </li>
                                        <li className="item">
                                            <Link href="#" className="linkTo">
                                                <div className="icon">
                                                    <IcoCoworker />
                                                </div>
                                                <div className="text">조직이력</div>
                                                <div className="icoArrow">
                                                    <IcoArrow fill="#666" />
                                                </div>
                                            </Link>
                                        </li>
                                        <li className="item">
                                            <Link href="#" className="linkTo">
                                                <div className="icon">
                                                    <IcoMail />
                                                </div>
                                                <div className="text">받은 편지함</div>
                                                <div className="icoArrow">
                                                    <IcoArrow fill="#666" />
                                                </div>
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            </Slider>
                        </section>
                        {/* 진행 중인 평가 */}
                        <section className="section filed eval">
                            <h3 className="sectionTitle noLink">
                                <div className="icon">
                                    <IcoEval className="icoTit" />
                                </div>
                                <div className="text">진행 중인 평가</div>
                            </h3>
                            <SwTabContext value={value}>
                                <SwTabList onChange={handleChangeTab} aria-label="lab API tabs example">
                                    <Tab label="2024 역량평가" value="2024" />
                                    <Tab label="2025 역량평가" value="2025" />
                                </SwTabList>
                                <SwTabPanel value="2024" className="tabContent">
                                    <ul className="list">
                                        <li className="item">
                                            <div className="title">
                                                <IcoPersonFill fill="#666" />
                                                자기 평가 <span className="count">(0/1)</span>
                                            </div>
                                            <div className="term">2024.10.01~2025.12.31</div>
                                        </li>
                                        <li className="item">
                                            <div className="title">
                                                <IcoDownEvaluation fill="#666" />
                                                하향 평가 1차 <span className="count">(1/3)</span>
                                            </div>
                                            <div className="term">2024.10.01~2025.12.31</div>
                                        </li>
                                        <li className="item">
                                            <div className="title">
                                                <IcoUpEvaluation fill="#666" />
                                                상향 평가 2차 <span className="count">(2/10)</span>
                                            </div>
                                            <div className="term">2024.10.01~2025.12.31</div>
                                        </li>
                                        <li className="item">
                                            <div className="title">
                                                <IcoGroup fill="#666" />
                                                위원 평가 <span className="count">(2/10)</span>
                                            </div>
                                            <div className="term">2024.10.01~2025.12.31</div>
                                        </li>
                                        <li className="item">
                                            <div className="title">
                                                <IcoCoworker fill="#666" />
                                                동료 평가 <span className="count">(2/10)</span>
                                            </div>
                                            <div className="term">2024.10.01~2025.12.31</div>
                                        </li>
                                    </ul>
                                </SwTabPanel>
                                <SwTabPanel value="2025">2025 역량평가</SwTabPanel>
                            </SwTabContext>
                        </section>
                        {/* 확인이 필요한 구성원 */}
                        <section className="section filed coworker">
                            <h3 className="sectionTitle noLink">
                                <div className="icon">
                                    <IcoCoworker className="icoTit" />
                                </div>
                                <div className="text">확인이 필요한 구성원</div>
                            </h3>
                            <ul className="list">
                                <li className="item">
                                    <Link href="#" className="linkTo">
                                        <div className="icon">
                                            <IcoInvite fill="#666" />
                                        </div>
                                        <div className="text">초대 중</div>
                                        <span className="count">0</span>
                                        <div className="icoArrow">
                                            <IcoArrow fill="#666" />
                                        </div>
                                    </Link>
                                </li>
                                <li className="item">
                                    <Link href="#" className="linkTo">
                                        <div className="icon">
                                            <IcoNoneEntered fill="#fff" />
                                        </div>
                                        <div className="text">필수 정보 미입력</div>
                                        <span className="count">2</span>
                                        <div className="icoArrow">
                                            <IcoArrow fill="#666" />
                                        </div>
                                    </Link>
                                </li>
                                <li className="item">
                                    <Link href="#" className="linkTo">
                                        <div className="icon">
                                            <IcoOutCompany fill="#666" />
                                        </div>
                                        <div className="text">퇴사 예정(1달)</div>
                                        <span className="count">0</span>
                                        <div className="icoArrow">
                                            <IcoArrow fill="#666" />
                                        </div>
                                    </Link>
                                </li>
                                <li className="item">
                                    <Link href="#" className="linkTo">
                                        <div className="icon">
                                            <IcoResetPassword fill="#fff" />
                                        </div>
                                        <div className="text">비밀번호 초기화 필요</div>
                                        <span className="count">1</span>
                                        <div className="icoArrow">
                                            <IcoArrow fill="#666" />
                                        </div>
                                    </Link>
                                </li>
                                <li className="item">
                                    <Link href="#" className="linkTo">
                                        <div className="icon">
                                            <IcoCoworker fill="#666" />
                                        </div>
                                        <div className="text">조직 없음</div>
                                        <span className="count">1</span>
                                        <div className="icoArrow">
                                            <IcoArrow fill="#666" />
                                        </div>
                                    </Link>
                                </li>
                            </ul>
                        </section>
                    </div>
                </div>
                <WelcomePopup
                open={welcomePopupOpen}
                onClose={() => setWelcomePopupOpen(false)}
                onConfirm={handlePasswordModalClose}
                title="환영합니다다"
                message="테스트 중입니다."
            />

            {/* 팝업 컴포넌트 3개 */}
            {/* <ModalPopup
                open={open}
                onClose={() => setOpen(false)}
                onConfirm={handlePasswordModalClose}
                title="환영합니다다"
                message="테스트 중입니다."
            /> */}
            {/* <InviteAcceptPopup
                open={open}
                onClose={() => setOpen(false)}
                onConfirm={handlePasswordModalClose}
                title="환영합니다다"
                message="테스트 중입니다."
            /> */}


                {/* <ModalDialog open={open} onClose={() => setEssentialInfoModalOpen(false)} type={type} /> */}
                {/* <EssentialInfoModal open={essentialInfoModalOpen} onClose={() => setEssentialInfoModalOpen(false)} /> */}
            </div>
        </main>
    );
}
