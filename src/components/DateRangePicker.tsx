import { useState, useRef, useEffect, forwardRef, useImperativeHandle, useMemo } from "react";
import moment from "moment-timezone";
import { CalendarPanel } from "./CalendarPanel";
import { PREDEFINED_CALENDAR_THEMES } from "./calendarThemes";
import type { DateRangePickerProps, RangeValue } from "./types";

export const DateRangePicker = forwardRef<HTMLInputElement, DateRangePickerProps>(({
    value,
    onChange,
    timezone = moment.tz.guess() || "UTC",
    dateFormat = "YYYY-MM-DD",
    calendarTheme,
    calendarThemeVariant = "classic_light",
    placeholder = "Select date range...",
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

    const range = value || { start: null, end: null };
    const displayValue = range.start ? `${range.start.format(dateFormat)} - ${range.end ? range.end.format(dateFormat) : "..."}` : "";

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
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-50 mt-2">
                    <CalendarPanel
                        value={range}
                        onChange={(val: RangeValue) => {
                            onChange?.(val);
                        }}
                        mode="range"
                        timezone={timezone}
                        calendarTheme={calendarTheme}
                        calendarThemeVariant={calendarThemeVariant}
                        onClose={() => setIsOpen(false)}
                    />
                </div>
            )}
        </div>
    );
});

DateRangePicker.displayName = "DateRangePicker";
