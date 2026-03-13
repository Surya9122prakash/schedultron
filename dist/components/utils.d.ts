import { default as moment, Moment } from 'moment-timezone';
import { CalendarEvent } from './types';
export declare const SLOT_HEIGHT = 64;
export declare const normalizeDate: (d: any, timezone: string) => moment.Moment;
export declare const getWorkingHoursRange: (enabledTimeInterval?: {
    start: string;
    end: string;
}[]) => {
    startMinutes: number;
    endMinutes: number;
};
export declare const generateTimeSlots: (startOfDay: Moment, slotInterval: number) => moment.Moment[];
export declare const checkIsSlotEnabled: (slot: Moment, enabledTimeSlots?: string[], disabledTimeSlots?: string[], enabledTimeInterval?: {
    start: string;
    end: string;
}[], disableTimeInterval?: {
    start: string;
    end: string;
}[]) => boolean;
export declare const getDayEvents: (safeEvents: CalendarEvent[], targetDate: Moment, timezone: string) => CalendarEvent[];
export declare const calculateLayoutEvents: (dayEvents: CalendarEvent[], targetDate: Moment, slotInterval: number) => {
    columnIndex: number;
    columnCount: number;
    top: number;
    height: number;
    id: string;
    title: string;
    start: string | Date | Moment;
    end: string | Date | Moment;
    allDay?: boolean;
}[];
interface ConflictDetail {
    eventId: string;
    withId: string;
    eventTitle: string;
    withTitle: string;
    overlapStart: string;
    overlapEnd: string;
}
export declare const detectConflicts: (events: CalendarEvent[], timezone: string) => ConflictDetail[];
export {};
