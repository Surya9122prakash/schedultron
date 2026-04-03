import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, useMemo } from "react";
import moment from "moment-timezone";
import type { TimePickerProps } from "./types";
import { PREDEFINED_CALENDAR_THEMES } from "./calendarThemes";

export const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(({
    value,
    onChange,
    timezone = moment.tz.guess() || "UTC",
    timeFormat = "HH:mm",
    calendarTheme,
    calendarThemeVariant = "classic_light",
    placeholder = "Select time...",
    className = "",
    disabled = false,
    name,
    onBlur
}, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);

    useImperativeHandle(ref, () => inputRef.current!);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const mValue = useMemo(() => {
        if (!value) return null;
        const m = moment.tz(value, timezone);
        return m.isValid() ? m : null;
    }, [value, timezone]);

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

    const displayValue = mValue ? mValue.format(timeFormat) : "";

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    const handleTimeSelect = (h: number, m: number) => {
        const current = mValue || moment.tz(timezone);
        const next = current.clone().hour(h).minute(m);
        onChange?.(next);
    };

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
                    className="w-full pl-4 pr-10 py-2 border rounded-xl focus:outline-none transition-all cursor-pointer text-sm"
                    style={{
                        backgroundColor: "var(--calendar-bg)",
                        color: "var(--calendar-text)",
                        borderColor: "var(--calendar-grid)",
                        boxShadow: isOpen ? "0 0 0 2px var(--calendar-primary)40" : "none"
                    }}
                />
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none opacity-50">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ color: "var(--calendar-text)" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>

            {isOpen && (
                <div
                    className="absolute z-50 mt-2 w-64 bg-white rounded-2xl shadow-2xl border overflow-hidden animate-fadeIn backdrop-blur-xl"
                    style={{
                        backgroundColor: "var(--calendar-secondary-bg)",
                        borderColor: "var(--calendar-grid)"
                    }}
                >
                    <div className="p-4 bg-black/5 flex items-center justify-between border-b" style={{ borderColor: "var(--calendar-grid)" }}>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Select Time</span>
                        <span className="text-xs font-mono font-bold text-blue-500">{displayValue || "--:--"}</span>
                    </div>

                    <div className="flex h-64">
                        {/* Hours */}
                        <div className="flex-1 overflow-y-auto no-scrollbar border-r" style={{ borderColor: "var(--calendar-grid)" }}>
                            <div className="text-[9px] text-center py-2 uppercase opacity-40 font-black">Hrs</div>
                            {hours.map(h => (
                                <button
                                    key={h}
                                    onClick={() => handleTimeSelect(h, mValue?.minute() || 0)}
                                    className={`w-full py-2 text-sm transition-colors ${mValue?.hour() === h ? 'font-bold' : 'opacity-60 hover:opacity-100 hover:bg-white/5'}`}
                                    style={{
                                        color: mValue?.hour() === h ? "var(--calendar-primary)" : "var(--calendar-text)",
                                        backgroundColor: mValue?.hour() === h ? "var(--calendar-primary)10" : "transparent"
                                    }}
                                >
                                    {h.toString().padStart(2, '0')}
                                </button>
                            ))}
                        </div>

                        {/* Minutes */}
                        <div className="flex-1 overflow-y-auto no-scrollbar">
                            <div className="text-[9px] text-center py-2 uppercase opacity-40 font-black">Min</div>
                            {minutes.map(m => (
                                <button
                                    key={m}
                                    onClick={() => handleTimeSelect(mValue?.hour() || 0, m)}
                                    className={`w-full py-2 text-sm transition-colors ${mValue?.minute() === m ? 'font-bold' : 'opacity-60 hover:opacity-100 hover:bg-white/5'}`}
                                    style={{
                                        color: mValue?.minute() === m ? "var(--calendar-primary)" : "var(--calendar-text)",
                                        backgroundColor: mValue?.minute() === m ? "var(--calendar-primary)10" : "transparent"
                                    }}
                                >
                                    {m.toString().padStart(2, '0')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-3 bg-black/5 flex gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                onChange?.(moment.tz(timezone));
                                setIsOpen(false);
                            }}
                            className="flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            Now
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20"
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
});
