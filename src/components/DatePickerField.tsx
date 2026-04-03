import { forwardRef } from "react";
import { DatePicker } from "./DatePicker";
import type { DatePickerProps } from "./types";

/**
 * DatePickerField is a wrapper around DatePicker that is optimized for form libraries
 * like react-hook-form and Formik. It supports forwardRef and controlled usage.
 */
export const DatePickerField = forwardRef<HTMLDivElement, DatePickerProps & { label?: string; error?: string }>((
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
            <DatePicker {...props} ref={ref as any} />
            {error && (
                <span className="text-xs text-red-500 font-medium mt-0.5">
                    {error}
                </span>
            )}
        </div>
    );
});

DatePickerField.displayName = "DatePickerField";
