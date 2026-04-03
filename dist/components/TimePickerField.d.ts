import { TimePickerProps } from './types';
interface TimePickerFieldProps extends TimePickerProps {
    label: string;
    error?: string;
}
export declare const TimePickerField: import('react').ForwardRefExoticComponent<TimePickerFieldProps & import('react').RefAttributes<HTMLInputElement>>;
export {};
