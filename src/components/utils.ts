import moment, { type Moment } from "moment-timezone";
import type { CalendarEvent } from "./types";

export const SLOT_HEIGHT = 64;

export const normalizeDate = (d: any, timezone: string) => moment.utc(d).tz(timezone);

const TIME_FORMATS = ["HH:mm", "hh:mm A", "h:mm a", "H:mm", "h:mmA", "h:mma", "hh:mm a", "HH:mm:ss"];

const parseTimeStr = (t: string) => {
    return moment(t, TIME_FORMATS, true);
};

const getMinutesFromTimeStr = (t: string) => {
    const m = parseTimeStr(t);
    if (!m.isValid()) return 0;
    return m.hours() * 60 + m.minutes();
};

export const getWorkingHoursRange = (enabledTimeInterval?: { start: string; end: string }[]) => {
    if (enabledTimeInterval?.length) {
        const start = enabledTimeInterval[0].start;
        const end = enabledTimeInterval[enabledTimeInterval.length - 1].end;

        return {
            startMinutes: getMinutesFromTimeStr(start),
            endMinutes: getMinutesFromTimeStr(end),
        };
    }

    return {
        startMinutes: 0,
        endMinutes: 24 * 60,
    };
};

export const generateTimeSlots = (startOfDay: Moment, slotInterval: number) => {
    const slots: Moment[] = [];
    const start = startOfDay.clone().startOf("day");

    for (let mins = 0; mins < 24 * 60; mins += slotInterval) {
        slots.push(start.clone().add(mins, "minutes"));
    }

    return slots;
};

export const checkIsSlotEnabled = (
    slot: Moment,
    enabledTimeSlots?: string[],
    disabledTimeSlots?: string[],
    enabledTimeInterval?: { start: string; end: string }[],
    disableTimeInterval?: { start: string; end: string }[]
) => {
    const timeStrHHmm = slot.format("HH:mm");

    const matchesSlotList = (list: string[]) => {
        return list.some(t => {
            const m = parseTimeStr(t);
            return m.isValid() && m.format("HH:mm") === timeStrHHmm;
        });
    };

    if (enabledTimeSlots?.length) {
        return matchesSlotList(enabledTimeSlots);
    }

    if (disabledTimeSlots?.length && matchesSlotList(disabledTimeSlots)) {
        return false;
    }

    const isWithinInterval = (
        intervals?: { start: string; end: string }[],
        invert = false
    ) => {
        if (!intervals?.length) return invert ? true : false;
        const minutes = slot.hours() * 60 + slot.minutes();
        const match = intervals.some((int) => {
            const startMins = getMinutesFromTimeStr(int.start);
            const endMins = getMinutesFromTimeStr(int.end);
            return minutes >= startMins && minutes < endMins;
        });
        return invert ? !match : match;
    };

    if (enabledTimeInterval?.length) {
        return isWithinInterval(enabledTimeInterval);
    }
    if (disableTimeInterval?.length) {
        return isWithinInterval(disableTimeInterval, true);
    }
    return true;
};

// Expanded events filter for a specific day
export const getDayEvents = (
    safeEvents: CalendarEvent[],
    targetDate: Moment,
    timezone: string
) => {
    const result: CalendarEvent[] = [];

    safeEvents.forEach((e) => {
        const start = normalizeDate(e.start, timezone);
        const end = normalizeDate(e.end, timezone);

        if (e.allDay) {
            if (start.isSame(targetDate, "day")) {
                result.push({ ...e, start, end, allDay: true });
            }
            return;
        }

        let current = start.clone().startOf("day");

        while (current.isBefore(end)) {
            const dayStart = current.clone();
            const dayEnd = current.clone().endOf("day");

            const chunkStart = moment.max(start, dayStart);
            const chunkEnd = moment.min(end, dayEnd);

            if (chunkStart.isSame(targetDate, "day")) {
                result.push({
                    ...e,
                    start: chunkStart,
                    end: chunkEnd,
                });
            }

            current.add(1, "day");
        }
    });

    return result;
};

export const calculateLayoutEvents = (
    dayEvents: CalendarEvent[],
    targetDate: Moment,
    slotInterval: number
) => {
    const sorted = [...dayEvents].sort(
        (a, b) => (a.start as Moment).valueOf() - (b.start as Moment).valueOf()
    );

    const columns: any[][] = [];

    sorted.forEach((event) => {
        let placed = false;
        for (const column of columns) {
            const last = column[column.length - 1];
            if ((event.start as Moment).isSameOrAfter(last.end as Moment)) {
                column.push(event);
                placed = true;
                break;
            }
        }
        if (!placed) columns.push([event]);
    });

    const columnCount = columns.length;

    return sorted.map((event) => {
        let columnIndex = 0;
        columns.forEach((col, i) => {
            if (col.includes(event)) columnIndex = i;
        });

        const startMoment = event.start as Moment;
        const endMoment = event.end as Moment;

        const top =
            (startMoment.diff(targetDate.clone().startOf("day"), "minutes") /
                slotInterval) *
            SLOT_HEIGHT;

        const height =
            (endMoment.diff(startMoment, "minutes") / slotInterval) * SLOT_HEIGHT;

        return {
            ...event,
            columnIndex,
            columnCount,
            top,
            height,
        };
    });
};

interface ConflictDetail {
    eventId: string;
    withId: string;
    eventTitle: string;
    withTitle: string;
    overlapStart: string;
    overlapEnd: string;
}

export const detectConflicts = (events: CalendarEvent[], timezone: string): ConflictDetail[] => {
    console.log("[detectConflicts] Checking events count:", events.length, "Timezone:", timezone);
    console.log("[detectConflicts] Events data:", events.map(e => ({ id: e.id, title: e.title, start: e.start, end: e.end })));
    if (events.length < 2) return [];

    const conflicts: ConflictDetail[] = [];

    // 1. Normalize and Sort
    const normalized = events.map(e => ({
        ...e,
        _mStart: moment.tz(e.start, timezone),
        _mEnd: moment.tz(e.end, timezone)
    })).filter(e => e._mStart.isValid() && e._mEnd.isValid());

    // Sort by start time
    normalized.sort((a, b) => a._mStart.diff(b._mStart));

    // 2. Pairwise Comparison
    for (let i = 0; i < normalized.length; i++) {
        for (let j = i + 1; j < normalized.length; j++) {
            const a = normalized[i];
            const b = normalized[j];

            // If a starts before b ends AND a ends after b starts, they overlap
            if (a._mStart.isBefore(b._mEnd) && a._mEnd.isAfter(b._mStart)) {
                const overlapStart = moment.max(a._mStart, b._mStart);
                const overlapEnd = moment.min(a._mEnd, b._mEnd);

                conflicts.push({
                    eventId: a.id,
                    withId: b.id,
                    eventTitle: a.title,
                    withTitle: b.title,
                    overlapStart: overlapStart.toISOString(),
                    overlapEnd: overlapEnd.toISOString()
                });
                conflicts.push({
                    eventId: b.id,
                    withId: a.id,
                    eventTitle: b.title,
                    withTitle: a.title,
                    overlapStart: overlapStart.toISOString(),
                    overlapEnd: overlapEnd.toISOString()
                });
            }
        }
    }
    console.log("[detectConflicts] Conflicts found:", conflicts.length);
    return conflicts;
};
