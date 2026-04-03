import { default as React } from 'react';
import { Moment } from 'moment-timezone';
import { CalendarTheme } from './types';
export interface CalendarPanelProps {
    value: Moment | {
        start: Moment | null;
        end: Moment | null;
    } | null;
    onChange: (val: any) => void;
    mode: "single" | "range" | "datetime" | "datetimerange";
    timezone: string;
    calendarTheme?: CalendarTheme;
    calendarThemeVariant?: string;
    onClose?: () => void;
}
export declare const CalendarPanel: React.FC<CalendarPanelProps>;
