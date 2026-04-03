import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, useMemo } from "react";
import moment from "moment-timezone";
import type { TimeRangePickerProps } from "./types";
import { PREDEFINED_CALENDAR_THEMES } from "./calendarThemes";

export const TimeRangePicker = forwardRef<HTMLInputElement, TimeRangePickerProps>(({
    value,
    onChange,
    timezone = moment.tz.guess() || "UTC",
    timeFormat = "HH:mm",
    calendarTheme,
    calendarThemeVariant = "classic_light",
    placeholder = "Select time range...",
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

    const mStart = value?.start ? moment.tz(value.start, timezone) : null;
    const mEnd = value?.end ? moment.tz(value.end, timezone) : null;

    const displayValue = useMemo(() => {
        if (!mStart && !mEnd) return "";
        const startStr = mStart?.isValid() ? mStart.format(timeFormat) : "...";
        const endStr = mEnd?.isValid() ? mEnd.format(timeFormat) : "...";
        return `${startStr} - ${endStr}`;
    }, [mStart, mEnd, timeFormat]);

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    const handleTimeSelect = (type: "start" | "end", h: number, m: number) => {
        const current = (type === "start" ? mStart : mEnd) || moment.tz(timezone);
        const next = current.clone().hour(h).minute(m);

        if (type === "start") {
            onChange?.({ start: next, end: value?.end || null });
        } else {
            onChange?.({ start: value?.start || null, end: next });
        }
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
                    className="absolute z-50 mt-2 w-[480px] bg-white rounded-2xl shadow-2xl border overflow-hidden animate-fadeIn backdrop-blur-xl flex flex-col"
                    style={{
                        backgroundColor: "var(--calendar-secondary-bg)",
                        borderColor: "var(--calendar-grid)"
                    }}
                >
                    <div className="p-4 bg-black/5 flex items-center justify-between border-b" style={{ borderColor: "var(--calendar-grid)" }}>
                        <div className="flex gap-4 items-baseline">
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Time Range Selection</span>
                        </div>
                        <div className="flex gap-3 text-xs font-mono font-bold">
                            <span className={mStart ? "text-blue-500" : "opacity-30"}>{mStart?.format(timeFormat) || "HH:mm"}</span>
                            <span className="opacity-30">-</span>
                            <span className={mEnd ? "text-indigo-500" : "opacity-30"}>{mEnd?.format(timeFormat) || "HH:mm"}</span>
                        </div>
                    </div>

                    <div className="flex h-64 divide-x" style={{ borderColor: "var(--calendar-grid)" }}>
                        {/* Start Selection */}
                        <div className="flex-1 flex">
                            <div className="flex-1 overflow-y-auto no-scrollbar border-r" style={{ borderColor: "var(--calendar-grid)" }}>
                                <div className="text-[8px] text-center py-2 uppercase opacity-40 font-black">Start HH</div>
                                {hours.map(h => (
                                    <button
                                        key={h}
                                        onClick={() => handleTimeSelect("start", h, mStart?.minute() || 0)}
                                        className={`w-full py-1.5 text-xs transition-colors ${mStart?.hour() === h ? 'font-bold' : 'opacity-60 hover:opacity-100'}`}
                                        style={{
                                            color: mStart?.hour() === h ? "var(--calendar-primary)" : "var(--calendar-text)",
                                            backgroundColor: mStart?.hour() === h ? "var(--calendar-primary)10" : "transparent"
                                        }}
                                    >
                                        {h.toString().padStart(2, '0')}
                                    </button>
                                ))}
                            </div>
                            <div className="flex-1 overflow-y-auto no-scrollbar">
                                <div className="text-[8px] text-center py-2 uppercase opacity-40 font-black">Start MM</div>
                                {minutes.map(m => (
                                    <button
                                        key={m}
                                        onClick={() => handleTimeSelect("start", mStart?.hour() || 0, m)}
                                        className={`w-full py-1.5 text-xs transition-colors ${mStart?.minute() === m ? 'font-bold' : 'opacity-60 hover:opacity-100'}`}
                                        style={{
                                            color: mStart?.minute() === m ? "var(--calendar-primary)" : "var(--calendar-text)",
                                            backgroundColor: mStart?.minute() === m ? "var(--calendar-primary)10" : "transparent"
                                        }}
                                    >
                                        {m.toString().padStart(2, '0')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* End Selection */}
                        <div className="flex-1 flex">
                            <div className="flex-1 overflow-y-auto no-scrollbar border-r" style={{ borderColor: "var(--calendar-grid)" }}>
                                <div className="text-[8px] text-center py-2 uppercase opacity-40 font-black bg-black/5">End HH</div>
                                {hours.map(h => (
                                    <button
                                        key={h}
                                        onClick={() => handleTimeSelect("end", h, mEnd?.minute() || 0)}
                                        className={`w-full py-1.5 text-xs transition-colors ${mEnd?.hour() === h ? 'font-bold' : 'opacity-60 hover:opacity-100'}`}
                                        style={{
                                            color: mEnd?.hour() === h ? "var(--calendar-primary)" : "var(--calendar-text)",
                                            backgroundColor: mEnd?.hour() === h ? "var(--calendar-primary)10" : "transparent"
                                        }}
                                    >
                                        {h.toString().padStart(2, '0')}
                                    </button>
                                ))}
                            </div>
                            <div className="flex-1 overflow-y-auto no-scrollbar">
                                <div className="text-[8px] text-center py-2 uppercase opacity-40 font-black bg-black/5">End MM</div>
                                {minutes.map(m => (
                                    <button
                                        key={m}
                                        onClick={() => handleTimeSelect("end", mEnd?.hour() || 0, m)}
                                        className={`w-full py-1.5 text-xs transition-colors ${mEnd?.minute() === m ? 'font-bold' : 'opacity-60 hover:opacity-100'}`}
                                        style={{
                                            color: mEnd?.minute() === m ? "var(--calendar-primary)" : "var(--calendar-text)",
                                            backgroundColor: mEnd?.minute() === m ? "var(--calendar-primary)10" : "transparent"
                                        }}
                                    >
                                        {m.toString().padStart(2, '0')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-black/5 flex items-center justify-between">
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    const now = moment.tz(timezone);
                                    onChange?.({ start: now.clone(), end: now.clone().add(1, 'hour') });
                                }}
                                className="px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 transition-colors"
                            >
                                Now +1h
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-8 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                        >
                            Confirm Interval
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
});
