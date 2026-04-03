import React, { useState, useMemo } from "react";
import moment from "moment-timezone";
import type { CalendarEvent, CalendarFormField, ConflictTemplate } from "./types";
import { PluginManager } from "./pluginSystem";
import { checkIsSlotEnabled } from "./utils";
import { DatePicker } from "./DatePicker";
import { DateRangePicker } from "./DateRangePicker";
import { DateTimePicker } from "./DateTimePicker";
import { DateTimeRangePicker } from "./DateTimeRangePicker";

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
    enabledTimeInterval?: { start: string; end: string }[];
    disableTimeInterval?: { start: string; end: string }[];
    events: CalendarEvent[];
    calendarThemeVariant?: string;
    enableRecurrence?: boolean;
}

const TimeSlotPicker: React.FC<{
    value: string;
    onChange: (val: string) => void;
    timeFormat: string;
    slotInterval: number;
    timezone: string;
    enabledTimeSlots?: string[];
    disabledTimeSlots?: string[];
    enabledTimeInterval?: { start: string; end: string }[];
    disableTimeInterval?: { start: string; end: string }[];
    checkIsSlotEnabled: any;
}> = ({ onChange, timeFormat, slotInterval, timezone, enabledTimeSlots, disabledTimeSlots, enabledTimeInterval, disableTimeInterval, checkIsSlotEnabled }) => {
    const slots = useMemo(() => {
        const result = [];
        const startOfDay = moment.tz(timezone).startOf("day");
        for (let i = 0; i < 24 * 60; i += slotInterval) {
            result.push(startOfDay.clone().add(i, "minutes"));
        }
        return result;
    }, [slotInterval, timezone]);

    return (
        <div className="absolute z-[70] border rounded shadow-xl mt-1 max-h-48 overflow-y-auto w-full no-scrollbar" style={{ backgroundColor: "var(--calendar-bg)", borderColor: "var(--calendar-grid)" }}>
            {slots.map((s, i) => {
                const isEnabled = checkIsSlotEnabled(s, enabledTimeSlots, disabledTimeSlots, enabledTimeInterval, disableTimeInterval);
                return (
                    <div
                        key={i}
                        onClick={() => {
                            if (isEnabled) onChange(s.format(timeFormat));
                        }}
                        className={`px-3 py-2 text-sm border-b last:border-0 ${isEnabled
                            ? "cursor-pointer hover:opacity-80"
                            : "cursor-not-allowed opacity-40"
                            }`}
                        style={{ color: "var(--calendar-text)", borderColor: "var(--calendar-grid)" }}
                    >
                        {s.format(timeFormat)}
                    </div>
                );
            })}
        </div>
    );
};


const CustomRecurrenceModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onDone: (data: any) => void;
    initialData?: any;
    timezone: string;
}> = ({ isOpen, onClose, onDone, initialData, timezone }) => {
    const [data, setData] = useState(initialData || {
        frequency: "weekly",
        interval: 1,
        weekDays: [moment.tz(timezone).day()],
        endType: "never", // never, on, after
        until: "",
        count: 13
    });

    if (!isOpen) return null;

    const days = ["S", "M", "T", "W", "T", "F", "S"];

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] animate-fadeIn">
            <div className="bg-[#202124] rounded-xl p-6 w-[360px] shadow-2xl animate-scaleIn text-white border border-gray-700">
                <h4 className="text-xl font-medium mb-6">Custom recurrence</h4>

                <div className="flex items-center gap-4 mb-6">
                    <span className="text-sm opacity-80 min-w-[80px]">Repeat every</span>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            min="1"
                            value={data.interval}
                            onChange={(e) => setData({ ...data, interval: parseInt(e.target.value) || 1 })}
                            className="w-12 bg-transparent border-b border-gray-600 outline-none text-center focus:border-blue-400"
                        />
                        <select
                            value={data.frequency}
                            onChange={(e) => setData({ ...data, frequency: e.target.value })}
                            className="bg-transparent border-b border-gray-600 outline-none focus:border-blue-400 text-sm py-1"
                        >
                            <option value="daily" className="bg-[#202124]">day</option>
                            <option value="weekly" className="bg-[#202124]">week</option>
                            <option value="monthly" className="bg-[#202124]">month</option>
                            <option value="yearly" className="bg-[#202124]">year</option>
                        </select>
                    </div>
                </div>

                {data.frequency === "weekly" && (
                    <div className="mb-6">
                        <span className="text-sm opacity-80 block mb-3">Repeat on</span>
                        <div className="flex justify-between">
                            {days.map((day, i) => {
                                const isSelected = data.weekDays?.includes(i);
                                return (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            const newDays = isSelected
                                                ? data.weekDays.filter((d: number) => d !== i)
                                                : [...(data.weekDays || []), i];
                                            setData({ ...data, weekDays: newDays });
                                        }}
                                        className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${isSelected ? "bg-blue-400 text-black" : "hover:bg-gray-700 border border-gray-600"}`}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="mb-8">
                    <span className="text-sm opacity-80 block mb-3">Ends</span>
                    <div className="flex flex-col gap-4">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="radio"
                                name="endType"
                                checked={data.endType === "never"}
                                onChange={() => setData({ ...data, endType: "never" })}
                                className="w-4 h-4 accent-blue-400"
                            />
                            <span className="text-sm">Never</span>
                        </label>

                        <div className="flex items-center gap-3 group">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="endType"
                                    checked={data.endType === "on"}
                                    onChange={() => setData({ ...data, endType: "on" })}
                                    className="w-4 h-4 accent-blue-400"
                                />
                                <span className="text-sm">On</span>
                            </label>
                            <input
                                type="date"
                                disabled={data.endType !== "on"}
                                value={data.until}
                                onChange={(e) => setData({ ...data, until: e.target.value })}
                                className={`flex-1 bg-transparent border-b border-gray-600 outline-none text-xs py-1 transition-opacity ${data.endType !== "on" ? "opacity-30" : "focus:border-blue-400"}`}
                                style={{ colorScheme: "dark" }}
                            />
                        </div>

                        <div className="flex items-center gap-3 group">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="endType"
                                    checked={data.endType === "after"}
                                    onChange={() => setData({ ...data, endType: "after" })}
                                    className="w-4 h-4 accent-blue-400"
                                />
                                <span className="text-sm">After</span>
                            </label>
                            <div className={`flex items-center gap-2 flex-1 transition-opacity ${data.endType !== "after" ? "opacity-30" : ""}`}>
                                <input
                                    type="number"
                                    disabled={data.endType !== "after"}
                                    value={data.count}
                                    onChange={(e) => setData({ ...data, count: parseInt(e.target.value) || 1 })}
                                    className="w-12 bg-transparent border-b border-gray-600 outline-none text-center focus:border-blue-400"
                                />
                                <span className="text-sm opacity-60">occurrences</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium hover:bg-gray-700 rounded-md transition-colors text-blue-400">Cancel</button>
                    <button onClick={() => onDone(data)} className="px-6 py-2 text-sm font-medium bg-blue-400 text-black hover:bg-blue-300 rounded-md transition-colors shadow-lg">Done</button>
                </div>
            </div>
        </div>
    );
};

export const EventFormModal: React.FC<EventFormModalProps> = ({
    isOpen,
    onClose,
    editingEvent,
    formData,
    setFormData,
    formFields,
    timezone,
    dateFormat = "YYYY-MM-DD",
    timeFormat = "HH:mm",
    onAddEvent,
    onEditEvent,
    onDeleteEvent,
    pluginManager,
    conflictTemplate,
    slotInterval = 30,
    enabledTimeSlots,
    disabledTimeSlots,
    enabledTimeInterval,
    disableTimeInterval,
    events,
    calendarThemeVariant,
    enableRecurrence = true,
}) => {
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [activePicker, setActivePicker] = useState<{ name: string; type: "date" | "time" } | null>(null);
    const [recurrenceChoice, setRecurrenceChoice] = useState<{ type: "save" | "delete"; data: any } | null>(null);
    const [isCustomRecurrenceOpen, setIsCustomRecurrenceOpen] = useState(false);

    const handleRecurrenceAction = (action: "single" | "following" | "all") => {
        if (!recurrenceChoice) return;

        const { type, data } = recurrenceChoice;

        if (type === "delete") {
            const eventId = data;
            const targetEvent = events.find((e: CalendarEvent) => e.id === eventId || (e.parentId && e.id === eventId));
            if (!targetEvent) return;

            if (action === "single") {
                if (targetEvent.parentId) {
                    const parent = events.find((e: CalendarEvent) => e.id === targetEvent.parentId);
                    if (parent) {
                        const dateStr = moment(targetEvent.start).format("YYYY-MM-DD");
                        onEditEvent?.({ ...parent, excludeDates: [...(parent.excludeDates || []), dateStr] });
                    }
                } else if (targetEvent.recurrence) {
                    const dateStr = moment(targetEvent.start).format("YYYY-MM-DD");
                    onEditEvent?.({ ...targetEvent, excludeDates: [...(targetEvent.excludeDates || []), dateStr] });
                }
            } else if (action === "following") {
                const parent = targetEvent.parentId ? events.find((e: CalendarEvent) => e.id === targetEvent.parentId) : targetEvent;
                if (parent) {
                    onEditEvent?.({ ...parent, recurrence: { ...parent.recurrence!, until: moment(targetEvent.start).subtract(1, "day").format("YYYY-MM-DD") } } as CalendarEvent);
                }
            } else if (action === "all") {
                const parentId = targetEvent.parentId || targetEvent.id;
                onDeleteEvent?.(parentId);
            }
        } else if (type === "save") {
            const finalData = data;
            if (action === "single") {
                if (editingEvent?.parentId) {
                    // Update existing exception
                    onEditEvent?.({ ...editingEvent, ...finalData });
                } else if (editingEvent?.recurrence) {
                    // Create new exception
                    const dateStr = moment(editingEvent.start).format("YYYY-MM-DD");
                    const newException = {
                        ...finalData,
                        id: `ex-${Date.now()}`,
                        parentId: editingEvent.id,
                        originalStart: editingEvent.start,
                        recurrence: undefined // Exceptions are not recurring themselves
                    };
                    onEditEvent?.({ ...editingEvent, excludeDates: [...(editingEvent.excludeDates || []), dateStr] });
                    onAddEvent?.(newException);
                }
            } else if (action === "following") {
                const parent = editingEvent!.parentId ? events.find((e: CalendarEvent) => e.id === editingEvent!.parentId) : editingEvent;
                if (parent) {
                    // End the current series
                    onEditEvent?.({ ...parent, recurrence: { ...parent.recurrence!, until: moment(editingEvent!.start).subtract(1, "day").format("YYYY-MM-DD") } } as CalendarEvent);
                    // Start a new series
                    onAddEvent?.({ ...finalData, id: `series-${Date.now()}`, parentId: undefined });
                }
            } else if (action === "all") {
                const parent = editingEvent!.parentId ? events.find((e: CalendarEvent) => e.id === editingEvent!.parentId) : editingEvent;
                if (parent) {
                    onEditEvent?.({ ...parent, ...finalData, id: parent.id });
                }
            }
        }

        setRecurrenceChoice(null);
        onClose();
    };

    const isDark = ["dark_night", "midnight_purple", "cyber_punk"].includes(calendarThemeVariant || "");

    const getRecurrenceOptions = () => {
        const start = moment.tz(formData.start, timezone);
        const dayName = start.format("dddd");
        const monthName = start.format("MMMM");
        const dayOfMonth = start.date();

        // Calculate Nth day of month (e.g. "last Tuesday" or "fourth Tuesday")
        const weekOfMonth = Math.ceil(dayOfMonth / 7);
        const isLastWeek = dayOfMonth + 7 > start.clone().endOf("month").date();
        const ordinal = weekOfMonth === 1 ? "first" : weekOfMonth === 2 ? "second" : weekOfMonth === 3 ? "third" : weekOfMonth === 4 ? "fourth" : "fifth";
        const monthlyLabel = isLastWeek ? `Monthly on the last ${dayName}` : `Monthly on the ${ordinal} ${dayName}`;

        return [
            { label: "Does not repeat", value: "none" },
            { label: "Daily", value: "daily" },
            { label: `Weekly on ${dayName}`, value: "weekly" },
            { label: monthlyLabel, value: "monthly" },
            { label: `Annually on ${monthName} ${dayOfMonth}`, value: "annually" },
            { label: "Every weekday (Monday to Friday)", value: "weekday" },
            { label: "Custom...", value: "custom" }
        ];
    };

    const recurrenceOptions = getRecurrenceOptions();

    if (!isOpen) return null;

    return (
        <div className="schedultron-modal-overlay animate-fadeIn" style={{ "--calendar-is-dark": isDark ? "1" : "0" } as React.CSSProperties}>
            <div className="schedultron-modal-content animate-scaleIn !max-w-[500px]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="schedultron-modal-title">
                        {editingEvent ? "Edit Event" : "Create Event"}
                    </h3>
                    <button onClick={onClose} className="hover:opacity-70 transition-colors" style={{ color: "var(--calendar-secondary-text)" }}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {formFields?.map((field) => (
                    <div key={field.name} className="schedultron-field-container">
                        <label className="schedultron-label-hardened">
                            {field.label}
                        </label>

                        {(() => {
                            switch (field.type) {
                                case "textarea":
                                    return <textarea required={field.required} value={formData[field.name] || ""} onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })} className="schedultron-input-hardened" rows={3} />;
                                case "dropdown":
                                case "singleSelect":
                                    return (
                                        <select required={field.required} value={formData[field.name] || ""} onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })} className="schedultron-input-hardened">
                                            <option value="">Select...</option>
                                            {field.options?.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                        </select>
                                    );
                                case "multiselect":
                                    return (
                                        <select multiple required={field.required} value={formData[field.name] || []} onChange={(e) => {
                                            const values = Array.from(e.target.selectedOptions, option => option.value);
                                            setFormData({ ...formData, [field.name]: values });
                                        }} className="schedultron-input-hardened h-[128px]">
                                            {field.options?.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                        </select>
                                    );
                                case "radio":
                                    return (
                                        <div className="flex gap-[16px] mt-[4px]">
                                            {field.options?.map((opt: any) => (
                                                <label key={opt.value} className="flex items-center gap-[8px] cursor-pointer" style={{ color: "var(--calendar-text)" }}>
                                                    <input type="radio" name={field.name} value={opt.value} checked={formData[field.name] === opt.value} onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })} className="w-[16px] h-[16px]" style={{ accentColor: "var(--calendar-primary)" }} />
                                                    {opt.label}
                                                </label>
                                            ))}
                                        </div>
                                    );
                                case "boolean":
                                    return (
                                        <input type="checkbox" checked={!!formData[field.name]} onChange={(e) => setFormData({ ...formData, [field.name]: e.target.checked })} className="w-[20px] h-[20px] mt-[4px] cursor-pointer rounded" style={{ accentColor: "var(--calendar-primary)" }} />
                                    );
                                case "attachment":
                                    return (
                                        <input type="file" required={field.required} onChange={(e) => {
                                            if (e.target.files && e.target.files.length > 0) {
                                                setFormData({ ...formData, [field.name]: e.target.files[0].name });
                                            }
                                        }} className="schedultron-input-hardened" />
                                    );
                                case "colorPicker":
                                    return <input type="color" required={field.required} value={formData[field.name] || "#000000"} onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })} className="w-[64px] h-[40px] p-[4px] border border-[#e5e7eb] rounded-lg cursor-pointer bg-white" />;
                                case "year":
                                    return <input type="number" required={field.required} placeholder="YYYY" value={formData[field.name] || ""} onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })} className="schedultron-input-hardened" />;
                                case "day":
                                    return <input type="number" required={field.required} min="1" max="31" placeholder="DD" value={formData[field.name] || ""} onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })} className="schedultron-input-hardened" />;
                                case "date":
                                    return (
                                        <DatePicker
                                            value={formData[field.name]}
                                            onChange={(val) => setFormData({ ...formData, [field.name]: val?.toISOString() })}
                                            timezone={timezone}
                                            dateFormat={dateFormat}
                                            calendarThemeVariant={calendarThemeVariant}
                                        />
                                    );
                                case "datetime":
                                case "datetime-local":
                                    return (
                                        <DateTimePicker
                                            value={formData[field.name]}
                                            onChange={(val) => setFormData({ ...formData, [field.name]: val?.toISOString() })}
                                            timezone={timezone}
                                            dateFormat={dateFormat}
                                            timeFormat={timeFormat}
                                            calendarThemeVariant={calendarThemeVariant}
                                        />
                                    );
                                case "daterange":
                                    return (
                                        <DateRangePicker
                                            value={formData[field.name]}
                                            onChange={(val) => setFormData({ ...formData, [field.name]: val })}
                                            timezone={timezone}
                                            dateFormat={dateFormat}
                                            calendarThemeVariant={calendarThemeVariant}
                                        />
                                    );
                                case "datetimerange":
                                    const rangeValue = formData[field.name] || (field.name === "range" ? {
                                        start: formData.start ? moment(formData.start) : null,
                                        end: formData.end ? moment(formData.end) : null
                                    } : null);
                                    return (
                                        <DateTimeRangePicker
                                            value={rangeValue}
                                            onChange={(val) => {
                                                if (field.name === "range") {
                                                    setFormData({
                                                        ...formData,
                                                        start: val?.start?.toISOString(),
                                                        end: val?.end?.toISOString()
                                                    });
                                                } else {
                                                    setFormData({ ...formData, [field.name]: val });
                                                }
                                            }}
                                            timezone={timezone}
                                            dateFormat={dateFormat}
                                            timeFormat={timeFormat}
                                            calendarThemeVariant={calendarThemeVariant}
                                        />
                                    );
                                default:
                                    const isCustomFormat = !!((field.type === "time") && (timeFormat));
                                    const displayValue = (() => {
                                        const val = formData[field.name];
                                        if (!val || !isCustomFormat) return val || "";
                                        const m = moment.tz(val, timezone);
                                        if (!m.isValid()) return val || "";

                                        if (field.type === "time") {
                                            return m.format(timeFormat || "HH:mm");
                                        }
                                        return val;
                                    })();

                                    return (
                                        <div className="relative">
                                            <input
                                                type={isCustomFormat ? "text" : field.type}
                                                required={field.required}
                                                placeholder={
                                                    field.type === "time" ? (timeFormat || "HH:mm") : ""
                                                }
                                                value={displayValue}
                                                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                                onClick={() => {
                                                    if (isCustomFormat) {
                                                        setActivePicker({ name: field.name, type: "time" });
                                                    }
                                                }}
                                                className={`schedultron-input-hardened ${isCustomFormat ? "pr-[48px]" : ""}`}
                                                readOnly={isCustomFormat}
                                            />
                                            {isCustomFormat && (
                                                <div
                                                    className="absolute right-[14px] top-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform z-10"
                                                    style={{ color: "var(--calendar-secondary-text)" }}
                                                    onClick={() => {
                                                        setActivePicker({ name: field.name, type: "time" });
                                                    }}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                                    </svg>
                                                </div>
                                            )}
                                            {isCustomFormat && activePicker?.name === field.name && activePicker.type === "time" && (
                                                <>
                                                    <div className="fixed inset-0 z-[60]" onClick={() => setActivePicker(null)} />
                                                    <TimeSlotPicker
                                                        value={
                                                            formData[field.name]
                                                                ? moment.tz(formData[field.name], timeFormat || "HH:mm", timezone).format(timeFormat || "HH:mm")
                                                                : ""
                                                        }
                                                        onChange={(val) => {
                                                            setFormData({ ...formData, [field.name]: val });
                                                            setActivePicker(null);
                                                        }}
                                                        timeFormat={timeFormat || "HH:mm"}
                                                        slotInterval={slotInterval}
                                                        timezone={timezone}
                                                        enabledTimeSlots={enabledTimeSlots}
                                                        disabledTimeSlots={disabledTimeSlots}
                                                        enabledTimeInterval={enabledTimeInterval}
                                                        disableTimeInterval={disableTimeInterval}
                                                        checkIsSlotEnabled={checkIsSlotEnabled}
                                                    />
                                                </>
                                            )}
                                        </div>
                                    );
                            }
                        })()}
                    </div>
                ))}

                {/* RECURRENCE SECTION (Google Style) */}
                {enableRecurrence && (
                    <div className="schedultron-field-container border-t pt-4 mt-2">
                        <div className="flex items-start gap-4">
                            <div className="w-6 pt-1 flex-shrink-0 opacity-60" style={{ color: "var(--calendar-text)" }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                            </div>
                            <div className="flex-1">
                                <select
                                    value={
                                        formData.recurrence
                                            ? (formData.recurrence.interval > 1 || (formData.recurrence as any).isCustomUI ? "custom" :
                                                (formData.recurrence.weekDays?.length === 5 && formData.recurrence.weekDays.every((d: number) => d >= 1 && d <= 5) ? "weekday" :
                                                    formData.recurrence.frequency))
                                            : "none"
                                    }
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === "none") {
                                            setFormData({ ...formData, recurrence: null });
                                        } else if (val === "custom") {
                                            setIsCustomRecurrenceOpen(true);
                                        } else if (val === "weekday") {
                                            setFormData({ ...formData, recurrence: { frequency: "daily", interval: 1, weekDays: [1, 2, 3, 4, 5] } });
                                        } else if (val === "annually") {
                                            setFormData({ ...formData, recurrence: { frequency: "monthly", interval: 12 } });
                                        } else {
                                            setFormData({ ...formData, recurrence: { frequency: val as any, interval: 1 } });
                                        }
                                    }}
                                    className="text-sm font-medium bg-transparent hover:opacity-80 p-2 -ml-2 rounded-md transition-opacity outline-none cursor-pointer w-full"
                                    style={{ color: "var(--calendar-text)" }}
                                >
                                    {recurrenceOptions.map(opt => (
                                        <option key={opt.value} value={opt.value} style={{ backgroundColor: "var(--calendar-bg)", color: "var(--calendar-text)" }}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>

                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-between mt-4">
                    {editingEvent && onDeleteEvent && (
                        <button
                            onClick={() => {
                                if (editingEvent.recurrence || editingEvent.parentId) {
                                    setRecurrenceChoice({ type: "delete", data: editingEvent.id });
                                } else {
                                    onDeleteEvent(editingEvent.id);
                                    onClose();
                                }
                            }}
                            className="schedultron-btn-danger"
                        >
                            Delete Event
                        </button>
                    )}

                    <div className="flex gap-2 ml-auto">
                        <button
                            onClick={onClose}
                            className="schedultron-btn-secondary"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={() => {
                                try {
                                    const parseInTimezone = (value: string) => {
                                        if (!value) return moment().utc().toISOString();
                                        if (value.includes("T") && (value.includes("Z") || value.split(":").length > 2)) return moment(value).toISOString();

                                        if (dateFormat && timeFormat) {
                                            const customDateTime = moment.tz(value, `${dateFormat} ${timeFormat}`, timezone);
                                            if (customDateTime.isValid()) return customDateTime.toISOString();
                                        }

                                        const fallback = moment.tz(value, "YYYY-MM-DDTHH:mm", timezone);
                                        return fallback.isValid() ? fallback.toISOString() : moment().utc().toISOString();
                                    };

                                    const finalData = {
                                        ...formData,
                                        start: formData.start ? parseInTimezone(formData.start) : formData.start,
                                        end: formData.end ? parseInTimezone(formData.end) : formData.end,
                                        recurrence: formData.recurrence
                                    };

                                    const errors = pluginManager.triggerValidateSave(finalData);
                                    if (errors.length > 0) {
                                        setValidationErrors(errors);
                                        return;
                                    }

                                    if (editingEvent && (editingEvent.recurrence || editingEvent.parentId)) {
                                        setRecurrenceChoice({ type: "save", data: finalData });
                                        return;
                                    }

                                    if (editingEvent) {
                                        const updatedEvent = { ...editingEvent, ...finalData };
                                        onEditEvent?.(updatedEvent);
                                        pluginManager.triggerOnEventChange(updatedEvent);
                                    } else {
                                        const newEvent = { id: Date.now().toString(), ...finalData };
                                        onAddEvent?.(newEvent);
                                    }
                                    onClose();
                                } catch (err: any) {
                                    console.error("[EventFormModal] Save Error:", err);
                                }
                            }}
                            className="schedultron-btn-primary"
                        >
                            Save Event
                        </button>
                    </div>
                </div>
            </div>

            {/* RECURRENCE CHOICE MODAL */}
            {recurrenceChoice && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[80] animate-fadeIn">
                    <div className="bg-white rounded-2xl p-8 w-[400px] shadow-2xl animate-scaleIn" style={{ backgroundColor: "var(--calendar-bg)", color: "var(--calendar-text)" }}>
                        <h4 className="text-xl font-bold mb-4" style={{ color: "var(--calendar-text)" }}>Edit recurring event</h4>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => handleRecurrenceAction("single")}
                                className="w-full text-left p-4 rounded-xl border hover:opacity-80 transition-opacity"
                                style={{ borderColor: "var(--calendar-grid)", backgroundColor: "var(--calendar-secondary-bg)" }}
                            >
                                <div className="font-semibold" style={{ color: "var(--calendar-text)" }}>This event</div>
                                <div className="text-xs opacity-60" style={{ color: "var(--calendar-secondary-text)" }}>Only this instance will be affected</div>
                            </button>
                            <button
                                onClick={() => handleRecurrenceAction("following")}
                                className="w-full text-left p-4 rounded-xl border hover:opacity-80 transition-opacity"
                                style={{ borderColor: "var(--calendar-grid)", backgroundColor: "var(--calendar-secondary-bg)" }}
                            >
                                <div className="font-semibold" style={{ color: "var(--calendar-text)" }}>This and following events</div>
                                <div className="text-xs opacity-60" style={{ color: "var(--calendar-secondary-text)" }}>This and all future instances will be affected</div>
                            </button>
                            <button
                                onClick={() => handleRecurrenceAction("all")}
                                className="w-full text-left p-4 rounded-xl border hover:opacity-80 transition-opacity"
                                style={{ borderColor: "var(--calendar-grid)", backgroundColor: "var(--calendar-secondary-bg)" }}
                            >
                                <div className="font-semibold" style={{ color: "var(--calendar-text)" }}>All events</div>
                                <div className="text-xs opacity-60" style={{ color: "var(--calendar-secondary-text)" }}>All instances in the series will be affected</div>
                            </button>
                        </div>
                        <button
                            onClick={() => setRecurrenceChoice(null)}
                            className="mt-6 w-full py-2 text-sm font-medium opacity-60 hover:opacity-100"
                            style={{ color: "var(--calendar-text)" }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* CUSTOM VALIDATION POPUP */}
            {validationErrors.length > 0 && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] animate-fadeIn">
                    <div
                        className="bg-white rounded-2xl p-8 w-[450px] shadow-2xl border transform animate-scaleIn"
                        style={{
                            borderColor: conflictTemplate?.theme?.borderColor || "#fee2e2",
                            backgroundColor: conflictTemplate?.theme?.backgroundColor || "#fff"
                        }}
                    >
                        {conflictTemplate?.renderHeader ? (
                            conflictTemplate.renderHeader(conflictTemplate.title || "Conflict Detected", conflictTemplate.theme || { primaryColor: "#dc2626", secondaryColor: "#ef4444", backgroundColor: "#fff", textColor: "#1f2937", borderColor: "#fee2e2" })
                        ) : (
                            <div className="flex items-center gap-4 mb-6" style={{ color: conflictTemplate?.theme?.primaryColor || "#dc2626" }}>
                                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: conflictTemplate?.theme?.secondaryColor + "10" || "#fef2f2" }}>
                                    {conflictTemplate?.theme?.icon || <span className="text-2xl">⚠️</span>}
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold">{conflictTemplate?.title || "Conflict Detected"}</h4>
                                    <p className="text-sm opacity-70">{conflictTemplate?.description || "Overlapping schedule found"}</p>
                                </div>
                            </div>
                        )}

                        <div className="bg-gray-50 rounded-xl p-4 mb-6 max-h-60 overflow-y-auto border border-gray-100" style={{ backgroundColor: (conflictTemplate?.theme?.backgroundColor === "#fff" || !conflictTemplate?.theme?.backgroundColor) ? "#f9fafb" : conflictTemplate?.theme?.backgroundColor }}>
                            {conflictTemplate?.renderDetails ? (
                                conflictTemplate.renderDetails(validationErrors)
                            ) : (
                                validationErrors.map((err, i) => (
                                    <div key={i} className="mb-3 last:mb-0">
                                        <div className="text-sm font-medium text-gray-800 whitespace-pre-line leading-relaxed" style={{ color: conflictTemplate?.theme?.textColor || "#1f2937" }}>
                                            {err}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {conflictTemplate?.renderFooter ? (
                            conflictTemplate.renderFooter(() => setValidationErrors([]), conflictTemplate.theme || { primaryColor: "#dc2626", secondaryColor: "#ef4444", backgroundColor: "#fff", textColor: "#1f2937", borderColor: "#fee2e2" })
                        ) : (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setValidationErrors([])}
                                    className="flex-1 px-6 py-3 text-white font-semibold rounded-xl transition-all shadow-lg"
                                    style={{
                                        backgroundColor: conflictTemplate?.theme?.primaryColor || "#dc2626",
                                        boxShadow: conflictTemplate?.theme?.primaryColor ? `0 10px 15px -3px ${conflictTemplate.theme.primaryColor}40` : "0 10px 15px -3px rgba(220, 38, 38, 0.4)"
                                    }}
                                >
                                    {conflictTemplate?.buttonText || "I'll Fix It"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* CUSTOM RECURRENCE MODAL */}
            <CustomRecurrenceModal
                isOpen={isCustomRecurrenceOpen}
                onClose={() => setIsCustomRecurrenceOpen(false)}
                onDone={(customData) => {
                    setFormData({
                        ...formData,
                        recurrence: {
                            frequency: customData.frequency,
                            interval: customData.interval,
                            weekDays: customData.frequency === "weekly" ? customData.weekDays : undefined,
                            until: customData.endType === "on" ? customData.until : undefined,
                            isCustomUI: true
                        }
                    });
                    setIsCustomRecurrenceOpen(false);
                }}
                initialData={formData.recurrence}
                timezone={timezone}
            />
        </div>
    );
};
