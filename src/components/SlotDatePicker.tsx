import React, { useState, useMemo, useRef, useEffect } from "react";
import moment, { type Moment } from "moment-timezone";
import { PREDEFINED_CALENDAR_THEMES } from "./calendarThemes";
import type { CalendarTheme } from "./types";

export interface TimeSlot {
    time: string;
}

export interface SlotGroup {
    group: string;
    items: TimeSlot[];
}

export interface SlotDatePickerProps {
    value?: string | Date | Moment;
    onChange?: (date: Moment) => void;
    timezone?: string;
    dateFormat?: string;
    calendarTheme?: CalendarTheme;
    calendarThemeVariant?: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    slots?: SlotGroup[];
    onSlotSelect?: (time: string) => void;
    selectedSlot?: string;
}

export const SlotDatePicker: React.FC<SlotDatePickerProps> = ({
    value,
    onChange,
    timezone = moment.tz.guess() || "UTC",
    calendarTheme,
    calendarThemeVariant,
    className = "",
    disabled = false,
    slots,
    onSlotSelect,
    selectedSlot
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isOpen]);

    const activeTheme = useMemo(() => {
        if (calendarTheme) return calendarTheme;
        if (calendarThemeVariant && PREDEFINED_CALENDAR_THEMES[calendarThemeVariant]) {
            return PREDEFINED_CALENDAR_THEMES[calendarThemeVariant];
        }
        return PREDEFINED_CALENDAR_THEMES.classic_light;
    }, [calendarTheme, calendarThemeVariant]);

    const themeStyles = useMemo(() => ({
        "--calendar-primary": activeTheme.primaryColor,
        "--calendar-bg": activeTheme.backgroundColor,
        "--calendar-secondary-bg": activeTheme.secondaryBackgroundColor,
        "--calendar-grid": activeTheme.gridColor,
        "--calendar-text": activeTheme.textColor,
        "--calendar-secondary-text": activeTheme.secondaryTextColor,
    } as React.CSSProperties), [activeTheme]);

    const [viewDate, setViewDate] = useState(() => {
        const d = value ? moment.tz(value, timezone) : moment.tz(timezone);
        return d.isValid() ? d : moment.tz(timezone);
    });

    useEffect(() => {
        if (value && isOpen) {
            const d = moment.tz(value, timezone);
            if (d.isValid()) {
                setViewDate(d);
            }
        }
    }, [value, isOpen, timezone]);

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

    const getGroupIcon = (name: string) => {
        const isMorning = name.toLowerCase().includes("morning");
        if (isMorning) {
            return (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                    <path d="M16 12a4 4 0 0 0-8 0" />
                    <path d="M4 16h16" />
                </svg>
            );
        }
        return (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 4.22l1.42 1.42" />
            </svg>
        );
    };

    return (
        <div className={`flex flex-col md:flex-row rounded-xl border ${className}`} style={{ ...themeStyles, backgroundColor: "var(--calendar-secondary-bg)", borderColor: "var(--calendar-grid)", width: slots && slots.length > 0 ? 'fit-content' : undefined }}>
            <div className={`flex flex-col p-4 ${slots && slots.length > 0 ? 'md:border-r border-b md:border-b-0' : ''}`} style={{ borderColor: "var(--calendar-grid)", minWidth: "300px" }}>
                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={(e) => { e.preventDefault(); setViewDate(viewDate.clone().subtract(1, "month")); }}
                        className="p-1 px-3 hover:opacity-70 rounded transition-opacity"
                        style={{ color: "var(--calendar-text)" }}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div className="font-semibold text-base" style={{ color: "var(--calendar-text)" }}>
                        {viewDate.format("MMMM YYYY")}
                    </div>
                    <button
                        onClick={(e) => { e.preventDefault(); setViewDate(viewDate.clone().add(1, "month")); }}
                        className="p-1 px-3 hover:opacity-70 rounded transition-opacity"
                        style={{ color: "var(--calendar-text)" }}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>

                <div className="grid grid-cols-7 mb-2">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                        <div key={d} className="text-center text-xs font-bold uppercase mb-1" style={{ color: "var(--calendar-secondary-text)" }}>{d}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {days.map((d, i) => {
                        const isCurrentMonth = d.isSame(viewDate, "month");
                        const isSelected = value ? d.isSame(moment.tz(value, timezone), "day") : false;

                        let bgStyle = { backgroundColor: "transparent" };
                        let textStyle = { color: "var(--calendar-text)" };

                        if (isSelected) {
                            bgStyle = { backgroundColor: "var(--calendar-primary)" };
                            textStyle = { color: "#ffffff" };
                        }

                        return (
                            <button
                                key={i}
                                disabled={disabled}
                                onClick={() => {
                                    if (onChange) onChange(d);
                                }}
                                className={`h-10 w-10 mx-auto flex items-center justify-center rounded-full text-sm font-medium transition-colors ${!disabled ? "hover:opacity-70 calendar-hover-bg" : "cursor-not-allowed"
                                    }`}
                                style={{
                                    ...bgStyle,
                                    ...textStyle,
                                    opacity: isCurrentMonth ? (disabled ? 0.6 : 1) : 0.3
                                }}
                            >
                                {d.date()}
                            </button>
                        );
                    })}
                </div>
            </div>

            {slots && slots.length > 0 && (
                <div className="flex flex-col p-6 rounded-r-xl" style={{ minWidth: "320px", backgroundColor: "var(--calendar-secondary-bg)" }}>
                    <div className="text-sm mb-1" style={{ color: "var(--calendar-secondary-text)" }}>
                        {moment.tz(value || viewDate, timezone).format("dddd D, MMMM YYYY")}
                    </div>
                    <div className="font-semibold text-lg mb-6" style={{ color: "var(--calendar-text)" }}>
                        What time works best for you?
                    </div>

                    <div className="flex flex-col gap-6" style={{ maxHeight: "310px", overflowY: "auto", paddingRight: "8px" }}>
                        {slots.map((group, gIdx) => (
                            <div key={gIdx} className="flex flex-col">
                                <div className="flex items-center gap-2 mb-3 font-medium text-base" style={{ color: "var(--calendar-text)" }}>
                                    {getGroupIcon(group.group)}
                                    {group.group}
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {group.items.map((slot, sIdx) => {
                                        const isSelectedSlot = selectedSlot === slot.time;
                                        return (
                                            <button
                                                key={sIdx}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (onSlotSelect) onSlotSelect(slot.time);
                                                }}
                                                className="py-2 rounded-md text-sm font-medium transition-colors cursor-pointer hover:opacity-80"
                                                style={{
                                                    backgroundColor: isSelectedSlot ? "var(--calendar-primary)" : "var(--calendar-grid)",
                                                    color: isSelectedSlot ? "#ffffff" : "var(--calendar-text)",
                                                    border: "none",
                                                    opacity: isSelectedSlot ? 1 : 0.8
                                                }}
                                            >
                                                {slot.time}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
