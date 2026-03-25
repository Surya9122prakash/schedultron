import { default as React } from 'react';
import { Moment } from 'moment-timezone';
import { CalendarTheme } from './types';
export interface DatePickerProps {
    value?: string | Date | Moment;
    onChange?: (date: Moment) => void;
    timezone?: string;
    dateFormat?: string;
    calendarTheme?: CalendarTheme;
    calendarThemeVariant?: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}
export declare const DatePicker: React.FC<DatePickerProps>;
