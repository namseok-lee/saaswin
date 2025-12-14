import React from 'react';
import { Document, Page } from 'react-pdf';
import styles from '../../../styles/pages/Template/page.module.scss';
import { ComponentState } from 'components/FullDialog/eformsuite/TemplateCreateFullDialog';
import { getPropertyPanelByType } from './ComponentPropertyPanels';

interface RightSidebarProps {
    images: File | null;
    selectedId: string | null;
    components: ComponentState[];
    numPages: number;
    thumbnailScale: number;
    inputTextValues: {
        test1: string;
        test2: string;
        test3: string;
        test4: string;
        test5: string;
    };
    handleTextChange: (id: string, value: string) => void;
    handleTextDelete: (id: string) => void;
    selectedValues: { test1: number[] };
    handleSelectChange: (id: string) => (e: any) => void;
    isChecked1: boolean;
    setIsChecked1: React.Dispatch<React.SetStateAction<boolean>>;
    options: {
        test1: { value: number; label: string }[];
    };
    onComponentUpdate: (id: string, updates: Partial<ComponentState>) => void; // 컴포넌트 업데이트 콜백 추가
}

const RightSidebar: React.FC<RightSidebarProps> = ({
    images,
    selectedId,
    components,
    numPages,
    thumbnailScale,
    onComponentUpdate,
    isChecked1,
    setIsChecked1,
}) => {
    // 선택된 컴포넌트 찾기
    const selectedComponent = selectedId ? components.find((comp) => comp.id === selectedId) : null;

    // 위치 변경 핸들러
    const handlePositionChange = (x: number, y: number) => {
        if (selectedId) {
            onComponentUpdate(selectedId, { x, y });
        }
    };

    // 크기 변경 핸들러
    const handleSizeChange = (width: number, height: number) => {
        if (selectedId) {
            onComponentUpdate(selectedId, { width, height });
        }
    };
    return (
        <div className={`${styles.sideArea}`}>
            {!images ? (
                <div className={styles.pageList}></div>
            ) : selectedComponent ? (
                // 선택된 컴포넌트가 있는 경우: 타입에 맞는 속성 패널 표시
                getPropertyPanelByType(
                    selectedComponent.type,
                    {
                        component: selectedComponent,
                        onComponentUpdate,
                    },
                    handlePositionChange,
                    handleSizeChange,
                    isChecked1,
                    setIsChecked1
                )
            ) : (
                // 컴포넌트가 선택되지 않은 경우: PDF 미리보기 표시
                <div className={styles.pdfPreview}>
                    {/* <div className={styles.tit}>문서 페이지</div> */}
                    <div className={styles.previewWrapper}>
                        {images && numPages > 0 && (
                            <Document
                                file={images}
                                onLoadSuccess={(pdf) => console.log('미리보기 PDF 로드됨')}
                                onLoadError={(error) => console.error('미리보기 PDF 로드 오류:', error)}
                            >
                                {Array.from(new Array(numPages), (el, index) => (
                                    <div
                                        key={`preview-${index}`}
                                        className={`${styles.previewPage}`}
                                        onClick={() => {
                                            // 미리보기 클릭 시 중앙 영역 해당 페이지로 이동
                                            const mainPdfContainer = document.querySelector(`.${styles.pdfViewer}`);
                                            if (mainPdfContainer) {
                                                const targetPage = mainPdfContainer.querySelector(
                                                    `[data-page-number="${index + 1}"]`
                                                )?.parentElement;
                                                if (targetPage) {
                                                    targetPage.scrollIntoView({ behavior: 'smooth' });
                                                }
                                            }
                                        }}
                                    >
                                        <Page
                                            pageNumber={index + 1}
                                            renderTextLayer={false}
                                            renderAnnotationLayer={false}
                                            scale={thumbnailScale}
                                            onRenderError={(error) =>
                                                console.error(`미리보기 페이지 ${index + 1} 렌더링 오류:`, error)
                                            }
                                        />
                                        <div className={styles.pageNumber}>{index + 1}</div>
                                    </div>
                                ))}
                            </Document>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RightSidebar;
