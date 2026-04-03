import { RecurrencePattern, CalendarEvent } from '../components/types';
import { Moment } from 'moment-timezone';
/**
 * Hook to manage recurrence logic and expansion.
 */
export declare const useRecurrence: (timezone: string) => {
    recurrence: RecurrencePattern | null;
    updateRecurrence: (pattern: Partial<RecurrencePattern> | null) => void;
    getOccurrences: (event: CalendarEvent, start: Moment, end: Moment) => CalendarEvent[];
};
