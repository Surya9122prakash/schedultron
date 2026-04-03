import { Moment } from 'moment-timezone';
import { CalendarEvent } from '../components/types';
interface UseDragAndResizeProps {
    slotInterval: number;
    zonedDate: Moment;
    containerRef?: React.RefObject<HTMLDivElement | null>;
    onEventDrop?: (event: CalendarEvent) => void;
    onEventResize?: (event: CalendarEvent) => void;
    onEventCreate?: (event: {
        start: Moment;
        end: Moment;
    }) => void;
    enabled?: boolean;
}
export declare const useDragAndResize: ({ slotInterval, zonedDate, containerRef, onEventDrop, onEventResize, onEventCreate, enabled, }: UseDragAndResizeProps) => {
    handleMouseDown: (e: React.MouseEvent, event: CalendarEvent, type: "move" | "resize-top" | "resize-bottom" | "create", element?: HTMLElement) => void;
    draggingEvent: CalendarEvent | null;
    resizingEvent: CalendarEvent | null;
    creatingEvent: {
        start: Moment;
        end: Moment;
    } | null;
};
export {};
