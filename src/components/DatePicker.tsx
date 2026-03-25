import React, { useState, useMemo, useRef, useEffect } from "react";
import moment, { type Moment } from "moment-timezone";
import { PREDEFINED_CALENDAR_THEMES } from "./calendarThemes";
import type { CalendarTheme } from "./types";

export interface DatePickerProps {
    value?: string | Date | Moment;
    onChange?: (date: Moment) => void;
    timezone?: string;
    dateFormat?: string;
    calendarTheme?: CalendarTheme;
    calendarThemeVariant?: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({
    value,
    onChange,
    timezone = moment.tz.guess() || "UTC",
    dateFormat = "YYYY-MM-DD",
    calendarTheme,
    calendarThemeVariant,
    placeholder = "Select date...",
    className = "",
    disabled = false
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
        };
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

    const formatValue = (v: any) => {
        if (!v) return "";
        const m = moment.tz(v, timezone);
        if (m.isValid()) return m.format(dateFormat);
        return "";
    };

    const displayValue = formatValue(value);

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

    return (
        <div ref={containerRef} className={`relative ${className}`} style={themeStyles}>
            <div className="relative w-full">
                <input
                    type="text"
                    readOnly
                    value={displayValue}
                    placeholder={placeholder}
                    disabled={disabled}
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    className="w-full pl-4 pr-10 py-2 border rounded-xl focus:outline-none focus:ring-2 transition-colors"
                    style={{
                        backgroundColor: "var(--calendar-bg)",
                        color: "var(--calendar-text)",
                        borderColor: "var(--calendar-grid)",
                        cursor: disabled ? "not-allowed" : "pointer",
                        outlineColor: "var(--calendar-primary)"
                    }}
                />
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <svg
                        className="w-5 h-5 calendar-icon-align"
                        style={{ color: "var(--calendar-secondary-text)" }}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-50 mt-2 flex flex-col p-4 rounded-xl border shadow-lg" style={{ backgroundColor: "var(--calendar-secondary-bg)", borderColor: "var(--calendar-grid)", minWidth: "300px" }}>
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
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (onChange) onChange(d);
                                        setIsOpen(false);
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
            )}
        </div>
    );
};
