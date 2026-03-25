# schedultron

A powerful, framework-agnostic, and highly customizable React calendar component library. Built with performance and elegance in mind, `schedultron` provides a premium scheduling experience out of the box.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-blue?style=for-the-badge&logo=vercel)](https://schedultron-live.vercel.app)

---

## ✨ Key Features

- 📅 **Integrated Scheduling**: Comprehensive event management with Day, Week, and Month views.
- ⚡ **Framework Agnostic**: Packaged as a library that plays well with standard React workflows.
- 🎨 **Premium UI**: Modern, clean, and responsive design with built-in glassmorphism and cyberpunk themes.
- 🛠️ **Highly Extensible**: Plugin-ready architecture allowing you to hook into rendering, clicking, and saving workflows.
- 🕒 **Multiple Pickers**: Includes built-in `DatePicker` and `SlotDatePicker` for various booking flows.
- 🌐 **Timezone Aware**: Robust handling of complex timezones across all components via `moment-timezone`.
- 🧩 **Type Safe**: First-class TypeScript support with included declaration files.
- 🚀 **Interactive Navigation**: Built-in support for "Today", "Prev", and "Next" actions with customizable renders.
- ⚠️ **Conflict Detection**: Built-in conflict detection engine with multiple warning themes.
- 📝 **Dynamic Forms**: Auto-generated event forms with support for various field types (dropdowns, color pickers, attachments).

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

## ⚙️ Props Global Reference

All calendar views (`DayView`, `WeekView`, `MonthView`, `DatePicker`, `SlotDatePicker`) accept the following properties:

### Core Configuration

| Prop                     | Type                              | Description                                                       |
| ------------------------ | --------------------------------- | ----------------------------------------------------------------- |
| `timezone`             | `string`                        | The timezone string (e.g.,`"America/New_York"`).                |
| `timezoneLabelInclude` | `boolean`                       | Whether to display the timezone label next to the date.           |
| `selectedDate`         | `Moment \| string \| Date` | The currently selected date to display.                           |
| `onDateChange`         | `(date: Moment) => void` | Callback triggered when navigation dates or selecting a new date. |
| `slotInterval`         | `number`                        | Duration of each time slot in minutes (e.g., 15, 30, 60).         |
| `dateFormat`           | `string`                        | Format template for dates (Moment.js compatible).                 |
| `timeFormat`           | `string`                        | Display format for time (default:`HH:mm`).                      |

> [!TIP]
> All components are now synchronized to the same `timezone`. Changing the timezone will automatically update the selected date across all views.

### Events and Interaction

| Prop              | Type                               | Description                                                 |
| ----------------- | ---------------------------------- | ----------------------------------------------------------- |
| `events`        | `CalendarEvent[]`                | Array of event objects to display.                          |
| `onEventChange` | `(event: CalendarEvent) => void` | Callback triggered when an event is modified (drag/resize). |
| `onAddEvent`    | `(event: CalendarEvent) => void` | Callback when a new event is created via double-click.      |
| `onEditEvent`   | `(event: CalendarEvent) => void` | Callback when an existing event is edited.                  |
| `onDeleteEvent` | `(eventId: string) => void`      | Callback when an event is deleted.                          |

### UI and Navigation Control

| Prop                     | Type                                                | Description                                                                          |
| ------------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `navigationPosition`   | `"left" \| "center" \| "right"`                     | Horizontal alignment of the navigation controls.                                     |
| `renderNavigation`     | `(actions: NavigationActions) => React.ReactNode` | Custom renderer for navigation. See[Custom Navigation](#custom-navigation) for details. |
| `showTodayBelow`       | `boolean`                                         | Show small "Today" button directly below the date header.                            |
| `showEmptyState`       | `boolean`                                         | Display an empty state illustration when no events are scheduled.                    |
| `emptyStateContent`    | `string`                                          | Custom text for empty state.                                                         |
| `navigateToFirstEvent` | `boolean`                                         | Auto-scrolling to the first available event of the day.                              |

### Component Specific Props

#### `SlotDatePicker`
| Prop              | Type                               | Description                                                 |
| ----------------- | ---------------------------------- | ----------------------------------------------------------- |
| `slots`         | `SlotGroup[]`                    | Grouped time slots for the user to pick from.               |
| `onSlotSelect`  | `(time: string) => void`         | Callback when a time slot is selected.                      |
| `selectedSlot`  | `string`                         | The currently selected time slot ID.                        |

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

## 🧩 Types

```typescript
export interface CalendarEvent {
    id: string;
    title: string;
    start: string | Date | Moment;
    end: string | Date | Moment;
    allDay?: boolean;
    hasConflict?: boolean; // Managed by conflict detection
    [key: string]: any;
}

export interface NavigationActions {
    goToPreviousDay: () => void;
    goToNextDay: () => void;
    goToToday: () => void;
    dateNode: React.ReactNode;
    prevNode: React.ReactNode;
    nextNode: React.ReactNode;
    defaultNav: React.ReactNode;
    currentDate: Moment;
    timezone: string;
    // ... nodes for default rendering
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
