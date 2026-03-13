import React, {
    useMemo,
    useEffect,
    useRef,
    useState,
    useLayoutEffect
} from "react";
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
import { PREDEFINED_CONFLICT_TEMPLATES } from "./conflictTemplates";
import { PREDEFINED_CALENDAR_THEMES } from "./calendarThemes";

export const DayView: React.FC<CalendarProps> = ({
    timezone = moment.tz.guess() || "UTC",
    timezoneLabelInclude = false,
    slotInterval = 30,
    dateFormat = "YYYY-MM-DD",
    timeFormat = "HH:mm",
    showTimeSlots = true,
    selectedDate: externalSelectedDate,
    onDateChange: externalOnDateChange,
    events: externalEvents,
    onEventChange,
    navigationPosition = "center",
    showTodayBelow = true,
    renderNavigation,
    showEmptyState = true,
    enabledTimeSlots,
    disabledTimeSlots,
    enabledTimeInterval,
    disableTimeInterval,
    emptyStateContent,
    emptyStateContentPopup,
    futureDaysOnly,
    pastDaysOnly,
    currentDayOnly,
    navigateToFirstEvent,
    onAddEvent: externalOnAddEvent,
    onEditEvent: externalOnEditEvent,
    onDeleteEvent: externalOnDeleteEvent,
    formFields: externalFormFields,
    onlyCreateEditRequired = true,
    plugins,
    conflictTemplate,
    conflictThemeVariant,
    calendarTheme,
    calendarThemeVariant,
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);

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

    const now = useMemo(() => moment.utc().tz(timezone), [timezone]);
    const isToday = zonedDate.isSame(now, "day");

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
    const [formData, setFormData] = useState<any>({});


    const bothEnabled = futureDaysOnly && pastDaysOnly;

    const isFutureRestricted =
        (!bothEnabled && futureDaysOnly && zonedDate.isBefore(moment().tz(timezone), "day")) ||
        (currentDayOnly && zonedDate.isBefore(moment().tz(timezone), "day"));

    const isPastRestricted =
        (!bothEnabled && pastDaysOnly && zonedDate.isAfter(moment().tz(timezone), "day")) ||
        (currentDayOnly && zonedDate.isAfter(moment().tz(timezone), "day"));

    const isDateRestricted = isFutureRestricted || isPastRestricted || (currentDayOnly && !isToday);

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
       MULTI DAY SPLIT
    --------------------------*/
    /* -------------------------
       MULTI DAY SPLIT & OVERLAP LAYOUT
    --------------------------*/
    const expandedEvents = useMemo(
        () => getDayEvents(safeEvents, zonedDate, timezone),
        [safeEvents, zonedDate, timezone]
    );

    const dayEvents = expandedEvents.filter((e) => !e.allDay);

    const layoutEvents = useMemo(() => {
        pluginManager.triggerBeforeRender();
        const layout = calculateLayoutEvents(dayEvents, zonedDate, slotInterval);
        pluginManager.triggerAfterRender();
        return layout;
    }, [dayEvents, zonedDate, slotInterval, pluginManager]);

    /* -------------------------
       NAVIGATION
    --------------------------*/
    const canGoToPreviousDay = !currentDayOnly && (bothEnabled || !(futureDaysOnly && zonedDate.isSameOrBefore(now, "day")));
    const canGoToNextDay = !currentDayOnly && (bothEnabled || !(pastDaysOnly && zonedDate.isSameOrAfter(now, "day")));

    const goToPreviousDay = () => {
        if (canGoToPreviousDay) {
            onDateChange(zonedDate.clone().subtract(1, "day"));
        }
    };

    const goToNextDay = () => {
        if (canGoToNextDay) {
            onDateChange(zonedDate.clone().add(1, "day"));
        }
    };

    const goToToday = () =>
        onDateChange(moment.utc().tz(timezone));

    /* -------------------------
       DRAG + RESIZE
    --------------------------*/
    const [dragging, setDragging] = useState<any>(null);
    const [resizing, setResizing] = useState<any>(null);

    const snapMinutes = (minutes: number) =>
        Math.round(minutes / slotInterval) * slotInterval;

    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            if (!gridRef.current) return;

            const rect = gridRef.current.getBoundingClientRect();
            const offsetY = e.clientY - rect.top;
            const minutes =
                (offsetY / SLOT_HEIGHT) * slotInterval;

            if (dragging) {
                const snapped = snapMinutes(minutes);
                const newStart = zonedDate
                    .clone()
                    .startOf("day")
                    .add(snapped, "minutes");

                const duration = dragging.end.diff(
                    dragging.start,
                    "minutes"
                );

                const updatedEvent = {
                    ...dragging,
                    start: newStart,
                    end: newStart.clone().add(duration, "minutes"),
                };
                onEventChange?.(updatedEvent);
                pluginManager.triggerOnEventChange(updatedEvent);
            }

            if (resizing) {
                const snapped = snapMinutes(minutes);
                const newEnd = zonedDate
                    .clone()
                    .startOf("day")
                    .add(snapped, "minutes");

                if (newEnd.isAfter(resizing.start)) {
                    const updatedEvent = {
                        ...resizing,
                        end: newEnd,
                    };
                    onEventChange?.(updatedEvent);
                    pluginManager.triggerOnEventChange(updatedEvent);
                }
            }
        };

        const stop = () => {
            setDragging(null);
            setResizing(null);
        };

        window.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseup", stop);

        return () => {
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mouseup", stop);
        };
    }, [dragging, resizing, zonedDate, slotInterval, onEventChange]);

    const handleGridDoubleClick = (e: React.MouseEvent, slot?: Moment) => {
        let start: Moment;
        if (slot) {
            start = slot.clone();
        } else if (gridRef.current) {
            const rect = gridRef.current.getBoundingClientRect();
            const offsetY = e.clientY - rect.top;
            const minutes = (offsetY / SLOT_HEIGHT) * slotInterval;
            const snapped = snapMinutes(minutes);
            start = zonedDate.clone().startOf("day").add(snapped, "minutes");
        } else {
            return;
        }

        // Check if slot is enabled before opening form
        if (!isSlotEnabled(start)) return;

        const end = start.clone().add(slotInterval, "minutes");

        setEditingEvent(null);
        setFormData({
            start: start.format(`${dateFormat || "YYYY-MM-DD"} ${timeFormat || "HH:mm"}`),
            end: end.format(`${dateFormat || "YYYY-MM-DD"} ${timeFormat || "HH:mm"}`),
        });
        setIsFormOpen(true);
    };

    /* -------------------------
       TIME SLOTS
    --------------------------*/
    /* -------------------------
       TIME SLOTS
    --------------------------*/
    const timeSlots = useMemo(
        () => generateTimeSlots(zonedDate, slotInterval),
        [zonedDate, slotInterval]
    );

    const isSlotEnabled = (slot: Moment) => checkIsSlotEnabled(
        slot,
        enabledTimeSlots,
        disabledTimeSlots,
        enabledTimeInterval,
        disableTimeInterval
    );

    /* -------------------------
       AUTO SCROLL TO FIRST EVENT
    --------------------------*/
    useLayoutEffect(() => {
        if (!scrollRef.current) return;
        // Always reset to top (12:00 AM) instantaneously when date changes BEFORE paint
        scrollRef.current.scrollTop = 0;
    }, [zonedDate, navigateToFirstEvent]);

    useEffect(() => {
        if (!scrollRef.current) return;

        if (!navigateToFirstEvent) return;

        // Use a timeout to ensure everything is rendered
        const scrollTimer = setTimeout(() => {
            if (!scrollRef.current) return;

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (!scrollRef.current) return;
                    let targetTop = 0;

                    if (layoutEvents.length > 0) {
                        targetTop = layoutEvents[0].top;
                    } else {
                        // Find first enabled slot offset
                        const firstEnabledSlotIndex = timeSlots.findIndex(slot => isSlotEnabled(slot));
                        if (firstEnabledSlotIndex !== -1) {
                            targetTop = firstEnabledSlotIndex * SLOT_HEIGHT;
                        }
                    }

                    // Scroll somewhat above it so it's not glued to the top edge, unless targetTop is 0
                    if (targetTop > 0) {
                        const finalOffset = Math.max(0, targetTop - SLOT_HEIGHT);

                        const start = scrollRef.current.scrollTop;
                        const change = finalOffset - start;
                        const duration = 2000; // 2 seconds
                        let startTime: number | null = null;

                        const animateScroll = (currentTime: number) => {
                            if (startTime === null) startTime = currentTime;
                            const elapsed = currentTime - startTime;

                            // Ease in-out cubic
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
    }, [zonedDate, layoutEvents.length, navigateToFirstEvent]);
    const dateNode = (
        <div className="text-center flex flex-col items-center">
            <h2 className="text-xl font-semibold px-4 py-1 rounded-full text-white" style={isToday ? { backgroundColor: "var(--calendar-primary)" } : { color: "var(--calendar-text)" }}>
                {zonedDate.format(dateFormat)}
            </h2>
            {timezoneLabelInclude && (
                <p className="text-xs text-gray-500 mt-1">
                    GMT{zonedDate.format("Z")} • {timezone}
                </p>
            )}
            {showTodayBelow && (
                <button onClick={goToToday} className="mt-1 text-sm font-medium" style={{ color: "var(--calendar-primary)" }}>
                    Today
                </button>
            )}
        </div>
    );



    const prevNode = (
        <button
            onClick={goToPreviousDay}
            disabled={!canGoToPreviousDay}
            className={`px-3 py-1 rounded ${!canGoToPreviousDay ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
        >
            ◀
        </button>
    );

    const nextNode = (
        <button
            onClick={goToNextDay}
            disabled={!canGoToNextDay}
            className={`px-3 py-1 rounded ${!canGoToNextDay ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
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
        goToPreviousDay,
        goToNextDay,
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
            {showTimeSlots === false ? (
                <div className="flex flex-col flex-1 min-h-0 m-5 p-4 overflow-y-auto no-scrollbar relative">
                    {/* Add Event Button for Agenda View */}
                    {onlyCreateEditRequired && (
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={() => {
                                    setEditingEvent(null);
                                    const start = zonedDate.clone().hour(9).minute(0);
                                    const end = start.clone().add(slotInterval, "minutes");
                                    setFormData({
                                        start: start.format("YYYY-MM-DDTHH:mm"),
                                        end: end.format("YYYY-MM-DDTHH:mm"),
                                    });
                                    setIsFormOpen(true);
                                }}
                                className="px-4 py-2 text-sm text-white rounded shadow transition-colors"
                                style={{ backgroundColor: "var(--calendar-primary)" }}
                            >
                                + Add Event
                            </button>
                        </div>
                    )}

                    {dayEvents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center flex-1 h-full min-h-[200px] border-2 border-dashed rounded-xl" style={{ borderColor: 'var(--calendar-grid)' }}>
                            <p className="text-gray-500 font-medium mb-4">{emptyStateContent || "No events scheduled"}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 pb-8">
                            {dayEvents.sort((a, b) => moment(a.start).diff(moment(b.start))).map(event => (
                                <div
                                    key={event.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        pluginManager.triggerOnEventClick(event);
                                        if (onlyCreateEditRequired) {
                                            setEditingEvent(event);
                                            setFormData({
                                                ...event,
                                                start: moment(event.start).tz(timezone).format("YYYY-MM-DDTHH:mm"),
                                                end: moment(event.end).tz(timezone).format("YYYY-MM-DDTHH:mm"),
                                            });
                                            setIsFormOpen(true);
                                        }
                                    }}
                                    className="p-4 rounded-xl border flex flex-col cursor-pointer transition-transform hover:scale-[1.01] shadow-sm relative group"
                                    style={{
                                        backgroundColor: "var(--calendar-event-bg)",
                                        color: "var(--calendar-event-text)",
                                        borderColor: "var(--calendar-grid)",
                                        borderLeft: `4px solid var(--calendar-primary)`
                                    }}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="font-semibold text-base">{event.title}</div>
                                        {/* DELETE */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteEvent(event.id);
                                            }}
                                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                                            title="Delete Event"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <div className="text-sm opacity-80 mt-1">
                                        {moment(event.start).tz(timezone).format(timeFormat)} - {moment(event.end).tz(timezone).format(timeFormat)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar">
                    <div className="flex min-h-full">
                        {/* TIME COLUMN */}
                        <div className="w-24 flex-shrink-0" style={{ backgroundColor: "var(--calendar-secondary-bg)" }}>
                            {timeSlots.map((slot, i) => {
                                const enabled = isSlotEnabled(slot);
                                return (
                                    <div
                                        key={i}
                                        className={`relative text-xs text-right pr-3 border-b border-dotted border-r`}
                                        style={{
                                            height: SLOT_HEIGHT,
                                            borderColor: "var(--calendar-grid)",
                                            color: enabled ? "var(--calendar-secondary-text)" : "var(--calendar-grid)",
                                            cursor: enabled ? "pointer" : "not-allowed",
                                            backgroundColor: enabled ? "transparent" : "var(--calendar-secondary-bg)"
                                        }}
                                    >
                                        <span className="absolute top-1/2 -translate-y-1/2 right-2">
                                            {slot.format(timeFormat)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* GRID */}
                        <div ref={gridRef} className="flex-1 relative" onDoubleClick={(e) => handleGridDoubleClick(e)}>
                            {timeSlots.map((slot, i) => {
                                const enabled = isSlotEnabled(slot);
                                return (
                                    <div
                                        key={i}
                                        onDoubleClick={(e) => {
                                            e.stopPropagation();
                                            if (enabled) {
                                                handleGridDoubleClick(e, slot);
                                            }
                                        }}
                                        style={{
                                            height: SLOT_HEIGHT,
                                            borderColor: "var(--calendar-grid)",
                                            cursor: enabled ? "pointer" : "not-allowed",
                                            backgroundColor: enabled ? "transparent" : "rgba(0,0,0,0.02)"
                                        }}
                                        className={`border-b border-dotted transition-colors ${enabled ? "hover:bg-gray-50" : ""}`}
                                    />
                                );
                            })}

                            {/* EVENTS */}
                            {layoutEvents.map((event) => (
                                <div
                                    key={event.id}
                                    ref={(el) => {
                                        if (el) pluginManager.triggerOnEventRender(event, el);
                                    }}
                                    onMouseDown={() => setDragging(event)}
                                    onDoubleClick={(e) => {
                                        e.stopPropagation();
                                        pluginManager.triggerOnEventClick(event);
                                        if (!onEditEvent) return;

                                        setEditingEvent(event);
                                        setFormData({
                                            ...event,
                                            start: moment(event.start).tz(timezone).format(`${dateFormat || "YYYY-MM-DD"} ${timeFormat || "HH:mm"}`),
                                            end: moment(event.end).tz(timezone).format(`${dateFormat || "YYYY-MM-DD"} ${timeFormat || "HH:mm"}`),
                                        });
                                        setIsFormOpen(true);
                                    }}
                                    className="absolute rounded px-2 text-sm cursor-move z-10"
                                    style={{
                                        top: event.top,
                                        height: event.height,
                                        left: `${(event.columnIndex /
                                            event.columnCount) *
                                            100
                                            }%`,
                                        width: `${100 / event.columnCount}%`,
                                        backgroundColor: "var(--calendar-event-bg)",
                                        color: "var(--calendar-event-text)"
                                    }}
                                >
                                    {event.title}

                                    {/* DELETE */}
                                    {onDeleteEvent && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteEvent(event.id);
                                            }}
                                            className="absolute top-1 right-1 text-xs bg-red-500 rounded px-1"
                                        >
                                            ✕
                                        </button>
                                    )}

                                    {/* RESIZE HANDLE */}
                                    <div
                                        onMouseDown={(e) => {
                                            e.stopPropagation();
                                            setResizing(event);
                                        }}
                                        className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize"
                                        style={{ backgroundColor: "var(--calendar-primary)", opacity: 0.5 }}
                                    />
                                </div>
                            ))}

                            {/* ANIMATED EMPTY STATE (ONLY WORKING HOURS) */}
                            {showEmptyState &&
                                layoutEvents.length === 0 &&
                                !isDateRestricted && (
                                    <div
                                        className="absolute left-0 right-0 flex items-center justify-center animate-fadeIn"
                                        onDoubleClick={(e) => {
                                            if (!isDateRestricted) {
                                                handleGridDoubleClick(e);
                                            }
                                        }}
                                        style={{
                                            top:
                                                (workingHoursRange.startMinutes /
                                                    slotInterval) *
                                                SLOT_HEIGHT,
                                            height:
                                                ((workingHoursRange.endMinutes -
                                                    workingHoursRange.startMinutes) /
                                                    slotInterval) *
                                                SLOT_HEIGHT,
                                            cursor: isDateRestricted ? "not-allowed" : "pointer"
                                        }}
                                    >
                                        <div className="bg-white shadow-xl rounded-2xl px-8 py-6 border text-center animate-scaleIn">
                                            <p className="text-gray-600 font-medium">
                                                {emptyStateContent || "No events scheduled"}
                                            </p>

                                            {emptyStateContentPopup ? emptyStateContentPopup : (
                                                (
                                                    <button
                                                        onClick={() => {
                                                            setEditingEvent(null);
                                                            setFormData({});
                                                            setIsFormOpen(true);
                                                        }}
                                                        className="mt-4 px-4 py-2 text-white rounded"
                                                        style={{ backgroundColor: "var(--calendar-primary)" }}
                                                    >
                                                        Add Event
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                            {/* CURRENT TIME LINE */}
                            {isToday && (
                                <div
                                    className="absolute left-0 right-0 border-t-2"
                                    style={{
                                        borderColor: "var(--calendar-primary)",
                                        top: ((now.hours() * 60 + now.minutes()) / slotInterval) * SLOT_HEIGHT,
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}

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
                    conflictTemplate={conflictTemplate || (conflictThemeVariant ? (PREDEFINED_CONFLICT_TEMPLATES as any)[conflictThemeVariant] : undefined)}
                    slotInterval={slotInterval}
                    enabledTimeSlots={enabledTimeSlots}
                    disabledTimeSlots={disabledTimeSlots}
                    enabledTimeInterval={enabledTimeInterval}
                    disableTimeInterval={disableTimeInterval}
                    events={safeEvents}
                />
            )}
        </div>
    );
};

export default DayView;