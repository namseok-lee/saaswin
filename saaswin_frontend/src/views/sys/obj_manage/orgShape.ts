import { dia, ui } from '@joint/plus';
import { VALIDATION_MESSAGES } from './utils/constants';
// 칩 스타일 정의
const chipStyle = {
    width: 88,
    height: 20,
    fill: '##37AE34',
    stroke: '##37AE34',
    rx: 10,
    ry: 10,
    x: 60,
    y: 55,
};

// 칩 텍스트 스타일 정의
const chipTextStyle = {
    fontFamily: 'Montserrat',
    fontWeight: 500,
    fontSize: 12,
    lineHeight: 12,
    fill: '#565656',
    textAnchor: 'middle',
    textVerticalAnchor: 'middle',
};

// 경고 아이콘 스타일 정의
const warningIconStyle = {
    width: 26,
    height: 26,
    r: 10,
    x: 15,
    y: 15,
    fill: '#e33131',
    stroke: '#FFF',
    strokeWidth: 1,
};

// 경고 아이콘 텍스트 스타일 정의
const warningIconTextStyle = {
    fontFamily: 'Montserrat',
    fontWeight: 700,
    fontSize: 12,
    textAnchor: 'middle',
    textVerticalAnchor: 'middle',
    fill: '#FFF',
    text: '!',
};

// 브라우저 환경에서만 실행
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    new ui.Tooltip({
        rootTarget: 'body', // 이벤트 위임을 위한 루트 타겟 설정
        target: '[data-tooltip]',
        padding: 10,
    });
}

// Label , description, chip이 있는 카드
export const Member = dia.Element.define(
    'Member',
    {
        size: { width: 200, height: 103 },
        // 접힘 상태 추적을 위한 속성 추가
        isCollapsed: false,
        hasChildren: false,
        attrs: {
            root: {
                ref: 'root',
                refWidth: '100%',
                refHeight: '100%',
                fill: '#FFFFFF',
                stroke: '#E2E2E2',
                strokeWidth: 1,
                rx: 4,
                ry: 4,
                cursor: 'pointer',
                ':hover': {
                    stroke: 'var(--primary)',
                },
            },
            body: {
                width: 'calc(w)',
                height: 'calc(h)',
                fill: '#FFFFFF',
                stroke: '#E2E2E2',
                rx: 4,
                ry: 4,
            },
            label: {
                x: 'calc(w/2)',
                y: '26',
                textAnchor: 'middle',
                textVerticalAnchor: 'middle',
                fontFamily: 'Montserrat',
                fontWeight: 600,
                fontSize: 14,
                lineHeight: 21,
                fill: '#241332',
                text: 'Label',
                stroke: 'none',
                strokeWidth: 0,
                paintOrder: 'fill',
            },
            description: {
                x: 'calc(w/2)',
                y: '47',
                textAnchor: 'middle',
                textVerticalAnchor: 'middle',
                fontFamily: 'Montserrat',
                fontWeight: 700,
                fontSize: 13,
                lineHeight: 20,
                fill: '#565656',
                text: 'Description',
                stroke: 'none',
                strokeWidth: 0,
                paintOrder: 'fill',
            },
            // 칩 컨테이너 추가
            chipContainer: {
                transform: 'translate(0, 0)', // transform 제거
                cursor: 'pointer',
            },
            // 칩 배경 추가
            chip: {
                ...chipStyle,
                x: 'calc(w/2 - 44)', // 가운데 정렬 (200/2 - 88/2 = 56)
                y: '65',
                fill: '#FFFFFF',
                stroke: '#D9D9D999',
            },
            // 칩 텍스트 추가
            chipText: {
                ...chipTextStyle,
                x: 'calc(w/2)', // 정가운데 위치
                y: '75',
                text: '직무/직급',
                stroke: 'none',
                strokeWidth: 0,
                paintOrder: 'fill',
            },
            // 경고 아이콘 컨테이너 추가
            warningContainer: {
                display: 'none', // 기본적으로 숨김
                cursor: 'pointer',
                'data-tooltip': VALIDATION_MESSAGES.REQUIRED_FIELD,
                'data-tooltip-position': 'top',
                pointerEvents: 'none', // 마우스 이벤트를 캡처하지 않도록 설정
                z: 20, // 다른 요소보다 위에 표시
                transform: 'translate(0,0)', // 좌측 상단에 위치
            },
            // 경고 아이콘 추가
            warningIcon: {
                ...warningIconStyle,
                transform: 'translate(0, 0)', // transform 제거
            },
            // 경고 아이콘 텍스트 추가
            warningIconText: {
                ...warningIconTextStyle,
                fontFamily: 'Montserrat',
                fontWeight: 700,
                fontSize: 14,
                textAnchor: 'middle',
                textVerticalAnchor: 'middle',
                fill: '#FFF',
                stroke: 'none',
                text: '!',
                x: 0,
                y: 0,
            },
            // 접기/펼치기 버튼 추가
            toggleButton: {
                class: 'toggle-button',
                cursor: 'pointer',
                fill: '#FFFFFF',
                stroke: '#E2E2E2',
                event: 'element:toggle',
                transform: 'translate(calc(w - 4), calc(h - 55))',
                z: 10,
                'data-tooltip': '접기/펼치기',
                'data-tooltip-position': 'left',
                display: 'none', // 자식이 있을 때만 표시 (기본값은 숨김)
            },
            toggleButtonBody: {
                width: 20,
                height: 20,
                rx: 20,
                ry: 20,
                x: -7,
                y: -6,
            },
            toggleButtonIcon: {
                d: 'M6.04152 8.05731L0.455078 4.50131L6.04152 0.945312V8.05731Z', // 왼쪽 화살표
                fill: '#666666',
                stroke: '#666666',
            },
            toggleButtonIconExpanded: {
                d: 'M0.945312 8.05731L6.53176 4.50131L0.945312 0.945312V8.05731Z', // 오른쪽 화살표
                fill: '#666666',
                stroke: '#666666',
            },
            draggable: false,
            // 입력 상태 아이콘 추가
            inputStatusIcon: {
                width: 200,
                height: 6,
                fill: 'none',
                transform: 'translate(0, 97)', // 카드 하단에 위치
                display: 'none', // 기본적으로 숨김
            },
            inputStatusIconBg: {
                d: 'M0 0.00195312H200V0.00195312C200 3.31566 197.314 6.00195 194 6.00195H6C2.68629 6.00195 0 3.31566 0 0.00195312V0.00195312Z',
                fill: '#37AE34',
            },
            inputStatusIconPlus: {
                width: 26,
                height: 26,
                transform: 'translate(160, 10)',
                display: 'none',
            },
            inputStatusIconPlusBg: {
                d: 'M0 13.002C0 5.82225 5.8203 0.00195312 13 0.00195312C20.1797 0.00195312 26 5.82225 26 13.002C26 20.1817 20.1797 26.002 13 26.002C5.8203 26.002 0 20.1817 0 13.002Z',
                fill: '#37AE34',
                fillOpacity: 0.03,
            },
            inputStatusIconPlusSymbol: {
                d: 'M12.1875 13.8144H5.95836V12.1895H12.1875V5.96031H13.8125V12.1895H20.0416V13.8144H13.8125V20.0436H12.1875V13.8144Z',
                fill: '#37AE34',
            },
            // 수정 상태 아이콘 추가
            updateStatusIcon: {
                width: 200,
                height: 6,
                fill: 'none',
                transform: 'translate(0, 97)', // 카드 하단에 위치
                display: 'none', // 기본적으로 숨김
            },
            updateStatusIconBg: {
                d: 'M0 0.00195312H200V0.00195312C200 3.31566 197.314 6.00195 194 6.00195H6C2.68629 6.00195 0 3.31566 0 0.00195312V0.00195312Z',
                fill: '#FFA830',
            },
            // 업데이트 아이콘 추가
            updateStatusIconUpdate: {
                width: 26,
                height: 26,
                transform: 'translate(160, 10)',
                display: 'none',
            },
            updateStatusIconUpdateBg: {
                d: 'M0 13.6699C0 6.49022 5.8203 0.669922 13 0.669922C20.1797 0.669922 26 6.49022 26 13.6699C26 20.8496 20.1797 26.6699 13 26.6699C5.8203 26.6699 0 20.8496 0 13.6699Z',
                fill: '#FFA830',
                fillOpacity: 0.03,
            },
            updateStatusIconUpdateSymbol: {
                d: 'M13.0641 21.0238L15.9122 18.1925L13.0641 15.3612L12.156 16.2696L13.4872 17.6007C12.815 17.6119 12.1962 17.522 11.6309 17.331C11.0656 17.1401 10.5899 16.8516 10.2039 16.4654C9.82181 16.0835 9.53256 15.6474 9.33611 15.157C9.13967 14.6668 9.04145 14.1766 9.04145 13.6864C9.04145 13.3794 9.07855 13.0725 9.15276 12.7656C9.22715 12.4586 9.33304 12.1641 9.47045 11.8821L8.5079 10.9613C8.24971 11.378 8.05877 11.8151 7.93509 12.2726C7.81141 12.7302 7.74957 13.1958 7.74957 13.6696C7.74957 14.3346 7.87984 14.9907 8.14038 15.638C8.40074 16.2855 8.78406 16.8641 9.29034 17.3738C9.79662 17.8835 10.4112 18.264 11.1342 18.5153C11.8569 18.7669 12.5997 18.8981 13.3623 18.9091L12.156 20.1154L13.0641 21.0238ZM17.5017 16.3779C17.7601 15.9612 17.951 15.5241 18.0745 15.0666C18.1982 14.609 18.2601 14.1434 18.2601 13.6696C18.2601 13.0059 18.1326 12.3464 17.8777 11.6912C17.6229 11.0361 17.2407 10.4553 16.7309 9.94889C16.2281 9.43918 15.6118 9.06137 14.882 8.81545C14.1522 8.56953 13.4074 8.44658 12.6476 8.44658L13.8539 7.22376L12.9455 6.31539L10.0977 9.14668L12.9455 11.978L13.8539 11.0696L12.5059 9.72166C13.167 9.72166 13.7885 9.81988 14.3706 10.0163C14.9526 10.2129 15.432 10.5 15.809 10.8776C16.186 11.2553 16.4736 11.6895 16.6716 12.1803C16.8695 12.6712 16.9685 13.1621 16.9685 13.6528C16.9685 13.9597 16.9313 14.2667 16.8569 14.5736C16.7827 14.8806 16.6768 15.1751 16.5392 15.4571L17.5017 16.3779ZM13.0016 23.9613C11.5781 23.9613 10.2401 23.6912 8.98755 23.1509C7.73503 22.6107 6.64556 21.8776 5.71913 20.9515C4.7927 20.0254 4.0592 18.9364 3.51861 17.6844C2.97821 16.4325 2.70801 15.0948 2.70801 13.6715C2.70801 12.248 2.97812 10.91 3.51834 9.65747C4.05856 8.40496 4.79171 7.31548 5.71778 6.38905C6.64385 5.46262 7.73287 4.72912 8.98484 4.18853C10.2368 3.64813 11.5745 3.37793 12.9978 3.37793C14.4213 3.37793 15.7593 3.64804 17.0118 4.18826C18.2643 4.72848 19.3538 5.46163 20.2802 6.3877C21.2066 7.31377 21.9402 8.40279 22.4807 9.65476C23.0211 10.9067 23.2913 12.2444 23.2913 13.6677C23.2913 15.0912 23.0212 16.4292 22.481 17.6817C21.9408 18.9342 21.2076 20.0237 20.2816 20.9501C19.3555 21.8766 18.2665 22.6101 17.0145 23.1507C15.7625 23.6911 14.4249 23.9613 13.0016 23.9613ZM12.9997 22.3363C15.4191 22.3363 17.4684 21.4967 19.1476 19.8175C20.8268 18.1383 21.6663 16.089 21.6663 13.6696C21.6663 11.2502 20.8268 9.20085 19.1476 7.52168C17.4684 5.84251 15.4191 5.00293 12.9997 5.00293C10.5802 5.00293 8.53092 5.84251 6.85176 7.52168C5.17259 9.20085 4.33301 11.2502 4.33301 13.6696C4.33301 16.089 5.17259 18.1383 6.85176 19.8175C8.53092 21.4967 10.5802 22.3363 12.9997 22.3363Z',
                fill: '#FFA830',
            },
        },
        markup: [
            {
                tagName: 'rect',
                selector: 'body',
            },
            {
                tagName: 'text',
                selector: 'label',
            },
            // 칩 요소 마크업 추가
            {
                tagName: 'g',
                selector: 'chipContainer',
                children: [
                    {
                        tagName: 'rect',
                        selector: 'chip',
                    },
                    {
                        tagName: 'text',
                        selector: 'chipText',
                    },
                ],
            },
            // 경고 아이콘 마크업 추가
            {
                tagName: 'g',
                selector: 'warningContainer',
                children: [
                    {
                        tagName: 'circle',
                        selector: 'warningIcon',
                    },
                    {
                        tagName: 'text',
                        selector: 'warningIconText',
                    },
                ],
            },
            {
                tagName: 'text',
                selector: 'description',
            },

            // 접기/펼치기 버튼 마크업 추가
            {
                tagName: 'g',
                selector: 'toggleButton',
                children: [
                    {
                        tagName: 'rect',
                        selector: 'toggleButtonBody',
                    },
                    {
                        tagName: 'path',
                        selector: 'toggleButtonIcon',
                    },
                ],
            },
            // 마크업에 입력 상태 아이콘 추가
            {
                tagName: 'g',
                selector: 'inputStatusIcon',
                children: [
                    {
                        tagName: 'path',
                        selector: 'inputStatusIconBg',
                    },
                ],
            },
            {
                tagName: 'g',
                selector: 'inputStatusIconPlus',
                children: [
                    {
                        tagName: 'path',
                        selector: 'inputStatusIconPlusBg',
                    },
                    {
                        tagName: 'path',
                        selector: 'inputStatusIconPlusSymbol',
                    },
                ],
            },
            // 수정 상태 아이콘 마크업 추가
            {
                tagName: 'g',
                selector: 'updateStatusIcon',
                children: [
                    {
                        tagName: 'path',
                        selector: 'updateStatusIconBg',
                    },
                ],
            },
            {
                tagName: 'g',
                selector: 'updateStatusIconUpdate',
                children: [
                    {
                        tagName: 'path',
                        selector: 'updateStatusIconUpdateBg',
                    },
                    {
                        tagName: 'path',
                        selector: 'updateStatusIconUpdateSymbol',
                    },
                ],
            },
        ],
    },
    {}
);

export const Link = dia.Link.define(
    'Link',
    {
        z: -1,
        connector: {
            name: 'normal',
            args: {
                radius: 0, // 모서리 없이 직선으로
            },
        },
        attrs: {
            root: {
                cursor: 'pointer',
            },

            line: {
                fill: 'none',
                connection: true,
                stroke: '#78849E',
                strokeWidth: 1,
            },
        },
    },
    {
        markup: [
            {
                tagName: 'path',
                selector: 'line',
            },
        ],
    }
);
