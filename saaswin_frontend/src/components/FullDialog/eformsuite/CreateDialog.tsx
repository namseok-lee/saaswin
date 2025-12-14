'use client';
import { Button, Checkbox, Select, TextareaAutosize, TextField } from '@mui/material';
import SignPopup from 'components/eformsuite/contract/SignPopup';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { Document, Page } from 'react-pdf'; // react-pdf 라이브러리 사용
import styles from '../../../styles/pages/Template/page.module.scss';
import { Label } from '@mui/icons-material';
import UserSelect from 'components/UserSelect';
import OgnzSelect from 'components/eformsuite/contract/OgnzSelect_efs';
import OgnzSelect_efs from 'components/eformsuite/contract/OgnzSelect_efs';

export default function CreateDialog({ data, setData }) {
    const [numPages, setNumPages] = useState<number>(0);
    const canvasRef = useRef<HTMLCanvasElement | null>(null); // 캔버스 참조
    const [canvasDimensions, setCanvasDimensions] = useState<{
        width: number;
        height: number;
    }>({ width: 0, height: 0 });
    const [openSignPopup, setOpenSignPopup] = useState(false); // 사인 팝업 상태

    // 인쇄할 영역을 감싸는 ref (PDF와 컴포넌트들이 렌더링된 영역)
    const printableAreaRef = useRef<HTMLDivElement>(null);

    // 사인할때 사인하려는 컴포넌트의 id
    const [selectedSignId, setSelectedSignId] = useState<string | null>(null);

    const onLoadSuccess = ({ numPages }: { numPages: number }) => {
        // 총 페이지 수 설정
        setNumPages(numPages);
    };
    const onPageLoadSuccess = (pageWidth: number, pageHeight: number, pageNumber: number) => {
        // 페이지 로드 성공 시 canvas의 크기 저장
        setCanvasDimensions({ width: pageWidth, height: pageHeight });
    };

    // 사인 팝업 열기
    const handleOpenSignPopup = () => {
        setOpenSignPopup(true);
    };

    // 사인 팝업 닫기
    const handleCloseSignPopup = () => {
        setOpenSignPopup(false);
    };

    // 사인
    const handleSaveSign = (signImage: string) => {
        setData((prevData) => ({
            ...prevData,
            component_info: prevData.component_info.map((component) =>
                component.type === 'sign' && component.id === selectedSignId ? { ...component, signImage } : component
            ),
        }));
        // selectedSignId를 초기화
        setSelectedSignId(null);
    };

    // 인쇄 버튼 - 각 페이지 컨테이너에 id를 부여하여 개별 캡쳐 후, 하나의 PDF로 결합
    const handlePrint = async () => {
        if (numPages === 0) return;

        let pdf;
        // 페이지마다 순서대로 캡쳐 후 PDF에 추가
        for (let i = 0; i < numPages; i++) {
            const pageElement = document.getElementById(`pdf-page-${i}`);
            if (pageElement) {
                const canvas = await html2canvas(pageElement, {
                    scale: 1, // 해상도 조정 (필요에 따라 조정 - 숫자클수록 좋아짐)
                    // 만약 스크롤에 의해 일부 영역이 잘린다면 아래 옵션 추가 고려:
                    // scrollY: -window.scrollY,
                });
                const imgData = canvas.toDataURL('image/png');

                // 첫 페이지: pdf 인스턴스 생성
                if (i === 0) {
                    pdf = new jsPDF({
                        orientation: 'portrait',
                        unit: 'pt',
                        format: [canvas.width, canvas.height],
                    });
                    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                } else {
                    pdf.addPage([canvas.width, canvas.height], 'portrait');
                    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                }
            }
        }
        if (pdf) {
            pdf.save('document.pdf');
        }
    };

    const handlePreview = () => {};

    // 부서 , 사원 콤보박스 선택
    const handleChange = (id: string, value: string, type: string | null, summaryValue: string | null) => {
        console.log('handleChange id', id);
        console.log('handleChange value', value);
        console.log('handleChange type', type);
        console.log('handleChange summaryValue', summaryValue);
    };

    return (
        <>
            <div className={`${styles.templateWrap} ${styles.templateEditWrap}`}>
                {/* 좌측 */}
                <div className={`${styles.sideArea} ${styles.colGrid}`}>
                    좌측
                    <br />
                    좌<br />
                    측<br />
                    콘<br />
                    텐<br />
                    츠<br />
                    가<br />
                    길<br />
                    어<br />
                    질<br />
                    경<br />
                    우<br />
                    세<br />
                    로<br />
                    스<br />
                    크<br />
                    롤<br />
                    이<br />
                    생<br />
                    깁<br />
                    니<br />
                    다<br />
                    좌<br />
                    측<br />
                    콘<br />
                    텐<br />
                    츠<br />
                    가<br />
                    길<br />
                    어<br />
                    질<br />
                    경<br />
                    우<br />
                    세<br />
                    로<br />
                    스<br />
                    크<br />
                    롤<br />
                    이<br />
                    생<br />
                    깁<br />
                    니<br />
                    다<br />
                </div>
                {/* 중앙 */}
                <div className={`${styles.contentsArea}`}>
                    {/* pdfjs 바인딩 */}
                    <div className={`${styles.pdfViewer}`} ref={printableAreaRef}>
                        {data.file && (
                            <Document file={data.file} onLoadSuccess={onLoadSuccess}>
                                {' '}
                                {/* options={{ cMapUrl: '', cMapPacked:true}} */}
                                {Array.from(new Array(numPages), (el, index) => (
                                    <div
                                        className={styles.pageWrap}
                                        id={`pdf-page-${index}`}
                                        key={index}
                                        style={{
                                            width: canvasDimensions.width,
                                        }}
                                    >
                                        <Page
                                            pageNumber={index + 1}
                                            renderTextLayer={false}
                                            renderAnnotationLayer={false}
                                            canvasRef={canvasRef}
                                            //onLoadSuccess={({ width, height }) => onPageLoadSuccess(width, height, index + 1)}
                                            onLoadSuccess={() => {
                                                if (canvasRef.current) {
                                                    // CSS width가 아닌 canvas의 속성 width를 가져옴 (숫자 값)
                                                    const intrinsicWidth = canvasRef.current.width;
                                                    const intrinsicHeight = canvasRef.current.height;
                                                    onPageLoadSuccess(intrinsicWidth, intrinsicHeight, index + 1);
                                                }
                                            }}
                                        />
                                        {/* 컴포넌트들 */}
                                        {data.component_info
                                            .filter((component) => component.page === index + 1)
                                            .map((component) => (
                                                <div
                                                    key={component.id}
                                                    onClick={
                                                        component.type === 'sign' ? handleOpenSignPopup : undefined
                                                    }
                                                    className={styles.componentContainer}
                                                    style={{
                                                        top: component.y, // 컴포넌트의 Y 좌표
                                                        left: component.x, // 컴포넌트의 X 좌표
                                                        width: component.width, // 컴포넌트의 너비
                                                        height: component.height, // 컴포넌트의 높이
                                                    }}
                                                >
                                                    {component.type === 'textbox' && (
                                                        <TextField
                                                            variant='standard'
                                                            InputProps={{
                                                                disableUnderline: true,
                                                                style: {
                                                                    padding: 0,
                                                                    borderRadius: 0,
                                                                },
                                                            }}
                                                            className={styles.componentItemText}
                                                        />
                                                    )}
                                                    {component.type === 'datepicker' && (
                                                        <input type='date' className={styles.componentItemDatePicker} />
                                                    )}
                                                    {component.type === 'sign' && (
                                                        <img
                                                            // 만약 해당 컴포넌트에 signImage가 없다면 기본 이미지(또는 빈 값)를 보여줍니다.
                                                            src={component.signImage || '/default-sign.png'}
                                                            alt='Sign'
                                                            className={styles.componentItemSign}
                                                            onClick={() => {
                                                                setSelectedSignId(component.id);
                                                                handleOpenSignPopup();
                                                            }}
                                                        />
                                                    )}
                                                    {component.type === 'label' && (
                                                        <label className={styles.componentItemLabel}>레이블</label>
                                                    )}
                                                    {component.type === 'checkbox' && (
                                                        <input
                                                            type='checkbox'
                                                            className={styles.componentItemCheckbox}
                                                        />
                                                    )}
                                                    {component.type === 'number' && (
                                                        <input type='number' className={styles.componentItemNumber} />
                                                    )}
                                                    {component.type === 'combobox' && (
                                                        <select className={styles.componentItemSelect} />
                                                    )}
                                                    {component.type === 'multiline' && (
                                                        <textarea className={styles.componentItemTextarea} />
                                                    )}
                                                    {component.type === 'ognzcombobox' && (
                                                        <OgnzSelect_efs
                                                            item={{
                                                                default: null,
                                                                id: 'ognz_no',
                                                                placeholder: '조직명을 조회하세요',
                                                                required: null,
                                                                seq: '3',
                                                                sqlId: null,
                                                                text: '소속',
                                                                type: 'COM_POPUP_DEPT_UNDER_ORG',
                                                            }}
                                                            handleChange={handleChange}
                                                            selectValue={undefined}
                                                            //selectValue={summaryData[item.id]}
                                                        />
                                                    )}
                                                    {component.type === 'usercombobox' && (
                                                        <TextField
                                                            variant='standard'
                                                            InputProps={{
                                                                disableUnderline: true,
                                                                style: {
                                                                    padding: 0,
                                                                    borderRadius: 0,
                                                                },
                                                            }}
                                                            className={styles.componentItemText}
                                                        />
                                                        // <UserSelect
                                                        //     item={item}
                                                        //     handleChange={handleChange}
                                                        //     selectValue={summaryData[item.id]}
                                                        // />
                                                    )}
                                                </div>
                                            ))}
                                        <style>
                                            {`
                                        .react-pdf__Page__annotations annotationLayer {
                                            display: none;
                                        }
                                        .react-pdf__Page__canvas {
                                            border: solid 1px;
                                            width: auto !important;  /* 크기 설정 */
                                            height: auto !important; /* 비율 유지 */
                                            margin-bottom: 10px;
                                        }
                                    `}
                                        </style>
                                    </div>
                                ))}
                            </Document>
                        )}
                    </div>
                </div>
            </div>

            {/* PDF 출력 버튼 추가 */}
            <Button variant='contained' onClick={handlePrint} style={{ marginLeft: '16px' }}>
                PDF 출력
            </Button>
            {/* 인쇄 */}
            <Button variant='contained' onClick={handlePreview} style={{ marginLeft: '16px' }}>
                PDF미리보기
            </Button>

            {/* 사인 팝업 */}
            <SignPopup open={openSignPopup} onClose={handleCloseSignPopup} onSave={handleSaveSign} />
        </>
    );
}
CreateDialog.propTypes = {
    data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    setData: PropTypes.func,
    updateItem: PropTypes.func,
    handleStep: PropTypes.func,
    handleModalClose: PropTypes.func,
};
