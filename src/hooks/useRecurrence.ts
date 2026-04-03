import { useState, useCallback } from "react";
import type { RecurrencePattern, CalendarEvent } from "../components/types";
import { generateRecurringEvents } from "../components/utils";
import { type Moment } from "moment-timezone";

/**
 * Hook to manage recurrence logic and expansion.
 */
export const useRecurrence = (timezone: string) => {
    const [recurrence, setRecurrence] = useState<RecurrencePattern | null>(null);

    const updateRecurrence = useCallback((pattern: Partial<RecurrencePattern> | null) => {
        if (!pattern) {
            setRecurrence(null);
            return;
        }
        setRecurrence((prev: RecurrencePattern | null) => ({
            frequency: "daily",
            interval: 1,
            ...prev,
            ...pattern
        } as RecurrencePattern));
    }, []);

    const getOccurrences = useCallback((event: CalendarEvent, start: Moment, end: Moment) => {
        return generateRecurringEvents(event, start, end);
    }, [timezone]);

    return {
        recurrence,
        updateRecurrence,
        getOccurrences,
    };
};
