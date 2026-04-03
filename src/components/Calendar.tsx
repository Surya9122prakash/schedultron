import React, { useMemo, useState } from "react";
import moment, { type Moment } from "moment-timezone";
import type { CalendarProps, CalendarEvent } from "./types";
import { normalizeDate } from "./utils";
import { PREDEFINED_CALENDAR_THEMES } from "./calendarThemes";
import { DayView } from "./DayView";

export const Calendar: React.FC<CalendarProps> = (props) => {
    const {
        timezone = moment.tz.guess() || "UTC",
        selectedDate: externalSelectedDate,
        onDateChange: externalOnDateChange,
        events: externalEvents,
        onAddEvent: externalOnAddEvent,
        onEditEvent: externalOnEditEvent,
        onDeleteEvent: externalOnDeleteEvent,
        calendarTheme,
        calendarThemeVariant,
        navigationPosition = "center",
        renderNavigation,
        dateFormat = "MMMM YYYY",
        timeFormat = "HH:mm",
        showTimeSlots = false,
        timezoneLabelInclude = false,
        enableDragAndResize = false,
        enableRecurrence = false,
    } = props;

    // Uncontrolled State Fallbacks for Date
    const [internalDate, setInternalDate] = useState<Moment>(() => moment.tz(externalSelectedDate || new Date(), timezone));
    const selectedDate = externalSelectedDate !== undefined ? externalSelectedDate : internalDate;

    // Mini Calendar Logic
    const zonedDate = useMemo(
        () => normalizeDate(selectedDate, timezone),
        [selectedDate, timezone]
    );

    const [currentMonth, setCurrentMonth] = useState<Moment>(() => zonedDate.clone().startOf("month"));

    const [miniCalMode, setMiniCalMode] = useState<"days" | "months" | "years">("days");
    const [miniYearPage, setMiniYearPage] = useState<number>(0);
    const miniCalContainerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (currentMonth && miniYearPage === 0) setMiniYearPage(Math.floor(currentMonth.year() / 20) * 20);
    }, [currentMonth, miniYearPage]);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (miniCalContainerRef.current && !miniCalContainerRef.current.contains(event.target as Node)) {
                if (miniCalMode !== "days") setMiniCalMode("days");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [miniCalMode]);

    const handleDateChange = (date: Moment) => {
        if (externalOnDateChange) {
            externalOnDateChange(date);
        } else {
            setInternalDate(date);
        }
        // Force mini calendar to the new month
        setCurrentMonth(date.clone().startOf("month"));
    };

    // Uncontrolled State Fallbacks for Events
    const [internalEvents, setInternalEvents] = useState<CalendarEvent[]>(() => externalEvents || []);
    const events = externalEvents !== undefined ? externalEvents : internalEvents;

    const onAddEvent = externalOnAddEvent || ((event: CalendarEvent) => setInternalEvents((prev) => [...prev, event]));
    const onEditEvent = externalOnEditEvent || ((event: CalendarEvent) => setInternalEvents((prev) => prev.map((e) => (e.id === event.id ? event : e))));
    const onDeleteEvent = externalOnDeleteEvent || ((id: string) => setInternalEvents((prev) => prev.filter((e) => e.id !== id)));

    // Ensure we use the exact same theme
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
        "--calendar-accent": activeTheme.accentColor,
        "--calendar-event-bg": activeTheme.eventDefaultColor,
        "--calendar-event-text": activeTheme.eventDefaultTextColor,
    } as React.CSSProperties), [activeTheme]);

    const startOfMonth = currentMonth.clone().startOf("month");
    const endOfMonth = currentMonth.clone().endOf("month");
    const startOfGrid = startOfMonth.clone().startOf("week");
    const endOfGrid = endOfMonth.clone().endOf("week");

    const miniCalendarGrid = useMemo(() => {
        const grid = [];
        let current = startOfGrid.clone();
        while (current.isBefore(endOfGrid) || current.isSame(endOfGrid, "day")) {
            grid.push(current.clone());
            current.add(1, "day");
        }
        return grid;
    }, [startOfGrid, endOfGrid]);

    const goToPreviousMonth = () => {
        if (miniCalMode === "days") setCurrentMonth(prev => prev.clone().subtract(1, "month"));
        else if (miniCalMode === "months") setCurrentMonth(prev => prev.clone().subtract(1, "year"));
        else if (miniCalMode === "years") setMiniYearPage(p => p - 20);
    };
    const goToNextMonth = () => {
        if (miniCalMode === "days") setCurrentMonth(prev => prev.clone().add(1, "month"));
        else if (miniCalMode === "months") setCurrentMonth(prev => prev.clone().add(1, "year"));
        else if (miniCalMode === "years") setMiniYearPage(p => p + 20);
    };
    const goToToday = () => handleDateChange(moment.utc().tz(timezone));

    const dateNode = (
        <div className="text-center flex flex-col items-center">
            <h2 className="text-xl font-semibold" style={{ color: "var(--calendar-text)" }}>
                {zonedDate.format(dateFormat)}
            </h2>
            {timezoneLabelInclude && (
                <p className="text-xs mt-1" style={{ color: "var(--calendar-secondary-text)" }}>
                    GMT{zonedDate.format("Z")} • {timezone}
                </p>
            )}
            <button onClick={goToToday} className="mt-1 text-sm font-medium" style={{ color: "var(--calendar-primary)" }}>
                Today
            </button>
        </div>
    );

    const prevNode = (
        <button onClick={() => handleDateChange(zonedDate.clone().subtract(1, "month"))} className="px-3 py-1 rounded calendar-hover-bg transition-colors" style={{ color: "var(--calendar-text)" }}>
            ◀
        </button>
    );

    const nextNode = (
        <button onClick={() => handleDateChange(zonedDate.clone().add(1, "month"))} className="px-3 py-1 rounded calendar-hover-bg transition-colors" style={{ color: "var(--calendar-text)" }}>
            ▶
        </button>
    );

    const defaultNav = (
        <div className="flex items-center gap-2">
            {prevNode}
            {nextNode}
        </div>
    );

    const navNode = renderNavigation ? renderNavigation({
        goToPreviousDay: () => handleDateChange(zonedDate.clone().subtract(1, "month")),
        goToNextDay: () => handleDateChange(zonedDate.clone().add(1, "month")),
        goToToday,
        dateNode,
        prevNode,
        nextNode,
        defaultNav,
        currentDate: zonedDate,
        timezone,
        timezoneLabelInclude,
    }) : null;

    return (
        <div className="flex flex-col h-full w-full no-scrollbar" style={{ ...themeStyles, backgroundColor: 'var(--calendar-bg)' }}>
            {/* GLOBAL HEADER */}
            {renderNavigation ? (
                navNode
            ) : (
                <div className="sticky top-0 z-20 border-b px-6 py-4 flex items-center min-h-[80px]" style={{ backgroundColor: "var(--calendar-bg)", borderColor: "var(--calendar-grid)" }}>
                    {navigationPosition === "left" && (
                        <>
                            <div className="flex-1 flex justify-start items-center">
                                {defaultNav}
                            </div>
                            <div className="flex-1 flex justify-center items-center">
                                {dateNode}
                            </div>
                            <div className="flex-1 flex justify-end items-center" />
                        </>
                    )}
                    {navigationPosition === "center" && (
                        <>
                            <div className="flex-1 flex justify-start items-center" />
                            <div className="flex-1 flex justify-center items-center gap-4">
                                {prevNode}
                                {dateNode}
                                {nextNode}
                            </div>
                            <div className="flex-1 flex justify-end items-center" />
                        </>
                    )}
                    {navigationPosition === "right" && (
                        <>
                            <div className="flex-1 flex justify-start items-center" />
                            <div className="flex-1 flex justify-center items-center">
                                {dateNode}
                            </div>
                            <div className="flex-1 flex justify-end items-center gap-4">
                                {defaultNav}
                            </div>
                        </>
                    )}
                </div>
            )}

            <div className="flex flex-col md:flex-row flex-1 overflow-hidden border shadow-lg rounded-xl bg-white no-scrollbar m-4 mt-2" style={{ borderColor: "var(--calendar-grid)" }}>

                {/* LEFT PANEL: MINI CALENDAR */}
                <div
                    ref={miniCalContainerRef}
                    className="w-full md:w-80 flex-shrink-0 border-r flex flex-col p-4 bg-white"
                    style={{ borderColor: "var(--calendar-grid)", backgroundColor: "var(--calendar-secondary-bg)" }}
                >
                    {/* Mini Calendar Header */}
                    <div className="flex items-center justify-between mb-4 relative z-50">
                        <div className="flex gap-2 relative">
                            <button
                                onClick={() => setMiniCalMode(miniCalMode === "months" ? "days" : "months")}
                                className="text-[14px] font-bold hover:opacity-70 transition-opacity cursor-pointer"
                                style={{ color: "var(--calendar-text)" }}
                            >
                                {currentMonth.format("MMMM")}
                            </button>
                            <button
                                onClick={() => {
                                    setMiniCalMode(miniCalMode === "years" ? "days" : "years");
                                    setMiniYearPage(Math.floor(currentMonth.year() / 20) * 20);
                                }}
                                className="text-[14px] font-bold hover:opacity-70 transition-opacity cursor-pointer"
                                style={{ color: "var(--calendar-text)" }}
                            >
                                {miniCalMode === "years" ? `${miniYearPage} - ${miniYearPage + 19}` : currentMonth.format("YYYY")}
                            </button>
                        </div>
                        <div className="flex gap-1">
                            <button
                                onClick={goToPreviousMonth}
                                className="p-1 calendar-hover-bg rounded-md transition-colors text-[10px]"
                                style={{ color: "var(--calendar-text)" }}
                            >
                                ◀
                            </button>
                            <button
                                onClick={goToNextMonth}
                                className="p-1 calendar-hover-bg rounded-md transition-colors text-[10px]"
                                style={{ color: "var(--calendar-text)" }}
                            >
                                ▶
                            </button>
                        </div>
                    </div>

                    {miniCalMode === "days" && (
                        <>
                            {/* Weekday Abbreviations */}
                            <div className="grid grid-cols-7 mb-2">
                                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => (
                                    <div key={day} className="text-center text-[10px] font-bold uppercase" style={{ color: "var(--calendar-secondary-text)" }}>
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Days Grid */}
                            <div className="grid grid-cols-7 gap-1">
                                {miniCalendarGrid.map(day => {
                                    const isCurrentMonth = day.isSame(currentMonth, "month");
                                    const isSelected = day.isSame(zonedDate, "day");
                                    const isToday = day.isSame(moment().tz(timezone), "day");

                                    let cellBgClassName = "transparent";
                                    let cellTextColor = "var(--calendar-text)";
                                    let shadowStyle = "none";
                                    let opacity = isCurrentMonth ? 1 : 0.3;

                                    if (isSelected) {
                                        cellBgClassName = "var(--calendar-primary)";
                                        cellTextColor = "#ffffff";
                                        shadowStyle = "0 2px 6px rgba(0,0,0,0.2)";
                                        opacity = 1;
                                    } else if (isToday) {
                                        cellTextColor = "var(--calendar-primary)";
                                    }

                                    return (
                                        <button
                                            key={day.format("YYYY-MM-DD")}
                                            onClick={() => handleDateChange(day)}
                                            className={`
                                                relative h-8 w-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all
                                                ${isSelected ? "scale-105" : "hover:bg-black/5"}
                                            `}
                                            style={{
                                                backgroundColor: cellBgClassName,
                                                color: cellTextColor,
                                                boxShadow: shadowStyle,
                                                opacity: opacity,
                                            }}
                                        >
                                            <span className="relative z-10">{day.date()}</span>
                                            {events.some(e => normalizeDate(e.start, timezone).isSame(day, "day")) && !isSelected && (
                                                <div className="absolute bottom-1 w-1 h-1 rounded-full" style={{ backgroundColor: "var(--calendar-primary)" }} />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {miniCalMode === "months" && (
                        <div className="grid grid-cols-3 gap-2 py-2 flex-1 items-center">
                            {moment.monthsShort().map((m, i) => (
                                <button
                                    key={m}
                                    onClick={() => {
                                        setCurrentMonth(currentMonth.clone().month(i));
                                        setMiniCalMode("days");
                                    }}
                                    className={`flex items-center justify-center rounded-lg text-sm font-semibold transition-all py-4 px-2
                                        ${currentMonth.month() === i ? "z-10 shadow-lg" : "hover:bg-black/10 dark:hover:bg-white/10"}
                                    `}
                                    style={{
                                        backgroundColor: currentMonth.month() === i ? "var(--calendar-primary)" : "transparent",
                                        color: currentMonth.month() === i ? "#fff" : "var(--calendar-text)"
                                    }}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    )}

                    {miniCalMode === "years" && (
                        <div className="grid grid-cols-4 gap-2 py-2 flex-1 items-center animate-fadeIn">
                            {Array.from({ length: 20 }, (_, i) => miniYearPage + i).map(y => (
                                <button
                                    key={y}
                                    onClick={() => {
                                        setCurrentMonth(currentMonth.clone().year(y));
                                        setMiniCalMode("months");
                                    }}
                                    className={`flex items-center justify-center rounded-lg text-sm font-semibold transition-all py-3 px-1
                                        ${currentMonth.year() === y ? "z-10 shadow-lg" : "hover:bg-black/10 dark:hover:bg-white/10"}
                                    `}
                                    style={{
                                        backgroundColor: currentMonth.year() === y ? "var(--calendar-primary)" : "transparent",
                                        color: currentMonth.year() === y ? "#fff" : "var(--calendar-text)"
                                    }}
                                >
                                    {y}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT PANEL: DAY VIEW SLOTS */}
                <div className="flex-1 min-w-0 h-full overflow-hidden bg-white">
                    {/* We pass the CONTROLLED state to DayView */}
                    <DayView
                        {...props}
                        selectedDate={selectedDate}
                        onDateChange={handleDateChange}
                        events={events}
                        showTimeSlots={showTimeSlots}
                        onAddEvent={onAddEvent}
                        onEditEvent={onEditEvent}
                        onDeleteEvent={onDeleteEvent}
                        renderNavigation={() => <></>}
                        showTodayBelow={false}
                        dateFormat={dateFormat}
                        timeFormat={timeFormat}
                        enableDragAndResize={enableDragAndResize}
                        enableRecurrence={enableRecurrence}
                    />
                </div>
            </div>
        </div>
    );
};
