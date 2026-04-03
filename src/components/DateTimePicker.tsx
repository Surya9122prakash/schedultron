import { useState, useRef, useEffect, forwardRef, useImperativeHandle, useMemo } from "react";
import moment from "moment-timezone";
import { CalendarPanel } from "./CalendarPanel";
import { PREDEFINED_CALENDAR_THEMES } from "./calendarThemes";
import type { DateTimePickerProps } from "./types";

export const DateTimePicker = forwardRef<HTMLInputElement, DateTimePickerProps>(({
    value,
    onChange,
    timezone = moment.tz.guess() || "UTC",
    dateFormat = "YYYY-MM-DD",
    timeFormat = "HH:mm",
    calendarTheme,
    calendarThemeVariant = "classic_light",
    placeholder = "Select date & time...",
    className = "",
    disabled = false,
    name,
    onBlur
}, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => inputRef.current!);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const activeTheme = useMemo(() => {
        if (calendarTheme) return calendarTheme;
        return PREDEFINED_CALENDAR_THEMES[calendarThemeVariant] || PREDEFINED_CALENDAR_THEMES.classic_light;
    }, [calendarTheme, calendarThemeVariant]);

    const themeStyles = useMemo(() => ({
        "--calendar-primary": activeTheme.primaryColor,
        "--calendar-bg": activeTheme.backgroundColor,
        "--calendar-secondary-bg": activeTheme.secondaryBackgroundColor,
        "--calendar-grid": activeTheme.gridColor,
        "--calendar-text": activeTheme.textColor,
        "--calendar-secondary-text": activeTheme.secondaryTextColor,
    } as React.CSSProperties), [activeTheme]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const mValue = value ? moment.tz(value, timezone) : null;
    const displayValue = mValue?.isValid() ? mValue.format(`${dateFormat} ${timeFormat}`) : "";

    return (
        <div ref={containerRef} className={`relative ${className}`} style={{ width: "100%", ...themeStyles }}>
            <div className="relative w-full">
                <input
                    ref={inputRef}
                    type="text"
                    readOnly
                    name={name}
                    onBlur={onBlur}
                    value={displayValue}
                    placeholder={placeholder}
                    disabled={disabled}
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    className="w-full pl-4 pr-10 py-2 border rounded-xl focus:outline-none focus:ring-2 transition-colors cursor-pointer"
                    style={{
                        backgroundColor: "var(--calendar-bg, #fff)",
                        color: "var(--calendar-text, #000)",
                        borderColor: "var(--calendar-grid, #e5e7eb)",
                        cursor: disabled ? "not-allowed" : "pointer"
                    }}
                />
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none opacity-50">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-50 mt-2 bg-white rounded-xl shadow-xl overflow-hidden animate-fadeIn" style={{ backgroundColor: "var(--calendar-secondary-bg, #f9fafb)", border: "1px solid var(--calendar-grid, #e5e7eb)" }}>
                    <CalendarPanel
                        value={mValue}
                        onChange={(d) => {
                            const newDate = d.clone().hour(mValue?.hour() || 0).minute(mValue?.minute() || 0);
                            onChange?.(newDate);
                        }}
                        mode="datetime"
                        timezone={timezone}
                        calendarTheme={calendarTheme}
                        calendarThemeVariant={calendarThemeVariant}
                    />
                    <div className="p-4 border-t" style={{ borderColor: "var(--calendar-grid, #e5e7eb)" }}>
                        <input
                            type="time"
                            value={mValue?.format("HH:mm") || ""}
                            onChange={(e) => {
                                const [h, m] = e.target.value.split(":");
                                const newDate = (mValue || moment.tz(timezone)).clone().hour(parseInt(h)).minute(parseInt(m));
                                onChange?.(newDate);
                            }}
                            className="w-full p-2 rounded-lg border outline-none text-sm"
                            style={{ backgroundColor: "var(--calendar-bg, #fff)", color: "var(--calendar-text, #000)", borderColor: "var(--calendar-grid, #e5e7eb)" }}
                        />
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-full mt-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
});

DateTimePicker.displayName = "DateTimePicker";
