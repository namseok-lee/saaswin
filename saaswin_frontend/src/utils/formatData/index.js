// 근무년수 계산 함수
export const calculateYmd = (startDateStr) => {
    // YYYYMMDD 형식의 문자열을 Date 객체로 변환
    const year = parseInt(startDateStr.substring(0, 4), 10);
    const month = parseInt(startDateStr.substring(4, 6), 10) - 1; // 월은 0부터 시작
    const day = parseInt(startDateStr.substring(6, 8), 10);

    const startDate = new Date(year, month, day);
    const currentDate = new Date();

    let diffYear = currentDate.getFullYear() - startDate.getFullYear();
    let diffMonth = currentDate.getMonth() - startDate.getMonth();
    let diffDay = currentDate.getDate() - startDate.getDate();

    // 일 수가 음수일 때, 이전 달에서 일 수를 빌려오기
    if (diffDay < 0) {
        diffMonth -= 1;
        const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        diffDay += previousMonth.getDate();
    }

    // 월 수가 음수일 때, 이전 연도에서 월 수를 빌려오기
    if (diffMonth < 0) {
        diffYear -= 1;
        diffMonth += 12;
    }

    return `${diffYear}년 ${diffMonth}개월 ${diffDay}일`;
};

// 주민번호로 만나이, 생년월일 조회
export const getBirthInfo = (residentNumber, type) => {
    // 입력 형식 검증 (13자리 숫자)
    const regex = /^\d{13}$/;
    if (!regex.test(residentNumber)) {
        console.error('올바른 주민등록번호 형식이 아닙니다.');
        return null;
    }

    // 생년월일과 성별 코드 추출
    const birthPart = residentNumber.slice(0, 6); // 앞 6자리 YYMMDD
    const genderCode = parseInt(residentNumber.charAt(6), 10); // 7번째 자리 성별 코드

    const year = parseInt(birthPart.slice(0, 2), 10);
    const month = parseInt(birthPart.slice(2, 4), 10);
    const day = parseInt(birthPart.slice(4, 6), 10);

    // 출생 연도 계산
    let fullYear;
    if (genderCode === 1 || genderCode === 2) {
        fullYear = 1900 + year;
    } else if (genderCode === 3 || genderCode === 4) {
        fullYear = 2000 + year;
    } else if (genderCode === 5 || genderCode === 6) {
        fullYear = 1900 + year; // 외국인 등록번호일 경우 추가
    } else {
        console.error('유효하지 않은 성별 코드입니다.');
        return null;
    }

    // 타입에 따라 반환 값 결정
    if (type === 'age') {
        // 현재 날짜
        const today = new Date();
        const birthDate = new Date(fullYear, month - 1, day);

        // 만 나이 계산
        let age = today.getFullYear() - birthDate.getFullYear();
        if (
            today.getMonth() < birthDate.getMonth() ||
            (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
        ) {
            age--;
        }

        return age;
    } else if (type === 'birthDate' || type === undefined) {
        return `${fullYear}년 ${month.toString().padStart(2, '0')}월 ${day.toString().padStart(2, '0')}일`;
    }

    return null;
};

// 전화번호 3-4-4 포맷
export const formatPhoneNumber = (phoneNumber) => {
    // 전화번호가 11자리인지 확인
    if (!phoneNumber || phoneNumber.length !== 11) {
        return phoneNumber; // 유효하지 않은 경우 그대로 반환
    }

    // 3-4-4 형식으로 변환
    return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 7)}-${phoneNumber.slice(7)}`;
};

// 주민번호 마스킹 함수
export const maskRrno = (rrno) => {
    if (!rrno || rrno.length !== 13) return rrno; // 유효성 검사
    const front = rrno.slice(0, 6); // 앞자리 6자리
    const back = rrno.slice(6); // 뒷자리 7자리
    const maskedBack = back[0] + '*'.repeat(back.length - 1); // 첫 글자 제외 마스킹
    return `${front}-${maskedBack}`; // 마스킹된 주민번호 반환
};

// 경력 - Y년 M개월 계산
export const calculateWorkDuration = (start, end) => {
    if (!start || !end) return '기간 정보 없음';

    // YYYY.MM 형식에서 연도와 월을 분리
    const [startYear, startMonth] = start.split('.').map(Number);
    const [endYear, endMonth] = end.split('.').map(Number);

    // 유효성 검사
    if (isNaN(startYear) || isNaN(startMonth) || isNaN(endYear) || isNaN(endMonth)) {
        return '유효하지 않은 날짜';
    }

    // 총 개월 수 계산
    let totalMonths = (endYear - startYear) * 12 + (endMonth - startMonth);

    // 연도와 월로 변환
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    return `${years}년 ${months}개월`;
};
