'use client';
import React from 'react';
import { Rnd } from 'react-rnd';
import { Document, Page } from 'react-pdf';
import { TextField, IconButton, Tooltip } from '@mui/material';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import { IcoSignature, IcoAttachFile } from '@/assets/Icon';
import Button from 'components/Button';
import BoxSelect from 'components/BoxSelect';
import styles from '../../../styles/pages/Template/page.module.scss';

interface ComponentState {
    id: string;
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
    type: string;
}

interface CenterContentProps {
    images: File | null;
    numPages: number;
    components: ComponentState[];
    selectedId: string | null;
    isCreating: boolean;
    currentComponent: Partial<ComponentState> | null;
    handleMouseDown: (e: React.MouseEvent, pageNumber: number) => void;
    handleSelect: (id: string) => void;
    handleResize: (id: string, width: number, height: number, x: number, y: number) => void;
    handleDrag: (id: string, x: number, y: number) => void;
    onTemplatePreview: () => void;
    onTemplateSubmit: () => void;
    canvasRef: React.RefObject<HTMLCanvasElement>;
    onPageLoadSuccess: (width: number, height: number, pageNumber: number) => void;
    onLoadSuccess: ({ numPages }: { numPages: number }) => void;
    fontSize: number;
    fontFamily: string;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    alignment: 'left' | 'center' | 'right';
    handleDecrement: () => void;
    handleFontSizeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleIncrement: () => void;
    handleFontFamilyChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    toggleBold: () => void;
    toggleItalic: () => void;
    toggleUnderline: () => void;
    handleAlignLeft: () => void;
    handleAlignCenter: () => void;
    handleAlignRight: () => void;
    FONT_FAMILY_OPTIONS: { value: string; label: string }[];
    documentScale: number;
    handleDocumentScaleChange: (scale: number) => void;
}

const CenterContent: React.FC<CenterContentProps> = ({
    images,
    numPages,
    components,
    selectedId,
    isCreating,
    currentComponent,
    handleMouseDown,
    handleSelect,
    handleResize,
    handleDrag,
    onTemplatePreview,
    onTemplateSubmit,
    canvasRef,
    onPageLoadSuccess,
    onLoadSuccess,
    fontSize,
    fontFamily,
    bold,
    italic,
    underline,
    alignment,
    handleDecrement,
    handleFontSizeChange,
    handleIncrement,
    handleFontFamilyChange,
    toggleBold,
    toggleItalic,
    toggleUnderline,
    handleAlignLeft,
    handleAlignCenter,
    handleAlignRight,
    FONT_FAMILY_OPTIONS,
    documentScale,
    handleDocumentScaleChange,
}) => {
    return (
        <div className={`${styles.contentsArea}`}>
            {/* PDF 에디터 옵션 헤더 */}
            {images && (
                <div className={styles.docEditor}>
                    {/* 문서배율 */}
                    <div className={styles.ratio}>
                        <BoxSelect
                            id='documentScale'
                            value={documentScale}
                            onChange={(e) => {
                                const scale = parseFloat(e.target.value);
                                handleDocumentScaleChange(scale);
                            }}
                            options={[
                                { value: 0.75, label: '75%' },
                                { value: 0.9, label: '90%' },
                                { value: 1, label: '100%' },
                                { value: 1.25, label: '125%' },
                                { value: 1.5, label: '150%' },
                            ]}
                            color='white'
                            validationText=''
                        />
                    </div>

                    {/* 버튼 */}
                    <div className={styles.btns}>
                        <Button type='default' size='md' onClick={() => onTemplateSubmit(true)}>
                            임시저장
                        </Button>
                        <Button type='primary' size='md' onClick={onTemplatePreview}>
                            미리보기
                        </Button>
                    </div>
                </div>
            )}

            {/* PDF 뷰어 */}
            <div className={styles.pdfViewer}>
                {images && (
                    <Document
                        file={images}
                        onLoadSuccess={onLoadSuccess}
                        onLoadError={(error) => console.error('PDF 로드 오류:', error)}
                    >
                        {Array.from(new Array(numPages), (el, index) => (
                            <div key={index} className={styles.pageWrap}>
                                <Page
                                    pageNumber={index + 1}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                    canvasRef={canvasRef}
                                    scale={documentScale}
                                    onLoadSuccess={() => {
                                        console.log(`Page ${index + 1} loaded`);
                                        if (canvasRef.current) {
                                            const intrinsicWidth = canvasRef.current.width;
                                            const intrinsicHeight = canvasRef.current.height;
                                            onPageLoadSuccess(intrinsicWidth, intrinsicHeight, index + 1);
                                        }
                                    }}
                                    onRenderError={(error) => console.error(`페이지 렌더링 오류: ${error}`)}
                                />

                                {/* 드래그 가능한 컴포넌트들 */}
                                {components
                                    .filter((component) => component.page === index + 1)
                                    .map((component) => (
                                        <Rnd
                                            key={component.id}
                                            default={{
                                                x: component.x,
                                                y: component.y,
                                                width: component.width,
                                                height: component.height,
                                            }}
                                            position={{ x: component.x, y: component.y }} // 위치 값을 직접 제어
                                            size={{ width: component.width, height: component.height }} // 크기 값을 직접 제어
                                            minWidth={10}
                                            minHeight={10}
                                            maxWidth={500}
                                            maxHeight={300}
                                            bounds='parent'
                                            onResizeStop={(e, direction, ref, delta, position) => {
                                                handleResize(
                                                    component.id,
                                                    ref.offsetWidth,
                                                    ref.offsetHeight,
                                                    position.x,
                                                    position.y
                                                );
                                            }}
                                            onDragStop={(e, data) => {
                                                handleDrag(component.id, data.x, data.y);
                                            }}
                                            onClick={() => handleSelect(component.id)}
                                            style={{
                                                border:
                                                    component.id === selectedId
                                                        ? '1px dashed #010101'
                                                        : '1px solid #E33131',
                                            }}
                                            className={styles.rnd}
                                            resizeHandleComponent={{
                                                topRight: component.id === selectedId && (
                                                    <div className={styles.point} />
                                                ),
                                                bottomRight: component.id === selectedId && (
                                                    <div className={styles.point} />
                                                ),
                                                bottomLeft: component.id === selectedId && (
                                                    <div className={styles.point} />
                                                ),
                                                topLeft: component.id === selectedId && (
                                                    <div className={styles.point} />
                                                ),
                                            }}
                                            resizeHandleStyles={{
                                                topRight: { top: '-4px', right: '-16px' },
                                                bottomRight: { right: '-16px', bottom: '-16px' },
                                                bottomLeft: { left: '-2px', bottom: '-16px' },
                                                topLeft: { top: '-4px', left: '-2px' },
                                            }}
                                        >
                                            {/* 컴포넌트 타입별 렌더링 */}
                                            <div className={styles.componentContainer}>
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
                                                    <IcoSignature className={styles.componentItemSign} />
                                                )}
                                                {component.type === 'label' && <label>레이블</label>}
                                                {component.type === 'checkbox' && <input type='checkbox' />}
                                                {component.type === 'radio' && <input type='radio' />}
                                                {component.type === 'number' && (
                                                    <input type='number' className={styles.componentItemNumber} />
                                                )}
                                                {component.type === 'combobox' && <select />}
                                                {component.type === 'file' && (
                                                    <div className={styles.componentItemAttachFile}>
                                                        <IcoAttachFile />
                                                    </div>
                                                )}
                                                {component.type === 'multiline' && (
                                                    <textarea className={styles.componentItemTextarea} />
                                                )}
                                            </div>
                                        </Rnd>
                                    ))}
                                <style>
                                    {`
                                    .react-pdf__Page__annotations annotationLayer {
                                        display: none;
                                    }
                                    .react-pdf__Page__canvas {
                                        border: solid 1px;
                                        width: auto !important;
                                        height: auto !important;
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
    );
};

export default CenterContent;
