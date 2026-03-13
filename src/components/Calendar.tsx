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

    const goToPreviousMonth = () => setCurrentMonth(prev => prev.clone().subtract(1, "month"));
    const goToNextMonth = () => setCurrentMonth(prev => prev.clone().add(1, "month"));
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
        <button onClick={() => handleDateChange(zonedDate.clone().subtract(1, "month"))} className="px-3 py-1 rounded hover:bg-gray-100 transition-colors" style={{ color: "var(--calendar-text)" }}>
            ◀
        </button>
    );

    const nextNode = (
        <button onClick={() => handleDateChange(zonedDate.clone().add(1, "month"))} className="px-3 py-1 rounded hover:bg-gray-100 transition-colors" style={{ color: "var(--calendar-text)" }}>
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
                    className="w-full md:w-80 flex-shrink-0 border-r flex flex-col p-4 bg-white"
                    style={{ borderColor: "var(--calendar-grid)", backgroundColor: "var(--calendar-secondary-bg)" }}
                >
                    {/* Mini Calendar Header */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={goToPreviousMonth}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            style={{ color: "var(--calendar-text)" }}
                        >
                            ◀
                        </button>
                        <div className="font-semibold text-sm" style={{ color: "var(--calendar-text)" }}>
                            {currentMonth.format("MMMM YYYY")}
                        </div>
                        <button
                            onClick={goToNextMonth}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            style={{ color: "var(--calendar-text)" }}
                        >
                            ▶
                        </button>
                    </div>

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
                        {miniCalendarGrid.map((day, idx) => {
                            const isCurrentMonth = day.isSame(currentMonth, "month");
                            const isSelected = day.isSame(zonedDate, "day");
                            const isToday = day.isSame(moment().tz(timezone), "day");

                            let bgClass = "hover:bg-gray-200";
                            let textStyle: React.CSSProperties = { color: "var(--calendar-text)" };
                            let bgStyle: React.CSSProperties = {};

                            if (!isCurrentMonth) {
                                textStyle = { color: "var(--calendar-secondary-text)", opacity: 0.5 };
                            }

                            if (isSelected) {
                                bgClass = "";
                                bgStyle = { backgroundColor: "var(--calendar-primary)", color: "white" };
                                textStyle = { color: "white" };
                            } else if (isToday) {
                                bgStyle = { border: "2px solid var(--calendar-primary)", fontWeight: "bold" };
                                textStyle = { color: "var(--calendar-primary)" };
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleDateChange(day)}
                                    className={`h-8 w-8 flex items-center justify-center rounded-full text-xs transition-colors ${bgClass}`}
                                    style={{ ...textStyle, ...bgStyle }}
                                >
                                    {day.date()}
                                </button>
                            );
                        })}
                    </div>
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
                    />
                </div>
            </div>
        </div>
    );
};
