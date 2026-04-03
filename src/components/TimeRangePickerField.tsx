import { forwardRef } from "react";
import { TimeRangePicker } from "./TimeRangePicker";
import type { TimeRangePickerProps } from "./types";

interface TimeRangePickerFieldProps extends TimeRangePickerProps {
    label: string;
    error?: string;
}

export const TimeRangePickerField = forwardRef<HTMLInputElement, TimeRangePickerFieldProps>(({ label, error, ...props }, ref) => {
    return (
        <div className="flex flex-col gap-2 w-full group">
            <label className="text-[10px] font-bold text-[#8b92a5] uppercase tracking-widest px-1 group-focus-within:text-indigo-400 transition-colors">
                {label}
            </label>
            <TimeRangePicker {...props} ref={ref} />
            {error && (
                <span className="text-[10px] font-bold text-rose-500 px-1 animate-fadeIn underline decoration-rose-500/30 underline-offset-2">
                    {error}
                </span>
            )}
        </div>
    );
});
