import { Plugin, PluginContext, CalendarEvent } from './types';
export declare class PluginManager {
    private plugins;
    private context;
    constructor(plugins: Plugin[] | undefined, context: PluginContext);
    setContext(context: PluginContext): void;
    init(): void;
    triggerBeforeRender(): void;
    triggerOnEventRender(event: CalendarEvent, element: HTMLDivElement): void;
    triggerOnEventClick(event: CalendarEvent): void;
    triggerAfterRender(): void;
    triggerOnEventChange(event: CalendarEvent): void;
    triggerValidateSave(event: CalendarEvent): string[];
}
