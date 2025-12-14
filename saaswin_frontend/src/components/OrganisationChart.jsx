import React from 'react';
import './OrganisationChart.css';

// Placeholder components for Figma instances (replace with actual implementations)
const Icon = ({ name, className = '', style = {} }) => (
    <div className={`icon icon-${name} ${className}`} style={style}>
        [{name}]
    </div>
);
const Typography = ({ title, children, className = '' }) => (
    <div className={`typography ${className}`}>
        <h3>{title}</h3>
        {children}
    </div>
);
const DatePicker = ({ label, required, placeholder, className = '', style = {} }) => (
    <div className={`input-datepicker ${className}`} style={style}>
        <label>
            {label}
            {required && <span className="required">*</span>}
        </label>
        <input type="text" placeholder={placeholder} disabled />
        <Icon name="calendar" />
    </div>
);
const Select = ({ label, required, placeholder, className = '', style = {} }) => (
    <div className={`input-select ${className}`} style={style}>
        <label>
            {label}
            {required && <span className="required">*</span>}
        </label>
        <input type="text" value={placeholder} disabled />
        <Icon name="arrow_down" />
    </div>
);
const Button = ({ children, className = '', style = {}, iconLeft, iconRight }) => (
    <button className={`button ${className}`} style={style}>
        {iconLeft && <Icon name={iconLeft} />}
        {children}
        {iconRight && <Icon name={iconRight} />}
    </button>
);
const EmptyState = ({ message, className = '', style = {} }) => (
    <div className={`empty-state ${className}`} style={style}>
        <div className="empty-icon">[Empty Icon]</div>
        <p>
            {message.split('\\n').map((line, i) => (
                <span key={i}>
                    {line}
                    <br />
                </span>
            ))}
        </p>
    </div>
);
const ButtonGroup = ({ children, className = '', style = {} }) => (
    <div className={`button-group ${className}`} style={style}>
        {children}
    </div>
);

const Lnb = ({ className = '', style = {} }) => (
    <div className={`lnb ${className}`} style={style}>
        {/* LNB content based on Figma structure */}
        <div className="lnb-fixed">
            <div className="lnb-home">[Logo]</div>
            <div className="lnb-categories">
                <Icon name="search" className="lnb-icon" />
                <Icon name="people" className="lnb-icon active" />
                <Icon name="demography" className="lnb-icon" />
                {/* ... other icons ... */}
                <Icon name="settings" className="lnb-icon" />
                <Icon name="bookmark_add" className="lnb-icon" />
                <Icon name="bento" className="lnb-icon" />
            </div>
            <div className="lnb-profile">[Profile]</div>
        </div>
        <div className="lnb-open">
            <div className="lnb-company">
                <span>회사명</span>
                <Icon name="notifications" />
            </div>
            <div className="lnb-menu-container">
                <div className="lnb-menu-title">인사기획</div>
                <div className="lnb-submenu">
                    <div className="lnb-2depth-item active">
                        조직 관리 <Icon name="arrow_up" />
                    </div>
                    <div className="lnb-3depth-container">
                        <div className="lnb-3depth-item active">· 조직정보</div>
                        <div className="lnb-3depth-item">· 조직도</div>
                        <div className="lnb-3depth-item">· 조직 개편</div>
                        <div className="lnb-3depth-item">· 조직이력</div>
                        <div className="lnb-3depth-item">· 구성원이력</div>
                    </div>
                </div>
                <div className="lnb-submenu">
                    <div className="lnb-2depth-item">
                        구성원 관리 <Icon name="arrow_down" />
                    </div>
                </div>
                <div className="lnb-submenu">
                    <div className="lnb-2depth-item">
                        채용 관리 <Icon name="arrow_down" />
                    </div>
                </div>
                {/* ... other menu items */}
            </div>
        </div>
        <div className="lnb-toggle-btn">[&lt;]</div>
    </div>
);

// --- Main Component ---
const OrganisationChart = () => {
    // Extracted from Figma JSON 'absoluteBoundingBox' for the root FRAME "2740:138985"
    // Using relative positioning for the example instead of absolute on body
    const rootStyle = {
        width: '1920px', // width: 1920
        height: '1080px', // height: 1080
        position: 'relative', // Changed from absolute for embedding
        backgroundColor: '#f0f0f0', // Example background
        overflow: 'hidden', // To contain absolutely positioned children if needed
    };

    return (
        <div className="organisation-chart-container" style={rootStyle}>
            <div className="wrap">
                {' '}
                {/* Corresponds to FRAME "2740:138986" */}
                <div className="lnb-and-content">
                    {' '}
                    {/* Corresponds to FRAME "2740:138987" */}
                    <Lnb /> {/* Corresponds to INSTANCE "2740:139006" */}
                    <div className="main-content-area">
                        {' '}
                        {/* Corresponds to FRAME "2740:138988" */}
                        <div className="content-container">
                            {' '}
                            {/* Corresponds to FRAME "2740:138989" */}
                            <Typography title="조직도" className="page-title">
                                {' '}
                                {/* Corresponds to INSTANCE "2740:138990" */}
                                <Icon name="bookmark" className="title-icon" />
                                <Icon name="help" className="title-icon help-icon" />
                            </Typography>
                            <div className="search-section">
                                {' '}
                                {/* Corresponds to FRAME "2740:138991" */}
                                <div className="search-wrap">
                                    {' '}
                                    {/* Corresponds to FRAME "2740:138992" */}
                                    <div className="search-box">
                                        {' '}
                                        {/* Corresponds to FRAME "2740:138993" */}
                                        <div className="search-columns">
                                            {' '}
                                            {/* Corresponds to FRAME "2740:138994" */}
                                            <DatePicker
                                                label="기준일"
                                                required
                                                placeholder="YYYY.MM.DD"
                                                className="search-column"
                                            />{' '}
                                            {/* Corresponds to INSTANCE "2740:138996" */}
                                            <Select
                                                label="보기방식"
                                                required
                                                placeholder="선택하지 않음"
                                                className="search-column"
                                            />{' '}
                                            {/* Corresponds to INSTANCE "2740:138998" */}
                                            <Select
                                                label="인원 수"
                                                required
                                                placeholder="전체"
                                                className="search-column"
                                            />{' '}
                                            {/* Corresponds to INSTANCE "2740:139000" */}
                                            <div className="search-button-wrap">
                                                {' '}
                                                {/* Corresponds to FRAME "2740:139001" */}
                                                <Button className="search-button">조회</Button>{' '}
                                                {/* Corresponds to INSTANCE "2740:139002" */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Search Icon - Maybe a toggle? FRAME "2740:139003" */}
                            </div>
                            <div className="content-display">
                                {' '}
                                {/* Corresponds to FRAME "2740:139004" */}
                                {/* Background pattern FRAME "2743:142367" - handled by CSS */}
                                <div className="empty-state-wrap">
                                    {' '}
                                    {/* Corresponds to FRAME "2743:141220" */}
                                    <EmptyState message={'아직 생성된 조직이 없습니다.\n조직을 등록해보세요.'} />{' '}
                                    {/* Corresponds to INSTANCE "2740:140567" */}
                                    <ButtonGroup className="empty-buttons">
                                        {' '}
                                        {/* Corresponds to INSTANCE "2743:141168" */}
                                        <Button className="link-button">조직 기준 설정 바로가기</Button>
                                        <Button className="link-button">조직 최초 등록 바로가기</Button>
                                    </ButtonGroup>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Drawer FRAME "2740:139009" - Would typically be conditionally rendered */}
                    {/* <Drawer /> */}
                </div>
            </div>
            {/* Notifications and Snackbars - Typically handled globally */}
            {/* INSTANCE "2740:139007", INSTANCE "2740:139008" */}
        </div>
    );
};

export default OrganisationChart;
