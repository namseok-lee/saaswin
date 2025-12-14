export function drawPolyline(mapInstance, path, existingPolylineRef) {
    if (existingPolylineRef.current) {
        // 기존 폴리라인 제거
        existingPolylineRef.current.setMap(null);
    }

    // 경로 좌표 변환 -> 네이버에서 사용하는 방식으로
    const polylinePath = path.map(([lng, lat]) => new window.naver.maps.LatLng(lat, lng));

    // 폴리라인 옵션
    const polylineOptions = {
        map: mapInstance,
        path: polylinePath,
        strokeColor: '#E16E79',
        strokeOpacity: 0.9,
        strokeWeight: 4,
    };

    // 새 폴리라인 생성
    existingPolylineRef.current = new window.naver.maps.Polyline(polylineOptions);

    // 지도 범위 조정
    const bounds = new window.naver.maps.LatLngBounds(); // 경계를 설정하는 객체
    polylinePath.forEach((latLng) => bounds.extend(latLng)); // 각 좌표 범위에 포함
    mapInstance.fitBounds(bounds); // 폴리라인 화면에 맞게 자동으로 이동
}
