import { default as React } from 'react';
import { CalendarEvent, CalendarFormField, ConflictTemplate } from './types';
import { PluginManager } from './pluginSystem';
interface EventFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingEvent: CalendarEvent | null;
    formData: any;
    setFormData: (data: any) => void;
    formFields?: CalendarFormField[];
    timezone: string;
    dateFormat?: string;
    timeFormat?: string;
    onAddEvent?: (event: CalendarEvent) => void;
    onEditEvent?: (event: CalendarEvent) => void;
    onDeleteEvent?: (eventId: string) => void;
    pluginManager: PluginManager;
    conflictTemplate?: ConflictTemplate;
    slotInterval?: number;
    enabledTimeSlots?: string[];
    disabledTimeSlots?: string[];
    enabledTimeInterval?: {
        start: string;
        end: string;
    }[];
    disableTimeInterval?: {
        start: string;
        end: string;
    }[];
    events: CalendarEvent[];
}
export declare const EventFormModal: React.FC<EventFormModalProps>;
export {};
