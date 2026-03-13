import React, { useMemo, useEffect, useRef, useState, useLayoutEffect } from "react";
import moment, { type Moment } from "moment-timezone";
import type { CalendarEvent, CalendarProps } from "./types";
import {
    SLOT_HEIGHT,
    normalizeDate,
    getWorkingHoursRange,
    generateTimeSlots,
    checkIsSlotEnabled,
    getDayEvents,
    calculateLayoutEvents,
} from "./utils";
import { EventFormModal } from "./EventFormModal";
import { PluginManager } from "./pluginSystem";
import { PREDEFINED_CALENDAR_THEMES } from "./calendarThemes";

export const WeekView: React.FC<CalendarProps> = ({
    timezone = moment.tz.guess() || "UTC",
    timezoneLabelInclude = false,
    slotInterval = 30,
    dateFormat = "YYYY-MM-DD",
    timeFormat = "HH:mm",
    selectedDate: externalSelectedDate,
    onDateChange: externalOnDateChange,
    events: externalEvents,
    onEventChange,
    navigationPosition = "center",
    renderNavigation,
    showEmptyState = true,
    enabledTimeSlots,
    disabledTimeSlots,
    enabledTimeInterval,
    disableTimeInterval,
    onAddEvent: externalOnAddEvent,
    onEditEvent: externalOnEditEvent,
    onDeleteEvent: externalOnDeleteEvent,
    formFields: externalFormFields,
    onlyCreateEditRequired = true,
    navigateToFirstEvent,
    plugins,
    calendarTheme,
    calendarThemeVariant,
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Uncontrolled State Fallbacks
    const [internalDate, setInternalDate] = useState<Moment>(() => moment.tz(externalSelectedDate || new Date(), timezone));
    const selectedDate = externalSelectedDate !== undefined ? externalSelectedDate : internalDate;
    const onDateChange = (date: Moment) => {
        if (externalOnDateChange) {
            externalOnDateChange(date);
        } else {
            setInternalDate(date);
        }
    };

    const [internalEvents, setInternalEvents] = useState<CalendarEvent[]>(() => externalEvents || []);
    const events = externalEvents !== undefined ? externalEvents : internalEvents;

    const onAddEvent = externalOnAddEvent || ((event: CalendarEvent) => setInternalEvents((prev) => [...prev, event]));
    const onEditEvent = externalOnEditEvent || ((event: CalendarEvent) => setInternalEvents((prev) => prev.map((e) => (e.id === event.id ? event : e))));
    const onDeleteEvent = externalOnDeleteEvent || ((id: string) => setInternalEvents((prev) => prev.filter((e) => e.id !== id)));

    const formFields = externalFormFields || [
        { name: "title", label: "Event Title", type: "text", required: true },
        { name: "description", label: "Description", type: "textarea" },
        { name: "start", label: "Start Time", type: "datetime-local", required: true },
        { name: "end", label: "End Time", type: "datetime-local", required: true },
    ];

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

    const safeEvents = useMemo(() => events ?? [], [events]);

    const pluginManager = useMemo(() => {
        return new PluginManager(plugins, {
            timezone,
            slotInterval,
            events: safeEvents,
            onEventChange,
            onAddEvent,
            onEditEvent,
            onDeleteEvent,
        });
    }, [plugins, timezone, slotInterval, safeEvents, onEventChange, onAddEvent, onEditEvent, onDeleteEvent]);

    useEffect(() => {
        pluginManager.init();
    }, [pluginManager]);

    const zonedDate = useMemo(
        () => normalizeDate(selectedDate, timezone),
        [selectedDate, timezone]
    );

    const startOfWeek = useMemo(() => zonedDate.clone().startOf("week"), [zonedDate]);

    const weekDays = useMemo(() => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            days.push(startOfWeek.clone().add(i, "days"));
        }
        return days;
    }, [startOfWeek]);

    const now = useMemo(() => moment.utc().tz(timezone), [timezone]);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
    const [formData, setFormData] = useState<any>({});

    const workingHoursRange = useMemo(
        () => getWorkingHoursRange(enabledTimeInterval),
        [enabledTimeInterval]
    );

    const resetForm = () => {
        setIsFormOpen(false);
        setEditingEvent(null);
        setFormData({});
    };

    /* -------------------------
       NAVIGATION
    --------------------------*/
    const goToPreviousWeek = () => onDateChange(zonedDate.clone().subtract(1, "week"));
    const goToNextWeek = () => onDateChange(zonedDate.clone().add(1, "week"));
    const goToToday = () => onDateChange(moment.utc().tz(timezone));

    /* -------------------------
       TIME SLOTS
    --------------------------*/
    const timeSlots = useMemo(
        () => generateTimeSlots(startOfWeek, slotInterval),
        [startOfWeek, slotInterval]
    );

    const isSlotEnabled = (slot: Moment) => checkIsSlotEnabled(
        slot,
        enabledTimeSlots,
        disabledTimeSlots,
        enabledTimeInterval,
        disableTimeInterval
    );

    /* -------------------------
       PER-DAY LAYOUTS
    --------------------------*/
    // We calculate the layout mapping per-day.
    const layoutEventsPerDay = useMemo(() => {
        pluginManager.triggerBeforeRender();
        const layouts = weekDays.map((day) => {
            const dayEventsList = getDayEvents(safeEvents, day, timezone).filter(e => !e.allDay);
            return calculateLayoutEvents(dayEventsList, day, slotInterval);
        });
        pluginManager.triggerAfterRender();
        return layouts;
    }, [weekDays, safeEvents, timezone, slotInterval, pluginManager]);

    /* -------------------------
       AUTO SCROLL TO FIRST EVENT
    --------------------------*/
    useLayoutEffect(() => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollTop = 0;
    }, [startOfWeek, navigateToFirstEvent]);

    useEffect(() => {
        if (!scrollRef.current || !navigateToFirstEvent) return;

        const scrollTimer = setTimeout(() => {
            if (!scrollRef.current) return;

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (!scrollRef.current) return;
                    let minTop = Infinity;

                    layoutEventsPerDay.forEach(dayEvents => {
                        if (dayEvents.length > 0) {
                            minTop = Math.min(minTop, dayEvents[0].top);
                        }
                    });

                    let targetTop = 0;
                    if (minTop !== Infinity) {
                        targetTop = minTop;
                    } else {
                        const firstEnabledSlotIndex = timeSlots.findIndex(slot => isSlotEnabled(slot));
                        if (firstEnabledSlotIndex !== -1) {
                            targetTop = firstEnabledSlotIndex * SLOT_HEIGHT;
                        }
                    }

                    if (targetTop > 0) {
                        const finalOffset = Math.max(0, targetTop - SLOT_HEIGHT);
                        const start = scrollRef.current.scrollTop;
                        const change = finalOffset - start;
                        const duration = 2000;
                        let startTime: number | null = null;

                        const animateScroll = (currentTime: number) => {
                            if (startTime === null) startTime = currentTime;
                            const elapsed = currentTime - startTime;
                            const progress = elapsed / duration;
                            const ease = progress < 0.5
                                ? 4 * progress * progress * progress
                                : 1 - Math.pow(-2 * progress + 2, 3) / 2;

                            if (!scrollRef.current) return;
                            scrollRef.current.scrollTop = start + (change * ease);

                            if (elapsed < duration) {
                                requestAnimationFrame(animateScroll);
                            } else {
                                scrollRef.current.scrollTop = finalOffset;
                            }
                        };
                        requestAnimationFrame(animateScroll);
                    }
                });
            });
        }, 100);

        return () => clearTimeout(scrollTimer);
    }, [startOfWeek, layoutEventsPerDay, navigateToFirstEvent]);


    const dateNode = (
        <div className="text-center flex flex-col items-center">
            <h2 className="text-xl font-semibold">
                {startOfWeek.format("MMMM YYYY")}
            </h2>
            {timezoneLabelInclude && (
                <p className="text-xs text-gray-500 mt-1">
                    GMT{zonedDate.format("Z")} • {timezone}
                </p>
            )}
            <button onClick={goToToday} className="mt-1 text-sm font-medium" style={{ color: "var(--calendar-primary)" }}>
                Today
            </button>
        </div>
    );

    const prevNode = (
        <button
            onClick={goToPreviousWeek}
            className="px-3 py-1 rounded hover:bg-gray-200"
        >
            ◀
        </button>
    );

    const nextNode = (
        <button
            onClick={goToNextWeek}
            className="px-3 py-1 rounded hover:bg-gray-200"
        >
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
        goToPreviousDay: goToPreviousWeek,
        goToNextDay: goToNextWeek,
        goToToday,
        dateNode,
        prevNode,
        nextNode,
        defaultNav,
        currentDate: startOfWeek,
        timezone,
        timezoneLabelInclude,
    }) : null;

    return (
        <div className="flex flex-col flex-1 h-full w-full min-h-0 no-scrollbar" style={{ ...themeStyles, backgroundColor: "var(--calendar-bg)", color: "var(--calendar-text)" }}>
            {/* HEADER */}
            {renderNavigation !== undefined && renderNavigation !== null ? (
                <div key="custom-nav-wrapper">
                    {navNode}
                </div>
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

            {/* BODY */}
            <div className="flex flex-1 flex-col min-h-0 m-5 mt-2 overflow-hidden" style={{ backgroundColor: "var(--calendar-bg)" }}>
                {/* WEEK DAYS HEADER ALIGNED WITH GRID */}
                <div className="flex border-b" style={{ borderColor: "var(--calendar-grid)" }}>
                    {/* SPACER FOR TIME COLUMN */}
                    <div className="w-24 flex-shrink-0" />
                    {/* DAYS */}
                    <div className="flex flex-1 min-w-[700px]">
                        {weekDays.map((day, i) => {
                            return (
                                <div key={i} className="flex-1 text-center font-medium py-3" style={{ color: "var(--calendar-text)" }}>
                                    <div className="text-xs uppercase tracking-wider" style={{ color: "var(--calendar-secondary-text)" }}>{day.format("ddd")}</div>
                                    <div
                                        className={`text-2xl mt-1 w-10 h-10 flex items-center justify-center mx-auto rounded-full ${day.isSame(now, 'day') ? 'text-white' : ''}`}
                                        style={day.isSame(now, 'day') ? { backgroundColor: "var(--calendar-primary)" } : {}}
                                    >
                                        {day.format("D")}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar relative">
                    <div className="flex min-h-full">
                        {/* FIXED TIME COLUMN */}
                        <div className="w-24 flex-shrink-0 z-10 sticky left-0 shadow-[1px_0_5px_rgba(0,0,0,0.02)]" style={{ backgroundColor: "var(--calendar-bg)" }}>
                            {timeSlots.map((slot, i) => {
                                const enabled = isSlotEnabled(slot);
                                return (
                                    <div
                                        key={i}
                                        className={`relative text-xs text-right pr-3 border-b border-dotted`}
                                        style={{
                                            height: SLOT_HEIGHT,
                                            borderColor: "var(--calendar-grid)",
                                            color: enabled ? "var(--calendar-secondary-text)" : "var(--calendar-grid)",
                                            backgroundColor: enabled ? "transparent" : "var(--calendar-secondary-bg)"
                                        }}
                                    >
                                        <span className="absolute top-1/2 -translate-y-1/2 right-2 px-1" style={{ backgroundColor: "var(--calendar-bg)" }}>
                                            {slot.format(timeFormat)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* 7 DAY GRID CONTAINER */}
                        <div className="flex flex-1 relative min-w-[700px]" style={{ backgroundColor: "var(--calendar-bg)" }}>

                            {/* THE HORIZONTAL ROWS (drawn behind) */}
                            <div className="absolute inset-0 pointer-events-none">
                                {timeSlots.map((_, i) => (
                                    <div
                                        key={`row-${i}`}
                                        style={{ height: SLOT_HEIGHT, borderColor: "var(--calendar-grid)" }}
                                        className="border-b border-dotted w-full"
                                    />
                                ))}
                            </div>

                            {/* 7 DAY COLUMNS */}
                            {weekDays.map((day, dayIndex) => {
                                const dayLayoutEvents = layoutEventsPerDay[dayIndex];
                                const isToday = day.isSame(now, "day");

                                return (
                                    <div key={day.format("YYYY-MM-DD")} className="flex-1 relative">

                                        {/* CLICKABLE AREA (future enhancement: double click to add) */}
                                        <div className="absolute inset-0 z-0 bg-transparent cursor-pointer" onDoubleClick={() => {
                                            if (onlyCreateEditRequired) {
                                                setFormData({ start: day.clone().hour(9).format(`${dateFormat || "YYYY-MM-DD"} ${timeFormat || "HH:mm"}`) });
                                                setIsFormOpen(true);
                                            }
                                        }} />

                                        {/* CURRENT TIME LINE */}
                                        {isToday && (
                                            <div
                                                className="absolute left-0 right-0 border-t-2 z-10"
                                                style={{
                                                    borderColor: "var(--calendar-primary)",
                                                    top: ((now.hours() * 60 + now.minutes()) / slotInterval) * SLOT_HEIGHT,
                                                    boxShadow: "0 0 8px var(--calendar-primary-alpha40)"
                                                }}
                                            >
                                                <div className="absolute -left-1 -top-[5px] w-2 h-2 rounded-full" style={{ backgroundColor: "var(--calendar-primary)" }} />
                                            </div>
                                        )}

                                        {/* EMPTY STATE */}
                                        {showEmptyState && dayLayoutEvents.length === 0 && (
                                            <div className="absolute left-1 right-1 flex items-center justify-center animate-fadeIn opacity-50"
                                                style={{
                                                    top: (workingHoursRange.startMinutes / slotInterval) * SLOT_HEIGHT,
                                                    height: ((workingHoursRange.endMinutes - workingHoursRange.startMinutes) / slotInterval) * SLOT_HEIGHT,
                                                }}
                                            >
                                                <div className="text-xs font-medium" style={{ color: "var(--calendar-secondary-text)" }}>Clear</div>
                                            </div>
                                        )}

                                        {/* EVENTS FOR THIS DAY */}
                                        <div className="absolute inset-0 z-10 pointer-events-none">
                                            {dayLayoutEvents.map((event) => (
                                                <div
                                                    key={event.id}
                                                    onDoubleClick={(e) => {
                                                        e.stopPropagation();
                                                        pluginManager.triggerOnEventClick(event);
                                                        if (!onlyCreateEditRequired) return;
                                                        setEditingEvent(event);
                                                        setFormData({
                                                            ...event,
                                                            start: moment(event.start).tz(timezone).format(`${dateFormat || "YYYY-MM-DD"} ${timeFormat || "HH:mm"}`),
                                                            end: moment(event.end).tz(timezone).format(`${dateFormat || "YYYY-MM-DD"} ${timeFormat || "HH:mm"}`),
                                                        });
                                                        setIsFormOpen(true);
                                                    }}
                                                    ref={(el) => {
                                                        if (el) pluginManager.triggerOnEventRender(event, el);
                                                    }}
                                                    className="absolute rounded-[4px] px-2 text-xs font-medium cursor-pointer shadow-sm hover:z-20 border pointer-events-auto transition-all overflow-hidden"
                                                    style={{
                                                        top: event.top,
                                                        height: Math.max(event.height, 20),
                                                        left: `${(event.columnIndex / event.columnCount) * 100}%`,
                                                        width: `calc(${100 / event.columnCount}% - 2px)`, // Small margin
                                                        backgroundColor: "var(--calendar-event-bg)",
                                                        color: "var(--calendar-event-text)",
                                                        borderColor: "var(--calendar-grid)"
                                                    }}
                                                >
                                                    <div className="truncate">{event.title}</div>

                                                    {onDeleteEvent && onlyCreateEditRequired && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDeleteEvent(event.id);
                                                            }}
                                                            className="absolute top-[2px] right-[2px] w-4 h-4 text-[10px] leading-none bg-red-500 hover:bg-red-600 rounded flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity flex-shrink-0"
                                                        >
                                                            ✕
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* INTERNAL CREATE / EDIT MODAL */}
                {onlyCreateEditRequired && (
                    <EventFormModal
                        isOpen={isFormOpen}
                        onClose={resetForm}
                        editingEvent={editingEvent}
                        formData={formData}
                        setFormData={setFormData}
                        formFields={formFields}
                        timezone={timezone}
                        dateFormat={dateFormat}
                        timeFormat={timeFormat}
                        onAddEvent={onAddEvent}
                        onEditEvent={onEditEvent}
                        onDeleteEvent={onDeleteEvent}
                        pluginManager={pluginManager}
                        disableTimeInterval={disableTimeInterval}
                        events={safeEvents}
                    />
                )}
            </div>
        </div>
    );
};
