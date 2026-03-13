import type { Plugin, PluginContext, CalendarEvent } from "./types";

export class PluginManager {
    private plugins: Plugin[] = [];
    private context: PluginContext;

    constructor(plugins: Plugin[] = [], context: PluginContext) {
        this.plugins = plugins;
        this.context = context;
    }

    setContext(context: PluginContext) {
        this.context = context;
    }

    init() {
        this.plugins.forEach((p) => {
            if (p.init) p.init(this.context);
        });
    }

    triggerBeforeRender() {
        this.plugins.forEach((p) => {
            if (p.hooks?.beforeRender) p.hooks.beforeRender(this.context);
        });
    }

    triggerOnEventRender(event: CalendarEvent, element: HTMLDivElement) {
        this.plugins.forEach((p) => {
            if (p.hooks?.onEventRender) p.hooks.onEventRender(event, element);
        });
    }

    triggerOnEventClick(event: CalendarEvent) {
        this.plugins.forEach((p) => {
            if (p.hooks?.onEventClick) p.hooks.onEventClick(event);
        });
    }

    triggerAfterRender() {
        this.plugins.forEach((p) => {
            if (p.hooks?.afterRender) p.hooks.afterRender(this.context);
        });
    }

    triggerOnEventChange(event: CalendarEvent) {
        this.plugins.forEach((p) => {
            if (p.hooks?.onEventChange) p.hooks.onEventChange(event);
        });
    }

    triggerValidateSave(event: CalendarEvent): string[] {
        const errors: string[] = [];
        this.plugins.forEach((p) => {
            if (p.hooks?.validateSave) {
                const error = p.hooks.validateSave(event, this.context);
                if (error) errors.push(error);
            }
        });
        return errors;
    }
}
