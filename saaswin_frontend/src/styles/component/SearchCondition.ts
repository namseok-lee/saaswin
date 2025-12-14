import { css } from '@mui/material/styles';

export const TypographyStyles = (customStyles?: string) => css`
    margin-right: 20px;
    width: 100px;
    height: 30px;
    padding: 0px;
    align-content: center;
    font-weight: 800;
    text-align: end;
    ${customStyles};
`;

export const BoxStyles = (customStyles?: string) => css`
    display: flex;
    width: 420px;
    height: auto;
    align-items: center;
    ${customStyles};
`;

export const DatePickerStyles = (customStyles?: string) => css`
    background: white;
    width: 300px;
    height: 40px; // 원하는 높이 설정

    & .MuiInputBase-root {
        height: 100%; // InputBase 높이 설정
    }
    ${customStyles};
`;

export const formControlStyle = (customStyles?: string) => css`
    width: 300px; /* FormControl의 너비 설정 */
    height: 30px; /* FormControl의 높이 설정 */

    .MuiInputLabel-root {
        font-size: 0.875rem; /* 라벨의 폰트 크기 조정 */
        top: 50%; /* 라벨을 수직 가운데로 위치시킴 */
        transform: translate(14px, -50%) scale(1); /* 라벨의 위치 및 크기 조정 */
    }

    .MuiOutlinedInput-root {
        height: 100%; /* Input의 높이를 부모와 동일하게 설정 */
        padding: 0 8px; /* 좌우 패딩 설정 */
    }

    .MuiOutlinedInput-input {
        padding: 4px 10px; /* 내부 텍스트 패딩 조정 */
        height: 100%; /* 텍스트 입력 영역의 높이를 부모와 동일하게 설정 */
        font-size: 0.875rem; /* 텍스트 폰트 크기 조정 */
    }

    .MuiSelect-select {
        padding: 0; /* Select의 패딩 제거 */
    }

    .MuiOutlinedInput-notchedOutline {
        border-color: #ccc; /* 테두리 색상 설정 */
    }

    &:hover .MuiOutlinedInput-notchedOutline {
        border-color: #888; /* 호버 시 테두리 색상 변경 */
    }

    &.Mui-focused .MuiOutlinedInput-notchedOutline {
        border-color: #3f51b5; /* 포커스 시 테두리 색상 변경 */
    }

    ${customStyles};
`;
