import type { ConflictTemplate } from "./types";

export const PREDEFINED_CONFLICT_TEMPLATES: Record<string, ConflictTemplate> = {
    classic_red: {
        title: "Conflict Detected",
        description: "Your schedule has overlaps.",
        buttonText: "I'll Fix It",
        theme: {
            primaryColor: "#dc2626",
            secondaryColor: "#fee2e2",
            backgroundColor: "#fff",
            textColor: "#1f2937",
            borderColor: "#fee2e2",
        }
    },
    amber_warning: {
        title: "Scheduling Conflict",
        description: "We found some overlaps in your calendar.",
        buttonText: "Adjust Schedule",
        theme: {
            primaryColor: "#d97706",
            secondaryColor: "#fef3c7",
            backgroundColor: "#fff",
            textColor: "#92400e",
            borderColor: "#fde68a",
        }
    },
    indigo_modern: {
        title: "Overlapping Events",
        description: "Please resolve the following conflicts.",
        buttonText: "Got It",
        theme: {
            primaryColor: "#4f46e5",
            secondaryColor: "#e0e7ff",
            backgroundColor: "#f8fafc",
            textColor: "#1e1b4b",
            borderColor: "#c7d2fe",
        }
    },
    emerald_soft: {
        title: "Time Slot Conflict",
        description: "A few events are clashing.",
        buttonText: "Review",
        theme: {
            primaryColor: "#059669",
            secondaryColor: "#d1fae5",
            backgroundColor: "#fff",
            textColor: "#064e3b",
            borderColor: "#a7f3d0",
        }
    },
    dark_noir: {
        title: "Conflict Alert",
        description: "Overlapping periods detected.",
        buttonText: "Dismiss",
        theme: {
            primaryColor: "#f8fafc",
            secondaryColor: "#334155",
            backgroundColor: "#0f172a",
            textColor: "#f1f5f9",
            borderColor: "#1e293b",
        }
    },
    rose_elegant: {
        title: "Schedule Clash",
        description: "Heads up! Some events overlap.",
        buttonText: "Update Now",
        theme: {
            primaryColor: "#e11d48",
            secondaryColor: "#ffe4e6",
            backgroundColor: "#fff5f5",
            textColor: "#4c0519",
            borderColor: "#fecdd3",
        }
    },
    glassmorphism: {
        title: "Blurred Reality",
        description: "Your schedule is overlapping.",
        buttonText: "Clear Up",
        theme: {
            primaryColor: "#fff",
            secondaryColor: "rgba(255, 255, 255, 0.2)",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            textColor: "#fff",
            borderColor: "rgba(255, 255, 255, 0.3)",
        }
    },
    cyberpunk: {
        title: "SYSTEM NEON",
        description: "CONFLICT IN MATRIX DETECTED.",
        buttonText: "REBOOT",
        theme: {
            primaryColor: "#ff00ff",
            secondaryColor: "#00ffff",
            backgroundColor: "#1a1a1a",
            textColor: "#00ff00",
            borderColor: "#ff00ff",
        }
    },
    minimalist: {
        title: "Conflicts",
        description: "Events overlap.",
        buttonText: "Done",
        theme: {
            primaryColor: "#000",
            secondaryColor: "#f3f4f6",
            backgroundColor: "#fff",
            textColor: "#000",
            borderColor: "#e5e7eb",
        }
    },
    high_visibility: {
        title: "ALERT: CONFLICT",
        description: "YOUR EVENTS OVERLAP.",
        buttonText: "FIX NOW",
        theme: {
            primaryColor: "#000",
            secondaryColor: "#ff0",
            backgroundColor: "#ff0",
            textColor: "#000",
            borderColor: "#000",
        }
    }
};
