import { forwardRef } from "react";
import { DateTimeRangePicker } from "./DateTimeRangePicker";
import type { DateTimeRangePickerProps } from "./types";

export const DateTimeRangePickerField = forwardRef<HTMLDivElement, DateTimeRangePickerProps & { label?: string; error?: string }>((
    { label, error, ...props },
    ref
) => {
    return (
        <div className="flex flex-col gap-1 w-full">
            {label && (
                <label className="text-sm font-semibold opacity-70">
                    {label}
                </label>
            )}
            <DateTimeRangePicker {...props} ref={ref as any} />
            {error && (
                <span className="text-xs text-red-500 font-medium mt-0.5">
                    {error}
                </span>
            )}
        </div>
    );
});

DateTimeRangePickerField.displayName = "DateTimeRangePickerField";
