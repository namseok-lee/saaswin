import { LicenseInfo } from '@mui/x-license';
import SwDateCalendar from 'components/DateCalendar';
import SwDatePicker from 'components/DatePicker';
import SwDateRangePicker from 'components/DateRangePicker';
import SwDateTimePicker from 'components/DateTimePicker';
import SwDigitalClock from 'components/DigitalClock';
import SwMonthCalendar from 'components/MonthCalendar';
import SwMonthYearCalendar from 'components/MonthYearCalendar';
import SwTimePicker from 'components/TimePicker';
import SwTimeRangePicker from 'components/TimeRangePicker';
import SwYearCalendar from 'components/YearCalendar';
import styles from '../../styles/pages/Demo/page.module.scss';
import dayjs, { Dayjs } from 'dayjs';
import { useState } from 'react';

const DatePickerEx = () => {
    LicenseInfo.setLicenseKey(process.env.NEXT_PUBLIC_MUI_LICENSE_KEY);

    const [value, setValue] = useState<Dayjs | null>(dayjs('2022-04-17'));

    return (
        <>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}>datepicker</div>
            <div className={`${styles.col} ${styles.title}`}>date range picker</div>
            <div className={`${styles.col} ${styles.title}`}>time picker</div>
            <div className={`${styles.col} ${styles.title}`}>time range picker</div>
            {/* enabled horizontal */}
            <div className={`${styles.col} ${styles.title}`}>Enabled</div>
            <div className={`${styles.col} ${styles.title}`}>Horizontal</div>
            <div className={styles.col}>
                <SwDatePicker
                    label='Label'
                    id='test1'
                    asterisk
                    validationText='validationText'
                    value={value}
                    onChange={(newValue) => setValue(newValue)}
                />
                <SwDatePicker
                    label='Label'
                    id='test1'
                    asterisk
                    validationText='validationText'
                    value={value}
                    onChange={(newValue) => setValue(newValue)}
                    color='white'
                />
            </div>
            <div className={styles.col}>
                <SwDateRangePicker label='Label' id='test10' asterisk />
                <SwDateRangePicker label='Label' id='test10' asterisk color='white' />
            </div>
            <div className={styles.col}>
                <SwTimePicker label='Label' id='test100' asterisk />
                <SwTimePicker label='Label' id='test100' asterisk color='white' />
            </div>
            <div className={styles.col}>
                <SwTimeRangePicker id='test1000' label='label' asterisk />
                <SwTimeRangePicker id='test1000' label='label' asterisk color='white' />
            </div>
            {/* enabled Vertical */}
            <div className={`${styles.col} ${styles.title}`}>Enabled</div>
            <div className={`${styles.col} ${styles.title}`}>Vertical & error</div>
            <div className={styles.col}>
                <SwDatePicker label='Label' id='test2' asterisk vertical validationText='validationText' error />
            </div>
            <div className={styles.col}>
                <SwDateRangePicker label='Label' id='test20' asterisk vertical error validationText='validationText' />
            </div>
            <div className={styles.col}>
                <SwTimePicker label='Label' id='test200' asterisk vertical error validationText='validationText' />
            </div>
            <div className={styles.col}>
                <SwTimeRangePicker
                    id='test2000'
                    label='label'
                    asterisk
                    vertical
                    error
                    validationText='validationText'
                />
            </div>
            {/* disabled horizontal */}
            <div className={`${styles.col} ${styles.title}`}>disabled</div>
            <div className={`${styles.col} ${styles.title}`}>Horizontal</div>
            <div className={styles.col}>
                <SwDatePicker label='Label' id='test3' asterisk disabled />
            </div>
            <div className={styles.col}>
                <SwDateRangePicker label='Label' id='test30' asterisk disabled />
            </div>
            <div className={styles.col}>
                <SwTimePicker label='Label' id='test300' asterisk disabled />
            </div>
            <div className={styles.col}>
                <SwTimeRangePicker id='test3000' label='label' asterisk disabled />
            </div>
            {/* disabled Vertical */}
            <div className={`${styles.col} ${styles.title}`}>disabled</div>
            <div className={`${styles.col} ${styles.title}`}>Vertical</div>
            <div className={styles.col}>
                <SwDatePicker label='Label' id='test4' asterisk vertical disabled />
            </div>
            <div className={styles.col}>
                <SwDateRangePicker label='Label' id='test40' asterisk vertical disabled />
            </div>
            <div className={styles.col}>
                <SwTimePicker label='Label' id='test400' asterisk vertical disabled />
            </div>
            <div className={styles.col}>
                <SwTimeRangePicker id='test3000' label='label' asterisk vertical disabled />
            </div>

            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}>date time picker</div>
            <div className={`${styles.col} ${styles.title}`}>date calendar</div>
            <div className={`${styles.col} ${styles.title}`}>month calendar(미완)</div>
            <div className={`${styles.col} ${styles.title}`}>year calendar(미완)</div>
            {/* enabled horizontal */}
            <div className={`${styles.col} ${styles.title}`}>Enabled</div>
            <div className={`${styles.col} ${styles.title}`}>Horizontal</div>
            <div className={styles.col}>
                <SwDateTimePicker label='Label' id='test1' asterisk />
            </div>
            <div className={`${styles.col} ${styles.row}`}>
                <SwDateCalendar />
            </div>
            <div className={`${styles.col} ${styles.row}`}>
                <SwMonthCalendar />
            </div>
            <div className={`${styles.col} ${styles.row}`}>
                <SwYearCalendar />
            </div>
            {/* enabled Vertical */}
            <div className={`${styles.col} ${styles.title}`}>Enabled</div>
            <div className={`${styles.col} ${styles.title}`}>Vertical & error</div>
            <div className={styles.col}>
                <SwDateTimePicker label='Label' id='test2' asterisk vertical validationText='validationText' error />
            </div>
            {/* disabled horizontal */}
            <div className={`${styles.col} ${styles.title}`}>disabled</div>
            <div className={`${styles.col} ${styles.title}`}>Horizontal</div>
            <div className={styles.col}>
                <SwDateTimePicker label='Label' id='test3' asterisk disabled />
            </div>
            {/* disabled Vertical */}
            <div className={`${styles.col} ${styles.title}`}>disabled</div>
            <div className={`${styles.col} ${styles.title}`}>Vertical</div>
            <div className={styles.col}>
                <SwDateTimePicker label='Label' id='test4' asterisk vertical disabled />
            </div>

            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}>month year calendar</div>
            <div className={`${styles.col} ${styles.title}`}>digital time clock</div>
            <div className={`${styles.col} ${styles.title}`}>date time calendar</div>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={`${styles.col} ${styles.title}`}></div>
            <div className={styles.col}>
                <SwMonthYearCalendar />
            </div>
            <div className={styles.col}>
                <SwDigitalClock />
            </div>
            <div className={styles.col}></div>
            <div className={styles.col}></div>
        </>
    );
};

export default DatePickerEx;
