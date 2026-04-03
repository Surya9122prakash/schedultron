import { default as React } from 'react';
import { Moment } from 'moment-timezone';
import { CalendarTheme } from './types';
export interface TimeSlot {
    time: string;
}
export interface SlotGroup {
    group: string;
    items: TimeSlot[];
}
export interface SlotDatePickerProps {
    value?: string | Date | Moment;
    onChange?: (date: Moment) => void;
    timezone?: string;
    dateFormat?: string;
    calendarTheme?: CalendarTheme;
    calendarThemeVariant?: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    slots?: SlotGroup[];
    onSlotSelect?: (time: string) => void;
    selectedSlot?: string;
}
export declare const SlotDatePicker: React.ForwardRefExoticComponent<SlotDatePickerProps & React.RefAttributes<HTMLDivElement>>;
