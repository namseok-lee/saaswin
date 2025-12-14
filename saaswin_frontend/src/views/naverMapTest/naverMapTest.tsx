'use client';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { drawPolyline } from 'components/MapUtils';
import SearchAddress from 'components/SearchAddress';
import { fetcherPost } from '../../utils/axios';

interface Guide {
    duration: number; // 소요 시간 (초 단위)
    distance: number; // 거리 (미터 단위)
    instructions: string; // 안내 메시지
}

interface Summary {
    route: {
        traoptimal: {
            guide: Guide[];
            summary: {
                distance: number;
                duration: number;
                fuelPrice: number;
                tollFare: number;
                taxiFare: number;
            };
        }[];
    };
}

interface TotalDetails {
    totalDistance: number;
    totalDuration: number;
    fuelPrice: number;
    tollFare: number;
    taxiFare: number;
}

export default function NaverMapTest() {
    const mapRef = useRef(null); // 네이버 맵을 렌더링할 div를 참조
    const mapInstance = useRef(null); // 생성된 네이버 지도 객체 저장
    const existingPolyline = useRef(null); // 폴리라인 객체
    const [map, setMap] = useState(null); // 생성된 네이버 지도 객체 저장
    const [postOpen, setPostOpen] = useState(false);
    const [departure, setDeparture] = useState(''); // 출발지 입력 (address - 출발 값)
    const [destination, setDestination] = useState(''); // 도착지 입력 (address - 도착 값)
    const [departureCoordinate, setDepartureCoordinate] = useState(null); // 출발지 좌표
    const [destinationCoordinate, setDestinationCoordinate] = useState(null); // 도착지 좌표
    const [retrieve, setRetrieve] = useState(false);
    const [guideDetails, setGuideDetails] = useState(null); // 각 가이드 정보( 분기점 정보, 지시, 거리, 소요시간)
    const [data, setData] = useState(null);
    const [directionObject, setDirectionObject] = useState<Summary>({
        route: {
            traoptimal: [
                {
                    guide: [],
                    summary: {
                        distance: 0,
                        duration: 0,
                        fuelPrice: 0,
                        tollFare: 0,
                        taxiFare: 0,
                    },
                },
            ],
        },
    });

    const [totalDetails, setTotalDetails] = useState<TotalDetails>({
        totalDistance: 0,
        totalDuration: 0,
        fuelPrice: 0,
        tollFare: 0,
        taxiFare: 0,
    }); // 전체 경로 정보 저장

    const CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID; // .nev에 저장된 API 키 가져오기

    //네이버 맵 초기화
    useEffect(() => {
        if (window.naver && window.naver.maps) {
            initMap();
        } else {
            const script = document.createElement('script');
            script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${CLIENT_ID}&submodules=geocoder`;
            script.onload = initMap;
            document.head.appendChild(script);
        }
    }, []);

    // 맵생성 초기화 함수
    function initMap() {
        const mapOptions = {
            center: new window.naver.maps.LatLng(37.519259, 127.034426),
            zoom: 17,
        };
        mapInstance.current = new window.naver.maps.Map(mapRef.current, mapOptions);
    }

    // onClick으로 클릭시 실행되는 함수
    async function searchRoute() {
        if (!departure || !destination) {
            alert('출발지와 도착지를 모두 입력해주세요.');
            return;
        }

        await searchAddress(departure, 'departure');
        await searchAddress(destination, 'destination');
        setRetrieve(true);
    }

    async function searchAddress(query: string, type: 'departure' | 'destination') {
        try {
            // TODO: 현재 sts 로컬 서버로 요청중 saaswin으로 변경해야함 fetchpost로
            // const baseURL = 'http://localhost:8080';
            // const url = `${baseURL}/api/geocode/${query}`;
            // const response = await axios.get(url);
            const item = { query: query };
            fetcherPost(['/api/geocode', item])
                .then((response) => {
                    console.log('fetcherPost 응답 데이터:', response);

                    if (response && response.x && response.y) {
                        setData(response);

                        if (type === 'departure') {
                            setDepartureCoordinate({ x: response.x, y: response.y });
                        } else if (type === 'destination') {
                            setDestinationCoordinate({ x: response.x, y: response.y });
                        }
                    } else {
                        console.error('응답 데이터가 예상과 다릅니다:', response);
                        throw new Error('올바르지 않은 응답 데이터');
                    }
                })
                .catch((error) => {
                    console.error('fetcherPost 요청 중 오류 발생:', error);
                });
        } catch (error) {
            console.error(error);
        }
    }

    // 변경이 완료되면 재 랜더링되는 함수
    useEffect(() => {
        if (departureCoordinate && destinationCoordinate) {
            const { x: depX, y: depY } = departureCoordinate;
            const { x: destX, y: destY } = destinationCoordinate;

            getDirection({ x: depX, y: depY }, { x: destX, y: destY });
        }
    }, [departureCoordinate, destinationCoordinate]);

    async function getDirection(
        { x: departureX, y: departureY }: { x: number; y: number },
        { x: destinationX, y: destinationY }: { x: number; y: number }
    ) {
        try {
            console.log('x값 : ' + departureX);
            console.log('y값 : ' + departureY);
            console.log('x값 : ' + destinationX);
            console.log('y값 : ' + destinationY);
            //   setIsDataLoaded(false);
            // TODO: 현재 sts 로컬 서버로 요청중 saaswin으로 변경해야함 fetchpost로
            const item = {
                departureX: departureX,
                departureY: departureY,
                destinationX: destinationX,
                destinationY: destinationY,
            };
            fetcherPost(['/api/driving', item])
                .then((response) => {
                    setDirectionObject(response);

                    if (response.route.traoptimal.length > 0) {
                        console.log('경로 데이터 로드 완료:', response.data);
                        // 공통 컴포넌트로 폴리라인 생성
                        drawPolyline(mapInstance.current, response.route.traoptimal[0].path, existingPolyline);
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
        } catch (error) {
            console.error('경로 탐색 중 오류 발생', error);
        }
    }

    useEffect(() => {
        if (directionObject.route.traoptimal.length > 0) {
            const summary = directionObject.route.traoptimal[0].summary;
            setTotalDetails({
                totalDistance: summary.distance || 0,
                totalDuration: summary.duration || 0,
                fuelPrice: summary.fuelPrice || 0,
                tollFare: summary.tollFare || 0,
                taxiFare: summary.taxiFare || 0,
            });
        }
    }, [directionObject]);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalValue, setModalValue] = useState(null);
    const [selectedAddress, setSelectedAddress] = useState<{
        zonecode: string;
        roadAddress: string;
        roadAddressEnglish: string;
    } | null>(null);

    // 모달 열기 핸들러
    const handleOpenModal = (value: 'departure' | 'destination') => {
        setModalValue(value); // 모달 타입 설정
        setModalOpen(true); // 모달 열기
    };

    // 모달 닫기 핸들러
    const handleCloseModal = () => {
        setModalValue(null); // 모달 타입 초기화
        setModalOpen(false); // 모달 닫기
    };

    const handleSetAddress = (data: { zonecode: string; roadAddress: string; roadAddressEnglish: string }) => {
        if (modalValue === 'departure') {
            setDeparture(data.roadAddress); // 출발지 설정
        } else if (modalValue === 'destination') {
            setDestination(data.roadAddress); // 도착지 설정
        }
        handleCloseModal(); // 모달 닫기
    };

    return (
        <>
            <input value={departure} onClick={() => handleOpenModal('departure')} readOnly placeholder="출발지" />
            <input value={destination} onClick={() => handleOpenModal('destination')} readOnly placeholder="도착지" />
            <button onClick={searchRoute}>경로 검색</button>
            <div ref={mapRef} style={{ width: '100%', height: '500px' }}></div>
            {retrieve && (
                <>
                    <h3>전체 경로 안내</h3>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>전체 거리 (km)</th>
                                <th>전체 시간 (분:초)</th>
                                <th>연료 비용 (원)</th>
                                <th>톨비 (원)</th>
                                <th>택시 요금 (원)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{(totalDetails.totalDistance / 1000).toFixed(2)}</td>
                                <td>
                                    {Math.floor(totalDetails.totalDuration / (1000 * 60))}분
                                    {Math.floor((totalDetails.totalDuration / 1000) % 60)}초
                                </td>
                                <td>{totalDetails.fuelPrice?.toLocaleString() || 0} 원</td>
                                <td>{totalDetails.tollFare?.toLocaleString() || 0} 원 </td>
                                <td>{totalDetails.taxiFare?.toLocaleString() || 0} 원</td>
                            </tr>
                        </tbody>
                    </table>

                    <h3>경로 안내</h3>
                    <table className="table">
                        <thead>
                            <tr>
                                <th style={{ border: '1px solid black' }}>#</th>
                                <th style={{ border: '1px solid black' }}>안내</th>
                                <th style={{ border: '1px solid black' }}>거리 (km)</th>
                                <th style={{ border: '1px solid black' }}>소요 시간 (분:초)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {directionObject.route.traoptimal[0].guide.map((guide, index) => (
                                <tr key={index}>
                                    <td style={{ border: '1px solid black' }}>{index + 1}</td>
                                    <td style={{ border: '1px solid black' }}>{guide.instructions}</td>
                                    <td style={{ border: '1px solid black' }}>{(guide.distance / 1000).toFixed(2)}</td>
                                    <td style={{ border: '1px solid black' }}>
                                        {Math.floor(guide.duration / (1000 * 60))}분
                                        {Math.floor((guide.duration / 1000) % 60)}초
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <style jsx>{`
                        .table {
                            width: 100%;
                            margin-top: 20px;
                            border-collapse: collapse;
                        }

                        .table th,
                        .table td {
                            border: 1px solid black;
                            padding: 8px;
                        }

                        .table th {
                            text-align: center;
                        }

                        .table td {
                            text-align: center;
                        }
                    `}</style>
                </>
            )}
            {/* 모달 */}
            <SearchAddress modalOpen={modalOpen} setData={handleSetAddress} handleOpen={handleCloseModal} />
        </>
    );
}
