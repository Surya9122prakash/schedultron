import { forwardRef } from "react";
import { DateRangePicker } from "./DateRangePicker";
import type { DateRangePickerProps } from "./types";

export const DateRangePickerField = forwardRef<HTMLDivElement, DateRangePickerProps & { label?: string; error?: string }>((
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
            <DateRangePicker {...props} ref={ref as any} />
            {error && (
                <span className="text-xs text-red-500 font-medium mt-0.5">
                    {error}
                </span>
            )}
        </div>
    );
});

DateRangePickerField.displayName = "DateRangePickerField";
