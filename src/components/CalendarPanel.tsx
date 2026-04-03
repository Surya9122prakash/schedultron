import React, { useState, useMemo } from "react";
import moment, { type Moment } from "moment-timezone";
import { PREDEFINED_CALENDAR_THEMES } from "./calendarThemes";
import type { CalendarTheme } from "./types";

export interface CalendarPanelProps {
    value: Moment | { start: Moment | null; end: Moment | null } | null;
    onChange: (val: any) => void;
    mode: "single" | "range" | "datetime" | "datetimerange";
    timezone: string;
    calendarTheme?: CalendarTheme;
    calendarThemeVariant?: string;
    onClose?: () => void;
}

export const CalendarPanel: React.FC<CalendarPanelProps> = ({
    value,
    onChange,
    mode,
    timezone,
    calendarTheme,
    calendarThemeVariant,
    onClose
}) => {
    const [hoverDate, setHoverDate] = useState<Moment | null>(null);
    const [viewMode, setViewMode] = useState<"days" | "months" | "years">("days");
    const [yearPage, setYearPage] = useState<number>(0);
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                if (viewMode !== "days") setViewMode("days");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [viewMode]);

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
        let d: Moment | null = null;
        if (mode === "range" || mode === "datetimerange") {
            d = (value as any)?.start || moment.tz(timezone);
        } else {
            d = (value as Moment) || moment.tz(timezone);
        }
        return d && d.isValid() ? d : moment.tz(timezone);
    });

    React.useEffect(() => {
        if (viewDate && yearPage === 0) setYearPage(Math.floor(viewDate.year() / 20) * 20);
    }, [viewDate, yearPage]);

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

    const isSelected = (d: Moment) => {
        if (mode === "range" || mode === "datetimerange") {
            const range = value as any;
            return (range?.start?.isSame(d, "day") || range?.end?.isSame(d, "day"));
        }
        return (value as Moment)?.isSame(d, "day");
    };

    const isInRange = (d: Moment) => {
        if (mode !== "range" && mode !== "datetimerange") return false;
        const range = value as any;
        if (range?.start && range?.end) {
            return d.isBetween(range.start, range.end, "day", "[]");
        }
        if (range?.start && hoverDate) {
            const s = moment.min(range.start, hoverDate);
            const e = moment.max(range.start, hoverDate);
            return d.isBetween(s, e, "day", "[]");
        }
        return false;
    };

    const handleDateClick = (d: Moment) => {
        if (mode === "range" || mode === "datetimerange") {
            const range = (value as any) || { start: null, end: null };
            if (!range.start || (range.start && range.end)) {
                onChange({ start: d, end: null });
            } else {
                if (d.isBefore(range.start)) {
                    onChange({ start: d, end: range.start });
                } else {
                    onChange({ start: range.start, end: d });
                    if (mode === "range") onClose?.();
                }
            }
        } else {
            onChange(d);
            if (mode === "single") onClose?.();
        }
    };

    const handlePrev = () => {
        if (viewMode === "days") setViewDate(viewDate.clone().subtract(1, "month"));
        else if (viewMode === "months") setViewDate(viewDate.clone().subtract(1, "year"));
        else if (viewMode === "years") setYearPage(p => p - 20);
    };

    const handleNext = () => {
        if (viewMode === "days") setViewDate(viewDate.clone().add(1, "month"));
        else if (viewMode === "months") setViewDate(viewDate.clone().add(1, "year"));
        else if (viewMode === "years") setYearPage(p => p + 20);
    };

    return (
        <div ref={containerRef} className="flex flex-col p-4 rounded-xl border shadow-lg animate-fadeIn" style={{ backgroundColor: "var(--calendar-secondary-bg)", borderColor: "var(--calendar-grid)", minWidth: "300px", minHeight: "330px", ...themeStyles }}>
            <div className="flex justify-between items-center mb-4 relative z-50">
                <div className="flex gap-2 relative">
                    <button
                        onClick={() => setViewMode(viewMode === "months" ? "days" : "months")}
                        className="text-[14px] font-bold hover:opacity-70 transition-opacity cursor-pointer"
                        style={{ color: "var(--calendar-text)" }}
                    >
                        {viewDate.format("MMMM")}
                    </button>
                    <button
                        onClick={() => {
                            setViewMode(viewMode === "years" ? "days" : "years");
                            setYearPage(Math.floor(viewDate.year() / 20) * 20);
                        }}
                        className="text-[14px] font-bold hover:opacity-70 transition-opacity cursor-pointer"
                        style={{ color: "var(--calendar-text)" }}
                    >
                        {viewMode === "years" ? `${yearPage} - ${yearPage + 19}` : viewDate.format("YYYY")}
                    </button>
                </div>
                <div className="flex gap-2">
                    <button onClick={handlePrev} className="p-1 hover:bg-black/5 rounded">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={handleNext} className="p-1 hover:bg-black/5 rounded">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>

            {viewMode === "days" && (
                <>
                    <div className="grid grid-cols-7 mb-2">
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                            <div key={d} className="text-center text-[10px] font-bold uppercase opacity-50" style={{ color: "var(--calendar-text)" }}>{d}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {days.map((d, i) => {
                            const isCurrentMonth = d.isSame(viewDate, "month");
                            const selected = isSelected(d);
                            const inRange = isInRange(d);

                            return (
                                <button
                                    key={i}
                                    onMouseEnter={() => setHoverDate(d)}
                                    onMouseLeave={() => setHoverDate(null)}
                                    onClick={(e) => { e.preventDefault(); handleDateClick(d); }}
                                    className={`h-9 w-9 flex items-center justify-center rounded-lg text-xs font-medium transition-all relative
                                        ${!isCurrentMonth ? "opacity-20" : "opacity-100"}
                                        ${selected ? "z-10" : ""}
                                    `}
                                    style={{
                                        backgroundColor: selected ? "var(--calendar-primary)" : inRange ? "var(--calendar-primary)" : "transparent",
                                        color: selected || inRange ? "#fff" : "var(--calendar-text)",
                                        opacity: selected ? 1 : inRange ? 0.3 : isCurrentMonth ? 1 : 0.2
                                    }}
                                >
                                    {d.date()}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}

            {viewMode === "months" && (
                <div className="grid grid-cols-3 gap-2 py-2 flex-1 items-center">
                    {moment.monthsShort().map((m, i) => (
                        <button
                            key={m}
                            onClick={() => {
                                setViewDate(viewDate.clone().month(i));
                                setViewMode("days");
                            }}
                            className={`flex items-center justify-center rounded-lg text-sm font-semibold transition-all py-4 px-2
                                ${viewDate.month() === i ? "z-10 shadow-lg" : "hover:bg-black/10 dark:hover:bg-white/10"}
                            `}
                            style={{
                                backgroundColor: viewDate.month() === i ? "var(--calendar-primary)" : "transparent",
                                color: viewDate.month() === i ? "#fff" : "var(--calendar-text)",
                            }}
                        >
                            {m}
                        </button>
                    ))}
                </div>
            )}

            {viewMode === "years" && (
                <div className="grid grid-cols-4 gap-2 py-2 flex-1 items-center animate-fadeIn">
                    {Array.from({ length: 20 }, (_, i) => yearPage + i).map(y => (
                        <button
                            key={y}
                            onClick={() => {
                                setViewDate(viewDate.clone().year(y));
                                setViewMode("months");
                            }}
                            className={`flex items-center justify-center rounded-lg text-sm font-semibold transition-all py-3 px-1
                                ${viewDate.year() === y ? "z-10 shadow-lg" : "hover:bg-black/10 dark:hover:bg-white/10"}
                            `}
                            style={{
                                backgroundColor: viewDate.year() === y ? "var(--calendar-primary)" : "transparent",
                                color: viewDate.year() === y ? "#fff" : "var(--calendar-text)",
                            }}
                        >
                            {y}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
