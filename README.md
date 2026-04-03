# schedultron ⚡

A powerful, framework-agnostic, and highly customizable React calendar component library. Built with performance and elegance in mind, `schedultron` provides a premium scheduling experience out of the box.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-blue?style=for-the-badge&logo=vercel)](https://schedultron-live.vercel.app)

---

## ✨ Key Features

- 📅 **Integrated Scheduling**: Comprehensive event management with Day, Week, and Month views.
- ⚡ **Framework Agnostic**: Packaged as a library that plays well with standard React workflows.
- 🎨 **Premium UI**: Modern, clean, and responsive design with built-in glassmorphism and cyberpunk themes.
- 🛠️ **Highly Extensible**: Plugin-ready architecture allowing you to hook into rendering, clicking, and saving workflows.
- 🕒 **Advanced Pickers**: Integrated `DatePicker`, `SlotDatePicker`, `DateRangePicker`, and `DateTimeRangePicker` for complex booking flows.
- 🌐 **Timezone Aware**: Robust handling of complex timezones across all components via `moment-timezone`.
- 🧩 **Type Safe**: First-class TypeScript support with included declaration files.
- 🚀 **Interactive Navigation**: Built-in support for "Today", "Prev", and "Next" actions with customizable renders.
- 🖱️ **Drag-and-Drop & Resize**: Fully interactive event management—drag to move, resize from top/bottom to adjust duration.
- 🔄 **Recurring Events**: Support for daily, weekly, monthly, and yearly recurring schedules with exception management.
- ⚠️ **Conflict Detection**: Built-in conflict detection engine with multiple warning themes.
- 📝 **Form Integration**: Auto-generated `EventFormModal` with dynamic field types (dropdowns, color pickers, attachments, time range pickers).

---

## 📦 Main Components

| Component                         | Description                                                              |
| :-------------------------------- | :----------------------------------------------------------------------- |
| **`DayView`**             | High-precision scheduling with vertical time slots and drag-and-drop.    |
| **`WeekView`**            | Multi-day layout with persistent sticky headers and event mapping.       |
| **`MonthView`**           | Standard 7-column monthly grid with interactive event badges.            |
| **`Calendar`**            | Master component that provides built-in view switching and shared state. |
| **`DatePicker`**          | Premium date selection with unified timezone support.                    |
| **`DateRangePicker`**     | Interactive range selection for start and end dates.                     |
| **`DateTimePicker`**      | Integrated date and time picker with slot-based selection.               |
| **`DateTimeRangePicker`** | Advanced range selection involving both dates and precise times.         |
| **`SlotDatePicker`**      | Specialized booking component for picking from custom time slot groups.  |
| **`TimePicker`**          | Slot-aware time selector with validation and interval support.           |
| **`CalendarPanel`**       | Compact sidebar component for navigation and small-screen date picking.  |

---

## 🚀 Installation

Install via npm:

```bash
npm install schedultron
```

---

## 📖 Quick Start

```tsx
import { WeekView, DayView, MonthView } from 'schedultron';
import moment, { Moment } from 'moment-timezone';

const App = () => {
  const handleDateChange = (date: Moment) => {
    console.log('Selected date:', date.format());
  };

  return (
    <div style={{ height: '800px' }}>
      <DayView 
        timezone="America/New_York"
        selectedDate={moment()}
        onDateChange={handleDateChange}
        slotInterval={60}
        calendarThemeVariant="emerald_forest"
        events={[
          {
            id: '1',
            title: 'Team Sync',
            start: moment().hour(10).minute(0).toISOString(),
            end: moment().hour(11).minute(0).toISOString(),
          }
        ]}
      />
    </div>
  );
};

export default App;
```

---

## ⚙️ Props Reference

### 1. Unified Calendar Props
(Used primarily by `Calendar`, `DayView`, `WeekView`, `MonthView`)

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `timezone` | `string` | OS Default | Current user timezone (e.g., `"America/New_York"`). |
| `timezoneLabelInclude` | `boolean` | `false` | Whether to show the timezone offset in the header. |
| `selectedDate` | `Moment \| string \| Date` | `now` | The currently selected date to focus on. |
| `onDateChange` | `(date: Moment) => void` | - | Callback when navigation/selection occurs. |
| `slotInterval` | `number` | `30` | Duration of each time slot in minutes (15, 30, 60). |
| `dateFormat` | `string` | `"MMMM YYYY"` | Header date display format (Moment.js style). |
| `timeFormat` | `string` | `"HH:mm"` | Display format for times in the grid. |
| `showTimeSlots` | `boolean` | `true` | Toggle the side-grid time labels. |
| `events` | `CalendarEvent[]` | `[]` | Array of event objects to render. |
| `enableDragAndResize` | `boolean` | `false` | Enable interactive moving/resizing features. |
| `enableRecurrence` | `boolean` | `false` | Expand recurring series into individual instances. |
| `onEventChange` | `(event: CalendarEvent) => void` | - | Generic callback when an event property changes. |
| `onEventDrop` | `(event: CalendarEvent) => void` | - | Specific callback for drag-to-move interactions. |
| `onEventResize` | `(event: CalendarEvent) => void` | - | Specific callback for duration change interactions. |
| `onEventCreate` | `(event: {start, end}) => void` | - | Specific callback for drag-to-create interactions. |
| `onAddEvent` | `(event: CalendarEvent) => void` | - | Callback when a new event is added via UI. |
| `onEditEvent` | `(event: CalendarEvent) => void` | - | Callback when an event is edited via UI. |
| `onDeleteEvent` | `(id: string) => void` | - | Callback when an event ID is deleted. |
| `formFields` | `CalendarFormField[]` | - | Dynamic fields for `EventFormModal` configuration. |
| `plugins` | `Plugin[]` | `[]`| Custom logic hooks (Lifecycle and verification). |
| `conflictTemplate` | `ConflictTemplate` | - | Custom renderer for overlap warnings. |
| `conflictThemeVariant` | `string` | `"classic_red"` | Predefined visual style for conflict alerts. |
| `calendarTheme` | `CalendarTheme` | - | Full custom branding/color overrides. |
| `calendarThemeVariant` | `string` | `"classic_light"` | Predefined visual theme to apply. |
| `navigationPosition` | `"left"\|"center"\|"right"` | `"center"` | Alignment of the header navigation arrows. |
| `renderNavigation` | `(actions: NavigationActions) => ReactNode` | - | Custom renderer for the header bar. |
| `showEmptyState` | `boolean` | `false` | Show a placeholder when no events are scheduled. |
| `futureDaysOnly` | `boolean` | `false` | Block selection/navigation of past dates. |
| `pastDaysOnly` | `boolean` | `false` | Block selection/navigation of future dates. |

---

### 2. Picker & UI Props
(Used by `DatePicker`, `DateTimePicker`, `RangePickers`, `SlotDatePicker`, `CalendarPanel`)

*Note: Pickers only share `timezone`, `calendarTheme`, and `calendarThemeVariant` with the views. They do not accept event-related or grid-related props.*

#### Global Picker Props
| Prop | Type | Description |
| :--- | :--- | :--- |
| `value` | `Moment \| Date \| string` | The currently selected value. |
| `onChange` | `(val: Moment) => void` | Callback triggered after selection change. |
| `timezone` | `string` | Target timezone for calculations. |
| `dateFormat` | `string` | Display format for the date. |
| `timeFormat` | `string` | Display format for the time (if applicable). |
| `placeholder` | `string` | Input field placeholder text. |
| `disabled` | `boolean` | Disable user interactions. |
| `calendarThemeVariant`| `string` | Predefined theme to apply to the popup. |
| `calendarTheme` | `CalendarTheme` | Custom branding/color overrides. |

#### `SlotDatePicker` Specific
| Prop | Type | Description |
| :--- | :--- | :--- |
| `slots` | `SlotGroup[]` | Array of grouped time slots for selection. |
| `onSlotSelect` | `(time: string) => void`| Callback when a user clicks a slot button. |
| `selectedSlot` | `string` | The currently selected time ID (e.g., `"09:00"`). |

#### `CalendarPanel` Specific
| Prop | Type | Description |
| :--- | :--- | :--- |
| `mode` | `"single"\|"range"\|"datetime"\|"datetimerange"` | Calendar interaction mode. |
| `onClose` | `() => void` | Triggered when the calendar panel should be hidden. |

---

## 🎨 Themes and Visuals

`schedultron` comes packed with 10 predefined calendar themes and 10 conflict alert templates.

### Calendar Themes (`calendarThemeVariant`)

| Variant             | Description                               |
| ------------------- | ----------------------------------------- |
| `classic_light`   | Clean blue and white professional look.   |
| `dark_night`      | Deep slate and indigo for night owls.     |
| `slate_modern`    | Subtle sky blue and slate gray palette.   |
| `emerald_forest`  | Refreshing green hues for a natural feel. |
| `ocean_breeze`    | Calm cyan and teal tones.                 |
| `midnight_purple` | Vibrant purple on a dark background.      |
| `amber_gold`      | Warm amber and gold accents.              |
| `rose_petal`      | Elegant rose-red and pink tones.          |
| `minimal_mono`    | Sophisticated monochrome (Black & White). |
| `cyber_punk`      | Neon magenta and cyan on pure black.      |

### Conflict Alert Templates (`conflictThemeVariant`)

When events overlap, `schedultron` can display a modal using these templates:

- `classic_red`: Standard urgent alert.
- `amber_warning`: Cautionary scheduling warning.
- `indigo_modern`: Sleek modern conflict resolution.
- `emerald_soft`: Non-intrusive conflict notification.
- `dark_noir`: Moody, dark-themed alert.
- `rose_elegant`: Soft red-toned warning.
- `glassmorphism`: Translucent frosted glass modal.
- `cyberpunk`: Neon-glow resolution screen.
- `minimalist`: Simple, no-frills alert.
- `high_visibility`: High-contrast black and yellow (Danger style).

---

## 🛠️ Advanced Customization

### Custom Navigation

You can completely replace the top navigation bar while keeping the functionality:

```tsx
const MyCustomNav = ({ goToPreviousDay, goToNextDay, goToToday, currentDate, timezone }) => {
  const isToday = currentDate.isSame(moment(), 'day');
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
      <button onClick={goToPreviousDay}>← Back</button>
      <div className={`p-2 rounded-lg ${isToday ? 'bg-blue-100' : ''}`}>
        {currentDate.format("MMMM Do, YYYY")}
        <span className="ml-2 text-xs text-gray-500">({timezone})</span>
      </div>
      <button onClick={goToNextDay}>Next →</button>
    </div>
  );
};

// Usage
<DayView renderNavigation={MyCustomNav} ... />
```

### Interactive Scheduling (Drag & Drop)

Schedultron makes scheduling natural with built-in `useDragAndResize` logic:

- **Move**: Click and drag any event to a new time slot or day.
- **Resize**: Pull the top or bottom edge of an event to precisely adjust its duration.
- **Snap**: Events automatically snap to the `slotInterval` (e.g., 15, 30, or 60 minutes) for clean alignment.
- **Create**: Click and drag on an empty area to define the start and end of a new event instantly.

### Recurring Events

Manage complex series effortlessly:

- **Frequencies**: Support for Daily, Weekly, Monthly, and Yearly recurrence.
- **Exceptions**: Delete or modify single instances within a series without breaking the recursion.
- **Management**: Integrated UI to target "This instance", "This and following", or "All events" in a series.
- **Customization**: Set recurrence to end "Never", "On a specific date", or "After X occurrences".

### Form & Component Integration

The `EventFormModal` can be customized using the `formFields` prop to support various data types:

- **Specialized Fields**: `daterange`, `datetime`, `datetimerange`, and `colorPicker`.
- **Validation**: Integrated with the conflict detection engine to prevent overlapping schedules.
- **Extensible**: Add custom fields and handle their state via `formData` and `onEventChange`.

### Plugin System

Use plugins to inject custom logic into the calendar lifecycle:

```tsx
const MyLoggingPlugin = {
  name: "Logger",
  hooks: {
    onEventClick: (event) => console.log("User clicked:", event.title),
    validateSave: (event, context) => {
      if (event.title.length < 3) return "Title is too short!";
      return null;
    }
  }
};

<DayView plugins={[MyLoggingPlugin]} ... />
```

---

## 🧩 Type Reference

### `CalendarEvent`
```typescript
interface CalendarEvent {
    id: string;
    title: string;
    start: string | Date | Moment;
    end: string | Date | Moment;
    allDay?: boolean;
    recurrence?: RecurrencePattern;
    parentId?: string; // Links instance to series
    excludeDates?: string[]; // Times to skip in series
    hasConflict?: boolean; // Managed by conflict detection engine
    [key: string]: any;
}
```

### `RecurrencePattern`
```typescript
interface RecurrencePattern {
    frequency: "daily" | "weekly" | "monthly" | "yearly";
    interval: number; // e.g. 2 for every 2 weeks
    weekDays?: number[]; // [0-6] where 0 is Sunday
    until?: string; // Stop date (YYYY-MM-DD or ISO)
    count?: number; // Stop after X occurrences
}
```

### `NavigationActions`
```typescript
interface NavigationActions {
    goToPreviousDay: () => void;
    goToNextDay: () => void;
    goToToday: () => void;
    currentDate: Moment;
    timezone: string;
    dateNode: ReactNode; // Pre-rendered date header
    prevNode: ReactNode; // Pre-rendered prev arrow
    nextNode: ReactNode; // Pre-rendered next arrow
}
```

---

## 📦 Peer Dependencies

- `react` >= 18.0.0
- `react-dom` >= 18.0.0
- `moment` ^2.30.1
- `moment-timezone` ^0.6.0

---

## 📄 License

MIT © [schedultron](https://github.com/Surya9122prakash/schedultron)

---

**Keywords:** #react #calendar #scheduler #event-management #drag-and-drop #recurring-events #timezone-aware #glassmorphism #cyberpunk-theme #typescript #npm-package #scheduling-ui
