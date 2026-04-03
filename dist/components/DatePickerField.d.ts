import { DatePickerProps } from './types';
/**
 * DatePickerField is a wrapper around DatePicker that is optimized for form libraries
 * like react-hook-form and Formik. It supports forwardRef and controlled usage.
 */
export declare const DatePickerField: import('react').ForwardRefExoticComponent<DatePickerProps & {
    label?: string;
    error?: string;
} & import('react').RefAttributes<HTMLDivElement>>;
