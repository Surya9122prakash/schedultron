import { useState, useRef, useEffect, useCallback } from "react";
import moment, { type Moment } from "moment-timezone";
import { SLOT_HEIGHT } from "../components/utils";
import type { CalendarEvent } from "../components/types";

interface UseDragAndResizeProps {
    slotInterval: number;
    zonedDate: Moment; // The base date (usually the selected date or day's date)
    containerRef?: React.RefObject<HTMLDivElement | null>;
    onEventDrop?: (event: CalendarEvent) => void;
    onEventResize?: (event: CalendarEvent) => void;
    onEventCreate?: (event: { start: Moment; end: Moment }) => void;
    enabled?: boolean;
}

export const useDragAndResize = ({
    slotInterval,
    zonedDate,
    containerRef,
    onEventDrop,
    onEventResize,
    onEventCreate,
    enabled = true,
}: UseDragAndResizeProps) => {
    const [draggingEvent, setDraggingEvent] = useState<CalendarEvent | null>(null);
    const [resizingEvent, setResizingEvent] = useState<CalendarEvent | null>(null);
    const [creatingEvent, setCreatingEvent] = useState<{ start: Moment; end: Moment } | null>(null);

    const dragRef = useRef<{
        startX: number;
        startY: number;
        startTop: number;
        startHeight: number;
        type: "move" | "resize-top" | "resize-bottom" | "create";
        element: HTMLElement | null;
        initialEventStart: Moment;
        initialEventEnd: Moment;
    } | null>(null);

    const snapMinutes = (minutes: number) =>
        Math.round(minutes / slotInterval) * slotInterval;

    const handleMouseDown = useCallback((
        e: React.MouseEvent,
        event: CalendarEvent,
        type: "move" | "resize-top" | "resize-bottom" | "create",
        element?: HTMLElement
    ) => {
        if (!enabled) return;
        e.preventDefault();
        e.stopPropagation();

        const dayStart = zonedDate.clone().startOf("day");
        const initialTop = type === "create"
            ? (moment(event.start).diff(dayStart, "minutes") / slotInterval) * SLOT_HEIGHT
            : (event as any).top || 0;

        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            startTop: initialTop,
            startHeight: (event as any).height || 0,
            type,
            element: element || null,
            initialEventStart: moment(event.start),
            initialEventEnd: moment(event.end),
        };

        if (type === "move") setDraggingEvent(event);
        else if (type === "create") setCreatingEvent({ start: moment(event.start), end: moment(event.end) });
        else setResizingEvent(event);
    }, [zonedDate, slotInterval]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!dragRef.current) return;
            const { startX, startY, startTop, startHeight, type, element, initialEventStart, initialEventEnd } = dragRef.current;
            const deltaY = e.clientY - startY;

            let deltaDays = 0;
            if (containerRef?.current && (type === "move" || type === "create")) {
                const rect = containerRef.current.getBoundingClientRect();
                const colWidth = rect.width / 7;
                deltaDays = Math.floor((e.clientX - rect.left) / colWidth) - Math.floor((startX - rect.left) / colWidth);
            }

            const dayStart = (initialEventStart || zonedDate).clone().startOf("day");

            if (element) {
                if (type === "move") {
                    element.style.transform = `translateY(${deltaY}px)`;
                    element.style.zIndex = "100";
                    element.style.opacity = "0.7";
                } else if (type === "resize-bottom") {
                    const newHeight = Math.max(15, startHeight + deltaY);
                    element.style.height = `${newHeight}px`;
                } else if (type === "resize-top") {
                    const newHeight = Math.max(15, startHeight - deltaY);
                    if (newHeight > 15) {
                        element.style.transform = `translateY(${deltaY}px)`;
                        element.style.height = `${newHeight}px`;
                    }
                }
            }

            if (type === "move") {
                const snappedStartMins = snapMinutes(((startTop + deltaY) / SLOT_HEIGHT) * slotInterval);
                const duration = initialEventEnd.diff(initialEventStart, "minutes");
                const newStart = initialEventStart.clone().add(deltaDays, "days").startOf("day").add(snappedStartMins, "minutes");
                setDraggingEvent(prev => prev ? { ...prev, start: newStart, end: newStart.clone().add(duration, "minutes") } : null);
            } else if (type === "create") {
                const pixelsPerMinute = SLOT_HEIGHT / slotInterval;
                const deltaMinutes = deltaY / pixelsPerMinute;
                const snappedDeltaMins = Math.round(deltaMinutes / 15) * 15;
                const duration = Math.max(15, snappedDeltaMins);
                const finalStart = initialEventStart.clone().add(deltaDays, "days").startOf("day").add(snapMinutes((startTop / SLOT_HEIGHT) * slotInterval), "minutes");
                setCreatingEvent({ start: finalStart, end: finalStart.clone().add(duration, "minutes") });
            } else if (type === "resize-bottom" && resizingEvent) {
                const snappedEndMins = snapMinutes(((startTop + startHeight + deltaY) / SLOT_HEIGHT) * slotInterval);
                const newEnd = dayStart.clone().add(snappedEndMins, "minutes");
                if (newEnd.isAfter(initialEventStart)) {
                    setResizingEvent(prev => prev ? { ...prev, end: newEnd } : null);
                }
            } else if (type === "resize-top" && resizingEvent) {
                const snappedStartMins = snapMinutes(((startTop + deltaY) / SLOT_HEIGHT) * slotInterval);
                const newStart = dayStart.clone().add(snappedStartMins, "minutes");
                if (newStart.isBefore(initialEventEnd)) {
                    setResizingEvent(prev => prev ? { ...prev, start: newStart } : null);
                }
            }
        };

        const handleMouseUp = (e: MouseEvent) => {
            if (!dragRef.current) return;
            const { startX, startY, startTop, startHeight, type, element, initialEventStart, initialEventEnd } = dragRef.current;
            const deltaY = e.clientY - startY;

            if (element) {
                if (type === "move" || type === "resize-top") {
                    element.style.transform = "";
                }
                if (type === "resize-top" || type === "resize-bottom") {
                    element.style.height = "";
                }
                element.style.zIndex = "";
                element.style.opacity = "";
            }

            const dayStart = (initialEventStart || zonedDate).clone().startOf("day");
            let deltaDays = 0;
            if (containerRef?.current && (type === "move" || type === "create")) {
                const rect = containerRef.current.getBoundingClientRect();
                const colWidth = rect.width / 7;
                deltaDays = Math.floor((e.clientX - rect.left) / colWidth) - Math.floor((startX - rect.left) / colWidth);
            }

            if (type === "move" && draggingEvent) {
                const snappedStartMins = snapMinutes(((startTop + deltaY) / SLOT_HEIGHT) * slotInterval);
                const duration = initialEventEnd.diff(initialEventStart, "minutes");
                const newStart = initialEventStart.clone().add(deltaDays, "days").startOf("day").add(snappedStartMins, "minutes");
                onEventDrop?.({ ...draggingEvent, start: newStart, end: newStart.clone().add(duration, "minutes") });
            } else if (type === "resize-bottom" && resizingEvent) {
                const snappedEndMins = snapMinutes(((startTop + startHeight + deltaY) / SLOT_HEIGHT) * slotInterval);
                const newEnd = dayStart.clone().add(snappedEndMins, "minutes");
                if (newEnd.isAfter(initialEventStart)) {
                    onEventResize?.({ ...resizingEvent, end: newEnd });
                }
            } else if (type === "resize-top" && resizingEvent) {
                const snappedStartMins = snapMinutes(((startTop + deltaY) / SLOT_HEIGHT) * slotInterval);
                const newStart = dayStart.clone().add(snappedStartMins, "minutes");
                if (newStart.isBefore(initialEventEnd)) {
                    onEventResize?.({ ...resizingEvent, start: newStart });
                }
            } else if (type === "create") {
                const pixelsPerMinute = SLOT_HEIGHT / slotInterval;
                const deltaMinutes = deltaY / pixelsPerMinute;
                const snappedDeltaMins = Math.round(deltaMinutes / 15) * 15;
                const duration = Math.max(15, snappedDeltaMins);
                const finalStart = initialEventStart.clone().add(deltaDays, "days").startOf("day").add(snapMinutes((startTop / SLOT_HEIGHT) * slotInterval), "minutes");
                onEventCreate?.({ start: finalStart, end: finalStart.clone().add(duration, "minutes") });
            }

            setDraggingEvent(null);
            setResizingEvent(null);
            setCreatingEvent(null);
            dragRef.current = null;
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [draggingEvent, resizingEvent, zonedDate, slotInterval, onEventDrop, onEventResize, onEventCreate, containerRef]);

    return {
        handleMouseDown,
        draggingEvent,
        resizingEvent,
        creatingEvent,
    };
};
