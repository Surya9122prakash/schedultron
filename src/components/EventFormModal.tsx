import React, { useState, useMemo } from "react";
import moment from "moment-timezone";
import type { CalendarEvent, CalendarFormField, ConflictTemplate } from "./types";
import { PluginManager } from "./pluginSystem";
import { checkIsSlotEnabled } from "./utils";

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

const CustomDatePicker: React.FC<{
    value: string;
    onChange: (val: string) => void;
    dateFormat: string;
    timezone: string;
}> = ({ value, onChange, dateFormat, timezone }) => {
    const [viewDate, setViewDate] = useState(() => moment.tz(value, dateFormat, timezone).isValid() ? moment.tz(value, dateFormat, timezone) : moment.tz(timezone));

    const days = useMemo(() => {
        const start = viewDate.clone().startOf("month").startOf("week");
        const end = viewDate.clone().endOf("month").endOf("week");
        const result = [];
        let curr = start.clone();
        while (curr.isBefore(end)) {
            result.push(curr.clone());
            curr.add(1, "day");
        }
        return result;
    }, [viewDate]);

    return (
        <div className="absolute z-[70] border rounded shadow-xl mt-1 p-3 w-64 animate-fadeIn" style={{ backgroundColor: "var(--calendar-bg)", color: "var(--calendar-text)", borderColor: "var(--calendar-grid)" }}>
            <div className="flex justify-between items-center mb-2">
                <button onClick={() => setViewDate(viewDate.clone().subtract(1, "month"))} className="p-1 hover:opacity-70 rounded">←</button>
                <span className="font-semibold">{viewDate.format("MMMM YYYY")}</span>
                <button onClick={() => setViewDate(viewDate.clone().add(1, "month"))} className="p-1 hover:opacity-70 rounded">→</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-1 font-bold" style={{ color: "var(--calendar-secondary-text)" }}>
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {days.map((d, i) => {
                    const isSelected = value === d.format(dateFormat);
                    return (
                        <div
                            key={i}
                            onClick={() => onChange(d.format(dateFormat))}
                            className={`p-1.5 text-xs rounded cursor-pointer transition-colors ${d.isSame(viewDate, "month") ? "opacity-100 hover:opacity-70" : "opacity-40 hover:opacity-70"}`}
                            style={isSelected ? { backgroundColor: "var(--calendar-primary)", color: "var(--calendar-event-text)" } : {}}
                        >
                            {d.date()}
                        </div>
                    );
                })}
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
}) => {
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [activePicker, setActivePicker] = useState<{ name: string; type: "date" | "time" } | null>(null);

    if (!isOpen) return null;

    return (
        <div className="schedultron-modal-overlay animate-fadeIn">
            <div className="schedultron-modal-content animate-scaleIn">
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
                                default:
                                    const isCustomFormat = !!((field.type === "datetime-local" || field.type === "datetime" || field.type === "date" || field.type === "time") && (dateFormat || timeFormat));
                                    const displayValue = (() => {
                                        const val = formData[field.name];
                                        if (!val || !isCustomFormat) return val || "";
                                        const m = moment.tz(val, timezone);
                                        if (!m.isValid()) return val || "";

                                        if (field.type === "datetime-local" || field.type === "datetime") {
                                            return m.format(`${dateFormat || "YYYY-MM-DD"} ${timeFormat || "HH:mm"}`);
                                        } else if (field.type === "date") {
                                            return m.format(dateFormat || "YYYY-MM-DD");
                                        } else if (field.type === "time") {
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
                                                    (field.type === "datetime-local" || field.type === "datetime")
                                                        ? `${dateFormat || "YYYY-MM-DD"} ${timeFormat || "HH:mm"}`
                                                        : field.type === "date" ? (dateFormat || "YYYY-MM-DD")
                                                            : field.type === "time" ? (timeFormat || "HH:mm")
                                                                : ""
                                                }
                                                value={displayValue}
                                                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                                onClick={() => {
                                                    if (isCustomFormat) {
                                                        setActivePicker({ name: field.name, type: (field.type === "time" ? "time" : "date") });
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
                                                        setActivePicker({ name: field.name, type: (field.type === "time" ? "time" : "date") });
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
                                            {isCustomFormat && activePicker?.name === field.name && activePicker.type === "date" && (
                                                <>
                                                    <div className="fixed inset-0 z-[60]" onClick={() => setActivePicker(null)} />
                                                    <CustomDatePicker
                                                        value={
                                                            formData[field.name]
                                                                ? moment.tz(formData[field.name], `${dateFormat || "YYYY-MM-DD"} ${timeFormat || "HH:mm"}`, timezone).format(dateFormat || "YYYY-MM-DD")
                                                                : ""
                                                        }
                                                        onChange={(val) => {
                                                            let newVal = val;
                                                            if (field.type === "datetime-local" || field.type === "datetime") {
                                                                const currentVal = formData[field.name];
                                                                const parsed = moment.tz(currentVal, `${dateFormat || "YYYY-MM-DD"} ${timeFormat || "HH:mm"}`, timezone);
                                                                const currentTime = parsed.isValid() ? parsed.format(timeFormat || "HH:mm") : moment().format(timeFormat || "HH:mm");
                                                                newVal = `${val} ${currentTime}`;
                                                                setActivePicker({ name: field.name, type: "time" });
                                                            } else {
                                                                setActivePicker(null);
                                                            }
                                                            setFormData({ ...formData, [field.name]: newVal });
                                                        }}
                                                        dateFormat={dateFormat || "YYYY-MM-DD"}
                                                        timezone={timezone}
                                                    />
                                                </>
                                            )}
                                            {isCustomFormat && activePicker?.name === field.name && activePicker.type === "time" && (
                                                <>
                                                    <div className="fixed inset-0 z-[60]" onClick={() => setActivePicker(null)} />
                                                    <TimeSlotPicker
                                                        value={
                                                            formData[field.name]
                                                                ? moment.tz(formData[field.name], `${dateFormat || "YYYY-MM-DD"} ${timeFormat || "HH:mm"}`, timezone).format(timeFormat || "HH:mm")
                                                                : ""
                                                        }
                                                        onChange={(val) => {
                                                            let newVal = val;
                                                            if (field.type === "datetime-local" || field.type === "datetime") {
                                                                const currentVal = formData[field.name];
                                                                const parsed = moment.tz(currentVal, `${dateFormat || "YYYY-MM-DD"} ${timeFormat || "HH:mm"}`, timezone);
                                                                const currentDate = parsed.isValid() ? parsed.format(dateFormat || "YYYY-MM-DD") : moment().format(dateFormat || "YYYY-MM-DD");
                                                                newVal = `${currentDate} ${val}`;
                                                            }
                                                            setFormData({ ...formData, [field.name]: newVal });
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

                <div className="flex justify-between mt-4">
                    {editingEvent && onDeleteEvent && (
                        <button
                            onClick={() => {
                                onDeleteEvent(editingEvent.id);
                                onClose();
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
                                        console.log("[EventFormModal] parseInTimezone input:", value);
                                        if (!value) return moment().utc().toISOString();

                                        if (value.includes("T") && (value.includes("Z") || value.split(":").length > 2)) {
                                            const iso = moment(value).toISOString();
                                            console.log("[EventFormModal] recognized ISO:", iso);
                                            return iso;
                                        }

                                        if (dateFormat && timeFormat) {
                                            const customDateTime = moment.tz(value, `${dateFormat} ${timeFormat}`, timezone);
                                            if (customDateTime.isValid()) {
                                                const iso = customDateTime.toISOString();
                                                console.log("[EventFormModal] parsed via custom format:", iso);
                                                return iso;
                                            }
                                        }

                                        const fallback = moment.tz(value, "YYYY-MM-DDTHH:mm", timezone);
                                        if (fallback.isValid()) {
                                            const iso = fallback.toISOString();
                                            console.log("[EventFormModal] parsed via fallback format:", iso);
                                            return iso;
                                        }

                                        console.warn("[EventFormModal] failed to parse date, returning current time as fallback");
                                        return moment().utc().toISOString();
                                    };

                                    const finalData = {
                                        ...formData,
                                        start: formData.start ? parseInTimezone(formData.start) : formData.start,
                                        end: formData.end ? parseInTimezone(formData.end) : formData.end,
                                    };

                                    console.log("[EventFormModal] finalData:", finalData);
                                    // alert("[DEBUG] finalData: " + JSON.stringify(finalData));

                                    const errors = pluginManager.triggerValidateSave(finalData);
                                    if (errors.length > 0) {
                                        setValidationErrors(errors);
                                        return;
                                    }

                                    if (editingEvent) {
                                        const updatedEvent = {
                                            ...editingEvent,
                                            ...finalData,
                                        };

                                        onEditEvent?.(updatedEvent);
                                        pluginManager.triggerOnEventChange(updatedEvent);
                                    } else {
                                        const newEvent = {
                                            id: Date.now().toString(),
                                            ...finalData,
                                        };

                                        onAddEvent?.(newEvent);
                                    }
                                    onClose();
                                } catch (err: any) {
                                    console.error("[EventFormModal] Save Error:", err);
                                    alert("SAVE ERROR: " + err.message);
                                }
                            }}
                            className="schedultron-btn-primary"
                        >
                            Save Event
                        </button>
                    </div>
                </div>
            </div>

            {/* CUSTOM VALIDATION POPUP */}
            {
                validationErrors.length > 0 && (
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

                            <div className="bg-gray-50 rounded-xl p-4 mb-6 max-h-60 overflow-y-auto border border-gray-100" style={{ backgroundColor: conflictTemplate?.theme?.backgroundColor === "#fff" ? "#f9fafb" : conflictTemplate?.theme?.backgroundColor }}>
                                {conflictTemplate?.renderDetails ? (
                                    conflictTemplate.renderDetails(validationErrors)
                                ) : (
                                    validationErrors.map((err: string, i: number) => (
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
                                            boxShadow: `0 10px 15px -3px ${conflictTemplate?.theme?.primaryColor}40` || "0 10px 15px -3px rgba(220, 38, 38, 0.4)"
                                        }}
                                    >
                                        {conflictTemplate?.buttonText || "I'll Fix It"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }
        </div >
    );
};
