'use client';

import { useState } from 'react';
import styles from '../../styles/pages/Demo/page.module.scss';
import '../../styles/styles.scss';
import BadgeEx from './badge';
import ButtonsEx from './buttonsEx';
import ChipsEx from './chipsEx';
import DatePickerEx from './datePickerEx';
import InputCheckboxEx from './inputcheckboxEx';
import InputPasswordEx from './inputPasswordEx';
import InputRadioEx from './inputRadioEx';
import InputSearchEx from './inputSearchEx';
import InputTextBasicEx from './inputTextBasicEx';
import DemoMenu from './menu';
import SelectboxEx from './selectboxEx';
import SwitchEx from './switch';
import TypographyEx from './typography';
import TooltipEx from './tooltipEx';
import EmptyEx from './emptyEx';
import SnackbarEx from './snackbarEx';
import NotificationEx from './notificationEx';
import CardEx from './cardEx';
import ModalEx from './modalEx';
import InputNumberEx from './inputNumber';
const DemoPage = () => {
    const [comp, setComp] = useState(0);

    const handleMenuClick = (index: number) => {
        setComp(index);
    };

    const renderComp = () => {
        switch (comp) {
            case 0:
                return <InputTextBasicEx />;
            case 1:
                return <InputSearchEx />;
            case 2:
                return <InputPasswordEx />;
            case 3:
                return <DatePickerEx />;
            case 4:
                return <InputNumberEx />;
            case 5:
                return <SelectboxEx />;
            case 6:
                return <InputCheckboxEx />;
            case 7:
                return <InputRadioEx />;
            case 8:
                return <ButtonsEx />;
            case 9:
                return <SwitchEx />;
            case 10:
                return <TypographyEx />;
            case 11:
                return <BadgeEx />;
            case 12:
                return <ChipsEx />;
            case 14:
                return <TooltipEx />;
            case 15:
                return <EmptyEx />;
            case 17:
                return <SnackbarEx />;
            case 18:
                return <NotificationEx />;
            case 20:
                return <CardEx />;
            case 22:
                return <ModalEx />;
            default:
                return null;
        }
    };

    return (
        <>
            <div className={styles.demo}>
                <div className={styles.wrap}>
                    {/* menu */}
                    <DemoMenu onMenuClick={handleMenuClick} />
                    {/* contents */}
                    <div className={styles.contents}>
                        <div className={styles.contentsWrap}>{renderComp()}</div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DemoPage;
