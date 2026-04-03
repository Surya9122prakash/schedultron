import React, { useState, useMemo, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
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

export const SlotDatePicker = forwardRef<HTMLDivElement, SlotDatePickerProps>(({
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
}, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => containerRef.current!);

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
        "--calendar-is-dark": ["dark_night", "midnight_purple", "cyber_punk"].includes(calendarThemeVariant || "") ? "1" : "0"
    } as React.CSSProperties), [activeTheme, calendarThemeVariant]);

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
        <div className={`flex flex-col md:flex-row rounded-[32px] border-2 shadow-2xl overflow-hidden ${className}`} style={{ ...themeStyles, backgroundColor: "var(--calendar-secondary-bg)", borderColor: "var(--calendar-grid)", width: 'fit-content', height: 'fit-content', maxWidth: '100%', position: 'relative' }}>
            <style>{`
                .premium-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .premium-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .premium-scrollbar::-webkit-scrollbar-thumb {
                    background: var(--calendar-grid);
                    border-radius: 10px;
                }
                .premium-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: var(--calendar-primary);
                }
                /* Firefox support */
                .premium-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: var(--calendar-grid) transparent;
                }
            `}</style>

            {/* Left Panel: Calendar */}
            <div className={`flex flex-col p-8 ${slots && slots.length > 0 ? 'md:border-r border-b md:border-b-0' : ''}`} style={{ borderColor: "var(--calendar-grid)", minWidth: "340px" }}>
                <div className="flex justify-between items-center mb-8">
                    <div className="flex gap-2 items-center">
                        <select
                            value={viewDate.month()}
                            onChange={(e) => setViewDate(viewDate.clone().month(parseInt(e.target.value)))}
                            className="text-sm font-bold bg-white/5 rounded-lg px-2 py-1 outline-none cursor-pointer hover:bg-white/10 transition-colors uppercase tracking-tight"
                            style={{ color: "var(--calendar-text)" }}
                        >
                            {moment.months().map((m, i) => <option key={m} value={i} className="bg-[#1e1e1e]">{m}</option>)}
                        </select>
                        <select
                            value={viewDate.year()}
                            onChange={(e) => setViewDate(viewDate.clone().year(parseInt(e.target.value)))}
                            className="text-sm font-bold bg-white/5 rounded-lg px-2 py-1 outline-none cursor-pointer hover:bg-white/10 transition-colors uppercase tracking-tight"
                            style={{ color: "var(--calendar-text)" }}
                        >
                            {Array.from({ length: 20 }, (_, i) => viewDate.year() - 10 + i).map(y => <option key={y} value={y} className="bg-[#1e1e1e]">{y}</option>)}
                        </select>
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={(e) => { e.preventDefault(); setViewDate(viewDate.clone().subtract(1, "month")); }}
                            className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-full transition-all"
                            style={{ color: "var(--calendar-text)" }}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button
                            onClick={(e) => { e.preventDefault(); setViewDate(viewDate.clone().add(1, "month")); }}
                            className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-full transition-all"
                            style={{ color: "var(--calendar-text)" }}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 mb-4">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                        <div key={d} className="text-center text-[10px] font-black uppercase tracking-widest opacity-40 mb-1" style={{ color: "var(--calendar-text)" }}>{d}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {days.map((d, i) => {
                        const isCurrentMonth = d.isSame(viewDate, "month");
                        const isSelected = value ? d.isSame(moment.tz(value, timezone), "day") : false;

                        return (
                            <button
                                key={i}
                                disabled={disabled}
                                onClick={() => onChange?.(d)}
                                className={`h-10 w-10 mx-auto flex items-center justify-center rounded-xl text-sm font-bold transition-all relative
                                    ${isSelected ? "z-10 shadow-lg scale-110" : "hover:bg-white/5 hover:scale-105"}
                                    ${!isCurrentMonth ? "opacity-20" : "opacity-100"}
                                `}
                                style={{
                                    backgroundColor: isSelected ? "var(--calendar-primary)" : "transparent",
                                    color: isSelected ? "#ffffff" : "var(--calendar-text)",
                                    boxShadow: isSelected ? `0 8px 15px var(--calendar-primary)44` : "none"
                                }}
                            >
                                {d.date()}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Right Panel: Time Slots */}
            {slots && slots.length > 0 && (
                <div className="flex flex-col p-8 w-full md:w-[400px]" style={{ backgroundColor: "var(--calendar-bg)" }}>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-50" style={{ color: "var(--calendar-text)" }}>
                        {moment.tz(value || viewDate, timezone).format("dddd, MMM D")}
                    </div>
                    <div className="font-extrabold text-2xl mb-8 leading-tight tracking-tight" style={{ color: "var(--calendar-text)" }}>
                        What time works best for you?
                    </div>

                    <div className="flex flex-col gap-10 overflow-y-auto premium-scrollbar pr-6" style={{ maxHeight: "360px" }}>
                        {slots.map((group, gIdx) => (
                            <div key={gIdx} className="flex flex-col">
                                <div className="flex items-center gap-3 mb-5 font-black text-xs uppercase tracking-widest opacity-80" style={{ color: "var(--calendar-primary)" }}>
                                    {getGroupIcon(group.group)}
                                    {group.group}
                                </div>
                                <div className="grid gap-3 pb-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}>
                                    {group.items.map((slot, sIdx) => {
                                        const isSelectedSlot = selectedSlot === slot.time;
                                        return (
                                            <button
                                                key={sIdx}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    onSlotSelect?.(slot.time);
                                                }}
                                                className={`py-3 px-2 rounded-2xl text-[10px] font-black uppercase transition-all cursor-pointer border-2 shadow-sm
                                                    ${isSelectedSlot ? "scale-105 z-10" : "hover:border-white/20 hover:bg-white/5 active:scale-95"}
                                                `}
                                                style={{
                                                    backgroundColor: isSelectedSlot ? "var(--calendar-primary)" : "transparent",
                                                    color: isSelectedSlot ? "#ffffff" : "var(--calendar-text)",
                                                    borderColor: isSelectedSlot ? "var(--calendar-primary)" : "var(--calendar-grid)",
                                                    boxShadow: isSelectedSlot ? `0 8px 15px var(--calendar-primary)44` : "none"
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
});

SlotDatePicker.displayName = "SlotDatePicker";
