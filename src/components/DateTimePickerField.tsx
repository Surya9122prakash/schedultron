import { forwardRef } from "react";
import { DateTimePicker } from "./DateTimePicker";
import type { DateTimePickerProps } from "./types";

export const DateTimePickerField = forwardRef<HTMLDivElement, DateTimePickerProps & { label?: string; error?: string }>((
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
            <DateTimePicker {...props} ref={ref as any} />
            {error && (
                <span className="text-xs text-red-500 font-medium mt-0.5">
                    {error}
                </span>
            )}
        </div>
    );
});

DateTimePickerField.displayName = "DateTimePickerField";
