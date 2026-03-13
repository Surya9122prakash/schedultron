import { type Moment } from "moment-timezone";

export interface ConflictTheme {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    borderColor: string;
    icon?: React.ReactNode;
}

export interface ConflictTemplate {
    title?: string;
    description?: string;
    buttonText?: string;
    theme?: ConflictTheme;
    renderHeader?: (title: string, theme: ConflictTheme) => React.ReactNode;
    renderDetails?: (errors: string[]) => React.ReactNode;
    renderFooter?: (onClose: () => void, theme: ConflictTheme) => React.ReactNode;
}

export interface CalendarEvent {
    id: string;
    title: string;
    start: string | Date | Moment;
    end: string | Date | Moment;
    allDay?: boolean;
    [key: string]: any;
}

export interface PluginContext {
    timezone: string;
    slotInterval: number;
    events: CalendarEvent[];
    onEventChange?: (event: CalendarEvent) => void;
    onAddEvent?: (event: CalendarEvent) => void;
    onEditEvent?: (event: CalendarEvent) => void;
    onDeleteEvent?: (eventId: string) => void;
}

export interface Plugin {
    name: string;
    init?: (context: PluginContext) => void;
    hooks?: {
        beforeRender?: (context: PluginContext) => void;
        onEventRender?: (event: CalendarEvent, element: HTMLDivElement) => void;
        onEventClick?: (event: CalendarEvent) => void;
        afterRender?: (context: PluginContext) => void;
        onEventChange?: (event: CalendarEvent) => void;
        validateSave?: (event: CalendarEvent, context: PluginContext) => string | null;
    };
}

export interface CalendarFormField {
    name: string;
    label: string;
    type: "text" | "textarea" | "datetime" | "date" | "time" | "datetime-local" | "dropdown" | "singleSelect" | "multiselect" | "colorPicker" | "attachment" | "radio" | "boolean" | "year" | "month" | "day";
    required?: boolean;
    options?: { label: string; value: string }[];
}

export interface CalendarTheme {
    primaryColor: string;
    backgroundColor: string;
    secondaryBackgroundColor: string;
    gridColor: string;
    textColor: string;
    secondaryTextColor: string;
    accentColor: string;
    eventDefaultColor: string;
    eventDefaultTextColor: string;
}

export interface NavigationActions {
    goToPreviousDay: () => void;
    goToNextDay: () => void;
    goToToday: () => void;
    dateNode: React.ReactNode;
    prevNode: React.ReactNode;
    nextNode: React.ReactNode;
    defaultNav: React.ReactNode;
    currentDate: Moment;
    timezone: string;
    timezoneLabelInclude: boolean;
}

export interface CalendarProps {
    timezone?: string;
    timezoneLabelInclude?: boolean;
    slotInterval?: number;
    dateFormat?: string;
    timeFormat?: string;
    showTimeSlots?: boolean;

    selectedDate?: Moment | string | Date;
    onDateChange?: (date: Moment) => void;

    events?: CalendarEvent[];
    onEventChange?: (event: CalendarEvent) => void;

    navigationPosition?: "left" | "center" | "right";
    showTodayBelow?: boolean;

    renderNavigation?: (actions: NavigationActions) => React.ReactNode;

    showEmptyState?: boolean;

    enabledTimeSlots?: string[];
    disabledTimeSlots?: string[];

    enabledTimeInterval?: { start: string; end: string }[];
    disableTimeInterval?: { start: string; end: string }[];

    emptyStateContent?: string;
    emptyStateContentPopup?: React.ReactNode;

    onAddEvent?: (event: CalendarEvent) => void;
    onEditEvent?: (event: CalendarEvent) => void;
    onDeleteEvent?: (eventId: string) => void;

    futureDaysOnly?: boolean;
    pastDaysOnly?: boolean;
    currentDayOnly?: boolean;
    navigateToFirstEvent?: boolean;

    formFields?: CalendarFormField[];
    onlyCreateEditRequired?: boolean;

    plugins?: Plugin[];
    conflictTemplate?: ConflictTemplate;
    conflictThemeVariant?: "classic_red" | "amber_warning" | "indigo_modern" | "emerald_soft" | "dark_noir" | "rose_elegant" | "glassmorphism" | "cyberpunk" | "minimalist" | "high_visibility";

    calendarTheme?: CalendarTheme;
    calendarThemeVariant?: "classic_light" | "dark_night" | "slate_modern" | "emerald_forest" | "ocean_breeze" | "midnight_purple" | "amber_gold" | "rose_petal" | "minimal_mono" | "cyber_punk";
}
