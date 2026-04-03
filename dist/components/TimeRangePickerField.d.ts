import { TimeRangePickerProps } from './types';
interface TimeRangePickerFieldProps extends TimeRangePickerProps {
    label: string;
    error?: string;
}
export declare const TimeRangePickerField: import('react').ForwardRefExoticComponent<TimeRangePickerFieldProps & import('react').RefAttributes<HTMLInputElement>>;
export {};
