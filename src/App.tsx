import React, { useState } from "react";
import moment, { type Moment } from "moment-timezone";
import { DayView, WeekView, MonthView } from "./components";
import type { CalendarEvent, Plugin } from "./components/types";
import { detectConflicts } from "./components/utils";

const App: React.FC = () => {
  const timezone = "America/New_York";
  const timezoneLabelInclude = true;

  const [selectedDate, setSelectedDate] = useState<Moment>(
    moment().tz(timezone)
  );
  const [view, setView] = useState<"day" | "week" | "month">("day");

  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: "1",
      title: "Morning Meeting",
      start: moment().tz(timezone).hour(9).minute(0).toISOString(),
      end: moment().tz(timezone).hour(10).minute(0).toISOString(),
    },
  ]);

  /* -----------------------------
     CRUD HANDLERS
  ------------------------------*/

  const handleAddEvent = (event: CalendarEvent) => {
    setEvents((prev) => [...prev, event]);
  };

  const handleEditEvent = (updated: CalendarEvent) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === updated.id ? updated : e))
    );
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const tooltipPlugin: Plugin = {
    name: "TooltipPlugin",
    hooks: {
      onEventRender: (event, el) => {
        el.title = `Event: ${event.title}\nID: ${event.id}`;
        el.style.cursor = "pointer";
      }
    }
  };

  const conflictPlugin: Plugin = {
    name: "ConflictPlugin",
    hooks: {
      beforeRender: (context) => {
        const conflicts = detectConflicts(context.events, context.timezone);
        context.events.forEach(e => {
          const eventConflicts = conflicts.filter(c => c.eventId === e.id);
          e.hasConflict = eventConflicts.length > 0;
          e.conflictDetails = eventConflicts.map(c =>
            `Conflicts with "${c.withTitle}" from ${moment(c.overlapStart).tz(context.timezone).format("hh:mm A")} to ${moment(c.overlapEnd).tz(context.timezone).format("hh:mm A")}`
          ).join("\n");
        });
      },
      onEventRender: (event, el) => {
        if (event.hasConflict) {
          el.style.border = "2px solid red";
          el.style.boxShadow = "0 0 10px rgba(255, 0, 0, 0.5)";
          el.title = `CONFLICT DETECTED!\n${event.conflictDetails}`;
        }
      },
      onEventClick: (event) => {
        if (event.hasConflict) {
          alert(`⚠️ Conflict Detected for "${event.title}":\n\n${event.conflictDetails}`);
        }
      },
      validateSave: (event, context) => {
        const otherEvents = context.events.filter(e => e.id !== event.id);
        const conflicts = detectConflicts([...otherEvents, event], context.timezone);
        const eventConflicts = conflicts.filter(c => c.eventId === event.id);

        if (eventConflicts.length > 0) {
          const list = eventConflicts.map(c => {
            const startStr = moment(c.overlapStart).tz(context.timezone).format("hh:mm A");
            const endStr = moment(c.overlapEnd).tz(context.timezone).format("hh:mm A");
            return `• Overlaps with "${c.withTitle}"\n  Time: ${startStr} - ${endStr}`;
          }).join("\n\n");

          return `Conflict Alert for "${event.title}":\n\n${list}`;
        }
        return null;
      }
    }
  };

  const plugins = [tooltipPlugin, conflictPlugin];
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Universal React Calendar</h1>
        <div className="flex gap-4 items-center">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setView("day")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${view === "day" ? "bg-white shadow" : "text-gray-500 hover:text-gray-900"}`}
            >
              Day
            </button>
            <button
              onClick={() => setView("week")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${view === "week" ? "bg-white shadow" : "text-gray-500 hover:text-gray-900"}`}
            >
              Week
            </button>
            <button
              onClick={() => setView("month")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${view === "month" ? "bg-white shadow" : "text-gray-500 hover:text-gray-900"}`}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      {view === "day" ? (
        <DayView
          // timezone={timezone}
          timezoneLabelInclude={timezoneLabelInclude}
          slotInterval={30}
          dateFormat="DD MMM YYYY"
          timeFormat="hh:mm A"
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          navigationPosition="center"
          events={events}

          /* CRUD */
          onAddEvent={handleAddEvent}
          onEditEvent={handleEditEvent}
          onDeleteEvent={handleDeleteEvent}

          /* Enable internal form */
          onlyCreateEditRequired

          // formFields={[
          //   { name: "title", label: "Event Title", type: "text", required: true },
          //   { name: "description", label: "Description", type: "textarea" },
          //   { name: "category", label: "Category", type: "dropdown", options: [{ label: "Work", value: "work" }, { label: "Personal", value: "personal" }] },
          //   { name: "priority", label: "Priority", type: "singleSelect", options: [{ label: "High", value: "high" }, { label: "Low", value: "low" }] },
          //   { name: "tags", label: "Tags", type: "multiselect", options: [{ label: "Urgent", value: "urgent" }, { label: "Meeting", value: "meeting" }] },
          //   { name: "status", label: "Status", type: "radio", options: [{ label: "Active", value: "active" }, { label: "Inactive", value: "inactive" }] },
          //   { name: "color", label: "Color Picker", type: "colorPicker" },
          //   { name: "file", label: "Attachment", type: "attachment" },
          //   { name: "isAllDay", label: "All Day Event", type: "boolean" },
          //   { name: "yearField", label: "Year", type: "year" },
          //   { name: "monthField", label: "Month", type: "month" },
          //   { name: "dayField", label: "Day", type: "day" },
          //   { name: "start", label: "Start Time", type: "datetime-local", required: true },
          //   { name: "end", label: "End Time", type: "datetime-local", required: true },
          // ]}

          /* Working hours */
          enabledTimeInterval={[
            { start: "09:00", end: "17:00" },
          ]}

          // disabledTimeSlots={["13:00", "13:30"]}

          /* Optional restriction examples */
          futureDaysOnly={true}
          pastDaysOnly={true}

          navigateToFirstEvent={true}

          showEmptyState
          plugins={plugins}
          conflictThemeVariant="classic_red"
          calendarThemeVariant="ocean_breeze"
        // renderNavigation={renderNavigation}
        />
      ) : view === "week" ? (
        <WeekView
          timezone={timezone}
          timezoneLabelInclude={timezoneLabelInclude}
          slotInterval={30}
          dateFormat="DD MMM YYYY"
          timeFormat="hh:mm A"
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          navigationPosition="center"
          events={events}

          /* CRUD */
          onAddEvent={handleAddEvent}
          onEditEvent={handleEditEvent}
          onDeleteEvent={handleDeleteEvent}

          /* Enable internal form */
          onlyCreateEditRequired

          formFields={[
            { name: "title", label: "Event Title", type: "text", required: true },
            { name: "description", label: "Description", type: "textarea" },
            { name: "category", label: "Category", type: "dropdown", options: [{ label: "Work", value: "work" }, { label: "Personal", value: "personal" }] },
            { name: "start", label: "Start Time", type: "datetime-local", required: true },
            { name: "end", label: "End Time", type: "datetime-local", required: true },
          ]}

          /* Working hours */
          enabledTimeInterval={[
            { start: "09:00", end: "17:00" },
          ]}

          disabledTimeSlots={["13:00", "13:30"]}

          navigateToFirstEvent={true}
          showEmptyState
          plugins={plugins}
          conflictThemeVariant="classic_red"
          calendarThemeVariant="classic_light"
        />
      ) : (
        <MonthView
          timezone={timezone}
          timezoneLabelInclude={timezoneLabelInclude}
          slotInterval={30}
          dateFormat="DD MMM YYYY"
          timeFormat="hh:mm A"
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          navigationPosition="center"
          events={events}

          /* CRUD */
          onAddEvent={handleAddEvent}
          onEditEvent={handleEditEvent}
          onDeleteEvent={handleDeleteEvent}

          /* Enable internal form */
          onlyCreateEditRequired

          formFields={[
            { name: "title", label: "Event Title", type: "text", required: true },
            { name: "description", label: "Description", type: "textarea" },
            { name: "category", label: "Category", type: "dropdown", options: [{ label: "Work", value: "work" }, { label: "Personal", value: "personal" }] },
            { name: "start", label: "Start Time", type: "datetime-local", required: true },
            { name: "end", label: "End Time", type: "datetime-local", required: true },
          ]}

          showEmptyState
          plugins={plugins}
          conflictThemeVariant="classic_red"
          calendarThemeVariant="classic_light"
        />
      )}
    </div>
  );
};

export default App;