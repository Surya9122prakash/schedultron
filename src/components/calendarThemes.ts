import type { CalendarTheme } from "./types";

export const PREDEFINED_CALENDAR_THEMES: Record<string, CalendarTheme> = {
    classic_light: {
        primaryColor: "#3b82f6", // blue-500
        backgroundColor: "#ffffff",
        secondaryBackgroundColor: "#f9fafb", // gray-50
        gridColor: "#e5e7eb", // gray-200
        textColor: "#111827", // gray-900
        secondaryTextColor: "#6b7280", // gray-500
        accentColor: "#eff6ff", // blue-50
        eventDefaultColor: "#3b82f6",
        eventDefaultTextColor: "#ffffff",
    },
    dark_night: {
        primaryColor: "#6366f1", // indigo-500
        backgroundColor: "#0f172a", // slate-900
        secondaryBackgroundColor: "#1e293b", // slate-800
        gridColor: "#334155", // slate-700
        textColor: "#f8fafc", // slate-50
        secondaryTextColor: "#94a3b8", // slate-400
        accentColor: "#1e1b4b", // indigo-950
        eventDefaultColor: "#6366f1",
        eventDefaultTextColor: "#ffffff",
    },
    slate_modern: {
        primaryColor: "#0ea5e9", // sky-500
        backgroundColor: "#f8fafc", // slate-50
        secondaryBackgroundColor: "#f1f5f9", // slate-100
        gridColor: "#cbd5e1", // slate-300
        textColor: "#334155", // slate-700
        secondaryTextColor: "#64748b", // slate-500
        accentColor: "#e0f2fe", // sky-100
        eventDefaultColor: "#0ea5e9",
        eventDefaultTextColor: "#ffffff",
    },
    emerald_forest: {
        primaryColor: "#10b981", // emerald-500
        backgroundColor: "#f0fdf4", // emerald-50
        secondaryBackgroundColor: "#dcfce7", // emerald-100
        gridColor: "#a7f3d0", // emerald-200
        textColor: "#064e3b", // emerald-950
        secondaryTextColor: "#047857", // emerald-700
        accentColor: "#ecfdf5", // emerald-50
        eventDefaultColor: "#10b981",
        eventDefaultTextColor: "#ffffff",
    },
    ocean_breeze: {
        primaryColor: "#06b6d4", // cyan-500
        backgroundColor: "#ecfeff", // cyan-50
        secondaryBackgroundColor: "#cffafe", // cyan-100
        gridColor: "#a5f3fc", // cyan-200
        textColor: "#164e63", // cyan-950
        secondaryTextColor: "#0891b2", // cyan-700
        accentColor: "#f0fdfa", // teal-50
        eventDefaultColor: "#06b6d4",
        eventDefaultTextColor: "#ffffff",
    },
    midnight_purple: {
        primaryColor: "#a855f7", // purple-500
        backgroundColor: "#2e1065", // purple-950
        secondaryBackgroundColor: "#4c1d95", // purple-900
        gridColor: "#7e22ce", // purple-700
        textColor: "#faf5ff", // purple-50
        secondaryTextColor: "#d8b4fe", // purple-300
        accentColor: "#581c87", // purple-900
        eventDefaultColor: "#a855f7",
        eventDefaultTextColor: "#ffffff",
    },
    amber_gold: {
        primaryColor: "#f59e0b", // amber-500
        backgroundColor: "#fffbeb", // amber-50
        secondaryBackgroundColor: "#fef3c7", // amber-100
        gridColor: "#fcd34d", // amber-300
        textColor: "#78350f", // amber-950
        secondaryTextColor: "#b45309", // amber-700
        accentColor: "#fffbeb",
        eventDefaultColor: "#f59e0b",
        eventDefaultTextColor: "#ffffff",
    },
    rose_petal: {
        primaryColor: "#f43f5e", // rose-500
        backgroundColor: "#fff1f2", // rose-50
        secondaryBackgroundColor: "#ffe4e6", // rose-100
        gridColor: "#fda4af", // rose-300
        textColor: "#4c0519", // rose-950
        secondaryTextColor: "#be123c", // rose-700
        accentColor: "#fff1f2",
        eventDefaultColor: "#f43f5e",
        eventDefaultTextColor: "#ffffff",
    },
    minimal_mono: {
        primaryColor: "#18181b", // zinc-900
        backgroundColor: "#ffffff",
        secondaryBackgroundColor: "#f4f4f5", // zinc-100
        gridColor: "#e4e4e7", // zinc-200
        textColor: "#09090b", // zinc-950
        secondaryTextColor: "#71717a", // zinc-500
        accentColor: "#f4f4f5",
        eventDefaultColor: "#27272a", // zinc-800
        eventDefaultTextColor: "#ffffff",
    },
    cyber_punk: {
        primaryColor: "#ff00ff", // magenta
        backgroundColor: "#000000",
        secondaryBackgroundColor: "#1a1a1a",
        gridColor: "#3dfaeb", // neon cyan
        textColor: "#3dfaeb",
        secondaryTextColor: "#ff00ff",
        accentColor: "#ff00ff22",
        eventDefaultColor: "#ff00ff",
        eventDefaultTextColor: "#000000",
    },
};
